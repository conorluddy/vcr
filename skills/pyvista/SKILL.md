---
name: pyvista
description: Render a mesh to a PNG or numpy array off-screen from Python with PyVista (VTK), with a fixed camera and no window. Load once PyVista has been chosen for scientific mesh stills; vedo is the neighbouring VTK route.
---

# PyVista

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- A mesh, point cloud or volume in, a still PNG (or an `(H, W, 3)` numpy array) out, from a Python script with no window.
- It makes stills. For a full animated 3D scene use `blender-background`; for browser VTK use `vtk-js`; for mesh processing alone use `trimesh`; `vedo` is the other Python VTK wrapper.
- VCR evidence covers one sphere with smooth shading, SSAA and a fixed camera on macOS arm64, Python 3.12, from a non-interactive shell. Everything else below is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `Plotter(off_screen=True)`, `screenshot`, camera, background, anti-aliasing | [plotting](https://docs.pyvista.org/user-guide/index.html) | tested |
| Built-in shapes (`pv.Sphere`) | [API](https://docs.pyvista.org/api/index.html) | `Sphere` tested |
| Reading mesh files, filters, volumes, scalar plots | [API](https://docs.pyvista.org/api/index.html) | untested |
| Movie writing (`open_movie`, `open_gif`) | [plotting](https://docs.pyvista.org/user-guide/index.html) | untested |
| Interactive windows, picking, Jupyter backends | [user guide](https://docs.pyvista.org/user-guide/index.html) | untested |

## Install and doctor
```sh
python3.12 -m venv output/venv && output/venv/bin/pip install pyvista==0.49.3
```
A project-local venv: `vcr doctor` does not probe it. Pin the version; it brings its own VTK (9.7.2 here), which sets the renderer.

## Smoke test
```sh
cd examples/pyvista-offscreen-render && ./run.sh
# expect: pyvista-offscreen-render: OK
```
Creates its own venv in output/ on first run, renders twice in separate processes and requires identical JSON and PNG bytes, then diffs seven geometry checks against expected/metrics.json.

## Recipe: fixed-camera still
```python
import pyvista as pv
plotter = pv.Plotter(off_screen=True, window_size=(960, 540))
plotter.set_background((16, 24, 40))
plotter.enable_anti_aliasing("ssaa")
plotter.add_mesh(pv.Sphere(), color=(255, 140, 0), smooth_shading=True)
plotter.camera_position = [(0, -4, 0), (0, 0, 0), (0, 0, 1)]
plotter.camera.view_angle = 30.0
image = plotter.screenshot("scene.png", return_img=True)  # numpy (540, 960, 3)
plotter.close()
```
- Set window size, camera position, view angle, background and anti-aliasing yourself; defaults vary.
- Off-screen worked headless on macOS with no Xvfb or display setup (tested). Linux needs Mesa or Xvfb per the docs (untested).
- The image hash repeated across processes on one machine (tested); other GPUs or VTK builds may differ, so check geometry as well as hashes.
- Cast numpy booleans to `bool` before `json.dumps`.

## Troubleshooting
- A `json.dumps` `TypeError: Object of type bool is not JSON serializable` came from numpy booleans in the checks; wrap in `bool(...)`.
- Plan the expected geometry from the camera (a unit sphere at distance 4 with a 30 degree view angle is 521 px tall at 540 px), not from a guess; the fixture's first bounds were wrong this way.

## Official docs
- [PyVista documentation](https://docs.pyvista.org)
- [PyVista repository](https://github.com/pyvista/pyvista)
- [pyvista on PyPI](https://pypi.org/project/pyvista/)
