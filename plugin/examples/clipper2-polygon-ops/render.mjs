// Boolean union, round offset and difference on flattened polygons, written as SVG plus numeric facts.
import { mkdirSync, writeFileSync } from 'node:fs';
import Clipper2Z from 'clipper2-wasm/dist/es/clipper2z.js';

const PRECISION = 2; // decimal places kept by the integer-scaled engine
const ARC_SEGMENTS = 96; // flattening decides the output, so it is fixed and recorded
const clipper = await Clipper2Z();

const toPathsD = (rings) => {
  const paths = new clipper.PathsD();
  for (const ring of rings) {
    const path = new clipper.PathD();
    for (const [x, y] of ring) path.push_back(new clipper.PointD(x, y, 0));
    paths.push_back(path);
  }
  return paths;
};
const toRings = (paths) =>
  Array.from({ length: paths.size() }, (_, i) => {
    const path = paths.get(i);
    return Array.from({ length: path.size() }, (_, j) => [path.get(j).x, path.get(j).y]);
  });
const circle = (cx, cy, r) =>
  Array.from({ length: ARC_SEGMENTS }, (_, i) => [cx + r * Math.cos((2 * Math.PI * i) / ARC_SEGMENTS), cy + r * Math.sin((2 * Math.PI * i) / ARC_SEGMENTS)]);
const star = (cx, cy, outer, inner, points) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (Math.PI * i) / points;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const round = (value) => Math.round(value * 100) / 100;

const NON_ZERO = clipper.FillRule.NonZero;
const shapeA = toPathsD([star(0, 0, 80, 40, 5)]);
const shapeB = toPathsD([circle(50, 10, 55)]);
const union = clipper.UnionD(shapeA, shapeB, NON_ZERO, PRECISION);
const outset = clipper.InflatePathsD(union, 14, clipper.JoinType.Round, clipper.EndType.Polygon, 2, PRECISION, 0.25);
const inset = clipper.InflatePathsD(union, -10, clipper.JoinType.Miter, clipper.EndType.Polygon, 4, PRECISION, 0.25);
const difference = clipper.DifferenceD(toPathsD([rect(-90, -90, 180, 180)]), toPathsD([circle(0, 0, 60)]), NON_ZERO, PRECISION);

const area = (paths) => round(clipper.AreaPathsD(paths));
const facts = {
  precision: PRECISION,
  arcSegments: ARC_SEGMENTS,
  areaStar: area(shapeA),
  areaCircle: area(shapeB),
  areaUnion: area(union),
  areaOutset: area(outset),
  areaInset: area(inset),
  areaDifference: area(difference),
  ringsUnion: union.size(),
  ringsOutset: outset.size(),
  ringsDifference: difference.size(),
  verticesUnion: toRings(union).flat().length,
  verticesOutset: toRings(outset).flat().length,
};

const pathData = (paths) => toRings(paths).map((ring) => `M${ring.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`).join('');
const panel = (x, body) => `<g transform="translate(${x} 150)">${body}</g>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="300" viewBox="0 0 960 300">
<rect width="960" height="300" fill="#fff"/>
${panel(160, `<path d="${pathData(shapeA)}" fill="#e4572e" fill-opacity=".45"/><path d="${pathData(shapeB)}" fill="#2e86e4" fill-opacity=".45"/><path d="${pathData(union)}" fill="none" stroke="#111" stroke-width="2.5"/>`)}
${panel(480, `<path d="${pathData(outset)}" fill="#cfe8cf" stroke="#2a7d2a" stroke-width="2"/><path d="${pathData(union)}" fill="#fff" stroke="#111" stroke-width="2"/><path d="${pathData(inset)}" fill="#f6c5b8" stroke="#a33" stroke-width="2"/>`)}
${panel(800, `<path d="${pathData(difference)}" fill="#6b4fbb" fill-rule="evenodd" stroke="#111" stroke-width="2"/>`)}
</svg>
`;
mkdirSync('output', { recursive: true });
writeFileSync('output/shapes.svg', svg);
writeFileSync('output/facts.json', `${JSON.stringify(facts, null, 2)}\n`);
