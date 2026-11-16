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
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-webgpu'] });
const contexts = [];
const outputByUniform = {
  '0.25': { sequential: [], shuffled: [] },
  '0.5': { sequential: [], shuffled: [] },
};
let runDetails;
try {
  for (const [order, sequence] of [['sequential', [0.25, 0.5, 0.25]], ['shuffled', [0.5, 0.25, 0.25]]]) {
    const context = await browser.newContext({ viewport: { width: 64, height: 48 }, deviceScaleFactor: 1 });
    contexts.push(context);
    const page = await context.newPage();
    const errors = [];
    const outsideRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => {
      if (new URL(request.url()).hostname !== '127.0.0.1') outsideRequests.push(request.url());
    });
    await page.goto(`http://127.0.0.1:${address.port}/index.html`);
    await page.waitForFunction(() => window.threeReady?.done === true || window.threeReady?.autoBackendError, null, { timeout: 15000 });
    const ready = await page.evaluate(() => window.threeReady);
    if (!ready?.done) throw new Error(`Renderer initialization failed: ${JSON.stringify(ready)}`);
    if (!runDetails) runDetails = ready;
    for (const blue of sequence) {
      const raw = await page.evaluate(value => window.renderAt(value), blue);
      const png = new PNG({ width: 32, height: 24 });
      for (let y = 0; y < png.height; y++) {
        const sourceY = runDetails.backend === 'webgpu' ? y : png.height - 1 - y;
        const sourceOffset = sourceY * png.width * 4;
        png.data.set(raw.slice(sourceOffset, sourceOffset + png.width * 4), y * png.width * 4);
      }
      if (png.width !== 32 || png.height !== 24) throw new Error(`Expected 32x24, got ${png.width}x${png.height}`);
      const pngBuffer = PNG.sync.write(png);
      const samples = [[8, 6], [16, 12], [27, 19]].map(([x, y]) => {
        const actual = [...png.data.slice((y * png.width + x) * 4, (y * png.width + x) * 4 + 4)];
        const srgb = linear => linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
        const expected = [
          Math.round(255 * srgb((x + 0.5) / png.width)),
          Math.round(255 * srgb(1 - (y + 0.5) / png.height)),
          Math.round(255 * srgb(blue)),
          255,
        ];
        if (actual.some((channel, index) => Math.abs(channel - expected[index]) > 2)) {
          throw new Error(`Unexpected uniform ${blue} pixel (${x},${y}): ${JSON.stringify(actual)} expected ${JSON.stringify(expected)} ±2`);
        }
        return { x, y, rgba: actual, expectedWithin2: expected };
      });
      const hash = createHash('sha256').update(pngBuffer).digest('hex');
      outputByUniform[String(blue)][order].push({ hash, samples, pngBuffer });
      const saveNumber = `${String(blue).replace('.', '-')}-${order}-${outputByUniform[String(blue)][order].length - 1}`;
      await writeFile(path.join(output, `gradient-${saveNumber}.png`), pngBuffer);
    }
    if (errors.length || outsideRequests.length) throw new Error(`Browser errors=${JSON.stringify(errors)}, external requests=${JSON.stringify(outsideRequests)}`);
    runDetails.errors ??= [];
    runDetails.errors.push(...errors);
    runDetails.outsideRequests ??= [];
    runDetails.outsideRequests.push(...outsideRequests);
  }
  const summary = {
    threeVersion: '0.187.0',
    nodeVersion: process.version,
    chromiumVersion: browser.version(),
    osVersion: execFileSync('sw_vers', ['-productVersion'], { encoding: 'utf8' }).trim(),
    host: `${os.hostname()} (${os.platform()} ${os.arch()})`,
    renderer: runDetails,
    canvas: [32, 24],
    uniforms: Object.fromEntries(Object.entries(outputByUniform).map(([value, orders]) => [value, {
      samples: orders.sequential[0].samples,
      sequentialHashes: orders.sequential.map(item => item.hash),
      shuffledHashes: orders.shuffled.map(item => item.hash),
      sequentialShuffledMatch: orders.sequential.length === orders.shuffled.length && orders.sequential.every((item, i) => item.hash === orders.shuffled[i].hash),
    }])),
  };
  for (const [value, result] of Object.entries(summary.uniforms)) {
    if (!result.sequentialShuffledMatch || result.sequentialHashes.some(hash => hash !== result.sequentialHashes[0])) throw new Error(`Uniform ${value} outputs differ across repeats/orders: ${JSON.stringify(result)}`);
  }
  if (record) await writeFile(expectedPath, `${JSON.stringify(summary, null, 2)}\n`);
  else {
    const expected = JSON.parse(await readFile(expectedPath, 'utf8'));
    if (JSON.stringify(summary) !== JSON.stringify(expected)) throw new Error('Metrics differ from expected/metrics.json');
  }
  console.log(`Three.js TSL fixture ${record ? 'recorded' : 'OK'}: ${JSON.stringify(summary)}`);
} finally {
  for (const context of contexts) await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
