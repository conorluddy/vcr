#!/usr/bin/env bash
# Capture a paused GSAP timeline frame by frame with alpha, assert frame 45's alpha range,
# assemble a ProRes 4444 movie that keeps alpha, and diff the facts against expected/summary.json.
# --record rewrites expected/ from this run.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
alpha_range=$(magick output/frames/frame-0045.png -alpha extract -format "%[fx:minima] %[fx:maxima]" info:)
ffmpeg -y -loglevel error -framerate 30 -i output/frames/frame-%04d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le output/capture.mov
# ffprobe reports yuva444p10le or yuva444p12le depending on the FFmpeg build; retain only that the format carries alpha.
IFS=, read -r codec pix_fmt nb_frames < <(ffprobe -v error -show_entries stream=codec_name,pix_fmt,nb_frames -of csv=p=0 output/capture.mov)
jq --arg alpha "$alpha_range" --arg codec "$codec" --arg pix_fmt "$pix_fmt" --argjson nb_frames "$nb_frames" '{
  capture_mode, frames: .runs[0].frames, width: .runs[0].width, height: .runs[0].height, shuffled_matches_sequential,
  frame_45_alpha: ($alpha | split(" ") | {min: (.[0] | tonumber), max: (.[1] | tonumber)}),
  movie: {codec: $codec, pix_fmt_has_alpha: ($pix_fmt | startswith("yuva")), frames: $nb_frames}
}' output/report.json > output/summary.json
echo "pix_fmt=$pix_fmt"
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "browser-capture: OK ($(jq -r '.runs[0].frames_per_second' output/report.json) fps)"
