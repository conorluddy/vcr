---
name: trimesh
description: Use Python trimesh to measure and edit triangle meshes (volume, area, bounds, watertightness, transforms) and re-export GLB or STL. Load for scripted geometry checks; the VCR fixture covers a box and an icosphere on macOS arm64.
---

# Trimesh

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Check and edit mesh geometry in Python: counts, volume, area, bounds, watertightness, rigid and scale transforms, GLB/STL export and reload. It does not render.
- Validated on a box and an icosphere only, on macOS arm64. Materials, lighting, booleans, repair, other formats and optional extras are untested.
- Use [gltf-transform](../gltf-transform/SKILL.md) for glTF asset pipelines from the command line or Node. Meshes from signed-distance fields come from [fogleman-sdf](../fogleman-sdf/SKILL.md). Render with Blender or Three.js.

## Capability map
Official reference: [trimesh.org](https://trimesh.org/). Stable top-level areas: `trimesh.creation` (primitives), `trimesh.load` and `Trimesh.export` (I/O), `Trimesh` properties and transforms, plus modules for repair, boolean, ray and collision queries, many of which need optional dependencies. VCR exercises `creation.box`, `creation.icosphere`, `load(force="mesh")`, `volume`, `area`, `bounds`, `is_watertight`, `euler_number`, `apply_transform` and GLB/STL export. Everything else is documented but untested. Mapping is discovery, not validation.

## Install and doctor
The fixture keeps its venv under the git-ignored `output/` (a venv inside a tracked example path gets scanned by the plugin build).
```text
cd examples/trimesh-mesh-checks
python3 -m venv output/venv && output/venv/bin/python -m pip install -r requirements.txt
output/venv/bin/python -c "import trimesh; print(trimesh.__version__)"   # expect: 5.2.2
vcr doctor
```
Pins: trimesh 5.2.2, numpy 2.5.5, Python 3.12.2. No optional extras were installed.

## Smoke test
```text
vcr example create trimesh-mesh-checks
cd examples/trimesh-mesh-checks && ./run.sh
# expect: trimesh-mesh-checks: OK
```
`run.sh` runs the script twice and diffs both runs against `expected/checks.json`.

## Recipes
```python
import numpy as np, trimesh
box = trimesh.creation.box(extents=(2, 4, 6))
box.volume, box.area, box.bounds, box.is_watertight   # 48, 88, ±(1,2,3), True
ico = trimesh.creation.icosphere(subdivisions=4, radius=1.0)   # 2562 vertices, 5120 faces
m = trimesh.transformations.compose_matrix(scale=2, angles=(0, 0, np.pi / 2), translate=(1, 2, 3))
box.apply_transform(m)                                  # volume 384, bounds [-3,0,-3]..[5,4,9]
box.export("out.glb"); box.export("out.stl")
back = trimesh.load("out.glb", force="mesh")            # same vertex and face counts
```
- An icosphere is inscribed, so its volume and area sit below the sphere's: measured 0.216% and 0.119% low at 4 subdivisions. Compare with a tolerance, not equality.
- Compare reloads by vertex count, face count and volume, not vertex order.
- Byte-identical reruns held on one machine and one Python/numpy build; hashes may change with a version bump.
- The GLB reader was only tested on trimesh's own output.

## Troubleshooting
- `json.dumps` fails on a numpy bool or float: wrap measurements in `float()` or `bool()`.
- `trimesh.load` can return a `Scene`; pass `force="mesh"` and check for `trimesh.Trimesh`.
- A venv outside `output/` inside an example is scanned by the plugin build; keep it under `output/`.

## Official docs
- [Trimesh documentation](https://trimesh.org/)
- [Repository](https://github.com/mikedh/trimesh)
