// Facts a script can diff: extents, element counts and hashes, never the media.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const read = (name) => readFileSync(`output/${name}`, 'utf8');
const count = (text, pattern) => (text.match(pattern) ?? []).length;
const hash = (text) => createHash('sha256').update(text).digest('hex');
const plate = read('plate.svg');
const outline = read('outline.svg');
const dxf = read('outline.dxf');
const size = (svg) => ({ width: svg.match(/ width="([^"]+)"/)?.[1], height: svg.match(/ height="([^"]+)"/)?.[1] });

const metrics = {
  plate: { ...size(plate), elements: count(plate, /<(path|circle|line)\b/g), sha256: hash(plate) },
  outline: { ...size(outline), elements: count(outline, /<(path|circle|line)\b/g), sha256: hash(outline) },
  dxf: { entities: count(dxf, /^(LINE|ARC|CIRCLE)$/gm), sha256: hash(dxf) },
};
if (!(parseFloat(metrics.outline.width) > parseFloat(metrics.plate.width))) {
  throw new Error(`outline ${metrics.outline.width} did not grow past plate ${metrics.plate.width}`);
}
if (metrics.dxf.entities === 0) throw new Error('DXF has no entities');
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
