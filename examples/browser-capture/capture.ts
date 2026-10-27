// Exercise the shared capture harness with a paused GSAP scene at HD and 4K.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { captureFrames, type CaptureMode, type CaptureReport } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const requestedMode = process.env["VCR_CAPTURE"] ?? "screenshot";
if (!["screenshot", "settle", "beginframe"].includes(requestedMode)) throw new Error(`Unknown capture mode: ${requestedMode}`);
const captureMode: CaptureMode = requestedMode === "beginframe" ? "beginframe" : "screenshot";
const outputDirectory = join(here, "output");
mkdirSync(outputDirectory, { recursive: true });
const options = { sceneFile: join(here, "scene.html"), fps: FPS, captureMode };
const hd = await captureFrames({ ...options, width: 1920, height: 1080, outputDirectory: join(outputDirectory, "frames") });

// Fixed seed keeps an order-dependent failure reproducible.
const shuffled = Array.from({ length: hd.frames }, (_, frame) => frame);
let state = 0x5eed;
for (let index = shuffled.length - 1; index > 0; index--) {
  state = (state * 1664525 + 1013904223) >>> 0;
  const swap = state % (index + 1);
  [shuffled[index], shuffled[swap]] = [shuffled[swap]!, shuffled[index]!];
}
const hdShuffled = await captureFrames({ ...options, width: 1920, height: 1080, frames: shuffled });
const uhd = await captureFrames({ ...options, width: 3840, height: 2160, frames: Array.from({ length: 30 }, (_, frame) => frame) });
const mismatches = shuffled.filter((frame, index) => hd.hashes[frame] !== hdShuffled.hashes[index]);
const runSummary = (label: string, report: CaptureReport) => ({ label, width: report.width, height: report.height, frames: report.frames, wall_ms: report.wall_ms, frames_per_second: report.frames_per_second });
const report = {
  capture_mode: captureMode,
  fps: FPS,
  timeline_duration_s: hd.duration_s,
  runs: [runSummary("1080p sequential", hd), runSummary("1080p shuffled", hdShuffled), runSummary("4K sequential (30 frames)", uhd)],
  shuffled_matches_sequential: mismatches.length === 0,
  mismatched_frames: mismatches,
};
writeFileSync(join(outputDirectory, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (mismatches.length > 0) throw new Error(`Non-deterministic frames: ${mismatches.join(", ")}`);
if (new Set(hd.hashes).size < 2) throw new Error("Animated fixture produced identical frames");
