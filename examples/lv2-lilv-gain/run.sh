#!/bin/sh
set -eu
cd "$(dirname "$0")"
MODE=${1:-}
if [ -n "$MODE" ] && [ "$MODE" != "--record" ]; then
  echo "usage: ./run.sh [--record]" >&2
  exit 2
fi
python3 generate.py
exec python3 run.py "$MODE"
