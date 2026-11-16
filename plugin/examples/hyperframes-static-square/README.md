# HyperFrames local static square render

## Intent and scope

- **Tool/version:** HyperFrames CLI `0.9.33`; `pngjs` `7.0.0` inspects outputs. HyperFrames is Apache-2.0. The fixture uses its documented `data-no-timeline` route and does not install a proprietary animation library.
- **Claim:** the native `hyperframes render` CLI captures an owned one-second, 12 fps static square composition into a PNG sequence, with checked dimensions, geometry and repeatability across two local runs.
- **Exclusions:** animation, video encoding/containers, audio, registry blocks, sub-compositions, hosted rendering, accounts/API keys, cloud services, fonts, other browsers or dimensions.
- **Environment:** Node 25.6.1, npm 11.9.0, macOS 26.6 arm64, FFmpeg 9.0.2, Google Chrome 157.0.8103.51.
- **Input/rights:** hand-authored HTML with a solid red square on a white 192×108 canvas; no external assets.
- **Install/side effects:** fixture-local `hyperframes@0.9.33` and `pngjs@7.0.0` in ignored `node_modules/`. Render frames and logs remain under ignored `output/`.

## Plan and results

- **Commands:** `npm ci --prefix examples/hyperframes-static-square`; run `run.sh --record`, then `run.sh`.
- **Expected checks:** exactly 12 PNG frames at 192×108, 12 fps and one second. Each contains the same 24×24 red square at the same bounds; two independent local renders have identical decoded pixel hashes.
- **Result:** pass. HyperFrames CLI `0.9.33` rendered both sequences; all frame dimensions, square bounds and repeated pixel hashes matched. Google Chrome `157.0.8103.51` was selected by absolute path and reported its version directly. The output is intentionally static and makes no animation claim.
- **Limits:** validates the local static PNG-sequence route only. It does not validate timeline playback, animation authoring, video encoding, audio or hosted rendering.
