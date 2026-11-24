---
name: glslify
description: Inline npm GLSL modules (easing, noise, blend) into one shader string with the glslify CLI at build time. Load when several scenes share community shader code for regl, OGL or raw WebGL; skip for a single small shader or Three.js.
---

# glslify

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- glslify is build-time only: `#pragma glslify: name = require(pkg/path)` imports are inlined into one plain shader string, which a renderer (regl, OGL, twgl, raw WebGL) then compiles. It renders nothing itself.
- Fixture validates glslify 7.1.1 and glsl-easings 1.0.0 `cubic-in-out` through the CLI on macOS arm64, Node 22.19.0. The bundle compiled as GLSL ES 1.00 in headless Chromium 156 WebGL1 on SwiftShader, and two CLI runs were byte-identical.
- Not tested: easing values, the Node API, bundler transforms (glslify-loader and similar), WebGL2 or GLSL ES 3.00, native GPU drivers, any rendered output.
- Single small shader: inline it. Three.js: ShaderChunk or TSL cover modularity.
- **Untested caution:** glsl-easings `cubic-in-out` evaluates `pow(2.0 * t - 2.0, 3.0)` for `t >= 0.5`, a negative base. GLSL ES 1.00 leaves that undefined. Found by reading the bundle, not run on any GPU. A clean compile says nothing about values: read back the eased output (for example `readPixels` at t = 0.25, 0.5, 0.75) before trusting it, or use a module without `pow` on negatives.

## Capability map
Discovery only; documented does not mean VCR-validated.
- CLI: bundle a shader file to stdout or `-o` ([glslify README](https://github.com/glslify/glslify)). Exercised: one input, `-o`, no flags.
- `#pragma glslify: import = require(module)` and `#pragma glslify: export(fn)` (README). Exercised: one `require` of an npm module. `export` and local relative requires untested.
- Node API (`glslify.file`, tagged template) and bundler transforms (browserify, glslify-loader, Vite and webpack plugins) (README). Untested.
- Module ecosystem, such as `glsl-easings`, noise and blend modules ([npm search](https://www.npmjs.com/search?q=keywords:glslify)). Only `glsl-easings/cubic-in-out` exercised; each module's correctness is its own.

## Install and doctor
```sh
pnpm add -D glslify glsl-easings
pnpm exec glslify --version
vcr doctor
```
`doctor` reports local availability; it does not install glslify.

## Smoke test
```sh
vcr example create glslify-bundle
```
Change to the destination printed, then:
```sh
pnpm install
./run.sh
# expect: glslify-bundle: OK (glslify 7.1.1, glsl-easings 1.0.0, chromium 156.0.8078.4, bundle sha256 c2bf0c821ef6785703f207f72f5b412f274fd2291b1f14cc16d9ad9a170973a5)
```
The chromium version and hash reflect the recorded run; the hash holds only for the same input and pins.

## Bundle recipe
```sh
pnpm exec glslify input/main.frag -o output/bundle.frag
```
Input has `#pragma glslify: cubicInOut = require(glsl-easings/cubic-in-out)` and calls `cubicInOut(uProgress)`. Output (283 bytes) has the function above `main`, no pragma or `require(`, and an injected `#define GLSLIFY 1`. Load it as a string into the renderer; keep the `precision` line in the source.

## Troubleshooting
- Raw input fails with `'cubicInOut' : no matching overloaded function found`: the pragma was never bundled; the fixture uses this as a control.
- `syntax error` after bundling: the shader itself is broken; glslify does not validate GLSL. Compile in WebGL to find it.
- Module not found: install it in the same project the CLI runs from; resolution is from `node_modules`.

## Official docs
- [glslify](https://github.com/glslify/glslify) and [npm](https://www.npmjs.com/package/glslify) (fixture used 7.1.1)
- [glsl-easings](https://github.com/glslify/glsl-easings) (1.0.0)
