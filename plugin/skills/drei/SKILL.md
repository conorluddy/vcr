---
name: drei
description: R3F scenes using Drei helpers. Load when an R3F scene needs these components; VCR validation covers only the fixture subset.
---

# Drei

`vcr` means `pnpm vcr` in this repository or `node <plugin-root>/cli/vcr.mjs` from an installed plugin. Run it from the workspace.

## Use cases and limits

Large collection of ready-made React Three Fiber components and hooks: Environment lighting, Text, Html, loaders, camera rigs, controls, ContactShadows, Float and more. Driven by JSX inside an R3F Canvas; output is the same Three.js scene. Distinguishing strength: removes boilerplate for common scene furniture, though interactive helpers matter little in offline capture.

Use this when the scene already uses its native API and the evidence scope fits. VCR has no shared renderer or timeline adapter. Prefer Three.js directly for non-R3F scenes; use Blender for offline cinematic work.

## Capability map

Components and hooks: staging, geometry, text, lines, controls, loaders and environments in the [Drei README](https://github.com/pmndrs/drei). Fixture tests `RoundedBox`, `Center`, `Line`; text, assets, clock-driven and interaction helpers are untested.

Official docs cover more than VCR's fixture. Evidence: package 10.7.9, macOS arm64, Node 22.19.0, Playwright 1.64.1, Chromium 156.0.8078.4.

## Install and doctor

```sh
pnpm add @react-three/drei
vcr doctor
```

Installation is machine-specific; check `vcr doctor`. Documentation or fixture evidence does not establish installation on this machine.

## Smoke test

Create the example with `vcr example create drei-capture`; change to the printed destination and run:

```sh
pnpm install
vcr setup capture --yes  # once per machine, if needed
./run.sh
# expect: drei-capture: OK (<fps> fps; varies by machine)
```
The fixture checks 90 frames, 1280×720 dimensions, shuffled/sequential equality, 90 distinct hashes and frame-45 alpha. Inspect its README and source before adapting it.

## Scene contract

Expose `window.__scene = { duration, seek }`. Make each visual value a pure function of `t` and fixed seed. Follow the framework-specific seek pattern in the example. No shared renderer or timeline is implied.

## Recipe

Copy the example, retain compatible package versions, and adapt its scene. Keep content and design inputs explicit; derive transforms and effect parameters from `t`, not accumulated state. Load local assets before exposing `__scene`; inspect captured frames after changes.

## Troubleshooting

- Blank scene or module errors: ensure peer dependencies resolve consistently, serve module imports over HTTP, and inspect the fixture capture log.
- Shuffled frames differ: remove clock advancement or unseeded randomness; set every animated value from `t`.
- Unexpected transparency: check canvas clear alpha and effect alpha handling. Bloom in the tested postprocessing stack adds a faint haze.

## Official docs

- https://github.com/pmndrs/drei
- [VCR capture](https://github.com/conorluddy/vcr/tree/main/packages/capture)
- [Example source](https://github.com/conorluddy/vcr/tree/main/examples/drei-capture)
