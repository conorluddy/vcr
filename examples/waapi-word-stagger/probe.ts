// Reads each word's computed opacity per frame in the captured page; records first-visible frames and the settled state.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";
import { openScenePage } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
const fps = 30;
const scene = await openScenePage({ sceneFile: join(here, "scene.html"), width: 1280, height: 720 });
try {
  const frames = Math.round(scene.duration * fps);
  const opacities: number[][] = [];
  for (let frame = 0; frame < frames; frame++) {
    opacities.push(await scene.page.evaluate((t: number) => (window as any).__scene.probe(t), frame / fps));
  }
  const wordCount = opacities[0]!.length;
  const firstVisibleFrames = Array.from({ length: wordCount }, (_, word) => opacities.findIndex((row) => row[word]! > 0));
  const gaps = firstVisibleFrames.slice(1).map((frame, index) => frame - firstVisibleFrames[index]!);
  if (!gaps.every((gap) => gap === 3)) throw new Error(`onset gaps not all 3 frames: ${gaps}`);
  const lastFrameOpacities = opacities[frames - 1]!;
  if (!lastFrameOpacities.every((value) => value === 1)) throw new Error(`not settled: ${lastFrameOpacities}`);
  if (!(await scene.page.evaluate(() => (window as any).__scene.wordsInsideViewport()))) throw new Error("words extend beyond the viewport");
  if (!opacities[0]!.every((value) => value === 0)) throw new Error("words visible at frame 0");
  mkdirSync(join(here, "output"), { recursive: true });
  writeFileSync(join(here, "output/probe.json"), `${JSON.stringify({ words: wordCount, first_visible_frames: firstVisibleFrames, gaps, last_frame_opacities: lastFrameOpacities }, null, 2)}\n`);
} finally {
  await scene.close();
}
