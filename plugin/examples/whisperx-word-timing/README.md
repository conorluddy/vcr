# WhisperX word-timed transcription of a generated sentence

## Intent and scope

VCR job and claim: `whisperx` transcribes a generated English sentence with the
predeclared words (word error rate at most 0.10 against the reference), its aligned
word starts fall within 0.20 s of the ground-truth word onsets for at least 9 of the 10
words, and two independent reruns give identical transcript text. Timing determinism
across reruns is recorded, not gated.

Tool: WhisperX 3.8.6 (latest stable on PyPI, released 2026-05-25), Python package
`whisperx`, installed from PyPI into `output/venv`. The 3.8.7rc1 prerelease is not used.
Model: faster-whisper `tiny.en` (smallest English model), ASR on CPU with `int8`.
Alignment: WhisperX's default English wav2vec2 aligner (torchaudio pipeline).

Explicit exclusions:
- No diarization (`DiarizationPipeline`): it needs a gated pyannote model and a Hugging Face
  token. Diarization is untested and makes no claim here.
- No other languages, no other Whisper sizes (`base`, `small`, `large`), no other
  compute types or GPU backends. Only CPU, `int8`, on this machine.
- Timing is checked against a reference built from energy onsets, not a human-labelled
  reference. It is accurate to roughly tens of milliseconds at best, so the 0.20 s
  tolerance is a bound on gross misalignment, not a precision claim.
- No claim about speech in noise, accents, real recordings, or word-level quality
  beyond the single generated sentence.
- Narration pacing is a pillar, not a tool claim. Narration-against-visuals rules are
  `PACE-NARR-03` and `PACE-NARR-04` (`references/README.md`). This fixture produces word
  timestamps that such checks could use. It does not test those rules and does not claim
  to satisfy them.
- Model output is pinned to these package and model versions. Upstream says ML output
  drifts across versions, so a different version needs a new run.

Licence and documentation sources, checked 2026-11-24:
- https://github.com/m-bain/whisperX (README; `LICENSE` is BSD-2-Clause). PyPI metadata
  for `whisperx` 3.8.6 also reports BSD-2-Clause and `requires_python >=3.10,<3.14`.
- Card: `catalog/tools/whisperx.json` (checked 2026-11-15, verdict keep).
- Model terms are separate from the code licence and are not verified in detail here.
  The Whisper weights and the torchaudio wav2vec2 aligner weights are downloaded to
  `output/cache` and are never committed or redistributed by this fixture.

Environment: macOS 26.6 (build 25G5043d, Darwin 25.6.0), arm64 (Apple M3), CPU only.
CPython 3.12 for the venv, selected by `uv venv --python 3.12` (uv resolved 3.12.13).

Input: generated locally by macOS built-in `say` (voice `Samantha`, `en_US`) for each
of ten words, converted to 16 kHz mono PCM WAV with ffmpeg, then concatenated by
`make_input.py` with a 0.50 s lead-in and 0.40 s silence between words. Sentence:
"the red fox jumps over the quiet brown river today" (ten words; amended before any run
from a nine-word draft, which miscounted the words). The Samantha voice is Apple's system
voice; the output is not redistributed and is regenerated into `output/` each run.
No third-party audio is used. Hashes of generated WAVs are not gated, because voice
output can change with the macOS version.

Dependencies and installation plan (approved for this batch):
- `uv venv --python 3.12 examples/whisperx-word-timing/output/venv`.
- `uv pip install --python examples/whisperx-word-timing/output/venv/bin/python whisperx==3.8.6`.
  Torch is the version pinned by the package (2.8.x). On macOS arm64 the PyPI wheels have
  no CUDA and run on CPU, which is the upstream Mac guidance (`--device cpu --compute_type int8`).
  If `download.pytorch.org/whl/cpu` offers a macOS arm64 build that resolves the same
  version, it may be used; the chosen source is recorded in Observation.
- Network: PyPI for installation; Hugging Face Hub (`tiny.en`) and the torchaudio
  asset host (the English aligner) on first run.
- Environment for every run is set in `run.sh`: `HF_HOME`, `TORCH_HOME` and
  `XDG_CACHE_HOME` all point to `examples/whisperx-word-timing/output/cache`, so nothing
  is written to the user's home cache. No system or global package changes.
