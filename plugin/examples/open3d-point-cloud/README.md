# open3d point cloud fixture

## Intent and scope

VCR job and exact claim: open3d, through its Python API, (1) samples a predeclared number
of points from a mesh primitive (a sphere and a box); (2) voxel-downsamples the sample at a
predeclared size to a count within a predeclared ratio range of the analytic area over the
voxel area; (3) estimates normals that point outward, measured as the fraction with a
positive dot product against the radial vector; (4) reconstructs a mesh with Poisson
reconstruction whose bounding box matches the primitive within a predeclared tolerance;
(5) writes and reads PLY with identical point and mesh counts; (6) gives identical counts
and bounds on reruns with a fixed seed. An offscreen render of one image is attempted and
reported separately; it is not gating.

Tool: open3d, PyPI package `open3d`, pinned `0.20.0` (latest on PyPI at 2026-11-24 per the
catalogue candidate; requires Python >= 3.10; the macOS arm64 cp312 wheel exists).
Catalogue record: `catalog/tools/open3d.json` (candidate, `checked_at` 2026-11-24).

Explicit exclusions:
- No rendering claim. The offscreen render is attempted once; if it fails on this macOS
  machine it is recorded as "not exercised", and no visual claim is made.
- No GUI window and no `o3d.visualization.draw` path.
- No real-world scans, no registration (ICP), no tensor (`o3d.t`) API, no CUDA, no
  Jupyter, no ML modules.
- Only the sphere and box primitives. No user meshes, no external assets, no ply files from
  other tools.
- Normal orientation: open3d's consistent-tangent-plane propagation fixes coherence but
  not the global sign. The fixture sets the global sign by the median of the dot product
  with the radial vector, then negates all normals if that median is negative. The flip is
  reported in `checks.json` (`normals_flipped_to_outward`). The gate therefore tests
  coherence and local orientation quality, not the global sign choice.
- Poisson reconstruction only; ball pivoting is not exercised.
- Formats: PLY (binary) only. No OBJ, STL, PCD, XYZ or GLB.
- Determinism is claimed on this machine, with one Python and one Open3D build. Hashes of
  the PLY files are reported in `hashes.json` as information only; they are not gating.

Licence and documentation sources, checked 2026-11-24:
- https://www.open3d.org/ (documentation; the request returned HTTP 301 and was not followed further)
- https://github.com/isl-org/Open3D (repository)
- https://github.com/isl-org/Open3D/blob/main/LICENSE: read on 2026-11-24 via the raw file;
  the text is "The MIT License (MIT)". The installed `open3d` 0.20.0 metadata also reads
  License: MIT. Open3D bundles third-party code; dependency terms are not reviewed here and
  are not redistributed by this fixture.
- Maintenance status: the catalogue record marks it unknown; this run does not change that.

Environment: macOS (Darwin 25.6.0), arm64, Python 3.12.13 from Homebrew
(`/opt/homebrew/bin/python3.12`). No GPU; CPU only. No network use beyond the one-time
`pip install`.

Input: none from outside the repository. Both primitives are built in `open3d_checks.py`
with `o3d.geometry.TriangleMesh.create_sphere` and `create_box`.

Dependencies and installation plan (approved for open3d 0.20.0 only):
- `examples/open3d-point-cloud/output/venv`, created with `/opt/homebrew/bin/python3.12 -m
  venv`, then `output/venv/bin/python -m pip install -r requirements.txt`
  (`open3d==0.20.0`, plus whatever numpy version pip resolves, which is then pinned in
  `requirements.txt` before the record run).
- Nothing else is installed. Nothing is installed system-wide. No `.venv` is used.
- Network access to PyPI for installation only.
- The venv and all outputs live under `output/`, which is git-ignored.
- Cleanup: remove `examples/open3d-point-cloud/output`.

Selected workspace and output: `examples/open3d-point-cloud/output/` (git-ignored).
Committed: this README, `example.json`, `requirements.txt`, `open3d_checks.py`, `run.sh`,
`expected/checks.json`. No PLY, PNG or other media is committed.

## Plan, before running

Install (after creating the venv as above):
```
examples/open3d-point-cloud/output/venv/bin/python -m pip install -r examples/open3d-point-cloud/requirements.txt
```

Commands:
```
examples/open3d-point-cloud/run.sh            # runs the script twice, diffs both against expected/
examples/open3d-point-cloud/run.sh --record   # only after a deliberate change, then re-verify
```

`open3d_checks.py OUTPUT_DIR` does, for each of `sphere` and `box`:
1. Seeds open3d with `o3d.utility.random.seed(20261124)`, then samples
   `sample_points_uniformly(number_of_points=20000)`.
