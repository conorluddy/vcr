---
name: sharp
description: Composite, resize and rasterise images in Node with sharp (libvips), keeping alpha, for VCR stills and overlays. Use once sharp has been chosen over ImageMagick for scripted image work in a Node pipeline.
---

# sharp

Fast Node image processing on libvips, scripted from TypeScript. Evidence: sharp 0.35.5 with libvips 8.18.7 on Node 22.19.0, macOS arm64 (`examples/sharp-composite`, 2026-11-05). Anything beyond that fixture is marked untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Proven: compositing RGBA layers (including half-transparent ones) onto a background with transparent regions, rasterising a simple SVG at a chosen density, resizing, PNG output with alpha kept and blended correctly.
- Untested here: JPEG, WebP, AVIF and GIF output, ICC and colour management, streams, large images and speed, SVG beyond one filled circle, frame-sequence pipelines.
- For one-off CLI work, montage, compare and inspection use `imagemagick`; for SVG rasterisation alone `resvg` is the validated route.

## Install and doctor
```text
pnpm add sharp@0.35.5
node -e "console.log(require('sharp').versions)"   # sharp and vips (libvips) versions
```
sharp ships prebuilt libvips per platform. Record both versions with any evidence: output bytes can change with libvips.

## Smoke test
```text
examples/sharp-composite/run.sh
# expect: sharp-composite: OK (sharp 0.35.5, libvips 8.18.7)
```
It diffs dimensions, channels, six pixel probes and two hashes against `expected/summary.json`.

## Recipes
```ts
import sharp from "sharp";
const overlay = await sharp({ create: { width: 200, height: 200, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 0.5 } } }).png().toBuffer();
const mark = await sharp(readFileSync("mark.svg"), { density: 288 }).resize(128, 128).png().toBuffer();
const png = await sharp(background)
  .composite([{ input: overlay, left: 220, top: 80 }, { input: mark, left: 480, top: 200 }])
  .png()
  .toBuffer();
```
- Rasterise SVG at a high `density` and then `resize` down, rather than at the default 72 dpi.
- Raw pixels come back non-premultiplied RGBA: `await sharp(png).ensureAlpha().raw().toBuffer()`, offset `(y * width + x) * 4`. Red at alpha 0.5 over transparent reads `255,0,0,128`.

## Checking output
- Assert with pixel probes at known coordinates and `metadata()` (`channels`, `hasAlpha`), not by eye alone.
- Cross-check alpha independently: `magick identify -format "%[channels] %A" out.png` should report `srgba`.
- Hash the raw pixels first. The PNG hash was stable across runs on one build, but a different libvips or libpng can change PNG bytes without changing a pixel.

## Troubleshooting
- Output lost alpha (3 channels): an input or the pipeline flattened it; start from a 4-channel `create` or call `ensureAlpha()`.
- PNG hash differs after an upgrade but pixel probes match: libvips or libpng changed; re-record after checking the raw-pixel hash.

## Official docs
- Documentation: https://sharp.pixelplumbing.com/
- Compositing: https://sharp.pixelplumbing.com/api-composite
- Constructor (create, density): https://sharp.pixelplumbing.com/api-constructor
