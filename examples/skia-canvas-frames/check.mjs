// Facts a script can diff: dimensions, pixel probes at known positions, SVG structure. Never the media.
import { readFileSync, writeFileSync } from 'node:fs';
import { Canvas, loadImage } from 'skia-canvas';

const probes = {
  background: [5, 5],
  barMiddle: [300, 270],
  discAtT0: [80, 140],
  discAtT1: [560, 140],
};
const hex = (data) => `#${[...data.slice(0, 3)].map((v) => v.toString(16).padStart(2, '0')).join('')}${data[3] === 255 ? '' : `/a${data[3]}`}`;

const frames = {};
for (const t of ['0.0', '0.5', '1.0']) {
  const image = await loadImage(`output/frame-${t}.png`);
  const canvas = new Canvas(image.width, image.height);
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  frames[t] = {
    size: `${image.width}x${image.height}`,
    probes: Object.fromEntries(Object.entries(probes).map(([name, [x, y]]) => [name, hex(context.getImageData(x, y, 1, 1).data)])),
  };
}
const svg = readFileSync('output/frame-1.0.svg', 'utf8');
const svgFacts = {
  textElements: (svg.match(/<text\b/g) ?? []).length,
  fontReferences: (svg.match(/font-family|@font-face/g) ?? []).length,
  hasPaths: /<path\b/.test(svg),
  viewBox: svg.match(/viewBox="([^"]+)"/)?.[1] ?? null,
};
if (svgFacts.textElements !== 0 || svgFacts.fontReferences !== 0) throw new Error(`expected outlined text, got ${JSON.stringify(svgFacts)}`);
const render = JSON.parse(readFileSync('output/render.json', 'utf8'));
writeFileSync('output/metrics.json', `${JSON.stringify({ frames, svgFacts, hashes: render }, null, 2)}\n`);
