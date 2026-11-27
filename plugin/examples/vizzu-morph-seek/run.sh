#!/usr/bin/env bash
# Capture a paused Vizzu keyframe chain frame by frame, check shuffled capture equals sequential,
# and diff the facts against expected/summary.json. --record rewrites expected/ from this run.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
jq '{
  frames, width, height, shuffled_matches_sequential, end_frame_hash_differs_from_last,
  first_mid_last_all_differ: ([.hashes[0], .hashes[45], .hashes[89]] | unique | length == 3),
  at_least_60_distinct_frames: (.distinct_frames >= 60)
}' output/report.json > output/summary.json
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "vizzu-morph-seek: OK"
