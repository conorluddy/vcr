---
name: piper
description: Synthesise one English sentence to a 16 kHz mono WAV with the Piper (piper-tts) CLI and a local voice model. Load before using Piper for narration; covers install, measuring output, and the per-voice licence check. Evidence is partial.
---

# Piper (piper-tts)

## Use cases and limits

Local neural text-to-speech: text in, WAV out, no network at synthesis. The VCR fixture covers one sentence, one voice (`en_US-ryan-low`), the CLI only, on macOS arm64 with piper-tts 1.8.0, onnxruntime 1.32.0, Python 3.12.2. It checks WAV format, a duration range and non-silence. It makes no quality, pronunciation or loudness claim and nothing was auditioned. Narration rate is owned by `SOUND-NARRATION-WPM` and narration against visuals by `PACE-NARR-03/04`; measure the WAV, then judge against those rules. Use FFmpeg to convert, trim or mix, and `ffmpeg-normalize` to hit a loudness target.

## Voice licensing (read first)

Piper grants no licence over voice models. Each voice has its own `MODEL_CARD`; read it before any output enters a deliverable. The fixture voice `en_US-ryan-low` is CC BY-NC-SA 4.0: non-commercial and share-alike, fine for the internal fixture only. A voice fine-tuned from another voice inherits that voice's terms (a CC0 dataset fine-tuned from Ryan is still NC-SA), so walk the `Training` lines. Record the voice and its licence in the brief. The engine is GPL-3.0-or-later; upstream is seeking maintainers.

## Capability map

| Area | Reference | VCR evidence |
| --- | --- | --- |
| CLI `python -m piper` (`-m`, `-c`, `-f`, `-i`, `--length-scale`) | [CLI docs](https://github.com/OHF-Voice/piper1-gpl/tree/main/docs) | Exercised: file output, input from a text file, length scale 1.0 and 1.5. |
| Voice models and index | [piper-voices](https://huggingface.co/rhasspy/piper-voices) | One voice only; others untested. |
| Voice licensing | [LICENSING.md](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/LICENSING.md) | Read; process applies to every voice. |
| Python API, HTTP server, C/C++ API, CUDA, raw output | [repository](https://github.com/OHF-Voice/piper1-gpl) | Untested. |
| Other flags (`--noise-scale`, `--noise-w-scale`, `--sentence-silence`, `--volume`, speaker id) | same | Untested. |

## Install and doctor

```sh
python3 -m venv output/venv
output/venv/bin/python -m pip install piper-tts==1.8.0
# download <voice>.onnx, <voice>.onnx.json and MODEL_CARD from the voice's
# huggingface.co/rhasspy/piper-voices folder; check the md5 in voices.json
```

Check with `python3 -m piper --help`. `piper --version` does not exist in 1.8.0. `vcr doctor` reports whether the tool is installed; do not assume it is. The voice is about 60 MB; keep venv and voices out of git.

## Smoke test

```sh
examples/piper-tts/run.sh
# expect: exits 1 on the length-ratio check (recorded partial); format, duration and non-silence checks pass
```

Recorded sample: `default-a.wav` mono 16-bit 16000 Hz (equal to the config's `audio.sample_rate`), 2.2 to 2.3 s, peak about 1.0 and RMS about 0.18 of full scale. Durations vary between runs.

## Measure, do not predict

- `--length-scale 1.5` gave about 1.2 to 1.3 times the default duration, not 1.5 (ratios 1.331 and 1.225; systematic over repeats; cause not established). Render, then measure the duration with `ffprobe`.
- Reruns with identical settings were not sample-identical (ONNX inference is stochastic; durations moved 2.22 to 2.30 s). Never hash TTS output or diff it as a golden. Check format, duration range and RMS or peak floors instead, and keep the chosen take.
- The sample rate comes from the voice config; resample with FFmpeg if the master needs another.

## Troubleshooting

- `python -m piper` prints a usage error mentioning the required `-m`: pass `-m MODEL.onnx` (and `-c MODEL.onnx.json` if not beside it).
- `--version` fails: it is not a flag; use `--help` or `pip freeze`.
- Length-scale ratio check fails: expected behaviour above; measure instead.

## Official docs

- [piper1-gpl](https://github.com/OHF-Voice/piper1-gpl) (1.8.0)
- [Voice licensing](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/LICENSING.md)
- [Voices](https://huggingface.co/rhasspy/piper-voices)
