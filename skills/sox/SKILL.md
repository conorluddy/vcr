---
name: sox
description: Generate, trim, fade, gain and resample audio with SoX effect chains, and read results back with soxi and stat. Load for scripted synth tones or simple WAV edits; use FFmpeg for video, containers or filtergraphs.
---

# SoX

A command-line audio processor: one `sox` command, an input, an output, then an effect chain read left to right. `soxi` reads headers; `sox ... -n stat` measures.

`vcr` below means `pnpm vcr` inside the VCR repository.

## Use cases and limits
- Procedural tones (`synth`), then trim, fade, gain, channel count and sample-rate change on WAV, as one short chain.
- Sox's chain is simpler than an FFmpeg filtergraph for audio-only edits (`trim 0 1.5 fade t 0.02 0 0.1 gain -3 rate 44100`). Use FFmpeg (the `ffmpeg` guide) for video, muxing audio into containers, AAC/MP4 delivery, or anything graph-shaped. Loudness targets: `ffmpeg-normalize`.
- Levels, fades and rates are policy, not this tool: take them from the sound pillar (`vcr rules info SOUND-SYNTH-DETERMINISM`, `SOUND-SAMPLE-RATE`, `SOUND-CLIP`, `SOUND-LOOP-SEAM`, `SOUND-TAIL-INTACT`). The fixture's -3 dB gain, fade lengths and -6 dBFS ceiling are parameters, not recommendations.
- Evidence is narrow: sox 14.4.2 (Homebrew 14.4.2_6), macOS arm64, sine tones, 48 to 44.1 kHz, 16-bit stereo WAV. No listening test, no resampler quality, no other formats or builds.

## Capability map
Official entry: [manual](https://sox.sourceforge.net/sox.html), [soxi](https://sox.sourceforge.net/soxi.html). Discovery only; `sox --help` lists the build's formats and effects.
- Tested: `synth` (sine), `vol`, `trim`, `fade t`, `gain`, `channels`, `rate`, `stat`, `soxi -s/-r/-c/-b/-D`, `-b` output depth, global `-D` (no dither), concatenating files.
- Documented, untested: other synth shapes and noise, `mix`/`remix`, `pad`, `reverse`, `norm`, `compand`, `equalizer` and other filters, `spectrogram` (only used for inspection images), `play`/`rec`, non-WAV formats (MP3/FLAC support depends on the build), `-V` verbosity.

## Install and doctor
```text
brew install sox
sox --version     # prints a truncated banner on this build; brew list --versions sox gives 14.4.2_6
vcr doctor
```
Never assume it is installed. `soxi` ships with it. Licence GPL-2.0-or-later and LGPL-2.1-or-later (`brew info`).

## Smoke test
```text
vcr example create sox-audio-chain && (cd examples/sox-audio-chain && ./run.sh)
# expect: sox-audio-chain: OK
```
Needs `jq`; validated 2026-11-24.

## Recipe
```text
sox -D -n -r 48000 -c 1 -b 32 tone.wav synth 0.5 sine 440 vol 0.5     # one tone per synth call
sox -D a.wav b.wav c.wav -b 32 tones.wav                                # join (no crossfade)
sox -D tones.wav -b 16 out.wav trim 0 1.5 fade t 0.02 0 0.1 gain -3 channels 2 rate 44100
soxi -s -r -c -b -D out.wav          # run one flag at a time: samples, rate, channels, bits, seconds
sox out.wav -n stat 2>&1 | grep -E 'Maximum amplitude|Rough'    # stat writes to stderr, effects go after -n
```
Shown by the fixture: 66150 samples, 44100 Hz, 2 channels, 16-bit, 1.500 s; peak 0.354 against the predicted 0.353553 (0.5 x -3 dB); head 1 ms peak 0.012 and tail 5 ms peak 0.015, so the fades applied; two `-D` reruns byte-identical; the source file hash differed from the output's.

## Gotchas
- Dither: sox dithers by default when reducing bit depth, which makes output non-deterministic. Without `-D` the same chain gave different SHA-256 on two runs; with `-D` reruns were byte-identical (this host and build only; what `-D` changes in the audio was not measured). Use `-D` on every reproducible render (SOUND-SYNTH-DETERMINISM).
- Joins click: concatenated tones show a broadband click at each join in the spectrogram; there is no crossfade. Shape the joins before relying on them (SOUND-LOOP-SEAM, SOUND-CLIP); no listening test was done.
- One `synth` per tone: two `synth` effects in one command produced only the first tone.
- Check the sample count, not just the header: `soxi -s` 66150 proves a real resample; a header-only change would give 72000.
- `stat` rough frequency is a zero-crossing estimate and unreliable on interleaved stereo; measure the mono source.
- The `-6 dBFS` ceiling was a bound, not a limiter, and was not binding. `sox` does not do loudness or true-peak measurement; use `ffmpeg-normalize` or FFmpeg `ebur128` (SOUND-TRUE-PEAK).

## Troubleshooting
- `stat` rejected: effects must come after `-n`, `sox in.wav -n trim 0 1 stat`.
- Output bytes change between runs: dither is on; add `-D`.
- Wrong stereo frequency from `stat`: measure before `channels 2`.
- Parsers read `Maximum amplitude:` and `Rough frequency:` labels and `soxi` fields; recheck after a sox upgrade.

## Official docs
- https://sox.sourceforge.net/
- https://sox.sourceforge.net/sox.html
- https://sox.sourceforge.net/soxi.html
