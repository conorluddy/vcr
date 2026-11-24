#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
rm -rf output
mkdir -p output expected

vhs --version > output/vhs-version.txt
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --version > output/chrome-version.txt
ffprobe -version | head -n 1 > output/ffprobe-version.txt
magick -version | head -n 1 > output/imagemagick-version.txt

vhs demo.tape

checks_status=0
python3 check_output.py output output/vhs-version.txt output/chrome-version.txt output/ffprobe-version.txt output/imagemagick-version.txt || checks_status=$?

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "vhs-tape-recording: recorded expectations (predeclared checks exit status ${checks_status})"
  exit 0
fi

if (( checks_status != 0 )); then
  echo "vhs-tape-recording: predeclared checks failed; see output/metrics.json"
  exit "$checks_status"
fi

diff -u expected/metrics.json output/metrics.json
echo "vhs-tape-recording: OK"
