---
name: svgo
description: Optimise SVG markup with the SVGO CLI or a configured plugin pipeline. Load before storing or rendering static SVG when preserving required IDs and geometry is checked explicitly.
---

# SVGO

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- SVGO removes redundant SVG data and applies configured plugins to reduce markup size.
- Preserve IDs that scripts or animation target: the default preset can clean IDs. Inspect and configure the plugin set for each asset.
- VCR evidence covers one static SVG and one config that preserves its `viewBox` and selected ID. It does not prove arbitrary SVG visual equivalence or animated-browser behavior.

## Capability map
The [SVGO 4.0.1 usage guide](https://svgo.dev/docs/usage/) covers CLI input/output and configuration. The [plugin reference](https://svgo.dev/docs/plugins/) documents the built-in optimizers; [custom plugins](https://svgo.dev/docs/plugins-api/) cover extensions. VCR exercises CLI config loading, multipass optimization, ID preservation, viewBox retention and repeat output. Other plugins, custom plugins and SVG feature classes remain untested here.

## Install and doctor
```sh
npm install --global svgo@4.0.1
svgo --version
# expect: v4.0.1
```
`vcr doctor` checks the `svgo` executable and reports its version; it does not install it.

## Smoke test
```sh
vcr example create svgo-optimization
cd examples/svgo-optimization && ./run.sh
# expect: svgo-optimization: OK
```
Validated with SVGO 4.0.1 on macOS arm64. The fixture requires smaller output, valid XML, preserved `viewBox` and `motion-target` ID, and byte-identical repeated output.

## Recipes
```sh
svgo --config svgo.config.mjs source.svg --output output/optimized.svg
```
The fixture disables `cleanupIds` inside `preset-default`; read the active config before relying on any ID. Its raster inspection uses resvg and is not SVGO validation evidence.

## Troubleshooting
- A required ID disappears or changes: inspect the effective plugin list, especially `cleanupIds`, and add a focused override.
- Output grows or differs between runs: check the config and SVGO version, then compare the optimized SVG and retained expected metrics.
- An SVG renders differently after optimization: reduce the plugin set and verify the actual downstream browser or rasterizer; the fixture does not establish general equivalence.

## Official docs
- [SVGO v4 usage](https://svgo.dev/docs/usage/)
- [SVGO v4 plugin reference](https://svgo.dev/docs/plugins/)
- [SVGO plugin API](https://svgo.dev/docs/plugins-api/)
