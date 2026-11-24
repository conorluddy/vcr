# odiff frame diff

Status: partial, 2026-11-24 (odiff 4.5.0, macOS arm64). The `--aa` claim fails its predeclared exit-0 check; all other predeclared checks pass. Plan written before the first run; see the observation section below.

## Intent and scope

- Tool: odiff, pinned to `odiff-bin` 4.5.0 as a project-local dependency of this example (MIT; npm `latest` on 2026-11-24). The record's `npm install -g` route is not used.
- Claim: odiff compares generated PNG frames. Identical images report a match (exit 0, no diff written, 0 differing pixels). An image with a predeclared changed rectangle reports exactly that pixel count and writes a diff image that highlights it. `--antialiasing` ignores a 1-px antialiased edge change, as predeclared. `--threshold` behaves as documented on a near-identical colour shift. Results are stable across reruns.
- Exclusions: the Node `compare()` and server APIs (CLI only); JPEG, WebP and TIFF inputs (PNG only); `--diff-mask`, `--diff-overlay`, `--ignore` regions and `--reduce-ram-usage`; the layout-diff path (`--fail-on-layout`); any claim that odiff's threshold matches another tool's scale; any perceptual metric (see dssim); behaviour on other platforms or architectures.
- Documentation and licence: https://github.com/dmtrKovalenko/odiff (README and `odiff --help`), MIT per the npm metadata and the repository; checked 2026-11-24.
- Environment: macOS arm64 (Darwin 25.6.0), Node v22.19.0, pnpm 10.29.2, ImageMagick 7.1.2-35 Q16-HDRI on PATH, odiff 4.5.0 (`@odiff/darwin-arm64` 4.5.0 optional dependency). No GPU, no network during the run.
- Input: no media is committed. `run.sh` generates every frame with `magick` from literal colours and shapes written in the script. No external rights.
- Dependencies and side effects: `odiff-bin@4.5.0` and the workspace's existing dev tooling, installed by `pnpm install`. The workspace `pnpm-lock.yaml` changes locally and is not committed. Writes only `output/` (ignored) and `expected/metrics.json` on `--record`.
- Workspace and cleanup: `output/` is removed and rebuilt by each run.

## Plan, before running

Commands: `pnpm install` in the workspace, then `examples/odiff-frame-diff/run.sh --record`, then `examples/odiff-frame-diff/run.sh`. Every `run.sh` invocation generates frames twice in two directories (`run-1`, `run-2`), runs all odiff checks, and compares the two metrics files with `cmp`.

Fixture parameters (all in `run.sh`):
- Frames: 5 frames, 256x144 PNG24, background `#101820`, a 32x24 rectangle `#e0a030` at x = 16 + 40k, y = 60 for frame k = 0..4.
- Changed patch: frame 02 with a 20x10 rectangle `#ff0000` at x 100..119, y 60..69 (200 pixels, all inside the moving rectangle, all different colour). Independent cross-check: ImageMagick `compare -metric AE`.
- Antialiasing pair: a white circle centre (128,72), radius 52, against a radius-53 circle. The changed edge is a 1-px antialiased ring on each image.
- Threshold pair: 128x64 solid `#808080` against solid `#868686` (each channel +6, every pixel differs).

Predeclared checks (each is an assertion in `run.sh`):
1. Frame count: 5 frames exist, each 256x144 (`identify`).
2. Distinct hashes: the 5 frame SHA-256 values are all different (at least two distinct is required; 5 is predeclared).
3. Identical images: each frame compared with its regeneration exits 0, prints "Images are identical", and writes no diff file.
4. Changed rectangle: frame 02 vs patch exits 22, reports `diffCount` 200 and `diffPercentage` 0.54, `diffLines` 60..69 and `diffCols` 100..119 (via `--output-diff-lines --output-diff-cols --parsable-stdout`).
5. Argument order: the reversed comparison reports the same 200.
6. Diff image: `--diff-color '#00ff00'` writes a diff PNG in which exactly 200 pixels are `#00ff00` (histogram count), their bounding box is 20x10+100+60 (`magick -trim`), and ImageMagick `compare -metric AE` on the two inputs reports 200.
7. Antialiasing: the radius-53 vs radius-52 pair without `--aa` exits 22 with `diffCount` > 0. With `--aa` it exits 0 (match), as predeclared. Control: the 200-pixel patch still exits 22 with 200 when `--aa` is on, so the flag does not ignore solid-colour changes.
8. Threshold: the shift pair at `--threshold 0` exits 22 with `diffCount` 8192 (every pixel). The default threshold (0.1) exits 0. Across thresholds 0, 0.01, 0.02, 0.05, 0.1, `diffCount` is non-increasing.
9. Reruns: `metrics.json` from the two internal runs is byte-identical (`cmp`), and the SHA-256 of each diff PNG is the same in both runs. The `expected/metrics.json` diff must be empty.

