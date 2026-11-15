#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected

dot -Tsvg source.dot -o output/graph.svg
dot -Tsvg source.dot -o output/graph-repeat.svg
cmp output/graph.svg output/graph-repeat.svg
dot -V 2> output/version.txt
python3 check-output.py source.dot output/graph.svg output/version.txt output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "graphviz-dot-svg: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "graphviz-dot-svg: OK"
