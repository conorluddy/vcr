---
name: godot
description: Run Godot projects and scenes from the command line. Load when an existing Godot scene or project is the right source for an interactive-style render or simulation.
---

# Godot

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Godot projects can run from the CLI and simulate fixed-step scene logic. This fixture validates one 2D physics scene only.
- `--headless` runs without a graphics renderer; it proves no pixels or movie output. The fixture does not test 3D, imported assets, plugins or cross-platform determinism.
- Use Blender for offline rendering or browser tools for DOM/SVG motion.

## Capability map
The [command-line reference](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html) covers project/editor, run, import, export and movie-writing options. The [Node class reference](https://docs.godotengine.org/en/stable/classes/class_node.html) documents scene callbacks including physics processing. VCR exercises headless project loading, scene resources and 120 fixed physics frames; rendering, `--write-movie`, exports and other engine APIs remain untested.

## Install and doctor
```text
brew install --cask godot
/Applications/Godot.app/Contents/MacOS/Godot --version
vcr doctor
```
The fixture expects Godot 4.7.2 stable on macOS arm64. `vcr doctor` reports availability; it does not install the app.

## Smoke test
```text
vcr example create godot-headless-physics
cd examples/godot-headless-physics && ./run.sh
# expect: JSON reports 120 physics frames, then "OK: two Godot headless physics runs match expected state"
```
The body settles at approximately `(0.0007, 87.3)`; the fixture compares the exact retained JSON and two independent process results.

## Troubleshooting
- No Godot executable at the app path: install the cask or set `GODOT` to the executable path.
- Unexpected version: the fixture is pinned to the 4.7.2 official build; do not overwrite expected state until reviewing a version change.
- No image appears: expected. `--headless` validates scene/physics state, not rendered output.

## Official docs
- [Command-line tutorial and reference](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html)
- [Node class reference](https://docs.godotengine.org/en/stable/classes/class_node.html)
- [Godot license](https://godotengine.org/license)
