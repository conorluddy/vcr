---
name: pygfx
description: Render a 3D scene from Python with pygfx on wgpu (Metal on macOS) to NumPy RGBA frames with no window or browser, the scene a pure function of t. Load once pygfx has been chosen for a Python-side 3D layer.
---

# pygfx

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Python in, RGBA arrays out: a lit mesh scene drawn offscreen through wgpu, one call per frame, in any order.
- For a browser scene captured by seeking use `three-js`; for scientific meshes and volumes use `vedo`; for path-traced shots use `blender-background`. Pipe frames to `ffmpeg` or save PNGs with Pillow.
- VCR evidence covers a box and a sphere with `MeshStandardMaterial`, ambient and directional lights, a background colour, a perspective camera, 320x180, on macOS 26 arm64 with Python 3.12 and an Apple M3 Pro Metal adapter. Everything else below is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Scene graph, cameras, lights, geometries, standard material | [guide](https://docs.pygfx.org/stable/) | tested |
| Offscreen canvas (`rendercanvas.offscreen`) | [rendercanvas](https://rendercanvas.readthedocs.io) | tested |
| Lines, points, text, volumes, gltf loading, post-processing, picking | [docs index](https://docs.pygfx.org/stable/) | untested |
| Other adapters (Vulkan, D3D, software) | [wgpu-py](https://wgpu-py.readthedocs.io) | untested |

## Install and doctor
```sh
python3 -m venv output/venv && output/venv/bin/pip install -r requirements.txt
```
Pin pygfx, wgpu, rendercanvas and pylinalg together (pre-1.0). `vcr doctor` does not probe it. Skip `glfw`; offscreen needs no window.

## Smoke test
```sh
cd examples/pygfx-offscreen-scene && ./run.sh
# expect: pygfx-offscreen-scene: OK
```
`run.sh` builds its venv when missing, then renders 24 frames in four ways and requires identical hashes, in two processes, against `expected/metrics.json`.

## Recipe: frame as a function of t
```python
from rendercanvas.offscreen import RenderCanvas
import pygfx as gfx, pylinalg as la, numpy as np

canvas = RenderCanvas(size=(320, 180), pixel_ratio=1)
renderer = gfx.renderers.WgpuRenderer(canvas)
# build scene and camera once; then per frame set transforms from t only
cube.local.rotation = la.quat_from_euler((0.5, angle, 0.3))
renderer.render(scene, camera)
frame = np.asarray(canvas.draw()).copy()   # (180, 320, 4) uint8
```
- Build once, mutate per frame from `t` alone; never accumulate state. Shuffled-order renders matched sequential ones.
- Copy the array: `canvas.draw()` may hand back a reused buffer.
- Rotations come from `pylinalg`; `pygfx.linalg` does not exist.
- Pick sample times that are not symmetry multiples: a cube turned in 90 degree steps looks static.

## Troubleshooting
- `AttributeError: module 'pygfx' has no attribute 'linalg'`: use `pylinalg`.
- Hashes are claimed only for the adapter that recorded `expected/`; on another GPU a diff is expected, so compare with a pixel tolerance there.

## Official docs
- https://docs.pygfx.org/stable/ (pygfx 0.18.0), https://wgpu-py.readthedocs.io, https://rendercanvas.readthedocs.io
