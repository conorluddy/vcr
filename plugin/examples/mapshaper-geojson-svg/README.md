# mapshaper dissolve, simplify and project GeoJSON to SVG

## Intent and scope

- Tool/version: `mapshaper` 0.8.13 (npm, MPL-2.0), local to this example through `pnpm add`.
- Claim: the CLI turns a small GeoJSON into a dissolved, simplified, Web Mercator GeoJSON and a flat styled SVG with no browser, and the SVG rasterises through resvg.
- Exclusions: Shapefile and TopoJSON, clipping and joins, `mapshaper-xl`, large inputs, other projections, SVG label or point output, the GUI.
- Official documentation: https://github.com/mbloch/mapshaper/wiki/Command-Reference and https://www.npmjs.com/package/mapshaper; checked 2026-11-27.
- Environment: macOS 26.6 arm64; Node 22.19.0; resvg and ImageMagick for the raster check.
- Input: `input.geojson`, three polygons written for this fixture (no external data, no rights issues).
- Output: ignored `output/` (`regions.geojson`, `regions.svg`, `regions.png`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Commands: `-dissolve region -simplify 50% -proj webmercator`, then `-o format=geojson` and `-style ... -o regions.svg width=800`.
- Assert: 3 features dissolve to 2 (regions A and B); vertex count falls from 29; first coordinate is in metres, not degrees; the SVG has 2 paths, two distinct fills, a viewBox and width 800; resvg gives an 800 px wide PNG. All diffed against `expected/metrics.json`.
- Inspect the PNG. Stop if the regions are not visually distinct or the shared inner boundary survives the dissolve.
- Lead caveat to settle: `-proj` and `-o format=svg` are in the command reference but not the README.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. Record and verify runs both passed. 3 features dissolved to 2, vertices 29 to 15, SVG 800x821 with two filled paths. The first attempt drew both regions black because an unstyled SVG has no fill; `-style fill=...` fixed that and the check now requires two fills. The PNG showed two clearly separate regions with no inner boundary in region A, and the zigzag coast flattened by simplification. mapshaper warns on stderr that projected GeoJSON is not RFC 7946; expected. Covers one tiny input on one machine; says nothing about large files, other formats, or the visual quality of simplification on real boundaries.
