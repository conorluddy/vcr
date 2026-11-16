# Rapier fixed-step rigid body

## Intent and scope

- Tool/version: `@dimforge/rapier3d-compat` 0.21.0.
- Claim: a generated 3D dynamic cuboid falls onto a static floor over 120 fixed steps at 1/60 s; final position and velocity are finite and in the expected resting range, and two identical runs produce the same numerical state.
- Excludes: rendering, visual quality, other shapes, long-term simulation, cross-platform determinism, snapshot/restore, and other Rapier package variants.
- Official sources: [JavaScript getting started](https://rapier.rs/docs/user_guides/javascript/getting_started_js/), [rigid bodies](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/), [colliders](https://rapier.rs/docs/user_guides/javascript/colliders/). Package is Apache-2.0; checked 2026-11-16.
- Environment: macOS 26.6 arm64, Node 25.6.1, npm 11.9.0. The exact dependency and integrity hash are pinned in this fixture's `package-lock.json`; no repository-level dependency was added.
- Input: all body, collider, gravity, and timestep values are authored in `run.mjs`; no external assets.

## Plan, before running

- Run `./run.sh --record`, inspect the numeric output, then run `./run.sh` again.
- Assert 120 steps at 1/60 s, finite position/velocity, final body height between 0.58 and 0.65, vertical velocity within 0.02 of zero, and identical state hash across two runs.
- Stop on WASM initialization, simulation, numeric, or repeatability failures. Run output stays in the fixture-local ignored `node_modules/` directory; expected metrics are lightweight JSON.

## Observation

- Ran 2026-11-16 on `Conors-MacBook-Pro-2.local`, Rapier 0.21.0. Both runs passed: final position `(0.001382, 0.599931, 0.000536)`, velocity `(0, 0, 0)`, state SHA-256 `dd1c2f3d20b67dfb1310589cf7ed422ef55a09d319b05289a52be855438e69a5`.
- Result: pass for this fixed-step resting-body fixture. This establishes same-host repeatability and numerical contact with the floor only; it does not establish visual results or cross-platform determinism.
