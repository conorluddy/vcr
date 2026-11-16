#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MODE=
if [ "$#" -gt 0 ]; then MODE=$1; fi
mkdir -p "$HERE/output" "$HERE/expected"
python3 "$HERE/make_tone.py"
rm -f "$HERE/output/source.m4a" "$HERE/output/transcoded.m4a"
ffmpeg -hide_banner -loglevel error -y -i "$HERE/output/tone.wav" -map_metadata -1 \
  -c:a aac -b:a 96k -ar 48000 -ac 1 -movflags +faststart "$HERE/output/source.m4a"
ffmpeg -version | sed -n '1p' > "$HERE/output/source-ffmpeg-version.txt"
node "$HERE/check.mjs" "$MODE"
