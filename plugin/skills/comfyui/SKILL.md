---
name: comfyui
description: Run a headless ComfyUI server on loopback and execute an API-format workflow of built-in image nodes through POST /prompt and /history. Load when a node graph must be driven from a script; ImageMagick covers plain raster operations, and any model-based generation is untested here.
---

# ComfyUI

A node-graph application with a local HTTP API. Here it is run as a CPU-only server on 127.0.0.1; a script posts an API-format workflow, polls for completion and reads the saved PNG.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Scripted image graphs (scale, invert, blend, save) submitted as JSON, with a run record in `/history`.
- Simple deterministic raster work does not need a server: use `imagemagick`. Encoding and muxing: `ffmpeg`.
- Tested: ComfyUI v0.46.0 (commit a277b5bf), torch 2.15.0 CPU, Python 3.12.13, macOS arm64, six built-in image nodes, no models, one 64x48 generated input.
- Untested: any diffusion model or checkpoint (licences vary per model, check each before use), GPU or MPS, custom nodes, the Manager, the browser UI, websocket progress, `/interrupt`, queues, server restarts, other versions or platforms.

## Capability map
- Tested: `POST /prompt`, `GET /history/{id}`, `GET /view`, `GET /system_stats`; nodes `LoadImage`, `ImageScale` (nearest-exact), `ImageInvert`, `EmptyImage`, `ImageBlend` (normal), `SaveImage`.
- Documented, untested: checkpoint, sampler and text-encoder nodes, latent space, custom nodes and the Manager, websocket `/ws`, `/queue`, `/interrupt`, `/upload/image`, GPU backends ([README](https://github.com/Comfy-Org/ComfyUI#readme), `comfy/cli_args.py` for flags, `server.py` for routes, `comfy_extras/nodes_post_processing.py` for blend maths).
- Discoverability only: this map lists what the project documents; it is not VCR validation.
- Image-treatment rules: `FX-BLEND-SPACE-DECLARED` and `FX-BLEND-SPACE-CONSISTENT` apply to `ImageBlend`, which blends the stored values directly (`vcr rules info <ID>`). `FX-DETERMINISM` is checked by resubmission below.

## Install and doctor
Pin a tag in the example's `output/` (git-ignored, about 2.2 GB with the torch venv):
```text
cd examples/comfyui-headless-graph
git clone https://github.com/Comfy-Org/ComfyUI output/src && git -C output/src checkout v0.46.0
/opt/homebrew/bin/python3.12 -m venv output/venv
output/venv/bin/pip install -r output/src/requirements.txt   # not fully pinned; run.sh freezes the set
vcr doctor
```
Validated 2026-11-24 on macOS arm64, see `examples/comfyui-headless-graph`. Requirements resolve from PyPI at install time, so a later install may differ.

## Smoke test
```text
vcr example create comfyui-headless-graph && (cd examples/comfyui-headless-graph && ./run.sh)
# expect: comfyui-headless-graph: OK
```
Checks a 128x96 RGB PNG; `/history` completed with `success`; no cached nodes; four probes within 1 of predicted; loopback-only listener; two submissions byte-identical.

## Server and workflow
Start (flags as validated):
```text
DO_NOT_TRACK=1 output/venv/bin/python output/src/main.py --cpu --listen 127.0.0.1 --port 8188 \
  --base-directory output/comfy --disable-auto-launch --disable-metadata \
  --disable-all-custom-nodes --offline --cache-none &
SERVER_PID=$!; trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
```
Wait until `GET /system_stats` answers, then post and poll. `workflow.json` is API format: node id to `class_type` and `inputs`, links as `["<node id>", <output index>]`.
```json
{"1": {"class_type": "LoadImage", "inputs": {"image": "vcr-fixture-input.png"}},
 "2": {"class_type": "ImageScale", "inputs": {"image": ["1", 0], "upscale_method": "nearest-exact", "width": 128, "height": 96, "crop": "disabled"}},
 "3": {"class_type": "ImageInvert", "inputs": {"image": ["2", 0]}},
 "4": {"class_type": "EmptyImage", "inputs": {"width": 128, "height": 96, "batch_size": 1, "color": 3368652}},
 "5": {"class_type": "ImageBlend", "inputs": {"image1": ["3", 0], "image2": ["4", 0], "blend_factor": 0.5, "blend_mode": "normal"}},
 "6": {"class_type": "SaveImage", "inputs": {"images": ["5", 0], "filename_prefix": "vcr-fixture"}}}
```
- Submit with `POST /prompt` body `{"prompt": <workflow>}`; the reply carries a `prompt_id`. Poll `GET /history/<prompt_id>` until the entry exists with `status.completed` true and `status_str` `success`; fetch files named in its `outputs` via `/view`. A rejected prompt returns node errors instead of an id.
- Inputs are read from `<base-directory>/input`, outputs land in `<base-directory>/output` as `prefix_00001_.png`, numbered per submission.
- `--cache-none` makes every submission a real re-execution. `--disable-metadata` keeps the prompt out of the PNG, so the file is pixels only.
- `EmptyImage` `color` is an integer: `0x3366CC` is 3368652.
- `ImageBlend` normal mode is `image1*(1-f) + image2*f`, on stored values with no colour-space conversion (`FX-BLEND-SPACE-DECLARED`).
- Resubmitting the same workflow to the same server gave byte-identical output (same machine, one server process); across restarts, torch or Pillow versions it is unmeasured.

## Security and operations
- Always bind to loopback (`--listen 127.0.0.1`). The API runs graphs and writes files with no authentication; the validated listener was a single `127.0.0.1:8188` socket.
- Keep `--disable-all-custom-nodes` and leave the Manager off unless the code has been reviewed: custom nodes are arbitrary Python.
- Keep everything under a project `--base-directory`; do not point it at a home directory.
- Always stop the server with an `EXIT` trap, and refuse to start if the port already answers.
- `DO_NOT_TRACK=1` plus `--offline` kept the server from making outbound requests; install itself needs GitHub and PyPI.
- Models are the person's to supply and licence-check one by one. ComfyUI itself is GPL-3.0.

## Troubleshooting
- `/history` v0.46.0 has no per-node "executed" record. Its messages are `execution_start`, `execution_cached`, `execution_success`. Verify a run through `outputs` and `--cache-none`, not node events.
- Probes were off by up to 1 from the predicted unrounded values: the PNG is integer and truncates. Compare with a tolerance of 1, not equality.
- Port already answering: another server is running; stop it or set a different `--port`.
- Server slow to start: allow up to about 240 s for the first import of torch; read `server.log` if it exits.

## Official docs
https://github.com/Comfy-Org/ComfyUI at tag v0.46.0 (README, `server.py`, `comfy/cli_args.py`)
