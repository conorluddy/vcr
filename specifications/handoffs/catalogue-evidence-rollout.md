# Handoff: catalogue evidence rollout

Get every catalogued tool to an honest evidence state: validated, partial, failed or explicitly blocked, with a guide wherever evidence passed. This is a dynamic workflow. Each session reads the live catalogue, picks the next wave, runs it and records progress here. It never works from a fixed list.

Started 2026-11-05. Read `AGENTS.md`, then this file. ADR 0005 covers recommendation policy and licences.

## Trigger

Paste this to start or resume a session:

> Read `specifications/handoffs/catalogue-evidence-rollout.md` and run the next wave. Use agent teams in worktrees, and follow the merge protocol exactly. When the wave is merged, update the progress log and stop.

For a scheduled cloud run, use the same prompt with "Linux runner" added. Evidence scopes must then say Linux. Lane C needs Homebrew, so skip it there.

## 1. Read the state (never trust a list in this file)

```sh
# Catalogued tools still without evidence, with their automation route
jq -r '.resources[] | select(.tier=="catalogued" and .validation.status!="validated" and .validation.status!="partial")
  | "\(.id)\t\(.automation_route)\t\(.category)"' catalog/tools.json
# Validated tools still without a guide
jq -r '.resources[] | select(.validation.status=="validated" and (.skill==null)) | .id' catalog/tools.json
# Tools an earlier wave blocked or deferred (dated note starting "rollout-deferred")
jq -r '.resources[] | select(any(.notes[]?; startswith("rollout-deferred"))) | .id' catalog/tools.json
```

Check `gh pr list` for open `evidence/*` or `guides/*` branches first, and finish those before you start new ones.

## 2. Pick a wave

Wave size: 3 or 4 tools, one agent each. This Mac has 18 GB, and every browser agent runs Chromium. Order:

1. Validated tools without a guide. These are cheap, and one agent can write several guides in a single PR. Skip `playwright`: it is capture infrastructure, already documented by `start` and `examples/browser-capture`.
2. Lane A, then B, then C. Within a lane, prefer tools that other tools build on (for example `pixijs` before `pixijs-filters`, `react-three-fiber` before `drei`).
3. Never lane D without the user.

Lanes, by how the fixture runs. Classify any new tool by its card's `automation_route` and `install`. The examples are a starting guess.

| Lane | Route | Model it on | Examples |
| --- | --- | --- | --- |
| A, browser capture | Library or browser API seeked from `t`, captured by `@vcr/capture` | `examples/anime-capture`, `waapi-capture`, `canvas2d-capture` | pixijs, konva, two-js, paper-js, rough-js, pts, fabric-js, d3, svg-js, lottie-web, dotlottie, ogl, regl, twgl, babylon-js, playcanvas-engine, webgl, webgpu, tween-js, matter-js, rapier, three-meshline, troika-three-text, postprocessing, three-js-shading-language, theatre-js (runtime only) |
| A-react | Same, but scenes need React | `examples/three-capture` plus a bundler | react-three-fiber, drei, react-three-postprocessing, react-three-rapier, gl-react, motion, react-spring |
| B, Node and npm CLI | Node script or npm CLI, deterministic files | `examples/sharp-composite` | jimp, satori, opentype-js, gltf-transform, svgo, mermaid-cli, canvaskit-skia, mediabunny, ffmpeg-wasm, opencv-js, web-audio and tone-js (offline render, hash the PCM) |
| C, native CLI | Homebrew or pip binary on macOS | `examples/native-svg`, `ffmpeg-assembly` | graphviz, potrace, gifski, inkscape, g-mic, openimageio-oiiotool, msdfgen, vpype, vsketch, mlt-melt, pyscenedetect, rawtherapee-cli, manim-community, pov-ray, synfig, godot, opencolorio |
| D, needs the user | Paid app, account, licence decision or authored asset | — | after-effects, houdini, shotstack, aseprite (paid), rive-web (needs a `.riv`), remotion (company licence), hyperframes (reference only, not a dependency), gimp-batch, motion-canvas, canvas-sketch, ssam, canvas-record, ccapture-js (their own capture loops: decide whether VCR evidence means their recorder or ours), deck-gl and vtk-js (need data sets) |