2. Voxel-downsamples the sample with `voxel_down_sample(0.05)`.
3. Estimates normals with `estimate_normals` (hybrid KD-tree, radius 0.25, max 30
   neighbours), then `orient_normals_consistent_tangent_plane(30)`, then the global sign
   rule above.
4. Reconstructs with `create_from_point_cloud_poisson(depth=8)` and removes the lowest 5 %
   of vertex densities.
5. Writes and reads back the point cloud and the reconstructed mesh as binary PLY.

Analytic values, derived before running:
- Sphere: radius 1, area 4π ≈ 12.566, bounds ±1 on each axis.
- Box: width 2, height 4, depth 6 (half-extents 1, 2, 3), area 2(8 + 24 + 12) = 88,
  bounds [-1, -2, -3] to [1, 2, 3].
- Expected voxel count, ignoring edge effects, is about area / 0.05² = 5026.5 (sphere) and
  35200 (box). The predeclared range is 0.8 to 2.5 times that, because an occupied voxel
  count depends on how the surface crosses the grid.
- Outward reference normal: p/|p| for the sphere; for the box, the sign of the coordinate
  with the largest |p_k| / h_k, along that axis.

Predeclared checks (all gating, per primitive; tolerances fixed before running):
- C1 `sample_count_exact`: exactly 20000 sampled points.
- C2 `voxel_count_within_ratio_range`: voxel count / (area / 0.05²) in [0.8, 2.5], and the
  voxel count does not exceed 20000.
- C3 `normals_radial_outward_fraction`: fraction of normals with positive dot product
  against the radial vector is at least 0.98.
- C4 `normals_analytic_alignment`: at least 0.9 of normals have |dot| with the analytic
  outward normal at least cos 25° (0.9).
- C5 `poisson_bounds_within_tolerance`: each bounding-box min and max is within 0.1 (absolute)
  of the analytic value.
- C6 `ply_point_count_identical`: the point-cloud PLY writes and reads back the same count
  (20000 minus nothing; the written count is the sampled count).
- C7 `ply_mesh_counts_identical`: the Poisson mesh PLY writes and reads back identical
  vertex and triangle counts.
- R1 reruns: `run.sh` runs the script twice into `output/run-a` and `output/run-b`;
  `checks.json` must be byte-identical between them, and `run-a/checks.json` must equal
  `expected/checks.json`. `checks.json` holds counts, rounded bounds and fractions; it
  holds no file hashes and no timestamps.
- Not gating: `hashes.json` (PLY SHA-256, informational) and `offscreen.json` (the render
  attempt).

Not applicable: frame count, image dimensions, alpha range and shuffled-order checks. There
are no frames in the gating path. The offscreen image, if produced, is reported as
attempted, not as validated pixels.

Expected failure modes and stop conditions:
- The venv cannot be created or `open3d==0.20.0` does not install: stop, report `blocked`.
  Do not substitute another Python package.
- An import error or non-zero exit from the script: keep the log, report `blocked` or `fail`.
- A gating check false: stop; the expected file is not rewritten to hide it. The result is
  `fail`, or `partial` if only the offscreen attempt or only the Poisson bounds fail, with
  the failing check named.
- Non-identical reruns: an R1 failure, reported as such.
- If `o3d.utility.random.seed` is missing in 0.20.0, the seed step fails with an error and
  the fixture is `blocked` for the seeded claim; it is not replaced by numpy seeding.

Inspection: `output/run-a/checks.json` lists every measured value, and the analytic values
above are compared against it by hand in the observation. `output/run-a/offscreen.json`
records whether the one-image render was attempted and what it returned.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (Darwin 25.6.0, arm64, Apple M3 Pro,
Metal backend), from `examples/open3d-point-cloud`. Versions: open3d 0.20.0 (`o3d.__version__`),
numpy 2.5.5, Python 3.12.13 (Homebrew, in `output/venv`). `output/dependencies.txt` is the
freeze of the venv; open3d pulls in its own dependencies (ipython, dash, plotly and others),
and none of them is imported by the script. Node v22.19.0 ran only the catalogue commands.
Playwright, Chromium and ImageMagick are not used.

Commands and what happened:
1. The first `run.sh --record` (before the offscreen fix) completed the checks; the offscreen
   render failed with `TypeError` on `setup_camera`: the bounding-box overload I used does not
   exist in 0.20.0. The fix changes only the offscreen call to `setup_camera(60, center,
   eye, up)`. No gate or tolerance was changed.
