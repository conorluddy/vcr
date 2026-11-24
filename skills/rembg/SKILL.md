---
name: rembg
description: Cut a still-image subject out of its background to an RGBA PNG with rembg's Python library and default u2net model. VCR evidence covers one generated sphere over a busy checker, CPU only; not photos, hair or alpha matting.
---

# rembg

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- rembg removes the background from a still image with a local ONNX salient-object model and returns the subject with an alpha channel. In VCR it makes a cutout layer for compositing.
- Evidence: rembg 2.0.85, onnxruntime 1.32.0 (CPU), the default `u2net` model, the library route (`new_session`, `remove`), one generated 512×512 shaded sphere over a busy checker, macOS arm64. Output was RGBA at the input size, IoU 0.996 against the analytic disc, and a fresh-process rerun was byte-identical.
- That is an easy salient-object case with a hard, high-contrast edge. Photographs, hair, fine or semi-transparent edges, other models, the CLI, `alpha_matting`, `post_process_mask`, `only_mask`, `bgcolor`, video and GPU providers are untested. The example's thresholds are fixture parameters, not a quality bar.
- Byte identity was seen on one machine and onnxruntime version; a different onnxruntime may change bytes.
- Neighbours: [mediapipe](../mediapipe/SKILL.md) when the job is a category mask from a task API with a model chosen for a specific subject (people) rather than a free-standing alpha cutout; rembg when the deliverable is the cutout itself. Use `imagemagick` for manual compositing and `potrace` for vector tracing.
- Image treatment: a mask edge is a treatment decision. Judge the cutout's edge on a contrasting backdrop and keep alpha interpretation consistent through compositing (`FX-MASK-EDGE`, `FX-PREMULT-EDGES`; `vcr rules info <ID>`). The fixture's edge is hard because its ground truth is hard; do not expect soft edges from it.

## Capability map
Discovery only; the [README](https://github.com/danielgatis/rembg#readme) is the entry point.
- **Library:** `new_session(name)` and `remove(data, session=...)` accept bytes, PIL images or arrays. Tested: bytes in, PNG bytes out, default `u2net`.
- **Models:** the README lists other sessions (isnet, birefnet, sam, silueta, human segmentation and more), each with its own weights and licence. Untested.
- **Options of `remove`:** alpha matting, `only_mask`, `post_process_mask`, `bgcolor`. Untested.
- **CLI and server:** `rembg i`, `p` (folders), `s` (HTTP server) and optional remote services. Untested; the catalogue install check is `rembg --help`.

## Install and doctor
rembg is a project Python package, not a machine executable. The fixture expects `examples/rembg-cutout/output/venv` with:

```sh
python3.12 -m venv examples/rembg-cutout/output/venv   # Homebrew python3.12
examples/rembg-cutout/output/venv/bin/pip install "rembg[cpu]==2.0.85"
```

`vcr doctor` does not establish that the venv imports rembg; check with `output/venv/bin/python -c 'import rembg'`. `run.sh` refuses to run without the venv and never installs.

- The pyenv 3.12.2 Python lacks `_lzma`, so `import rembg` fails inside `pooch`. Build the venv from a Python that has lzma (Homebrew `python3.12` worked).
- The first `new_session("u2net")` downloads `u2net.onnx` (175,997,641 bytes, about 168 MiB) to `~/.rembg/models/u2net/`. Needs network once. In the installed source, `U2NET_HOME` (wins when set), or `REMBG_HOME`, or `XDG_DATA_HOME/rembg` relocate it; only the default was exercised.
- Licences: rembg is MIT; U-2-Net weights are Apache-2.0. Other models carry their own terms; check them per model.

## Smoke test
```sh
cd examples/rembg-cutout && ./run.sh
# expect: rembg-cutout: OK  (output/checks.json matches expected/checks.json: RGBA 512x512, iou 0.995783, rerun byte-identical)
```
`generate.py` draws the scene, `cutout.py` cuts it out twice in separate processes, `check.py` measures against the analytic disc.

## Recipe
```python
from rembg import new_session, remove
session = new_session("u2net")
Path("cutout.png").write_bytes(remove(Path("scene.png").read_bytes(), session=session))
```
Create the session once per process. Inspect the result over a contrasting backdrop before compositing.

## Troubleshooting
- `ModuleNotFoundError: No module named '_lzma'`: the venv's Python was built without lzma; rebuild it from another interpreter.
- A long first run is the model download; later runs read the cache.
- Expected files differ after an upgrade: rembg 2.0.86 and 2.0.87 exist and were not tested; an onnxruntime change can alter the cutout hash while the checks still pass.

## Official docs
- [rembg repository and README](https://github.com/danielgatis/rembg)
- [U-2-Net (weights, Apache-2.0)](https://github.com/xuebinqin/U-2-Net)
