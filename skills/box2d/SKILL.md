---
name: box2d
description: Step Box2D v3 (box2d3-wasm) at a fixed timestep in Node and bake per-frame 2D body positions to JSON for a scene to replay. Load once Box2D has been chosen for 2D rigid-body motion where stable contacts or the author's determinism claim matter.
---

# Box2D v3 (box2d3-wasm)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- A 2D world stepped by a fixed dt, with positions read each frame and cached. Bake from frame 0; do not seek (no snapshot route was tried).
- VCR evidence covers three circles on a static box floor, the `compat` and `deluxe` builds, Node 22 on macOS arm64. Joints, other shapes, sensors, contact events and other platforms are untested.
- Neighbours: `matter-js` (browser, simpler, no determinism claim), `rapier` (2D and 3D, snapshots), `jolt-physics-js` (3D, soft bodies).

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| World, bodies, shapes, `b2World_Step(world, dt, subSteps)` | [Box2D docs](https://box2d.org/documentation/) | tested (circle, box) |
| `compat` and `deluxe` builds | [box2d3-wasm README](https://github.com/Birch-san/box2d3-wasm#choosing-a-build) | both tested, equal output |
| Joints, motors, sensors, contact events | [Box2D docs](https://box2d.org/documentation/) | untested |
| Double-precision `box2d3-wasm/double` build | [box2d3-wasm README](https://github.com/Birch-san/box2d3-wasm#large-worlds-double-precision) | untested |
| Cross-platform determinism | [Box2D docs](https://box2d.org/documentation/) | untested; author's claim |

## Install and doctor
```sh
pnpm add box2d3-wasm@6.0.0
```
A project-local library; `vcr doctor` does not probe it. Pin the version: the API follows Box2D releases (v3.2 renamed several fields).

## Smoke test
```sh
cd examples/box2d-fixed-step && ./run.sh
# expect: OK: box2d-fixed-step
```
Runs `simulate.mjs` twice in separate processes (identical hash required), once more on the deluxe build (frames must equal compat), then checks physics facts and `expected/metrics.json`.

## Recipe: bake a trajectory
```js
const { default: Box2DFactory } = await import('box2d3-wasm/compat'); // no threads
const box2d = await Box2DFactory();
const { b2DefaultWorldDef, b2CreateWorld, b2World_Step, b2Body_GetPosition } = box2d;
// worldId = b2CreateWorld(worldDef); bodies via b2CreateBody + b2Create*Shape
for (let frame = 0; frame < frameCount; frame++) {
  const p = b2Body_GetPosition(bodyId);
  frames.push([p.x, p.y]); // read before stepping so frame 0 is the start
  p.delete();              // getters return owned wasm objects
  b2World_Step(worldId, 1 / fps, 4);
}
```
- Constant dt and sub-step count; changing either changes the trajectory.
- Delete owned vectors from getters; IDs are plain objects and need no deletion. Borrowed views (`def.position`, `shapeDef.material`) must not be deleted.
- Restitution lives at `shapeDef.material.restitution` in v3.2.
- Full setup: `examples/box2d-fixed-step/simulate.mjs`; copy it.

## Determinism
Two Node processes gave byte-identical trajectory JSON, and `compat` matched `deluxe` (tested, one machine). The author's cross-platform claim is unverified here, and the binding is a third-party build.

## Troubleshooting
- Floor check at 0.4 failed: a ball dropped from 8 m reached centre y 0.366 (radius 0.5) at impact. That is soft contact, not tunnelling; the ball rebounded. Use a looser bound.
- Settling is slow: by frame 89 two balls rest at y 0.5 and the third is at 0.79.

## Official docs
- [Box2D](https://github.com/erincatto/box2d) and [documentation](https://box2d.org/documentation/)
- [box2d3-wasm](https://github.com/Birch-san/box2d3-wasm)
- [box2d3-wasm on npm](https://www.npmjs.com/package/box2d3-wasm)
