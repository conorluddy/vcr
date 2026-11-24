---
name: pedalboard
description: Apply built-in audio effects (highpass, compressor, gain, limiter) offline in Python with Spotify's pedalboard. Load when a generated or recorded audio array needs an effects chain; the Limiter is not a peak ceiling, and the library is GPLv3.
---

# pedalboard

A Python library that chains audio effects over numpy arrays and reads and writes audio files. It sits in audio preparation, before the mix is measured and delivered.

`vcr` below means `pnpm vcr` inside the VCR repository.

## Use cases and limits
- Offline processing in Python: filter, compress, add gain, limit.
- Basic conversion, muxing, simple filters: `ffmpeg`. Command-line effects and synthesis of test signals: `sox`. Loudness target or a true-peak ceiling: `ffmpeg-normalize` (or FFmpeg `loudnorm`).
- Levels are policy, not this tool: see `vcr rules info SOUND-TRUE-PEAK` and `SOUND-CLIP`. The fixture's dB values are parameters, not recommendations.
- Evidence is partial: pedalboard 0.9.26, Python 3.12.2, numpy 2.5.5, macOS arm64. Built-in `HighpassFilter`, `Compressor`, `Gain`, `Limiter` on generated tones and noise (48 kHz mono, 2 s). No third-party VST3 or Audio Unit was loaded; plugin hosting is untested. No real speech or music, no loudness or oversampled true-peak measurement.
- Licence: the project code is GPLv3, so code that links or imports it and is redistributed (a plugin, an app, a shipped binary) takes on GPL obligations. Running it locally to make audio files does not. Bundled libraries and third-party plugins have their own terms, unchecked here. Decide before redistributing, not after.

## Capability map
Official entry: [README](https://github.com/spotify/pedalboard) and the [API reference](https://spotify.github.io/pedalboard/). Discovery only; documented does not mean validated.
- Tested: `Pedalboard` chain called as `chain(array, sample_rate)`; `HighpassFilter`, `Compressor`, `Gain`, `Limiter`; `pedalboard.io.AudioFile` writing and reading 16-bit WAV.
- Documented, untested: other processors (reverb, delay, EQ, distortion, codecs such as `MP3Compressor`); `load_plugin` for VST3 and Audio Unit; streaming and real-time use; resampling; float32 file output; multichannel; `Chain`/`Mix` nesting.

## Install and doctor
```text
python3 -m venv examples/pedalboard-effects-chain/output/venv
examples/pedalboard-effects-chain/output/venv/bin/pip install -r examples/pedalboard-effects-chain/requirements.txt
examples/pedalboard-effects-chain/output/venv/bin/python -c "import pedalboard; print(pedalboard.__version__)"
vcr doctor
```
`requirements.txt` pins `pedalboard==0.9.26` and `numpy==2.5.5`. Never assume it is installed.

## Smoke test
```text
vcr example create pedalboard-effects-chain   # then create the venv as above
(cd examples/pedalboard-effects-chain && ./run.sh)
```
Expected today: it prints a diff-free report and then `pedalboard-effects-chain: predeclared claim checks failed`, exit 1, because the recorded limiter check fails. `output/checks.json` equals `expected/checks.json`; `"all_passed": false` with only `limiter_peak_at_or_below_threshold` false is the baseline. The failure is the finding below, not a broken install.

## Recipe
```python
from pedalboard import Pedalboard, HighpassFilter, Compressor, Gain
from pedalboard.io import AudioFile
out = Pedalboard([HighpassFilter(cutoff_frequency_hz=1000),
                  Compressor(threshold_db=-6, ratio=4, attack_ms=1, release_ms=100),
                  Gain(gain_db=6)])(samples, 48000)   # float32 numpy, shape (frames,) or (channels, frames)
with AudioFile("out.wav", "w", 48000, 1) as f: f.write(out)
```
Shown by the fixture:
- `HighpassFilter` is first order (6 dB/octave): with a 1000 Hz cutoff a 200 Hz tone fell 14.16 dB against the same chain without it, a 5 kHz tone moved -0.16 dB. Do not expect a steep cut.
- Output length (96000 frames) and rate (48000 Hz) match the input.
- Processing is deterministic here: a second call on the same chain, a fresh chain, and a rerun in a separate process were bit-identical. Same machine only.
- A 16-bit WAV written and read with `AudioFile` came back within 2 LSB (max diff 4.4e-5). The writer used exposes no float subtype, so no float file round trip is claimed.

## Limiter is not a peak ceiling
`Limiter(threshold_db=...)` applies makeup gain and the output hard-clips at 0 dBFS. In the fixture a loud 5 kHz tone through the full chain with a -1 dB threshold peaked at 0.00 dBFS (the check failed, by design not weakened). A diagnostic outside the gating checks gave a peak of 1.0 for thresholds of -1, -6 and -12 dB on an amplitude 0.8 tone; at 0.3 the peak was 0.52, 0.92 and 1.0. The docstring says it increases perceived loudness and does not enforce a ceiling.
- To get a ceiling, follow the chain with explicit `Gain` and measure the sample peak (and true peak per `SOUND-TRUE-PEAK`; the fixture measured sample peak only), or finish with `ffmpeg-normalize -tp` / `loudnorm`. Treat any `Limiter` output as possibly clipped (`SOUND-CLIP`).
- Do not claim a Limiter threshold as a delivered peak without a measurement.

## Troubleshooting
- Peak at 0 dBFS despite a lower limiter threshold: see above; lower the level with `Gain` after the chain and re-measure.
- `run.sh` exits 1 with the diff clean: expected, see Smoke test.
- Venv missing: `run.sh` stops and does not install; create it as shown.

## Official docs
- https://github.com/spotify/pedalboard
- https://spotify.github.io/pedalboard/
- https://github.com/spotify/pedalboard/blob/master/LICENSE
