---
name: pixijs-filters
description: Apply community WebGL display filters to PixiJS containers and sprites. Load when a 2D PixiJS scene needs a ready-made effect; the validated VCR route covers PixelateFilter only.
---

# PixiJS Filters

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits

- Install a `pixi-filters` major compatible with the scene's PixiJS major, then assign a filter to a container or sprite.
- VCR validates only PixelateFilter 6.1.5 with PixiJS 8.23.0 in WebGL under Chromium 156 / ANGLE SwiftShader on macOS arm64. A generated 128×128 checker changes at `t=1`, and repeated effect captures match.
- The fixture does not validate other filters, visual quality for production content, WebGPU, hardware GPUs, performance, or other browser/OS combinations.
- If the scene does not use PixiJS, use an independent canvas or WebGL effect path; for a 3D scene, use `postprocessing`.

## Capability map

- [PixiJS Filters 6 documentation](https://pixijs.io/filters/docs/index.html): filter collection and compatibility map. The fixture uses PixiJS Filters v6 with PixiJS v8.
- [PixelateFilter reference](https://filters.pixijs.download/main/docs/PixelateFilter.html): `size` is set from the scene time in the fixture; other options and filter combinations are documented but untested.
- [Filter package source](https://github.com/pixijs/filters): package and implementation reference; no other filter class is covered by VCR evidence.

## Install and doctor

Pin compatible versions in the project:

```sh
npm install pixi.js@8.23.0 pixi-filters@6.1.5
vcr doctor
```

For the fixture, use `npm ci` in its directory to install the locked PixiJS, Filters and Playwright dependencies. The test captures through Chromium's software WebGL backend, not a physical GPU.

## Smoke test

```sh
vcr example create pixijs-filters-pixelate
cd examples/pixijs-filters-pixelate && npm ci && ./run.sh
# expect: OK: pixijs-filters-pixelate (changed_pixels=15365)
```

The checked summary also requires baseline/effect difference, repeat effect hash equality, 128×128 output, and a SwiftShader renderer. PNGs and logs remain in ignored `output/`.

## Scene contract

The fixture's `window.__scene.seek(t)` sets PixelateFilter size to `[1 + 11t, 1 + 11t]` and renders explicitly. Keep scene output a function of requested time; do not let a live ticker advance the effect during capture. Its minimal fixture omits `duration`, so use the standard VCR `{ duration, seek }` contract when building a complete capture scene.

## Troubleshooting

- Filter import or shader fails: confirm `pixi.js` 8.23.0 and `pixi-filters` 6.1.5; align package majors before changing the fixture.
- Captures are identical or differ unexpectedly: inspect `output/baseline.png`, `output/effect.png`, and `output/metrics.json`; confirm seek values 0 and 1 and explicit `app.render()`.
- SwiftShader assertion fails: the evidence requires the software backend, and does not generalize to GPU hardware or WebGPU.

## Official docs

- [PixiJS Filters documentation](https://pixijs.io/filters/docs/index.html)
- [PixelateFilter API](https://filters.pixijs.download/main/docs/PixelateFilter.html)
- [PixiJS Filters source](https://github.com/pixijs/filters)
