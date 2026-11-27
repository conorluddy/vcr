// Seek an IMSC document per frame (generateISD + renderHTML) and check shuffled order matches sequential.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import { captureFrames, openScenePage } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
const options = { sceneFile: join(here, "scene.html"), width: 640, height: 360, fps: 10 };
const report = await captureFrames({ ...options, outputDirectory: join(here, "output/frames"), verifyDeterminism: true });
const scene = await openScenePage(options);
const events = await scene.page.evaluate(() => (window as unknown as { __events: number[] }).__events);
await scene.close();
writeFileSync(join(here, "output/report.json"), `${JSON.stringify({ ...report, events, distinct_frames: new Set(report.hashes).size }, null, 2)}\n`);
console.log(JSON.stringify({ frames: report.frames, events, deterministic: report.shuffled_matches_sequential }));
