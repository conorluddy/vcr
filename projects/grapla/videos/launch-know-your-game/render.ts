// Capture scenes to PNG sequences. Assembly is a separate step.
import { randomUUID } from "node:crypto";
import { hostname } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { captureFrames } from "@vcr/capture";

interface SceneEvidence {
  start_s: number;
  end_s: number;
  frames: number;
  captured_at?: string;
  environment?: Record<string, string>;
  [key: string]: unknown;
}

interface PreviousManifest {
  rendered_at?: string;
  environment?: Record<string, string>;
  recipe: { width: number; height: number; fps: number };
  scenes: Record<string, SceneEvidence>;
}

export async function renderVideo(here: string, only?: string, capture = captureFrames): Promise<void> {
  const projectRoot = resolve(here, "../..");
  const video = JSON.parse(readFileSync(join(here, "video.json"), "utf8")) as { parameters: { design: { width: number; height: number }; motion: { fps: number; scenes: Record<string, [number, number]> } } };
  const { width, height } = video.parameters.design;
  const { fps, scenes } = video.parameters.motion;
  if (only !== undefined && !Object.hasOwn(scenes, only)) throw new Error(`Unknown scene "${only}". Choose: ${Object.keys(scenes).join(", ")}`);

  const manifestPath = join(here, "render-manifest.json");
  const previousText = existsSync(manifestPath) ? readFileSync(manifestPath, "utf8") : undefined;
  const previous = previousText ? JSON.parse(previousText) as PreviousManifest : undefined;
  const outputs: Record<string, SceneEvidence> = {};
  if (only !== undefined && previous) {
    if (previous.recipe.width !== width || previous.recipe.height !== height || previous.recipe.fps !== fps) {
      throw new Error("Capture dimensions or FPS changed; render all scenes before updating the manifest.");
    }
    for (const [scene, evidence] of Object.entries(previous.scenes)) {
      if (!Object.hasOwn(scenes, scene) || scene === only) continue;
      const [start, end] = scenes[scene]!;
      if (evidence.start_s !== start || evidence.end_s !== end) throw new Error(`Timing changed for ${scene}; render all scenes.`);
      // Preserve the original environment/date when importing the earlier manifest format.
      outputs[scene] = { ...evidence,
        ...(evidence.captured_at === undefined && previous.rendered_at ? { captured_at: previous.rendered_at } : {}),
        ...(evidence.environment === undefined && previous.environment ? { environment: previous.environment } : {}),
      };
    }
  }

  // Read package.json by path: p5's exports map hides it from require.resolve.
  const version = (name: string) => (JSON.parse(readFileSync(join(projectRoot, "node_modules", name, "package.json"), "utf8")) as { version: string }).version;
  const environment = { hostname: hostname(), gsap: version("gsap"), three: version("three"), p5: version("p5"), node: process.version };
  for (const [scene, [start, end]] of Object.entries(scenes)) {
    if (only !== undefined && scene !== only) continue;
    const report = await capture({
      sceneFile: join(here, "scenes", scene, "scene.html"), serveRoot: projectRoot,
      width, height, fps, outputDirectory: join(here, "output/frames", scene),
      verifyDeterminism: process.env["VCR_VERIFY"] === "1",
    });
    if (report.shuffled_matches_sequential === false) throw new Error(`Determinism check failed for ${scene}`);
    outputs[scene] = { start_s: start, end_s: end, frames: report.frames, frames_per_second_captured: report.frames_per_second,
      first_hash: report.hashes[0], deterministic: report.shuffled_matches_sequential, captured_at: new Date().toISOString(), environment };
    console.log(JSON.stringify({ scene, frames: report.frames, fps: report.frames_per_second }));
  }

  const archive = previousText ? `output/manifests/${randomUUID()}.json` : undefined;
  const manifest = {
    schema_version: "1.0.0",
    status: Object.keys(outputs).length === Object.keys(scenes).length ? "captured" : "partial",
    captured_at: new Date().toISOString(),
    recipe: { capture: "pnpm render", assembly: "./assemble.sh", width, height, fps },
    scenes: outputs,
    outputs: Object.keys(outputs).map((scene) => `output/frames/${scene}`),
    delivery_target: "output/launch-know-your-game.mp4",
    ...(archive ? { previous_manifest: archive } : {}),
  };
  if (archive && previousText) {
    mkdirSync(dirname(join(here, archive)), { recursive: true });
    writeFileSync(join(here, archive), previousText);
  }
  const temporaryPath = `${manifestPath}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`);
  renameSync(temporaryPath, manifestPath);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await renderVideo(dirname(fileURLToPath(import.meta.url)), process.argv[2]);
}
