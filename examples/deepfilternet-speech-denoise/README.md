# DeepFilterNet speech denoise

## Intent and scope

- Tool/version: DeepFilterNet `deep-filter` 0.5.6 (`deep_filter 0.5.6`), official release binary `deep-filter-0.5.6-aarch64-apple-darwin`, SHA-256 `4601e7f4e4c03e59a4c5b5000216ef3add3e808799cfccd95e14e83ea4611081` (computed on first download; GitHub publishes no digest). Default embedded model.
- Claim: speech plus added white noise at a known 5.0 dB SNR comes out of `deep-filter` with a higher SNR against the clean speech, by at least 8.0 dB.
- Exclusions: real recorded noise, music, other models (`-m`), post-filter and attenuation options, the Python package, Linux and Windows, non-48 kHz input, perceptual quality (no listening test beyond spectrograms).
- Licences, checked 2026-11-27: code and model weights are both stated MIT or Apache-2.0 at your option in the upstream README ("All code and model weights in this repository"). Training-data terms not checked. The input speech is generated locally with macOS `say` and is not committed.
- Environment: macOS 26.6 arm64, Python 3.12 venv in `output/venv` (numpy 2.5.5), ffmpeg and sox for conversion and spectrograms.
- Install: none on the machine. `run.sh` downloads the binary into ignored `output/` and fails (does not skip) if the download or checksum fails. Network required on first run.

## Plan, before running

- Input: `say -v Samantha` reading a fixed sentence, converted to 48 kHz mono 16-bit at half volume (headroom). Noise: numpy `default_rng(20261127)` Gaussian white noise scaled to exactly 5.0 dB SNR.
- Run `deep-filter -D` twice on the noisy file.
- Checks: input SNR within 0.05 dB of 5.0; output 48 kHz mono 16-bit; output sample count equals input; SNR improvement at least 8.0 dB (floor declared before the first run); the two runs byte-identical. SNR is measured against the clean speech after the best scalar gain, so level changes do not count as noise.
- Stop conditions: any check failing stays in the fixture as `KNOWN FAIL`; no check is loosened.

## Observation, after running

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`.

- First run: the input clipped (warning from the tool), and the output was 1440 samples shorter than the input, so my first scorer returned NaN. Corrections made after seeing that: speech level halved; SNR scored on the shared prefix (`min` of both lengths), with the length equality kept as its own predeclared check. The 8.0 dB floor was not changed.
- Final: input SNR 5.0 dB, output 17.3 dB, improvement 12.3 dB (passes). Two runs byte-identical. Format 48 kHz mono 16-bit.
- KNOWN FAIL: output has 223723 samples against 225163 in, 1440 samples (30 ms) short, even with `-D`, which is documented to compensate STFT and model delay. Recorded in `expected/result.json`; `run.sh` exits 0 while the run reproduces it. Trimming or padding the tail is a job for the caller.
- Spectrograms inspected (`output/spec-*.png`): noisy file is uniformly noise-filled; denoised file shows speech harmonics and fricative bursts on a dark floor, with some high band content removed above about 18 kHz.
- Not established: real noise, real voices, perceptual quality, other platforms, why the tail is dropped.
