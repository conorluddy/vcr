#!/usr/bin/env bash
# mannequin-js: a procedural figure seeked from t; torso bend, right arm raise and left knee bend set by closed-form functions of t.
set -euo pipefail
cd "$(dirname "$0")"

pnpm -s capture > /dev/null
pnpm -s probe > /dev/null

frame_hash() { shasum -a 256 "output/frames/frame-$1.png" | cut -d' ' -f1; }
# ImageMagick prints "<count> (<normalised>)"; keep the count only.
pixel_difference() { { magick compare -metric AE "output/frames/frame-$1.png" "output/frames/frame-$2.png" null: 2>&1 || true; } | awk '{print $1}'; }

summary="$(jq -n --slurpfile report output/report.json \
  --arg h0000 "$(frame_hash 0000)" --arg h0030 "$(frame_hash 0030)" \
  --arg h0045 "$(frame_hash 0045)" --arg h0075 "$(frame_hash 0075)" \
  --arg aeKnee "$(pixel_difference 0045 0075)" --arg aeTorsoArm "$(pixel_difference 0000 0030)" \
  --arg cornerAlpha "$(magick output/frames/frame-0030.png -format '%[fx:p{0,0}.a]' info:)" \
  --arg alphaMax "$(magick output/frames/frame-0030.png -alpha extract -format '%[fx:maxima]' info:)" \
  '{frames: $report[0].frames, width: $report[0].width, height: $report[0].height,
    shuffled_matches_sequential: $report[0].shuffled_matches_sequential,
    frame_sha256: {"0000": $h0000, "0030": $h0030, "0045": $h0045, "0075": $h0075},
    pixel_difference: {knee_0045_vs_0075: $aeKnee, torso_and_arm_0000_vs_0030: $aeTorsoArm},
    frame_0030_alpha: {corner_0_0: $cornerAlpha, max: $alphaMax}}')"
printf '%s\n' "$summary" > output/summary.json

# Predeclared checks, asserted before anything is recorded.
check() {
  local name="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "  ok  $name"
  else
    echo "mannequin-js-pose-capture: check failed: $name" >&2
    exit 1
  fi
}
# readings: [0] t=0 s, [1] t=1.0 s, [2] t=1.5 s, [3] t=2.5 s
check "figure: built with a positive height in library units" jq -e '.meta.figureHeightUnits > 0' output/probe.json
check "torso bend: 0 at 0 s, 30 deg at 1.0, 1.5 and 2.5 s (library reads back the value set)" jq -e '[.readings[].torsoBendDegrees] as $a | ($a[0] | fabs) < 0.000001 and (($a[1] - 30) | fabs) < 0.000001 and (($a[2] - 30) | fabs) < 0.000001 and (($a[3] - 30) | fabs) < 0.000001' output/probe.json
check "right arm raise: -5 deg at 0 s, 61.6667 deg at 1.0 s, 85 deg at 1.5 and 2.5 s" jq -e '[.readings[].rightArmRaiseDegrees] as $a | (($a[0] + 5) | fabs) < 0.000001 and (($a[1] - 61.666667) | fabs) < 0.001 and (($a[2] - 85) | fabs) < 0.000001 and (($a[3] - 85) | fabs) < 0.000001' output/probe.json
check "left knee bend: 0 deg at 0, 1.0 and 1.5 s, 50 deg at 2.5 s" jq -e '[.readings[].leftKneeBendDegrees] as $a | ($a[0] | fabs) < 0.000001 and ($a[1] | fabs) < 0.000001 and ($a[2] | fabs) < 0.000001 and (($a[3] - 50) | fabs) < 0.000001' output/probe.json
check "wrist: right wrist world position moves at least 1.0 library unit from 0 s to 1.5 s" jq -e '.readings as $r | [range(0; 3) | (($r[0].rightWristWorld[.] - $r[2].rightWristWorld[.]) | . * .)] | add | sqrt >= 1.0' output/probe.json
check "frames: 90 at 1280x720, shuffled order matches sequential" jq -e '.frames == 90 and .width == 1280 and .height == 720 and .shuffled_matches_sequential == true' output/summary.json
check "hashes: all four predeclared frames (0000, 0030, 0045, 0075) distinct" jq -e '[.frame_sha256[]] | unique | length == 4' output/summary.json
check "pose: knee-only change (0045 vs 0075) differs in pixels" jq -e '(.pixel_difference.knee_0045_vs_0075 | tonumber) > 0' output/summary.json
check "pose: knee-only change differs in fewer pixels than the torso and arm change" jq -e '(.pixel_difference.knee_0045_vs_0075 | tonumber) < (.pixel_difference.torso_and_arm_0000_vs_0030 | tonumber)' output/summary.json
check "alpha: frame 0030 corner transparent and some pixels opaque" jq -e '(.frame_0030_alpha.corner_0_0 | tonumber) == 0 and (.frame_0030_alpha.max | tonumber) == 1' output/summary.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/summary.json output/probe.json expected/
  echo "recorded expected/"
  exit 0
fi
diff expected/summary.json output/summary.json && diff expected/probe.json output/probe.json && echo "mannequin-js-pose-capture: OK ($(jq -r .frames_per_second output/report.json) fps)"
