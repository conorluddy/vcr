# First cut, 2026-10-26

Render: see `render-manifest.json`. Output `output/launch-know-your-game.mp4`, 600 frames, 20.000 s.

## Findings
- `title f0075`: wordmark rendered in its inline dark fill. Cause: inline `style` on the SVG paths beats the stylesheet. Fixed with `!important` in `scenes/shared.css`; re-rendered title and end.
- `background f0300`: lit path crossed the whole frame and competed with the phone. Cause: random path nodes. Fixed by nearest-neighbour chaining, thinner stroke, lower alpha; re-rendered background.
- `product`: phone, captions and shot changes read correctly at f0060, f0180, f0300. No change.
- `end`: stats, price and close sequence as briefed. No change.

## What the harness and catalogue were missing
- A `serveRoot` option on `@vcr/capture` so scenes can reach project assets and node_modules (added).
- p5's exports map hides `package.json` from `require.resolve`; the render manifest reads it by path.
- Nothing generated the FFmpeg assembly: the `tpad` start offsets duplicate the timings in `video.json`. That is the first concrete requirement for the Layer 2 resolver.
- No workflow skill for briefing or review existed; this file is the review format until one does.

## Status
Approved for a silent first cut by self-review; awaiting Conor's notes. Not yet an approved reference.
