#!/usr/bin/env bash
# Build a three-layer PMTiles archive from the GeoJSON in data/ with pinned tippecanoe flags, read it back with
# tippecanoe-decode and tile-join, and check the predeclared facts in README "Plan, before running".
# --record rewrites expected/summary.json. A false predeclared check stays false in expected/ (KNOWN FAIL).
set -euo pipefail
cd "$(dirname "$0")"

for binary in tippecanoe tippecanoe-decode tile-join jq shasum; do
  command -v "$binary" >/dev/null || { echo "tippecanoe-geojson-pmtiles: $binary not found on PATH; install with: brew install tippecanoe" >&2; exit 1; }
done

MIN_ZOOM=0
MAX_ZOOM=8
POINT_COUNT=500
MAX_POINTS_AT_ZOOM_ZERO=5
MAX_GUESSED_ZOOM=14

rm -rf output
mkdir -p output/run-a output/run-b output/guess output/join output/renamed expected

# Same flags and same directory depth: tippecanoe writes the output name and input paths into the archive metadata.
build() {
  (cd "$1" && tippecanoe -q -o "$2" -Z"$MIN_ZOOM" -z"$MAX_ZOOM" --drop-densest-as-needed --force \
    -L points:../../data/points.geojson -L route:../../data/route.geojson -L region:../../data/region.geojson 2>/dev/null)
}
build output/run-a out.pmtiles
build output/run-b out.pmtiles
build output/renamed other.pmtiles
(cd output/guess && tippecanoe -q -zg -o out.pmtiles --drop-densest-as-needed --force -L points:../../data/points.geojson 2>/dev/null)
(cd output/join && tile-join -q -o points-only.pmtiles -l points ../run-a/out.pmtiles 2>/dev/null)

decode() { tippecanoe-decode "$@" 2>/dev/null; }
metaField() { decode "$1" | grep -E "^\"$2\":" | head -1 | sed -E 's/^"[a-z]+": "?([^",]*)"?,?$/\1/'; }
metaJson() { decode "$1" | grep '^"json"' | sed -E 's/^"json": "(.*)",?$/\1/; s/\\"/"/g'; }
vectorLayerIds() { metaJson "$1" | jq -c '[.vector_layers[].id] | sort'; }
tilestatsCounts() { metaJson "$1" | jq -c '[.tilestats.layers[] | {(.layer): .count}] | add'; }
uniquePointIds() { decode -Z"$2" -z"$2" -l points "$1" | grep -o '"id": [0-9]*' | sort -u | wc -l | tr -d ' '; }
featureLines() { decode -Z"$2" -z"$2" -l "$3" "$1" | grep -c '^{ "type": "Feature", "properties"' || true; }
toJsonArray() { printf '%s\n' "$@" | jq -s -c .; }

pointsPerZoom=(); routePerZoom=(); regionPerZoom=()
for ((zoom = MIN_ZOOM; zoom <= MAX_ZOOM; zoom++)); do
  pointsPerZoom+=("$(uniquePointIds output/run-a/out.pmtiles "$zoom")")
  routePerZoom+=("$(featureLines output/run-a/out.pmtiles "$zoom" route)")
  regionPerZoom+=("$(featureLines output/run-a/out.pmtiles "$zoom" region)")
done

magic=$(head -c 7 output/run-a/out.pmtiles)
runsIdentical=false; cmp -s output/run-a/out.pmtiles output/run-b/out.pmtiles && runsIdentical=true
renameChangesBytes=true; cmp -s output/run-a/out.pmtiles output/renamed/other.pmtiles && renameChangesBytes=false

