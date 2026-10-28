---
name: blender-background
description: Render Blender scenes headlessly from the macOS app bundle with a Python script, one frame or a range, to PNG with alpha, choosing between Cycles, EEVEE and Workbench and using the compositor. Use for 3D product shots, procedural scenes and compositing passes that enter VCR as image sequences.
---

# Blender in background mode


`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).
## Use cases and limits
- Deterministic frame renders from a `.blend` file or a scene built in Python. Blender owns its own clock: VCR asks for frame N, Blender renders frame N.
- Over Three.js when the look needs path tracing, the compositor, simulation caches or an existing `.blend`.
- Not on PATH on macOS; call the bundle executable directly. GPU backend and colour management vary per machine; record them in evidence.
- Licence GPL-3.0 for Blender itself; renders are yours.

## Install and doctor
```text
brew install --cask blender
/Applications/Blender.app/Contents/MacOS/Blender --version | head -1   # expect: Blender 4.x
```
Validated 4.4.0 on macOS arm64, Workbench engine, see `examples/blender-smoke`.

## Smoke test
```text
vcr example create blender-smoke && (cd examples/blender-smoke && ./run.sh)
# expect: blender-smoke: OK (Blender 4.4.0); 320x240 srgba PNG with transparent film
```

## Background render
```text
Blender -b scene.blend -o //output/frame-#### -F PNG -s 1 -e 90 -a       # frame range to a numbered sequence
Blender -b scene.blend -f 48 -o //output/still-####                       # one frame
Blender -b --python render.py -- /abs/path/out.png                        # script-built scene; args after -- reach sys.argv
```
Order matters: options are applied as they are read, so `-o` and `-F` come before `-a`. `//` means relative to the blend file.

## Python scene build
```python
import bpy, sys
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.mesh.primitive_cube_add(size=2)
bpy.ops.object.camera_add(location=(6, -6, 4), rotation=(1.1, 0, 0.785)); scene.camera = bpy.context.object
scene.render.film_transparent = True
scene.render.image_settings.color_mode = "RGBA"
scene.frame_set(1)
bpy.ops.render.render(write_still=True)
```
- Set enums by reading valid values rather than guessing; a wrong `scene.render.engine` raises a `TypeError` whose message lists the ids.
- Seed every randomised modifier and particle system; record `bpy.app.version_string` and the engine in the render manifest.
- Scene time: `scene.frame_set(n)` with `scene.render.fps` and `fps_base` for rational rates (`fps=30000, fps_base=1001` is 29.97).

## Compositor
- Enable with `scene.use_nodes = True`; the tree is `scene.node_tree`. Look nodes up by `type` (`"R_LAYERS"`, `"COMPOSITE"`), never by name, since names are localised.
- Render passes (`view_layer.use_pass_z`, `use_pass_normal`, cryptomatte) come out through the compositor as EXR; use `OPEN_EXR_MULTILAYER` for a single file per frame.
- Anything VCR's own compositor cannot do yet (PRD L3-05) can be pre-rendered here and enter as a flat layer.

## Cycles, EEVEE and Workbench
- Workbench: seconds per frame, byte-stable, no materials beyond flat shading. Fixtures and previews.
- EEVEE (`BLENDER_EEVEE_NEXT` in 4.2+): real-time quality with shadows and bloom; near-deterministic per machine.
- Cycles: path traced; set `scene.cycles.samples` and `seed`, and `use_animated_seed = False`. Output varies between GPU and CPU backends, so treat it as visually-equivalent reproducibility (PRD §12), not byte-exact.

## Troubleshooting
- Blank or black frame: no camera assigned, or no light with Workbench studio lighting disabled.
- Output has no alpha: `film_transparent` false or `color_mode` RGB.
- Different pixels on another machine: Cycles backend and OpenColorIO config differ; record both in evidence.

## Official docs
https://docs.blender.org/manual/en/latest/advanced/command_line/render.html · https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html · https://docs.blender.org/api/current/
