# Browser capture spike

Status: validated on macOS arm64, Chromium 156 via Playwright, 2026-10-26. Report: `specifications/spikes/browser-capture.md`.

Seeks paused Web Animations API tracks by absolute time in headless Chromium and captures each frame as a PNG with alpha. Proves the capture capability used by browser scenes and the in-house engine's browser adapter.

```text
./run.sh            # capture 90 frames at 1080p, print frame 45's alpha range, assemble ProRes 4444, print the report
pnpm -s capture     # capture only; writes output/report.json
VCR_CAPTURE=beginframe pnpm -s capture   # experimental alternative; screenshot is the default
```

## What the harness must do, learned the hard way

1. Return nothing from the `evaluate` that seeks. Return a primitive or no value so the browser bridge never tries to serialize animation objects.
2. Set a permanent transparent default background through CDP instead of `omitBackground` per screenshot. Toggling it per frame races the paint and halves throughput.
3. Use the shared `@vcr/capture` harness: seek, settle two animation frames, then screenshot. The original spike used `HeadlessExperimental.beginFrame`; an audit rerun exited with an unresolved await on that path, so it remains experimental.
4. Pause every `Animation` and set `currentTime` from the requested frame; do not let animations follow the document timeline.
5. Disable Chromium partial rasterization. Reusing raster tiles produced small pixel differences between frame orders even when the scene values matched; the shared harness includes `--disable-partial-raster`.

## Expected baseline

`expected/summary.json` is retained from the prior GSAP run and has not been refreshed after the Web Animations API migration. The manifest is marked `not-validated` until `./run.sh --record` can capture this new source and establish fresh expected output.

It asserts: capture mode, 90 frames at 1920x1080, shuffled matches sequential, frame 45 alpha min 0 and max 1, and a `prores` movie of 90 frames whose pixel format carries alpha (`yuva*`). The exact pix_fmt is printed, not retained: `yuva444p10le` is requested, and FFmpeg 6.1.1 and 8.0.1 both report `yuva444p12le`. The summary does not decode the movie's alpha back out, so it does not prove alpha survives the encode pixel for pixel. Timing figures are printed, never retained.

History: the earlier 2026-10-26 and 2026-11-04 runs used GSAP and are retained in the retired record. The active fixture now uses Web Animations API under the free-software policy.

The fixture captures a separate, seeded shuffled run and fails if frame hashes differ or every frame is identical. A third run captures 30 frames at 4K. Capture diagnostics are kept in `output/capture.log` and printed on failure.
