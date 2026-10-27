#!/usr/bin/env bash
# Capture a paused GSAP timeline frame by frame with alpha, check an edge pixel really is
# semi-transparent, and assemble a ProRes 4444 movie that keeps the alpha channel.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
magick output/frames/frame-0045.png -alpha extract -format "min=%[fx:minima] max=%[fx:maxima] mean=%[fx:mean]\n" info: | tee output/alpha.txt
ffmpeg -y -loglevel error -framerate 30 -i output/frames/frame-%04d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le output/capture.mov
ffprobe -v error -show_entries stream=codec_name,pix_fmt,nb_frames -of csv=p=0 output/capture.mov
jq -r '"shuffled_matches_sequential=\(.shuffled_matches_sequential)", (.runs[] | "\(.label): \(.frames_per_second) fps")' output/report.json
