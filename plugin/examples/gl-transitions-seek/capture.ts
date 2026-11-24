// Renders the gl-transitions Fade shader in raw WebGL at 61 seeked instants (progress 0 to 1 in 1/60 steps)
// and checks that shuffled-order capture matches sequential capture.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { captureFrames, openScenePage } from "@vcr/capture";

interface GlSceneInfo {
  renderer: string;
  transition: string;
  transitionCount: number;
  license: string;
}

const here = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const WIDTH = 640;
const HEIGHT = 360;
const SCENE_DURATION_S = 2;
// Frame 60 seeks t = 2 s, which is progress 1. The harness's default range stops one frame short of the duration.
const FRAMES = Array.from({ length: SCENE_DURATION_S * FPS + 1 }, (_, frame) => frame);
const sceneFile = join(here, "scene.html");
const outputDirectory = join(here, "output");
mkdirSync(outputDirectory, { recursive: true });

const probe = await openScenePage({ sceneFile, width: WIDTH, height: HEIGHT });
let sceneInfo: GlSceneInfo;
try {
  sceneInfo = await probe.page.evaluate(() => (window as unknown as { __glInfo: GlSceneInfo }).__glInfo);
} finally {
  await probe.close();
}

const report = await captureFrames({
  sceneFile,
  width: WIDTH,
  height: HEIGHT,
  fps: FPS,
  frames: FRAMES,
  outputDirectory: join(outputDirectory, "frames"),
  verifyDeterminism: true,
  captureMode: "screenshot",
});

const distinctHashCount = new Set(report.hashes).size;
const summary = {
  renderer: sceneInfo.renderer,
  transition: sceneInfo.transition,
  transition_count_in_library: sceneInfo.transitionCount,
  transition_license: sceneInfo.license,
  width: report.width,
  height: report.height,
  fps: report.fps,
  frames: report.frames,
  distinct_hashes: distinctHashCount,
  shuffled_matches_sequential: report.shuffled_matches_sequential,
  mismatched_frames: report.mismatched_frames,
  wall_ms: report.wall_ms,
  frames_per_second: report.frames_per_second,
};
writeFileSync(join(outputDirectory, "report.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
if (report.shuffled_matches_sequential !== true) throw new Error(`Non-deterministic frames: ${report.mismatched_frames.join(", ")}`);
if (distinctHashCount < 2) throw new Error("Animated fixture produced identical frames");
