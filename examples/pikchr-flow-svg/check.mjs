// Facts a script can diff, never the media. Shapes are the <path> elements in drawing order.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = (name) => readFileSync(`output/${name}`, 'utf8');
const svg = read('flow.svg');
const edited = read('flow-edited.svg');
const paths = (text) => [...text.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
const labels = (text) => [...text.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
const viewBoxWidth = (text) => Number(text.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) [\d.]+"/)[1]);
const shapes = paths(svg);
const editedShapes = paths(edited);
const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
const height = Number(viewBox.split(' ')[3]);
const metrics = {
  version: read('version.txt').trim(),
  viewBox,
  pathCount: shapes.length,
  labels: labels(svg),
  fontFamilyAttributes: (svg.match(/font-family/g) ?? []).length,
  // Drawing order: box, arrow, box, arrow, box, arrow, box. The first five must not move when the last label grows.
  earlierShapesUnchangedAfterEdit: shapes.slice(0, 5).every((d, i) => d === editedShapes[i]),
  editedWidthGrew: viewBoxWidth(edited) > viewBoxWidth(svg),
  pngSize: `960x${Math.round((960 * height) / viewBoxWidth(svg))}`,
  sha256: createHash('sha256').update(svg).digest('hex'),
};
if (metrics.pathCount !== 7) throw new Error(`expected 4 boxes and 3 arrows, got ${metrics.pathCount} paths`);
if (!metrics.earlierShapesUnchangedAfterEdit) throw new Error('editing the last label moved earlier shapes');
if (!metrics.editedWidthGrew) throw new Error('the longer label did not widen the diagram');
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
