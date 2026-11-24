# VHS tape recording fixture

## Intent and scope

- Tool ID and version/build: `vhs` 0.12.1 (Homebrew, `vhs version 0.12.1`).
- VCR job and exact claim being tested: `vhs` runs a fixed `.tape` (Set Width, Height, FontSize, Framerate; two `Type` commands with a fixed TypingSpeed; `Sleep`) headlessly and writes an MP4, a PNG frame sequence in `Output output/frames/`, and an ASCII text golden. The outputs have the predeclared dimensions, a frame count and duration consistent with the tape's timings within a predeclared tolerance, and a final frame that contains the typed text.
- Explicit exclusions: frame-exact timing or seeking (vhs records in real time, so output is not a function of t); audio; WebM, GIF and Screenshot outputs; themes, fonts other than vhs's default, and colour fidelity; `Wait`, `Require` and interactive `record`; `vhs serve` and `publish`; byte-identical MP4 or PNG output (observed only, not gated); other platforms, shells and browsers.
- Tool documentation and licence sources, checked 2026-11-24: [VHS README](https://github.com/charmbracelet/vhs), [releases](https://github.com/charmbracelet/vhs/releases); licence MIT per the catalogue card. Tape inputs are authored here; no third-party media is used.
- Environment: macOS (Darwin 25.6.0) arm64 on Apple M3; no GPU route involved. Runtime: vhs drives ttyd and a headless Chromium. Google Chrome 158.0.8127.37 is installed at `/Applications/Google Chrome.app` and is expected to be the browser vhs finds; this is an observation, not a pinned input.
- Input: `demo.tape` (authored in this directory). No media input.
- Dependencies, installation plan, permissions, network and expected side effects: vhs 0.12.1, ttyd 1.7.7, FFmpeg 9.0.2 and ImageMagick 7.1.2 are already installed; nothing is installed by this fixture. If vhs tries to download a browser or any other dependency, the run stops and is reported `blocked`. No network access is intended.
- Selected workspace, generated output and cleanup paths: this example directory; the tape writes under ignored `output/`, which `run.sh` deletes and recreates each run.

## Plan, before running

- Exact commands: `vhs demo.tape` run from this directory with the tape writing `output/demo.mp4`, `output/golden.txt` and `output/frames/`; then `python3 check_output.py` for the ffprobe, ImageMagick and text checks. `run.sh --record` writes `expected/metrics.json`; `run.sh` diffs against it. Two vhs runs happen in total: one per invocation of `run.sh`.
- Tape timings (nominal, from the tape itself): `Type "echo alpha"` at `TypingSpeed 100ms` = 1.0 s; `Enter`; `Sleep 1s`; `Type "echo beta"` = 0.9 s; `Enter`; `Sleep 1s`. Nominal total 3.9 s. Framerate 10 gives a nominal 39 frames. Width 640, height 360, FontSize 20.
- Predeclared checks (all asserted by `check_output.py`; any failure exits non-zero):
  1. vhs exits 0 and writes all three outputs: `output/demo.mp4`, `output/golden.txt`, and at least one PNG in `output/frames/`. If `Output` for the text golden or the frame directory is rejected by vhs, the claim for that output is reported not supported.
  2. MP4 (ffprobe): video stream is h264, 640×360. First and last PNG frames are 640×360.
  3. Frame count: PNG count and MP4 decoded frame count each within 39 ± 10.
  4. MP4 duration within 3.9 ± 1.0 seconds.
  5. Golden text (`output/golden.txt`) contains the lines `echo alpha` and `echo beta` and at least two occurrences each of `alpha` and `beta` (command echo and output).
  6. Final frame contains the typed text: ImageMagick `compare -metric AE` between the first and last PNG frames is at least 1000 pixels.
  7. Gated across runs: `expected/metrics.json` must match exactly. It holds the version strings, the MP4 codec, dimensions, the boolean results of checks 1–6, and the SHA-256 of `golden.txt`.
  8. Observed, not gated: frame count, MP4 duration, pixel difference, MP4 and PNG-sequence hashes. These go to `output/observed.json` and are reported, not compared.
- Shuffled-order check: not applicable. vhs is not seekable; the tape is replayed in real time, so the claim is about one scripted recording, not about seeked frames.
- Intended consumer and handoff settings: a terminal-demo MP4 and PNG sequence for `ffmpeg-ffprobe` and `imagemagick` inspection only. Native asset workflow checks do not apply.
- Delivery constraints: none; no byte budget and no alpha.
- Expected failure modes and stop conditions: vhs cannot find a browser or attempts a download (stop, `blocked`); Output directory or text output rejected (partial); frame count or duration outside tolerance (fail, after recording the observed numbers); blank or clipped final frame (fail regardless of hashes).
- Reproduction instructions: `./run.sh --record` records the baseline; `./run.sh` checks it. Inspect with `cd output/frames && magick ...` contact sheet as in the template, and `cat output/golden.txt`.

## Observation, after running

Date and executor: 2026-11-24, Claude agent run in a VCR worktree on `Conors-MacBook-Pro-2.local` (macOS, Darwin 25.6.0, arm64, Apple M3).

Versions: `vhs` 0.12.1 (Homebrew), ttyd 1.7.7, FFmpeg/ffprobe 9.0.2, ImageMagick 7.1.2-35 Q16-HDRI, Google Chrome 158.0.8127.37 (the browser vhs was expected to launch; not independently confirmed), Python 3.12.2, Node v22.19.0 (installed; not used by this fixture).

Commands: a `--record` run, then a plain `./run.sh` run, each invoking `vhs demo.tape` once. The first `--record` attempt stopped at the PNG dimension check before writing any metrics; see deviations below.

Measured, two vhs runs:

| Measure | Record run | Check run | Predeclared | Result |
| --- | --- | --- | --- | --- |
| MP4 codec and size | h264, 640×360 | h264, 640×360 | 640×360 h264 | pass |
| PNG first/last size | 494×208 | 494×208 | 640×360 | **fail** |
| PNG files (cursor + text families) | 82 (41 + 41) | 78 (39 + 39) | 39 ± 10 | **fail** |
| MP4 decoded frames | 101 | 96 | 39 ± 10 | **fail** |
| MP4 duration | 4.04 s | 3.84 s | 3.9 ± 1.0 s | pass |
| golden text: both commands and outputs | yes | yes | yes | pass |
| golden text SHA-256 | `7dd0fde8…b175` | `7dd0fde8…b175` | matches across runs | pass |
| first vs last PNG differing pixels | 33,696 | 33,696 | ≥ 1000 | pass |

The sheet `output/contact.png` (text frames 1, 10, 20, 30, 36, 39 of the check run) shows the typing of `echo alpha` (`> e`, then the full command), the `alpha` output, `echo beta`, the `beta` output and the final prompt. Nothing is clipped at the terminal crop, and the final frame is not blank. The frames are 494×208 crops of the terminal content, not the 640×360 video frame; the MP4 keeps 640×360.

Deviations and limitations:

- Predeclared checks failed: PNG size, PNG frame count (all PNGs in `output/frames/`), and MP4 frame count. My 10 fps → 39-frame assumption did not hold for vhs 0.12.1: the MP4 is 25 fps-like (96–101 frames over about 4 s), and PNG output is two families, `frame-cursor-*` and `frame-text-*`. The thresholds were not changed. The text family alone was 41 frames in the record run and 39 in the check run, which sits inside 39 ± 10, but that is a post-hoc reading and not a predeclared pass; a corrected count check would need a new predeclaration in a new run.
- First `--record` attempt stopped at the PNG size check (`first PNG is (494, 208)`) before writing metrics. I then changed `check_output.py` so it reports every predeclared check and writes `metrics.json` and `observed.json` even when one fails. No threshold or check was removed. `run.sh --record` writes `expected/metrics.json` with `predeclared_checks_passed: false`; that file is a baseline of the failing run, not a pass gate.
- Plain `./run.sh` exits 1 while the predeclared checks fail and prints no `OK`. The second-run `OK` required by the template is therefore not achieved.
- Nondeterminism, observed and not gated: frame counts (82 vs 78, 101 vs 96), MP4 duration (4.04 vs 3.84 s), and MP4, PNG-manifest hashes all differ between runs. Only the golden text hash matched across the two runs.
- vhs is real-time, so no shuffled-order or seek check applies. The fixture does not show frame-accurate timing.
- Warning printed by vhs: `Host your GIF on vhs.charm.sh`; no publish was requested, and nothing was sent.
- No package was installed. Writes stayed in `examples/vhs-tape-recording/` (its `output/` is git-ignored) plus the catalogue record and back-links.

Pass / partial / fail: **partial**. Headless vhs wrote the MP4 at 640×360, a duration within tolerance, a golden text with the typed commands and output, and a final frame that shows the typed text. It did not meet the predeclared PNG dimension or frame-count checks, and its MP4 frame count is outside the 10 fps prediction. It does not establish seekable or frame-exact output, other shells, other browsers or any audio.

Reviewer and follow-up: a reviewer should decide whether a new predeclaration (PNG size 494×208, text family counts, MP4 frame rate) is worth a second run. Revisit if vhs changes its frame output or Framerate semantics, or when the Chrome version changes.
