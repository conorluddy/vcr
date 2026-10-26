---
name: vcr-blender-background
description: Render Blender scenes headlessly from the macOS app bundle with a Python script, one frame or a range, to PNG with alpha. Use for 3D product shots, procedural scenes and compositing passes that enter VCR as image sequences.
---

# Blender in background mode

## Use cases and limits
- Deterministic frame renders from a `.blend` file or a scene built in Python, Workbench or EEVEE for speed, Cycles for quality.
- Blender owns its own clock: VCR asks for frame N, Blender renders frame N. No seeking tricks needed.
- Not on PATH on macOS; call the bundle executable directly. GPU backend and colour management vary per machine; record them in evidence.

## Install and doctor
```text
brew install --cask blender
/Applications/Blender.app/Contents/MacOS/Blender --version | head -1   # expect: Blender 4.x
```
Validated: 4.4.0 on macOS arm64, Workbench engine, see `examples/blender-smoke`.

## Smoke test
```text
examples/blender-smoke/run.sh
# expect: blender-smoke: OK (Blender 4.4.0); 320x240 srgba PNG with transparent film
```

## Recipes
Script-built scene, one frame:
```text
Blender -b --python render.py -- /abs/path/out.png
```
Existing file, frame range to a numbered sequence:
```text
Blender -b scene.blend -o //output/frame-#### -F PNG -s 1 -e 90 -a
```
Inside Python, set the engine by reading valid values rather than guessing:
```python
scene.render.engine = "BLENDER_WORKBENCH"   # or BLENDER_EEVEE_NEXT, CYCLES; TypeError lists valid ids
scene.render.film_transparent = True
scene.render.image_settings.color_mode = "RGBA"
```

## Clock rules
- `scene.frame_set(n)` before rendering a single still; `-s/-e` for ranges. Frame numbers are integers on Blender's own fps; convert from composition frames explicitly.
- Seed every randomised modifier or particle system; record `bpy.app.version_string` and the engine in the render manifest.

## Troubleshooting
- Blank or black frame: no camera assigned (`scene.camera`) or no light with Workbench studio lighting disabled.
- Output has no alpha: `film_transparent` false or `color_mode` RGB.
- Different pixels on another machine: Cycles GPU vs CPU and OpenColorIO config differ; treat as visually-equivalent reproducibility, not byte-exact.

## Official docs
https://docs.blender.org/manual/en/latest/advanced/command_line/render.html · https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html
