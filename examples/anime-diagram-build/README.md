# Anime.js diagram build

Status: validated on macOS arm64, 2026-11-20 (Anime.js 4.5.0, Playwright 1.64.1, Chromium 156.0.8078.4, Node 22.19.0, ImageMagick 7.1.2-15).

One paused Anime.js v4 timeline (`createTimeline({ autoplay: false })`), seeked per frame through `@vcr/capture`, builds a four-node chain one piece at a time and then traces it. 1280x720, 30 fps, 5 s (150 frames), transparent background.

```text
./run.sh            # capture 150 frames, run probe.ts, diff against expected/
./run.sh --record   # rewrite expected/ after a deliberate change
```

## Intent and scope

- Claim: on one paused timeline, each connector draws along its path (`svg.createDrawable`) before its node fades in, and the previous node's accent overlay recedes as the next node arrives; an accent then lights nodes 1 to 4 in turn and holds on the last. Deterministic in any seek order.
- Scene: four hand-placed rounded cards ("One" to "Four", the font from `canvas2d-capture`), three inline SVG connectors, one accent overlay per node. State changes are opacity only.
- Determinism rule: an Anime.js tween's from-value (`opacity: [0, 1]`) is only applied once a seek reaches that tween. So everything that starts hidden also starts hidden in CSS (`opacity: 0`; connectors are set to `draw "0 0"` before the timeline is built), and animated-opacity elements carry `will-change: transform, opacity` (see `anime-capture` for why).
- Exclusions: other Anime.js features, v3, other platforms, other seek APIs.
- Not claimed: visual quality beyond "legible and not clipped".

## Plan, before running

Predeclared checks. `run.sh` and `capture.ts` assert the first group; `probe.ts` reads computed styles and the drawable's `draw` attribute at every frame (sequential, then reversed, which must agree) for the second. Both are retained under `expected/`.

1. 150 frames at 1280x720; at least two distinct hashes; shuffled order equals sequential; frame 75 has alpha max above 0.
2. Frame 0 fully transparent (alpha max 0), and probe shows all nodes, accents and connectors at 0.
3. Order: node i first visible strictly after node i-1; connector i starts drawing strictly before node i+1 is visible and reaches drawn = 1 within 12 frames after it.
4. Recede: at frame 90 (3.0 s) nodes 1 to 3 have accent 0 and opacity 1.
5. Trace (frames 93 to 130): at most one accent above 0.5 per frame, lit index never decreases, lit order is 1, 2, 3, 4.
6. Hold: over the last 15 frames node 4 accent is 1 and the others 0; the last two frame hashes are identical.

## Observation, after running

- 2026-11-20, host Conors-MacBook-Pro-2.local. `run.sh --record` then `run.sh` printed OK (20.01 fps capture). 150 frames at 1280x720, shuffled order equals sequential, frame 0 alpha max 0, frame 75 alpha 0..1, last two hashes identical.
- Probe (retained in `expected/probe.json`): nodes first visible at frames 4, 28, 53, 79; connectors start drawing at 16, 41, 67 and complete at 27, 53, 78, each before its node appears. At frame 90 nodes 1 to 3 have accent 0 and opacity 1 (node 4's accent is still receding at 0.4). Trace lit order 1, 2, 3, 4, never two above 0.5. Last 15 frames: accents 0, 0, 0, 1. The probe read in reverse order matches sequential at every frame.
- First attempt failed, honestly: the accent was built as separate tweens on one property (arrive, recede, trace in, trace out). Seeking backwards from the hold to frame 124 left node 4's accent at 0.1389 instead of 0 (reverse probe differed; the captured frames were not compared at that point). Rewriting each accent as ONE keyframed tween (hold, ramp, hold, ramp...) fixed it. Lesson: one tween per element property in a paused timeline when you need to seek backwards; split tweens on the same property mis-seek.
- Contact sheet (frames 0, 20, 40, 60, 90, 100, 110, 125, 149, half scale on grey): frame 0 is empty; frame 20 shows One lit with a short connector stub; frame 40 One receded, Two lit, first connector full; frame 60 three nodes, Three lit, second connector drawn; frame 90 all four nodes, Four dim brown (accent mid-recede); frame 100 One lit; frame 110 Two lit; frame 125 Four nearly dark between Three and Four (the node 4 lit ramp has barely begun); frame 149 Four lit. Text is legible, nothing is clipped.
- Proves seek-per-frame determinism and the stated ordering for this scene on this machine. It does not prove other Anime.js features, easings other than linear, or other platforms.
