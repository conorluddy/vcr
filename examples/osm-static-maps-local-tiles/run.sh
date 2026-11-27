#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PUPPETEER_EXECUTABLE_PATH="${PUPPETEER_EXECUTABLE_PATH:-$HOME/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing}"
[[ -x "$PUPPETEER_EXECUTABLE_PATH" ]] || { echo "FAIL: set PUPPETEER_EXECUTABLE_PATH to a Chromium/Chrome binary" >&2; exit 1; }
node render.mjs
first=$(shasum -a 256 output/map.png)
node render.mjs
[[ "$(shasum -a 256 output/map.png)" == "$first" ]] || { echo "FAIL: PNG differs between runs" >&2; exit 1; }
node check.mjs
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: osm-static-maps-local-tiles"
