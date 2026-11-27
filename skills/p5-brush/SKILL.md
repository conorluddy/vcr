---
name: p5-brush
description: Add pencil, charcoal, marker, watercolour-style fills, hatching and flow-field strokes to a p5.js scene with p5.brush, redrawn from scratch per seek so it captures deterministically. Load once p5.brush has been chosen for a hand-drawn look.
---

# p5.brush

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- A hand-drawn, pencil, charcoal or watercolour look on a p5 WEBGL canvas, captured with alpha through the `packages/capture` route.
- Marks accumulate and cannot be undone, so each seek clears and redraws everything.
- Slow: about 4 to 6 frames per second at 1280x720 including the determinism re-run. Keep scenes short or shapes few.
- No media look needed: `p5-js` alone. Sketchy outlines only: `rough-js`. Plotter paths: `vsketch` or `vpype`.
- VCR evidence covers p5.brush 3.3.0 on p5 2.3.4, one seed, macOS arm64. Everything else is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Brushes: `set`, `box`, `add` (custom, image tips) | [README](https://github.com/acamposuribe/p5.brush#readme) | `charcoal`, `2B`, `marker` tested; `add` untested |
| Fills and washes: `fill`, `bleed`, `wash` | README | `fill` tested |
| Hatching: `hatch`, `hatchStyle` | README | `hatch` tested; `hatchStyle` untested |
| Vector fields: `field`, `addField`, `flowLine` | README | built-in `curved` field and `flowLine` tested |
| Primitives: `line`, `rect`, `circle`, `polygon`, `spline` | README | `circle`, `rect` tested |
| Buffers and framebuffers: `brush.load(target)` | README | untested |
| Standalone build `p5.brush/standalone` (no p5) | README | untested |

## Install and doctor
```sh
pnpm add p5.brush@3.3.0 p5
```
A project-local library: `vcr doctor` does not probe it. The p5 build needs p5 `^2.2` as a peer.

## Smoke test
```sh
cd examples/p5-brush-hatching && ./run.sh
# expect: frame 0000 alpha min=0 max=1 (and frames 0030, 0060), then p5-brush-hatching: OK (~5 fps)
```
The fps figure varies by machine; the OK line is the check.

## Scene contract
Same as `p5-js` (`window.__scene = { duration, seek }`, `noLoop()`), plus WEBGL and instance mode:
```html
<script src="./node_modules/p5/lib/p5.min.js"></script>
<script src="./node_modules/p5.brush/dist/p5.brush.js"></script>
```
```js
new p5((sketch) => {
  brush.instance(sketch);                       // required in instance mode, before setup
  sketch.setup = () => {
    sketch.createCanvas(innerWidth, innerHeight, sketch.WEBGL); sketch.pixelDensity(1); sketch.noLoop();
    window.__scene = { duration: 3, seek: (t) => requestAnimationFrame(() => { window.__sceneTime = t; sketch.redraw(); }) };
  };
  sketch.draw = () => {
    sketch.clear();
    sketch.randomSeed(SEED); sketch.noiseSeed(SEED); brush.seed(SEED); brush.noiseSeed(SEED);
    // origin is the canvas centre; draw from window.__sceneTime
  };
});
```
- Call p5's own `sketch.redraw()` from `seek`; do not replace `redraw` and call `draw` by hand. A first attempt that did was not deterministic.
- Reset all four seeds every frame. The README says `randomSeed`/`noiseSeed` also seed the library, but the passing run used both pairs; which is necessary was not isolated.
- Origin is the centre (WEBGL). `hatch(dist, angle)` angle is in radians by default.

## Recipe
```js
brush.noField(); brush.noHatch();
brush.fill("#e8a33d", 90); brush.hatch(14, 0.8 + t * 0.3);
brush.set("charcoal", "#f4efe6", 1); brush.circle(-260, 0, 150);
brush.noHatch(); brush.noFill(); brush.field("curved");
brush.set("2B", "#c7f36b", 1.6); brush.flowLine(60, -240, 120 + t * 40, 90);
```
Reset state (`noField`, `noHatch`, `noFill`) at the top of each frame so nothing leaks between seeks.

## Troubleshooting
- `hatch() angle must be finite` and shuffled order differing from sequential: seen with a hand-called `draw` and only p5 seeds; fixed as above.
- Slow frames: expected; see limits.

## Official docs
- [p5.brush repository and README](https://github.com/acamposuribe/p5.brush)
- [p5.brush on npm](https://www.npmjs.com/package/p5.brush)
