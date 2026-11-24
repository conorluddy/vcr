#!/usr/bin/env bash
# Run a VapourSynth script with vspipe, check the frames it yields against expected/, and pipe one run to FFmpeg.
# Exercises core functions only: BlankClip, FrameEval, Merge, Splice and resize.Bicubic to YUV420P8.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output/frames

vspipe --info scene.vpy output/info.txt
vspipe -c y4m scene.vpy output/sequential.y4m
vspipe -c y4m scene.vpy output/rerun.y4m

# Each range is a separate vspipe process, requested out of the sequential order.
for range in 60-71 0-11 36-47 24-35; do
  vspipe -c y4m -s "${range%-*}" -e "${range#*-}" scene.vpy "output/range-$range.y4m"
done

vspipe -c y4m scene.vpy - | ffmpeg -loglevel error -y -i - -c:v libx264 -pix_fmt yuv420p output/vs.mp4
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate,nb_read_frames -of json output/vs.mp4 > output/ffprobe.json

ffmpeg -loglevel error -y -i output/sequential.y4m -start_number 0 output/frames/frame-%04d.png

if [[ "${1:-}" == "--record" ]]; then
  python3 -I check.py --record
  echo "recorded expected/hashes.json"
  exit 0
fi

python3 -I check.py
echo "vapoursynth-script-frames: OK"
