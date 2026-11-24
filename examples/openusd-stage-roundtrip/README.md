# OpenUSD stage round trip fixture

## Intent and scope

VCR job and exact claim: usd-core (Pixar OpenUSD Python bindings) authors a stage in
Python containing an Xform, a Cube, a Sphere, a material binding, a time-sampled
translate animation over predeclared frames, and stage metadata `metersPerUnit` and
`upAxis`. It saves `.usda` and `.usdc`, reopens both, and reads back identical prim paths,
attribute values, time samples and stage metadata. `usdchecker` from the usd-core package
reports no errors, and the `.usda` output is byte-identical across runs.

Tool: OpenUSD, Python package `usd-core`, pinned `26.11` (latest on PyPI at 2026-11-24,
per `pip index versions usd-core`). Catalogue record: `catalog/tools/openusd.json`
(candidate, `checked_at` 2026-11-24).

Explicit exclusions:
- No rendering. usd-core ships no imaging or Hydra renderer, so no image, lighting,
  material shading or viewport output is produced or judged. The `UsdPreviewSurface`
  network is authored and read back as data only. 3D is not a creative pillar.
- No composition arcs beyond the single layer: no references, payloads, variants,
  sublayers, instancing or overs are authored or checked.
- Formats: `.usda` (text) and `.usdc` (binary) only. No `.usdz`, no `.usd` dispatch,
  no other USD release. `.usdc` bytes are not claimed to be identical across runs; their
  SHA-256 is recorded for information and is not gating.
- No interchange with other applications (Blender, glTF Transform, Houdini, Maya and
  others). No schema beyond the core typed schemas listed in the plan.
- `usdchecker` checks the general USD rules only. The `--arkit` consumer profile is not run.
- Determinism is observed on this machine only, with one Python build and one usd-core build.
- Not established: behaviour of usd-core on other platforms, other Python versions, or any
  other OpenUSD release.

Licence and documentation sources, checked 2026-11-24:
- https://openusd.org/ (documentation; reachable on the check date).
- https://github.com/PixarAnimationStudios/OpenUSD/blob/dev/LICENSE.txt. The text is the
  Tomorrow Open Source Technology License 1.0, which the file says differs from Apache 2.0
  only in its Trademarks section (section 6). The file also says that USD bundles Draco and
  Roboto fonts, which are Apache 2.0. The bundled fonts and Draco are not exercised here.
- Installed `usd-core` 26.11 wheel metadata: `License: LicenseRef-TOST-1.0`, with the same
  licence text under `licenses/LICENSE.txt` (checked after installation, see observation).
  Redistribution of the wheel is not part of this fixture.
- Maintenance status: the catalogue record marks it unknown; this run does not change that.

Environment: macOS (Darwin 25.6.0), arm64, Python from pyenv (3.12.2, see the observation
section). No GPU, no network use beyond the one-time `pip install`.

Input: none from outside the repository. The stage is authored by `stage_roundtrip.py`
from literal values. No USD file is committed.

Dependencies and installation plan (approved for this fixture only):
- `examples/openusd-stage-roundtrip/output/venv`, created with the pyenv Python 3.12 (or
  `/opt/homebrew/bin/python3.12` if the pyenv one lacks `venv`), then
  `output/venv/bin/python -m pip install -r requirements.txt` (`usd-core==26.11`). Nothing else
  is installed; nothing is installed system-wide.
- Network access to PyPI, for installation only.
- The venv and all outputs live under `output/`, which is git-ignored.
- Cleanup: remove `examples/openusd-stage-roundtrip/output`.

Selected workspace and output: `examples/openusd-stage-roundtrip/output/` (git-ignored).
Committed: this README, `example.json`, `requirements.txt`, `stage_roundtrip.py`, `run.sh`,
`expected/checks.json`. No `.usda`, `.usdc` or other media file is committed.

## Plan, before running

Install:
```
cd examples/openusd-stage-roundtrip
python3 -m venv output/venv
output/venv/bin/python -m pip install -r requirements.txt
```

Commands:
```
examples/openusd-stage-roundtrip/run.sh            # runs the script twice, diffs against expected/
examples/openusd-stage-roundtrip/run.sh --record   # only after a deliberate change
```

`stage_roundtrip.py OUTPUT_DIR` does, in order:
1. Creates `OUTPUT_DIR/stage.usda` and sets stage metadata: `metersPerUnit = 0.01`,
   `upAxis = "Y"`, `defaultPrim = "World"`, `startTimeCode = 0`, `endTimeCode = 24`,
   `timeCodesPerSecond = 24`.
