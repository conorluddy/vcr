---
name: mo-js
description: "Unproven in VCR: mo.js is demoted (seeking undocumented, last release 2023); prefer anime-js for seekable DOM and SVG motion."
---

# mo.js (unproven)

Written from official docs only. No VCR fixture has run it; every recipe is documentation-only, untested in VCR.

## Status
Demoted. Assessment rationale: "Last release 1.7.1 on 2023-10-06 (about 36 months); repo pushed 2026-07 but no release. Effects are niche, seeking is undocumented, and Anime.js covers the seekable timeline need." Not tested. Might be worth it for a one-off burst, confetti or radial ripple where mo.js presets save a lot of code, and you accept verifying seek behaviour yourself.

## Use cases and limits
- Ready-made `Burst`, `Shape`, `Html` and stagger helpers, driven by mo.js's own `Timeline` and `Tween`, rendering SVG and HTML.
- VCR needs `window.__scene = { duration, seek }` as a pure function of `t`. mo.js plays on `requestAnimationFrame` and its own clock; whether seeking is deterministic, including random burst particles, is not documented.
- The unscoped `mo.js` npm package is a stale 0.0.2; use `@mojs/core`.

## Prefer instead
`skills/anime-js/SKILL.md` for seekable timelines (validated). For SVG geometry `skills/svg/SKILL.md`; for particle fields `skills/p5-js/SKILL.md` or `skills/pixijs/SKILL.md`.

## Install route
`pnpm add @mojs/core` (from the record). Check: `pnpm list @mojs/core --depth 0`. Never assume it is installed.

## Surface (official docs, unverified in VCR)
- `new mojs.Shape({...})`, `new mojs.Burst({...})`, `new mojs.Html({...})`
- `new mojs.Timeline().add(...)`, `new mojs.Tween(...)`, `.play()`, `.replay()`
- A progress-setting method on tweens and timelines (believed `setProgress(p)`, p in 0..1); confirm in current docs and test while paused.
- `mojs.easing` helpers, including path easing.

## Recipe sketch (documentation-only, untested in VCR)
```js
import mojs from "@mojs/core";
const burst = new mojs.Burst({ radius: { 0: 100 }, count: 8, children: { duration: 1000 } });
const timeline = new mojs.Timeline().add(burst);
window.__scene = { duration: 1, seek: (t) => timeline.setProgress(Math.min(t / 1, 1)) };
```
If `vcr capture --verify` (shuffled vs sequential) does not match, do not use it.

## Licence
MIT.

## Official docs
- https://mojs.github.io/
- https://github.com/mojs/mojs
- https://www.npmjs.com/package/@mojs/core
