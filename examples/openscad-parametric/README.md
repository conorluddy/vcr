# openscad-parametric fixture

## Intent and scope

Claim: one parametric `part.scad` (a 40x30x10 block with a 5 mm radius through-hole, `$fn=128`) exports headlessly, with `-D` overrides, to STL, 3MF, SVG (2D `projection()`) and a PNG with a fixed camera. STL volume is checked against the analytic value of the inscribed-128-gon hole, on both the Manifold (default) and CGAL backends, for the default parameters and for `-D width=50 -D depth=20 -D height=8 -D holeRadius=7`. Determinism is checked honestly per format.

Tool: OpenSCAD 2026.10.11 snapshot (`brew install --cask openscad@snapshot`, user-approved), GPL-2.0 with a linking exception per the lead; `openscad` is on PATH. Checker: `trimesh==5.2.2` and `numpy==2.5.5` in `output/venv` (python3.12), built by `run.sh`. Lead: `prospects/inbox/2026-11-24-discovery.md`.

Exclusions: GUI, `--animate`/`$t`, libraries such as BOSL2, other formats (OFF, DXF, PDF), colour, PNG across other versions or colour schemes, other OS.

## Plan, before running

Predeclared checks (all in `expected/checks.json`):
- Manifold and CGAL STL: watertight, winding consistent, bounds equal the parameters, volume relative error < 1e-9 against analytic.
- Two STL exports seconds apart are byte-identical; two 3MF exports are byte-identical; two PNGs are byte-identical.
- SVG viewBox is 42x32 (40x30 plus 1 mm margin) with 2 contours.
- PNG is 400x300.
Stop condition: a missing `openscad` stops with the install command.

## Observation, after running

2026-11-27, macOS arm64, 2026.10.11:
- Manifold STL passes every check. STL, SVG and PNG are deterministic.
- KNOWN FAIL: 3MF is not byte-identical: `CreationDate` metadata and random `p:UUID` values change per run. Vertex and triangle counts (264, 528) are stable.
- KNOWN FAIL: CGAL STL volume differs from analytic by 3.4e-9 relative (above the predeclared 1e-9). It is watertight with the same bounds and face count; likely ASCII rounding. The check stays at 1e-9.
- PNG inspected at 400x300: a yellow block with a visible hole, correct framing. Colours depend on version and colour scheme.
- Manifold flag: `--backend Manifold|CGAL` exists, and Manifold is the default. `--render 1` is needed for a full-geometry PNG (`--render` without a value was rejected when joined with `=`).

Does not establish: other platforms, other versions, GUI-free rendering without a display on other hosts, animation, quality of PNG for delivery.
