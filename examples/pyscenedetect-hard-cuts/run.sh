#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p output
UV_CACHE_DIR=output/uv-cache uv sync --locked --project . --python 3.12
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i 'color=c=red:s=96x64:r=24:d=1' \
  -f lavfi -i 'color=c=lime:s=96x64:r=24:d=1' \
  -f lavfi -i 'color=c=blue:s=96x64:r=24:d=1' \
  -f lavfi -i 'color=c=yellow:s=96x64:r=24:d=1' \
  -filter_complex '[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0,format=yuv420p[v]' \
  -map '[v]' -frames:v 96 -c:v libx264 -preset ultrafast -crf 0 -g 96 -an output/known-cuts.mp4
ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=width,height,avg_frame_rate,nb_read_frames -of json output/known-cuts.mp4 > output/probe.json
UV_CACHE_DIR=output/uv-cache MPLCONFIGDIR=output/mpl uv run --locked --project . python check_output.py ${1:-}
