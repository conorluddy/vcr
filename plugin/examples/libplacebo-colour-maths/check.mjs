// Judges libplacebo's measured CPU colour and tone-map output against predeclared references.
// Usage: node check.mjs <output-dir> [--record]. Run from the example directory.
// Closed-form values are derived here from the published primaries alone, never from libplacebo.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const EXPECTED_HASHES_PATH = 'expected/hashes.json';
const MEASURED_FILE = 'measured.json';

// === PUBLIC API ===

const [outputDirectory, mode] = process.argv.slice(2);
if (!outputDirectory) {
  console.error('usage: node check.mjs <output-dir> [--record]');
  process.exit(2);
}

const measuredPath = join(outputDirectory, MEASURED_FILE);
if (mode === '--record') {
  const hashes = { [MEASURED_FILE]: sha256(measuredPath) };
  writeFileSync(EXPECTED_HASHES_PATH, `${JSON.stringify(hashes, null, 2)}\n`);
  console.log(`recorded ${EXPECTED_HASHES_PATH}`);
  process.exit(0);
}

const reference = JSON.parse(readFileSync('expected/reference.json', 'utf8'));
const expectedHashes = JSON.parse(readFileSync(EXPECTED_HASHES_PATH, 'utf8'));
const measured = JSON.parse(readFileSync(measuredPath, 'utf8'));
const failures = [];
const maxErrors = {};

checkReferenceSelfConsistency();
checkPrimaries();
checkRgb2xyz();
checkMappingMatrices();
checkColours();
checkPqPoints();
checkToneMap();
checkHash();

console.log(Object.entries(maxErrors).map(([label, error]) => `max |error| ${label} = ${error.toExponential(3)}`).join('\n'));
if (failures.length > 0) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join('\n'));
  process.exit(1);
}
console.log('libplacebo-colour-maths: OK');

// === PIPELINE ===

function checkReferenceSelfConsistency() {
  for (const space of ['bt709', 'bt2020']) {
    const derived = closedFormRgb2xyz(reference.primaries[space]);
    compareFlat(`published rgb2xyz ${space} vs closed form`, reference.rgb2xyz[space], flatten(derived), reference.tolerance.referenceSelfCheck);
  }
}

function checkPrimaries() {
  for (const space of ['bt709', 'bt2020']) {
    const measuredPrimaries = measured[space === 'bt709' ? 'primaries709' : 'primaries2020'];
    for (const corner of ['red', 'green', 'blue', 'white']) {
      const [actualX, actualY] = measuredPrimaries[corner];
      const [expectedX, expectedY] = reference.primaries[space][corner];
      recordError(`primaries ${space} ${corner}`, Math.max(Math.abs(actualX - expectedX), Math.abs(actualY - expectedY)), reference.tolerance.primary);
    }
  }
}

function checkRgb2xyz() {
  compareFlat('rgb2xyz bt709', measured.rgb2xyz709, reference.rgb2xyz.bt709, reference.tolerance.rgb2xyz);
  compareFlat('rgb2xyz bt2020', measured.rgb2xyz2020, reference.rgb2xyz.bt2020, reference.tolerance.rgb2xyz);
}

function checkMappingMatrices() {
  const rgb709 = closedFormRgb2xyz(reference.primaries.bt709);
  const rgb2020 = closedFormRgb2xyz(reference.primaries.bt2020);
  compareFlat('mapping 709->2020', measured.mapping709To2020, flatten(mulMatrix(invert3(rgb2020), rgb709)), reference.tolerance.colour);
  compareFlat('mapping 2020->709', measured.mapping2020To709, flatten(mulMatrix(invert3(rgb709), rgb2020)), reference.tolerance.colour);
}

function checkColours() {
  const rgb709 = closedFormRgb2xyz(reference.primaries.bt709);
  const rgb2020 = closedFormRgb2xyz(reference.primaries.bt2020);
  const closed709To2020 = mulMatrix(invert3(rgb2020), rgb709);
  const closed2020To709 = mulMatrix(invert3(rgb709), rgb2020);
  checkColourSet('709->2020', measured.colours709To2020, closed709To2020);
  checkColourSet('2020->709', measured.colours2020To709, closed2020To709);
}

function checkColourSet(label, measuredColours, closedMatrix) {
  reference.colours.forEach((input, index) => {
    const expected = multiplyVector(closedMatrix, input);
    const actual = measuredColours[index];
    if (actual === undefined) {
      failures.push(`colour ${label} ${index}: missing from measured output`);
      return;
    }
    compareFlat(`colour ${label} ${JSON.stringify(input)}`, actual, expected, reference.tolerance.colour);
  });
}

