# Piper local neural TTS fixture

## Intent and scope

VCR job and claim: piper synthesises a fixed English sentence with a pinned
voice to a WAV at the voice config's sample rate; the duration falls in a
predeclared range, the audio is non-silent, `--length-scale 1.5` produces a
predeclared longer duration ratio (within tolerance), and a rerun is
sample-identical (recorded either way).

Tool: piper, package `piper-tts` version `1.8.0` (PyPI, GPL-3.0-or-later, the
piper1-gpl engine). Pinned exactly in `output/venv` only.

Explicit exclusions:
- No sound-design or quality claim: no MOS, naturalness, intelligibility,
  prosody, pronunciation or loudness-standard judgement. Duration and
  non-silence are technical floors, not aesthetic rules.
- One voice only (`en_US-ryan-low`), one sentence, one sample rate (16 kHz).
  No other voice, language, speaker id, `--noise-scale`/`--noise-w-scale`
  tuning, `--sentence-silence`, `--volume`, CUDA, raw output or HTTP server.
- No ffmpeg, espeak-ng or phonemiser claim beyond what the wheel does
  internally. No claim about other platforms.
- Sampling: piper's VITS decoder and stochastic duration predictor draw noise
  inside the ONNX graph. Repeat runs are measured; the claim is not extended
  to a seeded or cross-machine byte identity.
- Voice model and its MODEL_CARD are not committed; no model file is shipped.

Licence and documentation sources, checked 2026-11-24:
- Engine: https://github.com/OHF-Voice/piper1-gpl (GPL-3.0-or-later; PyPI
  metadata `1.8.0`, GPL-3.0-or-later). Upstream says it is seeking maintainers.
- Voice licensing: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/LICENSING.md
  says the Piper project grants no licence over voice models; each voice's
  `MODEL_CARD` names only its own dataset, and `Training` lines must be walked.
- Voice index: https://huggingface.co/rhasspy/piper-voices (`voices.json`).
- Chosen voice `en_US-ryan-low` MODEL_CARD (fetched 2026-11-24): dataset
  ryanspeech, `License: CC BY-NC-SA 4.0`; `Trained from scratch`, so the
  licence chain is one link. Non-commercial, share-alike. Acceptable for this
  internal, non-redistributed fixture only; any product use needs a new review.
- Voices rejected on review: `kathleen-low` (dataset CC0 but fine-tuned from
  Ryan, so NC-SA applies through the chain); `lessac-low` (Blizzard 2013
  research licence with manual approval); `amy-low`, `danny-low` (dataset
  `See URL`, mimic3-voices, not read).

Environment: macOS 26 (Darwin 25.6.0), arm64, Python 3.12.2 from pyenv. CPU
inference via onnxruntime. No GPU, no network during synthesis.

Input: the sentence is in `sentence.txt`, written by hand:
`The quick brown fox jumps over the lazy dog.` No audio input.

Dependencies and installation plan (approved for `piper-tts==1.8.0` only):
- `python3 -m venv examples/piper-tts/output/venv`, then
  `output/venv/bin/python -m pip install piper-tts==1.8.0`. Transitive
  dependencies (onnxruntime, numpy, pathvalidate, protobuf, flatbuffers,
  packaging) come from PyPI; the resolved set is written to
  `output/dependencies.txt` by `run.sh`.
- Pip cache: `output/pip-cache`; XDG cache: `output/cache`.
- Voice: `en_US-ryan-low.onnx`, `.onnx.json` and `MODEL_CARD` downloaded
  from `https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/low/`
  into `output/voices/` (git-ignored, ~63 MB model). The md5 in the official
  `voices.json` is checked; the sha256 of each file is recorded in the
  observation section and in `expected/voice.json`.
- Nothing system-wide. Network is needed for installation and the one download only.
- Cleanup: remove `examples/piper-tts/output`.

Selected workspace and output: `examples/piper-tts/output/` (git-ignored).
Committed: this README, `example.json`, `run.sh`, `synthesise.py`, `check.py`,
`sentence.txt`, `expected/checks.json`, `expected/voice.json`. No WAV, no model.

