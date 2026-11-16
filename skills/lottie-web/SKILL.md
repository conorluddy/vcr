---
name: lottie-web
description: Play frame-addressable Lottie JSON in a browser scene. Use when an existing animation asset must be rendered through the Lottie Web runtime and sought for capture.
---

# Lottie Web

`vcr` below means `pnpm vcr` inside this repository, or `node <plugin-root>/cli/vcr.mjs` from an installed plugin; run commands from the workspace.

Evidence: Lottie Web 5.13.0 with Playwright 1.64.1 and Chromium 156.0.8078.4 on macOS 26.6 arm64. The fixture seeks one owned SVG rectangle to three frames and compares sequential and shuffled captures. Other animation features and assets are untested.

## Use cases and limits
- The runtime plays Lottie JSON; it does not create or edit the source animation. Choose it when the input is already a compatible Lottie asset.
- Evidence covers one SVG shape layer, three frame positions and repeatable seek order only. It does not establish broad asset compatibility, expressions, text, masks, images, effects, canvas or HTML renderers.
- For coded DOM/SVG motion, use Web Animations API or Anime.js instead of introducing a Lottie asset.

## Capability map
- `loadAnimation`: choose a container, renderer, and either `path` or `animationData`; configure looping and autoplay ([options reference](https://github.com/airbnb/lottie-web/wiki/loadAnimation-options)).
- Animation controls include `play`, `pause`, `stop`, `setSpeed`, segment playback and `goToAndStop` ([Web API reference](https://github.com/airbnb/lottie/blob/master/web.md)).
- Renderer support and settings are documented in the [feature matrix](https://github.com/airbnb/lottie-web/wiki/Features) and [renderer settings](https://github.com/airbnb/lottie-web/wiki/Renderer-Settings).
- VCR exercised SVG rendering and `goToAndStop(frame, true)` at frames 0, 15 and 30. Other renderer paths and API areas remain untested.

## Install and doctor
```sh
pnpm add lottie-web@5.13.0
vcr setup capture --yes
vcr tools info lottie-web
```
The package is project-local; `vcr doctor` does not probe it. Confirm it with `pnpm list lottie-web --depth 0`. Capture setup is a separate machine-level requirement.

## Smoke test
```sh
vcr setup capture --yes   # once per machine
./examples/lottie-web-seek/run.sh
# expect: expected/metrics.json matches the run; sequential_and_shuffled_equal is true
```
The fixture also asserts the rectangle's 16×16 SVG geometry and red fill at all three frames. Its screenshot hashes depend on the recorded browser/runtime versions.

## Scene contract
```js
const animation = lottie.loadAnimation({
  container: document.querySelector("#animation"),
  renderer: "svg",
  loop: false,
  autoplay: false,
  animationData,
});

await new Promise((resolve) => animation.addEventListener("DOMLoaded", resolve, { once: true }));
window.__scene = {
  duration: animation.getDuration(true) / 30,
  seek: (seconds) => { animation.goToAndStop(seconds * 30, true); },
};
```
This illustrates frame seeking; only the fixture's own scene is validated. Match the frame rate and asset duration to the production, await renderer readiness, and keep `seek` deterministic.

## Troubleshooting
- `SVG path not found`: wait for the asset's DOM render to finish and verify it uses a compatible shape layer/renderer.
- Sequential and shuffled images differ: check that autoplay is disabled and every requested time is set explicitly.
- The fixture cannot find Playwright: run `vcr setup capture --yes` and confirm the `VCR_HOME` runtime is available.

## Official docs
- [Web player API](https://github.com/airbnb/lottie/blob/master/web.md)
- [Animation loading options](https://github.com/airbnb/lottie-web/wiki/loadAnimation-options)
- [Version 5.13.0 release notes](https://github.com/airbnb/lottie-web/blob/master/History.md#v-5130)
