# ab-av1 CRF search to a VMAF target

Status: validated on macOS arm64 with ab-av1 0.12.0 and FFmpeg 9.0.2, 2026-11-24. The plan below was written before any recorded run; "Observation, after running" holds the result.

## Intent and scope

- Tool: `ab-av1` 0.12.0 (Homebrew formula, `ab-av1 --version`), a native Rust CLI driving the system FFmpeg 9.0.2 (`/opt/homebrew/bin/ffmpeg`, built with `libvmaf` and `libsvtav1`).
- Claim: `ab-av1 crf-search` on a 2 s generated 640x360 clip (`testsrc2`) finds a CRF for a `--min-vmaf 95` target with a fixed SVT-AV1 preset. The predicted VMAF it reports meets 95. Encoding at that CRF with `ab-av1 encode` and scoring the result with FFmpeg's `libvmaf` filter gives a pooled mean of at least 95 minus a predeclared tolerance of 1.0 (94.0).
- Exclusions: no XPSNR; no `auto-encode`; no claim about other encoders (`libx264`, `libx265`, `libvpx-vp9`) or other presets; no claim about real footage (a synthetic test pattern only); no size or time budget claim (`--max-encoded-percent` is left at its default of 80 and is not gated); no quality claim beyond VMAF model `vmaf_v0.6.1`; no CRF-equality claim across machines.
- Tool documentation: https://github.com/alexheretic/ab-av1 (README, `stdout-format-json.md`). Licence: MIT (upstream `LICENSE`, Copyright 2022 Alex Butler, read from `raw.githubusercontent.com/alexheretic/ab-av1/main/LICENSE` on 2026-11-24; the catalogue card also says MIT).
- Environment: macOS 26 (Darwin 25.6.0) arm64, Homebrew ab-av1 0.12.0, FFmpeg 9.0.2. CPU only; no GPU involvement.
- Input: none committed. `run.sh` generates `output/reference.mp4` with FFmpeg's `testsrc2` (deterministic), 640x360, 24 fps, 2 s (48 frames), lossless H.264 (`-crf 0`, `yuv420p`).
- Dependencies, installation plan, permissions, network: none added. `ab-av1` was installed earlier via Homebrew, and FFmpeg 9.0.2 is already installed; neither was changed. No npm package for this example and no network calls.
- Workspace and cleanup: writes only `output/` (gitignored, including the temp directory `output/tmp`). `rm -rf output` cleans up.

## Plan, before running

Exploratory probe (already run, not evidence): before writing this plan I ran the same `crf-search` arguments once in a scratch directory outside the repository, to learn the `--stdout-format json` record shape. It returned CRF 27.5 with predicted VMAF 95.05. The probe did not change the target, preset or tolerance below.

- Commands (run from this directory), with versions above:
  - Clip: `ffmpeg -y -loglevel error -f lavfi -i "testsrc2=size=640x360:rate=24:duration=2" -c:v libx264 -crf 0 -pix_fmt yuv420p output/reference.mp4`
  - Search, three times: `ab-av1 crf-search -i output/reference.mp4 --encoder libsvtav1 --preset 10 --min-vmaf 95 --samples 1 --sample-duration 2s --cache false --temp-dir output/tmp --stdout-format json`. The first run is the gated search; the two repeats test determinism.
  - Full encode at the first run's CRF (the CRF string as reported): `ab-av1 encode -i output/reference.mp4 --encoder libsvtav1 --preset 10 --crf <CRF> -o output/encoded.mp4`
  - Scoring: `ffmpeg -i output/encoded.mp4 -i output/reference.mp4 -lavfi "[0:v]format=yuv420p[d];[1:v]format=yuv420p[r];[d][r]libvmaf=model=version=vmaf_v0.6.1:pool=mean:log_fmt=json:log_path=output/full-vmaf.json" -f null -`. Both sides are converted to `yuv420p` because `ab-av1` encodes SVT-AV1 at `yuv420p10le` by default and the reference is 8-bit; the conversion is the same on both sides.
- Preset: the brief said "--preset fixed". `ab-av1 --preset` takes a numeric SVT-AV1 preset (0 to 13) and has no "fixed" value, so the preset is pinned to 10 (faster than the default 8, to keep the run short). This is the reading of "fixed" used here.
- Expected artifacts: `output/search-{1,2,3}.jsonl`, `output/encoded.mp4`, `output/full-vmaf.json`, and `output/summary.json`. `expected/summary.json` is the only retained file.
- Predeclared checks (any failure exits 1, and the summary is not diffed):
  1. Clip: `ffprobe` reports 640x360 and 48 frames for `output/reference.mp4`.
  2. Search found a result: a `crf-search-done` record exists in `output/search-1.jsonl`, and the command exits 0.
  3. Predicted target met: the first run's `vmaf` is at least 95.0.
  4. Repeats meet the target: the `vmaf` of runs 2 and 3 is also at least 95.0 (gated, because the claim is about the tool finding a target-meeting CRF).
  5. Encode frames: `output/encoded.mp4` has 48 frames.
  6. Full-encode target met within tolerance: the libvmaf pooled mean of `output/encoded.mp4` is at least 94.0 (95 minus the predeclared tolerance of 1.0), and the libvmaf log has 48 frames.
  7. `expected/summary.json` matches `output/summary.json` exactly (CRF values, predicted VMAF and full-encode VMAF rounded to 3 dp, frame counts, check booleans).
