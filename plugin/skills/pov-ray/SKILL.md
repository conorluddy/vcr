---
name: pov-ray
description: Use POV-Ray's text scene language and CLI for reproducible CPU ray-traced images. Load when the scene should be defined as POV-Ray source; use Blender or Three.js for broader 3D workflows.
---

# POV-Ray

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace holding `vcr.json`.

## Use cases and limits
- Render code-authored scenes with POV-Ray's scene description language and command-line/INI settings.
- Evidence covers one primitive sphere-and-plane scene to RGB PNG with POV-Ray 3.7.0.10.unofficial on macOS arm64. CSG, animation, antialiasing, alpha, advanced materials, and other platforms remain untested.
- Prefer Blender for modern PBR, GPU rendering, denoising, existing meshes, or rigs.

## Capability map
POV-Ray exposes scene-language objects, textures, lighting, cameras, and render settings through its source format, INI files, and CLI switches. The [tutorial on INI files](https://wiki.povray.org/content/Documentation%3ATutorial_Section_2.2) describes setting resolution and input names; the [general output options](https://wiki.povray.org/content/Reference%3AGeneral_Output_Options) document image output controls. The fixture exercises a camera, light, sphere, plane, RGB PNG output, fixed resolution, and one worker. CSG, animation clock sequences, output formats beyond PNG, alpha, and quality controls are documented but not validated by this fixture.

## Install and doctor
```text
brew install povray
povray --version   # expect a 3.7.0.10 build
vcr doctor
```

The tested Homebrew build identified itself as `3.7.0.10.unofficial` from formula `3.7.0.10_17`. The fixture also uses ImageMagick (`magick`) to inspect decoded pixels. `vcr doctor` reports installed tools; it does not install them.

## Smoke test
```text
vcr example create pov-ray-sphere
cd examples/pov-ray-sphere && ./run.sh
# expect: "width": 128, "height": 96, "sphereRedPixels": 4128
```

The runner fixes the output size, disables antialiasing, uses one worker, then compares decoded RGB metrics and hash against `expected/metrics.json`.

## Recipes
```sh
# Render one PNG from a source scene with an explicit frame size.
povray -D +Iscene.pov +Ooutput.png +FN +W128 +H96 -A +WT1

# Put repeatable scene settings in an INI file, then render it.
povray render.ini
```

POV-Ray combines options from configuration/INI files and command-line switches; consult the options reference when precedence matters. The CLI recipe is scoped to the tested 3.7.0.10 build.

## Troubleshooting
- **The default config file is missing:** the observed run logged a missing `~/.povray/3.7/povray.conf` and rendered successfully with defaults; create the config only when you need custom settings.
- **Rendered metrics differ:** verify the POV-Ray build, input scene, output options, and worker count before deciding whether the expected file should change.
- **Unexpected alpha or image channels:** alpha output is not tested here; retain RGB checks for this fixture and validate a separate alpha route before relying on it.

## Official docs
- [POV-Ray 3.7 documentation](https://www.povray.org/documentation/)
- [INI files tutorial](https://wiki.povray.org/content/Documentation%3ATutorial_Section_2.2)
- [General output options](https://wiki.povray.org/content/Reference%3AGeneral_Output_Options)
