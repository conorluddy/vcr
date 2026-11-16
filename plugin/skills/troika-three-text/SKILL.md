---
name: troika-three-text
description: Load when Three.js scenes need crisp, dynamically typeset SDF text meshes. This guide covers text sync and glyph layout; rendering is evidenced only for one local font and Latin uppercase text.
---

# Troika Three Text

`troika-three-text` creates text meshes for Three.js. In VCR, use it when text belongs in the 3D scene and must be laid out from a font at runtime. The fixture demonstrates synchronization and layout, plus one repeatable software-WebGL render.

## Use cases and limits

- Use a `Text` mesh for dynamic text, camera-dependent sizing, and scene-integrated labels.
- Use Three.js `TextGeometry` for extruded letterforms, or `msdfgen` when a prebuilt glyph atlas is preferred.
- Evidence is Troika 0.53.1 with Three.js 0.187.0, one local OFL font, and `VCRTOOLS`. It does not establish other fonts, complex scripts, animation, integrations, or physical-GPU output.

## Capability map

- **Text layout and styling:** `Text` properties cover text, font, anchors, alignment, color, outline, stroke, curve, and per-range styles. The fixture exercises local font loading, anchors, font size, color, sync, glyph bounds, caret positions, and block/visible bounds. See the [Troika Three Text README](https://github.com/protectwise/troika/blob/main/packages/troika-three-text/README.md).
- **Batching and font preloading:** `BatchedText` and `preloadFont` are documented upstream but untested here.
- **Evidence boundary:** the screenshot uses Three.js WebGL on ANGLE SwiftShader in headless Chromium. It is not a general rendering or GPU-compatibility claim.

## Install and doctor

Install as a project dependency with `pnpm add troika-three-text`. This is a JavaScript library, not a machine executable; `vcr doctor` does not establish that the project can resolve it. Check from the project with:

```sh
pnpm list troika-three-text
```

The fixture pins Troika 0.53.1, Three.js 0.187.0 and Playwright 1.64.1 in its own lockfile.

## Smoke test

```sh
cd examples/troika-three-text-sync
npm ci
./run.sh
# expect: OK: troika-three-text-sync
```

The fixture waits for `Text.sync()`, checks eight glyphs and 32-value glyph/caret arrays, verifies nonempty bounds, and compares repeated PNG hashes. It runs on the recorded macOS arm64 setup with Chromium 156.0.8078.4 and SwiftShader.

## Sync and render

Call `sync(callback)` after changing text or layout properties before reading `textRenderInfo` or rendering. Sync is asynchronous because layout work may run in a worker. For VCR capture, provide a deterministic scene seek and render after sync completes; the fixture itself is static and uses a one-second scene.

## Troubleshooting

- **No `textRenderInfo` yet:** wait for the `sync()` callback before measuring or rendering.
- **Blank or unstable render:** check that the local font path loads and WebGL is available; the validated fixture uses Chromium SwiftShader and does not cover hardware GPUs.
- **Font/network differences:** keep the font local and licensed; this fixture makes no external font requests.

## Official docs

- [Troika Three Text README](https://github.com/protectwise/troika/blob/main/packages/troika-three-text/README.md)
- [Troika repository](https://github.com/protectwise/troika)
