# three-vrm capture

Status: validated on macOS arm64 (Conors-MacBook-Pro-2.local), 2026-11-24: three-vrm 3.6.0, three 0.186.1, Chromium 156.0.8078.4, Playwright 1.64.1, Node v22.19.0. Pass with the scope in "Observation, after running". The sections below are the plan written before the first run, followed by what was observed.

## Intent and scope

- Tool: `three-vrm` (npm `@pixiv/three-vrm` 3.6.0, MIT), with `three` 0.186.1 and `playwright` through `@vcr/capture`.
- VCR job and claim: `three-vrm` loads a VRM 1.0 model in a Three.js scene, reads its meta (name, licence), poses a humanoid bone (right upper arm) and an expression (`blink`) as pure functions of seek time t; seeked frames at predeclared times match between shuffled and sequential capture and differ between poses; spring bones are disabled (`springBoneManager.update` is never called, so they keep their loaded pose).
- Explicit exclusions:
  - Spring-bone simulation is not exercised. It is disabled, not advanced from t.
  - No lookAt, no lip-sync visemes (`aa`, `ih`, ...), no VRMA animation files, no first-person view.
  - No VRM 0.x files, one model only, no MToon outline or alpha-blend fidelity claim, no pixel-accurate comparison to a reference render.
  - Not a claim about other tools routed through the model, nor about any browser other than the capture route's Chromium.
- Pose and expression are rebuilt from t on every call: the arm is `smoothstep(t)` from rest to 1.0 rad over [0, 1] s then held; `blink` is a triangle of half-width 0.1 s peaking at 1.5 s. No state is stepped, so a single jump from any time to any other gives the same result.
- Sources and terms:
  - Library: https://github.com/pixiv/three-vrm (licence MIT, read on npm 3.6.0 `LICENSE`, checked 2026-11-24). Registry `latest` tag is 3.6.0, newer than the 3.5.5 stable named in the tool card.
  - Model: `VRM1_Constraint_Twist_Sample.vrm` from pixiv/three-vrm at commit `5a3242b66124386c32b085c6693d9059040e72e5` (the last commit touching the file). Not in the npm package, so it is downloaded at run time into the git-ignored `output/vrm/` and is not committed. Its embedded VRMC_vrm meta says `allowRedistribution: true`, `licenseUrl: https://vrm.dev/licenses/1.0/`, `authors: ["pixiv Inc."]`, `commercialUsage: "corporation"`, `modification: "allowModificationRedistribution"`. Checked 2026-11-24.
  - three: MIT.
- Environment: macOS 25.6 (Darwin) arm64 on Apple Silicon, Chromium from the capture route (recorded in the observation), no GPU driver beyond the browser's WebGL.
- Input: the model is pixiv's sample above, verified by sha256 `12c2b97e95e700783a6a550dc0eee2d7880aeedccef9ae67bc4c5a2f0f2631a2` (10776032 bytes, read by hand on 2026-11-24). Scene and probe are original code.
- Dependencies and installation: `@pixiv/three-vrm` 3.6.0 and `three` 0.186.1 pinned exactly in `package.json`, installed with `pnpm install` at the repository root. The browser build is loaded via an import map (`three`, `three/addons/`, `@pixiv/three-vrm`) to `./node_modules/...`; no bundler. Network is needed once to fetch the model; the URL and sha256 are in `run.sh`.
- Unseeded features: grep of `three-vrm.module.js`, `three.module.js` and `GLTFLoader.js` for `Math.random`, `performance.now`, `Date.now` returned 0 matches for each. The scene uses no clock and no random.
- Workspace and output: `examples/three-vrm-capture/output/` (ignored). Expected results: `expected/summary.json` and `expected/probe.json` only, no media.

## Plan, before running

Commands:

```text
pnpm install                                   # repo root, once
examples/three-vrm-capture/run.sh --record     # downloads model if absent, captures, probes, records
examples/three-vrm-capture/run.sh              # must print three-vrm-capture: OK
```

Versions: three 0.186.1, @pixiv/three-vrm 3.6.0, playwright via `@vcr/capture` (version recorded at run time), Chromium from the capture report, Node 22.19.0 via tsx 4.23.15.

Capture: 1280x720, 30 fps, duration 3 s, 90 frames, `verifyDeterminism: true` (sequential capture, then shuffled capture, compared frame by frame).

