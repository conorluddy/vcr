---
name: fogleman-sdf
description: Use fogleman/sdf (Python) to compose signed-distance fields with CSG and mesh them to STL for organic or implicit forms. The VCR fixture covers one sphere, box and cylinder composition to binary STL at default resolution.
---

# fogleman/sdf

## Use cases and limits

- Use for code-defined implicit shapes: intersections, subtractions and (documented) smooth blends that feed another renderer as a mesh. Use build123d when exact dimensions, fillets, STEP or technical projections matter (exact CAD); use Blender for general mesh modelling, materials and rendering.
- Evidence is source commit `d58a6fc63b75fc1cf1ebb71e0b42bf552319c8f1` (package version 0.1, no release, no PyPI package) on Python 3.12.2, numpy 2.5.5, scikit-image 0.26.0, macOS arm64. Last upstream commit 2024-08-10; maintenance unknown.
- Tested: the README classic shape (`sphere(1) & box(1.5)` minus three `cylinder(0.5)` cuts) to binary STL. Not tested: meshio formats, OpenVDB, other primitives or operators, printability, rendering.
- Dependencies keep their own licences (MIT for sdf itself).

## Capability map

Discovery only; the [README](https://github.com/fogleman/sdf) is the authoritative reference at the pinned commit.

- **3D primitives** (sphere, box, cylinder, capsule, torus and others). Tested: `sphere`, `box`, `cylinder`. Rest untested.
- **Boolean and positioning operators** (`&`, `|`, `-`, `orient`, translate, scale, rotate). Tested: `&`, `|`, `-`, `orient`. Smooth variants, twist, bend and repeat are untested.
- **2D shapes, extrusion, text** (documented, needs fonts). Untested.
- **Meshing and output** (`save`, `generate`, `step`, `bounds`, `samples`; the `Mesh` helpers). Tested: `save(path)` to binary STL with defaults. Other formats go through meshio; untested. Sampling from an existing mesh needs OpenVDB; untested.

## Install and doctor

Source-only. Clone at the pinned commit and install editable into a venv under the example's git-ignored `output/` (not a `.venv` in the example directory: the plugin build scans that as shipped media).

```bash
cd examples/fogleman-sdf-mesh
git clone https://github.com/fogleman/sdf output/src
git -C output/src checkout d58a6fc63b75fc1cf1ebb71e0b42bf552319c8f1
python3 -m venv output/venv
output/venv/bin/pip install -e output/src
output/venv/bin/python -c "import sdf"
```

Needs network for GitHub and PyPI once. `run.sh` does not install; set `FOGLEMAN_SDF_PYTHON` to use another interpreter. `vcr doctor` is the check that the tool is present here.

## Smoke test

```bash
examples/fogleman-sdf-mesh/run.sh
# expect: fogleman-sdf-mesh: OK
```

It generates twice and diffs `expected/checks.json`: 291028 triangles (STL 14551484 bytes, `84 + 50 * count`), 145506 welded vertices, bounds exactly +-0.75 per axis, largest vertex residual 0.00228 against an independent analytic SDF, 0 boundary and 0 non-manifold edges, and a byte-identical rerun. The STL hash may change with numpy or scikit-image upgrades or another platform; byte identity is observed on one machine only.

## Recipe (tested)

```python
from sdf import *

f = sphere(1) & box(1.5)
c = cylinder(0.5)
f -= c.orient(X) | c.orient(Y) | c.orient(Z)
f.save("out.stl")  # default bounds and step (about 0.0105 here)
```

Default `save` is multi-threaded and prints verbose timing to stdout; nothing time-varying is written to the STL. Default resolution is dense (14.5 MB for this shape); coarser `step` is documented but untested.

## Troubleshooting

- `run.sh` exits "Create output/venv": the venv is missing; follow the install above.
- `pnpm validate` or the plugin build rejecting hundreds of MiB of media: the venv or clone sits in a dot-directory inside the example; move it under `output/`.
- Check your own watertight test: each undirected edge must appear once in each direction (`forward != backward` flags conflicts); an inverted test flagged every edge of a correct mesh.

## Official docs

- [fogleman/sdf README](https://github.com/fogleman/sdf/blob/d58a6fc63b75fc1cf1ebb71e0b42bf552319c8f1/README.md)
- [Licence (MIT)](https://github.com/fogleman/sdf/blob/d58a6fc63b75fc1cf1ebb71e0b42bf552319c8f1/LICENSE.md)
