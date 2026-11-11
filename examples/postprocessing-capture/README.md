# Postprocessing capture

Status: validated on macOS arm64, postprocessing 6.39.6 and three 0.186.1 (both pinned exactly), Chromium 156.0.8078.4 via Playwright 1.64.1, 2026-11-11. Passed all predeclared checks after three scene tunings before the recorded baseline (see Observation). The Vignette contribution is not visually separable in the frames.

## Intent and scope

- Tool: `postprocessing` (pmndrs), version 6.39.6, with `three` 0.186.1 as its peer.
- VCR job and claim: a three.js scene drawn through `EffectComposer` with a `RenderPass` and one merged `EffectPass` holding `BloomEffect`, `VignetteEffect` and `ChromaticAberrationEffect`, rendered once per seek, produces the same 90 frames at 1280x720 and 30 fps in shuffled order as in sequential order.
- Determinism mechanism: `seek(t)` sets every scene and effect value from `t` (knot rotation, orb positions, chromatic offset, bloom intensity) and then calls `composer.render(0)`. The fixed delta of 0 means the composer's internal timer is never read and the effects' time uniforms never advance, so no frame depends on frame history. The seek draws on the animation frame, as `three-capture` does.
- Alpha: the claim is conditional. Whether the composed output keeps a transparent background is an observation, recorded in the "Observation" section. If it does not, the output is opaque and the scope says so; the alpha check is then recorded at the observed value.
- Exclusions:
  - `NoiseEffect` and `GlitchEffect` are not used. Both reach `Math.random` (noise texture generation and glitch timing), so they are unseeded and outside the claim.
  - `TSL`/WebGPU and the `react-three-postprocessing` route are not tested.
  - `Timer`-driven `composer.render()` without a delta is not tested; `performance.now` appears in the build only in the timer, which this scene does not call.
  - Other effects in the library (DOF, SSAO, SMAA, god rays, LUT) are not used and not claimed.
  - Visual quality and whether bloom looks correct are not claimed beyond the contact-sheet inspection.
- Unseeded-API grep (run before writing the scene, against the installed builds):
  - `postprocessing/build/index.js` hits `Math.random` at the noise texture (`getNoise`), in `randomFloat` (used only by Glitch) and in Glitch's random choice. `performance.now` hits are in `Timer` only.
  - Bloom, Vignette and ChromaticAberration code paths contain none of these calls, so they are in scope.
  - `three/build/three.module.js` has no `Math.random`, `performance.now` or `Date.now` hits. `three.core.js` has `Math.random` in `MathUtils` helpers (UUIDs, random numbers), which this scene does not call.
- Docs and licence: https://github.com/pmndrs/postprocessing, Zlib (catalogue card and npm registry, `postprocessing@6.39.6`, checked 2026-11-11). three.js is MIT (npm registry, `three@0.186.1`, checked 2026-11-11). The 6.39.6 peer range is `three >=0.168.0 <0.188.0`, which includes 0.186.1.
- Environment: macOS (Darwin 25.6.0), arm64; Chromium via Playwright as the capture harness installs it.
- Input: none. The scene is procedural.
- Dependencies and side effects: `postprocessing@6.39.6` and `three@0.186.1` in this example's `package.json`, plus the existing `@vcr/capture` workspace and `tsx`. No other installs.
- Outputs: `output/` (ignored), with frames, `report.json` and `summary.json`. Only `expected/summary.json` is kept.

## Plan, before running

- Commands: `examples/postprocessing-capture/run.sh --record`, then `examples/postprocessing-capture/run.sh`, which must print `postprocessing-capture: OK`. Contact sheet per the evidence skill.
- Scene: `scene.html`, imports `./node_modules/three/build/three.module.js` through an importmap (`three` maps to the same file), and `./node_modules/postprocessing/build/index.js` (the ESM build; `build/postprocessing.js` is an IIFE that expects `window.THREE`).
- Predeclared checks (all in `run.sh`):
  1. Frame count is 90 (3 s at 30 fps).
  2. Dimensions are 1280 x 720.
  3. At least two distinct frame hashes.
  4. Shuffled capture order equals sequential (`shuffled_matches_sequential` true).
  5. Alpha on middle frame 0030, recorded as min and max on a 0 to 255 scale and diffed against `expected/`. Predeclared expectation: minimum 0 (the transparent background survives the composer). If the observed minimum is 255 (opaque), the claim becomes "opaque output" and the alpha check is set to the observed value, as the brief allows; this would be recorded in the Observation section, not hidden.
  6. The recorded `expected/summary.json` matches the run exactly.
