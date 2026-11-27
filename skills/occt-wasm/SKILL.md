---
name: occt-wasm
description: Build exact CAD solids in Node with occt-wasm (OpenCascade in WebAssembly), export STEP and STL, tessellate for a 3D scene and draw hidden-line SVG views. Load once occt-wasm has been chosen for parametric or dimensioned geometry from JavaScript.
---

# occt-wasm

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Exact solids (boxes, cylinders, booleans, fillets) in a Node script, with STEP and STL out and a `tessellate()` mesh for `three-js` or `babylon-js`.
- `toMultiviewSVG()` gives hidden-line Front, Top, Right and Iso views as SVG, which `resvg` rasterises. Curves are drawn as coarse polygons (holes came out 12-sided).
- No lighting, materials or frames: take the mesh to `three-js` or Blender. For Python CAD use `build123d`.
- Licence: wrapper MIT OR Apache-2.0; the `.wasm` is LGPL-2.1-only, so keep it a replaceable file (`OcctKernel.init({ wasm })`).
- VCR evidence covers one box, fillet and cut solid, in Node 22 on macOS arm64. Everything else below is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Primitives, booleans, fillet, `translate`, `getSubShapes` | [README quick start](https://github.com/andymai/occt-wasm#quick-start) | tested |
| `exportStep`, `importStep`, `exportStl`, volume, bounding box | README, `dist/index.d.ts` | tested |
| `tessellate` mesh (positions, normals, indices) | README | counts only; not loaded into a scene |
| `toMultiviewSVG`, `toSVG`, `toPNG` (hidden-line views) | `dist/svg.d.ts`, `dist/png.d.ts` | SVG tested; `toPNG` untested |
| Sweeps, lofts, chamfers, NURBS, history | `dist/index.d.ts` | untested |
| XCAF assemblies and `exportGLTF` | [README](https://github.com/andymai/occt-wasm#xcaf-assemblies) | untested |
| `OcctWorker` (Web Worker), browser bundlers | README | untested |

## Install and doctor
```sh
pnpm add occt-wasm@5.18.6
```
A project-local library: `vcr doctor` does not probe it. Needs WASM SIMD, tail calls and wasm exceptions (Node 22 has them). No IGES.

## Smoke test
```sh
cd examples/occt-wasm-step-svg && ./run.sh
# expect: OK: occt-wasm-step-svg
```
Builds the bracket twice in separate processes, requires identical STL, SVG and metrics, diffs `expected/metrics.json` and rasterises a 1000x1046 PNG.

## Recipe: solid to STEP and SVG
```js
import { OcctKernel } from 'occt-wasm';

const kernel = await OcctKernel.init();
const plate = kernel.makeBox(60, 30, 10);
const hole = kernel.translate(kernel.makeCylinder(4, 10), 15, 15, 0);
const [solid] = kernel.getSubShapes(kernel.cut(plate, hole), 'solid'); // booleans return compounds
const step = kernel.exportStep(solid);
const svg = kernel.toMultiviewSVG(solid);
kernel.releaseAll();
```
- Booleans return compounds; `fillet` and `chamfer` need a solid, so unwrap with `getSubShapes(shape, 'solid')` first.
- Select edges by geometry (`getBoundingBox` per edge), not by index; not every edge is filletable.
- `using kernel = …` is not valid syntax in Node 22; call `kernel[Symbol.dispose]()` yourself.
- Handles are arena ids: `release()` or dispose the kernel, there is no per-shape garbage collection.
- The kernel prints STEP transfer statistics to stdout; redirect it when parsing output.

## Troubleshooting
- STEP hashes differ between runs: the header `FILE_NAME` carries an export timestamp to the second. Blank it before hashing; STL and SVG were byte-identical.
- Bounding box shows `-4.4e-16`: round before recording metrics.

## Official docs
- https://github.com/andymai/occt-wasm (README, license section) and https://www.npmjs.com/package/occt-wasm, version 5.18.6.
