# PyVista off-screen sphere render

## Intent and scope

- Tool/version: PyVista 0.49.3 (PyPI, MIT) with VTK 9.7.2 (BSD), numpy 2.5.5. Pinned in `requirements.txt`; VTK and numpy come in as dependencies.
- Claim: on a Mac, `pv.Plotter(off_screen=True)` renders a lit mesh to a PNG with no window, using a fixed camera, window size and SSAA, and two separate processes produce identical pixels.
- Exclusions: Linux and Xvfb, other VTK or driver versions, movie writing, volumes, picking and interaction, textures, plots of scalar data, and any comparison against `vedo` rendering.
- Docs and licence: https://docs.pyvista.org and https://github.com/pyvista/pyvista; MIT from the installed metadata, checked 2026-11-27.
- Environment: macOS 26.6 arm64, Python 3.12.13 (uv), venv in `output/venv` (git-ignored), launched from a non-interactive agent shell.
- Input: a `pv.Sphere` literal in `render.py`; no files.
- Install: run.sh creates output/venv with python3.12 -m venv and pip install -r requirements.txt when it is missing; nothing is installed on the machine. The first run needs network. Cleanup: remove output/.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`. `render.py` runs twice in separate processes; the JSON and PNG bytes must be identical.
- Checks (all gating): version 0.49.3; image is 960x540 RGB; four corner pixels equal the background (16,24,40); sphere bounding box centred within 2 px; box is round (within 2 px) with diameter in 250-330 px; centre pixel is orange; orange pixels are 10-20% of the frame.
- Stop conditions: no image or a crash (record `blocked`), or the two processes differ (record `fail`).
- Failure interpretation: any failed check is `fail`; no claim about other platforms.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. Off-screen rendering worked headless on the first attempt, with no display setup and no Xvfb.

The first run failed two predeclared checks: the diameter was 524 px (declared 250-330) and orange covered 28.3% of the frame (declared 10-20%). The image, inspected at 960x540, is correct: a centred, smoothly shaded orange sphere on a dark background with the lower edge in shade. The bounds were my arithmetic slip, not a rendering fault: a unit sphere at distance 4 under a 30 degree view angle projects to 521 px by geometry.

Both checks were then replaced, and this is the change: the diameter must be within 6 px of the projected 521.1, and orange must cover 50-95% of the sphere's own silhouette (observed 68%). The replacements were written after seeing the first run, so they are weaker evidence than the other five checks, which did not change.

Final run: all 7 checks pass, pixel SHA-256 `ca5bdeb8...d61a`, identical across two processes. The hash belongs to this machine and VTK build; other GPUs or drivers may differ. This proves one still render, not quality or cross-machine repeatability.
