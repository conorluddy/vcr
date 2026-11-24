# Gifsicle optimises an ffmpeg-made animated GIF

## Intent and scope

- Tool ID and version/build: `gifsicle` 1.98 (`LCDF Gifsicle 1.98`, Homebrew). The catalogue card records 1.99 as the upstream version seen on 2026-11-15; 1.99 is not installed here and is not tested.
- VCR job and exact claim being tested: `gifsicle -O3` on a generated six-frame GIF keeps frame count, per-frame delays, loop count and decoded pixels identical (lossless optimisation) while the file is no larger; `--lossy=80` and `--colors=16` each reduce size further than `-O3` alone, with the colour table at most 16 entries for `--colors=16`.
- Explicit exclusions: alpha and transparency beyond what the generated frames contain (none); lossy pixel fidelity (only size, timing and colour-table bounds are asserted for `--lossy`); animated formats other than GIF; GIF inputs from encoders other than ffmpeg; other gifsicle versions and platforms; gifsicle's editing, resizing, frame-combining and info modes; tool-to-tool edges (ffmpeg writes the input, ImageMagick decodes pixels for comparison, neither is credited as part of the claim).
- Tool documentation and licence sources, checked 2026-11-24: [repository](https://github.com/kohler/gifsicle) (the `COPYING` file is GNU GPL version 2, matching the card's `GPL-2.0`); [NEWS](https://github.com/kohler/gifsicle/blob/master/NEWS.md) lists 1.99 as the latest entry, so 1.98 is an older release. ffmpeg 9.0.2 and ImageMagick 7.1.2-35 are used to make and decode inputs; their licences are not relevant to the claim.
- Environment: macOS 26 (Darwin 25.6.0) arm64, Homebrew gifsicle, ffmpeg and ImageMagick, Python 3.12 standard library only.
- Input: six fixture-authored 64×64 RGB PNG frames from `generate_frames.py` (a row gradient, so the decoded frame has more than 16 colours, and a 16×16 square that moves and changes colour). They are encoded to a GIF by ffmpeg's concat demuxer with per-frame durations of 0.12, 0.24, 0.04, 0.16, 0.28 and (the ffmpeg default) 0.04 s, and loop count 2. The input GIF is made by ffmpeg, not gifski, because gifski cannot vary per-frame delays. Hash and byte size of the input are recorded in `expected/metrics.json`.
- Dependencies, installation plan, permissions, network and expected side effects: none installed. gifsicle, ffmpeg and ImageMagick were already present through Homebrew. No network access is required by `run.sh`.
- Selected workspace, generated output and cleanup paths: this example directory. PNG frames, concat list, GIFs, decoded RGBA dumps and version files go under the git-ignored `output/`. Only `expected/metrics.json` is committed. Remove `output/` to clean up.

## Plan, before running

- Exact commands (from `run.sh`):
  1. `python3 generate_frames.py output/frames output/concat.txt` (the concat list has no duration line for the last frame)
  2. `ffmpeg -v error -y -f concat -safe 0 -i output/concat.txt -fps_mode passthrough -loop 2 -c:v gif output/input.gif` (no `-frames:v`; the concat list has six entries)
  3. `gifsicle -O3 output/input.gif -o output/o3.gif`, repeated to `output/o3-repeat.gif` and compared with `cmp`
  4. `gifsicle -O3 --lossy=80 output/input.gif -o output/lossy.gif`
  5. `gifsicle -O3 --colors=16 output/input.gif -o output/colors.gif`
  6. `magick <gif> -coalesce -depth 8 rgba:output/<name>.rgba` for input, o3, lossy and colors
  7. `python3 check_output.py output` parses GIF blocks directly (graphic control, NETSCAPE loop extension, image descriptors and colour tables) and writes `output/metrics.json`.
- Predeclared checks, all asserted by `check_output.py` or `run.sh`:
  - Input: 6 frames, 64×64, per-frame delays exactly `[12, 24, 4, 16, 28, 4]` centiseconds, loop count 2, at least 2 distinct coalesced frame hashes, more than 16 distinct decoded colours.
  - `-O3`: 6 frames, 64×64, delays identical to input, loop count identical to input, every coalesced RGBA frame SHA-256 identical to the input's, byte size no larger than the input, and the repeat run byte-identical.
  - `--lossy=80` with `-O3`: 6 frames, 64×64, delays and loop count identical to input, byte size strictly smaller than the `-O3` output. Decoded pixels are not asserted; the count of frames whose hash still matches the input is recorded as a measurement only.
  - `--colors=16` with `-O3`: 6 frames, 64×64, delays and loop count identical, every global and local colour table at most 16 entries, at most 16 distinct decoded colours, byte size strictly smaller than the `-O3` output.
  - Versions of gifsicle, ffmpeg and ImageMagick recorded in `expected/metrics.json`.
- Intended consumer and handoff settings: a standalone looping GIF for a web or social preview. Not a palette-quality test; `--colors=16` is a size and table-bound check only.
- Delivery constraints and units: byte sizes are exact file sizes in bytes; delays in GIF centiseconds; no byte budget is set.
- Expected failure modes and stop conditions: ffmpeg not producing the requested per-frame delays (stop: the input does not meet the claim's premise); `-O3` changing decoded pixels or timing (a real failure of the claim, recorded as fail); `-O3` output larger than input (fail); `--lossy` or `--colors` not reducing size (partial or fail, reported with numbers); decode failure.
- Reproduction instructions: `./run.sh --record` records the baseline after inspection; `./run.sh` must print `gifsicle-optimise: OK`. To inspect: extract coalesced frames from `output/o3.gif` and `output/colors.gif` with `magick ... -coalesce output/decoded/<name>-%02d.png` and look at them as a contact sheet (the contact sheet path is recorded under Observation).

## Observation, after running

Run on 2026-11-24 on `Conors-MacBook-Pro-2.local` (macOS 26, Darwin 25.6.0, arm64), by the evidence worker.

- Versions: LCDF Gifsicle 1.98 (Homebrew; upstream NEWS now lists 1.99, not tested); ffmpeg 9.0.2; ImageMagick 7.1.2-35 Q16-HDRI; Python 3.12.2 (stdlib only); Node v22.19.0 is not used by this fixture. Playwright and Chromium are not used.
- Deviation before recording: the first `--record` attempt failed at the input check (7 frames, not 6). The concat list repeated the last file to give it a duration, and ffmpeg emitted that repeat as a seventh frame. A second attempt with `-frames:v 6` also showed ffmpeg's GIF output lands on a 1/25 s grid, so the planned delays came out as 12, 24, 4, 16, 28 and 20 centiseconds (0.10 rounded up to 0.12, and so on). The fix changed only the input construction: durations are now 0.12, 0.24, 0.04, 0.16 and 0.28 s, the last frame has no duration line and takes ffmpeg's default, and the predeclared delays became `[12, 24, 4, 16, 28, 4]`. The assertions, thresholds, lossy and colour limits are unchanged. The failed attempts left no committed evidence; the fixture was rebuilt from scratch before the recorded run.
- Commands: `./run.sh --record` (recorded `expected/metrics.json`), then `./run.sh` printed `gifsicle-optimise: OK`. A repeat `-O3` run was byte-identical (`cmp`).
- Measured (bytes; delays in centiseconds):
  - input (ffmpeg): 12479 bytes, 6 frames, 64×64, delays `[12, 24, 4, 16, 28, 4]`, loop 2, 62 distinct decoded colours, 6 distinct frame hashes, colour table 256 entries.
  - `-O3`: 10869 bytes (87% of input), 6 frames, same delays and loop, 6 of 6 coalesced RGBA frames pixel-identical to the input.
  - `-O3 --lossy=80`: 10811 bytes (smaller than `-O3` by 58 bytes, a marginal reduction), same delays and loop, colour table 64 entries; 0 of 6 frames pixel-identical to the input, as expected for lossy. Pixels were not asserted.
  - `-O3 --colors=16`: 4929 bytes (45% of `-O3`), same delays and loop, colour table 16 entries, 15 distinct decoded colours.
- Visual inspection (`output/contact.png`, 250% nearest-neighbour; rows are input, `-O3` and `--colors=16`; `output/lossy-row.png` is the lossy row): the 16×16 square moves left to right across six frames and shifts from teal to pink in all three rows. The `-O3` row looks identical to the input, as the hashes say. The `--colors=16` row keeps the square and its motion but the gradient background shows heavy banding and blue speckle that the input does not have as strongly. That is a visible quality cost, which the claim does not cover, and is reported as such. The lossy row looks close to the input with slightly more grain.
- Pass on the predeclared checks. The `--colors` result shows real size and table bounds but a visible quality loss on this input; `--lossy=80` saved only 58 bytes over `-O3` on this input, so its size benefit is effectively not established by this fixture.

What this establishes: on this machine with gifsicle 1.98, `-O3` losslessly re-encodes a six-frame ffmpeg GIF with the same frames, delays, loop count and decoded RGBA pixels, at a smaller size; `--colors=16` yields a colour table of at most 16 entries with the same frame timing and a smaller size; `--lossy=80` keeps timing and loop and is smaller than `-O3`, only marginally on this input.

What it does not establish: other gifsicle versions (1.99 is the upstream latest), other platforms, GIF inputs from other encoders, other lossy levels or colour counts, palette quality for `--colors` (only bounds are checked), transparency and disposal-method edge cases (none in the fixture), editing modes, or any perceptual quality claim. Pixel identity is measured on ImageMagick's coalesced RGBA decode, not on gifsicle's own decoder.

Reviewer, decision, follow-up: none assigned. Revisit if gifsicle is upgraded, if the -O3 pixel check is run against a GIF with transparency or partial-frame disposal, or if `--lossy` is to be claimed as a size reduction on a different input.
