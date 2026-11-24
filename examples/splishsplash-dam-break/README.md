# SPlisHSPlasH dam-break fixture

## Intent and scope

VCR job and claim: SPlisHSPlasH, the SPH fluid simulator, runs a tiny predeclared
dam-break scene headlessly (no GUI, Python bindings only): a 0.6 m × 0.8 m fluid block
in a closed 2 m × 2 m box, 2D, fixed time step 0.002 s, about 266 particles, 1.0 s
simulated (500 steps). Particle positions are read at predeclared frames. Particle
count is conserved, every particle stays inside the box within one particle radius,
the fluid's centre of mass drops and the fluid spreads (predeclared thresholds below),
and independent reruns give identical positions. Seeking is by fresh-process
re-simulation from step 0, in a shuffled order, and must match the continuous run.
Determinism is recorded as measured: identical or not, on this machine.

Tool: SPlisHSPlasH 2.19.1 Python bindings (`pySPlisHSPlasH==2.19.1`, PyPI, MIT, wheel
`pysplishsplash-2.19.1-cp312-cp312-macosx_26_0_arm64.whl`), reporting SPlisHSPlasH
version 2.19.1 at run time. Solver: DFSPH (`simulationMethod` 4), CompactNSearch
neighbourhood search.

Explicit exclusions:
- splashsurf. The card's name covers SPlisHSPlasH and splashsurf, but this fixture
  does not run splashsurf, so no particle-to-mesh claim is made.
- The standalone SPlisHSPlasH CLI or GUI. Not built, not run. The claim is the Python
  binding route only.
- 3D scenes, other solvers (WCSPH, PBF, IISPH, and the rest), viscosity, surface
  tension, emitters, rigid-body coupling, and any time step other than 0.002 s.
- Cross-machine, cross-CPU, cross-Python or cross-SPlisHSPlasH-version equality. The
  expected file pins one machine's output.
- Physical accuracy against any measured dam-break reference. The thresholds are
  regression bounds on this scene.
- Rendering or media. `frames_svg.py` draws SVG for a human look only; no check reads it.
- Alpha: no alpha-bearing output is produced, so no alpha check applies.
- Seeking by snapshot restore, `saveState`/`loadState`, or any route other than a fresh
  re-simulation from step 0.

Licence and documentation sources, checked 2026-11-24:
- https://github.com/InteractiveComputerGraphics/SPlisHSPlasH (project; responded 200
  on 2026-11-24; tool card `catalog/tools/splishsplash.json`, licence MIT).
- Licence: MIT, read from the installed wheel's `licenses/LICENSE` (Copyright (c) 2016
  Jan Bender) and the `License: MIT` metadata of `pySPlisHSPlasH` 2.19.1.
- The scene's wall geometry `box.obj` is original (a procedural unit cube written for
  this example). No file from the SPlisHSPlasH data folder is used or copied.
- No model, codec, dataset or external asset.
- Physics rules: none of the `MOTION-*` rule IDs in `references/` governs fluid
  simulation, so none is cited.

Environment: macOS (Darwin 25.6.0), arm64, Conors-MacBook-Pro-2.local. Python 3.12 from
`/Users/conor/.local/bin/python3.12` (the only 3.12/3.13/3.14 interpreter that had a
matching wheel; `/opt/homebrew/bin/python3.14` reports no distribution for
`pySPlisHSPlasH` on the index, and 3.13 is not installed). CPU only, no GPU, no browser,
no network use at run time.

Input: none. The scene is `scene.json` (committed). Nothing is read from disk except
`box.obj` and `scene.json` in this directory.

Dependencies and installation plan (pre-approved package, venv only):
- `/Users/conor/.local/bin/python3.12 -m venv examples/splishsplash-dam-break/output/venv`
  (git-ignored).
- `examples/splishsplash-dam-break/output/venv/bin/pip install -r examples/splishsplash-dam-break/requirements.txt`
  pins `pySPlisHSPlasH==2.19.1` and `numpy==2.5.5` (numpy is its only dependency).
