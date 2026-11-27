#!/usr/bin/env bash
# imscJS: an IMSC1 document seeked per frame with generateISD + renderHTML in Chromium, with alpha.
# Asserts frame count, ISD time events, caption pixels present or absent at chosen frames, distinct frames,
# and shuffled-equals-sequential against expected/summary.json. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
alpha_max() { magick "output/frames/frame-$1.png" -alpha extract -format "%[fx:maxima]" info:; }
jq --arg a5 "$(alpha_max 0005)" --arg a22 "$(alpha_max 0022)" --arg a27 "$(alpha_max 0027)" --arg a35 "$(alpha_max 0035)" --arg a55 "$(alpha_max 0055)" '{
  frames, width, height, events, distinct_frames, shuffled_matches_sequential,
  alpha_max_by_frame: {"5": ($a5|tonumber), "22": ($a22|tonumber), "27": ($a27|tonumber), "35": ($a35|tonumber), "55": ($a55|tonumber)}
}' output/report.json > output/summary.json
[[ $(jq .shuffled_matches_sequential output/report.json) == true ]] || { echo "imscjs-seek-render: shuffled order differs at frames $(jq -c .mismatched_frames output/report.json)" >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "imscjs-seek-render: OK"
