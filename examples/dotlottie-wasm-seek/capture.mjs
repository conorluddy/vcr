import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'output');
const expectedPath = path.join(root, 'expected/metrics.json');
const record = process.argv.includes('--record');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.lottie': 'application/zip', '.wasm': 'application/wasm' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.join(root, pathname.replace(/^\/+/, ''));
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 96, height: 96 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:${address.port}/index.html`);
  await page.waitForFunction(() => window.dotLottieLoadState !== undefined, null, { timeout: 10000 });
  await page.evaluate(() => window.dotLottieLoadState);
  await page.waitForFunction(() => window.dotLottiePlayer?.isLoaded === true, null, { timeout: 10000 });
  const sequences = { sequential: [0, 15, 30], shuffled: [30, 0, 15] };
  const frames = {};
  for (const [order, samples] of Object.entries(sequences)) {
    for (const frame of samples) {
      await page.evaluate(async frameNumber => {
        const p = window.dotLottiePlayer;
        p.setFrame(frameNumber);
        await new Promise(requestAnimationFrame);
      }, frame);
      const raw = await page.locator('#target').evaluate(canvas => {
        const image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        return { width: image.width, height: image.height, pixels: Array.from(image.data) };
      });
      const png = new PNG({ width: raw.width, height: raw.height });
      png.data = Buffer.from(raw.pixels);
      const pngBuffer = PNG.sync.write(png);
      const pngPath = path.join(output, `frame-${frame}-${order}.png`);
      await writeFile(pngPath, pngBuffer);
      const pixel = (x, y) => [...raw.pixels.slice((y * raw.width + x) * 4, (y * raw.width + x) * 4 + 4)];
      const red = [];
      for (let y = 0; y < raw.height; y++) for (let x = 0; x < raw.width; x++) {
        const [r, g, b, a] = pixel(x, y);
        if (r > 250 && g < 5 && b < 5 && a > 250) red.push([x, y]);
      }
      const xs = red.map(([x]) => x), ys = red.map(([, y]) => y);
      const metrics = {
        width: raw.width, height: raw.height,
        foreground: { color: 'red', pixels: red.length, bbox: red.length ? [Math.min(...xs), Math.min(...ys), Math.max(...xs) + 1, Math.max(...ys) + 1] : null },
        redSample: pixel(({ 0: 8, 15: 24, 30: 40 })[frame] + 2, 26),
        transparentSample: pixel(2, 2),
        pngSha256: createHash('sha256').update(pngBuffer).digest('hex'),
      };
      if (!frames[frame]) frames[frame] = {};
      frames[frame][order] = metrics;
    }
  }
  if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
  const summary = {
    toolVersion: '0.83.2',
    nodeVersion: process.version,
    chromiumVersion: browser.version(),
    host: `${os.hostname()} (${os.platform()} ${os.release()} ${os.arch()})`,
    animation: 'owned .lottie archive; 64x64, 30 fps, 31 frames',
    sampledFrames: Object.fromEntries(Object.entries(frames).map(([frame, orders]) => [frame, orders.sequential])),
    shuffledHashesMatch: Object.fromEntries(Object.entries(frames).map(([frame, orders]) => [frame, orders.sequential.pngSha256 === orders.shuffled.pngSha256])),
    browserErrors: errors,
  };
  for (const [frame, orders] of Object.entries(frames)) {
    const x = ({ 0: 8, 15: 24, 30: 40 })[frame];
    for (const item of Object.values(orders)) {
      if (item.width !== 64 || item.height !== 64 || JSON.stringify(item.foreground) !== JSON.stringify({ color: 'red', pixels: 256, bbox: [x, 24, x + 16, 40] }) || JSON.stringify(item.redSample) !== '[255,0,0,255]' || JSON.stringify(item.transparentSample) !== '[0,0,0,0]') {
        throw new Error(`Unexpected pixel result at frame ${frame}: ${JSON.stringify(item)}`);
      }
    }
    if (orders.sequential.pngSha256 !== orders.shuffled.pngSha256) throw new Error(`Seek order changed frame ${frame}`);
  }
  await mkdir(path.dirname(expectedPath), { recursive: true });
  if (record) await writeFile(expectedPath, `${JSON.stringify(summary, null, 2)}\n`);
  else {
    const expected = JSON.parse(await readFile(expectedPath, 'utf8'));
    if (JSON.stringify(summary) !== JSON.stringify(expected)) throw new Error('Observed metrics differ from expected/metrics.json');
  }
  console.log(`dotLottie fixture ${record ? 'recorded' : 'OK'}: ${JSON.stringify(summary)}`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
