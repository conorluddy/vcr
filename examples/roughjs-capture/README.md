# Rough.js seeded sketch capture

## Intent and scope
Rough.js 4.6.6 (`rough.canvas`) draws a rectangle with hachure fill, a solid-filled ellipse and a solid-filled closed path on a transparent Canvas 2D surface, cleared and redrawn from `t` with a fixed `seed: 7`; 90 alpha PNG frames at 1280x720, 30 fps. Excludes SVG output, other fill styles (dots, cross-hatch, zigzag, dashed use unseeded `Math.random` in the bundle), interaction, Node rendering, other browsers and any codec step. Procedural original shapes; no media or fonts. Code MIT (`node_modules/roughjs/LICENSE`, shipped in the pinned package); API https://roughjs.com/ . Checked 2026-11-11. No codec, model or asset dependency.

## Plan, before running
On macOS arm64, install pinned roughjs 4.6.6 in this pnpm workspace (pre-approved package); reuse Playwright 1.64.1 and tsx 4.23.15. Run `pnpm install`, then `examples/roughjs-capture/run.sh --record`, visually inspect frame 45 at 1280x720, then `examples/roughjs-capture/run.sh`. Record the exact browser version from the capture report. Browser build loaded from `node_modules/roughjs/bundled/rough.js` (global `rough`). No bundler.

Predeclared checks: 90 frames at 30 fps, 1280x720, at least two distinct frame hashes, every shuffled hash equal to sequential, frame 45 alpha minimum 0 and maximum 1. Assert these before recording expected/summary.json. Stop on missing dependencies, blank output or any mismatch. Intended consumer is the existing browser capture harness; units are seconds and pixels. Transparent PNG sequence only; no delivery byte budget or compression claim. Outputs and reports in ignored output/; delete that directory to clean up. No cross-machine byte equality asserted.

## Observation, after running
2026-11-11, evidence-runner agent on Conors-MacBook-Pro-2.local, macOS Darwin 25.6.0 arm64, Node 22.19.0, roughjs 4.6.6 (bundled/rough.js), Playwright 1.64.1, Chromium 156.0.8078.4, ImageMagick 7.1.2-15. Screenshot capture route, Canvas 2D backend. GPU details unknown and not claimed.

`run.sh --record` exited 0 and wrote expected/summary.json; a second `run.sh` printed `roughjs-capture: OK`. Each run produced 90 frames at 1280x720; shuffled capture matched sequential for all frames (mismatched_frames empty). Frame 45 alpha was 0 to 1. Capture reported 17.67 fps wall-clock; this is not a claim about the 30 fps timing, which is the frame index.

Inspected a six-frame contact sheet (frames 0, 15, 30, 45, 60, 75) at 640x360 per cell: a hachure-filled blue rectangle that slides right, a solid orange ellipse that narrows and shrinks, and a lime closed zigzag path whose apexes move with the sine term. Strokes show the sketch jitter and the transparent background is intact. No clipping, blank frames or fixture defects seen. Agent visual review only; no human approval claimed.

Result: pass for the stated claim. Not established: SVG output, dots/cross-hatch/zigzag fills (they use unseeded Math.random in the bundle), interaction, export, cross-platform byte equality, or 4.x releases other than 4.6.6.
