// Facts about the SVGs a script can diff: constraint geometry, structure, hashes. Never the media itself.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const circles = (svg) =>
  [...svg.matchAll(/<circle [^>]*cx="([^"]+)" cy="([^"]+)"[^>]* r="([^"]+)"/g)].map((m) => ({ x: +m[1], y: +m[2], r: +m[3] }));
const gap = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) - a.r - b.r; // negative = overlap
const holdsConstraints = ([a, b, c]) => gap(a, b) < 0 && gap(b, c) < 0 && gap(a, c) >= 0;

const fixed = read('output/venn.svg');
const other = read('output/venn-other.svg');
const metrics = {
  viewBox: fixed.match(/viewBox="([^"]+)"/)?.[1],
  circleCount: circles(fixed).length,
  textCount: (fixed.match(/<text\b/g) ?? []).length,
  pathCount: (fixed.match(/<path\b/g) ?? []).length,
  constraintsHold: holdsConstraints(circles(fixed)),
  otherVariationConstraintsHold: holdsConstraints(circles(other)),
  otherVariationDiffers: sha256(fixed) !== sha256(other),
  fixedVariationSha256: sha256(fixed),
};
const failed = [];
if (metrics.circleCount !== 3) failed.push('expected 3 circles');
if (metrics.textCount !== 0) failed.push('expected no <text>');
if (metrics.pathCount < 3) failed.push('expected label path outlines');
for (const key of ['constraintsHold', 'otherVariationConstraintsHold', 'otherVariationDiffers']) {
  if (!metrics[key]) failed.push(key);
}
if (failed.length) throw new Error(`check failed: ${failed.join(', ')}`);
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
