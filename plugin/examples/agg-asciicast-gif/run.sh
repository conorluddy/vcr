#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output/frames expected

AGG_FLAGS=(--cols 40 --rows 6 --fps-cap 10 --last-frame-duration 2)

agg --font-size 16 "${AGG_FLAGS[@]}" fixture.cast output/render.gif
agg --font-size 16 "${AGG_FLAGS[@]}" fixture.cast output/render-repeat.gif
agg --font-size 32 "${AGG_FLAGS[@]}" fixture.cast output/render-32.gif
agg -v --font-size 16 "${AGG_FLAGS[@]}" fixture.cast output/render-verbose.gif 2> output/agg-verbose.log
cmp output/render.gif output/render-repeat.gif

agg --version > output/agg-version.txt
ffprobe -version | head -n 1 > output/ffprobe-version.txt
ffprobe -v error -count_frames -show_streams -show_format -show_frames \
  -of json output/render.gif > output/probe.json
ffprobe -v error -show_streams -of json output/render-32.gif > output/probe-32.json
magick identify -format "%w %h\n" 'output/render.gif[0]' > output/identify.txt

python3 check_output.py output/probe.json output/identify.txt output/render.gif output/render-repeat.gif \
  output/probe-32.json output/agg-version.txt output/ffprobe-version.txt output/frames output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "agg-asciicast-gif: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "agg-asciicast-gif: OK"
