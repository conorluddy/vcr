# deck.gl orthographic scatter fixture

## Intent and scope

- **Tool/version:** `@deck.gl/core` and `@deck.gl/layers` 9.4.0, pinned at matching exact versions.
- **Claim:** render two owned Cartesian points through an actual `Deck` instance, `OrthographicView` and `ScatterplotLayer`; assert viewport projection and opaque point pixels, then force redraw and compare full canvas hashes.
- **Exclusions:** no map, basemap, geographic coordinate projection, data provider, network asset, large dataset, picking, or broad layer compatibility claim.
- **Documentation:** [Deck API](https://deck.gl/docs/api-reference/core/deck), [OrthographicView](https://deck.gl/docs/api-reference/core/orthographic-view), [ScatterplotLayer](https://deck.gl/docs/api-reference/layers/scatterplot-layer), and [npm package](https://www.npmjs.com/package/@deck.gl/core), checked 2026-11-16.
- **Environment:** macOS arm64 with exact macOS, Node, Chromium and active GL renderer recorded in the run metrics.
- **Dependencies and effects:** pinned deck.gl packages, esbuild, Playwright and pngjs installed under this fixture; npm access for installation; browser cache reused. No map assets or external network resources. Bundle and screenshots remain in ignored `output/`.
- **Input:** owned two-point Cartesian JSON-like data and an orthographic view; no map or other asset.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. Bundle the browser entry; create `new Deck(...)` with an `OrthographicView`, `COORDINATE_SYSTEM.CARTESIAN`, and `ScatterplotLayer`; wait for `onAfterRender`; then force a second redraw.
- **Expected checks:** 64×32 drawing buffer with `useDevicePixels:false`; points at `[-12,0]` and `[12,0]` project to centers `[20,16]` and `[44,16]` at zoom 0. Radius is 6 CSS pixels. Exact center pixels are opaque red `[255,0,0,255]` and blue `[0,0,255,255]`; an outside point is transparent. PNG hash and projected positions match after forced redraw. Record exact GL backend/renderer, versions and environment.
- **Stop conditions:** core/layers versions or peer dependencies mismatch, Deck/WebGL2 fails to initialize, no actual Deck layer render occurs, projected centers/pixels differ, redraw hash changes, external requests occur, or no exact runtime/backend report is available.
- **Inspection:** inspect the captured 64×32 canvas at native and enlarged scales. `expected/metrics.json` stores only runtime, projection and pixel/hash values.

## Observation, after running

- **Date/executor:** 2026-11-16; Codex on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64; Node 25.6.1, Playwright 1.64.1, Chromium 156.0.8078.4.
- **Commands:** `./run.sh --record` and `./run.sh`; both passed with `@deck.gl/core` and `@deck.gl/layers` 9.4.0. deck.gl created a luma `webgl` device with WebGL 2.0 on ANGLE SwiftShader (`ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0) (0x0000C0DE)), SwiftShader driver)`). No outside requests or browser errors.
- **Observed:** the actual `Deck` instance rendered its `ScatterplotLayer` into a 64×32 canvas. `OrthographicView` projected the two points to `[20,16]` and `[44,16]`; those pixels were exactly opaque red and blue, while the outside pixel was transparent. Forced redraw produced the same PNG SHA-256: `507bc5b3f9985897963c15801ae79e070a0fafd31d355ea24d609cfc04722106`. See `expected/metrics.json`.
- **Visual inspection:** the native capture showed the two colored circles on transparent background; the 8× nearest-neighbor enlargement showed the expected circular geometry and spacing.
- **Outcome and limits:** pass for two Cartesian points in one orthographic `ScatterplotLayer` on WebGL2/SwiftShader, with deterministic redraw on this Chromium/macOS route. No map tiles, map provider, geospatial projection, large datasets, other GPU backends, or broad layer support are established.
