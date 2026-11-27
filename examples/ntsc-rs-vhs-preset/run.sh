#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
VERSION=0.9.7
SHA256=51ca362a9ce8b40cb47804959cbbdc5bb71e79c0f334542dd85fa27faa04c1e0
URL="https://github.com/ntsc-rs/ntsc-rs/releases/download/v${VERSION}/ntsc-rs-macos-standalone.pkg"
CLI="$PWD/output/pkg/Payload/ntsc-rs.app/Contents/MacOS/ntsc-rs-cli"
mkdir -p output expected

# Official release pinned by SHA-256, unpacked (not installed) under output/.
if [[ ! -x "$CLI" ]]; then
  rm -rf output/pkg output/ntsc-rs.pkg
  curl -fsSL -o output/ntsc-rs.pkg "$URL"
  echo "${SHA256}  output/ntsc-rs.pkg" | shasum -a 256 -c -
  pkgutil --expand-full output/ntsc-rs.pkg output/pkg
fi
"$CLI" --version > output/version.txt

ffmpeg -v error -y -f lavfi -i testsrc=size=320x240:rate=10:duration=1 -c:v libx264 -crf 0 -pix_fmt yuv444p output/src.mp4
render() { "$CLI" -i output/src.mp4 -o "output/$1" -c ffv1 -p "${2:-preset.json}" -y >/dev/null 2>&1; }
sed 's/"random_seed": 1234/"random_seed": 4321/' preset.json > output/preset-seed2.json
render a.mkv
render b.mkv
render c.mkv output/preset-seed2.json

python3 check_output.py output
if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "ntsc-rs-vhs-preset: recorded expectations"
  exit 0
fi
diff -u expected/metrics.json output/metrics.json
echo "ntsc-rs-vhs-preset: OK"
