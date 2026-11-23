# glMatrix camera projection

Status: validated on macOS arm64, 2026-11-23 (gl-matrix 3.4.4, Node v22.19.0). Plan written before the first run; see the observation below.

## Intent and scope

- Tool: glMatrix (`gl-matrix` npm package), pinned to 3.4.4 (npm latest on 2026-11-23, MIT).
- Claim: in Node, gl-matrix builds a perspective x lookAt view-projection matrix that projects five known 3D points to the predeclared clip/NDC coordinates within 1e-6, and repeated runs produce byte-identical JSON output.
- Exclusions: WebGL or WebGPU rendering and any shader; a double-precision build (the default `Float32Array` is what is tested); other depth conventions (zero-to-one depth, left-handed); quaternion and slerp camera paths; matrix routines beyond perspective, lookAt, multiply and transformMat4; browsers; other operating systems or architectures; any claim that the projection is right for a real renderer.
- Documentation and licence: https://glmatrix.net/ and https://github.com/toji/gl-matrix (MIT, per the catalogue card; checked 2026-11-23 against the npm package metadata).
- Environment: macOS arm64, Node 22.19.0, default Float32 arrays, no GPU involved.
- Input: no media. The camera and five points are constants in `project.ts`, written for this fixture, no external rights.
- Dependencies and side effects: `gl-matrix@3.4.4` and `tsx` in this example's `package.json`, installed by `pnpm install` at the workspace root. No network use during the run. Writes only `output/` (ignored) and `expected/` on `--record`.

## Plan, before running

- Commands: `pnpm install` at the workspace root, then `./run.sh --record`, then `./run.sh`.
- `run.sh` runs `project.ts` twice, writing `output/projection.json` each time, and compares the two runs with `cmp`. It then diffs `output/projection.json` against `expected/projection.json`.
- Camera: eye (2, 1.5, 6), target (0.5, 0.25, 0), up (0, 1, 0), vertical fov 60 degrees, aspect 16/9, near 0.1, far 100. The gl-matrix path is `mat4.perspective` and `mat4.lookAt`, combined with `mat4.multiply(projection, view)`, then `vec4.transformMat4` and division by w.
- Points (world space): lookAt-target (0.5, 0.25, 0); origin (0, 0, 0); right-of-origin (1, 0, 0); back-upper-left (-1, 1, -1); front-low-right (2, -1, 1). All lie in front of the eye.
- Analytic reference, hand-written in `project.ts` without gl-matrix: forward = normalise(target - eye); right = normalise(forward x up); trueUp = right x forward; for each point with offset = p - eye, viewX = offset . right, viewY = offset . trueUp, depth = offset . forward (positive in front). Then NDC x = (f / aspect) * viewX / depth, NDC y = f * viewY / depth, NDC z = -A + B / depth, where f = 1 / tan(fov / 2), A = (far + near) / (near - far), B = 2 far near / (near - far).
- Predeclared checks:
  1. The lookAt target projects to NDC x = 0 and y = 0 (within 1e-6), from the analytic side and the gl-matrix side.
  2. Every point has clip w > 0 (in front of the camera) from gl-matrix.
  3. For all five points, gl-matrix NDC (x, y, z) differs from the analytic NDC by at most 1e-6 per component. A larger error throws and exits non-zero; the tolerance is not widened.
  4. Two runs produce byte-identical `projection.json` (`cmp`).
  5. `output/projection.json` equals `expected/projection.json`, which holds the view-projection matrix, every clip and NDC value, the analytic NDC, the per-point maximum error, the tolerance and the gl-matrix and Node versions.
- Expected failure modes: Float32 rounding may push the maximum error above 1e-6. If so the result is fail or partial and the tolerance is not changed. An install problem or a gl-matrix export change is a stop condition.
- Inspection: no media. Read `expected/projection.json`; check the target row is 0, 0 and the maximum error is below 1e-6.

## Observation, after running

- 2026-11-23, Conors-MacBook-Pro-2.local, macOS arm64. Versions: gl-matrix 3.4.4 (the package's own `package.json`, read by `project.ts`), Node v22.19.0, tsx 4.23.15. Playwright and Chromium are not used by this example.
- Commands: `./run.sh --record`, then `./run.sh`. The record run and the check run each invoke `project.ts` twice, so four invocations in total; the two outputs were byte-identical each time (`cmp`), and the check printed `glmatrix-camera-projection: OK (gl-matrix 3.4.4, node v22.19.0, max NDC error 5.3987633696905846E-8)`.
- The `expected/projection.json` sha256 was `e45595bce9ac7911380eb64b04ab14e59bcef2032fa90fde4543b605da895cde`, equal to both `output/run-1.json` and `output/projection.json` after the check run.
- Measured: the look-at target projects to NDC (0.0, 4.7e-9, z 0.9702731) against an analytic (0, 0, 0.9702731). Maximum absolute NDC error over the five points was 5.4e-8 (back-upper-left), against the 1e-6 tolerance. Per-point errors were 7.5e-9, 6.2e-9, 6.8e-9, 5.4e-8 and 2.0e-8. All five points had clip w between 5.2 and 7.5, so all were in front of the camera.
- No deviation from the plan. The tolerance was not changed. The default Float32 arrays were used throughout.
- Inspection: no media. Read `expected/projection.json` directly, which holds the view-projection matrix, the clip and NDC values, the analytic reference and the per-point error.
- What this establishes: on this machine and with gl-matrix 3.4.4 under Node 22, `mat4.perspective`, `mat4.lookAt`, `mat4.multiply` and `vec4.transformMat4` produce a view-projection whose NDC for five points agrees with an independent closed-form reference to better than 1e-7 in this fixture, and repeated runs are byte-identical.
- What it does not establish: WebGL or WebGPU rendering, any shader, double-precision builds, other depth conventions or handedness, quaternion or slerp paths, other platforms, or the suitability of the projection for a real renderer. The analytic reference checks the matrix maths, not the render pipeline.
- Reviewer and follow-up: none recorded. Revisit if gl-matrix changes its `perspective` or `lookAt` depth convention, or after an upgrade past 3.4.4; the expected file would then need deliberate re-recording.
