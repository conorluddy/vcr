// Capture a two-step Magic Move between two Shiki-highlighted snippets, seeked from t, and assert the predeclared checks.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHighlighter } from "shiki";
import { codeToKeyedTokens, createMagicMoveMachine } from "@shikijs/magic-move/core";
import { captureFrames, type CaptureMode, type CaptureReport } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const WIDTH = 1280;
const HEIGHT = 720;
const FRAME_COUNT = 90;
const MIDDLE_FRAME = 45;
const LAST_FRAME = FRAME_COUNT - 1;
const THEME = "github-dark";
const LANGUAGE = "typescript";
const SNIPPET_A = `export function total(price: number, tax: number) {
  const subtotal = price * 2;
  return subtotal + tax;
}
`;
const SNIPPET_B = `export function total(price: number, tax: number, discount: number) {
  const subtotal = price * 2 - discount;
  return Math.round(subtotal + tax);
}
`;

const requestedMode = process.env["VCR_CAPTURE"] ?? "screenshot";
if (requestedMode !== "screenshot") throw new Error(`Unsupported capture mode for this fixture: ${requestedMode}`);
const captureMode: CaptureMode = "screenshot";
const outputDirectory = join(here, "output");
mkdirSync(outputDirectory, { recursive: true });

// The machine syncs token keys between the two snippets, so matched tokens animate as moves.
const highlighter = await createHighlighter({ themes: [THEME], langs: [LANGUAGE] });
const machine = createMagicMoveMachine((code, lineNumbers) => codeToKeyedTokens(highlighter, code, { lang: LANGUAGE, theme: THEME }, lineNumbers));
machine.commit(SNIPPET_A);
const synced = machine.commit(SNIPPET_B);
writeFileSync(join(outputDirectory, "steps.json"), `${JSON.stringify({ from: synced.previous, to: synced.current })}\n`);

const animatedOptions = { sceneFile: join(here, "scene.html"), fps: FPS, captureMode, width: WIDTH, height: HEIGHT };
const animated = await captureFrames({ ...animatedOptions, outputDirectory: join(outputDirectory, "frames") });

// Fixed seed keeps an order-dependent failure reproducible.
const shuffled = Array.from({ length: animated.frames }, (_, frame) => frame);
let state = 0x5eed;
for (let index = shuffled.length - 1; index > 0; index--) {
  state = (state * 1664525 + 1013904223) >>> 0;
  const swap = state % (index + 1);
  [shuffled[index], shuffled[swap]] = [shuffled[swap]!, shuffled[index]!];
}
const animatedShuffled = await captureFrames({ ...animatedOptions, frames: shuffled });
const staticReference = await captureFrames({ sceneFile: join(here, "static.html"), fps: FPS, captureMode, width: WIDTH, height: HEIGHT, frames: [0, LAST_FRAME], outputDirectory: join(outputDirectory, "static") });

const mismatches = shuffled.filter((frame, index) => animated.hashes[frame] !== animatedShuffled.hashes[index]);
const [staticA, staticB] = staticReference.hashes;
const distinctHashes = new Set(animated.hashes).size;
const checks = {
  frame_count_is_90: animated.frames === FRAME_COUNT && animated.hashes.length === FRAME_COUNT,
  static_reference_has_2_frames: staticReference.frames === 2,
  dimensions_1280x720: animated.width === WIDTH && animated.height === HEIGHT,
  at_least_2_distinct_hashes: distinctHashes >= 2,
  shuffled_matches_sequential: mismatches.length === 0,
  progress_0_matches_static_a: animated.hashes[0] === staticA,
  progress_1_matches_static_b: animated.hashes[LAST_FRAME] === staticB,
  middle_frame_differs_from_both: animated.hashes[MIDDLE_FRAME] !== animated.hashes[0] && animated.hashes[MIDDLE_FRAME] !== animated.hashes[LAST_FRAME],
};
const summarise = (label: string, report: CaptureReport) => ({ label, width: report.width, height: report.height, frames: report.frames, wall_ms: report.wall_ms, frames_per_second: report.frames_per_second });
const report = {
  capture_mode: captureMode,
  fps: FPS,
  timeline_duration_s: animated.duration_s,
  middle_frame: MIDDLE_FRAME,
  distinct_hashes: distinctHashes,
  mismatched_frames: mismatches,
  runs: [summarise("animated sequential", animated), summarise("animated shuffled", animatedShuffled), summarise("static reference", staticReference)],
  checks,
};
writeFileSync(join(outputDirectory, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
const failed = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
if (failed.length > 0) throw new Error(`Predeclared checks failed: ${failed.join(", ")}`);
