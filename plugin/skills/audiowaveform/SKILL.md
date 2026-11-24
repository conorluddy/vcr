---
name: audiowaveform
description: Turn a WAV into precomputed waveform peaks (JSON or binary DAT) and a transparent PNG with BBC audiowaveform. Load when peaks.js-style displays or a waveform layer in a scene need data computed ahead of time; use FFmpeg for encoding and aubio or librosa for onsets and beats.
---

# audiowaveform

A command-line tool that reads audio and writes waveform data: per-pixel min and max peaks as JSON or DAT, or a PNG image. Its use in VCR is precomputed waveform data for peaks.js-style displays, or a waveform layer drawn in a scene, without computing peaks in a browser.

`vcr` below means `pnpm vcr` inside the VCR repository.

## Use cases and limits
- One-shot file conversion: input WAV in, JSON, DAT or PNG out. No seeking, no frames.
- Not for onset, beat or pitch analysis (`aubio`, `librosa`) or for encoding (`ffmpeg`). Loudness is not measured here; peaks are sample peaks per pixel.
- What a waveform should show and how it is drawn belongs to the pillars: sound (`vcr rules info SOUND-SYNTH-DETERMINISM` for generated inputs) and data visualisation (`DATA-` rules, `vcr refs section data-visualisation <section>`). No threshold in this guide is policy.
- Evidence is partial and narrow: audiowaveform 1.11.1 (Homebrew 1.11.1_1), macOS arm64, one 3 s synthetic envelope made with sox, 480 samples per pixel, 16-bit, mono. No 8-bit, other zoom, other input formats, `--split-channels`, real music, or other builds.

## Capability map
Official entry: [README](https://github.com/bbc/audiowaveform) (development has moved to [Codeberg](https://codeberg.org/chrisn/audiowaveform)). Discovery only; `audiowaveform --help` lists the build's options.
- Tested: WAV input, `-z` samples per pixel, `-b 16`, `--output-format json|dat|png`, PNG with `-w`, `-h`, `--no-axis-labels`, `--background-color 00000000`, `-q`.
- Documented, untested: `-b 8`, `--pixels-per-second`, `--split-channels`, start and end trimming, other inputs (MP3, FLAC, Ogg, Opus, raw, DAT or JSON as input), waveform styles other than the default, colour options, text output.

## Install and doctor
```text
brew install audiowaveform
audiowaveform --version     # v1.11.1 on the tested build
vcr doctor
```
Never assume it is installed. Licence from `brew info`: GPL-3.0-only.

## Smoke test
```text
vcr example create audiowaveform-peaks && (cd examples/audiowaveform-peaks && ./run.sh)
# expect: exit 1 and the summary JSON, with only checks.dat_header false
```
The fixture is partial: its predeclared `dat_header` check expected version 2 and fails, left as declared, so `run.sh` exits 1 and never prints `audiowaveform-peaks: OK` or writes `expected/`. Needs `sox`, `magick`, `jq`, `shasum`, `sips`; run 2026-11-24.

## Recipe
```text
audiowaveform -q -i envelope.wav -o envelope.json -z 480 -b 16 --output-format json
audiowaveform -q -i envelope.wav -o envelope.dat  -z 480 -b 16 --output-format dat
audiowaveform -q -i envelope.wav -o envelope.png  -z 480 -b 16 -w 300 -h 200 \
  --no-axis-labels --background-color 00000000 --output-format png
```
Observed on a 3 s, 48 kHz mono envelope (1 s silence, 1 s 1 kHz sine at -6 dBFS, 1 s at -20 dBFS):
- JSON: `length` 300, `samples_per_pixel` 480, `sample_rate` 48000, `bits` 16, `channels` 1, and `data` holds 600 values, an interleaved min, max pair per pixel as 16-bit integers. Divide by 32768 for fractions of full scale.
- Peaks: silence 0; -6 dBFS max 0.501190 (expected 0.501187); -20 dBFS max 0.100006 (expected 0.1); mins mirror the maxes.
- DAT: 1220 bytes, a 20-byte header of five little-endian int32 (version, flags, sample rate, samples per pixel, length), then 600 int16 values equal to the JSON `data`. The header version read 1 on this build, not 2; flags 0, rate 48000, 480 samples per pixel, length 300.
- PNG: 300 by 200, alpha channel spanning 0 to 255 (transparent background, opaque waveform).
- Reruns: JSON, DAT and PNG byte-identical to the first run (this host and build only).
- The 480-samples-per-pixel choice made each pixel hold whole sine cycles, so peaks were exact; other zooms and real audio were not run.

## Gotchas
- Read the DAT version from the file, not from the JSON or a spec: it was 1 here. Parsers should check it rather than assume.
- The example's own tolerance was 0.01 of full scale, not a recommendation.
- `-q` silences progress output; without it stderr carries messages.
- Tool-to-tool edges (feeding the JSON to peaks.js, or the PNG into a scene) were not tested.

## Troubleshooting
- Header read comes out empty: `read` stops at the first newline; read the whole `od` output (`od -An -t d4 -N 20 file.dat | tr '\n' ' '`).
- Missing tool: `brew install audiowaveform` (and `sox`, `imagemagick` for the fixture).
- Different bytes on another build: byte identity was shown only on this host and version.

## Official docs
- https://github.com/bbc/audiowaveform
- https://codeberg.org/chrisn/audiowaveform
