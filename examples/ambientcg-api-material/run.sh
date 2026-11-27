#!/usr/bin/env bash
# Anonymous GETs only, generic User-Agent. Everything fetched is cached in output/cache, so reruns are offline.
set -euo pipefail
cd "$(dirname "$0")"
ASSET=PavingStones036
FILE="${ASSET}_1K-JPG.zip"
UA="vcr-fixture/1.0"
CACHE=output/cache
mkdir -p "$CACHE"
fetch() { [[ -s "$2" ]] || curl -fsSL -A "$UA" -o "$2" "$1"; }
fetch "https://ambientcg.com/api/v2/full_json?id=${ASSET}&include=downloadData,mapData" "$CACHE/api.json"
fetch "https://docs.ambientcg.com/license/" "$CACHE/license.html"
fetch "https://ambientcg.com/get?file=${FILE}" "$CACHE/$FILE"
rm -rf output/unzipped && mkdir output/unzipped
unzip -q "$CACHE/$FILE" -d output/unzipped
node check.mjs "$ASSET" "$FILE"
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: ambientcg-api-material (the KNOWN FAIL above is recorded in expected/metrics.json)"
