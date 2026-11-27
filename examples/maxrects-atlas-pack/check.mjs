// Predeclared checks: all rects placed once, sizes unchanged, inside the bin, no overlaps, padding respected.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const text = readFileSync('output/layout.json', 'utf8');
const { binSize, padding, inputs, bins } = JSON.parse(text);
const placed = bins.flatMap((bin, binIndex) => bin.rects.map((r) => ({ ...r, binIndex })));
const fail = (message) => { throw new Error(message); };

if (placed.length !== inputs.length) fail(`placed ${placed.length} of ${inputs.length}`);
if (new Set(placed.map((r) => r.id)).size !== inputs.length) fail('duplicate or missing ids');
for (const r of placed) {
  const input = inputs.find((i) => i.id === r.id);
  if (r.width !== input.width || r.height !== input.height) fail(`${r.id} resized: ${r.width}x${r.height} vs ${input.width}x${input.height}`);
  if (r.x < 0 || r.y < 0 || r.x + r.width > binSize || r.y + r.height > binSize) fail(`${r.id} outside bin`);
}
let minGap = Infinity;
for (const a of placed) for (const b of placed) {
  if (a.id >= b.id || a.binIndex !== b.binIndex) continue;
  const gapX = Math.max(b.x - (a.x + a.width), a.x - (b.x + b.width));
  const gapY = Math.max(b.y - (a.y + a.height), a.y - (b.y + b.height));
  const gap = Math.max(gapX, gapY);
  if (gap < 0) fail(`${a.id} overlaps ${b.id}`);
  minGap = Math.min(minGap, gap);
}
if (minGap < padding) fail(`padding ${padding} violated: min gap ${minGap}`);
const metrics = {
  inputCount: inputs.length,
  binCount: bins.length,
  rectsPerBin: bins.map((b) => b.rects.length),
  minGap,
  fillPercent: bins.map((b) => Number((100 * b.rects.reduce((s, r) => s + r.width * r.height, 0) / (binSize * binSize)).toFixed(1))),
  layoutSha256: createHash('sha256').update(text).digest('hex'),
};
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
