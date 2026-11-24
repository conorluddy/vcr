# essentia audio features on generated click, tone and level audio

## Intent and scope

- Tool ID and version/build: `essentia`, PyPI `essentia==2.1b6.dev1438` (the newest
  release on PyPI on 2026-11-24; a development pre-release, `2.1b6.dev` series). The
  wheel used is `essentia-2.1b6.dev1438-cp314-cp314-macosx_15_0_arm64.whl`, uploaded
  2026-05-19. `essentia.__version__` reports `2.1-beta6-dev` at runtime; the PyPI
  version above is the exact identifier.
- VCR job and exact claim being tested: essentia in standard mode loads generated audio
  (a 120 BPM click track; sine tones at known frequencies; a 1 kHz tone at a known level).
  `RhythmExtractor2013` estimates the BPM within ±2 % of 120 with each beat position
  within ±30 ms of a true click, `PitchYinFFT` reports each tone within ±10 cents of its
  generated frequency, and `LoudnessEBUR128` reports integrated loudness of the 1 kHz tone
  within ±0.5 LU of the analytically expected value. Reruns give byte-identical outputs.
- Explicit exclusions:
  - Only generated input: no recorded, musical, speech or example audio. Nothing is
    downloaded; all audio is written by `analyse.py` from arithmetic.
  - Standard mode only (`essentia.standard`). The streaming mode, `essentia.streaming`,
    is not tested.
  - `RhythmExtractor2013` uses its default `multifeature` method and default BPM range;
    `degara` is not tested. Beat phase is checked only through the 30 ms click match.
  - Pitch uses `PitchYinFFT` on 2048-sample Hann frames, hop 512, default parameters. The
    other pitch algorithms (`PitchYin`, `PitchMelodia`, `PitchSalience`) are not tested.
    Only four tones (440, 880, 1760, 3520 Hz) are used, all steady sines.
  - Loudness uses `LoudnessEBUR128` on identical stereo channels. Momentary and short-term
    loudness, loudness range, gating on real programme material and true-peak are not
    tested; the momentary array is hashed for the determinism check only.
  - No MFCC, spectral, onset, key or other feature families, and no MTG model (the
    TensorFlow or ONNX models are not used; they need separate licence review).
  - No tool-to-tool edges: no FFmpeg, aubio or librosa comparison in the claim.
  - Sound design and pacing are not judged. Pillars cited for context only:
    `SOUND-BEAT-ALIGN` (beats to frames), `SOUND-LOUDNESS-INTEGRATED` (integrated loudness)
    and `PACE-BEAT-06` (cuts on markers). No rule is checked here.
- Tool documentation and licence sources, checked 2026-11-24: `https://essentia.upf.edu/`
  and `https://github.com/MTG/essentia` (from the tool card). Project licence is
  AGPL-3.0 per the card. I did not re-read the installed wheel's licence file for this run,
  so the licence statement is taken from the card. The MTG pretrained models are not used
  and their terms are not assessed. Generated audio is original, so no asset licence applies.
- Environment: macOS 26.6 (Darwin 25.6.0), arm64 (Apple M3), Python 3.14.8 from Homebrew
  (`/opt/homebrew/bin/python3.14`), no GPU, no network use during analysis.
  The Python 3.12 fallback in the brief would install `2.1b6.dev1389`, the newest
  cp312 arm64 wheel, which is older than the newest release. The 3.14 interpreter has
  `_lzma`, and the newest wheel is cp314, so 3.14 is used. Recorded as a deviation.
- Input: none from outside. `analyse.py` writes three files at 44100 Hz:
  - `output/click.wav`: mono, 10.0 s. Clicks at 0.5 s + k × 0.5 s for k = 0..17 (18 clicks,
    120 BPM). Each click is a 30 ms burst of a 1000 Hz sine with a 4 ms exponential decay,
    amplitude 0.8.
  - `output/tones.wav`: mono, 6.0 s. Four 1.0 s sines at 440, 880, 1760 and 3520 Hz,
    starting at 0.5, 2.0, 3.5 and 5.0 s, amplitude 0.5, 10 ms linear fades. The same
    tone set as `librosa-beat-spectra`.
  - `output/level.wav`: stereo (identical channels), 10.0 s. A 1000 Hz sine, amplitude 0.5.
  - Rights: generated here, original. Hashes of all three files are in `output/run-*.json`.
- Dependencies, installation plan, permissions, network and expected side effects:
  - Installed, as approved, into `examples/essentia-audio-features/output/venv` only
    (git-ignored): `/opt/homebrew/bin/python3.14 -m venv output/venv`, then
    `output/venv/bin/python -m pip install essentia==2.1b6.dev1438`. pip resolves
    `numpy==2.5.5`, `PyYAML==6.0.4` and `six==1.17.0`. Nothing else is installed system-wide;
    no Homebrew formula, no global pip, no npm package.
  - `requirements.txt` is the `pip freeze` of the venv. `run.sh` checks the freeze against it.
  - No build from source. If the wheel fails to load, the result is blocked.
  - No network during analysis.
