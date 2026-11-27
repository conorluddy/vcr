# Echogarden forced alignment of a known transcript

## Intent and scope

Claim: `echogarden` `align()` with the `dtw` engine returns word timings for a known transcript in
order, monotonic, with at least 9 of 10 word starts within 0.20 s of known onsets, identical on rerun.

Tool: echogarden 3.4.0 (npm, published 2026-09-08), `pnpm add` into this example, Node 22.19.0.
Licence: package declares `MIT AND GPL-3.0` (LICENSE.MIT.md and LICENSE.GPLv3.md ship in the package).
Models: none. The `dtw` engine synthesises a reference with bundled espeak-ng WASM and matches MFCCs;
nothing is downloaded (checked: no cache created; `XDG_CACHE_HOME` points at ignored `output/cache`
anyway). Whisper-guided and other engines download models and were not run.

Exclusions: other engines, other languages, real recordings, noise, TTS and recognition modes, SRT/VTT
writers, the CLI. Environment: macOS 26.6 arm64.

Input: macOS `say` (voice Samantha) per word, 16 kHz mono PCM via ffmpeg, joined in `align.mjs` with a
0.50 s lead-in and 0.40 s gaps. Reference onset = first sample at 3 percent of the clip peak. Sentence:
"the red fox jumps over the quiet brown river today". Audio is regenerated into ignored `output/`.

## Plan, before running

Command: `./run.sh` (after `pnpm install` at the repository root); `--record` rewrites `expected/`.
Predeclared checks (never loosened):

- G1 ten words returned in reference order.
- G2 starts non-decreasing, each end after its start.
- G3 at least 9 of 10 starts within 0.20 s of reference onsets.
- G4 timings identical to 1 ms across two in-process runs on the same file.

Failed gates stay as `KNOWN FAIL`; `run.sh` exits 0 while the run reproduces `expected/`.

## Observation, after running (2026-11-27, Conors-MacBook-Pro-2.local)

G1 and G2 pass. G3 FAILS: 8 of 10 within tolerance, mean error 0.14 s, max 0.68 s. DTW matches against
a pause-free synthetic reference, so the long gaps pull timings off: "red" (0.60 s vs 1.29 s) and the second "the"
(4.26 s vs 4.77 s) are the two misses. G4 FAILS: the second in-process run changed brown, river and today. `run.sh`
itself reproduced the recorded output twice (the diff passes), so the whole-script result is stable here
even though one process gave two answers.

Result: partial. Establishes that the DTW route runs from pnpm with no download and keeps word order.
Does not establish tight timing on gapped speech, determinism, other engines or real speech. Revisit:
try the Whisper-guided engine (model download needed) or continuous speech without long gaps.
