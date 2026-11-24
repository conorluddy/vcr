---
name: drawsvg
description: Generate SVG frames from Python as a pure function of time with drawsvg, then rasterise them with resvg. Use when a Python-authored vector scene should become a PNG frame sequence without a browser.
---

# drawsvg

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Python writes one static SVG per frame time `t`; `skills/resvg` rasterises each to PNG; `skills/ffmpeg` assembles. Vector source stays editable.
- Tested: 5 frames at predeclared `t`, 480x270, transparent background, circle, rotated rectangle, gradient band, text in a bundled font.
- Not tested: SMIL or CSS animation, drawsvg's `native_animation`, frame-animation and video paths, `save_png` (cairosvg), `font_embed`, `randomize_ids`, browser rendering of these SVGs.
- DOM-rich motion or browser typography: use `skills/anime-js` or browser capture. Plain hand-written SVG: `skills/svg`.

## Capability map
Reference: [project home](https://tangled.org/cduck.me/drawsvg), [PyPI](https://pypi.org/project/drawsvg/). Discoverability only; the installed 2.5.1 package contains these modules.
- **Drawing and elements** (`drawing.py`, `elements.py`, `defs.py`): `Drawing`, `Circle`, `Rectangle`, `Text`, `LinearGradient`, `append`, `append_def`, `save_svg`. Tested.
- **Native SVG animation** (`native_animation/`): SMIL-style animation. Untested; resvg ignores SMIL.
- **Frame animation and video** (`frame_animation.py`, `video.py`): untested.
- **Raster export** (`raster.py`, extras `[raster]`/`[all]`): cairosvg route. Untested and not installed.
- **Font embedding** (`font_embed.py`), **Jupyter display** (`jupyter.py`, `widgets/`): untested.

## Install and doctor
```text
python3 -m venv output/venv && output/venv/bin/python -m pip install drawsvg==2.5.1
brew install resvg
vcr doctor
```
Use a venv under the example's `output/` (git-ignored), not `.venv` in the example. Nothing is installed unless `vcr doctor` says so. Validated: drawsvg 2.5.1, Python 3.12.2, resvg 0.47.0, macOS 26.6 arm64, see `examples/drawsvg-frames`.

Licence: the PyPI `License` metadata field is blank, but the classifier is `License :: OSI Approved :: MIT License` and the wheel ships `licenses/LICENSE.txt` (MIT text, Copyright 2023 Casey Duckering), reconfirmed on the 2.5.1 install.

## Smoke test
```text
vcr example create drawsvg-frames
# create output/venv and install requirements.txt as above, then:
(cd examples/drawsvg-frames && ./run.sh)
# expect: drawsvg-frames: OK
```
`run.sh` stops without installing if the venv or `resvg` is missing.

## Frame recipe
One function of `t`; the SVG bytes depend on nothing else.
```python
import drawsvg as dw
def build_frame_drawing(t: float, duration: float = 2.0) -> dw.Drawing:
    progress = t / duration
    drawing = dw.Drawing(480, 270, origin=(0, 0))          # no background rect: transparent
    drawing.append(dw.Circle(60 + 360 * progress, 80, 30, fill="#e4572e", id="moving-circle"))
    drawing.append(dw.Rectangle(210, 120, 60, 60, fill="#29335c", id="rotating-square",
                                transform=f"rotate({90 * progress!r} 240 150)"))
    drawing.append(dw.Text(f"t={t:.1f}s", 22, 240, 252, font_family="JetBrains Mono",
                           text_anchor="middle", id="caption"))
    return drawing
# drawing.save_svg(f"frame-{index:04d}.svg")
```
```text
resvg --skip-system-fonts --use-font-file fonts/JetBrainsMono-Bold.ttf frame-0000.svg frame-0000.png
```
- Give elements stable `id`s so a check can find them. Pass `id=` to gradients and reference them as `url(#id)`.
- Do not use `randomize_ids=True` (uses `random`; excluded).
- Format floats with `!r` in attribute strings so values are reproducible.
- `--skip-system-fonts` plus `--use-font-file` makes text come only from the bundled file: a missing family gives no text pixels (0 caption pixels without the font, 502-562 with it).
- Frame order does not matter: writing indexes 4, 1, 3, 0, 2 in one process gave SVGs byte-identical to sequential, and PNG hashes equal.

## What the fixture proved
12/12 gating checks: SVG attributes per frame, four colour probes and a transparent corner per frame (tolerance 4 per channel), 5 distinct PNG and SVG hashes, regeneration byte-identical, shuffled order identical, alpha 0..255 with anti-aliasing at `t=1.0`. PNG hashes are for this machine and resvg 0.47.0; another resvg may change them while probes still pass. Cross-platform byte identity is not claimed.

## Troubleshooting
- `run.sh` exits asking for `output/venv`: create it and install `requirements.txt`; there is no automatic install.
- Caption missing in PNG: the `font-family` does not match the bundled font's family name, or `--use-font-file` was omitted.
- `pip show drawsvg` reports an empty licence: expected; read the classifier and `licenses/LICENSE.txt`.

## Official docs
- https://tangled.org/cduck.me/drawsvg
- https://pypi.org/project/drawsvg/2.5.1/
- https://github.com/linebender/resvg
