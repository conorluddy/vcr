# glslify bundle of an npm GLSL module

Status: plan written before the first run; see the observation section below.

## Intent and scope

- Tool: glslify (`glslify` npm package), pinned to 7.1.1 (npm latest on 2026-11-24, MIT). Its CLI is the route under test.
- Module: `glsl-easings` 1.0.0 (npm latest on 2026-11-24, MIT, Robert Penner's easing functions as glslify modules), imported as `glsl-easings/cubic-in-out`. The module defines `float cubicInOut(float t)`.
- Claim: `pnpm exec glslify input/main.frag` inlines the `#pragma glslify: cubicInOut = require(glsl-easings/cubic-in-out)` import into one self-contained shader string; the output contains the module's function, no `#pragma glslify` or `require(` remains, the output compiles as GLSL ES 1.00 in a headless WebGL context, and bundling twice is byte-identical.
- Exclusions: the numerical correctness of the easing curve (the fixture checks that the code compiles, not that it returns Penner's values); other glslify routes (Node API, bundler transforms, glslify-loader); other GLSL dialects (WebGL2 or GLSL ES 3.00); other GPUs and drivers; the `glsl-easings` module's own behaviour; any render or pixel output. The compile check uses one headless Chromium WebGL1 context with SwiftShader and says nothing about native drivers.
- Documentation and licence: https://github.com/glslify/glslify and https://www.npmjs.com/package/glslify (MIT, checked 2026-11-24 via npm metadata). https://github.com/hughsk/glsl-easings and the npm package `glsl-easings` (MIT, the module's LICENSE.md, checked 2026-11-24).
- Environment: macOS arm64, Node 22.19.0, Playwright and Chromium from the workspace's existing `packages/capture` dependency.
- Input: `input/main.frag`, a small shader written for this fixture (no external rights involved). The easing module comes from npm under its MIT licence.
- Dependencies and installation: `glslify@7.1.1` and `glsl-easings@1.0.0` plus `tsx` in this example's `package.json`, installed by `pnpm install` at the workspace root. No global installs. Playwright is not added as a dependency of this example: `check.ts` loads it from the workspace's `packages/capture` package, which already declares it at an exact pin.
- Network: none during the run. The compile check opens a `page.setContent` page with no external URLs.
- Writes: `output/` (ignored) and `expected/report.json` on `--record`.
- glslify is slow-moving (last npm release 2024-12-29). The fixture is a point-in-time check of the 7.1.1 release.

## Plan, before running

- Commands: `pnpm install` at the workspace root, then `./run.sh --record`, then `./run.sh`.
- `run.sh` runs the glslify CLI twice on `input/main.frag` (stdout to `output/bundle-1.frag` and `output/bundle-2.frag`) and compares them with `cmp`. It then runs `check.ts`, which writes `output/report.json`, and diffs that against `expected/report.json`.
- `check.ts` predeclared checks:
  1. The bundle contains `float cubicInOut(float t)` (the module's function definition, found by its signature).
  2. The bundle contains no `#pragma glslify` line (count 0).
  3. The bundle contains no `require(` (count 0).
  4. The bundle is longer than the input, and the input has exactly one `#pragma glslify` import (precondition, so the check is meaningful).
  5. Compile, headless Chromium WebGL1 (`getContext("webgl")`, must be non-null), vertex shader plus fragment shader, `COMPILE_STATUS` must be true for the bundle.
  6. Control A: the raw input (with the pragma, no bundling) must fail to compile, since `cubicInOut` is undeclared. This shows the bundle step is doing the work.
  7. Control B: the bundle with the `gl_FragColor` line's terminating semicolon removed must fail to compile. This shows the compile check can detect a broken shader.
  8. `output/bundle-1.frag` and `output/bundle-2.frag` are byte-identical (`cmp` in `run.sh`).
  9. `output/report.json` equals `expected/report.json`. The report holds the bundle sha256 and byte and line counts, the boolean check results, and the exact glslify and glsl-easings pins. It holds no timestamps, hostnames or driver logs.
- Expected artifacts: the bundle text and its log stay in `output/` (ignored). Only `expected/report.json` is committed. No media.
- Expected failure modes and stop conditions: if the glslify CLI cannot resolve `glsl-easings/cubic-in-out`, the result is fail and the failure is reported, not papered over. If WebGL is unavailable in headless Chromium, the compile check is blocked for that route, and the result cannot be pass. If `packages/capture`'s Playwright is missing after `pnpm install`, stop and report blocked.
- Reproduction: `./run.sh`. Inspect with `cat output/bundle-1.frag`, and `cat output/report.json`.

## Observation, after running

- 2026-11-24, Conors-MacBook-Pro-2.local, macOS arm64, executed by the Claude agent in the VCR worktree. Versions: glslify 7.1.1 (CLI in `node_modules/.bin`), glsl-easings 1.0.0, Playwright 1.64.1 (loaded from the workspace's `packages/capture`), Chromium 156.0.8078.4 headless, Node v22.19.0. WebGL1 came from ANGLE on SwiftShader (no GPU); no browser flags were needed.
- Commands: `./run.sh --record`, then `./run.sh`. The second run printed `glslify-bundle: OK`.
- Measured: bundle 283 bytes, 16 lines, sha256 `c2bf0c821ef6785703f207f72f5b412f274fd2291b1f14cc16d9ad9a170973a5`. The input had 1 `#pragma glslify` import; the bundle has 0 pragmas and 0 `require(` calls and defines `float cubicInOut(float t)`. The CLI also injects `#define GLSLIFY 1`.
- Compile results: the bundle compiled with an empty log. Control A, the raw input with the pragma, failed (`'cubicInOut' : no matching overloaded function found`). Control B, the bundle with the colour line's semicolon removed, failed (`syntax error`). The two bundle runs were byte-identical.
- Deviations from the plan, all in the harness and none in the predeclared checks: the bundles were written with `-o` rather than stdout; the byte comparison lives in `check.ts` (`bundlesByteIdentical`) rather than `cmp` in `run.sh`; and the compile logs were added to `output/environment.json` after the first record run, for inspection only.
- Inspection: no frames or media. `output/bundle-1.frag` was read directly and is a single fragment shader with the easing function above `main`. No contact sheet applies.
- Not checked, and not claimed: the numerical output of `cubicInOut`. Reading the source, the module evaluates `pow(2.0 * t - 2.0, 3.0)` for `t >= 0.5`, which has a negative base; GLSL ES 1.00 leaves `pow` with a negative base undefined. This is from reading the code only and was not tested on any GPU, so easing values from this module should be checked with a readback before use.
- What this establishes: on this machine with glslify 7.1.1, a `require()` pragma from glsl-easings 1.0.0 is inlined into one GLSL ES 1.00 fragment shader with no pragmas left, that compiles in headless Chromium WebGL1 under SwiftShader, and two bundles from the same input are byte-identical.
- What it does not establish: numerical correctness of the easing, the Node API route, the glslify bundler transforms, WebGL2 or GLSL ES 3.00, native GPU drivers, or any rendered output.
- Reviewer and follow-up: none recorded. Revisit on a glslify release after 7.1.1 (last published 2024-12-29), a change to glsl-easings, or if a scene uses `cubicInOut` for values. Native driver compile would need a separate run.
