# syncalong text alignment fixture

## Intent and scope

VCR job and claim: syncalong aligns a known transcript (the lyrics in
`lyrics.txt`) to a generated narration. It returns one timed segment per lyric
line whose start time falls within a predeclared tolerance of the ground truth,
the segments are in order and cover the full text, and a rerun gives identical
timings.

Tool: syncalong, PyPI package `syncalong`, exact pin `2.0.1` (uploaded
2026-07-24; latest of 1.0.0, 2.0.0, 2.0.1). Its PyPI metadata (summary
"Forced-alignment library and CLI that timestamps lyrics against an audio
file, exporting LRC", MIT, `rapidfuzz` as the only core dependency, Whisper
under the `whisper` extra) matches the catalogue record. It is the same project
as `github.com/wickeddoc/syncalong`, so the identity check passes.

Explicit exclusions:
- Line-level output only. The library's `align()` returns one timestamp per
  line (the start of its first matched word). Word-level timings are not
  returned; word starts are compared only as the source of the line starts.
- Unmatched lines are interpolated by the library. This fixture detects that
  case: a line whose start is not exactly a Whisper word start was not matched
  from the audio and fails the claim.
- Transcription quality is not claimed. Whisper `base` is the library default
  and is used unchanged, with the lyrics as its decoding prompt (the library's
  default). Other Whisper models, the remote route (`--server`), `--separate-vocals`
  (Demucs) and singing voice are not tested.
- The narration is macOS `say` speech only: one voice, no music, no noise, no
  overlap. Accuracy on real songs is not established.
- Tolerance is 0.5 s on line starts. Word-level and sub-tolerance accuracy is
  not claimed.
- Pacing is a pillar, not a measured property here. `PACE-NARR-03` (AV temporal
  contiguity, ±1.0 s, heuristic) is the nearest pacing rule. It is context only;
  this fixture's tolerance (0.5 s) is a predeclared alignment check, not that rule.
- No `.lrc` consumer (players) is tested. Only the LRC text the library writes.
- No tool-to-tool edges: ffmpeg is used only to build and measure the narration.

Tool documentation and licence sources, checked 2026-11-24:
- https://github.com/wickeddoc/syncalong (README, MIT licence)
- https://syncalong.readthedocs.io/ and https://pypi.org/project/syncalong/
- Whisper model weights are downloaded by `openai-whisper` from its release
  host on first use (MIT licence for the code; weights under the upstream terms).
  Weights are cached in `output/home/.cache/whisper` and are never committed.
- `rapidfuzz` (MIT), `openai-whisper` and `torch` (BSD-style) keep their own
  licences. None of them is redistributed here.

Environment: macOS 26.6 (build 25G5043d, Darwin 25.6.0), arm64, Python 3.12.2
from pyenv. CPU only: Whisper runs on the CPU in fp32 (no GPU use is claimed).

Input: generated at run time from `lyrics.txt` (eight lines, committed, plain
text, original wording). Each line is spoken by macOS `say`, voice
`Samantha` (en_US), to 16 kHz mono WAV, then leading silence is trimmed
(threshold -45 dB) so each clip starts at speech onset. Clips are joined with
a 1.0 s lead-in and a 1.5 s gap by `ffmpeg` concat (stream copy). The
narration WAV and clips are in `output/narration/` (ignored, not committed).
Rights: the text is original and the speech is synthesised locally.

Dependencies and installation plan (approved for this pinned package only):
- `python3 -m venv examples/syncalong-text-align/output/venv`, then
  `output/venv/bin/pip install "syncalong[whisper]==2.0.1"`. The `whisper`
  extra is required for local transcription; it installs `openai-whisper` and
  `torch` (the torch wheel alone is about 139 MB). Nothing outside `output/`.
- `HF_HOME`, `TORCH_HOME` and `XDG_CACHE_HOME` point at `output/cache`. Whisper
  does not read those variables; it uses `~/.cache/whisper`, so `run.sh` sets
  `HOME=output/home` for its own process. Model download needs network access
  on first run only.
- The resolved set is written to `output/dependencies.txt` by `run.sh`.
- Cleanup: remove `examples/syncalong-text-align/output` (venv, weights,
  narration, logs). No global package or shell change.

