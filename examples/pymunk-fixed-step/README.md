# pymunk fixed-step rigid-body fixture

## Intent and scope

VCR job and claim: pymunk, the Python binding to the Chipmunk 2D rigid-body engine,
simulates a predeclared scene (static floor, three boxes, two circles and one ball,
all at fixed start poses) at a fixed 1/60 s step. Body state at predeclared step
numbers is identical across reruns in separate processes. Re-simulating from step 0
to step N in a fresh process gives the same state as stepping one space continuously
to N, for every predeclared N in a shuffled order. A ball dropped onto the floor comes
to rest inside a predeclared region. No rendering is part of the claim; the frame
sheet below is inspection only.

Tool: pymunk 7.3.1 (PyPI, released 2026-10-11), bundling Chipmunk 2.0.1
(`pymunk.chipmunk_version` reports `2.0.1-ade7ed72849e60289eefb7a41e79ae6322fefaf3`).
Pinned exactly in `requirements.txt`, with its two transitive dependencies `cffi==2.1.1`
and `pycparser==3.12` resolved by pip.

Explicit exclusions:
- Collision callbacks, sensors, sleeping (`sleep_time_threshold` stays at its default,
  which is off), constraints (joints, motors, springs), and pickle or other space
  serialisation. None of these is in the scene.
- Any other step size, any variable or sub-stepped time, and any pymunk API beyond
  `Space.step`, `Body`, `Poly.create_box`, `Circle` and `Segment`.
- Cross-machine, cross-CPU, cross-Python or cross-pymunk-version byte equality. Only
  same-machine reruns are claimed. The expected file pins one machine's output.
- Physical accuracy against any real-world reference. The ball's rest region is a
  regression bound on this scene, not a measurement of a physical coefficient.
- Rendering. `frames_svg.py` draws SVG for a human look only; no check reads it.
- Seeking by any route other than re-simulation from step 0 (no snapshot restore,
  no `pickle`).

Procedural original shapes only; no media, no fonts, no external assets, and no
random seed (the scene has fixed initial poses and no randomness).

Licence and documentation sources, checked 2026-11-24:
- https://github.com/viblo/pymunk (project; card source `prospects/inbox/2026-11-14-discovery.md`)
- https://www.pymunk.org/en/latest/ (documentation; responded 200 on 2026-11-24)
- Licence: MIT. Read from the installed `pymunk-7.3.1.dist-info/licenses/LICENSE.txt`
  and its `License-Expression: MIT` metadata. The GitHub raw LICENSE path returned 404
  on both `master` and `main`, so the installed copy is the source checked here.
- No model, codec, dataset or asset dependency.

Environment: macOS (Darwin 25.6.0), arm64, Python 3.12.2 (`python3`), in a venv created
with `python3 -m venv`.
No GPU, no browser, no network use at run time.

Input: none. Every body is described in `scene.py`; nothing is read from disk.

Dependencies and installation plan (pre-approved package, venv only):
- `python3 -m venv examples/pymunk-fixed-step/output/venv` (git-ignored).
- `examples/pymunk-fixed-step/output/venv/bin/pip install -r requirements.txt`
  (pinned pymunk 7.3.1 and its transitive `cffi`/`pycparser`).
- Nothing installed into the system Python, the workspace `node_modules`, or any
  other example directory. `requirements.txt` is the committed pin; `output/` holds the venv.
- Network: PyPI, for installation only.
- Cleanup: remove `examples/pymunk-fixed-step/output` (venv, JSON, SVG, logs).

Selected workspace and output: `examples/pymunk-fixed-step/output/` (git-ignored).
Committed: this README, `example.json`, `run.sh`, `requirements.txt`, `scene.py`,
`generate.py`, `check.py`, `frames_svg.py`, and `expected/` (`states.json`, `checks.json`).
No media is committed.

## Plan, before running

