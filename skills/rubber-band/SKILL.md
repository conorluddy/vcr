---
name: rubber-band
description: "Unproven in VCR: Rubber Band is a GPL audio time-stretch and pitch-shift library with a `rubberband` CLI; load it when audio must change length or pitch independently, knowing its only VCR fixture failed."
---

# Rubber Band (unproven)

`vcr` below means `pnpm vcr` inside the VCR repository. This guide was written from official docs and a failed fixture. No run has passed; treat every recipe as a lead to test, not a rule.

## Status
- Validation: `not-validated`. The record has one evidence entry, a FAIL, from `examples/rubber-band-stretch` (rubberband 4.0.0, Homebrew, macOS arm64, R2 engine via `-2`, 2026-11-24).
- Measured: durations exact (1.5x stretch 144000 samples; +12 semitones 96000 samples). The stretched 440 Hz tone read +10.71 cents and the +12 st tone -13.94 cents against a predeclared 5-cent limit (FFT peak). Click onsets landed 12 to 14 ms early against a 10 ms limit. Outputs were not byte-identical across invocations.
- Likely cause: the R2 engine's amplitude modulation on a pure sine moved the FFT peak onto sidebands (stretched tone: 442.75 Hz and 438.40 Hz strong, 440 Hz weak; shifted tone: 872.96 and 887.05 Hz strong, 880 Hz bin weak). Pure tones may be a worst case for this engine; the fixture did not test whether real material behaves better. Not proven.
- Next fixture to try (new predeclared plan, tolerances not edited after the fact): the R3 engine (`-3` / `--fine`, and the separate `rubberband-r3` binary the fixture host also had) on real material (speech or a drum loop), pitch measured by a method tolerant of sidebands, plus a rerun check across separate invocations.

## Use cases and limits
- Would do: change duration without changing pitch, change pitch without changing duration, or both, on WAV. A small shift can also vary a repeated sound effect (`SOUND-SFX-REPEAT`).
- Does not do: encode, mux or loudness work (FFmpeg, `ffmpeg-normalize`). Not for MIDI (`pretty-midi`).
- Licence: GPL (project page); a commercial licence is offered for proprietary distribution. VCR runs the CLI locally and ships nothing.
- Evidence covers R2, generated tones and clicks, 48 kHz mono float, ratio 1.5 and +12 semitones, one machine. Nothing about speech, music, formants, R3 or the realtime options.

## Install
Record route: `brew install rubberband`, check `rubberband --version` (4.0.0 seen). Run `vcr doctor`; never assume it is installed. Unverified: what the `rubberband-r3` formula provides was not read.

## CLI surface (documentation-only, untested in VCR)
From the official page and `rubberband --help`; confirm flags on your build before use.
```text
rubberband -t 1.5 in.wav out.wav      # time ratio: output is 1.5x as long
rubberband -T 1.5 in.wav out.wav      # tempo ratio instead (faster)
rubberband -p 12 in.wav out.wav       # pitch shift, semitones
rubberband -f 2.0 in.wav out.wav      # frequency ratio
rubberband -3 -t 1.5 in.wav out.wav   # R3 engine (--fine); -2 selects R2
rubberband -F ...                     # formant preservation
rubberband -q ...                     # quiet
```
Also documented: crispness levels, transient and phase options, `--timemap`, `--pitchmap`, `--realtime`, `--no-threads`.

## What the failed fixture taught (observed in the failed fixture)
- Sample counts are a reliable duration check: 144000 and 96000 samples matched prediction and ffprobe `duration_ts`.
- Do not read pitch from zero-crossings: they landed near 440 Hz while the FFT peak sat on a sideband. The measurement method decides the verdict; state which one you used.
- Determinism: inside one `run.sh` the a and b outputs matched, but across invocations the stretched-tone SHA-256 differed, and three direct `rubberband -2 -q -t 1.5` runs gave two identical files and a third differing in 56599 of 144000 samples (max difference 0.77). Do not use byte hashes as a regression gate; compare measured properties.
- Click onsets kept the 0.375 s spacing but sat 12 to 14 ms early, with pre-echo smear before each peak. If stretched audio must stay aligned to picture, measure it (`SOUND-SYNC-LAG`, `SOUND-SYNC-LEAD`; read limits with `vcr rules info <ID>`).
- Waveforms of the stretched tone showed regular dips (amplitude modulation). No listening test was done.

## Neighbours that are validated today
- `sox`: validated for synth, trim, fade, gain and rate only. Its `tempo`, `pitch` and `speed` effects are documented upstream, untested in VCR.
- `ffmpeg`: `atempo` is documented, untested here. The `rubberband` filter was absent from FFmpeg 9.0.2 on the fixture host (`ffmpeg -filters`).
- `aubio` and `librosa`: read onsets, tempo and pitch to check a result. `whisperx`: word timing for narration.

## Official docs
- https://breakfastquay.com/rubberband/ (v4.0.0, 2024-10-25)
- Fixture: `examples/rubber-band-stretch/` (README Observation section)
