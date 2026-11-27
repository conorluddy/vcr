// Facts a script can diff: dissolved feature count, vertex counts before and after simplify, projection, SVG structure.
import { readFileSync, writeFileSync } from 'node:fs';

const countVertices = (geojson) =>
  JSON.stringify(geojson.features.map((feature) => feature.geometry.coordinates)).match(/\[-?[\d.e+-]+,-?[\d.e+-]+\]/g).length;
const input = JSON.parse(readFileSync('input.geojson', 'utf8'));
const out = JSON.parse(readFileSync('output/regions.geojson', 'utf8'));
const svg = readFileSync('output/regions.svg', 'utf8');
const firstX = out.features[0].geometry.coordinates.flat(1)[0][0];
const metrics = {
  inputFeatures: input.features.length,
  inputVertices: countVertices(input),
  dissolvedFeatures: out.features.length,
  dissolvedRegions: out.features.map((feature) => feature.properties.region).sort(),
  dissolvedVertices: countVertices(out),
  projectedFirstXIsMeters: Math.abs(firstX) > 1000,
  svgPathCount: (svg.match(/<path\b/g) ?? []).length,
  svgWidth: svg.match(/ width="([^"]+)"/)?.[1],
  svgFillColors: [...new Set(svg.match(/fill="([^"]+)"/g))].sort(),
  svgHasViewBox: /viewBox=/.test(svg),
};
if (metrics.dissolvedFeatures !== 2) throw new Error(`expected 2 dissolved features, got ${metrics.dissolvedFeatures}`);
if (metrics.dissolvedVertices >= metrics.inputVertices) throw new Error('simplify did not reduce vertices');
if (!metrics.projectedFirstXIsMeters) throw new Error('coordinates are not projected');
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
