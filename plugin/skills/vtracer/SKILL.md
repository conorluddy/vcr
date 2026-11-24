---
name: vtracer
description: Trace a flat-colour raster into SVG paths with vtracer's Python binding, then check the result with a resvg raster. Load when colour artwork must become vector source; for one-bit input use Potrace.
---

# vtracer

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Colour raster to layered SVG `<path>` fills. Potrace traces one-bit bitmaps to a single colour; vtracer is the colour counterpart.
- Image treatment is a pillar (`FX-*`, see `references/fx/README.md`). A trace is a treatment of the source: judge it against the brief, and run `FX-DETERMINISM` (same input, same output) on the rerun. This guide sets no thresholds of its own.
- Evidence covers colour mode with one fixed settings set and one generated 240x240 PNG of three flat shapes on white. Not covered: photographs, gradients, anti-aliased artwork, other colour modes or settings, other platforms, and upstream `1.0.0-alpha.4` (only PyPI 0.6.15 ran). Keep the source raster if fidelity matters.
- The traced shapes are not checked to be semantically circles or squares; only pixels were compared.

## Capability map
Documented surface (see the [project README](https://github.com/visioncortex/vtracer) and the PyPI page): a Rust CLI, a Python binding (`convert_image_to_svg_py`, `convert_raw_image_to_svg`, `convert_pixels_to_svg`), and a web app. Parameters include `colormode` (color or binary), `hierarchical` (stacked or cutout), `mode` (spline, polygon or none), speckle, colour precision, layer difference, corner, length, splice and path precision.

VCR exercises only the Python binding in `color`, `stacked`, `spline` mode with the settings in `trace.py`. Binary mode, cutout, polygon and none modes, the CLI, in-memory pixel entry points and parameter sweeps are documented but untested here.

## Install and doctor
```sh
python3 -m venv examples/vtracer-colour-trace/output/venv
examples/vtracer-colour-trace/output/venv/bin/python -m pip install -r examples/vtracer-colour-trace/requirements.txt
examples/vtracer-colour-trace/output/venv/bin/python -m pip show vtracer
# expect: Version: 0.6.15
```
The `vcr doctor` check is the record's `check_command` (`pip show vtracer` in that venv); it does not install anything. The SVG header reads `VTracer 0.6.12`: the Rust core's number differs from the wheel's. The fixture also needs `resvg` 0.47.0 and ImageMagick `magick` on PATH.

## Smoke test
```sh
vcr example create vtracer-colour-trace
cd examples/vtracer-colour-trace && ./run.sh
# expect: vtracer-colour-trace: OK
```
Validated on macOS arm64, Python 3.12.2, resvg 0.47.0, ImageMagick 7.1.2. Recorded in `expected/checks.json`: each palette fill is exactly one `<path>` with zero channel error; resvg raster IoU 0.98 to 1.0 per shape (background 0.995); MAE 0.13 to 1.85 of 255 per shape; SVG and PNG reruns byte-identical (same machine and builds only). The background path fill was `#FEFEFE`, one level off white.

## Recipe
```python
import vtracer
vtracer.convert_image_to_svg_py("source.png", "trace.svg",
    colormode="color", hierarchical="stacked", mode="spline",
    filter_speckle=4, color_precision=6, layer_difference=16,
    corner_threshold=60, length_threshold=4.0, max_iterations=10,
    splice_threshold=45, path_precision=8)
```
Verify as the fixture does: `resvg trace.svg rendered.png`, then compare with the source per palette class (see the [resvg guide](../resvg/SKILL.md)). Run the trace in a separate process to confirm a byte-identical rerun.

## Troubleshooting
- `run.sh` exits asking for `output/venv`: create it as above; there is no automatic install.
- Fills near white are `#FEFEFE`, not `#FFFFFF`: compare with a channel tolerance rather than exact equality.
- Other settings or inputs: untested; re-run the checks rather than assuming the recorded scores.

## Official docs
- [vtracer project](https://github.com/visioncortex/vtracer)
- [PyPI vtracer 0.6.15](https://pypi.org/project/vtracer/0.6.15/)
