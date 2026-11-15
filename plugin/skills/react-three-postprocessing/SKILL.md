---
name: react-three-postprocessing
description: Declarative effects inside React Three Fiber. Load for JSX effect stacks; tested effects and Bloom alpha behavior are limited to the fixture.
---

# React Three Postprocessing

`vcr` means `pnpm vcr` in this repository or `node <plugin-root>/cli/vcr.mjs` from an installed plugin. Run it from the workspace.

## Use cases and limits

pmndrs React wrapper around the postprocessing library: an EffectComposer and effect components (Bloom, DepthOfField, SSAO, Vignette, ToneMapping, LUT and more) placed inside an R3F canvas. Driven by JSX and props; output is the post-processed canvas. Strength is composing effect stacks declaratively in the same tree as the scene.

Use this when the scene already uses its native API and the evidence scope fits. VCR has no shared renderer or timeline adapter. Prefer Three.js directly for non-R3F scenes; use Blender for offline cinematic work.

## Capability map

Composer and effect components: [project README](https://github.com/pmndrs/react-postprocessing) and [effects catalog](https://docs.pmnd.rs/react-postprocessing/effects/introduction). Fixture tests `EffectComposer`, `Bloom`, `ChromaticAberration`; other effects and temporal/random effects untested.

Official docs cover more than VCR's fixture. Evidence: package 3.2.2, macOS arm64, Node 22.19.0, Playwright 1.64.1, Chromium 156.0.8078.4.

## Install and doctor

```sh
pnpm add @react-three/postprocessing postprocessing
vcr doctor
```

Installation is machine-specific; check `vcr doctor`. Documentation or fixture evidence does not establish installation on this machine.

## Smoke test

Create the example with `vcr example create react-postprocessing-capture`; change to the printed destination and run:

```sh
pnpm install
vcr setup capture --yes  # once per machine, if needed
./run.sh
# expect: react-postprocessing-capture: OK (<fps> fps; varies by machine)
```
The fixture checks 90 frames at 1280×720, shuffled/sequential equality, distinct hashes and frame-45 alpha. Bloom introduces faint alpha haze. Inspect its README and source before adapting it.
## Scene contract

Expose `window.__scene = { duration, seek }`. Make each visual value a pure function of `t` and fixed seed. Follow the framework-specific seek pattern in the example. No shared renderer or timeline is implied.

## Recipe

Copy the example, retain compatible package versions, and adapt its scene. Keep content and design inputs explicit; derive transforms and effect parameters from `t`, not accumulated state. Load local assets before exposing `__scene`; inspect captured frames after changes.

## Troubleshooting

- Blank scene or module errors: ensure peer dependencies resolve consistently, serve module imports over HTTP, and inspect the fixture capture log.
- Shuffled frames differ: remove clock advancement or unseeded randomness; set every animated value from `t`.
- Unexpected transparency: check canvas clear alpha and effect alpha handling. Bloom in the tested postprocessing stack adds a faint haze.

## Official docs

- https://github.com/pmndrs/react-postprocessing
- [VCR capture](https://github.com/conorluddy/vcr/tree/main/packages/capture)
- [Example source](https://github.com/conorluddy/vcr/tree/main/examples/react-postprocessing-capture)
