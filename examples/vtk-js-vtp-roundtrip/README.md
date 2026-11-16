# vtk.js VTP round-trip evidence

## Intent and scope

- Tool ID and version/build: `@kitware/vtk.js` 37.4.6; Node.js 25.6.1 on macOS arm64.
- VCR job and exact claim: construct a small triangle `vtkPolyData`, serialize it with vtk.js `XMLPolyDataWriter`, reload it with `XMLPolyDataReader`, and preserve point/cell counts, coordinates, connectivity and bounds.
- Explicit exclusions: no render window, WebGL/WebGPU, screenshot, external input, other formats, toolkit C++ VTK, or other runtimes/platforms.
- Official documentation checked: https://kitware.github.io/vtk-js/api/IO_XML_XMLPolyDataWriter.html, https://kitware.github.io/vtk-js/api/IO_XML_XMLPolyDataReader.html, and https://kitware.github.io/vtk-js/docs/structures_PolyData.html; vtk.js is BSD-3-Clause.
- Environment: macOS arm64, Node.js 25.6.1; no graphics backend.
- Input: fixture-owned 4-point, 2-triangle mesh, built with vtk.js PolyData, Points and CellArray modules; no third-party asset.
- Dependencies and install plan: fixture-local, exact `@kitware/vtk.js==37.4.6` in `package.json` and `package-lock.json`; install using `npm ci --ignore-scripts --no-audit --no-fund`. Network needed once; no global or workspace-root dependency changes.
- Output and cleanup: serialized VTP and run logs under ignored `output/`; retain only exact geometry metrics in `expected/metrics.json`.

## Plan, before running

- Exact commands: `npm ci --ignore-scripts --no-audit --no-fund`; `./run.sh --record`; then two independent `./run.sh` invocations. The script uses the installed vtk.js package directly under Node, with no bundler or Python VTK.
- Fixture recipe: create points `[[0,0,-1],[2,0,-1],[2,3,4],[0,3,4]]` and polys `[[0,1,2],[0,2,3]]` with vtk.js `vtkPoints`, `vtkCellArray`, and `vtkPolyData`; write using `vtkXMLPolyDataWriter`, parse the writer's XML bytes with `vtkXMLPolyDataReader`.
- Predeclared checks: 4 points; 2 polygon cells; exact coordinates and triangle connectivity; bounds `[0,2,0,3,-1,4]` within `1e-6`; matching normalized geometry SHA-256 across two fresh vtk.js pipelines.
- Expected artifacts: ignored `output/first.vtp`, `output/second.vtp`; `expected/metrics.json` records exact vtk.js/Node versions and observed counts/bounds/hash. No rendered image is produced.
- Expected failure modes and stop conditions: if the pinned package cannot install or XML IO cannot be imported/invoked with Node after one bounded API probe, stop and leave the catalogue not validated. Do not substitute Python VTK or native VTK.
- Reproduction and inspection: run `./run.sh`; inspect `output/first.vtp` as XML and compare its parsed geometry metrics with the predeclared values.

## Observation, after running

- Date/executor: 2026-11-16, Conors-MacBook-Pro-2.local, macOS arm64; Node.js 25.6.1 and `@kitware/vtk.js` 37.4.6.
- Commands: `npm ci --ignore-scripts --no-audit --no-fund`, `./run.sh --record`, then two independent `./run.sh` invocations.
- Observed output: both fresh Node processes wrote ASCII XML PolyData, read their VTP files through vtk.js `XMLPolyDataReader`, and preserved 4 points, 2 polygon cells, all coordinates and connectivity, and bounds `[0,2,0,3,-1,4]`. Geometry SHA-256 was `0c8338058212ee51c04ef30ad854dce87420fcc0e3256e011132065a6ffb30e0`.
- Inspection: reviewed the VTP XML header/piece counts and parsed geometry measurements in `expected/metrics.json`; no image was produced.
- Result: pass for this vtk.js ASCII VTP write/read claim; generated VTP and logs remain under ignored `output/`.
- Deviations and limitations: no rendering, WebGL/WebGPU, binary VTP, external data, or other formats/platforms were exercised.
- This does not establish display/rendering quality or compatibility outside the pinned Node/runtime and package version.
- Reviewer, decision, follow-up and revisit trigger: parent integration review; revisit on vtk.js version changes or when validating rendering/binary VTP is needed.
