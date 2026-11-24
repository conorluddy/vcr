---
name: chiitiler
description: Use chiitiler in Node to render an inline MapLibre style to a PNG without a browser. Validated only for an offline background plus GeoJSON fill style; needs Node >= 24.22.1.
---

# chiitiler

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; in the VCR repository it is `pnpm vcr`.

**Node >= 24.22.1 is required.** The VCR workspace default is Node 22, which is below chiitiler's engine floor. The fixture runs Homebrew Node 25 explicitly (`PATH=/opt/homebrew/bin:$PATH`), and `run.sh` exits with a message if `node` is older.

## Use cases and limits
- Use it to turn a MapLibre style into a raster still from Node, with no browser, GPU or capture step. The renderer underneath is CPU-only.
- Tested: an inline `version: 8` style with one `background` layer and one `fill` layer over an inline GeoJSON polygon, rendered through `renderView` (centre 5,5, zoom 4, bearing 0, pixel ratio 1) to a 512x512 PNG. Five predeclared pixels match exactly (RGBA buffer and ImageMagick decode), alpha is 255 throughout, network was refused, and reruns are byte-identical.
- Not tested: remote styles, sources, glyphs, sprites or tiles; text and symbol layers; line, raster and 3D layers; the HTTP server, `/tiles`, `/clip`, CRS routes; `renderTile`, `renderBbox`, `renderProjectedView`; JPEG, WebP, AVIF, `@2x`; other zooms, bearings or platforms; pixel parity with MapLibre GL JS.
- Remote style sources can reach internal resources; only use trusted inputs (catalogue assessment, not run here).
- For interactive or animated maps use MapLibre GL JS in a browser; for charts use `d3`.

## Data visualisation (ADR 0006)
A map is a data visual, so the data-visualisation pillar applies (`references/data-visualisation/README.md`; `vcr rules info <ID>`). The fixture is a colour-only region with no labels, source line or legend, so it does not itself meet `DATA-SOURCE-LINE`, `DATA-PROVENANCE`, `DATA-LABEL-MATCH` or `DATA-COLOUR-NOT-SOLE`. A real map built from it must add those in the scene that composites the PNG; text is untested here. Treat each rendered frame as a still: `DATA-OBJECT-CONSTANCY` and `DATA-LOOP-SEAM` only matter once several camera states are sequenced, which is not validated.

## Capability map
Discovery only; see the [README](https://github.com/Kanahiro/chiitiler).
- Library `Chiitiler` class: `renderView` (tested), `renderTile`, `renderBbox`, `renderProjectedView` (untested). Caches and protocol loaders are constructor options; the fixture uses `ChiitilerCache.noneCache()` and refusing `http`/`https` loaders.
- Style input: MapLibre style spec. Tested layers: `background`, `fill`, GeoJSON source.
- CLI and HTTP server (tile, clip and camera endpoints): untested.

## Install and doctor
```text
pnpm add chiitiler@2.0.3
vcr doctor
```
`vcr doctor` does not probe project-local packages; check the version in the workspace and `node -v`. The record's `installation_status` is `unknown`; never assume it is installed. The fixture also uses `magick` to decode the PNG.

## Smoke test
```text
pnpm install
PATH=/opt/homebrew/bin:$PATH examples/chiitiler-offline-style/run.sh
# expect: chiitiler-offline-style: OK (chiitiler 2.0.3, node v25.6.1, 512 512 px, 5 probes exact, alpha 255..255, PNG sha256 824d2ea4...f948b2)
```
Recorded on macOS arm64, chiitiler 2.0.3, Node v25.6.1, ImageMagick 7.1.2. The PNG hash is from this machine and stack (`@ml2drender/node` 0.4.3); another renderer version may legitimately change it, so re-record `expected/render.json` deliberately.

## Recipe: offline still
```ts
const chiitiler = new Chiitiler({
  cache: ChiitilerCache.noneCache(),
  protocols: { http: refuse, https: refuse }, // throw: any fetch fails the render
  concurrency: 1,
});
const image = await chiitiler.renderView({
  stylejson, center: [5, 5], zoom: 4, bearing: 0, width: 512, height: 512, pixelRatio: 1,
});
const png = await image.toPng(); // image.data is RGBA for pixel probes
```
- Inline everything: no `http` URL, glyph or sprite in the style. Refusing loaders turn a hidden fetch into a failure.
- Probe pixels well inside and outside shapes (about 12 px in and 18 px out at zoom 4), not on antialiased edges.
- At zoom 4 and 512 px, one degree of longitude is about 22.8 px.

## Troubleshooting
- `needs Node >= 24.22.1`: put a newer Node first on `PATH`.
- Native addon fails to load: reinstall with `pnpm install` under the newer Node.
- Network refusal error: the style referenced a remote resource; inline it or treat it as outside the evidence.

## Official docs
- [chiitiler on GitHub](https://github.com/Kanahiro/chiitiler) (2.0.3, MIT)
- [MapLibre style specification](https://maplibre.org/maplibre-style-spec/)
