# agg hand-written asciicast fixture

## Intent and scope

- Tool ID and version/build: `agg` 1.9.0 (Homebrew, `/opt/homebrew/bin/agg`, `agg --version`).
- VCR job and exact claim being tested: agg renders a hand-written asciicast v2 file (fixed header, four timed output events, no real terminal session) to a GIF with predeclared dimensions for a fixed `--font-size`/`--cols`/`--rows`, a frame count and total duration consistent with the event timings, and reruns byte-identical.
- Explicit exclusions: real terminal sessions, recorder output, asciicast v1 or v3, input (`i`) events, markers, `--select`, `--speed`, themes other than the default, emoji and wide glyphs, GIF pixel fidelity against a font reference, other agg versions and platforms, GIF size optimisation, and any tool-to-tool edge (for example gifsicle or FFmpeg producing or reading the GIF beyond the checker's own measurement).
- Tool documentation and licence sources, checked 2026-11-24: [agg repository](https://github.com/asciinema/agg) (reachable, HTTP 200 on its LICENSE page) and its releases page; the catalogue card records GPL-3.0-or-later. Dependencies: agg's own font lookup. FFprobe 9.0.2 and ImageMagick are measurement helpers, not credited as part of the claim.
- Environment: macOS 26 (Darwin 25.6.0) arm64, Homebrew agg 1.9.0.
- Input: `fixture.cast`, a text file written by hand in this directory. Header `{"version": 2, "width": 40, "height": 6}` and four output events at 0.5, 1.0, 2.0 and 3.0 seconds. No recorder, no real shell. The file is committed because it is text input, not media.
- Dependencies, installation plan, permissions, network and expected side effects: none installed by this run. agg is already on PATH. No network access is required. Renders write only under ignored `output/`.
- Selected workspace, generated output and cleanup paths: this example directory; GIFs, logs and probe output under `output/` (git-ignored).

## Plan, before running

- Exact commands (agg 1.9.0, default theme, default `--idle-time-limit 5` which no gap in the fixture reaches):
  - `agg --font-size 16 --cols 40 --rows 6 --fps-cap 10 --last-frame-duration 2 fixture.cast output/render.gif`
  - the same command to `output/render-repeat.gif`, then `cmp` the two files.
  - the same command with `--font-size 32` to `output/render-32.gif`, to check that dimensions scale with font size.
  - `agg -v` (same parameters) to `output/agg-verbose.log`, to record which font files agg loaded (default bundled or system). Recorded, not a pass/fail check.
  - `ffprobe -count_frames -show_streams -show_format -show_frames` on `output/render.gif`, and `magick identify` on it, for dimensions, frame count, frame timestamps and total duration.
- Predeclared checks (any failure is a fail for the claim; the run prints OK only if all pass):
  1. All agg invocations exit 0 and write a non-empty GIF.
  2. `render.gif` and `render-repeat.gif` are byte-identical (SHA-256 equal).
  3. Dimensions: ffprobe and `magick identify` agree on width and height; width and height are identical to the values recorded in `expected/metrics.json`. **Limitation:** the absolute pixel size depends on the font's cell metrics, which I did not predict before the first run, so the absolute values are recorded on `--record` and reproduced on rerun, not derived in advance.
  4. Scaling: the `--font-size 32` render has width and height each between 1.9× and 2.1× those of the `--font-size 16` render (a relational check that is predicted in advance).
  5. Frame count: `nb_read_frames` lies in [4, 50] (at least one frame per output event; at most 10 fps × 5 s from `--fps-cap 10`), and equals the value recorded in `expected/metrics.json`.
  6. Duration: container duration is 5.00 s ± 0.10 s, that is last event at 3.0 s plus `--last-frame-duration 2`.
  7. Event timing: frame timestamps strictly increase, and a frame starts within ±0.05 s of each event time (0.5, 1.0, 2.0, 3.0).
  8. Non-blank: the middle frame (about 2.5 s, after the "ok" line) is not a single flat colour (pixel standard deviation > 0 via ImageMagick). The GIF is opaque, so no alpha range is checked; the claim does not involve alpha.
  9. Visual inspection: the contact sheet shows the four states (prompt, command echo, output line, prompt) in the right order and clipped to the 40×6 grid. A passing hash on a wrong picture is a fail.
- Intended consumer and handoff settings: standalone animated GIF with the default loop. FFprobe and ImageMagick are readers only.
- Delivery constraints and units: opaque GIF; dimensions in pixels, duration in seconds; no byte budget.
- Expected failure modes and stop conditions: agg missing or version different from 1.9.0; font fallback changing dimensions between runs; event timing shifted by agg's timeline handling (check 7 would fail); GIF frame timing quantised to hundredths of a second (tolerance covers this); blank or clipped frames (check 8/9). Stop and report if agg is not on PATH; do not install or substitute.
- Reproduction instructions: `examples/agg-asciicast-gif/run.sh --record` records `expected/metrics.json` from a fresh render; `examples/agg-asciicast-gif/run.sh` re-renders and diffs. Inspect the output by opening `output/render.gif` or the contact sheet at `output/contact.png`.

## Observation, after running

- Date and executor: 2026-11-24, Claude agent in a git worktree on Conors-MacBook-Pro-2.local (macOS 26.6 arm64, Darwin 25.6.0).
- Versions: agg 1.9.0 (Homebrew, pre-installed; nothing installed by this run); FFprobe 9.0.2; ImageMagick 7.1.2-35 Q16-HDRI; Node v22.19.0 (not used by the fixture). Playwright and Chromium are not used by this fixture.
- Font: agg's verbose log reports `usable font families: JetBrains Mono, Menlo, Symbols Nerd Font, Apple Color Emoji, Noto Emoji` and `primary text font family: JetBrains Mono`. JetBrains Mono is a system font here (`~/Library/Fonts/JetBrains_Mono/`), so the dimensions below depend on a user-installed font, not agg's own bundle. Another machine without it would fall back to Menlo or another font and may change the pixel size.
- `run.sh --record` passed every predeclared assertion on the first render; the subsequent `run.sh` printed `agg-asciicast-gif: OK`, with `cmp` on the two 16 px renders silent (byte-identical).
- Measured (`expected/metrics.json`): GIF 403×157 px at `--font-size 16`, 806×314 px at `--font-size 32` (exactly 2.00× both axes); 5 frames at 0.00, 0.50, 1.00, 2.00 and 3.00 s, matching the blank start and the four event times; container duration 5.00 s (3.0 s last event + 2 s last-frame duration); 5744 bytes; sha256 `6856747555582bf98085e9912357a808b26f25ee817efb91d990d675182758c6`.
- Visual inspection: `output/contact.png` (coalesced frames 0 to 4, built with ImageMagick) shows, in order, an empty prompt with cursor, `$ echo hello`, `$ echo hello` / `hello`, the same plus green `ok`, and then a `$ ` prompt with cursor. Text is clipped inside the 40×6 grid and not blank. The white block at the bottom right of the sheet is just the montage's empty padding slot.
- Deviations and limitations: (1) absolute pixel dimensions were not predicted in advance, as check 3 admits; the 2× scaling (check 4) was predicted and holds. (2) The "middle frame" check picked frame 3 at 2.0 s, since 2.0 and 3.0 are equally distant from 2.5 s; it is non-flat, so the check passes, but it is not the frame named in the plan. (3) The licence was checked only as "GitHub LICENSE page returns HTTP 200 on 2026-11-24"; I did not read its text, and the GPL-3.0-or-later value is the catalogue card's. (4) Frame timing is quantised to hundredths of a second in GIF, which the ±0.05 s tolerance covers. (5) No second machine, no other font, no other agg flags were tested.
- What this result does and does not establish: on this arm64 Mac with agg 1.9.0 and the system JetBrains Mono, a four-event hand-written asciicast v2 renders to a GIF with the recorded size for 16 and 32 px, five frames at the event times, a 5.00 s duration, and identical bytes on rerun. It does not establish that the absolute size is the same on another font or machine, nor any real terminal recording, input events, themes, or GIF quality.
- Reviewer, decision, follow-up and invalidation triggers: revisit if agg changes its font fallback, timeline or GIF encoder (any version change), or if the JetBrains Mono system font is removed; the `expected/metrics.json` absolute sizes would then need a `--record` on the new setup.
