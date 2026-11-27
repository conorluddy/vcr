---
name: pixelsort
description: Pixel-sort a still with the pixelsort Python module or CLI: sort runs of pixels by lightness or hue inside threshold, whole-row, masked or angled spans. VCR evidence covers pixelsort 1.0.2 with Pillow 10.4.0 on macOS arm64; random intervals need a seed.
---

# pixelsort

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Sorts runs of pixels along rows (or columns with `angle`) by a key, for glitch stills and transitions. Tested: `threshold` and `none` intervals, `lightness` and `hue` keys, a mask, `angle=90`, and `random` intervals, on a generated 240x135 RGB image.
- Pure Python on Pillow: expect slow frames at 4K. For speed or other looks use `libvips` or `g-mic`; for ordinary resize, crop and montage use `imagemagick`. Where the effect sits in a treatment stack is `image-treatment`.
- Output is ascending: brighter pixels end up to the right of each span (top-down in columns at `angle=90`).
- Not tested: `edges`, `waves`, `file` and `file-edges` intervals; saturation, intensity and minimum keys; sequences; 4K timing; other Pillow versions.

## Capability map
Index: [README](https://github.com/satyarth/pixelsort#readme). The API is `pixelsort.pixelsort(image, mask_image, interval_image, randomness, char_length, sorting_function, interval_function, lower_threshold, upper_threshold, angle)`; the CLI is `python -m pixelsort in.png -o out.png` with the matching flags (`-i -f -t -u -c -a -r -s -m`).
- **Intervals:** `threshold`, `none` (whole rows), `random` and `random` widths via `-c`: tested. `edges`, `waves`, `file`, `file-edges`: untested.
- **Keys:** `lightness`, `hue`: tested. `saturation`, `intensity`, `minimum`: untested.
- **Mask, angle:** tested. **`randomness`** (percent of spans left unsorted): `100` verified as identity.

## Install and doctor
```sh
python3.12 -m venv examples/pixelsort-span-sort/output/venv
examples/pixelsort-span-sort/output/venv/bin/pip install -r examples/pixelsort-span-sort/requirements.txt
```
Pinned `pixelsort==1.0.2` and `Pillow==10.4.0`; `run.sh` builds this venv itself. A project dependency, not a machine executable, so `vcr doctor` does not check it. Do not install an unpinned Pillow: see Troubleshooting.

## Smoke test
```sh
examples/pixelsort-span-sort/run.sh
# expect: pixelsort-span-sort: OK
```
Needs network the first time (PyPI). It runs `check.py` twice, diffs the runs, then diffs `expected/metrics.json`; `output/sheet.png` is a contact sheet to look at.

## Recipes (tested)
```python
import random
from PIL import Image
from pixelsort import pixelsort

img = Image.open("in.png")
streaks = pixelsort(img, interval_function="threshold", lower_threshold=0.25,
                    upper_threshold=0.8, sorting_function="lightness")
bands = pixelsort(img, interval_function="none", sorting_function="hue")
random.seed(7)  # the only seed: global random, see below
glitch = pixelsort(img, interval_function="random", char_length=20, randomness=30)
```
- Output is RGBA. `mask_image` white = sortable, black = untouched (verified: protected pixels unchanged).
- Verified in the fixture: each span is non-decreasing in its key, and each row stays a permutation of the input row.

## Determinism
- `threshold`, `none`, masks and angle are deterministic: two processes gave identical pixels.
- `random` intervals, `waves` widths and `randomness` draw from Python's global `random` and there is no seed option. In the API call `random.seed(n)` immediately before the call; seeded output repeated across processes and seed 8 differed from seed 7.
- The CLI cannot be seeded: two `-i random` runs differed. For repeatable frames from the CLI use `threshold` or a mask.

## Troubleshooting
- `ImportError: cannot import name 'PyAccess' from 'PIL'`: pixelsort 1.0.2 imports a module newer Pillow removed (seen with Pillow 13.0.0). Use the pinned Pillow 10.4.0.
- `run.sh` fails on `python3.12`: the venv needs Python 3.12 on `PATH`.

## Official docs
- [Repository and README](https://github.com/satyarth/pixelsort)
- [1.0.2 on PyPI](https://pypi.org/project/pixelsort/1.0.2/)
