---
name: gdal
description: Reproject, clip and convert rasters and vector data with the GDAL command-line tools (gdalwarp, gdal_translate, ogr2ogr, gdalinfo). Load once GDAL has been chosen to prepare map data before a scene or still.
---

# GDAL

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Geo data in, geo data out: reproject and clip a raster, convert it to PNG or GeoTIFF, reproject and clip vector data to GeoJSON, read CRS and extents.
- It draws nothing. For styled map stills use `chiitiler` or `maplibre-native`; for dissolve and simplify of GeoJSON with no GDAL use `mapshaper`; for projecting inside a scene use `d3`.
- VCR evidence covers one tiny self-authored grid and GeoJSON, GDAL 3.13.2 from conda-forge on macOS arm64. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `gdal_translate` (ASCII grid to GeoTIFF, to PNG with `-scale`) | [programs](https://gdal.org/en/stable/programs/index.html) | tested |
| `gdalwarp` (`-t_srs`, `-tr`, `-r`, `-cutline`, `-crop_to_cutline`) | same | tested |
| `ogr2ogr` (`-t_srs`, `-clipsrc`, `-where`, GeoJSON out) | same | tested |
| `gdalinfo -json`, `gdallocationinfo` | same | tested |
| `gdaldem` hillshade, color-relief, slope | same | untested |
| COG, VRT, `gdal_contour`, `gdal_rasterize`, Python bindings | same | untested |

## Install and doctor
```sh
# route that worked (Homebrew gdal failed here: conflict with an installed fbthrift)
export MAMBA_ROOT_PREFIX=$PWD/mamba
micromamba create -y -p ./env -c conda-forge --override-channels gdal=3.13.2
export PATH=$PWD/env/bin:$PATH PROJ_DATA=$PWD/env/share/proj GDAL_DATA=$PWD/env/share/gdal
```
`brew install gdal` is the other documented route, untested here. `vcr doctor` does not probe GDAL. Check with `gdalinfo --version`.

## Smoke test
```sh
cd examples/gdal-reproject-clip && ./run.sh
# expect: OK: gdal-reproject-clip
```
The first run builds the conda env under `output/` (minutes, large download); later runs reuse it.

## Recipes
```sh
gdal_translate -a_srs EPSG:4326 -ot Int16 dem.asc dem.tif
gdalwarp -t_srs EPSG:3857 -r near -tr 50000 50000 dem.tif dem-3857.tif
gdalwarp -t_srs EPSG:3857 -r near -tr 50000 50000 -cutline area.geojson -crop_to_cutline -dstnodata -9999 dem.tif clipped.tif
ogr2ogr -f GeoJSON out.geojson in.geojson -t_srs EPSG:3857 -clipsrc -7.5 51.5 -5 54
gdalinfo -json clipped.tif
```
- Determinism: with fixed inputs and options, outputs were byte-identical across two runs. Pin resampling (`-r`) and resolution (`-tr`). Set `GDAL_PAM_ENABLED=NO` so stats calls do not write `.aux.xml` beside the data.
- The `-cutline` file must be in the target CRS here (the fixture reprojects it with `ogr2ogr` first).
- `-valonly -wgs84` makes `gdallocationinfo` take lon lat.

## Troubleshooting
- `brew install gdal` conflicting with an installed formula (fbthrift): use the conda route; do not unlink the other formula.
- Missing PROJ or GDAL data errors from a conda env: export `PROJ_DATA` and `GDAL_DATA` as above.

## Official docs
- https://gdal.org/en/stable/programs/index.html
- https://gdal.org/en/stable/download.html
