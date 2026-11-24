---
name: maplibre-native
description: Use the MapLibre Native Node binding to render an inline offline MapLibre style to an RGBA buffer without a browser. Validated only on Node 22, macOS arm64, for a background plus GeoJSON fill style.
---

# maplibre-native

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; in the VCR repository it is `pnpm vcr`.

**Pin the Node version.** The binding ships a prebuilt binary per Node ABI. For 6.4.1 on darwin-arm64 there are binaries for Node 20 (ABI 115), 22 (127) and 24 (137), and none for Node 25 (ABI 141). Only Node 22 was run.

## Use cases and limits
- Use it to turn an inline MapLibre style into a raw RGBA still from Node at a predeclared size, with no browser. Camera paths could become frame sequences; sequencing is not validated.
- Tested (Node v22.19.0, binding 6.4.1, macOS arm64, prebuilt binary, no source build): an inline `version: 8` style with a `background` layer and a `fill` layer over an inline GeoJSON polygon, centre 5,5, zoom 4, bearing 0, pitch 0. Output is 512x512 RGBA at pixel ratio 1 and 1024x1024 at ratio 2. Ten probes (five per ratio) match exactly in the buffer and in an ImageMagick decode, alpha is 255 throughout, resource requests were refused and counted as 0, and reruns in a second process are byte-identical.
- Not tested: remote styles, tiles, glyphs or text, sprites, raster sources; line, symbol and 3D layers; non-zero pitch or bearing; `tile` mode; the iOS, Android and Qt SDKs; other zooms, sizes, Node versions or platforms; pixel parity with MapLibre GL JS or chiitiler.
- Versus `chiitiler`: that wraps a MapLibre renderer with its own server, caches and loaders, and needs Node >= 24.22.1. Pick maplibre-native for the direct binding under Node 22 with a `request` hook you control; pick chiitiler for its tile and HTTP routes. For interactive or browser-captured maps use MapLibre GL JS; for data layers in a view-state-driven scene use `deck-gl`.

## Data visualisation (ADR 0006)
A map is a data visual, so the data-visualisation pillar applies (`references/data-visualisation/README.md`; `vcr rules info <ID>`). The fixture is a colour-only region with no labels, source line or legend, so it does not itself meet `DATA-SOURCE-LINE`, `DATA-PROVENANCE`, `DATA-LABEL-MATCH` or `DATA-COLOUR-NOT-SOLE`. A real map must add those in the scene that composites the buffer; text is untested here. `DATA-OBJECT-CONSTANCY` and `DATA-LOOP-SEAM` only matter once several camera states are sequenced, which is not validated.

## Capability map
Discovery only; none of this beyond the first line is VCR validation.
- Tested: `new Map({ request, ratio })`, `map.load(style)`, `map.render({ zoom, center, bearing, pitch, width, height }, callback)`, `map.release()`. Style layers `background` and `fill`, one GeoJSON source.
- Documented, untested: `tile` render mode, remote and local file sources through the `request` hook, glyph and sprite loading, other layer types. See the [package README](https://github.com/maplibre/maplibre-native/tree/main/platform/node) and the [style specification](https://maplibre.org/maplibre-style-spec/).
- Platform SDKs (iOS, Android, Qt) and other build routes: out of scope.

## Install and doctor
```text
cd examples/maplibre-native-offline-render && pnpm install
cd node_modules/@maplibre/maplibre-gl-native && ./node_modules/.bin/node-pre-gyp install --fallback-to-build=false
vcr doctor
```
pnpm 10 skips the package's install script, so the second command fetches the prebuilt binary (about 3.5 MB, into `lib/node-v<ABI>/`). Never build from source. `vcr doctor` does not probe project-local packages; the record's `check_command` constructs and releases a `Map` and prints the version. `installation_status` is `unknown`; never assume it is installed. The fixture also uses `magick` and `jq`.

## Smoke test
```text
examples/maplibre-native-offline-render/run.sh
# expect: maplibre-native-offline-render: OK (maplibre-gl-native 6.4.1, node v22.19.0, ABI 127, 512x512 and 1024x1024 RGBA, 10 probes exact, alpha 255..255, requests 0, sha256 ratio1 d0a9c489...aa203b57, ratio2 c935f369...12ac8b)
```
Recorded on macOS arm64. The hashes are from this machine; another renderer or GPU stack may legitimately change them, so re-record `expected/render.json` deliberately with `run.sh --record`. `run.sh` exits with a message if no binding exists for the running Node's ABI.

## Recipe: offline still
```ts
const map = new mbgl.Map({
  ratio: pixelRatio, // 1 or 2; output is width*ratio by height*ratio
  request: (req, callback) => { urls.push(req.url); callback(new Error(`refused: ${req.url}`)); },
});
map.load(style); // inline style, no http URL, glyphs or sprite
map.render({ zoom: 4, center: [5, 5], bearing: 0, pitch: 0, width: 512, height: 512 }, (error, buffer) => {
  if (error || buffer === undefined) { map.release(); return reject(error ?? new Error("no buffer")); }
  const copy = new Uint8Array(buffer); // valid only inside the callback
  map.release();
  resolve(copy);
});
```
- Refusing `request` turns any hidden fetch into a failure; count calls and require 0 for an offline claim.
- One `Map` per ratio in the fixture; copy the buffer before `release()`.
- Probe well inside and outside shapes (about 12 px in, 18 px out), not on antialiased edges. At zoom 4 and 512 px, one degree of longitude is about 22.8 px.
- Read the raw buffer with `magick -size 512x512 -depth 8 rgba:in.rgba out.png`.

## Troubleshooting
- `no prebuilt binding for node ... (ABI ...)`: the install step did not run (pnpm skipped it) or the Node has no release asset. Run the `node-pre-gyp` command under Node 22 or 24; Node 25 has none.
- Render callback rejected with "no buffer" on success: the binding passes `null`, not `undefined`, as the error despite its typings. Test `error` for truthiness.
- Non-zero request count: the style referenced a remote resource; inline it or treat it as outside the evidence.

## Official docs
- [maplibre-native on GitHub](https://github.com/maplibre/maplibre-native) (BSD-2-Clause); Node binding `@maplibre/maplibre-gl-native` 6.4.1
- [MapLibre style specification](https://maplibre.org/maplibre-style-spec/)
