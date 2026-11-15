---
name: rough-js
description: Use Rough.js to add hand-sketched Canvas or SVG shapes to a browser scene. Load when the sketch appearance matters and you do not need a scene graph or animation system.
---

# Rough.js

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Add a hand-drawn appearance to 2D shapes and paths. Rough.js generates drawing instructions; Canvas or SVG renders them.
- In VCR, use it inside a browser scene and derive every frame from the requested time. It is not a scene graph, animation loop, or renderer. Use Two.js or Konva for interactive scene objects; use GSAP to animate SVG output.
- The recipe and validation below cover only Canvas on macOS arm64 with Rough.js 4.6.6. SVG, interaction, export, other browsers, and cross-platform byte equality are untested.

## Install and doctor
```sh
pnpm add roughjs
```
The fixture used 4.6.6. Check availability with `vcr doctor`.

## Smoke test
After `vcr example create roughjs-capture`, change to the destination it prints and run:
```sh
./run.sh
# expect: roughjs-capture: OK
```
Validated on macOS arm64 with Node 22.19.0, Rough.js 4.6.6, Playwright 1.64.1, and Chromium 156.0.8078.4 (2026-11-11). The fixture checks 90 1280×720 frames, shuffled/sequential equality, and alpha range 0–1 at frame 45.

## Main API map
These are the documented entry points; only the Canvas calls marked **fixture-tested** were exercised by VCR evidence.

| Area | Main surface | Status here |
| --- | --- | --- |
| Canvas | `rough.canvas(canvas)`; drawing methods include `line`, `rectangle`, `ellipse`, `path`, and other primitives | `rectangle`, `ellipse`, `path` fixture-tested |
| SVG | `rough.svg(svg)`; shape methods create SVG nodes | Untested |
| Generator | `rough.generator` creates serializable drawable descriptions; `toPaths(drawable)` returns SVG path instructions | Untested |
| Shape options | Per-shape options include `stroke`, `strokeWidth`, `fill`, `fillStyle`, `roughness`, `bowing`; pattern controls include `hachureGap` | Fixture uses stroke/fill, `fillStyle: 'hachure'` and `'solid'`, `roughness`, `bowing`, `strokeWidth`, `hachureGap` |

The tested scene creates `const sketch = rough.canvas(canvas)`, then calls `sketch.rectangle(...)`, `sketch.ellipse(...)`, and `sketch.path(...)` after clearing and redrawing the canvas from `t`. It supplies `seed: 7` for deterministic hachure jitter. Dots, cross-hatch, zigzag, and dashed fills are untested; the fixture notes these use unseeded `Math.random` in the bundled build, so avoid them in seekable captures unless determinism is independently established.

## Troubleshooting
- If shuffled capture differs from sequential capture, check for unseeded randomness and ensure the canvas is cleared and redrawn wholly from the supplied time on every seek.
- The fixture's command exits on frame count, dimensions, determinism, or alpha mismatch; inspect `examples/roughjs-capture/output/summary.json` and the captured frames.

## Official docs
- [Rough.js API wiki](https://github.com/rough-stuff/rough/wiki/Home) (Canvas and SVG entry points and shape methods; API documentation is the upstream wiki).
- [RoughGenerator](https://github.com/rough-stuff/rough/wiki/RoughGenerator) (drawable generation and path conversion).
- [Rough.js repository](https://github.com/rough-stuff/rough) (package formats and overview).
