# Web Animations API capture

Status: validated on macOS arm64, 2026-11-05 (Chromium 156.0.8078.4, Playwright 1.64.1, ImageMagick 7.1.2-15; no library).

Seeks native `element.animate()` animations through `@vcr/capture`: each animation is paused at creation and positioned with `Animation.currentTime`, once per frame. The scene covers a CSS transform tween (rotate and scale), an SVG line draw (`stroke-dashoffset`) and a staggered opacity and translate tween.

```text
./run.sh            # capture 90 frames, assert against expected/summary.json
./run.sh --record   # rewrite expected/ after a deliberate change or upgrade
```

## Plan, before running

- Claim: `element.animate()` animations, paused and seeked via `Animation.currentTime`, render deterministically in any frame order with alpha.
- Exclusions: CSS animations and `document.getAnimations()`; `ScrollTimeline`/`ViewTimeline`; `commitStyles`; composite modes; beginFrame capture; other operating systems.
- Dependencies: none beyond Chromium (already installed for Playwright); no library.
- Checks, retained in `expected/summary.json`: 90 frames at 1280x720, shuffled order matches sequential, frame 45 alpha min 0 and max 1. `run.sh` fails outright if shuffled order differs, and `capture.ts` fails if every frame is identical.
- Known risk (issue #57): opacity-animated elements need `will-change: transform, opacity`, otherwise Chromium's compositor layering depends on seek history. The scene starts with it.
- Stop condition: any shuffled mismatch is a failure. If one appears, bisect by removing one animation at a time and report the cause rather than recording it.

## Observation, after running

- 2026-11-05, macOS arm64: passed on the first run, and on two further runs. 90 frames at 1280x720, shuffled order matches sequential, frame 45 alpha min 0 and max 1.
- Inspected a contact sheet of frames 0, 15, 30, 45, 60 and 89 at reduced scale: square rotating and shrinking, line drawing along the curve, dots staggering in (three solid and one fading at frame 45, all five by frame 60).
- Control: with `will-change` removed from the dots, the run still passed once. The anime-capture mismatch (issue #57) did not reproduce here, so `will-change` is kept as a precaution and is not shown to be necessary for this scene.
- Seeking sets `currentTime` on every animation, including past `endTime`; `fill: "both"` holds the end state. Animations are paused at creation, so nothing depends on the document timeline or a wall clock.
- This proves seek-per-frame determinism for this scene on this machine. It does not cover CSS animations, `document.getAnimations()`, scroll timelines, other browsers or platforms, or other scenes with opacity animations.
