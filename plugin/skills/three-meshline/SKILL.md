---
name: three-meshline
description: Thick, dashed or tapered camera-facing strokes in Three.js. Load for the original `three.meshline` package; the pmndrs fork is separate and untested.
---

# THREE.MeshLine

`vcr` means `pnpm vcr` in this repository or `node <plugin-root>/cli/vcr.mjs` from an installed plugin. Run it from the workspace.

## Use cases and limits

Replacement for THREE.Line that draws lines as strips of camera-facing triangles, so width, dashes and taper work where WebGL lines are fixed at one pixel. Supplies MeshLine geometry, MeshLineMaterial and raycast. Two packages exist: three.meshline from the original author (2.0.0, 2026) and meshline, the pmndrs fork used by R3F (3.3.1, 2024).

Use this when the scene already uses its native API and the evidence scope fits. VCR has no shared renderer or timeline adapter. Prefer Three.js directly for non-R3F scenes; use Blender for offline cinematic work.

## Capability map

`MeshLine`, `MeshLineMaterial`, width, color, dash, visibility and raycast: [original README](https://github.com/spite/THREE.MeshLine). Fixture tests width, color, dash offset, visibility and per-seek point rebuild; raycast, textures, fog untested.

Official docs cover more than VCR's fixture. Evidence: package 2.0.0, macOS arm64, Node 22.19.0, Playwright 1.64.1, Chromium 156.0.8078.4.

## Install and doctor

```sh
pnpm add three.meshline
vcr doctor
```

Installation is machine-specific; check `vcr doctor`. Documentation or fixture evidence does not establish installation on this machine.

## Smoke test

Create the example with `vcr example create meshline-capture`; change to the printed destination and run:

```sh
pnpm install
vcr setup capture --yes  # once per machine, if needed
./run.sh
# expect: meshline-capture: OK (<fps> fps, <count> distinct hashes; both vary by run)
```
The fixture checks 90 alpha frames at 1280×720, shuffled/sequential equality and frame-45 alpha. Inspect its README and source before adapting it.
## Scene contract

Expose `window.__scene = { duration, seek }`. Make each visual value a pure function of `t` and fixed seed. Follow the framework-specific seek pattern in the example. No shared renderer or timeline is implied.

## Recipe

Copy the example, retain compatible package versions, and adapt its scene. Keep content and design inputs explicit; derive transforms and effect parameters from `t`, not accumulated state. Load local assets before exposing `__scene`; inspect captured frames after changes.

## Troubleshooting

- Blank scene or module errors: ensure peer dependencies resolve consistently, serve module imports over HTTP, and inspect the fixture capture log.
- Shuffled frames differ: remove clock advancement or unseeded randomness; set every animated value from `t`.
- Unexpected transparency: check canvas clear alpha and effect alpha handling. Bloom in the tested postprocessing stack adds a faint haze.

## Official docs

- https://github.com/spite/THREE.MeshLine
- [VCR capture](https://github.com/conorluddy/vcr/tree/main/packages/capture)
- [Example source](https://github.com/conorluddy/vcr/tree/main/examples/meshline-capture)
