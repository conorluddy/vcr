---
name: skia-canvas
description: Render Canvas 2D scene code headlessly in Node with skia-canvas to PNG frames and outlined-text SVG, with no browser. Load once skia-canvas has been chosen for a Node-side 2D frame renderer.
---

# skia-canvas

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Canvas 2D drawing code in Node, a pure function of `t`, written to PNG frames on the CPU, and to SVG from the same calls.
- It draws one frame per canvas; there is no clock. Loop over `t` yourself and assemble with `ffmpeg`.
- VCR evidence covers rectangles, an arc and one text line in a registered font, CPU raster, PNG and SVG, on macOS arm64 with Node 22. Everything else below is untested.
- Shaped paragraphs, SkSL shaders or path ops: `canvaskit-skia`. Scenes that need DOM, CSS or WebGL: `canvas-2d` with `playwright` capture.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `Canvas`, 2D context, `toBuffer('png')` | [Canvas](https://skia-canvas.org/api/canvas) | tested |
| `FontLibrary.use` from files | [FontLibrary](https://skia-canvas.org/api/font-library) | tested |
| SVG export, `outline: true` | [toBuffer](https://skia-canvas.org/api/canvas#tobuffer) | tested |
| `gpu` flag | [Canvas](https://skia-canvas.org/api/canvas) | `false` tested; GPU untested |
| JPEG, WEBP, raw pixels, multi-page PDF, `density` | [toFile](https://skia-canvas.org/api/canvas#tofile) | untested |
| `Window`, `App` (on-screen) | [Window](https://skia-canvas.org/api/window) | untested |
| Path2D, filters, text metrics, images | [docs index](https://skia-canvas.org) | untested |

## Install and doctor
```sh
pnpm add skia-canvas@4.0.1
```
A project-local library with a prebuilt native binary (npm optional dependency); `vcr doctor` does not probe it. The fixture installed without any build step on macOS arm64.

## Smoke test
```sh
cd examples/skia-canvas-frames && ./run.sh
# expect: OK: skia-canvas-frames
```
Renders twice in separate processes and requires identical hashes, then diffs size, pixel probes and SVG facts against `expected/metrics.json` and rasterises the SVG with resvg at 640x360.

## Recipe: frames and SVG from one function
```js
import { Canvas, FontLibrary } from 'skia-canvas';
FontLibrary.use('My Font', ['fonts/Font.ttf']);

function render(t) {
  const canvas = new Canvas(640, 360);
  canvas.gpu = false; // CPU raster
  const context = canvas.getContext('2d');
  context.font = 'bold 48px "My Font"';
  context.fillText(`t=${t}`, 40, 70);
  return canvas;
}
const png = await render(0.5).toBuffer('png');
const svg = await render(1).toBuffer('svg', { outline: true });
```
- Register fonts from files before drawing; system fonts are not relied on.
- `outline: true` turns text into paths, so the SVG has no `<text>` or font references (tested). SVG carries `width` and `height` but no `viewBox`.
- Use a fresh `Canvas` per frame, as the fixture does.

## Determinism
Hashes of PNG and SVG bytes were identical across two processes on one machine (tested). Equality across macOS and Linux or other CPUs is untested; diff pixel probes, not hashes, across machines.

## Troubleshooting
- No failures were seen in the fixture.
- Untested: if text renders in a fallback face, the family name in `context.font` does not match the one passed to `FontLibrary.use`.

## Official docs
- [skia-canvas documentation](https://skia-canvas.org)
- [skia-canvas repository](https://github.com/samizdatco/skia-canvas)
- [skia-canvas on npm](https://www.npmjs.com/package/skia-canvas)
