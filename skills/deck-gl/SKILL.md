---
name: deck-gl
description: Use deck.gl for declarative GPU layers and view-state-driven data visuals. The validated VCR route is a small Cartesian ScatterplotLayer in an orthographic view.
---

# deck.gl

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; in the VCR repository it is `pnpm vcr`. Run workspace commands from the directory with `vcr.json`.

## Use cases and limits
- Use deck.gl when data should be represented by GPU-backed layers whose props can be derived from the requested scene time.
- The VCR fixture proves two Cartesian points in one `ScatterplotLayer`, projected by `OrthographicView` on WebGL2 SwiftShader. It does not prove map tiles, geographic projections, large datasets, or other GPU drivers.
- For a small bespoke shader scene use `gl-react` or `three-js`; use D3 when SVG geometry and axes are the goal.

## Capability map
The [API reference](https://deck.gl/docs/api-reference) routes to core classes, layers, aggregation layers, views/viewports, controllers, transitions, effects and submodules. This fixture exercises [Deck](https://deck.gl/docs/api-reference/core/deck), [OrthographicView](https://deck.gl/docs/api-reference/core/orthographic-view), and [ScatterplotLayer](https://deck.gl/docs/api-reference/layers/scatterplot-layer). Other layer families and interactive controls are documented but untested here.

## Install and doctor
```text
pnpm add @deck.gl/core@9.4.0 @deck.gl/layers@9.4.0
vcr doctor
```
The fixture pins those packages and runs in Chromium through Playwright. `vcr doctor` does not probe project-local packages; check the package versions in the selected workspace. Browser availability is managed with `vcr setup capture`.

## Smoke test
```text
vcr example create deck-gl-orthographic-scatter
cd examples/deck-gl-orthographic-scatter && ./run.sh
# expect: deck.gl fixture OK: {...} (JSON records projected centers, pixels, renderer and matching redraw hash)
```
Recorded sample: deck.gl 9.4.0, Chromium 156 and SwiftShader on macOS 26.6 arm64. Host, renderer details and browser version vary by machine; the fixture compares the complete JSON with `expected/metrics.json`. It checks projected centers, exact center pixels, transparency, no external requests, and a repeated canvas hash.

## Scene contract
- Derive `layers` props and `viewState` from explicit scene time; disable controllers for deterministic capture.
- Wait for deck.gl's render-complete callback before reading the canvas. The fixture's one-frame static data does not validate temporal transitions or animation clocks.
- Keep the WebGL canvas transparent when alpha is part of the expected output.

## Troubleshooting
- No WebGL2 context: confirm the capture browser supports WebGL and the configured software backend; do not treat this fixture as evidence for another renderer.
- Captured pixels are blank: wait for `onAfterRender` before reading the drawing buffer.
- Redraw hash differs: inspect renderer/version metadata and avoid controllers or time-dependent inputs.

## Official docs
- [deck.gl 9.4 API reference](https://deck.gl/docs/api-reference)
- [Deck](https://deck.gl/docs/api-reference/core/deck)
- [OrthographicView](https://deck.gl/docs/api-reference/core/orthographic-view)
- [ScatterplotLayer](https://deck.gl/docs/api-reference/layers/scatterplot-layer)
