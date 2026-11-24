#!/usr/bin/env bash
# Fetch the pinned sonic-annotator 1.7.0 macOS release and the Vamp Plugin Pack 2.0 installer, verify both SHA-256 sums,
# and unpack only what this example needs under output/ (git-ignored). Nothing is installed system-wide.
set -euo pipefail
cd "$(dirname "$0")"

SONIC_ANNOTATOR_URL=https://github.com/sonic-visualiser/sonic-annotator/releases/download/sonic-annotator-1.7/sonic-annotator-1.7.0-macos.tar.gz
SONIC_ANNOTATOR_SHA256=cb54f46af0f6c16b8274998d025019021b3b6c50410b8a8e2024d0aa7e65b040
VAMP_PACK_URL=https://github.com/vamp-plugins/vamp-plugin-pack/releases/download/v2.0/Vamp.Plugin.Pack.Installer-2.0.dmg
VAMP_PACK_SHA256=60e2569ab064dbaf9ca8a4c3cf8465298b91ea3be1b34c5395d45c1ca4c53f10
MOUNT_POINT="$PWD/output/dl-pack/mnt"

fetchVerified() {
  local url="$1" sha256="$2" destination="$3"
  curl -sSL --fail -o "$destination" "$url"
  local actual
  actual=$(shasum -a 256 "$destination" | awk '{ print $1 }')
  if [[ "$actual" != "$sha256" ]]; then
    echo "fetch-tools: SHA-256 mismatch for $destination: expected $sha256, got $actual. Delete it and retry; do not use it." >&2
    exit 1
  fi
}

mkdir -p output/dl-sa output/dl-pack output/bin output/vamp
fetchVerified "$SONIC_ANNOTATOR_URL" "$SONIC_ANNOTATOR_SHA256" output/dl-sa/sonic-annotator-1.7.0-macos.tar.gz
tar -xzf output/dl-sa/sonic-annotator-1.7.0-macos.tar.gz -C output/bin --strip-components=1 sonic-annotator-1.7.0-macos/sonic-annotator

fetchVerified "$VAMP_PACK_URL" "$VAMP_PACK_SHA256" output/dl-pack/Vamp.Plugin.Pack.Installer-2.0.dmg
mkdir -p "$MOUNT_POINT"
hdiutil attach -nobrowse -readonly -noautoopen -mountpoint "$MOUNT_POINT" output/dl-pack/Vamp.Plugin.Pack.Installer-2.0.dmg >/dev/null
trap 'hdiutil detach -quiet "$MOUNT_POINT" || true' EXIT
python3 -I extract-vamp-plugins.py "$MOUNT_POINT/Vamp Plugin Pack Installer.app/Contents/MacOS/Vamp Plugin Pack Installer" output/vamp qm-vamp-plugins.dylib vamp-aubio.dylib

echo "fetch-tools: ok (sonic-annotator at output/bin, arm64 Vamp libraries at output/vamp)"
