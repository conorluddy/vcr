# whisper.cpp transcription of a generated sentence

## Intent and scope

VCR job and claim: `whisper-cli` (whisper.cpp) transcribes one generated English sentence,
"the red fox jumps over the quiet brown river today" (ten words), with word error rate at most
0.10 against the reference (at most one wrong word in ten). It writes JSON, SRT and VTT outputs
whose segment timings lie inside the audio duration (tolerance 50 ms) and run in order. It reports
its compute backend in the log (Metal or CPU; the reported one is recorded). Two independent
reruns give identical normalised transcripts. Timing determinism across reruns is recorded, not
gated.

Tool: whisper.cpp 1.9.6, from Homebrew formula `whisper.cpp` (installed as `whisper.cpp` after
`brew install whisper-cpp`; Homebrew renamed the formula, and the old name redirects). The binary
is `whisper-cli`. Installed 2026-11-24 as a bottle.
Model: `ggml-base.en.bin` (English, base size, 147,964,211 bytes), downloaded from the official
host `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin` (Hugging Face
`ggerganov/whisper.cpp`). SHA-256 `a03779c86df3323075f5e796cb2ce5029f00ec8869eee3fdfb897afe36c6d002`,
matching the host's LFS object ID. Stored in `output/models/` (ignored); never committed.

Explicit exclusions:
- No word-level timestamps (`-ml 1`, `-sow`) and no timing accuracy claim. There is no
  reference onset, so segment timings are checked only for bounds and order. Word-level forced
  alignment is `whisperx`'s job (`whisperx-word-timing`), not this claim.
- No other models, sizes, languages, quantisations, or `auto` language detection. No CoreML
  encoder. No forced CPU run (`-ng`): the backend is whatever whisper-cli reports by default.
- No real speech, accents, noise, music, or diarization. One synthetic sentence only.
- No claim about other macOS versions, other Metal or CPU builds, or cross-machine determinism.
- No claim about the quality of the Whisper model beyond this one sentence.

Licence and documentation sources, checked 2026-11-24:
- Card: `catalog/tools/whisper-cpp.json` (licence line: "MIT for project code; model weights and
  input media terms require separate review").
- https://github.com/ggml-org/whisper.cpp (project); Homebrew formula metadata reports
  `License: MIT`.
- Model: the ggml files are conversions of OpenAI Whisper weights. Their terms were not reviewed in
  detail here. The model file is not redistributed and not committed; the fixture only reads it.
- Input voice: macOS `say` output (Samantha, en_US). Not redistributed; regenerated into `output/`.

Environment: macOS 26.6 (build 25G5043d, Darwin 25.6.0), arm64 (Apple M3 Pro, as Metal names the
device). Backend: Metal or CPU as the log reports. Driver details are not recorded beyond the log.

Input: generated locally with `say -v Samantha` (one call, the full sentence), then converted by
ffmpeg to 16 kHz mono `pcm_s16le` WAV (`output/input.wav`). Hashes of the generated WAV are not
gated, because `say` output can change with the macOS version. Format and duration are checked
with ffprobe.

Dependencies and installation (approved for this batch):
- `brew install whisper-cpp` (Homebrew resolves to formula `whisper.cpp` 1.9.6). It pulled bottled
  dependencies `ggml` 1.0.0, `llama.cpp` 1.0.0 and `sdl2-compat`. Binary: `/opt/homebrew/bin/whisper-cli`.
- Model: `curl` the file above into `examples/whisper-cpp-transcribe/output/models/`. Done once
  before the first run; `run.sh` does not download. It fails with a message if the model is missing,
  and `check.py` fails if the SHA-256 differs.
- Network: Homebrew, and Hugging Face for the model file. No other network use.
- No global package, shell or cache changes. Nothing is written outside this directory, except
  Homebrew's own install prefix.
- Cleanup: remove `examples/whisper-cpp-transcribe/output` (models, WAVs, outputs). To remove the
  tool, `brew uninstall whisper.cpp`.

Selected workspace and output: `examples/whisper-cpp-transcribe/output/` (git-ignored).
Committed: this README, `example.json`, `run.sh`, `check.py`, `expected/checks.json` and
`expected/segments.json`. No audio, no model, no output files.

## Plan, before running

Commands:
```
examples/whisper-cpp-transcribe/run.sh            # generate, transcribe twice, check, diff expected/
examples/whisper-cpp-transcribe/run.sh --record   # only after a deliberate change
```

Pipeline (`run.sh`):
1. `say -v Samantha -o output/input.aiff "<sentence>"`, then ffmpeg to `output/input.wav`
   (16 kHz, mono, pcm_s16le). ffprobe to `output/input-ffprobe.json`.
2. `whisper-cli -m output/models/ggml-base.en.bin -f output/input.wav -l en -t 4 -oj -osrt -ovtt
   -of output/runN`, run twice in two separate processes (`run1`, `run2`). Stderr and stdout go
   to `output/runN.log`. Default decoding (beam size 5, best-of 5, whisper.cpp defaults).
3. `check.py output MODEL SENTENCE` (stdlib Python, run with `python3 -I`) writes
   `output/checks.json` and `output/segments.json` and exits 1 if a gated check fails.
4. Diffs against `expected/`.

Predeclared checks (all gated unless marked):
- G0 model: SHA-256 of the model file equals `a03779c8...c6d002`.
- G1 input: ffprobe codec `pcm_s16le`, sample rate 16000 Hz, 1 channel.
- G2 word error rate: word-level Levenshtein distance between normalised reference words
  (lowercase, letters and digits only) and normalised hypothesis words, divided by 10, is at most
  0.10, for both runs.
- G3 outputs: for each run, `runN.json` parses and has at least one segment; `runN.srt` and
  `runN.vtt` exist, are non-empty and have the same number of cues as the JSON segments; each
  cue's start and end agree with the JSON offsets to 1 ms. The VTT starts with `WEBVTT`.
- G4 bounds: for each run and each segment, `0 <= from < to <= duration_ms + 50`, where
  `duration_ms` is the ffprobe duration of `input.wav`.
- G5 order: for each run, segment `from` values and segment `to` values are non-decreasing.
- G6 backend: each run's log has `using <name> backend` lines (whisper-cli's report of the backend
  in use). `MTL*` is named Metal. The check passes if Metal or CPU is among the names. All names
  found are recorded. A log with no such line fails.
