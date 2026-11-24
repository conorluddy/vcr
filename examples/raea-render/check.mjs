// Predeclared checks for the raea fixture: ffprobe facts, decoded-frame hashes, text presence, rerun and still-order equality.
// Node built-ins plus the system ffmpeg and ffprobe (analysis only). run.sh calls this after the renders.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// === PUBLIC API ===

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = join(here, "output");
const sourceDir = join(outputDir, "src");
const raeaBinary = join(outputDir, "target", "release", "raea");
const scenePath = join(sourceDir, "docs", "manual", "examples", "hello.tsx");
const expectedPath = join(here, "expected", "render.json");

const EXPECTED_WIDTH = 1080;
const EXPECTED_HEIGHT = 1920;
const EXPECTED_FRAME_RATE = "30/1";
const EXPECTED_FRAME_COUNT = 90;
const STILL_FRAMES_SEQUENCE = [0, 30, 89];
const STILL_FRAMES_SHUFFLED = [89, 0, 30];
const BLANK_FRAME_MAX_WHITE_FRACTION = 0.0005;
const TEXT_FRAME_MIN_WHITE_FRACTION = 0.001;
const TEXT_FRAME_MAX_WHITE_FRACTION = 0.15;
const WHITE_GRAY_LEVEL = 128;

function main() {
  const isRecording = process.argv.includes("--record");
  const measurement = measureOutputs();
  const checks = predeclaredChecks(measurement);
  if (isRecording) {
    return recordIfPassing(measurement, checks);
  }
  const drift = driftCheck(measurement);
  return reportAndExit([...checks, drift]);
}

// === RENDER MEASUREMENT ===

function measureOutputs() {
  const renderA = join(outputDir, "render-a", "hello.mp4");
  const renderB = join(outputDir, "render-b", "hello.mp4");
  return {
    commit: git(["rev-parse", "HEAD"]),
    raeaVersion: text(raeaBinary, ["--version"]),
    sceneSha256: sha256(readFileSync(scenePath)),
    renderA: probeVideo(renderA),
    renderB: probeVideo(renderB),
    framesA: frameHashes(renderA),
    framesB: frameHashes(renderB),
    whiteFractionsA: whiteFractions(renderA, [0, 30, 89]),
    stillsSequence: STILL_FRAMES_SEQUENCE.map((frame) => stillHash(frame, "sequence")),
    stillsShuffled: STILL_FRAMES_SHUFFLED.map((frame) => stillHash(frame, "shuffled")),
    stillsSize: STILL_FRAMES_SEQUENCE.map((frame) => probeImage(stillPath(frame, "sequence"))),
    tools: {
      ffmpeg: firstLine(text("ffmpeg", ["-version"])),
      ffprobe: firstLine(text("ffprobe", ["-version"])),
      node: process.version,
    },
  };
}

function predeclaredChecks(measurement) {
  const probeFacts = (probe) => probe.codec === "h264" && probe.pixelFormat === "yuv420p"
    && probe.width === EXPECTED_WIDTH && probe.height === EXPECTED_HEIGHT
    && probe.frameRate === EXPECTED_FRAME_RATE && probe.frameCount === EXPECTED_FRAME_COUNT;
  const sameHashes = (left, right) => left.length === right.length && left.every((hash, index) => hash === right[index]);
  const stillsMatch = sameHashes(measurement.stillsSequence, measurement.stillsShuffled);
  const stillsSized = measurement.stillsSize.every((size) => size.width === EXPECTED_WIDTH && size.height === EXPECTED_HEIGHT);
  const textPresent = [30, 89].every((frame) => {
    const fraction = measurement.whiteFractionsA[frame];
    return fraction >= TEXT_FRAME_MIN_WHITE_FRACTION && fraction <= TEXT_FRAME_MAX_WHITE_FRACTION;
  });
  return [
    check("probe-render-a", probeFacts(measurement.renderA), describeProbe(measurement.renderA)),
    check("probe-render-b", probeFacts(measurement.renderB), describeProbe(measurement.renderB)),
    check("frame-count-decoded", measurement.framesA.length === EXPECTED_FRAME_COUNT, `${measurement.framesA.length} hashes`),
    check("distinct-frame-hashes", new Set(measurement.framesA).size >= 2, `${new Set(measurement.framesA).size} distinct`),
    check("frame-0-blank", measurement.whiteFractionsA[0] <= BLANK_FRAME_MAX_WHITE_FRACTION, `white fraction ${measurement.whiteFractionsA[0]}`),
    check("frames-30-89-text", textPresent, `white fraction f30 ${measurement.whiteFractionsA[30]}, f89 ${measurement.whiteFractionsA[89]}`),
    check("rerender-identical", sameHashes(measurement.framesA, measurement.framesB), `${measurement.framesB.length} hashes compared`),
    check("stills-size", stillsSized, measurement.stillsSize.map((size) => `${size.width}x${size.height}`).join(", ")),
    check("stills-shuffled-equals-sequential", stillsMatch, `frames 0,30,89 sequential vs 89,0,30 shuffled`),
  ];
}

