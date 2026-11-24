---
name: ab-av1
description: Find the CRF that meets a target VMAF with ab-av1 crf-search, then encode at it. Load when a quality target, not a fixed CRF, should pick the setting; for a fixed encoder configuration use FFmpeg directly.
---

# ab-av1

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- `ab-av1 crf-search` samples the input, encodes and scores it, and reports the CRF predicted to meet `--min-vmaf`. `ab-av1 encode` then encodes at that CRF. Target values, chroma and checksums belong to the delivery pillar (`vcr rules info DELIVERY-REENCODE-PREVIEW`, `DELIVERY-CHROMA-SUBSAMPLING`, `DELIVERY-CHECKSUM`); this guide does not restate them.
- The fixture validates one case: `crf-search --min-vmaf 95 --preset 10` with `libsvtav1` on a 2 s generated 640x360 clip (FFmpeg `testsrc2`, 48 frames), then `encode` at the found CRF. Host: macOS arm64, ab-av1 0.12.0, FFmpeg 9.0.2 (libvmaf 3.2.x, svt-av1 4.3.0).
- Result: CRF 27.5 on 3 of 3 runs, predicted VMAF 95.055. Scored independently with FFmpeg `libvmaf` (`vmaf_v0.6.1`), the encode pooled 98.310. The prediction was conservative here by about 3.3 points; the gap is not reconciled (ab-av1 scores by its own route, and `ab-av1 vmaf` printed nothing in the session). Do not treat the predicted number as the delivered score: score the encode yourself with the [vmaf](../vmaf/SKILL.md) guide.
- Not tested: real footage, other encoders, presets or targets, XPSNR, `auto-encode`, size or time budgets, other machines. Repeatable CRF was seen on one host only.
- Neighbours: the encoder itself is the [svt-av1](../svt-av1/SKILL.md) guide (preset and CRF meaning); scoring is [vmaf](../vmaf/SKILL.md); fixed configurations and probing are the `ffmpeg` guide.

## Capability map
Discovery only, from the [README](https://github.com/alexheretic/ab-av1); documented does not mean validated. Run `ab-av1 <command> --help` for the options.
- **`crf-search` (tested):** `-i`, `--encoder`, `--preset`, `--min-vmaf`, `--samples`, `--sample-duration`, `--cache`, `--temp-dir`, `--stdout-format json`. Only the values in the recipe ran.
- **`encode` (tested):** `--crf`, `-o`, `--encoder`, `--preset`.
- **`vmaf` (untested):** score a pair of files; printed no score in the fixture session.
- **`sample-encode`, `auto-encode` (untested):** one sample encode; search plus full encode in one command.
- **XPSNR, other encoders, `--max-encoded-percent`, `--thorough` (untested).**
- **Output format:** JSON lines, see [stdout-format-json.md](https://github.com/alexheretic/ab-av1/blob/main/stdout-format-json.md). Only the `crf-search-done` record was read.

## Install and doctor
```sh
brew install ab-av1
ab-av1 --version
```
`vcr doctor` runs the record's check command. The fixture also needs `ffmpeg` built with `libvmaf` and `libsvtav1`, plus `ffprobe` and `jq`. Installation is not implied by this guide.

## Smoke test
```sh
vcr example create ab-av1-crf-search
cd examples/ab-av1-crf-search && ./run.sh
# expect: ab-av1-crf-search: OK
```
It runs three searches and one encode, requires predicted VMAF at least 95 on all runs, 48 frames, and a libvmaf pooled mean of at least 94.0 (the 1.0 tolerance was set before running), then diffs `expected/summary.json` (CRF 27.5, predicted 95.055, full encode 98.310). Recorded, not gated: equal CRFs across runs.

## Recipe
```sh
ab-av1 crf-search -i reference.mp4 --encoder libsvtav1 --preset 10 --min-vmaf 95 \
  --samples 1 --sample-duration 2s --cache false --temp-dir tmp --stdout-format json > search.jsonl
crf=$(jq -r 'select(.type == "crf-search-done") | .crf' search.jsonl | tail -n 1)
ab-av1 encode -i reference.mp4 --encoder libsvtav1 --preset 10 --crf "$crf" -o encoded.mp4
```
- `--preset` takes a numeric encoder preset (0 to 13 for SVT-AV1); it has no "fixed" value. Pin it so searches stay comparable.
- The clip is 2 s, so `--samples 1 --sample-duration 2s` samples the whole input. On longer inputs this choice is untested.
- Pass `--cache false` and a `--temp-dir` for a repeatable fixture; the default cache was not exercised.
- ab-av1 encodes SVT-AV1 at `yuv420p10le` by default. When scoring with libvmaf, convert both sides to the same format as the fixture does (`format=yuv420p`).
- Keep stdout JSON apart from logs: send stderr to a file.

## Troubleshooting
- `ab-av1` exits non-zero or finds no CRF: check that FFmpeg lists `libvmaf` (`ffmpeg -hide_banner -filters | grep libvmaf`) and the encoder.
- Predicted and measured scores differ: expected here (95.055 against 98.310); score the encode with libvmaf rather than trusting the prediction.
- The card was assessed at 0.10.2; the fixture ran 0.12.0. Re-run the example after upgrading, and if the `crf-search-done` record shape changes.

## Official docs
- [ab-av1 repository](https://github.com/alexheretic/ab-av1) and [JSON stdout format](https://github.com/alexheretic/ab-av1/blob/main/stdout-format-json.md); fixture checked 2026-11-24, tested 0.12.0 (links follow the default branch, not 0.12.0).
