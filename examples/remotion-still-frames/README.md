# Remotion deterministic still-frame fixture

## Intent and scope

- **Tool/version:** Remotion 4.0.544: matching `@remotion/bundler`, `@remotion/renderer` and `remotion`; React and React DOM 19.3.1 (pinned in the fixture).
- **Claim:** bundle an owned Remotion `Composition` whose component uses `useCurrentFrame`, render frames 0, 15 and 30 with `renderStill`, and check exact rectangle pixels plus repeated/shuffled-frame image hashes.
- **Exclusions:** no encoding or audio, external media, fonts, cloud rendering, Studio claims, arbitrary compositions or broader React feature compatibility.
- **Documentation and license terms:** [Remotion renderStill/renderFrames docs](https://www.remotion.dev/docs/renderer), [custom browser executable](https://www.remotion.dev/docs/options/browser-executable), [Remotion LICENSE.md](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md), and [license page](https://www.remotion.pro/license), checked 2026-11-16. The checked v4 license describes free eligibility for individuals, nonprofits, evaluation, and for-profit organizations with up to three employees; it says entities outside those categories require a Company License. This records published terms only; it is not a legal conclusion about any user or use. The fixture uses no paid service or license key.
- **Environment:** macOS 26.6 arm64, Node, Remotion browser, and exact browser/runtime versions recorded by the runner.
- **Dependencies and effects:** exact Remotion, React, Playwright and pngjs packages installed under this example; npm access for installation. Reuse Playwright's already-installed Chromium by passing its executable path through Remotion's `browserExecutable`; no browser download or cloud job intended. Bundle and PNGs stay in ignored `output/`.
- **Input:** owned 64×48 vector rectangle generated from `useCurrentFrame`; no external assets.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. Run `@remotion/bundler` `bundle()`, `selectComposition()`, then `@remotion/renderer` `renderStill()` for `[0,15,30]` and `[30,0,15]`, using `frame` values as the exact frame indices.
- **Expected checks:** 64×48 transparent PNG; at frames 0/15/30 the opaque red 12×12 square has bounds `[8,18,20,30]`, `[24,18,36,30]`, `[40,18,52,30]` and exactly 144 red pixels. Each frame hash matches across sequential and shuffled renders; record exact Remotion, React, Node, browser and OS versions.
- **Stop conditions:** pinned package mismatch, installed browser not accepted by Remotion, bundle/composition selection/render failure, wrong PNG dimensions/pixels/hash, page error, or unknown browser version. If Remotion requires its separate browser binary, stop after one documented attempt rather than downloading another.
- **Inspection:** inspect frame 15 at native and enlarged scales. Expected evidence contains numeric measurements and hashes only; generated stills remain under ignored `output/`.

## Observation, after running

- **Result:** pass. `./run.sh --record` and a separate `./run.sh` verify run both passed. Within each run, repeated `renderStill()` calls at `[0, 15, 30]` and shuffled `[30, 0, 15]` produced identical per-frame PNG hashes. The verify run reproduced the record hashes exactly.
- **Measurements:** all outputs were 64×48 RGBA PNGs. Frames 0/15/30 each contained exactly 144 opaque red pixels, with bounds `[8,18,20,30]`, `[24,18,36,30]`, `[40,18,52,30]`. SHA-256 by frame: 0 `aacb08ee48029a83ab4938a3b9eb2db810410f4c584e12a3d91c4521470fbbd0`; 15 `47f6de39fa264de8f9a1c4d12e123058fc413a107fade5489c3d80037bf1c0e7`; 30 `bd31dba70246e7163a41e42d31ffa25a67dc9022c3edff8fb025c6e69dfef354`.
- **Runtime:** Remotion packages 4.0.544, React/React DOM 19.3.1, Node v25.6.1, macOS 26.6 arm64 (Darwin 25.6.0), Google Chrome for Testing 156.0.8078.4, host `Conors-MacBook-Pro-2.local`. The existing Playwright Chromium executable was passed to Remotion; no browser download or cloud service was used. A sandboxed browser launch failed; the same local run passed with host permission.
- **Visual inspection:** opened frame 15 at native size; the expected red square appears on a transparent 64×48 canvas. The numeric pixel assertions are the measured evidence.
- **License scope:** the installed v4 `LICENSE.md` describes the same Free License categories recorded in the plan, and notes that licensing changes in v5. This fixture makes no legal conclusion about eligibility; recheck terms for the version and use in question.
- **Limits:** this validates one local still-frame composition and its same-host repeatability. It does not test video/audio encoding, Studio, cloud rendering, external media/fonts, cross-platform determinism, or arbitrary Remotion projects.
