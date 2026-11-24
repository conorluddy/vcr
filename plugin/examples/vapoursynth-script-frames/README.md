# VapourSynth script frames

Status: validated on macOS arm64 with VapourSynth R82 (API R4.3) and FFmpeg 9.0.2, 2026-11-24. Result: pass for the claim as scoped below.

## Intent and scope

- Tool: VapourSynth, Core R82, API R4.3 (Homebrew formula `vapoursynth` 82, linked at `/opt/homebrew/bin/vspipe`).
- VCR job and exact claim: a `.vpy` script builds a clip from core functions only (two solid RGB clips spliced, a per-frame crossfade through `std.Merge` with a weight from `std.FrameEval`, `resize.Bicubic` to YUV420P8). `vspipe` writes Y4M that is piped to FFmpeg, and `vspipe --info` reports the format. Frame count, dimensions, fps and format match predeclared values; predeclared pixel values at known frames match; frames requested out of order with `vspipe -s/-e` equal the sequential frames; reruns are byte-identical.
- Explicit exclusions: no third-party plugins (only the `core` namespace is used); no alpha; no visual quality or colour-science claim beyond the predeclared BT.709 limited-range values; no mux or container byte identity (the MP4 is checked by ffprobe fields only, and its bytes are not hashed); no check of other output formats or other filters; no check of the script's behaviour on Linux or Windows.
- Documentation and licence: `https://www.vapoursynth.com/` (listed on the tool card); Homebrew formula licence LGPL-2.1-or-later, checked 2026-11-24. The embedded Python is Python 3.15.2 from the Homebrew VapourSynth venv at `/opt/homebrew/Cellar/vapoursynth/82/libexec/bin/python`, which is the interpreter `vspipe` uses for `import vapoursynth`. Not the system `python3` (3.12.2, which has no `vapoursynth` module).
- Environment: macOS 25.6.0 arm64 (Darwin), Homebrew. FFmpeg 9.0.2 with libx264 for the piped MP4 step. Node is not used. No GPU.
- Input: none. The script generates its clips with `BlankClip`; no media is read or committed.
- Dependencies and installation: `vapoursynth` is already installed through Homebrew (`brew install vapoursynth`, recorded in the tool record's `install` field; check command `vspipe --version`). No plugins, no pip packages. `ffmpeg` and `ffprobe` are already on the path. `check.py` uses only the Python standard library and runs with `python3 -I`.
- Workspace: `output/` (ignored) holds the Y4M files, `info.txt`, the MP4 and its probe. `expected/` holds JSON only.

## Plan, before running

- Commands, in `run.sh`:
  1. `vspipe --info scene.vpy output/info.txt`
  2. `vspipe -c y4m scene.vpy output/sequential.y4m`, then again to `output/rerun.y4m` (reruns must be byte-identical).
  3. For each range in `expected/pixels.json` `outOfOrderRanges`, run `vspipe -c y4m -s START -e END scene.vpy output/range-START-END.y4m` in a separate process, in the listed order: 60-71, 0-11, 36-47, 24-35 (the reverse of the sequential order for the first, and non-monotonic throughout).
  4. `vspipe -c y4m scene.vpy - | ffmpeg -y -i - -c:v libx264 -pix_fmt yuv420p output/vs.mp4`, then `ffprobe -count_frames` on the MP4.
  5. `python3 -I check.py` diffs against `expected/`.
  6. `ffmpeg -i output/sequential.y4m output/frames/frame-%04d.png` for a visual contact sheet (inspection only, not a check).
- Predeclared checks (all in `expected/`):
  - `info.json`: width 320, height 180, 72 frames, fps 24/1, format YUV420P8, no alpha.
  - Y4M header and frame payloads: 320x180 4:2:0, 72 frames, each payload 86400 bytes.
  - Pixel values in `pixels.json`, tolerance ±2 code values, sampled at luma (160,90) and chroma (80,45). The expected values come from BT.709 limited-range conversion of the script's colours, computed before running: red (200,40,40) gives Y 80, U 112, V 198; blue (40,80,220) gives Y 86, U 194, V 105; the crossfade midpoint at frame 36 (weight 12/23, RGB about (117,61,134)) gives Y 83, U 154, V 150. Frames 0 and 24 are red, 47 and 71 are blue.
  - Out-of-order: each range's frames equal the sequential frames with the same index, byte for byte.
  - Reruns: `sequential.y4m` and `rerun.y4m` are byte-identical, and match the sha256 recorded in `expected/hashes.json` (recorded from the first run; this is a regression baseline).
  - `ffprobe.json`: h264, 320x180, yuv420p, 24/1, 72 frames read.
- Expected failure modes and stop conditions: a `vspipe` evaluation error (script exits non-zero, which stops `run.sh`); a Y4M header with other dimensions; a frame count other than 72; a pixel outside tolerance; any out-of-order frame differing from sequential. Any of these is a fail for the claim, not a reason to change the predeclared values.
- Reproduction: `examples/vapoursynth-script-frames/run.sh`. Inspect output with `output/info.txt`, `output/sequential.y4m` (via `vspipe` or FFmpeg), and the contact sheet made from `output/frames/`.

## Observation, after running

- Date and executor: 2026-11-24, Claude agent in a worktree, on `Conors-MacBook-Pro-2.local` (hostname).
- Versions: VapourSynth Core R82 and API R4.3 (`vspipe --version`), embedded Python 3.15.2 in the Homebrew venv that `vspipe` runs, FFmpeg/ffprobe 9.0.2 (libx264 encoder), macOS 26.6 arm64. Playwright, Chromium and Node are not used here.
- Commands: `./run.sh --record` then `./run.sh`. The second run printed `vapoursynth-script-frames: OK`. The record run was repeated once after changing only the contact-sheet frame numbering (`-start_number 0`); the hash did not change.
- Checks, all passed on the second run: `info.txt` (320x180, 72 frames, 24/1, YUV420P8, no alpha); Y4M header 320x180 with 72 frames; pixel samples at luma (160,90) and chroma (80,45), measured exactly as predicted: frame 0 Y80 U112 V198, frame 24 the same, frame 36 Y83 U154 V150, frame 47 Y86 U194 V105, frame 71 the same as 47. Out-of-order ranges 60-71, 0-11, 36-47 and 24-35 each matched the sequential frames byte for byte. `sequential.y4m` and `rerun.y4m` both have sha256 `22cf3fd4d4958cbaefb8af2944f0b87f16ada2e6f43ac3b4e2a63f8701bc1353`, matching `expected/hashes.json`. The piped MP4 probes as h264 320x180 yuv420p 24/1 with 72 frames read.
- Contact sheet: `output/contact.png`, frames 0, 15, 30, 45, 60, 71. Top row is solid red, red, then a mauve midpoint of the crossfade at frame 30. Bottom row is a slightly lighter blue at frame 45 (crossfade weight 21/23), then solid blue at 60 and 71. The splice boundaries fall where the expected weights say. The frames are flat fields with no spatial content: the picture shows the colour ramp and nothing else, which is all the script builds. Not blank, not clipped.
- Result: pass for the claim as scoped. Predeclared checks all held; no deviations from the plan. Nothing was installed for this example.
- Deviations and limitations: the first `--record` run wrote PNG frames numbered from 1 (FFmpeg default); fixed before the final record. `vspipe` prints its own progress lines to stderr, which is expected. Out-of-order checks are separate vspipe processes, not requests within one process. The MP4 bytes are not hashed; libx264 output is only probed. Only core functions were used, so this says nothing about plugin filters.
- What this establishes: core `BlankClip`, `FrameEval` with a per-frame `Merge` weight, `Splice`, and `resize.Bicubic` to YUV420P8 with BT.709 limited range; `vspipe` Y4M output and `--info`; out-of-order `-s/-e` ranges matching sequential frames; and byte-identical reruns, all on this machine.
- What this does not establish: other platforms or VapourSynth builds, plugin filters, pixel values beyond the five sampled frames, colour accuracy beyond the BT.709 formula check (the expected values are that formula, not a colour-science reference), and MP4 bytes.
- Reviewer, decision and follow-up: none yet. Revisit if the VapourSynth build or its embedded Python changes, or if core crossfade or resize semantics change.
