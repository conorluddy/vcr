// Facts a script can diff: subpath count, per-frame hashes and bounds, plus the endpoint claims.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const { subpaths, frames } = JSON.parse(readFileSync('output/frames.json', 'utf8'));
const numbersIn = (d) => d.match(/-?\d+(?:\.\d+)?/g).map(Number);
const metrics = {
  subpaths,
  frames: frames.map(({ progress, d }) => {
    const numbers = numbersIn(d);
    return { progress, commands: (d.match(/[MLZ]/g) ?? []).length, min: Math.min(...numbers), max: Math.max(...numbers), sha256: createHash('sha256').update(d).digest('hex').slice(0, 16) };
  }),
};
for (const { progress, min, max } of metrics.frames) {
  if (min < 0 || max > 24) throw new Error(`progress ${progress} leaves the 24x24 grid: ${min}..${max}`);
}
const [first, , middle, , last] = frames;
// Progress 0 is the menu: every y is 6, 12 or 18. Progress 1 is the X: extremes are the cross corners 6 and 18.
const ys = numbersIn(first.d).filter((_, index) => index % 2 === 1);
if (!ys.every((y) => [6, 12, 18].includes(y))) throw new Error('progress 0 is not the menu');
if (Math.min(...numbersIn(last.d)) !== 6 || Math.max(...numbersIn(last.d)) !== 18) throw new Error('progress 1 is not the X');
if (middle.d === first.d || middle.d === last.d) throw new Error('midpoint equals an endpoint');
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
