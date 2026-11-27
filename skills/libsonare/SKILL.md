---
name: libsonare
description: Use libsonare in a Python venv to get tempo, beat times, onset times and integrated LUFS from an audio file. VCR evidence passed for libsonare 2.0.0 on generated clicks and a sine, macOS arm64.
---

# libsonare

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Offline audio analysis returning numbers: BPM, beat times, onset times, LUFS. It does not drive animation or a timeline.
- Evidence: generated clicks at 120 and 90 BPM (22050 Hz mono) gave tempo within 0.4 %, every beat within 11.4 ms and every onset within 0.9 ms of a true click, with matching counts; a 997 Hz sine at -20 dBFS peak read -22.98 LUFS against a true -23.01; two runs were identical.
- Beat times sit about 10 ms off the clicks and onsets under 1 ms off, so for hit-accurate cuts prefer onsets; beats are for a grid.
- Not validated: real music, mastering, mixing, stems, transcription, MIDI rendering, key, chords, sections, WASM and Node builds, other platforms. The project is young with one maintainer and jumped from 1.10.0 to 2.0.0 within a month; pin the version.
- Neighbours: librosa and aubio for analysis only; Meyda for browser features; ffmpeg-normalize for loudness during encode; Web Audio for live playback.

## Capability map
Authoritative reference: https://libsonare.libraz.net. The `sonare` CLI lists its commands with `sonare --help`.
- **Tested:** `libsonare.Audio.from_file`, `.detect_bpm()`, `.detect_beats()`, `.detect_onsets()`, `.lufs()`.
- **Documented, untested:** key, chords, sections, mel, chroma, pitch; time-stretch and pitch-shift; mastering with a target LUFS and its processors; mixing; stems; transcription; MIDI rendering; the npm `@libraz/libsonare` WASM build.

## Install and doctor
```sh
cd examples/libsonare-beat-loudness
python3.12 -m venv output/venv && output/venv/bin/python -m pip install -r requirements.txt
output/venv/bin/sonare version
```
`requirements.txt` pins libsonare 2.0.0 and numpy 2.5.5. It is a project dependency, not a machine executable; `vcr doctor` does not prove it. The module name is `libsonare`, not `sonare`.

## Smoke test
```sh
examples/libsonare-beat-loudness/run.sh
# expect: libsonare-beat-loudness: OK
```
`run.sh` builds its own venv on first run and needs sox on PATH. A failing predeclared check prints `KNOWN FAIL: <name>`.

## Recipe: times and loudness
```py
import libsonare
audio = libsonare.Audio.from_file("track.wav")
bpm = audio.detect_bpm()            # float or None when nothing periodic
beats_s = audio.detect_beats()      # numpy float32, seconds
onsets_s = audio.detect_onsets()
integrated_lufs = audio.lufs().integrated_lufs
```
From the CLI: `sonare bpm|beats|onsets|lufs --json file.wav`. WAV and MP3 load directly; other formats need an FFmpeg build per the project README.

## Troubleshooting
- `ModuleNotFoundError: sonare`: import `libsonare`.
- numpy bool not JSON serialisable when writing checks: wrap with `bool()`.
- `momentary_lufs` read -1284 on the click track (sparse bursts, silent end); use `integrated_lufs` for a headline figure.

## Official docs
- [libsonare documentation](https://libsonare.libraz.net)
- [Source](https://github.com/libraz/libsonare)
- [PyPI 2.0.0](https://pypi.org/project/libsonare/2.0.0/)
