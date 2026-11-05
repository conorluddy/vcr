---
name: pixijs
description: Operate PixiJS manual WebGL scenes for VCR browser capture once GPU-backed 2D geometry is selected. Covers time-derived transforms and explicit rendering, with a scoped alpha fixture.
---

# PixiJS

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits

The fixture proves procedural Graphics geometry, container transforms, manual WebGL drawing and alpha capture with PixiJS 8.22.0, Chromium 156.0.8078.4 and Playwright 1.64.1 on macOS arm64. It is not evidence for WebGPU, sprite throughput, filters, text, texture loading, export APIs or other machines. Use Konva for small interactive Canvas scenes; use Three.js for real 3D.

## Install and doctor

Install `pixi.js@8.22.0` in the selected workspace with pnpm. Run `vcr doctor` to inspect machine availability, and set up capture with `vcr setup capture --yes` if required. A card or this guide does not establish that dependencies are installed. The fixture loads the local package's `dist/pixi.min.js`; do not replace it with an unpinned CDN URL.

## Smoke test

Find the fixture with `vcr tools examples pixijs`. Outside the repository, copy it with `vcr example create pixijs-capture`, install its dependencies and use `vcr capture` with `--verify` according to the copied example instructions. Inside the repository:

```sh
examples/pixijs-capture/run.sh
# expect: pixijs-capture: OK (<measured fps> fps)
```

The FPS is measured, not a performance target. Expected facts are in `expected/summary.json`.

## Scene contract

Initialize asynchronously before exposing `window.__scene`. The fixture uses `preference: 'webgl'`, `autoStart: false`, `sharedTicker: false`, `backgroundAlpha: 0`, resolution 1 and `preserveDrawingBuffer: true`. It also asserts `renderer.type === PIXI.RendererType.WEBGL` so another backend cannot receive credit.

```js
await app.init({ width:1280, height:720, preference:'webgl',
  autoStart:false, sharedTicker:false, backgroundAlpha:0,
  preserveDrawingBuffer:true, resolution:1 });
app.stop();
window.__scene = { duration:3, seek(t) {
  requestAnimationFrame(() => {
    group.rotation = 0.18 * Math.sin(t * 2);
    app.render();
  });
}};
```

Build geometry once, then assign every animated property from seconds `t`. Do not accumulate rotation or start a ticker. The animation-frame callback follows the capture fixture's WebGL scheduling pattern. No shared timeline adapter is implied.

## Feedback loop

The run script captures 90 frames at 1280x720, verifies shuffled-order equality, requires changing hashes and asserts alpha extrema 0 and 1 on frame 45. It fails even in recording mode when these invariants fail. Inspect output frames at intended scale before accepting changed expectations. PNGs remain under ignored `output/`.

## Troubleshooting

The fixture passed its first capture without a renderer workaround. Treat render mismatches independently: inspect per-frame state, bisect scene elements and follow `start/references/determinism.md`. Do not re-record a mismatch as expected success.

## Official docs

- [Application 8.22.0](https://pixijs.download/v8.22.0/docs/app.Application.html): async initialization, explicit render and ticker control.
- [MIT licence at v8.22.0](https://github.com/pixijs/pixijs/blob/v8.22.0/LICENSE), checked 2026-11-05. Redistribution requires the licence notice; dependency and downloaded browser build terms are separate.
