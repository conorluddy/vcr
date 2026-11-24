---
name: pure-data
description: Render a hand-written Pure Data patch offline to a WAV with `pd -nogui -batch`, for dataflow-style synthesis with a patch that quits itself. Load when audio is built as a Pd patch; use Csound for a scored render and Tone.js for browser synthesis.
---

# Pure Data

A visual dataflow language for audio. A `.pd` file is text: objects and message boxes joined by connections. In `-nogui -batch` mode Pd runs a patch faster than real time with no window, and `writesf~` writes the signal to a WAV.

`vcr` below means `pnpm vcr` inside the VCR repository.

## Use cases and limits
- Patch-driven synthesis: signal chains, envelopes and timed messages written as a text patch, rendered to WAV. Output is reproducible, which is what SOUND-SYNTH-DETERMINISM asks of generated audio.
- Pd or Csound: both render synthesis offline from a file. Pick Csound (`csound`) when notes are a score with exact start, duration and pitch. Pick Pd when the sound is a signal graph, or messages and timing are part of the design.
- Neighbours: `sox` for effect chains on existing WAV; `tone-js` for synthesis in a browser scene; `ffmpeg` for muxing audio into video.
- Rate, headroom and ceiling are policy, not this tool: `vcr rules info SOUND-SAMPLE-RATE`, `SOUND-CLIP`, `SOUND-TRUE-PEAK`. The fixture's 48 kHz and 0.5 plateau are parameters, not recommendations.
- Evidence is narrow: Pd 0.57.0 (Homebrew cask `pd`), macOS arm64, one hand-written patch (`osc~` 440 Hz, `vline~` envelope, `writesf~`), 16-bit mono 48 kHz WAV, 2.0 s. No listening test, no `osc~` purity or aliasing claim.

## Capability map
Official entry: [documentation](https://puredata.info/docs), [source](https://github.com/pure-data/pure-data). Discovery only; this is not VCR validation.
- Tested: built-in objects `loadbang`, `t`, `delay`, `osc~`, `vline~`, `*~`, `writesf~`; message boxes `open -bytes 2 file.wav`, `start`, `stop`, `; pd dsp 1`, `; pd quit`; flags `-nogui`, `-batch`, `-r`, `-open`.
- Documented, untested: other signal objects and filters, `readsf~`, subpatches and abstractions, externals (Deken), real-time audio (`-audiodev`, `dac~`), MIDI, the GUI, other sample widths and file formats, `-send`, other Pd versions and platforms.

## Install and doctor
```text
brew install --cask pd
/Applications/Pd-0.57-0.app/Contents/Resources/bin/pd -version    # Pd-0.57.0
vcr doctor
```
Never assume it is installed. The binary is inside the app bundle and not on `PATH`; the fixture uses that path and accepts `PD_BIN` to override it. Licence is not verified here; see the card.

## Smoke test
```text
vcr example create pure-data-batch-render && (cd examples/pure-data-batch-render && ./run.sh)
# expect: pure-data-batch-render: OK
```
Needs `python3` (standard library only); validated 2026-11-24.

## Recipe
```text
pd -nogui -batch -r 48000 -open /abs/path/fixture.pd > pd.log 2>&1
```
The patch drives itself. In `fixture.pd`, `loadbang` fires a trigger that sends `; pd dsp 1`, `open -bytes 2 render.wav` and `start` to `writesf~ 1`, then two `vline~` messages: `0.5 50 0` (attack) and `0 300 1500` (release, starting 1.5 s later). `osc~ 440` times that envelope feeds `writesf~`. A second path from `loadbang` runs `delay 2000` to `stop`, then `delay 100` to `; pd quit`.

`render.wav` is written beside the patch, so give each run its own directory.

Shown by the fixture: 96000 frames, 48000 Hz, mono, 16-bit, 2.000 s; plateau 0.5; envelope 10% and 90% points on rise and fall within 0.6 ms of prediction (bound 2 ms); tone 440.04 Hz, 0.15 cents off; tail from 1.85 s exactly 0.0 (SOUND-TAIL-INTACT concerns a tail kept whole, and the `stop` timing here set the length); two reruns byte-identical on this host and build. Linear ramps at the edges avoid clicks by construction (SOUND-CLIP); no listening test.

## Gotchas
- Batch mode must quit itself: end the patch with a `delay` into `; pd quit`, or `pd` never exits. Batch mode runs faster than real time, so `delay` is in patch time, not wall clock.
- `writesf~` needs `open` before `start`, and `stop` before quit, or the WAV header may be unfinished. The fixture orders these with `t b b b b b`, which fires right to left.
- Which audio device, if any, Pd opened was not checked, and behaviour with no audio device was not verified. The fixture passes no `-audiodev`.
- Byte identity depends on `writesf~` writing no timestamp in the header; revisit if the cask version changes.
- Object-level discoverability (what else exists) is in the capability map; only the objects listed as tested were run.

## Troubleshooting
- `run.sh` exits 1 naming the missing Pd binary: `brew install --cask pd`, or set `PD_BIN`.
- No `render.wav`: read `output/pd-a.log`; the script reports the path. In the validated run the logs were empty.
- Envelope or tone check fails: compare the message times in `fixture.pd` with the predeclared table in the example README.

## Official docs
- https://puredata.info/
- https://puredata.info/docs
- https://github.com/pure-data/pure-data
