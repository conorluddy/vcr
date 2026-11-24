#!/usr/bin/env bash
# bvh-mocap: BVHLoader parses a hand-written BVH into a skeleton and an AnimationClip, played by AnimationMixer.setTime(t) per seek.
# probe.ts asserts the skeleton, clip, track layout and sampled joint rotations against the BVH file; capture checks determinism and alpha.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output

pnpm -s probe > /dev/null
pnpm -s capture > /dev/null

frame_hash() { shasum -a 256 "output/frames/frame-$1.png" | cut -d' ' -f1; }
# ImageMagick prints "<count> (<normalised>)"; keep the count only.
pixel_difference() { { magick compare -metric AE "output/frames/frame-$1.png" "output/frames/frame-$2.png" null: 2>&1 || true; } | awk '{print $1}'; }

summary="$(jq -n --slurpfile report output/report.json \
  --arg h0000 "$(frame_hash 0000)" --arg h0007 "$(frame_hash 0007)" \
  --arg h0015 "$(frame_hash 0015)" --arg h0029 "$(frame_hash 0029)" \
  --arg cornerAlpha "$(magick output/frames/frame-0015.png -format '%[fx:p{0,0}.a]' info:)" \
  --arg alphaMax "$(magick output/frames/frame-0015.png -alpha extract -format '%[fx:maxima]' info:)" \
  '{frames: $report[0].frames, width: $report[0].width, height: $report[0].height,
    shuffled_matches_sequential: $report[0].shuffled_matches_sequential,
    frame_sha256: {"0000": $h0000, "0007": $h0007, "0015": $h0015, "0029": $h0029},
    frame_0015_alpha: {corner_0_0: $cornerAlpha, max: $alphaMax}}')"
printf '%s\n' "$summary" > output/summary.json

# Predeclared checks, asserted before anything is recorded. The probe's own checks ran above under set -e.
check() {
  local name="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "  ok  $name"
  else
    echo "bvh-mocap-playback: check failed: $name" >&2
    exit 1
  fi
}
check "frames: 30 at 1280x720, shuffled order matches sequential" jq -e '.frames == 30 and .width == 1280 and .height == 720 and .shuffled_matches_sequential == true' output/summary.json
check "hashes: at least two distinct among predeclared frames" jq -e '[.frame_sha256[]] | unique | length >= 2' output/summary.json
check "distinct poses differ: frame 0000 vs 0015" jq -e '.frame_sha256["0000"] != .frame_sha256["0015"]' output/summary.json
check "distinct poses differ: frame 0015 vs 0029" jq -e '.frame_sha256["0015"] != .frame_sha256["0029"]' output/summary.json
check "alpha: frame 0015 corner transparent and some pixels opaque" jq -e '(.frame_0015_alpha.corner_0_0 | tonumber) == 0 and (.frame_0015_alpha.max | tonumber) == 1' output/summary.json

if [[ "${1:-}" == "--record" ]]; then
  mkdir -p expected
  cp output/summary.json output/probe.json expected/
  echo "recorded expected/"
  exit 0
fi
diff expected/summary.json output/summary.json && diff expected/probe.json output/probe.json && echo "bvh-mocap-playback: OK ($(jq -r .frames_per_second output/report.json) fps)"
