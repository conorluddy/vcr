#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MODE=
if [ "$#" -gt 0 ]; then MODE=$1; fi
mkdir -p "$HERE/output" "$HERE/expected"
node "$HERE/check.mjs" "$MODE"
