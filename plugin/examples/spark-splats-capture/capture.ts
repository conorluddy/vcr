// Spark sorts splats on a worker per view, so the shared harness's two-frame settle is not enough.
// This script reuses openScenePage and the Chromium flags from @vcr/capture, but awaits the scene's
// own `whenSettled()` after every seek before taking the screenshot.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { frameFilename, openScenePage } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const outputDirectory = join(here, "output/frames");
mkdirSync(outputDirectory, { recursive: true });

const scene = await openScenePage({ sceneFile: join(here, "scene.html"), width: 960, height: 540, captureMode: "screenshot" });
type SettledScene = { __scene: { seek: (seconds: number) => void; whenSettled: () => Promise<void> } };

async function captureFrame(frame: number): Promise<Buffer> {
  await scene.page.evaluate((seconds) => (window as unknown as SettledScene).__scene.seek(seconds), frame / FPS);
  await scene.page.evaluate(() => (window as unknown as SettledScene).__scene.whenSettled());
  // Let the finished draw reach the compositor, as the harness's settle step does.
  await scene.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0)))));
  return scene.page.screenshot({ type: "png" });
}

const totalFrames = Math.round(scene.duration * FPS);
const frames = Array.from({ length: totalFrames }, (_, frame) => frame);
const hashes: string[] = [];
for (const frame of frames) {
  const png = await captureFrame(frame);
  hashes[frame] = createHash("sha256").update(png).digest("hex");
  writeFileSync(join(outputDirectory, frameFilename(frame)), png);
}

// Fixed-seed shuffle so an order-dependent failure reproduces.
const shuffled = [...frames];
let state = 0x5eed;
for (let index = shuffled.length - 1; index > 0; index--) {
  state = (state * 1664525 + 1013904223) >>> 0;
  const swap = state % (index + 1);
  [shuffled[index], shuffled[swap]] = [shuffled[swap]!, shuffled[index]!];
}
const mismatched: number[] = [];
for (const frame of shuffled) {
  const png = await captureFrame(frame);
  if (createHash("sha256").update(png).digest("hex") !== hashes[frame]) mismatched.push(frame);
}
await scene.close();

const report = { frames: frames.length, width: 960, height: 540, hashes, shuffled_matches_sequential: mismatched.length === 0, mismatched_frames: mismatched };
writeFileSync(join(here, "output/report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ frames: report.frames, deterministic: report.shuffled_matches_sequential, mismatched: mismatched.length }));