- G7 determinism of text: normalised word lists and the raw transcript string are identical
  between run1 and run2.
- Informational, not gating: whether the segment offsets (ms) are identical between runs; whether
  the SRT and VTT files are byte-identical between runs; the whisper.cpp version from the brew
  record; the recorded backend names.

Expected artifacts: `output/input.aiff`, `input.wav`, `input-ffprobe.json`, `run1.{json,srt,vtt,log}`,
`run2.{json,srt,vtt,log}`, `checks.json`, `segments.json`. Committed: `expected/checks.json` and
`expected/segments.json` only (`segments.json` is the run1 segment list: from, to, text).

Expected failure modes and stop conditions:
- `whisper-cli` missing, or the model file missing: stop and report `blocked`. No substitute ASR
  tool is used.
- Model SHA-256 mismatch: stop, report `blocked`. Do not use the file.
- G2 or G7 failing: the result is `fail`. The thresholds are not changed after running.
- Only G3, G4 or G5 failing: `partial`, with the failing check named as scope.
- G6 failing: `partial` if transcription passed, with the log lines as scope.
- Mid-run correction (2026-11-24, before the first passing run): the first `--record` pass read a
  `load_backend: loaded CPU backend` line, which lists installed backends, not the one used, and
  missed `using MTL0 backend`. G6 now reads only `using <name> backend` lines. The first record
  result is discarded and the `expected/` directory is re-recorded; see Observation.
- Output timings differing between runs: recorded, not a failure.

Reproduction: run `run.sh`. To inspect, read `output/run1.srt` and `output/run1.json`. There is
no image or audio playback gate; the transcript and segment list are the inspected output.

Comparison with the neighbour (for context only): `whisperx-word-timing` does word-level
forced alignment with faster-whisper. This fixture gives segment-level timings from whisper.cpp,
with no per-word alignment, so the two timing claims are not comparable.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local: macOS 26.6 (build 25G5043d, Darwin 25.6.0),
arm64 (Apple M3 Pro per Metal), from `examples/whisper-cpp-transcribe`.

Versions:
- whisper.cpp 1.9.6 (Homebrew formula `whisper.cpp`, bottle `arm64_tahoe`), binary
  `/opt/homebrew/bin/whisper-cli`. Its dependencies: ggml 1.0.0, llama.cpp 1.0.0, sdl2-compat
  2.32.74. The binary prints no version string; the Homebrew version is the identifier.
- Model: `ggml-base.en.bin`, SHA-256 matched (G0).
- ffmpeg and ffprobe 9.0.2. Python 3.12.2 (system stdlib only, `python3 -I`). Node v22.19.0 is
  installed but not used. Playwright and Chromium are not used.
