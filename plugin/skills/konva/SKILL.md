---
name: konva
description: Draw small layered Konva Canvas 2D scenes from an explicit capture time. Load after selecting Konva for a vector scene graph; covers the tested manual draw route rather than interaction or editor UI.
---

# Konva

`vcr` means `node <plugin-root>/cli/vcr.mjs`, with plugin root two directories above this SKILL.md; inside this repository it is `pnpm vcr`.

## Use cases and limits
Evidence: Konva 10.9.0, Chromium 156.0.8078.4 via Playwright 1.64.1 on macOS arm64, 2026-11-05. The fixture proves two layers, group transforms, shape opacity and transparent capture. It establishes no shared timeline or adapter.

Interaction, tweens, caching, filters, framework bindings, Node rendering and export APIs are untested here. Use PixiJS for GPU sprite/filter work, Fabric.js for SVG round trips, and GSAP for timeline orchestration; these neighbour routes need their own evidence.

## Install and doctor
Install the fixture dependencies with `pnpm install` inside the VCR repository. For a selected standalone project, pin `pnpm add konva@10.9.0`. Run `vcr doctor` to check machine availability; a guide does not establish installation. Browser capture additionally needs the capture runtime (`vcr setup capture`). Do not infer Node canvas backend support from this browser fixture.

## Smoke test
```sh
examples/konva-capture/run.sh
# expect: konva-capture: OK
```
This repository command requires ImageMagick and the pnpm workspace. Outside the repository, scaffold with `vcr example create konva-capture`, install the printed dependencies, and use the printed capture command with verification enabled.

## Scene contract
Disable automatic redraw, set every animated property from absolute time, then draw explicitly on the requested animation frame:
```js
Konva.pixelRatio = 1;
Konva.autoDrawEnabled = false;
window.__scene = {
  duration: 3,
  seek(t) {
    requestAnimationFrame(() => {
      group.rotation(t * 120); // degrees, t is seconds
      group.scale({ x: 0.8 + 0.2 * Math.cos(t * 2),
                    y: 0.8 + 0.2 * Math.cos(t * 2) });
      stage.draw();
    });
  }
};
```
Create the stage and layers once before exposing the scene. The fixture uses `listening:false` on its two layers and no animation loop, assets, fonts or randomness. Each Layer owns a canvas. The documented default clears it before drawing. Preserve that default to prevent trails. `batchDraw()` schedules work for a later tick; this fixture uses explicit `draw()` to make capture timing clear.

## Feedback loop
`run.sh` records a report in ignored `output/`, asserts 90 frames at 1280×720, changing frame hashes, shuffled equality and frame-45 alpha range 0–1, then diffs `expected/summary.json`. Inspect frames at intended size as well. `--record` updates expectations only after a deliberate source/runtime change; invariants remain checked before recording. Pixel equality is scoped to one runtime and frame order, not different machines.

## Troubleshooting
No fixture defect was observed in the two validation runs. If a future run fails shuffled equality, compare property state after different seek histories, then bisect animated properties using [determinism guidance](../start/references/determinism.md). Avoid incremental `rotate()` or position deltas in seek: assign absolute values. For blank output, check the script URL, container size and explicit draw path before re-recording expected data.

## Official docs
- Layer API (live documentation, checked 2026-11-05): https://konvajs.org/api/Konva.Layer.html
- Tested release source: https://github.com/konvajs/konva/tree/10.9.0
- MIT licence for tested release: https://github.com/konvajs/konva/blob/10.9.0/LICENSE