- Visual inspection: a contact sheet of frames 0000, 0015, 0030, 0045, 0060, 0075. Expected to show a visible torus knot with a glow, orange orbs, a darkened vignette at the frame edges, and a background that is transparent or opaque as the alpha check determines. A blank, clipped or unlit frame is a `fail` regardless of hashes.
- Stop conditions: the capture fails to launch; the module imports fail to resolve; the scene throws; any predeclared check fails (the result is then `fail`, or `partial` with the scope naming the failed check).
- Reproduce: `./run.sh --record` then `./run.sh`. Inspect with the contact sheet (`output/contact.png`) or a single frame in `output/frames/`.

## Observation, after running

Versions and environment (2026-11-11, executor: evidence-runner agent):
- postprocessing 6.39.6 (Zlib), three 0.186.1 (MIT), Playwright 1.64.1, Chromium 156.0.8078.4 (from `chromium.launch().version()`; the capture report does not record it), Node v22.19.0, ImageMagick 7.1.2-15 Q16-HDRI, hostname `Conors-MacBook-Pro-2.local`.
- Capture mode: `screenshot` (the `@vcr/capture` default); the report has no `captureMode` field to cite beyond the log line.

Tuning before the recorded baseline (disclosed, not hidden):
1. First record, knot emissive 1.6 and scale 1.0: the knot is a flat overexposed yellow with no form. Frame 30 alpha was 3..255; the background carries a faint bloom haze of alpha 2-4/255. Not kept.
2. Knot colour and emissive lowered (`0x3f7a52` with emissive `0x2a4a1c`, intensity 1): knot shaded, bloom on the orbs. Frame 30 alpha 0..255. Not kept, because the knot was still to be resized.
3. Knot scale 1.8: the knot is clipped by the frame top and left in frame 0000. Not kept (clipped counts as a fail).
4. Final: knot scale 1.2 and Vignette darkness 0.9, offset 0.25. Recorded as the baseline.

The predeclared minimum-0 alpha expectation was first met in step 2 and only in the final scene. The scene change that removed the haze was the knot's emissive, which lowers the bloom input, so the zero background alpha is a property of this scene's brightness, not of the composer alone.

Measured on the final scene (`./run.sh`, printed `postprocessing-capture: OK (9.44 fps)`):
- Frames: 90 (expected 90). Dimensions: 1280 x 720.
- Distinct hashes: 90 of 90 (at least two required).
- Shuffled capture order matches sequential: true, `mismatched_frames` empty.
- Frame 0030 alpha on a 0 to 255 scale: min 0, max 255. Background is transparent and the knot and orbs are opaque. Transparency is retained; no opaque fallback is needed.

Inspection of `output/contact.png` (frames 0000, 0015, 0030, 0045, 0060, 0075; the grey behind the scene is the sheet's flatten colour, not the scene):
- A green, shaded three-lobed torus knot, fitting inside the frame. Its position and rotation change across the sheet.
- Orange orbs glow: one is clearly in front of the knot in frame 0000 and in later frames; others are partly behind the knot. The orbs are near-white with only a faint bloom halo at frame 45; the chromatic red/cyan fringes on the knot edges are the clearest visible effect. The vignette is configured but cannot show on a transparent frame (edge alpha is 0), so it is not claimed. The first contact sheet was a single 640x360 frame (`-flatten` without `+repage`); it was rebuilt as a six-frame sheet at integration.
- At full resolution (`output/crop00.png`, `output/crop30.png` in the earlier tuning) the knot's edges show thin red and cyan fringes, the chromatic aberration.
- The background is transparent. No blank, clipped or unlit frames in the final sheet.
- Vignette: I could not see its darkening separately in the frames. The knot is mostly central, so the edge darkening does not show clearly. The claim therefore covers Vignette being in the composed pass, not its visible strength.

What this result does and does not establish:
- Establishes: the composer with RenderPass and one merged EffectPass (Bloom, Vignette, ChromaticAberration), driven from `t` with `composer.render(0)`, produces deterministic 90-frame 1280x720 output at this scene on this machine; shuffled order matches sequential; background alpha is 0 with opaque subject pixels.
- Does not establish: NoiseEffect, GlitchEffect, or any `Math.random`/`performance.now` path (excluded); the WebGPU or react-three-postprocessing routes; other effects (DOF, SSAO, SMAA, god rays, LUT); a visible vignette; other OS or GPUs; visual quality beyond the inspection above; that the zero alpha holds for brighter bloom (step 1 showed a haze).

Result: pass on the predeclared checks, with the tuning above disclosed and the Vignette caveat.
