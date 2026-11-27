#!/usr/bin/env bash
# DeepFilterNet: speech plus seeded white noise at 5 dB SNR -> deep-filter -> SNR improvement. Nothing leaves output/.
set -euo pipefail
cd "$(dirname "$0")"
version=0.5.6
sha256=4601e7f4e4c03e59a4c5b5000216ef3add3e808799cfccd95e14e83ea4611081
url="https://github.com/Rikorose/DeepFilterNet/releases/download/v${version}/deep-filter-${version}-aarch64-apple-darwin"
sentence="the quick brown fox jumps over the lazy dog, and then she said that it was time to leave"
mkdir -p output expected
[[ "$(uname -sm)" == "Darwin arm64" ]] || { echo "FAIL: pinned binary is macOS arm64 only" >&2; exit 1; }

if [[ ! -x output/deep-filter ]] || [[ "$(shasum -a 256 output/deep-filter | cut -d' ' -f1)" != "$sha256" ]]; then
  curl -fsSL -o output/deep-filter.part "$url"
  [[ "$(shasum -a 256 output/deep-filter.part | cut -d' ' -f1)" == "$sha256" ]] || { echo "FAIL: deep-filter checksum differs from pinned $sha256" >&2; exit 1; }
  chmod +x output/deep-filter.part
  mv output/deep-filter.part output/deep-filter
fi
if [[ ! -x output/venv/bin/python ]]; then
  python3.12 -m venv output/venv
  output/venv/bin/pip install -q -r requirements.txt
fi
py=(output/venv/bin/python -I)

rm -rf output/run1 output/run2 output/clean.wav output/noisy.wav output/speech.aiff output/result.json
say -v Samantha -o output/speech.aiff "$sentence"
ffmpeg -y -loglevel error -i output/speech.aiff -ac 1 -ar 48000 -af volume=0.5 -c:a pcm_s16le output/clean.wav
"${py[@]}" measure.py make output
output/deep-filter -V > output/version.txt
for run in run1 run2; do output/deep-filter -D -o "output/$run" output/noisy.wav > "output/$run.log" 2>&1; done
"${py[@]}" measure.py score output
# Listening aids, not checks: spectrograms of clean, noisy and denoised.
sox output/clean.wav -n spectrogram -x 600 -y 257 -o output/spec-clean.png
sox output/noisy.wav -n spectrogram -x 600 -y 257 -o output/spec-noisy.png
sox output/run1/noisy.wav -n spectrogram -x 600 -y 257 -o output/spec-denoised.png

cat output/result.json
if [[ "${1:-}" == "--record" ]]; then cp output/result.json expected/result.json; fi
diff -u expected/result.json output/result.json
if ! grep -q false output/result.json; then echo "OK: deepfilternet-speech-denoise"; exit 0; fi
echo "KNOWN FAIL: a predeclared check is false; the observation reproduces expected/result.json" >&2
