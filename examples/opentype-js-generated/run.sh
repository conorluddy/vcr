#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
uv sync --locked --project . --python 3.12
uv run --locked --project . python build_font.py
npm ci --ignore-scripts
node run.mjs > output/metrics.json
node run.mjs > output/repeat.json
cmp output/metrics.json output/repeat.json
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: opentype-js-generated"