2. Authors prims: `/World` (Xform), `/World/Cube` (Cube, `size = 2.0`), `/World/Sphere`
   (Sphere, `radius = 0.5`, static `xformOp:translate = (0, 3, 0)`), `/World/Looks` (Scope),
   `/World/Looks/RedMat` (Material) with `/World/Looks/RedMat/PreviewSurface` (Shader,
   `UsdPreviewSurface`, `inputs:diffuseColor = (1, 0, 0)`).
3. Binds `RedMat` to `/World/Cube` with `UsdShade.MaterialBindingAPI`.
4. Authors `/World/Cube` `xformOp:translate` as a time-sampled Vec3d at frames
   {0, 6, 12, 18, 24} with value `(2 * frame, 0, 0)`, i.e. (0,0,0), (12,0,0), (24,0,0),
   (36,0,0), (48,0,0).
5. Exports the in-memory stage to `stage.usda`; the same stage is written as `stage.usdc`.
6. Reopens `stage.usda` and `stage.usdc` and builds a JSON summary of each: every prim
   path with type name; every attribute with name, type and default value; every time
   sample of every time-sampled attribute; every relationship target; and the stage
   metadata above. The summary built from the in-memory authored stage is the third one.
7. Evaluates the translate at the five frames in the fixed order (24, 0, 18, 6, 12) and
   records them, to compare with the sequential read.
8. Runs `usdchecker` from the usd-core install on both files and records exit status and
   output.
9. Writes `OUTPUT_DIR/checks.json` (summaries, every check, SHA-256 of each file) and exits
   1 if any gating check is false.

Predeclared checks (all gating; fixed before running):
- G1 Prim paths and types equal exactly the list in step 2 (plus the pseudo-root), read back
  from both `.usda` and `.usdc`.
- G2 Attribute values equal the authored values in step 2 (cube size 2.0, sphere radius 0.5,
  sphere translate (0,3,0), diffuseColor (1,0,0)), read back from both files.
- G3 Stage metadata equals step 1 exactly (`metersPerUnit` 0.01, `upAxis` Y, `defaultPrim`
  World, start 0, end 24, timeCodesPerSecond 24).
- G4 `/World/Cube.xformOp:translate` has time samples exactly {0, 6, 12, 18, 24} with the
  values in step 4, read back from both files.
- G5 `/World/Cube` has a `material:binding` relationship targeting exactly
  `/World/Looks/RedMat`, read back from both files.
- G6 Round trip: the reopened `.usda` summary, the reopened `.usdc` summary and the in-memory
  authored summary are equal as JSON (exact float equality; no tolerance).
- G7 `usdchecker` on `stage.usda` and on `stage.usdc`: exit status 0, and no output line
  containing `error` (case-insensitive). If the `usdchecker` executable is absent from the
  venv, G7 is not run and the result is at most `partial`. The system `/usr/bin/usdchecker`
  (an Apple-shipped binary) is not a substitute and is not credited.
- G8 Time samples read in the fixed shuffled order (24, 0, 18, 6, 12) equal the sequential
  read at the same times.
- G9 Rerun byte-identical: `run.sh` runs the script into `output/run-a` and `output/run-b`;
  `stage.usda` files are identical byte for byte (`cmp`), `checks.json` files are identical,
  and `run-a/checks.json` equals `expected/checks.json`.

Not applicable: frame count, dimensions, alpha and the rendered shuffled-frame check. There
are no frames; the claim is stage data.

Expected failure modes and stop conditions:
- `pip install` fails, or `from pxr import Usd` fails: stop, keep the log, report `blocked`.
- A gating check fails: the expected file is not rewritten to hide it. Result `fail`, or
  `partial` if only G7 (usdchecker absent or not clean on one file) or G9's `.usdc` reading
  fails, with the failing check named.
- A reopened file returns fewer prims or time samples than authored: a G1/G4/G6 failure, not
  a skip.
- Non-identical `.usda` reruns: a G9 failure, reported as such.

Inspection: `output/run-a/checks.json` lists every measured value; `output/run-a/summary.txt`
gives one line per prim (path, type, attribute count, time-sample count). No picture is
produced, so no contact sheet is made. The sanity read is text, and the claim is judged on the
diffed values.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (Darwin 25.6.0, arm64), from
`examples/openusd-stage-roundtrip`.

Versions:
- usd-core 26.11 from PyPI (`requirements.txt`, `output/dependencies.txt`). `Usd.GetVersion()`
  reports `0.26.11`, the OpenUSD release the wheel was built from.
- Python 3.12.2 (pyenv, `output/venv` symlinked to it). The homebrew 3.12 was not needed.
- Node 22.19.0 ran only the catalogue commands. Playwright, Chromium and ImageMagick are not
  used by this fixture.

Commands: `run.sh --record`, then `run.sh` (which printed `openusd-stage-roundtrip: OK`
and the G7 not-run line on stderr). Both runs are from scratch: `output/run-a` and
`output/run-b` are regenerated each time.

