#!/usr/bin/env bash
# Build a numbered PNG sequence with ImageMagick, a 440 Hz tone with FFmpeg, mux them,
# and verify the stream metadata against expected/. Exercises PRD L2-07 duration policy.
set -euo pipefail
cd "$(dirname "$0")"
FRAMES=48 FPS=24 W=320 H=180
mkdir -p output/frames
for ((i=0; i<FRAMES; i++)); do
  f=$(printf "%04d" "$i")
  # Hue advances per frame and a white bar grows 6 px per frame, so any frame can be identified without fonts.
  magick -size ${W}x${H} "xc:hsl($((i*7%360)),60%,30%)" -fill white -draw "rectangle 0,0 $((i*6+6)),20" "output/frames/frame-$f.png"
done
ffmpeg -y -loglevel error \
  -framerate $FPS -i output/frames/frame-%04d.png \
  -f lavfi -i "sine=frequency=440:sample_rate=48000:duration=2" \
  -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 96k -shortest -movflags +faststart output/assembly.mp4
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels -show_entries format=duration -of json output/assembly.mp4 > output/ffprobe.json
if [[ "${1:-}" == "--record" ]]; then cp output/ffprobe.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/ffprobe.json output/ffprobe.json && echo "ffmpeg-assembly: OK"
