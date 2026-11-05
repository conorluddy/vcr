# Canvas 2D capture

Status: validated on macOS arm64, 2026-11-05 (Chromium 156.0.8078.4, Playwright 1.64.1, ImageMagick 7.1.2-15).

A plain HTML canvas 2D scene, no library. `seek(t)` calls `clearRect` and redraws everything from `t`: a linear gradient that fades to transparent, a sweeping arc, a sine-wave path, 90 sparks placed by a seeded PRNG (mulberry32, recreated inside every draw), and text in a loaded font. The page awaits `FontFace.load()` and `document.fonts.ready` before it exposes `window.__scene`.

```text
./run.sh            # capture 90 frames, assert against expected/summary.json
./run.sh --record   # rewrite expected/ after a deliberate change or upgrade
```

`fonts/JetBrainsMono-Bold.ttf` is JetBrains Mono, licensed under the SIL Open Font License 1.1 (https://github.com/JetBrains/JetBrainsMono), copied unmodified; the licence text is in `fonts/OFL.txt`.

## Plan, before running

- Claim: a canvas 2D scene redrawn as a pure function of t renders deterministically per frame, in any frame order, with alpha, through `@vcr/capture`.
- Exclusions: images and `drawImage`, `getImageData`/pixel access, compositing modes, `OffscreenCanvas`, `devicePixelRatio` above 1, system fonts, other operating systems, beginFrame capture.
- Checks, retained in `expected/summary.json`: 90 frames at 1280x720, shuffled order matches sequential, frame 45 alpha min 0 and max 1. `run.sh` also fails outright if shuffled order differs.
- Stop condition: any shuffled mismatch is a failure; bisect (gradient, arc, path, PRNG, text) and report, never record it.

## Observation, after running

- 2026-11-05, macOS arm64: the first run passed. Shuffled order matched sequential for all 90 frames, and two further runs diffed clean against `expected/`.
- Control: replacing the seeded PRNG with `Math.random` made `run.sh` exit 1 with a mismatch at all 90 frames, so the check can fail. The scene was restored afterwards.
- Inspected frames 0, 30, 45 and 89 at half scale over a grey background: the gradient fades to transparent on the right, the arc sweeps from empty to a full ring, the wave travels, and the title and counter render in JetBrains Mono, not a fallback face.
- No bisect was needed; no `will-change` or layer pinning was required, unlike the Anime.js example, though this scene has no CSS-animated DOM.
- This proves seek-per-frame determinism for this scene on this machine. It does not prove other canvas features, other fonts or platforms, or that the font wait is required (capturing without it was not tested).
