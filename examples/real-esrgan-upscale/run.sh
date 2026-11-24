#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Predeclared in README.md; the thresholds are fixture parameters, not a quality bar.
PSNR_MARGIN_DB="1.0"
SSIM_MARGIN="0.010"
BINARY_SHA256="c1c35d92079085de96b9d547fd7e4464bc8a2e9ccf28d7b8c712d72ade91b7cc"
MODEL_BIN_SHA256="713ee713b0353afaa27976f0563a64a5043bd70b9bd8936c2e26e25ebcdbcddf"
MODEL_PARAM_SHA256="35330ececcea33b6c397a72548e788d5d53becee4734c50b7fada36e89f10a86"
FONT="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
RELEASE_DIR="$PWD/output/bin/release"
ESRGAN="$RELEASE_DIR/realesrgan-ncnn-vulkan"
MODEL_DIR="$RELEASE_DIR/models"
OUT="$PWD/output"

blocked() { echo "real-esrgan-upscale: blocked: $*" >&2; exit 1; }

verify_sha256() {
  local expected="$1" path="$2" actual
  actual="$(shasum -a 256 "$path" | cut -d' ' -f1)"
  [[ "$actual" == "$expected" ]] || blocked "sha256 mismatch for $path: expected $expected, got $actual"
}

sha256_of() { shasum -a 256 "$1" | cut -d' ' -f1; }
size_of() { magick identify -format '%wx%h' "$1"; }
width_of() { echo "${1%x*}"; }
height_of() { echo "${1#*x}"; }

# ImageMagick compare exits 1 when images differ, so its status is ignored.
psnr_of() { magick compare -metric PSNR "$1" "$2" null: 2>&1 | awk '{print $1}' || true; }
# SSIM prints "distortion (normalised)", e.g. "5175.4 (0.0789715)"; identical images print "0 (0)".
# SSIM is 1 minus the normalised distortion, so the 0-to-1 margin applies.
ssim_of() { magick compare -metric SSIM "$1" "$2" null: 2>&1 | awk -F'[()]' '{printf "%.6f\n", 1 - $2}' || true; }

[[ -x "$ESRGAN" ]] || blocked "missing $ESRGAN; follow the install step in README.md"
[[ -f "$FONT" ]] || blocked "missing font $FONT"
verify_sha256 "$BINARY_SHA256" "$ESRGAN"
verify_sha256 "$MODEL_BIN_SHA256" "$MODEL_DIR/realesrgan-x4plus.bin"
verify_sha256 "$MODEL_PARAM_SHA256" "$MODEL_DIR/realesrgan-x4plus.param"

mkdir -p "$OUT"
magick -version | head -1 > "$OUT/versions.txt"

# Synthetic original: gradient, filled disc, dark rectangle, fine stripes, text. No randomness.
stripe_draws=()
for ((x = 280; x <= 360; x += 4)); do stripe_draws+=(-draw "line ${x},0 ${x},479"); done
magick -size 640x480 'gradient:#16213e-#e9c46a' \
  -fill white -stroke none -draw 'circle 160,240 280,240' \
  -fill '#0b132b' -draw 'rectangle 400,300 600,440' \
  -fill none -stroke white -strokewidth 1 "${stripe_draws[@]}" \
  -stroke none -fill white -font "$FONT" -pointsize 64 -annotate +330+150 'VCR 4x' \
  -strip -depth 8 PNG24:"$OUT/original.png"

# Known kernel: 4x4 box (area) mean.
magick "$OUT/original.png" -filter Box -resize 25% -strip -depth 8 PNG24:"$OUT/input.png"
magick "$OUT/input.png" -filter Catrom -resize 400% -strip -depth 8 PNG24:"$OUT/bicubic.png"

run_realesrgan() {
  local output_name="$1" log_name="$2"
  if ! "$ESRGAN" -i "$OUT/input.png" -o "$OUT/$output_name" -n realesrgan-x4plus -s 4 -m "$MODEL_DIR" > "$OUT/$log_name" 2>&1; then
    cat "$OUT/$log_name" >&2
    blocked "realesrgan-ncnn-vulkan exited non-zero; see output/$log_name"
  fi
  [[ -s "$OUT/$output_name" ]] || blocked "no output written: output/$output_name"
}
run_realesrgan realesrgan.png realesrgan.log
run_realesrgan realesrgan-rerun.png realesrgan-rerun.log

original_size="$(size_of "$OUT/original.png")"
input_size="$(size_of "$OUT/input.png")"
bicubic_size="$(size_of "$OUT/bicubic.png")"
realesrgan_size="$(size_of "$OUT/realesrgan.png")"
realesrgan_rerun_size="$(size_of "$OUT/realesrgan-rerun.png")"

