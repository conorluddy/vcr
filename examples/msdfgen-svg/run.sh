#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
msdfgen msdf -svg source.svg -o output/field.png -dimensions 64 64 -pxrange 4 -autoframe -testrender output/render.png 256 256
python3 check_output.py > output/metrics.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
fi
diff -u expected/metrics.json output/metrics.json
echo "OK: msdfgen-svg"
