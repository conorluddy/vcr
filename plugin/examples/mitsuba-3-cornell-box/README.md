# Mitsuba 3 Cornell box, fixed seed and sample count

## Intent and scope

- Tool/version: Mitsuba 3.9.1 (PyPI wheel, BSD-3-Clause per the shipped licence file), drjit 1.5.0, numpy 2.5.5. Pinned in `requirements.txt`.
- Claim: with the `scalar_rgb` variant, the built-in `mi.cornell_box()` renders at a fixed size, spp and seed to a plausible picture, and the same seed repeats exactly.
- Exclusions: LLVM, spectral, polarized, Metal and differentiable variants; animation; custom meshes; GPU; large images.
- Docs: https://mitsuba.readthedocs.io, https://github.com/mitsuba-renderer/mitsuba3.
- Environment: macOS arm64, Python 3.12.2, venv in `output/venv` (git-ignored). `run.sh` creates it itself from `requirements.txt` (network needed once); nothing is installed outside the example.
- Input: none; the scene is built into Mitsuba.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`. `check.py` runs in two separate processes.
- Checks (predeclared): version 3.9.1; shape 96x96x3; all finite; same seed gives bitwise-identical pixels in-process and across processes; different seed differs; left-wall mean R > 2x G and right-wall mean G > 2x R; global mean in 0.05 to 0.8; a 256 spp render of another seed is closer to a 256 spp reference than a 16 spp one.
- Stop conditions: version differs.
- Failure interpretation: any failed check is reported as a failure of that claim, not loosened.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`; result `partial`. The PNG (`output/cornell.png`) was viewed: a correct Cornell box, red left wall, green right wall, ceiling light, two boxes, visible 16 spp noise. LLVM variants fail to initialise here (`LLVM API initialization failed`), so `scalar_rgb` was used.

Two predeclared checks fail, and `expected/metrics.json` records them as observed:

1. Bitwise repeatability fails with the same seed, in one process and across processes (rendering is multi-threaded; max absolute difference about 3e-8, float rounding order). `set_thread_count(1)` did not restore equality in a quick probe. After seeing this, one check was added (max abs diff below 1e-6 passes); it does not replace the bitwise one.
2. The green wall is dim: right-edge mean G 0.0588 against R 0.05, so the predeclared 2x ratio fails although the wall looks green. The threshold was a guess and is kept as run.

`run.sh` exits 0 when the output equals `expected/metrics.json` (failures included) and prints `FINDING` lines for each false value. Not shown: bitwise determinism, other variants, quality beyond this one scene.
