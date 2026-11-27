#!/usr/bin/env bash
# Apply a pinned libretro slang CRT preset to three generated frames with librashader-cli (Metal runtime).
# Predeclared checks are in README "Plan, before running". The wgpu runtime check is a KNOWN FAIL kept in expected/.
set -euo pipefail
cd "$(dirname "$0")"

LIBRASHADER_VERSION=0.12.1
LIBRASHADER_FEATURES=metal,wgpu   # default features add OpenGL, which needs cmake for glfw; not installed here
SLANG_SHADERS_COMMIT=02bf134555c4595bd6b69be89feaff923da83754
SLANG_BASE_URL="https://raw.githubusercontent.com/libretro/slang-shaders/$SLANG_SHADERS_COMMIT"
SOURCE_SIZE=320x240
OUTPUT_SIZE=960x720
FRAME_COUNT=3
MIN_CHANGE_MAE=0.02        # normalised MAE of CRT output vs point-sampled upscale of the input
MAX_CORNER_LUMA=0.05       # output corner, where the input is bright red (screen curvature)
MIN_SCANLINE_STDDEV=0.01   # row luminance stddev down a flat input column; input is 0
SHADERS=(crt/crt-lottes.slangp crt/shaders/crt-lottes.slang crt/crt-geom.slangp crt/shaders/crt-geom.slang)
SHADER_SHA256=(51bdf93aa6e3dd8605bf1c2b19af1f511672b53f3551d8de1041e02a7bbf9610 e382eec413c2acf5d03cce65d447347553032acf2e550826d0142a9c51d559ef
  094d5133a3b6fbb4c2e6cba65141e5b850517aa3201bea7bdb41e4899087b60b 6533ad97601445f35a1b4f25ad54974ee9983fef0337ffec11c9c372226dbb58)
CLI=output/cargo/bin/librashader-cli

mkdir -p output expected
rm -rf output/in output/out-a output/out-b output/out-c output/summary.json output/inspect-*.png
mkdir -p output/in output/out-a output/out-b output/out-c output/slang/crt/shaders

if [[ ! -x "$CLI" || "$($CLI --version)" != "librashader-cli $LIBRASHADER_VERSION" ]]; then
  cargo install librashader-cli --version "$LIBRASHADER_VERSION" --locked --root output/cargo --no-default-features --features "$LIBRASHADER_FEATURES"
fi

sha256Of() { shasum -a 256 "$1" | cut -d' ' -f1; }

for index in "${!SHADERS[@]}"; do
  path="output/slang/${SHADERS[index]}"
  if [[ ! -f "$path" || "$(sha256Of "$path")" != "${SHADER_SHA256[index]}" ]]; then
    curl -sfL "$SLANG_BASE_URL/${SHADERS[index]}" -o "$path"
  fi
  [[ "$(sha256Of "$path")" == "${SHADER_SHA256[index]}" ]] || { echo "shader hash mismatch: $path" >&2; exit 1; }
done

# Input: FFmpeg testsrc2, 1 fps, frames 0..2 (a counter and noise patches change per frame).
ffmpeg -y -loglevel error -f lavfi -i "testsrc2=s=$SOURCE_SIZE:r=1" -frames:v "$FRAME_COUNT" -start_number 0 output/in/f%d.png

render() { # runtime preset outdir frame
  $CLI render -p "output/slang/crt/$2.slangp" -i "output/in/f$4.png" -o "$3/$2-f$4.png" -r "$1" -d "$OUTPUT_SIZE" --frame "$4"
}

for frame in 0 1 2; do render metal crt-lottes output/out-a "$frame"; done
for frame in 2 0 1; do render metal crt-lottes output/out-b "$frame"; done   # shuffled order
for frame in 0 1 2; do render metal crt-lottes output/out-c "$frame"; done   # rerun
render metal crt-geom output/out-a 0

wgpuRenders=true
render wgpu crt-lottes output/out-a 0 2>output/wgpu-error.txt || wgpuRenders=false
wgpuError=$(tr -d '\n' < output/wgpu-error.txt | cut -c1-120)

shuffledEqualsSequential=true; rerunIdentical=true; framesDistinct=true; presetsDiffer=true
for frame in 0 1 2; do
  a=$(sha256Of "output/out-a/crt-lottes-f$frame.png")
  [[ "$a" == "$(sha256Of "output/out-b/crt-lottes-f$frame.png")" ]] || shuffledEqualsSequential=false
  [[ "$a" == "$(sha256Of "output/out-c/crt-lottes-f$frame.png")" ]] || rerunIdentical=false
done
[[ "$(sha256Of output/out-a/crt-lottes-f0.png)" != "$(sha256Of output/out-a/crt-lottes-f1.png)" ]] || framesDistinct=false
[[ "$(sha256Of output/out-a/crt-lottes-f0.png)" != "$(sha256Of output/out-a/crt-geom-f0.png)" ]] || presetsDiffer=false

