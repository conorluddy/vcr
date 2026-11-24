---
name: f3d
description: Render a 3D asset (glTF/GLB tested) to a PNG still with one f3d command, fixed resolution and explicit camera, transparent background. Use for quick asset inspection images when a full Blender scene is not needed.
---

# f3d one-command still

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Tested: one generated GLB cube to 320x240 RGBA PNG stills with `--output`, transparent background, byte-identical reruns and A-B-A order, f3d 4.0.1 (VTK 9.7.1), macOS 26.6 arm64, Homebrew build. Evidence is PARTIAL (see Known failures).
- Enough for: a quick review image of an asset, with the camera set explicitly.
- Use Blender (`blender-background`) instead for authored scenes, chosen lights, materials beyond the file's own, path tracing, compositing, ranges or animation. Light and material judgement belongs to the `lighting` and `materials` pillars; f3d's default shading is not a look decision. No rule IDs are cited because those pillars have no rules file yet.
- Untested: formats other than GLB, textures, animation, other backends, other hosts, lighting or material fidelity, video.

## Capability map
Discovery only; docs are not VCR validation.
- CLI options (input, `--output`, `--resolution`, camera, background, coloring, HDRI, ambient occlusion, anti-aliasing, scalar colouring): [options](https://f3d.app/docs/user/options).
- Supported formats (glTF, USD, STEP, OBJ, PLY, splats and more): [supported file formats](https://f3d.app/docs/user/supported_file_formats).
- Configuration files, libf3d C++/Python API, interactive viewer: [docs index](https://f3d.app/docs/).
- Exercised by the fixture: `--output`, `--resolution`, `--no-background`, `--coloring-mode=material`, `--camera-position/-focal-point/-view-up/-view-angle`, `--no-config`, `--no-cache`, `--rendering-backend auto`. Everything else is untested.

## Install and doctor
```text
brew install f3d
f3d --version | head -1   # expect: F3D 4.0.1
```
`vcr doctor` reports whether it is installed; do not assume it is. Only the `cocoa` backend was available on the test host (`f3d --list-rendering-backends`).

## Smoke test
```text
vcr example create f3d-headless-still && (cd examples/f3d-headless-still && ./run.sh)
```
Currently this does NOT print `f3d-headless-still: OK`: no `expected/` was committed and the checker stops at its predeclared view-A region assertion (alpha bounding box bottom y=227 against a limit of 210). Recorded sample: view A sha256 `0175a3f1...dd06c2`, 2923 bytes; view B 1387 bytes; A after B identical to A.

## Still recipe
```text
f3d model.glb --no-config --no-cache --rendering-backend auto \
  --output out.png --resolution 320,240 --no-background --coloring-mode=material \
  --camera-position 2,1.5,2.5 --camera-focal-point 0,0,0 --camera-view-up 0,1,0 --camera-view-angle 30
```
- Set the camera explicitly. Auto-framing is generous: the cube's silhouette exceeded the region predeclared from the explicit camera, so never rely on defaults for framing.
- `--no-config --no-cache` keeps user config out of the run.
- Output was RGBA8 with transparent corners; centre pixel took the material colour.

## Known failures and unknowns
- Edges were hard: 0 partially transparent pixels, so the default has no antialiased edges. If edges matter (compositing over a plate), look for the antialiasing options in the options page; untested.
- "No window" is NOT established. The backend is `vtkCocoaRenderWindow`, which may briefly open a window; the check was blocked by missing Accessibility permission. Do not run it where a flashing window matters.
- Byte identity holds on one host and version only.

## Troubleshooting
- Object clipped or tiny: set camera position and view angle yourself.
- Jagged fringe over a plate: see edges above; otherwise render larger in Blender.
- Non-zero exit with no file: read `--verbose=info` output; the fixture logs to `<png>.log`.

## Official docs
- <https://f3d.app> and <https://github.com/f3d-app/f3d> (4.0.1).
