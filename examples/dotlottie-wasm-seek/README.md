# dotLottie WASM frame-seek fixture

## Intent and scope

- **Tool/version:** `@lottiefiles/dotlottie-web` 0.83.2 (pinned in this fixture).
- **Claim:** load an owned `.lottie` archive in dotLottie Web's ThorVG WASM renderer, seek frames 0, 15 and 30, and verify the expected rectangle pixels and identical output in sequential and shuffled seek order.
- **Exclusions:** no lottie-web rendering credit; no external assets, text, masks, effects, expressions, themes, state machines or broad Lottie compatibility claim.
- **Environment:** macOS arm64, Node and browser versions recorded by the runner; Chromium software canvas route.
- **Input:** owned 64×64, 30 fps, 31-frame rectangle animation packed with a local manifest into `.lottie`; no third-party media.
- **Dependencies and side effects:** fixture-local pinned `@lottiefiles/dotlottie-web` and bundler, installed under this example; local browser server only. Package installation may access npm. WASM is served from the installed package, with no remote runtime assets.
- **Documentation:** [dotLottie Web repository](https://github.com/LottieFiles/dotlottie-web) and [package](https://www.npmjs.com/package/@lottiefiles/dotlottie-web), checked 2026-11-16.
- **Output:** generated archive, browser bundle and captured PNGs are confined to ignored `output/`.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. The runner packages `manifest.json` and `animation.json` into `.lottie`, serves the local fixture and installed WASM, then uses the dotLottie runtime's `setFrame` for sequential `[0,15,30]` and shuffled `[30,0,15]` seeks.
- **Predeclared checks:** exact package/runtime/browser versions; at each sampled frame, a solid red 16×16 rectangle at left x=8, 24 and 40 px respectively and top y=24; alpha and background samples; same frame pixel hashes across both seek orders.
- **Stop conditions:** runtime fails to load the local archive/WASM, cannot seek exact frames, pixel geometry/color/alpha differs, sequential and shuffled results differ, or exact versions cannot be reported.
- **Inspection:** inspect the retained midpoint PNG at native and enlarged scales after the record run. Metrics and hashes only are retained in `expected/`.

## Observation, after running

- **Date/executor:** 2026-11-16; Codex on `Conors-MacBook-Pro-2.local`, macOS 25.6.0 arm64; Node 25.6.1, Playwright 1.64.1, Chromium 156.0.8078.4.
- **Commands:** `./run.sh --record` and `./run.sh`; both passed using `@lottiefiles/dotlottie-web` 0.83.2 and the package-local `dotlottie-player.wasm` served from the fixture server. No remote runtime assets were requested.
- **Observed:** the 64×64 transparent canvas contained exactly 256 opaque red pixels at frames 0/15/30, with bounds `[8,24,24,40]`, `[24,24,40,40]`, `[40,24,56,40]`; sequential and shuffled PNG hashes matched for all three frames. See `expected/metrics.json`.
- **Visual inspection:** midpoint image showed the expected centered 16×16 red square on transparent canvas at native and 8× enlarged scales; no visible defects.
- **Outcome and limits:** pass for this owned one-shape `.lottie` archive and three exact frames in this Chromium/macOS route. No broader feature compatibility, other browser, asset, theme, state-machine or user-authored animation claim.
