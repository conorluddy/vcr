---
name: makerjs
description: Build parametric 2D line models in Node with Maker.js, union shapes, offset outlines and export SVG or DXF with no browser, then rasterise with resvg. Load once Maker.js has been chosen for laser, plotter or technical line-art stills.
---

# Maker.js

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Geometry in, SVG or DXF out: shapes are plain objects, combined with real operations (union, outline offset). It makes stills. It has no animation model; to move geometry, regenerate it per frame as a pure function of `t` in your own code (untested).
- Evidence covers one plate (rounded rectangle unioned with a circle, plus a hole), a 3 mm outline offset, SVG and DXF export, on macOS arm64 with Node 22 and makerjs 0.19.2. Everything else is untested.
- Use `paper-js` for browser path booleans, `vpype` to optimise plotter SVG afterwards, `build123d` for 3D solids.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Built-in models (`RoundRectangle`, `Ellipse`, ...) | [models](https://maker.js.org/docs/basic-drawing/) | tested |
| `model.combineUnion`, `outline` | [combining](https://maker.js.org/docs/working-with-models/) | tested |
| SVG export (`exporter.toSVG`) | [exporting](https://maker.js.org/docs/exporting/) | tested |
| DXF export (`exporter.toDXF`) | [exporting](https://maker.js.org/docs/exporting/) | tested, entities counted only |
| PDF, OpenJSCAD export; fonts via opentype.js; chains, layout | [docs index](https://maker.js.org/docs/) | untested |

## Install and doctor
```sh
pnpm add makerjs@0.19.2
```
A project-local library: `vcr doctor` does not probe it.

## Smoke test
```sh
cd examples/makerjs-offset-svg && ./run.sh
# expect: OK: makerjs-offset-svg
```
Renders twice in separate processes and requires identical SVG and DXF bytes, then diffs `expected/metrics.json` and checks the resvg PNG sizes.

## Recipe: union, offset, export
```js
import makerjs from 'makerjs';

const plate = new makerjs.models.RoundRectangle(80, 40, 8);
const boss = makerjs.model.move(new makerjs.models.Ellipse(14, 14), [64, 4]);
const model = { models: { merged: makerjs.model.combineUnion(plate, boss) } };
const outlined = makerjs.model.outline(model, 3); // grows 3 mm each side; holes shrink
const svg = makerjs.exporter.toSVG(outlined, { accuracy: 0.001, units: makerjs.unitType.Millimeter, stroke: '#c2410c', strokeWidth: '0.5mm', fill: 'none' });
const dxf = makerjs.exporter.toDXF(outlined);
```
```sh
resvg --width 800 --background white outline.svg outline.png
```
- `makerjs` is a CommonJS package; `import makerjs from 'makerjs'` works in ESM.
- Set `accuracy` for byte-stable numbers (tested: identical across processes).
- `combineUnion` mutates its arguments; build fresh models for each variant.

## Troubleshooting
- Strokes are half clipped at the image edge: the SVG viewBox is the exact model extent. Set width and viewBox yourself, or draw into a larger model.
- Offsetting shrinks holes, and a hole smaller than the offset vanishes; check the picture.

## Official docs
- [Maker.js documentation](https://maker.js.org/docs/)
- [microsoft/maker.js](https://github.com/microsoft/maker.js)
- [makerjs on npm](https://www.npmjs.com/package/makerjs)