## Plan, before running

Commands (after the install and download above):
```
examples/piper-tts/run.sh --record   # first run; writes expected/ after a deliberate pass
examples/piper-tts/run.sh            # must print piper-tts: OK
```
`run.sh` calls `python -m piper -m MODEL -c CONFIG -f OUT.wav --length-scale S
-i sentence.txt` three times, then `check.py output` measures the results. Runs:
1. `default-a.wav` at length-scale 1.0.
2. `default-b.wav` at length-scale 1.0, the rerun.
3. `long-1.5.wav` at length-scale 1.5.

Predeclared checks (gating unless marked informational):
1. Each WAV is RIFF/WAVE, PCM, mono, 16-bit, and its sample rate equals the
   `audio.sample_rate` in the voice config (expected 16000). Recorded in `expected/voice.json`.
2. Duration of `default-a.wav` lies in [1.5 s, 5.0 s]. Plausibility range for
   a 44-character sentence, not a pacing rule.
3. Non-silence of `default-a.wav`: peak absolute sample at least 0.01 of
   full scale and RMS at least 0.001 of full scale. Technical floors only.
4. Length ratio: duration(`long-1.5.wav`) / duration(`default-a.wav`) within
   1.5 ± 0.15 (tolerance 10 %). Single-sample ratio; the stochastic duration
   predictor may move it.
5. Voice identity: the model, config and MODEL_CARD sha256 match `expected/voice.json`.
6. Rerun (recorded, not gating): the PCM sample data of `default-b.wav` equals
   `default-a.wav` (sha256 of the data chunk). Either result is recorded; a
   difference does not fail the run and the scope will not claim sample identity.
7. Informational: sample count and duration for each run, peak and RMS, and
   the sha256 of each WAV (`output/measure.json`, ignored).

Gating verdicts (1 to 5) are written to `output/checks.json` and diffed against
`expected/checks.json`. Measured values and the rerun verdict stay in
`output/measure.json` because durations and samples can move between runs.

Expected failure modes and stop conditions:
- Missing venv or model: stop; no automatic install or download.
- Model or config sha256 mismatch against `expected/voice.json`: stop, `blocked`.
- Non-zero exit from `python -m piper`: stop, keep the log in `output/`.
- Any gating check failing: `fail`. A failure in only the length-ratio check
  is `partial`, with the measured ratio as scope.
- Rerun difference: recorded, not a failure.

Inspection: there are no frames. A waveform plot of `default-a.wav` and
`long-1.5.wav` is written to `output/waveform.png` (ignored) by a throwaway
script outside the repository, and the plot is read back before the result is
written. Inspection is not a gating check; no listening test is claimed.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (macOS 26.6, Darwin 25.6.0,
arm64), from `examples/piper-tts`. Versions: piper-tts 1.8.0 (PyPI, GPL-3.0-or-later);
onnxruntime 1.32.0; numpy 2.5.5; protobuf 7.36.2; pathvalidate 3.3.1; Python 3.12.2
(pyenv). Playwright, Chromium and Node are not used. The card's check command
`python3 -m piper --version` does not exist in 1.8.0 (it prints the usage error for
the required `-m`); version was taken from the pip freeze in `output/dependencies.txt`.

Installed and downloaded (all under `examples/piper-tts/output/`, git-ignored):
- `output/venv`: Python venv with piper-tts 1.8.0 and its PyPI dependencies, 185 MB.
- `output/voices/en_US-ryan-low.onnx`: 63,104,526 bytes (60 MB). Downloaded from
  `https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/low/`.
  sha256 `8d21a085cc4c0010f1f3e91d5008c8691277ccfa744eb0d747becd33a3444baf`; md5 matches the official `voices.json`.
- `output/voices/en_US-ryan-low.onnx.json`: 4,165 bytes, sha256
  `b27147e56b0525962609f82f58171f4618cbf17c6fb043d7d724ff28cc4aed60`; `audio.sample_rate` 16000.
