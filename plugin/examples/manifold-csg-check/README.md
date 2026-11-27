# Manifold mesh Boolean, checked numerically

## Intent and scope

- Tool/version: `manifold-3d` 3.5.5 (WASM, Apache-2.0), Node 22.19.0.
- Claim: `cube(2) - sphere(r 1.2, 64 segments)` is a watertight mesh whose volume is correct, and the same bytes come out on every run.
- Exclusions: Python `manifold3d`, glTF export, input meshes loaded from files, `smooth`/`refine`, multithreaded builds, timing.
- Official documentation: https://github.com/elalish/manifold and https://manifoldcad.org/jsdocs; checked 2026-11-27.
- Environment: macOS arm64; resvg for the still.
- Output: ignored `output/` (`metrics.json`, `mesh.json`, `view.svg`, `view.png`).

## Plan, before running

- `./run.sh --record`, then `./run.sh`.
- Assert from the raw `vertProperties`/`triVerts` arrays (not Manifold's accessors): every directed edge has exactly one opposite partner (0 unpaired, 0 repeated); signed tetrahedron volume equals `volume()` within 1e-6; Boolean volume algebra holds (V(A-B) = V(A) - V(A and B); V(A or B) = V(A)+V(B)-V(A and B)) within 1e-9; status `NoError`; metrics and mesh SHA-256 identical across two processes.
- Analytic volume (cube minus ball plus six caps) is reported, bounded at 2%: the 64-segment ball is smaller than the true ball.
- Look at the still. Stop if the shape is wrong.

## Observation

Executed 2026-11-27. The first draft bounded analytic error at 1% and failed at 1.364%. The cause is faceting (an inscribed polyhedron has less volume than the sphere, so the remainder is larger), not a Boolean fault. So the exact check became the inclusion-exclusion identity (residual 1.8e-15) and the analytic bound moved to 2% as context. The edge, volume and determinism checks were not loosened. Result: status NoError, genus 5, 812 vertices, 1640 triangles, volume 1.638331 (analytic 1.616284), 0 unpaired and 0 repeated edges. The 600x600 still shows a cube with a spherical cavity breaking through each face, as expected. Single-threaded WASM only.
