#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
version=$(synfig --version 2>&1 | sed -n '1s/^synfig //p' || true)
[[ "$version" == "1.5.5" ]] || { echo "Expected Synfig 1.5.5, found $version" >&2; exit 1; }
rm -rf output
mkdir -p output
synfig --target=png --input-file=scene.sif --output-file=output/first.png --width=160 --height=120 --time=0s --threads=2 --quiet >output/first.log 2>&1
synfig --target=png --input-file=scene.sif --output-file=output/second.png --width=160 --height=120 --time=0s --threads=2 --quiet >output/second.log 2>&1
python3 verify.py output/first.png output/second.png expected/render.json "$@"
