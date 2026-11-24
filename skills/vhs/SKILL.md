---
name: vhs
description: Record a scripted terminal session from a .tape file to MP4, PNG frames or a text golden with VHS. Load when a CLI walkthrough must be captured as a source asset; evidence is partial.
---

# VHS

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use VHS to turn a scripted terminal session (`.tape`) into a source clip for VCR. It records in real time through ttyd and a headless Chromium, so output is not a function of `t` and cannot be seeked.
- Tested: one headless tape to an h264 640x360 MP4 (about 3.9 s, within 1 s), a text golden that was identical across two runs, and a final frame showing the typed text. macOS arm64, VHS 0.12.1, ttyd 1.7.7, Chrome 158. The result is partial: the PNG and frame-count checks failed (see Troubleshooting).
- Untested: GIF, WebM, `Screenshot`, themes, other fonts and shells, `Wait`, `Require`, `record`, `vhs serve`, `publish`, audio, other platforms.
- For deterministic checks use the text `Output` golden, not pixels or hashes of MP4 or PNG output.
- Neighbours: render an existing asciinema cast with `agg`; a static code still with `freeze`. Neither is catalogued or tested here.

## Capability map
Discovery only; see the [README](https://github.com/charmbracelet/vhs#vhs-command-reference).
- **Outputs:** `Output` to `.mp4`, `.gif`, `.webm`, a frame directory (trailing `/`) or `.txt`/`.ascii`. Tested: MP4, frame directory, `.txt`. Untested: GIF, WebM.
- **Settings:** `Set Shell`, `Width`, `Height`, `FontSize`, `Framerate`, `TypingSpeed`, plus theme and padding options. Tested: the first six.
- **Commands:** `Type`, `Enter`, `Sleep`. Documented and untested: `Wait`, `Hide`/`Show`, `Screenshot`, `Require`, `Source`, key chords.
- **Other CLI:** `vhs record`, `vhs serve`, `vhs publish`, `vhs new`. Untested; `publish` uploads, avoid it.

## Install and doctor
```sh
brew install vhs ttyd ffmpeg
vhs --version
```
`vcr doctor` checks the executable with the record's `vhs --version` probe. VHS needs ttyd, FFmpeg and a Chromium it can find; it may try to download one, so check before relying on it. Never assume any of these is installed.

## Smoke test
```sh
vcr example create vhs-tape-recording
cd examples/vhs-tape-recording && ./run.sh
# expect: vhs-tape-recording: predeclared checks failed; see output/metrics.json (exit 1)
```
The failure is the recorded outcome: the PNG size and frame-count checks fail as predeclared, and `expected/metrics.json` is a baseline of that run (`predeclared_checks_passed: false`). What passes and holds: MP4 h264 640x360, duration 3.84 s and 4.04 s over two runs, golden text SHA-256 `7dd0fde8...b175` both times, 33,696 pixels differing between first and last PNG.

## Tape contract
```tape
Output output/demo.mp4
Output output/golden.txt
Set Shell "bash"
Set Width 640
Set Height 360
Set FontSize 20
Set Framerate 10
Set TypingSpeed 100ms
Type "echo alpha"
Enter
Sleep 1s
```
- Nominal duration is the sum of typing time (characters x `TypingSpeed`) and `Sleep`s; measured duration landed within about 0.2 s of it.
- Pin the shell with `Set Shell`; the golden depends on the prompt it prints.

## Troubleshooting
- **PNG frames are 494x208, not 640x360.** The frame directory holds crops of the terminal area, not the `Set Width`/`Height` canvas. The MP4 keeps 640x360. Do not size-check PNGs against the tape.
- **Two PNG families.** `Output frames/` writes `frame-text-*` and `frame-cursor-*` (82 files = 41 + 41, then 78 = 39 + 39). Count one family.
- **Frame counts differ between runs.** MP4 decoded 101 and 96 frames at `Framerate 10` (not the 39 expected), PNG counts 82 and 78, and MP4 and PNG hashes changed each run. Capture is real-time. Gate on the text golden only.
- **Duration drifts.** Allow at least +/- 1 s around the nominal value.
- **Browser missing or download attempted.** Stop and install a Chromium first; the fixture treats this as blocked.
- **"Host your GIF on vhs.charm.sh" printed.** A hint only; nothing was sent.

## Official docs
- [VHS README](https://github.com/charmbracelet/vhs) and [releases](https://github.com/charmbracelet/vhs/releases); fixture checked 2026-11-24, tested VHS 0.12.1 with ttyd 1.7.7.
