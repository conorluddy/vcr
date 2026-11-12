# React postprocessing capture

Status: validated on macOS arm64, 2026-11-12, for `react-three-postprocessing` (`@react-three/postprocessing` 3.2.2) with Bloom and ChromaticAberration. Bloom lays a faint alpha haze over about 78% of the frame, so the alpha is not a clean matte (see Observation). Determinism holds only for effects without a time uniform. The React template rules come from `examples/react-capture`.

`capture.ts` bundles `scene.tsx` into `output/bundle/scene.js` (git-ignored) with esbuild, then captures `scene.html` with `captureFrames`. The scene is a React Three Fiber `<Canvas frameloop="never">` with an `<EffectComposer>` holding `<Bloom>` and `<ChromaticAberration>`. Every value is a pure function of a `t` state value. `seek(t)` commits `t` with `flushSync`, then calls `advance(t * 1000)` on the next animation frame.

```text
./run.sh            # expect: react-postprocessing-capture: OK
./run.sh --record
```

## Intent and scope

- Tool: `@react-three/postprocessing` 3.2.2 (MIT, npm registry and `LICENSE` in the package, checked 2026-11-12; docs https://github.com/pmndrs/react-postprocessing). Its peers are `postprocessing` ^6.36.0 and `@react-three/fiber` >= 9.7.0, so this example pins `postprocessing` 6.39.6 exactly (the version `examples/postprocessing-capture` uses) and `@react-three/fiber` 9.8.2 as the react template does.
- VCR job and claim: an R3F scene with `<EffectComposer>`, `<Bloom>` and `<ChromaticAberration>` as JSX children, bundled from TSX and rendered once per seek, produces the same 90 frames at 1280x720 and 30 fps in shuffled order as in sequential order.
- Determinism mechanism: `seek(t)` commits `t` with `flushSync`, then `advance(t * 1000)` runs the composer's `useFrame` once. Our code reads no clock. Note that R3F in `frameloop="never"` derives the frame delta from the timestamp difference (`delta = timestamp - clock.elapsedTime`), so the composer's `render(delta)` receives a delta that depends on the previous seek. That delta only feeds effect `time` uniforms. Checked in the postprocessing build: `BloomEffect` and `ChromaticAberrationEffect` have no time uniform and their `update` does not read `deltaTime`. The claim therefore holds only for effects without time uniforms, which is the case here.
- Alpha: Bloom spreads light outside the subject, so the transparent background can gain alpha near bright parts. The predeclared alpha check (below) asserts the frame's minimum and maximum alpha; the observed values are recorded as they are.
- Exclusions:
  - `NoiseEffect`, `GlitchEffect` and any effect with a time or random uniform. `postprocessing` reaches `Math.random` through `getNoise` (NoiseTexture, used by Glitch) and `randomFloat` (Glitch only). Not used here.
  - `N8AO` (SSAO), `DepthOfField`, `SelectiveBloom`, `LensFlare`, `Halftone`, `Water` and the other effects. Not claimed.
  - `multisampling` above 0, WebGPU, devicePixelRatio above 1, R3F events, `useFrame`-driven animation, suspense-loaded assets.
  - Visual quality beyond the contact sheet.
- Unseeded-API grep, run against the installed builds before writing the scene:
  - `@react-three/postprocessing/dist/index.js`: zero hits for `Math.random`, `performance.now` and `Date.now`. Its imports are `@react-three/fiber`, `postprocessing`, `three`, `react`, `maath` and `n8ao`; esbuild tree-shakes what this scene does not use (`sideEffects: false`).
  - `postprocessing/build/index.js`: `performance.now` in `Timer` only (not called by this scene); `Math.random` in `getNoise`, `randomFloat` and Glitch only. None on the Bloom or ChromaticAberration path.
  - `three` core has `Math.random` in `MathUtils.generateUUID`, used for object ids, not pixels.
- Docs and licence: https://github.com/pmndrs/react-postprocessing (MIT, card and npm registry, checked 2026-11-12); `postprocessing` is Zlib and `three` is MIT, both per their npm registry metadata.
- Environment: macOS Darwin 25.6.0 arm64, Node 22.19.0, Playwright 1.64.1, Chromium as the capture harness installs it.
- Input: none. Three procedural meshes (torus knot, box, emissive icosahedron), no external assets.
- Dependencies: `@react-three/postprocessing` 3.2.2, `postprocessing` 6.39.6, `@react-three/fiber` 9.8.2, `react` and `react-dom` 19.3.1, `three` 0.186.1, `esbuild` 0.25.12, `tsx` 4.23.15, `playwright` 1.64.1, `@vcr/capture` workspace. Installed by `pnpm install` into this example; no network at capture time.
- Output: `output/` (bundle, frames, report, summary, contact sheet), git-ignored. Kept: `expected/summary.json`.

## Plan, before running

- Command: `./run.sh --record`, then `./run.sh`, which must print `react-postprocessing-capture: OK`.
- Predeclared checks (in `run.sh`):
  1. 90 frames.
  2. 1280 x 720.
  3. At least two distinct frame hashes.
  4. Shuffled capture order equals sequential (`shuffled_matches_sequential` true).
  5. Frame 0045 alpha, min and max on a 0 to 1 scale, must be min 0 and max 1: a transparent background and an opaque subject. If Bloom lifts the background alpha, the check fails and the result is `partial` or `fail`, with the observed range recorded. The check is not relaxed to pass.
  6. `output/summary.json` diffs clean against `expected/summary.json` (recorded from the first run).
- Visual inspection: contact sheet of frames 0000, 0015, 0030, 0045, 0060, 0075. Expected: the shaded knot, box and glowing blue icosahedron, with a bloom halo on the icosahedron and red and blue fringes at edges from the chromatic aberration. A blank, clipped or unlit frame is `fail` regardless of hashes.
- Failure modes and stop conditions: the composer renders nothing on the first frame (blank canvas); the bundle fails to build; `EffectComposer` does not render because `advance` runs no composer subscriber (shuffled mismatch or uniform output); any predeclared check fails.
- Reproduce: `./run.sh --record`, then `./run.sh`. Inspect `output/contact.png` or `output/frames/`.

## Observation, after running

Versions and environment (2026-11-12, executor: evidence-runner agent, hostname `Conors-MacBook-Pro-2.local`):
- `@react-three/postprocessing` 3.2.2 (MIT), `postprocessing` 6.39.6 (Zlib), `@react-three/fiber` 9.8.2, React and react-dom 19.3.1, three 0.186.1, esbuild 0.25.12, Playwright 1.64.1, Chromium 156.0.8078.4 (from `chromium.launch().version()`; the capture report does not record it), Node v22.19.0, ImageMagick 7.1.2-15 Q16-HDRI.
- Capture mode: `screenshot` (the `@vcr/capture` default, per the capture log).

Runs:
- `./run.sh --record`: 90 frames, 1280 x 720, 7.96 fps. Then `./run.sh`: `react-postprocessing-capture: OK (7.65 fps)`, diffed clean against `expected/summary.json`.
- Shuffled capture order matches sequential (`shuffled_matches_sequential` true, `mismatched_frames` empty). 90 of 90 hashes distinct.
- Frame 0045 alpha on a 0 to 1 scale: min 0, max 1. The predeclared check passes as written.

Inspection of `output/contact.png` (frames 0000, 0015, 0030, 0045, 0060, 0075; the grey is the sheet's flatten colour):
- A green torus knot, an orange box and a pale cyan icosahedron. The knot and box rotate and move; the box scales. No blank, clipped or unlit frames.
- The chromatic aberration is clearly visible: red and blue fringes on the knot and box edges in every frame.
- The icosahedron is overexposed (emissive 2.5 on a flat-shaded solid): it reads as a flat pale hexagon with no shading. Cosmetic, not a capture fault.
- Bloom is present but faint. A soft halo lies around the icosahedron. Measured on frame 0045 composited over black, the pixels just outside it are about 3 to 11 of 255, against 0 far away.

Bloom's effect on alpha (checked with a diagnostic copy of the scene with `<Bloom>` removed, in `output/diag/`, outside `run.sh`):
- With Bloom, frame 0045: 15.2% of pixels have alpha at or above 128/255 (the subject), 78.5% have alpha at least 1/255, 38% at least 4/255, 19% at least 8/255. Corner pixel (0,0) alpha is 0; corner (1279,719) in frame 0000 is about 6/255.
- Without Bloom: 15.4% of pixels have alpha at least 1/255, which is the subject alone.
- So the background is transparent at the corners and in the minimum, but Bloom lays a faint alpha haze (mostly 1 to 8 of 255) across most of the frame. The min 0 / max 1 check does not see this. Any compositing over this output carries that haze.

Bundle check (`output/bundle/scene.js`, the code that actually runs):
- Unseeded API hits in the bundle: `Math.random` 24, `performance.now` 11, `Date.now` 3. These are React's event and listener ids, three's `generateUUID` (object ids), three's `Vector2.random` and `Quaternion.random` helpers, the `Clock` and `Timer` classes, and a React scheduler fallback. None is called on the pixel path of this scene.
- R3F reads `state.clock.getDelta()` on each advance, which calls `performance.now`, but in `frameloop="never"` it then overwrites the delta with `timestamp - clock.elapsedTime`, so the value fed to the composer is seeded by `t`.
- The composer's `render(delta)` delta feeds only effect `time` uniforms. Bloom and ChromaticAberration have none, so pixels do not depend on the seek history.
- `NoiseTexture`, `getNoise` and `GlitchEffect` are absent from the bundle (tree-shaken), so the excluded effects are not present in this capture.

What this result does and does not establish:
- Establishes: an R3F `EffectComposer` with `Bloom` and `ChromaticAberration` as children, bundled by esbuild and driven by `flushSync` plus `advance`, renders 90 frames at 1280x720 whose shuffled capture order matches the sequential order, on this machine and Chromium.
- Does not establish: a clean transparent matte under Bloom (alpha haze measured above); Bloom's look beyond the faint halo; other React postprocessing effects (SSAO, DepthOfField, Vignette, Noise, Glitch, and the rest, not in this scene); `multisampling` above 0; other OS, GPUs or browsers; other react-postprocessing wrappers; devicePixelRatio above 1.

Result: pass on the determinism claim. The alpha caveat is recorded in the evidence scope.
