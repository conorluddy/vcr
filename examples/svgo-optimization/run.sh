#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected

svgo --config svgo.config.mjs source.svg --output output/optimized.svg
svgo --config svgo.config.mjs source.svg --output output/repeated.svg
cmp output/optimized.svg output/repeated.svg
svgo --version > output/version.txt
python3 check-output.py source.svg output/optimized.svg output/version.txt output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "svgo-optimization: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "svgo-optimization: OK"
