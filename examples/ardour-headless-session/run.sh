#!/usr/bin/env bash
# Blocked: no free, headless-capable macOS Ardour build was obtained, so no session is created or exported.
set -euo pipefail
cd "$(dirname "$0")"
ARDOUR_APP="output/app/Ardour.app"
if [[ ! -d "$ARDOUR_APP" ]]; then
  echo "ardour-headless-session: blocked. No free macOS Ardour build with a headless route was obtained: ardour.org binaries are paid (see README 'Observation, after running'). Nothing was created, exported or validated." >&2
  exit 2
fi
echo "ardour-headless-session: $ARDOUR_APP exists, but the session and export checks are not written yet. Nothing was validated." >&2
exit 2
