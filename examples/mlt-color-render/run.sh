#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
version=$(melt -version | sed -n '1s/^melt //p')
[[ "$version" == "7.42.0" ]] || { echo "Expected MLT 7.42.0, found $version" >&2; exit 1; }
rm -rf output
mkdir -p output
melt colour:red out=4 -consumer avformat:output/red.mkv vcodec=ffv1 acodec=none s=64x48 r=25 >output/melt-1.log 2>&1
melt colour:red out=4 -consumer avformat:output/repeat.mkv vcodec=ffv1 acodec=none s=64x48 r=25 >output/melt-2.log 2>&1
python3 verify.py output/red.mkv output/repeat.mkv expected/render.json "$@"
