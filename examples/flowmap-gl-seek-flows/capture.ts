// Seek a FlowmapLayer scene per frame; check shuffled order matches sequential and that the flow lines move.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import { captureFrames } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
const report = await captureFrames({
  sceneFile: join(here, "scene.html"),
  width: 960,
  height: 540,
  fps: 30,
  outputDirectory: join(here, "output/frames"),
  verifyDeterminism: true,
});
writeFileSync(join(here, "output/report.json"), `${JSON.stringify(report, null, 2)}\n`);
// Predeclared: animated flow lines must change the picture between frames.
if (new Set(report.hashes).size < report.frames / 2) throw new Error(`Only ${new Set(report.hashes).size} distinct frames of ${report.frames}`);
console.log(JSON.stringify({ frames: report.frames, distinct: new Set(report.hashes).size, deterministic: report.shuffled_matches_sequential }));
