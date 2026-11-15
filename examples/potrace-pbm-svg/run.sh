#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p output
python3 make_input.py
version=$(potrace --version | sed -E -n '1s/^potrace ([0-9]+(\.[0-9]+)+)\..*/\1/p')
test "$version" = "1.16"
potrace --svg --tight --output output/trace.svg source.pbm
cp output/trace.svg output/first.svg
potrace --svg --tight --output output/repeat.svg source.pbm
cmp output/first.svg output/repeat.svg
if [ "${1:-}" = "--record" ]; then
  python3 check_output.py --record
else
  python3 check_output.py
fi
