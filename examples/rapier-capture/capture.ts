// Builds scene.tsx with esbuild (the only build step React examples may add), then captures it.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFileSync, writeFileSync } from "node:fs";
import { buildSync } from "esbuild";
import { captureFrames } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
buildSync({
  entryPoints: [join(here, "scene.tsx")],
  bundle: true,
  format: "esm",
  jsx: "automatic",
  outfile: join(here, "output/bundle/scene.js"),
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "error",
});
// The WASM is not inlined in the bundle: copy it beside scene.js so scene.tsx can fetch it over the loopback server.
const rapierCompatRoot = dirname(fileURLToPath(import.meta.resolve("@dimforge/rapier3d-compat")));
copyFileSync(join(rapierCompatRoot, "rapier_wasm3d_bg.wasm"), join(here, "output/bundle/rapier_wasm3d_bg.wasm"));
const report = await captureFrames({
  sceneFile: join(here, "scene.html"),
  width: 1280,
  height: 720,
  fps: 30,
  outputDirectory: join(here, "output/frames"),
  verifyDeterminism: true,
});
writeFileSync(join(here, "output/report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ frames: report.frames, fps: report.frames_per_second, deterministic: report.shuffled_matches_sequential }));
