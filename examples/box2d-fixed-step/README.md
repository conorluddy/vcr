# Box2D v3 fixed-step trajectory

## Intent and scope

- Tool/version: `box2d3-wasm` 6.0.0 (Box2D v3.2 in a patched fork), `compat` and `deluxe` builds.
- Claim: a fixed-step Box2D simulation in Node produces per-frame positions that are finite, physically plausible, byte-identical across separate processes and equal between the compat and deluxe builds.
- Exclusions: joints and other shapes, other platforms (the author's cross-platform determinism claim is untested), seeking or snapshots, replay, playback in a scene.
- Official documentation: https://github.com/erincatto/box2d and https://github.com/Birch-san/box2d3-wasm; checked 2026-11-27. Licence MIT.
- Environment: macOS arm64; Node 22.19.0.
- Input: constants in `simulate.mjs` (three circles radius 0.5, drop heights 4, 6, 8; restitution 0.5; gravity -10; floor top at y 0).
- Output: ignored `output/` (`trajectory.json`, `deluxe.json`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: 90 frames; every value finite; frame 0 at the drop heights; final y below 1; a bounce; trajectory SHA-256 identical across two `node simulate.mjs compat` processes; deluxe frames equal compat frames; metrics match `expected/metrics.json`.
- Floor check, as first planned: min y above 0.4 (a number copied from the neighbouring Jolt fixture).
- Stop if trajectories differ or a circle passes through the floor.

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`. The first run failed the floor check: the fastest circle (dropped from 8) reached y 0.3657 at frame 75, a 0.13 penetration of soft contact at impact speed. The trajectory was inspected frame by frame: no tunnelling, and the circle rebounds. The 0.4 bound was copied from another engine, not derived from Box2D, so before recording it was replaced by `minY > 0.25` (the centre stays above the floor surface plus half a radius), which still fails on tunnelling. The recording and verifying runs then passed. Trajectory SHA-256 `d9b9285ba9f4d094a0206ad3fdfef8449eb9b66b507ab6b2fd187dde387c4b90`. Two circles rest at y 0.4997 and 0.4999; the third is still settling at 0.7912. This covers rigid circles on one machine and says nothing about other platforms.
