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

build123d is absent from system Python 3.12.2. Approval requested for an isolated
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

Not run yet; installation approval pending. Environment: macOS arm64; exact OS,
package versions and backend will be recorded by the run. Reviewer: pending.
