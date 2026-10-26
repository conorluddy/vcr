// Capture every scene of this video to PNG sequences and write the render manifest.
import { hostname } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { captureFrames } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "../..");
const video = JSON.parse(readFileSync(join(here, "video.json"), "utf8")) as { parameters: { design: { width: number; height: number }; motion: { fps: number; scenes: Record<string, [number, number]> } } };
const { width, height } = video.parameters.design;
const { fps, scenes } = video.parameters.motion;
// Read package.json by path: p5's exports map hides it from require.resolve.
const version = (name: string) => (JSON.parse(readFileSync(join(projectRoot, "node_modules", name, "package.json"), "utf8")) as { version: string }).version;

const only = process.argv[2];
const outputs: Record<string, unknown> = {};
for (const [scene, [start, end]] of Object.entries(scenes)) {
  if (only && scene !== only) continue;
  const report = await captureFrames({
    sceneFile: join(here, "scenes", scene, "scene.html"),
    serveRoot: projectRoot,
    width, height, fps,
    outputDirectory: join(here, "output/frames", scene),
    verifyDeterminism: process.env["VCR_VERIFY"] === "1",
  });
  outputs[scene] = { start_s: start, end_s: end, frames: report.frames, frames_per_second_captured: report.frames_per_second, first_hash: report.hashes[0], deterministic: report.shuffled_matches_sequential };
  console.log(JSON.stringify({ scene, frames: report.frames, fps: report.frames_per_second }));
}
const manifest = {
  schema_version: "1.0.0",
  status: "rendered",
  rendered_at: new Date().toISOString(),
  recipe: { capture: "pnpm render", assembly: "./assemble.sh", width, height, fps },
  environment: { hostname: hostname(), gsap: version("gsap"), three: version("three"), p5: version("p5"), node: process.version },
  scenes: outputs,
  outputs: ["output/launch-know-your-game.mp4"],
};
writeFileSync(join(here, "render-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
