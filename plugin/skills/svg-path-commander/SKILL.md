---
name: svg-path-commander
description: Normalise SVG path strings to absolute cubics, transform and measure them in Node with svg-path-commander (no DOM), as the path-data step before a morph or resvg render. Load once it has been chosen for path maths.
---

# svg-path-commander

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Path string in, path string or numbers out. `toCurve()` turns H, V, L, Q, S, T and A into absolute `C`; `transform()`, `getBBox()` and `getTotalLength()` work on the same object.
- It does not pair or split segments. Two paths that normalise to different counts (6 and 7 in the fixture's first attempt) cannot be interpolated until your code equalises them.
- It makes geometry, not pictures. Rasterise with `resvg`; for a scene model use `paper-js` or `svg-js`; for file-level optimisation use `svgo`.
- VCR evidence covers two single-subpath paths, version 2.4.0, Node 22 on macOS arm64. Everything else below is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `toCurve`, `toAbsolute` | [README](https://github.com/thednp/svg-path-commander) | `toCurve` tested |
| `transform` (matrix, translate) | README | translate tested; 3D untested |
| `getBBox`, `getTotalLength` | README | tested |
| `getPointAtLength`, `getPropertiesAtLength`, `isPointInPath` | README | untested |
| `reverse`, `optimize`, `simplify`, `offset`, `flipX` | README | untested |

## Install and doctor
```sh
pnpm add svg-path-commander@2.4.0
```
A project-local library: `vcr doctor` does not probe it. Pin the version, because point-at-length on arcs is numerical.

## Smoke test
```sh
cd examples/svg-path-commander-cubic && ./run.sh
# expect: OK: svg-path-commander-cubic
```
Renders twice in separate processes and requires identical frame bytes, checks cubic-only paths with equal curve counts against `expected/metrics.json`, and rasterises three 260x260 frames with resvg.

## Recipe: cubic morph frames
```js
import SVGPathCommander from 'svg-path-commander';

const from = new SVGPathCommander('M10 10 H90 A20 20 0 0 1 110 30 L110 90 Q60 120 10 90 Z').toCurve().segments;
const to = new SVGPathCommander('M60 10 L100 10 S120 30 120 50 Q120 80 100 100 H20 Z').toCurve().segments;
if (from.length !== to.length) throw new Error('equalise segment counts first');
const at = (t) => new SVGPathCommander(
  from.map((seg, i) => seg.map((v, j) => (j === 0 ? v : v + (to[i][j] - v) * t))),
).toString();
```
- `.segments` is an array of `['C', x1, y1, x2, y2, x, y]`; the first element is the command letter.
- The constructor accepts that array again, so interpolated segments go straight back to a string.
- Round coordinates (`Math.round(v * 1000) / 1000`) before hashing or diffing; bounding boxes show float noise like `16.999999999999993`.

## Gotchas
- `toCurve()` mutates the instance. `getTotalLength()` afterwards measures the cubic approximation (357.132 in the fixture) and differs from a fresh instance (357.128). Measure on a separate instance if the original geometry matters.
- A closed path may end on a `C` back to the start with no `Z` kept; check the last segment before assuming a `Z`.

## Troubleshooting
- Unequal segment counts after `toCurve()`: rewrite the shapes with matching command counts, or split segments yourself; the library will not.
- Untested: 3D transforms are documented as a perspective projection, not real 3D.

## Official docs
- [svg-path-commander repository](https://github.com/thednp/svg-path-commander)
- [svg-path-commander on npm](https://www.npmjs.com/package/svg-path-commander)
