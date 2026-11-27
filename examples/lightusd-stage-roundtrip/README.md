# lightusd stage round trip fixture

## Intent and scope

Claim: lightusd 1.0.0 (PyPI wheel) authors, in Python, a stage with an Xform, a Cube, a Sphere, a
`UsdPreviewSurface` material with a binding, a time-sampled translate at frames {0, 6, 12, 18, 24}
and stage metadata, and saves it as `.usda`, `.usdc` and `.usdz`. lightusd reloads all three and
usd-core 26.11 (the Pixar bindings, a reader here) opens all three; the six reads agree.

Same stage as `examples/openusd-stage-roundtrip`, so the two tools can be compared.

Exclusions: no rendering and no usdchecker; no composition (references, payloads, variants,
sublayers); no assets inside the USDZ (only `root.usdc`); no `import_obj`, `import_urdf`,
`import_mjcf`, MaterialX, Physics or the WASM/npm package; `.usdc` bytes are not claimed stable;
one machine, one Python build.

Sources (checked 2026-11-27): https://pypi.org/project/lightusd/ (1.0.0, Apache-2.0, Python >=3.11),
https://github.com/lighttransport/LightUSD. usd-core is used only as an independent reader; its
licence is TOST 1.0 (see the openusd record) and is not exercised beyond reading.

Environment: macOS arm64, Python 3.12.13 (`python3.12`). Network only for `pip install`.
Install, done by `run.sh` itself when `output/venv` is missing: `python3.12 -m venv output/venv`,
then `pip install -r requirements.txt` (lightusd 1.0.0, usd-core 26.11; no other
package). Everything lives in the git-ignored `output/`; cleanup is removing it.

## Plan, before running

Commands: `./run.sh` (twice-run, diff against `expected/checks.json`); `./run.sh --record` only for
a deliberate change.

Predeclared checks (all gating), applied to each of the six reads (lightusd and usd-core on each
format):
- G1 prim paths and type names equal the six authored prims.
- G2 values: cube size 2, sphere radius 0.5, sphere translate (0, 3, 0), diffuseColor (1, 0, 0).
- G3 metadata: metersPerUnit 0.01, upAxis Y, defaultPrim World, start 0, end 24, 24 per second.
- G4 translate time samples exactly at 0, 6, 12, 18, 24 with x = 2 * frame.
- G5 `material:binding` targets exactly `/World/Looks/RedMat`.
- G6 all six read summaries are equal as JSON.
- G7 reads in the order 24, 0, 18, 6, 12 equal the sequential values.
- G8 the `.usdz` has every entry stored (not compressed) and the first entry's data begins on a
  64-byte boundary, as the USDZ packaging rules require.
- Rerun: `.usda` and `.usdz` byte-identical across two runs; `checks.json` identical and equal to
  `expected/checks.json`.

Stop conditions: install or import fails: blocked. A failing gating check stays failing: the
expected file records it, `run.sh` prints `KNOWN FAIL`, and the evidence is partial; checks are
not loosened.

## Observation, after running

Run 2026-11-27 on Conors-MacBook-Pro-2.local (Darwin 25.6.0 arm64), Python 3.12.13, lightusd
1.0.0, usd-core 26.11; numpy is not installed and was not needed.

- G1 to G8 all pass for all six reads. `run.sh` prints `lightusd-stage-roundtrip: OK`; no KNOWN FAIL.
- `stage.usdz` holds one entry, `root.usdc`, stored, data offset 0 mod 64.
- `.usda` sha256 31d30f1be39ad34ba6cd5fd6a774b956f42b6f397a7c5fb876d5b8bdd22d4e05, identical
  across runs; the `.usdz` is also byte-identical across runs.
- Inspection is textual (no picture exists): `Stage.export_usda()` text shows the authored layout
  with the five time samples and the `rel material:binding`.

Deviations: the first runs failed inside the script on API assumptions (`timesamples.times` is a
property, `default_prim` returns a Prim, not a name); checks unchanged.

Establishes: lightusd 1.0.0 on macOS arm64 writes three formats that its own loader and usd-core
read identically, deterministically. Does not establish: usdchecker or ARKit compliance, Quick Look
opening the USDZ, rendering, composition arcs, packaged textures, conversion routes, other
platforms or versions, or `.usdc` byte stability.