jq -n -S \
  --arg version "$(tippecanoe --version 2>&1 | awk '{print $2}')" \
  --arg magic "$magic" \
  --argjson minzoom "$(metaField output/run-a/out.pmtiles minzoom)" \
  --argjson maxzoom "$(metaField output/run-a/out.pmtiles maxzoom)" \
  --arg format "$(metaField output/run-a/out.pmtiles format)" \
  --argjson layers "$(vectorLayerIds output/run-a/out.pmtiles)" \
  --argjson tilestats "$(tilestatsCounts output/run-a/out.pmtiles)" \
  --argjson points "$(toJsonArray "${pointsPerZoom[@]}")" \
  --argjson route "$(toJsonArray "${routePerZoom[@]}")" \
  --argjson region "$(toJsonArray "${regionPerZoom[@]}")" \
  --argjson archiveBytes "$(stat -f %z output/run-a/out.pmtiles)" \
  --argjson runsIdentical "$runsIdentical" \
  --argjson renameChangesBytes "$renameChangesBytes" \
  --argjson guessMaxZoom "$(metaField output/guess/out.pmtiles maxzoom)" \
  --argjson joinedLayers "$(vectorLayerIds output/join/points-only.pmtiles)" \
  --argjson joinedPointsAtMaxZoom "$(uniquePointIds output/join/points-only.pmtiles "$MAX_ZOOM")" \
  --arg inputsSha "$(cat data/*.geojson | shasum -a 256 | cut -c1-16)" \
  --argjson pointCount "$POINT_COUNT" --argjson zeroCap "$MAX_POINTS_AT_ZOOM_ZERO" --argjson guessCap "$MAX_GUESSED_ZOOM" \
  --argjson minZoom "$MIN_ZOOM" --argjson maxZoomPinned "$MAX_ZOOM" \
  '{
    version: $version, inputs_sha256_prefix: $inputsSha, archive_bytes: $archiveBytes,
    metadata: { minzoom: $minzoom, maxzoom: $maxzoom, format: $format, layers: $layers, tilestats_counts: $tilestats },
    unique_points_per_zoom: $points, route_features_per_zoom: $route, region_features_per_zoom: $region,
    zg_maxzoom: $guessMaxZoom, tile_join_layers: $joinedLayers, tile_join_points_at_maxzoom: $joinedPointsAtMaxZoom,
    rerun_identical: $runsIdentical, output_name_changes_bytes: $renameChangesBytes,
    checks: {
      pmtiles_magic: ($magic == "PMTiles"),
      zoom_range_pinned: ($minzoom == $minZoom and $maxzoom == $maxZoomPinned and $format == "pbf"),
      three_layers: ($layers == ["points","region","route"] and $tilestats == {points: $pointCount, region: 1, route: 1}),
      points_thinned_at_low_zoom: ($points[0] <= $zeroCap and $points == ($points | sort)),
      all_points_at_max_zoom: ($points[-1] == $pointCount),
      lines_and_polygons_at_every_zoom: (($route | all(. >= 1)) and ($region | all(. >= 1))),
      zg_picks_sane_maxzoom: ($guessMaxZoom >= 1 and $guessMaxZoom <= $guessCap),
      tile_join_keeps_only_points: ($joinedLayers == ["points"] and $joinedPointsAtMaxZoom == $pointCount),
      rerun_identical: $runsIdentical
    }
  }' > output/summary.json

echo "tippecanoe-geojson-pmtiles: tippecanoe $(jq -r .version output/summary.json), $(jq -r .archive_bytes output/summary.json) bytes, points per zoom $(jq -c .unique_points_per_zoom output/summary.json)"
echo "tippecanoe-geojson-pmtiles: rerun_identical=$runsIdentical output_name_changes_bytes=$renameChangesBytes"
jq -r '.checks | to_entries[] | select(.value == false) | "tippecanoe-geojson-pmtiles: KNOWN FAIL \(.key)"' output/summary.json

if [[ "${1:-}" == "--record" ]]; then
  jq -S . output/summary.json > expected/summary.json
  echo "tippecanoe-geojson-pmtiles: recorded expected/summary.json"
else
  diff -u expected/summary.json <(jq -S . output/summary.json) || { echo "tippecanoe-geojson-pmtiles: summary differs from expected/summary.json" >&2; exit 1; }
  echo "tippecanoe-geojson-pmtiles: OK"
fi
