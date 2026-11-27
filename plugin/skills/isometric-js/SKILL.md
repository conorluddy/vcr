---
name: isometric-js
description: Build flat isometric scenes (blocks, planes, diagrams) as static SVG in Node with @elchininet/isometric and jsdom, one scene per frame from time t, then rasterise with resvg. Load once this library has been chosen for isometric vector illustration.
---

# isometric (@elchininet/isometric)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Flat isometric drawing: rectangles, circles, stars, paths and text placed on three planes. Output is plain SVG `<path>` elements, drawn in the order you add them. There are no solids, booleans or depth sorting; you order faces yourself. For voxel solids use `heerich`; for real 3D use `three-js`.
- Its own animations are SVG `<animate>` elements and cannot be seeked. Rebuild the scene from `t` for every frame and render static SVG.
- VCR evidence covers `IsometricRectangle` on the TOP, FRONT and SIDE planes, explicit ids, jsdom 31, Node 22 on macOS arm64. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `IsometricCanvas`, `getSVGCode()` | [README, API](https://github.com/elchininet/isometric#api) | tested |
| `IsometricRectangle`, plane views | [README](https://github.com/elchininet/isometric#class-isometricrectangle) | tested |
| `IsometricCircle`, `StarPolygon`, `Pentagram`, `Path` | [README](https://github.com/elchininet/isometric#api) | untested |
| `IsometricText` | [README](https://github.com/elchininet/isometric#class-isometrictext) | untested; emits `<text>`, so it needs a font |
| `IsometricGroup`, dragging, textures, `addAnimation` | [README](https://github.com/elchininet/isometric#api) | untested |

## Install and doctor
```sh
pnpm add @elchininet/isometric@4.0.2 jsdom@31
```
A project-local library: `vcr doctor` does not probe it. Import from `@elchininet/isometric/node`; the root entry expects a browser `document`.

## Smoke test
```sh
cd examples/isometric-svg-scene && ./run.sh
# expect: OK: isometric-svg-scene
```
Renders three frames in two processes and in shuffled order, requires identical bytes, checks structure and a 120 px rise, and rasterises 800x600 PNGs with resvg.

## Recipe: a frame from time t
```js
import { IsometricCanvas, IsometricRectangle, PlaneView } from '@elchininet/isometric/node';

function frame(t) {
  const canvas = new IsometricCanvas({ id: 'scene', width: 800, height: 600, scale: 40, backgroundColor: '#fff' });
  canvas.addChild(new IsometricRectangle({ id: 'top', planeView: PlaneView.TOP, top: 1 + 3 * t, width: 2, height: 2 }));
  return canvas.getSVGCode();
}
```
- Pass an `id` to the canvas and to every element. Without ids the library generates random ones and the bytes differ on every run (seen). With them, output was identical across processes and order.
- Axes on screen: `right` runs down-right, `left` runs down-left, `top` runs up; one unit is `scale` pixels along an axis. TOP spans right x left, FRONT spans left x top (width along `left`) at a fixed `right`, SIDE spans right x top (width along `right`) at a fixed `left`.
- A block is three rectangles: TOP at `top + height`, FRONT at `right + width`, SIDE at `left + depth`. Placing faces at the near edge instead gives disconnected shapes (seen in the first attempt).

```sh
resvg --width 800 --background white frame.svg frame.png
```

## Troubleshooting
- Differing hashes between runs: a missing explicit id.
- `document is not defined`: imported the root entry; use `@elchininet/isometric/node` with jsdom installed.

## Official docs
- [isometric repository and README](https://github.com/elchininet/isometric)
- [@elchininet/isometric on npm](https://www.npmjs.com/package/@elchininet/isometric)
