#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected

python3 make-input.py output/input.glb
version="$(gltf-transform --version)"
[[ "$version" == "4.5.1" ]]
printf '%s\n' "$version" > output/version.txt
gltf-transform center output/input.glb output/centered.glb
gltf-transform center output/input.glb output/repeated.glb
cmp output/centered.glb output/repeated.glb
gltf-transform validate output/centered.glb > output/validation.txt
python3 check-output.py output/centered.glb output/version.txt output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  cp output/validation.txt expected/validation.txt
  echo "gltf-transform-center: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
diff -u expected/validation.txt output/validation.txt
echo "gltf-transform-center: OK"
