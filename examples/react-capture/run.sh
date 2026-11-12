#!/usr/bin/env bash
# React Three Fiber scene built with esbuild, seeked through a flushed prop, captured frame by frame.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
alpha_range=$(magick output/frames/frame-0045.png -alpha extract -format "%[fx:minima] %[fx:maxima]" info:)
jq --arg alpha "$alpha_range" '{frames,width,height,shuffled_matches_sequential,distinct_hashes:(.hashes|unique|length>1),frame_45_alpha:($alpha|split(" ")|{min:(.[0]|tonumber),max:(.[1]|tonumber)})}' output/report.json > output/summary.json
jq -e '.frames==90 and .width==1280 and .height==720 and .shuffled_matches_sequential==true and .distinct_hashes and .frame_45_alpha.min==0 and .frame_45_alpha.max==1' output/summary.json >/dev/null
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "react-capture: OK ($(jq -r .frames_per_second output/report.json) fps)"
