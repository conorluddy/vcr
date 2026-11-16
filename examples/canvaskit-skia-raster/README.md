# CanvasKit Skia CPU raster fixture

## Intent and scope

- Tool ID and version/build: `canvaskit-wasm` 0.42.0.
- VCR job and exact claim being tested: use CanvasKit's native Skia `MakeSurface` / `SkCanvas.drawRect` API in Node's CPU WASM route to render two exact axis-aligned rectangles into a transparent 64×48 surface, encode PNG, and assert dimensions, pixel colors, pixel counts and repeatability.
- Explicit exclusions: HTML Canvas emulation, browser or GPU surface, fonts/text shaping, PDF/SVG output, SkSL shaders, color management, arbitrary compositions, or visual-quality claims beyond the inspected simple shapes.
- Tool documentation and licence sources, checked 2026-11-16: official [CanvasKit quickstart](https://skia.org/docs/user/modules/quickstart/), [CanvasKit npm README](https://www.npmjs.com/package/canvaskit-wasm), and official [Skia Node example](https://github.com/google/skia/blob/main/modules/canvaskit/npm_build/node.example.js); BSD-3-Clause.
- Environment: macOS 26.6 arm64; Node.js 25.6.1, npm 11.9.0.
- Input: owned two-rectangle geometry defined in this example; no external assets or fonts.
- Dependencies, installation plan, permissions and expected side effects: fixture-local `canvaskit-wasm@0.42.0` and `pngjs@7.0.0`, pinned by `package-lock.json`; installed via `npm ci --ignore-scripts --no-audit --no-fund` under this example only. No global/system install planned.
- Selected workspace, generated output and cleanup paths: this repository worktree; generated `output/canvaskit-skia.png`, metrics and bundle/package install state stay ignored under `output/` or `node_modules/`.

## Plan, before running

- Exact commands and recipe: `npm ci --ignore-scripts --no-audit --no-fund`; `./run.sh --record`; inspect `output/canvaskit-skia.png` at native size; then `./run.sh`. Initialize CanvasKit from the pinned npm package and its local WASM binary, call `CanvasKit.MakeSurface(64,48)`, `surface.getCanvas()`, clear transparent, and draw with Skia `Paint`/`drawRect` (antialias disabled). Encode the `SkImage` snapshot to PNG and decode it only for assertions with pinned pngjs.
- Predeclared checks: decoded PNG exactly 64×48; opaque orange rectangle `[255,128,0,255]` covers x=8..23, y=8..19 (192 pixels); opaque blue rectangle `[32,96,224,255]` covers x=32..39, y=6..13 (64 pixels); `(0,0)` transparent; all other pixels transparent; full RGBA SHA-256 and PNG SHA-256 repeat identically across two fresh Skia surfaces. Pixel bounds are half-open.
- Intended consumer and handoff: a transparent RGBA raster frame ready for a downstream image/video step; no VCR renderer or adapter is exercised.
- Delivery constraints and units: 64×48 RGBA PNG; no byte-size target or media handoff encoding claim.
- Expected failure modes and stop conditions: unsupported Node initialization, WASM load failure, failure to create raster surface, color/count/dimension mismatch, encoding failure, output/hash mismatch, or inability to visually inspect the actual PNG. Do not replace Skia drawing with another canvas implementation.
- Reproduction and inspection: from this directory run `npm ci --ignore-scripts --no-audit --no-fund && ./run.sh`; `./run.sh --record` records `expected/metrics.json`. Open the generated PNG at native dimensions for visual inspection.

## Observation

- Date/executor and commands: 2026-11-16 on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64, Node 25.6.1/npm 11.9.0; installed pinned dependencies with `npm install --ignore-scripts --no-audit --no-fund`, ran `./run.sh --record`, then clean `npm ci --ignore-scripts --no-audit --no-fund && ./run.sh`.
- Observed result: canvaskit-wasm 0.42.0 rendered a 64×48 PNG through `MakeSurface`/`SkSurface` on the Node CPU WASM path. Exactly 192 orange pixels, 64 blue pixels, 2,816 transparent pixels and no unexpected pixels; declared probes and outer-edge transparency matched. RGBA SHA-256 `790c8df515cd17b854be308fb1ab4e133d90615b86387aca73b96ee3eaceeb3d`; PNG SHA-256 `4026f7edc0effa233ad0f81f74c379aa1f757cbdb61d28a463f85a38b8a35847`; both repeated across independent surfaces. Record and clean verify runs exited 0.
- Actual output inspection: opened `output/canvaskit-skia.png` at native 64×48 size; orange and blue rectangles appear at the declared locations with transparent surroundings.
- Result: pass for this native Skia surface drawing and PNG encoding route. Numeric evidence is retained in `expected/metrics.json`; generated PNG stays ignored in `output/`.
- Deviations and limitations: npm added three packages within this example's `node_modules`; no global/system install. This proves no browser, GPU, text, PDF/SVG or broader composition behavior.
- Reviewer and invalidation: pending parent review; revisit on CanvasKit, Node or geometry changes.
