---
name: ssam
description: Use Ssam to initialize and render a Canvas 2D sketch through its sketch manager. This guide covers a static 32×32 pixel fixture only; export and animation APIs remain untested.
---

# Ssam

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use Ssam when a Vite sketch needs its manager to create and render a Canvas 2D surface. The evidence checks exact RGBA pixels from one owned static sketch and repeatability across two fresh pages.
- No export API, animation, hot reload, GIF/video, WebGL, Three.js or external frame seeking was tested. Use Playwright capture or another tool when the requested output needs time-controlled frames.

## Capability map

The official [Ssam README](https://github.com/cdaein/ssam#readme) documents `ssam(sketch, settings)`, manager rendering, playback/export settings, snapshots and output formats. **VCR exercised:** the ESM package call, one 32×32 Canvas 2D sketch callback, Vite hosting and exact pixel readback. **Documented, not VCR-tested:** playhead/time animation, hot reload, snapshots, GIF/PNG-sequence/MP4/WebM export, WebGL, Three.js and export timing.

| Area | Official reference | VCR evidence |
| --- | --- | --- |
| `ssam(sketch, settings)` and renderer callback | [README](https://github.com/cdaein/ssam#readme) | Static Canvas 2D callback |
| Playhead and playback/export timing | [README](https://github.com/cdaein/ssam#readme) | Untested |
| Snapshots and export formats | [README](https://github.com/cdaein/ssam#readme) | Untested |
| Package terms | [MIT license](https://github.com/cdaein/ssam/blob/main/LICENSE) | Ssam package only |

## Install and doctor

The fixture pins Ssam 0.22.0 and Vite 8.3.5 locally:

```sh
npm ci --prefix examples/ssam-static-canvas
vcr setup capture --yes
vcr doctor
```

The runner uses VCR's Playwright installation (or `VCR_PLAYWRIGHT_PATH`) and an available Chrome for Testing 156.0.8078.4. `vcr doctor` reports supported machine tools; it does not validate the Ssam package or this rendering route.

## Smoke test

```sh
vcr example create ssam-static-canvas
cd examples/ssam-static-canvas
npm ci
./run.sh
# expect: OK: Ssam canvas size, exact pixels and fresh-manager repeat match expected/result.json
```

Evidence: Ssam 0.22.0, Vite 8.3.5, Playwright 1.64.1 and Chrome for Testing 156.0.8078.4 on macOS arm64. The four 16×16 quadrants each contain 256 exact RGBA pixels; two fresh manager renders have matching dimensions and pixels. Manager callback count can vary and is not asserted.

## Scene contract

This fixture does not expose `window.__scene = { duration, seek }`; it calls the Ssam manager for a static sketch in fresh browser pages. The evidence does not validate frame seeking or animation, so do not pass it to `vcr capture` as a seekable scene.

## Troubleshooting
- No canvas appears: confirm the Vite page reaches the Ssam entrypoint and that the sketch callback draws to its supplied canvas.
- Draw count varies: the manager may invoke a static sketch more than once; compare final pixels and dimensions, not callback count.
- Browser startup fails: ensure the VCR Playwright package and its Chrome for Testing binary are available, or set `VCR_PLAYWRIGHT_PATH` to Playwright.

## Official docs

[Ssam README](https://github.com/cdaein/ssam#readme) · [Ssam repository](https://github.com/cdaein/ssam) · [MIT license](https://github.com/cdaein/ssam/blob/main/LICENSE)
