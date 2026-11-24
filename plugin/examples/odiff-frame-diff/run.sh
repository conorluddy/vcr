#!/usr/bin/env bash
# Generate PNG frames with ImageMagick and check odiff: identical frames match, a predeclared 200-pixel patch
# reports exactly 200 with a matching diff image, --aa and --threshold behave as predeclared. The whole check runs
# twice and the metrics must be byte-identical. --record rewrites expected/metrics.json.
set -euo pipefail
cd "$(dirname "$0")"

ODIFF="./node_modules/.bin/odiff"
CHECKS_FILE=""
FAILURES=0

fail() {
  echo "odiff-frame-diff: FAIL: $*" >&2
  exit 1
}

record() {
  printf '%s=%s\n' "$1" "$2" >> "$CHECKS_FILE"
}

# A predeclared check. A mismatch is reported and counted, never widened; the run exits non-zero at the end.
expect_equal() {
  local name="$1" actual="$2" expected="$3"
  if [[ "$actual" != "$expected" ]]; then
    echo "odiff-frame-diff: FAILED $name: expected '$expected', got '$actual'" >&2
    FAILURES=$((FAILURES + 1))
  fi
  record "$name" "$actual"
}

# Runs odiff with the given arguments; sets CODE (exit status) and OUT (combined output).
odiff_capture() {
  CODE=0
  OUT=$("$ODIFF" "$@" 2>&1) || CODE=$?
}

# Pixel signature, not file bytes: ImageMagick PNG bytes vary between runs even when pixels do not.
pixel_signature_of() {
  magick identify -format '%#' "$1"
}

make_frames() {
  local dir="$1" index x
  for index in 0 1 2 3 4; do
    x=$((16 + 40 * index))
    magick -size 256x144 xc:'#101820' -fill '#e0a030' -draw "rectangle $x,60 $((x + 31)),83" \
      "PNG24:$dir/$(printf 'frame-%02d.png' "$index")"
  done
}

make_fixtures() {
  local run="$1" frames="$2"
  magick "$frames/frame-02.png" -fill '#ff0000' -draw 'rectangle 100,60 119,69' "PNG24:$run/patch.png"
  magick -size 256x144 xc:'#101820' -fill white -draw 'circle 128,72 180,72' "PNG24:$run/aa-a.png"
  magick -size 256x144 xc:'#101820' -fill white -draw 'circle 128,72 181,72' "PNG24:$run/aa-b.png"
  magick -size 128x64 xc:'#808080' "PNG24:$run/shift-a.png"
  magick -size 128x64 xc:'#868686' "PNG24:$run/shift-b.png"
}

check_frames() {
  local run="$1" name frames="$run/frames" hashes
  for name in frame-00.png frame-01.png frame-02.png frame-03.png frame-04.png; do
    expect_equal "${name%.png}_size" "$(magick identify -format '%wx%h' "$frames/$name")" "256x144"
    record "${name%.png}_pixel_signature" "$(pixel_signature_of "$frames/$name")"
  done
  hashes=$(for name in frame-00.png frame-01.png frame-02.png frame-03.png frame-04.png; do pixel_signature_of "$frames/$name"; echo; done | sort -u | wc -l | tr -d ' ')
  expect_equal "distinct_frame_hashes" "$hashes" "5"

  for name in frame-00.png frame-01.png frame-02.png frame-03.png frame-04.png; do
    odiff_capture "$frames/$name" "$run/frames-repeat/$name"
    expect_equal "identical_${name%.png}_exit" "$CODE" "0"
    expect_equal "identical_${name%.png}_output" "$OUT" "Images are identical"
  done
  odiff_capture "$frames/frame-02.png" "$frames/frame-02.png" "$run/odiff/identical-no-file.png"
  expect_equal "identical_writes_no_diff" "$([[ -e $run/odiff/identical-no-file.png ]] && echo yes || echo no)" "no"
}

check_changed_patch() {
  local run="$1" frame2="$1/frames/frame-02.png" patch="$1/patch.png" diff="$1/odiff/patch-diff.png"
  local count percent lines cols bbox green changed
  odiff_capture --parsable-stdout --output-diff-lines --output-diff-cols "$frame2" "$patch"
  expect_equal "patch_exit" "$CODE" "22"
  IFS=';' read -r count percent lines cols <<< "$OUT"
  expect_equal "patch_diff_count" "$count" "200"
  expect_equal "patch_diff_percentage" "$percent" "0.54"
  expect_equal "patch_diff_lines" "$lines" "$(seq 60 69 | paste -sd, -)"
  expect_equal "patch_diff_cols" "$cols" "$(seq 100 119 | paste -sd, -)"

  odiff_capture --parsable-stdout "$patch" "$frame2"
  expect_equal "patch_reversed_exit" "$CODE" "22"
  expect_equal "patch_reversed_diff_count" "${OUT%%;*}" "200"

  odiff_capture --diff-color '#00ff00' "$frame2" "$patch" "$diff"
  expect_equal "patch_diff_image_exit" "$CODE" "22"
  green=$(magick "$diff" -format %c histogram:info:- | awk 'toupper($0) ~ /#00FF00/ {print $1}' | tr -d ':')
  expect_equal "patch_diff_image_green_pixels" "$green" "200"
  bbox=$(magick "$diff" -fill white -fuzz 0% -opaque '#00ff00' -fill black +opaque white -trim -format '%wx%h%O' info:)
  expect_equal "patch_diff_image_bbox" "$bbox" "20x10+100+60"
  # AE is an error sum, not a pixel count; count non-zero pixels of the difference image instead.
  changed=$(magick "$frame2" "$patch" -compose Difference -composite -colorspace gray -threshold 0% \
    -format '%[fx:int(mean*w*h+0.5)]' info:)
  expect_equal "imagemagick_changed_pixel_count" "$changed" "200"
  record "patch_diff_image_pixel_signature" "$(pixel_signature_of "$diff")"
}

