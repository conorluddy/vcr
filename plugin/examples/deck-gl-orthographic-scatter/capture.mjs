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
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 96, height: 64 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  const outsideRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => {
    if (new URL(request.url()).hostname !== '127.0.0.1') outsideRequests.push(request.url());
  });
  await page.goto(`http://127.0.0.1:${address.port}/index.html`);
  await page.waitForFunction(() => window.deckState?.ready === true && window.deckState.renderCount > 0, null, { timeout: 15000 });
  const state = await page.evaluate(() => ({ ...window.deckState }));
  const projection = state.projected;
  if (projection.some((coordinate, i) => Math.abs(coordinate - [20, 16, 44, 16][i]) > 0.1)) {
    throw new Error(`Unexpected OrthographicView projections: ${JSON.stringify(projection)}`);
  }
  const canvas = page.locator('#deck-canvas');
  const capture = async () => {
    const pngBuffer = await canvas.screenshot({ type: 'png', omitBackground: true });
    const png = PNG.sync.read(pngBuffer);
    if (png.width !== 64 || png.height !== 32) throw new Error(`Expected 64x32, got ${png.width}x${png.height}`);
    const sample = (x, y) => [...png.data.slice((y * png.width + x) * 4, (y * png.width + x) * 4 + 4)];
    const result = {
      dimensions: [png.width, png.height],
      redCenter: sample(20, 16),
      blueCenter: sample(44, 16),
      transparentBackground: sample(2, 2),
      sha256: createHash('sha256').update(pngBuffer).digest('hex'),
    };
    if (JSON.stringify(result.redCenter) !== '[255,0,0,255]' || JSON.stringify(result.blueCenter) !== '[0,0,255,255]' || result.transparentBackground[3] !== 0) {
      throw new Error(`Unexpected deck.gl pixels: ${JSON.stringify(result)}`);
    }
    return { result, pngBuffer };
  };
  const first = await capture();
  const previousCount = await page.evaluate(() => window.deckState.renderCount);
  await page.evaluate(() => window.forceRedraw());
  await page.waitForFunction(count => window.deckState.renderCount > count, previousCount, { timeout: 10000 });
  const second = await capture();
  if (first.result.sha256 !== second.result.sha256) throw new Error('Forced redraw changed the output hash');
  if (errors.length || outsideRequests.length) throw new Error(`Browser errors=${JSON.stringify(errors)} externalRequests=${JSON.stringify(outsideRequests)}`);
  await writeFile(path.join(output, 'scatterplot.png'), first.pngBuffer);
  const coreVersion = JSON.parse(await readFile(path.join(root, 'node_modules/@deck.gl/core/package.json'), 'utf8')).version;
  const layersVersion = JSON.parse(await readFile(path.join(root, 'node_modules/@deck.gl/layers/package.json'), 'utf8')).version;
  const summary = {
    packageVersions: { '@deck.gl/core': coreVersion, '@deck.gl/layers': layersVersion },
    nodeVersion: process.version,
    chromiumVersion: browser.version(),
    osVersion: execFileSync('sw_vers', ['-productVersion'], { encoding: 'utf8' }).trim(),
    host: `${os.hostname()} (${os.platform()} ${os.arch()})`,
    renderer: state.renderer,
    projectedCenters: projection,
    capture: first.result,
    redrawSha256: second.result.sha256,
    redrawMatches: first.result.sha256 === second.result.sha256,
    errors,
    outsideRequests,
  };
  if (record) await writeFile(expectedPath, `${JSON.stringify(summary, null, 2)}\n`);
  else {
    const expected = JSON.parse(await readFile(expectedPath, 'utf8'));
    if (JSON.stringify(summary) !== JSON.stringify(expected)) throw new Error('Metrics differ from expected/metrics.json');
  }
  console.log(`deck.gl fixture ${record ? 'recorded' : 'OK'}: ${JSON.stringify(summary)}`);
  await context.close();
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
