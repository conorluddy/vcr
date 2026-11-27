// Facts a script can diff: path structure, measurements and frame hashes, never the media itself.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const facts = JSON.parse(readFileSync('output/facts.json', 'utf8'));
const frameHashes = [0, 1, 2].map((index) =>
  createHash('sha256').update(readFileSync(`output/frame-${index}.svg`)).digest('hex'),
);

const onlyCubicCommands = (d) => /^[MCZ0-9eE.,\s-]+$/.test(d);
if (!onlyCubicCommands(facts.cubicA) || !onlyCubicCommands(facts.cubicB)) {
  throw new Error('normalised paths contain commands other than absolute M, C and Z');
}
const curveCount = (d) => (d.match(/C/g) ?? []).length;
if (curveCount(facts.cubicA) !== curveCount(facts.cubicB)) throw new Error('curve counts differ');
const shift = facts.bboxAfterTranslate.x - facts.bboxA.x;
if (Math.abs(shift - 5) > 0.001) throw new Error(`translate moved bbox x by ${shift}, expected 5`);

writeFileSync('output/metrics.json', `${JSON.stringify({ ...facts, curveCount: curveCount(facts.cubicA), frameHashes }, null, 2)}\n`);
