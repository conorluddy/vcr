#!/bin/sh
set -eu
cd "$(dirname "$0")"
for tool in autotrace resvg; do
  command -v "$tool" >/dev/null || { echo "$tool is not on PATH; run: brew install $tool" >&2; exit 1; }
done
version=$(autotrace --version 2>&1 | sed -E -n 's/^AutoTrace version ([0-9]+(\.[0-9]+)+)\..*/\1/p')
test "$version" = "0.31.13" || { echo "expected AutoTrace 0.31.13, got '$version'; run: brew install autotrace" >&2; exit 1; }
mkdir -p output
python3 -I make_input.py
autotrace -output-format svg -output-file output/solid-trace.svg output/solid.png
autotrace -centerline -preserve-width -output-format svg -output-file output/strokes-trace.svg output/strokes.png
autotrace -centerline -preserve-width -output-format svg -output-file output/repeat.svg output/strokes.png
cmp output/strokes-trace.svg output/repeat.svg
if [ "${1:-}" = "--record" ]; then python3 -W ignore check_output.py --record; else python3 -W ignore check_output.py; fi
echo "autotrace-centerline: OK"
