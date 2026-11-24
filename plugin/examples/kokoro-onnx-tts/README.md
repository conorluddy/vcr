# kokoro-onnx fixed-sentence TTS fixture

## Intent and scope

VCR job and claim: kokoro-onnx synthesises one fixed English sentence with one
named voice at a fixed speed to a WAV at the model's sample rate. The duration
falls in a predeclared range for the text, the audio is non-silent (RMS above a
silence floor), and a rerun with the same inputs is sample-identical. Whether
ONNX Runtime CPU is deterministic here is recorded either way.

Tool: kokoro-onnx, Python package `kokoro-onnx`, pinned `0.6.0` (PyPI, uploaded
2026-08-18; wheel sha256 `ebbac0ceb977b156185febda317f1546ca57e1a7d7b129119dda7ef20faadc6a`).
PyPI also lists 0.6.1 (2026-08-19), which was not used. The card's assessed version is 0.6.0.

Explicit exclusions:
- Only English (`lang="en-us"`, the library default) with one fixed sentence,
  `The quick brown fox jumps over the lazy dog.` No other languages, no Chinese
  model (`kokoro-v1.1-zh`), no other voices, no phoneme input, no streaming.
- Only the fp32 model `kokoro-v1.0.onnx`. The fp16 and int8 variants are not tested.
- Speed is fixed at 1.0. No speed sweep.
- Only WAV output, mono, 16-bit PCM, written by Python's `wave` module. No other container or codec.
- No claim of speech quality, intelligibility, naturalness or pronunciation.
  The checks are a measured duration, a silence floor and a repeat, not a listening test.
- No sound-design or loudness claim. The RMS value is a silence detector only.
  Narration timing against picture belongs to the pacing pillar and is not tested here.
- Determinism is measured on this machine and this ONNX Runtime build only.
- The library's default `trim=True` (removes leading and trailing silence) and its
  default pauses are used as shipped, not tuned.