- Recorded, not gated: whether the three CRF values are equal (`crf_repeats_equal`), the predicted-minus-measured VMAF difference, and the encoded file's size.
- Stop conditions: if `ffmpeg -filters` does not list `libvmaf`, or `ab-av1` exits non-zero, report blocked or fail without changing the thresholds. A check failure is reported as fail. Do not move the 95 target, the 1.0 tolerance or the 94.0 bound.
- Reproduce: `./run.sh --record` once, then `./run.sh`, which should print `ab-av1-crf-search: OK`. Inspect `output/summary.json` and the `.jsonl` search logs with `jq`.
- Visual inspection after the run: a contact sheet of the encoded clip, to confirm the encode is not blank or clipped and shows the test pattern. (Sampling as planned: frames 0, 15, 30 and 45. The sheet actually built uses six frames, see Observation.)

## Observation, after running

- Executor and date: Conor's MacBook Pro (`Conors-MacBook-Pro-2.local`), 2026-11-24, from the `ab-av1-crf-search` worktree. Commands: `./run.sh --record`, then `./run.sh`, which printed `ab-av1-crf-search: OK` and exited 0.
- Versions: ab-av1 0.12.0 (Homebrew bottle, `ab-av1 --version`); FFmpeg 9.0.2 (`/opt/homebrew/bin/ffmpeg`, `--enable-libvmaf --enable-libsvtav1`); libvmaf 3.2.1 installed, and the `version` field the filter wrote into the JSON is 3.2.0; svt-av1 4.3.0 (Homebrew); ImageMagick 7.1.2-35 (contact sheet only); macOS 26.6 arm64. No Node, Playwright or Chromium is used by this example.
- Measured (`expected/summary.json`):
  - Search: CRF 27.5 on all three runs (`crf_repeats_equal: true`). Each run reported `crf-search-done` with VMAF 95.05485534667969 (predicted, rounded 95.055) and a predicted encode of 46.2% of the input size. All three predicted sizes were identical.
  - Full encode at CRF 27.5 (`ab-av1 encode --preset 10`): 296455 bytes (289.5 KiB), the same as the search's predicted size, 48 frames.
  - Scoring with FFmpeg `libvmaf` (`vmaf_v0.6.1`, pool mean, both sides `yuv420p`): pooled mean 98.310 (bound 94.0). Per-frame value at frame 0 is 96.62.
  - Predicted minus measured: the search predicted 95.055 and the full-encode libvmaf pooled mean was 98.310, so the search under-predicted by about 3.3 points here.
- Checks: all seven predeclared checks passed on the recorded run and the verification run (clip 640x360 with 48 frames, search record present, run 1 at 95.05 ≥ 95, runs 2 and 3 at 95.05 ≥ 95, encode 48 frames, encode pooled 98.31 ≥ 94.0, summary diff exact).
- Visual inspection: `output/contact.png` (six frames from the encoded clip, in order: source frames 0, 8, 16, 24, 32, 40). The plan named four frames (0, 15, 30, 45); six were used to match the brief's contact-sheet layout. This is a sampling change only; no predeclared check depends on it. Each frame shows the testsrc2 pattern: colour bars, the moving diagonal gradient bands, the grey moving bars, the checkerboard patches, and a timecode overlay that reads 0.000, 0.333, 0.667, 1.000, 1.333, 1.667 across the sheet. The frames are neither blank nor clipped, and the encode is not visibly degraded at this scale, which fits a score of 98.
- Deviations and limitations:
  - "--preset fixed" was read as a pinned numeric preset 10, since ab-av1 has no `fixed` value.
  - The exploratory probe described in the plan used the same arguments, and its output (CRF 27.5, predicted 95.05) matched the recorded run. The thresholds were not changed after it.
  - The predicted-versus-measured gap is not explained. ab-av1's internal sample VMAF and the FFmpeg `libvmaf` score use different routes (ab-av1 does its own scoring; this example scores in FFmpeg with an explicit 8-bit conversion). The `ab-av1 vmaf` command printed no score in this session, so the internal number was not read directly. The claim does not assert that predicted and measured values agree, so this does not change the result.
  - Only one synthetic clip, one encoder (`libsvtav1`), one preset (10) and one target (95) were tested. Repeatability was checked three times on one machine, so it says nothing about other hosts or other ab-av1 builds.
- Hashes (not retained): `output/reference.mp4` and `output/encoded.mp4` are not retained. The encoded size is 296455 bytes on this host.
- What this establishes: on this Mac, ab-av1 0.12.0 with FFmpeg 9.0.2 and svt-av1 4.3.0, `crf-search --min-vmaf 95 --preset 10` on a 2 s generated 640x360 clip finds CRF 27.5 with a predicted VMAF of 95.05 (≥ 95), three times in a row. Encoding at that CRF and scoring with FFmpeg `libvmaf` gives a pooled mean of 98.31, which is within the predeclared tolerance (≥ 94.0). It does not establish how accurate the predicted VMAF is, quality on real footage, behaviour of other encoders or presets, the XPSNR path, or CRF determinism on other machines.
- Reviewer, follow-up and revisit triggers: revisit if ab-av1's stdout JSON record shape changes (`crf-search-done`), if the predicted-versus-measured gap grows, or if the svt-av1 or libvmaf builds change. A follow-up could check the internal `ab-av1 vmaf` score against FFmpeg's libvmaf on the same pair.
