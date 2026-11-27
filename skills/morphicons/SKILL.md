---
name: morphicons
description: Morph one SVG icon into another as a pure function of a progress value with morphicons' DOM-free core in Node, then rasterise frames with resvg or feed the path to a scene. Load once morphicons has been chosen for an icon-to-icon transition.
---

# morphicons

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Two icon paths in, one `d` string out for any progress in 0..1. Plan once, then each frame is a cheap pure call, so it follows capture time with no clock.
- It makes path data, not pixels. Draw it as an ordinary SVG layer (`svg`, `anime-js` or a seeked browser scene) and rasterise with `resvg`.
- For tweening arbitrary attributes use `svg-js` or `anime-js`; to find an icon and check its licence use `iconify`.
- VCR evidence covers one stroke icon pair (Lucide `menu` to `x`) through the root entry on macOS arm64, Node 22. Everything else below is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Root pure core: `resampleIcon`, `buildPlan`, `interpPolar`, `interpLinear`, `serialize`, `fitIcon` | [README](https://github.com/guillermolg00/morphicons#readme), `dist/index.d.ts` | `resampleIcon`, `buildPlan`, `interpPolar`, `serialize` tested; the rest untested |
| `morphicons/region`: filled icons | README | untested |
| `morphicons/dom` (`createMorph`) and spring physics (`Spring`, `SPRING_PRESETS`) | README | untested |
| React, Vue, Svelte, Astro, custom element, React Native bindings | README | untested |

## Install and doctor
```sh
pnpm add morphicons@2.0.2
```
A project-local library: `vcr doctor` does not probe it; `pnpm list morphicons --depth 0` does.

## Smoke test
```sh
cd examples/morphicons-icon-morph && ./run.sh
# expect: OK: morphicons-icon-morph
```
Renders twice in separate processes and requires identical bytes, checks bounds and endpoints against `expected/metrics.json`, and builds a 1200x240 contact sheet with resvg and ImageMagick.

## Recipe: progress to path
```js
import { buildPlan, interpPolar, resampleIcon, serialize } from 'morphicons';

const plan = buildPlan(resampleIcon('M4 6h16M4 12h16M4 18h16'), resampleIcon('M18 6 6 18M6 6l12 12'));
const outputs = plan.items.map((item) => new Float64Array(item.a.length));
const closedFlags = plan.items.map((item) => item.closed);
const pathAt = (progress) => (interpPolar(plan, progress, outputs), serialize(outputs, closedFlags));
```
- Drive `progress` from the frame time (for example `easing(t / duration)`), never from the library's spring.
- Inputs are raw `d` strings or `[tag, attrs]` lists; both ends must share the 24 grid (`fitIcon` re-grids others; untested).
- Stroke icons: draw with `fill="none"` and the stroke width yourself.
- The output is a polyline of 64 samples per subpath (`L` commands), not the original curves; at progress 0 and 1 it matches the icons visually.
- A subpath without a partner collapses or grows (the menu's third bar folds into the X). That is by design.
- `outputs` is reused between calls; copy the string out, not the buffers.

## Troubleshooting
- No failures were seen in the fixture. Types for the unexported plan internals are in `dist/*.d.ts` chunks, but only names in `dist/index.js` are importable.

## Official docs
- [morphicons repository and README](https://github.com/guillermolg00/morphicons)
- [morphicons on npm](https://www.npmjs.com/package/morphicons)
