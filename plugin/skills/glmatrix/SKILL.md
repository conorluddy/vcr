---
name: glmatrix
description: Use gl-matrix (glMatrix) for Float32 vector and matrix maths such as perspective and lookAt cameras in raw WebGL or WebGPU code. VCR evidence covers only Node projection maths with 3.4.4, not rendering.
---

# glMatrix

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Pure matrix, vector and quaternion maths on `Float32Array`, with an output-first signature (`mat4.perspective(out, ...)`). Pure functions of their inputs, so safe inside a seek-driven frame.
- It draws nothing and has no timeline. Pair it with `webgl`, `webgpu`, `regl` or `twgl`.
- Skip it in Three.js (built-in `Matrix4`), OGL or twgl (own maths). Animated values over time belong to Anime.js.
- Evidence covers only Node maths, not WebGL or shaders. Do not assume a matrix is right for a renderer until a render shows it.

## Capability map
Reference: [glmatrix.net/docs](https://glmatrix.net/docs/). Stable top-level modules, each a namespace of functions:
- `mat4`: perspective, lookAt, multiply, ortho, translate, rotate, scale, invert. Tested: `perspective`, `lookAt`, `multiply`. Rest untested.
- `vec4`: `transformMat4` tested. Other ops untested.
- `vec3`, `vec2`: untested.
- `quat`, `quat2` (slerp, fromEuler, rotation paths): untested.
- `mat3`, `mat2`, `mat2d`: untested.

Documented does not mean validated by VCR. Only the tested items above are.

## Install and doctor
```text
pnpm add gl-matrix@3.4.4
vcr doctor   # does not check libraries; confirm with: node -e "console.log(require('gl-matrix/package.json').version)"
```
Validated: 3.4.4, Node 22.19.0, macOS arm64, default Float32 arrays, see `examples/glmatrix-camera-projection`.

## Smoke test
```text
vcr example create glmatrix-camera-projection && (cd examples/glmatrix-camera-projection && ./run.sh)
# expect: glmatrix-camera-projection: OK (gl-matrix 3.4.4, node v22.19.0, max NDC error 5.3987633696905846E-8)
```
The version and error come from the run; the error is stable on this setup because output is byte-identical across runs.

## Tested behaviour
```ts
import { mat4, vec4 } from "gl-matrix";
const projection = mat4.perspective(mat4.create(), fovyRadians, aspect, near, far);
const view = mat4.lookAt(mat4.create(), eye, target, up);
const viewProjection = mat4.multiply(mat4.create(), projection, view); // projection * view
const clip = vec4.transformMat4(vec4.create(), [x, y, z, 1], viewProjection);
const ndc = [clip[0] / clip[3], clip[1] / clip[3], clip[2] / clip[3]];
```
- Shown by the fixture: five points match a closed-form NDC reference within 1e-6 (max 5.4e-8); the lookAt target lands at NDC (0, 0); points in front of the camera have clip `w > 0`; two runs are byte-identical.
- Convention seen: right-handed view, camera looks down -Z, NDC z about 0.97 for depth between near 0.1 and far 100 (the -1 to 1 range). Other depth conventions (`perspectiveZO`) are untested.
- `multiply(out, a, b)` computes `a * b`; put projection first.
- Float32 storage: expect about 1e-8 error, so compare with a tolerance, not equality.

## Troubleshooting
- Nothing visible, or `w <= 0`: the point is behind the camera; the fixture throws on this.
- Values differ from a hand calculation by about 1e-8: Float32 rounding, not a bug.
- Output changes after an upgrade: re-record `expected/` and note the version in evidence.

## Official docs
- https://glmatrix.net/docs/ (3.4.4)
- https://github.com/toji/gl-matrix
