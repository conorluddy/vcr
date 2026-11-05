---
name: web-animations-api
description: Drive native element.animate() animations, paused and seeked via currentTime, as deterministic browser scenes for VCR capture, with no library. Use once the Web Animations API has been chosen for simple DOM or SVG motion without a dependency.
---

# Web Animations API

Native browser animation with no library: every animation is created paused and positioned by setting `currentTime` from the harness. Evidence: Chromium 156.0.8078.4 on macOS arm64 (`examples/waapi-capture`, 2026-11-05). Anything beyond that fixture is marked untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Proven: CSS transform keyframes, SVG line drawing via `stroke-dashoffset`, staggered opacity and translate with `delay`, all captured with alpha.
- Untested here: CSS animations and transitions found through `document.getAnimations()`, `ScrollTimeline` and `ViewTimeline`, `commitStyles`, composite modes, browsers other than Chromium.
- No timeline object, labels or nesting: you keep the list of animations yourself. For orchestration use `gsap`; for a small library with timelines and SVG helpers use `anime-js`.

## Install and doctor
Nothing to install beyond the capture browser: `vcr setup capture --yes` once per machine, then `vcr doctor`. Evidence is tied to the Chromium version that ran, so record it with any new evidence.

## Smoke test
```text
vcr capture examples/waapi-capture/scene.html --width 1280 --height 720 --fps 30 --verify
# expect: captured 90 frames to …/output/frames (… fps); shuffled matches sequential: true
```
In the VCR repository, `examples/waapi-capture/run.sh` also asserts frame 45 alpha against `expected/summary.json` and prints `waapi-capture: OK`.

## Scene contract
```js
const animations = [];
const add = (target, keyframes, options) => {
  const animation = target.animate(keyframes, { fill: "both", ...options });
  animation.pause();                       // never let the document timeline drive it
  animations.push(animation);
};
add(square, [{ transform: "rotate(0deg) scale(1)" }, { transform: "rotate(360deg) scale(0.6)" }], { duration: 3000, easing: "ease-in-out" });
const durationMs = Math.max(...animations.map((a) => a.effect.getComputedTiming().endTime));
window.__scene = { duration: durationMs / 1000, seek: (t) => { for (const a of animations) a.currentTime = t * 1000; } };
```
- Pause each animation as soon as it is created, then only ever set `currentTime`. Times are milliseconds; the harness speaks seconds.
- `fill: "both"` holds the first and last states, so seeking before a `delay` or past `endTime` is well defined.
- Take the scene duration from `getComputedTiming().endTime`, which includes delays.

## SVG line drawing
Set `stroke-dasharray` to the path length once, then animate `strokeDashoffset` from that length to 0:
```js
const length = line.getTotalLength();
line.style.strokeDasharray = length;
add(line, [{ strokeDashoffset: length }, { strokeDashoffset: 0 }], { duration: 2000, easing: "linear" });
```

## Troubleshooting
- `--verify` reports a shuffled mismatch: see [Determinism pitfalls](../start/references/determinism.md). The anime-capture compositor mismatch did not reproduce here when `will-change` was removed (one run only), but the fixture keeps `will-change: transform, opacity` on opacity-animated elements as a precaution.
- An element jumps to its unanimated state before its delay: `fill` is missing or set to `forwards`; use `"both"`.

## Official docs
- Web Animations API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- Element.animate(): https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
- Animation.currentTime: https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime
