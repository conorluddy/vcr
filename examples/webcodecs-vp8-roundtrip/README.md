# WebCodecs VP8 frame round trip

## Intent and scope

- **Tool/build:** native `VideoEncoder` and `VideoDecoder` in Chrome for Testing 156.0.8078.4; VP8 codec string `vp8`.
- **Claim:** browser WebCodecs can encode then decode three owned 32×32 solid-color `VideoFrame`s with known timestamps/durations, preserving frame count, dimensions, timestamps and approximate color; repeated functional metrics match in this browser.
- **Exclusions:** no muxed container, audio, H.264/VP9/AV1, other engines or OS, real-world footage, playback, quality recommendation or encoded-byte identity claim.
- **Environment:** macOS 26.6 arm64; Node 25.6.1; VCR Playwright 1.64.1; Chrome for Testing 156.0.8078.4.
- **Input/rights:** three generated 32×32 solid RGB frames (red, green, blue), no external assets.
- **Dependencies/effects:** browser built-in WebCodecs only. Reuse `$HOME/.vcr/runtime/node_modules/playwright` and its existing Chromium; no packages or browser downloads. Generated buffers and captures stay in ignored `output/`.
- **Documentation:** [MDN WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) and [official WebCodecs specification](https://www.w3.org/TR/webcodecs/), checked 2026-11-16.

## Plan, before running

- **Command:** `./run.sh --record` serves a minimal empty page from a dynamically assigned loopback HTTP port (a potentially trustworthy secure context), launches local Chromium, checks `VideoEncoder.isConfigSupported` and `VideoDecoder.isConfigSupported` for VP8 32×32 at 30 fps, runs a browser encode/decode pass twice, and records functional metrics to `expected/result.json`. `./run.sh` repeats and diffs the metrics.
- **Expected frames:** 32×32; timestamps 0, 33,333 and 66,666 μs; each source `VideoFrame` duration 33,333 μs. Solid red/green/blue frames are encoded as VP8 keyframes at 100,000 bit/s and decoded in the same browser.
- **Expected checks:** both codec support checks pass; exactly 3 decoded frames with 32×32 dimensions and matching timestamps; source and encoded chunk durations are checked when emitted; per-channel mean RGB error no greater than 20 from each intended solid color; repeated functional metrics exactly match. No encoded byte hash requirement.
- **Stop conditions:** exact browser/runtime unavailable, VP8 support check fails, encoder/decoder error, wrong frame count/dimensions/timestamps, decoded color error above 20, or repeat metrics differ.
- **Inspection/reproduction:** `./run.sh --record` then `./run.sh`; numerical color checks inspect every decoded frame. The runner saves decoded PNG previews under ignored `output/` for visual review. Output video is not muxed; no playback claim.

## Observation, after running

- **Date/executor and actual environment:** 2026-11-16, `Conors-MacBook-Pro-2.local`; macOS 26.6 arm64 (Darwin 25.6.0); Node v25.6.1; Playwright 1.64.1; Chrome for Testing 156.0.8078.4.
- **Initial probe/deviation:** WebCodecs globals were unavailable on a fresh `about:blank` page. Serving a minimal page from a loopback secure context enabled WebCodecs; the fixture uses a dynamic local port and shuts down the server after capture.
- **Observed output/checks:** VP8 encoder and decoder support checks passed. Both passes encoded and decoded 3 keyframes at timestamps/durations (0/33,333), (33,333/33,333), (66,666/33,333) μs; every decoded frame was 32×32. Mean RGB values were exactly `[255,0,0]`, `[0,255,0]`, `[0,0,255]` (maximum channel error 0, tolerance 20). Functional metrics matched across passes and the repeat run. Exit status 0.
- **Inspection:** decoded frame PNGs under ignored `output/` visually show the intended red, green and blue fields.
- **Pass and limits:** validated only VP8 32×32 solid-color frames in Chrome 156.0.8078.4. No encoded-byte identity, muxing, playback, audio, other codecs or other engines established. No package/browser install or external asset.
- **Guide:** this evidence may justify a toolkit guide; none was added.
