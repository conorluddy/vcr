#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
OUT="$HERE/output"
mkdir -p "$OUT/first" "$OUT/second" "$HERE/expected"
node "$HERE/run.mjs" "$OUT/first"
node "$HERE/run.mjs" "$OUT/second"
cmp "$OUT/first/metrics.json" "$OUT/second/metrics.json"
if [ "${1:-}" = "--record" ]; then
  cp "$OUT/first/metrics.json" "$HERE/expected/metrics.json"
else
  diff -u "$HERE/expected/metrics.json" "$OUT/first/metrics.json"
fi
printf '%s\n' 'vtk.js VTP round-trip passed in two independent Node processes.'
