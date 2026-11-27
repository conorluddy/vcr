#!/usr/bin/env bash
# Builds and runs the vello_cpu fixture twice, diffs facts and PNG hash against expected/.
# Usage: ./run.sh [--record]
set -euo pipefail
cd "$(dirname "$0")"
command -v cargo >/dev/null || { echo "FAIL: cargo not on PATH (install Rust >= 1.89)"; exit 1; }
export CARGO_TARGET_DIR="$PWD/output/target"
mkdir -p output
cargo build --release --locked --quiet
bin="$CARGO_TARGET_DIR/release/vello-cpu-raster"
"$bin" output/run1.png > output/run1.json
"$bin" output/run2.png > output/run2.json
h1=$(shasum -a 256 output/run1.png | cut -d' ' -f1)
h2=$(shasum -a 256 output/run2.png | cut -d' ' -f1)
if [ "$h1" != "$h2" ] || ! cmp -s output/run1.json output/run2.json; then
  echo "FAIL: repeat runs differ ($h1 vs $h2)"; exit 1
fi
printf '{"png_sha256":"%s","facts":%s}\n' "$h1" "$(cat output/run1.json)" > output/metrics.json
if [ "${1:-}" = "--record" ]; then cp output/metrics.json expected/metrics.json; echo "recorded"; exit 0; fi
diff expected/metrics.json output/metrics.json || { echo "FAIL: differs from expected/metrics.json"; exit 1; }
echo "OK: repeat runs byte-identical, matches expected ($h1)"
