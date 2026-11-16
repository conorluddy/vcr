# Canvas Record stepped VP9 WebM

## Intent and scope

- **Tool/version:** `canvas-record` 6.0.0 `Recorder`; Vite 8.3.5 serves the fixture.
- **Claim:** Canvas Record itself records three generated 32×32 Canvas 2D frames through its manual `start`/`step`/`stop` route to an in-browser WebM using native WebCodecs VP9; readback confirms duration, dimensions and expected frame colors, and a second recording has matching semantic metrics.
- **Exclusions:** MP4/H.264, VP8, WASM or FFmpeg encoders, GIF, image sequences, filesystem export, audio, alpha, other browsers, high-resolution or quality claims.
- **Environment:** macOS 26.6 arm64; Node 25.6.1; Canvas Record 6.0.0; Vite 8.3.5; VCR Playwright 1.64.1; Chrome for Testing 156.0.8078.4.
- **Input/rights:** generated full-frame red, green and blue 32×32 canvases, no external imagery.
- **Dependencies/install plan:** fixture-local exact `canvas-record@6.0.0` and `vite@8.3.5`, installed by `npm ci --prefix examples/canvas-record-webm`. Reuse local Playwright/Chromium. Use Canvas Record's WebCodecs encoder with fully qualified codec `vp09.00.10.08`, extension `webm`, target `in-browser`; no WASM/FFmpeg encoder or browser download. WebM and preview files stay in ignored `output/`.
- **Documentation:** [official Canvas Record README/API](https://github.com/dmnsgn/canvas-record), checked 2026-11-16: `Recorder.start`, `step`, `stop`, extension selection, and encoder options; [MIT license](https://github.com/dmnsgn/canvas-record/blob/main/LICENSE.md).

## Plan, before running

- **Command:** `npm ci --prefix examples/canvas-record-webm`, then `./run.sh --record` starts local Vite and calls Canvas Record's `Recorder` twice in Chromium. Each session uses `start({initOnly:true})`, draws and `await step()`s red/green/blue frames at 3 fps, then stops to an in-browser WebM. `./run.sh` repeats and diffs functional metrics.
- **Expected artifact/checks:** 3 VP9 WebM frames, 32×32, nominal timestamps 0, 0.333 and 0.667 s; duration near 1 s. Inspect container/frame metadata with `ffprobe`; browser media-element readback seeks at 0.05, 0.4 and 0.75 s and checks red/green/blue center pixels within 24 levels per channel. Repeat semantic metrics must match; no encoded byte-hash assertion.
- **Stop conditions:** pinned dependencies/browser unavailable, native VP9 encoder unsupported, Recorder failure, empty/undecodable WebM, wrong dimensions/duration/frame samples or repeat semantic mismatch.
- **Inspection/reproduction:** fixture writes ignored `first.webm`, `second.webm` and decoded PNG previews to `output/`; inspect previews and use `ffprobe` if installed. No other encoder route is tried.

## Observation, after running

- **Date/executor and actual environment:** 2026-11-16, `Conors-MacBook-Pro-2.local`; macOS 26.6 arm64 (Darwin 25.6.0); Node v25.6.1; Canvas Record 6.0.0; Vite 8.3.5; Playwright 1.64.1; Chrome for Testing 156.0.8078.4; FFprobe 9.0.2.
- **Codec selection adjustment:** the first native WebCodecs VP8 probe using `vp08.00.10.08` returned unsupported in this headless Chrome build. One bounded alternate codec passed: VP9 `vp09.00.10.08`; no WASM/FFmpeg encoder fallback was used.
- **Observed output/checks:** each Canvas Record run produced a WebM with VP9, 3 frames, 32×32, 3/1 fps, timestamps 0/0.333/0.667 s and 1.000000 s duration (`ffprobe`). Browser readback at 0.05/0.4/0.75 s yielded red/green/blue center pixels with maximum channel errors 1/0/1 (tolerance 24). Two independent recording runs matched semantically; record and verify exited 0.
- **Inspection:** decoded PNG previews visually show red, green and blue frames.
- **Dependencies/install:** fixture-local exact `canvas-record@6.0.0`, `vite@8.3.5`; `npm ci` installed 32 packages and reported 0 vulnerabilities. Lockfile 35,261 bytes. No separate codec/WASM/browser package was added.
- **Pass/limits:** evidence covers only Canvas Record 6.0.0's stepped in-browser native WebCodecs VP9/WebM route in Chrome 156. No VP8, MP4, WASM/FFmpeg, audio, alpha, playback-quality, or other engine claim. A toolkit guide may now be justified; none was added.
