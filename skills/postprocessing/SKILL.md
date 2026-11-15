---
name: postprocessing
description: Add WebGL post-processing effects to a Three.js scene with the pmndrs postprocessing pipeline. Load when you need a composer, passes, merged effects or the library's effect catalogue; VCR evidence covers one seek-driven bloom and color-effect chain.
---

# postprocessing

`postprocessing` is pmndrs' effect and pass pipeline for Three.js WebGL rendering. It provides an `EffectComposer`, scene `Pass` implementations, composable fullscreen `Effect`s, and an `EffectPass` that combines compatible effects into fewer render passes. VCR has no adapter for it; a capture scene owns its Three.js renderer and composer.

## Use cases and limits
- Use it when a Three.js scene needs effects composed after scene rendering.
- The VCR fixture validates a single explicit `composer.render(0)` per seek with Bloom, Vignette and Chromatic Aberration; other effects may have their own clocks, random sources or alpha behavior.
- Use Three.js's native renderer without this library when no post effects are needed.

## API map (documented surface)

- **Composer and passes:** create `EffectComposer(renderer)`, add a `RenderPass(scene, camera)` to draw the scene, then add effect passes. Call `composer.render()` in a regular render loop. For deterministic seeking, explicitly set scene/effect state and use a fixed delta where appropriate; the fixture uses `composer.render(0)`. [Official README and usage](https://github.com/pmndrs/postprocessing)
- **Effects and merging:** `EffectPass(camera, ...effects)` accepts effects that can be merged into a fullscreen shader; the composer organizes passes. Combining effects reduces render operations, though effect compatibility and extra operations vary. [Official README](https://github.com/pmndrs/postprocessing) · [Enabling/disabling effects](https://github.com/pmndrs/postprocessing/wiki/Enabling-and-Disabling-Effects)
- **Effect families:** documented library coverage includes bloom, blur, antialiasing, color grading/LUT, depth of field, vignette, chromatic aberration, noise, glitch, god rays, pixelation, outline, SSAO, tone mapping and others. See the [official effect catalogue](https://github.com/pmndrs/postprocessing#included-effects).
- **Renderer and colour management:** the library requires Three.js and targets the WebGL renderer route. The upstream guide discusses renderer configuration, intermediate buffer precision, output colour space, and tone mapping. Half-float buffers can preserve HDR-like range where supported. [Official README](https://github.com/pmndrs/postprocessing)
- **Custom effects:** extend the `Effect` abstraction with shader code and uniforms; effect passes handle fullscreen composition. [Custom Effects wiki](https://github.com/pmndrs/postprocessing/wiki/Custom-Effects)

This is the documented library surface; APIs and effect behavior may vary by release. Check the installed version's docs and peer dependency range before choosing a Three.js version.

## Install and doctor
```text
pnpm add postprocessing@6.39.6 three@0.186.1
vcr doctor
```
These are the example versions, not a universal compatibility promise. `vcr doctor` reports machine availability; it does not validate effect behavior or the package pair.

## VCR-tested workflow and evidence boundary

Validated pair: `postprocessing` 6.39.6 and Three.js 0.186.1. The example uses `EffectComposer`, `RenderPass`, and one merged `EffectPass` with `BloomEffect`, `VignetteEffect`, and `ChromaticAberrationEffect`; it sets scene and effect values from absolute `t` and calls `composer.render(0)` once per seek. On macOS arm64 with Playwright 1.64.1 / Chromium 156.0.8078.4, screenshot capture produced 90 distinct 1280×720 frames at 30 fps; shuffled hashes matched sequential capture. Middle-frame alpha range was 0–255 (transparent background, opaque subjects), conditional on the tuned scene's bloom brightness. Contact sheet inspected. One run printed `postprocessing-capture: OK (9.44 fps)`; measured fps varies by machine.

Not validated: NoiseEffect, GlitchEffect, DOF, SSAO, SMAA, god rays, LUT, WebGPU/TSL, React integration, other operating systems/GPUs, a visible vignette contribution, or alpha behavior at other bloom intensities. Noise and Glitch paths used here were excluded because they reach unseeded randomness; render-loop timer use was also not tested. The effect library's general support does not establish seek safety for each effect.

## Smoke test

Run `vcr example create postprocessing-capture`, change to its printed destination and run:
```text
./run.sh
# expect: postprocessing-capture: OK (9.44 fps)
```
The reported fps varies by machine. Inspect `output/contact.png` and `output/frames/frame-0030.png`. Use `./run.sh --record` only when intentionally updating the expected summary.

## Troubleshooting
- If capture order changes the result, look for an effect that reads a wall clock, advances internal state or uses unseeded randomness; the fixture excludes Noise and Glitch paths for that reason.
- If alpha haze changes, recheck bloom intensity and the scene's foreground/background values; the validated alpha range depends on the tuned scene.

## Official docs
- [Project README and usage](https://github.com/pmndrs/postprocessing)
- [Included effects](https://github.com/pmndrs/postprocessing#included-effects)
- [Custom effects](https://github.com/pmndrs/postprocessing/wiki/Custom-Effects)
