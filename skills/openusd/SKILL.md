---
name: openusd
description: Use OpenUSD's Python bindings (PyPI usd-core) to author, save and reopen USD stages (.usda, .usdc) for scene interchange. Load for scripted scene data; the VCR fixture covers one small stage on macOS arm64, with no rendering and no usdchecker.
---

# OpenUSD (usd-core)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Author scene description in Python and write it as `.usda` (text) or `.usdc` (binary): prims, typed geometry, material bindings, time-sampled attributes and stage metadata. USD is for scene interchange; glTF is for delivery assets.
- Validated on one single-layer stage, usd-core 26.11, Python 3.12.2, macOS arm64. Not tested: `usdchecker` (the usd-core wheel ships none; macOS `/usr/bin/usdchecker` is Apple's and is not credited), rendering or Hydra (usd-core has no imaging), `.usdz`, references, payloads, variants, sublayers, other applications.
- Use [gltf-transform](../gltf-transform/SKILL.md) for small real-time GLB assets and [trimesh](../trimesh/SKILL.md) for mesh measurement. Render with Blender.
- Licence: the wheel is `LicenseRef-TOST-1.0` (Tomorrow Open Source Technology License 1.0, Apache-2.0 derived; only the trademarks section differs). Not plain Apache-2.0.

## Capability map
Official reference: [openusd.org](https://openusd.org/), with the [Python API](https://openusd.org/release/api/index.html). Stable top-level areas: `Usd` (stages, prims, attributes), `Sdf` (layers, paths, value types), `UsdGeom` (Xform, Cube, Sphere, meshes, cameras, stage units and up axis), `UsdShade` (materials, `UsdPreviewSurface`), `UsdLux` (lights), `UsdSkel`, `UsdUtils`, composition arcs and the `usdchecker` and `usdview` tools.
Exercised by VCR: `Usd.Stage.CreateInMemory`, `UsdGeom.Xform/Cube/Sphere/Scope.Define`, `AddTranslateOp().Set(value, time)`, `UsdShade.Material/Shader` with `MaterialBindingAPI.Bind`, `SetStageMetersPerUnit/UpAxis`, `Sdf.Layer.Export`, `Usd.Stage.Open`, `Attribute.Get(time)` and `GetTimeSamples`. Everything else is documented but untested. Mapping is discovery, not validation.

## Install and doctor
The fixture keeps its venv under the git-ignored `output/`.
```text
cd examples/openusd-stage-roundtrip
python3 -m venv output/venv && output/venv/bin/python -m pip install -r requirements.txt
output/venv/bin/python -c "from pxr import Usd; print('.'.join(map(str, Usd.GetVersion())))"   # expect: 0.26.11
vcr doctor
```
Pin: `usd-core==26.11` (the wheel has no dependencies). `Usd.GetVersion()` prints `0.26.11`. The venv is about 246 MB.

## Smoke test
```text
vcr example create openusd-stage-roundtrip
cd examples/openusd-stage-roundtrip && ./run.sh
# expect: openusd-stage-roundtrip: OK
```
`run.sh` runs the script twice, compares the `.usda` files with `cmp`, and diffs `checks.json` against `expected/`. It also prints a stderr note that usdchecker was not run.

## Recipes
```python
from pxr import Gf, Sdf, Usd, UsdGeom, UsdShade
stage = Usd.Stage.CreateInMemory()
UsdGeom.SetStageMetersPerUnit(stage, 0.01); UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.y)
world = UsdGeom.Xform.Define(stage, "/World"); stage.SetDefaultPrim(world.GetPrim())
stage.SetStartTimeCode(0); stage.SetEndTimeCode(24); stage.SetTimeCodesPerSecond(24)
cube = UsdGeom.Cube.Define(stage, "/World/Cube"); cube.GetSizeAttr().Set(2.0)
move = cube.AddTranslateOp()
for frame in (0, 6, 12, 18, 24): move.Set(Gf.Vec3d(2.0 * frame, 0, 0), float(frame))
UsdGeom.Scope.Define(stage, "/World/Looks")
material = UsdShade.Material.Define(stage, "/World/Looks/RedMat")
shader = UsdShade.Shader.Define(stage, "/World/Looks/RedMat/PreviewSurface")
shader.CreateIdAttr("UsdPreviewSurface")
shader.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).Set(Gf.Vec3f(1, 0, 0))
material.CreateSurfaceOutput().ConnectToSource(shader.ConnectableAPI(), "surface")
UsdShade.MaterialBindingAPI.Apply(cube.GetPrim()).Bind(material)
layer = stage.GetRootLayer(); layer.Export("stage.usda"); layer.Export("stage.usdc")
```
- Reopen with `Usd.Stage.Open(path)`; `Usd.Stage.Open` returns an invalid stage on failure, so check it.
- Measured: both reopened files equal the authored stage (prim paths and types, attribute values, five time samples, relationship targets, metadata) with exact float equality.
- Time reads are stateless: frames read in the order 24, 0, 18, 6, 12 equal a sequential read.
- Rerunning the script gave byte-identical `.usda`. `.usdc` byte identity is not claimed.
- The `UsdPreviewSurface` network was authored and read back as data only; no shading was seen.
- The fixture exported with `Sdf.Layer.Export` from an in-memory stage to keep the output path out of the file; `Usd.Stage.Export` was not tested.

## Troubleshooting
- `usdchecker` not in the venv `bin`: expected with usd-core 26.11. Compliance is unverified; do not substitute `/usr/bin/usdchecker`.
- `TypeError` converting an attribute to JSON: arrays such as `VtVec3fArray` and token arrays need an iterate-and-convert case.
- A venv inside a tracked example path is scanned by the plugin build; keep it under `output/`.

## Official docs
- [OpenUSD](https://openusd.org/)
- [Repository and LICENSE.txt](https://github.com/PixarAnimationStudios/OpenUSD)
