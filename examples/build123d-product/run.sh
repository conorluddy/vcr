#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="${BUILD123D_PYTHON:-../../.cache/build123d-fixture/venv/bin/python}"
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
[[ -x "$PYTHON" ]] || { echo "Set BUILD123D_PYTHON to an environment with build123d 0.13.0; no automatic install." >&2; exit 1; }
[[ -x "$BLENDER" ]] || { echo "Set BLENDER to the Blender executable." >&2; exit 1; }
mkdir -p output
export XDG_CACHE_HOME="$PWD/output/cache"
export IPYTHONDIR="$PWD/output/cache/ipython"
export MPLCONFIGDIR="$PWD/output/cache/matplotlib"
"$PYTHON" -m pip --disable-pip-version-check --no-cache-dir freeze > output/dependencies.txt
"$PYTHON" generate.py > output/generate.log 2>&1 || { cat output/generate.log >&2; exit 1; }
"$BLENDER" -b --factory-startup --python-exit-code 1 --python inspect_blender.py > output/blender.log 2>&1 || { cat output/blender.log >&2; exit 1; }
"$PYTHON" - <<'PY'
import hashlib, json
from pathlib import Path
from PIL import Image
image = Image.open('output/part.png')
assert image.size == (800, 600) and image.mode == 'RGBA'
assert image.getchannel('A').getextrema() == (0, 255)
paths = [Path('generate.py'), Path('inspect_blender.py'), Path('run.sh')]
paths += [p for p in Path('output').iterdir() if p.is_file() and p.name != 'hashes.json']
Path('output/hashes.json').write_text(json.dumps({str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(paths)}, indent=2) + '\n')
PY
echo 'build123d-product: geometry and GLB import checks passed; inspect output/part.png'
