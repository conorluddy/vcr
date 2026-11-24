#!/usr/bin/env bash
# Generate a 24-frame testsrc2 H.264 MP4 with system ffmpeg, decode it frame by frame with node-av,
# re-encode with node-av's libx264 and check ffprobe fields against predeclared values.
# Diffs facts against expected/metrics.json; --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
rm -f output/input.mp4 output/reencoded.mp4
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=320x240:rate=24" \
  -frames:v 24 -c:v libx264 -pix_fmt yuv420p -movflags +faststart output/input.mp4
ffmpeg -version | sed -n '1p' > output/system-ffmpeg-version.txt
pnpm -s check "$@" > output/run.log 2>&1 || { cat output/run.log >&2; exit 1; }
cat output/run.log
if [[ "${1:-}" == "--record" ]]; then echo "recorded expected/"; exit 0; fi
echo "node-av-decode-encode: OK"
