// One drawing function, a pure function of t. Three frames to PNG, and the last also to SVG, from the same calls.
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Canvas, FontLibrary } from 'skia-canvas';

const width = 640;
const height = 360;
const frameTimes = [0, 0.5, 1];
const fontFamily = 'JetBrains Mono VCR';

FontLibrary.use(fontFamily, ['fonts/JetBrainsMono-Bold.ttf']);

function drawScene(context, t) {
  context.fillStyle = '#101820';
  context.fillRect(0, 0, width, height);
  // Orange bar grows with t; blue disc slides across.
  context.fillStyle = '#ff7a00';
  context.fillRect(40, 250, 560 * t, 40);
  context.fillStyle = '#2f80ed';
  context.beginPath();
  context.arc(80 + 480 * t, 140, 36, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#ffffff';
  context.font = `bold 48px "${fontFamily}"`;
  context.fillText(`t=${t.toFixed(1)}`, 40, 70);
}

function renderCanvas(t) {
  const canvas = new Canvas(width, height);
  canvas.gpu = false; // CPU raster, the reproducible route
  drawScene(canvas.getContext('2d'), t);
  return canvas;
}

mkdirSync('output', { recursive: true });
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const frames = [];
for (const t of frameTimes) {
  const png = await renderCanvas(t).toBuffer('png');
  writeFileSync(`output/frame-${t.toFixed(1)}.png`, png);
  frames.push({ t, pngBytesSha256: sha256(png) });
}
const svg = (await renderCanvas(1).toBuffer('svg', { outline: true })).toString('utf8');
writeFileSync('output/frame-1.0.svg', svg);
writeFileSync('output/render.json', `${JSON.stringify({ frames, svgSha256: sha256(svg) }, null, 2)}\n`);
