---
name: vpype
description: Use vpype to process SVG line geometry through a reproducible command-line pipeline. Load when scaling, translating, ordering, or preparing plotter-oriented paths.
---

# vpype

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use vpype for chained vector geometry operations and plotter-oriented SVG/HPGL preparation. Use Inkscape for general SVG authoring and style work; use resvg for rasterising static SVG.
- VCR evidence covers a simple SVG polyline scaled and translated with stable SVG output on macOS arm64. It does not validate complex SVG semantics, styles, plugins, plotter hardware, or HPGL output.

## Capability map
- **Input and output:** `read` and `write` convert supported vector input/output; [CLI reference](https://vpype.readthedocs.io/en/stable/reference.html#read) documents formats and options. The fixture tests simple SVG read/write only.
- **Geometry:** `scale`, `scaleto`, `translate`, `rotate`, `crop`, `linesort`, `linemerge`, and simplification commands operate on line geometry. The fixture tests only `scale` and `translate`; other commands remain untested in VCR.
- **Pipelines and scripting:** commands chain in one invocation; `--include` loads a command file and `--seed` controls random operations. See [CLI fundamentals](https://vpype.readthedocs.io/en/stable/); these routes are documented, not fixture-tested.
- **Python API and plug-ins:** the [API reference](https://vpype.readthedocs.io/en/stable/api.html) and [plug-in guide](https://vpype.readthedocs.io/en/stable/plugins.html) describe extension surfaces; VCR has not tested them.

## Install and doctor
```sh
uv tool install vpype==1.15.0
vpype --version  # expect: vpype 1.15.0
vcr doctor
```
The fixture ran vpype 1.15.0 on macOS 26.6 arm64. Installation on macOS arm64 was not separately validated; some optional plug-ins may need compiled wheels.

## Smoke test
```sh
vcr example create vpype-scale
cd examples/vpype-scale && ./run.sh
# expect: vpype scaled the path and repeated output matched
```
The checker also requires points `10,10 50,10 50,50`, viewBox `0 0 100 80`, and a stable output hash for vpype 1.15.0.

## Troubleshooting
- **The expected hash changes:** confirm vpype is 1.15.0 and the command retains `--dont-set-date`; output metadata can otherwise make identical geometry hash differently.
- **A plug-in fails to install:** the base CLI fixture does not require plug-ins; compiled dependencies vary by platform.

## Official docs
- [vpype 1.15.0 CLI reference](https://vpype.readthedocs.io/en/stable/reference.html)
- [vpype project documentation](https://vpype.readthedocs.io/en/stable/)
