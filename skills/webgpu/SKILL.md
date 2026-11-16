---
name: webgpu
description: Use WebGPU when browser work needs modern GPU pipelines or compute shaders and the target environment exposes an adapter. This guide covers a WGSL compute dispatch and mapped buffer readback using Chromium SwiftShader.
---

# WebGPU

## Use cases and limits

Use WebGPU for explicit GPU compute or rendering pipelines when the target browser and adapter support the required features. The VCR fixture tests a single WGSL compute pipeline, three dispatches, and `GPUBuffer.mapAsync()` readback through Chromium's SwiftShader software adapter. It does not test rendering passes, hardware GPUs, performance, other browsers, or other platforms. For broad headless compatibility use WebGL; check `navigator.gpu.requestAdapter()` before selecting WebGPU.

## Capability map

| Area | Reference | VCR evidence |
| --- | --- | --- |
| Adapter and device | [GPU.requestAdapter](https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter), [GPUDevice](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice) | Secure loopback context, SwiftShader adapter and device creation exercised. Hardware adapter behavior untested. |
| WGSL and shader modules | [GPUShaderModule](https://developer.mozilla.org/en-US/docs/Web/API/GPUShaderModule), [WGSL spec](https://www.w3.org/TR/WGSL/) | One compute shader performs `input * 3 + 0.5`; zero shader errors checked. Other WGSL features untested. |
| Compute pipelines and dispatch | [GPUComputePipeline](https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePipeline), [GPUComputePassEncoder](https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePassEncoder) | One pipeline and one-workgroup dispatch repeated three times. Larger workloads and pipeline layouts untested. |
| Buffers and mapping | [GPUBuffer](https://developer.mozilla.org/en-US/docs/Web/API/GPUBuffer), [GPUBuffer.mapAsync](https://developer.mozilla.org/en-US/docs/Web/API/GPUBuffer/mapAsync) | Storage input/output and mapped readback buffers exercised; eight Float32 outputs checked exactly. Textures and mapping other resources untested. |
| Rendering and presentation | [WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) | Not exercised: no render pass, canvas configuration, presentation or swap chain. |

## Install and doctor

WebGPU is a native browser API; there is no package to install and `vcr doctor` does not probe browser adapters. The fixture uses Playwright 1.64.1 and Chromium 156.0.8078.4 on macOS arm64 with the documented SwiftShader/Vulkan flags. Its loopback origin provides a secure context. This is software compute, not hardware-GPU validation.

## Smoke test

```sh
./run.sh
# expect: pass; WebGPU adapter architecture swiftshader; 3 mapped reads equal [0.5,3.5,-5.5,1.25,11,-4,7.25,0.125]; hashes match
```

Run from the repository root with `vcr tools examples webgpu` to locate the fixture. The exact browser version, adapter, features and numeric outputs are retained in `expected/metrics.json`; adapter feature lists may change across Chromium builds.

## Troubleshooting

- `navigator.gpu` or adapter unavailable: WebGPU needs a supported secure context and a working adapter; verify browser flags and `navigator.gpu.requestAdapter()` before dispatch.
- Device or shader creation fails: inspect validation errors and shader compilation messages before relying on output values.
- Mapping hangs or fails: wait for queue work to finish, map only a mappable buffer, and unmap it after reading.
- Output differs: confirm the SwiftShader adapter, Chromium build, WGSL inputs and Float32 layout; this fixture makes no cross-adapter determinism claim.

## Official docs

- [WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
- [GPU.requestAdapter](https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter)
- [WebGPU specification](https://www.w3.org/TR/webgpu/)
- [WGSL specification](https://www.w3.org/TR/WGSL/)
