# Shiki Magic Move capture

Status: validated on macOS arm64, Chromium 156 via Playwright, 2026-11-24, after one amendment to the timeline (see below). The plan was written before the first run; the "Observation, after running" section records what happened.

## Intent and scope

- Tool: `shikijs-magic-move` (`@shikijs/magic-move` 4.6.0, the maintained package named on the card; the older `shiki-magic-move` 1.4.0 npm package is not used). Highlighting uses `shiki` 4.6.0, the peer range the package declares.
- VCR job and exact claim: a two-step Magic Move between two predeclared code snippets, Shiki-highlighted in one theme (`github-dark`) with one bundled OFL monospace font (JetBrains Mono Bold), renders deterministically from seek time. Frame 0 (progress 0) matches the static render of snippet A, the last frame (progress 1) matches the static render of snippet B, the middle frame differs from both, and shuffled capture equals sequential.
- Explicit exclusions:
  - Only the DOM renderer (`MagicMoveRenderer`, CSS transitions) is tested. The Vue, React, Svelte, Solid and web-component wrappers are not.
  - Only the `github-dark` theme, TypeScript snippets, and a single two-step transition.
  - No claim about visual quality, timing feel, easing choice or code-diff correctness beyond the token keys the library produces.
  - Not tested: other browsers, GPU rasterisation, other FFmpeg/encoding routes, alpha after encoding.
  - Static comparison is against the library's own static path (`MagicMoveRenderer.replace()` with the same DOM), not raw `codeToHtml` output. Raw `codeToHtml` markup is not the same DOM and is not compared pixel for pixel.
