---
name: mitsuba-3
description: Render still images with the Mitsuba 3 Python path tracer (scalar_rgb, fixed spp and seed) from a pip venv. Load once Mitsuba has been chosen for scripted physically based stills; it is not bitwise reproducible in VCR evidence.
---

# Mitsuba 3

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Scripted stills from a Python scene dict with explicit `spp` and `seed`; frames are separate renders (no animation system).
- Meshes, rigs and the compositor: `blender-background`. Text-only CSG scenes: `pov-ray`.
- VCR evidence covers 3.9.1, `scalar_rgb`, macOS arm64, Python 3.12 only, and it is partial: same seed gave pixels equal only to about 3e-8, not bitwise, in and across processes. Compare with a tolerance, not a hash.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `mi.load_dict`, `mi.cornell_box`, `mi.traverse`, `mi.render(spp, seed)` | [docs](https://mitsuba.readthedocs.io) | tested |
| Variants `scalar_rgb` | [variants](https://mitsuba.readthedocs.io/en/stable/src/key_topics/variants.html) | tested |
| `llvm_ad_*` variants | same | failed to initialise on the fixture machine |
| Spectral, polarized, Metal, differentiable rendering, XML scenes | [docs](https://mitsuba.readthedocs.io) | untested |

## Install and doctor
```sh
python3 -m venv output/venv && output/venv/bin/pip install mitsuba==3.9.1 numpy==2.5.5
```
Project-local venv; `vcr doctor` does not probe it. numpy is needed for array results but is not a wheel dependency.

## Smoke test
```sh
cd examples/mitsuba-3-cornell-box && ./run.sh
# expect: mitsuba-3-cornell-box: OK  (plus FINDING lines for the recorded failures)
```
It builds its own venv on first run, renders twice in separate processes and diffs `expected/metrics.json`.

## Recipe
```py
import mitsuba as mi
mi.set_variant("scalar_rgb")
scene = mi.load_dict(mi.cornell_box())
p = mi.traverse(scene); p["sensor.film.size"] = [96, 96]; p.update()
img = mi.render(scene, spp=16, seed=7)           # float image
mi.Bitmap(img).convert(mi.Bitmap.PixelFormat.RGB, mi.Struct.Type.UInt8, srgb_gamma=True).write("out.png")
```
96x96 at 16 spp with four renders and two 256 spp ones takes well under a minute on an M3.

## Troubleshooting
- `jitc_llvm_init(): LLVM API initialization failed` on stderr: no LLVM library; use `scalar_rgb`.
- Same seed differs in the last float bits (about 3e-8): multi-threaded accumulation; `set_thread_count(1)` did not fix it in one probe.
- Dim wall colours: the green wall measured only about 1.2x its red channel at the image edge; do not threshold colour at 2x.

## Official docs
- [Mitsuba 3 documentation](https://mitsuba.readthedocs.io)
- [Repository](https://github.com/mitsuba-renderer/mitsuba3)
- [PyPI](https://pypi.org/project/mitsuba/)