Licence and documentation sources, checked 2026-11-24:
- kokoro-onnx code: MIT (`LICENSE` in https://github.com/thewh1teagle/kokoro-onnx, also the README licence section).
- Kokoro model weights: Apache-2.0, per the model card https://huggingface.co/hexgrad/Kokoro-82M
  (`license: apache-2.0`) and the kokoro-onnx README ("Kokoro model: Apache 2.0").
- Voice bank (`voices-v1.0.bin`) ships with the model release. The model card states the
  voices are part of the Apache-licensed model. Its training-data table lists CC BY and
  CC BY-SA sources for some audio; that table was not reviewed further, so the voice
  licence is not separately verified.
- espeak-ng (via `espeakng-loader`, the phonemizer backend) is GPL-3.0. It is a runtime
  dependency of the library and is not redistributed by this example.
- `onnxruntime`, `numpy`, `phonemizer`, `espeakng-loader` keep their own licences.

Environment: macOS 26 (Darwin 25.6.0), arm64, Python 3.12.2 from pyenv (the
library requires `>=3.10,<3.14`). ONNX Runtime CPU execution provider only.
No GPU; no network during synthesis.

Input: no external text or audio. The sentence is a literal in `synthesise.py`. The
inputs are the model and voice bank from upstream releases (below).

Models and voice bank (downloaded by `fetch-models.sh` into `output/models/`, git-ignored, never committed):
- `https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx`
  sha256 `beb0d1848dee9a49da392cc3df26958d46cfa35d321edf434f52949153f0df3a` (325505369 bytes)
- `https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/voices-v1.0.bin`
  sha256 `bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d` (28214398 bytes)

Hashes are the GitHub release asset digests of the `model-files-v1.1` release, read on
2026-11-24 from the GitHub releases API. `fetch-models.sh` checks them before use.
The `model-files-v1.0` assets were not used.

Cache paths: the venv, models, WAVs and any caches live under `examples/kokoro-onnx-tts/output/`.
`run.sh` points `HF_HOME`, `XDG_CACHE_HOME`, `PIP_CACHE_DIR` and `TMPDIR` under `output/`.

Dependencies and installation plan (approved, nothing else):
- `examples/kokoro-onnx-tts/output/venv`, created with pyenv Python 3.12.2 (`python3 -m venv`).
- `output/venv/bin/pip install -r requirements.txt`, which pins `kokoro-onnx==0.6.0` only.
  pip resolves `onnxruntime`, `numpy`, `phonemizer`, `espeakng-loader` from PyPI.
  The resolved set is written to `output/dependencies.txt` by `run.sh`.
- `fetch-models.sh` downloads the two files above with `curl` into `output/models/`, then checks sha256.
- Network: GitHub (model files) and PyPI (package), for installation only.
- Nothing system-wide; no global package, shell or Homebrew change.
- Cleanup: remove `examples/kokoro-onnx-tts/output` (venv, models, WAVs, logs).

Selected workspace and output: `examples/kokoro-onnx-tts/output/` (git-ignored).
Committed: this README, `example.json`, `requirements.txt`, `fetch-models.sh`,
`synthesise.py`, `check.py`, `run.sh`, `expected/checks.json`.

## Plan, before running

Commands:
```
examples/kokoro-onnx-tts/fetch-models.sh     # once: download and sha256-verify into output/models
examples/kokoro-onnx-tts/run.sh --record     # only after a deliberate change
examples/kokoro-onnx-tts/run.sh              # must print kokoro-onnx-tts: OK
```

`synthesise.py OUT.wav` loads `output/models/kokoro-v1.0.onnx` and
`output/models/voices-v1.0.bin`, calls
`Kokoro.create(TEXT, voice="af_heart", speed=1.0, lang="en-us")` with library
defaults, and writes the samples as 16-bit mono PCM at the sample rate the library
returns. It is run three times: twice in one process (`OUT.wav`, `OUT-rerun.wav`)
and once in a second process (`OUT-process2.wav`), so both in-process and
cross-process repeats are tested.

Fixed inputs: text `The quick brown fox jumps over the lazy dog.`; voice `af_heart`
(the run stops if it is absent from the bank); speed `1.0`; language `en-us`.

Predeclared checks (all gating unless marked informational):
1. Sample rate: the WAV header reports the library's returned rate (24000 Hz), 1 channel, 2 bytes per sample.
2. Duration: frame count divided by the sample rate lies in `[1.5, 4.0]` seconds
   (a plausibility band for a 9-word sentence at speed 1.0, not a target).
3. Non-silent: RMS of the int16 samples, as a fraction of full scale, is greater than
   `0.001` (about -60 dBFS). A silence floor only, not a loudness rule.
4. Voice is present in the bank; voice, speed and language are recorded as given.
5. In-process repeat: the second `create` call gives the same int16 PCM (sha256 of the PCM bytes).
6. Cross-process repeat: a second process gives the same int16 PCM sha256.
   Both repeats are recorded. A difference is a recorded finding, not an automatic pass;
   the expected file pins what was observed on this machine.
7. Informational: float32 peak absolute sample, ONNX Runtime version, library version.

Expected artifacts: `output/checks.json` (every measure above), `output/synth.log`,
`output/dependencies.txt`, three WAVs under `output/`. Only `expected/checks.json` is retained.

Inspection: there is no picture. The visual route is a waveform plot of the first WAV
(`output/waveform.png`) from a throwaway script outside the repository. It is inspection only.

Expected failure modes and stop conditions:
- Missing model, voices or venv: stop and report `blocked`. No automatic install.
- sha256 mismatch on download: delete the file, stop, report `blocked`.
- Voice absent, or sample-rate or header mismatch: stop and report `fail`.
- Duration or silence check failing: stop and report `fail`.
- A nondeterministic repeat is not a failure. It is recorded, and the scope will not claim reproducibility.
- Import errors from `phonemizer` or `espeakng-loader`: stop, keep logs, report `blocked`.

Reproduction: run `fetch-models.sh`, then `run.sh`. Inspect `output/checks.json`
and `output/waveform.png`.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (macOS 26.6, Darwin 25.6.0, arm64),
from `examples/kokoro-onnx-tts`. Versions: kokoro-onnx 0.6.0; onnxruntime 1.32.0 (CPU
provider); numpy 2.5.5; phonemizer 3.6.0; espeakng-loader 0.2.4; Python 3.12.2. The full
freeze is in `output/dependencies.txt`. Playwright, Chromium and Node are not used.

Sequence: `fetch-models.sh` (both sha256 checks ok), `run.sh --record`, `run.sh`
(printed `kokoro-onnx-tts: OK`).

Measured (`output/process1/measures.json`, `output/process2/measures.json`, `output/checks.json`):
- Sample rate 24000 Hz, mono, 16-bit WAV; the header matches the library's returned rate.
- Frames 65536; duration 2.731 s (predeclared band 1.5 to 4.0 s).
- RMS 0.0598 of full scale (floor 0.001); peak 0.41. Two runs in one process gave RMS
  0.05980 and 0.05976, so the level is stable to about four figures, though not identical.
- Voice `af_heart` present in the bank. Speed 1.0, `en-us`.
- Repeats: in-process rerun PCM NOT identical; cross-process PCM NOT identical.
  Between the two WAVs of one process: 60794 of 65536 int16 samples differ, maximum
  absolute difference 2753 (about 8 % of full scale). Between processes: 60503 differ,
  maximum 2613. Differences are large, not rounding noise.

Cause (diagnostic, scratch script outside the repository, not part of the fixture): the
model graph contains `RandomNormal`/`RandomNormalLike` and `RandomUniform`/`RandomUniformLike`
operators (grep of `kokoro-v1.0.onnx`) and no `seed` attribute. Three calls in one process
with one intra-op thread gave three different waveforms (digests differ; max sample
difference 0.084). Four threads behaved the same. So the non-determinism comes from the
model's random ops, not from thread scheduling. Seeding is not exposed by the library
and was not attempted; changing the model is out of scope.

Inspection: `output/waveform.png` (1200 x 300, drawn with ImageMagick from the PCM) shows
nine speech-like bursts separated by short gaps, decaying to silence at about 2.5 s,
with no clipping and no flat or truncated section. The envelope printed per 0.25 s window
falls from RMS about 0.06 to 0.0065 at the end. This is a picture of the waveform only.
I did not listen to the file, so pronunciation, voice identity and naturalness are not established.

Deviation, recorded for honesty: the first `--record` pinned run-varying values (PCM
SHA-256 hashes, RMS, peak, duration) into `expected/checks.json`, so the second run could
not match. The first record was overwritten before anything was committed. The diffed
checks were narrowed to stable facts (gating booleans, sample rate, frame count,
versions, voice, speed, language and the two repeat booleans, which are recorded but
not gating). The varying values stay in `output/*/measures.json` and are read by the
gates in `check.py`. The predeclared gates and thresholds were not changed.

Pass / partial, on the predeclared checks:
- Pass: sample rate, mono 16-bit WAV, frame count matching the library output, duration
  in range, non-silent above the floor, named voice present, fixed speed and language, and
  synthesis from a pinned package and verified model files.
- Fail: sample-identical rerun, in-process and cross-process. The claim says the rerun is
  sample-identical, and it is not for this model on this machine. The result is recorded
  as `false`, not hidden.
- Overall: `partial`.

What this does and does not establish: it shows that kokoro-onnx 0.6.0 with the v1.1
release fp32 model and voice bank writes a 24 kHz mono WAV of the fixed English sentence
with `af_heart`, at speed 1.0, with a duration in range and non-silent audio, on this
machine. It does not show reproducibility (reruns differ), speech quality, other voices,
languages, speeds, the fp16/int8 variants, other platforms, or any sound-design or
timing claim.

Reviewer, follow-up and revisit triggers: revisit if the model or kokoro-onnx changes,
if a seed or deterministic option is exposed (then the repeat check should become gating),
or if a listening pass is wanted. The voice licence was not separately verified (see
licence notes above).
