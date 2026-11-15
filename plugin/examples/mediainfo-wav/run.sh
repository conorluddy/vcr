#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 make_input.py output/input.wav
mediainfo --Output=JSON output/input.wav > output/mediainfo.json
python3 check_output.py output/mediainfo.json "$@"
