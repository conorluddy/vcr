# Anime.js capture

Status: validated on macOS arm64, 2026-11-05 (Anime.js 4.5.0, Playwright 1.64.1, Chromium 156.0.8078.4, ImageMagick 7.1.2-15).

Seeks an Anime.js v4 timeline, built with `createTimeline({ autoplay: false })`, once per frame through `@vcr/capture`. The scene covers the three things the card claims: a CSS transform tween (rotate and scale), an SVG line draw (`svg.createDrawable`) and a staggered opacity and translate tween.

```text
./run.sh            # capture 90 frames, assert against expected/summary.json
./run.sh --record   # rewrite expected/ after a deliberate change or upgrade
```

## Plan, before running

- Claim: an Anime.js v4 timeline seeked per frame (in milliseconds) renders deterministically in any frame order, with alpha.
- Exclusions: Anime.js v3; `animate()` outside a timeline; springs, scroll observers and morphing; beginFrame capture; other operating systems.
- Checks, retained in `expected/summary.json`: 90 frames at 1280x720, shuffled order matches sequential, frame 45 alpha min 0 and max 1. `run.sh` also fails outright if shuffled order differs, and `capture.ts` fails if every frame is identical.
- Stop condition: any shuffled mismatch is a failure, never a value to record.

## Observation, after running

- 2026-11-05, macOS arm64: the first run failed. Frames 62 to 89 differed by 2 pixels between orders along the rotating square's edge, while the DOM values were identical in both orders.
- Bisected: the square alone was deterministic, both through Anime.js and with the same transform written by hand. Square plus the staggered dots was not.
- Cause: Chromium promotes the dots, whose opacity and transform change, to compositor layers depending on seek history, which changes the square's anti-aliasing. This is the renderer, not Anime.js. `will-change: transform, opacity` on the dots pins their layers; after that, two consecutive runs passed.
- Inspected a contact sheet of frames 0, 15, 30, 45, 60 and 89 at reduced scale: square rotating and shrinking, line drawing along the curve, dots staggering in (four visible at frame 45, since the fifth starts at 1.6 s).
- This proves seek-per-frame determinism for this scene on this machine. It does not prove other Anime.js features, other platforms, or that `will-change` is enough for every scene with opacity animations.
