#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm ci --ignore-scripts --no-audit --no-fund
mkdir -p output
./node_modules/.bin/esbuild app.js --bundle --platform=browser --format=esm --outfile=output/app.js
node capture.mjs "$@"