Installation: `python3 -m venv output/venv`, then `pip install -r requirements.txt`, which
installed only `usd-core==26.11` (the freeze lists no other package). The wheel has no
dependencies and ships no `usdchecker` executable and no `UsdUtils` compliance checker
class in this build (`dir(UsdUtils)` has no `ComplianceChecker`). The wheel licence is
`LicenseRef-TOST-1.0`.

Measured (from `output/run-a/checks.json`, identical to `output/run-b/checks.json`, and to
`expected/checks.json`):
- G1 prim types, read back from `.usda` and `.usdc`: `/World` Xform, `/World/Cube` Cube,
  `/World/Sphere` Sphere, `/World/Looks` Scope, `/World/Looks/RedMat` Material,
  `/World/Looks/RedMat/PreviewSurface` Shader. Pass for both.
- G2 attribute values: cube size 2.0, sphere radius 0.5, sphere translate (0, 3, 0),
  diffuseColor (1, 0, 0). Pass for both.
- G3 stage metadata: metersPerUnit 0.01, upAxis Y, defaultPrim World, start 0, end 24,
  timeCodesPerSecond 24. Pass for both.
- G4 translate time samples at frames 0, 6, 12, 18, 24 are (0, 12, 24, 36, 48) in x. Pass for
  both.
- G5 material binding of `/World/Cube` targets `/World/Looks/RedMat`. Pass for both.
- G6 reopened `.usda`, reopened `.usdc` and the in-memory authored summary are equal as JSON.
  Pass.
- G7 `usdchecker`: not run. The executable is absent from the usd-core install. The system
  `/usr/bin/usdchecker` exists on this machine (an Apple-shipped binary), but it is not
  usd-core's, so it was not run and is not credited.
- G8 time samples read in the order (24, 0, 18, 6, 12) equal the sequential read. Pass.
- G9 rerun byte-identical: `stage.usda` identical by `cmp`; `checks.json` identical;
  `run-a/checks.json` equal to `expected/checks.json`. `output/rerun.diff` is empty. Pass.
- SHA-256 of `stage.usda` in both runs: `c57805a9cbf6e01244adb3f168bcfa0e8cd3ec026c5a0f41505108a341f11966`.
  SHA-256 of `stage.usdc`: `3cd7a337e1f2d43655e9c397df08245dedd68921d893040573e664681a260749`
  (informational; `.usdc` determinism is not claimed).

Inspection: there are no frames, so no contact sheet. The text was read directly:
`output/run-a/stage.usda` has the authored `defaultPrim`, `metersPerUnit`, `upAxis`, the
Cube with `material:binding` and the five translate samples (0, 12, 24, 36, 48 in x at frames
0, 6, 12, 18, 24), the static Sphere translate, and the `UsdPreviewSurface` shader with
diffuseColor (1, 0, 0) and an unconnected `outputs:surface` token. This matches the plan. Nothing
was rendered, so the surfaces, colour and lighting were not seen.

Deviations and limitations:
- Before anything was recorded, the first `--record` run failed inside the script because
  `json_value` had no case for `VtVec3fArray` (`xformOpOrder` is a token array, the time
  sample arrays are not). The fix makes `json_value` iterate any sequence. No expected value
  or tolerance changed; the plan's checks are the same.
- The `.usda` and `.usdc` files come from `Sdf.Layer.Export` of an in-memory stage, not from
  `Usd.Stage.Export`. This was chosen to avoid a source-file comment that could carry the
  output path; that choice was not separately tested.
- G7 is not run, so the claim "`usdchecker` reports no errors" is not established. The result
  is partial for this reason alone.

Pass / partial / fail: **partial**. Predeclared G1 to G6, G8 and G9 pass on this machine.
G7 cannot run because usd-core 26.11 does not ship `usdchecker`, which the plan allowed for
(result at most partial).

What this establishes: usd-core 26.11 on macOS arm64 with Python 3.12.2 authors this stage,
writes `.usda` and `.usdc`, reads both back with the same prim paths, types, attribute values,
time samples, relationship targets and stage metadata, and writes byte-identical `.usda` text
across two runs.

What it does not establish: the `usdchecker` compliance result; any rendering, lighting or
material shading (usd-core has no imaging renderer); composition arcs; interchange with other
applications; `.usdc` byte identity; other platforms, Python builds or OpenUSD releases; the
licence position for redistribution of the wheel.

Reviewer, follow-up and revisit triggers: revisit when usd-core ships `usdchecker`, or when a
documented installation route for OpenUSD's own checker is adopted (then G7 can be run as
predeclared, with its own version recorded). Revisit on any usd-core release or on a licence
change in the wheel. The catalogue maintenance status is unchanged.

Cleanup: remove `examples/openusd-stage-roundtrip/output` (venv of about 246 MB, stages, logs).
