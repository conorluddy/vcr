---
name: fabric-js
description: Use Fabric.js when a browser canvas needs an editable object model with grouped shapes and programmatic rendering. This guide maps the main API areas; its deterministic capture recipe validates only a small StaticCanvas subset.
---

# Fabric.js

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Fabric.js places shapes, paths, text and images on an object canvas, with groups, transforms, serialization and SVG import/export. Use it when those editable objects and interchange matter.
- It draws through the browser Canvas 2D API; it is not a VCR renderer or timeline. For authored, seekable motion timelines, use GSAP; for a lightweight scene graph, consider Konva.
- The VCR fixture uses `StaticCanvas` with Rect, Circle, Path and Group. It does not validate the full library surface or interactive `Canvas`.

## Install and doctor
```sh
pnpm add fabric@7.4.0
vcr doctor
```
The documented version was 7.4.0 on macOS arm64; installation elsewhere is not established. `vcr doctor` reports machine availability.

## Smoke test
After `vcr example create fabricjs-capture`, change to the destination it prints, install the example dependencies, and run:
```sh
pnpm install
./run.sh
# expect: fabricjs-capture: OK
```
Evidence: Fabric.js 7.4.0, macOS Darwin 25.6.0 arm64, Node 22.19.0, Playwright 1.64.1 and Chromium 156.0.8078.4. The fixture captured 90 alpha frames at 1280×720 and 30 fps; all shuffled frame hashes matched sequential capture, with frame 45 alpha range 0–1. It used the screenshot capture route and Canvas 2D backend.

## API map
Consult the [API index](https://fabricjs.com/api/) and [guides](https://fabricjs.com/docs/) for the version in use.

| Area | Main entry points | Fixture status |
| --- | --- | --- |
| Canvas and draw lifecycle | `StaticCanvas`, `add`, `renderAll`, `setDimensions` | `StaticCanvas`, `add`, `renderAll` exercised |
| Objects and transforms | `FabricObject`, `set`, `setCoords`, `left`, `top`, `angle`, `scaleX`, `scaleY`, `opacity` | These properties exercised on Group and Circle |
| Shapes and paths | `Rect`, `Circle`, `Path`, `Group` | Exercised |
| Interactive editing | `Canvas`, selection, controls and events | Untested |
| Text and images | `FabricText` / `IText`, `FabricImage` | Untested |
| Interchange | `toJSON` / `loadFromJSON`, `toSVG` / `loadSVGFromString` | Untested |
| Animation and effects | `animate`, filters, brushes | Untested |

The recipe creates objects once, derives the relevant properties from seek time `t`, calls `renderAll()` and lets `window.__scene` expose `duration` and `seek` to VCR capture. Keep each property a direct function of `t`; this fixture intentionally avoids Fabric's own animation clock. `requestAnimationFrame` is used only to defer the explicit draw until the browser paints.

## Troubleshooting
- A shuffled capture mismatch means some visual state depends on prior seeks, a clock or randomness. Rebuild state from `t` and draw explicitly; this fixture does not exercise `animate()` or `requestRenderAll()`.
- If the browser cannot load Fabric, verify the package is installed in the example directory and the UMD path `node_modules/fabric/dist/index.min.js` resolves.

## Official docs
- [Fabric.js guides](https://fabricjs.com/docs/)
- [Fabric.js API reference](https://fabricjs.com/api/)
- [StaticCanvas API](https://fabricjs.com/api/classes/staticcanvas/)
- [Canvas API](https://fabricjs.com/api/classes/canvas/)
