---
name: pts
description: Make geometry-first 2D sketches with Pts point, group, line, polygon and interpolation utilities. Load when geometric computation is central; use p5.js for its broader sketch ecosystem or Paper.js for editable paths and booleans.
---

# Pts

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Pts offers geometry and vector math with Canvas and SVG spaces. For deterministic capture, compute and draw explicitly from the supplied time instead of starting `Space.play()`.
- The 1.0.3 fixture exercises Pt, Group, Line, Polygon, Circle, Create.radialPts and CanvasForm on a CanvasSpace bound to an existing canvas. SVG/DOM spaces, interactions, animation callbacks and random helpers are untested; seed random-based functions explicitly. Use p5.js for a larger sketch community, or Paper.js for path editing and booleans.

## Capability map
- Geometry primitives and collections: `Pt`, `Group`, `Line`, `Polygon`, `Circle`, `Geom` ([Pts guide index](https://ptsjs.org/guide/)). Fixture exercises selected primitives and interpolation.
- Spaces and drawing: `CanvasSpace`, `SVGSpace`, forms and quick start ([Space guide](https://ptsjs.org/guide/Space-0500), [Get started](https://ptsjs.org/guide/Get-started-0100)). Fixture exercises CanvasSpace and CanvasForm; SVG and DOM are untested.
- Creation, interpolation, noise and animation utilities ([Pts guide index](https://ptsjs.org/guide/)). Fixture exercises `Create.radialPts` and `Geom.interpolate`; noise, random helpers, physics and interaction are untested.

## Install and doctor
```sh
pnpm add pts
vcr doctor
```
Evidence used Pts 1.0.3, Playwright 1.64.1 and Chromium 156 on macOS arm64. `doctor` reports availability; it does not install Pts.

## Smoke test

```sh
vcr example create pts-capture
```
Change to the destination printed by the command, install its example dependencies, and run:
```sh
pnpm install
./run.sh
# expect: pts-capture: OK
```
## Scene contract
Expose `window.__scene = { duration, seek }`. The fixture waits for CanvasSpace readiness before exposing it, clears and draws explicitly per seek, and does not call `space.play()`. Compute all changing geometry from `t`; seed any random utility before use.

## Troubleshooting
- First frames disappear or shuffled hashes differ: do not expose the scene until the canvas-bound `CanvasSpace` ready callback has run; readiness resizes and clears the canvas.
- Unexpected variation: inspect use of `Num.random` and related helpers; give them an explicit seed or derive geometry directly from `t`.

## Official docs
- [Pts documentation](https://ptsjs.org/) (fixture used 1.0.3)
- [Get started](https://ptsjs.org/guide/Get-started-0100) · [Space](https://ptsjs.org/guide/Space-0500) · [Guide index](https://ptsjs.org/guide/)
