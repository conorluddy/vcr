# NVIDIA Warp particle fixed-step fixture

## Intent and scope

- Tool: warp-lang 1.19.0 (PyPI, 2026-11-02), `macosx_11_0_arm64` wheel, with numpy 2.5.5 (pinned in `requirements.txt`), Python 3.12.
- Claim: a Warp kernel on the CPU backend steps 64 particles (gravity, pairwise repulsion, a sphere and a floor) at a fixed 1/60 s with 4 substeps for 600 frames. Two separate processes give the same per-frame state hashes, and a fresh process re-simulating from frame 0 to N matches the continuous trace for N in a shuffled order.
- Exclusions: CUDA and Metal (the macOS wheel is CPU only; the tool card says so), cloth and soft bodies (`warp.sim` is absent from 1.19.0; the wheel has no `warp/sim` package), FEM, fluids, marching cubes, rendering, other machines or Warp versions. No bit-exactness claim for atomics across thread counts.
- Licence: wheel metadata `License: Apache-2.0`, `LICENSE.md` shipped; bundled third-party licences are listed in `licenses/` (checked 2026-11-27). Docs: https://nvidia.github.io/warp/.
- Environment: macOS arm64, Python 3.12, device `cpu` ("arm"). Input: none; initial positions from `numpy.random.RandomState(7)` plus a fixed height ladder.
- Install: `run.sh` builds `output/venv` with `python3.12 -m venv` and `pip install -r requirements.txt` (PyPI, first run only). Kernel cache is redirected to `output/warp-cache`, so nothing lands in `~/.cache`. Cleanup: remove `output/`.

## Plan, before running

Commands: `./run.sh --record`, then `./run.sh` must print `nvidia-warp-particle-fixed-step: OK`. `run.sh` first runs a 1-frame warm-up to JIT-compile kernels.

Predeclared gates (`check.py`): reruns identical as parsed JSON; 601 trace hashes; nine fresh-process seeks, order 300, 0, 600, 60, 1, 450, 120, 2, 200, each equal to the trace hash; order not sorted; more than 100 distinct hashes; all positions finite; none below the floor (y >= 0.05 - 1e-4); none inside the sphere (centre (0,1,0), radius 0.5 plus particle radius 0.05, tolerance 1e-3); final max speed under 0.05 m/s.

Measured, not gated: five repeated `wp.atomic_add` sums of particle speeds in one process. Stop conditions: a failed gate stays failed, is recorded in `expected/`, `run.sh` prints `KNOWN FAIL`; thresholds are never changed after the fact.

## Observation, after running

2026-11-27, Conors-MacBook-Pro-2.local, macOS arm64. All nine gates passed. Final max speed 0.01167 m/s; the five atomic sums were identical (0.746666). From a clean `output/`, `--record` took about 11 s including venv creation and compilation.

Inspection: a side-view sheet of frames 0, 100 and 200 shows a column of particles dropping onto the sphere, scattering off it and spreading about 8.5 m either side, then lying on the floor line by frame 200. The spread is wide because drop heights reach 9.5 m. Nothing penetrates the sphere or the floor.

Establishes: same-machine, same-process-environment determinism of this CPU kernel and seek by re-simulation. Not established: cross-machine or cross-version equality, thread-count effects on atomics (one launch of 64 threads; the sums agreed here), large particle counts or speed, GPU behaviour, visual quality (the picture is an inspection aid only, not a deliverable).
