# Troika Three Text synchronized glyph layout

## Intent and scope

- Tools: `troika-three-text` 0.53.1 and Three.js 0.187.0; Playwright 1.64.1.
- Claim: wait for Troika `Text.sync()`, assert glyph/layout metrics from the licensed local font, render the static text in Three/WebGL, and reproduce the same screenshot hash in repeated captures.
- Exclusions: text shaping beyond the tested Latin uppercase string, other fonts, browser/GPU backends, animation, and Three/Troika integrations beyond this scene.
- Font: JetBrains Mono Bold by JetBrains Mono Project Authors, SIL OFL 1.1; local copy and full licence in `fonts/`; no network font requests.
- Environment: macOS 26.6 arm64; Node 22.19.0; headless Chromium selected by Playwright; WebGL renderer reported by the scene at runtime.
- Dependencies pinned in this fixture's npm package and lockfile; output PNG/report remain ignored.

## Plan, before running

- Start a local static server, load the module scene, wait for `Text.sync()`, and render `VCRTOOLS` at fontSize 0.8 in a 640×360 WebGL canvas.
- Assert Troika reports 8 glyph bounds (32 floats), 8 caret positions (32 floats), finite positive block/visible bounds, a positive ascender/cap height and negative descender.
- Capture the same seek twice in one browser process and assert equal PNG SHA-256. Run the entire fixture again in a fresh process and diff layout/browser/backend/hash metrics.
- Record browser version and `gl.RENDERER`/`gl.VENDOR`; inspect the PNG at native size and verify it is nonblank. Stop if sync does not complete, WebGL is unavailable, font is not loaded locally, or output is blank/nondeterministic.
- Reproduce with `npm ci && ./run.sh`.

## Observation

Executed twice via `run.sh` on 2026-11-16 by the maintainer on `Conors-MacBook-Pro-2.local`. Troika 0.53.1 synchronized eight `VCRTOOLS` glyphs at 0.8 font size; `glyphBounds` and caret positions each contained 32 values; block bounds were `[-1.92,-0.528,1.92,0.528]` and visible bounds `[-1.892,-0.296,1.8744,0.304]`. Chromium 156.0.8078.4 / Playwright 1.64.1 rendered through ANGLE SwiftShader (software Vulkan), not a physical GPU. Repeated screenshots matched SHA-256 `eb52d454b08412850ff2f85f7f7f5591443e4b2b49b479c520f86acc50d68058`; visual inspection showed all eight letters centered and legible. All fonts loaded from the fixture; no external requests. This does not establish hardware-GPU fidelity, other fonts, or complex-script shaping.
