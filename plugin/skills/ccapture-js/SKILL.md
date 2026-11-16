---
name: ccapture-js
description: Capture an existing canvas animation at fixed frame steps when it cannot be refactored to seek by time. Load for CCapture.js 2.x browser capture, not for ordinary deterministic scene capture.
---

# CCapture.js

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- CCapture.js hooks a browser clock and captures canvas frames at a chosen fixed rate. Prefer it when an existing `requestAnimationFrame` sketch cannot be changed to render a requested time.
- If you control the scene, make it seekable and use Playwright or Canvas Record instead. The VCR fixture only validates the 2.0.0 PNG TAR route; it does not validate time hooking, motion blur, video, GIF, alpha or timing metadata. Version 2 is a ground-up rewrite; do not apply 1.x tutorials to it.

## Capability map
- **Capture lifecycle and output formats:** the [2.0.0 README](https://github.com/spite/ccapture.js/blob/master/README.md) documents `start`, `capture`, `stop`, `save`, PNG/JPG/WebP, MP4/WebM, and options. The fixture exercises three PNG canvas captures saved as TAR; other formats are untested.
- **Clock control:** [TimeWarp and hooks](https://github.com/spite/ccapture.js/blob/master/README.md#timewarp) cover Date, animation-frame and media time. The fixture disables Date and media hooks and does not test time-warped animation.
- **Encoders and motion blur:** see the [v2.0.0 release notes](https://github.com/spite/ccapture.js/releases/tag/v2.0.0) for WebCodecs encoders and CPU/GPU blur. Untested by VCR.

## Install and doctor
```sh
pnpm add ccapture.js@2.0.0
```
`vcr doctor` has no machine probe for this project-local library. Resolve it from the scene package and check its version with `pnpm list ccapture.js --depth 0`.

## Smoke test
```sh
vcr example create ccapture-js-png-tar
cd examples/ccapture-js-png-tar && npm ci && ./run.sh
# expect: OK: CCapture PNG TAR frame count, pixels and repeat metrics match expected/result.json
```
The fixture captures opaque red, green and blue 32×32 canvases twice and checks the extracted PNG dimensions, pixels and order. It does not verify timestamps or animation timing.

## Troubleshooting
- If `save(callback)` returns no Blob, confirm that `stop()` has completed and that the callback or returned value is awaited; the fixture accepts either result.
- If the archive differs, inspect the extracted frames and browser/package versions. The test compares semantic pixels because TAR metadata may vary.
- If an older tutorial uses the 1.x global bundle or `workersPath`, follow the 2.x README instead; those APIs changed or were removed.

## Official docs
- [CCapture.js 2.0.0 README and API](https://github.com/spite/ccapture.js/blob/master/README.md) and [release notes](https://github.com/spite/ccapture.js/releases/tag/v2.0.0); fixture checked 2026-11-16.
