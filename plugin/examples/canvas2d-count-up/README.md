# Canvas 2D count-up

Status: validated on macOS arm64, 2026-11-20 (Chromium 156.0.8078.4, Playwright 1.64.1, Node v22.19.0, host Conors-MacBook-Pro-2.local).

A canvas 2D figure counts from 0 to 1250 as a pure function of t, using no library. `seek(t)` calls `clearRect`, computes the integer from t alone (ease-out cubic over 2 s, progress clamped to 1, value clamped to the target), and draws each digit with `textAlign = "center"` in its own 140 px cell. The figure is centred on the canvas. `window.__scene` exposes `duration`, `seek` and `textBounds()`, whose single box carries the displayed string as `label`.

```text
./run.sh            # capture 90 frames, run probe.ts, diff against expected/
./run.sh --record   # rewrite expected/ after a deliberate change
```

`fonts/JetBrainsMono-Bold.ttf` is JetBrains Mono, SIL Open Font License 1.1 (https://github.com/JetBrains/JetBrainsMono), copied unmodified from `examples/canvas2d-capture`; the licence text is in `fonts/OFL.txt`. Canvas 2D is a browser platform API with no package or licence of its own; the catalogue card was read 2026-11-20.

## Intent and scope

- Claim: a figure drawn as canvas text counts from a start value to a target as a pure function of t, never decreases, never passes the target, lands exactly on the target and holds, with digits in fixed-width cells so the figure does not shift sideways; captured deterministically through `@vcr/capture` with alpha.
- Exclusions: thousands separators, units, decimals, negative or descending counts, other fonts, other platforms, `devicePixelRatio` above 1, count-ups on a non-linear time base, beginFrame capture. Because the font is monospaced, the cell grid is not what proves stability here; the checks read the box from `textBounds()`, which is computed from the cell grid, and the pixels are inspected on the contact sheet.
- The figure is centred, so its left edge moves when the digit count changes (1 to 4 digits). Check 4 therefore applies only to frames with the same digit count as the final value.

## Plan, before running

Checks, retained in `expected/summary.json` and `expected/values.json` and diffed by `run.sh`:

1. Frame count 90, 1280x720, at least two distinct hashes, shuffled order equals sequential, frame 45 alpha min 0 and max 1.
2. `textBounds()[0].label` at each frame time (read by `probe.ts` via Playwright): monotonic non-decreasing, never above 1250.
3. First frame value is 0; every frame from 2.0 s (frame 60) to the last equals 1250.
4. The last two frames have identical hashes.
5. On every frame whose digit count equals the final value's, `x` and `width` from `textBounds()` are identical.

Stop condition: any failed check is a failure; do not loosen it.

## Observation, after running

- `run.sh --record` then `run.sh` printed `OK`. 90 frames at 1280x720, 18 fps wall rate, shuffled order matched sequential, 56 distinct hashes (one per distinct displayed value), frame 45 alpha min 0 max 1.
- Values at frames 0, 15, 30, 45, 60, 89: 0, 723, 1094, 1230, 1250, 1250. The sequence is monotonic, never above 1250, equals 1250 from frame 60 (2.0 s) to the end, and the last two frames share a hash. The ease-out shows as steps of about 61, 60, 57 per frame early and 0 or 1 per frame near the end.
- 65 frames have four digits, like the final value; on all of them `textBounds()` x and width are identical.
- Contact sheet (`output/contact.png`, frames 0, 15, 30 / 45, 60, 89 over grey, half scale): a large lime figure in JetBrains Mono reading 0, 723, 1094, 1230, 1250, 1250. The 1-digit and 3-digit figures are centred; the four-digit ones sit at the same position in the last three four-digit frames. Glyphs are crisp, nothing is clipped, and the background is transparent (grey is the sheet's backdrop).
- Limits: `textBounds()` is computed from the cell grid, not measured from pixels, so the no-shift check covers the scene's own geometry plus the visual check; with a monospaced font it would hold without cells too. This proves the count-up for this scene, font and machine only. No control run that breaks a check was made.