2. After the fix, `offscreen.json` reports `rendered` (640x480 PNG, Metal backend, no
   window). The image shows one shaded grey sphere on the default light background; the
   shading is correct and the shape is round. It is the primitive mesh, not the Poisson mesh.
3. `run.sh --record` exited 1 and wrote no `expected/`, because gate
   `box.voxel_count_within_ratio_range` is false. `run.sh` exited 1 likewise.
4. Rerun check (R1), run by hand with the same script into `output/run-b` because `run.sh`
   stops at step 3: `checks.json` differs from `run-a`. The point-cloud PLY SHA-256 hashes
   and all sampled, voxel, normal and point-count values are identical. The Poisson mesh is
   not: triangle counts 61704 vs 61703 (sphere: 114326 vs 114321), read-back counts
   the same, and one bound differs (sphere max z 0.999298096 vs 0.999298334). The Poisson
   PLY hashes differ.
5. Diagnostic, outside the gates: with `OMP_NUM_THREADS=1`, one of two runs aborted inside
   PoissonRecon (`FEMTree.IsoSurface` `Failed to close loop`, then `libc++abi: terminating`).
   The other single-thread run finished. Across the seven executions of the Poisson step on
   this machine, that abort happened once; its log is not kept in `expected/`.

Measured (from `output/run-a/checks.json`, reproduced in run-b except where stated):

| Check | Sphere | Box | Gate |
|---|---|---|---|
| C1 sampled points | 20000 | 20000 | exactly 20000: pass both |
| C2 voxel points at 0.05 | 5654 (ratio 1.125) | 15317 (ratio 0.435) | ratio in [0.8, 2.5]: sphere pass, **box fail** |
| C3 normals with dot(n, radial) > 0 | 1.0 | 1.0 | at least 0.98: pass both |
| C4 normals with |dot| ≥ 0.9 vs analytic | 1.0 | 0.9353 | at least 0.9: pass both |
| C5 Poisson bounds deviation | 0.00085 | 0.0277 | at most 0.1: pass both |
| C6 point-cloud PLY count | 20000 read back | 20000 read back | identical: pass both |
| C7 Poisson mesh PLY counts | 59198 v, 114325 f read back | 32088 v, 61703 f read back | identical: pass both |
| R1 rerun identical counts and bounds | point cloud identical; Poisson mesh differs | same | **fail** for the Poisson mesh |

Box Poisson bounds: min [-0.99915, -0.99948, -0.99977] per sphere; box max [1.01797, 2.01992,
3.01488], deviation 0.0277 from ±(1, 2, 3). Normals were not globally flipped on either
primitive (`normals_flipped_to_outward` false).

Why the box voxel gate fails. This is an error in my predeclared model, not a tool defect.
The model assumed roughly one occupied voxel per surface voxel. The box has about 35200 surface
voxels at 0.05 (area 88 over 0.0025), but only 20000 samples. Each surface voxel is hit with
probability about 1 − e^(−20000/35200) ≈ 0.43, so the expected count is about 15,260, which
matches the measured 15317. The sphere (about 5027 voxels) is saturated by the same 20000
samples, so its ratio is above 1. The gate was kept as predeclared and is not rewritten.

Inspection. The offscreen PNG (`output/run-a/offscreen-sphere.png`) was viewed directly: a
round, evenly shaded sphere with a soft shadow side at lower right, on a light grey
background. No frames were produced, so no contact sheet is made; the mesh geometry was
checked numerically, not seen. The Poisson meshes were not rendered.

Result: partial. Sampling counts, sphere voxel count, normal outwardness and quality, Poisson
bounds for both primitives, PLY point and mesh counts, point-cloud reruns, and one offscreen
render all pass. The box voxel count gate is false because the predeclared range was wrong. The
seeded-rerun claim fails for the Poisson mesh counts and one bound, and the Poisson step
aborted once in seven runs with one thread. `run.sh` exits 1, so the example is not validated
and no `expected/` is kept.

What this does not establish: determinism or crashes for other seeds, thread counts or
machines; Poisson depth or density trimming choices beyond depth 8 and the 5 % quantile; ball
pivoting; registration or other point-cloud operations; tensor (`o3d.t`) API; any colour or
rendered-pixel claim beyond one offscreen image on this Mac; the licence of open3d's
third-party dependencies.

Reviewer, follow-up and revisit triggers: the box voxel model needs a corrected predeclared
expectation (occupancy-based) before any re-run counts as a pass; the Poisson rerun failure
needs a thread-count or upstream fix, or a non-Poisson reconstruction, before the seeded
claim is re-tested; revisit on any open3d or numpy change.

Cleanup: remove `examples/open3d-point-cloud/output` (venv, exports, logs, PNG).
