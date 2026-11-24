# glslViewer headless sequence export of a time-driven fragment shader

Status: pass, 2026-11-24 (validated). The plan below was written before the first fixture run; two amendments made after the first record attempt are disclosed in Observation.

## Intent and scope

- Tool: `glslViewer` 3.5.2 (Homebrew formula `glslviewer` 3.5.2_1, binary `glslViewer`), BSD-3-Clause. Installed before this example; nothing was installed for it.
- Docs and licence, checked 2026-11-24: https://github.com/patriciogonzalezvivo/glslViewer (README and wiki) and the `--help` text of the installed binary. Licence per the catalogue card (BSD-3-Clause); not re-read from the repository's LICENSE file.
- VCR job and exact claim: "glslViewer renders a hand-written fragment shader that is a pure function of u_time and u_resolution, headlessly (`--headless`, fixed `-w`/`-h`), exporting frames at predeclared times with its `sequence` command, to PNGs of a predeclared size. Predeclared pixel values at known positions and times match analytic expectations within 2 per 8-bit channel; frames at different times differ; re-rendering a time gives identical pixels."
- Exclusions: no `screenshot` route (see the probe note below, `time,<t>` does not pin `u_time`); no windowed rendering as evidence (a windowed run is a probe only); no 3D geometry, textures, audio, video or OSC; no GLSL ES or desktop-GL version claims beyond what the binary accepts; no cross-GPU or cross-driver equality, only this host; no alpha claim beyond the PNG's opaque output; no movie encoding; no interaction with other tools.
- Environment: macOS (Darwin 25.6.0), arm64. Renderer string from glslViewer's verbose log: `Apple M3 Pro`, recorded by `run.sh` at run time.
- Input: none from outside. `shader.frag` is hand-written in this directory (about 15 lines, no third-party code).
- Dependencies and installation: none new. Uses `glslViewer` (already installed), ImageMagick 7.1.2 (`magick`, installed) for pixel probes and hashes, and `shasum`, `awk`, `jq` already on the machine. No `pnpm install` is needed for this example (no `package.json`).
- Network and side effects: none. glslViewer runs locally; `run.sh` writes only under `output/` (ignored) and `expected/summary.json` on `--record`.
- Workspace paths: `examples/glslviewer-headless-frames/output/` (ignored, removed at the start of each run), `expected/summary.json` (facts only, no media).

## Pre-plan probes (exploration, not evidence)

Before this plan was written, several glslViewer launches were made in a scratch directory outside the repository to learn its command interface. They are recorded here because the plan depends on them:

- `--help` printed a terminal UI. The command names come from the binary's strings: `screenshot,<file>`, `sequence,<from_sec>,<to_sec>[,<fps>]`, `time`.
- `-e "time,<t>"` followed by `screenshot` did not pin `u_time`: identical launches at the nominal time gave blue values 190, 162 and 157 (analytic for t = 1.5 is 254). The `time` command is therefore not used here.
- `-e "sequence,0,1,4"` wrote four frames (`00000.png` to `00003.png`, 128x96). Their blue values at pixel (32,24) were 128, 159, 189, 214, matching `128 + 127.5 sin(i/4)` exactly. This is the route the plan uses.
- The exported frames were 128x96 for a request of `-w 64 -h 48`, so the Retina backing store doubles the size. The plan predeclares 128x96.
- Headless launches segfaulted (exit 139) on 6 of 9 starts and wrote output on 3. A windowed launch with the same arguments ran. This is recorded as a risk for the plan; see the stop condition below.
- Process control: glslViewer keeps running after its `-e` commands. `run.sh` stops it by PID once the expected frames exist. Pattern-based kills were not used (they matched the shell itself).

## Plan, before running

- Commands (no install step): `examples/glslviewer-headless-frames/run.sh --record`, then `examples/glslviewer-headless-frames/run.sh`. `--record` writes `expected/summary.json` only if every predeclared check passes.
- Each full render is `glslViewer shader.frag --headless --noncurses --verbose -w 64 -h 48 -e "sequence,0,1,8"` run from `output/<pass>/`. Frame `i` is written as `NNNNN.png` at `t = i / 8` s (verified at 4 fps in the probe).
- Passes: `full` (sequence 0 to 1 s, 8 fps, 8 frames), `again` (same arguments, second process, to test re-rendering), `range` (`sequence,0.5,1,8`, 4 frames, to test a sub-range start against the full export).
- Predeclared checks (all must hold for pass):
  1. `full` has 8 frames, `NNNNN.png` for 00000 to 00007.
  2. Every frame is 128x96 (2 x the requested 64x48 on this Retina display).
  3. All 8 frames in `full` have distinct pixel hashes (SHA-256 of raw RGBA bytes).
  4. Re-rendering: every frame of `again` has the same pixel hash as `full`.
  5. Sub-range: `range` frames 00000 to 00003 have the same pixel hashes as `full` frames 00004 to 00007 (the sub-range starts at 0.5 s).
  6. Pixel probes, tolerance 2 per 8-bit channel, against the analytic values in `shader.frag`: frames 0, 2, 4 and 7 (t = 0, 0.25, 0.5, 0.875 s) at pixels (0,0), (127,0), (64,48) and (127,95). That is 16 probes.
  7. Alpha on middle frame 00004: the PNG has an alpha channel (`srgba`), and its alpha is exactly 255 at every pixel (min 255, max 255).
