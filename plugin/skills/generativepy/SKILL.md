---
name: generativepy
description: Draw procedural 2D frames from Python with generativepy on pycairo and write them as PNGs, each a pure function of its frame number. Load when a plain Python function per frame suits better than a scene model or a browser.
---

# generativepy

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Evidence: generativepy 50.0 on pycairo 1.29.2 / Cairo 1.18.6, Python 3.12.2, macOS arm64 (`examples/generativepy-frames`, 2026-11-24). Anything beyond that fixture is marked untested.

## Use cases and limits
- Proven: `Circle`, `Rectangle` and one `LinearGradient` fill drawn into 48 PNG frames of 320x240 (cairo ARGB32, `channels=4`, unpainted background stays transparent), through `make_images` (in order) and `make_image` (one frame, any order).
- Frames are identical whether rendered in order or shuffled, and byte-identical on rerun, on this machine only. PNG bytes depend on the Cairo and libpng builds, so do not claim cross-machine hashes.
- Untested: movie or GIF output (`movie.py` needs moviepy and ffmpeg), SVG, text, paths, polygons, strokes, numpy-array frames (`make_image_frames`), matplotlib, tweens, the library's random generator.
- Choose it when each frame is a plain function `draw(ctx, width, height, frame, count)` over data or maths. Choose Manim (`manim-community`) when you want a scene model with mobjects and `play`/`wait` timelines; generativepy has no timeline, you compute positions from `frame / count` yourself. For browser or DOM motion use `canvas-2d` or `anime-js`; for static scientific plots, matplotlib.

## Capability map
[generativepy docs](https://generativepy.readthedocs.io/en/latest/) cover the `drawing` module (`make_image`, `make_images`, `make_image_frames`, bitmap and nparray routes), `geometry` (shapes, gradients, text), `color`, `tween`, and `movie`. VCR exercises only `drawing.make_image`, `drawing.make_images`, `geometry.Circle`, `geometry.Rectangle`, `geometry.LinearGradient` and `color.Color`. Everything else is documented but untested; this map is for discovery, not validation.

## Install and doctor
Isolated environment under the example's ignored `output/`; pycairo builds against the system Cairo, so `pkg-config --modversion cairo` must print a version first (`brew install cairo pkg-config` if not; the fixture needed no brew install).
```text
python3 -m venv examples/generativepy-frames/output/venv
examples/generativepy-frames/output/venv/bin/pip install -r examples/generativepy-frames/requirements.txt
vcr doctor
```
`requirements.txt` is a full pin (`generativepy==50.0`, `pycairo==1.29.2`, moviepy and others). `vcr doctor` does not check this tool; the card's install check is `python3 -m pip show generativepy`.

## Smoke test
```text
examples/generativepy-frames/run.sh
# expect: generativepy-frames: OK
```
It generates twice, checks counts, size, distinct hashes, shuffled equals sequential, rerun identity, alpha range and five pixel probes, then diffs `expected/checks.json` (frame digest `4408bd59...`).

## Frame contract
```python
def draw_frame(ctx, width, height, frame_number, frame_count):
    progress = frame_number / frame_count          # the only input
    Circle(ctx).of_center_radius((width / 2 + 80 * math.cos(2 * math.pi * progress), 100), 18).fill(Color(1.0, 0.8, 0.1))

make_images("out/frame", draw_frame, 320, 240, 48, channels=4)   # frame00000000.png ...
make_image("out/frame00000024", draw_for(24), 320, 240, channels=4)  # one frame, any order
```
- Derive everything from the frame number and count; read no clock, random source or earlier frame. That is what made shuffled output equal sequential.
- `make_image` takes a draw function of the same five-argument shape; the fixture wraps it to pass the real frame number (`draw_numbered_frame` in `generate.py`).
- Gradients: `LinearGradient().of_points(p0, p1).with_stops([(0, Color(...)), (1, Color(..., 0.0))]).build()` then `.fill(gradient)`.
- Read pixels back with `cairo.ImageSurface.create_from_png`; data is premultiplied BGRA, stride 1280 at 320 wide.

## Troubleshooting
- Runner says the venv is missing: create it as above; there is no automatic install.
- pycairo build fails: Cairo not visible to `pkg-config`; install it first.
- `NameError` in the shuffled pass: the main block ran before its helper was defined; keep helpers above the `__main__` block.
- Hashes differ from `expected/` after a Cairo or pycairo upgrade: probes may still hold; re-verify before re-recording.

## Official docs
- [generativepy on GitHub](https://github.com/martinmcbride/generativepy)
- [generativepy 50.0 on PyPI](https://pypi.org/project/generativepy/)
- [generativepy documentation](https://generativepy.readthedocs.io/en/latest/)
- [pycairo](https://pycairo.readthedocs.io/)
