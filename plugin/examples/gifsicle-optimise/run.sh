#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
python3 generate_frames.py output/frames output/concat.txt

ffmpeg -v error -y -f concat -safe 0 -i output/concat.txt -fps_mode passthrough -loop 2 -c:v gif output/input.gif

gifsicle -O3 output/input.gif -o output/o3.gif
gifsicle -O3 output/input.gif -o output/o3-repeat.gif
cmp output/o3.gif output/o3-repeat.gif
gifsicle -O3 --lossy=80 output/input.gif -o output/lossy.gif
gifsicle -O3 --colors=16 output/input.gif -o output/colors.gif

for name in input o3 lossy colors; do
  magick "output/${name}.gif" -coalesce -depth 8 "rgba:output/${name}.rgba"
done

gifsicle --version | head -n 1 > output/gifsicle-version.txt
ffmpeg -version | head -n 1 > output/ffmpeg-version.txt
magick -version | head -n 1 > output/magick-version.txt
python3 --version > output/python-version.txt
python3 check_output.py output

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "gifsicle-optimise: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "gifsicle-optimise: OK"
