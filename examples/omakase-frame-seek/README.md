# Omakase Player frame seek

Status: validated on macOS arm64, 2026-11-27 (@byomakase/omakase-player 1.3.1, Playwright 1.64.1, Chromium 156.0.8078.4, FFmpeg 9.0.2).

Loads a generated H.264 MP4 into Omakase Player, seeks to specific frames with `player.seekTo(n, MediaTemporalFormat.FRAME_COUNT)`, screenshots the player's `<video>` and decodes the burnt-in frame number from the picture.

```text
./run.sh            # generate clip, bundle the page with esbuild, seek, decode, diff expected/summary.json
./run.sh --record   # rewrite expected/ after a deliberate change or upgrade
```

## Plan, before running

- Claim: for a plain progressive MP4 (not HLS), a frame-index seek lands on the requested frame, as shown by the pixels on screen and by `getCurrentTime(FRAME_COUNT)`.
- Input: `testsrc2` 640x360, 24 fps, 120 frames, libx264 CRF 14, GOP 12. The FFmpeg here has no `drawtext`, so the frame number is burnt in as a 20-bit barcode (32 px blocks across the top, white = 1) made with `geq`; the checker reads each block centre from the screenshot.
- Checks, retained in `expected/summary.json`: 14 seeks in a non-monotonic order (0, 1, 2, 59, 60, 119, 7, 100, 23, 24, 0, 119, 58, 3); every decoded barcode equals the requested frame; every `getCurrentTime(FRAME_COUNT)` equals it; no page errors; duration 5 s.
- Exclusions: HLS, sidecar video, timeline, markers, VU meter, drop-frame or non-integer rates, audio, other browsers and platforms; the player's own chroming (`CHROMELESS` theme).
- Stop condition: any mismatch is a failure to report, never a value to record.
- Needs the player's stylesheet (`omakase-player.css`) on the page; without it the `<video>` has zero size and cannot be screenshotted.

## Observation, after running

- 2026-11-27: all 14 seeks decoded to the requested frame and reported the same frame count; 0 page errors. Frame 60 screenshot inspected: bars from testsrc2 plus barcode blocks at bits 2 to 5 (60 = 0b111100), as expected.
- Seeks were followed by a fixed 150 ms wait before the screenshot; the seek observable emitting was not on its own proven to mean the frame was painted, so the wait stays and is part of the claim.
- `frameRateModel.frameRate` was not readable from `loadMainMedia`'s result, so the summary does not record a detected frame rate; frame seeks nevertheless resolved correctly.
- Does not prove: frame accuracy on long-GOP or B-frame heavy sources, other frame rates, HLS, or that a screenshot without the 150 ms wait is stable.
