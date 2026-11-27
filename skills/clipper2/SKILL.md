---
name: clipper2
description: Union, subtract, inset and outset 2D polygons in Node with Clipper2 through the clipper2-wasm package, then write the rings as SVG. Load once Clipper2 has been chosen for outline, offset or shape-merge geometry.
---

# Clipper2

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Polygons in, polygons out: booleans, round or mitered offsets, clean rings. The script writes the result as SVG paths for `resvg` or a browser scene.
- Polygons only. Flatten curves first; the segment count is part of the result, so fix and record it.
- Bezier-preserving booleans belong to `paper-js`; plotter path clean-up to `vpype`; 3D to `build123d` or `trimesh`.
- VCR evidence covers the double (`*D`) API in Node 22 on macOS arm64. Everything marked untested below is documentation only.
- Upstream note: AngusJohnson/Clipper2 is archived; development moved to PolyClipping/Clipper2. The npm port `clipper2-wasm` is a separate one-person project and does not state which Clipper2 release it bundles.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Union, Intersect, Difference, Xor (`UnionD` etc.) | [Clipper2 docs](https://www.angusj.com/clipper2/Docs/Overview.htm) | `UnionD`, `DifferenceD` tested; others untested |
| Offsetting (`InflatePathsD`, join and end types) | [InflatePaths](https://www.angusj.com/clipper2/Docs/Units/Clipper/Functions/InflatePaths.htm) | Round and Miter joins, `EndType.Polygon` tested; Square, open-path end types untested |
| Minkowski sum and difference | [Clipper2 docs](https://www.angusj.com/clipper2/Docs/Overview.htm) | untested |
| Triangulation (`TriangulateD`) | [Clipper2 repository](https://github.com/PolyClipping/Clipper2) | untested |
| Integer API (`*64`), Rect clipping, `SvgWriter` | `dist/clipper2z.d.ts` in the package | untested |

## Install and doctor
```sh
pnpm add clipper2-wasm@0.4.0
```
A project-local library: `vcr doctor` does not probe it. Pin the exact version; the WASM binary comes with it.

## Smoke test
```sh
cd examples/clipper2-polygon-ops && ./run.sh
# expect: OK: clipper2-polygon-ops
```
Runs the render twice in separate processes and requires identical SVG bytes, asserts areas against an analytic value, diffs `expected/facts.json` and checks a 960x300 resvg PNG.

## Recipe: union, offset, difference
```js
import Clipper2Z from 'clipper2-wasm/dist/es/clipper2z.js';
const clipper = await Clipper2Z();

const toPathsD = (rings) => {
  const paths = new clipper.PathsD();
  for (const ring of rings) {
    const path = new clipper.PathD();
    for (const [x, y] of ring) path.push_back(new clipper.PointD(x, y, 0));
    paths.push_back(path);
  }
  return paths;
};
const union = clipper.UnionD(toPathsD([ringA]), toPathsD([ringB]), clipper.FillRule.NonZero, 2);
const outset = clipper.InflatePathsD(union, 14, clipper.JoinType.Round, clipper.EndType.Polygon, 2, 2, 0.25);
// read back: paths.get(i).get(j).x / .y, sizes via .size()
```
- Argument order for `InflatePathsD`: `delta, joinType, endType, miterLimit, precision, arcTolerance`. Negative delta insets.
- The `2` after the fill rule is decimal precision; keep it the same on every call in one pipeline.
- Draw results with `fill-rule="evenodd"`; a hole comes back as its own ring (difference gave 2 rings).
- Round joins add vertices (79 in the union became 156 in the outset); a miter inset keeps sharp corners.

## Determinism
Two separate Node processes gave byte-identical SVG for the same inputs (tested). Cross-platform and cross-version equality is untested.

## Troubleshooting
- Import the ES build path above. The package `module` field points at `dist/es/clipper2z.js`, which is async: `await Clipper2Z()` before any call.
- Embind objects (`PathsD`, `PathD`, `PointD`) are not garbage collected; `.delete()` them in long loops (untested at scale; the fixture does not free its few objects).
- No other failures were seen in the fixture.

## Official docs
- [Clipper2 documentation](https://www.angusj.com/clipper2/Docs/Overview.htm)
- [PolyClipping/Clipper2](https://github.com/PolyClipping/Clipper2)
- [clipper2-wasm](https://github.com/ErikSom/Clipper2-WASM) and [on npm](https://www.npmjs.com/package/clipper2-wasm)
