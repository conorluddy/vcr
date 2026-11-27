# bezier-easing against Chromium CSS cubic-bezier

## Intent and scope

- Tool/version: `bezier-easing` 3.2.0 (npm; MIT), Playwright 1.64.1 Chromium 156.0.8078.4 as the reference.
- Claim: `BezierEasing(x1, y1, x2, y2)(t)` in Node reproduces the progress Chromium computes for `cubic-bezier(x1, y1, x2, y2)`, so a seeked canvas or Node scene can share a CSS curve.
- Exclusions: `steps()` and `linear()`, Firefox and WebKit, durations other than 1000 ms, a CSS transition capture diffed pixel for pixel, other machines.
- Official documentation: https://github.com/gre/bezier-easing and CSS Easing Level 2; checked 2026-11-27.
- Environment: macOS 26 arm64; Node 22.19.0; resvg for the plot.
- Input: six curves in `curves.mjs` (four CSS keywords, Material 3 emphasized decelerate, one overshoot curve with y above 1).
- Output: ignored `output/` (`report.json`, `curves.svg`, `curves.png`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: for each curve, over 101 samples of t in [0, 1], max |library - Chromium| is at most 0.002; endpoints are exactly 0 and 1; the overshoot curve peaks above 1. Chromium's value is read by pausing a WAAPI animation of `margin-left` 0 to 1000px at `currentTime = t * 1000` and dividing the computed style by 1000.
- Stop if any curve exceeds the tolerance (the lead says the match may not be exact) or if the plot shows the two lines diverging.

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`. All six curves were within tolerance; the largest difference was 5e-6 (overshoot-back), the rest below 7e-7, which is float precision, not a visible gap. Endpoints 0 and 1; overshoot-back peaked at 1.098. The 660x440 plot was inspected: library (solid) and Chromium (dashed red) coincide, and the overshoot curve rises above the unit box as expected. This covers Chromium on one machine, not other engines.
