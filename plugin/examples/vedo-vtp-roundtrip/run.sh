#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
OUT="$HERE/output"
VENV="$OUT/venv"
mkdir -p "$OUT" "$HERE/expected"
if [ ! -x "$VENV/bin/python" ]; then
  UV_CACHE_DIR="${UV_CACHE_DIR:-/tmp/vcr-uv-cache}" uv venv --python /opt/homebrew/bin/python3.12 "$VENV"
  UV_CACHE_DIR="${UV_CACHE_DIR:-/tmp/vcr-uv-cache}" uv pip install --python "$VENV/bin/python" --require-hashes -r "$HERE/requirements.lock"
fi
RECORD=0
if [ "${1:-}" = "--record" ]; then RECORD=1; fi
"$VENV/bin/python" "$HERE/run.py" "$OUT/first"
"$VENV/bin/python" "$HERE/run.py" "$OUT/second"
cmp "$OUT/first/metrics.json" "$OUT/second/metrics.json"
if [ "$RECORD" -eq 1 ]; then
  cp "$OUT/first/metrics.json" "$HERE/expected/metrics.json"
else
  diff -u "$HERE/expected/metrics.json" "$OUT/first/metrics.json"
fi
printf '%s\n' 'Vedo VTP round-trip passed in two independent Python processes.'
