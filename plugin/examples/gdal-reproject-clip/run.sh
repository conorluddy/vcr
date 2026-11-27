#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
GDAL_VERSION=3.13.2
# conda-forge env lives under ignored output/, nothing touches ~ or /opt
export MAMBA_ROOT_PREFIX="$PWD/output/mamba"
env_dir="$PWD/output/env"
mkdir -p output
if [[ ! -x "$env_dir/bin/gdalinfo" ]]; then
  micromamba create -y -q -p "$env_dir" -c conda-forge --override-channels "gdal=$GDAL_VERSION"
fi
export PATH="$env_dir/bin:$PATH"
export PROJ_DATA="$env_dir/share/proj" GDAL_DATA="$env_dir/share/gdal"
export GDAL_PAM_ENABLED=NO
gdal_translate --version > output/version.txt

# Raster source: self-authored ASCII grid, value = row*10+col, 0.5 degree cells
build() { # $1 = output directory
  mkdir -p "$1"
  gdal_translate -q -a_srs EPSG:4326 -ot Int16 -of GTiff dem.asc "$1/dem.tif"
  gdalwarp -q -overwrite -t_srs EPSG:3857 -r near -tr 50000 50000 "$1/dem.tif" "$1/dem-3857.tif"
  ogr2ogr -q -f GeoJSON "$1/clip-area.geojson" input.geojson -where "name='clip-area'" -t_srs EPSG:3857
  gdalwarp -q -overwrite -t_srs EPSG:3857 -r near -tr 50000 50000 -cutline "$1/clip-area.geojson" -crop_to_cutline -dstnodata -9999 "$1/dem.tif" "$1/dem-clipped.tif"
  ogr2ogr -q -f GeoJSON "$1/vectors-3857.geojson" input.geojson -t_srs EPSG:3857 -clipsrc -7.5 51.5 -5 54 -lco COORDINATE_PRECISION=1
  gdal_translate -q -of PNG -ot Byte -scale 0 99 0 255 "$1/dem-clipped.tif" "$1/dem-clipped.png"
}
rm -rf output/a output/b
build output/a
build output/b
for f in dem.tif dem-3857.tif dem-clipped.tif vectors-3857.geojson clip-area.geojson; do
  [[ "$(shasum -a 256 < output/a/$f)" == "$(shasum -a 256 < output/b/$f)" ]] || { echo "NONDETERMINISTIC: $f"; exit 1; }
done
for f in dem dem-3857 dem-clipped; do gdalinfo -json "output/a/$f.tif" > "output/a/$f.info.json"; done
# top-left cell (value 0) and bottom-right cell (value 99), by lon/lat
gdallocationinfo -valonly -wgs84 output/a/dem.tif -9.75 54.75 > output/a/px-topleft.txt
gdallocationinfo -valonly -wgs84 output/a/dem.tif -5.25 50.25 > output/a/px-bottomright.txt
node check.mjs
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: gdal-reproject-clip"
