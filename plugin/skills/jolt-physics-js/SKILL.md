---
name: jolt-physics-js
description: Step Jolt Physics (jolt-physics, WASM) at a fixed timestep in Node and bake per-frame body positions to JSON for a scene to replay. Load once Jolt has been chosen for 3D rigid-body motion, or soft bodies are wanted.
---

# Jolt Physics (JoltPhysics.js)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- A world stepped by a fixed dt, with positions read each frame and cached. Bake from frame 0; do not seek (no snapshot route was tried).
- VCR evidence covers three rigid spheres on a static box floor, the default wasm build, Node 22 on macOS arm64. Soft bodies, cloth, constraints, other shapes and other platforms are untested.
- Neighbours: `rapier` (3D rigid bodies, upstream determinism and snapshot guides), `matter-js` (2D, browser). Pick Jolt when soft bodies or cloth are the point.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| JoltInterface, bodies, shapes, `Step(dt, subSteps)` | [JoltPhysics.js](https://github.com/jrouwe/JoltPhysics.js) | tested (sphere, box) |
| Layers and collision filters | [JoltPhysics.js examples](https://github.com/jrouwe/JoltPhysics.js/tree/main/Examples) | two layers tested |
| Soft bodies, cloth | [Jolt docs](https://jrouwe.github.io/JoltPhysics/) | untested |
| Constraints, vehicles, characters | [Jolt docs](https://jrouwe.github.io/JoltPhysics/) | untested |
| Multithread and `wasm-compat` builds | package `dist/` | untested |
| Cross-platform determinism | [Jolt docs](https://jrouwe.github.io/JoltPhysics/) | untested; compile-time option |

## Install and doctor
```sh
pnpm add jolt-physics@1.1.2
```
A project-local library; `vcr doctor` does not probe it. Pin the version: the API (`mObjectLayerPairFilter`, `RVec3`) follows the engine release.

## Smoke test
```sh
cd examples/jolt-physics-fixed-step && ./run.sh
# expect: OK: jolt-physics-fixed-step
```
Runs `simulate.mjs` twice in separate processes, requires an identical trajectory hash, then checks physics facts and `expected/metrics.json`.

## Recipe: bake a trajectory
```js
import Jolt from 'jolt-physics';
const jolt = await Jolt();
// settings: ObjectLayerPairFilterTable, BroadPhaseLayerInterfaceTable,
// ObjectVsBroadPhaseLayerFilterTable -> new jolt.JoltInterface(settings)
const bodyInterface = joltInterface.GetPhysicsSystem().GetBodyInterface();
for (let frame = 0; frame < frameCount; frame++) {
  const p = body.GetPosition();
  frames.push([p.GetX(), p.GetY(), p.GetZ()]); // read before stepping so frame 0 is the start
  joltInterface.Step(1 / fps, 2);
}
```
- Use a constant dt and sub-step count; changing either changes the trajectory.
- Read values into plain numbers, then save as JSON; scene code does a lookup by frame, not a simulation.
- The fixture's full setup (layers, floor, bodies) is `examples/jolt-physics-fixed-step/simulate.mjs`; copy it.
- Wrapper objects live in WASM memory and are not freed in the fixture; for long runs destroy them with `jolt.destroy` (untested).

## Determinism
Two Node processes gave byte-identical trajectory JSON (tested, one machine). Whether results match across CPUs or OSes is unverified.

## Troubleshooting
- No failures were seen in the fixture.
- Balls settle slowly: by frame 89 only the first rests at y 0.5; the others still sit at 0.52 and 0.68. Run more frames before judging rest.
- A small penetration into the floor (min y 0.4346 for a 0.5 radius) is normal contact softness, not a bug.

## Official docs
- [JoltPhysics.js](https://github.com/jrouwe/JoltPhysics.js)
- [Jolt Physics](https://github.com/jrouwe/JoltPhysics)
- [jolt-physics on npm](https://www.npmjs.com/package/jolt-physics)
