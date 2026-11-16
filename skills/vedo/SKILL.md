---
name: vedo
description: Load when Python mesh data needs Vedo's VTK-backed construction, inspection, or file I/O. VCR evidence covers only a small VTP mesh round trip, not rendering or other formats.
---

# Vedo

Vedo is a Python library and CLI built on VTK and NumPy. The validated VCR fixture constructs a small triangle mesh, writes VTP, reloads it, and checks geometry. Use it for that kind of local scientific-mesh workflow; do not infer rendering coverage from the round trip.

## Use cases and limits

- Use Vedo when Python code needs to construct, inspect, or exchange VTK-backed geometry.
- For a complete animated scene, use Blender; for browser-based VTK rendering, use vtk.js.
- Evidence is Vedo 2026.6.3, VTK 9.7.2 and CPython 3.12.13 on macOS arm64. It covers four points and two triangles in VTP only. Rendering, external formats, topology repair, attributes, and other platforms are untested.

## Capability map

- **Mesh construction and geometry access:** `Mesh([points, faces])`, point/cell counts, coordinates, and bounds. The fixture exercises these on one authored triangle mesh. See the [Vedo API documentation](https://vedo.embl.es/docs/).
- **File I/O:** `write` and `load` round-trip VTP in the fixture. Other readers, writers, and formats are documented but untested here.
- **Analysis and visualization:** Vedo documents analysis filters, plotting, and rendering; none are covered by this fixture.
- **Evidence boundary:** the fixture uses VTK 9.7.2 under Python 3.12.13 and makes no image or GPU claim.

## Install and doctor

Add Vedo to the project with `uv add vedo`. The fixture uses a pinned Python 3.12 environment and hash-locked dependencies. `vcr doctor` is not a substitute for the project Python environment; check the active interpreter with:

```sh
python -c "import vedo; print(vedo.__version__)"
```

## Smoke test

```sh
cd examples/vedo-vtp-roundtrip
./run.sh
# expect: Vedo VTP round-trip passed in two independent Python processes.
```

The script creates an ignored fixture-local environment if needed, writes and reloads two VTP files, then compares counts, coordinates, connectivity, bounds, and geometry metrics. First install may need network access.

## Troubleshooting

- **First run is slow or interrupted while importing VTK:** retry once as the fixture documents; do not swap in another VTK build or runtime and claim the same evidence.
- **Environment differs from evidence:** use the pinned Python 3.12 lockfile and compare the recorded Vedo/VTK versions before interpreting a failure.
- **Need a rendered image:** this fixture does not test a rendering backend; validate that route separately.

## Official docs

- [Vedo API documentation](https://vedo.embl.es/docs/)
- [Vedo repository](https://github.com/marcomusy/vedo)
