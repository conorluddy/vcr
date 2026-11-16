#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MODE=${1:-}
if [ -n "$MODE" ] && [ "$MODE" != "--record" ]; then
  echo "usage: run.sh [--record]" >&2
  exit 2
fi
"$HERE/output/venv/bin/python" "$HERE/run.py" "$MODE"
