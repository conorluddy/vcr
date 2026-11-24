# Revideo headless render fixture

## Intent and scope

- **Tool/version:** Revideo 0.11.0 (`@revideo/core`, `@revideo/2d`, `@revideo/renderer`, `@revideo/vite-plugin`, all exact 0.11.0), using the headless `renderVideo()` API of `@revideo/renderer`.
- **Claim:** revideo renders a small project (one scene: a red rect tweening its x position over 2 s, and a Txt node) headlessly via `renderVideo` to an MP4 at the predeclared size and frame rate; ffprobe reports the predeclared codec, dimensions and frame count; decoded frames at predeclared indices show the rect at its analytically expected x within 2 px; two renders give identical per-frame pixel hashes.
- **Exclusions:** audio; revideo's WebM, ProRes and wasm exporters; the editor and `revideo render` CLI; HTTP render server; multi-worker rendering; parameterised variables; cross-OS or cross-Chrome determinism; visual quality beyond the rect position and colour check. The MP4 byte hash is recorded for information only and is not a claim.
- **Documentation and licence:** [revideo repository](https://github.com/midrender/revideo) and [docs](https://docs.re.video/); MIT licence per the card and `@revideo/core` package metadata. Checked 2026-11-24. The `@revideo/renderer` package also depends on `puppeteer` (Apache-2.0) and `vite` (MIT), both exact-resolved in the lockfile.
- **Environment:** macOS arm64 (Darwin 25.6.0), Node 22.19.0; versions recorded in `expected/render.json`.
- **Input:** none beyond the owned scene in `src/`. No external media, fonts or network assets; the Txt node uses the default system sans-serif font.
- **Dependencies and install plan:** `npm ci --ignore-scripts` inside this directory, from the committed `package-lock.json`, then `npm rebuild` of the two bundled macOS ffmpeg installers. Direct dependencies are the five exact `@revideo/*` 0.11.0 packages (`core`, `2d`, `renderer`, `vite-plugin`, `ui`); `puppeteer` 25.18.1 and `vite` 8.3.8 arrive transitively. Install scripts are skipped on purpose: `puppeteer` would otherwise download its own Chrome into `~/.cache/puppeteer`, and `@revideo/telemetry` would write `~/.revideo/id.txt`.
- **Browser:** the installed Google Chrome app (`CHROME_BIN`, default `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`), passed to puppeteer as `executablePath`. Puppeteer does not download a browser.
- **FFmpeg:** the renderer encodes with the ffmpeg bundled by `@revideo/ffmpeg` (`@ffmpeg-installer/darwin-arm64`). Analysis (ffprobe facts and RGB24 frame decoding) uses the system Homebrew `ffmpeg` and `ffprobe` (`FFMPEG_BIN`, `FFPROBE_BIN`), not the renderer's path.
- **Network and telemetry:** `DISABLE_TELEMETRY=true` is set in `run.sh`. Without it, `@revideo/telemetry` sends render events to PostHog's EU endpoint. The renderer starts a local Vite server on localhost (port 9000 by default) and a headless browser; no other network access is expected.
- **Selected workspace and outputs:** `output/render-a/` and `output/render-b/` (ignored) hold the MP4s and raw decoded RGB24 frames. The renderer writes intermediate files under the OS temp directory (`revideo-*` folders); the renderer's own cleanup is relied on and not verified.

## Plan, before running

- **Commands:** `./run.sh --record` to write `expected/render.json`, then `./run.sh` to compare. Each run renders twice: `render-a` and `render-b`.
- **Project:** `src/project.ts` sets size 320×180, background `#000000`, range `[0, 2]` s and 30 fps. `src/scenes/main.ts` moves a 40×40 `#ff0000` rect from x = −100 to x = +100 px (origin at the canvas centre) with the `linear` tween over 2 s, and adds a white `Txt` "revideo" at y = −60.
- **Predeclared checks:**
  1. ffprobe on each MP4 reports `h264`, `yuv420p`, 320×180, `r_frame_rate` `30/1`, and 60 frames read with `-count_frames`.
  2. The decoded RGB24 stream holds exactly 60 frames of 320×180.
  3. At frame indices 0, 15, 30, 45 and 59 the red rect's pixel-weighted centre x is within ±2 px of `160 + (−100 + 200 × (i/30)/2)`, and its centre y is within ±2 px of 90.
  4. The red pixel count at each sampled frame is between 1200 and 2000 (a 40×40 rect is 1600 px, less at clipped edges).
  5. At least two distinct frame hashes (SHA-256 of decoded RGB bytes).
  6. The `render-b` per-frame hashes equal `render-a` for all 60 frames (rerender determinism).
  7. On `./run.sh` (no record), the ffprobe facts and the 60 frame hashes equal `expected/render.json`.
- **Stop conditions:** renderer fails to launch Chrome or to start Vite; ffprobe facts or frame count differ; a sampled rect position is outside tolerance; rerender hashes differ; Chrome or revideo versions change without re-recording. A pass on checks 1–7 is a pass; check 3 with a pass on hashes but a wrong picture is a fail.
- **Inspection:** after `--record`, look at `output/render-a` frames at native size (frame 0 and frame 59), and make a contact sheet from the decoded frames, not only from the hash results.
- **Reproduction:** `cd examples/revideo-headless-render && ./run.sh --record && ./run.sh`.
- **Expected failure modes:** `renderVideo` may reject `--single-process`-only Chrome on macOS; `Txt` font fallback may differ (the text is not checked numerically); the scene may not render at 2 s because `range` and yield durations disagree.

## Observation, after running

Run date 2026-11-24, executed on `Conors-MacBook-Pro-2.local` (macOS 26 / Darwin 25.6.0, arm64), Node v22.19.0.

- **Result: partial.** The headless `renderVideo` route rendered an MP4 on this machine with no network service. Eleven of thirteen predeclared checks passed. The two that failed are both frame-count checks, because the predeclared 60 was wrong (see below). `expected/` was not written, because `run.sh --record` only writes it when every predeclared check passes. The evidence scope therefore starts "Fixture-reported:".
- **Versions:** revideo 0.11.0 (`@revideo/core`, `2d`, `renderer`, `vite-plugin`, `ui`); puppeteer 25.18.1; vite 8.3.8; Google Chrome 158.0.8127.37 (from `--version`; the CDP launch used this binary); bundled ffmpeg 4.4 (`@ffmpeg-installer/darwin-arm64`, encoder); Homebrew ffmpeg and ffprobe 9.0.2 (analysis only); Node v22.19.0. `pngjs` was removed and is not installed.
- **Checks (from `./run.sh --record`):**
  - PASS codec h264, pixel format yuv420p, 320×180, frame rate 30/1.
  - FAIL ffprobe frame count: 61, predeclared 60. FAIL decoded RGB24 frame count: 61, predeclared 60.
  - PASS 61 distinct frame hashes.
  - PASS rect centre x at frames 0, 15, 30, 45, 59: 60.00, 110.00, 160.00, 210.00, 256.50 px against expected 60, 110, 160, 210, 256.67 px. Centre y 90.00 px at all five. Red pixel counts 1600, 1600, 1600, 1600, 1560.
  - PASS rerender: `render-b` matched `render-a` on all 61 decoded frame hashes. The MP4 SHA-256 was also identical across the two renders (`2f754b68…`), recorded for information only.
- **Why 61 frames:** `range: [0, 2]` renders the end frame too, so 2 s at 30 fps gives frames 0 to 60. My predeclared count of 60 was an arithmetic error in the plan. I have not amended it to 61 after seeing the result, so the check stays failed. A corrected count would need a new pre-registered plan and a new run.
- **Pre-run attempts, all before the final run:** (1) `projectFile: 'src/project.ts'` failed in Vite's import analysis; the working form is `./src/project.ts`. (2) `makeScene2D` without a name gave "Cannot read properties of undefined (reading 'name')"; the name is the first argument. (3) Pointing the renderer at Homebrew ffmpeg 9.0.2 failed with "Input format lavfi is not available" while creating the silent audio track; the bundled 4.4 build works, so the renderer uses it. (4) `renderVideo` needs `@revideo/ui` and `@revideo/vite-plugin`, which `@revideo/renderer` does not declare as dependencies; both were added at the exact 0.11.0 pin. (5) `--ignore-scripts` left the bundled `ffprobe` without execute permission (EACCES); `npm rebuild` of the two installer packages restores it, and `run.sh` now does this.
- **Deviations from the plan, all recorded here:** the install recipe and FFmpeg bullets in Intent were corrected after the attempts above; the checks and the 60-frame predeclaration were not changed. Telemetry was off (`DISABLE_TELEMETRY=true`). The renderer's leftover temp folders under the OS temp directory (`revideo-video-0-*`) from the attempts were removed by hand; none remained after the final run.
- **Visual inspection:** `output/contact.png` shows frames 0, 15, 30, 45 and 60 from `render-a`, at 2× scale. A red square moves steadily left to right at mid-height on black, with the white "revideo" label above it at the same position in every frame. The blank cell in the bottom-right is montage padding. The picture matches the claim.
- **What this establishes:** `renderVideo` can render this scene to an H.264 MP4 at 320×180 and 30 fps headlessly, with the bundled ffmpeg and the installed Chrome. Rect position is correct to about 0.2 px on the sampled frames, and two renders on this host produced identical pixels.
- **What it does not establish:** the 60-frame predeclared count (it is 61); other hosts or OSes; Chrome versions other than 158; the WebM, ProRes and wasm exporters; the `revideo render` CLI and HTTP server; multi-worker rendering; cross-machine hashes. The output has a silent AAC track from revideo's silent-audio step. ffprobe checks were made on the video stream only.
- **Reviewer, decision and follow-up:** a reviewer should decide whether to pre-register a corrected frame count (61, inclusive end) as a new, dated plan. If that is done and the run passes, the record gets a new evidence entry and `expected/` is recorded then. Revisit if the revideo version, Chrome, or the bundled ffmpeg changes.
