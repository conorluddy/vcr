// Predeclared checks for the libass burn-in fixture. Usage:
//   node check.mjs times sequential|shuffled        print the frame times in that order (space separated)
//   node check.mjs verify <output-dir> [--record]   run every predeclared check; --record also writes expected/
// Event windows and regions below are fixed by fixture.ass and the README plan, not derived from the run.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FRAME_WIDTH = 640;
const FRAME_HEIGHT = 360;
const FRAME_INTERVAL_MS = 100;
const FRAME_COUNT = 50;
const SHUFFLE_SEED = 20261124;
const MIDDLE_ALPHA_TIME_MS = 3000;
const FONT_FILE_NAME = "JetBrainsMono-Bold.ttf";
const examplesDirectory = dirname(fileURLToPath(import.meta.url));

// === PUBLIC API ===

function sequentialTimes() {
  return Array.from({ length: FRAME_COUNT }, (_, index) => index * FRAME_INTERVAL_MS);
}

function shuffledTimes() {
  const times = sequentialTimes();
  const random = mulberry32(SHUFFLE_SEED);
  for (let index = times.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [times[index], times[swapIndex]] = [times[swapIndex], times[index]];
  }
  return times;
}

function verifyOutputs(outputDirectory, shouldRecord) {
  const failures = [];
  const measurements = readMeasurements(join(outputDirectory, "sequential", "measured.jsonl"));
  const sequentialHashes = hashDirectory(join(outputDirectory, "sequential"));
  const repeatHashes = hashDirectory(join(outputDirectory, "repeat"));
  const shuffledHashes = hashDirectory(join(outputDirectory, "shuffled"));

  checkFrameCountAndDimensions(outputDirectory, failures);
  checkEventRegions(measurements, failures);
  checkNamedProbes(measurements, failures);
  checkDistinctHashes(sequentialHashes, failures);
  checkRepeatIdentical(sequentialHashes, repeatHashes, failures);
  checkShuffledMatchesSequential(sequentialHashes, shuffledHashes, failures);
  checkMiddleFrameAlpha(measurements, failures);
  checkFontProvenance(outputDirectory, failures);

  if (shouldRecord) {
    if (failures.length > 0) return failures;
    writeExpected(sequentialHashes, measurements);
    return [];
  }
  checkAgainstRecord(sequentialHashes, measurements, failures);
  return failures;
}

// === CHECKS ===

function checkFrameCountAndDimensions(outputDirectory, failures) {
  for (const subdirectory of ["sequential", "repeat", "shuffled"]) {
    const ppmNames = readdirSync(join(outputDirectory, subdirectory)).filter((name) => name.endsWith(".ppm"));
    if (ppmNames.length !== FRAME_COUNT) {
      failures.push(`${subdirectory}: expected ${FRAME_COUNT} frames, found ${ppmNames.length}`);
    }
    for (const name of ppmNames) {
      const header = readFileSync(join(outputDirectory, subdirectory, name)).subarray(0, 24).toString("latin1");
      if (!header.startsWith(`P6\n${FRAME_WIDTH} ${FRAME_HEIGHT}\n255\n`)) {
        failures.push(`${subdirectory}/${name}: header is not P6 ${FRAME_WIDTH}x${FRAME_HEIGHT}`);
      }
    }
  }
}

function checkEventRegions(measurements, failures) {
  const topLeftRegion = { minX: 0, minY: 0, maxX: 319, maxY: 179 };
  const bottomRightRegion = { minX: 320, minY: 180, maxX: 639, maxY: 359 };
  const events = [
    { name: "TOP LEFT", startMs: 200, endMs: 1800, region: topLeftRegion },
    { name: "BOTTOM RIGHT", startMs: 2200, endMs: 3800, region: bottomRightRegion },
  ];
  for (const measurement of measurements) {
    const activeEvent = events.find((event) => measurement.tMs >= event.startMs && measurement.tMs < event.endMs);
    if (activeEvent === undefined) {
      if (measurement.changedPixels !== 0 || measurement.changedBox !== null) {
        failures.push(`t=${measurement.tMs}: expected nothing drawn between events, got ${measurement.changedPixels} pixels`);
      }
      continue;
    }
    if (measurement.changedPixels === 0 || measurement.changedBox === null) {
      failures.push(`t=${measurement.tMs}: ${activeEvent.name} expected text, got nothing drawn`);
      continue;
    }
    if (!boxInsideRegion(measurement.changedBox, activeEvent.region)) {
      failures.push(`t=${measurement.tMs}: ${activeEvent.name} drawn box ${measurement.changedBox} leaves its region`);
    }
  }
}

function checkNamedProbes(measurements, failures) {
  const probeExpectations = [
    { tMs: 1000, expect: "top-left text" },
    { tMs: 2000, expect: "nothing" },
    { tMs: 3000, expect: "bottom-right text" },
  ];
  for (const probe of probeExpectations) {
    const measurement = measurements.find((entry) => entry.tMs === probe.tMs);
    if (measurement === undefined) {
      failures.push(`probe t=${probe.tMs} missing from measured.jsonl`);
      continue;
    }
    const drew = measurement.changedPixels > 0;
    const wantsDrawn = probe.expect !== "nothing";
    if (drew !== wantsDrawn) {
      failures.push(`probe t=${probe.tMs} expected ${probe.expect}, measured ${measurement.changedPixels} pixels`);
    }
  }
}

