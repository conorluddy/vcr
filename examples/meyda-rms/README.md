# Meyda RMS fixture

## Intent and scope

- **Tool/version:** Meyda 5.6.3, pinned in the example-local `package.json` and lockfile.
- **Claim:** `Meyda.extract("rms", signal)` returns the RMS for a generated 512-sample constant `Float32Array`, accounting for Meyda's documented default Hanning window.
- **Exclusions:** no microphone, Web Audio node, audio-file decoding, other feature extractors, sample rates or real-world audio claims.
- **Documentation:** [Meyda source API](https://github.com/meyda/meyda/blob/main/src/main.ts) and [RMS feature notes](https://github.com/meyda/meyda/blob/main/docs/audio-features.md), checked 2026-11-16. The docs state that `extract` applies Hanning by default; the fixture independently computes the windowed RMS.
- **Environment:** Node 25.6.1 on macOS 26.6 arm64; fixture-local npm dependency only.
- **Input/rights:** generated 512-sample unit signal, no external media.
- **Installation/side effects:** exact Meyda dependency installed under this example only; no global or repository dependency changes.

## Plan, before running

- **Command:** `node run.mjs` twice in separate Node processes; `./run.sh --record` then `./run.sh`.
- **Expected checks:** exact dependency version 5.6.3; 512 unit samples; default Hanning window; RMS matches independently calculated expected value within `1e-7`; two process outputs match byte-for-byte.
- **Stop conditions:** stop if version differs, output is null/non-finite, numeric error exceeds tolerance, or repeated process outputs differ.
- **Reproduction:** `cd examples/meyda-rms && npm ci && ./run.sh`.

## Observation, after running

- **Date/executor:** 2026-11-16; Codex on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64, Node 25.6.1.
- **Observed result:** `./run.sh --record` and `./run.sh` passed. Independent expected RMS and Meyda output were both `0.6117741220995089` (absolute error 0); two separate Node processes produced identical JSON. Generated signal SHA-256: `fef951e6c76ad6a01b208af650ca6d95769bec840e009981c5ae1316a42c90b1`.
- **Inspection:** no media artifact was needed; the fixture checks numeric output against the independently computed Hann-window RMS.
- **Outcome and limits:** pass for offline RMS extraction with this pinned library and generated signal; no audio I/O, Web Audio, or other feature is established.
