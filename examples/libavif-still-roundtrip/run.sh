#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
rm -f output/*.avif output/*-decoded.png output/metrics.json

python3 generate_input.py output/source.png

avifenc --codec aom -j 1 -s 6 -l output/source.png output/lossless.avif
avifdec -j 1 output/lossless.avif output/lossless-decoded.png
avifenc --codec aom -j 1 -s 6 -q 60 --qalpha 60 output/source.png output/lossy.avif
avifdec -j 1 output/lossy.avif output/lossy-decoded.png

checks_status=0
python3 check_output.py output || checks_status=$?

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "libavif-still-roundtrip: recorded observed metrics (predeclared checks exit ${checks_status})"
  exit "$checks_status"
fi

if [[ "$checks_status" -ne 0 ]]; then
  echo "libavif-still-roundtrip: predeclared checks FAILED (exit ${checks_status})" >&2
  exit "$checks_status"
fi

diff -u expected/metrics.json output/metrics.json
echo "libavif-still-roundtrip: OK"
