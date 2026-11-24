---
name: demucs
description: Separate a mix into drums, bass, other and vocals stems with Demucs (htdemucs, CPU). Load when only a finished mix exists and stems are needed; check the pretrained weights' licence before using stems in a commercial deliverable.
---

# Demucs

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use Demucs to estimate stems from a mix when real stems do not exist. Sound design prefers real stems: `SOUND-VOICE-BED-GAP` and `SOUND-DUCK-*` read separate voice and bed stems and rate estimated ones as low reliability. Read thresholds from `vcr rules info <ID>`; this guide sets none and the fixture tests none of those rules. Record where stems came from with `SOUND-LICENSE-RECORD`.
- VCR validates Demucs 4.1.0, model `htdemucs`, torch 2.15.0 CPU, on macOS arm64 (Apple M3). Input was a generated 10 s mix of synthetic drums (kick and snare), sine bass notes and macOS `say` (Samantha) speech. Results: four stems at 44.1 kHz stereo, same length as the input (441,000 samples); correlation margin over the other sources 0.835 (drums), 0.961 (bass), 0.996 (vocals), all at least 0.83; SDR against ground truth drums 8.0 dB, bass 11.1 dB, vocals 16.1 dB; stems sum back to the mix at 20.1 dB SNR (not exact, about 1% of mix energy); stems byte-identical across two processes on CPU.
- Correlations are whole-signal figures and hide leakage. The spectrogram showed a faint broadband floor in the bass stem and texture in `other`. The `other` stem has no truth here (the mix has three sources), so it is checked only through the sum.
- Licence: code is MIT. The pretrained weights' licence is unclear, likely CC-BY-NC (upstream README). Verify before using separated stems in commercial deliverables. The fixture is internal and never commits weights.
- Not tested: real music, other models (`htdemucs_ft`, `htdemucs_6s`, `mdx*`), GPU or MPS, `--two-stems`, MP3 or FLAC output, `--shifts` above 0 (random time shifts, off here for reproducibility), other machines or versions. SDR on synthetic sources says nothing about real recordings.
- Maintenance: the original repository is archived; 4.1.0 comes from `adefossez/demucs`. For trimming or muxing use FFmpeg.

## Capability map
Discovery only. Docs: the [Demucs README](https://github.com/adefossez/demucs/blob/main/README.md).
- Tested: `python -m demucs -n htdemucs --shifts 0 -d cpu --float32 -o <dir> <file>`, output `<dir>/htdemucs/<input-stem>/{drums,bass,other,vocals}.wav`.
- Documented, untested: other pretrained models, `--two-stems`, `--mp3`/`--flac` and bit-depth options, `--segment`, `--jobs`, GPU devices, the Python API (`demucs.api`), training.

## Install and doctor
Heavy: a venv with torch plus about 84 MB of weights. Keep both under the example's git-ignored `output/`:

```text
cd examples/demucs-stem-separation
uv venv --python 3.12 output/venv
uv pip install --python output/venv/bin/python -r requirements.txt
vcr doctor
```
`requirements.txt` pins torch 2.15.0 and torchaudio 2.11.1 from the PyTorch CPU index, demucs 4.1.0 and numpy 2.5.5. Install numpy explicitly: demucs 4.1.0 imports it unconditionally but declares it only for darwin on x86_64, so a plain install on arm64 fails at import. Weights come from Hugging Face `adefossez/HTDemucs` on first run; `run.sh` sets `TORCH_HOME`, `XDG_CACHE_HOME` and `HF_HOME` to `output/cache` so nothing lands in the home cache. Python 3.12.13 was used. This guide does not mean Demucs is installed; `vcr doctor` says.

## Smoke test
```text
vcr example create demucs-stem-separation
cd examples/demucs-stem-separation && ./run.sh
# expect: demucs-stem-separation: OK
```
`run.sh` needs `say`, ffmpeg and ffprobe, builds the mix and ground truth, separates twice in separate processes, checks format, correlation margin, SDR floors and sum residual, then diffs `expected/checks.json`. About 9 to 10 s per separation with a warm cache. It prints BLOCKED and exits 3 if numpy and demucs do not import.

## Separation recipe
```text
python -m demucs -n htdemucs --shifts 0 -d cpu --float32 -o out mix.wav
# out/htdemucs/mix/{drums,bass,other,vocals}.wav
```
Stems keep the input's rate and length. Do not assume they sum exactly to the mix. Audition the result and say in the production notes that the stems are estimates.

## Troubleshooting
- Import fails with a missing `numpy`: install it (see Install). This blocked the first run.
- `run.sh` exits at once with no `output/venv`: create it as above; there is no automatic install.
- Weights download fails: stop and report blocked; check network access to Hugging Face. Do not swap models silently.
- Output differs after a demucs, torch or numpy change, or on another machine: record a new run; byte identity was shown only within one machine and one run.
- The `say` voice is not pinned, so the vocals figures are the most sensitive to the macOS build.

## Official docs
- [Demucs README](https://github.com/adefossez/demucs/blob/main/README.md)
- [Demucs on PyPI](https://pypi.org/project/demucs/)
- [HTDemucs weights on Hugging Face](https://huggingface.co/adefossez/HTDemucs)
