#!/usr/bin/env bash
# Rasterise the SVG title card with resvg and loop it into a 3-second MP4 with FFmpeg.
# Verifies the frame hash and the container metadata against expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
resvg --width 1080 title-card.svg output/title-card.png
ffmpeg -y -loglevel error -loop 1 -framerate 30 -i output/title-card.png -t 3 -c:v libx264 -pix_fmt yuv420p -movflags +faststart output/title-card.mp4
shasum -a 256 output/title-card.png | cut -d' ' -f1 > output/title-card.png.sha256
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,pix_fmt -show_entries format=duration -of json output/title-card.mp4 > output/ffprobe.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/title-card.png.sha256 output/ffprobe.json expected/
  echo "recorded expected/"
  exit 0
fi
diff <(cat expected/title-card.png.sha256) output/title-card.png.sha256 && diff expected/ffprobe.json output/ffprobe.json && echo "native-svg: OK"