- `output/voices/MODEL_CARD`: 263 bytes, sha256
  `82409c9c68863650e407a89dcebfc946afd992203593f0e4af234bce83c4144d`; `CC BY-NC-SA 4.0`, trained from scratch.
- Pip and XDG caches: `output/pip-cache`, `output/cache`. Nothing system-wide.
- Output directory total 306 MB (venv, voices, WAVs, logs). Nothing committed except
  the files listed in Intent and scope.

Commands: `./run.sh --record` (first attempt) then `./run.sh` (verification, non-record).
Both ran `piper` three times and `check.py` once. Neither printed OK.

Measured (the attempt that wrote the final `output/` contents; each run's values differ,
see the range below):
- Format: all three WAVs mono, 16-bit, 16000 Hz, equal to the config rate. Pass.
- `default-a.wav` duration 2.224 s (record run) and 2.272 s (verify run); range check
  [1.5, 5.0] s. Pass both.
- Non-silence: peak 0.99997 of full scale, RMS about 0.177 of full scale. Pass.
- Length ratio, long over default: 1.331 (record run) and 1.225 (verify run). Predeclared
  1.5 ± 0.15, so [1.35, 1.65]. **Fail, both runs.** Long run durations: 2.960 s and 2.784 s.
- Rerun (recorded, not gating): `default-b.wav` was 2.256 s and 2.304 s in the two runs.
  PCM and file hashes differed from `default-a.wav` in both runs. Rerun is **not**
  sample-identical with the default settings.
- Verify run, file sha256 prefixes: default-a `55085fcb…`, default-b `d477c2bb…`,
  long-1.5 `19e94245…`. Frame counts 36,352, 36,864 and 44,544.

Post hoc, informational only (not gating, run after the verdict in scratchpad with the same
venv and voice; these numbers do not change the result): two more repeats per scale gave
0.5 → 1.792 s and 1.760 s; 1.0 → 2.272 s and 2.304 s; 1.5 → 2.704 s and 2.784 s. Across
all these runs the 1.5/1.0 ratio sits near 1.2 to 1.3 and the 0.5/1.0 ratio near 0.77. So
`--length-scale` moves the duration sub-linearly for this sentence, which is a systematic gap
from the predeclared 1.5, not sampling noise. The cause (fixed unscaled padding, duration
predictor, or the normalisation step) is not established here.

Inspection: `output/waveform.png` (throwaway plot of the envelopes of `default-a.wav` on
top and `long-1.5.wav` below). Both show about ten speech-like bursts across the full width,
with gaps between them, and no clipping flats; the two lanes are scaled to the same width, so
the picture does not show the duration difference, and the numbers above do. No listening
test was done, so nothing here speaks to how the speech sounds.

Pass / partial / fail: **partial**. Passed: format matches config, duration in range,
non-silent. Failed: the length-scale ratio check (predeclared 1.5 ± 0.15, measured 1.23 to
1.33). Rerun: not sample-identical with default settings (recorded). The predeclared check
was not weakened or re-recorded; `expected/` is not committed, because `run.sh` refuses to
record while a gating check fails, so the scope is "Fixture-reported".

What this establishes: piper 1.8.0 with the ryan-low voice, on this machine, writes 16 kHz
mono 16-bit WAVs at the config rate, produces non-silent speech-like audio for one sentence,
and lengthens output with `--length-scale 1.5` by about 1.2 to 1.3 times rather than 1.5. It does
not establish a 1.5 ratio, sample-identical reruns, other voices or sentences, other
platforms, speech quality, or licence clearance for any use beyond this internal, non-commercial fixture.

Reviewer and follow-up: a 1.5 ratio is not yet a claim. Revisit with a different sentence or a
longer one (padding would matter less), or with the duration predictor's effect isolated; the
card's `piper --version` check command should be replaced. Revisit on any piper-tts or onnxruntime
upgrade, or any voice change. Voice licence (NC-SA) blocks redistribution and commercial use.

Cleanup: remove `examples/piper-tts/output`.