Commands, in order:
```
python3 -m venv examples/pymunk-fixed-step/output/venv
examples/pymunk-fixed-step/output/venv/bin/pip install -r examples/pymunk-fixed-step/requirements.txt
examples/pymunk-fixed-step/run.sh --record   # writes expected/ after both runs agree
examples/pymunk-fixed-step/run.sh            # must print pymunk-fixed-step: OK
```
Inspection (not gating): `output/venv/bin/python frames_svg.py output/simulation.json output/frames`
then convert the SVGs with ImageMagick and read the contact sheet.

Scene constants (all in `scene.py`): step `1/60` s, `space.step(1/60)` once per frame of
simulated time; 900 steps (15 s); gravity (0, -900) px/s²; solver iterations 10; mass 1
per body; elasticity 0.3 and friction 0.7 on every shape; floor is a radius-2 segment on
y=0 from x=-400 to x=400, so its top is y=2 px. Units: pixels and seconds.

Predeclared bodies (name, kind, start x/y px, start angle rad, size px):
ball circle (-250, 200, 0, r 10); box_a (0, 300, 0, 40); box_b (30, 380, 0.4, 40);
box_c (60, 460, 0.9, 30); circle_a (120, 250, 0, r 15); circle_b (150, 330, 0, r 12).

Predeclared steps: recorded state at steps 0, 1, 2, 30, 60, 120, 240, 480, 900. Seek
order, a shuffle of the same nine steps: 480, 0, 900, 30, 2, 240, 1, 120, 60.

Expected outputs (`expected/`, JSON only, positions rounded to 6 decimal places; state
hashes are over full-precision floats):
- `states.json`: pymunk and Chipmunk versions, the 901-entry per-step state hash trace,
  recorded states, seek results.
- `checks.json`: check results and measurements from `check.py`.

Predeclared checks (`check.py` gates; `generate.py` measures):
1. `reruns_identical`: the two full `generate.py` outputs are equal as parsed JSON.
2. `fixed_step_is_one_sixtieth`: `step_seconds == 1/60`.
3. `trace_covers_declared_steps`: 901 trace hashes (steps 0 to 900).
4. `recorded_steps_as_declared`: recorded states are exactly the nine predeclared steps.
5. `seek_fresh_process_matches_trace`: each of the nine seeks, run as a fresh Python
   process from step 0, gives a state hash equal to the continuous trace at that step.
6. `seek_order_is_shuffled`: the seek order is not sorted and is a permutation of the
   recorded steps.
7. `distinct_trace_hashes`: at least 2 distinct state hashes over the trace.
8. `bodies_fell_to_floor`: every body's final y is at least 50 px below its start y.
9. `ball_rest_region`: final ball centre x in [-260, -240] px, y in [11.5, 12.5] px
   (floor top 2 px plus radius 10 px is 12 px), and speed at step 900 at most 1.0 px/s.

Measured but not gating: `seek_in_process_matches_trace` (re-simulating in the same
process that already ran the continuous trace). Chipmunk may assign shape hash ids from
a process-wide counter, so in-process re-simulation could differ from a fresh process
(not verified before the run). Its result is reported as a fact, not as a pass or fail.

Expected failure modes and stop conditions:
- The venv is missing or pymunk is not 7.3.1: `run.sh` stops with the install line.
- Any gating check fails: `run.sh` prints `checks.json` and exits non-zero. Do not change
  a threshold after seeing a result; report the failure.
- `diff` against `expected/` fails on a rerun: report nondeterminism.
- Ball or boxes visibly tunnel through the floor in the contact sheet: fail the visual check.

Reproduction: `run.sh` from a clean `output/`. Inspect with `frames_svg.py` and the
contact sheet command in the observation section below.

## Observation, after running

Executor and date: evidence agent (Claude), 2026-11-24, on Conors-MacBook-Pro-2.local
(`hostname`), macOS Darwin 25.6.0 arm64.

