---
name: easeljs
description: "Unproven in VCR: EaselJS is a demoted legacy CreateJS canvas display list with no npm release since 2017, so prefer konva, pixijs or canvas-2d for new scenes."
---

# EaselJS (unproven)

Documentation-only, untested in VCR. Written from official docs; nothing here has been run.

## Status
- Demoted. Assessed 2026-10-26 (assess-a1), npm 1.0.2, last release 2017-09-18. Rationale: "No npm release since 2017-09-18 (1.0.2); repo's latest commit is a minor touch fix on 2026-01-24. Konva covers Canvas scene graphs and PixiJS the GPU case, so incremental value is limited to legacy CreateJS content."
- Not tested: no fixture, no evidence.
- Worth it only to render an existing CreateJS or Adobe Animate canvas export, or a codebase already built on EaselJS and TweenJS.

## Use cases and limits
- Canvas 2D display list in the Flash style, driven by `createjs.Ticker`. A limited `StageGL` WebGL mode exists.
- No modern TypeScript types or ESM story; sporadic commits only.
- Use instead: `konva` (Canvas scene graph), `pixijs` (GPU), `canvas-2d` (no library), `anime-js` or `tween-js` for tweening instead of TweenJS.

## Capability map (official README, untested)
- `Stage` root (`stage.update()` or `tick()` redraws), `Container`, `Shape` (with `graphics`), `Bitmap`, `Text` (single line), `Ticker`.
- Pairs with TweenJS and PreloadJS in the CreateJS suite. Docs: https://createjs.com/docs/easeljs/

## Install
```text
pnpm add easeljs
```
The README gives no install steps; the npm package name is from the catalogue record. The createjs.com page was a stub when assessed, so GitHub is the practical reference. Global is `createjs`.

## Recipe (documentation-only, untested in VCR)
```js
const stage = new createjs.Stage("c");
const shape = new createjs.Shape();
shape.graphics.beginFill("red").drawRect(0, 0, 120, 120);
stage.addChild(shape);
window.__scene = { duration: 3, seek: (t) => { shape.x = 200 * (t / 3); stage.update(); } };
```

## Determinism and seek concerns for VCR capture
- Its `Ticker` runs on real time (rAF or timer). Never let it drive frames: add no `tick` listener and call `stage.update()` yourself inside `seek(t)`.
- TweenJS tweens advance on the ticker; if used, seek them explicitly (`tween.setPosition(ms)`, unverified) instead of relying on playback.
- Animate exports usually start their own ticker and timeline; they would need wrapping so `seek` sets the timeline position. Untested.
- Load images and fonts before the first `update()`.

## Licence
MIT.

## Official links
- https://github.com/CreateJS/EaselJS
- https://createjs.com/easeljs
- https://www.npmjs.com/package/easeljs
