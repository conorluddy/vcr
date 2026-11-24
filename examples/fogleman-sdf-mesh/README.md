# fogleman/sdf classic CSG mesh fixture

## Intent and scope

VCR job and claim: fogleman/sdf composes a predeclared signed-distance field,
the README's classic example `sphere(1) & box(1.5)` minus the three axis-aligned
`cylinder(0.5)` cuts, and writes a binary STL whose triangle count is non-zero,
whose bounding box matches the analytic bounds within a predeclared tolerance,
and which is watertight.

Tool: fogleman/sdf, Python package `sdf`, source-only (no PyPI release).
Pinned commit `d58a6fc63b75fc1cf1ebb71e0b42bf552319c8f1`
(2024-08-10, "store references to mesh sdf array, etc."). Package metadata
says version `0.1`, which is not a release.

Explicit exclusions:
- Only binary STL is tested. meshio formats (OBJ, PLY, VTK, ...) are not.
- OpenVDB (`sdf(...)` from a mesh, `pyopenvdb`) is not installed or tested.
- No other primitives, operators (smooth blends, twists, text, 2D) or
  `Mesh` transforms are tested.
- No printability, slicing or mesh-quality claim beyond edge-manifold
  watertightness. No claim about the minimality or visual quality of the mesh.
- Determinism is observed on this machine only; it is not a cross-machine claim.
- No seeded or time-varying content: the library's only clock use is verbose
  timing printed to stdout, not written into the STL.

Licence and documentation sources, checked 2026-11-24:
- https://github.com/fogleman/sdf (README; `LICENSE.md` is MIT, Copyright 2021 Michael Fogleman)
- Repository last commit 2024-08-10. Maintenance status remains unknown beyond that.
- Dependencies (matplotlib, meshio, numpy, scikit-image, scipy, Pillow) keep
  their own licences; this fixture does not redistribute them.

Environment: macOS (Darwin 25.6.0), arm64, Python 3.12.2 from pyenv, multi-threaded
`ThreadPool` in `sdf/core.py` (workers = CPU count). No GPU use.

Input: none. The shape is composed procedurally in `generate.py`; no external asset.

Dependencies and installation plan (approved):
- Clone `https://github.com/fogleman/sdf` at the pinned commit into
  `examples/fogleman-sdf-mesh/output/src` (git-ignored).
- Create `examples/fogleman-sdf-mesh/output/venv` (git-ignored) with the pyenv
  Python 3.12.2 and run `output/venv/bin/pip install -e output/src`. pip resolves the
  transitive dependencies from PyPI; the resolved set is written to
  `output/dependencies.txt` by `run.sh`.
- The clone and venv live under `output/` (the repository's ignored directory, and the
  one the plugin and validate scans skip) rather than dot-directories, which the scans
  would read as shipped media.
- Nothing system-wide; no global package or shell change. Network access to
  GitHub and PyPI is needed for installation only.
- Cleanup: remove `examples/fogleman-sdf-mesh/output` (venv, clone, STL and logs).

Selected workspace and output: `examples/fogleman-sdf-mesh/output/` (git-ignored).
Committed: this README, `example.json`, `run.sh`, `generate.py`, `check.py`,
`expected/checks.json`. No STL is committed.

## Plan, before running

Commands (after the install above):
```
examples/fogleman-sdf-mesh/run.sh            # generates twice, checks, diffs expected/
examples/fogleman-sdf-mesh/run.sh --record   # only after a deliberate change
```
`generate.py OUT` runs the README classic line verbatim with no `step`, `bounds`
or `samples` arguments: `f = sphere(1) & box(1.5); f -= cylinder(0.5).orient(X) | ... ; f.save(OUT)`.
The library's default resolution and bounds apply.

Predeclared checks (all gating unless marked informational):
1. Triangle count is greater than 0; STL byte length equals `84 + 50 * count`.
2. Bounding box of welded vertices equals `[-0.75, 0.75]` on each of x, y, z
   within 0.01 (about one default grid step; the step is printed in `output/generate.log`).
   The analytic bounds are: the box half-extent 0.75 is reached on each face
   at a point the cylinders do not remove, e.g. `(0.75, 0.6, 0)`, and the sphere
   (radius 1) does not clip the face centres.
3. Every vertex satisfies `|g| <= 0.01`, where `g` is an analytic composition
   written independently in `check.py`: sphere distance, Chebyshev box
   `max(|x|,|y|,|z|) - 0.75`, intersection by `max`, and subtraction of the
   union of infinite cylinders `max(f, -min(cx, cy, cz))`. This checks the
   written mesh against the predeclared SDF, not only its bounds.
