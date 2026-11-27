#!/usr/bin/env bash
# Generate a synthetic .splat, render it with Spark inside a three.js scene frame by frame, and diff the facts.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
node generate-splats.mjs output/scene.splat
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
distinct=$(jq '.hashes | unique | length' output/report.json)
jq --argjson distinct "$distinct" '{frames, width, height, shuffled_matches_sequential, distinct_frames: $distinct}' output/report.json > output/summary.json
magick output/frames/frame-0000.png -alpha extract -format "frame 0 alpha min=%[fx:minima] max=%[fx:maxima]\n" info:
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "spark-splats-capture: OK (90 frames)"
