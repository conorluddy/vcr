#!/usr/bin/env bash
# Composite generated RGBA layers and a rasterised SVG with sharp, keeping alpha; diffs
# dimensions, channels, pixel probes and hashes against expected/summary.json. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s composite > output/composite.log 2>&1 || { cat output/composite.log >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "sharp-composite: OK (sharp $(jq -r .sharp output/summary.json), libvips $(jq -r .libvips output/summary.json))"
