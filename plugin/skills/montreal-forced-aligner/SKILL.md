---
name: montreal-forced-aligner
description: Time a known transcript against speech with Montreal Forced Aligner (mfa align) and read word timings from JSON. Load when a final script must be aligned tightly, especially around pauses; installs through conda-forge.
---

# Montreal Forced Aligner

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Forced alignment: audio plus its exact transcript in, word timings (and a `phones` tier) out.
- Proven in VCR: on `say` speech with 0.4 s gaps, 10 of 10 word starts were within 0.20 s of known onsets (max 0.10 s) and two runs were identical. `echogarden` DTW got 8 of 10 on the same sentence.
- Needs the transcript. Without one, transcribe with `whisperx` first. Untested: real recordings, noise, other languages, out-of-dictionary words (needs a G2P model), phone-timing accuracy.
- Slow start-up: about 85 s per `mfa align` even for 8 seconds of audio. Batch a whole corpus directory per call.

## Capability map
Documented areas ([docs](https://montrealcorpustools.github.io/Montreal-Forced-Aligner/)): `mfa align`, `validate`, `model download|inspect|list`, `g2p`, `train`, `adapt`, `transcribe`, `segment`, speaker diarization. VCR exercised only `align` with a pretrained model and `model download`. The rest is untested. Pretrained models are catalogued at https://mfa-models.readthedocs.io/ and each has its own licence.

## Install and doctor
```sh
export MAMBA_ROOT_PREFIX=$PWD/output/mamba MFA_ROOT_DIR=$PWD/output/mfa
micromamba create -y -p output/env -c conda-forge --override-channels montreal-forced-aligner=3.4.4
export PATH=$PWD/output/env/bin:$PATH   # required: MFA finds Kaldi and OpenFst on PATH
mfa model download acoustic english_us_arpa && mfa model download dictionary english_us_arpa
```
`vcr doctor` does not check it. Set `MFA_ROOT_DIR` or models and caches go to `~/Documents/MFA`. The env is 260 MB and the package cache about 1.6 GB.

## Smoke test
```text
examples/mfa-forced-alignment/run.sh
# expect (last line): mfa-forced-alignment: OK
```
First run takes several minutes (env, models, two alignments).

## Recipe
Corpus directory: `name.wav` beside `name.txt` holding the transcript.
```sh
mfa align --clean --single_speaker --output_format json --no_use_mp \
  /abs/corpus english_us_arpa english_us_arpa /abs/out
```
Read `out/name.json`: `tiers.words.entries` is `[start, end, label]` in seconds; empty labels are silence. Use `--output_format long_textgrid` for Praat.

## Troubleshooting
- `Corpus directory does not exist`: a flag swallowed the path. `--use_mp` takes no value; write `--no_use_mp`.
- `Could not find 'fstcompile'`: the env's `bin` is not on PATH.

## Official docs
https://montrealcorpustools.github.io/Montreal-Forced-Aligner/ (3.4.4); models https://mfa-models.readthedocs.io/
