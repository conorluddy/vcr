# flowmap.gl animated flow lines seeked by t

## Intent and scope

- Tool/version: `@flowmap.gl/layers` and `@flowmap.gl/data` 9.5.0 on `@deck.gl/core`, `layers`, `extensions` 9.4.1 and `@luma.gl/*` 9.4.2. Luma must match deck's own range: with luma 9.4.0 beside 9.4.2 the circle shader failed to compile (`DECKGL_FILTER_COLOR`), so pin all luma packages together.
- Claim: `FlowmapLayer` in `animated-straight` mode, whose moving dashes read the wall clock, can be made a pure function of `t` by replacing `Date.now`, and then captured through the `packages/capture` seek route with shuffled order equal to sequential.
- Exclusions: clustering, labels, picking, filtering, curved mode, a basemap or tiles, other deck.gl views, other GPUs, and a real clock (nothing here uses `animationEnabled` or deck's own animation loop).
- Official documentation: https://github.com/visgl/flowmap.gl and the package's `dist/AnimatedFlowLinesLayer` source; checked 2026-11-27.
- Environment: macOS 26.6 arm64; Node 22.19.0; Playwright Chromium through `@vcr/capture` (SwiftShader WebGL).
- Input: 8 owned lon/lat locations and 12 flows in `scene.js`; no assets, no network.
- Output: ignored `output/` (bundle, 90 PNG frames, `report.json`, `summary.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Predeclared checks: 90 frames at 960x540; shuffled capture equals sequential; at least 45 distinct frame hashes (flow lines must move); frame 0 differs from frame 45; no page errors.
- Reasoning for the clock: `AnimatedFlowLinesLayer.draw` computes `Date.now() / 1000` and the shader scrolls by it, so the scene sets `Date.now = () => t * 1000` and calls `deck.redraw` on `requestAnimationFrame`.
- Stop if frames are blank or shuffled differs. Inspect frames at native size.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. First run failed the distinct-frames check: every frame was the same shader-error page, caused by the luma 9.4.0/9.4.2 mix above. After aligning luma to 9.4.2 the run passed: 90 frames, 90 distinct hashes, shuffled equals sequential. Frames 0, 10 and 30 were inspected at native size: eight nodes with sized circles, tapered lines with dashes advancing along each route. Motion is slow (the layer's `SPEED` is 0.015 per unit of its loop clock), so adjacent frames differ by a few pixels. Overriding `Date.now` is global to the page, so any other code on it sees the fake clock. Not established: clustering, labels, curved mode, a map basemap, picking or other platforms.
