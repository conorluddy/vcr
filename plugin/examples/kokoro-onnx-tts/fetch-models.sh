#!/usr/bin/env bash
# Downloads the Kokoro model and voice bank into output/models and verifies sha256.
set -euo pipefail
cd "$(dirname "$0")"
MODEL_DIR=output/models
RELEASE_URL=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1

fetch_verified_asset() {
  local assetName=$1 expectedSha256=$2
  local destination="$MODEL_DIR/$assetName"
  if [[ -f "$destination" ]] && echo "$expectedSha256  $destination" | shasum -a 256 -c --status; then
    echo "$assetName: present, sha256 ok"
    return 0
  fi
  curl -fSL --retry 3 -o "$destination.part" "$RELEASE_URL/$assetName"
  if ! echo "$expectedSha256  $destination.part" | shasum -a 256 -c --status; then
    rm -f "$destination.part"
    echo "sha256 mismatch for $assetName; file removed, nothing used." >&2
    exit 1
  fi
  mv "$destination.part" "$destination"
  echo "$assetName: downloaded, sha256 ok"
}

mkdir -p "$MODEL_DIR"
fetch_verified_asset kokoro-v1.0.onnx beb0d1848dee9a49da392cc3df26958d46cfa35d321edf434f52949153f0df3a
fetch_verified_asset voices-v1.0.bin bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d
