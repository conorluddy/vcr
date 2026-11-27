# pygfx offscreen scene as a function of t

## Intent and scope

- Tool/version: pygfx 0.18.0 (PyPI), BSD-2-Clause, on wgpu-py 0.33.0 and rendercanvas 3.0.1; all pinned in `requirements.txt`.
- Claim: from Python, with no window and no browser, pygfx renders a lit PBR scene through wgpu on Metal to RGBA arrays, with the whole scene a pure function of `t`: the same `t` gives the same pixels on repeat, in shuffled order, on a fresh renderer and in a separate process.
- Exclusions: other adapters or drivers (Vulkan, D3D, software), glTF loading, text, lines, volumes, post-processing, interactive canvases, video assembly, large sizes.
- Docs and licence: https://pygfx.org, https://github.com/pygfx/pygfx; BSD-2-Clause per the lead, not independently re-checked beyond the installed metadata.
- Environment: macOS 26.6 arm64, Python 3.12.2, adapter "Apple M3 Pro", backend Metal, venv in `output/venv` (git-ignored).
- Input: none; the scene is in `scene.py` (box, sphere, ambient and directional light, background colour).
- Install (venv local to the example, done by `run.sh` when missing): `python3 -m venv output/venv && output/venv/bin/pip install -r requirements.txt`. Needs network the first time only. Cleanup: remove `output/`.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`. `check.py` runs in two separate processes and the JSON (including frame hashes) must be identical.
- Frames: 24 at 12 fps, 320x180, t = i/12 over a 2 s loop.
- Checks (all gating): versions are pygfx 0.18.0 and wgpu 0.33.0; every frame is 180x320x4 uint8; re-rendering all times on the same renderer reproduces every SHA-256; a seeded shuffled order reproduces the sequential hashes; a freshly built renderer reproduces them; all 24 frames differ; t=2.0 equals t=0 (loop closes); corner pixel is the background (16,20,24); at least 2000 non-background pixels per frame.
- Stop conditions: no adapter, or any check false. No check is loosened after the fact.
- Failure interpretation: any false check is `fail` for that property. Bit-identity is claimed only on this adapter.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. All 9 checks pass first time, and the two processes agree. The first contact sheet showed a flaw in my scene, not the tool: the cube turned in multiples of 90 degrees at the sampled frames and looked static, so "frames differ" was passing only because of the sphere. I changed the cube to a non-symmetric tumble and re-ran; the contact sheet (`output/contact.png`, frames 0, 3, 6, 9) then shows the cube tumbling, lit with visible shading, and the sphere orbiting in front and behind it. Finding: `pygfx.linalg` does not exist; rotations come from `pylinalg` (`la.quat_from_euler`). The first venv build from the pinned requirements works from scratch.

This proves offscreen determinism on one Apple M3 Pro Metal adapter. It does not show identical pixels on another GPU or driver (the lead warns they may differ), nor anything about edge antialiasing quality beyond a visual look.
