# PhiFlow 2D smoke plume (NumPy backend)

## Intent and scope

- Tool/version: PhiFlow `phiflow` 3.4.0 (PyPI, 2025-08-02), MIT, with phiml 1.16.1, numpy 2.5.5, scipy 1.18.1, matplotlib 3.11.2 (full list in `output/dependencies.txt`). Pinned in `requirements.txt`.
- Claim: PhiFlow steps a small 2D buoyant smoke simulation a fixed number of times on the NumPy backend, deterministically, and fields can be saved per frame as arrays and images for later compositing; the flow is divergence-free and the plume rises.
- Exclusions: torch, jax and tensorflow backends, GPU, 3D, rendering quality, larger grids, other solvers (particles, FLIP, Navier-Stokes with viscosity), PhiFlow's own `vis` plotting.
- Docs and licence: https://tum-pbs.github.io/PhiFlow/, https://github.com/tum-pbs/PhiFlow; MIT from PyPI metadata, checked 2026-11-27.
- Environment: macOS arm64, Python 3.12.2, venv in `output/venv` (git-ignored); `run.sh` creates it with `pip install -r requirements.txt` when missing (network needed only then).
- Input: none; parameters live in `sim.py` (64x64 cells, box 100x100, spherical inflow of 0.2 for 15 steps, dt 1, 60 steps, buoyancy 0.1, MacCormack advection of smoke, semi-Lagrangian advection of velocity, pressure projection each step). Frames 0, 20, 40, 60 are saved.
- Cleanup: remove `output/`.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`. `check.py` runs twice in the process and `run.sh` runs `check.py` twice in separate processes; the JSON must be identical.
- Checks (all gating, thresholds fixed before the first successful run): version 3.4.0; four 64x64 frames saved; two in-process runs bit-identical (SHA-256 of all frames), and two processes identical; smoke mass strictly grows on every inflow step; **after inflow stops, total smoke mass varies by less than 2 percent**; max |divergence| of the final velocity below 1e-4; centroid rises more than 10 cells after inflow; smoke never below -0.05; final frame not blank.
- Stop conditions: version differs, or processes differ.
- Failure interpretation: any false check is reported as failed and the result is at best `partial`; thresholds are not changed afterwards.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. 8 of 9 checks pass; processes agree byte for byte; max divergence 1.6e-6; the centroid rises from row 10.8 to 29.7. The frames were viewed at 2x: a round puff leaves the inflow, then curls into a mushroom ring as it rises, which is the expected look for buoyant smoke.

**Failed: `mass_drift_after_inflow_below_2_percent`.** With inflow off (steps 16-60), total mass falls from 94.8 to 89.7 (-5.4 percent) and then rises to 103.3, a 14.4 percent range. MacCormack and semi-Lagrangian advection are not conservative, so mass is not a physical invariant of this setup; it is an advection artefact. The check stays failed in `expected/metrics.json`, and `run.sh` exits 0 only because it reproduces that recorded result, printing the KNOWN FAIL line.

Findings while getting the first run: (1) a fully closed box (velocity ZERO on every side) raised `Diverged: Direct solution does not satisfy tolerance` in `make_incompressible` at step 1 on the singular pressure system, also with `Solve(rank_deficiency=1)`; the fixture leaves the top open (`ZERO_GRADIENT` on `y+`), which solves. (2) Without `-W ignore`, PhiFlow prints scipy `SparseEfficiencyWarning` noise on every step. This proves stepping, determinism and divergence-free projection on NumPy for this setup; it does not prove mass conservation, other backends or visual quality.
