import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'output');
const expectedPath = path.join(root, 'expected/metrics.json');
const record = process.argv.includes('--record');
const types = { '.html': 'text/html', '.js': 'text/javascript' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const body = await readFile(path.join(root, pathname.replace(/^\/+/, '')));
    res.writeHead(200, { 'content-type': types[path.extname(pathname)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
server.on('error', error => { throw error; });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
await mkdir(path.join(root, 'expected'), { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const observations = [];
try {
  for (let iteration = 0; iteration < 2; iteration++) {
    const context = await browser.newContext({ viewport: { width: 64, height: 48 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    const outsideRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => {
      if (new URL(request.url()).hostname !== '127.0.0.1') outsideRequests.push(request.url());
    });
    await page.goto(`http://127.0.0.1:${address.port}/index.html`);
    await page.waitForFunction(() => window.glReactLoad !== undefined, null, { timeout: 10000 });
    const loadState = await page.evaluate(() => window.glReactLoad);
    if (loadState !== 'loaded') throw new Error(`Surface load failed: ${loadState}`);
    await page.waitForTimeout(100);
    const canvas = page.locator('canvas');
    await canvas.waitFor({ state: 'visible' });
    const renderer = await canvas.evaluate(el => {
      const gl = el.getContext('webgl2') || el.getContext('webgl');
      const extension = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        width: el.width, height: el.height,
        vendor: extension ? gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) : 'unavailable',
        renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        glVersion: gl.getParameter(gl.VERSION),
      };
    });
    const pngBuffer = await canvas.screenshot({ type: 'png', omitBackground: true });
    const png = PNG.sync.read(pngBuffer);
    const px = (x, y) => [...png.data.slice((y * png.width + x) * 4, (y * png.width + x) * 4 + 4)];
    const samples = [[4, 4], [16, 12], [27, 19]].map(([x, y]) => {
      const expectedR = Math.round(255 * (x + 0.5) / png.width);
      const expectedG = Math.round(255 * (1 - (y + 0.5) / png.height));
      const value = px(x, y);
      if (Math.abs(value[0] - expectedR) > 2 || Math.abs(value[1] - expectedG) > 2 || Math.abs(value[2] - 64) > 1 || value[3] !== 255) {
        throw new Error(`Unexpected shader pixel at (${x},${y}): ${JSON.stringify(value)} expected near [${expectedR},${expectedG},64,255]`);
      }
      return { x, y, rgba: value, expectedWithin2: [expectedR, expectedG, 64, 255] };
    });
    if (renderer.width !== 32 || renderer.height !== 24) throw new Error(`Wrong canvas dimensions ${renderer.width}x${renderer.height}`);
    if (!renderer.renderer.toLowerCase().includes('swiftshader')) throw new Error(`Expected SwiftShader, got ${renderer.renderer}`);
    if (errors.length || outsideRequests.length) throw new Error(`Browser errors=${JSON.stringify(errors)}, outside requests=${JSON.stringify(outsideRequests)}`);
    await mkdir(output, { recursive: true });
    await writeFile(path.join(output, `gradient-${iteration}.png`), pngBuffer);
    observations.push({
      canvas: [png.width, png.height],
      samples,
      renderer,
      pngSha256: createHash('sha256').update(pngBuffer).digest('hex'),
      errors,
      outsideRequests,
    });
    await context.close();
  }
  if (observations[0].pngSha256 !== observations[1].pngSha256) throw new Error('Fresh context outputs differ');
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const summary = {
    packageVersions: { ...packageJson.dependencies },
    nodeVersion: process.version,
    chromiumVersion: browser.version(),
    osVersion: execFileSync('sw_vers', ['-productVersion'], { encoding: 'utf8' }).trim(),
    host: `${os.hostname()} (${os.platform()} ${os.arch()})`,
    renderer: observations[0].renderer,
    dimensions: observations[0].canvas,
    samples: observations[0].samples,
    repeatedHash: observations[0].pngSha256,
    twoFreshContextsMatch: observations[0].pngSha256 === observations[1].pngSha256,
    errors: observations.flatMap(o => o.errors),
    outsideRequests: observations.flatMap(o => o.outsideRequests),
  };
  if (record) await writeFile(expectedPath, `${JSON.stringify(summary, null, 2)}\n`);
  else {
    const expected = JSON.parse(await readFile(expectedPath, 'utf8'));
    if (JSON.stringify(summary) !== JSON.stringify(expected)) throw new Error('Metrics differ from expected/metrics.json');
  }
  console.log(`gl-react fixture ${record ? 'recorded' : 'OK'}: ${JSON.stringify(summary)}`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
