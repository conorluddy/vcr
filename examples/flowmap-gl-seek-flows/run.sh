#!/usr/bin/env bash
# Bundle the FlowmapLayer scene, capture 90 seeked frames, require shuffled == sequential, and diff the facts
# against expected/summary.json. --record rewrites expected/ from this run.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s build > output/build.log 2>&1 || { cat output/build.log >&2; exit 1; }
pnpm -s capture > output/capture.log 2>&1 || { cat output/capture.log >&2; exit 1; }
[[ "$(shasum -a 256 < output/frames/frame-0000.png)" != "$(shasum -a 256 < output/frames/frame-0045.png)" ]] || { echo "FAIL: frames 0 and 45 identical" >&2; exit 1; }
jq '{frames, width, height, shuffled_matches_sequential, distinct_frames: (.hashes | unique | length)}' output/report.json > output/summary.json
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "flowmap-gl-seek-flows: OK"
