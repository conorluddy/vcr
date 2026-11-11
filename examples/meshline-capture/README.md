# MeshLine capture

Fixture for `three-meshline`: THREE.MeshLine (`three.meshline` 2.0.0, the original spite package) drawing thick camera-facing lines in a Three.js scene, captured frame by frame with transparency.

Status: validated on macOS arm64, 2026-11-11 (see Observation). The Intent and Plan sections were written before the first run.

## Intent and scope

- Tool ID and version: `three-meshline`, `three.meshline@2.0.0` (pinned exactly; the pmndrs fork `meshline` is not used). Peer `three@0.186.1` (pinned exactly, the same version `three-capture` uses).
- VCR job and exact claim being tested: THREE.MeshLine thick camera-facing lines, built with `MeshLine` plus `MeshLineMaterial` and set with `lineWidth`, `color`, animated `dashOffset`, `visibility` and rebuilt point positions, all set from `t` and rendered once per seek; 90 alpha frames at 1280x720, 30 fps; shuffled-order capture equals sequential capture.
- Explicit exclusions: no claim about the pmndrs fork, R3F, raycasting (`MeshLineRaycast`), fog, textures (`map`, `alphaMap`), `sizeAttenuation: 0` (pixel-width lines), or any visual quality judgement beyond the contact sheet. Only Chromium headless on macOS arm64 with the WebGL path Playwright provides; no other GPU or browser is covered.
- Determinism: `src/THREE.MeshLine.js` was grepped for `Math.random`, `performance.now` and `Date.now`; none appear, so no MeshLine feature is excluded on that ground. The three.js core build does contain `Math.random` (UUIDs) and `performance.now` (Clock), but this scene reaches neither for pixels. The scene uses only math from `t`.
- Seek behaviour: each `seek(t)` rebuilds the ring's points, the dash offset, the colour, the visibility and the transform from `t` alone. Nothing steps state across calls, so a jump from frame 0 to frame 89 renders the same as walking there.
- Tool documentation and licence: https://github.com/spite/THREE.MeshLine and https://registry.npmjs.org/three.meshline. Licence MIT (read from the registry `license` field and the package LICENSE file). Checked 2026-11-11.
- Environment: macOS 26 arm64 (Darwin 25.6.0), Node 22.19.0, Chromium via Playwright (version recorded in the capture report).
- Input: none. Every shape is procedural, defined in `scene.html`.
- Dependencies and installation plan: `three.meshline@2.0.0` and `three@0.186.1` added to this example's `package.json` only, then `pnpm install`. No other install.
- Workspace and output paths: `examples/meshline-capture/output/` (ignored). Recorded expectations go in `expected/summary.json`.

## Plan, before running

- Commands: `examples/meshline-capture/run.sh --record`, then `examples/meshline-capture/run.sh`.
- Versions: three@0.186.1, three.meshline@2.0.0, Playwright and tsx as resolved by the workspace, Node 22.19.0.
- Library wiring: importmap maps bare `three` to `./node_modules/three/build/three.module.js`; the scene imports `./node_modules/three.meshline/src/THREE.MeshLine.js` by relative path.
- Scene: transparent WebGL canvas, three lines: a closed trefoil with dashes sliding along it (dashOffset); a tilted orbit ring with a tapered width whose points are rebuilt per seek; a three-turn spiral revealed by `visibility`.
- Predeclared checks (all must hold for PASS):
  1. Frame count is 90 (3 s at 30 fps).
  2. Every frame is 1280x720.
  3. At least two distinct frame hashes (the scene must actually change over time). Recorded count is reported.
  4. Shuffled-order capture equals sequential capture (`shuffled_matches_sequential` true, no mismatched frames).
  5. Alpha on middle frame 45: minimum 0 (transparent background present) and maximum 1 (opaque line cores present).
  6. The recorded `expected/summary.json` matches the run exactly.
- Stop conditions: any page error in the capture log, a three.meshline import failure, or a WebGL shader compile error stops the run and is reported as `blocked` or `fail` with the error text. A determinism mismatch is a `fail`, not a retry.
- Visual inspection: a six-frame contact sheet (frames 0, 15, 30, 45, 60, 75) built with ImageMagick from `output/frames` into `output/contact.png`, read with the image viewer. A blank, clipped or line-free sheet is a `fail` regardless of hashes.
- Reproduction: `examples/meshline-capture/run.sh`; the contact sheet is at `examples/meshline-capture/output/contact.png` after the run.

## Observation, after running

- Date and executor: 2026-11-11, agent run in worktree `agent-aa60025dec5373be6`.
- Versions: three@0.186.1, three.meshline@2.0.0, Playwright 1.64.1 (via `@vcr/capture`), Chromium 156.0.8078.4 (launched by Playwright; the capture report does not carry the browser version, so this was read separately from the same Playwright install), tsx 4.23.15, Node v22.19.0, ImageMagick 7.1.2-15.
- Host: `Conors-MacBook-Pro-2.local`.
- Commands: `run.sh --record` then `run.sh`. The second run printed `meshline-capture: OK (18.84 fps, 90 distinct hashes)`. Capture mode was the screenshot route.
- Checks: 90 frames; 1280x720; 90 distinct hashes; shuffled order matches sequential; frame 45 alpha min 0, max 1; `expected/summary.json` diff clean.
- Contact sheet: `output/contact.png` (frames 0, 15, 30, 45, 60, 75, 3 columns by 2 rows, 1920x720). Seen: a transparent background with three distinct MeshLine strokes over a mid-grey backing. A green dashed trefoil turns slowly, its dashes visibly shifting between frames; an orange ring tilts with a visibly tapered stroke (widest mid-arc, the left side at frame 0, and thin as it approaches the edge-on pose at frame 75); a blue spiral draws itself in from nothing at frame 0 to its full three turns by frame 75. Lines are clean, unclipped and not blank.
- Deviations from the plan: the first `--record` attempt exited early because the alpha-stats `read` failed on ImageMagick's output without a trailing newline, and the first contact sheet came out 640x360 because `-flatten` used the 1280x720 page geometry; both were fixed in the example's own script and sheet command before the recorded run. The first contact sheet is not kept.
- Determinism notes: the `three.meshline` source has no `Math.random`, `performance.now` or `Date.now`. A grep of the three.js core build, done after the run, found `Math.random` (UUID generation) and `performance.now` (Clock); the scene reaches neither for pixels.
- What this result does and does not establish: MeshLine geometry and MeshLineMaterial, with width, colour, dash animation, visibility reveal and per-seek point rebuilds, render alpha frames deterministically through the capture route in headless Chromium on macOS arm64. It does not cover the pmndrs `meshline` fork, raycasting, `sizeAttenuation: 0`, textures, fog, other GPUs or browsers, or a visual quality judgement beyond the contact sheet.
- Tween-style state: none. Every value in `renderAt(t)` is recomputed from `t`; the ring points are rebuilt per seek.
