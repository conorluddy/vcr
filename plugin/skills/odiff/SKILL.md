---
name: odiff
description: Compare two PNG frames pixel by pixel with odiff, get an exact differing-pixel count, bounding lines and columns, and a diff image. Load when a golden-frame or regression gate needs strict pixel equality; not for perceptual scoring, video or alpha.
---

# odiff

Pixel diff for still frames. Exit status separates match from difference. The VCR evidence is partial: odiff-bin 4.5.0, project-local, macOS arm64, generated 256x144 PNG frames from ImageMagick. Other versions, platforms and formats are untested.

## Use cases and limits
- Gate a rendered frame against a golden frame: identical gives exit 0 and no diff file; any difference gives exit 22.
- Count exactly how many pixels changed and where (`--parsable-stdout`, `--output-diff-lines`, `--output-diff-cols`).
- Antialiasing: `--aa` removed most but not all of a 1-px antialiased ring change (512 pixels down to 12, still exit 22). Do not rely on `--aa` to fully ignore antialiased edges; combine it with a pixel-count tolerance on `diffCount`.
- Perceptual score: `dssim`. Broad image manipulation or other metrics: `magick compare` (the `imagemagick` guide). Video: `vmaf`.
- odiff's threshold scale was not compared with any other tool's.

## Capability map
Discovery only; documented does not mean validated. Upstream: [dmtrKovalenko/odiff](https://github.com/dmtrKovalenko/odiff) (README and `odiff --help`).
- CLI compare `odiff a.png b.png [diff.png]`, exit codes, `--threshold`, `--diff-color`, `--aa`, `--parsable-stdout`, `--output-diff-lines`, `--output-diff-cols`: tested on PNG.
- `--diff-mask`, `--diff-overlay`, `--ignore` regions, `--reduce-ram-usage`, `--fail-on-layout`: untested.
- Node `compare()` and server APIs: untested. JPEG, WebP, TIFF inputs: untested.

## Install and doctor
```text
cd examples/odiff-frame-diff && pnpm install    # odiff-bin 4.5.0, project-local; no global install
examples/odiff-frame-diff/node_modules/.bin/odiff --version
vcr doctor
```

## Smoke test
```text
vcr example create odiff-frame-diff && (cd examples/odiff-frame-diff && ./run.sh)
# expect: odiff-frame-diff: OK (4.5.0 odiff, two runs identical)
```
The fixture is partial: `run.sh` currently exits 1 because the predeclared `--aa` exit-0 check fails (exit 22, 12 pixels). Everything else passes; `expected/metrics.json` records the 12-pixel baseline.

## Compare frames
```text
odiff a.png b.png                          # exit 0 "Images are identical"; exit 22 if pixels differ
odiff --parsable-stdout --output-diff-lines --output-diff-cols a.png b.png
# 200;0.54;60,61,...,69;100,101,...,119   (diffCount;diffPercentage;lines;cols)
odiff --diff-color '#00ff00' a.png b.png diff.png
```
- Tested: a 20x10 patch gave exactly 200 pixels (0.54%), lines 60 to 69, columns 100 to 119. Argument order did not change the count.
- The diff PNG had exactly 200 pixels in the diff colour, bounding box 20x10+100+60, matching an ImageMagick count.
- Identical inputs write no diff file, even when an output path is given.
- Sizes tested were equal; differing sizes untested.

## Threshold
- On a uniform shift of 6 per channel (#808080 vs #868686): `--threshold 0` gave 8192 of 8192 pixels, exit 22; the default (0.1) exit 0. Sweep 0, 0.01, 0.02, 0.05, 0.1 gave 8192, 8192, 8192, 0, 0: non-increasing.
- For strict gating use `--threshold 0`. Only this one colour shift was tested.

## Determinism
- Reruns gave identical counts, lines, columns and pixel signatures.
- The diff PNG bytes vary between runs. Hash pixel signatures (`magick identify -format '%#' diff.png`), not files.

## Troubleshooting
- Exit 22 means pixels differ, not an error; test `$? -eq 22` rather than non-zero.
- `--aa` still exits 22: expected, 12 residual pixels in the fixture. Gate on `diffCount` under a tolerance.
- File hashes differ but pixels match: PNG encoder bytes vary; compare signatures.
- `odiff` not found: it is project-local; call `node_modules/.bin/odiff` or `pnpm exec odiff`.

## Official docs
https://github.com/dmtrKovalenko/odiff
