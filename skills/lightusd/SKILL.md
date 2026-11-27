---
name: lightusd
description: Use LightUSD's Python wheel (PyPI lightusd) to author a USD stage in code and save .usda, .usdc or .usdz, or to load one back as data. Load when a USD or USDZ file must be written or inspected without building OpenUSD; the VCR fixture covers one small stage on macOS arm64, with no rendering.
---

# LightUSD (lightusd)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Create a `Stage`, define prims, set attributes (with `time=` for samples) and relationships, then `stage.save("x.usda" | ".usdc" | ".usdz")`; the extension picks the format. `lightusd.load(path)` reads any of them.
- Validated on one single-layer stage, lightusd 1.0.0 (released 2026-11-09), Python 3.12.13, macOS arm64. usd-core 26.11 reads its `.usda`, `.usdc` and `.usdz` identically. Young 1.0: expect API rough edges.
- Not tested: rendering (there is none), usdchecker or ARKit/Quick Look compliance, composition (`add_reference`, variants, sublayers), packaged textures in a USDZ, `import_obj`/`import_urdf`/`import_mjcf`, MaterialX, Physics, the WASM/npm package.
- For the reference implementation, Hydra and `usdchecker` use [openusd](../openusd/SKILL.md); for real-time GLB use [gltf-transform](../gltf-transform/SKILL.md); render with Blender.

## Capability map
Official docs: [documentation site](https://lighttransport.github.io/LightUSD/) and the repo's `doc/` (core, composition, MaterialX, USD Physics, Python binding, API status). Python modules in the wheel: `Stage`, `Prim`, `Attribute`, `Relationship`, `load`/`load_bytes`/`loads`, `flatten_file`, `physics`, `tydra` (render-scene access), `skel`, `volume`, `units`, `asset`, `import_obj`/`import_urdf`/`import_mjcf`.
Exercised by VCR: `Stage.create`, `define_prim`, `set_default_prim`, `set_metadata`, `Prim.set` (with `type=`, `time=`, `uniform=`), `add_relationship`, `Stage.save` for three extensions, `load`, `traverse`, `get_prim_at`, `Attribute.eval`, `Attribute.timesamples.times`. Everything else is documented but untested.

## Install and doctor
```text
cd examples/lightusd-stage-roundtrip
python3.12 -m venv output/venv && output/venv/bin/python -m pip install -r requirements.txt
output/venv/bin/python -I -c "import lightusd; print(lightusd.__version__)"   # expect: 1.0.0
vcr doctor
```
Pins: `lightusd==1.0.0` (abi3 wheel, Python >=3.11, no dependencies; numpy is optional) and `usd-core==26.11` for the cross-read only.

## Smoke test
```text
vcr example create lightusd-stage-roundtrip
cd examples/lightusd-stage-roundtrip && ./run.sh
# expect: lightusd-stage-roundtrip: OK
```
`run.sh` builds the venv in ignored `output/` if missing, runs twice, `cmp`s `.usda` and `.usdz`, and diffs `checks.json`.

## Recipes
```python
import lightusd
s = lightusd.Stage.create()
s.define_prim("/World", "Xform"); s.set_default_prim("World")
s.set_metadata("metersPerUnit", 0.01); s.set_metadata("upAxis", "Y")
cube = s.define_prim("/World/Cube", "Cube"); cube.set("size", 2.0)
for f in (0, 6, 12): cube.set("xformOp:translate", (2.0 * f, 0.0, 0.0), type="double3", time=f)
cube.set("xformOpOrder", ["xformOp:translate"], type="token[]", uniform=True)
cube.add_relationship("material:binding", ["/World/Looks/RedMat"])
s.save("stage.usda"); s.save("stage.usdc"); s.save("stage.usdz")
```
- Pass `type=` for anything not inferable: `double3`, `color3f`, `token`, `token[]`; shader `info:id` needs `type="token", uniform=True`.
- Reading: `lightusd.load(path)`; `Attribute.eval(t)` is stateless (shuffled reads equal sequential).
- `Stage.export_usda()` returns the text, handy for reviewing before saving.
- Measured: `.usda` and `.usdz` were byte-identical across reruns; the `.usdz` holds one stored `root.usdc` at a 64-byte-aligned offset. `.usdc` byte identity is not claimed.
- Quirks seen: `Stage.default_prim` returns a `Prim`, not a name; `Relationship.targets` are strings; `Attribute.timesamples.times` is a property.

## Troubleshooting
- `TypeError: 'tuple' object is not callable` on `timesamples.times()`: it is a property.
- `TypeError: Object of type Prim is not JSON serializable`: use `.name` or `.path`.
- Run scripts with `python -I` so a stray local `lightusd.py` or `pxr` is not imported.

## Official docs
- [LightUSD](https://github.com/lighttransport/LightUSD) and [PyPI](https://pypi.org/project/lightusd/)
- [Documentation site](https://lighttransport.github.io/LightUSD/)