- Models are never committed.
- Cleanup: remove `examples/whisperx-word-timing/output` (venv, cache, WAVs, JSON).

Selected workspace and output: `examples/whisperx-word-timing/output/` (git-ignored).
Committed: this README, `example.json`, `run.sh`, `make_input.py`, `transcribe.py`,
`check.py`, `expected/checks.json` and `expected/alignment.json`. No audio, no model, no venv.

## Plan, before running

Commands (after the install above):
```
examples/whisperx-word-timing/run.sh            # builds input, transcribes twice, checks, diffs expected/
examples/whisperx-word-timing/run.sh --record   # only after a deliberate change
```

Pipeline:
1. `say -v Samantha -o output/words/NN.aiff "<word>"` for each word, then ffmpeg to
   `output/words/NN.wav` (16 kHz, mono, pcm_s16le).
2. `make_input.py` concatenates the ten clips with a 0.50 s lead-in and 0.40 s gaps into
   `output/input.wav`. The reference onset of each word is the first sample whose absolute
   value reaches 3% of that clip's peak, added to the clip's start on the sentence timeline.
   Writes `output/reference.json`.
3. `ffprobe` on `output/input.wav` into `output/input-ffprobe.json`.
4. `transcribe.py` run twice, in two separate processes: `output/run1.json`, `output/run2.json`.
   Each runs `load_audio`, `load_model("tiny.en", "cpu", compute_type="int8", language="en")`,
   `transcribe(batch_size=8)`, `load_align_model("en")`, then `align` with word timestamps.
5. `check.py` writes `output/checks.json` (gated and deterministic), `output/timing.json`
   (informational floats) and `output/alignment.json` (run 1, timings rounded to 0.01 s).
6. `run.sh` diffs `expected/checks.json` and `expected/alignment.json` against the outputs.

Predeclared checks:
- G1 input: 16 kHz, 1 channel, pcm_s16le WAV; ffprobe duration within 0.02 s of the
  duration computed from the construction.
- G2 word error rate: Levenshtein distance between normalised reference words (lowercase,
  letters and digits only) and normalised ASR words, divided by 10, is at most 0.10, in
  both run 1 and run 2.
- G3 alignment: at least 9 of the 10 reference words are matched exactly in the
  alignment (equal operations in the Levenshtein backtrace), and every matched word has
  numeric `start` and `end`.
- G4 timing: for every matched word, `|start - reference onset| <= 0.20 s`, in both runs.
- G5 determinism of text: the raw transcript string and the normalised word list are
  identical between run 1 and run 2.
- Informational, not gating: whether run 1 and run 2 timings agree to 1 ms; mean and
  maximum absolute start error; wall time per run; `whisperx`, `faster-whisper`, `torch`
  and `torchaudio` versions from `importlib.metadata`.

Expected failure modes and stop conditions:
- Install or import failure: stop, keep logs. No substitute ASR tool is used.
- A model download failure, or a missing aligner for `en`: stop, report `blocked`.
- Any G-check failing: the record keeps `not-validated`, or is `partial` if only timing
  fails (with the error figures as scope). The predeclared bounds are not changed after
  running. A model size change is a new predeclared run, not a fix to this one.
- Reruns that differ in text (G5) fail the determinism part of the claim. Reruns that
  differ only in timing are recorded and do not fail G5.

Inspection: no image or audio playback is used as a gate. `output/alignment.json` lists
every aligned word with its start and end, and `output/checks.json` lists every check.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local: macOS 26.6 (build 25G5043d,
Darwin 25.6.0), arm64 (Apple M3), CPU only, from `examples/whisperx-word-timing`.

Versions (from `output/venv`, freeze in `output/freeze.txt`, ignored):
- whisperx 3.8.6 (PyPI, BSD-2-Clause); faster-whisper 1.2.1; ctranslate2 4.9.1.
- torch 2.8.0, torchaudio 2.8.0, torchvision 0.23.0 from `https://download.pytorch.org/whl/cpu`
  (macOS arm64 wheels). whisperx itself from PyPI.
- pyannote-audio 4.1.1 is installed by the package. Its bundled VAD ran by default, which
  needed no token or download.
- Python 3.12.13 (uv-managed). ffmpeg and ffprobe 9.0.2 (Homebrew).
- Playwright and Chromium: not used. Node v22.19.0 is installed but not used.
- `say`: macOS built-in, voice Samantha. The voice version is not reported by `say`; the
  macOS build above is the identifier.

