import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';

await mkdir('output', { recursive: true });
execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
const bundle = await readFile('output/sketch.bundle.js', 'utf8');
const browser = await chromium.launch({ headless: true });

async function render() {
  const page = await browser.newPage({ viewport: { width: 64, height: 48 }, deviceScaleFactor: 1 });
  await page.setContent('<!doctype html><html><body style="margin:0"><canvas id="sketch-canvas"></canvas></body></html>');
  await page.addScriptTag({ content: bundle });
  const result = await page.evaluate(async () => {
    const { width, height, canvas } = await window.startCanvasSketch();
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    return { width, height, canvasWidth: canvas.width, canvasHeight: canvas.height, pixels: Array.from(pixels) };
  });
  const shot = await page.locator('canvas').screenshot();
  await page.close();
  return { ...result, shot };
}

try {
  const first = await render();
  const second = await render();
  const bytes = Buffer.from(first.pixels);
  const digest = createHash('sha256').update(bytes).digest('hex');
  const checkPixel = (x, y) => Array.from(bytes.subarray((y * 64 + x) * 4, (y * 64 + x) * 4 + 4));
  const metrics = {
    width: first.width,
    height: first.height,
    canvas_width: first.canvasWidth,
    canvas_height: first.canvasHeight,
    interior_rgba: checkPixel(8, 10),
    far_interior_rgba: checkPixel(23, 21),
    outside_rgba: checkPixel(0, 0),
    pixel_sha256: digest,
    second_render_matches: digest === createHash('sha256').update(Buffer.from(second.pixels)).digest('hex')
  };
  const expected = {
    width: 64,
    height: 48,
    canvas_width: 64,
    canvas_height: 48,
    interior_rgba: [255, 64, 32, 255],
    far_interior_rgba: [255, 64, 32, 255],
    outside_rgba: [0, 0, 0, 0],
    second_render_matches: true
  };
  if (JSON.stringify({ ...metrics, pixel_sha256: undefined }) !== JSON.stringify({ ...expected, pixel_sha256: undefined })) {
    throw new Error(`Metrics differ from predeclared geometry: ${JSON.stringify(metrics)}`);
  }
  await writeFile('output/canvas-sketch.png', first.shot);
  await writeFile('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
  if (process.argv.includes('--record')) {
    await mkdir('expected', { recursive: true });
    await writeFile('expected/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
  } else {
    const recorded = JSON.parse(await readFile('expected/metrics.json', 'utf8'));
    if (JSON.stringify(metrics) !== JSON.stringify(recorded)) throw new Error('Observed metrics differ from expected/metrics.json');
  }
  console.log(JSON.stringify(metrics, null, 2));
  console.log('canvas-sketch-capture: OK');
} finally {
  await browser.close();
}
