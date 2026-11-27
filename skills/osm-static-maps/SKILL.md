---
name: osm-static-maps
description: Render a raster map still with a GeoJSON overlay in Node with osm-static-maps (Leaflet in headless Chromium) from a tile server you own or may use. Load once it has been chosen; read the OSM tile policy warning first.
---

# osm-static-maps

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- One map PNG: raster tiles, GeoJSON polygons, markers, attribution. A still only; for vector styles use `chiitiler` or `maplibre-native`, for cleaning geometry first use `mapshaper`.
- **Do not point it at `tile.openstreetmap.org`.** The OSM tile policy (https://operations.osmfoundation.org/policies/tiles/, checked 2026-11-27) requires a distinct, stable User-Agent and a Referer, forbids offline and bulk fetching and "headless bots that pan/zoom the map to force rendering". This tool launches Chromium with a browser User-Agent and defaults to OSM. Use a self-hosted or licensed tile server through `tileserverUrl`, and keep attribution visible.
- Licence is GPL-2.0-only: use it as a build-time tool, and check that before linking it into anything you distribute.
- VCR evidence covers the library with synthetic loopback tiles, one polygon and attribution, macOS arm64, Node 22. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Library `osmsm(options)` returns a PNG Buffer | [README](https://github.com/jperelli/osm-static-maps#readme) | tested |
| `tileserverUrl`, `attribution`, `center`, `zoom`, `width`, `height` | README options table | tested |
| GeoJSON polygon | README | tested |
| Markers, polylines, arrows, scale, `pathOptions` | README | untested; `pathOptions` colours were ignored in the fixture |
| `vectorserverUrl`, CLI `osmsm`, HTTP server, `oxipng` | README | untested |

## Install and doctor
```sh
pnpm add osm-static-maps@5.0.0
```
It uses `puppeteer-core` and does not download a browser. Point it at one: `PUPPETEER_EXECUTABLE_PATH="<path to Chrome or Chromium>"` (the fixture uses the Playwright Chrome for Testing). `vcr doctor` does not probe this.

## Smoke test
```sh
cd examples/osm-static-maps-local-tiles && ./run.sh
# expect: OK: osm-static-maps-local-tiles
```
Starts a loopback tile server, renders twice and requires identical PNG bytes, then checks size, tile requests and four pixels against `expected/metrics.json`.

## Recipe
```js
import osmsm, { closeBrowser } from "osm-static-maps";
const png = await osmsm({ geojson, width: 640, height: 360, center: "-6.27,53.345", zoom: 12,
  tileserverUrl: "http://127.0.0.1:PORT/{z}/{x}/{y}.png", attribution: "your tiles / credit" });
await closeBrowser(); // required or Node never exits
```
- `center` is `lon,lat`; `closeBrowser` is a named export even though the typings put it on the default export.
- For reproducible frames use fixed or pinned tiles; the library only caches responses that carry `max-age`.

## Troubleshooting
- Process never exits: call `closeBrowser()`.
- `Error closing page ... No target with given id` once at shutdown: harmless in the fixture.
- No browser found: set `PUPPETEER_EXECUTABLE_PATH`.

## Official docs
https://github.com/jperelli/osm-static-maps (5.0.0)