## 3. Brief each agent

One agent per tool, `isolation: worktree`, background. Give each agent this brief and change only the tool id, the lane's model example and the claim:

> In this VCR worktree, run the `evidence` skill for `<id>` (read `skills/evidence/SKILL.md` and `catalog/FIXTURE-EVIDENCE-TEMPLATE.md`). Model it on `<example>`. Claim: `<one concrete job from the card>`. In-repo pinned installs are approved; anything system-wide (brew, pip) needs the user, so report it as blocked instead. Read `skills/start/references/determinism.md` before writing a browser scene. If shuffled order differs, bisect and report the cause; `run.sh` must fail on a mismatch. A failure is a valid result: record `partial` or keep `not-validated`, and write up what you found. If blocked, add a note to the record starting `rollout-deferred <YYYY-MM-DD>: <reason>` so later waves skip it. Branch `evidence/<id>`; link the example from every tool in its `tools` list; add a row to `examples/README.md`; run catalog build, plugin build, `pnpm validate && pnpm test`; commit on the tool branch without opening a separate PR; the coordinator integrates the wave. If evidence passed, also run the `guide` skill in the same PR. Report pass/partial/fail/blocked, the branch name, exact versions and findings in under 200 words.

## 4. Merge protocol (one integration branch per wave)

- Each agent commits its source changes and generated outputs on its own `evidence/<id>` branch. Do not open or merge separate tool PRs.
- Create one integration branch from current `origin/main`. Merge agent branches serially, preserving both source additions in list conflicts.
- Resolve generated-file conflicts by rebuilding from integrated sources, never by hand. After all branches are integrated, run `pnpm install`, `pnpm vcr catalog build`, `pnpm vcr plugin build`, then `pnpm validate && pnpm test`.
- Review AGENTS.md for stale facts. Append the wave progress row using counts from the rebuilt index, and open one wave PR.
- Require successful PR checks before squash-merging. Never pipe `gh pr checks` before testing its exit status: a pipe previously hid a red check.
- After merge, verify the resulting state, remove each worktree and delete merged local and remote branches. Never use `git add -A` from the main checkout while worktrees exist.

## 5. Stop and ask the user when

- A tool needs a system-wide install, a paid app, an account or a licence decision (lane D, and any AGPL, GPL or commercial tool before it becomes a dependency).
- A fixture needs committed media or fonts. Only redistributable assets go in, with the licence beside them, as in `examples/canvas2d-capture/fonts/OFL.txt`.
- A finding changes the shared harness (`packages/capture`) or a scene rule in `determinism.md`. Open an issue labelled `self-improvement` + `loop:docs-gap` or `loop:core-candidate`, or comment on an existing one.
- A card looks wrong: the tool is unmaintained, or a neighbour clearly supersedes it. That is an `ingest` re-assessment, not evidence work.

## 6. Lessons so far

- Pixels can differ by frame order while the DOM is identical. The cause is Chromium compositor layering, triggered by library-driven opacity animations (anime-capture, 2026-11-05). `will-change: transform, opacity` fixes it. It did not reproduce with native `element.animate()`.
- Recreate seeded randomness inside every draw call. `Math.random` failed all 90 frames in the canvas-2d control.
- Expose `window.__scene` only after fonts have loaded and `document.fonts.check()` passes.
- Native hashes are tied to library builds. Record both the tool and library versions (sharp plus libvips), and hash raw pixels before encoded bytes.
- A run that records a failing check as its expected value passes forever. Assert the invariant directly in `run.sh` as well as in the diff.
- The full test suite is slow on a loaded runner. Rerun a single failing test before you call it a regression.

## Progress log

Append one row per wave. Counts come from `catalog/INDEX.md` after the merge.

| Date | Wave | Tools (result) | PRs | Validated / guides after |
| --- | --- | --- | --- | --- |
| 2026-11-05 | 0 (pilot) | anime-js ✓, web-animations-api ✓, canvas-2d ✓, sharp ✓ | #106, #108–#110, #112 | 13 / 12 |
