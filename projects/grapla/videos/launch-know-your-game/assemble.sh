#!/usr/bin/env bash
# Flat-layer assembly with FFmpeg: opaque background, then three alpha layers padded to their start times.
set -euo pipefail
cd "$(dirname "$0")"
F=output/frames
ffmpeg -y -loglevel error \
  -framerate 30 -i $F/background/frame-%04d.png \
  -framerate 30 -i $F/title/frame-%04d.png \
  -framerate 30 -i $F/product/frame-%04d.png \
  -framerate 30 -i $F/end/frame-%04d.png \
  -filter_complex "\
    [2]tpad=start_duration=4:color=black@0.0[p2];\
    [3]tpad=start_duration=15:color=black@0.0[p3];\
    [0][1]overlay=format=auto:eof_action=pass[a];\
    [a][p2]overlay=format=auto:eof_action=pass[b];\
    [b][p3]overlay=format=auto:eof_action=pass[v]" \
  -map "[v]" -r 30 -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart output/launch-know-your-game.mp4
ffprobe -v error -show_entries stream=width,height,r_frame_rate,nb_frames -show_entries format=duration -of json output/launch-know-your-game.mp4 | tee output/ffprobe.json
