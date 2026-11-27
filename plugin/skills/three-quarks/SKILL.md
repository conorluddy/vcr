---
name: three-quarks
description: Add three.quarks particle systems to a three.js scene and capture them deterministically by replaying fixed steps from t=0 with a seeded Math.random. Load once three.quarks has been chosen for sparks, smoke or fountain effects.
---

# three.quarks

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Art-directed sprite particles inside a `three-js` scene, drawn on the harness's animation frame like any other three.js content.
- The library only moves forward through `batchRenderer.update(delta)` and has no seed. VCR makes it seekable by replaying from 0, so cost grows with `t`. For long timelines or collisions use `rapier`, or bake transforms.
- Evidence covers one sprite fountain, three.quarks 0.18.0 on three 0.186.1, Chromium WebGL, macOS arm64. Everything else below is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `ParticleSystem`, emitter shapes (`ConeEmitter` etc.), start values | [repository README](https://github.com/Alchemist0823/three.quarks) | cone, sprite billboard tested |
| Behaviours (`ApplyForce`, `SizeOverLife`, `ColorOverLife`) | [repository README](https://github.com/Alchemist0823/three.quarks) | those three tested; others untested |
| `BatchedRenderer` | [repository README](https://github.com/Alchemist0823/three.quarks) | tested |
| Trail, mesh and stretched billboard render modes | [repository README](https://github.com/Alchemist0823/three.quarks) | untested |
| JSON effects, `QuarksLoader`, quarks.art editor | [quarks.art](https://quarks.art) | untested |
| WebGPU build (`three.quarks.webgpu.esm.js`) | [repository README](https://github.com/Alchemist0823/three.quarks) | untested |

## Install and doctor
```sh
pnpm add --save-exact three.quarks
```
A project-local library: `vcr doctor` does not probe it. It needs `three` >= 0.182 as a peer.

## Smoke test
```sh
cd examples/three-quarks-capture && ./run.sh
# expect: three-quarks-capture: OK (~19 fps, 90 distinct hashes)
```
It captures 90 frames at 640x360, requires shuffled order to match sequential, 90 distinct frames and frame 45 alpha 0 to 1.

## Scene contract
`window.__scene = { duration, seek }` as in `three-js`; `seek` schedules the render with `requestAnimationFrame`. Make frame `t` a pure function of `t` by doing all of this inside each seek:

```js
Math.random = seededRandom(SEED);            // quarks draws every random value from Math.random
const { scene, batchRenderer, system } = buildSystem();   // fresh objects, nothing carried over
for (let step = 0; step < Math.round(t / (1 / 60)); step++) batchRenderer.update(1 / 60);
renderer.render(scene, camera);
system.dispose();
Math.random = nativeRandom;
```
- Fixed step, never wall-clock. quarks clamps a delta above 0.1 s.
- Rebuild per seek; `restart()` is not needed and was not tested.
- Bare imports (`three`, `three.quarks`, `quarks.core`) need an import map, and the capture needs `serveRoot` set to the directory holding `node_modules` (see `scene.html`, `capture.ts`). The `quarks.core` path is the pnpm store path; adjust it if the version changes.
- Draw the sprite texture from a canvas, or load it from a served file, so the scene needs no network.

## Troubleshooting
- `Cannot find package 'playwright'` from `packages/capture`: run `pnpm install` at the repository root first.
- Shuffled frames differ: something still reads an unseeded `Math.random`, or state survives between seeks. Not seen in the fixture once the reseed was in place.

## Official docs
- [three.quarks repository](https://github.com/Alchemist0823/three.quarks)
- [three.quarks on npm](https://www.npmjs.com/package/three.quarks)
