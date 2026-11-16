# Lottie Web seek and browser capture fixture

## Intent and scope

- **Tool/version:** Lottie Web 5.13.0, pinned in this example's `package.json` and lockfile.
- **Claim:** seek an owned animated rectangle to frames 0, 15 and 30 using `goToAndStop`; verify expected SVG geometry and identical per-frame screenshots/geometry in sequential and shuffled order.
- **Exclusions:** no external assets, expressions, text, masks, effects, images, audio, or broad Lottie compatibility claim.
- **Environment:** macOS 26.6 arm64; Node version, Playwright runtime version and Chromium version are recorded by the runner.
- **Dependencies:** fixture-local Lottie package; existing VCR `packages/capture` page/server and machine Playwright runtime. Generated output and caches stay under ignored `output/`.
- **Documentation:** [Lottie Web API](https://github.com/airbnb/lottie-web#usage) and [Lottie Web package](https://www.npmjs.com/package/lottie-web), checked 2026-11-16.

## Plan, before running

- **Command:** `./run.sh --record`, then `./run.sh`; `capture.ts` opens the local page with VCR `openScenePage`, seeks frames `[0, 15, 30]`, then seeks `[30, 0, 15]`.
- **Expected checks:** exact Lottie version; SVG path bbox left edges 8, 24 and 40 px, each 16×16 px; path data and fill stable; screenshot SHA-256 identical by frame across both orders.
- **Stop conditions:** missing SVG/path, incorrect geometry or color, page errors, no exact package/browser/runtime version, or any order-dependent frame mismatch.
- **Inspection:** retain only the three PNGs under ignored `output/frames/`; inspect frame 15 at native scale and enlarged.

## Observation, after running

- **Date/executor:** 2026-11-16; Codex on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64; Node 25.6.1, Playwright 1.64.1, Chromium 156.0.8078.4.
- **Observed:** Lottie Web 5.13.0 passed twice. Frames 0/15/30 had red 16×16 SVG bounds at x=8/24/40, y=24; geometry and PNG hashes matched in sequential and shuffled order. See `expected/metrics.json`.
- **Visual inspection:** frame 15 showed the intended solid red square on white at native scale and in an enlarged crop; no rendering defects observed.
- **Outcome and limits:** pass for the owned rectangle shape layer and three sampled frames only; no broader Lottie feature support is established.
