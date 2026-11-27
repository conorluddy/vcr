// Pack seeded rectangles into 256x256 bins; write layout JSON and an SVG preview of every bin.
import { mkdirSync, writeFileSync } from 'node:fs';
import { MaxRectsPacker } from 'maxrects-packer';

const binSize = 256;
const padding = 2;
let seed = 12345;
const nextRandom = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const inputs = Array.from({ length: 24 }, (_, index) => ({
  id: `sprite-${String(index).padStart(2, '0')}`,
  width: 20 + Math.floor(nextRandom() * 70),
  height: 20 + Math.floor(nextRandom() * 70),
}));
// Sort for stable output: the packer's result depends on input order.
inputs.sort((a, b) => b.height - a.height || b.width - a.width || a.id.localeCompare(b.id));

const packer = new MaxRectsPacker(binSize, binSize, padding, { smart: true, pot: false, square: false });
for (const input of inputs) packer.add(input.width, input.height, { id: input.id });

const bins = packer.bins.map((bin) => ({
  width: bin.width,
  height: bin.height,
  rects: bin.rects.map((r) => ({ id: r.data.id, x: r.x, y: r.y, width: r.width, height: r.height })),
}));
mkdirSync('output', { recursive: true });
writeFileSync('output/layout.json', `${JSON.stringify({ binSize, padding, inputs, bins }, null, 2)}\n`);

const hue = (id) => (Number(id.slice(-2)) * 47) % 360;
bins.forEach((bin, index) => {
  const rects = bin.rects
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="hsl(${hue(r.id)} 65% 60%)" stroke="#222" stroke-width="1"/><text x="${r.x + 3}" y="${r.y + 12}" font-size="9" font-family="Helvetica">${r.id.slice(-2)}</text>`)
    .join('');
  writeFileSync(`output/bin-${index}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${binSize}" height="${binSize}" viewBox="0 0 ${binSize} ${binSize}"><rect width="${binSize}" height="${binSize}" fill="#fff" stroke="#000"/>${rects}</svg>\n`);
});