check_antialiasing() {
  local run="$1" count
  odiff_capture --parsable-stdout "$run/aa-a.png" "$run/aa-b.png"
  expect_equal "aa_without_flag_exit" "$CODE" "22"
  count="${OUT%%;*}"
  expect_equal "aa_without_flag_has_differences" "$([[ $count -gt 0 ]] && echo yes || echo no)" "yes"
  record "aa_without_flag_diff_count" "$count"

  odiff_capture --aa "$run/aa-a.png" "$run/aa-b.png"
  expect_equal "aa_with_flag_exit" "$CODE" "0"
  record "aa_with_flag_output" "$OUT"

  odiff_capture --aa --parsable-stdout "$run/frames/frame-02.png" "$run/patch.png"
  expect_equal "aa_control_solid_patch_exit" "$CODE" "22"
  expect_equal "aa_control_solid_patch_count" "${OUT%%;*}" "200"
}

check_threshold() {
  local run="$1" threshold previous="8192" count monotone="yes"
  odiff_capture --parsable-stdout --threshold 0 "$run/shift-a.png" "$run/shift-b.png"
  expect_equal "threshold_0_exit" "$CODE" "22"
  expect_equal "threshold_0_diff_count" "${OUT%%;*}" "8192"

  odiff_capture "$run/shift-a.png" "$run/shift-b.png"
  expect_equal "threshold_default_exit" "$CODE" "0"

  for threshold in 0 0.01 0.02 0.05 0.1; do
    odiff_capture --parsable-stdout --threshold "$threshold" "$run/shift-a.png" "$run/shift-b.png"
    count=0
    if [[ "$CODE" == "22" ]]; then count="${OUT%%;*}"; fi
    record "threshold_${threshold}_diff_count" "$count"
    if (( count > previous )); then monotone="no"; fi
    previous="$count"
  done
  expect_equal "threshold_sweep_non_increasing" "$monotone" "yes"
}

run_checks() {
  local run="$1"
  rm -rf "$run"
  mkdir -p "$run/frames" "$run/frames-repeat" "$run/odiff"
  CHECKS_FILE="$run/checks.kv"
  : > "$CHECKS_FILE"
  FAILURES=0

  record "odiff_version" "$("$ODIFF" --version 2>&1 | awk '{print $2}')"
  record "magick_version" "$(magick -version | head -n 1)"
  make_frames "$run/frames"
  make_frames "$run/frames-repeat"
  make_fixtures "$run" "$run/frames"
  check_frames "$run"
  check_changed_patch "$run"
  check_antialiasing "$run"
  check_threshold "$run"
  record "predeclared_checks_failed" "$FAILURES"
}

kv_to_json() {
  node -e '
    const fs = require("node:fs");
    const lines = fs.readFileSync(process.argv[1], "utf8").trimEnd().split("\n");
    const entries = lines.map((line) => {
      const separatorIndex = line.indexOf("=");
      return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
    });
    process.stdout.write(JSON.stringify(Object.fromEntries(entries), null, 2) + "\n");
  ' "$1"
}

[[ -x "$ODIFF" ]] || fail "missing $ODIFF; run pnpm install in this directory's workspace"
mkdir -p output
rm -f output/metrics.json

run_checks output/run-1
run_checks output/run-2
cmp -s output/run-1/checks.kv output/run-2/checks.kv || fail "metrics differ between runs; see output/run-1 and output/run-2"
kv_to_json output/run-1/checks.kv > output/metrics.json

failed_checks=$(awk -F= '$1=="predeclared_checks_failed"{print $2}' output/run-1/checks.kv)
if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "odiff-frame-diff: recorded expected/metrics.json ($failed_checks predeclared check(s) failed)"
else
  diff -u expected/metrics.json output/metrics.json
fi
if [[ "$failed_checks" != "0" ]]; then
  echo "odiff-frame-diff: FAILED $failed_checks predeclared check(s); see README" >&2
  exit 1
fi
echo "odiff-frame-diff: OK ($(awk -F= '$1=="odiff_version"{print $2}' output/run-1/checks.kv) odiff, two runs identical)"
