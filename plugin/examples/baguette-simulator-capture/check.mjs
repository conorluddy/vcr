// Predeclared checks for the baguette capture fixture, reading output/ and expected/capture.json.
// Usage: node check.mjs state        prints the predeclared device's state (Shutdown, Booted, ...)
//        node check.mjs [--record]   runs checks C2-C6 and writes output/summary.json;
//                                    --record also writes the measurements to expected/observed.json.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outputDirectory = join(here, "output");
const expected = JSON.parse(readFileSync(join(here, "expected", "capture.json"), "utf8"));
const deviceUdid = expected.device.udid;

// === PUBLIC API ===

function main(argumentsList) {
  if (argumentsList[0] === "state") {
    process.stdout.write(`${readDeviceState()}\n`);
    return 0;
  }
  const isRecording = argumentsList[0] === "--record";
  const results = runChecks();
  const passedAll = results.every((result) => result.pass);
  writeFileSync(join(outputDirectory, "summary.json"), `${JSON.stringify({ passedAll, results }, null, 2)}\n`);
  if (isRecording) {
    writeFileSync(join(here, "expected", "observed.json"), `${JSON.stringify(observedMeasurements(results), null, 2)}\n`);
  }
  for (const result of results) {
    console.log(`${result.pass ? "PASS" : "FAIL"} ${result.id} ${result.description}: ${JSON.stringify(result.measured)}`);
  }
  return passedAll ? 0 : 1;
}

// === CHECKS ===

function runChecks() {
  const screenshot = identify(join(outputDirectory, "home.png"));
  const recordingProbe = JSON.parse(readFileSync(join(outputDirectory, "ffprobe.json"), "utf8"));
  const video = recordingProbe.streams[0];
  const durationSeconds = Number(recordingProbe.format.duration);
  const earlyFrame = join(outputDirectory, "frame-early.png");
  const lateFrame = join(outputDirectory, "frame-late.png");
  const earlyDeviation = normalisedStandardDeviation(earlyFrame);
  const lateDeviation = normalisedStandardDeviation(lateFrame);
  const minimumDeviation = expected.minimumNormalisedStandardDeviation;
  const finalState = readDeviceState();
  const device = readDevice();

  return [
    check("C1", "device is the predeclared iPhone 17 Pro (EN) on iOS 26.5",
      { name: device.name, runtime: device.runtime },
      device.name === expected.device.name && device.runtime === expected.device.runtime),
    check("C2", "screenshot is 1206 x 2622 PNG", { width: screenshot.width, height: screenshot.height, format: screenshot.format },
      screenshot.width === expected.screenshot.width && screenshot.height === expected.screenshot.height && screenshot.format === "PNG"),
    check("C3", "screenshot not blank", { normalisedStandardDeviation: normalisedStandardDeviation(join(outputDirectory, "home.png")) },
      normalisedStandardDeviation(join(outputDirectory, "home.png")) > minimumDeviation),
    check("C4", "recording is H.264 MP4 at 1206 x 2622 with duration in tolerance",
      { codec: video.codec_name, width: video.width, height: video.height, formats: recordingProbe.format.format_name, durationSeconds },
      video.codec_name === expected.recording.codec && video.width === expected.recording.width && video.height === expected.recording.height &&
        recordingProbe.format.format_name.includes(expected.recording.container) &&
        durationSeconds >= expected.recording.minimumDurationSeconds && durationSeconds <= expected.recording.maximumDurationSeconds),
    check("C5", "recorded frames not blank and differ",
      { earlyDeviation, lateDeviation, earlyHash: sha256(earlyFrame), lateHash: sha256(lateFrame) },
      earlyDeviation > minimumDeviation && lateDeviation > minimumDeviation && sha256(earlyFrame) !== sha256(lateFrame)),
    check("C6", "simulator shut down afterwards", { state: finalState }, finalState === "Shutdown"),
  ];
}

// === HELPERS ===

function check(id, description, measured, pass) {
  return { id, description, measured, pass: Boolean(pass) };
}

function observedMeasurements(results) {
  return Object.fromEntries(results.map((result) => [result.id, result.measured]));
}

function readDeviceState() {
  return readDevice().state;
}

function readDevice() {
  const envelope = JSON.parse(execFileSync("baguette", ["list", "--json"], { encoding: "utf8" }));
  // A booting or booted device is listed under `running`, not `available`.
  const device = [...envelope.running, ...envelope.available].find((candidate) => candidate.udid === deviceUdid);
  if (device === undefined) {
    throw new Error(`Device ${deviceUdid} is not listed by baguette list --json; check the UDID in expected/capture.json.`);
  }
  return device;
}

function identify(file) {
  const [width, height, format] = execFileSync("magick", ["identify", "-format", "%w %h %m", file], { encoding: "utf8" })
    .trim()
    .split(" ");
  return { width: Number(width), height: Number(height), format };
}

function normalisedStandardDeviation(file) {
  return Number(execFileSync("magick", [file, "-format", "%[fx:standard_deviation]", "info:"], { encoding: "utf8" }));
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

process.exitCode = main(process.argv.slice(2));
