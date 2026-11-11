#!/usr/bin/env bash
# OGL scene rendered once per seek with alpha, captured frame by frame and checked for shuffled order.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
alpha_range=$(magick output/frames/frame-0045.png -alpha extract -format "%[fx:minima] %[fx:maxima]" info:)
jq --arg alpha "$alpha_range" '{frames,width,height,shuffled_matches_sequential,frame_45_alpha:($alpha|split(" ")|{min:(.[0]|tonumber),max:(.[1]|tonumber)})}' output/report.json > output/summary.json
jq -e '.frames==90 and .width==1280 and .height==720 and .shuffled_matches_sequential==true and .frame_45_alpha.min==0 and .frame_45_alpha.max==1' output/summary.json >/dev/null
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "ogl-capture: OK"
