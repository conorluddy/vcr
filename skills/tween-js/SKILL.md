---
name: tween-js
description: Use tween.js 25 for interpolating numeric object properties with explicit update times. Load for small, time-controlled tweens feeding canvas or 3D state; use Anime.js or another free timeline system for DOM/SVG animation and complex sequencing.
---

# tween.js

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Interpolate numeric properties on JavaScript objects and feed the result to a renderer such as Canvas 2D or Three.js. The caller owns rendering and the clock: pass explicit milliseconds to `update(time)` for reproducible state.
- tween.js is not itself a renderer. It has no DOM/SVG helpers. For DOM/SVG animation, labelled timelines or complex sequences, use Anime.js.
- The VCR fixture exercises `Group`, `Tween`, easing, chaining and yoyo in a Canvas 2D capture. It rebuilds and steps the group per seek because completed tweens leave the group and one large update crossing a yoyo boundary produced an incorrect position in a probe.

## Capability map

The official guide documents the wider v25 API. **VCR exercised:** explicit-time group updates with eased, chained and yoyo tweens. **Documented, not VCR-tested:** the remaining areas, including timeline composition, callbacks, pause/resume, custom interpolation, singleton use, and integrations with other renderers.

| Area | Official reference | VCR evidence |
| --- | --- | --- |
| Package and module exports | [Repository README](https://github.com/tweenjs/tween.js) | UMD browser build, 25.0.0 |
| Tween creation, start values and explicit updates | [User guide: animating](https://tweenjs.github.io/tween.js/docs/user_guide.html) | Explicit-time updates in a group |
| Groups | [User guide: controlling groups](https://tweenjs.github.io/tween.js/docs/user_guide.html#controlling-groups-of-tweens) | Group rebuilt and stepped |
| Timeline sequencing, offsets and labels | [User guide: timelines](https://tweenjs.github.io/tween.js/docs/user_guide.html#timeline-sequencing-and-overlapping) | Untested |
| Easing and interpolation | [User guide: easing](https://tweenjs.github.io/tween.js/docs/user_guide.html#changing-the-easing-function-aka-make-it-bouncy), [advanced tweening](https://tweenjs.github.io/tween.js/docs/user_guide.html#advanced-tweening) | Cubic, Back, Quadratic and Linear easing exercised; interpolation arrays untested |
| Callbacks and playback state | [User guide](https://tweenjs.github.io/tween.js/docs/user_guide.html) | Untested |

## Install and doctor

```sh
pnpm add @tweenjs/tween.js
vcr doctor
```

Install in the selected workspace. `vcr doctor` reports machine availability where supported; it does not validate behavior. The fixture pinned 25.0.0.

## Smoke test

Create the validated fixture with `vcr example create tweenjs-capture`; change to the destination it prints, then run:

```sh
pnpm install
./run.sh
# expect: tweenjs-capture: OK
```

Evidence: 90 1280×720 alpha frames at 30 fps; shuffled capture hashes matched sequential capture. Validated on macOS arm64 with tween.js 25.0.0, Node 22.19.0, Playwright 1.64.1 and Chromium 156.0.8078.4. This is partial coverage: one group-based Canvas scene, not the singleton, persistent groups, DOM/SVG, Three.js, Node rendering, other platforms, or all API features. One large `update()` over a yoyo boundary gave the wrong position; the fixture uses explicit 10 ms steps.

## Troubleshooting
- Shuffled frames differ or a seek jumps: supply the intended time explicitly, rebuild state when rewinding completed tweens, and step across repeat/yoyo boundaries. A single large update across a boundary failed in the fixture probe.
- A tween does not advance: call `tween.update(time)` or `group.update(time)`; tween.js does not run itself. Times are milliseconds.

## Official docs

[tween.js documentation](https://tweenjs.github.io/tween.js/) · [User guide](https://tweenjs.github.io/tween.js/docs/user_guide.html) · [GitHub repository](https://github.com/tweenjs/tween.js)