- Nothing installed into the system Python, the workspace `node_modules`, or any other
  example. The source build of SPlisHSPlasH is not attempted: the wheel installed.
- Network: PyPI, for installation only.
- Cleanup: remove `examples/splishsplash-dam-break/output`.

Selected workspace and output: `examples/splishsplash-dam-break/output/` (git-ignored):
venv, `sph-out/` (SPlisHSPlasH's own output directory), simulation JSON with positions,
seek JSON, logs, `checks.json`, contact sheet. Committed: this README, `example.json`,
`run.sh`, `requirements.txt`, `scene.json`, `box.obj`, `generate.py`, `check.py`,
`frames_svg.py`, and `expected/checks.json` (summary only). No media is committed.

## Plan, before running

Commands, in order:
```
/Users/conor/.local/bin/python3.12 -m venv examples/splishsplash-dam-break/output/venv
examples/splishsplash-dam-break/output/venv/bin/pip install -r examples/splishsplash-dam-break/requirements.txt
examples/splishsplash-dam-break/run.sh --record   # writes expected/checks.json after all gates
examples/splishsplash-dam-break/run.sh            # must print splishsplash-dam-break: OK
```
Inspection (not gating): `output/venv/bin/python frames_svg.py output/simulation.json output/frames`
then convert the SVGs with ImageMagick and read the contact sheet.

Scene constants (`scene.json`): 2D (`sim2D`), particle radius 0.02 m, gravity (0, -9.81),
DFSPH, `cflMethod` 0 (no adaptive step), `timeStepSize` 0.002 s, boundary handling 2.
Fluid block: start (-0.9, 0.05, -0.5), end (-0.3, 0.85, 0.5). Container: `box.obj`
(unit cube ±0.5) scaled (2, 2, 1) and translated (0, 1, 0), so the interior is
x ∈ [-1, 1] m, y ∈ [0, 2] m; static, wall, `mapInvert`. Units: metres and seconds.

Driver: `generate.py` uses `SimulatorBase.init(useGui=False, ...)`, `setTimeStepCB` to
read positions after each step, and `SimulatorBase.run()` with a stop time of
(N − ½)·dt, so the run stops after exactly N steps. Each callback's clock is checked
against step × 0.002 s to within 2e-4 s (one-tenth of a step; SPlisHSPlasH keeps time in
float32 and drifts about 1e-6 s by 0.6 s, so this only confirms one callback per step).

Predeclared steps: frames at steps 1, 125, 250, 375, 500 (t = 0.002, 0.25, 0.5, 0.75,
1.0 s). Seek order, a shuffle of the same five steps, one fresh process each: 375, 1, 500,
125, 250.

Amendments made before the first gated run, and why (no gate or threshold was changed
after a result):
- Step 0 was planned as a frame. It cannot be read: calling `getFluidModel` before the
  first step segfaults, and calling `initSimulation` again before `run()` corrupts the
  run (the block's lowest particle goes below y = 0 within one step). The first recorded
  state is therefore after step 1. Checks 4, 7 and 8 compare step 500 with step 1, which
  is 2 ms after the initial state, so they measure the same motion.
- The clock check tolerance was 1e-6 s and is now 2e-4 s, because the float32 clock
  reached 0.629999 s at step 315 (a 1e-6 s drift, not a missed step).
- The seek order and the frame set were changed to match the first amendment.

Outputs: `output/simulation.json` and `output/simulation-rerun.json` (full positions at
the frames, not committed); `output/checks.json` (checks, measurements and a summary with
hashes but no positions). `expected/checks.json` is that summary, from the recording run.
Position hashes are SHA-256 over float64 bytes in SPlisHSPlasH's particle order.
`expected/` is written only by `--record`, and only if every gate passes.

Predeclared checks (`check.py` gates; thresholds are fixed here and must not be tuned after a result):
1. `reruns_identical`: the two full runs agree on every frame's position hashes, summary
   and positions, and on the per-frame trace.
2. `fixed_step_is_two_milliseconds`: `stepSeconds` is 0.002 and the run performed 500 steps.
3. `frames_as_declared`: recorded steps are exactly 1, 125, 250, 375, 500, and each
   frame's time is step × 0.002 s to 1e-9 s. (Frame count: 5.)
4. `particle_count_conserved`: the particle count is the same at all five frames, and is
   between 200 and 400 at step 1 (dimensions of the block, not an exact count).
5. `particles_inside_box`: at every frame, min x ≥ −1.02, max x ≤ 1.02, min y ≥ −0.02,
   max y ≤ 2.02 m (the walls with a tolerance of one particle radius, 0.02 m).
6. `two_dimensional_positions` (dimensions): max |z| ≤ 1e-9 m at every frame.
7. `fluid_drops_and_spreads`: centre of mass y at step 500 is at least 0.10 m below step 1,
   and x-width at step 500 is at least 0.20 m wider than at step 1.
8. `centre_of_mass_moves_right`: centre of mass x at step 500 is at least 0.05 m greater
   than at step 1 (the block starts on the left; the predicted direction).
9. `seek_order_is_shuffled`: the seek order is not sorted and is a permutation of the frame steps.
10. `seek_fresh_process_matches_trace`: each fresh-process run to step N gives a position
    hash equal to the continuous run's hash at N, for all five N.
11. `distinct_frame_hashes`: at least 2 distinct position hashes over the frames.

Alpha range on a middle frame: not applicable. No image or alpha output is claimed. The
contact sheet is for a human look only.

Measured, not gating: the particle count at step 0 and the exact centre-of-mass and width
values at steps 0 and 500 (recorded in `checks.json`).

Expected failure modes and stop conditions:
- The venv is missing or `pySPlisHSPlasH` is not 2.19.1: `run.sh` stops with the install line.
- SPlisHSPlasH segfaults or aborts in a run: report it, do not change the call.
- Any gating check fails: `run.sh` prints `checks.json` and exits non-zero. Do not change a
  threshold after seeing a result; report the failure.
- `diff` against `expected/checks.json` fails on a rerun: report nondeterminism.
- The contact sheet shows particles leaving the box, a blank frame, or no motion: fail
  the visual check, whatever the gates say.

Reproduction: `run.sh` from a clean `output/` (keep `output/venv`). Inspect with
`frames_svg.py` and the contact-sheet command in the observation section below.

## Observation, after running

Executor and date: evidence agent (Claude), 2026-11-24, on Conors-MacBook-Pro-2.local
(`hostname`), macOS Darwin 25.6.0, arm64, 12 CPU cores. CPU only.

Exact versions: pySPlisHSPlasH 2.19.1 (the wheel reports "SPlisHSPlasH version: 2.19.1");
numpy 2.5.5; Python 3.12.13 in `output/venv` (from `/Users/conor/.local/bin/python3.12`);
ImageMagick 7.1.2-35 (contact sheet only). Playwright, Chromium and Node are not used.
splashsurf is not used. Resolved set: `output/dependencies.txt`.

Install route that worked: `python3.12 -m venv output/venv`, then
`pip install --only-binary=:all: pySPlisHSPlasH==2.19.1` (PyPI wheel
`pysplishsplash-2.19.1-cp312-cp312-macosx_26_0_arm64.whl`, 4.4 MB, which pulled numpy).
The Python 3.14 index had no distribution and 3.13 is not installed, so no other interpreter
was tried. No CMake or source build was attempted, because the wheel installed.

Routes probed before the gated runs (exploration, not evidence): `SimulatorBase.init` with
`useGui=False` and the bundled 2D scene works. `timeStepNoGUI()`, `step()` and `timeStep()`
either segfault or do not advance time. `runSimulation()` segfaults. `run()` with
`setTimeStepCB` works and advances time, so `generate.py` uses that. The CFL parameters
cannot be set through `Simulation.CFL_METHOD` (it reads -1 before a run), so the step is fixed
by `scene.json` (`cflMethod` 0, `timeStepSize` 0.002).

Gated runs (`check.py`, eleven checks):
- First `run.sh --record`: segfault while reading step 0 before `run()`; then a clock
  tolerance failure at step 315 (1e-6 s float32 drift). Both were fixed as listed under
  Plan, before the first gated run finished. The next `--record` run gated and failed on
  two checks, so it wrote no `expected/`.
- `run.sh` (verifying run, exit 1): `reruns_identical` false, `seek_fresh_process_matches_trace`
  false; the other nine checks true. `expected/` therefore holds nothing, and `run.sh` does
  not print `OK`.

Measured on the verifying run (`output/checks.json`):
- Particle count 266 at all five frames (block 0.6 m × 0.8 m, radius 0.02 m, 2D).
- Inside the box: every frame within the predeclared tolerance; max |z| 0.0.
- Centre of mass y: 0.450 m at step 1, 0.293 m at step 500 (drop 0.157 m; threshold 0.10 m).
  Width x: 0.520 m to 1.923 m (gain 1.40 m; threshold 0.20 m). Centre of mass x:
  -0.600 m to 0.219 m (threshold 0.05 m). The record run gave 0.215 m for that last value.
- 5 distinct frame hashes. Steps run: 500.

Determinism, default threads (12 cores): two full runs in one `run.sh` invocation differ.
Maximum particle displacement between them, verifying run: 6e-8 m at step 1, 4e-4 m at 125,
0.083 m at 250, 0.230 m at 375, 0.295 m at 500 (record run: 0.39 m at 500). The
fresh-process seeks also fail to match the continuous trace at all five steps. This is the
reported result, not a tolerance decision.

Diagnostic, not a gate (`OMP_NUM_THREADS=1`, outputs in `output/diag-serial-*`): two full runs
are bit-identical at all five frames (max difference 0.0, hashes equal), and a fresh-process
seek to step 375 matches the single-thread continuous trace hash. This points at thread-level
floating-point ordering in the solver rather than the scene or the seek logic. It is not
verified beyond this check, and single-thread runs are not part of the claim.

Visual inspection (agent review only, not human approval): `output/contact.png`, five panels
at steps 1, 125, 250, 375 and 500 (t = 0.002 to 1.0 s; the first panel's label rounds to
"0.00 s"). The block starts as a regular grid on the left. By 0.25 s it has collapsed and
spread along the floor. By 0.5 s the fluid lies along the floor and climbs the right wall.
By 0.75 s and 1.0 s it is piled against the right wall, with a few particles splashing up
near the top right. No particle is visibly outside the box, and none tunnels through the
floor. The sheet shows the physics; it does not check any renderer.

Result: partial. The headless run, the particle count, the box bounds, the 2D positions,
the fixed step, the fall and spread, and the direction of the centre of mass pass. Two
checks fail: reruns are not bit-identical at default threads, and fresh-process seeks do not
match the continuous trace. The claim's determinism clause ("identical or within tolerance;
record either way") is answered by these measurements: not reproducible at default threads
beyond about 0.25 s. No tolerance was predeclared, and none is added now.

Not established: other machines, CPUs, thread counts, OS versions or Python builds; the
single-thread configuration as a validated route (it is a diagnostic only); any splashsurf
or surface-mesh output; 3D scenes; other SPH solvers; physical accuracy against a measured
dam break; the t = 0 state (not readable, see Plan).

Deviations: step 0 was not readable and the clock tolerance was widened, both before the
first gated run (see Plan). The checks were not tuned after any result.

Revalidate on: a pySPlisHSPlasH or SPlisHSPlasH version change, a change to `scene.json`
or `box.obj`, a change to thresholds in `check.py`, or a fix to thread determinism. A
single-thread variant would need its own README, predeclared checks and `expected/`, and
it would be a separate claim.

Reviewer, decision and follow-up: pending. The next step, if wanted, is a separate example
pinned to one thread with its own predeclared checks.
