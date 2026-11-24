#!/usr/bin/env bash
# Generate a 48-frame testsrc2 Y4M clip with FFmpeg, encode it to AV1 IVF with SvtAv1EncApp at a fixed
# preset and CRF, then check the IVF with ffprobe against expected/ and the decoded output against the
# source by PSNR (floor in expected/quality.json). Output is ignored; only facts are retained.
set -euo pipefail
cd "$(dirname "$0")"
FRAMES=48 FPS=24 SIZE=1280x720 PRESET=8 CRF=35
mkdir -p output
ffmpeg -y -loglevel error -f lavfi -i "testsrc2=size=${SIZE}:rate=${FPS}" -frames:v $FRAMES -pix_fmt yuv420p output/source.y4m
SvtAv1EncApp -i output/source.y4m -b output/encoded.ivf --preset $PRESET --crf $CRF > output/svt-av1.log 2>&1
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,width,height,nb_read_frames,pix_fmt -of json output/encoded.ivf > output/ffprobe.json
ffmpeg -y -loglevel error -i output/encoded.ivf -pix_fmt yuv420p output/decoded.y4m
# psnr prints its summary at info level; the last "average:" value is the whole-frame PSNR in dB.
ffmpeg -hide_banner -nostats -i output/decoded.y4m -i output/source.y4m -lavfi psnr -f null - > output/psnr.log 2>&1
PSNR_DB=$(grep -o 'average:[0-9.inf]*' output/psnr.log | tail -1 | cut -d: -f2)
SHA=$(shasum -a 256 output/encoded.ivf | cut -d' ' -f1)
if [[ "${1:-}" == "--record" ]]; then
  cp output/ffprobe.json expected/
  echo "$SHA  encoded.ivf" > expected/encoded.sha256
  echo "recorded expected/"; exit 0
fi
# Compare the video stream facts only. Byte identity is reported, not gated.
diff <(jq -S '.streams' expected/ffprobe.json) <(jq -S '.streams' output/ffprobe.json)
jq -n --argjson psnr "$PSNR_DB" --slurpfile q expected/quality.json \
  -e '$psnr >= $q[0].psnr_average_db_min' > /dev/null || { echo "psnr ${PSNR_DB} dB is below the predeclared floor"; exit 1; }
RECORDED_SHA=$(cut -d' ' -f1 expected/encoded.sha256)
echo "psnr_average_db=$PSNR_DB encoded_sha256=$SHA recorded_sha256=$RECORDED_SHA identical=$([[ "$SHA" == "$RECORDED_SHA" ]] && echo yes || echo no)"
echo "svt-av1-encode: OK"
