# Ssam static Canvas 2D sketch

## Intent and scope

- **Tool/version:** Ssam 0.22.0, called as `ssam(sketch, settings)` from its official ESM package.
- **Claim:** Ssam's sketch manager invokes an owned static Canvas 2D sketch, producing an exact 32×32 RGBA canvas; two fresh runtime renders match in dimensions and pixels.
- **Exclusions:** export APIs/formats, hot reload, animation, GIF/video, WebGL, Three.js, external frame seeking, or broader creative quality.
- **Environment:** macOS 26.6 arm64; Node 25.6.1; fixture-local Vite 8.3.5 as dev server; VCR Playwright 1.64.1; Chrome for Testing 156.0.8078.4.
- **Input/rights:** owned deterministic four-quadrant 32×32 Canvas sketch, no external assets.
- **Dependencies/install plan:** fixture-local pinned `ssam@0.22.0` and `vite@8.3.5`; install with `npm ci --prefix examples/ssam-static-canvas`. The fixture uses existing local Playwright/Chromium, no browser download. `node_modules`, dev-server process and generated PNG previews are local; previews/output go under ignored `output/`.
- **Documentation:** official [Ssam repository README](https://github.com/cdaein/ssam) (documents `ssam(sketch, settings)` and `wrap.render`) and [MIT license](https://github.com/cdaein/ssam/blob/main/LICENSE), checked 2026-11-16.

## Plan, before running

- **Command:** `npm ci --prefix examples/ssam-static-canvas`, then `./run.sh --record` to start Vite on a dynamically chosen loopback port and render in local Chromium. It invokes the Ssam manager twice in fresh pages and records metrics in `expected/result.json`; `./run.sh` repeats and diffs.
- **Expected canvas:** manager settings `dimensions: [32, 32]`, `duration: 1000`, `playFps: 30`, `exportFps: 30`; four 16×16 quadrants: red, green, blue, white. Assert dimensions, all 4×256 exact RGBA pixels per quadrant, exact raw RGBA-byte hash and exact pixel-metric equality between fresh pages.
- **Failure/stop conditions:** package/runtime versions differ from pins, Ssam does not create/render the 2D canvas, wrong size/pixels, unsupported browser, startup failure or nondeterministic pixels.
- **Inspection/reproduction:** the runner stores a PNG preview in ignored `output/`; inspect it visually. No export formats or animation are exercised.

## Observation, after running

- **Date/executor and actual environment:** 2026-11-16, `Conors-MacBook-Pro-2.local`; macOS 26.6 arm64 (Darwin 25.6.0); Node v25.6.1; Ssam 0.22.0; Vite 8.3.5; Playwright 1.64.1; Chrome for Testing 156.0.8078.4.
- **Observed output/checks:** Ssam's `ssam(sketch, settings)` created a 32×32 canvas and called the owned sketch render callback. Each quadrant had exactly 256 expected opaque RGBA pixels; full RGBA SHA-256 `e475cc69aec40975bbd44f97ef666b712d959f4342f2f1a5a0bbf5779237312b`. Two fresh Ssam pages matched dimensions and pixels; record and verify exited 0.
- **Inspection:** opened the retained PNG preview; red, green, blue and white quadrants appear correctly.
- **Dependencies/install:** exact fixture-local `ssam@0.22.0`, `vite@8.3.5`; npm lockfile 30,371 bytes. `node_modules` and previews are ignored; no browser download or external asset.
- **Scheduling nuance:** the first verify attempt showed the manager can invoke this static sketch a different number of times across fresh pages; its pixels and dimensions were identical. The fixture requires at least one render and compares output pixels only, not asynchronous loop call count.
- **Pass/limits:** passed for one static Canvas 2D manager render on Chrome 156. Does not cover export formats, hot reload, animation, WebGL/Three.js or external seeking. No toolkit guide added; evidence may justify one.