Expected failure modes and stop conditions:
- A `diffCount` other than the predeclared 200 or 8192 is a fail, not a reason to change the expectation.
- If `--aa` does not produce a match for the radius-53 ring, the antialiasing claim is partial or fail. Its `diffCount` without the flag is still recorded.
- If odiff's threshold sweep is not non-increasing, the threshold claim is fail.
- Diff PNG hashes may depend on ImageMagick's PNG encoder. They are checked for same-host reruns only; a different magick build is a deviation to report, not a silent re-record.
- If `odiff` is not runnable from `node_modules/.bin`, stop and report blocked; do not install globally or substitute another tool.

Inspection: read `expected/metrics.json`, then open `output/contact.png` (the diff of frame 02 and its patch, with the frame strip) and check that the highlighted rectangle sits on the moving block.

## Observation, after running

- Date and executor: 2026-11-24, Conors-MacBook-Pro-2.local (macOS 25.6.0 arm64), run by a backfill worker.
- Versions: odiff 4.5.0 (`odiff-bin` 4.5.0 with `@odiff/darwin-arm64` 4.5.0, project-local in this example); ImageMagick 7.1.2-35 Q16-HDRI; Node v22.19.0; pnpm 10.29.2. Playwright and Chromium are not used.
- Commands: `./run.sh --record` (exit 1, one predeclared check failed), then `./run.sh` twice more (exit 1 each time, same single failure). Each invocation runs the whole check twice (`output/run-1`, `output/run-2`); `checks.kv` was byte-identical between them every time, and the output matched `expected/metrics.json`.
- Measured, against the predeclared checks:
  1. Frames: 5 frames, each 256x144; 5 distinct pixel signatures. Pass.
  2. Identical: each frame against its regeneration exits 0 with "Images are identical" for 5 of 5; with an output path given, no diff file is written. Pass.
  3. Changed rectangle: frame 02 against the 20x10 patch exits 22, 200 pixels, 0.54%, lines 60 to 69, columns 100 to 119. Reversed order: 200. Pass.
  4. Diff image (`--diff-color #00ff00`): exactly 200 green pixels, bounding box 20x10+100+60; ImageMagick's Difference-composite count is also 200. Pass.
  5. Antialiasing, radius-52 vs radius-53 white circle (1 px of antialiased edge change): without `--aa`, exit 22 with 512 pixels (1.39%). With `--aa`, exit 22 with 12 pixels (0.03%), scattered along the ring (lines 19 to 125, columns 75 to 181). Predeclared exit 0 not met. FAIL.
  6. Antialiasing control: the 200-pixel solid patch still exits 22 with 200 under `--aa`. Pass.
  7. Threshold, #808080 vs #868686 (every pixel differs by 6 per channel): `--threshold 0` exit 22, 8192 pixels; default exit 0; sweep 0, 0.01, 0.02, 0.05, 0.1 gives 8192, 8192, 8192, 0, 0. Non-increasing. Pass.
  8. Reruns: internal runs identical, identical to `expected/metrics.json`, pixel signatures stable. Pass.
- Deviations from the plan, all recorded here rather than silently changed:
  - The ImageMagick cross-check was first written as `compare -metric AE`. It returned an error sum (62.4837), not a pixel count, so it was replaced with a count of non-zero pixels in the Difference composite (200). The predeclared "AE" wording is therefore not what ran.
  - The plan asked for SHA-256 of frame and diff PNG files. ImageMagick's PNG bytes differed between two runs of the same script on this machine while the pixels were identical, so the checks use ImageMagick pixel signatures (`%#`) instead.
  - `run.sh` first aborted on the first failed predeclared check. It now counts failures, finishes the metrics, and exits 1. No expectation was loosened. `expected/metrics.json` records the observed `--aa` exit code 22 and the 12-pixel count as the baseline, so reruns catch drift; the predeclared exit-0 check is still failing.
- Inspection: `output/contact.png` (1280x288, built by hand from `output/run-1`, not by `run.sh`). Top row: frames 00 to 04; the orange block moves left to right. Bottom row: the patch diff shows a green 20x10 band at the top of the block; the no-`--aa` circle diff shows a green outline around the whole ring; the `--aa` circle diff shows no visible highlight at this scale, consistent with the 12 residual pixels. The frames and rectangle look as intended; nothing is blank or clipped.
- Result: partial. Seven of the eight predeclared check groups pass in full; group 5 fails its `--aa` exit-0 check, with 12 pixels left after antialiasing. The claim as predeclared is not met for `--aa`.
- What this establishes: on this machine, odiff 4.5.0 gives exact pixel counts, bounding box and diff highlights for PNG frames, exit codes distinguish match from difference, the default and explicit thresholds behave as documented on a uniform colour shift, and `--aa` removes most, not all, of a 1-px antialiased ring change (512 down to 12).
- What it does not establish: other odiff versions or platforms; the Node `compare()` and server APIs; JPEG, WebP or TIFF; `--diff-mask`, `--ignore` regions or `--reduce-ram-usage`; whether the 12 residual pixels are a bug or an intended limit of the antialiasing detector (not investigated further); any perceptual scoring.
- Reviewer and follow-up: none recorded. Revisit if odiff changes its antialiasing detection, or to decide whether the 12-pixel residual is an accepted limitation, which would need a new, dated claim rather than a changed expectation.
