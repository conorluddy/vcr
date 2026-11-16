import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const here = new URL('./', import.meta.url).pathname;
const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname)).replace(/^\/+/, '');
    const file = join(here, path || 'scene.html');
    const body = await readFile(file);
    const type = extname(file) === '.html' ? 'text/html' : extname(file) === '.js' ? 'text/javascript' : 'application/octet-stream';
    res.writeHead(200, { 'content-type': type }); res.end(body);
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const browser = await chromium.launch({ timeout: 30000, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage({ viewport: { width: 128, height: 128 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(60000);
  const external = [];
  page.on('pageerror', (e) => console.error(e.stack || e.message));
  page.on('requestfailed', (r) => console.error(`request failed: ${r.url()} ${r.failure()?.errorText}`));
  page.on('request', (r) => { const u = new URL(r.url()); if (u.protocol !== 'http:' || u.hostname !== '127.0.0.1') external.push(r.url()); });
  await page.goto(`http://127.0.0.1:${address.port}/scene.html`);
  await page.waitForFunction(() => window.__scene || window.__sceneError, null, { timeout: 60000 });
  const sceneError = await page.evaluate(() => window.__sceneError);
  if (sceneError) throw new Error(sceneError);
  const capture = async (t, path) => {
    await page.evaluate((time) => window.__scene.seek(time), t);
    const png = await page.screenshot({ type: 'png' });
    await (await import('node:fs/promises')).writeFile(new URL(path, import.meta.url), png);
    return createHash('sha256').update(png).digest('hex');
  };
  const baseline = await capture(0, './output/baseline.png');
  const effect = await capture(1, './output/effect.png');
  const repeated = await capture(1, './output/repeated.png');
  if (external.length) throw new Error(`Unexpected external requests: ${external.join(', ')}`);
  const webgl = await page.evaluate(() => {
    const gl = document.querySelector('canvas').getContext('webgl2');
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    return { renderer: gl.getParameter(gl.RENDERER), vendor: gl.getParameter(gl.VENDOR), unmasked_renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unavailable', unmasked_vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : 'unavailable' };
  });
  const result = {
    pixi_version: JSON.parse(await readFile(new URL('./node_modules/pixi.js/package.json', import.meta.url), 'utf8')).version,
    filters_version: JSON.parse(await readFile(new URL('./node_modules/pixi-filters/package.json', import.meta.url), 'utf8')).version,
    playwright_version: JSON.parse(await readFile(new URL('./node_modules/playwright/package.json', import.meta.url), 'utf8')).version,
    chromium_version: browser.version(),
    filter: 'PixelateFilter', baseline_sha256: baseline, effect_sha256: effect, repeated_effect_sha256: repeated,
    repeated_effect_equal: effect === repeated,
    canvas: '128x128', webgl,
  };
  const { mkdir, writeFile } = await import('node:fs/promises');
  await mkdir(new URL('./output/', import.meta.url), { recursive: true });
  await writeFile(new URL('./output/metrics.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); await new Promise((resolve) => server.close(resolve)); }
