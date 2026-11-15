# SVGO optimisation fixture

## Intent and scope

- Tool ID and version/build: `svgo` 4.0.1.
- VCR job and exact claim being tested: optimise one small authored SVG while retaining its declared `viewBox` and `motion-target` ID.
- Explicit exclusions: other SVGO versions, custom plugin combinations, arbitrary SVG feature preservation, browser animation and raster equivalence.
- Tool documentation and licence sources, checked 2026-11-15: [SVGO usage documentation](https://svgo.dev/docs/usage/); MIT, as recorded on the tool card.
- Environment: macOS 26.6 arm64, Node.js 22.19.0; SVGO 4.0.1. `resvg` 0.47.0 is used only to inspect the rasterised output.
- Input: fixture-owned `source.svg`; no external assets.
- Dependencies, installation plan, permissions, network and expected side effects: SVGO is already available on the selected machine. No installation or network access is required. Output is written under ignored `output/`.
- Selected workspace, generated output and cleanup paths: this example directory; generated files under `output/`.

## Plan, before running

- Exact commands: `svgo --config svgo.config.mjs source.svg --output output/optimized.svg`; the config disables `cleanupIds` in `preset-default`; repeat to a second output and compare bytes.
- Expected artifacts and predeclared checks: parse as XML; preserve root `viewBox="0 0 100 100"`; preserve `id="motion-target"`; require smaller output than input; require repeated outputs to match byte for byte; record exact SVGO version and SHA-256. The current preset-default docs list `cleanupIds` but not `removeViewBox`, so the fixture tests the default viewBox behavior without configuring a plugin the preset does not contain.
- Intended consumer: SVG scene that references `motion-target`; `resvg` rasterisation is for visual inspection only and is not counted as SVGO evidence.
- Delivery constraints: single static SVG; no raster output is retained.
- Expected failure modes and stop conditions: wrong SVGO version, invalid XML, lost anchor, no size reduction, or repeat-output mismatch stops the fixture.
- Reproduction: `./run.sh --record` records expectations after inspection; `./run.sh` compares against the committed baseline.

## Observation, after running

Pass on 2026-11-15: SVGO 4.0.1 reduced the input from 462 bytes to 399 bytes (13.6%), preserved the `viewBox` and `motion-target` ID, and produced byte-identical output on repetition. XML parsing passed. Raster inspection with resvg 0.47.0 at 512 px showed the gradient and shape intact. This does not establish visual equivalence for arbitrary SVGs or animated browser use.
