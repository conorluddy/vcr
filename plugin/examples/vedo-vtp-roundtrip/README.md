# Vedo VTP mesh round-trip evidence

## Intent and scope

- Tool ID and version/build: vedo 2026.6.3; fixture-local CPython 3.12.13 and the exact VTK version resolved by its pinned dependency lock.
- VCR job and claim: construct a small triangle surface with vedo, export it as VTK XML PolyData (VTP), reload it through vedo, and preserve its point/cell counts, bounds and point coordinates.
- Explicit exclusions: no rendering claim, no external mesh formats, no topology repair, no semantic attributes, no other OS/Python/VTK combinations.
- Documentation checked: https://vedo.embl.es/docs/ and https://github.com/marcomusy/vedo; official examples show `Mesh([vertices, faces])`; vedo is MIT-licensed, while dependencies retain their own terms.
- Environment: macOS arm64; CPython 3.12.13; VTK version captured by the fixture; no GPU or rendering backend exercised.
- Input: four authored vertices and two triangles, constructed directly in the fixture; no third-party assets.
- Dependencies and install plan: exact `vedo==2026.6.3` and hash-locked transitive dependencies in `requirements.lock`, installed with uv into `output/venv` using CPython 3.12.13. Network access is needed on first install; no global package install.
- Output and cleanup: generated VTP files and logs under ignored `output/`; retain only the compact metrics in `expected/metrics.json`.

## Plan, before running

- Exact commands: resolve the exact top-level pin with `uv pip compile requirements.in --python-version 3.12 --generate-hashes -o requirements.lock`; `./run.sh --record`, followed by two independent `./run.sh` invocations. The runner creates `output/venv` if absent and installs only from the committed hash-locked requirements.
- Fixture construction: `vedo.Mesh([points, faces])` with points `[[0,0,0],[2,0,0],[0,3,0],[0,0,4]]` and faces `[[0,1,2],[0,1,3]]`; write two files with `vedo.write`, load each with `vedo.load`.
- Predeclared checks: both reloads contain exactly 4 points and 2 polygon cells; bounds equal `[0,2,0,3,0,4]`; point coordinates and face connectivity match the source; the two loads have identical rounded numeric geometry; report exact vedo, VTK and Python versions. Bounds tolerance is `1e-9`.
- Expected artifacts: `output/first/mesh.vtp`, `output/second/mesh.vtp`, and `expected/metrics.json`. The output mesh is structurally inspected; no image output is produced.
- Expected failure modes and stop conditions: if the pinned Vedo/VTK wheel cannot install for CPython 3.12 macOS arm64, stop after one documented retry and leave the catalogue unvalidated. Do not substitute another Python package or credit native VTK alone.
- Reproduction and inspection: run `./run.sh`; compare the retained counts, bounds and coordinates with the recipe above. Generated XML files remain in ignored output for inspection.

## Observation, after running

- Date/executor: 2026-11-16, Conors-MacBook-Pro-2.local, macOS arm64; CPython 3.12.13, Vedo 2026.6.3, VTK 9.7.2.
- Commands: `./run.sh --record`, followed by two separate `./run.sh` calls. Each run invoked two fresh Python processes.
- Observed output: all four VTP reloads had 4 points, 2 polygon cells, coordinates and connectivity matching the source, and bounds `[0,2,0,3,0,4]`. Geometry SHA-256 was `e65e2cc8e13535e9c695f1def112a362c4e55077deb05af4f03a7cdec952765f`; all diffs passed.
- Inspection: reviewed the recorded metrics against both generated VTP round trips. No image or rendering was part of this fixture.
- Result: pass for this Vedo VTP mesh write/load claim; compact measurements are retained in `expected/metrics.json`, generated VTP files remain in ignored `output/`.
- Deviations and limitations: the first import of VTK modules took about a minute and was interrupted once; the authorized retry completed, and subsequent repeat runs passed. No rendering, external assets, or other mesh formats were exercised.
- This establishes geometry interchange for this fixture on the recorded runtime/platform only; it does not establish render reliability or behavior on other platforms or formats.
- Reviewer, decision, follow-up and revisit trigger: parent integration review; revisit on a Vedo/VTK version change or a request to validate rendering or additional formats.
