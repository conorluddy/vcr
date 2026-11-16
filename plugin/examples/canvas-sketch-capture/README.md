# canvas-sketch fixed-size Canvas2D fixture

## Intent and scope

- Tool ID and version/build: `canvas-sketch` 0.7.8.
- VCR job and exact claim being tested: run a static, fixed-size Canvas2D sketch through canvas-sketch's `canvasSketch()` manager and confirm its manager-created canvas has the requested dimensions and expected rendered pixel geometry.
- Explicit exclusions: CLI hot reload, PNG export, print sizing, WebGL/Three.js backends, animation, arbitrary user sketches, and creative quality.
- Tool documentation and licence sources, checked date: official README https://github.com/mattdesl/canvas-sketch and package metadata (MIT), checked 2026-11-16.
- Environment: macOS 26.6 arm64, `Conors-MacBook-Pro-2.local`, Node.js 25.6.1, npm 11.9.0, Playwright 1.64.1, Chromium for Testing 156.0.8078.4.
- Input: owned deterministic sketch source in this example; no external media, fonts, or assets.
- Dependencies, installation plan, permissions and expected side effects: fixture-local `canvas-sketch@0.7.8`, `playwright@1.64.1`, and `esbuild@0.25.12`, locked by `package-lock.json`; installed under this example only with `npm install --ignore-scripts --no-audit --no-fund`. Chromium was already cached by Playwright. npm added 43 packages in the fixture-local `node_modules`; no global or system packages changed. Headless Chromium needed local process permission beyond the default sandbox.
- Selected workspace, generated output and cleanup paths: this repository worktree; generated bundle, browser page, screenshots and browser logs stay in ignored `output/`.

## Plan, before running

- Exact commands or reviewed recipe and versions: `npm ci`; `./run.sh --record`; inspect the retained `output/` image; `./run.sh`. The fixture bundles the authored sketch with esbuild, launches headless Chromium via Playwright, calls canvas-sketch's `canvasSketch(sketch, settings)` with `dimensions: [64, 48]`, `animate: false`, and a supplied Canvas 2D canvas, then reads pixels from that canvas.
- Expected artifacts and predeclared checks: canvas intrinsic dimensions exactly 64×48; a filled rectangle at x=8..23 and y=10..21 has RGBA `(255, 64, 32, 255)`; background is transparent at `(0,0)`; a second fresh manager render produces the same SHA-256 of all RGBA bytes. Exact pixel ranges are half-open.
- Intended consumer and handoff settings: fixed-size transparent Canvas2D raster for subsequent image/video handling; this fixture does not exercise a VCR renderer or adapter.
- Delivery constraints and units: 64×48 RGBA pixels; no encoded delivery file is claimed.
- Expected failure modes and stop conditions: missing npm package, browser launch failure, manager not creating a canvas/context, mismatched dimensions/pixels/hash, or inability to inspect the actual screenshot. Do not substitute raw Canvas2D drawing without calling canvas-sketch's manager.
- Reproduction and inspection: from this directory run `npm ci && ./run.sh`; `./run.sh --record` deliberately updates `expected/metrics.json`. Open `output/canvas-sketch.png` at 100% to inspect the actual manager output.

## Observation

- Date/executor and commands: 2026-11-16, local macOS arm64; `npm install --ignore-scripts --no-audit --no-fund`, `./run.sh --record`, then `./run.sh`.
- Observed checks: both manager-created canvases measured 64×48; RGBA at `(8,10)` and `(23,21)` was `[255,64,32,255]`; `(0,0)` was transparent `[0,0,0,0]`; full RGBA SHA-256 was `7e19a4c5a318793273a98514d1d85166d8e3889b7d6e0b1a882d0c64ae1628aa`; the independent second manager render matched. Both record and verify exited 0.
- Actual output inspection: opened `output/canvas-sketch.png` at native 64×48 scale; it shows the expected opaque orange-red rectangle on transparent canvas.
- Result: pass for the stated static manager-render claim. Metrics are retained in `expected/metrics.json`; generated screenshot and bundle remain in ignored `output/`.
- Deviations and limitations: initial default-sandbox Chromium launch failed with a macOS MachPortRendezvous permission error. The same fixture then passed with local browser process permission. This does not establish CLI hot reload/export, animation/time seeking, other rendering backends, other OSes, or output quality beyond the asserted geometry.
- Reviewer and invalidation: pending parent review; rerun if the package/browser versions or sketch changes.
