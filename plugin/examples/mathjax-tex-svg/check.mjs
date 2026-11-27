// Facts about the SVG that a script can diff: structure, size and hash, never the media itself.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('output/equation.svg', 'utf8');
const count = (pattern) => (svg.match(pattern) ?? []).length;
const metrics = {
  viewBox: svg.match(/viewBox="([^"]+)"/)?.[1],
  width: svg.match(/ width="([^"]+)"/)?.[1],
  height: svg.match(/ height="([^"]+)"/)?.[1],
  pathCount: count(/<path\b/g),
  useCount: count(/<use\b/g),
  textCount: count(/<text\b/g),
  fontReferences: count(/font-family|@font-face/g),
  sha256: createHash('sha256').update(svg).digest('hex'),
};
if (metrics.textCount !== 0 || metrics.fontReferences !== 0) {
  throw new Error(`expected path-only SVG, got ${metrics.textCount} <text> and ${metrics.fontReferences} font references`);
}
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
