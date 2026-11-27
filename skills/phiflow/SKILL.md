---
name: phiflow
description: Step a small 2D grid smoke simulation in Python with PhiFlow on the NumPy backend and save each frame as an array or image for a scene to use. Load once PhiFlow has been chosen for smoke or flow-field motion; mass is not conserved.
---

# PhiFlow

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Bake a 2D buoyant smoke plume (or other grid flow) from Python: you write the time loop, then save `field.values.numpy('x,y')` per frame as `.npy` or an image, and play the frames in a scene.
- Not for particle liquids and meshes (`splishsplash`) or rigid bodies (`pymunk`, `rapier`).
- VCR evidence is partial: PhiFlow 3.4.0, NumPy backend, Python 3.12, macOS arm64, one 64x64 plume. It reruns bit-identically and projects to divergence below 2e-6, but total smoke mass drifts 14 percent after inflow stops (MacCormack and semi-Lagrangian advection are not conservative). Do not promise conserved volume. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `CenteredGrid`, `StaggeredGrid`, `Box`, `Sphere`, `resample` | [fields](https://tum-pbs.github.io/PhiFlow/Fields.html) | tested |
| `advect.mac_cormack`, `advect.semi_lagrangian`, `fluid.make_incompressible` | [fluids](https://tum-pbs.github.io/PhiFlow/Fluids_Tutorial.html) | tested, 2D |
| Backends: torch, jax, tensorflow, GPU | [install](https://tum-pbs.github.io/PhiFlow/Installation_Instructions.html) | untested |
| 3D, particles, obstacles, `phi.vis` plotting | [docs index](https://tum-pbs.github.io/PhiFlow/) | untested |

## Install and doctor
```sh
python3 -m venv output/venv && output/venv/bin/pip install phiflow==3.4.0
```
Installs numpy, scipy and matplotlib too; no torch needed. A project-local venv: `vcr doctor` does not probe it. Never install it globally.

## Smoke test
```sh
cd examples/phiflow-smoke-2d && ./run.sh
# expect: phiflow-smoke-2d: OK (reproduces recorded result)
```
It creates `output/venv` when missing, runs the plume twice in separate processes, diffs `expected/metrics.json` and prints a `KNOWN FAIL` line for the mass check. Frames land in `output/frames/`.

## Recipe: plume loop
```python
from phi.flow import *
bounds = Box(x=100, y=100)
open_top = extrapolation.combine_sides(x=extrapolation.ZERO, y=(extrapolation.ZERO, extrapolation.ZERO_GRADIENT))
velocity = StaggeredGrid(0, open_top, x=64, y=64, bounds=bounds)
smoke = CenteredGrid(0, extrapolation.BOUNDARY, x=64, y=64, bounds=bounds)
inflow = 0.2 * resample(Sphere(x=50, y=15, radius=5), to=smoke, soft=True)
for step in range(60):
    smoke = advect.mac_cormack(smoke, velocity, 1.0) + inflow
    velocity = advect.semi_lagrangian(velocity, velocity, 1.0) + (smoke * (0, 0.1)) @ velocity
    velocity, _ = fluid.make_incompressible(velocity)
    frame = smoke.values.numpy('x,y')   # shape (64, 64); transpose and flip for image rows
```
- Seeking frame N means stepping N times; save frames, do not re-simulate per render.
- The fixture saved with `matplotlib.pyplot.imsave(a.T, origin='lower')`.

## Troubleshooting
- `Diverged: Direct solution does not satisfy tolerance` at step 1 in `make_incompressible`: a fully closed box makes the pressure system singular, and `Solve(rank_deficiency=1)` did not help; leave one side open as above.
- A `SparseEfficiencyWarning` per step: harmless, run Python with `-W ignore`.
- numpy `bool` is not JSON serialisable: wrap check results in `bool()`.

## Official docs
- https://tum-pbs.github.io/PhiFlow/ (version 3.4.0)
- https://github.com/tum-pbs/PhiFlow
