---
name: manim-community
description: Create Python-authored mathematical and explanatory animations with Manim Community. Load when a scene benefits from mobjects, animation groups or Manim's render CLI.
---

# Manim Community

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- The validated route renders a small 2D Cairo scene to a deterministic PNG sequence. It does not validate text/TeX, OpenGL, 3D, audio, alpha or video encoding.
- Use Manim for code-authored explanatory motion. Use browser libraries for UI motion and Blender for 3D authoring/rendering.

## Capability map
The versioned [Manim 0.22.1 docs](https://docs.manim.community/en/stable/) map animations and mobjects, scene/camera APIs, rendering configuration, text/formula rendering, and the CLI. The [configuration guide](https://docs.manim.community/en/stable/guides/configuration.html) covers renderers, output formats, resolution and frame rate. VCR exercises a Cairo PNG sequence and basic `Scene`, `Square`, `play` and `wait`; other APIs and render modes remain documented but untested.

## Install and doctor
The fixture uses an isolated environment under its ignored `output/` directory:
```text
uv venv --python 3.12 examples/manim-cairo-square/output/venv
uv pip install --python examples/manim-cairo-square/output/venv/bin/python -r examples/manim-cairo-square/requirements.txt
examples/manim-cairo-square/output/venv/bin/manim --version
vcr doctor
```
It pins `manim==0.22.1`; native Cairo, Pango and FFmpeg are prerequisites. The validated host was macOS arm64 with CPython 3.12.13.

## Smoke test
```text
vcr example create manim-cairo-square
cd examples/manim-cairo-square && ./run.sh
# expect: OK: Manim Cairo frame count, geometry, hold and repeat metrics match expected/result.json
```
The fixture checks rightward centroid movement and three identical endpoint frames. It prints detailed environment and frame metrics, so those values vary by host only where noted in `expected/result.json`.

## Troubleshooting
- Runner says isolated environment missing: install the pinned requirements into the example's `output/venv` as above.
- Native dependency build fails: stop rather than silently installing system packages; check Cairo/Pango through `pkg-config` and follow the official installation guide.
- Only ten frames render: the fixture sets `frozen_frame=False` on the final wait so the static hold is emitted as separate frames.

## Official docs
- [Manim Community v0.22.1 documentation](https://docs.manim.community/en/stable/)
- [Output settings](https://docs.manim.community/en/stable/tutorials/output_and_config.html)
- [Configuration and CLI options](https://docs.manim.community/en/stable/guides/configuration.html)
- [v0.22.1 release](https://github.com/ManimCommunity/manim/releases)