- Pillars cited: `TYPO-` (monospace code typography), `MOTION-` (transition timing). IDs only; no rule text is applied.
- Tool documentation and licence sources, checked 2026-11-24:
  - `@shikijs/magic-move` 4.6.0: MIT (npm metadata and the package's `LICENSE` file). Docs: https://shiki.style/packages/magic-move and https://github.com/shikijs/shiki/tree/main/packages/magic-move.
  - `shiki` 4.6.0: MIT (npm metadata). Docs: https://shiki.style.
  - JetBrains Mono: SIL Open Font License 1.1, copy at `fonts/OFL.txt`, from `examples/canvas2d-capture/fonts`.
  - Playwright and tsx: versions as in `examples/browser-capture`.
- Environment: macOS (Darwin 25.6.0), arm64, headless Chromium via Playwright; DOM and CSS transitions only (no WebGL).
- Input: two predeclared snippets embedded in `capture.ts` (A: a function with two parameters; B: the same function with a renamed parameter and an extra statement). Original text written for this fixture. No external assets. Lightweight input is the snippet text itself, not a file.
- Dependencies and installation: exactly `@shikijs/magic-move` 4.6.0 and `shiki` 4.6.0, pinned in `package.json`, installed project-locally by `pnpm install`. No global installs. No network use at capture time.
- Selected workspace, generated output and cleanup: `output/` (ignored) holds frames, `steps.json` and `summary.json`. Nothing outside the example directory is written.

### Determinism design

- `scene.html` does not use timers, `requestAnimationFrame` state, or wall-clock reads. Each `seek(t)` rebuilds the whole DOM from the two keyed token sets.
- Magic Move animates with CSS transitions. Per seek, the scene renders snippet A with `render()`, then B with `render()`. That starts the library's CSS transitions. It then pauses every animation under the container (`getAnimations({ subtree: true })`) and sets `currentTime` to `min(t * 1000, endTime)`. Progress is therefore set from seek time only.
- Frames are captured by the shared `@vcr/capture` harness: seek, settle two animation frames, then screenshot.
- Because each seek rebuilds from `t`, shuffled order is expected to match sequential order. This is tested, not assumed.
- Determinism limitation: the transition is driven by Chromium's CSS transition objects, not by the library's own clock. The claim relies on those objects accepting `currentTime` while paused. If that fails, the run fails.

## Plan, before running

- Exact commands:
  - `pnpm install` at the repository root (installs this example's pinned dependencies).
  - `examples/shiki-magic-move-capture/run.sh --record` (captures, writes `expected/summary.json`).
  - `examples/shiki-magic-move-capture/run.sh` (captures again; must print `shiki-magic-move-capture: OK`).
  - Contact sheet: `cd output/frames && magick ...` (command written in the observation step).
- Versions: `@shikijs/magic-move` 4.6.0, `shiki` 4.6.0, Playwright `^1.64.1` (as in the template), tsx `^4.23.15`, Node as installed, ImageMagick and jq as installed.
- Parameters: 1280x720, 30 fps, scene duration 3.0 s, so 90 animated frames (0..89). Static reference scene `static.html` captures frames 0 and 89. Transition options: `duration: 2000`, `easing: "ease-in-out"`, `containerStyle: false` (keeps the background transparent), other options default.
- Predeclared checks (all must pass; none may be weakened):
  1. Animated frame count is 90 (check key `frame_count_is_90`); static reference frame count is 2.
  2. Every frame is 1280x720.
  3. At least 2 distinct frame hashes across the 90 animated frames.
  4. Shuffled capture of all 90 frames gives the same hash for each frame as sequential capture.
  5. Animated frame 0 hash equals static reference A (frame 0) hash.
  6. Animated frame 89 hash equals static reference B (frame 89) hash.
  7. Middle frame 45 hash differs from both frame 0 and frame 89.
  8. Alpha range of middle frame 45: min 0, max 1 (transparent background, opaque glyphs).
- Expected artifacts retained: `expected/summary.json` holds only the booleans, counts, frame size and alpha range above. Hashes are printed for the run, never retained (Chromium hashes can drift across versions).
- Intended consumer: this is a seek-determinism fixture for VCR's browser route. No handoff to encoding.
- Delivery constraints: not applicable (no movie). PNG frames only.
- Expected failure modes and stop conditions:
  - Shiki or magic-move fails to import or highlight: stop, report blocked.
  - CSS transitions do not accept `currentTime` while paused, or no transitions are created: stop, report fail with the observed behaviour.
  - Frame 0 or frame 59 differs from the static render by pixels: report partial or fail with the measured difference. Do not add a tolerance.
  - Shuffled order differs from sequential: fail.
- Reproduction: `run.sh --record`, then `run.sh`. Inspect `output/contact.png` and `output/frames/` directly.

## Amendment after run 1 (timeline only, checks unchanged)

- Run 1 used the parameters above with `duration: 800`, a 2.0 s scene (60 frames, middle frame 30). Result: frame 0 matched static A, frame 59 matched static B, shuffled matched sequential, and the 8 predeclared checks passed except check 7 (`middle_frame_differs_from_both`), which was false.
- Cause, measured with a probe in the same harness: the library's transitions had completed by t = 1.0 s (the container width transition ended at 1120 ms, the moves at 800 ms). Frame 30 at t = 1.0 s was therefore already the settled state, and hash-equal to frames 40 and 59. The sampling was wrong, not the determinism: frames 10 and 20 were visibly mid-transition in the contact sheet.
- Amendment: `duration: 2000`, scene 3.0 s, 90 frames, middle frame 45 (t = 1.5 s), static boundary at 1.5 s. The checks, the thresholds and the alpha range are unchanged. The probe script was removed.
- Run 1 is recorded here as a failed check, not a pass. Only run 2 (after this amendment) is the evidence.

## Observation, after running

- Date and executor: 2026-11-24, Claude agent in a worktree, on `Conors-MacBook-Pro-2.local`, macOS 26.6 (Darwin 25.6.0), arm64.
- Versions: `@shikijs/magic-move` 4.6.0, `shiki` 4.6.0, Playwright 1.64.1, Chromium 156.0.8078.4 (launched by Playwright; the capture report does not print it), Node 22.19.0, ImageMagick 7.1.2-35, jq 1.8.1.
- Commands: `./run.sh --record` (after the amendment), then `./run.sh` printed `shiki-magic-move-capture: OK (90 frames, 61 distinct)`.
- Measured in the verifying run:
  - 90 frames, 1280x720, screenshot route; 19.6 frames per second sequential, 20.0 shuffled (wall time, not retained).
  - 61 distinct hashes across 90 frames.
  - Shuffled capture equal to sequential for every frame.
  - Frame 0 hash equals the static reference for snippet A; frame 89 equals the static reference for snippet B.
  - Frame 45 differs from both endpoints.
  - Frame 45 alpha min 0, max 1.
- Inspection: `output/contact.png` (frames 0, 15, 30 on the top row; 45, 60, 89 on the bottom). Frame 0 shows snippet A, correctly highlighted and aligned. Frames 15 and 30 are mid-transition: leaving tokens (`: number`, `tax`, `subtotal`) cross-fade while entering tokens (`discount`, `Math.round`) overlap them, so some glyphs collide. Frame 45 is nearly settled, with one `}` and a `number` still in motion at the right edge. Frames 60 and 89 show snippet B, correctly highlighted and aligned, with no clipping. The sheet shows the library's work, not a blank or clipped frame.
- Result: pass on all 8 predeclared checks. The first run (60 frames, 2.0 s) failed check 7 and is recorded above; the amendment changed only the timeline.

### What this result establishes and does not

- Establishes: on this machine, with this Chromium, the library's CSS transitions can be frozen per seek and produce frames that are independent of seek order. The endpoints match the library's own static render, using the same DOM path and the same CSS. The middle frame is a real intermediate state.
- Does not establish: a match to raw `codeToHtml` markup (not compared); other wrappers (Vue, React, Svelte, Solid, web component); other themes or languages; other browsers or GPU paths; quality or timing feel; alpha after any encoding; that frame 0 matches an unseeded browser session; behaviour beyond this two-step transition.
- Determinism limitation: the transition is driven by Chromium's CSS transition objects (`getAnimations` then `pause` and `currentTime`), not by the library's clock. This is a fair seek, but it relies on the library staying CSS-based. A future renderer change would need a rerun.
- Unseeded APIs: `renderer.mjs` and `style.css` contain no `Math.random`, `performance.now` or `Date.now`, so no feature is excluded.
- Deviations: the timeline amendment above; the shiki package named in the brief (`shiki-magic-move`) was replaced by the maintained `@shikijs/magic-move` named on the card.
- Reviewer and follow-up: not yet reviewed. Revisit if `@shikijs/magic-move` changes its renderer, its transition styles, or the Shiki peer range.
