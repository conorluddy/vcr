---
name: vsketch
description: Use vsketch to author reproducible, plotter-oriented line art in Python and export SVG with the `vsk` CLI. Load when a seeded sketch or parameterised vector output is needed.
---

# vsketch

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use vsketch for Python-authored generative line geometry with repeatable seeds and SVG export. Pair with vpype for downstream path operations. Use p5.js or Canvas 2D for browser sketches and filled/raster output.
- VCR evidence covers one fixed-seed, two-line SVG sketch on macOS arm64 with Python 3.12.13 and vsketch 1.2.0. Plotter hardware, HPGL, other sketches, and broad geometry fidelity remain untested.

## Capability map
- **Project and CLI:** `vsk init`, `vsk run`, and `vsk save` create, preview, and export sketches; see the [CLI workflow](https://vsketch.readthedocs.io/en/stable/). The fixture tests seeded `vsk save` only; interactive preview and project generation are untested.
- **Sketch API:** the [API overview](https://vsketch.readthedocs.io/en/stable/overview.html) describes sketch structure, units, shapes, transforms, layers, and random seeds; the [API reference](https://vsketch.readthedocs.io/en/stable/autoapi/vsketch/index.html) lists the Python surface. The fixture exercises basic line drawing and fixed-seed export; other primitives and APIs are untested.
- **Interoperation:** vsketch can use Python packages such as Shapely and can hand output to vpype; see [using vpype](https://vsketch.readthedocs.io/en/stable/overview.html#using-vpype). These integrations are not covered by the VCR fixture.

## Install and doctor
```sh
uv tool install vsketch==1.2.0
vsk --version  # expect: 1.2.0
vcr doctor
```
The reproducible fixture uses its own `uv.lock` and Python 3.12.13 environment, separate from a global tool installation.

## Smoke test
```sh
vcr example create vsketch-seeded
cd examples/vsketch-seeded && ./run.sh
# expect: OK vsketch SVG geometry: 2 seeded lines, expected viewBox, geometry hash 9ec35f451c7c5c5662d8355980d827405d8632a2a979e01f68cdc1454e01579a
```

## Recipes
```sh
uv run --locked --project . vsk save --seed 1701 --destination output sketch.py
```
Keep the seed and locked environment fixed when comparing exported geometry. The fixture checks exact SVG coordinates and viewBox, not renderer appearance or physical plotter output.

## Troubleshooting
- **Geometry differs from expected:** confirm the locked vsketch version and seed, then inspect `output/sketch_s1701.svg` before updating expected metrics.
- **The export is repeatable but does not match a plotter:** this fixture does not validate device configuration, HPGL, pen assignment, or hardware.

## Official docs
- [vsketch 1.2.0 documentation](https://vsketch.readthedocs.io/en/stable/)
- [vsketch API reference](https://vsketch.readthedocs.io/en/stable/autoapi/vsketch/index.html)
