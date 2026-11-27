# libsonare beat, onset and loudness fixture

## Intent and scope

Claim: libsonare 2.0.0 (PyPI wheel, `libsonare==2.0.0`) recovers tempo, beat times and onset times from generated click tracks, and the integrated LUFS of a generated sine, each against known truth.

Exclusions: no real music, no key, chord or section analysis, no mastering, mixing, stems, MIDI or transcription, no WASM or Node build, no synchronisation with video, no cross-machine determinism claim.

Sources checked 2026-11-27: PyPI `libsonare` 2.0.0 (Apache-2.0, uploaded 2026-11-26, wheel `macosx_11_0_arm64`), https://libsonare.libraz.net, https://github.com/libraz/libsonare. All audio is generated here, so no asset licence applies.

Environment: macOS arm64, Python 3.12 venv in `output/venv` (git-ignored), sox on PATH. Install needs network once (pip); nothing system-wide.

Input: `analyse.py` writes `output/click-120.wav` and `output/click-90.wav` (10 s, 22050 Hz mono, 30 ms 1 kHz bursts with 4 ms decay, first at 0.5 s, spaced 60/BPM). `run.sh` makes `output/sine.wav` with sox: 997 Hz, mono, peak 0.1.

## Plan, before running

Commands: `./run.sh --record`, then `./run.sh`.

Predeclared checks (all gating, recorded as booleans in `expected/checks.json`):
1. Tempo within 2 % of 120 and of 90 BPM.
2. Beat count equals click count; every detected beat within 40 ms of a click and every click within 40 ms of a beat.
3. Onset count equals click count; same matching within 30 ms.
4. Integrated LUFS of the sine within 0.5 LU of 20 log10(0.1) - 3.01 = -23.01.
5. Two runs produce identical JSON.

A failed check stays in `expected/`, prints `KNOWN FAIL: <name>` and keeps evidence partial. Thresholds are not loosened after seeing results.

## Observation, after running

2026-11-27, macOS arm64, Python 3.12. All 11 checks passed from a clean `output/`. Tempo 119.626 and 89.656; beats within 11.4 and 10.7 ms, onsets within 0.9 ms; sine -22.98 LUFS. Reruns identical. A cross-check with ffmpeg `ebur128` on the same sine also reads -23.0.

Not inspected visually or by ear; the check is numeric against construction truth.

Does not establish: behaviour on music, other platforms or versions, speed, or any other libsonare module.