Probe (`probe.ts`): opens the same scene and reads `window.__scene.meta` plus `window.__scene.probe(t)` at t = 0, 1.0, 1.5 and 2.5 s. Values are rounded to 6 decimal places.

Predeclared checks (any failure makes the result `fail`; the expected files are the reference):

1. Model: sha256 of `output/vrm/VRM1_Constraint_Twist_Sample.vrm` equals the recorded hash. Meta read in the page: `name` = `VRM1_Constraint_Twist_Sample`, `metaVersion` = `1`, `licenseUrl` = `https://vrm.dev/licenses/1.0/`, `allowRedistribution` = `true`, `authors` = `["pixiv Inc."]`.
2. Pose: normalized `rightUpperArm` angle (quaternion angle to identity) is 0 at t = 0 and 1.0 rad (to 1e-6) at t = 1.0, 1.5 and 2.5. Right-hand raw bone world position at t = 0 and t = 1.0 differs by at least 0.3 m.
3. Expression: `blink` value is 0 at t = 0 and 2.5, and 1.0 at t = 1.5 (exact).
4. Spring bones: declared disabled. The probe reports `springBoneManagerPresent` (expected true); nothing in the scene calls `springBoneManager.update`. This is a declaration checked by reading the code, not an assertion about the physics.
5. Frames: 90 frames at 1280x720; `shuffled_matches_sequential` = true.
6. Hashes at predeclared frames 0000 (rest, blink 0), 0030 (t = 1.0, arm up, blink 0), 0045 (t = 1.5, arm up, blink 1), 0075 (t = 2.5, arm up, blink 0). Predicted: at least 2 distinct hashes; frame-0030 equals frame-0075 (identical state); frame-0045 differs from frame-0075; frame-0000 differs from frame-0030.
7. Blink-only change: the pixel difference (`magick compare -metric AE`) between frame-0045 and frame-0075 is greater than 0 and less than the difference between frame-0000 and frame-0030.
8. Alpha: frame-0030 corner pixel (0,0) has alpha 0, and its alpha maximum is 1 (some opaque pixels, not an all-transparent frame).

