# gl-react Surface/Node shader fixture

## Intent and scope

- **Tool/version:** `gl-react` 6.0.0 with `gl-react-dom` 6.0.0, React and React DOM 18.3.1 (pinned in this fixture).
- **Claim:** render an owned fragment-shader gradient through an actual `gl-react-dom` `Surface` containing a `gl-react` `Node`, then assert dimensions, exact interior pixel colors and repeatability across two fresh browser contexts.
- **Exclusions:** no bare WebGL credit, no external textures, no multipass graph, no broad shader/driver compatibility claim, and no claim about other implementations such as native/headless.
- **Documentation:** [gl-react v6 README](https://github.com/gre/gl-react/blob/master/README.md), [gl-react-dom README](https://github.com/gre/gl-react-dom), and [npm packages](https://www.npmjs.com/package/gl-react), checked 2026-11-16.
- **Environment:** macOS arm64, exact macOS version/runtime/browser recorded in metrics; Chromium WebGL via SwiftShader software backend.
- **Dependencies and effects:** pinned `gl-react`, `gl-react-dom`, React, React DOM, esbuild, Playwright, pngjs and a Buffer polyfill installed under this fixture; npm access for installation, no external assets. The browser bundle maps Node's `global` identifier to `globalThis` because the gl-react `typedarray-pool` dependency expects it. Chromium browser cache is reused.
- **Input/output:** owned inline GLSL fragment shader; PNG captures and bundle stay in ignored `output/`.

## Plan, before running

- **Command:** `./run.sh --record`, then `./run.sh`. esbuild bundles the React app; Playwright launches Chromium with WebGL enabled on SwiftShader; React mounts the `Surface` and `Node` and reads its WebGL drawing buffer after render.
- **Expected checks:** 32×24 RGBA canvas; shader returns `vec4(uv.x, uv.y, 0.25, 1.0)`; pixel centers `(4,4)`, `(16,12)`, `(27,19)` should yield normalized UV colors within 2 byte values and alpha 255; full-frame pixel hash must match across two fresh browser contexts. Report exact package, Node, Chromium, macOS, and GL renderer versions.
- **Stop conditions:** peer dependency conflict, failure to mount actual Surface/Node, no usable WebGL context, unexpected renderer not SwiftShader, geometry/color outside tolerance, cross-run hash mismatch, or browser errors.
- **Inspection:** inspect retained PNG at native and enlarged scales. `expected/metrics.json` contains measurements/hashes only; media remains ignored.

## Observation, after running

- **Date/executor:** 2026-11-16; Codex on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64; Node 25.6.1, Playwright 1.64.1, Chromium 156.0.8078.4.
- **Commands:** `./run.sh --record` and `./run.sh`; both passed with gl-react 6.0.0, gl-react-dom 6.0.0, React/React DOM 18.3.1, esbuild 0.27.0, Buffer 6.0.3 and pngjs 7.0.0.
- **Observed:** `Surface`/`Node` rendered to a 32×24 canvas using Chromium WebGL 2.0 through ANGLE SwiftShader (`ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0) (0x0000C0DE)), SwiftShader driver)`). Samples were `(4,4)=[36,207,64,255]`, `(16,12)=[131,122,64,255]`, `(27,19)=[219,48,64,255]`; each matched the declared UV-derived value exactly. Fresh-context PNG SHA-256 matched: `6750e37716dc31c02fbe917707c6ce7b166d5afafb2cd367da8235db5e9305d8`. No browser errors or external requests. See `expected/metrics.json`.
- **Visual inspection:** native and 10× enlarged captures show the expected smooth two-axis gradient with opaque output; no visible defects.
- **Deviations:** the first bundle attempt exposed `typedarray-pool`'s Node `buffer`/`global` assumptions. Added pinned `buffer@6.0.3` and the documented esbuild `global=globalThis` mapping; the subsequent record and verify runs passed. An initial record attempt also exposed the need to create the expected directory before writing; the runner now does so.
- **Outcome and limits:** pass for this one inline shader, one `Surface` and one `Node` on Chromium's SwiftShader backend and macOS arm64. No other browser, GPU, shader, graph, texture or native/headless route is established.
