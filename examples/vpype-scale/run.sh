#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p output
vpype read source.svg scale 2 2 translate 10 10 write --dont-set-date output/scaled.svg
shasum -a 256 output/scaled.svg | cut -d ' ' -f 1 > output/first.sha256
vpype read source.svg scale 2 2 translate 10 10 write --dont-set-date output/scaled.svg
shasum -a 256 output/scaled.svg | cut -d ' ' -f 1 > output/second.sha256
cmp output/first.sha256 output/second.sha256
python3 check_output.py ${1:-}
