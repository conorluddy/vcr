# GDAL reproject and clip a GeoTIFF and a GeoJSON

## Intent and scope

- Tool/version: GDAL 3.13.2 from conda-forge, installed by `run.sh` with `micromamba create -p output/env` (needs `micromamba` on PATH; `MAMBA_ROOT_PREFIX` also under `output/`, nothing outside the example is touched). Homebrew `gdal` failed to install on this machine (conflict with an installed fbthrift).
- Claim: `gdal_translate`, `gdalwarp` and `ogr2ogr` build, reproject and clip a GeoTIFF and a GeoJSON with the CRS, extents and pixel values the arithmetic predicts, and a second run gives byte-identical files.
- Exclusions: Homebrew route, `gdaldem` hillshade, real DEMs, other resampling kernels, COG, other CPUs or PROJ data versions.
- Official documentation: https://gdal.org/en/stable/programs/index.html, checked 2026-11-27.
- Environment: macOS 26.6 arm64; micromamba 2.10.0; Node for `check.mjs`.
- Input: `dem.asc` (10x10, value = row*10+col, 0.5 degree cells, -10..-5 E, 50..55 N) and `input.geojson` (two rectangles), both written for this fixture.
- Output: ignored `output/` (`a/` and `b/` are two independent runs).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Commands: `gdal_translate -a_srs EPSG:4326`; `gdalwarp -t_srs EPSG:3857 -r near -tr 50000 50000` with and without `-cutline ... -crop_to_cutline`; `ogr2ogr -t_srs EPSG:3857 -clipsrc`.
- Assert: source EPSG 4326; both warps EPSG 3857; clipped raster smaller than the full warp; vector x in metres; pixel at (-9.75, 54.75) is 0 and at (-5.25, 50.25) is 99; sizes and corners diffed against `expected/metrics.json`; SHA-256 of every output equal across runs a and b.
- Stop if any check fails; a failed predeclared check stays as KNOWN FAIL, never loosened.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. Record and verify runs passed, all checks true. Full warp 11x18 px, clipped 7x7 px, vector clip kept 2 features, all outputs byte-identical across two runs (with `GDAL_PAM_ENABLED=NO`). The clipped PNG preview is 7x7 pixels, a smooth diagonal gradient; it is too small to say more. Covers one tiny dataset on one machine, not raster quality on real data. The first mamba create takes a few minutes and downloads about a few hundred MB.
