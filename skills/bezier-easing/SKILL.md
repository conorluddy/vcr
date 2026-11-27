---
name: bezier-easing
description: Use bezier-easing to evaluate a CSS cubic-bezier(x1, y1, x2, y2) curve as a plain function of t in Node or a seeked scene. Load when a published easing curve must drive canvas, WebGL or computed values and match CSS; use a tween library for timelines.
---

# bezier-easing

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- One function: `BezierEasing(x1, y1, x2, y2)` returns `f(t)` for t in [0, 1]. No clock, no tween, no DOM.
- In VCR it lets a seeked canvas or Node layer use the same curve as a CSS transition or a Material or Carbon token (see `vcr refs section motion-director` for the published values).
- It cannot do springs, bounces or `linear()` stop lists; use `motion` or `react-spring`. For DOM or SVG timelines use `anime-js`. In a browser scene, a WAAPI easing string needs no library.
- VCR evidence: six curves against Chromium 156 on macOS arm64, Node 22. Everything else below is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `BezierEasing(x1, y1, x2, y2)` returning `f(t)` | [README](https://github.com/gre/bezier-easing#readme) | tested |
| Control-point validation (x outside [0, 1] throws) | [README](https://github.com/gre/bezier-easing#readme) | untested |
| Browser bundle, TypeScript types | [README](https://github.com/gre/bezier-easing#readme) | untested |

## Install and doctor
```sh
pnpm add bezier-easing@3.2.0
```
A project-local library: `vcr doctor` does not probe it.

## Smoke test
```sh
cd examples/bezier-easing-css-match && ./run.sh
# expect: OK: bezier-easing-css-match
```
Evaluates six curves at 101 points, reads Chromium's computed progress for the same strings through WAAPI, requires a difference of at most 0.002 (observed 5e-6), and diffs a summary against `expected/summary.json`.

## Recipe: eased value in a seeked scene
```js
import BezierEasing from 'bezier-easing';
const emphasizedDecelerate = BezierEasing(0.05, 0.7, 0.1, 1); // Material 3
const x = (t) => startX + (endX - startX) * emphasizedDecelerate(clamp01((t - delayS) / durationS));
```
- Build each easing once, outside the frame loop; call it with a clamped, normalised t.
- y may leave [0, 1] (the tested `0.34, 1.56, 0.64, 1` peaks at 1.098); x must stay in [0, 1].
- Match is numeric, not bit-identical (about 1e-6 here): do not diff a canvas frame against a CSS capture byte for byte.

## Troubleshooting
- No failures were seen in the fixture.
- Untested: an x control point outside [0, 1] is documented to throw.

## Official docs
- [bezier-easing](https://github.com/gre/bezier-easing)
- [CSS Easing Level 2](https://www.w3.org/TR/css-easing-2/)
