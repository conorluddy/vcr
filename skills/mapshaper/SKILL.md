---
name: mapshaper
description: Dissolve, simplify, reproject and style GeoJSON with the mapshaper CLI and export a flat SVG map still, no browser. Load once mapshaper has been chosen to shrink boundary data or make a map SVG layer.
---

# mapshaper

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Geodata in, smaller geodata or a flat SVG out. Typical job: take a heavy boundary file, dissolve by a property, simplify, project, and write GeoJSON for a scene or an SVG still.
- The SVG is static paths. To draw or animate geometry inside a seeked scene use `d3`; for tiled map stills from a style use `chiitiler` or `maplibre-native`.
- VCR evidence covers one tiny self-authored GeoJSON, `-dissolve`, `-simplify`, `-proj webmercator`, `-style` and SVG/GeoJSON output, mapshaper 0.8.13 on macOS arm64 with Node 22. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `-dissolve`, `-simplify`, `-proj`, `-style`, `-o` (GeoJSON, SVG) | [Command Reference](https://github.com/mbloch/mapshaper/wiki/Command-Reference) | tested |
| `-clip`, `-erase`, `-join`, `-filter`, `-each`, `-classify` | same | untested |
| Shapefile, TopoJSON, CSV input and output | same | untested |
| `mapshaper-xl` (more memory for large files), `mapshaper-gui` | [npm](https://www.npmjs.com/package/mapshaper) | untested |
| Node API (`applyCommands`) | [README](https://github.com/mbloch/mapshaper) | untested |

## Install and doctor
```sh
pnpm add mapshaper@0.8.13
```
A project-local dependency: run its bin as `node_modules/.bin/mapshaper`. `vcr doctor` does not probe it. Pin the version; simplification output can change between releases.

## Smoke test
```sh
cd examples/mapshaper-geojson-svg && ./run.sh
# expect: OK: mapshaper-geojson-svg
```
Diffs dissolved feature count, vertex counts, projection, SVG fills and width against `expected/metrics.json`, then rasterises the SVG with resvg.

## Recipe: GeoJSON to a styled SVG still
```sh
mapshaper input.geojson -dissolve region -simplify 50% -proj webmercator \
  -style fill='region == "A" ? "#2a6f97" : "#e9c46a"' stroke=#ffffff stroke-width=3 \
  -o regions.svg width=800
resvg --width 800 --background white regions.svg regions.png
```
- Command order matters: dissolve, simplify, project, style, then `-o`. Commands read left to right.
- `-style` takes JS expressions over the feature's properties. Without it every path has no fill and renders black.
- `-simplify 50%` keeps about half the removable vertices (29 to 15 here). It flattens fine detail, so pin the percentage and look at the result.
- `-o file.svg` sets the format from the extension; `width=800` sets the SVG size, height follows the aspect ratio.
- `-o x.geojson` after `-proj webmercator` writes metres. mapshaper warns on stderr that this is not RFC 7946; add `-proj wgs84` before `-o` if a GeoJSON consumer expects degrees.

## Troubleshooting
- Black blobs from resvg: the SVG has no `fill`; add `-style fill=...`.
- Stderr line `RFC 7946 warning: non-WGS84 GeoJSON output`: harmless after `-proj webmercator`; see above.
- Untested: out-of-memory on large files (the docs point to `mapshaper-xl`).

## Official docs
- [mapshaper repository](https://github.com/mbloch/mapshaper)
- [Command Reference](https://github.com/mbloch/mapshaper/wiki/Command-Reference)
- [mapshaper on npm](https://www.npmjs.com/package/mapshaper)
