#!/usr/bin/env bash
# Build a C++ program against Homebrew ThorVG 1.1.4, render an inline SVG and one inline Lottie frame twice,
# then check predeclared pixels, the Lottie loader, byte-identical reruns and recorded hashes.
set -euo pipefail
cd "$(dirname "$0")"
readonly EXPECTED_THORVG_VERSION="1.1.4"
readonly RECORD_FLAG="${1:-}"

thorvgVersion="$(pkg-config --modversion thorvg-1)"
if [[ "$thorvgVersion" != "$EXPECTED_THORVG_VERSION" ]]; then
  echo "thorvg-svg-raster: pkg-config reports ThorVG $thorvgVersion, expected $EXPECTED_THORVG_VERSION; stop and re-plan" >&2
  exit 1
fi

rm -rf output
mkdir -p output/run1 output/run2
clang++ -std=c++17 -O2 -Wall $(pkg-config --cflags thorvg-1) render.cpp $(pkg-config --libs thorvg-1) -o output/render
output/render output/run1
output/render output/run2
cmp output/run1/svg.argb output/run2/svg.argb
cmp output/run1/lottie-frame-5.argb output/run2/lottie-frame-5.argb
cmp output/run1/measured.json output/run2/measured.json
echo "reruns byte-identical"

if [[ "$RECORD_FLAG" == "--record" ]]; then
  node check.mjs output/run1 --record
  echo "recorded expected/hashes.json (probes in expected/probes.json are predeclared, not re-recorded)"
  exit 0
fi
node check.mjs output/run1
