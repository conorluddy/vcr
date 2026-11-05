---
name: two-js
description: Drive Two.js SVG geometry from requested time and capture transparent frames. Use for small procedural vector scenes after selecting Two.js; not path booleans or object editors.
---

# Two.js

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run from the workspace holding vcr.json.

## Use cases and limits

Proven: Two.js 0.8.24 SVG renderer, geometric primitives and transforms assigned from time, captured to alpha PNGs on macOS arm64 with Chromium156.0.8078.4 / Playwright1.64.1. No shared timeline or adapter is implied. Use Paper.js for path booleans, Konva for interactive objects, PixiJS for GPU-heavy effects. Canvas/WebGL renderers, SVG import/export, fonts, event handling and cross-platform equality are untested here.

## Install and doctor

Inspect `vcr tools examples two-js`, then `vcr doctor`. For a selected workspace install `pnpm add --save-exact two.js@0.8.24`. Capture needs an available Playwright/Chromium runtime (`vcr setup capture` when missing). This guide does not claim any dependency is installed. The tested fixture uses Node22.19.0 and ImageMagick7.1.2-15 for alpha probes.

## Smoke test

```text
vcr example create twojs-capture
cd examples/twojs-capture
pnpm install
vcr capture scene.html --width 1280 --height 720 --fps 30 --verify
# expect: 90 frames; shuffled_matches_sequential: true
```

Inside the repository the evidence recipe is `./examples/twojs-capture/run.sh` after `pnpm install`.

```text
# expect: twojs-capture: OK (<measured> fps)
```

Throughput varies; only measurements and invariants in expected/summary.json are compared.

## Scene contract

Create an SVG renderer with fixed dimensions and `autostart:false`. Keep native scene code editable. The fixture assigns every animated value directly from t and calls update once; it never relies on accumulated frameCount/timeDelta or calls play().

```js
const two = new Two({ type: Two.Types.svg, width: 1280,
  height: 720, autostart: false }).appendTo(document.body);
const square = two.makeRectangle(360, 360, 150, 150);
function seek(t) {
  square.rotation = t * Math.PI / 3;
  square.scale = 0.8 + 0.2 * Math.cos(t * 2);
  two.update();
}
seek(0);
window.__scene = { duration: 3, seek };
```

No fonts or external assets are used. Retain a transparent HTML/body background for alpha. Content geometry and colour choices are separate from time-derived motion; production placement belongs to the consumer.

## Feedback loop

The fixture captures sequentially and in shuffled order, asserts equality, changing frame hashes,90 frames at1280x720 and alpha0..1 at frame45 before allowing --record. It then diffs expected/summary.json. Inspect actual frames at native scale; a diff alone cannot catch wrong artwork. Evidence includes inspection of frames0/45/89. Output PNGs and logs stay in ignored output/.

## Troubleshooting

No library or rendering failures occurred in this fixture. For changed output, inspect frames and rerun the recipe before deliberately recording a new baseline. A shuffled mismatch fails run.sh: remove clock-dependent logic and derive transforms from t; do not bless a mismatch as expected output. Runtime upgrades need new scoped evidence; equality on another OS/backend is untested.

## Official docs

- [Two API, identifying v0.8.24](https://two.js.org/docs/two/): renderer selection, autostart, update.
- [0.8.24 source](https://github.com/jonobr1/two.js/tree/v0.8.24).
- [0.8.24 MIT licence](https://github.com/jonobr1/two.js/blob/v0.8.24/LICENSE), checked 2026-11-05. Runtime/dependency and redistribution terms remain separate assessments.
