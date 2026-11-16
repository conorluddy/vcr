---
name: dotlottie
description: Play and seek Lottie or dotLottie animations in a browser using the official dotLottie Web runtime. Load when playback needs the `.lottie` container, ThorVG WASM, or deterministic frame seeking.
---

# dotLottie Web

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- VCR evidence covers `@lottiefiles/dotlottie-web` 0.83.2 loading an owned `.lottie` archive and drawing frames 0, 15 and 30 into a transparent 64×64 canvas in Chromium 156 on macOS arm64. Sequential and shuffled frame hashes match.
- This is playback, not animation authoring. The fixture does not cover text, masks, effects, themes, state machines, audio, third-party assets, or general Lottie compatibility. Use Anime.js or Web Animations API to author motion; use `lottie-web` when its SVG renderer or legacy feature set is needed.
- Treat the `.lottie` archive and its embedded assets as separately licensed inputs.

## Capability map
- The [dotLottie Web docs](https://github.com/LottieFiles/dotlottie-web/tree/v0.83.2) cover the `DotLottie` player, loading, playback controls, events, rendering configuration and archive inputs. The [package README](https://github.com/LottieFiles/dotlottie-web/blob/v0.83.2/packages/web/README.md) is the version-pinned entry point.
- The runtime also documents worker and framework integrations; those are discoverability links, not VCR-validated routes.
- VCR tests `.lottie` loading, `setFrame()`, exact sampled canvas pixels, transparency and seek-order repeatability. Other playback controls, renderers, integrations and animation features remain untested.

## Install and doctor
```text
pnpm add @lottiefiles/dotlottie-web@0.83.2
```
The fixture pins this package and bundles locally installed WASM. Confirm the package resolves in the project and run `vcr doctor` for the browser/capture prerequisites. This does not claim the package is installed.

## Smoke test
```text
./examples/dotlottie-wasm-seek/run.sh
# expect: dotLottie fixture OK; toolVersion 0.83.2; sampledFrames 0, 15, 30; shuffledHashesMatch true; browserErrors []
```
The recorded host, Chromium version and pixel hashes are included in the JSON line and vary by environment; assertions compare them with the fixture baseline.

## Scene contract
The fixture uses an HTML canvas and calls the player from a capture script. For deterministic capture, wait for both the runtime and animation to load, pause autonomous playback, set an absolute frame with `setFrame(frame)`, then wait for a browser paint before reading pixels. Do not assume this API route makes every feature deterministic; only the tested frames and renderer are covered.

## Troubleshooting
- The canvas stays blank: wait for the player's load event/state and check that the `.lottie` archive and WASM URL resolve locally.
- WASM fails to load: serve it with `application/wasm` and use a package-local copy rather than relying on a remote CDN during capture.
- Sequential and shuffled frames differ: set an absolute frame on every capture, wait for paint, and compare the browser errors and exact package/browser versions.

## Official docs
- [dotLottie Web 0.83.2 repository and docs](https://github.com/LottieFiles/dotlottie-web/tree/v0.83.2)
- [Version-pinned web package README](https://github.com/LottieFiles/dotlottie-web/blob/v0.83.2/packages/web/README.md)
- [dotLottie format overview](https://dotlottie.io/)
