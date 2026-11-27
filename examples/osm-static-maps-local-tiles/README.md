# osm-static-maps raster map still from a local tile server

## Intent and scope

- Tool/version: `osm-static-maps` 5.0.0 (GPL-2.0-only) with `puppeteer-core`, driving the existing Playwright Chrome for Testing 1208 binary through `PUPPETEER_EXECUTABLE_PATH`.
- Claim: one GeoJSON polygon and an attribution line composite over raster tiles into a 640x360 PNG, byte-identical across two renders, with every tile fetched from a loopback server owned by the fixture.
- Exclusions: tiles from `tile.openstreetmap.org` or any real tile provider, real map content, markers, polylines, scale, `vectorserverUrl`, the CLI and HTTP server, `pathOptions` styling, motion.
- Tile policy (https://operations.osmfoundation.org/policies/tiles/, checked 2026-11-27): requires a distinct stable User-Agent and Referer, forbids offline or bulk downloading and "headless bots that pan/zoom the map to force rendering", requires visible attribution. The tool launches Chromium with a browser User-Agent and its default tile server is OSM, so the default route does not meet that policy. The fixture therefore never contacts OSM.
- Input: 256x256 flat PNG tiles generated in `render.mjs` (two greens, checkered by x+y parity); no external assets.
- Environment: macOS arm64; Node 22.19.0; ImageMagick for pixel probes.
- Output: ignored `output/` (`map.png`, `requests.json`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Predeclared checks: PNG is 640x360; two renders have equal SHA-256; every tile request matches `/12/<x>/<y>.png` on the loopback server; probes at (500,50) and (300,50) equal the two tile colours exactly; a probe inside the polygon has blue greater than red by 20 or more; the attribution box background pixel is brighter than any tile; the picture is inspected at native size.
- Stop if the render needs the network, or bytes differ between runs.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. The first run hung because the shared browser is never closed; the typings document `osmsm.closeBrowser()` but at runtime it is a named export `closeBrowser`, which the fixture imports. It prints once `Error closing page: ProtocolError ... No target with given id` (harmless; the render completes). Six distinct tiles were requested, all local. Reruns are byte-identical.

Deviation: my first attribution check expected 240 or more per channel and failed. The attribution box is semi-transparent white over the tile, giving 238,244,238 (tile 170,200,170). That was a miscalibrated threshold, not a tool fault, so after inspecting the image I changed the check to the observed value. The attribution text is correct and visible bottom-right.

Also seen: `pathOptions` colours in the GeoJSON were ignored; the polygon drew in Leaflet's default blue with light fill. Not asserted.

Inspected at 640x360: checker background, blue-outlined polygon, attribution bottom-right.

Establishes: the library composites GeoJSON and attribution over any `{z}/{x}/{y}` raster server deterministically. Does not establish: OSM tile output, policy-compliant OSM use, other versions or OSes.
