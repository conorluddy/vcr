#!/usr/bin/env bash
# Downloads the pinned official macOS pkg into ignored output/ and expands it there; nothing is installed.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
version="4.4.2"
pkg_sha256="500bd8f9d63358c3f3a0d83b724c8574436a72c37dc0e4bad90ec1ca38032c3c"
url="https://github.com/KhronosGroup/KTX-Software/releases/download/v${version}/KTX-Software-${version}-Darwin-arm64.pkg"

if [[ ! -x output/root/bin/ktx ]]; then
  rm -rf output/dl output/pkg output/root
  mkdir -p output/dl output/root/bin output/root/lib
  curl -fsSL -o output/dl/ktx.pkg "$url"
  [[ "$(shasum -a 256 output/dl/ktx.pkg | cut -d' ' -f1)" == "$pkg_sha256" ]] || { echo "pkg SHA-256 mismatch" >&2; exit 1; }
  pkgutil --expand-full output/dl/ktx.pkg output/pkg
  cp output/pkg/*-tools.pkg/Payload/usr/local/bin/ktx output/root/bin/
  cp -a output/pkg/*-library.pkg/Payload/usr/local/lib/libktx* output/root/lib/
fi
ktx="$PWD/output/root/bin/ktx"
[[ "$("$ktx" --version)" == "ktx version: v${version}" ]]

rm -rf output/w
mkdir -p output/w
python3 -I make-input.py output/w/in.png
# --threads 1: a multithreaded encode is not assumed byte-identical to a single-threaded one.
create=("$ktx" create --format R8G8B8A8_SRGB --generate-mipmap --encode uastc --threads 1 output/w/in.png)
"${create[@]}" output/w/a.ktx2 2>/dev/null
"${create[@]}" output/w/b.ktx2 2>/dev/null
cmp output/w/a.ktx2 output/w/b.ktx2
"$ktx" validate --format json output/w/a.ktx2 > output/w/validate.json
"$ktx" info --format json output/w/a.ktx2 > output/w/info.json
"$ktx" extract output/w/a.ktx2 output/w/ex.png
python3 -I compare-png.py output/w/in.png output/w/ex.png > output/w/compare.json
python3 -I check-output.py output/w output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "ktx-software-roundtrip: recorded expectations"
  exit 0
fi
diff -u expected/metrics.json output/metrics.json
echo "ktx-software-roundtrip: OK"