Selected workspace and output: `examples/syncalong-text-align/output/`
(git-ignored). Committed: `README.md`, `example.json`, `run.sh`, `lyrics.txt`,
`align_run.py`, `check.py`, `expected/checks.json`. No WAV, model or LRC is
committed.

Catalogue tools used: `syncalong` (the claim), `ffmpeg-ffprobe` (narration
build and durations). `say` is macOS and not a catalogue tool. `openai-whisper`
is a dependency of syncalong and has no catalogue record, so it is named here
and not listed in `example.json` `tools`.

## Plan, before running

Commands, after the venv install above:
```
examples/syncalong-text-align/run.sh            # build narration, align twice, check, diff expected/
examples/syncalong-text-align/run.sh --record   # only after a deliberate change
```

Steps in `run.sh`:
1. Build `output/narration/narration.wav` and `clips.tsv` (per-clip measured
   durations from ffprobe) with `say` and `ffmpeg`.
2. `align_run.py` twice into `output/run` and `output/rerun`. Each run loads
   `Transcriber("base")`, calls `transcribe(..., language="en",
   initial_prompt=lyrics_prompt(lines))`, then `align_lyrics_to_transcript`
   and `format_lrc`. Outputs `out.lrc` and `timings.json`.
3. `check.py` computes the ground-truth starts from `clips.tsv`, the lead-in
   (1.0 s) and gap (1.5 s), and runs the checks below.

Predeclared checks (all gating; the result is `pass` only if every one holds):
1. `one_segment_per_lyric_line`: the number of timed segments equals the number
   of non-empty lyric lines (8).
2. `every_line_timed`: no line has a `None` start.
3. `starts_are_transcript_word_starts`: every line start equals (within 1e-9 s)
   the start of some Whisper word. This excludes interpolated lines.
4. `starts_in_order`: the line starts are strictly increasing.
5. `lrc_covers_full_text`: the text after each LRC timestamp equals the lyric
   line, in order, for all lines.
6. `starts_within_tolerance`: `|start - ground truth| <= 0.5 s` for every line.
   The tolerance is about one third of the 1.5 s gap, so a line matched to a
   neighbour's word fails.
7. `rerun_lrc_byte_identical` and `rerun_timings_identical`: the second
   `align_run.py` run gives identical `out.lrc` bytes and identical `timings.json`
   (every line start and every transcript word). Determinism is part of the claim,
   so a difference makes the result `partial`, not `pass`.

Recorded but not gating: the narration hash is not compared (macOS `say` may
not be byte-identical across runs; the ground truth comes from the measured
clip durations, so it does not depend on that). The Whisper and syncalong
versions, the Whisper model and the transcript word count are recorded in
the observation.

Expected artifacts: `output/checks.json` with the measurements (ground-truth
starts, syncalong starts, max absolute error, LRC SHA-256 for both runs),
`output/run/out.lrc`, `output/rerun/out.lrc`, `output/run/timings.json`.

Expected failure modes and stop conditions:
- Missing venv or failed install: stop, no automatic install.
- `say` or ffmpeg failure, or a non-zero exit from `align_run.py`: stop and
  keep the logs in `output/`.
- A gating check fails: stop. The expected file is not rewritten to match.
  Tolerance is not widened after seeing numbers. A failed check on the
  rerun only makes the result `partial`; any other failure is `fail`.
- Whisper model download fails (no network): `blocked`, not `fail`.

Inspection: the claim is about timings, so the inspection is a listing
(`output/checks.json`, `timings.json`) and the LRC text beside the ground truth,
not an image. Listening to `output/narration/narration.wav` is done
informally and is not a gating check.

Reproduction: run `run.sh`; `--record` only after a deliberate change.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (macOS 26.6, build 25G5043d,
Darwin 25.6.0, arm64), from `examples/syncalong-text-align`.

