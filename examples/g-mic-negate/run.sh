#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
gmic source.pgm -negate -o output/negated.pgm
gmic source.pgm -negate -o output/repeat.pgm
python3 check_output.py "${1:-}"
