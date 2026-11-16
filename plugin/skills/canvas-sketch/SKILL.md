---
name: canvas-sketch
description: Use canvas-sketch for fixed-size generative Canvas 2D, WebGL or Three.js sketches and still-image export. The VCR evidence covers only a static Canvas 2D manager render in Chromium.
---

# canvas-sketch

`vcr` means `node <plugin-root>/cli/vcr.mjs`, with the plugin root two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits

The validated route uses canvas-sketch 0.7.8's manager to render a fixed 64×48 Canvas 2D sketch twice. On macOS arm64 with Node 25.6.1, Chromium 156.0.8078.4 and Playwright 1.64.1, the canvas size, chosen pixels, transparency and full RGBA hash matched. This is a static fixture only; CLI export, hot reload, animation/time seeking, WebGL, Three.js and other platforms are untested. Use p5.js for its broader sketch API or `web-animations-api` for simple seekable DOM/SVG motion.

## Capability map

- Sketch function and manager settings: dimensions, units, pixel ratio, context and animation ([version 0.7.8 README](https://github.com/mattdesl/canvas-sketch/tree/0.7.8)).
- CLI and export workflows: documented by the upstream [README and examples](https://github.com/mattdesl/canvas-sketch/tree/0.7.8); VCR evidence does not validate hot reload or PNG export.
- Canvas 2D manager creation and fixed-size static drawing are exercised. WebGL, Three.js, animation, interactive manager controls and export routes are documented/discoverable only here, not VCR-tested.

## Install and doctor

In a selected project, install the tested release with `pnpm add canvas-sketch@0.7.8`. Run `vcr doctor` to check machine availability; this guide does not establish that it is installed. The fixture separately pins `canvas-sketch`, esbuild and Playwright in its package lock. Browser capture requires the Playwright runtime and browser; set it up with `vcr setup capture` when working in a VCR workspace.

## Smoke test

From the repository root:

```sh
examples/canvas-sketch-capture/run.sh
# expect: canvas-sketch-capture: OK
```

The fixture bundles `sketch.js`, calls the canvas-sketch manager in Chromium twice, then checks a 64×48 canvas, exact interior and transparent pixels, and identical RGBA hashes. Outside the repository, copy the fixture with `vcr example create canvas-sketch-capture` and follow its package instructions.

## Scene contract

For a seekable scene, keep the sketch output a pure function of the supplied time and seed; do not read a wall clock or accumulate state. The current evidence has `animate: false` and does not prove a time-seeking recipe. A VCR browser scene must expose `window.__scene = { duration, seek }` and assign every animated property from absolute time before capture; adapt the manager only after validating that route.

## Troubleshooting

- The first validation attempt could not launch Chromium under the default sandbox (MachPortRendezvous permission error); it passed with local browser-process permission. If launch fails, check the installed Playwright browser and runtime permissions before changing expected pixels.
- If pixel hashes differ, inspect the generated 64×48 PNG and compare canvas dimensions and RGBA sample points before recording new expectations. The fixture intentionally excludes browser-independent pixel equivalence.

## Official docs

- [canvas-sketch 0.7.8 repository and README](https://github.com/mattdesl/canvas-sketch/tree/0.7.8)
- [canvas-sketch examples](https://github.com/mattdesl/canvas-sketch/tree/0.7.8/examples)
- [MIT licence at 0.7.8](https://github.com/mattdesl/canvas-sketch/blob/0.7.8/LICENSE)
