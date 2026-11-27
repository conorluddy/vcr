# Montreal Forced Aligner forced alignment of a known transcript

## Intent and scope

Claim: `mfa align` (3.4.4) with the `english_us_arpa` acoustic model and dictionary returns word timings
for a known transcript in order, monotonic, with at least 9 of 10 word starts within 0.20 s of known
onsets, identical on rerun. The same input, tolerance and gates as `examples/echogarden-forced-alignment`
(8 of 10 within 0.20 s, rerun differed), so the two results compare directly.

Tool: montreal-forced-aligner 3.4.4 (conda-forge noarch, Kaldi from conda-forge, Python 3.14), released
2026-11-16. Code licence MIT.
Models, checked 2026-11-27 on mfa-models.readthedocs.io: `english_us_arpa` acoustic model v3.0.0 and
`english_us_arpa` dictionary v3.0.0 (199,858 words), both CC BY 4.0. Free to use with attribution.
Acoustic model download is about 95 MB together with the dictionary.

Exclusions: other languages and models, `english_mfa`, G2P for out-of-dictionary words, phone-level
timings (the JSON also holds a `phones` tier; not checked), TextGrid output, real recordings, noise,
multi-speaker corpora, training. Environment: macOS 26.6 arm64.

Input: macOS `say` (voice Samantha) per word, 16 kHz mono PCM via ffmpeg, joined in `build_input.py`
with a 0.50 s lead-in and 0.40 s gaps. Reference onset = first sample at 3 percent of the clip peak.
Sentence: "the red fox jumps over the quiet brown river today". Audio is regenerated into ignored `output/`.

Dependencies and side effects: `micromamba` on PATH (user-approved). `run.sh` creates a conda-forge env in
`output/env` with `MAMBA_ROOT_PREFIX` in `output/mamba` (about 1.6 GB package cache, 260 MB env) and sets
`MFA_ROOT_DIR` to `output/mfa`, so nothing is written under `~`. Network: conda-forge and the MFA model
releases on GitHub, first run only.

## Plan, before running

Command: `./run.sh`; `--record` rewrites `expected/`. First run takes several minutes (env, models,
two alignments of about 85 s each, mostly Kaldi start-up).
Predeclared checks (never loosened):

- G1 ten words returned in reference order.
- G2 starts non-decreasing, each end after its start.
- G3 at least 9 of 10 starts within 0.20 s of reference onsets.
- G4 word timings identical to 1 ms across two separate `mfa align --clean` runs.

Failed gates stay as `KNOWN FAIL`; `run.sh` exits 0 while the run reproduces `expected/`.
Stop conditions: model licence non-free (checked: CC BY 4.0), env solve failure, model download failure.

## Observation, after running (2026-11-27, Conors-MacBook-Pro-2.local)

All four gates pass. 10 of 10 starts within 0.20 s, mean error 0.03 s, max 0.10 s ("fox", 1.99 s aligned vs
2.10 s by the amplitude-threshold reference: the fricative onset is quiet, so the reference is late, not the
aligner). Two separate runs gave identical timings, and `run.sh` reproduced `expected/` on rerun.
MFA aligns each word to its true acoustic span with the pause in between handled by silence, which is where
Echogarden's DTW against a pause-free synthetic reference lost 0.68 s.

Result: pass. Establishes that the conda route runs unattended from a clean `output/`, the free
models download by name, and timings on gapped `say` speech are tight and deterministic on this machine.
Does not establish real recordings, noise, other voices, other languages, `english_mfa`, phone timings
or speed (about 85 s per tiny corpus, mostly start-up).
