# build123d product-part fixture

## Intent and scope

Plan recorded 2026-10-31 before execution. Test build123d 0.13.0 creating a
60 × 40 × 12 mm part with 4 mm vertical-edge fillets and an off-centre 6 mm
through-hole at (15, 0). This original synthetic fixture uses no external assets.
Export GLB, STEP and an SVG projection; separately test GLB import in Blender
4.4.0, world-space size, axis orientation, triangle winding and tessellation.
No Three.js, material fidelity, animation, other versions or shared adapter claim.

Official sources checked 2026-10-31:
- https://build123d.readthedocs.io/en/stable/import_export.html
- https://build123d.readthedocs.io/en/stable/objects.html
- https://github.com/gumyr/build123d/blob/v0.13.0/pyproject.toml
- https://github.com/gumyr/build123d/blob/dev/LICENSE

Project code is Apache-2.0. Native Open Cascade bindings and other dependencies
retain separate terms; this fixture does not redistribute their binaries.
Existing Blender is GPL-3.0. Dependency distribution rights are not certified.

## Installation and side effects

build123d is absent from system Python 3.12.2. User approved an isolated
environment at `.cache/build123d-fixture/venv`, pinning build123d 0.13.0.
pip downloads and transitive dependencies stay within `.cache/build123d-fixture`.
No global packages or sibling projects change. Network access to package indexes
is required. Platform wheel availability and download size are unknown until
resolution; stop on incompatible dependencies rather than changing the pin.
Generated artifacts and logs go to this example's ignored `output/` directory.
Remove these two ignored directories to clean up the fixture and environment.

## Plan, before running

Run `./run.sh` with `BUILD123D_PYTHON` pointing at the approved environment.
The script does not install anything. Retain `pip freeze`, platform details,
source hashes and output hashes in output alongside JSON measurements.

Predeclared checks:
- One valid CAD solid; dimensions 60 × 40 × 12 mm within 0.000001 mm.
- Volume `((60*40 - (4-pi)*4**2) - pi*3**2)*12` within 0.0001 mm³.
- STEP reimport preserves volume within 0.0001 mm³.
- SVG parses as XML, has visible geometry and nonzero bounds.
- Fine GLB uses 0.05 mm linear / 0.1 rad angular deflection; coarse uses
  0.5 mm / 0.5 rad. Fine export must contain more triangles.
- Imported world bounds are 0.060 × 0.040 × 0.012 m within 0.0001 m.
- Positive signed mesh volume, within 1% of analytic solid volume; finite,
  nonzero triangle normals and no degenerate triangles.
- Hole orientation survives import: a vertical ray at (0.015, 0) m misses;
  a control ray at (-0.015, 0) m hits.
- Render an 800 × 600 transparent Workbench PNG and visually inspect the hole,
  rounded corners and shading. No byte-identical image assertion.

Stop on failed assertions, import errors or missing dependencies; retain logs.
No baseline is rewritten to hide a failure. A pass covers only this original
part and the observed machine. Catalogue validation remains pending maintainer
review. Revisit on export, dependency or Blender changes.

## Observation

Executed 2026-10-31 by Codex on Conors-MacBook-Pro-2.local, macOS 26.6
(Darwin 25.6.0), arm64, Python 3.12.2, build123d 0.13.0,
cadquery-ocp-novtk 8.0.1.1.0 and Blender 4.4.0 (05377985c527).
Blender Workbench used the Metal backend; GPU model/driver was not separately
recorded. Machine availability was probed with the existing runDoctor API into
`environment/build123d-fixture.json`; global Python was not changed.

**Observed pass, pending maintainer review.** Final `./run.sh` exited 0.
- CAD dimensions: 60 × 40 × 12 mm. Analytic volume: 28295.89378290154 mm³;
  observed 28295.893782901545 mm³. Valid single solid; STEP roundtrip passed.
- SVG: 24 visible edges, 14 hidden edges; visible-only projection exported,
  parsed and had a nonzero viewBox.
- Blender: coarse 232 triangles / 250 vertices, fine 1032 / 1050.
  Fine world dimensions: 0.05999999866 × 0.04000000283 × 0.01200000755 m.
  Positive signed volume differs from CAD volume by 0.000348%.
- Both imports passed finite nondegenerate triangles, normals agreeing with
  winding (dot > 0.5), offset-hole miss ray and solid control hit ray.
  These checks do not establish watertightness for arbitrary assets.
- PNG: 800 × 600 RGBA, alpha spans 0–255. Codex visually inspected the still:
  rounded vertical corners, the offset hole and smooth side shading are visible,
  with no obvious missing faces or inverted surfaces at this view.

Retained measurements and SHA-256 hashes are in `expected/`; the fully resolved
Python package set is `requirements.txt`. These are observed evidence, not
byte-exact golden outputs: STEP headers, logs and GPU rendering may vary.
Full GLBs, STEP, SVG, PNG, logs, caches and a fresh hash manifest stay in ignored
`output/`. The source hashes identify the final run. Do not copy new outputs over
these evidence snapshots without explicit review of what changed.

Reproduce after approved installation: create a Python 3.12 environment under
`.cache/build123d-fixture/venv`, install `-r examples/build123d-product/requirements.txt`
using repository-local pip caching, then run `examples/build123d-product/run.sh`.
Outside this repository set `BUILD123D_PYTHON` explicitly. The script installs
nothing and uses factory startup to avoid loading user Blender add-ons.

Execution deviations: initial sandbox network access failed, then approved
escalated pip installation succeeded; a prematurely started run before pip
finished failed to import build123d. The first sandboxed Blender invocation
crashed during Metal device detection before executing Python. Running with
GPU access outside the sandbox succeeded. The runner now scopes ezdxf/IPython/
Matplotlib caches to output; a first import had attempted an unwritable user
cache. Installation plus pip cache occupies approximately 946 MB locally.

This establishes this build123d → GLB → Blender geometry path and the scoped CAD,
STEP and SVG checks only. No Three.js import, PBR fidelity, animation, general
geometry repair or adapter has been tested. Catalogue and example validation
states remain unchanged pending maintainer review. Reviewer and promotion
decision: pending. Revisit on version/environment or export changes.
