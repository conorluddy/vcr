---
name: dssim
description: Score a still image against a reference with dssim (multi-scale SSIM dissimilarity) and write per-scale difference maps. Load when a delivery or image-treatment check needs a full-reference still comparison; not for strict pixel equality, video or alpha.
---

# dssim

Perceptual dissimilarity of a still against a reference: 0 is identical, larger is more different. The VCR evidence covers dssim 3.4.0 (Homebrew, macOS arm64) on one generated opaque 256x256 RGB PNG. Other versions, alpha, 16-bit, greyscale and real photographs are untested.

## Use cases and limits
- Rank how much damage a re-encode or treatment did to a still (supporting evidence for `DELIVERY-BLOCKING`, `DELIVERY-REENCODE-PREVIEW`); a person still looks at the result.
- Scores are recorded samples, not pass/fail limits. No threshold is validated, and dssim says scores are not comparable across versions or tools. Compare scores only from one version.
- Strict pixel regression: `odiff`, or `magick compare -metric AE` (the `imagemagick` guide). Video: `vmaf`.
- Licence: AGPL-3.0 (Homebrew reports AGPL-3.0-or-later) with a commercial option, not verified here. Run it as an external CLI; never link or redistribute it in shipped code without a licence review.

## Capability map
Discovery only; documented does not mean validated. Upstream: [kornelski/dssim](https://github.com/kornelski/dssim).
- CLI score: `dssim reference.png other.png ...` prints one score per later file. Tested.
- `-o <file>` difference map: writes one map per scale. Tested for the scale-0 map; scales 1 to 4 were only checked to exist.
- Library `dssim-core` and C API: untested. Other flags (see `dssim --help`): untested.

## Install and doctor
```text
brew install dssim
dssim --help | head -3    # prints "Version 3.4.0"; there is no --version flag
vcr doctor
```
Do not use `pip install dssim`: PyPI `dssim` is an unrelated discrete-event simulator.

## Smoke test
```text
vcr example create dssim-still-compare && (cd examples/dssim-still-compare && ./run.sh)
# expect: dssim-still-compare: OK
```
Recorded samples (generated 256x256 RGB PNG vs ImageMagick JPEG round trips): self 0.00000000; q90 0.00087072, q50 0.02181509, q10 0.05846345.

## Score
```text
dssim base.png degraded.png
dssim base.png q90.png q50.png q10.png    # reference first, one line per file
```
- The score is the first field of each output line. Self-comparison gave exactly 0; the three degradations were strictly increasing; order of the later files did not change any score; reruns were identical.
- Inputs must be the same size (the fixture decoded each JPEG back to a same-size PNG).

## Difference maps
```text
dssim -o maps/q50.png base.png q50.png
# writes maps/q50.png-0.png (full size) ... maps/q50.png-4.png (smaller scales)
```
- Tested: the scale-0 map was 256x256, non-blank, and its mean grew with degradation (0.087, 0.342, 0.624), matching the visible damage on a contact sheet. Maps were byte-identical on rerun.
- Discoverable only, not tested: that the other four scales are the smaller maps, and how to read them. Self-comparison gave no map in the fixture.

## Hashing inputs
ImageMagick writes wall-clock `date:*` chunks when decoding a JPEG to PNG, so the bytes differ run to run while pixels do not. Decode with `-strip`: `magick q90.jpg -depth 8 -strip PNG24:q90.png`.

## Troubleshooting
- `-o` produced no file named `x.png`: it writes `x.png-0.png` to `x.png-4.png`.
- Input PNG hashes differ between runs but scores match: date chunks; use `-strip`.
- Scores differ from the samples above: check `dssim --help` for the version; the scale changes between versions.

## Official docs
https://github.com/kornelski/dssim
