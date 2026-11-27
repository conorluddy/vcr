// Path-string step of a morph, no DOM: normalise two different paths to absolute cubics,
// pair their segments (our code, not the library's), and write SVG frames at t = 0, 0.5, 1.
import { mkdirSync, writeFileSync } from 'node:fs';
import SVGPathCommander from 'svg-path-commander';

const shapeA = 'M10 10 H90 A20 20 0 0 1 110 30 L110 90 Q60 120 10 90 Z';
const shapeB = 'M60 10 L100 10 S120 30 120 50 Q120 80 100 100 H20 Z';

const cubicA = new SVGPathCommander(shapeA).toCurve();
const cubicB = new SVGPathCommander(shapeB).toCurve();
const segmentsA = cubicA.segments;
const segmentsB = cubicB.segments;
if (segmentsA.length !== segmentsB.length) {
  throw new Error(`segment counts differ: ${segmentsA.length} vs ${segmentsB.length}`);
}
for (const segment of [...segmentsA, ...segmentsB]) {
  if (!['M', 'C', 'Z'].includes(segment[0])) throw new Error(`non-cubic segment ${segment[0]}`);
}

const round = (value) => Math.round(value * 1000) / 1000;
const mix = (fromSegments, toSegments, t) =>
  fromSegments.map((from, index) =>
    from.map((value, i) => (i === 0 ? value : round(value + (toSegments[index][i] - value) * t))),
  );
const pathAt = (t) => new SVGPathCommander(mix(segmentsA, segmentsB, t)).toString();

mkdirSync('output', { recursive: true });
[0, 0.5, 1].forEach((t, index) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130" width="130" height="130">
<rect width="130" height="130" fill="#101820"/>
<path d="${pathAt(t)}" fill="#f2a900" stroke="#ffffff" stroke-width="2"/>
</svg>
`;
  writeFileSync(`output/frame-${index}.svg`, svg);
});

const roundBox = ({ x, y, x2, y2 }) => ({ x: round(x), y: round(y), x2: round(x2), y2: round(y2) });
const original = new SVGPathCommander(shapeA);
const translated = new SVGPathCommander(shapeA).transform({ translate: [5, 7] });
const facts = {
  cubicA: cubicA.toString(),
  cubicB: cubicB.toString(),
  segmentCount: segmentsA.length,
  lengthA: round(original.getTotalLength()),
  lengthB: round(new SVGPathCommander(shapeB).getTotalLength()),
  bboxA: roundBox(original.getBBox()),
  bboxAfterTranslate: roundBox(translated.getBBox()),
  midpointPath: pathAt(0.5),
};
writeFileSync('output/facts.json', `${JSON.stringify(facts, null, 2)}\n`);
