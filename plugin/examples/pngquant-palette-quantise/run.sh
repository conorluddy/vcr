#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected

generate_source() {
  magick -size 256x256 gradient:'#ff5e3a'-'#2a6bff' \( -size 256x256 gradient:black-white -rotate 90 \) \
    -compose CopyOpacity -composite -define png:color-type=6 "$1"
}

generate_source output/source.png
generate_source output/source-again.png
cmp output/source.png output/source-again.png

quantise() {
  pngquant --quality 70-95 --speed 1 --force --output "$2" 64 -- "$1"
}

quantise output/source.png output/palette.png
quantise output/source.png output/palette-again.png
pngquant --version > output/pngquant-version.txt

python3 check_output.py output/source.png output/palette.png output/palette-again.png output/source-again.png output/pngquant-version.txt output/metrics.json

magick \( output/source.png output/palette.png +append +repage \) -background '#808080' -flatten output/contact.png

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "pngquant-palette-quantise: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "pngquant-palette-quantise: OK"