function checkDistinctHashes(sequentialHashes, failures) {
  const distinctFrameHashes = new Set(Object.entries(sequentialHashes).filter(([name]) => name.endsWith(".ppm")).map(([, hash]) => hash));
  if (distinctFrameHashes.size < 2) {
    failures.push(`only ${distinctFrameHashes.size} distinct frame hash(es); expected at least 2`);
  }
}

function checkRepeatIdentical(sequentialHashes, repeatHashes, failures) {
  const differingNames = Object.keys(sequentialHashes).filter((name) => sequentialHashes[name] !== repeatHashes[name]);
  if (differingNames.length > 0 || Object.keys(repeatHashes).length !== Object.keys(sequentialHashes).length) {
    failures.push(`repeat run differs from sequential run in ${differingNames.length} file(s), e.g. ${differingNames[0] ?? "file set"}`);
  }
}

function checkShuffledMatchesSequential(sequentialHashes, shuffledHashes, failures) {
  const differingNames = Object.keys(sequentialHashes).filter((name) => sequentialHashes[name] !== shuffledHashes[name]);
  if (differingNames.length > 0) {
    failures.push(`shuffled order differs from sequential in ${differingNames.length} file(s), e.g. ${differingNames[0]}`);
  }
}

function checkMiddleFrameAlpha(measurements, failures) {
  const measurement = measurements.find((entry) => entry.tMs === MIDDLE_ALPHA_TIME_MS);
  if (measurement === undefined) return;
  if (measurement.coverageMin !== 0 || measurement.coverageMax !== 255) {
    failures.push(`t=${MIDDLE_ALPHA_TIME_MS} coverage range ${measurement.coverageMin}..${measurement.coverageMax}; expected 0..255`);
  }
  if (measurement.partialCoveragePixels < 1) {
    failures.push(`t=${MIDDLE_ALPHA_TIME_MS} has no antialiased partial coverage pixels`);
  }
}

function checkFontProvenance(outputDirectory, failures) {
  const logPath = join(outputDirectory, "libass.log");
  const log = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
  if (!log.includes(FONT_FILE_NAME)) {
    failures.push(`libass log does not name ${FONT_FILE_NAME}; bundled font use is not shown`);
  }
}

function checkAgainstRecord(sequentialHashes, measurements, failures) {
  const expectedHashesPath = join(examplesDirectory, "expected", "hashes.json");
  const expectedMeasuredPath = join(examplesDirectory, "expected", "measured.json");
  const expectedHashes = JSON.parse(readFileSync(expectedHashesPath, "utf8"));
  const expectedMeasured = JSON.parse(readFileSync(expectedMeasuredPath, "utf8"));
  if (JSON.stringify(expectedHashes) !== JSON.stringify(sequentialHashes)) {
    failures.push("frame or coverage hashes differ from expected/hashes.json");
  }
  if (JSON.stringify(expectedMeasured) !== JSON.stringify(measurements)) {
    failures.push("measurements differ from expected/measured.json");
  }
}

function writeExpected(sequentialHashes, measurements) {
  writeFileSync(join(examplesDirectory, "expected", "hashes.json"), `${JSON.stringify(sequentialHashes, null, 2)}\n`);
  writeFileSync(join(examplesDirectory, "expected", "measured.json"), `${JSON.stringify(measurements, null, 2)}\n`);
}

// === HELPERS ===

function mulberry32(seed) {
  let state = seed;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function boxInsideRegion(box, region) {
  const [minX, minY, maxX, maxY] = box;
  return minX >= region.minX && minY >= region.minY && maxX <= region.maxX && maxY <= region.maxY;
}

function readMeasurements(measurementPath) {
  return readFileSync(measurementPath, "utf8")
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}

function hashDirectory(directory) {
  const hashes = {};
  for (const name of readdirSync(directory).filter((entry) => entry.endsWith(".ppm") || entry.endsWith(".pgm")).sort()) {
    hashes[name] = createHash("sha256").update(readFileSync(join(directory, name))).digest("hex");
  }
  return hashes;
}

// === MAIN ===

const [command, firstArgument, secondArgument] = process.argv.slice(2);
if (command === "times") {
  if (firstArgument === "sequential") console.log(sequentialTimes().join(" "));
  else if (firstArgument === "shuffled") console.log(shuffledTimes().join(" "));
  else {
    console.error("usage: node check.mjs times sequential|shuffled");
    process.exit(2);
  }
} else if (command === "verify") {
  const failures = verifyOutputs(firstArgument, secondArgument === "--record");
  if (failures.length > 0) {
    for (const failure of failures) console.error(`check failed: ${failure}`);
    process.exit(1);
  }
  console.log(secondArgument === "--record" ? "recorded expected/" : "all predeclared checks passed");
} else {
  console.error("usage: node check.mjs times <sequential|shuffled> | verify <output-dir> [--record]");
  process.exit(2);
}
