---
name: canvaskit-skia
description: Use CanvasKit when a Node scene needs Skia's CPU raster surface and deterministic PNG output without browser capture. The VCR fixture covers simple rectangles only.
---

# CanvasKit / Skia

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; in the VCR repository it is `pnpm vcr`. Run workspace commands from the directory with `vcr.json`.

## Use cases and limits
- Use the Node CPU-WASM `SkSurface` route for crisp raster frames, when Canvas 2D's browser runtime is not needed.
- This fixture proves two non-antialiased rectangles and PNG encoding only. It does not validate browser/GPU surfaces, text shaping, SkSL, PDF/SVG, or animation.
- For browser Canvas scenes, use `canvas-2d`; for richer text shaping, consult the CanvasKit docs but treat it as untested here.

## Capability map
The [CanvasKit quickstart](https://skia.org/docs/user/modules/quickstart/) routes into surfaces and drawing; the [Skia API overview](https://api.skia.org/) documents `SkCanvas`, `SkPaint`, paths, and images; [CanvasKit's package README](https://www.npmjs.com/package/canvaskit-wasm) documents the WASM package entry points. VCR exercises `MakeSurface`, `SkCanvas.drawRect`, snapshot and PNG encode. Text, shaders, browser/GPU, and vector/PDF surfaces are documented but untested.

## Install and doctor
```text
pnpm add canvaskit-wasm@0.42.0
vcr doctor
```
`vcr doctor` does not probe project-local JavaScript imports; resolve the package from the selected project and check its installed version there. The fixture pins its dependencies separately.

## Smoke test
```text
vcr example create canvaskit-skia-raster
cd examples/canvaskit-skia-raster && ./run.sh
# expect: canvaskit-skia-raster: OK (64x48; 192 orange, 64 blue, 2816 transparent; hashes match)
```
This run was validated on macOS 26.6 arm64 with Node 25.6.1 and CanvasKit 0.42.0. It compares decoded pixel counts and two repeat renders.

## Troubleshooting
- WASM initialization fails: use the fixture-pinned package version and load its local WASM asset; do not substitute a browser build.
- Pixel checks change: inspect dimensions, alpha and exact RGBA probes before recording new expectations.

## Official docs
- [CanvasKit quickstart](https://skia.org/docs/user/modules/quickstart/)
- [CanvasKit 0.42.0 npm package](https://www.npmjs.com/package/canvaskit-wasm)
