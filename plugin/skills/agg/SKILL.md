---
name: agg
description: Render an existing asciicast (.cast) terminal recording to an animated GIF with asciinema's agg. Load when a recorded or hand-written cast needs to become a GIF; pin fonts if pixel size matters.
---

# agg

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use agg to turn an asciicast file you already have into a GIF. Frames land at the event times, so timing comes from the cast, not from a clock.
- Neighbours: `vhs` scripts and records a live terminal session from a `.tape` file; agg only renders a cast that exists. For arbitrary image frames to GIF use `gifski` or FFmpeg; for GIF size optimisation use gifsicle (none tested here).
- Evidence covers one hand-written asciicast v2 file (40x6, four output events at 0.5, 1, 2 and 3 s) on macOS arm64 with agg 1.9.0: 403x157 px at `--font-size 16`, exactly 2x (806x314) at 32, five frames, 5.00 s, rerun byte-identical. It does not cover real recordings, asciicast v1 or v3, input events, markers, `--select`, `--speed`, themes, emoji, wide glyphs, other platforms or versions.
- **Absolute pixel size depends on the font agg resolves.** In the run, agg's verbose log chose system JetBrains Mono from `~/Library/Fonts`, not a bundled font. Without it, agg falls back (for example to Menlo) and the size can change. For reproducible output pin the font with `--font-family` and `--font-dir`; the fixture did not test those flags. The 2x scaling and the timing held regardless.
- agg is GPL-3.0-or-later (per the catalogue card).

## Capability map
Discovery only; see the [agg README](https://github.com/asciinema/agg#usage) and `agg --help`.
- **Tested:** `--font-size`, `--cols`, `--rows`, `--fps-cap`, `--last-frame-duration`, `-v` (shows which fonts loaded), `--version`; default theme and default `--idle-time-limit`.
- **Documented, untested:** `--font-family` and `--font-dir`, `--theme`, `--speed`, `--idle-time-limit`, `--line-height`, `--no-loop`, remote or stdin cast input, asciicast versions beyond v2.

## Install and doctor
```sh
brew install agg
agg --version
```
`vcr doctor` checks the executable with the record's `agg --version` probe. The fixture also needs `ffprobe`, ImageMagick (`magick`) and `python3` for measurement.

## Smoke test
```sh
vcr example create agg-asciicast-gif
cd examples/agg-asciicast-gif && ./run.sh
# expect: agg-asciicast-gif: OK
```
The render command, exactly as the fixture runs it:
```sh
agg --font-size 16 --cols 40 --rows 6 --fps-cap 10 --last-frame-duration 2 fixture.cast output/render.gif
```
The fixture checks dimensions, 2x scaling at `--font-size 32`, five frames starting at 0, 0.5, 1, 2 and 3 s (within 0.05 s), 5.00 s duration, a non-flat frame and byte-identical rerun. `expected/metrics.json` keeps the absolute size, byte count and hash; on a machine with different fonts these need `./run.sh --record`.

## Cast file shape
A minimal hand-written v2 cast: a JSON header line, then `[seconds, "o", text]` events.
```
{"version": 2, "width": 40, "height": 6}
[0.5, "o", "$ echo hello\r\n"]
[3.0, "o", "$ "]
```
Use `\r\n` for line breaks. The final frame holds for `--last-frame-duration`; gaps over the idle limit (default 5 s, not reached in the fixture) are shortened.

## Troubleshooting
- Size differs from 403x157: agg resolved a different font. Run `agg -v ...` and read `primary text font family` in the log, then pin it.
- Frame timestamps look off by a few milliseconds: GIF stores delays in hundredths of a second; compare with a tolerance.
- The first frame is blank at 0.00 s: expected when the first event is later than 0.

## Official docs
- [agg repository and CLI usage](https://github.com/asciinema/agg) and [releases](https://github.com/asciinema/agg/releases); fixture checked 2026-11-24, tested agg 1.9.0.
