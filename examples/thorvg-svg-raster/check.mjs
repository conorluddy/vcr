// Judges the measured ThorVG output against the predeclared probes and recorded hashes.
// Usage: node check.mjs <output-dir> [--record]. Run from the example directory.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HASHED_FILES = ['svg.argb', 'lottie-frame-5.argb', 'measured.json'];
const EXPECTED_HASHES_PATH = 'expected/hashes.json';

// === PUBLIC API ===

const [outputDirectory, mode] = process.argv.slice(2);
if (!outputDirectory) {
  console.error('usage: node check.mjs <output-dir> [--record]');
  process.exit(2);
}

const hashes = Object.fromEntries(HASHED_FILES.map((name) => [name, sha256(join(outputDirectory, name))]));

if (mode === '--record') {
  writeFileSync(EXPECTED_HASHES_PATH, `${JSON.stringify(hashes, null, 2)}\n`);
  console.log(`recorded ${EXPECTED_HASHES_PATH}`);
  process.exit(0);
}

const measured = JSON.parse(readFileSync(join(outputDirectory, 'measured.json'), 'utf8'));
const predeclared = JSON.parse(readFileSync('expected/probes.json', 'utf8'));
const expectedHashes = JSON.parse(readFileSync(EXPECTED_HASHES_PATH, 'utf8'));
const failures = [];

checkCanvas(measured.canvas, predeclared.canvas);
checkProbes('svg', measured.svg.probes, predeclared.svg.probes);
checkLottie(measured.lottie, predeclared.lottie);
for (const name of HASHED_FILES) {
  if (hashes[name] !== expectedHashes[name]) failures.push(`${name}: sha256 ${hashes[name]} != expected ${expectedHashes[name]}`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join('\n'));
  process.exit(1);
}
console.log('thorvg-svg-raster: OK');

// === PIPELINE ===

function checkCanvas(actual, expected) {
  if (actual.width !== expected.width || actual.height !== expected.height) {
    failures.push(`canvas ${actual.width}x${actual.height} != ${expected.width}x${expected.height}`);
  }
  if (actual.bytes !== expected.bytes) failures.push(`canvas bytes ${actual.bytes} != ${expected.bytes}`);
}

function checkLottie(actual, expected) {
  if (actual.loader !== expected.loader) {
    failures.push(`lottie loader is "${actual.loader}", predeclared "${expected.loader}"`);
    return;
  }
  if (actual.frame !== expected.frame) failures.push(`lottie frame ${actual.frame} != ${expected.frame}`);
  if (actual.totalFrame !== expected.totalFrame) failures.push(`lottie totalFrame ${actual.totalFrame} != ${expected.totalFrame}`);
  checkProbes('lottie', actual.probes, expected.probes);
}

function checkProbes(label, actualProbes, expectedProbes) {
  if (actualProbes.length !== expectedProbes.length) {
    failures.push(`${label}: ${actualProbes.length} probes, predeclared ${expectedProbes.length}`);
    return;
  }
  expectedProbes.forEach((expected, index) => {
    const actual = actualProbes[index];
    if (actual.x !== expected.x || actual.y !== expected.y) {
      failures.push(`${label} probe ${index} at (${actual.x},${actual.y}), predeclared (${expected.x},${expected.y})`);
      return;
    }
    const actualChannels = argbChannels(actual.argb);
    const expectedChannels = argbChannels(expected.argb);
    const worstDifference = Math.max(...actualChannels.map((value, channel) => Math.abs(value - expectedChannels[channel])));
    if (worstDifference > expected.tolerance) {
      failures.push(`${label} (${expected.x},${expected.y}) ${actual.argb} != ${expected.argb} (tolerance ${expected.tolerance}, worst ${worstDifference})`);
    }
  });
}

function argbChannels(hex) {
  const value = Number.parseInt(hex, 16);
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}
