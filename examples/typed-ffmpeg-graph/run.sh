#!/usr/bin/env bash
# Build a typed-ffmpeg filter graph, compile it in two separate processes, render it with system
# FFmpeg, and diff the command, ffprobe facts and rejection message against expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
if [[ ! -x output/venv/bin/python ]]; then
  python3 -m venv output/venv
  output/venv/bin/pip install --quiet -r requirements.txt
fi
PYTHON=output/venv/bin/python
"$PYTHON" graph.py compile > output/command-a.json
"$PYTHON" graph.py compile > output/command-b.json
cmp output/command-a.json output/command-b.json
"$PYTHON" graph.py invalid > output/invalid.json
rm -f output/graph.mp4
"$PYTHON" graph.py render
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate,nb_frames -show_entries format=duration -of json output/graph.mp4 > output/ffprobe.json
ffmpeg -v error -y -i output/graph.mp4 -f framemd5 output/framemd5.txt
if [[ "${1:-}" == "--record" ]]; then
  cp output/command-a.json expected/command.json
  cp output/invalid.json expected/invalid.json
  cp output/ffprobe.json expected/ffprobe.json
  echo "recorded expected/"
  exit 0
fi
diff <(jq -S . expected/command.json) <(jq -S . output/command-a.json)
diff <(jq -S . expected/invalid.json) <(jq -S . output/invalid.json)
# Media facts only: ffprobe layout varies between versions (see ffmpeg-assembly).
diff <(jq -S '{streams, format}' expected/ffprobe.json) <(jq -S '{streams, format}' output/ffprobe.json)
frames=$(grep -vc '^#' output/framemd5.txt)
distinct=$(grep -v '^#' output/framemd5.txt | awk '{print $NF}' | sort -u | wc -l | tr -d ' ')
if [[ "$frames" != 48 ]]; then echo "frame count $frames, expected 48"; exit 1; fi
if (( distinct < 2 )); then echo "distinct frame hashes $distinct, expected at least 2"; exit 1; fi
echo "typed-ffmpeg-graph: OK"
