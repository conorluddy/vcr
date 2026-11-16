# Godot headless physics scene fixture

## Intent and scope

- **Tool/version:** Godot Engine 4.7.2 stable, from the Homebrew cask.
- **Claim:** load an owned `.tscn` through Godot's scene/resource APIs, step a 2D `RigidBody2D` onto a static floor for 120 physics frames, and assert node/shape geometry and settled state. Two independent engine processes must produce the same semantic JSON state.
- **Exclusions:** no rendering, pixels, movie writing, editor, imported assets, plugins, GDExtensions, 3D, cross-platform determinism, or claim about arbitrary projects. `--headless` uses no visual output.
- **Documentation and licence:** [command-line documentation](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html), [Node physics callbacks](https://docs.godotengine.org/en/stable/classes/class_node.html), [Godot licence](https://godotengine.org/license), checked 2026-11-16. Godot is MIT licensed; the upstream copyright and licence terms apply to the engine. This fixture's source is original.
- **Environment:** macOS 26.6 arm64, Godot 4.7.2 native macOS editor/CLI app, headless display and dummy audio; no graphics backend is used or claimed.
- **Input:** original `physics_scene.tscn`, with a 16×16 rectangle rigid body starting at (0,20) and a 200×10 static floor centered at (0,100). No external assets or network inputs.
- **Dependencies and installation plan:** Godot is absent. Install the approved Homebrew cask with `brew install --cask godot`; expected app destination `/Applications/Godot.app`, exact version 4.7.2 per `brew info --cask godot`. This installs a native application outside the repository. No other dependency or service.
- **Output and cleanup:** two semantic JSON records under this example's ignored `output/`; no media is produced.

## Plan, before running

- **Commands:** `brew install --cask godot`; then `./run.sh --record`, inspect the JSON, and `./run.sh` to verify. The runner invokes `/Applications/Godot.app/Contents/MacOS/Godot --headless --fixed-fps 60 --path . --script res://fixture.gd -- --output <path>` twice per run.
- **Expected checks:** Godot reports exactly 4.7.2; the loaded scene contains `StaticBody2D/Floor` with a 200×10 rectangle and `RigidBody2D/Body` with a 16×16 rectangle; after 120 physics frames the body rests at x=0 and y=87.3±0.1 with |vx|,|vy|≤0.01. Two process outputs must match byte-for-byte; verify output must match `expected/physics-state.json`.
- **Failure and stop conditions:** missing/unexpected Godot version, project parse or script error, missing physics API, geometry mismatch, unsettled body outside tolerance, or differing process outputs. One cask installation attempt; no fallback binary or renderer.
- **Reproduction and inspection:** `./run.sh --record` updates the small semantic expected JSON; `./run.sh` compares it. Review the generated JSON and this README; no picture is expected from a headless run.

## Observation, after running

- Result: pass. The scene loaded, its 200×10 floor and 16×16 body shapes matched the declared geometry, and the body settled at `(0.0007, 87.3)` with zero reported velocity after 120 physics frames. The two independent process outputs matched byte-for-byte, and the separate verify run matched `expected/physics-state.json`.
- Runtime: Godot 4.7.2 stable official (`ed1daf0bf`), macOS 26.6 arm64. The run used `--headless` with dummy audio and no graphics renderer, so this is a scene/physics check only.
- Limits: validates one owned 2D scene and this machine's repeated physics result. It makes no claim about rendered output, video, 3D, arbitrary projects or cross-platform determinism.
