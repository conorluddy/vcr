#!/usr/bin/env bash
# three-vrm: a VRM 1.0 avatar seeked from t; right arm and blink posed by closed-form functions, spring bones disabled.
set -euo pipefail
cd "$(dirname "$0")"

# Model: not in the npm package. Downloaded at a pinned upstream commit into the git-ignored output/, verified by sha256.
MODEL_URL="https://raw.githubusercontent.com/pixiv/three-vrm/5a3242b66124386c32b085c6693d9059040e72e5/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm"
MODEL_SHA256="12c2b97e95e700783a6a550dc0eee2d7880aeedccef9ae67bc4c5a2f0f2631a2"
MODEL="output/vrm/VRM1_Constraint_Twist_Sample.vrm"

mkdir -p output/vrm
if [[ ! -f "$MODEL" ]]; then
  curl -fsSL -o "$MODEL.partial" "$MODEL_URL"
  mv "$MODEL.partial" "$MODEL"
fi
if ! echo "$MODEL_SHA256  $MODEL" | shasum -a 256 -c >/dev/null 2>&1; then
  echo "three-vrm-capture: sha256 mismatch for $MODEL (expected $MODEL_SHA256); delete the file to re-download" >&2
  exit 1
fi

pnpm -s capture > /dev/null
pnpm -s probe > /dev/null

frame_hash() { shasum -a 256 "output/frames/frame-$1.png" | cut -d' ' -f1; }
# ImageMagick prints "<count> (<normalised>)"; keep the count only.
pixel_difference() { { magick compare -metric AE "output/frames/frame-$1.png" "output/frames/frame-$2.png" null: 2>&1 || true; } | awk '{print $1}'; }

summary="$(jq -n --slurpfile report output/report.json \
  --arg h0000 "$(frame_hash 0000)" --arg h0030 "$(frame_hash 0030)" \
  --arg h0045 "$(frame_hash 0045)" --arg h0075 "$(frame_hash 0075)" \
  --arg aeBlink "$(pixel_difference 0045 0075)" --arg aeArm "$(pixel_difference 0000 0030)" \
  --arg cornerAlpha "$(magick output/frames/frame-0030.png -format '%[fx:p{0,0}.a]' info:)" \
  --arg alphaMax "$(magick output/frames/frame-0030.png -alpha extract -format '%[fx:maxima]' info:)" \
  '{frames: $report[0].frames, width: $report[0].width, height: $report[0].height,
    shuffled_matches_sequential: $report[0].shuffled_matches_sequential,
    frame_sha256: {"0000": $h0000, "0030": $h0030, "0045": $h0045, "0075": $h0075},
    pixel_difference: {blink_0045_vs_0075: $aeBlink, arm_0000_vs_0030: $aeArm},
    frame_0030_alpha: {corner_0_0: $cornerAlpha, max: $alphaMax}}')"
printf '%s\n' "$summary" > output/summary.json

# Predeclared checks, asserted before anything is recorded.
check() {
  local name="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "  ok  $name"
  else
    echo "three-vrm-capture: check failed: $name" >&2
    exit 1
  fi
}
check "meta: name, licence URL, redistribution, metaVersion" jq -e '.meta.name == "VRM1_Constraint_Twist_Sample" and .meta.licenseUrl == "https://vrm.dev/licenses/1.0/" and .meta.allowRedistribution == true and .meta.metaVersion == "1"' output/probe.json
check "arm: rest at t=0, 1.0 rad from t=1.0 on" jq -e '[.readings[].rightUpperArmAngleRadians] as $a | $a[0] == 0 and (($a[1] - 1) | fabs) < 0.000001 and (($a[2] - 1) | fabs) < 0.000001 and (($a[3] - 1) | fabs) < 0.000001' output/probe.json
check "arm: right hand moves at least 0.3 m from t=0 to t=1" jq -e '.readings as $r | [range(0; 3) | (($r[0].rightHandWorld[.] - $r[1].rightHandWorld[.]) | . * .)] | add | sqrt >= 0.3' output/probe.json
check "blink: 0 at 0 s, 1 at 1.5 s, 0 at 2.5 s" jq -e '.readings[0].blinkWeight == 0 and .readings[2].blinkWeight == 1 and .readings[3].blinkWeight == 0' output/probe.json
check "spring bones: manager present (its update is never called)" jq -e '[.readings[].springBoneManagerPresent] | all' output/probe.json
check "frames: 90 at 1280x720, shuffled order matches sequential" jq -e '.frames == 90 and .width == 1280 and .height == 720 and .shuffled_matches_sequential == true' output/summary.json
check "hashes: at least two distinct among predeclared frames" jq -e '[.frame_sha256[]] | unique | length >= 2' output/summary.json
check "hashes: frame 0030 equals frame 0075 (same pose, no blink)" jq -e '.frame_sha256["0030"] == .frame_sha256["0075"]' output/summary.json
check "hashes: frame 0045 (blink) differs from frame 0075" jq -e '.frame_sha256["0045"] != .frame_sha256["0075"]' output/summary.json
check "hashes: frame 0000 (rest) differs from frame 0030 (arm up)" jq -e '.frame_sha256["0000"] != .frame_sha256["0030"]' output/summary.json
check "blink-only change: fewer differing pixels than the arm raise" jq -e '(.pixel_difference.blink_0045_vs_0075 | tonumber) > 0 and (.pixel_difference.blink_0045_vs_0075 | tonumber) < (.pixel_difference.arm_0000_vs_0030 | tonumber)' output/summary.json
check "alpha: frame 0030 corner transparent and some pixels opaque" jq -e '(.frame_0030_alpha.corner_0_0 | tonumber) == 0 and (.frame_0030_alpha.max | tonumber) == 1' output/summary.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/summary.json output/probe.json expected/
  echo "recorded expected/"
  exit 0
fi
diff expected/summary.json output/summary.json && diff expected/probe.json output/probe.json && echo "three-vrm-capture: OK ($(jq -r .frames_per_second output/report.json) fps)"
