#!/usr/bin/env bash
# Render a 1 s Ranim scene twice, headless, to MP4 + PNG frames + time-mark captures; check geometry and repeatability.
set -euo pipefail
cd "$(dirname "$0")"
MODE=${1:-}
for tool in cargo ffmpeg ffprobe magick; do
  command -v "$tool" >/dev/null || { echo "FAIL: $tool not on PATH" >&2; exit 1; }
done
export CARGO_TARGET_DIR="$PWD/output/target"
cargo build --release --locked --quiet
rm -rf output/r1 output/r2
for run in r1 r2; do
  mkdir -p "output/$run"
  (cd "output/$run" && "$CARGO_TARGET_DIR/release/ranim-scene" >log.txt 2>&1)
done

NAME=turning_square_320x180_12
fails=()
check() { if [ "$2" = "ok" ]; then echo "PASS $1"; else echo "FAIL $1 ($3)"; fails+=("$1"); fi; }
summary() {
  local run=$1 f
  for f in output/$run/out/$NAME-frames/*.png; do
    echo "$(basename "$f") $(shasum -a 256 "$f" | cut -d' ' -f1) $(magick "$f" -trim -format '%wx%h' info:)"
  done
  for f in output/$run/out/$NAME/at-*.png; do
    echo "$(basename "$f") $(shasum -a 256 "$f" | cut -d' ' -f1)"
  done
  ffprobe -v error -count_frames -show_entries stream=codec_name,width,height,r_frame_rate,nb_read_frames,pix_fmt -of csv=p=0 "output/$run/out/$NAME.mp4"
  ffmpeg -v error -i "output/$run/out/$NAME.mp4" -f framemd5 - | grep -v '^#' | cut -d, -f6 | sed 's/^ //'
}
summary r1 > output/r1.txt
summary r2 > output/r2.txt

frames=$(ls output/r1/out/$NAME-frames | wc -l | tr -d ' ')
check "12 PNG frames" "$([ "$frames" = 12 ] && echo ok)" "got $frames"
check "mp4 is h264 320x180 12fps 12 frames" "$(grep -q '^h264,320,180,yuv420p,12/1,12$' output/r1.txt && echo ok)" "see output/r1.txt"
first=$(grep '^0000.png' output/r1.txt | cut -d' ' -f3)
last=$(grep '^0011.png' output/r1.txt | cut -d' ' -f3)
check "square bbox grows 46x46 -> 64x64 (45 degree turn)" "$([ "$first" = 46x46 ] && [ "$last" = 64x64 ] && echo ok)" "$first -> $last"
cap_ok=ok
for pair in 0000:0000 0500:0006 0900:0011; do
  a=$(grep "^at-${pair%%:*}.png" output/r1.txt | cut -d' ' -f2)
  b=$(grep "^${pair##*:}.png" output/r1.txt | cut -d' ' -f2)
  [ "$a" = "$b" ] || cap_ok=no
done
check "captures at 0.0/0.5/0.9 s equal frames 0/6/11" "$cap_ok" "hash mismatch"
check "second run byte-identical (PNG, capture, decoded mp4 hashes)" "$(cmp -s output/r1.txt output/r2.txt && echo ok)" "diff output/r1.txt output/r2.txt"

if [ "$MODE" = "--record" ]; then mkdir -p expected; cp output/r1.txt expected/result.txt; echo "recorded expected/"; fi
if diff expected/result.txt output/r1.txt >/dev/null; then
  echo "result matches expected/result.txt"
else
  echo "FAIL: result differs from expected/result.txt (GPU/adapter or Ranim change)"
  fails+=("expected-diff")
fi
if [ "${#fails[@]}" -gt 0 ]; then
  for f in "${fails[@]}"; do echo "KNOWN FAIL candidate: $f"; done
  if [ -f expected/known-fail.txt ] && [ "$(printf '%s\n' "${fails[@]}")" = "$(cat expected/known-fail.txt)" ]; then
    echo "ranim-render-scene: OK (reproduces recorded KNOWN FAIL)"
    exit 0
  fi
  exit 1
fi
echo "ranim-render-scene: OK"