- Selected workspace, generated output and cleanup paths: `examples/essentia-audio-features/output/`
  (git-ignored, contains the venv, WAVs, JSON runs and logs). Cleanup: remove that directory.
  Committed: this README, `example.json`, `run.sh`, `analyse.py`, `requirements.txt`, and
  `expected/checks.json` only if every gating check passes.

## Plan, before running

Commands:
```
examples/essentia-audio-features/run.sh --record   # runs analyse.py twice; records expected/ only if all checks pass
examples/essentia-audio-features/run.sh            # runs twice, compares the runs, diffs expected/
```

Parameters, fixed in `analyse.py`:
- Sample rate 44100 Hz (required by `RhythmExtractor2013`).
- `RhythmExtractor2013(method="multifeature")`, default `minTempo` 40 and `maxTempo` 208.
- `PitchYinFFT` on `Spectrum` of `Windowing(type="hann")` frames: `frameSize` 2048, hop
  512, `startFromZero` true, default `minFrequency`/`maxFrequency`. A frame's time is its
  first sample divided by 44100 plus half a frame. Steady frames are those whose time is in
  [tone start + 0.25 s, tone start + 0.75 s].
- `LoudnessEBUR128(sampleRate=44100)` on the stereo AudioLoader output, default `hopSize`.

Expected analytic value for the level check: the integrated loudness of a stereo sine of
amplitude A, identical channels, with BS.1770 K-weighting is
`-0.691 + 20 log10(A · |H_K(1 kHz)|)`. The K-weighting gain at 1 kHz from the
BS.1770 coefficients (48 kHz) is +0.698 dB, computed in a throwaway script; the
analytic result is −6.01 LUFS for A = 0.5. The fixture runs at 44.1 kHz, and the gain at
44.1 kHz was not computed separately; the 48 kHz figure is the reference used. The
gating uses −6.01 LUFS, which is not derived from essentia's output.

Predeclared checks (all gating; each is a boolean in `checks`):
1. `inputs_load_at_44100_hz`: `MonoLoader` on click.wav and tones.wav reports 44100 Hz,
   441000 and 264600 samples. `AudioLoader` on level.wav reports 44100 Hz, 2 channels and
   441000 frames.
2. `bpm_within_tolerance`: `RhythmExtractor2013` bpm within ±2 % of 120 (117.6 to 122.4).
3. `beats_match_clicks_both_ways`: exactly 18 ticks; every true click has a tick within
   ±30 ms; every tick lies within ±30 ms of a true click.
4. `tone_pitch_within_cents`: for each tone, the median of the voiced (pitch > 0) steady
   frames is within ±10 cents of the generated frequency, and there are at least 10 voiced
   steady frames.
5. `loudness_within_tolerance`: `integratedLoudness` of level.wav is within ±0.5 LU of
   −6.01 LUFS.
6. `rerun_outputs_identical` (gating, enforced by `run.sh`, so not a boolean in `checks`):
   `output/run-a.json` and `output/run-b.json` are byte-identical. The JSON includes the
   sha256 of each WAV file, the tick and BPM bytes, the per-tone pitch arrays (float64
   bytes), and the integrated and momentary loudness arrays.

Recorded, not gating: the measured BPM, the largest click error in ms, each tone's median
pitch and error in cents, and the integrated loudness and its error in LU. Written to
`output/run-a.json` and, if all checks pass, `expected/checks.json`.

Expected artifacts: `output/click.wav`, `output/tones.wav`, `output/level.wav`,
`output/run-a.json`, `output/run-b.json`, `output/run-*.log`, `output/dependencies.txt`,
`output/inspect.png` (a figure drawn after the run, not gating). Only `expected/checks.json`
may be kept.

Expected failure modes and stop conditions:
- Import or wheel-load failure (for example `essentia.standard` missing a named algorithm),
  or non-zero exit from `analyse.py`: stop, keep the stderr, report `blocked` or `fail`.
- A gating check failing: stop and report `fail`, or `partial` if only some checks fail,
  naming the failing checks in the scope. Tolerances are not changed to hide a failure.
  `run.sh --record` refuses to write `expected/` when any gating check fails, so the
  observed failure cannot be mistaken for a baseline.
- Non-identical reruns: report `fail` on determinism.
- `requirements.txt` not matching the venv freeze: stop.

Inspection: a figure of the click envelope with tick markers, and the tone STFT with the
expected frequency lines, drawn from the arrays after the run. It is not gating.

Reproduction: `run.sh`; read `output/run-a.json` for every measured value.

## Observation, after running

Executed 2026-11-24 on `Conors-MacBook-Pro-2.local` (macOS 26.6, Darwin 25.6.0, arm64), from
`examples/essentia-audio-features`.

