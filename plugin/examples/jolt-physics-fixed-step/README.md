# Jolt Physics fixed-step trajectory

## Intent and scope

- Tool/version: `jolt-physics` 1.1.2 (JoltPhysics.js, default wasm build).
- Claim: a fixed-step Jolt simulation in Node produces per-frame positions that are finite, physically plausible and byte-identical across separate processes.
- Exclusions: soft bodies and cloth, other platforms (cross-platform determinism is a Jolt compile-time option), seeking or snapshots, multithread builds, playback in Three.js.
- Official documentation: https://github.com/jrouwe/JoltPhysics.js and https://github.com/jrouwe/JoltPhysics; checked 2026-11-27. Licence MIT.
- Environment: macOS arm64; Node 22.19.0.
- Input: constants in `simulate.mjs` (three spheres, radius 0.5, drop heights 4, 6, 8; restitution 0.5; floor top at y 0).
- Output: ignored `output/` (`trajectory.json`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: 90 frames; every value finite; frame 0 at the drop heights; final y below 1; min y above 0.4 (small penetration allowed); at least one upward step of the first ball (a bounce); trajectory SHA-256 identical across two `node simulate.mjs` processes; metrics match `expected/metrics.json`.
- Stop if the trajectories differ between processes or the balls pass through the floor.

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`. Recording and verifying runs passed. Trajectory SHA-256 `20046d1d561079128b4dadc414c576ea7998941586224b191a31e523df82b132`. Sampled heights: the lowest ball falls from 4.0 to 0.95 by frame 30, rebounds, and rests near y 0.5 (radius) by frame 89; the others are still settling (0.52, 0.68). Minimum y 0.4346, a slight contact penetration. This covers rigid spheres on one machine and says nothing about soft bodies or other platforms.
