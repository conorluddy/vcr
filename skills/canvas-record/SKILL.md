---
name: canvas-record
description: Record frames from a canvas that your scene can draw on demand. Load when exporting a controlled Canvas 2D, WebGL or WebGPU sketch directly in the browser.
---

# Canvas Record

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use Canvas Record when the scene owns a canvas and can render each requested frame explicitly.
- It records the canvas only. It does not capture DOM or SVG around it; use Playwright for whole-page capture, or the shared VCR capture route for repeatable server-side frame capture.
- VCR evidence covers the manual `Recorder.start` / `step` / `stop` route, WebCodecs VP9 WebM, 32×32 frames and Chrome for Testing 156.0.8078.4 on macOS arm64. Other codecs, formats, encoders, alpha, browsers and dimensions are untested.

## Capability map
- The upstream guide covers browser recording and canvas-region capture, with WebCodecs, WASM and frame-sequence encoder routes; see the [project README/API](https://github.com/dmnsgn/canvas-record) and [published package](https://www.npmjs.com/package/canvas-record).
- VCR exercises manual stepped recording to an in-browser VP9 WebM and decodes the result for timing and color checks. Other encoder backends, filesystem export, GIF, image sequences and WebGPU remain documented-but-untested here.

## Install and doctor
```text
pnpm add canvas-record@6.0.0
```
The fixture pins Canvas Record 6.0.0 and Vite 8.3.5 in its own package and reuses the VCR Playwright browser setup. `vcr doctor` has no machine probe for this project-local browser library; resolve it from the scene package and check the package version there.

## Smoke test
```text
vcr example create canvas-record-webm
cd examples/canvas-record-webm && npm ci && ./run.sh
# expect: OK: Canvas Record VP9 WebM metadata, decoded samples and repeat metrics match expected/result.json
```
Expected: two semantically matching, 1-second, 32×32 VP9 WebM recordings with three frames at 3 fps. The fixture samples red, green and blue frames after decoding; small lossy channel differences are allowed. The checked manifest's title mentions VP8, but the actual validated route and expected output are VP9.

## Scene contract
```js
const recorder = new Recorder(canvas, {
  encoderOptions: { codec: "vp09.00.10.08", bitrate: 1_000_000 },
  extension: "webm",
  target: "in-browser",
});
await recorder.start({ initOnly: true });
for (const frame of frames) {
  drawFrame(frame);       // fully determine canvas pixels for this frame
  await recorder.step();
}
const blob = await recorder.stop();
```
The fixture initializes recording without auto-capture and awaits one `step()` after each draw. Keep the scene's time and random seed explicit; wall-clock animation is not covered by the test.

## Troubleshooting
- If VP9 recording fails, check browser WebCodecs encoder support. The fixture intentionally has no fallback to VP8, WASM or FFmpeg.
- A duration or frame-count mismatch usually means a draw was not followed by an awaited `step()`, or the configured frame rate differs from the fixture's three frames per second.
- The example runs in Chromium through Playwright; install the browser with `vcr setup capture` if it is missing.

## Official docs
- [Canvas Record README and API](https://github.com/dmnsgn/canvas-record) (fixture checked 2026-11-16; tested Canvas Record 6.0.0).
