#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MODE=
if [ "$#" -gt 0 ]; then MODE=$1; fi
mkdir -p "$HERE/output" "$HERE/expected"
VERSION=$(c2patool -V 2>&1 | tail -n 1 | tr -d '\r')
if [ "$VERSION" != "c2patool 0.29.0" ]; then echo "Expected c2patool 0.29.0, got: $VERSION" >&2; exit 1; fi
python3 "$HERE/make_fixture.py"
c2patool "$HERE/output/source.png" --manifest "$HERE/output/manifest.json" \
  --output "$HERE/output/signed.png" --force > "$HERE/output/signing-report.json"
c2patool "$HERE/output/signed.png" > "$HERE/output/readback.json"
python3 "$HERE/check.py" "$VERSION" "$MODE"
