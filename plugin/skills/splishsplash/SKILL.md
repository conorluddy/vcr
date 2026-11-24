---
name: splishsplash
description: Use pySPlisHSPlasH (SPlisHSPlasH SPH fluid solver, Python bindings) to bake a headless 2D particle fluid at a fixed 2 ms step. Load for particle-fluid state to feed a renderer; VCR evidence is partial and reruns are only reproducible with OMP_NUM_THREADS=1.
---

# SPlisHSPlasH (Python bindings)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use for offline SPH fluid (a dam break, sloshing, splashing) whose per-step particle positions feed a renderer or a baked data file. The solver draws nothing in VCR; the fixture's SVG is for inspection only.
- For solid objects use Pymunk (2D) or Rapier. For fluid inside a full scene-authoring tool, use Blender's fluid tools.
- Evidence is **partial**, scoped to pySPlisHSPlasH 2.19.1 (wheel cp312, macOS arm64), Python 3.12.13, numpy 2.5.5, one machine (12 cores), a headless 2D DFSPH dam break of 266 particles at a fixed 0.002 s step for 500 steps. Passed: count conserved, all particles inside the box, the column falls and spreads, centre of mass moves right.
- Failed at default threads: reruns and fresh-process seeks are not bit-identical. Particles differed by up to 0.30 m by step 500 (0.39 m in the record run). Pin `OMP_NUM_THREADS=1` for reproducible bakes (below).
- Motion pillar: a fluid carries integrator state, so seeking means re-simulating from step 0 (same idea as `MOTION-SPR-001`: same *t* twice, out of order, identical values). At default threads the fixture does not meet that; with one thread it did in a diagnostic. Delivery frame rate is a separate choice; see the `motion` and `delivery` skills.

## Capability map
Discovery only. Documentation does not imply VCR validation; the fixture exercised only the starred item.

| Area | Main use | Official reference |
| --- | --- | --- |
| Python bindings: `SimulatorBase`, `Simulation`, fluid model, `setTimeStepCB` (2D DFSPH scene)* | Run a scene headless, read particle positions | [Python bindings](https://splishsplash.readthedocs.io/en/latest/py_getting_started.html) |
| Scene JSON (config, materials, fluid blocks, rigid-body walls)* | Describe the scene | [Scene file format](https://splishsplash.readthedocs.io/en/latest/file_format.html) |
| Other solvers (WCSPH, PCISPH, PBF, IISPH, ...) | Alternative pressure solvers | [SPlisHSPlasH docs](https://splishsplash.readthedocs.io/en/latest/) |
| Viscosity, surface tension, vorticity, emitters, 3D | Fluid behaviours | [SPlisHSPlasH docs](https://splishsplash.readthedocs.io/en/latest/) |
| Rigid-fluid coupling | Moving solids in fluid | [SPlisHSPlasH docs](https://splishsplash.readthedocs.io/en/latest/) |
| Standalone CLI and GUI | Source build; not in the wheel | [Repository](https://github.com/InteractiveComputerGraphics/SPlisHSPlasH) |
| splashsurf | Particles to surface mesh | [splashsurf](https://github.com/InteractiveComputerGraphics/splashsurf) |

## Install and doctor
Use a venv; nothing goes into system Python. Python 3.14 has no wheel on the index; use 3.12.
```sh
python3.12 -m venv output/venv
output/venv/bin/pip install -r requirements.txt   # pySPlisHSPlasH==2.19.1, numpy==2.5.5
output/venv/bin/python -c "import pysplishsplash"
vcr doctor
```
`vcr doctor` reports detected tool availability; it is not evidence for a feature. No source build was tried.

## Smoke test
After `vcr example create splishsplash-dam-break`, change to the destination it prints and create the venv under `output/` as above, then:
```sh
./run.sh
# expect: exit 1 at default threads (reruns_identical and seek_fresh_process_matches_trace false; other nine of eleven checks true), no "OK"
OMP_NUM_THREADS=1 ./run.sh   # diagnostic only, not gated or recorded: reruns and the seek to step 375 matched
```
No `expected/` is kept, so the run cannot print `splishsplash-dam-break: OK`. Recorded sample: 266 particles at all frames; centre of mass y 0.450 m at step 1 to 0.293 m at step 500; width 0.52 m to 1.92 m; centre of mass x -0.60 m to 0.22 m (these vary by run at default threads).

## Scene and clock rules
- Fixed step only: `cflMethod` 0 and `timeStepSize` 0.002 in the scene JSON. The CFL parameters could not be set from Python. Tested only at 0.002 s.
- Drive with `SimulatorBase.init(useGui=False, ...)`, `setTimeStepCB` to read positions each step, and `run()` with a stop time of `(N - 0.5) * dt` to stop after exactly N steps. `timeStepNoGUI()`, `step()`, `timeStep()` and `runSimulation()` segfaulted or did not advance.
- Seek to time `t` in a fresh process: re-run from step 0 to `round(t / 0.002)` steps. Snapshot restore (`saveState`/`loadState`) is untested.
- Step 0 cannot be read: `getFluidModel` before the first step segfaults, and a second `initSimulation` corrupts the run. Sample from step 1.
- The solver clock is float32 and drifts about 1e-6 s by 0.6 s; compare clocks to step x dt with a tolerance of about 2e-4 s, not 1e-6.
- Reproducibility: set `OMP_NUM_THREADS=1` before the process starts. Not validated as a route; it is a diagnostic result on one machine, and its cost in speed was not measured.

## Untested areas
3D scenes, rigid-fluid coupling, other solvers, viscosity, emitters, other step sizes and particle counts, splashsurf surface reconstruction, the CLI and GUI, rendering, physical accuracy against a measured dam break, snapshot seeking, performance, and any other machine, CPU, thread count, OS or Python.

## Troubleshooting
- Segfault reading particles before the first step: read inside `setTimeStepCB`, from step 1.
- Reruns or seeks differ by centimetres to tenths of a metre: threaded floating-point ordering; run with `OMP_NUM_THREADS=1`.
- Clock check fails by about 1e-6 s: float32 drift, not a missed step; widen the tolerance.
- No wheel for Python 3.14: create the venv with Python 3.12.
- `run.sh` exits with "Create output/venv ...": it never installs; create the venv and install `requirements.txt`. Override the interpreter with `SPLISHSPLASH_DAM_BREAK_PYTHON`.

## Official docs
- [SPlisHSPlasH documentation](https://splishsplash.readthedocs.io/en/latest/)
- [SPlisHSPlasH project](https://github.com/InteractiveComputerGraphics/SPlisHSPlasH)
- [splashsurf](https://github.com/InteractiveComputerGraphics/splashsurf)