function driftCheck(measurement) {
  if (!existsSync(expectedPath)) {
    return { id: "expected-present", pass: false, detail: "expected/render.json missing; run with --record first" };
  }
  const expected = JSON.parse(readFileSync(expectedPath, "utf8"));
  const pass = expected.renderA.codec === measurement.renderA.codec
    && expected.renderA.frameCount === measurement.renderA.frameCount
    && JSON.stringify(expected.framesA) === JSON.stringify(measurement.framesA)
    && expected.sceneSha256 === measurement.sceneSha256;
  return { id: "matches-expected", pass, detail: `frames and probe vs expected/render.json (scene ${measurement.sceneSha256.slice(0, 12)})` };
}

function recordIfPassing(measurement, checks) {
  const failing = checks.filter((item) => !item.pass);
  if (failing.length > 0) {
    reportAndExit(checks);
    return;
  }
  mkdirSync(dirname(expectedPath), { recursive: true });
  const record = {
    commit: measurement.commit,
    raeaVersion: measurement.raeaVersion,
    sceneSha256: measurement.sceneSha256,
    tools: measurement.tools,
    renderA: measurement.renderA,
    framesA: measurement.framesA,
    stillsSequence: measurement.stillsSequence,
  };
  writeFileSync(expectedPath, `${JSON.stringify(record, null, 2)}\n`);
  reportAndExit(checks, `recorded ${expectedPath}`);
}

// === REPORTING AND HELPERS ===

function check(id, pass, detail) {
  return { id, pass: Boolean(pass), detail };
}

function reportAndExit(checks, note = "") {
  for (const item of checks) {
    console.log(`${item.pass ? "PASS" : "FAIL"}  ${item.id}: ${item.detail}`);
  }
  if (note) console.log(note);
  const allPass = checks.every((item) => item.pass);
  console.log(allPass ? "raea-render: OK" : "raea-render: FAIL");
  process.exitCode = allPass ? 0 : 1;
}

function probeVideo(file) {
  const json = JSON.parse(text("ffprobe", ["-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries",
    "stream=codec_name,pix_fmt,width,height,r_frame_rate,nb_read_frames", "-of", "json", file]));
  const stream = json.streams[0];
  return {
    codec: stream.codec_name,
    pixelFormat: stream.pix_fmt,
    width: stream.width,
    height: stream.height,
    frameRate: stream.r_frame_rate,
    frameCount: Number(stream.nb_read_frames),
  };
}

function probeImage(file) {
  const json = JSON.parse(text("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", file]));
  return { width: json.streams[0].width, height: json.streams[0].height };
}

function describeProbe(probe) {
  return `${probe.codec} ${probe.pixelFormat} ${probe.width}x${probe.height} ${probe.frameRate} ${probe.frameCount} frames`;
}

// MD5 per decoded RGB24 frame, from ffmpeg's framemd5 muxer.
function frameHashes(file) {
  return text("ffmpeg", ["-v", "error", "-i", file, "-map", "0:v:0", "-f", "framemd5", "-pix_fmt", "rgb24", "-"])
    .split("\n")
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => line.split(",").at(-1).trim());
}

// Fraction of pixels at gray level >= WHITE_GRAY_LEVEL, keyed by frame number.
function whiteFractions(file, frameNumbers) {
  const pixelsPerFrame = EXPECTED_WIDTH * EXPECTED_HEIGHT;
  const selection = frameNumbers.map((frame) => `eq(n\\,${frame})`).join("+");
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-vf", `select=${selection}`, "-fps_mode", "passthrough",
    "-f", "rawvideo", "-pix_fmt", "gray", "-"], { maxBuffer: 64 * 1024 * 1024 });
  const fractions = {};
  frameNumbers.forEach((frame, index) => {
    const start = index * pixelsPerFrame;
    let white = 0;
    for (let offset = start; offset < start + pixelsPerFrame; offset++) {
      if (raw[offset] >= WHITE_GRAY_LEVEL) white++;
    }
    fractions[frame] = white / pixelsPerFrame;
  });
  return fractions;
}

function stillPath(frame, order) {
  return join(outputDir, "stills", order, `frame-${frame}.png`);
}

function stillHash(frame, order) {
  return frameHashes(stillPath(frame, order))[0];
}

function git(args) {
  return text("git", ["-C", sourceDir, ...args]).trim();
}

function text(command, args) {
  return execFileSync(command, args, { maxBuffer: 16 * 1024 * 1024 }).toString();
}

function firstLine(value) {
  return value.split("\n")[0];
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

main();