4. Watertight: after welding vertices at 1e-6, every undirected edge is used by
   exactly two triangles, once in each direction. Zero boundary edges and zero
   non-manifold edges.
5. Determinism (recorded, not a pass condition): a second independent run of
   `generate.py` gives a byte-identical STL (`sha256`). Either result is recorded.
6. Informational: count of degenerate triangles after welding.

Expected failure modes and stop conditions:
- Import or install failure, or a non-zero exit from either generate run: stop, keep logs.
- Any gating check failing: stop. The baseline is not rewritten to hide a failure.
  A failure is reported as `fail` (or `partial` if only the watertight check fails,
  with the exact edge counts as scope).
- A nondeterministic second run is not a failure, but it is recorded and the
  scope will not claim reproducibility.

Inspection: `output/checks.json` lists every measured value. Because there are no
frames, the contact sheet is replaced by a three-view projection of the STL
(`output/inspect.png`, drawn from triangle centroids by a throwaway script kept
outside the repository). It is inspection only, not a gating check.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (macOS 26.6, Darwin 25.6.0, arm64),
from `examples/fogleman-sdf-mesh`. Versions: sdf at commit
`d58a6fc63b75fc1cf1ebb71e0b42bf552319c8f1`; Python 3.12.2; numpy 2.5.5;
scikit-image 0.26.0; scipy 1.18.1; meshio 5.3.5; matplotlib 3.11.2 and Pillow 13.0.0
(installed by sdf, used by neither `generate.py` nor `check.py`). Playwright, Chromium
and Node are not used. The full freeze is in `output/dependencies.txt` (ignored).

Commands: `./run.sh --record` then `./run.sh`. The second run printed
`fogleman-sdf-mesh: OK`. Each run calls `generate.py` twice, so the STL is
written twice per run.

Measured (from `output/checks.json`, identical in the record and verify runs):
- Triangles: 291028 (STL 14551484 bytes, length matches the count).
- Welded vertices 145506; undirected edges 436542; 3 × triangles = 2 × edges.
  Euler characteristic V − E + F = −8, consistent with a closed orientable surface of
  genus 5 (not separately verified).
- Bounds: min (−0.75, −0.75, −0.75), max (0.75, 0.75, 0.75); error 0.0 against the
  analytic bounds (tolerance 0.01). Default resolution step 0.0104847 (from
  `output/generate.log`).
- Largest |g| at a vertex: 0.002277 (tolerance 0.01).
- Watertight: 0 boundary edges, 0 non-manifold edges, 0 orientation conflicts,
  0 degenerate triangles.
- Determinism: two runs inside one `run.sh` gave byte-identical STL, and the record
  and verify invocations gave the same `sha256` 84c058c5c45ecc74f85c078cb859c544afcc02733ab7bc6c7b4c4edb3bc5d4b0.
  The library uses `ThreadPool.imap`, which keeps output in batch order, so
  byte identity is expected. It was observed here only, on one machine.

Checker correction before the record was kept: the first `--record` used an inverted
orientation test (`forward == backward`), which flagged every edge in a correct mesh.
The output showed 436542 conflicts, equal to the edge count, so the expression was
corrected to `forward != backward` before any expected file was kept. The predeclared
semantics (each edge used once in each direction) were not changed. The first
record was overwritten and never committed.

Inspection: `output/inspect.png` shows the three axis projections, with the sphere
clipping the box corners in all three views, a central bore through the Z view, and
shaded bands from the X and Y cylinder cuts. The speckle in the image comes from
plotting triangle centroids, not from the mesh.

Pass, on the predeclared checks: triangle count, STL length, bounds, composed-surface
residual, watertight. The result proves only that this composition at the library's
default resolution writes a closed, edge-manifold STL that matches the analytic
composed bounds, on this machine. It does not establish meshio formats, OpenVDB,
other primitives or operators, print quality, or cross-platform byte identity.

Reviewer, follow-up and revisit triggers: revisit on any sdf commit change, numpy or
scikit-image upgrade (the STL hash may change while the checks still pass), or a
different platform. The repository's last commit is 2024-08-10; maintenance is unknown.

Deviation: the first install used `.venv` and `.src` inside the example. The first
`pnpm validate` then read the venv's bundled media as plugin content (289 MiB) and
failed. Both were moved to `output/` and the venv was rebuilt there with the same
pinned commit. `expected/checks.json` was re-recorded from the rebuilt venv and gave
the same `stl_sha256`, so the measurements are unchanged. Earlier `.venv` paths in
this file are superseded by `output/venv`.

Cleanup: remove `examples/fogleman-sdf-mesh/output` (venv, clone, STL and logs).
