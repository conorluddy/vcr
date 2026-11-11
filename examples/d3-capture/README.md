# D3 chart capture

## Intent and scope
Claim: D3 builds an SVG bar-and-line chart with d3-scale, d3-shape and d3-axis, where values are interpolated (d3.interpolate) from t in seek() with no d3-transition or d3-timer; 90 alpha frames at 1280x720, 30 fps, shuffled capture equals sequential.
Tool: d3 7.9.2 (ISC), browser build `node_modules/d3/dist/d3.min.js`. Excludes d3-transition, d3-timer, d3-force, d3-hierarchy, interaction, other browsers and cross-machine byte equality. Procedural original data; no media, fonts or assets. Licence and docs checked 2026-11-11 from the catalogue card: https://d3js.org/ and https://www.npmjs.com/package/d3 (d3 7.9.2 published 2026-11-03). No codec or model dependency.

## Plan, before running
On macOS arm64, install pinned d3 7.9.2 in this example (approved), reuse Playwright 1.64.1 and tsx 4.23.15. Run `pnpm install` at the workspace root, then `examples/d3-capture/run.sh --record`, inspect a contact sheet, then `examples/d3-capture/run.sh`. Record the exact browser version from the capture report. No system-wide changes.

Predeclared checks: 90 frames at 30 fps, 1280x720, at least two distinct frame hashes, every shuffled hash equal to sequential, frame 45 alpha minimum 0 and maximum 1. Stop on missing dependencies, blank or clipped output, or any mismatch. Intended consumer is the browser capture harness; units are seconds and pixels. Transparent PNG sequence only. Outputs in ignored output/.

## Observation, after running
2026-11-11, evidence agent on Conors-MacBook-Pro-2.local, macOS 26.6 arm64, Node 22.19.0, d3 7.9.2, Playwright 1.64.1, Chromium 156.0.8078.4, ImageMagick 7.1.2-15. Screenshot capture route, Canvas-free SVG in the DOM. GPU details unknown and not claimed.

`run.sh --record` exited 0 and reported 90 frames at 30 fps, deterministic true. The verification run printed `d3-capture: OK`; frame 45 alpha was 0 to 1. Contact sheet (frames 0, 15, 30, 45, 60, 75) and native frame 45 were inspected: six blue bars and an orange line interpolate smoothly across the sequence, with y and x axes and tick labels present; no clipping, blank frames or fixture defects. The background is transparent. Agent visual review only. Result: pass for the stated claim; not transitions, timers, interaction, other browsers or other platforms. Revalidate on d3 or Playwright changes.
