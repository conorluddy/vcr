---
name: paper-js
description: Use Paper.js for browser scenes that need editable vector paths and path geometry. Load when boolean path operations or Bezier curve work matter; VCR's evidence covers only a seek-driven Canvas scene.
---

# Paper.js

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Author and compute vector scene geometry with paths, segments and curves. The validated VCR use captures Canvas output in Chromium; Paper.js itself is the scene library, not a VCR timeline or renderer.
- For interactive event-driven scenes use [Konva](../konva/SKILL.md); for GPU sprite scenes use PixiJS. For animated SVG timelines, use Anime.js with SVG.
- Evidence covers Paper.js 0.17.0's JavaScript API, a smoothed path, boolean union, radial gradient, explicit view update and alpha PNG capture on macOS arm64 / Chromium 156. It does not validate the broader API map below.

## Install and doctor
```sh
pnpm add paper
node -e "console.log(require('paper/package.json').version)"
```
The evidence run used Paper.js 0.17.0. Check availability with `vcr doctor`; a guide or catalogue entry does not mean it is installed.

## Smoke test
After `vcr example create paperjs-capture`, change to the destination it prints and run:
```sh
./run.sh
# expect: paperjs-capture: OK
```
Validated on macOS arm64 with Node 22.19.0, Playwright 1.64.1 and Chromium 156.0.8078.4. Exact fixture output is 90 frames at 1280×720; all shuffled hashes match sequential, and frame 45 alpha spans 0–1.

## Scene contract
Paper.js has its own `paper.view` update behavior; keep visual state a function of seek time and redraw explicitly when automatic updates are disabled. The tested pattern is:

```js
paper.setup(canvas);
paper.view.autoUpdate = false;
window.__scene = {
  duration: 3,
  seek(t) {
    requestAnimationFrame(() => {
      drawAt(t);                 // set every changing property from t
      paper.view.update(true);   // force redraw, including unchanged items
    });
  },
};
```
Do not use `view.onFrame` or wall-clock state for this seek-driven pattern. The harness controls `seek(t)`; VCR does not supply a Paper.js adapter or shared timeline.

## Capability map
These are API areas documented by Paper.js, not claims of VCR validation. Only the path construction/smoothing, `PathItem.unite()`, color gradient, Canvas view setup and explicit redraw exercised in the smoke-test scene have fixture evidence.

| API area | Start here | Status in VCR evidence |
| --- | --- | --- |
| Scope, setup and JavaScript access | [Global reference](https://paperjs.org/reference/) | `paper.setup()` used; other scope patterns untested |
| Paths, segments and curves | [Path](https://paperjs.org/reference/path/) | Path, segment point edits and `smooth()` tested; other curve operations untested |
| Boolean operations, geometry and hit testing | [PathItem](https://paperjs.org/reference/pathitem/) | `unite()` tested; other booleans, intersections, offsets, flattening and hit testing untested |
| Project, layers, groups and items | [Project](https://paperjs.org/reference/project/), [Item](https://paperjs.org/reference/item/) | Setup creates project; grouping and other hierarchy operations untested |
| Canvas view and redraw | [View](https://paperjs.org/reference/view/) | `autoUpdate` and `update(true)` tested; events, transforms and resize untested |
| Colors and gradients | [Color](https://paperjs.org/reference/color/) | Radial fill gradient tested; other color modes untested |
| SVG import/export | [Project](https://paperjs.org/reference/project/) | Untested |
| PaperScript language integration | [PaperScript](https://paperjs.org/tutorials/getting-started/using-javascript-directly/) | Untested; fixture uses JavaScript |

## Tested recipe
For deterministic capture, disable automatic view redraw, derive geometry and styles from `t`, and request one explicit redraw per seek. The fixture updates a control point and smooths its path, rebuilds a boolean union, then moves and recolors a radial-gradient circle. See [`examples/paperjs-capture/scene.html`](../../examples/paperjs-capture/scene.html) for the complete tested scene.

## Troubleshooting
- Blank or stale frames: when `view.autoUpdate` is false, call `paper.view.update(true)` after setting scene state. `update()` may skip work if no item changed.
- Shuffled capture mismatch: remove `view.onFrame`, clocks and unseeded randomness; assign each animated property from the requested `t` before updating the view.

## Official docs
[Paper.js reference](https://paperjs.org/reference/) · [Getting started](https://paperjs.org/tutorials/getting-started/)