- `say`: macOS built-in, voice Samantha, en_US. The voice version is not reported; the macOS build
  above is the identifier.

Commands: `run.sh --record` (first record pass, discarded; see the mid-run correction in the Plan),
`run.sh --record` again after the G6 parser fix, then `run.sh`, which printed
`whisper-cpp-transcribe: OK`.

Measured (`output/checks.json`, final run):
- G0 model SHA-256 `a03779c8...c6d002` matches. G1 input: `pcm_s16le`, 16000 Hz, 1 channel,
  duration 2.937813 s.
- G2 word error: 0 of 10 words wrong in run1 and run2. Transcript: "The Red Fox jumps over the
  Quiet Brown River today." (whisper.cpp's capitalisation and final full stop are removed by
  normalisation).
- G3 outputs: `run1.json`, `run1.srt` and `run1.vtt` exist; one cue each; the cue times agree with
  the JSON offsets to 1 ms; the VTT starts with `WEBVTT`. Same for run2.
- G4 bounds: the single segment is 0 ms to 2880 ms, inside 2937.8 ms plus 50 ms in both runs.
- G5 order: passes, but trivially. Each run produces one segment, so this fixture does not test
  ordering across several segments.
- G6 backend: `whisper_backend_init_gpu: using MTL0 backend` (GPU `Apple M3 Pro`) in both runs, so
  Metal is the reported compute backend. `whisper_backend_init: using BLAS backend` also appears,
  and is recorded as a name. The CPU path was not run separately.
- G7 determinism of text: the raw transcript and normalised words are identical between the two
  separate processes.
- Informational (`output/timing.json`): segment offsets, SRT and VTT files are byte-identical
  across the two runs. whisper.cpp total time per run: 156.4 ms and 163.0 ms (encode 35 ms and
  43 ms), warm model, one short clip.

Inspection: no frames, so no contact sheet of images. `output/contact.png` is `showwavespic` of
`input.wav` at 1200x340, with a translucent red band from 0 to 2.880 s (the reported segment).
Seen: about ten word-shaped speech bursts fill the band. Nothing is clipped within the band, and
the waveform is not blank. The segment end sits about 58 ms before the file ends, and a faint tail
of the last word continues past the red line. The 50 ms bound allows this, and it is the tightest
part of the timing result. ImageMagick text annotation failed (no configured font), so the band is
the only marking. The image shows the audio the transcript covers; it does not verify the words
themselves, which the WER check does.

Pass on the predeclared checks, after one mid-run correction. Result: pass.

Mid-run correction (disclosed): the first `--record` pass gave G6 a `CPU` name, from
`load_backend: loaded CPU backend`, which lists installed backends. It missed the
`using MTL0 backend` line. The first pass also passed every gate, so the outcome did not change. Its G6 label was wrong, and
the record would have claimed CPU. G6 was changed to read only `using <name> backend` lines,
mapping `MTL*` to Metal, and the expected record was re-recorded from the corrected check.

What this establishes: on this machine, with whisper.cpp 1.9.6 (Homebrew) and `ggml-base.en` on
Metal, a generated Samantha sentence of ten words transcribes with 0 of 10 words wrong, JSON, SRT
and VTT agree on one segment inside the duration, the segment text is identical across two
separate processes, and the reported backend is Metal.

What it does not establish: word-level timing or alignment (that is `whisperx`'s claim); timing
accuracy against any reference; ordering across several segments; the CPU-only path; other models,
sizes, languages, or `auto` detection; CoreML; real or noisy speech; any other macOS version or
machine; quality of the model beyond this sentence; timing determinism across separate days or
builds.

Deviations and limitations:
- Dependencies pulled in by the Homebrew install: ggml, llama.cpp and sdl2-compat (bottles).
- The formula is now named `whisper.cpp`. `brew install whisper-cpp` resolves to it with a rename
  warning.
- Model downloaded from Hugging Face on this machine, 147,964,211 bytes, into `output/models/`
  (141 MB, ignored, not committed). Its licence terms were not reviewed in detail here.
- Output directory: the WAV is about 94 KB; the AIFF and the JSON, SRT, VTT and logs are small.
- The first `say` run and each later run regenerate the audio. Its hash is not gated.

Reviewer, decision and revisit triggers: revisit on any change to whisper.cpp or its ggml
dependencies; on a different model file or size; on a change in macOS `say` output; before any
multi-segment or CPU-only claim; or when a timing reference exists for the word-timing question.
