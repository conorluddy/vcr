#!/usr/bin/env bash
# Blocked: no macOS build of mayo is published upstream, so no conversion runs.
set -euo pipefail
cd "$(dirname "$0")"
MAYO_APP="output/app/Mayo.app"
if [[ ! -d "$MAYO_APP" ]]; then
  echo "mayo-cad-convert: blocked. No macOS build in github.com/fougue/mayo releases (latest v0.10.0 ships AppImage and Windows assets only). Nothing was converted or validated." >&2
  exit 2
fi
echo "mayo-cad-convert: $MAYO_APP exists, but the STEP conversion checks are not written yet. Nothing was validated." >&2
exit 2