- Expected artifacts: `output/{full,again,range}/NNNNN.png` and `glslviewer.log` (ignored); `output/summary.json`; `expected/summary.json` (booleans and counts only, no media).
- Stop conditions and failure modes:
  - glslViewer exits early (signal or non-zero status) before the expected frames exist, or the frames do not appear within 60 s: that pass is `fail`. The exit status is printed. A crash is not retried silently; every attempt is counted in Observation.
  - A pixel probe or hash check that fails is `fail` for that check. A check that passes only after a rerun with different arguments is not a pass.
  - Pass only if checks 1 to 7 all hold on the verification run (no `--record`). If the record run passes and the verification run crashes, the result is `partial` or `fail` as observed, with both attempts reported.
- Reproduction: `examples/glslviewer-headless-frames/run.sh`. Inspect the output with the contact-sheet command in the evidence skill step 7, adjusted to 8 frames.

## Observation, after running

Result: **pass**, with the scope limits below. All seven predeclared checks held on the verification run, and on three further verification runs.

Versions and environment (2026-11-24, executor: Claude agent, `hostname` Conors-MacBook-Pro-2.local, Darwin 25.6.0 arm64):

- glslViewer 3.5.2 (Homebrew `glslviewer` 3.5.2_1, `/opt/homebrew/Cellar/glslviewer/3.5.2_1`). Already installed; nothing installed for this example.
- Renderer (glslViewer verbose log): `Apple M3 Pro`.
- ImageMagick 7.1.2-35 Q16-HDRI; jq 1.8.1; shasum 6.02. No Node, Playwright or Chromium is used by this fixture.

Runs, in order:

1. Exploratory launches before the plan (described above, not evidence).
2. `run.sh --record`, attempt 1: all three glslViewer passes produced their frames and the probes matched, but the script failed on an awk reserved word (`index`). Fixed by renaming the variable. Nothing recorded.
3. `run.sh --record`, attempt 2: frames and probes passed, but the alpha check failed. `magick identify -format %[channels]` prints `srgba 4.0`, so the exact match to `srgba` failed. Amendment, parse only: the script now keeps the first token of that string. The predeclared meaning is unchanged (an alpha channel present, and alpha 255 at minimum and maximum on frame 4); that alpha range was 255,255 in attempt 2 as well. Nothing recorded.
4. `run.sh --record`, attempt 3: all checks pass; `expected/summary.json` written.
5. `run.sh` (verification): prints `glslviewer-headless-frames: OK (8 frames, 128x96, 16 probes)`, exit 0. Repeated three more times: OK each time.

Every glslViewer launch in the fixture (seven script runs, three launches each, 21 in total) produced its frames and was stopped by PID. None segfaulted.

Measured (from `expected/summary.json`, identical on the verification runs):

- Frames: 8 (`00000` to `00007`) at 8 fps over 0 to 1 s, so frame `i` is at `t = i/8` s. Range pass: 4 frames from `sequence,0.5,1,8`.
- Size: 128x96 for a request of `-w 64 -h 48`. The Retina backing store doubles the size; this is the predeclared size on this host.
- Distinct frames: 8 of 8 pixel hashes differ.
- Re-render: every frame of the second full pass has the same pixel hash as the first.
- Sub-range: range frames 0 to 3 have the same pixel hashes as full frames 4 to 7.
- Probes: 16 of 16 within 2 per channel. In the run log every measured value equalled its analytic value exactly, for example frame 4 at (127,95) measured `254,1,189` against expected `254,1,189`.
- Alpha, middle frame 00004: channels `srgba`, alpha minimum 255 and maximum 255.

Inspection (`output/contact.png`, not retained; 1536x576, the eight frames at 3x, point filter): a smooth two-axis gradient, red rising left to right and green falling top to bottom, with the blue channel climbing across the frames from about 128 to 225. Nothing is blank, clipped or banded, and the frames visibly change in time. The sheet shows the shader working, which is the picture the analytic values predict.

Deviations and limitations:

- The `time,<t>` command does not pin `u_time`, so frames are taken from `sequence`. A `screenshot` route was not used as evidence.
- `sequence` exports a contiguous range; it cannot render arbitrary single times in shuffled order. The sub-range check (range starting at 0.5 s equals the sequential frames) stands in for shuffled order, and says nothing about random access.
- The pixel size is 2x the requested size on this Retina display. A non-Retina host would give 64x48 and this `expected/` would not match; that is intended, so that the check fails loudly rather than passing silently.
- Headless history: in the pre-plan probes, 6 of 9 headless launches segfaulted (exit 139) and 3 wrote output. Those probes used one-off command shapes outside the fixture. None of the 21 launches in the fixture crashed, and the cause of the earlier crashes is not known. A later attempt to kill probes by name also matched the agent's own shell; it did not affect any fixture result.
- No windowed run is evidence. The windowed probe worked, but it is not the claim.
- Alpha: the frames are opaque (alpha 255). This does not test alpha output beyond that.

What this result establishes: on this host, glslViewer 3.5.2 with `--headless` renders a hand-written `u_time`/`u_resolution` fragment shader through its `sequence` export to 128x96 PNGs at the frame times it predicts; pixel probes match the analytic values; re-renders and a sub-range start reproduce the same pixels; frames differ over time.

What it does not establish: single-frame export at arbitrary times; the `time` command or `screenshot`; windowed rendering; other GPUs, drivers, OS versions or Linux/Mesa builds; a non-Retina size; GLSL beyond this shader; reliability over many more launches (the earlier probe crashes are unexplained); alpha output beyond opaque frames; quality of anything beyond this flat analytic shader.

Reviewer, decision, follow-up: a reviewer should decide whether the probe crash history changes this from pass to partial. Revisit if glslViewer changes version, if a headless launch segfaults in a future run, or if the sequence timing changes (frame `i` at `i/fps`).
