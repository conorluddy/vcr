---
name: canvas-2d
description: Draw browser canvas 2D scenes redrawn as a pure function of time and seed (gradients, arcs, paths, loaded-font text) and capture them deterministically for VCR, with no library. Use once plain canvas 2D has been chosen for raster motion graphics without a dependency.
---

# Canvas 2D

Immediate-mode drawing with no library: `seek(t)` clears the canvas and redraws everything from `t` and a fixed seed. Evidence: Chromium 156.0.8078.4 on macOS arm64 (`examples/canvas2d-capture`, 2026-11-05). Anything beyond that fixture is marked untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Proven: linear gradients fading to transparent, arcs, filled and stroked paths, many small seeded shapes, text in a loaded font, all captured with alpha.
- Untested here: `drawImage` and images, `getImageData` and pixel access, `globalCompositeOperation` modes, filters, `OffscreenCanvas`, `devicePixelRatio` above 1, system fonts.
- No scene graph or easing: you write the maths. For generative sketches with helpers use `p5-js`; for DOM or SVG elements use `gsap` or `web-animations-api`.

## Install and doctor
Nothing to install beyond the capture browser: `vcr setup capture --yes` once per machine, then `vcr doctor`. Evidence is tied to the Chromium version that ran.

## Smoke test
```text
vcr capture examples/canvas2d-capture/scene.html --width 1280 --height 720 --fps 30 --verify
# expect: captured 90 frames to …/output/frames (… fps); shuffled matches sequential: true
```
In the VCR repository, `examples/canvas2d-capture/run.sh` also asserts frame 45 alpha and prints `canvas2d-capture: OK`.

## Scene contract
```js
function drawFrame(t) {
  const random = createSeededRandom(SEED);   // recreated every frame: same sequence whatever came before
  context.clearRect(0, 0, canvas.width, canvas.height);
  // … draw everything from t and random()
}
async function start() {
  const font = new FontFace(FONT_FAMILY, "url(./fonts/Face.ttf)", { weight: "700" });
  document.fonts.add(await font.load());
  await document.fonts.ready;
  if (!document.fonts.check(`700 64px "${FONT_FAMILY}"`)) throw new Error("font did not load");
  window.__scene = { duration: DURATION, seek: drawFrame };
}
start();
```
- Clear and redraw everything on every seek; never draw incrementally on top of the previous frame.
- Create the PRNG inside the draw function with a fixed seed. A shared PRNG, or `Math.random`, makes the frame depend on history: swapping in `Math.random` made all 90 frames mismatch.
- Expose `window.__scene` only after the font has loaded and `document.fonts.check` confirms it. Whether capture fails without the wait was not tested; keep it.
- Size the canvas from the viewport once, before the first draw. Leave the background unpainted for alpha.

## Seeded randomness
The fixture uses mulberry32; any small seeded generator works as long as it is recreated per frame. See `createSeededRandom` in `examples/canvas2d-capture/scene.html`.

## Troubleshooting
- `--verify` reports a shuffled mismatch: check for a PRNG or other state that survives between draws, then see [Determinism pitfalls](../start/references/determinism.md).
- Text renders in a fallback face in early frames: `window.__scene` was exposed before the font loaded.
- Fonts: commit only fonts whose licence allows redistribution, with the licence beside them (the fixture keeps `fonts/OFL.txt`).

## Official docs
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- CanvasRenderingContext2D: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
- FontFace: https://developer.mozilla.org/en-US/docs/Web/API/FontFace
