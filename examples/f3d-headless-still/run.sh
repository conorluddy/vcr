#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected

python3 make-input.py output/cube.glb
f3d --version | head -n 1 > output/version.txt

# Fixed options for every still: explicit backend, no user config or cache, fixed size and camera.
render_still() {
  local output_png="$1"
  local camera_position="$2"
  f3d output/cube.glb \
    --no-config --no-cache \
    --rendering-backend auto \
    --output "$output_png" \
    --resolution 320,240 \
    --no-background \
    --coloring-mode=material \
    --camera-position "$camera_position" \
    --camera-focal-point 0,0,0 \
    --camera-view-up 0,1,0 \
    --camera-view-angle 30 \
    --verbose=info \
    > "$output_png.log" 2>&1
}

render_still output/view-a.png 2,1.5,2.5
render_still output/view-b.png 0,0,3
render_still output/view-a-after-b.png 2,1.5,2.5
python3 check-output.py output/version.txt output/view-a.png output/view-b.png output/view-a-after-b.png output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "f3d-headless-still: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "f3d-headless-still: OK"
