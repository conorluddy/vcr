---
name: rapier
description: Use Rapier's Rust/WASM physics runtime for rigid-body scenes when collisions and fixed-step simulation matter. This guide covers only the validated 3D cuboid/floor fixture and same-host numeric repeatability.
---

# Rapier

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use fixed-step rigid-body simulation when a scene needs collision and contact response. The fixture builds one dynamic cuboid and one fixed floor collider.
- The evidence covers 120 steps at 1/60 s and repeated numeric state on one Mac. It does not cover rendering, other shapes, long simulations, cross-platform determinism, snapshots or the 2D package. Use Matter.js for simpler 2D scenes.

## Capability map

The [JavaScript 0.21 guide](https://rapier.rs/docs/user_guides/javascript/getting_started_js/) links the stable API areas below. **VCR exercised:** initialize the 3D compatibility package, create a `World`, fixed and dynamic rigid bodies, attach cuboid colliders, set the timestep, step, read body state and free the world. **Documented, not VCR-tested:** other body types, collider shapes and properties, joints, character controllers, scene queries, collision events, snapshots/serialization and determinism options.

| Area | Reference | VCR evidence |
| --- | --- | --- |
| Initialization and package variants | [Getting started](https://rapier.rs/docs/user_guides/javascript/getting_started_js/) | 3D `-compat` package with `await RAPIER.init()` |
| Bodies and world stepping | [Rigid bodies](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/) | One fixed floor and one dynamic cuboid, 120 steps |
| Shapes and contact | [Colliders](https://rapier.rs/docs/user_guides/javascript/colliders/) | Cuboid colliders only |
| Joints, queries, serialization, determinism | [JavaScript user guide](https://rapier.rs/docs/user_guides/javascript/) | Untested |

## Install and doctor

In the selected project, pin the fixture-tested package:

```sh
pnpm add @dimforge/rapier3d-compat@0.21.0
pnpm list @dimforge/rapier3d-compat --depth 0
vcr doctor
```

The fixture uses npm with its own lockfile. `vcr doctor` reports supported machine tools; it does not establish this project dependency's behavior.

## Smoke test

```sh
vcr example create rapier-falling-body
cd examples/rapier-falling-body
./run.sh
# expect: OK Rapier 0.21.0: settled at y=0.599931, 120 fixed steps, state dd1c2f3d20b67dfb1310589cf7ed422ef55a09d319b05289a52be855438e69a5
```

Evidence: Rapier 0.21.0 on macOS arm64; two runs matched the retained state hash. The fixture uses `world.timestep = 1 / 60`, steps exactly 120 times, checks the resting range and frees each world. Numeric repeatability is same-host only.

## Troubleshooting
- WASM initialization fails: await `RAPIER.init()` before creating a `World`; the `-compat` package embeds WASM.
- State differs from expected: confirm the pinned version, gravity, timestep, body/collider dimensions and step count before updating expectations.

## Official docs

[JavaScript 0.21 user guide](https://rapier.rs/docs/user_guides/javascript/getting_started_js/) · [Rigid bodies](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/) · [Colliders](https://rapier.rs/docs/user_guides/javascript/colliders/)
