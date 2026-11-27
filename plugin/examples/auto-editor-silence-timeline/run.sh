#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
[[ -x output/venv/bin/auto-editor ]] || { echo "Create output/venv and pip install -r requirements.txt as in README.md; no automatic install." >&2; exit 1; }
PYTHON=output/venv/bin/python
mkdir -p output expected
"$PYTHON" -m pip --disable-pip-version-check freeze > output/dependencies.txt
# 2 s 440 Hz tone, 3 s silence, 2 s 660 Hz tone; 320x240 testsrc video at 30 fps, 7 s
ffmpeg -v error -y -f lavfi -i "sine=frequency=440:duration=2" -f lavfi -i "anullsrc=r=48000:cl=mono:d=3" \
  -f lavfi -i "sine=frequency=660:duration=2" -f lavfi -i "testsrc=size=320x240:rate=30:duration=7" \
  -filter_complex "[0][1][2]concat=n=3:v=0:a=1,aresample=48000[a]" -map 3:v -map "[a]" \
  -c:v libx264 -pix_fmt yuv420p -c:a aac -t 7 output/in.mp4
# The PyPI package fetches its native binary on first use and prints progress; warm it up so the checked runs see only the version.
output/venv/bin/auto-editor --version > /dev/null 2>&1 || true
"$PYTHON" check.py > output/first.json
"$PYTHON" check.py > output/second.json
diff output/first.json output/second.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
grep -q '"all_passed": true' output/first.json || { echo "a predeclared check failed; see output/first.json" >&2; exit 1; }
[[ "${1:-}" == "--record" ]] || echo "auto-editor-silence-timeline: OK"