Versions: syncalong 2.0.1 (PyPI, `syncalong[whisper]==2.0.1`); openai-whisper
20250625; torch 2.15.0 (CPU, no CUDA); rapidfuzz 3.14.6; numpy 2.5.5; Python
3.12.2 (pyenv); ffmpeg and ffprobe 9.0.2 (Homebrew). Whisper model `base`
(139 MB, downloaded on first use into `output/home/.cache/whisper`). Voice:
macOS `say` `Samantha` (en_US). Playwright, Chromium and Node are not used.
The full freeze is in `output/dependencies.txt` (ignored).

Commands: `run.sh --record` was run first. Its check step failed, so nothing
was recorded to `expected/` (`check.py` exits 1 before the copy). `run.sh` then
failed the same way. Both results are below. No second run printed `OK`.

Measured, default configuration (`initial_prompt` = the lyrics, as the library
does by default), from `output/checks.json` of the failing run:
- Ground-truth line starts (from measured clips, 1.0 s lead-in, 1.5 s gaps):
  1.000, 4.403, 7.797, 11.254, 14.701, 18.015, 21.682, 25.380 s.
- syncalong line starts, first run: 25.31, 25.78, 25.91, 26.04, 26.58, 27.00,
  27.14, 27.28 s. Max absolute error 24.31 s. Eight lines in the LRC carry the
  lyric text in order, but the timings are wrong.
- Whisper transcript, first run: 20 words. The words are the last line, repeated
  as a loop, followed by "SHOW". Most of the narration is missing.
- Rerun: different LRC bytes (sha256 `ebbb86bd…` vs `90778e0f…`) and a different
  transcript, so `rerun_lrc_byte_identical` and `rerun_timings_identical` fail.
- Checks failing: `starts_are_transcript_word_starts`, `starts_within_tolerance`,
  `rerun_lrc_byte_identical`, `rerun_timings_identical`. Passing: line count,
  every line timed, in order, LRC text covers the full text. The text passes only
  because the lines are assigned from the lyrics, not from the audio.

Post-hoc diagnostics (`output/diag/`, outside the claim, not credited as a pass):
- `probe.sh prompt`: three repeat transcriptions of the same WAV in one process
  gave 64, 80 and 21 words with three different hashes. The text is wrong
  (for example "burglar", "connivators"). The likely cause is Whisper's
  temperature fallback, which samples above 0 with an unseeded torch RNG. This is
  consistent with the output, not proven here.
- `probe.sh noprompt`: three repeats gave 60 words and the same hash
  (`dc9409c8e4b9`), with the transcript correct word for word.
- No-prompt alignment (`noprompt.sh`): starts 0.00, 4.00, 7.60, 11.06, 14.24,
  17.82, 21.50, 25.08 s. Rerun byte-identical. Lines 2 to 8 are within 0.5 s, but
  line 1 is 1.0 s early: Whisper gives the first word "The" a start of 0.0 (the
  lead-in silence). This would still fail the predeclared 0.5 s check, so it is
  not a pass in any configuration tried.

Inspection: no frames, so no contact sheet. The listing above is the inspection.

Result: FAIL for the predeclared configuration. The claim does not hold for
this input: the default route (lyrics as Whisper prompt) gave a wrong and
non-repeatable transcript, so the line timings are 24 s off on the first run and
differ on rerun. Per the template, a failed run is not recorded as validation
evidence; `validation.status` stays `not-validated`.

What this result does and does not establish: the predeclared checks fail on
macOS arm64 with syncalong 2.0.1, Whisper base and the default prompt, on one
generated 8-line narration. It shows the Whisper stage, not the alignment DP,
is the failing part under the default route. It does not show that syncalong
is unusable on real audio, and it is not a verdict on other Whisper models,
the remote route, Demucs or longer songs. The no-prompt run was post-hoc and
cannot be credited as a pass, and it misses the 0.5 s tolerance on line 1.

Deviations: none from the predeclared plan in the run itself. The narration hash
was not compared (not gating). `output/` is about 1.1 GB (venv with torch,
Whisper weights, narration, diagnostics).

Reviewer and follow-up: revisit if syncalong or Whisper changes, if a seeded or
greedy-only transcription route is available, or if the lyrics prompt is
reconsidered. A follow-up fixture would need a new predeclared plan, not an
edited tolerance. Cleanup: remove `examples/syncalong-text-align/output`.
