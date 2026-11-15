#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
python3 generate_frames.py output/frames

gifski --fps 3 --quality 100 --output output/sequence.gif output/frames/frame*.png
gifski --fps 3 --quality 100 --output output/repeated.gif output/frames/frame*.png
cmp output/sequence.gif output/repeated.gif
gifski --version | head -n 1 > output/gifski-version.txt
ffprobe -version | head -n 1 > output/ffprobe-version.txt
ffprobe -v error -count_frames -select_streams v:0 -show_frames -show_entries stream=codec_name,width,height,nb_frames,nb_read_frames,avg_frame_rate -show_entries format=duration -show_entries frame=best_effort_timestamp_time -of json output/sequence.gif > output/probe.json
python3 check_output.py output/probe.json output/gifski-version.txt output/ffprobe-version.txt output/sequence.gif output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "gifski-sequence: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "gifski-sequence: OK"
