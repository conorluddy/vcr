---
name: gltf-transform
description: Prepare and inspect glTF 2.x assets from the command line or Node. Load when a scene needs a scripted asset transform before rendering.
---

# glTF Transform

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Transform or inspect glTF/GLB assets before a renderer loads them; glTF Transform does not render scenes.
- The validated route centers one static triangle. Animation, extensions, textures, compression and arbitrary models are not covered by that evidence.
- Author or rig a model in Blender; render it with Three.js or Babylon.js.

## Capability map
The official CLI exposes inspect, validate and transforms such as center, prune, dedup, simplify, quantize and compression. The [CLI quickstart](https://gltf-transform.dev/cli) links the command and configuration references; the [function index](https://gltf-transform.dev/modules/functions) maps the Node API, including `NodeIO` and document transforms. VCR exercises `center` and `validate` only. Other commands, extensions and the Node API are documented but untested here.

## Install and doctor
```text
pnpm add -g @gltf-transform/cli
gltf-transform --version   # expect: 4.5.1
vcr doctor
```
The validated fixture used glTF Transform 4.5.1 on macOS arm64.

## Smoke test
```text
vcr example create gltf-transform-center
cd examples/gltf-transform-center && ./run.sh
# expect: gltf-transform-center: OK
```
The fixture centers an owned triangle, validates the resulting GLB, and compares repeated outputs byte-for-byte.

## Troubleshooting
- `gltf-transform validate` reports structural issues: fix the input asset before adding transforms; this fixture expects a valid glTF 2.0 triangle.
- KTX2 texture compression needs the separate KTX-Software toolchain; it is not installed or tested by this fixture.

## Official docs
- [glTF Transform CLI](https://gltf-transform.dev/cli)
- [center transform](https://gltf-transform.dev/modules/functions/functions/center)
- [NodeIO](https://gltf-transform.dev/modules/core/classes/NodeIO)
