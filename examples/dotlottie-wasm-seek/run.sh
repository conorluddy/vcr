#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm ci --ignore-scripts --no-audit --no-fund
mkdir -p output
cp node_modules/@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm output/dotlottie-player.wasm
python3 - <<'PY'
from pathlib import Path
import json, zipfile
root = Path('source')
out = Path('output/owned-animation.lottie')
with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
    archive.write(root / 'manifest.json', 'manifest.json')
    archive.write(root / 'animation.json', 'animations/moving-rect.json')
PY
./node_modules/.bin/esbuild browser.js --bundle --format=esm --outfile=output/app.js
node capture.mjs "$@"