psnr_realesrgan="$(psnr_of "$OUT/original.png" "$OUT/realesrgan.png")"
psnr_bicubic="$(psnr_of "$OUT/original.png" "$OUT/bicubic.png")"
ssim_realesrgan="$(ssim_of "$OUT/original.png" "$OUT/realesrgan.png")"
ssim_bicubic="$(ssim_of "$OUT/original.png" "$OUT/bicubic.png")"
rerun_differing_pixels="$(magick compare -metric AE "$OUT/realesrgan.png" "$OUT/realesrgan-rerun.png" null: 2>&1 | awk '{print $1}' || true)"

original_sha256="$(sha256_of "$OUT/original.png")"
input_sha256="$(sha256_of "$OUT/input.png")"
bicubic_sha256="$(sha256_of "$OUT/bicubic.png")"
realesrgan_sha256="$(sha256_of "$OUT/realesrgan.png")"
rerun_sha256="$(sha256_of "$OUT/realesrgan-rerun.png")"

distinct_hash_count="$(printf '%s\n' "$original_sha256" "$input_sha256" "$bicubic_sha256" "$realesrgan_sha256" | sort -u | wc -l | tr -d ' ')"

input_is_quarter_of_original="$(( $(width_of "$input_size") * 4 == $(width_of "$original_size") && $(height_of "$input_size") * 4 == $(height_of "$original_size") ))"
realesrgan_is_4x_input="$(( $(width_of "$realesrgan_size") == 4 * $(width_of "$input_size") && $(height_of "$realesrgan_size") == 4 * $(height_of "$input_size") ))"
bicubic_matches_original="$([[ "$bicubic_size" == "$original_size" ]] && echo 1 || echo 0)"
rerun_identical="$([[ "$realesrgan_sha256" == "$rerun_sha256" ]] && echo 1 || echo 0)"
[[ "$realesrgan_rerun_size" == "$realesrgan_size" ]] || rerun_identical=0

psnr_beats_bicubic="$(awk -v a="$psnr_realesrgan" -v b="$psnr_bicubic" -v m="$PSNR_MARGIN_DB" 'BEGIN{print (a >= b + m) ? 1 : 0}')"
ssim_beats_bicubic="$(awk -v a="$ssim_realesrgan" -v b="$ssim_bicubic" -v m="$SSIM_MARGIN" 'BEGIN{print (a >= b + m) ? 1 : 0}')"

dimension_checks_pass=0
if [[ "$input_is_quarter_of_original" == 1 && "$realesrgan_is_4x_input" == 1 && "$bicubic_matches_original" == 1 ]]; then
  dimension_checks_pass=1
fi
hash_check_pass=0
[[ "$distinct_hash_count" == 4 ]] && hash_check_pass=1

if [[ "$dimension_checks_pass" == 1 && "$hash_check_pass" == 1 && "$psnr_beats_bicubic" == 1 && "$ssim_beats_bicubic" == 1 ]]; then
  claim_result="pass"
elif [[ "$dimension_checks_pass" == 1 && "$hash_check_pass" == 1 && $((psnr_beats_bicubic + ssim_beats_bicubic)) == 1 ]]; then
  claim_result="partial"
else
  claim_result="fail"
fi

yes_no() { [[ "$1" == 1 ]] && echo true || echo false; }

cat > "$OUT/checks.json" <<JSON
{
  "checks": {
    "input_is_quarter_of_original": $(yes_no "$input_is_quarter_of_original"),
    "realesrgan_is_4x_input": $(yes_no "$realesrgan_is_4x_input"),
    "bicubic_matches_original_size": $(yes_no "$bicubic_matches_original"),
    "psnr_beats_bicubic_by_margin": $(yes_no "$psnr_beats_bicubic"),
    "ssim_beats_bicubic_by_margin": $(yes_no "$ssim_beats_bicubic"),
    "distinct_hashes_four": $(yes_no "$hash_check_pass"),
    "rerun_byte_identical": $(yes_no "$rerun_identical")
  },
  "claim_result": "$claim_result",
  "measurements": {
    "original_size": "$original_size",
    "input_size": "$input_size",
    "bicubic_size": "$bicubic_size",
    "realesrgan_size": "$realesrgan_size",
    "realesrgan_rerun_size": "$realesrgan_rerun_size",
    "psnr_realesrgan_db": $(printf '%.4f' "$psnr_realesrgan"),
    "psnr_bicubic_db": $(printf '%.4f' "$psnr_bicubic"),
    "ssim_realesrgan": $(printf '%.4f' "$ssim_realesrgan"),
    "ssim_bicubic": $(printf '%.4f' "$ssim_bicubic"),
    "rerun_differing_pixels": $rerun_differing_pixels,
    "original_sha256": "$original_sha256",
    "input_sha256": "$input_sha256",
    "bicubic_sha256": "$bicubic_sha256",
    "realesrgan_sha256": "$realesrgan_sha256",
    "rerun_sha256": "$rerun_sha256"
  },
  "margins": {
    "psnr_db": $PSNR_MARGIN_DB,
    "ssim": $SSIM_MARGIN
  }
}
JSON

if [[ "${1:-}" == "--record" ]]; then mkdir -p expected && cp "$OUT/checks.json" expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json "$OUT/checks.json" && echo "real-esrgan-upscale: OK"
