#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
rm -rf output/input output/keep output/safe output/safe-repeat
python3 generate_frames.py output/input

oxipng --version > output/versions.txt
magick -version | head -n 1 >> output/versions.txt

mkdir -p output/keep output/safe output/safe-repeat
for input in output/input/*.png; do
  name="$(basename "$input")"
  oxipng -q -o 4 --out "output/keep/$name" "$input"
  oxipng -q -o 4 --strip safe --out "output/safe/$name" "$input"
  oxipng -q -o 4 --strip safe --out "output/safe-repeat/$name" "$input"
done

python3 check_output.py output/input output/keep output/safe output/safe-repeat output/versions.txt output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "oxipng-lossless-optimise: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "oxipng-lossless-optimise: OK"
