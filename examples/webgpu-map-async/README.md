# Native WebGPU compute buffer readback

## Intent and scope

- Tool ID and version/build: WebGPU API through Chromium 156.0.8078.4, launched by exact Playwright 1.64.1.
- VCR job and exact claim being tested: request an actual SwiftShader WebGPU adapter in a secure browser context, run a WGSL compute shader over known float inputs, and read output through GPUBuffer.mapAsync.
- Explicit exclusions: WebGL, WebGPU rendering, hardware GPU, cross-browser/driver behavior, production performance, and browser APIs beyond this compute-buffer readback.
- Documentation: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API, https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter, and Chromium's documented WebGPU SwiftShader test route (checked 2026-11-16).
- Environment: macOS 26.6 arm64, Node.js v25.6.1, Playwright 1.64.1, Chromium 156.0.8078.4; adapter probe reports Google SwiftShader software backend.
- Input: original eight-value Float32Array embedded by the fixture; WGSL computes input * 3 + 0.5.
- Dependencies/install plan: exact fixture-local playwright@1.64.1; browser build already cached, no browser download planned. No native package or system dependency.
- Output: ignored stdout/logs only; expected/metrics.json retains adapter/runtime info, result values and repeated SHA-256. No generated media.

## Plan, before running

- Exact commands: ./examples/webgpu-map-async/run.sh --record once, then ./examples/webgpu-map-async/run.sh twice.
- Browser route: Chromium headless with --enable-features=Vulkan --use-angle=swiftshader --use-vulkan=swiftshader --use-webgpu-adapter=swiftshader --disable-vulkan-surface --enable-unsafe-webgpu. A local 127.0.0.1 origin supplies a secure context.
- Scene: native navigator.gpu requestAdapter/requestDevice; one WGSL compute pipeline; input storage buffer, output storage buffer, COPY_DST readback buffer, dispatch one workgroup three times, then mapAsync(MAP_READ).
- Predeclared checks: actual adapter exists and reports architecture swiftshader; exact Chromium/Playwright versions; compute shader compiles; three dispatches each return [0.5,3.5,-5.5,1.25,11,-4,7.25,0.125] exactly; all three output hashes match; no WebGL API or fallback is used.
- Expected artifact: expected/metrics.json only. Reads are deterministic numeric assertions, no image artifact.
- Stop conditions: stop if adapter unavailable on this documented software route, device request/compute fails, result values differ, or Chromium build/backend differs from recorded.
- Reproduction: run from repository root. Chromium/browser cache must include Playwright 1.64.1's Chromium build.

## Observation, after running

- 2026-11-16, Conors-MacBook-Pro-2.local, macOS 26.6 arm64 / Darwin 25.6.0, Node.js v25.6.1, Playwright 1.64.1, Chromium 156.0.8078.4. The returned WebGPU adapter reports vendor google, architecture swiftshader; this is CPU software execution, not a hardware GPU.
- ./examples/webgpu-map-async/run.sh --record and two separate ./examples/webgpu-map-async/run.sh executions passed on the documented Vulkan/SwiftShader route. The 127.0.0.1 origin was a secure context. The fixture source is checked to contain no WebGL APIs or context request.
- WGSL compilation reported zero errors. Each of three dispatches mapped the storage output [0.5, 3.5, -5.5, 1.25, 11, -4, 7.25, 0.125] through GPUBuffer.mapAsync; all runs had SHA-256 cd43e5ea6f9d17b3feeb3cc73a61d7a4c174a121654401f420a58342762cae89.
- Pass for this compute pipeline and buffer readback using Chromium's SwiftShader software adapter on macOS arm64. No hardware GPU, render pass, other browsers or platforms are established.
- Playwright 1.64.1 was installed only in the example; its matching Chromium 156.0.8078.4 was already cached. Sandboxed loopback was denied; fixture execution used the authorized local-browser path to serve the secure context.
