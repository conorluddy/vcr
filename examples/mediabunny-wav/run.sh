#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
RECORD=""
if [ "${1:-}" = "--record" ]; then RECORD=--record; fi
python3 "$HERE/make_input.py"
node "$HERE/check.mjs" $RECORD
