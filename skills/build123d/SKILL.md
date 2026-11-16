---
name: build123d
description: Use build123d for parametric CAD geometry and technical projections when exact dimensions and solid operations matter. The VCR fixture validates one part through STEP, SVG and GLB export, with a scoped Blender import check.
---

# build123d

## Use cases and limits

- Use for dimensioned solids, booleans, fillets and projections that feed another renderer. Use Blender for lighting, materials and final animation; use SVG or Inkscape for freeform vector artwork.
- Evidence is build123d 0.13.0 on macOS arm64: one filleted part exported to STEP, SVG and GLB, with GLB geometry inspected in Blender 4.4.0. This is partial validation, not a general CAD or asset-import guarantee.
- Open Cascade bindings, dependencies and supplied assets have separate terms; check them before distribution.

## Capability map

- **Builder and algebra modeling** — [builder concepts](https://build123d.readthedocs.io/en/v0.13.0/key_concepts_builder.html) and [algebra concepts](https://build123d.readthedocs.io/en/v0.13.0/key_concepts_algebra.html). The fixture uses algebra-mode primitives, placement, fillet and boolean subtraction; builder mode is documented, not fixture-tested.
- **Operations and selectors** — [operations](https://build123d.readthedocs.io/en/v0.13.0/operations.html) and [selectors](https://build123d.readthedocs.io/en/v0.13.0/key_concepts.html). The fixture filters vertical edges and applies a fillet; the broader operation set is untested here.
- **Import and export** — [import/export reference](https://build123d.readthedocs.io/en/v0.13.0/import_export.html). The fixture checks STEP roundtrip, SVG projection and GLB export plus one Blender import. Other formats and arbitrary geometry remain untested.

## Install and doctor

The checked fixture uses Python 3.12, build123d 0.13.0 and its pinned requirements. In a project-local environment:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r examples/build123d-product/requirements.txt
```

The fixture does not install dependencies. Set `BUILD123D_PYTHON` to that interpreter and `BLENDER` to the Blender executable if the defaults do not apply. Check with the record's `vcr doctor` command:

```bash
.venv/bin/python -c "import build123d; from importlib.metadata import version; print(version('build123d'))"
```

## Smoke test

Run `examples/build123d-product/run.sh`. It also needs Blender 4.4.0 and GPU access for the observed Workbench render.

```text
# expect: build123d-product: geometry and GLB import checks passed; inspect output/part.png
```

The fixture verifies one solid's dimensions and volume, STEP roundtrip, SVG geometry, coarse/fine GLB tessellation and Blender-imported bounds/normals. Do not treat its numeric tolerances as general acceptance thresholds.

## Troubleshooting

- If the script cannot import build123d, set `BUILD123D_PYTHON` to the environment containing the pinned version; the script intentionally performs no installation.
- If Blender's Metal backend crashes in a restricted environment, the recorded run needed GPU access outside the sandbox. Do not change the renderer or weaken assertions to force a pass.
- Generated files and logs belong in the example's ignored `output/` directory.

## Official docs

- [build123d documentation](https://build123d.readthedocs.io/en/v0.13.0/)
- [Import/export](https://build123d.readthedocs.io/en/v0.13.0/import_export.html)
- [0.13.0 project metadata](https://github.com/gumyr/build123d/blob/v0.13.0/pyproject.toml)
