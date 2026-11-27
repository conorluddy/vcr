// Predeclared geometry assertions on output/facts.json; throws on any failure.
import { readFileSync } from 'node:fs';

const facts = JSON.parse(readFileSync('output/facts.json', 'utf8'));
const { arcSegments, areaDifference, areaUnion, areaStar, areaCircle, areaOutset, areaInset, ringsDifference, ringsUnion } = facts;
const polygonCircleArea = 0.5 * arcSegments * 60 ** 2 * Math.sin((2 * Math.PI) / arcSegments);
const expectedDifference = 180 * 180 - polygonCircleArea;
const failures = [];
if (Math.abs(areaDifference - expectedDifference) > 1) failures.push(`difference area ${areaDifference} != analytic ${expectedDifference.toFixed(2)}`);
if (ringsDifference !== 2) failures.push(`difference should be an outer ring and a hole, got ${ringsDifference} rings`);
if (ringsUnion !== 1) failures.push(`union of overlapping shapes should be one ring, got ${ringsUnion}`);
if (!(areaUnion < areaStar + areaCircle && areaUnion > Math.max(areaStar, areaCircle))) failures.push('union area is not between max and sum of the inputs');
if (!(areaOutset > areaUnion && areaUnion > areaInset)) failures.push('outset > union > inset ordering broken');
if (failures.length) throw new Error(failures.join('; '));
