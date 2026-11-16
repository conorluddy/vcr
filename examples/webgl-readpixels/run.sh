#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$HERE/output" "$HERE/expected"
node "$HERE/check.mjs" "${1:-}"
