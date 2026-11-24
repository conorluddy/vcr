#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
rm -f output/thumb*.png output/composite*.png output/*-time.txt
python3 generate_inputs.py output/inputs

/usr/bin/time -l vips thumbnail output/inputs/large.png output/thumb.png 1024 --height 1024 --size force 2> output/thumbnail-time.txt
/usr/bin/time -l vips composite2 output/thumb.png output/inputs/overlay.png output/composite.png over --x 300 --y 600 2> output/composite-time.txt
vips thumbnail output/inputs/large.png output/thumb-repeat.png 1024 --height 1024 --size force
vips composite2 output/thumb-repeat.png output/inputs/overlay.png output/composite-repeat.png over --x 300 --y 600
cmp output/thumb.png output/thumb-repeat.png
cmp output/composite.png output/composite-repeat.png
vips --version > output/vips-version.txt
python3 check_output.py output/thumb.png output/composite.png output/vips-version.txt output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "libvips-resize-composite: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "libvips-resize-composite: OK"
