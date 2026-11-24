---
name: whisperx
description: Get word-level timestamps from speech audio with WhisperX (faster-whisper ASR plus wav2vec2 forced alignment) on CPU. Load when narration word timings are needed to check or drive sync; it is a heavy model stack, not a light transcriber.
---

# WhisperX

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use WhisperX to turn speech audio into a transcript with a start and end for each word. Those timings can feed narration checks: how narration relates to visuals and on-screen text (`PACE-NARR-03`, `PACE-NARR-04`) and narration rate (`SOUND-NARRATION-WPM`). Read thresholds from `vcr rules info <ID>`; this guide sets none and the fixture tests none of those rules.
- VCR validates WhisperX 3.8.6 (faster-whisper 1.2.1, ctranslate2 4.9.1, torch 2.8.0 CPU) on macOS arm64 (Apple M3), model `tiny.en`, `int8`, CPU, default English wav2vec2 aligner. Input was a generated 10-word sentence ("the red fox jumps over the quiet brown river today") built from macOS `say` (Samantha) clips with 0.50 s lead-in and 0.40 s gaps. Result: word error 0/10; 10/10 words matched and timed; start error against energy-onset references mean 0.033 s, max 0.077 s (bound 0.20 s); identical transcript and timings (to 1 ms) on rerun in a separate process.
- Aligned starts sat slightly late on average (eight of ten later, up to about 0.08 s). The reference is an energy onset, not a human label, so this shows no gross misalignment, not frame-accurate timing.
- Not tested: diarization (needs gated pyannote model access and a Hugging Face token), larger models, other compute types, GPU or MPS, other languages, real recordings, noise, accents, natural prosody, other versions. ML output drifts across versions; commit the alignment JSON you rely on.
- Neighbour finding: in the same backfill, syncalong (Whisper plus a lyrics prompt) failed on the same kind of input. WhisperX's forced alignment is the tested route for word timings here.
- For a lighter transcript without word alignment use whisper-cpp (not validated here). For mouth-shape cues use Rhubarb Lip Sync.

## Capability map
Discovery only. Docs: the [WhisperX repository README](https://github.com/m-bain/whisperX) covers the CLI and Python API.
- Tested: `whisperx.load_audio`, `load_model` (faster-whisper), `model.transcribe`, `load_align_model`, `align` for word timestamps.
- Documented, untested: the `whisperx` CLI, other Whisper sizes and languages, VAD options, character alignment, `DiarizationPipeline` (speaker labels), batch-size and compute-type tuning, GPU backends.
- The bundled pyannote VAD ran by default with no token or download in the fixture.

## Install and doctor
Heavy: about 435 MB of models and a venv near 1.1 GB. Keep both under the example's git-ignored `output/`:

```text
cd examples/whisperx-word-timing
uv venv --python 3.12 output/venv
uv pip install --python output/venv/bin/python whisperx==3.8.6 \
  torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0 \
  --extra-index-url https://download.pytorch.org/whl/cpu
vcr doctor
```
The fixture took torch, torchaudio and torchvision from the PyTorch CPU index and whisperx from PyPI. Python 3.12.13 was used; the package requires `>=3.10,<3.14`. `run.sh` points `HF_HOME`, `TORCH_HOME` and `XDG_CACHE_HOME` at `output/cache`, so the first run downloads `tiny.en` (about 74 MB) and the English aligner (about 360 MB) there. Code is BSD-2-Clause; model terms are separate and were not reviewed in detail. This guide does not mean WhisperX is installed; `vcr doctor` says.

## Smoke test
```text
vcr example create whisperx-word-timing
cd examples/whisperx-word-timing && ./run.sh
# expect: whisperx-word-timing: OK
```
`run.sh` needs `say`, ffmpeg and ffprobe, builds the input, transcribes twice in separate processes, checks word error, matched words, start error and transcript identity, then diffs `expected/`. Run takes about 20 s per transcription with warm caches.

## Word-timing recipe
Tested sequence, device `cpu`, compute type `int8`:

```python
audio = whisperx.load_audio(path)
model = whisperx.load_model("tiny.en", "cpu", compute_type="int8", language="en")
segments = model.transcribe(audio, batch_size=8)["segments"]
alignModel, metadata = whisperx.load_align_model(language_code="en", device="cpu")
aligned = whisperx.align(segments, alignModel, metadata, audio, "cpu", return_char_alignments=False)
words = aligned["word_segments"]  # word, start, end, score
```
Check the output against a known reference before trusting it: normalise to lowercase letters and digits, compare word counts, and keep only words that carry numeric `start` and `end`. Treat timings as a measurement to compare with the cue sheet, not as a replacement for it.

## Troubleshooting
- Warnings about a pyannote `torchcodec` fallback, a Lightning checkpoint upgrade notice and a ctranslate2 MPS tip appeared in logs and changed no result.
- `run.sh` exits at once with no `output/venv`: create it as above; there is no automatic install.
- Aligner or model download fails: stop and report blocked; check network access to Hugging Face and the torchaudio asset host. Do not substitute another model silently.
- Output differs after a package or model change: record a new run; the evidence covers only the pinned versions.

## Official docs
- [WhisperX repository and README](https://github.com/m-bain/whisperX)
- [WhisperX releases](https://github.com/m-bain/whisperX/releases)
- [faster-whisper](https://github.com/SYSTRAN/faster-whisper)
