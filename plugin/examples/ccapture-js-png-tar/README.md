# CCapture.js PNG TAR frame capture

## Intent and scope

- **Tool/version:** npm package `ccapture.js` 2.0.0; CCapture.js 2.x is a ground-up rewrite. npm currently reports 2.0.0 (11 versions, 0 dependencies); official release page and README describe the v2 API. Older 1.x tutorials/API remain distinct; validate this pinned package only.
- **Claim:** the actual CCapture `start`/`capture`/`stop`/`save(callback)` API captures three generated Canvas 2D frames into its PNG TAR format; extracted frames have expected dimensions and exact pixels, and repeat capture is semantically identical.
- **Exclusions:** MP4/WebM/GIF, time-warped animation behavior, motion blur, 1.x API, download UI, other browsers, alpha preservation, or larger captures.
- **Environment:** macOS 26.6 arm64; Node 25.6.1; CCapture.js 2.0.0; fixture-local Vite 8.3.5; VCR Playwright 1.64.1; Chrome for Testing 156.0.8078.4; system `tar`.
- **Input/rights:** generated full-frame red, green and blue 32×32 canvases, no external imagery.
- **Dependencies/install plan:** fixture-local exact `ccapture.js@2.0.0` and `vite@8.3.5`, installed by `npm ci --prefix examples/ccapture-js-png-tar`. Reuse local Playwright/Chromium; no browser download. TAR output, extracted PNGs and previews remain under ignored `output/`.
- **Documentation:** official [CCapture.js README/API](https://github.com/spite/ccapture.js), [v2.0.0 release](https://github.com/spite/ccapture.js/releases/tag/v2.0.0), [npm package](https://www.npmjs.com/package/ccapture.js), and [MIT license](https://github.com/spite/ccapture.js/blob/master/LICENSE), checked 2026-11-16.

## Plan, before running

- **Command:** `npm ci --prefix examples/ccapture-js-png-tar`, then `./run.sh --record` starts local Vite, imports the pinned CCapture package in Chromium, draws red/green/blue 32×32 canvas frames, calls `start()`, `capture(canvas)` for each, `stop()`, and `save(callback)` to retrieve a PNG TAR. `./run.sh` repeats and diffs frame metrics.
- **Expected artifacts/checks:** each TAR contains exactly 3 PNGs; each is 32×32 and a solid expected color. Extract with system `tar`; browser-decode PNGs and assert exact dimensions and RGBA samples. Compare extracted frame order/pixels semantically across two captures; TAR bytes/metadata may differ. The selected PNG TAR format has no timestamp track, so this does not test encoded frame timing.
- **Bounds:** wait at most 10 seconds for Vite, 15 seconds for browser readiness, and 20 seconds for each CCapture call; terminate capture on timeout.
- **Stop conditions:** pinned package/browser unavailable, unsupported PNG/TAR route, absent or malformed archive, wrong frame count/order/dimensions/pixels, or repeat semantic mismatch.
- **Inspection/reproduction:** `./run.sh --record` then `./run.sh`; preview PNGs are written under ignored `output/` for visual inspection. No video codec is involved.

## Observation, after running

- **Date/executor:** 2026-11-16, Codex. Plan was written before dependency installation/run. `npm ci --prefix examples/ccapture-js-png-tar` installed 17 fixture-local packages with zero reported vulnerabilities; no global or machine environment installation was made. The lockfile is 27,846 bytes.
- **Actual environment/commands:** macOS 26.6 arm64 (`Darwin 25.6.0`), Node 25.6.1, npm lock pins CCapture.js 2.0.0 and Vite 8.3.5, VCR Playwright 1.64.1, Chrome for Testing 156.0.8078.4, system `tar`; `examples/ccapture-js-png-tar/run.sh --record` then `examples/ccapture-js-png-tar/run.sh`. Vite readiness is bounded to 10 s; page readiness to 15 s; each CCapture operation to 20 s.
- **Observed result:** both runs passed. Each actual CCapture.js `start()` / three `capture(canvas)` calls / `stop()` / `save(callback)` produced a TAR with exactly 3 PNGs, each 32×32 and all 1,024 pixels matching the expected opaque red, green, then blue frame. Raw RGBA SHA-256 values were respectively `4ab589b8423c13f8f33994356d5b696d9b3b56d968e1939f2088c53b5149e6cf`, `56419a079049271b37eea3515c12bbafb46578e6ac4db012c61395ef8b2e5a68`, and `590d140f13d7c4fac61d0745e2ece4e5afc4ce50af80f4a8470f5fcf00495101`; repeat semantic metrics matched.
- **Inspection:** opened all three first-run preview PNGs; they visibly show the intended red, green, blue full-frame outputs with no unexpected content.
- **Status/evidence:** pass for this PNG TAR route on this machine; metrics in `expected/result.json`, generated output under ignored `output/`. No timing metadata is provided by the selected image-sequence format, so frame rate/timestamps are not validated.
- **Limits/deviations:** proves only the pinned v2 PNG TAR API route and exact simple frame pixels/order. Does not exercise the clock-hooked animation behavior, time metadata, WebCodecs MP4/WebM, GIF, motion blur, alpha, larger canvases, 1.x, or other browsers/hosts. Official 2.0.0 documentation describes a ground-up rewrite; older 1.x tutorials/API should not be inferred from this result.
- **Reviewer/follow-up:** not independently reviewed; guide eligibility can be considered for this bounded route only.
