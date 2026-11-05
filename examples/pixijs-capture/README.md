# PixiJS WebGL capture

## Intent and scope

PixiJS 8.22.0 manual WebGL procedural geometry capture on macOS arm64. No WebGPU, sprites, filters, fonts, export API or throughput claim. Input is original procedural geometry in scene.html; no external media. PixiJS MIT terms: https://github.com/pixijs/pixijs/blob/v8.22.0/LICENSE (checked 2026-11-05). API: https://pixijs.download/v8.22.0/docs/app.Application.html . Transitive build/runtime terms are not independently audited.

## Plan, before running

Install pinned pixi.js 8.22.0 in this workspace with pnpm; repository-local installs authorized by rollout. Existing capture dependencies and browser reused; no system installation. Run `./run.sh --record`, inspect frames 0,45,89 at 1280x720, then `./run.sh`. Expect 90 PNG frames at 30 fps, transparent and opaque pixels at frame45, changing frame hashes and exact shuffled/sequential equality. Stop on any mismatch, blank or clipped geometry, missing runtime or unexpected backend. PNGs are a local inspection handoff, no encoded video or byte budget claim. Generated files stay in ignored output/, removable with that directory. No shared harness change.

## Observation, after running

2026-11-05, agent fixture run on Conors-MacBook-Pro-2.local, macOS arm64: PixiJS 8.22.0, Playwright 1.64.1, Chromium 156.0.8078.4, WebGL (backend assertion passed; driver not queried). Recorded and reproduced 90 frames, shuffled equals sequential, alpha min 0 max 1 at frame45, changing hashes. Final run exited 0 at 18.11 fps. Frames 0,45,89 inspected at full resolution: complete outlined plate, green bar and orange disc, no clipping or blank output. Expected facts: expected/summary.json. Pass within this scope only; no cross-machine pixel guarantee. Self-reviewed for evidence, no artistic approval claim; rerun on dependency, browser or scene changes. A concurrent edit to the executing shell script interrupted an intermediate replay with a parse error; final unchanged script replay passed.
