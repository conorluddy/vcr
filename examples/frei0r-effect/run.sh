#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

melt_version=$(melt -version | sed -n '1s/^melt //p')
[[ "$melt_version" == "7.42.0" ]] || { echo "Expected MLT 7.42.0, found $melt_version" >&2; exit 1; }
frei0r_version=$(brew list --versions frei0r | awk '{print $2}')
[[ "$frei0r_version" == "3.7.1" ]] || { echo "Expected frei0r 3.7.1, found $frei0r_version" >&2; exit 1; }

export FREI0R_PATH="$(brew --prefix)/lib/frei0r-1"
for plugin in invert0r brightness; do
  [[ -f "$FREI0R_PATH/$plugin.so" ]] || { echo "Missing $FREI0R_PATH/$plugin.so; run brew install frei0r" >&2; exit 1; }
done

rm -rf output
mkdir -p output
python3 verify.py make-input output/quad.ppm

render_variant() {
  local variant=$1
  shift
  for run in a b; do
    melt output/quad.ppm out=0 "$@" -consumer "avformat:output/$variant-$run.rgba" f=rawvideo pix_fmt=rgba s=64x48 r=25 >"output/$variant-$run.log" 2>&1
  done
}

render_variant control
render_variant invert -filter frei0r.invert0r
render_variant invert2 -filter frei0r.invert0r -filter frei0r.invert0r
render_variant bright025 -filter frei0r.brightness 0=0.25
render_variant bright050 -filter frei0r.brightness 0=0.5
render_variant bright075 -filter frei0r.brightness 0=0.75

python3 verify.py check output expected/render.json "$melt_version" "$frei0r_version" "$@"
