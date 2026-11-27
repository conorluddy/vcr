# Mapnik GeoJSON + XML style to PNG

Status: validated on macOS arm64, 2026-11-27 (mapnik 4.3.2 PyPI wheel, CPython 3.12.13, ImageMagick 7.1.2). Plan written before the first run.

## Intent and scope

- Tool: `mapnik` 4.3.2 (python-mapnik wheel `cp312 macosx_11_0_arm64`, LGPL-2.1-or-later; bundles libmapnik, input plugins, PROJ, GDAL data and DejaVu fonts). PyPI 4.4.0 (2026-11-25) exists and is untested.
- Claim: Mapnik renders a self-authored GeoJSON (two polygons, a line, a point with a text label) with an XML style to 512x512 PNGs; changing the bounding box per frame pans the map; the output is deterministic.
- Exclusions: SVG, PDF and Cairo output; PostGIS, shapefile and raster sources; reprojection (everything is EPSG:4326); fonts other than the bundled DejaVu; label collision and placement at scale; large datasets and speed; Homebrew and conda routes; Intel macOS and other platforms; Python versions other than 3.12; version 4.4.0.
- Install route: Homebrew `mapnik` failed here (gdal conflicts with an installed fbthrift; left untouched) and conda-forge has no osx-arm64 `mapnik`, so a venv in the ignored `output/venv` with the PyPI wheel. No system install.
- Input: `places.geojson` and `style.xml`, written for this fixture, no external rights.
- Cleanup: `output/` is generated and ignored.

## Plan, before running

- Commands: `./run.sh --record` then `./run.sh`. `run.sh` builds `output/venv` with `python3.12` and `requirements.txt` (`mapnik==4.3.2`), then runs `render.py` twice in separate processes.
- Render: map 512x512, background `#f1faee`; frame 0 bbox lon/lat 0..8 (64 px per degree), frames 1 and 2 shift the bbox east by 1 degree each. Frames also rendered in order 2,0,1 in the same process.
- Predeclared checks, none loosened if they fail:
  1. Each frame is 512x512 (ImageMagick), alpha minimum 255.
  2. Seven probes in `probes.tsv` match exactly in the ImageMagick decode: background corner, centre of Alpha (red), centre of Beta (navy), centre of the road (teal), outside Alpha, and Alpha centre in frames 1 and 2 shifted 64 px left each.
  3. Label: more than 100 near-black pixels in a 160x60 box around where "Dublin" should centre (256,128).
  4. Three distinct frame hashes; shuffled-order PNGs equal sequential ones.
  5. Two separate processes give byte-identical PNGs; `render.json` (without versions) equals `expected/render.json`.
- Failure modes: wheel does not install or import on arm64 (then blocked); text fails to render (then label check fails, recorded as KNOWN FAIL, partial).
- Inspect: `output/contact.png` made with `magick output/run-1/frame-{0,1,2}.png +append -resize 50% output/contact.png`.

## Observation, after running

- Date and host: 2026-11-27, Conors-MacBook-Pro-2.local, Darwin 25.6.0 arm64. Mapnik 4.3.2, Python 3.12.13.
- Result: `mapnik-geojson-style: OK (mapnik 4.3.2, 3 frames 512x512, 7 probes exact, shuffled equals sequential, label black pixels 1351)`. All checks passed on the first record run; PNG sizes 5819, 5688 and 5624 bytes. Frame hashes in `expected/render.json`.
- Inspection: the contact sheet shows red square, navy rectangle, a teal horizontal line and "Dublin" in bold sans, shifting left by 64 px per frame and the red square clipping at the left edge in frame 2. The word "Dublin" is drawn at the point but its last letter overlaps the navy rectangle edge (black on navy is low contrast): label collision is not handled by this fixture.
- Deviations: API names differ from older docs (`Image.to_string("png")`, not `tostring`); fixed in `render.py` before the record run. Nothing else.
- Nondeterminism: none seen in three process runs and the shuffled pass.
- Establishes: the PyPI wheel renders GeoJSON with an XML style, text included, at the stated pixels deterministically on this machine.
- Does not establish: anything in the exclusions list, nor visual parity with other machines' font rendering.
- Revisit on a Mapnik upgrade (4.4.0), a Python bump, or when SVG/PDF output or a reprojected source is needed.
