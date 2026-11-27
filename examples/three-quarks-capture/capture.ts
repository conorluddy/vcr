import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";
import { captureFrames } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, "output"), { recursive: true });
const report = await captureFrames({
  sceneFile: join(here, "scene.html"),
  serveRoot: resolve(here, "../.."),
  width: 640,
  height: 360,
  fps: 30,
  outputDirectory: join(here, "output/frames"),
  verifyDeterminism: true,
});
writeFileSync(join(here, "output/report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ frames: report.frames, fps: report.frames_per_second, deterministic: report.shuffled_matches_sequential }));