dimensionsOk=true; allChangeOk=true
for frame in 0 1 2; do
  png="output/out-a/crt-lottes-f$frame.png"
  [[ "$(magick identify -format '%wx%h' "$png")" == "$OUTPUT_SIZE" ]] || dimensionsOk=false
  magick "output/in/f$frame.png" -filter point -resize "$OUTPUT_SIZE!" "output/in/big-f$frame.png"
  mae=$(magick compare -metric MAE "$png" "output/in/big-f$frame.png" null: 2>&1 | sed 's/.*(\(.*\))/\1/' || true)
  awk -v m="$mae" -v t="$MIN_CHANGE_MAE" 'BEGIN{exit !(m>=t)}' || allChangeOk=false
done
[[ "$(magick identify -format '%wx%h' output/out-a/crt-geom-f0.png)" == "$OUTPUT_SIZE" ]] || dimensionsOk=false

png=output/out-a/crt-lottes-f0.png
cornerLuma=$(magick "$png" -crop 4x4+0+716 +repage -alpha off -colorspace Gray -format '%[fx:mean]' info:)
inputCornerLuma=$(magick output/in/f0.png -crop 1x1+0+239 +repage -alpha off -colorspace Gray -format '%[fx:mean]' info:)
scanlineStddev=$(magick "$png" -crop 1x300+290+200 +repage -alpha off -colorspace Gray -format '%[fx:standard_deviation]' info:)
inputStddev=$(magick output/in/big-f0.png -crop 1x300+290+200 +repage -alpha off -colorspace Gray -format '%[fx:standard_deviation]' info:)
cornerOk=false; scanlinesOk=false
awk -v c="$cornerLuma" -v i="$inputCornerLuma" -v m="$MAX_CORNER_LUMA" 'BEGIN{exit !(c<=m && i>0.2)}' && cornerOk=true
awk -v s="$scanlineStddev" -v i="$inputStddev" -v m="$MIN_SCANLINE_STDDEV" 'BEGIN{exit !(s>=m && i<0.001)}' && scanlinesOk=true

# Inspection images: input beside both presets, the sequence, and an 8x zoom of the mask and scanlines.
magick output/in/big-f0.png output/out-a/crt-lottes-f0.png output/out-a/crt-geom-f0.png +append -resize 1800x output/inspect-presets.png
magick output/out-a/crt-lottes-f0.png output/out-a/crt-lottes-f1.png output/out-a/crt-lottes-f2.png +append -resize 1800x output/inspect-sequence.png
magick output/out-a/crt-lottes-f0.png -crop 160x120+160+300 +repage -filter point -resize 800% output/inspect-zoom.png

round() { awk -v v="$1" 'BEGIN{printf "%.2f", v}'; }
hashesJson=$(for frame in 0 1 2; do sha256Of "output/out-a/crt-lottes-f$frame.png"; done | jq -R . | jq -s .)
jq -n -S \
  --arg version "$($CLI --version)" --arg wgpuError "$wgpuError" --arg geomHash "$(sha256Of output/out-a/crt-geom-f0.png)" \
  --argjson frames "$FRAME_COUNT" --argjson hashes "$hashesJson" \
  --argjson cornerLuma "$(round "$cornerLuma")" --argjson scanlineStddev "$(round "$scanlineStddev")" \
  --argjson dimensionsOk "$dimensionsOk" --argjson allChangeOk "$allChangeOk" --argjson cornerOk "$cornerOk" \
  --argjson scanlinesOk "$scanlinesOk" --argjson framesDistinct "$framesDistinct" --argjson presetsDiffer "$presetsDiffer" \
  --argjson shuffledEqualsSequential "$shuffledEqualsSequential" --argjson rerunIdentical "$rerunIdentical" \
  --argjson wgpuRenders "$wgpuRenders" \
  '{ cli: $version, runtime: "metal", frames: $frames, lottesSha256: $hashes, geomF0Sha256: $geomHash,
     measured: { cornerLuma: $cornerLuma, scanlineStddev: $scanlineStddev, wgpuError: $wgpuError },
     checks: { output_dimensions: $dimensionsOk, output_differs_from_input: $allChangeOk, screen_curvature_corner: $cornerOk,
       scanline_modulation: $scanlinesOk, frames_distinct: $framesDistinct, presets_differ: $presetsDiffer,
       shuffled_equals_sequential: $shuffledEqualsSequential, rerun_identical: $rerunIdentical, wgpu_runtime_renders: $wgpuRenders } }' > output/summary.json

[[ "$wgpuRenders" == "true" ]] || echo "librashader-crt-preset: KNOWN FAIL wgpu_runtime_renders: $wgpuError"
if [[ "${1:-}" == "--record" ]]; then
  cp output/summary.json expected/summary.json
  echo "librashader-crt-preset: recorded expected/summary.json"
else
  diff -u expected/summary.json output/summary.json
  echo "librashader-crt-preset: OK"
fi
