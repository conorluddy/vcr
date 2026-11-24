---
name: mpfb
description: Create a parametric MakeHuman-style human figure inside background-mode Blender with the MPFB add-on's Python API, set its height macro and render a transparent still. Load when a 3D human base mesh is needed headlessly; for browser-side figures use mannequin-js or three-vrm.
---

# MPFB human figures in background Blender

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`. MPFB runs inside Blender, so read `skills/blender-background/SKILL.md` first for the command line, engines and alpha.

## Use cases and limits
- A default human base mesh from MPFB's Python API, with macro sliders (height tested) and a Workbench still with transparent film. Geometry is a pure function of the macro values.
- Use it when the figure must be an editable Blender mesh. For a lightweight procedural figure in the browser use `mannequin-js`; for a runtime VRM avatar use `three-vrm`.
- Evidence covers only: macOS arm64, Blender 4.4.0 background mode, MPFB 2.0.18 from the extensions.blender.org zip, default human, Workbench 480x720 transparent render. Untested: proxies, rigs, poses, clothes, skins, hair, eyes, other macros (gender, age, weight), EEVEE, Cycles, other Blender versions or OSes.
- Licences: base mesh CC0 (released 2020, stated in `data/3dobjs/base.obj`); MPFB code GPL-3.0-or-later; MakeHuman asset packs (skins, clothes) are separately licensed and not used here. Check each pack before use.

## Capability map
Discovery only; none of this is VCR-validated unless marked.
- Add-on and source: [MPFB on GitHub](https://github.com/makehumancommunity/mpfb2), [extension page](https://extensions.blender.org/add-ons/mpfb/).
- Python services under `bl_ext.user_default.mpfb.services`: `HumanService` (create a human; tested `create_human`), `TargetService` (macro and target data; tested `get_default_macro_info_dict`), plus services for assets, rigs and clothes (untested). Browse the installed package or the repository for the rest.
- Bundled data: base mesh `data/3dobjs/base.obj` and macro targets under `data/targets/macrodetails/` (tested via the default human).
- Rigs, proxies, skins, clothes, MakeHuman asset packs and the add-on's network features: untested.

## Install and doctor
Install into an isolated home, never the user's own Blender. `examples/mpfb-human-figure/run.sh` does all of it: downloads the zip, checks sha256 `c075b3e9b94b8e5556a5f03f4653602d02ea306de08126e8f55ed6dee28a2dad`, then
```text
HOME=$ISO BLENDER_USER_CONFIG=$ISO/config BLENDER_USER_SCRIPTS=$ISO/scripts BLENDER_USER_EXTENSIONS=$ISO/extensions BLENDER_USER_DATAFILES=$ISO/datafiles \
  /Applications/Blender.app/Contents/MacOS/Blender --factory-startup --command extension install-file -r user_default mpfb-2.0.18.zip
grep '^version' $ISO/extensions/user_default/mpfb/blender_manifest.toml   # expect: version = "2.0.18"
```
Check Blender with `vcr doctor`; it does not check MPFB. Do not claim MPFB is installed until the manifest check passes.

## Smoke test
```text
vcr example create mpfb-human-figure && (cd examples/mpfb-human-figure && ./run.sh)
# expect: mpfb-human-figure: OK (Blender 4.4.0, MPFB 2.0.18)
```
Needs ImageMagick (`magick`) and network for the first download. Heights 0.0 / 0.5 / 1.0 all give 13380 vertices and 13378 faces; bounding-box heights 1.299869 / 1.659431 / 2.367775 m.

## Scripting recipe
```python
import addon_utils, importlib
addon_utils.enable("bl_ext.user_default.mpfb", default_set=True, persistent=False)
humans = importlib.import_module("bl_ext.user_default.mpfb.services.humanservice")
targets = importlib.import_module("bl_ext.user_default.mpfb.services.targetservice")
macros = targets.TargetService.get_default_macro_info_dict()
macros["height"] = 1.0                      # 0.0 to 1.0, default 0.5
figure = humans.HumanService.create_human(macro_detail_dict=macros)
```
Run with `Blender -b --factory-startup --python script.py -- <out_dir>` under the isolated environment. `default_set=True` matters: without it MPFB's preference lookups fail.

## Isolation gotcha (critical)
MPFB writes logs and data through `bpy.utils.resource_path('USER')`, which ignores `BLENDER_USER_*`. Unredirected, a run writes to `~/Library/Application Support/Blender/<version>/mpfb`. The fixture redirects that lookup in-process, before enabling the add-on:
```python
original = bpy.utils.resource_path
bpy.utils.resource_path = lambda kind, *a, **k: ISO_USER_DIR if kind == "USER" else original(kind, *a, **k)
```
Then assert that `resource_path('USER')` and the add-on's `__file__` resolve under the isolated home, and exit non-zero otherwise. Full version in `examples/mpfb-human-figure/build_figure.py`.

## Render and determinism
- Height macro changes coordinates, not topology: expect equal vertex counts and different coordinate hashes.
- Render the figure with an orthographic camera framed on its bounding box (margin 1.15), Workbench, STUDIO light, single flat grey, `film_transparent`, RGBA PNG. Measured: 480x720, opaque fraction 0.188, 4236 unique colours.
- Geometry JSON was byte-identical across two separate Blender processes. PNGs were pixel-identical (`magick compare` AE 0) but not byte-identical (metadata differs); compare pixels, not bytes.

## Troubleshooting
- Preference or `get_preference` errors on create: the add-on was not enabled with `default_set=True`.
- A new `mpfb/` directory under `~/Library/Application Support/Blender/<ver>/`: the `resource_path('USER')` redirect was missing; delete that directory.
- `ModuleNotFoundError: bl_ext.user_default.mpfb`: the extension is not installed in the isolated repository, or `BLENDER_USER_EXTENSIONS` differs from the install run.
- sha256 mismatch on download: stop and do not install; delete the zip and retry.

## Official docs
https://github.com/makehumancommunity/mpfb2 · https://extensions.blender.org/add-ons/mpfb/ · https://docs.blender.org/manual/en/4.4/advanced/extensions/index.html · https://docs.blender.org/api/4.4/
