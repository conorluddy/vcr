---
name: essentia
description: Use Essentia's Python standard mode to estimate BPM, pitch and integrated loudness from an audio file. VCR evidence is partial (2.1b6.dev1438 pre-release, generated audio, macOS arm64); beat tick positions failed.
---

# essentia

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Essentia analyses audio offline in Python and returns numbers: tempo, beat ticks, pitch tracks, loudness. It does not play, mix, encode or drive a timeline; use FFmpeg for that.
- Evidence is partial. Tested only on generated audio: a 120 BPM click track (18 clicks), four steady sines (440 to 3520 Hz) and a stereo 1 kHz tone, 44.1 kHz, `essentia.standard`, default parameters, macOS arm64, Python 3.14.8, PyPI `2.1b6.dev1438`.
- BPM: `RhythmExtractor2013` gave 119.88 for 120 (-0.10 %, pass).
- Pitch: `PitchYinFFT` (2048-sample Hann frames, hop 512) put each of the four tones within 1.3 cents (pass).
- Loudness: `LoudnessEBUR128` gave -6.011 LUFS integrated for the 1 kHz tone against -6.01 expected (pass). Real programme material and gating on it are untested.
- Reruns on one machine were byte-identical.
- Beat tick positions failed: 8 of 18 clicks had a tick within 30 ms, ticks ran 24 to 35 ms late (systematic lag, drifting with the tempo estimate), and there was one extra tick after the last click. Use the BPM for sync, not tick times, or measure the offset on your own audio and correct it. Whether other methods or parameters fix this is untested.
- Neighbours: aubio gave the better onset times, librosa's beat and onset times passed the same 30 ms rule on its fixture; essentia gave the best BPM and loudness here. The fixtures differ, so this is not a head-to-head.
- Judging whether markers land on beats or whether a mix is loud enough is a pillar matter: see `SOUND-BEAT-ALIGN`, `SOUND-BPM-FRAME-GRID` and `SOUND-LOUDNESS-INTEGRATED` (sound design) and `PACE-BEAT-06` (cuts on markers); tolerances live there, not here.

## Capability map
Discovery only; the documented surface is much larger than the fixture.
- **Rhythm** (`RhythmExtractor2013`, tempo and ticks): [algorithm reference](https://essentia.upf.edu/algorithms_reference.html). Tested with `multifeature` only; BPM passed, ticks failed. `degara` and the other beat trackers untested.
- **Pitch** (`PitchYinFFT`): same reference. Tested on steady sines only; `PitchYin`, `PitchMelodia`, `PitchSalience` untested.
- **Loudness** (`LoudnessEBUR128`): same reference. Tested for integrated loudness only; momentary, short-term, loudness range and true peak untested.
- **I/O** (`MonoLoader`, `AudioLoader`): tested for WAV at 44.1 kHz.
- **Streaming mode** (`essentia.streaming`), spectral and MFCC descriptors, onset, key, the CLI extractors, the JavaScript build and the TensorFlow/ONNX models: see the [documentation](https://essentia.upf.edu/documentation.html); all untested. Models have separate licences.

## Install and doctor
The newest release ships only a cp314 macOS arm64 wheel; Python 3.12 would get an older dev build (`2.1b6.dev1389`). It is a beta, so pin exactly. In `examples/essentia-audio-features`:
```sh
/opt/homebrew/bin/python3.14 -m venv output/venv
output/venv/bin/python -m pip install -r requirements.txt   # essentia==2.1b6.dev1438, numpy 2.5.5
```
The card's check is `output/venv/bin/python -c "import essentia.standard"`; `vcr doctor` reports installation. `essentia.__version__` prints `2.1-beta6-dev`, so the PyPI version is the identifier. Licence is AGPL-3.0 per the card; check terms before shipping anything built on it.

## Smoke test
```sh
examples/essentia-audio-features/run.sh
# expect: exit 1, "failing checks: beats_match_clicks_both_ways" on stderr
```
The fixture generates its own audio and writes under `output/`. On the recorded run it exits 1 because the beat check fails; `essentia-audio-features: OK` is not expected and no `expected/` is kept.

## Recipes
Standard mode, sample rate 44100 (`RhythmExtractor2013` requires it):
```python
from essentia.standard import MonoLoader, RhythmExtractor2013, AudioLoader, LoudnessEBUR128
audio = MonoLoader(filename="click.wav", sampleRate=44100)()
bpm, ticks, *_ = RhythmExtractor2013(method="multifeature")(audio)   # use bpm; ticks ran 24-35 ms late
stereo, rate, channels, *_ = AudioLoader(filename="level.wav")()
*_, integrated_lufs, _ = LoudnessEBUR128(sampleRate=44100)(stereo)
```
The return order above is illustrative; check each algorithm's outputs in the reference. `analyse.py` in the example is the tested version, including the pitch framing.

## Troubleshooting
- Wheel not found or older build installed: the interpreter is not 3.14. Use the cp314 wheel route above.
- Ticks consistently late: expected here (24 to 35 ms). Use BPM, or measure and subtract the offset on your audio.
- One tick after the last click: seen once; filter ticks to the known content range.
- `venv does not match requirements.txt` from `run.sh`: reinstall from `requirements.txt` exactly.

## Official docs
- [Essentia](https://essentia.upf.edu/)
- [Python tutorial](https://essentia.upf.edu/essentia_python_tutorial.html)
- [Algorithm reference](https://essentia.upf.edu/algorithms_reference.html)
- [Source](https://github.com/MTG/essentia)
