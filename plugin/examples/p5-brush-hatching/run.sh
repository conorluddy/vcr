#!/usr/bin/env bash
# p5.brush hatched and flow-field drawing rebuilt from scratch at each seek, captured frame by frame.
set -euo pipefail
cd "$(dirname "$0")"
pnpm -s capture 2>/dev/null > /dev/null
jq '{frames, width, height, shuffled_matches_sequential}' output/report.json > output/summary.json
for n in 0000 0030 0060; do
  magick output/frames/frame-$n.png -alpha extract -format "frame $n alpha min=%[fx:minima] max=%[fx:maxima]\n" info:
done
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "p5-brush-hatching: OK ($(jq -r .frames_per_second output/report.json) fps)"