Commands: `run.sh --record` (first run, models downloaded), then `run.sh` (printed
`whisperx-word-timing: OK`), then `run.sh` again with exit status 0. Each `run.sh` makes two
separate transcription processes, so there were six transcriptions in total. The
checks and alignment outputs were identical across all three invocations (the diffs in
the verify and final runs were empty).

Measured (`output/checks.json`, `output/timing.json`, final run):
- G1 input: `pcm_s16le`, 16000 Hz, 1 channel, duration 8.590625 s (reference 8.590625 s).
- G2 word error rate: 0 of 10 words wrong in run 1 and in run 2. Transcript:
  "the red fox jumps over the quiet brown river today."
- G3 alignment: 10 of 10 reference words matched and timed in each run.
- G4 timing: absolute start error against the reference onsets, mean 0.0333 s, maximum
  0.0768 s (both runs; bound 0.20 s). From the 2-decimal alignment against the reference
  starts in `reference.json`, eight of ten aligned starts are later, by about 0.002 to 0.08 s
  (`over` is the largest), and two (`the` and `fox`) are earlier by about 0.005 s. The aligned
  starts therefore sit slightly late on average, which is a bias to keep in mind, not a failure.
- G5 determinism of text: transcripts identical across runs. Word starts and ends agree
  to 1 ms across runs 1 and 2 (`timingIdenticalTo1ms: true`; informational).
- Wall time per transcription process with warm caches: 20.6 s and 19.3 s (record run,
  cold, 22.9 s and 10.9 s). Real-time factor is not meaningful at this length.

Inspection: no contact sheet, because the output is audio, not frames. Instead
`output/inspect-waveform.png` is an ffmpeg `showwavespic` waveform of `output/input.wav`
with red marks at the aligned starts. The figure shows ten separate speech bursts with a
silent lead-in and silent gaps between them. Red marks sit at the leading edge of most
bursts. At this scale the waveform hides several of them, and the green reference marks are
not distinguishable from the red ones, so the image shows the bursts and the alignment
landing on them, not the reference separately. The numeric checks carry the timing claim.

Pass, on the predeclared checks: G1, G2 (both runs), G3 (both runs), G4 (both runs) and
G5. Result: pass.

What this establishes: on this machine, with faster-whisper `tiny.en` on CPU at `int8`
and WhisperX's default English aligner at version 3.8.6, a ten-word sentence of
Samantha-voiced word clips with 0.4 s gaps transcribes exactly, aligned word starts fall
within 0.08 s of energy-based onsets, and two reruns give the same transcript and the same
timings to 1 ms.

What it does not establish: diarization; any other model size, language, compute type or
device (the MPS tip from ctranslate2 was not used); real or noisy speech, accents, or
natural prosody; a human-labelled timing reference; cross-machine or cross-version
determinism; or any `PACE-NARR` narration rule.

Deviations and limitations:
- The sentence was amended from nine words to ten before any run, and the README was
  corrected to match. No result existed at that point.
- The venv Python is uv's CPython 3.12.13, not the pyenv 3.12.2 first named; corrected above.
- Torch and torchaudio come from PyTorch's CPU index for macOS arm64, as planned. The
  index was checked for `torch==2.8.0` and `torchaudio`/`torchvision` before install.
- The `expected/` directory was created when the record ran. It was not hand-written.
- Warnings in the logs, none of which changed results: a pyannote `torchcodec` fallback
  warning, a Lightning notice that the bundled VAD checkpoint could be upgraded, and the
  ctranslate2 MPS tip (device is `cpu`, so unused).
- Model downloads, all under `output/cache` (435 MB): faster-whisper `tiny.en` (about 74 MB,
  Systran conversion) and the torchaudio English wav2vec2 aligner (360 MB). Their licence
  terms were not checked in detail here; nothing is redistributed. The venv is 1.1 GB and
  `output/` totals about 1.5 GB. Cleanup: remove `examples/whisperx-word-timing/output`.

Reviewer, decision and revisit triggers: revisit on any change to whisperx, faster-whisper,
ctranslate2, torch or torchaudio; on a different model size or language; on a change in the
macOS `say` output (the reference onsets follow the generated audio); or when diarization
access is available, which is outside this claim.
