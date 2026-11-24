#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
# Telemetry posts render events to a third-party service; it is off for this fixture.
export DISABLE_TELEMETRY=true
# Dependencies come from `pnpm install` at the repository root (this is a workspace package).
# The bundled macOS ffprobe can lack the execute bit; restore it on both bundled binaries.
chmod u+x ../../node_modules/.pnpm/@ffmpeg-installer+darwin-arm64@*/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg \
  ../../node_modules/.pnpm/@ffprobe-installer+darwin-arm64@*/node_modules/@ffprobe-installer/darwin-arm64/ffprobe
node capture.mjs "$@"