Exact versions: pymunk 7.3.1; Chipmunk `2.0.1-ade7ed72849e60289eefb7a41e79ae6322fefaf3`
(from `pymunk.chipmunk_version`); Python 3.12.2; cffi 2.1.1; pycparser 3.12. No browser,
Playwright, Chromium or Node is used by this fixture (Node 22.19.0 is present on the
machine but is not in the run path). ImageMagick 7.1.2-35 was used only for the inspection
sheet. Resolved set: `output/dependencies.txt`.

Commands run: `python3 -m venv output/venv`, `pip install -r requirements.txt`, then
`run.sh --record` (first run exited 0 and printed `recorded expected/`; the first attempt
failed only because `expected/` did not exist and was created), then `run.sh`, which
printed `pymunk-fixed-step: OK` and exited 0.

Checks, all gating checks true on the recorded run and on the verifying run:
- `reruns_identical`: the two generate.py outputs (separate processes) are equal as parsed JSON.
- `fixed_step_is_one_sixtieth`, `trace_covers_declared_steps` (901 hashes),
  `recorded_steps_as_declared` (nine steps).
- `seek_fresh_process_matches_trace`: 9 of 9 fresh-process re-simulations from step 0, run in
  the shuffled order 480, 0, 900, 30, 2, 240, 1, 120, 60, match the continuous trace hash.
- `seek_order_is_shuffled`, `distinct_trace_hashes` (901 distinct hashes over 901 steps).
- `bodies_fell_to_floor`: falls from 188.1 px (ball) to 403.2 px (box_c).
- `ball_rest_region`: final ball centre (-250.0, 11.9) px, speed 0.0 px/s. Inside the
  predeclared x and y ranges. The rest y is 0.1 px below the geometric contact at 12 px,
  which is Chipmunk's default collision slop; the range was predeclared to allow for it.

Measured, not gating: in-process re-simulation (same process as the continuous trace) also
matched the trace at 9 of 9 steps on this run. So no in-process difference showed up
here; the gate stays on fresh processes, which does not depend on that behaviour.

Negative check: a copy of the recorded simulation with one body x moved by 1e-6 px at step
480 makes `check.py` report `reruns_identical: false` and exit 1, so the rerun gate is live.

Determinism sources audited: the core pymunk `.py` modules contain no `random`, `time`,
`datetime` or `perf_counter` references, and the compiled `_chipmunk.abi3.so` shows no
rand or clock symbol names. The scene has fixed poses and a fixed step, so no seed is used.

Visual inspection (agent review only, not human approval): `frames_svg.py` drew the nine
recorded steps, and six were rasterised with ImageMagick into `output/contact.png`
(1200×520, half scale; steps 0, 30, 120 on the top row and 240, 480, 900 on the bottom).
At step 0 the boxes and circles sit in the air with the red ball at the left. By step 120
the ball has come to rest on the grey floor line, and the boxes and circles have landed
and piled up on the right. The bottom row (steps 240, 480, 900) looks the same, so the
scene has settled by step 240 and nothing tunnels through the floor. The frames show the
physics but nothing about a different renderer.

Result: pass for the stated claim, on this machine and this pymunk build.

Not established: other machines, CPUs, OS versions, Python builds or pymunk versions (the
expected file is one machine's output); byte equality across pymunk or Chipmunk upgrades;
collision callbacks, sleeping, joints or serialisation; any step size other than 1/60 s; any
physical accuracy. The ball's rest region is a regression bound on this scene, not a
measured coefficient.

Revalidate on: pymunk or Chipmunk version change, Python minor version change, any change
to `scene.py`, or a change to the thresholds in `check.py`.

Commands for the contact sheet (run from `examples/pymunk-fixed-step/output/frames`):
```
magick step-0000.svg step-0030.svg step-0120.svg step-0240.svg step-0480.svg step-0900.svg -background none PNG32:%d.png
magick \( 0.png 1.png 2.png +append +repage \) \( 3.png 4.png 5.png +append +repage \) -append +repage -background '#808080' -flatten -resize 50% ../contact.png
```
