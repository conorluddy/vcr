---
name: fluidsynth
description: Render a MIDI file to a WAV offline with FluidSynth and a SoundFont (`fluidsynth -ni -F out.wav -r 48000 font.sf2 in.mid`). Load for scripted MIDI-to-audio; measure the tail, and check the SoundFont licence before shipping audio.
---

# FluidSynth

A SoundFont synthesiser with a CLI. Given a `.sf2` and a `.mid`, `-F` renders faster than real time to a file. The sounds come from the SoundFont, not the tool.

`vcr` below means `pnpm vcr` inside the VCR repository.

## Use cases and limits
- Turn a generated MIDI file into a WAV with sampled instruments. Author the MIDI upstream with `pretty-midi` or `mido`; this tool only renders.
- For a hand-written synthesis score use `csound`; for effect chains and edits on the WAV use `sox`; for encoding, loudness and probing use `ffmpeg`.
- Policy comes from the sound pillar, not this tool: `SOUND-TAIL-INTACT` (do not truncate the tail), `SOUND-SYNTH-DETERMINISM` (two renders identical), `SOUND-LICENSE-RECORD` (record each asset's rights). Use `vcr rules info <ID>`.
- Evidence is partial: FluidSynth 2.6.3 (Homebrew), macOS arm64, one 5-note type-0 MIDI, one SoundFont. Not tested: SF3/DLS, controllers, pitch bend, tempo changes, multiple channels, real-time playback, sound quality.

## Capability map
Official entry: [fluidsynth.org](https://www.fluidsynth.org/), [user manual](https://www.fluidsynth.org/documentation/), [GitHub](https://github.com/FluidSynth/fluidsynth). Discovery only; `fluidsynth --help` lists the build's options.
- Tested: `-n` (no MIDI driver), `-i` (no shell), `-F file` (fast render), `-r 48000`, one SoundFont plus one MIDI file as arguments.
- Documented, untested: `-R 0` / `-C 0` (reverb, chorus off), `-g` gain, `-o` settings, `-T` file type, `-O` sample format, the interactive shell, MIDI ports and real-time audio drivers, the C library API.

## Install and doctor
```text
brew install fluid-synth
fluidsynth --version
vcr doctor
```
Never assume it is installed. Licence LGPL-2.1-or-later. The Homebrew install ships `share/fluid-synth/sf2/VintageDreamsWaves-v2.sf2`.

## Smoke test
```text
vcr example create fluidsynth-midi-render && (cd examples/fluidsynth-midi-render && ./run.sh)
# expect (recorded 2026-11-24, exit 1): FAIL checks: - duration 7.256 s outside [3.5, 5.5]
```
The failure is the recorded result: partial evidence. Needs `python3` (standard library only) and Homebrew's `fluid-synth` 2.6.3.

## Recipe
```text
fluidsynth -ni -F render.wav -r 48000 font.sf2 score.mid
```
Shown by the fixture: 48000 Hz, 2 channels, 16-bit PCM; five notes (MIDI 60, 64, 67, 72, 60) with onsets within 10 ms of the score and all five pitches exact; two renders and a rerun byte-identical (same SHA-256); peak 0.18 of full scale.

## Gotchas
- Tail: the MIDI ended at 3.5 s but the WAV ran 7.256 s. Default reverb and chorus extend the render; audio was above -46 dBFS only until 3.88 s, above 1 LSB until 5.46 s, with residue to the end. A 2.0 s release allowance failed. Measure the rendered length and tail rather than assuming MIDI end plus release, and do not cut it blindly (SOUND-TAIL-INTACT).
- Untested remedies: `-R 0 -C 0` to disable reverb and chorus, or trim after rendering. Neither was run; a follow-up needs its own predeclared bound.
- Determinism holds on this host, build and SoundFont only (SOUND-SYNTH-DETERMINISM). Other builds or machines were not compared.
- SoundFont licence is separate from the tool's. Each `.sf2` has its own terms. The bundled VintageDreamsWaves-v2 is freeware, redistributable only unaltered (its `COPYRIGHT.txt`), so the fixture copies it only into git-ignored `output/`. Check the licence before shipping audio and record it (SOUND-LICENSE-RECORD).
- Pin the SoundFont by SHA-256; the render depends on its bytes.
- `Sample 'SineWave': ROM sample ignored` is printed and had no effect on this render.

## Troubleshooting
- `blocked: fluidsynth is not on PATH`: `brew install fluid-synth`.
- Version other than 2.6.3: the fixture stops; evidence covers 2.6.3 only.
- WAV much longer than the score: see Tail; measure with `sox out.wav -n stat` or `ffprobe`.

## Official docs
- https://www.fluidsynth.org/
- https://github.com/FluidSynth/fluidsynth
