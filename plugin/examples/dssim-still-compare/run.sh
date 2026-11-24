#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
rm -rf output/input output/degraded output/scores output/scores-repeat output/metrics.json output/versions.txt output/dssim-help.txt
python3 generate_frames.py output/input

dssim --help > output/dssim-help.txt 2>&1
magick -version | head -n 1 > output/versions.txt

mkdir -p output/degraded
for quality in 90 50 10; do
  magick output/input/base.png -quality "$quality" "output/degraded/q$quality.jpg"
  magick "output/degraded/q$quality.jpg" -depth 8 -strip "PNG24:output/degraded/q$quality.png"
done

base="output/input/base.png"
degraded="output/degraded/q90.png output/degraded/q50.png output/degraded/q10.png"
reversed="output/degraded/q10.png output/degraded/q50.png output/degraded/q90.png"

score_run() {
  local run_dir="$1"
  mkdir -p "$run_dir/maps"
  dssim "$base" "$base" > "$run_dir/self.txt"
  dssim "$base" $degraded > "$run_dir/sequential.txt"
  dssim "$base" $reversed > "$run_dir/reversed.txt"
  for quality in 90 50 10; do
    dssim -o "$run_dir/maps/q$quality.png" "$base" "output/degraded/q$quality.png" > /dev/null
  done
}

score_run output/scores
score_run output/scores-repeat

python3 check_output.py "$base" output/degraded output/scores output/scores-repeat output/dssim-help.txt output/versions.txt output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "dssim-still-compare: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "dssim-still-compare: OK"
