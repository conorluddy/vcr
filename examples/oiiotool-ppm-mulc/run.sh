#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MODE=${1:-}
if [ -n "$MODE" ] && [ "$MODE" != "--record" ]; then
  echo "usage: $0 [--record]" >&2
  exit 2
fi
python3 "$HERE/fixture.py" "$MODE"
