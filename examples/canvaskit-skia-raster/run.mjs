import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const WIDTH = 64;
const HEIGHT = 48;
const ORANGE = [255, 128, 0, 255];
const BLUE = [32, 96, 224, 255];
const TRANSPARENT = [0, 0, 0, 0];
const expectedColorCounts = { orange_pixels: 192, blue_pixels: 64, transparent_pixels: WIDTH * HEIGHT - 192 - 64 };
const CanvasKitInit = require('canvaskit-wasm');
const canvasKitJs = require.resolve('canvaskit-wasm');
const canvasKitBin = dirname(canvasKitJs);
const CanvasKit = await CanvasKitInit({ locateFile: (file) => join(canvasKitBin, file) });

async function render() {
  const surface = CanvasKit.MakeSurface(WIDTH, HEIGHT);
  if (!surface) throw new Error('CanvasKit.MakeSurface returned null');
  const canvas = surface.getCanvas();
  const paint = new CanvasKit.Paint();
  paint.setAntiAlias(false);
  paint.setStyle(CanvasKit.PaintStyle.Fill);

  canvas.clear(CanvasKit.Color(0, 0, 0, 0));
  paint.setColor(CanvasKit.Color(255, 128, 0, 1));
  canvas.drawRect(CanvasKit.LTRBRect(8, 8, 24, 20), paint);
  paint.setColor(CanvasKit.Color(32, 96, 224, 1));
  canvas.drawRect(CanvasKit.LTRBRect(32, 6, 40, 14), paint);
  surface.flush();

  const image = surface.makeImageSnapshot();
  if (!image) throw new Error('CanvasKit failed to snapshot SkSurface');
  const pngBytes = image.encodeToBytes(CanvasKit.ImageFormat.PNG);
  if (!pngBytes) throw new Error('CanvasKit failed to encode SkImage as PNG');

  const pngBuffer = Buffer.from(pngBytes);
  const decoded = PNG.sync.read(pngBuffer);
  const rgba = decoded.data;
  const probe = (x, y) => Array.from(rgba.subarray((y * WIDTH + x) * 4, (y * WIDTH + x) * 4 + 4));
  const counts = { orange_pixels: 0, blue_pixels: 0, transparent_pixels: 0, unexpected_pixels: 0 };
  for (let i = 0; i < rgba.length; i += 4) {
    const px = Array.from(rgba.subarray(i, i + 4));
    if (px.every((value, channel) => value === ORANGE[channel])) counts.orange_pixels++;
    else if (px.every((value, channel) => value === BLUE[channel])) counts.blue_pixels++;
    else if (px.every((value, channel) => value === TRANSPARENT[channel])) counts.transparent_pixels++;
    else counts.unexpected_pixels++;
  }
  paint.delete();
  image.delete();
  surface.dispose();
  return { pngBuffer, width: decoded.width, height: decoded.height, rgba, counts, probes: { orange: probe(8, 8), blue: probe(32, 6), transparent: probe(0, 0), orange_outer_edge: probe(24, 20), blue_outer_edge: probe(40, 14) } };
}

await mkdir(join(here, 'output'), { recursive: true });
const first = await render();
const second = await render();
const rgbaHash = createHash('sha256').update(first.rgba).digest('hex');
const pngHash = createHash('sha256').update(first.pngBuffer).digest('hex');
const metrics = {
  canvaskit_version: '0.42.0',
  backend: 'Node CPU WASM; CanvasKit.MakeSurface/SkSurface',
  width: first.width,
  height: first.height,
  counts: first.counts,
  expected_color_counts: expectedColorCounts,
  probes: first.probes,
  rgba_sha256: rgbaHash,
  png_sha256: pngHash,
  repeat_rgba_matches: rgbaHash === createHash('sha256').update(second.rgba).digest('hex'),
  repeat_png_matches: pngHash === createHash('sha256').update(second.pngBuffer).digest('hex')
};

if (first.width !== WIDTH || first.height !== HEIGHT) throw new Error(`Wrong PNG dimensions: ${first.width}x${first.height}`);
if (JSON.stringify(first.counts) !== JSON.stringify({ ...expectedColorCounts, unexpected_pixels: 0 })) throw new Error(`Wrong pixel color counts: ${JSON.stringify(first.counts)}`);
if (JSON.stringify(first.probes) !== JSON.stringify({ orange: ORANGE, blue: BLUE, transparent: TRANSPARENT, orange_outer_edge: TRANSPARENT, blue_outer_edge: TRANSPARENT })) throw new Error(`Wrong pixel probes: ${JSON.stringify(first.probes)}`);
if (!metrics.repeat_rgba_matches || !metrics.repeat_png_matches) throw new Error('Independent CanvasKit surface renders differ');

await writeFile(join(here, 'output/canvaskit-skia.png'), first.pngBuffer);
await writeFile(join(here, 'output/metrics.json'), `${JSON.stringify(metrics, null, 2)}\n`);
if (process.argv.includes('--record')) {
  await mkdir(join(here, 'expected'), { recursive: true });
  await writeFile(join(here, 'expected/metrics.json'), `${JSON.stringify(metrics, null, 2)}\n`);
} else {
  const expected = JSON.parse(await readFile(join(here, 'expected/metrics.json'), 'utf8'));
  if (JSON.stringify(metrics) !== JSON.stringify(expected)) throw new Error('Observed metrics differ from expected/metrics.json');
}
console.log(JSON.stringify(metrics, null, 2));
console.log('canvaskit-skia-raster: OK');
