#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
VENV="$HERE/output/venv/bin/python"
if [ ! -x "$VENV" ]; then
  echo "Create output/venv with Python 3.12.13 and install requirements.lock first" >&2
  exit 1
fi
if [ -z "${FRAMES_ASSETS:-}" ]; then
  echo "Set FRAMES_ASSETS to the separately obtained licensed Frames asset pack directory" >&2
  exit 1
fi
export FRAMES_CLI=${FRAMES_CLI:-"$HERE/output/source/frames-cli-1.7.0/frames"}
exec "$VENV" "$HERE/run.py" "$@"
