import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const here = new URL('./', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.ttf': 'font/ttf' };
const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname)).replace(/^\/+/, '');
    const file = join(here, path || 'scene.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const browser = await chromium.launch({ timeout: 30000, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage({ viewport: { width: 640, height: 360 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(60000);
  const externalRequests = [];
  page.on('pageerror', (error) => console.error(error.message));
  page.on('requestfailed', (request) => console.error(`request failed: ${request.url()} ${request.failure()?.errorText}`));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!((url.protocol === 'http:' && url.hostname === '127.0.0.1') || (url.protocol === 'blob:' && url.origin === `http://127.0.0.1:${address.port}`))) externalRequests.push(request.url());
  });
  await page.goto(`http://127.0.0.1:${address.port}/scene.html`);
  await page.waitForFunction(() => Boolean(window.__scene?.metrics), null, { timeout: 30000 });
  const sceneMetrics = await page.evaluate(() => window.__scene.metrics);
  await page.evaluate(() => window.__scene.seek(0));
  const pngA = await page.screenshot({ type: 'png' });
  await page.evaluate(() => window.__scene.seek(0));
  const pngB = await page.screenshot({ type: 'png' });
  if (externalRequests.length) throw new Error(`Unexpected external requests: ${externalRequests.join(', ')}`);
  const hash = (value) => createHash('sha256').update(value).digest('hex');
  const metrics = {
    troika_version: JSON.parse(await readFile(new URL('./node_modules/troika-three-text/package.json', import.meta.url), 'utf8')).version,
    three_version: JSON.parse(await readFile(new URL('./node_modules/three/package.json', import.meta.url), 'utf8')).version,
    playwright_version: JSON.parse(await readFile(new URL('./node_modules/playwright/package.json', import.meta.url), 'utf8')).version,
    chromium_version: browser.version(),
    canvas: '640x360',
    sync_complete: true,
    ...sceneMetrics,
    capture_sha256: hash(pngA),
    repeated_capture_sha256: hash(pngB),
    repeated_capture_equal: hash(pngA) === hash(pngB),
  };
  const { writeFile, mkdir } = await import('node:fs/promises');
  await mkdir(new URL('./output/', import.meta.url), { recursive: true });
  await writeFile(new URL('./output/frame.png', import.meta.url), pngA);
  await writeFile(new URL('./output/metrics.json', import.meta.url), `${JSON.stringify(metrics, null, 2)}\n`);
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