Versions and environment:
- essentia `2.1b6.dev1438` (PyPI, cp314 macOS 15 arm64 wheel). `essentia.__version__` reports
  `2.1-beta6-dev`. Wheel from PyPI, not built from source.
- Python 3.14.8 (`/opt/homebrew/bin/python3.14`), numpy 2.5.5, PyYAML 6.0.4, six 1.17.0.
  Full set in `requirements.txt`. Playwright, Chromium and Node are not used. ImageMagick
  only converted the inspection PPM to PNG.
- Commands: `./run.sh --record` (exit 1, no `expected/` written, because a predeclared check
  failed), then `./run.sh` a second time (exit 1 again, same failing check).

Measured (`output/run-a.json`; `run-b.json` byte-identical in both invocations):

| Check | Predeclared | Observed | Verdict |
| --- | --- | --- | --- |
| `inputs_load_at_44100_hz` | 44100 Hz; 441000 and 264600 samples; stereo 441000 frames | as generated | pass |
| `bpm_within_tolerance` | 120 BPM ±2 % (117.6 to 122.4) | 119.882 BPM (−0.10 %) | pass |
| `beats_match_clicks_both_ways` | 18 beats, each click and each beat within ±30 ms | 19 ticks; 8 of 18 clicks matched; max error 34.87 ms | **fail** |
| `tone_pitch_within_cents` | ±10 cents, ≥ 10 voiced steady frames | 440 Hz +1.30 c; 880 Hz −0.80 c; 1760 Hz −0.12 c; 3520 Hz −0.18 c; 43–44 voiced frames each | pass |
| `loudness_within_tolerance` | −6.01 LUFS ±0.5 LU | −6.011 LUFS (error −0.001 LU) | pass |
| rerun (enforced by `run.sh`) | `run-a.json` and `run-b.json` byte-identical | identical in both invocations | pass |

Beat failure, diagnostic (not gating, throwaway script, not committed): essentia's ticks
sit 24 to 35 ms late of the true clicks, and the offset moves with the tempo estimate. The
tick intervals are 0.4992 s (not 0.5 s), so the offset drifts from +34 ms at the first
click to +24 ms at 7.0 s, then jumps back to +35 ms at 7.5 s. The 8 ticks within 30 ms
are the ones for clicks at 3.5 to 7.0 s (offsets +29.4 to +24.0 ms); the clicks at 0.5 to 3.0 s
and 7.5 to 9.0 s are 31 to 35 ms late, so 8 of 18 match in all. There is one
extra tick at 9.54 s, after the last click (543 ms away). The gate was not changed; a
different tolerance or a latency compensation would be a new predeclared plan.
The BPM estimate is within its tolerance, so the failure is about beat phase and drift, not
tempo. The gap is not explained further here (no latency sweep was run).

Inspection: `output/inspect.png`, drawn from the arrays by the throwaway script. Grey: click
envelope. Green (bottom): the 18 true clicks. Red (top): essentia's 19 ticks. The 18 clicks
are clean spikes at the expected positions, and each red tick sits a few pixels right of its
click (about 3 px at 120 px per second, which is the 25 to 35 ms offset). The extra tick is at
the right edge. This is a diagram, not a listening test; no audio was played.

Deviations, all before any reported result:
- The brief's fallback interpreter was Python 3.12, which would install `2.1b6.dev1389`, the
  newest cp312 arm64 wheel. The newest release `2.1b6.dev1438` has only a cp314 arm64 wheel,
  so `/opt/homebrew/bin/python3.14` (which has `_lzma`) was used for the venv. Python 3.12 was
  not used.
- `analyse.py` was rewritten once before the first run to tidy the function returns. No
  predeclared value changed between the plan and the run.
- The level check uses the −6.01 LUFS value from the 48 kHz BS.1770 coefficients (see the plan).
  The measured −6.011 is consistent with it.

Result: PARTIAL. Loading, BPM within ±2 %, pitch of all four tones within ±10 cents,
integrated loudness of the 1 kHz level tone, and identical reruns pass. Beat positions fail
the predeclared ±30 ms rule (8 of 18 clicks matched; a systematic late offset of 24 to 35 ms,
plus an extra tick). Nothing here establishes other RhythmExtractor2013 methods, other pitch
algorithms, real audio, momentary or short-term loudness, cross-machine determinism, or any
sound-design or pacing rule (`SOUND-BEAT-ALIGN`, `SOUND-LOUDNESS-INTEGRATED` and `PACE-BEAT-06`
are cited for context only).

Reviewer and revisit triggers: no reviewer yet. Revisit on any essentia upgrade (the dev
release series moves quickly; the wheel and its beat tracker may change), or if a beat-phase
fixture is planned under a new predeclared plan. No follow-up is opened from this run.
