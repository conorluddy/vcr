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

## Expected (fixture-reported)

Reported from the 2026-10-26 run, which used the then-default `beginFrame` route; the current screenshot default has no recorded run of this example.

`shuffled_matches_sequential=true`, 90 frames, `srgba` PNGs with alpha min 0 and max 1, and a `prores` output. `run.sh` requests `yuva444p10le`; ffprobe was reported as `yuva444p12le`, likely the ProRes decoder's output format (not confirmed). These values come from runs, not retained files: this example keeps no `expected/` directory, and whether alpha survives the ProRes encode has not been retained.

2026-11-04: the screenshot default now has a recorded run (Linux x86_64 container, Playwright 1.64.1 with Chrome for Testing 153 standing in for the pinned Chromium 156 build): 90 frames, shuffled matches sequential, frame 45 alpha printed min 0 max 1 (not asserted). FFmpeg 6.1.1 again reported `yuva444p12le` for the requested `yuva444p10le`; that this is the ProRes decoder's output format is still not confirmed. See the latest evidence entries in `catalog/tools/playwright.json` and `gsap.json`.

The fixture captures a separate, seeded shuffled run and fails if frame hashes differ or every frame is identical. A third run captures 30 frames at 4K. Capture diagnostics are kept in `output/capture.log` and printed on failure.
