# vtracer colour trace of a generated flat-colour PNG

## Intent and scope

VCR job and claim: vtracer, in `colormode=color` with fixed settings, traces a
generated 240×240 flat-colour PNG (red circle, blue square, green triangle on
white) to SVG. The SVG contains `<path>` fills matching the three predeclared
colours. Rasterising the SVG with resvg and comparing it with the source gives,
per shape and for the white background, an intersection-over-union (IoU) and a
mean absolute error (MAE) within predeclared tolerances. A second trace in a
separate process gives byte-identical SVG and byte-identical rasterised PNG.

Tool: vtracer, PyPI `vtracer==0.6.15` (pinned in `requirements.txt`). Rasteriser:
resvg 0.47.0 (catalogued). Source construction: ImageMagick `magick` (catalogued).

Explicit exclusions:
- Only the PyPI 0.6.15 wheel is tested. The upstream GitHub project lists a newer
  release line (`1.0.0-alpha.4`, 2026-08-29); it is not tested and no claim is made for it.
- Only the four flat colours in `check.py` and the one fixed geometry in `run.sh`.
  Quality on photographs, gradients, anti-aliased artwork, or other settings is not claimed.
- No `binary` colour mode, `cutout` hierarchy, `polygon` or `none` mode, and no
  parameter sweep. The fixed settings are listed under the plan.
- Semantic preservation (for example, that the traced shapes are circles or
  squares) is not checked. Only pixel agreement with the source is measured.
- No browser rendering of the SVG. resvg is the only pixel source.
- Cross-platform byte identity is not claimed. Hashes are for this machine,
  this vtracer wheel and this resvg build.
- The shuffled-order and distinct-frame checks from the template do not apply:
  this is a single still with one input, not a sequence of seeked frames.

Tool documentation and licence sources, checked 2026-11-24:
- vtracer project: https://github.com/visioncortex/vtracer (MIT; `LICENSE` at
  master, `SPDX: MIT`, copyright TSANG, Hao Fung, 2024). Latest GitHub release
  `1.0.0-alpha.4`, published 2026-08-29; not the version tested.
- PyPI: https://pypi.org/project/vtracer/ and its JSON metadata. Version `0.6.15`
  is the latest PyPI release (wheels uploaded 2026-03-23); wheel metadata
  `License-Expression: MIT`. Parameter documentation is in the wheel's METADATA.
- resvg: https://github.com/linebender/resvg (MPL-2.0; CLI used unmodified).
- ImageMagick: https://imagemagick.org (ImageMagick licence; CLI used unmodified).
- No model, asset or font is used. The input is drawn by ImageMagick from the
  shape commands in `run.sh`. Output terms are not claimed.

Environment: macOS (Darwin 25.6.0), arm64, Python 3.12.2 from pyenv, ImageMagick
7.1.2-35 Q16-HDRI from Homebrew, resvg 0.47.0 from Homebrew. No GPU.

Input: origin is this repository; rights are those of the repository. Construction
recipe (in `run.sh`): `magick -size 240x240 xc:#FFFFFF`, then three filled shapes:
red `#DC1E1E` circle centre (60,60) radius 40; blue `#1E3CC8` rectangle
(130,20)–(209,99); green `#1EA03C` triangle (40,230), (120,140), (200,230). The
PNG is written to `output/source.png` and is not committed.

Dependencies and installation plan (pre-approved by the brief):
- Create `examples/vtracer-colour-trace/output/venv` (git-ignored) with pyenv
  Python 3.12.2 (`python3 -m venv`).
- `output/venv/bin/python -m pip install -r requirements.txt`, which pins
  `vtracer==0.6.15` only. The wheel is a compiled PyO3 extension.
- Nothing system-wide; no global package or shell change; no network needed at run time.
- Cleanup: remove `examples/vtracer-colour-trace/output`.

Selected workspace and output paths: `examples/vtracer-colour-trace/output/`
(ignored). Committed: `README.md`, `example.json`, `requirements.txt`, `run.sh`,
`trace.py`, `check.py`, and `expected/checks.json` (JSON only, no media).

## Plan, before running

Commands (from the repository root):
- One-time: `python3 -m venv examples/vtracer-colour-trace/output/venv` and
  `examples/vtracer-colour-trace/output/venv/bin/python -m pip install -r examples/vtracer-colour-trace/requirements.txt`.
- `examples/vtracer-colour-trace/run.sh --record`, then inspect the contact sheet,
  then `examples/vtracer-colour-trace/run.sh`, which must print `vtracer-colour-trace: OK`.

