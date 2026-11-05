# Browser capture spike

Status: validated on macOS arm64, Chromium 156 via Playwright, 2026-10-26. Report: `specifications/spikes/browser-capture.md`.

Seeks a paused GSAP timeline frame by frame in headless Chromium and captures each frame as a PNG with alpha. Proves the one capability every browser toolkit (SVG/GSAP, p5.js, Three.js) and the in-house engine's browser adapter depend on.

```text
./run.sh            # capture 90 frames at 1080p, print frame 45's alpha range, assemble ProRes 4444, print the report
pnpm -s capture     # capture only; writes output/report.json
VCR_CAPTURE=beginframe pnpm -s capture   # experimental alternative; screenshot is the default
```

## What the harness must do, learned the hard way

1. Return nothing from the `evaluate` that seeks. `timeline.seek()` returns the timeline, and serialising that cyclic graph never finishes.
2. Set a permanent transparent default background through CDP instead of `omitBackground` per screenshot. Toggling it per frame races the paint and halves throughput.
3. Use the shared `@vcr/capture` harness: seek, settle two animation frames, then screenshot. The original spike used `HeadlessExperimental.beginFrame`; an audit rerun exited with an unresolved await on that path, so it remains experimental.
4. Recommended in scenes: `gsap.defaults({ force3D: false, lazy: false })`, so GSAP never swaps transform paths mid-tween or defers its first write to the next tick.
5. Disable Chromium partial rasterization. Reusing raster tiles produced small pixel differences between frame orders even when the scene values matched; the shared harness includes `--disable-partial-raster`.

## Expected (retained)

`expected/summary.json`, recorded 2026-11-05 on macOS arm64 (Playwright 1.64.1, Chromium 156.0.8078.4, GSAP 3.15.0, FFmpeg 8.0.1, ImageMagick 7.1.2-15) with the screenshot route. `./run.sh` diffs every run against it; `./run.sh --record` rewrites it.

It asserts: capture mode, 90 frames at 1920x1080, shuffled matches sequential, frame 45 alpha min 0 and max 1, and a `prores` movie of 90 frames whose pixel format carries alpha (`yuva*`). The exact pix_fmt is printed, not retained: `yuva444p10le` is requested, and FFmpeg 6.1.1 and 8.0.1 both report `yuva444p12le`. The summary does not decode the movie's alpha back out, so it does not prove alpha survives the encode pixel for pixel. Timing figures are printed, never retained.

History: the 2026-10-26 run used the then-default `beginFrame` route (now experimental), and the 2026-11-04 Linux run printed alpha without asserting it. Both are fixture-reported; see the evidence entries in `catalog/tools/playwright.json` and `gsap.json`.

The fixture captures a separate, seeded shuffled run and fails if frame hashes differ or every frame is identical. A third run captures 30 frames at 4K. Capture diagnostics are kept in `output/capture.log` and printed on failure.
