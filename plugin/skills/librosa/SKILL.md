---
name: librosa
description: Use librosa in a Python venv to get beat times, onset times and STFT spectra from an audio file. VCR evidence is partial (librosa 1.0.1, generated clicks and tones, macOS arm64); the beat_track tempo scalar failed.
---

# librosa

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- librosa analyses audio offline in Python and returns numbers: beat times, onset times, STFT magnitudes. It does not play, mix, encode or synchronise anything; nothing here drives an animation or a timeline.
- Evidence is partial. Generated 120 BPM clicks (18 clicks, 22050 Hz mono) and four steady tones (440 to 3520 Hz): beat and onset times matched the clicks within 30 ms both ways (worst 29.43 ms beats, 24.81 ms onsets, little margin on beats); each tone's STFT peak fell within one bin (10.77 Hz at `n_fft` 2048); two reruns were byte-identical on one machine.
- Failed: `beat_track` returned 117.45 BPM for 120 BPM clicks (-2.1 %, outside the predeclared +/-2 %). At `hop_length` 512 and 22050 Hz a frame is 23.2 ms, so 0.5 s falls between 21 and 22 frames and the tempo lands on the 22-frame period. Use the beat times, not the tempo scalar. A finer hop or an explicit `start_bpm` may help; both are untested.
- Not validated: real recordings or music, sweeps, MFCC, chroma, tempograms, pitch tracking, loudness, resampling quality, other platforms, cross-machine determinism.
- Neighbours: aubio for CLI onset, beat and pitch detection; Meyda for JS features; Web Audio for live browser audio; FFmpeg for decode, mux and loudness. Pillars `SOUND-` (sound design, e.g. `SOUND-BEAT-ALIGN`) and `PACE-` (pacing, e.g. `PACE-BEAT-06`) own the tolerances for putting events on beats; read them with `vcr rules info <ID>`. This guide sets no thresholds.

## Capability map
Discoverability only; the [API reference](https://librosa.org/doc/latest/index.html) is authoritative.
- **Tested:** `librosa.load` (`sr=None`, `mono=True`); `librosa.beat.beat_track` and `librosa.onset.onset_detect` with `units="time"`; `librosa.stft`, `librosa.fft_frequencies`, `librosa.frames_to_time`.
- **Documented, untested:** feature extraction (`librosa.feature`: mel, MFCC, chroma, tempogram), `librosa.pyin` and `librosa.yin` pitch, effects and time stretching (`librosa.effects`), `librosa.resample`, `librosa.display`, `librosa.decompose`, sequence tools.
- **Avoid:** `librosa.example()` and example-data helpers download over the network; the fixture uses none.

## Install and doctor
Use a venv, not the system Python, and pin everything. The example keeps its pinned set in `examples/librosa-beat-spectra/requirements.txt` (librosa 1.0.1, numpy 2.5.5, numba 0.68.1):

```sh
cd examples/librosa-beat-spectra
python3 -m venv output/venv && output/venv/bin/python -m pip install -r requirements.txt
output/venv/bin/python -c "import librosa"
```

librosa is a project dependency, not a machine executable; `vcr doctor` does not prove it. The check above does. Use a Python that has `_lzma`: the pyenv 3.12.2 here lacked it and `import librosa` failed inside pooch; the working venv used Homebrew Python 3.15.2.

## Smoke test
```sh
cd examples/librosa-beat-spectra && ./run.sh
# expect: PARTIAL, run.sh exits 1 and prints the failing tempo check from output/run-a.log
```
Today the fixture fails on the tempo check, so no `librosa-beat-spectra: OK` line exists yet. Everything else is checked: beat and onset times, tone peaks, and `run-a.json` equal to `run-b.json` byte for byte.

## Recipe: beat and onset times
```py
import librosa
y, sr = librosa.load(path, sr=None, mono=True)
_, beat_times_s = librosa.beat.beat_track(y=y, sr=sr, hop_length=512, units="time")
onset_times_s = librosa.onset.onset_detect(y=y, sr=sr, hop_length=512, units="time")
```
Quantisation is one hop (23.2 ms at these settings). Convert times to frames only through the pillar's rounding rule.

## Troubleshooting
- `import librosa` fails in pooch with no `_lzma`: rebuild the venv from a Python that includes it.
- `run.sh` says the venv does not match `requirements.txt`: recreate it from the pinned file.
- Tempo is a few percent off a known BPM: the hop grid, not a bug; use beat times.
- Array hashes change after a librosa, numba or numpy upgrade while checks still pass: expected; rerecord.

## Official docs
- [librosa documentation](https://librosa.org/doc/latest/index.html)
- [librosa 1.0.1 source](https://github.com/librosa/librosa/tree/1.0.1)
