---
name: kokoro-onnx
description: Synthesise local English speech to a 24 kHz WAV with kokoro-onnx (Kokoro TTS on ONNX Runtime CPU). Load when scratch or final narration must be generated offline; output is not reproducible, so keep the rendered WAV as an asset.
---

# kokoro-onnx

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Text to a mono 16-bit WAV at 24000 Hz on the CPU, offline, with a named voice from a voice bank. Piper is the other local TTS neighbour (broader voices and languages, GPL-3.0); choose by licence and voice coverage.
- **Reruns are not sample-identical.** The model graph holds unseeded `RandomNormal`/`RandomUniform` ops. This is not thread scheduling: one thread and four threads both varied. Same inputs gave different PCM in-process and across processes (about 92 % of samples differ, max int16 difference 2753). Never hash TTS output or diff it against a golden WAV. Render once and keep that WAV as the deliverable asset.
- Level and length were stable only roughly across reruns (RMS 0.05980 vs 0.05976). Do not assume frame-exact timing; measure the WAV you keep.
- Loudness, narration rate and sync belong to the pillars: `SOUND-NARRATION-WPM`, `SOUND-NARRATION-VISUAL-LEAD`, `SOUND-NARRATION-TEXT-REDUNDANCY`, `PACE-NARR-*` (`vcr rules info <ID>`). This guide sets no thresholds.
- Licences: code MIT, model Apache-2.0. The voice bank licence is not separately verified (the model card lists CC BY / CC BY-SA training sources); check before shipping. The phonemizer backend espeak-ng is GPL-3.0 and is a runtime dependency, not redistributed here.

## Capability map
Documented surface, see the [project README](https://github.com/thewh1teagle/kokoro-onnx): the `Kokoro(model, voices)` class and `create(text, voice, speed, lang)`; a streaming `create_stream`; phoneme input; other languages; fp16 and int8 model variants; a Chinese model (`kokoro-v1.1-zh`); GPU providers.

Tested by VCR: one fixed English sentence, voice `af_heart`, speed 1.0, `lang="en-us"`, fp32 `kokoro-v1.0.onnx`, library defaults (`trim=True`), written to WAV. Untested: all the rest above, other voices, speed, quality, pronunciation and naturalness (no listening test). Documented does not mean validated.

## Install and doctor
Everything lives under the example's `output/` (git-ignored); nothing is system-wide.
```text
cd examples/kokoro-onnx-tts
python3 -m venv output/venv        # Python >=3.10,<3.14; tested 3.12.2
output/venv/bin/pip install -r requirements.txt   # kokoro-onnx==0.6.0, pulls onnxruntime 1.32.0
./fetch-models.sh                  # ~337 MB: model-files-v1.1, sha256 verified
```
`vcr doctor` is the check; this guide does not claim it is installed. Check command: `python3 -m pip show kokoro-onnx`.

## Smoke test
```text
vcr example create kokoro-onnx-tts && (cd examples/kokoro-onnx-tts && ./run.sh)
# expect: kokoro-onnx-tts: OK
```
The diff covers stable facts only: 24000 Hz, mono 16-bit, 65536 frames, versions, voice, speed, and both repeat flags recorded as `false`. A sample run measured 2.731 s and RMS 0.0598; those vary per run and are only gated by range (1.5 to 4.0 s, RMS above a 0.001 silence floor).

## Recipe
```python
kokoro = Kokoro("output/models/kokoro-v1.0.onnx", "output/models/voices-v1.0.bin")
samples, sampleRateHz = kokoro.create(text, voice="af_heart", speed=1.0, lang="en-us")
# float32 in [-1, 1]; clip, scale by 32767, write 16-bit mono at sampleRateHz
```
Render once, inspect or listen, then store the WAV as an asset and reference it; do not re-synthesise in a build step.

## Troubleshooting
- Golden-file or hash check fails on a rerun: expected, see above. Gate on duration range and non-silence instead.
- sha256 mismatch on download: the script deletes the file and stops; refetch.
- Voice missing: check `voice in kokoro.voices`; the run stops if absent.
- Import errors from `phonemizer` or `espeakng-loader`: stop and keep logs; not seen in the validated run.

## Official docs
- https://github.com/thewh1teagle/kokoro-onnx (0.6.0; models from release `model-files-v1.1`)
- https://huggingface.co/hexgrad/Kokoro-82M (model card)

Evidence: partial, `examples/kokoro-onnx-tts`, macOS arm64, onnxruntime 1.32.0 CPU, 2026-11-24.
