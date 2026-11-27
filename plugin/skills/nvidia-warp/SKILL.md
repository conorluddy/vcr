---
name: nvidia-warp
description: Use NVIDIA Warp (Python, warp-lang) to bake custom 3D particle or field simulation at a fixed step on the CPU and seek by re-simulation. Load when a Python pipeline needs its own simulation kernels; the VCR fixture validates same-machine CPU reruns only.
---

# NVIDIA Warp

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use for offline 3D particle or field sims written as Python kernels, whose per-step arrays (`array.numpy()`) feed a renderer, Blender or three.js. Warp draws nothing in VCR; the fixture's picture is inspection only.
- Rigid bodies with contacts and joints: Jolt (`jolt-physics-js`) or Rapier. Plain 2D rigid bodies: Pymunk. SPH through an app: SPlisHSPlasH.
- macOS wheels are CPU only (no Metal): keep particle counts small and expect JIT compile time on first use (about 1.3 s for the fixture's module).
- Cloth and soft bodies: `warp.sim` is not in the 1.19.0 wheel (no `warp/sim` package). Untested; do not promise it.
- Validated on warp-lang 1.19.0, numpy 2.5.5, Python 3.12, macOS arm64, one machine.

## Capability map
Discovery only; starred items are exercised by the fixture.

| Area | Main use | Official reference |
| --- | --- | --- |
| `@wp.kernel`, `wp.launch`, `wp.array`, `wp.vec3`* | Write and run parallel kernels on the CPU | [Runtime](https://nvidia.github.io/warp/stable/) |
| `wp.atomic_add`* | Reductions (measured, not gated) | [Runtime](https://nvidia.github.io/warp/stable/) |
| `warp.fem` | Finite elements and grid fluids | [FEM](https://nvidia.github.io/warp/stable/) |
| `wp.Mesh`, `wp.HashGrid`, `wp.Volume` | Raycast, neighbour search, NanoVDB | [Geometry](https://nvidia.github.io/warp/stable/) |
| `warp.render` | Preview and USD output | [Rendering](https://nvidia.github.io/warp/stable/) |
| `warp.examples` | Particle, DEM, SPH, fluid samples | [Examples](https://github.com/NVIDIA/warp/tree/main/warp/examples) |

## Install and doctor
Use a venv; the example pins `warp-lang==1.19.0` and `numpy==2.5.5`.
```sh
python3.12 -m venv output/venv
output/venv/bin/pip install -r requirements.txt
output/venv/bin/python -c "import warp; print(warp.config.version)"
vcr doctor
```
Redirect the kernel cache so nothing lands in `~/.cache`: `wp.config.kernel_cache_dir = "output/warp-cache"`.

## Smoke test
After `vcr example create nvidia-warp-particle-fixed-step`, change to the destination it prints, then:
```sh
./run.sh
# expect: nvidia-warp-particle-fixed-step: OK
```
`run.sh` builds its own venv (PyPI needed on first run), warms up the JIT, runs 600 steps twice, then gates: reruns equal; 601 hashes; nine fresh-process re-simulations in the order 300, 0, 600, 60, 1, 450, 120, 2, 200 equal to the trace; no penetration of floor or sphere; final max speed under 0.05 m/s (recorded 0.01167). Five repeated `atomic_add` sums were identical in this run (0.746666).

## Clock rules
- Step a constant `1/60` s with fixed substeps (4 in the fixture); no wall-clock or variable `dt`.
- Seek to frame N by rebuilding the initial arrays (seeded `numpy.random.RandomState`) and stepping N times from frame 0.
- Keep each kernel thread writing only its own slot (the fixture's neighbour loop reads all, writes one); `atomic_add` float sums may reorder under more threads, so do not rely on bit-exact atomics. The fixture ran only 64 threads.
- Hash `array.numpy().tobytes()` for determinism checks; round only what is stored.

## Troubleshooting
- Banner lines on stdout at `wp.init()` even with `wp.config.quiet = True`: capture the last line when a script prints a result.
- First launch of a kernel prints `compiled` and takes a second or more; run a warm-up before timing.

## Official docs
- https://nvidia.github.io/warp/ and https://github.com/NVIDIA/warp (Apache-2.0, 1.19.0)
