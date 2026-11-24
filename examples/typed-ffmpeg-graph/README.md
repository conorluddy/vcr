# typed-ffmpeg-graph

## Intent and scope

- Tool ID and version/build: `typed-ffmpeg` 4.6.2 (PyPI, MIT), with its pinned dependencies `typed-ffmpeg-v9` 4.6.2 and `ffmpeg-core` 4.6.2 (the FFmpeg 9 binding that the meta-package requires). Renders with the system FFmpeg 9.0.2 (`ffmpeg-ffprobe`, Homebrew).
- VCR job and exact claim being tested: typed-ffmpeg builds a filter graph in Python (two lavfi test sources, scale, overlay, drawbox, encode to H.264), compiles it to an ffmpeg command line that is byte-identical across processes and equal to a predeclared command, and rendering it produces a file whose ffprobe fields (codec, dimensions, frame count) match predeclared values. An invalid graph is rejected at construction, before any ffmpeg call, if the library offers that.
- Explicit exclusions:
  - `hstack` is not exercised; drawbox and overlay are.
  - Option-value typing is not checked by the library. `drawbox(width="abc")`, `testsrc(decimals="abc")` and `sine(sample_rate="abc")` all build and compile without error (probed 2026-11-24). The predeclared invalid-graph check therefore uses stream-kind mismatch (an audio stream into a video input), which the library does reject. Wrong option values are a limitation, not a pass.
  - TypeScript packages (documented as experimental) are not tested.
  - No seek, no alpha, no browser; the shuffled-order and alpha-range checks do not apply.
  - Container bytes are not compared; determinism is checked on the compiled command text.
  - Unseeded features: none used. `testsrc` and `testsrc2` are deterministic lavfi sources.
  - Other FFmpeg versions, other operating systems and GPU filters are not established.
- Tool documentation and licence sources, checked 2026-11-24: https://github.com/lucemia/typed-ffmpeg (README, linked from the tool card); https://lucemia.github.io/typed-ffmpeg/ (linked from the README, not read in full); PyPI metadata `License-Expression: MIT`. FFmpeg filter reference: https://ffmpeg.org/ffmpeg-filters.html. FFmpeg licence depends on build flags.
- Environment: macOS (Darwin 25.6.0), arm64 (Apple M3), Python 3.12.2 (pyenv), venv Python 3.12, system FFmpeg 9.0.2 at `/opt/homebrew/bin`. No GPU involved.
- Input: none. Both sources are generated inside the graph. No media is committed.
- Dependencies, installation plan, permissions, network, side effects: one virtualenv at `output/venv` (git-ignored), created and populated by `run.sh` only when missing, with `pip install -r requirements.txt`. The pins are exact. No other package is installed. Network is needed only for that first install.
- Selected workspace, generated output and cleanup: `output/` only (venv, command JSON, `graph.mp4`, ffprobe JSON, framemd5, contact sheet). Cleanup: `rm -rf examples/typed-ffmpeg-graph/output`.

## Plan, before running

- Commands: `examples/typed-ffmpeg-graph/run.sh --record`, then `examples/typed-ffmpeg-graph/run.sh`. The second run must print `typed-ffmpeg-graph: OK`.
- Graph, in `graph.py`: `testsrc` 320x180, 24 fps, 2 s; `testsrc2` 640x360 scaled to 160x90; overlay at x=10 y=10; `drawbox` 50x20 white, filled, at 0,0; output `output/graph.mp4` with `vcodec=libx264`, `pix_fmt=yuv420p`, `r=24`, `t=2`, `movflags=+faststart`.
- Predeclared compiled command (exact, from `expected/command.json`; `compile_as_list` runs with an added `-y` for overwrite, which is not part of the compared string):

  ```
  ffmpeg -filter_complex 'testsrc=size=320x180:rate=24:duration=2[s0];testsrc2=size=640x360:rate=24:duration=2[s1];[s1]scale=w=160:h=90[s2];[s0][s2]overlay=x=10:y=10[s3];[s3]drawbox=x=0:y=0:width=50:height=20:color=white:thickness=fill[s4]' -map '[s4]' -t 2 -r 24 -pix_fmt yuv420p -vcodec libx264 -movflags +faststart output/graph.mp4
  ```
- Predeclared checks:
  1. Compiled command from two separate Python processes is byte-identical (`cmp`), and equals the command above (`jq -S` diff against `expected/command.json`).
  2. Invalid graph: `video.overlay(sine(...))` raises `FFMpegTypeError` with message `Expected input 1 to have video component, got AudioStream` at construction, before compile or ffmpeg (`expected/invalid.json`).
  3. Render exits 0. ffprobe `{streams, format}` equals `expected/ffprobe.json`: one stream, `h264`, `video`, 320x180, `yuv420p`, `r_frame_rate` 24/1, `nb_frames` 48, no audio stream; `format.duration` 2.000000.
  4. framemd5 counts exactly 48 frames and at least 2 distinct frame hashes (the picture moves, it is not a still).
  5. Not applicable: shuffled-order check (no seek), alpha range (yuv420p, no alpha), per-frame hash reproducibility (container bytes are not compared).
