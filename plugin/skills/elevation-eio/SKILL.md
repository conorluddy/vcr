---
name: elevation-eio
description: Clip a lat/lon box of global elevation data to a GeoTIFF with the elevation package's `eio` CLI, run from a conda-forge GDAL environment. Load once elevation has been chosen as the source of DEM data for terrain or relief scenes; it fetches heights, it does not render them.
---

# elevation (eio)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- `eio clip --bounds left bottom right top -o dem.tif` gives a GeoTIFF of heights (EPSG:4326, metres) for a box, downloading and caching tiles on first use.
- It stops at the DEM. Hillshade, reprojection and raster maths are GDAL; map rendering is `maplibre-native`.
- VCR evidence covers elevation 2.1.0, GDAL 3.13.3, Python 3.12, macOS arm64, product `MAPZEN`, one box. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `eio clip --bounds` | [README](https://github.com/bopen/elevation#command-line-usage) | tested |
| `--product MAPZEN` (default) | [Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) | tested |
| `--product SRTM1_*, SRTM3, AW3D30, GEDTM30` | [README](https://github.com/bopen/elevation) | untested; hosts' terms differ |
| `--product GLO-30, GLO-90` | [Earth Data Hub](https://earthdatahub.destine.eu/getting-started) | untested; needs an API key in `~/.netrc` |
| `--reference FILE`, `seed`, `info`, `dataset`, `selfcheck`, `clean` | [README](https://github.com/bopen/elevation) | `selfcheck`, `dataset` and `info` run; rest untested |
| Python API | [docs](https://elevation.bopen.eu) | untested |

## Install and doctor
```sh
export MAMBA_ROOT_PREFIX=$PWD/output/mamba
micromamba create -y -p output/env -c conda-forge python=3.12 gdal
output/env/bin/pip install elevation==2.1.0
output/env/bin/eio selfcheck --verbose   # expect: Your system is ready.
```
`eio` shells out to `gdal_translate`, `gdalbuildvrt`, `gdalinfo` and `ogrinfo`, so GDAL must be on `PATH` (the env's `bin`). `vcr doctor` does not probe a project-local env. Homebrew gdal conflicted with an installed formula on the fixture machine; conda-forge avoided it.

## Smoke test
```sh
cd examples/elevation-eio-clip && ./run.sh
# expect: elevation-eio-clip: OK
```
The first run needs the network (conda-forge, PyPI, one AWS tile of about 1 MiB); later runs reuse `output/`.

## Recipe
Point the cache somewhere you can delete, then clip:
```sh
export EIO_CACHE_DIR=$PWD/output/cache PATH=$PWD/output/env/bin:$PATH
eio clip -o snowdon.tif --bounds -4.12 53.04 -4.03 53.10
```
Result: 325x217 pixels, bounds snapped outward to the 1 arc-second grid (-4.120139 53.039861 -4.029861 53.100139), Int16, nodata -32768 declared but none present, max 1064 m at Snowdon's summit (official 1085 m; SRTM smooths peaks). Read it with GDAL's Python bindings or `gdalinfo`; hillshade with `gdaldem hillshade`.

## Data terms
- `eio` is Apache-2.0; each dataset has its own terms (`eio dataset <id>` prints them; STAC `license` is `other`). MAPZEN heights come from SRTM and others via Mapzen on AWS open data; attribute them. SRTM3 forbids redistribution and resale without CIAT permission.
- Heights are a surface model on the EGM96 geoid (MAPZEN), so trees and buildings count.
- Keep tiles in ignored `output/`; do not commit them.

## Troubleshooting
- `eio` refuses boxes needing more than 25 tiles (`--max_download_tiles`); it is a guard against bulk downloads, not an error to bypass.
- Clips snap outward to whole arc-seconds, so the size is one pixel more than `width * 3600`.
- The cache defaults to `~/Library/Caches/elevation`; set `EIO_CACHE_DIR` for a reproducible fixture.
- `gdal.UseExceptions()` silences a GDAL 3.13 Python FutureWarning.

## Official docs
- [elevation repository and README](https://github.com/bopen/elevation)
- [elevation documentation](https://elevation.bopen.eu)
- [elevation on PyPI](https://pypi.org/project/elevation/)
- [Terrain Tiles attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)
