---
name: gl-transitions
description: Use the gl-transitions GLSL collection when a transition between two images should be a shader driven by a progress value. VCR has partial evidence for one transition (Fade) in raw WebGL 1 between solid textures on Chromium SwiftShader.
---

# gl-transitions

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; in the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use it to pick a ready-made progress-driven transition shader instead of writing one, then run it in a WebGL scene you control.
- The fixture is **partial**. It runs only `Fade` from gl-transitions 3.3.0 in raw WebGL 1 between two generated 2x2 opaque solid textures, on Chromium 156 with ANGLE SwiftShader (software, not Metal or a GPU), macOS arm64.
- Not established: alpha (the captured PNG has no alpha channel, so it was not measured), any other transition, transitions with parameters or extra textures, image or video inputs, WebGL 2, other GPUs or drivers, other targets (SkSL, Metal, WGSL).
- Licences vary per file (MIT collection, some BSD files); check the header of each transition you use. For a filtergraph transition use `ffmpeg`; for a hand-written shader use `webgl`; for shaders as React components use `gl-react`.
- Whether a transition suits the cut is a creative call: see MOTION-CHOR-005 (shared elements across transitions), MOTION-EASE-001 and MOTION-TIME-001 in `references/motion-director/`. This guide sets no durations or easings.

## Capability map
Discoverability, not tested behaviour. Browse the [gallery](https://gl-transitions.com/) and the [repository](https://github.com/gl-transitions/gl-transitions) (README, `transitions/*.glsl`).

| Area | Reference | VCR evidence |
| --- | --- | --- |
| Transition collection (227 in 3.3.0) | [transitions/](https://github.com/gl-transitions/gl-transitions/tree/master/transitions) | `Fade` only. All others untested. |
| Shader contract (`getFromColor`, `getToColor`, `progress`, `ratio`, `vec4 transition(vec2 uv)`) | [README](https://github.com/gl-transitions/gl-transitions/blob/master/README.md) | Documented; exercised only through `Fade`. |
| Per-transition parameters (`// uniform` comments) | README | Untested; `Fade` has none. |
| npm package (`gl-transitions.js` browser build, sets `window.GLTransitions`) | [npm](https://www.npmjs.com/package/gl-transitions) | Loaded by script tag and looked up by `name`. |
| Renderers (`gl-transition` runtime, `gl-react`, others) | README | Untested; the fixture supplies its own wrapper. |

## Install and doctor
```text
pnpm add gl-transitions@3.3.0
vcr doctor
```
`vcr doctor` does not probe project-local packages. The fixture also needs `playwright` and ImageMagick (`magick`) and a WebGL-capable Chromium.

## Smoke test
```text
vcr example create gl-transitions-seek
cd examples/gl-transitions-seek && ./run.sh
# expect: gl-transitions-seek: OK (61 frames, ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device ...)))
```
It prints the measured centre pixel per checked frame, then diffs facts against `expected/summary.json`. The renderer string and browser build vary by machine.

Recorded: 61 frames at 640x360 (progress 0 to 1 over 2 s), 61 distinct hashes, shuffled-order capture equal to sequential. Centre colour within 2 per channel at progress 0 `200,40,0`, 0.5 `100,80,128`, 1 `0,120,255`; each of those frames is a single colour.

## Shader contract
The library supplies a `glsl` string defining `vec4 transition(vec2 uv)`. The host must provide, around it:
- `uniform float progress` (0 to 1) and `uniform float ratio`;
- `vec4 getFromColor(vec2 uv)` and `vec4 getToColor(vec2 uv)` sampling the two inputs;
- a `main` that writes `transition(uv)`.

Per the README this is the shared contract for every transition; the fixture proves it only for `Fade`. Other transitions may use `ratio` or extra uniforms, which are untested.

## Seek recipe
```js
const t = (name) => window.GLTransitions.find((e) => e.name === name);
// progress is a pure function of t; nothing reads a clock
function seek(time) { gl.uniform1f(progressLocation, Math.min(Math.max(time / DURATION_S, 0), 1)); draw(); }
window.__scene = { duration: DURATION_S, seek };
```
Capture the end frame explicitly: the harness default range excludes the last frame, so progress 1 was captured with explicit frame 60. Use `preserveDrawingBuffer: true` for screenshot capture. The fixture draws on `requestAnimationFrame` after each seek.

## Troubleshooting
- `gl-transitions has no transition named ...`: names are case-sensitive and not all famous names exist (`wipeLeft` is not in 3.3.0); list `window.GLTransitions.map((e) => e.name)`.
- `Shader compile failed`: the wrapper's contract functions or precision header are missing or mismatched.
- Alpha probes read opaque on a PNG with no alpha channel; check `magick identify -format %A` first. The fixture's first alpha check was vacuous for this reason.

## Official docs
- [gl-transitions.com](https://gl-transitions.com/)
- [gl-transitions repository and README](https://github.com/gl-transitions/gl-transitions)
- [gl-transitions on npm](https://www.npmjs.com/package/gl-transitions)
