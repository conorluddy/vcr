# elevation eio clip

## Intent and scope

- Tool/version: elevation 2.1.0 (PyPI, Apache-2.0, `eio` CLI) with GDAL 3.13.3 from conda-forge, Python 3.12. Pinned in `requirements.txt` and `environment.yml`.
- Claim: `eio clip --bounds -4.12 53.04 -4.03 53.10` (Snowdon, Wales) writes a GeoTIFF in EPSG:4326 whose bounds are the request snapped outward to the 1 arc-second grid, with Snowdon's summit (1085 m) as its maximum within 30 m at its known position, and no nodata.
- Exclusions: other products (GLO-30 and GLO-90 need an Earth Data Hub key; SRTM3 and GEDTM30 untried), hillshading or any VCR scene, vertical accuracy beyond one summit, the 25-tile guard, Windows and Linux.
- Data: default product `MAPZEN`, Terrain Tiles on AWS open data (https://registry.opendata.aws/terrain-tiles/), global 30 m heights on EGM96, built from SRTM and other open DEMs (SRTM in this area, per `eio dataset MAPZEN`). Its STAC `license` is `other`: the provider terms and attribution at https://github.com/tilezen/joerd/blob/master/docs/attribution.md apply. Attribute NASA/NGA SRTM and Mapzen when output is published. Checked 2026-11-27. SRTM3 (CGIAR-CSI) says redistribution and resale need CIAT permission, so it was not used; the fixture redistributes nothing (tiles stay in ignored `output/cache`).
- Network: one anonymous request for one tile (`N53W005.hgt.gz`, about 1.1 MiB cached), sent by the tool's own HTTP client with no credentials or personal data. The first run also downloads conda-forge and PyPI packages.
- Environment: macOS 26.6 arm64. `micromamba` creates `output/env` with `MAMBA_ROOT_PREFIX=output/mamba`; Homebrew gdal could not be installed on this machine (conflict with fbthrift), hence conda-forge.
- Install and cleanup: `./run.sh` builds the env on first run; remove `output/` to clean.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`. Two clips run (a warm-up that downloads, then the checked one from cache); `check.py` runs twice and both clips must give identical JSON.
- Checks (all gating): EPSG 4326 geographic; bounds within one pixel (1/3600 deg) of the request and covering it; size 325x217; maximum within 30 m of 1085 m; maximum pixel within 0.005 deg of 53.06846, -4.07635; minimum between 0 and 200 m; zero nodata pixels.
- Stop conditions: any check fails, or the two clips differ. A failed check stays and prints `KNOWN FAIL`.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`, from a deleted `output/`. All 8 checks pass. Bounds -4.120139 53.039861 -4.029861 53.100139; maximum 1064 m at -4.07667, 53.06833 (the summit pixel, 21 m under the official height: SRTM smooths the cairn); minimum 60 m (Llyn Cwellyn); no nodata. A hillshade of the clip (`gdaldem`, not a check) shows plausible Snowdon ridges and cwms. This proves bounds to GeoTIFF for one product and one box; it does not show other products, large areas or vertical accuracy elsewhere.
