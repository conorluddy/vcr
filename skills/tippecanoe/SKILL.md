---
name: tippecanoe
description: Build a vector tileset (.pmtiles) from your own GeoJSON with tippecanoe and read it back with tippecanoe-decode and tile-join. Load once a map scene needs a local, pinned tileset; rendering the tiles is a different tool.
---

# tippecanoe

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Turns GeoJSON (also FlatGeobuf and CSV points, untested) into a zoom-thinned `.pmtiles` or `.mbtiles`: routes, regions and data points for an offline map scene.
- It makes tiles, it does not draw them. To get a picture use `chiitiler` or `maplibre-native`; neither was tried against this output.
- Tested only on one small synthetic set (500 points, one line, one polygon), macOS arm64, v2.79.0 from Homebrew. No large inputs, so tile-size-forced dropping is untested.
- Reproducibility: archives are byte-identical across runs of the same command (8 of 8 early runs, every rerun of the fixture). The output file name and input paths are written into the metadata, so renaming the output or passing absolute paths changes the bytes. `--help` lists no thread-count flag, so single-thread mode could not be tried. Keep the command line, working directory and relative paths fixed when a hash matters.
- Pin the zoom range. `-zg` guessed maxzoom 6 for the points alone; fixed `-Z`/`-z` is the repeatable choice.

## Capability map
- **Tiling** (`tippecanoe`): [README](https://github.com/felt/tippecanoe#readme). Tested: `-o`, `-Z`, `-z`, `-zg`, `-L name:file`, `--drop-densest-as-needed`, `-q`, `--force`. Untested: `-r`, `--drop-fraction-as-needed`, clustering, simplification options, attribute filters, `--read-parallel`, other inputs.
- **Reading back** (`tippecanoe-decode`): tested for metadata, `-Z`/`-z` zoom ranges and `-l layer`; tiles print as GeoJSON per tile.
- **Joining and filtering** (`tile-join`): tested only `-l layer` to keep one layer; joins with CSV and merging archives are untested.

## Install and doctor
```sh
brew install tippecanoe
```
`vcr doctor` reports the tool; the card's check is `tippecanoe --version` (expect `v2.79.0`). Licence BSD-2-Clause. This is Felt's fork; `mapbox/tippecanoe` stopped at 1.36.0.

## Smoke test
```sh
examples/tippecanoe-geojson-pmtiles/run.sh
# expect: tippecanoe-geojson-pmtiles: tippecanoe v2.79.0, 11376 bytes, points per zoom [1,1,2,5,13,32,80,201,500]
# expect: tippecanoe-geojson-pmtiles: OK
```

## Recipes
```sh
tippecanoe -q -o out.pmtiles -Z0 -z8 --drop-densest-as-needed --force \
  -L points:points.geojson -L route:route.geojson -L region:region.geojson
tippecanoe-decode out.pmtiles | head                         # metadata, layers, tilestats
tippecanoe-decode -Z4 -z4 -l points out.pmtiles              # one layer at one zoom
tile-join -q -o points-only.pmtiles -l points out.pmtiles    # keep one layer
```
- Count distinct feature ids per zoom, not output lines: a point near a tile edge appears in both tiles (565 lines for 500 points at z8).
- The metadata `json` field holds `vector_layers` and `tilestats`; the fixture reads layer ids and counts from it.

## Troubleshooting
- `tippecanoe-decode` prints progress and warnings on stderr (`using tile 1/0/0 instead of 8/0/0` when a tile you asked for is empty); redirect it when parsing.
- Without `-q` tippecanoe writes a long progress line; with `-q` it is silent.
- Archive bytes differ between two runs that look the same: check the output name and input paths, they are embedded in the metadata.

## Official docs
https://github.com/felt/tippecanoe, version 2.79.0 ran.
