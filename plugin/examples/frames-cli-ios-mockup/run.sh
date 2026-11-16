#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
VENV="$HERE/output/venv/bin/python"
MODE=""
ASSETS=${FRAMES_ASSETS:-}
if [ "$#" -gt 0 ]; then
  if [ "$1" = "--record" ]; then
    MODE=--record
    shift
  fi
fi
if [ "$#" -gt 0 ]; then
  [ "$#" -eq 1 ] && [ -z "$ASSETS" ] || { echo "usage: ./run.sh [--record] [asset-directory]" >&2; exit 2; }
  ASSETS=$1
  shift
fi
[ "$#" -eq 0 ] || { echo "usage: ./run.sh [--record] [asset-directory]" >&2; exit 2; }
if [ ! -x "$VENV" ]; then
  echo "Create output/venv with Python 3.12.13 and install requirements.lock first" >&2
  exit 1
fi
if [ -z "$ASSETS" ]; then
  echo "Set FRAMES_ASSETS to the separately obtained licensed Frames asset pack directory" >&2
  exit 1
fi
export FRAMES_ASSETS=$ASSETS
export FRAMES_CLI=${FRAMES_CLI:-"$HERE/output/source/frames-cli-1.7.0/frames"}
exec "$VENV" "$HERE/run.py" "$MODE"
