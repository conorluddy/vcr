---
name: libvips
description: Resize and composite RGBA stills from the shell with the libvips `vips` CLI (thumbnail, composite2), keeping alpha. Use once libvips has been chosen over ImageMagick or sharp for scripted still-image work without Node.
---

# libvips (`vips` CLI)

Streaming image library with a command line. Evidence: `vips` 8.18.7 (Homebrew) on macOS 26.6 arm64, 2026-11-24 (`examples/libvips-resize-composite`). Anything beyond that fixture is marked untested.

## Use cases and limits
- Proven: `vips thumbnail` from a 4096x4096 RGBA PNG to exactly 1024x1024 (`--size force`), then `vips composite2 ... over` of a 256x256 RGBA overlay at an offset. Alpha band kept, probe pixels within 1 of predeclared values, reruns byte-identical.
- Observed, not a gate: peak memory 89.9 MB for the thumbnail and 17.8 MB for the composite on this machine, one run each.
- Untested: JPEG, WebP, TIFF, `dzsave` pyramids, ICC profiles and colour-managed conversion, other kernels or ratios, large batches, other versions or platforms, the Python bindings.
- From Node prefer `sharp` (it wraps libvips with a friendlier API). For broad effects, montage and compare use `imagemagick`; for colour-managed work `opencolorio` or `openimageio-oiiotool`.

## Capability map
Discovery only: documented, not validated by VCR unless marked.
- **Resize** — `thumbnail`, `resize`, `reduce`, `shrink`. Fixture: `thumbnail` only.
- **Composition** — `composite`, `composite2` (blend modes, `--x`, `--y`). Fixture: `composite2 over` only.
- **Inspection** — `vipsheader`, `getpoint`, `stats`. Fixture: `vipsheader -f`, `getpoint`.
- **Tiling and pyramids** — `dzsave`, `tiffsave`. Untested.
- **Colour and format** — `icc_transform`, `colourspace`, format savers via file suffix options. Untested.
- Index of every operation: https://www.libvips.org/API/current/ (`vips -l` lists them locally).

## Install and doctor
```text
brew install vips
vips --version     # expect vips-8.18.7 for this evidence
```
`vcr doctor` reports whether `vips` is present; do not assume it is installed.

## Smoke test
```text
examples/libvips-resize-composite/run.sh
# expect: libvips-resize-composite: OK
```
Needs `python3` for the generated inputs. It diffs dimensions, bands, seven pixel probes and the SHA-256 of the composite against `expected/metrics.json`. Timings and memory vary and are not diffed.

## Recipes
```text
vips thumbnail in.png thumb.png 1024 --height 1024 --size force
vips composite2 thumb.png overlay.png out.png over --x 300 --y 600
vipsheader -f width out.png ; vipsheader -f bands out.png    # 4 bands = RGBA
vips getpoint out.png 800 200                                # one pixel per call
/usr/bin/time -l vips thumbnail ...                          # peak memory on macOS
```
- `--size force` is what gives exact dimensions; without it thumbnail keeps aspect ratio.
- The half-transparent quadrant came through the resize as 29,179,59,128 against 30,180,60,128 in. The 1-level drift is rounding from premultiplied resampling. This is the evidence for `FX-PREMULT-EDGES`: soft edges did not fringe on this fixture, which has only hard solid-colour edges.

## Checking output
- Probe at known coordinates with `getpoint` and read bands with `vipsheader`, rather than by eye.
- Derive expected values from the recipe and the `over` formula, not from the output; allow a small tolerance.
- Compare reruns with `cmp`. Raw-pixel agreement is the portable check; the PNG hash held only for this build (`DELIVERY-MANIFEST`: record the libvips version beside it).
- Keep the alpha convention in the manifest (`FX-ALPHA-MASTER`, `DELIVERY-MASTER-ALPHA`); this fixture delivers straight RGBA PNG.

## Troubleshooting
- `dyld: Library not loaded` when running `vips`: seen once after a Homebrew upgrade of a dependency (OpenEXR) left the installed vips pointing at a missing library. Fix: `brew reinstall vips`, then `vips --version`.
- Output is not 1024x1024: `--size force` missing.
- Composite lost alpha (3 bands): check `vipsheader -f bands` on both inputs.
- Hash differs after a libvips upgrade while probes match: re-record with `./run.sh --record` after reviewing the diff.

## Official docs
- Site: https://www.libvips.org/
- Command line: https://www.libvips.org/API/current/using-cli.html
- Operation index: https://www.libvips.org/API/current/
- Licence stated there: LGPL-2.1-or-later.
