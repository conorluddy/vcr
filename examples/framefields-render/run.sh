#!/usr/bin/env bash
# framefields 3.0.2 in Node on native WebGPU: render five probe frames of a 24-frame composition as raw RGBA
# sequentially and in shuffled order, and an MP4. Checks: dimensions, raw frame size, frame hashes (>= 4 distinct),
# shuffled equals sequential, two runs byte-identical, MP4 is h264 320x180 with 24 video frames, and the
# facts equal expected/render.json. --record rewrites expected/. Needs network on first run (native binaries).
set -euo pipefail
cd "$(dirname "$0")"

# pnpm skips @napi-rs/webcodecs-darwin-arm64 on Node 22.19 (its engines say ^22.20), so reinstall as if on 22.20,
# and pnpm ignores skia-canvas's install script, so run it for that one package.
mkdir -p output
pnpm install --frozen-lockfile --config.nodeVersion=22.20.0 > output/install.log 2>&1 || { cat output/install.log >&2; exit 1; }
skia_dir="$(cd "$(realpath node_modules/framefields)/.." && pwd)/skia-canvas"
[[ -f "$skia_dir/lib/skia.node" ]] || node "$skia_dir/lib/prebuild.mjs" download >&2 || { echo "framefields-render: skia-canvas binary unavailable" >&2; exit 1; }

pnpm -s render > output/run-1.log 2>&1 || { cat output/run-1.log >&2; exit 1; }
cp output/render.json output/run-1.json
ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=codec_name,width,height,nb_read_frames -of json output/film.mp4 > output/film-1.json
pnpm -s render > output/run-2.log 2>&1 || { cat output/run-2.log >&2; exit 1; }
cmp -s output/run-1.json output/render.json || { echo "framefields-render: runs differ" >&2; exit 1; }
if grep -q -E 'error|Failed' output/run-1.log; then echo "framefields-render: engine logged errors:" >&2; grep -E 'error|Failed' output/run-1.log >&2; exit 1; fi

check() {
  jq -e "$1" "$3" > /dev/null || { echo "framefields-render: check failed: $2" >&2; exit 1; }
}
check '.width == 320 and .height == 180' "dimensions are not 320x180" output/render.json
check '.rawBytesPerFrame == [230400]' "raw frame is not 320*180*4 bytes" output/render.json
check '.distinctHashes >= 4' "fewer than four distinct frame hashes" output/render.json
check '.shuffledMatchesSequential == true' "shuffled order hashes differ from sequential" output/render.json
check '.streams[0] | .codec_name == "h264" and .width == 320 and .height == 180 and .nb_read_frames == "24"' "MP4 is not h264 320x180 with 24 frames" output/film-1.json

if [[ "${1:-}" == "--record" ]]; then mkdir -p expected && cp output/render.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/render.json output/render.json && echo "framefields-render: OK (framefields $(jq -r .versions.framefields output/render.json), node $(jq -r .versions.node output/render.json), $(jq -r .distinctHashes output/render.json) distinct frames, shuffled equals sequential, mp4 24 frames)"
