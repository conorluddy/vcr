# Web Animations API word-by-word text entrance

Status: validated on macOS arm64, 2026-11-20 (Chromium 156.0.8078.4, Playwright 1.64.1, ImageMagick 7.1.2, Node v22.19.0, host Conors-MacBook-Pro-2.local; no library).

## Intent and scope

A line of real text ("Every word arrives on its own beat"), split by the scene's own script into one `<span>` per word, enters word by word. Each word has its own paused `element.animate()` (opacity 0 to 1 plus a 24px translate, 500 ms) with `delay = index x 100 ms`, which is exactly 3 frames at 30 fps. `seek(t)` sets every animation's `currentTime = t x 1000`, so all state is rebuilt from t on each seek. 1280x720, 30 fps, 3 s, transparent background. Font: JetBrains Mono Bold, copied from `examples/canvas2d-capture/fonts` and awaited before `__scene` is exposed.

Claim: this entrance is deterministic under seeking (shuffled order equals sequential), onsets are evenly offset by exactly 3 frames, and the text settles fully visible.

Excluded: CSS animations, `getAnimations()`, scroll timelines, other browsers or platforms, other fonts, kerning or wrapping of text across lines.

## Plan, before running

```text
./run.sh            # capture 90 frames, probe onsets, assert against expected/
./run.sh --record   # rewrite expected/
```

Predeclared checks, retained under `expected/` and diffed by `run.sh`:

1. 90 frames, 1280x720, at least two distinct hashes, shuffled order equals sequential.
2. Frame 0 alpha max is 0 (fully transparent).
3. Onset spacing: `probe.ts` reads each word's computed opacity per frame in the page (`__scene.probe(t)`); the first frame with opacity > 0 differs by exactly 3 between consecutive words.
4. Settled: every word's computed opacity is 1 at the last frame, and the last two frame hashes are identical.
5. Frame 45 alpha min 0 and max > 0 (partial coverage).

Note: at frame 3i the word's currentTime equals its delay, so opacity is still 0; the first visible frame is 3i + 1. Only spacing is asserted.

## Observation, after running

- First run at 72px failed visually, though every hash check passed: the 35-character line was wider than 1280px and "beat" was clipped off the right edge, which alpha and hash checks cannot see. Fixed by using 48px and adding a check in `probe.ts` (added after that first run) that every word's bounding box lies inside the viewport.
- Results (re-run prints `OK`): 90 frames at 1280x720, shuffled equals sequential, frame 0 alpha max 0, frame 45 alpha min 0 max 1, last two frame hashes identical.
- Onsets: first visible frames are 1, 4, 7, 10, 13, 16, 19 for the seven words (gaps all 3); all seven computed opacities are 1 at frame 89.
- Contact sheet (frames 0, 6, 12, 18, 24, 89): frame 0 is empty; then "Every" is solid and "word" fading in slightly lower; further frames add "arrives", "on", "its", "own" in order, the newest word faint and offset down; frame 89 shows the full line "Every word arrives on its own beat" fully legible and inside the frame.
- `seek` sets `currentTime` on all animations from t each call, so nothing depends on prior seeks.
- Proves this scene on this machine only. Not covered: CSS animations, `getAnimations()`, scroll timelines, other browsers, wrapped multi-line text.
