#!/usr/bin/env bash
# Anime.js v4 timeline (autoplay off) seeked per frame with alpha; asserts frame count, alpha range
# at frame 45 and shuffled-equals-sequential against expected/summary.json. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
alpha_range=$(magick output/frames/frame-0045.png -alpha extract -format "%[fx:minima] %[fx:maxima]" info:)
jq --arg alpha "$alpha_range" '{frames, width, height, shuffled_matches_sequential,
  frame_45_alpha: ($alpha | split(" ") | {min: (.[0] | tonumber), max: (.[1] | tonumber)})}' output/report.json > output/summary.json
[[ $(jq .shuffled_matches_sequential output/report.json) == true ]] || { echo "anime-capture: shuffled order differs at frames $(jq -c .mismatched_frames output/report.json)" >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "anime-capture: OK ($(jq -r .frames_per_second output/report.json) fps)"
