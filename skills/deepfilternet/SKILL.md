---
name: deepfilternet
description: Suppress background noise in 48 kHz speech with the deep-filter CLI from a pinned release binary. Load to clean narration or screen-recording voice before loudness normalisation; VCR evidence is partial (one synthetic-noise test).
---

# DeepFilterNet (deep-filter)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Noise suppression for speech: `deep-filter -D -o out/ noisy.wav` writes `out/noisy.wav`. Trained for speech, not music: use `demucs` to split stems, `sox` or `pedalboard` for fixed filter chains.
- Fixture result: speech plus white noise at 5 dB SNR gained +12.3 dB (17.3 dB), output byte-identical across two runs, 48 kHz mono 16-bit preserved.
- Known fail: the output was 1440 samples (30 ms) shorter than the input even with `-D`. Pad or trim to the original length before muxing against video.
- Untested: real noise, real recordings, perceptual quality, `-m` other models, `--pf`, `-a`, stereo, other sample rates (upstream says 48 kHz), Linux and Windows.

## Capability map
`deep-filter --help` lists the whole CLI: `-m` model tar.gz, `--pf` post-filter, `-a` attenuation limit in dB, `-D` delay compensation, `-o` output directory ([README](https://github.com/Rikorose/DeepFilterNet#deep-filter)). A Python package (`deepfilternet`, needs torch) and LADSPA plug-ins also exist; none is covered by VCR. Only the defaults plus `-D` ran.

## Install and doctor
No machine install: fetch the release binary into a project directory and check its hash. Code and model weights are MIT or Apache-2.0 (upstream README, checked 2026-11-27).
```text
curl -fsSL -o deep-filter https://github.com/Rikorose/DeepFilterNet/releases/download/v0.5.6/deep-filter-0.5.6-aarch64-apple-darwin
shasum -a 256 deep-filter   # expect 4601e7f4e4c03e59a4c5b5000216ef3add3e808799cfccd95e14e83ea4611081
chmod +x deep-filter && ./deep-filter -V   # expect: deep_filter 0.5.6
```
GitHub publishes no digest for the asset; the hash above was computed on 2026-11-27.

## Smoke test
```text
vcr example create deepfilternet-speech-denoise && (cd examples/deepfilternet-speech-denoise && ./run.sh)
# expect: the result JSON, then "KNOWN FAIL: a predeclared check is false ..." (output length) and exit 0
```
Needs network on first run, macOS arm64, `say`, ffmpeg, sox and `python3.12`.

## Recipe
```text
ffmpeg -i narration.wav -ac 1 -ar 48000 -c:a pcm_s16le in48.wav   # 48 kHz first
./deep-filter -D -o cleaned/ in48.wav                              # then loudness: ffmpeg-normalize
```
Keep headroom on the input: the tool warns about clipping at full scale.

## Troubleshooting
- `Possible clipping detected`: lower the input level before filtering.
- Output shorter than input: observed, see above; pad the tail.

## Official docs
https://github.com/Rikorose/DeepFilterNet
