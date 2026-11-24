#!/usr/bin/env bash
# Build MPFB 2.0.18 humans in background Blender from an isolated user repository, check geometry and render, compare with expected/.
set -euo pipefail
cd "$(dirname "$0")"
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
[[ -x "$BLENDER" ]] || { echo "Blender not found at $BLENDER; set BLENDER=/path/to/blender" >&2; exit 1; }

MPFB_VERSION="2.0.18"
MPFB_SHA256="c075b3e9b94b8e5556a5f03f4653602d02ea306de08126e8f55ed6dee28a2dad"
MPFB_URL="https://extensions.blender.org/download/sha256:${MPFB_SHA256}/add-on-mpfb-v${MPFB_VERSION}.zip"
MPFB_ZIP="output/download/mpfb-${MPFB_VERSION}.zip"
ISOLATED_HOME="$PWD/output/blender-home"

mkdir -p output/download
if [[ ! -f "$MPFB_ZIP" ]]; then
  curl -fsSL --max-time 300 -o "$MPFB_ZIP.partial" "$MPFB_URL"
  mv "$MPFB_ZIP.partial" "$MPFB_ZIP"
fi
echo "$MPFB_SHA256  $MPFB_ZIP" | shasum -a 256 -c - >/dev/null || { echo "MPFB zip sha256 mismatch; delete $MPFB_ZIP and retry" >&2; exit 1; }

# Blender reads and writes only under output/blender-home: HOME and the BLENDER_USER_* paths are redirected there.
blender_isolated() {
  env HOME="$ISOLATED_HOME" \
    BLENDER_USER_CONFIG="$ISOLATED_HOME/config" \
    BLENDER_USER_SCRIPTS="$ISOLATED_HOME/scripts" \
    BLENDER_USER_EXTENSIONS="$ISOLATED_HOME/extensions" \
    BLENDER_USER_DATAFILES="$ISOLATED_HOME/datafiles" \
    "$BLENDER" --factory-startup "$@"
}
mkdir -p "$ISOLATED_HOME/config" "$ISOLATED_HOME/scripts" "$ISOLATED_HOME/extensions" "$ISOLATED_HOME/datafiles"

INSTALLED_MANIFEST="$ISOLATED_HOME/extensions/user_default/mpfb/blender_manifest.toml"
if [[ ! -f "$INSTALLED_MANIFEST" ]]; then
  blender_isolated --command extension install-file -r user_default "$PWD/$MPFB_ZIP" > output/install.log 2>&1 || { cat output/install.log >&2; exit 1; }
fi
grep -q "^version = \"${MPFB_VERSION}\"" "$INSTALLED_MANIFEST" || { echo "installed MPFB is not ${MPFB_VERSION}: $INSTALLED_MANIFEST" >&2; exit 1; }

for run in run-1 run-2; do
  rm -rf "output/$run" "output/$run.log"
  mkdir -p "output/$run"
  blender_isolated -b --python-exit-code 1 --python build_figure.py -- "$PWD/output/$run" > "output/$run.log" 2>&1 || { cat "output/$run.log" >&2; exit 1; }
  grep -E "rendered|predeclared" "output/$run.log" || true
done

cmp output/run-1/geometry.json output/run-2/geometry.json || { echo "C4: geometry.json differs between reruns" >&2; exit 1; }

magick identify -format "%w %h %[channels]\n" output/run-1/figure.png > output/identify.txt
read -r width_px height_px channels < output/identify.txt
printf '{\n  "channels": "%s",\n  "height_px": %s,\n  "width_px": %s\n}\n' "$channels" "$height_px" "$width_px" > output/render.json

opaque_fraction=$(magick output/run-1/figure.png -alpha extract -threshold 50% -format "%[fx:mean]" info:)
unique_colours=$(magick output/run-1/figure.png -format "%k" info:)
echo "render: opaque_fraction=$opaque_fraction unique_colours=$unique_colours"
awk -v fraction="$opaque_fraction" -v colours="$unique_colours" 'BEGIN { exit !(fraction >= 0.05 && fraction <= 0.60 && colours >= 500) }' \
  || { echo "C3: render is blank or clipped (opaque_fraction=$opaque_fraction unique_colours=$unique_colours)" >&2; exit 1; }

blender_version=$(sed -n 's/.*"blender_version": "\(.*\)".*/\1/p' output/run-1/geometry.json)
mpfb_version=$(sed -n 's/.*"mpfb_version": "\(.*\)".*/\1/p' output/run-1/geometry.json)

if [[ "${1:-}" == "--record" ]]; then
  cp output/run-1/geometry.json expected/geometry.json
  cp output/render.json expected/render.json
  echo "recorded expected/ (Blender $blender_version, MPFB $mpfb_version)"
  exit 0
fi

diff expected/geometry.json output/run-1/geometry.json || { echo "C2/C4: geometry differs from expected/geometry.json" >&2; exit 1; }
diff expected/render.json output/render.json || { echo "C3: render dimensions or channels differ from expected/render.json" >&2; exit 1; }
echo "mpfb-human-figure: OK (Blender $blender_version, MPFB $mpfb_version)"
