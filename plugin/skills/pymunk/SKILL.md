---
name: pymunk
description: Use Pymunk (Python, Chipmunk 2D) to bake repeatable 2D rigid-body motion offline at a fixed 1/60 s step, seeking by re-simulation from step 0. Load when a Python pipeline must feed body state to a renderer; the VCR fixture validates same-machine reruns only.
---

# Pymunk

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use for offline 2D rigid-body sims (falling, colliding, settling) in Python whose per-step body state feeds a renderer or a baked data file. Pymunk draws nothing in VCR; the fixture's SVG is for inspection only.
- If the scene and physics already live in the browser, use Matter.js (same fixed-step re-simulation idea, seek in the page). For 3D or a maintained cross-platform engine, consider Rapier.
- Motion pillar: a simulation carries integrator state, so a scene that seeks must re-simulate rather than read a closed form. Re-simulation from step 0 is what satisfies `MOTION-SPR-001` (same *t* twice, out of order, identical values). Delivery frame rate is a separate choice; see the `motion` and `delivery` skills.
- Validation is scoped to pymunk 7.3.1 (Chipmunk 2.0.1), Python 3.12.2, macOS arm64, one machine. It does not establish cross-machine, cross-Python or cross-version equality.

## Capability map
Discovery only; the fixture exercises the starred items. Documentation does not imply VCR validation.

| Area | Main use | Official reference |
| --- | --- | --- |
| `Space` (`step`, gravity, iterations)* | Own the world and advance it | [Space](https://www.pymunk.org/en/latest/pymunk.html#pymunk.Space) |
| `Body`* | Mass, moment, position, angle, velocity | [Body](https://www.pymunk.org/en/latest/pymunk.html#pymunk.Body) |
| Shapes: `Circle`*, `Poly.create_box`*, `Segment`* | Collision geometry, friction, elasticity | [Shapes](https://www.pymunk.org/en/latest/pymunk.html#pymunk.Shape) |
| Constraints (joints, springs, motors) | Connect bodies | [Constraints](https://www.pymunk.org/en/latest/pymunk.html#pymunk.Constraint) |
| Collision handlers, sensors | Callbacks on contact | [Space handlers](https://www.pymunk.org/en/latest/pymunk.html#pymunk.Space.on_collision) |
| Queries (point, segment, shape) | Hit tests, raycasts | [Space queries](https://www.pymunk.org/en/latest/pymunk.html#pymunk.Space.point_query) |
| Sleeping, pickle/copy | Idle bodies, saved state | [Space](https://www.pymunk.org/en/latest/pymunk.html#pymunk.Space) |
| Debug drawing (pygame, pyglet, matplotlib) | Quick visual look | [Documentation index](https://www.pymunk.org/en/latest/) |

## Install and doctor
Use a venv; nothing goes into system Python. The example pins `pymunk==7.3.1`, `cffi==2.1.1`, `pycparser==3.12`.
```sh
python3 -m venv output/venv
output/venv/bin/pip install -r requirements.txt
output/venv/bin/python -c "import pymunk; print(pymunk.version, pymunk.chipmunk_version)"
vcr doctor
```
`vcr doctor` reports detected tool availability; it is not evidence for a pymunk feature.

## Smoke test
After `vcr example create pymunk-fixed-step`, change to the destination it prints, create the venv as above under `output/`, then:
```sh
./run.sh
# expect: pymunk-fixed-step: OK
```
It runs the scene twice, compares both runs to `expected/`, and gates on: reruns equal as parsed JSON; 901 per-step state hashes; nine fresh-process re-simulations, in the shuffled order 480, 0, 900, 30, 2, 240, 1, 120, 60, each equal to the continuous trace; ball rest inside x -260 to -240 px, y 11.5 to 12.5 px, speed at most 1 px/s (recorded: (-250.0, 11.9) px, 0.0 px/s). A 1e-6 px perturbation was shown to fail the rerun gate.

## Clock rules
- Never use a variable `dt`, wall-clock time or sub-stepping. Step exactly `1/60` s once per simulated step; tested only at that step.
- Seek to time `t` by rebuilding the same initial space and stepping `round(t * 60)` times from step 0. Restoring from a saved state is untested (no pickle or copy was run).
- Build the space only from fixed constants; the fixture has no random seed. Hash state with full-precision floats, round only what you store.

```python
STEP_SECONDS = 1.0 / 60.0

def state_at_step(step_count):
    space, bodies = build_space()       # same poses, gravity, iterations every call
    for _ in range(step_count):
        space.step(STEP_SECONDS)
    return {n: (b.position.x, b.position.y, b.angle) for n, b in bodies.items()}
```
In the fixture, in-process re-simulation also matched (9 of 9, measured not gated), but the gate uses fresh processes, so rely on those. Rest y sat 0.1 px under geometric contact (Chipmunk collision slop); allow for it in rest bounds.

## Untested areas
Collision callbacks, sensors, sleeping, constraints, queries, pickle or space copy, other step sizes, other scenes or body counts, rendering from the state, performance, and any machine, CPU, OS, Python or pymunk version other than the one above.

## Troubleshooting
- `run.sh` exits with "Create output/venv ...": it never installs; create the venv and install `requirements.txt` first. Override the interpreter with `PYMUNK_FIXED_STEP_PYTHON`.
- A seek differs from the trace: confirm the same initial space, constant step and exact step count; any extra or variable `step` call changes every later state.
- `diff` against `expected/` fails on another machine: expected files pin one machine's output; revalidate rather than edit thresholds.

## Official docs
- [Pymunk documentation](https://www.pymunk.org/en/latest/)
- [Pymunk project](https://github.com/viblo/pymunk)
- [Chipmunk2D](https://chipmunk-physics.net/)
