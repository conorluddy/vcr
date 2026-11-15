---
name: playcanvas-engine
description: Code-authored standalone PlayCanvas Engine scenes, without the cloud editor. Load for its entity-component runtime; tested capture covers primitives only.
---

# PlayCanvas Engine

`vcr` means `pnpm vcr` in this repository or `node <plugin-root>/cli/vcr.mjs` from an installed plugin. Run it from the workspace.

## Use cases and limits

MIT-licensed WebGL2 and WebGPU engine with an entity-component model, PBR, glTF, physics integration and Gaussian splat rendering. Used as a standalone npm library from code, without the PlayCanvas Editor. Distinguishing strength: small runtime footprint, game-style structure and splat support.

Use this when the scene already uses its native API and the evidence scope fits. VCR has no shared renderer or timeline adapter. Prefer Three.js directly for non-R3F scenes; use Blender for offline cinematic work.

## Capability map

Application, graphics, scene, entity/component APIs: [Engine API](https://api.playcanvas.com/engine/) and [User Manual](https://developer.playcanvas.com/user-manual/). Fixture tests transparent WebGL2 primitive rendering only; WebGPU, scripts, physics, assets and splats are untested.

Official docs cover more than VCR's fixture. Evidence: package 2.24.0, macOS arm64, Node 22.19.0, Playwright 1.64.1, Chromium 156.0.8078.4.

## Install and doctor

```sh
pnpm add playcanvas
vcr doctor
```

Installation is machine-specific; check `vcr doctor`. Documentation or fixture evidence does not establish installation on this machine.

## Smoke test

Create the example with `vcr example create playcanvas-capture`; change to the printed destination and run:

```sh
pnpm install
vcr setup capture --yes  # once per machine, if needed
./run.sh
# expect: playcanvas-capture: OK
```
The fixture checks 90 frames at 1280×720, shuffled/sequential equality and frame-45 alpha. Inspect its README and source before adapting it.
## Scene contract

Expose `window.__scene = { duration, seek }`. Make each visual value a pure function of `t` and fixed seed. Follow the framework-specific seek pattern in the example. No shared renderer or timeline is implied.

## Recipe

Copy the example, retain compatible package versions, and adapt its scene. Keep content and design inputs explicit; derive transforms and effect parameters from `t`, not accumulated state. Load local assets before exposing `__scene`; inspect captured frames after changes.

## Troubleshooting

- Blank scene or module errors: ensure peer dependencies resolve consistently, serve module imports over HTTP, and inspect the fixture capture log.
- Shuffled frames differ: remove clock advancement or unseeded randomness; set every animated value from `t`.
- Unexpected transparency: check canvas clear alpha and effect alpha handling. Bloom in the tested postprocessing stack adds a faint haze.

## Official docs

- https://api.playcanvas.com/engine/
- [VCR capture](https://github.com/conorluddy/vcr/tree/main/packages/capture)
- [Example source](https://github.com/conorluddy/vcr/tree/main/examples/playcanvas-capture)
