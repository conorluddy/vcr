#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected

d2 --version > output/version.txt
d2 source.d2 output/diagram.svg
d2 source.d2 output/diagram-repeat.svg
cmp output/diagram.svg output/diagram-repeat.svg
python3 check-output.py source.d2 output/diagram.svg output/version.txt output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "d2-diagram-svg: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "d2-diagram-svg: OK"
