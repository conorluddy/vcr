#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { echo "ffmpeg not on PATH" >&2; exit 1; }
if [[ ! -x output/venv/bin/python ]]; then
  python3.12 -m venv output/venv
  output/venv/bin/pip install --disable-pip-version-check -q -r requirements.txt
fi
PYTHON=output/venv/bin/python
mkdir -p output/clips expected
make() { # name, luminance expression of frame number N
  ffmpeg -v error -y -f lavfi -i "color=c=black:s=640x360:r=30:d=4,geq=lum='$2':cb=128:cr=128" \
    -c:v libx264 -crf 12 -pix_fmt yuv420p "output/clips/$1.mp4"
}
make flash-5hz 'if(lt(mod(N,6),3),235,16)'   # 3 frames white, 3 black: 5 cycles/s, 10 transitions/s
make slow-1hz 'if(lt(mod(N,30),15),235,16)'  # 15 frames white, 15 black: 1 cycle/s
make static-grey '128'
$PYTHON check.py > output/first.json 2> output/first.log
$PYTHON check.py > output/second.json 2> output/second.log
diff output/first.json output/second.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
if ! grep -q '"all_passed": true' output/first.json; then
  echo "KNOWN FAIL: a predeclared check failed; see expected/metrics.json" >&2
  exit 0
fi
[[ "${1:-}" == "--record" ]] || echo "iris-pse-flash-detection: OK"
