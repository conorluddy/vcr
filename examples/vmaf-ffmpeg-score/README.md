# VMAF score via FFmpeg libvmaf

Status: validated on macOS arm64 with FFmpeg 9.0.2 (libvmaf 3.2.0), 2026-11-24. The plan was written before any run; see "Observation, after running" for the result and one recorded amendment.

## Intent and scope

- Tool: `vmaf` (libvmaf 3.2.x, reached through FFmpeg 9.0.2's `libvmaf` filter, built in with `--enable-libvmaf`). The `vmaf` CLI is not used.
- Claim: FFmpeg's `libvmaf` filter scores a short generated reference clip against itself at a pooled-mean VMAF of at least 99, and against a deliberately degraded encode (60 kbit/s H.264) strictly lower and below 80, writing per-frame JSON.
- Exclusions: no subjective quality claim; no claim about other VMAF models (only `version=vmaf_v0.6.1`, built into libvmaf); no alignment, scaling or preprocessing tests (both clips are 320x180 at 24 fps and frame-aligned by construction); no claim that the CLI or other FFmpeg builds behave the same; no HDR, no 10-bit, no audio.
- Tool documentation: https://github.com/Netflix/vmaf (`resource/doc/ffmpeg.md`, `libvmaf/tools/README.md`). Licence: BSD-2-Clause-Patent, read from the upstream LICENSE file on 2026-11-24 (the card lists the same).
- Environment: macOS arm64 (Darwin 25.6.0), Homebrew FFmpeg 9.0.2 with `--enable-libvmaf`; no GPU, CPU only.
- Input: none committed. `run.sh` generates `output/reference.mp4` with FFmpeg's `testsrc2` (deterministic, no randomness), 320x180, 24 fps, 2 s (48 frames), lossless H.264 (`-crf 0`). The degraded clip is `output/degraded.mp4`, the same frames re-encoded at `-b:v 60k` with `-maxrate` and `-bufsize` at 60k.
- Dependencies, installation plan, permissions, network: none. FFmpeg 9.0.2 is already installed and is not changed. No `pnpm` package, no network, nothing outside this directory except the ignored `output/`.
- Workspace and cleanup: writes only `output/` (gitignored). Remove it with `rm -rf output` to clean.

## Plan, before running

- Commands (run from this directory):
  - `ffmpeg -y -loglevel error -f lavfi -i "testsrc2=size=320x180:rate=24:duration=2" -c:v libx264 -crf 0 -pix_fmt yuv420p output/reference.mp4`
  - `ffmpeg -y -loglevel error -i output/reference.mp4 -c:v libx264 -b:v 60k -maxrate 60k -bufsize 60k -pix_fmt yuv420p output/degraded.mp4`
  - Scoring, twice per pairing: `ffmpeg -i <distorted> -i output/reference.mp4 -lavfi "[0:v][1:v]libvmaf=model=version=vmaf_v0.6.1:pool=mean:log_fmt=json:log_path=output/<name>.json" -f null -`. Pairings: identical (reference against itself) and degraded (degraded against reference).
- Expected artifacts: four per-frame JSON logs under `output/`, and `output/summary.json`.
- Predeclared checks (any failure exits 1):
  1. Frame count: each JSON has `frames` length 48, and every frame has `metrics.vmaf`.
  2. Identical ceiling: `pooled_metrics.vmaf.mean` for the identical pairing is at least 99.0.
  3. Degraded bound: `pooled_metrics.vmaf.mean` for the degraded pairing is below 80.0.
  4. Ordering: identical pooled mean is strictly greater than degraded pooled mean.
  5. Determinism: the two reruns of each pairing are equal after removing the `fps` field, which is wall-clock speed and varies between runs (the only field that did in an exploratory check). Recorded as `rerun_identical` either way.
  6. `expected/summary.json` (rounded pooled means to 3 dp, frame counts, check booleans) matches `output/summary.json` exactly.
- Honest note on thresholds: the 99 ceiling is the brief's figure. The degraded bound of 80 and the 60k bitrate were chosen after one exploratory probe in a scratch directory outside the repository, which gave a degraded pooled mean of 68.2 and an identical pooled mean of 99.95 (also a 48-frame count). The probe was for learning the JSON layout and checking the libvmaf option syntax; its numbers are not evidence.
- Amendment, 2026-11-24, before any recorded result was kept: the first `--record` run passed every check, but the first verification run failed the diff (degraded pooled mean 67.697 became 65.778). The source `testsrc2` clip is byte-reproducible (same framemd5 every time), but the 60 kbit/s x264 encode with default threading produced a different decoded stream on each encode (three encodes, three framemd5 values). The degraded score therefore depended on encoder threading. Fix: the degraded encode is single-threaded (`-threads 1`, `threads=1:lookahead_threads=1:sliced_threads=0`); four single-threaded encodes gave one framemd5 and two scorings gave the same pooled mean (71.821892 for a test clip). Bitrate, model, thresholds and checks are unchanged. The first record is discarded and `expected/` is re-recorded.
- Visual inspection after the run: a contact sheet of reference and degraded frames side by side, to confirm the degraded frames visibly differ and the reference is not blank.
- Stop conditions: if `ffmpeg -filters` does not list `libvmaf`, or the JSON has no `pooled_metrics.vmaf`, stop and report blocked. If a pooled-mean check fails, report fail; do not move the thresholds.
- Reproduce: `./run.sh --record` once, then `./run.sh` (expect `vmaf-ffmpeg-score: OK`). Inspect `output/summary.json` and the JSON logs with `jq`.

## Observation, after running

- Executor and date: Conor's MacBook Pro (`Conors-MacBook-Pro-2.local`), 2026-11-24, from the `vmaf-ffmpeg-score` worktree.
- Versions: libvmaf 3.2.0 (the `version` field the filter writes into each JSON; Homebrew has libvmaf 3.2.1 installed and `pkg-config` reports 3.2.0, so the exact library the filter loaded is not pinned further); FFmpeg 9.0.2 (`--enable-libvmaf`, `/opt/homebrew/bin/ffmpeg`); jq 1.8.1; ImageMagick 7.1.2-35 (contact sheet only); macOS 26.6 arm64. No Playwright, Chromium or Node involved.
- Commands: `./run.sh --record` (once, after the amendment), then `./run.sh` twice. Both verification runs printed `vmaf-ffmpeg-score: OK` and exited 0.
- Measured (`expected/summary.json`):
  - Identical pairing: 48 frames, pooled VMAF mean 99.946 (ceiling 99.0). Per-frame min 97.43 at frame 0, then 100.0 on frames 1 to 47. The pooled mean meets the ceiling; the per-frame figure does not reach 100 at frame 0.
  - Degraded pairing (60 kbit/s H.264, single-threaded): 48 frames, pooled VMAF mean 71.822 (bound below 80.0). Per-frame range 60.79 to 90.80; frames 0, 15, 30, 45 score 80.27, 74.87, 69.26, 60.79.
  - Ordering: identical 99.946 > degraded 71.822.
  - Frame count: 48 in every JSON; every frame carries `metrics.vmaf`.
  - Rerun determinism: both reruns of each pairing are equal after removing `fps` (the wall-clock speed field, the only key that varied). Across `run.sh` invocations the pooled means matched `expected/` to 3 dp, and the encodes decode to identical framemd5 values (reference `222dec94...`, degraded `1d9982bf...`). Result: deterministic.
- Hashes (not retained as media): `output/reference.mp4` sha256 `9470713e...`, `output/degraded.mp4` sha256 `33bc333b...`; these were produced by this host's x264 and are not portable expectations.
- Visual inspection: `output/contact.png`, reference frames 0, 15, 30, 45 in the top row and the same frames of the degraded clip in the bottom row. Both rows show the testsrc2 pattern (colour bars, moving diagonal bands, the top-left timecode). The degraded row is visibly softer: colour edges smear and block, and the small timecode and fine marks are less crisp. The frames are not blank or clipped. The visible degradation is modest at this scale, which is consistent with a score of 72 rather than near 0.
- Defects found and corrected: the first `--record` used a multi-threaded degraded encode. Its verification run failed on the degraded mean (67.697 then 65.778). Cause: x264 at this bitrate with default threading decoded to a different stream on each encode. Fix and evidence are in the amendment above; the first record was discarded.
- Deviations and limitations: the degraded bound and the 60 kbit/s bitrate were chosen after one exploratory probe (which had no `-maxrate`/`-bufsize`). The probe is not evidence. Only the `vmaf_v0.6.1` model was tested; the `vmaf` CLI was not run (a `vmaf` binary is at `/opt/homebrew/bin/vmaf`, unused); no alignment, scaling, HDR or audio. The identical-pairing per-frame value at frame 0 is below 100, which means the ceiling is claimed on the pooled mean only.
- What this establishes: on this Mac, FFmpeg 9.0.2's `libvmaf` filter with `model=version=vmaf_v0.6.1` and `pool=mean` writes per-frame JSON for a 48-frame generated 320x180 clip, scores it at pooled 99.946 against itself and 71.822 against a single-threaded 60 kbit/s encode, and the two reruns agree. It does not establish quality ground truth, behaviour of other models, the CLI, other FFmpeg builds, other platforms, or any threading setting other than `-threads 1` for the degraded encode.
- Reviewer, follow-up and revisit triggers: revisit if FFmpeg or libvmaf changes its JSON field names or pooling, if the x264 build changes (the single-threaded decode hash may move), or if a new VMAF model becomes the default. Follow-up: a second model and a CLI run would be a separate evidence entry.
