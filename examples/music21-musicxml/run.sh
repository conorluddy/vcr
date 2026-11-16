#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export UV_CACHE_DIR="$PWD/output/uv-cache"
uv sync --locked --python /opt/homebrew/bin/python3.12
mkdir -p output/first output/second expected
.venv/bin/python make_and_check.py output/first > output/first/metrics.json
.venv/bin/python make_and_check.py output/second > output/second/metrics.json
diff output/first/metrics.json output/second/metrics.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first/metrics.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first/metrics.json
  echo "music21-musicxml: OK"
fi
