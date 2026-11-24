# chiitiler offline style render

Status: validated on macOS arm64, 2026-11-24 (chiitiler 2.0.3, Node v25.6.1, ImageMagick 7.1.2). Plan written before the first run; see the observation below.

## Intent and scope

- Tool: chiitiler (`chiitiler` npm package), pinned to 2.0.3 (npm latest on 2026-11-24, MIT). Engines: Node `>=24.22.1`.
- Claim: in Node, chiitiler renders an inline offline MapLibre style (one `background` layer and one `fill` layer over an inline GeoJSON source) to a PNG of the requested size, with predeclared pixel colours at known positions, and a rerun produces a byte-identical PNG.
- Exclusions: any remote style, source, glyph, sprite or tile (network is refused on purpose, see below); text and glyph rendering; symbol, line, raster and 3D layers; the HTTP server, `/tiles`, `/clip`, CRS and projected routes, and `generate-tile`; `renderTile`, `renderBbox` and `renderProjectedView`; other formats (JPEG, WebP, AVIF) and `@2x`; other platforms; any claim that the output matches MapLibre GL JS pixel for pixel; any claim about the output at other zooms or bearings.
- Documentation and licence: https://github.com/Kanahiro/chiitiler (README, MIT per the catalogue card and the package's `LICENSE`). Checked 2026-11-24 against the npm package metadata and the installed package's README. The renderer underneath is `@ml2drender/node` (pure Rust, Node-API); its licence is not checked here.
- Environment: macOS arm64 (Darwin 25.6.0). Node v25.6.1 from `/opt/homebrew/bin/node` (the workspace default is Node 22.19.0, which is below chiitiler's engine floor; the run uses the Homebrew Node first on `PATH`). No GPU; the renderer is CPU-only.
- Input: no media. The style is written inline in `render.ts`: a background colour and a GeoJSON polygon (lon 2 to 8, lat 2 to 8). No external rights.
- Dependencies and side effects: `chiitiler@2.0.3` in this example's `package.json`, installed by `pnpm install` at the workspace root (the native addons come with it). `tsx` as in the other Node examples. `magick` (ImageMagick 7) is used by `run.sh` to decode the PNG independently. Network: refused by design during the render. Writes `output/` (ignored) and `expected/render.json` on `--record`.
- Workspace and cleanup: `examples/chiitiler-offline-style/output/` is generated and git-ignored; delete it freely.

## Plan, before running

- Commands: `pnpm install` at the workspace root; then `PATH=/opt/homebrew/bin:$PATH examples/chiitiler-offline-style/run.sh --record`; then `PATH=/opt/homebrew/bin:$PATH examples/chiitiler-offline-style/run.sh`. `run.sh` refuses to run if the Node it finds is below 24.22.1.
- Style (inline, no `http` URL anywhere): `version: 8`; source `area` of type `geojson` with one polygon `[[2,2],[8,2],[8,8],[2,8],[2,2]]`; layers `paper` (`background`, `background-color` `#102030`, RGB 16,32,48) and `fill` (`fill`, `fill-color` `#ffcc00`, RGB 255,204,0, opacity 1). No sprite, no glyphs, no other sources.
- Offline guard: `Chiitiler` is constructed with `ChiitilerCache.noneCache()` and with `http` and `https` protocol loaders that throw. Any network fetch therefore fails the render; a passing run shows the style needed none.
- Render call: `renderView` with centre (lon 5, lat 5), zoom 4, bearing 0, width 512, height 512, pixel ratio 1. At zoom 4 one degree of longitude is about 22.76 px, so the polygon spans about 137 px at the centre of the frame.
- Output: `output/map.png` (the `toPng()` bytes), and `output/render.json` with the versions, the camera, the style, the pixel probes read from the renderer's RGBA buffer, the PNG byte count and SHA-256, and the PNG's dimensions read from its IHDR chunk.
- Predeclared checks (all must hold; no tolerance is widened):
  1. Dimensions: the PNG is exactly 512 x 512 (IHDR), and `magick identify` reports 512 512.
  2. Probes, exact match with alpha 255, both in the renderer's RGBA buffer and in the PNG decoded by ImageMagick:
     - `fill-centre` (256, 256): fill 255,204,0.
     - `fill-inside-left-edge` (200, 256): fill 255,204,0 (about 12 px inside the polygon edge).
     - `background-outside-left-edge` (170, 256): background 16,32,48 (about 18 px outside the edge).
     - `background-top-left-corner` (16, 16): background 16,32,48.
     - `background-bottom-right-corner` (496, 496): background 16,32,48.
  3. Alpha: the minimum and maximum alpha over the whole RGBA buffer are both 255 (the background layer covers the frame, so there is no transparency to test in this fixture).
  4. Offline: the render completes with the refusing `http` and `https` loaders in place.
  5. Rerun: two separate processes produce byte-identical `map.png` (`cmp`).
  6. `output/render.json`, without the `versions` field, equals `expected/render.json` (`jq -S` then `diff`).
- Predeclared "at least two distinct hashes" check: not applicable. The claim is one still image, not a sequence. The probes above stand in for it: the fill and background colours must both appear, so the output is not a blank frame.
- Expected failure modes and stop conditions: (a) Node below 24.22.1 or a native addon that fails to load, then blocked, not a result; (b) the render needs a network fetch, then the claim fails as stated (offline not shown), and it is recorded as partial or fail, not repaired by allowing network; (c) a probe mismatch, then the result is fail or partial and the expected colours are not changed; (d) the PNG decodes to different colours in ImageMagick than in the RGBA buffer, then a partial result with that difference named.
- Inspection: after the run, the contact sheet at `output/contact.png` (made outside `run.sh`) and a read of `expected/render.json`. Look for the polygon in the centre of a blue-black frame, with no clipping and no stray pixels.

## Observation, after running

- Date and host: 2026-11-24, Conors-MacBook-Pro-2.local, macOS arm64 (Darwin 25.6.0).
- Versions: chiitiler 2.0.3 (its `package.json`, read by `render.ts`); the renderer `@ml2drender/node` 0.4.3 with `@napi-rs/image` 1.16.0 (both resolved by the install, not pinned here); Node v25.6.1 from `/opt/homebrew/bin/node`; ImageMagick 7.1.2-35 Q16-HDRI (`magick`). Playwright and Chromium are not used by this example.
- Process: one exploratory `pnpm -s render` before the record (printed the same checks passing; its output was overwritten), then `run.sh --record`, then `run.sh`, which printed `chiitiler-offline-style: OK (chiitiler 2.0.3, node v25.6.1, 512 512 px, 5 probes exact, alpha 255..255, PNG sha256 824d2ea49bdd57562e2eca6e9ff7ec68a60c49f623e8c60f4cc5a4bfc6f948b2)`. A further `run.sh` rerun also passed and gave the same PNG bytes.
- Measured: PNG bytes 9965; IHDR 512 x 512; sha256 of `output/map.png` `824d2ea49bdd57562e2eca6e9ff7ec68a60c49f623e8c60f4cc5a4bfc6f948b2`, identical across the two renders inside each `run.sh` invocation (`cmp`) and on the rerun. Alpha minimum and maximum over the RGBA buffer were both 255. All five probes matched exactly in the renderer's RGBA buffer and in the PNG decoded by ImageMagick: fill-centre, fill-inside-left-edge = 255,204,0; background-outside-left-edge, background-top-left-corner, background-bottom-right-corner = 16,32,48.
- Offline: the render completed with the `http` and `https` loaders refusing, so no fetch was needed or made by the style. The cache was `noneCache`.
- Inspection: `output/contact.png` (the 512 px frame at 50%, flattened on grey) shows a solid yellow square on a dark navy frame, roughly 136 px wide and centred, with no clipping and no stray pixels. The square is the polygon lon 2 to 8, lat 2 to 8 at zoom 4, which is about 6 x 22.8 px per degree, as the plan expected. The background colour fills the rest of the frame.
- Deviations: none from the predeclared checks, and no tolerance was widened. The Node choice is a deviation from the workspace default, not from the claim: chiitiler's engine floor (24.22.1) is above the default Node 22.19.0, so `run.sh` needs the Homebrew Node 25.6.1 first on `PATH`. The `run.sh` guard fails fast with that message otherwise.
- Nondeterminism: none observed. Every PNG from the two `run.sh --record` renders, the two `run.sh` renders and the extra rerun had the same sha256; the exploratory render's bytes were not kept, so it is not counted. The style has no text, so no font or glyph path was exercised.
- What this establishes: on this machine, with chiitiler 2.0.3 under Node 25.6.1, an inline style with a background layer and a GeoJSON fill renders through `renderView` to a 512 x 512 PNG with the predeclared colours at the five probes, fully opaque, with network refused, and repeated renders give identical bytes.
- What it does not establish: any remote style, source, glyph, sprite or tile; text and symbol layers; line, raster and 3D layers; the server, CRS and projected routes; `renderTile` and `renderBbox`; JPEG, WebP, AVIF or `@2x`; Node 22 or other platforms (the engine floor rules Node 22 out); that the output matches MapLibre GL JS; and anything about other zooms, bearings or sizes.
- Reviewer and follow-up: none recorded. Revisit on a chiitiler or `@ml2drender/node` upgrade (the expected render would need deliberate re-recording), or when an offline text or raster fixture is wanted.
