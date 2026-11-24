#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# raea at the pinned commit (the 2026-11-23 head of its main branch), built from source into output/.
RAEA_PIN=66eb15448f69ab29a801fe1bde75d3889d34d04e
SOURCE=output/src
TARGET=$PWD/output/target
RAEA="$TARGET/release/raea"
SCENE="$PWD/$SOURCE/docs/manual/examples/hello.tsx"

# Fail fast if the clone is missing or not at the pin; nothing is checked out silently.
if [ ! -d "$SOURCE/.git" ]; then
  git clone --depth 1 https://github.com/shinyobjectz/raea "$SOURCE"
  git -C "$SOURCE" fetch --depth 1 origin "$RAEA_PIN"
  git -C "$SOURCE" checkout --quiet "$RAEA_PIN"
fi
if [ "$(git -C "$SOURCE" rev-parse HEAD)" != "$RAEA_PIN" ]; then
  echo "raea-render: $SOURCE is not at $RAEA_PIN; remove output/src and rerun" >&2
  exit 1
fi

# The build and the SDK installs happen inside the ignored output/ only. Cargo's no-op is quick once built.
(cd "$SOURCE" && CARGO_TARGET_DIR="$TARGET" cargo build --release -p raea-cli --no-default-features)

# bun 1.4.2 (what upstream CI pins; the host's bun 1.2.18 cannot read bun.lock v2), installed locally under output/.
BUN_TOOL="$PWD/output/bun-tool"
BUN="$BUN_TOOL/node_modules/.bin/bun"
if [ ! -x "$BUN" ]; then
  npm install --prefix "$BUN_TOOL" bun@1.4.2
fi
for dir in sdk/raea sdk/react/js sdk/react/tw; do
  (cd "$SOURCE/$dir" && "$BUN" install --frozen-lockfile)
done
(cd "$SOURCE/sdk/react/js" && "$BUN" run build)

# Offline: the engine refuses every network request it would make; telemetry is not sent by raea.
export RAEA_OFFLINE=1
export RAEA_HOME="$PWD/$SOURCE"
# Without this, raea clones a repeated MP4 from ~/Library/Caches/raea/exports, so the rerender check would not render twice.
export RAEA_EXPORT_CACHE=0

rm -rf output/render-a output/render-b output/stills
mkdir -p output/render-a output/render-b output/stills/sequence output/stills/shuffled
"$RAEA" render "$SCENE" -o output/render-a/hello.mp4
"$RAEA" render "$SCENE" -o output/render-b/hello.mp4
for frame in 0 30 89; do
  "$RAEA" render "$SCENE" --frame "$frame" -o "output/stills/sequence/frame-$frame.png"
done
for frame in 89 0 30; do
  "$RAEA" render "$SCENE" --frame "$frame" -o "output/stills/shuffled/frame-$frame.png"
done

node check.mjs "$@"
