# Vizzu chart morph seeked frame by frame

## Intent and scope

- Tool/version: `vizzu` 0.18.0 (Apache-2.0), Playwright Chromium through `packages/capture`, screenshot route.
- Claim: a `chart.animate()` keyframe chain (bars, stacked bars, scatter), started paused, can be seeked by time with `AnimControl.seek()` and captured deterministically frame by frame.
- Exclusions: alpha output (opaque background), pie and other chart types, long multi-`animate()` queues, fonts other than Arial, live data.
- Docs: https://lib.vizzuhq.com and `dist/animcontrol.d.ts` in the package; checked 2026-11-27.
- Environment: macOS arm64, Node 22.19.0, 1280x720 at 30 fps. Input: inline table of 8 rows in `scene.html`.
- Output: ignored `output/` (`frames/`, `end/`, `report.json`, `summary.json`).

## Plan, before running

- `./run.sh --record`, then `./run.sh` repeatedly.
- Assert: 90 frames at 1280x720; seeded-shuffle capture hashes equal sequential; frames 0, 45 and 89 all differ; at least 60 distinct frames; frame 90 (t = 3 s, the very end) differs from frame 89.
- Inspect a contact sheet. Stop if a frame is blank or the shuffled run differs.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`.

- First version (one `control.seek()` per frame): 69 to 70 distinct frames of 90 (holds repeat), but the shuffled run differed from sequential in 3 of 5 runs, each time on one random frame (55, 34, 68). The seek renders asynchronously and the screenshot can land before it.
- Scene `seek` now calls `control.seek()` twice with the same position. Result: shuffled equals sequential in 16 of 16 runs. This is an empirical workaround, not an explained fix; a larger settle in the harness was not tried.
- Frames inspected on a contact sheet: bars with colour change (frames 15 to 29), stacked by year (about frame 60), scatter of revenue against margin at the end. The morph interpolates markers; titles cross-fade. The default axis interlacing is white and was overridden in the style for the dark background.
- Seeking to t = 3 s exactly (frame 90) rendered the final scatter; the card's warning concerns the completion promise, which this fixture never awaits.
- Establishes: seek-driven capture works for a paused keyframe chain. Does not establish: alpha, pie or other types, chains of several `animate()` calls, other machines.
