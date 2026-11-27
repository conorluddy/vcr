---
name: openexr
description: Write and read float or half multi-channel EXR files from Python with the official OpenEXR wheel in a venv, choosing compression and checking channels. Load once OpenEXR has been chosen for exact EXR pixel or header work; use openimageio-oiiotool for conversion and compositing.
---

# OpenEXR (Python)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Write EXR from numpy arrays (render passes, depth, masks) and read them back exactly; pick the compression; inspect channels and the data window.
- Not for colour conversion, resize or compositing (`openimageio-oiiotool`), 8-bit rasters (`imagemagick`) or producing passes (`blender-background`).
- VCR evidence covers OpenEXR 3.5.5, numpy 2.5.5, Python 3.12, macOS arm64: scanline files, 32x24 data. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `OpenEXR.File(header, channels)`, `.write`, `.channels()`, `.header()` | [Python docs](https://openexr.com/en/latest/python.html) | tested |
| Compression: ZIP, PIZ, none | [compression](https://openexr.com/en/latest/TechnicalIntroduction.html) | tested, lossless |
| Compression: DWAA/DWAB, B44, PXR24, HTJ2K | same | untested (lossy ones will not be bit-exact) |
| Half and float32 channels | [Python docs](https://openexr.com/en/latest/python.html) | tested |
| Tiled, deep, multipart, mip maps | [Python docs](https://openexr.com/en/latest/python.html) | untested |
| `exrheader`, `exrcheck`, `exrinfo`, `exrmetrics` CLIs | [tools](https://openexr.com/en/latest/bin.html) | untested; the wheel does not ship them |

## Install and doctor
```sh
python3 -m venv output/venv && output/venv/bin/pip install OpenEXR==3.5.5 numpy
```
Project-local venv; `vcr doctor` does not probe it. Never install globally.

## Smoke test
```sh
cd examples/openexr-python-roundtrip && ./run.sh
# expect: openexr-python-roundtrip: OK
```
`run.sh` creates the venv from `requirements.txt` if missing, runs `check.py` twice, requires identical JSON and diffs it against `expected/metrics.json`.

## Recipes
```py
import numpy as np, OpenEXR
hdr = {"compression": OpenEXR.ZIP_COMPRESSION, "type": OpenEXR.scanlineimage}
chans = {"RGB": rgb_float32_hwc, "A": alpha_float32, "depth.Z": depth_float32}
with OpenEXR.File(hdr, chans) as f:
    f.write("out.exr")
with OpenEXR.File("out.exr") as f:
    header = dict(f.header())                       # copy before the file closes
    pixels = {k: np.array(v.pixels) for k, v in f.channels().items()}
```
A dotted name (`depth.Z`) is a layer prefix and stays a separate channel.

## Troubleshooting
- Reading returns R, G, B, A as one `RGBA` array (H x W x 4), not `RGB` and `A`.
- `ValueError: cannot coalesce channels into "RGBA"` when the four differ in pixel type (half RGB, float alpha): write them with one dtype, or read with `separate_channels=True`.
- `f.header()` entries are unusable after the `with` block ends; copy first.
- `OpenEXR.File(path)` raises on a non-EXR file; `OpenEXR.isOpenExrFile(path)` tests without raising.
- The Homebrew `openexr` formula provides `exrheader` and friends; the PyPI wheel does not.

## Official docs
- [OpenEXR documentation](https://openexr.com)
- [OpenEXR repository](https://github.com/AcademySoftwareFoundation/openexr)
- [OpenEXR on PyPI](https://pypi.org/project/OpenEXR/)
