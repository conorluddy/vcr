#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$HERE/output" "$HERE/expected"
POVRAY_BIN=${POVRAY_BIN:-povray}
VERSION=$($POVRAY_BIN --version 2>&1 | grep -m1 '^POV-Ray')
case "$VERSION" in *3.7.0.10*) ;; *) echo "Expected POV-Ray 3.7.0.10, got: $VERSION" >&2; exit 1 ;; esac
(
  cd "$HERE"
  "$POVRAY_BIN" -D +Iscene.pov +Ooutput/sphere.png +FN +W128 +H96 -A +WT1
)
python3 "$HERE/check.py" "$VERSION" "${1:-}"
