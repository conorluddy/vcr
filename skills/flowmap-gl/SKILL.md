---
name: flowmap-gl
description: Draw origin-destination flow maps with flowmap.gl's FlowmapLayer inside a deck.gl scene and capture its animated flow lines frame by frame. Use once an OD flow map is chosen; the layer's animation needs Date.now driven from t.
---

# flowmap.gl

Evidence: `@flowmap.gl/layers` 9.5.0 on deck.gl 9.4.1, macOS arm64, Chromium via `@vcr/capture` (`examples/flowmap-gl-seek-flows`, 2026-11-27). Anything beyond that fixture is untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Proven: 8 locations, 12 flows, `flowLinesRenderingMode: 'animated-straight'`, a basemap-free `MapView`, 90 seeked frames, shuffled equals sequential.
- It is a deck.gl layer, not a renderer: pair with `deck-gl` for views and capture. Few hand-placed flows are simpler in `d3` or `svg`.
- Untested: clustering, location labels, curved mode, picking, filters, tiles under the flows.

## Capability map
- Layer: `FlowmapLayer` with `data={locations, flows}` or a `dataProvider`; accessors `getLocationId/Lat/Lon`, `getFlowOriginId/DestId/Magnitude` ([repository](https://github.com/visgl/flowmap.gl)).
- Modes: `flowLinesRenderingMode` is `straight`, `animated-straight` or `curved`. Also documented: clustering, filtering, labels, legend widget, globe. Only `animated-straight` was run.
- `@flowmap.gl/data` holds the aggregation and scales; `@flowmap.gl/react` and tile data providers exist and are untested.

## Install and doctor
```text
pnpm add @flowmap.gl/layers@9.5.0 @flowmap.gl/data@9.5.0 @deck.gl/core@9.4.1 @deck.gl/layers@9.4.1 @deck.gl/extensions@9.4.1 \
  @luma.gl/core@9.4.2 @luma.gl/engine@9.4.2 @luma.gl/shadertools@9.4.2 @luma.gl/webgl@9.4.2
```
Pin every `@luma.gl` package to the same version. `vcr doctor` does not probe project packages; check versions in the workspace.

## Smoke test
```text
examples/flowmap-gl-seek-flows/run.sh
# expect: flowmap-gl-seek-flows: OK   (90 frames, 90 distinct, shuffled matches sequential)
```

## Scene contract
`AnimatedFlowLinesLayer.draw` computes its scroll from `Date.now()`, so the layer is not a function of t until you make it one:
```js
let fakeNowMs = 0;
Date.now = () => fakeNowMs;
window.__scene = { duration: 3, seek: t => { fakeNowMs = Math.round(t * 1000); requestAnimationFrame(() => deck.redraw('seek')); } };
```
Override is page-global. The layer's loop is `SPEED 0.015` per loop-clock unit, so motion is slow; scale `t` (for example `t * 4000`) for faster dashes. Disable the controller; redraw from `requestAnimationFrame`.

## Troubleshooting
- Page shows a GLSL error listing (`DECKGL_FILTER_COLOR: no matching overloaded function`): mixed `@luma.gl` versions. Align them.
- Dashes frozen across frames: `Date.now` was not replaced before the layer drew, or `deck.redraw` did not run.
- Text labels were disabled in the fixture; label fonts are untested for determinism.

## Official docs
- [flowmap.gl repository](https://github.com/visgl/flowmap.gl)
- [@flowmap.gl/layers on npm](https://www.npmjs.com/package/@flowmap.gl/layers)
- [deck.gl API](https://deck.gl/docs/api-reference)
