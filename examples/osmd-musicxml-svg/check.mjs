// Facts about the SVG that a script can diff: structure, semantic classes, size and hash, never the media itself.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('output/score.svg', 'utf8');
const count = (pattern) => (svg.match(pattern) ?? []).length;
const metrics = {
  viewBox: svg.match(/viewBox="([^"]+)"/)?.[1],
  stavenoteCount: count(/class="vf-stavenote"/g),
  noteheadCount: count(/class="vf-notehead"/g),
  measureCount: count(/class="vf-measure"/g),
  textCount: count(/<text\b/g),
  texts: [...svg.matchAll(/<text\b[^>]*>([^<]*)</g)].map((match) => match[1]),
  sha256: createHash('sha256').update(svg).digest('hex'),
};
// The score has 10 pitched notes and 1 rest (11 stavenotes), in 4 measures.
if (metrics.measureCount !== 4) throw new Error(`expected 4 measures, got ${metrics.measureCount}`);
if (metrics.stavenoteCount !== 11) throw new Error(`expected 11 stavenotes, got ${metrics.stavenoteCount}`);
if (metrics.noteheadCount !== 11) throw new Error(`expected 11 noteheads, got ${metrics.noteheadCount}`);
if (!metrics.texts.includes('Sol')) throw new Error('lyric "Sol" missing from SVG');
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
