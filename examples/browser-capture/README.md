# Browser capture spike

Status: validated on macOS arm64, Chromium 156 via Playwright, 2026-10-26. Report: `specifications/spikes/browser-capture.md`.

Seeks a paused GSAP timeline frame by frame in headless Chromium and captures each frame as a PNG with alpha. Proves the one capability every browser toolkit (SVG/GSAP, p5.js, Three.js) and the in-house engine's browser adapter depend on.

```text
./run.sh            # capture 90 frames at 1080p, verify alpha, assemble ProRes 4444, print the report
pnpm -s capture     # capture only; writes output/report.json
VCR_CAPTURE=screenshot pnpm -s capture   # alternative capture paths: beginframe (default), settle, screenshot
```

## What the harness must do, learned the hard way

1. Return nothing from the `evaluate` that seeks. `timeline.seek()` returns the timeline, and serialising that cyclic graph never finishes.
2. Set a permanent transparent default background through CDP instead of `omitBackground` per screenshot. Toggling it per frame races the paint and halves throughput.
3. Drive frames explicitly with `HeadlessExperimental.beginFrame` under `--deterministic-mode`. The returned screenshot is that frame, not whichever frame the compositor last produced.
4. Recommended in scenes: `gsap.defaults({ force3D: false, lazy: false })`, so GSAP never swaps transform paths mid-tween or defers its first write to the next tick.

## Expected
`shuffled_matches_sequential=true`, 90 frames, `srgba` PNGs with alpha min 0 and max 1, `prores` `yuva444p12le` output.
