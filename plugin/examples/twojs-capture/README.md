# Two.js SVG capture

## Intent and scope

Two.js 0.8.24 SVG renderer: procedural rounded panel, outlined circle, rotating/scaling square and moving circles, captured through @vcr/capture. Tests time-derived transforms and transparent PNG output, not Canvas/WebGL renderers, SVG import/export or interactivity. Inputs are authored geometry with no media or fonts.

Official docs https://two.js.org/docs/two/ identify 0.8.24 and describe autostart, update and SVG renderer selection. MIT terms checked 2026-11-05 at https://github.com/jonobr1/two.js/blob/v0.8.24/LICENSE. Runtime dependency terms remain separate from output rights.

## Plan, before running

Install pinned two.js 0.8.24 and Playwright 1.64.1 via pnpm in this worktree (authorized in-repository install, no system install). Node 22.19.0; macOS arm64 Darwin 25.6.0; existing Chromium, exact version recorded after capture. `pnpm vcr doctor --json` checks available runtime and ImageMagick. No assets or fonts are needed. GPU/driver is not relevant to the selected SVG route.

Run `pnpm install`, `./examples/twojs-capture/run.sh --record`, inspect frames 0/45/89, then `./examples/twojs-capture/run.sh`. At 30fps for 3 seconds expect 90 frames, 1280x720, changing hashes, alpha min 0/max 1 at frame45 and all shuffled hashes equal sequential. run.sh asserts these invariants before recording or diffing expected/summary.json. A mismatch or blank image is a failure. No cross-machine hash claim. Consumer is the transparent PNG sequence; no video codec, colour conversion or delivery byte budget claimed. Source and expected JSON stay here; generated frames/logs stay in ignored output/.

## Observation, after running

2026-11-05, VCR agent on Conors-MacBook-Pro-2.local, Darwin 25.6.0 arm64. Two.js 0.8.24, Node 22.19.0, Playwright 1.64.1, Chromium 156.0.8078.4; ImageMagick 7.1.2-15 for alpha probes. Both commands exited 0. Both captured 90 1280x720 frames with shuffled hashes exactly matching sequential; frame45 alpha min0/max1. Animated-frame assertion passed. Frames0/45/89 inspected at native size: opaque navy panel, cyan ring, green square rotating/scaling and alternating cyan/orange circles moving correctly; transparent margins retained. No defects or deviations seen. Reproduction printed `twojs-capture: OK (17.85 fps)`; timing is observational, not an assertion.

Pass for this SVG browser-capture recipe only. Other renderers, imports/exports, event interaction, fonts and other platforms remain untested. Agent inspection is not human approval. Revisit evidence after runtime/library/scene changes; expected/summary.json retains measurements, not media.
