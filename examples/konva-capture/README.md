# Konva layered capture

## Intent and scope
Konva 10.9.0; pure-time transforms on a two-layer Canvas 2D scene, alpha PNG capture. Excludes interaction, tweens, exports, filters, React, Node rendering and other browsers. Procedural original shapes; no media/fonts. Code MIT, checked 2026-11-05: https://raw.githubusercontent.com/konvajs/konva/10.9.0/LICENSE ; API https://konvajs.org/api/Konva.Layer.html . No codec/model/asset dependency.

## Plan, before running
On macOS arm64, install pinned Konva 10.9.0 locally in this pnpm workspace (approved rollout); reuse Playwright 1.64.1 and tsx 4.23.15. Run `pnpm install`, then `examples/konva-capture/run.sh --record`, visually inspect frame 45 at 1280×720, then `examples/konva-capture/run.sh`. Record the exact browser version separately from the capture report. Doctor checked before install; no system-wide changes. Input is scene.html itself; git records its source identity.

Predeclared checks: 90 frames at 30 fps, 1280×720, at least two distinct frame hashes, every shuffled hash equal to sequential, frame 45 alpha minimum 0 and maximum 1. Assert these before recording expected/summary.json. Stop on missing dependencies, blank output or any mismatch. Intended consumer is the existing browser capture harness; units are seconds and pixels. Transparent PNG sequence only; no delivery byte budget or compression claim. Outputs and reports in ignored output/; delete that directory to clean up. No cross-machine byte equality asserted.

## Observation, after running
2026-11-05, evidence agent on Conors-MacBook-Pro-2.local, macOS Darwin 25.6.0 arm64, Node 22.19.0, Konva 10.9.0, Playwright 1.64.1, Chromium 156.0.8078.4, ImageMagick 7.1.2-15. Screenshot capture route, Canvas 2D backend. GPU details unknown and not claimed.

Both commands exited 0. Each run produced 90 distinct frames; sequential and shuffled matched all frames. Frame 45 alpha was 0–1. `expected/summary.json` retains measurements, output/report.json retains hashes locally. Visually inspected frame 45 at native 1280×720: complete blue polyline, centered lime rounded square and orange translucent circle; no clipping or blank output. No fixture defects or determinism failures observed. Agent visual review only; no human approval claimed. Result: pass for the stated claim, not interaction, export or cross-platform behaviour. Revalidate on dependency or runtime changes.
