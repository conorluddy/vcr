#!/usr/bin/env bash
# Build a C program against Homebrew libplacebo 7.387.0 CPU APIs (no GPU context), run it twice, then check
# primaries, RGB->XYZ matrices, colour conversions, PQ encoding and a BT.2390 tone map against the predeclared
# references in expected/, plus byte-identical reruns and the recorded hash.
set -euo pipefail
cd "$(dirname "$0")"
readonly EXPECTED_LIBPLACEBO_VERSION="7.387.0"
readonly RECORD_FLAG="${1:-}"

libplaceboVersion="$(pkg-config --modversion libplacebo)"
if [[ "$libplaceboVersion" != "$EXPECTED_LIBPLACEBO_VERSION" ]]; then
  echo "libplacebo-colour-maths: pkg-config reports libplacebo $libplaceboVersion, expected $EXPECTED_LIBPLACEBO_VERSION; stop and re-plan" >&2
  exit 1
fi

rm -rf output
mkdir -p output/run1 output/run2
clang -std=c11 -O2 -Wall -Wextra $(pkg-config --cflags libplacebo) render.c $(pkg-config --libs libplacebo) -o output/render
output/render > output/run1/measured.json
output/render > output/run2/measured.json
cmp output/run1/measured.json output/run2/measured.json
echo "reruns byte-identical"

if [[ "$RECORD_FLAG" == "--record" ]]; then
  node check.mjs output/run1 --record
  echo "recorded expected/hashes.json (reference.json is predeclared, not re-recorded)"
  exit 0
fi
node check.mjs output/run1
