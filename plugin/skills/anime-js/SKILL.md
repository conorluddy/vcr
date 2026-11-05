---
name: anime-js
description: Author seekable Anime.js v4 timelines (transform tweens, SVG line drawing, stagger) for browser-rendered VCR scenes and capture them deterministically frame by frame. Use once Anime.js has been chosen over GSAP for light DOM or SVG motion.
---

# Anime.js

A small v4 timeline driven by the harness: built with autoplay off, seeked in milliseconds, never left to run on its own clock. Evidence: 4.5.0 on macOS arm64 with Chromium 156.0.8078.4 (`examples/anime-capture`, 2026-11-05). Everything below beyond that fixture is marked untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Proven: CSS transform tweens, SVG line drawing with `svg.createDrawable`, staggered opacity and translate, all on one timeline, captured with alpha.
- Untested here: springs, morphing (`svg.morphTo`), motion paths, `animate()` outside a timeline, text splitting. Check them with a fixture before relying on them.
- Nested timelines with labels, or plugins like SplitText and MotionPath that are already validated: use `gsap`.
- v4 only. v3 snippets (`anime({...})`, `anime.timeline`) do not run on v4.

## Install and doctor
```text
pnpm add animejs@4.5.0
pnpm list animejs --depth 0
```
Load the UMD bundle in a plain scene: `node_modules/animejs/dist/bundles/anime.umd.min.js` defines a global `anime`. ESM is in `dist/modules`.

## Smoke test
```text
vcr setup capture --yes      # once per machine
vcr capture examples/anime-capture/scene.html --width 1280 --height 720 --fps 30 --verify
# expect: captured 90 frames to …/output/frames (… fps); shuffled matches sequential: true
```
In the VCR repository, `examples/anime-capture/run.sh` also asserts frame 45 alpha against `expected/summary.json` and prints `anime-capture: OK`.

## Scene contract
```js
const { createTimeline, stagger, svg } = anime;
const tl = createTimeline({ autoplay: false });
tl.add("#square", { rotate: 360, scale: 0.6, duration: 3000, ease: "inOut(2)" }, 0)
  .add(svg.createDrawable("#line"), { draw: ["0 0", "0 1"], duration: 2000, ease: "linear" }, 0)
  .add(".dot", { opacity: [0, 1], translateY: [-80, 0], duration: 600, delay: stagger(150), ease: "out(3)" }, 1000);
window.__scene = { duration: tl.duration / 1000, seek: (t) => { tl.seek(t * 1000); } };
```
- Anime.js times are milliseconds and the harness speaks seconds: convert in both directions. `tl.duration` is a property, not a method.
- `seek` must return nothing to the harness; keep the braces.
- No `loop: true`, `Date.now()` or unseeded randomness; everything is a function of `t`.

## Opacity and compositor layers
Give every element whose opacity is animated `will-change: transform, opacity` in CSS. Without it, Chromium promoted the staggered dots to compositor layers depending on seek history, which changed a neighbour's edge anti-aliasing by 2 px in frames 62 to 89 depending on frame order. The DOM values were identical; only the pixels differed. This comes from the renderer, so it probably applies to other libraries too, but that has not been tested.

## Troubleshooting
- Shuffled order differs but DOM values match: compositor layering; see the section above. Bisect by removing one tween at a time and rerunning with `--verify`.
- `anime is not defined`: the scene loaded the ESM build with a classic script tag; use the UMD bundle.
- Scene ends early or late: a seconds value went in as milliseconds, or the other way round.

## Official docs
- Documentation (v4): https://animejs.com/documentation
- Timeline: https://animejs.com/documentation/timeline
- SVG utilities: https://animejs.com/documentation/svg
- Releases: https://github.com/juliangarnier/anime/releases
