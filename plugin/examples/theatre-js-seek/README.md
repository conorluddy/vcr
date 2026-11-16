# Theatre.js committed state and seeking

## Intent and scope

- Tool/version: `@theatre/core` 0.7.2.
- Claim: load the owned `state.json`, set `sheet.sequence.position` to declared times, and read the keyed/interpolated `x` property, including a non-keyframe midpoint and out-of-order seeks.
- Excludes: Studio editing/export, browser rendering, UI integration, React/Three adapters, easing curves beyond the selected default handles, playback timing, and visual output.
- Official sources: [@theatre/core API](https://www.theatrejs.com/docs/latest/api/core), [project state manual](https://www.theatrejs.com/docs/latest/manual/projects), [sequence manual](https://www.theatrejs.com/docs/latest/manual/sequences). Core is Apache-2.0; checked 2026-11-16.
- Environment: macOS 26.6 arm64, Node and npm versions recorded after the run. The package is isolated to this example with `package-lock.json`.
- Input: original minimal Theatre project state with one numeric track, keys `(0, 0)` and `(2, 10)`, and symmetric handle values; no external assets.

## Plan, before running

- Run `./run.sh --record`, then `./run.sh` again. Load `state.json` via `getProject('Fixture Project', {state})`, create the matching sheet/object, and seek in order `[2, 1, 0, 1.5, 0.5, 1]` seconds.
- Assert keyed values at 0 and 2 seconds are 0 and 10; midpoint at 1 second is 5 within 0.001; intermediate values at 0.5 and 1.5 seconds are strictly between the endpoints and monotonic; returning to 1 second yields 5 again.
- Retain numeric JSON only. Stop if state fails to load, a declared time returns invalid values, the midpoint is outside tolerance, the interpolation is not monotonic, or shuffled seeks disagree.

## Observation

- Ran 2026-11-16 on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64, Node 25.6.1, npm 11.9.0, `@theatre/core` 0.7.2. Values were x(0)=0, x(0.5)=2.5, x(1)=5, x(1.5)=7.5, x(2)=10; shuffled sequence [2,1,0,1.5,0.5,1] and repeated x(1) matched.
- Result: pass for loading one owned numeric keyframe track and seeking its runtime values. Does not establish Studio authoring/export or any browser/render integration.