Fixed vtracer settings (`trace.py`, the Python binding's documented names):
`colormode='color'`, `hierarchical='stacked'`, `mode='spline'`,
`filter_speckle=4`, `color_precision=6`, `layer_difference=16`,
`corner_threshold=60`, `length_threshold=4.0`, `max_iterations=10`,
`splice_threshold=45`, `path_precision=8`.

Pipeline: `magick` draws `output/source.png`; `trace.py` writes `output/trace.svg`
in one process and `output/trace-rerun.svg` in a second process; `resvg` rasterises
both SVGs to 240×240 PNG; `check.py` performs the gating checks below and writes
`output/checks.json`, which `run.sh` diffs against `expected/checks.json`.

Predeclared gating checks (values in `check.py`, fixed before the first run):
1. Installed vtracer version is exactly `0.6.15`; resvg prints `0.47.0`.
2. Source contains each of the four palette colours (background, red, blue,
   green) on at least 1000 pixels, where each pixel is assigned to its nearest
   palette colour in RGB. Confirms the input was built as described.
3. The SVG root `width` and `height` are `240`, and the rasterised PNG is 240×240.
4. The SVG has `<path>` elements whose `fill` is within 16 per channel (max
   absolute difference) of each of red, blue and green.
5. For each of background, red, blue and green: IoU of nearest-palette class
   masks (source against rasterised, composited over white) is at least 0.95.
6. For each of red, blue and green: MAE (mean over RGB channels, 0–255) over the
   class's source bounding box, expanded by 3 px and clipped to the canvas, is at
   most 12.0.
7. The second process writes a byte-identical SVG (`cmp`), and the rasterised PNG
   from the rerun is byte-identical (`cmp`).

Retained measurements in `expected/checks.json`: per-class pixel counts, IoU
(6 dp), MAE (4 dp), bounding boxes, nearest fill channel differences, SVG and PNG
SHA-256, minimum rasterised alpha, and the pass/fail booleans.

Expected failure modes and stop conditions:
- Installed vtracer or resvg version differs: stop and report `blocked`.
- The trace fails to produce an SVG, or the SVG root is not 240 px: report `fail`.
- Any gating check fails: report `partial` if the numeric checks fail but the
  SVG is valid, otherwise `fail`. Do not change tolerances to pass.
- Reruns differ: report `fail` for the determinism claim.

How to inspect output: `output/contact.png`, built from the source and the
traced SVG rasterised at 240×240 (see the command in the observation below), is viewed by eye.

## Observation, after running

- Executor: Claude agent (claude-haiku-5-5), 2026-11-24; host `Conors-MacBook-Pro-2.local`;
  macOS 26.6 (Darwin 25.6.0) arm64.
- Versions: vtracer `0.6.15` (PyPI wheel, `output/dependencies.txt`). The SVG header
  written by the wheel reads `Generator: visioncortex VTracer 0.6.12`, so the Rust core
  reports a different number from the package version. Python 3.12.2 (pyenv, venv
  `output/venv`); resvg `0.47.0`; ImageMagick `7.1.2-35 Q16-HDRI`. Node `v22.19.0` is
  present but not used. Playwright and Chromium are not used.
- Commands: `run.sh --record` (passed, wrote `expected/checks.json`), then `run.sh`,
  which printed `vtracer-colour-trace: OK`. Contact sheet: `magick \( source.png
  rendered.png +append +repage \) -background '#808080' -flatten -resize 150% contact.png`
  in `output/`.
- Gating checks, all true: vtracer version pinned; source palette pixels (background
  38752, red 5097, blue 6400, green 7351); 240 px canvas; SVG fills match the palette;
  IoU at least 0.95 for all four classes; MAE at most 12 for all three shapes; SVG and
  rasterised PNG byte-identical across the two processes.
- Measured: IoU background 0.995123, red 0.981325, blue 1.0, green 0.987636. MAE red
  1.8518, blue 0.1347, green 1.4197 (0–255). Each of red `#DC1E1E`, blue `#1E3CC8`
  and green `#1EA03C` is exactly one `<path>` fill with zero channel error. The
  background path fill is `#FEFEFE`, one level off white; the raster is opaque
  (minimum alpha 255).
- Hashes: SVG `b2bb9a2b1b21eaf336a551fd50d0ee82d564de6e5665f1a13c331ccbffd46281`;
  rendered PNG `c43e8684f89ab618fbc31f5b579ef57463680a0b3b5532b412855f45b4ceccba`.
- Inspection: `output/contact.png` (source left, resvg raster of the traced SVG right)
  shows a red circle, a blue square and a green triangle on white, with clean edges,
  no clipping, no missing shape and no stray paths. The rerun raster is byte-identical
  to the first. Deviation from the plan: I viewed the contact sheet after the second
  run, not before it; the gating checks are unchanged.
- Result: **pass**.
- What this establishes: for this generated input (one fixed geometry, four flat
  colours) and these fixed settings, vtracer 0.6.15 in colour mode gives SVG fills that
  match the palette, and the resvg raster agrees with the source per shape within the
  predeclared tolerances, with byte-identical reruns on this machine.
- What it does not: photographs, gradients, anti-aliased artwork, other settings or
  colour modes, other vtracer versions (including upstream `1.0.0-alpha.4`), other
  platforms, the quality of traced geometry beyond pixel agreement, or whether the
  output is semantically a circle or square.
