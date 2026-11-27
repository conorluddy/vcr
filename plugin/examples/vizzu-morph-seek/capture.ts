// Capture a paused Vizzu keyframe chain through the shared harness: sequential, then seeded shuffle.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { captureFrames } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const outputDirectory = join(here, "output");
mkdirSync(outputDirectory, { recursive: true });
const options = { sceneFile: join(here, "scene.html"), fps: FPS, width: 1280, height: 720 };
const sequential = await captureFrames({ ...options, outputDirectory: join(outputDirectory, "frames") });

// Seeded shuffle: a hash mismatch means a seek depends on the previous seek.
const shuffled = Array.from({ length: sequential.frames }, (_, frame) => frame);
let state = 0x5eed;
for (let index = shuffled.length - 1; index > 0; index--) {
  state = (state * 1664525 + 1013904223) >>> 0;
  const swap = state % (index + 1);
  [shuffled[index], shuffled[swap]] = [shuffled[swap]!, shuffled[index]!];
}
const again = await captureFrames({ ...options, frames: shuffled });
const mismatched = shuffled.filter((frame, index) => sequential.hashes[frame] !== again.hashes[index]);
// The card warns that a paused seek to the very end does not resolve the completion promise; frame 90 is t = 3 s exactly.
const atEnd = await captureFrames({ ...options, frames: [90], outputDirectory: join(outputDirectory, "end") });
const report = {
  end_frame_hash_differs_from_last: atEnd.hashes[0] !== sequential.hashes[89],
  fps: FPS,
  duration_s: sequential.duration_s,
  frames: sequential.frames,
  width: sequential.width,
  height: sequential.height,
  distinct_frames: new Set(sequential.hashes).size,
  shuffled_matches_sequential: mismatched.length === 0,
  mismatched_frames: mismatched,
  hashes: sequential.hashes,
};
writeFileSync(join(outputDirectory, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, hashes: undefined }, null, 2));