function checkPqPoints() {
  const points = measured.pqToneMap.points;
  reference.pqNits.forEach((nits, index) => {
    const point = points[index];
    if (point === undefined || Math.abs(point.inNits - nits) > 1e-6) {
      failures.push(`pq point ${index}: inNits ${point?.inNits} != predeclared ${nits}`);
      return;
    }
    recordError(`pq ${nits} nits`, Math.abs(point.inPq - pqFromNits(nits)), reference.tolerance.pq);
  });
}

function checkToneMap() {
  const { outputPeakNits, outputSlackNits, peakToleranceNits } = reference.toneMap;
  const points = measured.pqToneMap.points;
  points.forEach((point, index) => {
    if (point.outNits < -outputSlackNits || point.outNits > outputPeakNits + outputSlackNits) {
      failures.push(`tone map ${point.inNits} nits -> ${point.outNits} nits is outside [0, ${outputPeakNits}]`);
    }
    if (index > 0 && !(point.outNits > points[index - 1].outNits)) {
      failures.push(`tone map not strictly increasing at ${point.inNits} nits (${points[index - 1].outNits} -> ${point.outNits})`);
    }
  });
  const peak = points[points.length - 1];
  if (peak.inNits !== reference.toneMap.inputPeakNits) failures.push(`tone map peak input ${peak.inNits} != ${reference.toneMap.inputPeakNits}`);
  recordError('tone map peak nits error', Math.abs(peak.outNits - outputPeakNits), peakToleranceNits);
}

function checkHash() {
  const actual = sha256(measuredPath);
  if (actual !== expectedHashes[MEASURED_FILE]) failures.push(`${MEASURED_FILE}: sha256 ${actual} != expected ${expectedHashes[MEASURED_FILE]}`);
}

function compareFlat(label, actualValues, expectedValues, tolerance) {
  if (actualValues.length !== expectedValues.length) {
    failures.push(`${label}: ${actualValues.length} values, expected ${expectedValues.length}`);
    return;
  }
  const worst = Math.max(...actualValues.map((value, index) => Math.abs(value - expectedValues[index])));
  recordError(label, worst, tolerance);
}

// Records the largest error per label for the report, and fails the run when it exceeds the tolerance.
function recordError(label, error, tolerance) {
  maxErrors[label] = Math.max(maxErrors[label] ?? 0, error);
  if (!(error <= tolerance)) failures.push(`${label}: error ${error} exceeds ${tolerance}`);
}

// Standard derivation: scale each primary column so that R+G+B sums to the white point (Y = 1).
function closedFormRgb2xyz(primaries) {
  const toXyz = ([x, y]) => [x / y, 1, (1 - x - y) / y];
  const columns = [toXyz(primaries.red), toXyz(primaries.green), toXyz(primaries.blue)];
  const primaryMatrix = [0, 1, 2].map((row) => columns.map((column) => column[row]));
  const whiteXyz = toXyz(primaries.white);
  const scale = multiplyVector(invert3(primaryMatrix), whiteXyz);
  return primaryMatrix.map((row) => row.map((value, column) => value * scale[column]));
}

// Inverse = adjugate / determinant, where the adjugate is the transpose of the cofactor matrix.
function invert3(matrix) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  const cofactors = [
    [e * i - f * h, -(d * i - f * g), d * h - e * g],
    [-(b * i - c * h), a * i - c * g, -(a * h - b * g)],
    [b * f - c * e, -(a * f - c * d), a * e - b * d],
  ];
  const determinant = a * cofactors[0][0] + b * cofactors[0][1] + c * cofactors[0][2];
  return [0, 1, 2].map((row) => [0, 1, 2].map((column) => cofactors[column][row] / determinant));
}

function mulMatrix(left, right) {
  return left.map((row) => [0, 1, 2].map((column) => row[0] * right[0][column] + row[1] * right[1][column] + row[2] * right[2][column]));
}

function multiplyVector(matrix, vector) {
  return matrix.map((row) => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2]);
}

function flatten(matrix) {
  return matrix.flat();
}

// SMPTE ST 2084 inverse EOTF: absolute nits to PQ code value in [0, 1].
function pqFromNits(nits) {
  const y = nits / 10000;
  const m1 = 2610 / 16384;
  const m2 = (2523 / 4096) * 128;
  const c1 = 3424 / 4096;
  const c2 = (2413 / 4096) * 32;
  const c3 = (2392 / 4096) * 32;
  const yPowered = y ** m1;
  return ((c1 + c2 * yPowered) / (1 + c3 * yPowered)) ** m2;
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}
