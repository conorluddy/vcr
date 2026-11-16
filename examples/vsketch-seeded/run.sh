#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p output
uv sync --locked --project . --python 3.12
MPLCONFIGDIR=output/mpl uv run --locked --project . vsk save --seed 1701 --destination output sketch.py
MPLCONFIGDIR=output/mpl uv run --locked --project . vsk save --seed 1701 --destination output sketch.py >/dev/null
uv run --locked --project . python check_output.py ${1:-}
