#!/usr/bin/env bash
# Background-render one frame with Blender from the macOS app bundle and verify its dimensions and alpha.
set -euo pipefail
cd "$(dirname "$0")"
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
[[ -x "$BLENDER" ]] || { echo "Blender not found at $BLENDER; set BLENDER=/path/to/blender" >&2; exit 1; }
mkdir -p output
"$BLENDER" -b --python render.py -- "$PWD/output/cube.png" 2>&1 | grep -E "rendered|Error|error" || true
magick identify -format "%w %h %[channels]\n" output/cube.png > output/identify.txt
"$BLENDER" --version | head -1 > output/blender-version.txt
if [[ "${1:-}" == "--record" ]]; then cp output/identify.txt expected/; echo "recorded expected/"; exit 0; fi
diff expected/identify.txt output/identify.txt && echo "blender-smoke: OK ($(cat output/blender-version.txt))"