Contact sheet: frames 0000, 0015, 0030, 0045, 0060, 0075 (the template's `magick` recipe adjusted to 90 frames). Inspect before recording; a blank, clipped or unposed figure is `fail` whatever the hashes say.

Stop conditions:
- Model sha256 mismatch: `blocked` (the model is not the one predeclared), no expected files written.
- Missing model URL (network): `blocked`.
- Capture or probe throws: `fail` with the error.
- Any predeclared check fails: `partial` if only checks 4, 7 or the hash expectations differ and the rest holds; otherwise `fail`.

Reproduction: `run.sh`; inspect `output/contact.png`, `output/probe.json` and `output/summary.json`. The contact sheet is built by hand, not by `run.sh`:

```text
cd output/frames && magick \( frame-0000.png frame-0030.png +append +repage \) \( frame-0045.png frame-0075.png +append +repage \) -append +repage -background '#808080' -flatten -resize 50% ../contact.png
```

## Observation, after running

Date and executor: 2026-11-24, Claude agent in the VCR worktree `agent-afa086cf3e494b024`, branch from `main`.

Versions and environment:
- three 0.186.1 (exact pin), @pixiv/three-vrm 3.6.0 (exact pin, MIT; pulls @pixiv/three-vrm-core, -springbone, -materials-mtoon, -node-constraint, -materials-v0compat and -materials-hdr-emissive-multiplier at 3.6.0).
- Playwright 1.64.1 (via `@vcr/capture`), Chromium 156.0.8078.4 (from the Playwright runtime at `~/.vcr/runtime`; the capture report does not record it), Node v22.19.0, tsx 4.23.15.
- macOS (Darwin 25.6.0), Apple Silicon, hostname `Conors-MacBook-Pro-2.local`. The WebGL backend was not queried.
- Model: `VRM1_Constraint_Twist_Sample.vrm` downloaded once at run time from commit `5a3242b66124386c32b085c6693d9059040e72e5` to `output/vrm/`, 10776032 bytes, sha256 `12c2b97e95e700783a6a550dc0eee2d7880aeedccef9ae67bc4c5a2f0f2631a2` (matches the predeclared hash). Not committed. Licence per its own VRMC_vrm meta: `licenseUrl` https://vrm.dev/licenses/1.0/, `allowRedistribution` true, `authors` ["pixiv Inc."], `commercialUsage` "corporation", `modification` "allowModificationRedistribution", `version` v1.0.1, `copyrightInformation` "(c) 2022 pixiv Inc.".

Commands and history:
1. First `run.sh --record`: checks 1 to 10 passed; check 11 (blink-only) failed and check 12 (alpha) did not run. Check 11 failed because of my own parse bug: ImageMagick prints `107.988 (0.000117175)` and jq could not compare that string. Fixed by keeping the first token only. The threshold was not changed.
2. The same first pass exposed a framing defect in my scene: the camera at (0, 1.25, 3.4) clipped both feet at the bottom edge of the 1280x720 frame (seen at full size in frame 0045). The camera was moved to (0, 0.82, 3.92) looking at (0, 0.82, 0). No predeclared check or threshold was changed. The probe values are world-space and unaffected by the camera, so they were not re-derived.
3. Second `run.sh --record`: all twelve checks passed; `expected/summary.json` and `expected/probe.json` written. Contact sheet built from the four check frames (0000, 0030, 0045, 0075) in a 2x2, not the six-frame layout listed in the plan.
4. `run.sh` without `--record`: all checks passed and it printed `three-vrm-capture: OK (11.91 fps)`. The recorded frame hashes reproduced exactly.

Measured results:
- Capture: 90 frames, 1280x720, `shuffled_matches_sequential` true (`output/report.json`, empty `mismatched_frames`).
- Probe (`expected/probe.json`): meta name `VRM1_Constraint_Twist_Sample`, metaVersion 1, version v1.0.1, licence URL above. Right upper arm angle 0, 1, 1, 1 rad at t = 0, 1.0, 1.5, 2.5 s. Right-hand world position (-0.543094, 1.27423, -0.025098) at t = 0 and (-0.343338, 0.908579, -0.025098) at t = 1.0 s, a distance of about 0.417 m. Blink weight 0, 0, 1, 0 at t = 0, 1.0, 1.5, 2.5 s. `springBoneManagerPresent` true at every time.
- Frame hashes (sha256): frame 0000 `3bdd87a2…`, frame 0030 `68b133d0…`, frame 0045 `afe51c0e…`, frame 0075 `68b133d0…` (equal to 0030, as predicted).
- Pixel differences (ImageMagick AE): blink only, frame 0045 vs 0075, 82.0137 pixels; arm raise, frame 0000 vs 0030, 5449.1 pixels.
- Alpha, frame 0030: corner (0,0) alpha 0, alpha maximum 1.

Inspection at intended scale (`output/contact.png`, 1280x720 sheet, grey-flattened): the figure is a complete full-body VRM with shoes visible, not clipped. Frame 0000 shows the T-pose with eyes open. Frame 0030 has the character's right arm (viewer's left) lowered about 57 degrees, eyes open. Frame 0045 has the same lowered arm with eyes closed, the blink. Frame 0075 has the lowered arm and eyes open again, matching frame 0030. The figure occupies roughly a third of the frame height; the hair and clothing look static, as expected with spring bones disabled. Blink is visible but small in pixel terms (82 pixels), so this is evidence of the expression, not of a high-quality facial change.

Result: pass, on the predeclared checks, with the scope recorded in `catalog/tools/three-vrm.json`.

What this establishes:
- three-vrm 3.6.0 loads a VRM 1.0 file in three 0.186.1 through an import map and GLTFLoader, and exposes its meta.
- Humanoid right-upper-arm pose and the `blink` expression are set from t with the library's `humanoid.update()`, `expressionManager.update()` and `nodeConstraintManager.update()`, and the rendered frames change accordingly, with the same frames under sequential and shuffled capture and across repeated runs on this host.
- Spring bones are disabled by construction (`springBoneManager.update` is never called); the joints keep their loaded pose.

What this does not establish:
- Spring-bone physics, lookAt, lip-sync visemes, VRM 0.x, other models, other OS or GPU backends, quality of MToon shading or outlines, or pixel-level agreement with a reference render.
- Cross-host frame-hash stability: hashes are recorded for this host only.
- The licence of any other model; only this one was read.

Reviewer, decision, follow-up and invalidation: recorded in the catalogue entry. Revisit if three-vrm changes its update order (`VRM.update`), the VRM sample changes at the pinned commit (the sha256 gate catches this), or Chromium's WebGL output changes enough to alter the frame hashes.
