#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
VENV="$PWD/output/venv"
[[ -x "$VENV/bin/claude-real-video" ]] || { echo "Create output/venv and pip install claude-real-video==0.10.7 as in README.md; no automatic install." >&2; exit 1; }
export CRV_NO_MEMORY=1 CRV_NO_HINT=1 CRV_MEMORY_DB="$PWD/output/memory.db"
mkdir -p output
"$VENV/bin/python" -m pip --disable-pip-version-check freeze > output/dependencies.txt
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -t 2 -i 'testsrc2=s=320x240:r=24' \
  -f lavfi -t 2 -i 'mandelbrot=s=320x240:r=24' \
  -f lavfi -t 2 -i 'smptebars=s=320x240:r=24' \
  -filter_complex '[0:v][1:v][2:v]concat=n=3:v=1:a=0,format=yuv420p[v]' \
  -map '[v]' -frames:v 144 -c:v libx264 -preset ultrafast -crf 0 -g 144 -an output/three-shots.mp4
ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=width,height,avg_frame_rate,nb_read_frames -of json output/three-shots.mp4 > output/probe.json
for RUN in run-a run-b; do
  rm -rf "output/$RUN"
  "$VENV/bin/claude-real-video" output/three-shots.mp4 -o "output/$RUN" --no-transcribe --scene 0.30 --fps-floor 1000 --frame-width 320 > "output/$RUN.log" 2>&1 || { cat "output/$RUN.log" >&2; exit 1; }
done
"$VENV/bin/python" check.py output > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "claude-real-video-keyframes: OK"