- Contact sheet, after the run: extract `output/frames/frame-%04d.png` with `ffmpeg`, then the ImageMagick command from the template. Inspect it with Read. A blank frame, a missing overlay, a missing box, or a still picture is a fail regardless of hashes.
- Expected failure modes and stop conditions: `pip install` fails (blocked, no substitute); `ffmpeg` absent or not 9.x (report, do not install); compiled command differs from the predeclared string (fail, do not edit the expectation); ffprobe facts differ (fail); invalid graph accepted (fail).
- Reproduction: run `run.sh`; inspect `output/contact.png`.

## Observation, after running

- Date and executor: 2026-11-24, Claude agent in a VCR worktree, on Conors-MacBook-Pro-2.local (macOS 25.6.0 arm64).
- Versions: typed-ffmpeg 4.6.2 (with typed-ffmpeg-v9 4.6.2 and ffmpeg-core 4.6.2, pinned in `requirements.txt`); Python 3.12.2 (venv); FFmpeg and ffprobe 9.0.2 (Homebrew, `/opt/homebrew/bin`); jq 1.8.1; ImageMagick 7.1.2-35 (contact sheet only). Playwright and Chromium are not used. Node is not used.
- Installed, and where: only `typed-ffmpeg==4.6.2` (the approved package) and its two pinned dependencies, into `examples/typed-ffmpeg-graph/output/venv` (git-ignored). Nothing installed globally or in the repo root.
- Commands: `run.sh --record`, then `run.sh`, which printed `typed-ffmpeg-graph: OK`. A further `run.sh` after the observation was written also printed OK.
- Checks, all as predeclared:
  1. Compiled command: byte-identical across two separate Python processes (`cmp`), and equal to the predeclared command in `expected/command.json` and in the README (`grep` count 1).
  2. Invalid graph: `video.overlay(sine(...))` raised `FFMpegTypeError: Expected input 1 to have video component, got AudioStream` at construction. The render path is not reached.
  3. Render exit 0. ffprobe: one `h264` video stream, `yuv420p`, 320x180, `r_frame_rate` 24/1, `nb_frames` 48, no audio stream, `format.duration` 2.000000. Matches `expected/ffprobe.json`.
  4. framemd5: 48 frames, 48 distinct hashes.
  5. Not applicable: shuffled order, alpha range, per-frame reproducibility of the container.
- Inspection of the deliverable (contact sheet at `output/contact.png`, six frames at 0, 10, 20, 30, 40, 47). The frames are not blank and not still. Each shows the full `testsrc` colour-bar picture, with a 160x90 inset at (10,10) and a white box at frame (0,0) that overlaps the inset's top-left corner. Against that, the inset region differs from bare `testsrc` in about 44% of its pixels, and from `testsrc2` scaled to 160x90 in 470 of 14400 pixels, the 470 falling in the box corner. The overlay is the library's `testsrc2` at (10,10). The 50x20 white box is present at (0,0), with the last two columns at about 99% white (chroma rounding at the edge).
- Defects: none in the output. A first look at the 480-pixel contact sheet did not show the box clearly, so I confirmed it with pixel reads before accepting the frames.
- Result: **pass**, scoped to the claim as worded. The graph builds in Python, compiles deterministically to the predeclared command, renders the predeclared file facts, and the library rejects an invalid stream-kind graph before any ffmpeg call.
- What this establishes: typed-ffmpeg 4.6.2 builds and compiles this graph shape on FFmpeg 9.0.2, macOS arm64; compiled command text is deterministic; render facts match.
- What it does not establish: option-value type checking. `drawbox(width="abc")`, `testsrc(decimals="abc")`, `sine(sample_rate="abc")` and `overlay(eof_action="bogus")` all build and compile with no error. The library's only build-time rejection in this run is a stream-kind mismatch. A reader who takes "wrong filter option type" in the claim literally will see this as a gap; it is recorded here rather than credited. Also not established: `hstack`, TypeScript packages, other FFmpeg versions or platforms, Linux, Intel Mac, any alpha or seek path.
- Reviewer, decision, follow-up and revisit triggers: revisit if typed-ffmpeg adds option-value validation (then add a wrong-value case) or if the FFmpeg 9 binding changes its `compile_as_list` output. The `-y` added at render time is not part of the compared command.
