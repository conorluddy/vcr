---
name: manifold
description: Run mesh Booleans (union, subtract, intersect) in Node with manifold-3d and certify the result is watertight and correctly sized from raw triangle arrays. Load once Manifold has been chosen for triangle-mesh CSG.
---

# Manifold

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Triangle-mesh Booleans whose output is guaranteed manifold, with `volume()`, `genus()` and `status()` to check it.
- Not a CAD kernel: no fillets, no STEP. For dimensioned parts use `build123d`; to inspect or convert files use `trimesh` or `gltf-transform`.
- VCR evidence covers one cube-minus-sphere in the npm WASM build on Node 22, macOS arm64. Everything else below is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Primitives (`cube`, `sphere`), `subtract`, `add`, `intersection` | [JS docs](https://manifoldcad.org/jsdocs) | tested |
| Queries: `status`, `volume`, `genus`, `numVert`, `numTri`, `getMesh` | [JS docs](https://manifoldcad.org/jsdocs) | tested |
| Python `manifold3d` | [repository](https://github.com/elalish/manifold) | untested |
| Loading meshes (`new Mesh`), glTF export, `smooth`, `refine`, `extrude`, `revolve`, `warp` | [JS docs](https://manifoldcad.org/jsdocs) | untested |

## Install and doctor
```sh
cd examples/manifold-csg-check && pnpm install   # manifold-3d@3.5.5
```
A project-local library: `vcr doctor` does not probe it. Pin the exact version.

## Smoke test
```sh
cd examples/manifold-csg-check && ./run.sh
# expect: OK: manifold-csg-check
```

## Recipe: Boolean and certify
```js
import Module from 'manifold-3d';
const wasm = await Module();
wasm.setup();               // required before using Manifold
const { Manifold } = wasm;
const result = Manifold.cube([2, 2, 2], true).subtract(Manifold.sphere(1.2, 64));
const mesh = result.getMesh();   // vertProperties (mesh.numProp floats per vertex, xyz first), triVerts
```
- Check the raw arrays, not only Manifold's accessors: every directed edge `a>b` needs a partner `b>a`, and signed tetrahedron volume should equal `volume()` (tested: 0 unpaired edges, agreement under 1e-6).
- Use `V(A-B) = V(A) - V(A and B)` as an exact check (residual 1.8e-15). Do not compare against the analytic sphere: a 64-segment ball is smaller than the true one, which gave a 1.364% gap.
- Output is byte-identical across separate Node processes (tested).
- `status()` returns the string `NoError` here, not a number.

## Looking at it
`view.mjs` in the example writes a flat-shaded SVG from the mesh; `resvg` rasterises it. Use it, or any renderer, before trusting the numbers.

## Troubleshooting
- A 1% analytic-volume bound failed at 1.364% because of sphere faceting, not a Boolean fault; check the inclusion-exclusion identity instead.
- Untested: TBB/parallel builds may reorder vertices; hash raw arrays only after confirming.

## Official docs
- [manifold repository](https://github.com/elalish/manifold)
- [JS API](https://manifoldcad.org/jsdocs)
- [manifold-3d on npm](https://www.npmjs.com/package/manifold-3d)
