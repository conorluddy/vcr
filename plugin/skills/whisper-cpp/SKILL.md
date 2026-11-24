---
name: whisper-cpp
description: Transcribe speech to text with whisper.cpp (whisper-cli) on a Mac, writing JSON, SRT and VTT with segment timings. Load when a light native transcript or caption draft is needed; for word-level aligned timings use whisperx.
---

# whisper.cpp

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- whisper.cpp is the light native transcriber: one Homebrew binary (`whisper-cli`), Metal on Apple silicon, no Python or venv, and SRT, VTT and JSON out. Use it for a transcript or a caption draft that a person will review. Caption timing and reading limits are the typography and accessibility pillars' business: `TYPO-CAPTION-DURATION`, `TYPO-CAPTION-CPS` and the accessibility references (`vcr refs section accessibility <section>`); this guide sets no thresholds.
- Use whisperx instead when each word needs its own aligned start and end (narration sync, `PACE-NARR-03`).
- Validated: whisper.cpp 1.9.6 (Homebrew), model `ggml-base.en` (147,964,211 bytes, sha256 `a03779c86df3323075f5e796cb2ce5029f00ec8869eee3fdfb897afe36c6d002`), macOS 26.6 arm64 (Apple M3 Pro), Metal. Input: a 10-word sentence from macOS `say` (Samantha), converted by ffmpeg to 16 kHz mono WAV. Result: word error 0/10 in two separate processes; JSON, SRT and VTT agree on one segment (0.000 to 2.880 s) inside the 2.938 s duration; identical text, and identical segment timings, on rerun.
- That is segment timing only. The segment ended about 58 ms before the file did, so do not read it as frame-accurate.
- Untested: CPU-only path (`-ng`), order across several segments (the fixture made one), word timestamps (`-ml`, `-owts`), other models, sizes or languages, auto language detection, CoreML, real, noisy or accented speech.

## Capability map
Discovery only; documented does not mean validated. Docs: the [whisper.cpp repository](https://github.com/ggml-org/whisper.cpp) and `whisper-cli --help`.
- Tested: `-m` model, `-f` WAV, `-l en`, `-t`, output flags `-oj` (JSON), `-osrt`, `-ovtt`, `-of` prefix.
- Documented, untested: `-otxt`, `-ocsv`, word-level output (`-ml`, `-owts`), `-ng` (no GPU), translation, VAD, quantised models, CoreML encoder, the `whisper-server` and stream binaries, and the C API.

## Install and doctor
```text
brew install whisper.cpp     # the formula was renamed; `whisper-cpp` redirects
whisper-cli --help
vcr doctor
```
The model is a separate download (about 141 MB) and is not committed. The fixture keeps it in its git-ignored `output/models/`:
```text
mkdir -p examples/whisper-cpp-transcribe/output/models
curl -L -o examples/whisper-cpp-transcribe/output/models/ggml-base.en.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
shasum -a 256 examples/whisper-cpp-transcribe/output/models/ggml-base.en.bin
# expect: a03779c86df3323075f5e796cb2ce5029f00ec8869eee3fdfb897afe36c6d002
```
Code is MIT; model weights and input media terms were not reviewed in detail. This guide does not mean whisper.cpp is installed; `vcr doctor` says.

## Smoke test
```text
vcr example create whisper-cpp-transcribe
cd examples/whisper-cpp-transcribe && ./run.sh
# expect: whisper-cpp-transcribe: OK
```
`run.sh` needs `say`, ffmpeg, ffprobe and the model; it does not download. It transcribes twice and diffs `expected/`. A transcription took about 160 ms warm.

## Transcribe recipe
The tested command, 16 kHz mono WAV input:
```text
ffmpeg -y -i in.aiff -ar 16000 -ac 1 -c:a pcm_s16le in.wav
whisper-cli -m ggml-base.en.bin -f in.wav -l en -t 4 -oj -osrt -ovtt -of out/take1
# writes out/take1.json, out/take1.srt, out/take1.vtt
```
Segments are in the JSON under `transcription[]` with `offsets.from` and `offsets.to` in milliseconds. Check the transcript against a known reference before trusting it, and treat the output as a draft for human review.

## Troubleshooting
- Which backend ran: the log prints `load_backend: loaded CPU backend` even when Metal is used, because it lists installed backends. Read the `using <name> backend` line instead (`using MTL0 backend` was Metal; `using BLAS backend` also appeared).
- `whisper-cli: command not found`: install the renamed formula, `brew install whisper.cpp`.
- Model missing or wrong: `run.sh` stops; re-download and compare the sha256 above. Do not substitute another file silently.
- The binary prints no version; use `brew list --versions whisper.cpp`.

## Official docs
- [whisper.cpp repository and README](https://github.com/ggml-org/whisper.cpp)
- [Releases](https://github.com/ggml-org/whisper.cpp/releases)
- [Model files](https://huggingface.co/ggerganov/whisper.cpp)
