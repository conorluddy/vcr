#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
# Telemetry posts render events to a third-party service; it is off for this fixture.
export DISABLE_TELEMETRY=true
# Install scripts are skipped so no Chrome is downloaded and no ~/.revideo id is written.
npm ci --ignore-scripts
# The only install script needed is chmod u+x on the bundled macOS ffmpeg and ffprobe binaries.
npm rebuild @ffmpeg-installer/darwin-arm64 @ffprobe-installer/darwin-arm64
node capture.mjs "$@"
