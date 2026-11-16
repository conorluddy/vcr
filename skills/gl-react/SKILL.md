---
name: gl-react
description: Use gl-react to compose GLSL effects as React `Surface` and `Node` components. VCR has validated one inline gradient shader on Chromium SwiftShader.
---

# gl-react

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; in the VCR repository it is `pnpm vcr`. Run workspace commands from the directory with `vcr.json`.

## Use cases and limits
- Use gl-react when a React scene needs shader effects composed as a component tree.
- The fixture validates gl-react/gl-react-dom 6.0.0 with one `Surface`, one `Node` and one inline GLSL gradient. It does not establish other graphs, textures, browsers, GPU drivers, native/headless routes, or React 19 compatibility.
- For declarative data layers use `deck-gl`; for direct low-level shader drawing use `webgl`.

## Capability map
The [gl-react README](https://github.com/gre/gl-react/blob/master/README.md) maps `Node`, shader uniforms, texture inputs and composition. The [gl-react-dom package](https://www.npmjs.com/package/gl-react-dom) provides the browser `Surface` renderer; the [gl-react package](https://www.npmjs.com/package/gl-react) provides the node graph. VCR exercises only a single shader node and surface; multipass graphs, external textures, and other renderers remain untested.

## Install and doctor
```text
pnpm add gl-react@6.0.0 gl-react-dom@6.0.0 react@18.3.1 react-dom@18.3.1
vcr doctor
```
`vcr doctor` does not probe these project-local packages. The fixture pins the browser dependencies and uses `vcr setup capture`'s Playwright browser route.

## Smoke test
```text
vcr example create gl-react-shader
cd examples/gl-react-shader && ./run.sh
# expect: gl-react fixture OK: {...} (JSON records sampled pixels and matching fresh-context hashes)
```
Recorded sample: Chromium 156/WebGL2 SwiftShader on macOS 26.6 arm64. Host, renderer details and browser version vary by machine; the fixture compares the complete JSON with `expected/metrics.json`. Pixel channels use a tolerance of two; two fresh browser contexts must produce the same full-frame hash.

## Scene contract
- Keep shader inputs explicit and time-derived; pause or avoid internal clocks so a requested frame can be reproduced.
- Wait for React to mount the `Surface` and for a completed render before reading the drawing buffer.
- The fixture uses one opaque, inline shader. Alpha compositing and time-varying uniforms are not established by its evidence.

## Troubleshooting
- Bundle fails on `global`: the validated fixture maps `global` to `globalThis` and pins the `buffer` polyfill for a transitive dependency.
- Surface is blank: check that the component mounted and WebGL was created before capture.
- Hash changes: compare package, browser and renderer versions; the validation claim is limited to the recorded SwiftShader route.

## Official docs
- [gl-react 6 README](https://github.com/gre/gl-react/blob/master/README.md)
- [gl-react-dom on npm](https://www.npmjs.com/package/gl-react-dom)
- [gl-react on npm](https://www.npmjs.com/package/gl-react)
