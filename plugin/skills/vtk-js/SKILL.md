---
name: vtk-js
description: Load when JavaScript needs VTK-style scientific data structures or browser visualization. This VCR guide is limited to ASCII VTP PolyData read/write under Node; it does not validate rendering.
---

# vtk.js

vtk.js is Kitware's JavaScript toolkit for scientific data and browser visualization. The validated VCR route uses its data structures and XML PolyData reader/writer under Node to round-trip a small mesh. It produces no image.

## Use cases and limits

- Use vtk.js when working with VTK data structures and supported scientific formats in JavaScript.
- Use `vedo` for Python/VTK workflows or Three.js for general 3D scenes.
- Evidence is `@kitware/vtk.js` 37.4.6 on Node.js 25.6.1/macOS arm64. It covers ASCII VTP serialization and read-back of four points and two polygons. Rendering, WebGL/WebGPU, binary VTP, other formats, and other platforms are untested.

## Capability map

- **Data model:** `vtkPolyData`, `vtkPoints`, and `vtkCellArray` define points and cells. The fixture exercises these to construct the input mesh and verify the read-back. See [PolyData structure](https://kitware.github.io/vtk-js/docs/structures_PolyData.html).
- **XML I/O:** `XMLPolyDataWriter` and `XMLPolyDataReader` write/read ASCII VTP in the fixture. The [API index](https://kitware.github.io/vtk-js/api/) documents other readers and writers that are untested here.
- **Rendering pipeline:** rendering, filters, widgets, and browser examples are documented upstream but not exercised by this Node fixture. See the [VTK.js overview](https://kitware.github.io/vtk-js/docs/).
- **Evidence boundary:** equal geometry metrics across two Node processes establish this serialization case only, not visual fidelity or cross-runtime compatibility.

## Install and doctor

Install in the project with `npm install @kitware/vtk.js`. This is a project library, not a machine executable, so `vcr doctor` does not prove it is installed. Check the project package with:

```sh
npm ls @kitware/vtk.js
```

The fixture pins 37.4.6 in `package.json` and its lockfile.

## Smoke test

```sh
cd examples/vtk-js-vtp-roundtrip
npm ci --ignore-scripts --no-audit --no-fund
./run.sh
# expect: vtk.js VTP round-trip passed in two independent Node processes.
```

The runner writes ASCII VTP twice, reads each file with vtk.js, and diffs point/cell counts, coordinates, connectivity, bounds, and geometry hash.

## Troubleshooting

- **XML reader reports failure:** confirm the input is the fixture's ASCII VTP and pass the exact file bytes as an `ArrayBuffer` slice, as the example does.
- **Metrics differ:** keep the pinned package version and Node runtime; inspect `output/first/mesh.vtp` and the parsed geometry before changing the fixture.
- **Expecting a rendered frame:** this example has no render window. Rendering support needs a separate browser capture fixture and evidence.

## Official docs

- [vtk.js API](https://kitware.github.io/vtk-js/api/)
- [PolyData structure](https://kitware.github.io/vtk-js/docs/structures_PolyData.html)
- [XML PolyData Reader](https://kitware.github.io/vtk-js/api/IO_XML_XMLPolyDataReader.html)
- [vtk.js overview](https://kitware.github.io/vtk-js/docs/)
