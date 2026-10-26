---
name: vcr-p5-js
description: Generative and procedural 2D and WebGL visuals with p5.js, written as a pure function of time and seed so they capture deterministically. Use for backgrounds, particle fields, noise textures, data-driven abstracts and sketch-style motion.
---

# p5.js

Creative-coding library. In VCR a sketch never runs its own loop: `noLoop()`, then the harness asks for time t and the sketch draws exactly that frame.

## Use cases and limits
- Procedural backgrounds, particles, flow fields, noise-driven shapes, quick 2D experiments, simple WebGL.
- Over Pts or canvas-sketch when you want the broadest API and the most examples; over Three.js only when the 3D is incidental.
- Not for text layout, vector export or complex scene graphs. SVG output needs the p5.svg community renderer, unverified here.
- Licence LGPL-2.1: linking from an app is fine; modifying p5 itself carries obligations.

## Install and doctor
```text
pnpm add p5
ls node_modules/p5/lib/p5.min.js   # the UMD bundle; the exports map hides it from require.resolve
```
Validated p5 2.3.4 with Chromium 156 via `examples/p5-capture`.

## Smoke test
```text
examples/p5-capture/run.sh
# expect: p5-capture: OK, alpha min 0 max 1, shuffled_matches_sequential true
```

## Draw loop and seeding
```js
new p5((sketch) => {
  sketch.setup = () => { sketch.createCanvas(1280, 720); sketch.pixelDensity(1); sketch.noLoop();
    window.__scene = { duration: 3, seek: (t) => requestAnimationFrame(() => sketch.redraw(t)) }; };
  sketch.redraw = (t) => { window.__sceneTime = t; sketch.draw(); };
  sketch.draw = () => { const t = window.__sceneTime; sketch.clear(); sketch.noiseSeed(7); sketch.randomSeed(7); /* draw from t */ };
});
```
- `noLoop()` in setup; `pixelDensity(1)` so output size equals canvas size.
- Reset `noiseSeed` and `randomSeed` at the top of every draw. Then any frame is the same whether reached in order or by jumping.
- `frameCount`, `millis()` and `deltaTime` are forbidden in VCR scenes: they are clocks.
- Schedule the draw on `requestAnimationFrame` from `seek`; a synchronous canvas draw inside the harness's evaluate can block on the compositor.

## 2D drawing
- `clear()` keeps the canvas transparent; `background()` fills it. VCR scenes clear, so alpha survives to ProRes 4444.
- `push()`/`pop()` around every transform; `translate` then `rotate` then `scale`, in that order, for predictable results.
- Colour with `colorMode(HSB, 360, 100, 100, 100)` when sweeping hue over time; keep alpha in the fourth argument.

## WebGL mode
- `createCanvas(w, h, WEBGL)` moves the origin to the centre; wrap 2D drawing in `translate(-width/2, -height/2)`.
- Lights and materials are per draw: set them every frame, since every frame starts from nothing.
- WebGL text needs `loadFont` with a file shipped in the project; system fonts do not load in WEBGL mode.

## Noise
- `noise(x, y, t)` with a seeded `noiseSeed` is the deterministic motion source of choice; scale inputs (`i * 0.13`) rather than outputs.
- `noiseDetail(octaves, falloff)` changes the character globally; set it once in setup and record it in the scene's parameters.
- Loops: sample noise around a circle (`cos(a) * r, sin(a) * r`) so the last frame meets the first.

## Capture
`@vcr/capture` with `sceneFile` (the harness serves the directory, so `<script src="./node_modules/p5/lib/p5.min.js">` resolves). Screenshot mode; 1280x720 runs at roughly 12 frames per second including the determinism re-run.

## Troubleshooting
- Blank frames: `noLoop()` missing so the harness and p5's loop fight, or `background()` with alpha 0 instead of `clear()`.
- Frames differ between orders: a seed is set in setup instead of draw, or `random()` is called before the seed.
- `require.resolve("p5/lib/...")` throws: the package exports map; reference the file by path or serve it.

## Official docs
https://p5js.org/reference/ · https://p5js.org/reference/p5/noiseSeed/ · https://p5js.org/reference/p5/noLoop/
