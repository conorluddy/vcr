---
name: react-three-rapier
description: Use Rapier physics as React Three Fiber components for rigid bodies, colliders, constraints and simulation inside a 3D scene.
---

# react-three/rapier

`@react-three/rapier` wraps the Rapier WASM physics engine for React Three Fiber. Its documented surface includes a `<Physics>` world, `<RigidBody>` and automatic or explicit colliders, instanced rigid bodies, forces and impulses, collision/contact events, sensors, joints, debug drawing, manual stepping and snapshots. See the API map for upstream documentation; these capabilities are not all tested by VCR.

`vcr` means `pnpm vcr` in this repository and `node <plugin-root>/cli/vcr.mjs` in an installed plugin (the plugin root is two directories above this skill).

## Validated VCR route

Validated on macOS arm64 with `@react-three/rapier` 2.2.0, Rapier compat 0.19.2, R3F 9.8.2, React 19.3.1 and Playwright 1.64.1 (`examples/rapier-capture`, 2026-11-12). The fixture pauses physics, restores a snapshot of the initial world for each seek, then advances with fixed 1/60 s steps to `t`. It produced 90 distinct transparent 1280×720 frames; shuffled seeks matched sequential hashes and frame 45 alpha ranged 0–1. The bodies visibly fell and rested on the floor in the inspected contact sheet. The browser setup explicitly loads the Rapier WASM via `init({ module_or_path })`; the fixture copies the wasm beside its bundle. Run `vcr example create react-three-rapier` and use the destination it prints; there run `./run.sh`. Expected output: `rapier-capture: OK (18.9 fps)` (measured fps varies by machine).

Evidence is limited to the default `follow` loop with fixed steps and snapshot restore. Independent updateLoop, joints, sensors, contact/collision events, instanced bodies, debug drawing, variable timestep, interpolation, asset loading, other OS/browser environments, solver quality and cross-platform determinism are untested. Physics is forward-stepped; the fixture recomputes from its rest snapshot to make requested times reproducible. No adapter is implemented.

## API capability map

The official repository README links the API reference. These areas are documented upstream and are not implied to be validated in VCR.

| API area | Documented use | Official documentation |
| --- | --- | --- |
| World configuration | `<Physics>` gravity, timestep, loop, interpolation and world settings | [Physics component](https://github.com/pmndrs/react-three-rapier#the-physics-component), [PhysicsProps](https://pmndrs.github.io/react-three-rapier/interfaces/PhysicsProps.html) |
| Bodies and colliders | `<RigidBody>`, automatic collider generation, collider components and mesh collider shapes | [RigidBody](https://github.com/pmndrs/react-three-rapier#the-rigidbody-component), [Colliders](https://github.com/pmndrs/react-three-rapier#collider-components), [API reference](https://pmndrs.github.io/react-three-rapier/) |
| Forces and body controls | Access body refs to apply forces/impulses and update body state | [Forces and movement](https://github.com/pmndrs/react-three-rapier#moving-things-around-and-applying-forces), [Rapier JavaScript API](https://rapier.rs/docs/user_guides/javascript) |
| Instancing | Attach individual rigid bodies and colliders to instances | [Instanced meshes](https://github.com/pmndrs/react-three-rapier#instanced-meshes) |
| Events and sensors | Collision, contact-force, intersection and sensor callbacks | [Collision events](https://github.com/pmndrs/react-three-rapier#collision-events), [Sensors](https://github.com/pmndrs/react-three-rapier#sensors) |
| Joints | Fixed, spherical, revolute, prismatic, rope and spring connections | [Joints](https://github.com/pmndrs/react-three-rapier#joints) |
| Manual stepping and snapshots | Drive simulation explicitly and save/restore world state | [Manual stepping](https://github.com/pmndrs/react-three-rapier#manual-stepping), [Snapshots](https://github.com/pmndrs/react-three-rapier#snapshots) |
| Debug and hooks | Visualise colliders and filter contacts through hooks | [Debug](https://github.com/pmndrs/react-three-rapier#debug), [Physics hooks](https://github.com/pmndrs/react-three-rapier#physics-hooks-collision-filtering) |

## Install and doctor
```text
pnpm add @react-three/rapier@2.2.0 @dimforge/rapier3d-compat@0.19.2
vcr doctor
```
The fixture pins these versions alongside R3F 9.8.2, Three.js 0.186.1 and React 19.3.1. `vcr doctor` reports machine availability; it does not validate the package combination.

## Smoke test
```text
vcr example create react-three-rapier
# In the destination path printed by the command:
./run.sh
```

`# expect:` sample output: `rapier-capture: OK (18.9 fps)`. The fixture compares its frame count, dimensions, hash diversity, shuffled-vs-sequential hashes and alpha range against the committed summary; measured fps varies by machine.

## Troubleshooting
- If the scene fails to initialise, ensure the Rapier WASM module is resolved before constructing the physics world. The fixture copies the wasm file beside its bundle and passes it through `init({ module_or_path })`.
- If shuffled seeks disagree, restore the same initial world snapshot for each seek and step using the same fixed `1/60` second interval. This evidence does not establish cross-platform determinism.

## Official docs
- [react-three/rapier README and guide](https://github.com/pmndrs/react-three-rapier)
- [react-three/rapier API reference](https://pmndrs.github.io/react-three-rapier/)
- [Rapier JavaScript user guide](https://rapier.rs/docs/user_guides/javascript)
