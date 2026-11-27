---
name: mapnik
description: Render GeoJSON or other geodata with a Mapnik XML style to PNG in Python, and pan by changing the bbox per frame. Validated only for the PyPI 4.3.2 wheel on macOS arm64 with CPython 3.12 and a GeoJSON source.
---

# Mapnik

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; in the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use it to draw source geodata (not tiles) to a raster map on CPU, and to make a camera pan by rendering one frame per bbox. No GPU, browser or network.
- Tested: `places.geojson` (two polygons, a line, a point) with a `style.xml` of polygon, line and text symbolizers, EPSG:4326, rendered to 512x512 PNGs at 64 px per degree; three frames panned 1 degree each. Seven probes exact, alpha 255, shuffled order and a second process byte-identical, text drawn with the bundled DejaVu Sans Bold.
- Not tested: SVG, PDF or Cairo output; PostGIS, shapefile, raster or GDAL sources; reprojection; other fonts; label collision (the fixture's label overlaps a polygon edge); speed on large data; Homebrew, conda or other platforms and Python versions; Mapnik 4.4.0.
- If the input is a MapLibre style or vector tiles use `chiitiler` or `maplibre-native`; to simplify or clip the geodata first use `mapshaper`; for a one-off diagram an SVG is simpler.
- A map is a data visual (ADR 0006): the fixture has no source line or legend; add them where the PNG is composited.

## Capability map
Discovery only; see the [Mapnik docs](https://mapnik.org) and the [python-mapnik wiki](https://github.com/mapnik/python-mapnik/wiki).
- Input plugins in the wheel: csv, gdal, geobuf, geojson (tested), ogr, pgraster, postgis, raster, shape, sqlite, tiles, topojson.
- Symbolizers in XML styles: polygon, line, text (tested); point, marker, raster, others untested.
- Output: `Image.to_string("png")` (tested); other formats and `mapnik.render_to_file` untested.
- Fonts: the wheel bundles DejaVu under `mapnik/lib/mapnik/fonts`; `register_fonts` adds more (untested).

## Install and doctor
```text
python3.12 -m venv venv && venv/bin/pip install mapnik==4.3.2
venv/bin/python -c "import mapnik; print(mapnik.version_string())"
```
`vcr doctor` does not probe it; `installation_status` stays `unknown`. The wheel needs no system install. Homebrew `mapnik` failed on the author's machine (gdal conflicts with fbthrift) and conda-forge has no osx-arm64 build.

## Smoke test
```text
examples/mapnik-geojson-style/run.sh
# expect: mapnik-geojson-style: OK (mapnik 4.3.2, 3 frames 512x512, 7 probes exact, shuffled equals sequential, label black pixels 1351)
```
Needs `python3.12` and `magick` on `PATH`; builds its venv in `output/venv`. The black pixel count and PNG hashes belong to this machine and wheel; re-record deliberately on a Mapnik upgrade.

## Recipe: frames by panning the bbox
```python
style_map = mapnik.Map(512, 512)
mapnik.load_map(style_map, "style.xml")          # relative datasource paths resolve from the working directory
style_map.zoom_to_box(mapnik.Box2d(west, 0, west + 8, 8))
image = mapnik.Image(512, 512)
mapnik.render(style_map, image)
png_bytes = image.to_string("png")
```
- Build a fresh `Map` per frame; frames then do not depend on order (shuffled equals sequential).
- Keep the map's aspect ratio equal to the bbox's, or `zoom_to_box` will widen the box.
- Probe pixel centres of shapes and lines, not antialiased edges. Fills are drawn with antialiasing at the edges.
- Style order: polygon, then line, then text, from the layer's `StyleName` list; a long label can still be overpainted by a later-drawn shape.

## Troubleshooting
- `no attribute 'tostring'`: older docs; use `to_string`. `mapnik.version` is a function; use `version_string()`.
- Datasource file not found: the path in `style.xml` is relative to the process working directory (`cd` first) unless `base_path` is given.
- Font not found: `face-name` must match a registered face exactly, for example `DejaVu Sans Bold`.

## Official docs
- [mapnik.org](https://mapnik.org)
- [python-mapnik](https://github.com/mapnik/python-mapnik) (4.3.2 wheel, LGPL-2.1-or-later)
