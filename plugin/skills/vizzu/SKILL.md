---
name: vizzu
description: Seek a Vizzu chart morph (bar to stacked to scatter) frame by frame for browser capture in VCR. Use once Vizzu has been chosen for an animated data story; it needs a double-seek workaround for determinism.
---

# Vizzu

Chart-type morphs through one paused `chart.animate()` keyframe chain, seeked by time. Evidence: vizzu 0.18.0, macOS arm64, Chromium via Playwright, screenshot route (`examples/vizzu-morph-seek`, 2026-11-27). Everything beyond that fixture is untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Proven: bar, stacked bar and scatter views of one table as one seekable timeline, 90 frames at 1280x720.
- Untested: alpha (the fixture is opaque), pie, area and other types, several chained `animate()` calls, live data, other fonts.
- Bespoke marks: `d3`. Static chart: `vl-convert`.

## Capability map
- `new Vizzu({ element })`, `chart.initializing`, `chart.animate(target | keyframes, options)`; `AnimControl` has `seek`, `playState`, `position`, `speed` ([API](https://lib.vizzuhq.com)). Exercised: those calls with keyframes and per-keyframe `duration`. Untested: events, plugins, presets, tooltips, `store()` snapshots.

## Install and doctor
```text
pnpm add vizzu@0.18.0
pnpm list vizzu --depth 0
```
`vizzu.min.js` is ESM with the WASM inline in `dist`; the scene imports it by relative path, so serve the example directory (`packages/capture` does).

## Smoke test
```text
examples/vizzu-morph-seek/run.sh
# expect: vizzu-morph-seek: OK   (capture speed varies by host)
```

## Scene contract
```js
const chart = new Vizzu({ element: document.querySelector("#chart") }); // a div; Vizzu adds its own canvas
await chart.initializing;
await chart.animate({ data, style, config }, 0);            // initial state, no animation
const control = await chart.animate(keyframes, { playState: "paused" }).activated;
window.__scene = { duration: 3, seek: (t) => { const p = `${Math.round(t * 1000)}ms`; control.seek(p); control.seek(p); } };
```
- One `animate([...keyframes])` is one control, so seek covers the whole chain; separate `animate()` calls queue and would not play while paused.
- Seek twice. With a single `seek()`, shuffled capture differed from sequential on a random frame in 3 of 5 runs; with two, 16 of 16 matched. Cause unproven: the render looks asynchronous.
- Positions are strings like `"1500ms"`; a bare number means seconds in `Duration` but `position` is a different setter, so use the string form.
- Default axis interlacing is white; set `plot.xAxis.interlacing.color` and `plot.yAxis.interlacing.color` for a dark background.

## Troubleshooting
- `element not specified`: the option is `element`, not `container`.
- Shuffled mismatch on one random frame: double the `seek` call, then rerun `run.sh` several times; one pass proves little.
- Seeking to the very end while paused does not resolve the completion promise (official note); this fixture never awaits it.

## Official docs
- https://lib.vizzuhq.com and https://github.com/vizzuhq/vizzu-lib (v0.18.0)
