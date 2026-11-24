#!/usr/bin/env bash
# Render 48 frames of a moving ball from videotestsrc at fixed 640x360 24/1 through videoconvert, timeoverlay
# and x264enc into an MP4 with gst-launch-1.0, then check the file with ffprobe and gst-discoverer-1.0 against
# expected/, count decoded frames by framemd5, and compare the file hash with the recorded one.
# Output is ignored; only facts are retained.
set -euo pipefail
cd "$(dirname "$0")"
FRAMES=48 FPS=24 W=640 H=360
mkdir -p output/frames expected
rm -f output/pipeline.mp4
gst-launch-1.0 -e videotestsrc num-buffers=$FRAMES pattern=ball \
  ! "video/x-raw,width=$W,height=$H,framerate=$FPS/1" \
  ! videoconvert ! "video/x-raw,format=I420" ! timeoverlay ! x264enc threads=1 ! h264parse ! mp4mux \
  ! filesink location=output/pipeline.mp4 > output/gst-launch.log 2>&1
if grep -q ERROR output/gst-launch.log; then echo "gst-launch-1.0 logged an ERROR, see output/gst-launch.log"; exit 1; fi
ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,nb_read_frames,duration \
  -show_entries format=format_name,duration -of json output/pipeline.mp4 > output/ffprobe.json
gst-discoverer-1.0 output/pipeline.mp4 > output/discoverer.txt 2>&1
# Keep the discoverer facts the claim names: container, codec, size, frame rate and duration.
DISCOVERER_JSON=$(jq -n \
  --arg container "$(sed -n 's/^ *container #0: *//p' output/discoverer.txt | head -1)" \
  --arg codec "$(sed -n 's/^ *video #[0-9]*: *//p' output/discoverer.txt | head -1 | sed 's/ *(.*//')" \
  --arg width "$(sed -n 's/^ *Width: *//p' output/discoverer.txt | head -1)" \
  --arg height "$(sed -n 's/^ *Height: *//p' output/discoverer.txt | head -1)" \
  --arg framerate "$(sed -n 's/^ *Frame rate: *//p' output/discoverer.txt | head -1)" \
  --arg duration "$(sed -n 's/^ *Duration: *//p' output/discoverer.txt | head -1)" \
  '{container: $container, codec: $codec, width: $width, height: $height, framerate: $framerate, duration: $duration}')
echo "$DISCOVERER_JSON" > output/discoverer.json
ffmpeg -v error -y -i output/pipeline.mp4 -f framemd5 output/framemd5.txt
FRAME_COUNT=$(grep -vc '^#' output/framemd5.txt || true)
DISTINCT_FRAME_HASHES=$(grep -v '^#' output/framemd5.txt | awk -F', ' '{print $NF}' | sort -u | wc -l | tr -d ' ')
FRAMEMD5_JSON=$(jq -n --argjson frames "$FRAME_COUNT" --argjson distinct "$DISTINCT_FRAME_HASHES" \
  '{frame_count: $frames, distinct_frame_hashes: $distinct}')
echo "$FRAMEMD5_JSON" > output/framemd5.json
SHA=$(shasum -a 256 output/pipeline.mp4 | cut -d' ' -f1)
ffmpeg -v error -y -i output/pipeline.mp4 -start_number 0 output/frames/frame-%04d.png
if [[ "${1:-}" == "--record" ]]; then
  cp output/ffprobe.json output/discoverer.json expected/
  echo "$FRAMEMD5_JSON" > expected/framemd5.json
  echo "$SHA  pipeline.mp4" > expected/pipeline.sha256
  echo "recorded expected/"; exit 0
fi
# Facts only: ffprobe's format fields and the stream fields, compared with the recorded expected/ values.
diff <(jq -S '{streams, format: {format_name, duration}}' expected/ffprobe.json) \
     <(jq -S '{streams, format: {format_name, duration}}' output/ffprobe.json)
diff <(jq -S . expected/discoverer.json) <(jq -S . output/discoverer.json)
diff <(jq -S . expected/framemd5.json) <(jq -S . output/framemd5.json)
RECORDED_SHA=$(cut -d' ' -f1 expected/pipeline.sha256)
echo "sha256=$SHA recorded_sha256=$RECORDED_SHA identical=$([[ "$SHA" == "$RECORDED_SHA" ]] && echo yes || echo no)"
[[ "$SHA" == "$RECORDED_SHA" ]] || { echo "gstreamer-pipeline-encode: rerun bytes differ from the recorded file"; exit 2; }
echo "gstreamer-pipeline-encode: OK"
