---
name: d3
description: Build data-driven SVG geometry for a seekable VCR scene. Use D3 scales, shapes and axes as pure data-to-geometry functions; keep frame timing under the scene's control.
---

# D3

`vcr` below means `pnpm vcr` inside this repository; run it from the workspace holding `vcr.json`.

## Use cases and limits
- Use D3 scales, shapes and axes for custom charts and data layouts rendered as SVG.
- Interpolate values from the requested scene time, then update SVG attributes from those values.
- Use SVG directly for a simple fixed graphic, or a charting library when its built-in chart types fit.
- This guide is based on D3 7.9.2, `d3-scale`, `d3-shape`, `d3-axis` and `d3.interpolate` in a browser scene on macOS arm64. It does not cover D3 transitions, timers, force or hierarchy layouts, interaction, other browsers, or cross-machine pixel equality.

## Install and doctor
```text
pnpm add d3
pnpm vcr doctor
```

Install D3 in the selected project or example. The fixture used the browser bundle at `node_modules/d3/dist/d3.min.js`. Doctor reports environment availability; it does not prove the project's package resolves or that a D3 scene works.

## Smoke test
```text
./run.sh
# expect: d3-capture: OK
```

After `vcr example create d3-capture`, change to the destination it prints and run the command above. The fixture captures 90 transparent 1280×720 frames at 30 fps and checks shuffled capture against sequential capture. Its tested versions and exact scope are in the example README and the tool's evidence record.

## Scene contract
Expose `window.__scene = { duration, seek(t) }`. Make `seek(t)` set every animated value from `t`; don't accumulate deltas between calls. The fixture schedules the SVG update with `requestAnimationFrame` so capture can observe the painted frame.

## Recipe: interpolate values, then draw
```js
const start = [30, 55, 20, 70, 45, 60];
const end   = [80, 25, 65, 40, 75, 35];
const duration = 3;

function draw(t) {
  const progress = t / duration;
  const values = start.map((value, i) => d3.interpolate(value, end[i])(progress));
  bars.data(values).join('rect')
    .attr('y', value => y(value))
    .attr('height', value => y(0) - y(value));
}

window.__scene = {
  duration,
  seek(t) { requestAnimationFrame(() => draw(t)); }
};
```

The fixture uses `scaleBand` for category positions and bar widths, `scaleLinear` for value-to-pixel mapping, `axisBottom`/`axisLeft` for labels, and `line()` for a path. Keep the data domain, dimensions and data order explicit so a requested time always produces the same geometry.

## Capability map
D3 is a set of modular libraries. The [official API index](https://d3js.org/api) lists the functions and types in each module; follow it for exact signatures and options.

- **Charts and geometry:** axes, chords, colours, contours, Delaunay/Voronoi, geographic projections and paths, hierarchies, paths/polygons, scales, colour schemes and shapes.
- **DOM and interaction:** selections and data joins, brushes, drag, zoom and event dispatch.
- **Animation:** easing, timers and transitions. These are available upstream, but the VCR fixture does not validate them; its clock rules below apply.
- **Data and time:** array operations and statistics, CSV/TSV parsing, fetching, number formatting, random distributions, time intervals and time formatting.

The package exposes all these areas, but this guide's VCR evidence covers only SVG axes, scales, shapes and interpolation in a seekable chart. Discoverability is not a claim that other modules have been tested in VCR.

## Clock rules
- Compute progress directly from `t / duration`; clamp it to `[0, 1]` if capture may request times outside the scene interval.
- Avoid `selection.transition()`, `d3.timer()` and wall-clock reads in `seek`. They advance independently of the requested capture time.
- Do not rely on retained values from an earlier seek. Capture may request frames out of order.
- The fixture's `requestAnimationFrame` is a paint handoff, not the motion clock. All values are derived before drawing from the requested `t`.

## Troubleshooting
The validated fixture passed without D3-specific failures. It has not established fixes for other D3 versions, browsers or scene structures.

## Official docs
- [D3 API reference](https://d3js.org/api)
- [d3-scale](https://d3js.org/d3-scale)
- [d3-shape](https://d3js.org/d3-shape)
- [d3-axis](https://d3js.org/d3-axis)
