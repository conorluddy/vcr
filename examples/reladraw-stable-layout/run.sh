#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected

# Local dependency: fail, never skip, when it is missing.
pnpm install --frozen-lockfile=false >/dev/null
BIN=./node_modules/.bin/reladraw
[[ -x "$BIN" ]] || { echo "reladraw-stable-layout: reladraw missing; run pnpm install" >&2; exit 1; }

"$BIN" --version > output/version.txt
"$BIN" render v1.reladraw -o output/v1.svg >/dev/null
"$BIN" render v2.reladraw -o output/v2.svg >/dev/null
"$BIN" render v2.reladraw -o output/v2-repeat.svg >/dev/null
cmp output/v2.svg output/v2-repeat.svg
"$BIN" check v1.reladraw
"$BIN" check v2.reladraw
python3 check-output.py output/v1.svg output/v2.svg output/version.txt output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "reladraw-stable-layout: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "reladraw-stable-layout: OK"
