# ffsubsync offset correction

## Intent and scope

- Tool/version: ffsubsync 0.5.1 (PyPI, MIT), with pysubs2 1.9.1 only to write the test SRTs and read the results. Pinned in `requirements.txt`; FFmpeg on PATH.
- Claim: given audio with speech at known times, an SRT shifted by a known offset is corrected so every cue start and end lies within 0.25 s of the truth. Offsets tested: +3.0 s (late) and -1.5 s (early).
- Exclusions: framerate drift, drift across cuts, music beds, other VAD backends, real recordings, SRT-to-SRT reference sync, long files.
- Environment: macOS arm64, Python 3.12.13, venv in `output/venv` built by `run.sh` (git-ignored). Needs network only on the first run.
- Input: seven phrases from macOS `say -v Samantha`, resampled to 16 kHz mono and placed at 2.0, 6.0, 10.5, 14.0, 18.5, 22.0 and 26.0 s on a 30 s track. Truth cues are each phrase's start and start + duration.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`; `check.py` runs twice in separate processes and the JSON must be identical.
- Predeclared checks (worst start-or-end error <= 0.25 s, all 7 cues returned) for four cases: each offset with default flags, and each with `--max-offset-seconds 10`.
- Failure interpretation: a failing check is recorded in `expected/metrics.json` and stays. `run.sh` prints KNOWN FAIL and exits 0; evidence is partial.

## Observation

Executed 2026-11-27. The first exploratory run used default flags only and failed: ffsubsync chose offset -23.0 s (score 712) for a +3.0 s shift and the output kept only 2 of 7 cues (the rest went negative and were skipped). With `--max-offset-seconds 5` it chose -2.99 s (score 2675). The two default-flag cases were then kept as predeclared checks, and the bounded-search cases added. Result: both default-flag checks fail (2 and 1 cues returned); both `--max-offset-seconds 10` checks pass with a worst error of 0.01 s. The cause of the default failure is not established; the default search window (60 s) exceeds the 30 s clip, and a longer clip was not tried. This shows ffsubsync corrects a constant offset on clean synthetic speech when the search is bounded; it says nothing about real recordings, music beds or drift.
