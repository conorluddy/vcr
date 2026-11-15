---
name: matter-js
description: Use Matter.js for 2D rigid-body simulation in a browser scene, stepping it manually from the requested time. Load when bodies, collisions or constraints need physics; the VCR fixture validates fixed-step re-simulation with Canvas 2D.
---

# Matter.js

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use for small 2D rigid-body scenes where bodies fall, collide and settle. For hand-authored motion without collisions, use GSAP; for 3D or large simulations, consider Rapier.
- Matter.js supplies simulation APIs and an optional canvas renderer. The fixture draws body vertices itself with Canvas 2D; it does not validate `Matter.Render` or `Matter.Runner`.
- Validation is scoped to Matter.js 0.20.0, macOS arm64, Playwright 1.64.1 and Chromium 156.0.8078.4. It establishes shuffled-versus-sequential equality in that browser build, not cross-machine determinism.

## Install and doctor
```sh
pnpm add matter-js
node -e "console.log(require('matter-js/package.json').version)"
vcr doctor
```
The example pins 0.20.0. `vcr doctor` reports detected tool availability; it is not itself evidence for a Matter.js feature.

## Smoke test
After `vcr example create matterjs-capture`, change to the destination it prints, install its dependencies, and set up capture with `vcr setup capture --yes` if needed:
```sh
./run.sh
# expect: matterjs-capture: OK
```
The fixture expects 90 frames at 1280×720, sequential and shuffled hashes to match, and frame 45 alpha range 0–1. It replays 60 fixed steps per second to generate 30 fps output.

## Recipe: seek by re-simulation
Rebuild the same initial world for each requested time, then step from zero using a fixed delta. Draw the resulting body state after stepping:
```js
const FIXED_STEP_MS = 1000 / 60;
const STEPS_PER_SECOND = 60;

window.__scene = {
  duration: 3,
  seek(t) {
    const { engine, bodies } = buildWorld(); // same initial state every call
    const steps = Math.floor(t * STEPS_PER_SECOND);
    for (let i = 0; i < steps; i++) Matter.Engine.update(engine, FIXED_STEP_MS);
    drawBodies(bodies);
  }
};
```
The example's `buildWorld` uses `Matter.Engine.create`, `Matter.Bodies.rectangle`/`circle`, and `Matter.Composite.add`; its drawing reads `body.vertices`. This recipe is demonstrated by the fixture. `Matter.Runner` owns a running clock, so do not use it for this seek path. Matter.js does not promise cross-platform determinism; the fixture's equality result is limited to its tested setup.

## API capability map
This is a route into the 0.20.0 API, not a list of validated VCR features. Only Engine update, Bodies rectangle/circle, Composite add and body vertices are exercised by the fixture.

| API area | Main use | Official API |
| --- | --- | --- |
| Engine | Create worlds and advance simulation with `Engine.update` | [Engine](https://brm.io/matter-js/docs/classes/Engine.html) |
| Body / Bodies | Configure and create individual rigid bodies and shapes | [Body](https://brm.io/matter-js/docs/classes/Body.html), [Bodies](https://brm.io/matter-js/docs/classes/Bodies.html) |
| Composite / Composites | Group bodies and constraints; add/remove world objects | [Composite](https://brm.io/matter-js/docs/classes/Composite.html), [Composites](https://brm.io/matter-js/docs/classes/Composites.html) |
| Constraint | Connect bodies or anchor them to world positions | [Constraint](https://brm.io/matter-js/docs/classes/Constraint.html) |
| Collision queries | Query bodies against points, regions or rays | [Query](https://brm.io/matter-js/docs/classes/Query.html) |
| Events | Observe engine and collision lifecycle events | [Events](https://brm.io/matter-js/docs/classes/Events.html) |
| Render / Runner | Built-in canvas drawing and continuous stepping | [Render](https://brm.io/matter-js/docs/classes/Render.html), [Runner](https://brm.io/matter-js/docs/classes/Runner.html) |
| MouseConstraint | Bind pointer interaction to constrained bodies | [MouseConstraint](https://brm.io/matter-js/docs/classes/MouseConstraint.html) |

## Untested areas
The fixture does not validate constraints, collision events, collision queries, sleeping, mouse interaction, `Matter.Render`, `Matter.Runner`, compound bodies, plugins, or performance limits. The API links document these areas but do not imply VCR validation.

## Troubleshooting
- If a seeked frame differs by request order, confirm every seek rebuilds the same initial state and advances with the same fixed delta and step count. This is the fixture's tested approach, not a general determinism guarantee.
- If `matter-js` cannot load in the browser, confirm the installed build path matches the example's relative script (`node_modules/matter-js/build/matter.min.js`).

## Official docs
- [Matter.js 0.20.0 API documentation](https://brm.io/matter-js/docs/)
- [Matter.js project and examples](https://brm.io/matter-js/)
