---
name: meshoptimizer
description: Simplify mesh index buffers with the meshoptimizer JavaScript API. VCR evidence covers a generated welded grid and structural repeatability, not visual fidelity or glTF processing.
---

# meshoptimizer

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Reach for the JavaScript simplifier when you already have position and index buffers and want a lower triangle count.
- VCR tests `MeshoptSimplifier.simplify` on a generated, welded planar grid. It checks valid indices, finite error and identical repeated output; it does not assess visible quality.
- The CLI, glTF/GLB import/export, attribute preservation, encoders, decoders and C++ APIs are not covered by this fixture. For general glTF editing, use glTF Transform.

## Capability map
- **JavaScript modules:** the [JavaScript API guide](https://github.com/zeux/meshoptimizer/blob/v1.3/js/README.md) documents encoder, decoder, simplifier and clusterizer modules. VCR tests only `MeshoptSimplifier.simplify`.
- **Simplification:** `simplify(indices, positions, stride, targetIndexCount, targetError)` returns a new index buffer and measured error; see the [versioned simplifier reference](https://github.com/zeux/meshoptimizer/blob/v1.3/js/README.md#simplifier). The target index count is not guaranteed: topology and error limits can stop reduction early.
- **Native library and gltfpack:** installation and command options are documented in the [project README](https://github.com/zeux/meshoptimizer/tree/v1.3); neither interface is tested here.

## Install and doctor
This is a project dependency, not a machine executable. In the fixture:

```sh
cd examples/meshoptimizer-grid
pnpm install --frozen-lockfile
node -e 'import("meshoptimizer").then(() => console.log("meshoptimizer: OK"))'
```

`vcr doctor` does not prove a project's JavaScript dependency resolves. The example pins `meshoptimizer@1.3.0` in its lockfile.

## Smoke test
```sh
cd examples/meshoptimizer-grid && ./run.sh
# expect: OK: 32 to 15 triangles; error 0.00007905693928478286; sha256 16b2e537842e0a98ad025d477c85c072a45a7a434908b9e173dba4641a240037
```
`./run.sh --record` rewrites expected metrics; review changes before recording.

## Troubleshooting
- If simplification stops above the requested index count, inspect topology and target error; the algorithm is allowed to stop early.
- The simplifier expects a usable position/index mesh. Duplicate vertices and seams can constrain simplification; the fixture uses a welded grid.
- A deterministic index hash is not evidence of visual fidelity. Inspect output meshes in the intended renderer before using them.

## Official docs
- [meshoptimizer 1.3 JavaScript API](https://github.com/zeux/meshoptimizer/blob/v1.3/js/README.md)
- [meshoptimizer 1.3 project and gltfpack](https://github.com/zeux/meshoptimizer/tree/v1.3)
