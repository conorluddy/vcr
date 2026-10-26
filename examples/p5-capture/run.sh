#!/usr/bin/env bash
# p5.js sketch with the loop stopped, rendered as a pure function of time and seed, captured frame by frame.
set -euo pipefail
cd "$(dirname "$0")"
pnpm -s capture 2>/dev/null > /dev/null
jq '{frames, width, height, shuffled_matches_sequential}' output/report.json > output/summary.json
magick output/frames/frame-0030.png -alpha extract -format "alpha min=%[fx:minima] max=%[fx:maxima]\n" info:
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "p5-capture: OK ($(jq -r .frames_per_second output/report.json) fps)"
