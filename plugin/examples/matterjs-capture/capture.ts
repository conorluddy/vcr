// Seek a Matter.js rigid-body scene per frame and check shuffled order matches sequential.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import { captureFrames } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
const report = await captureFrames({
  sceneFile: join(here, "scene.html"),
  width: 1280,
  height: 720,
  fps: 30,
  outputDirectory: join(here, "output/frames"),
  verifyDeterminism: true,
});
writeFileSync(join(here, "output/report.json"), `${JSON.stringify(report, null, 2)}\n`);
if (new Set(report.hashes).size < 2) throw new Error("Animated fixture produced identical frames");
console.log(JSON.stringify({ frames: report.frames, fps: report.frames_per_second, deterministic: report.shuffled_matches_sequential }));
