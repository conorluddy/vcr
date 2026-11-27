---
name: openscad
description: Export a parametric .scad script headlessly to STL, 3MF, SVG or a fixed-camera PNG with the OpenSCAD CLI, overriding variables with -D. Load once OpenSCAD has been chosen for text-defined solid geometry; use build123d for fillets or STEP.
---

# OpenSCAD

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- A `.scad` script plus `-D name=value` overrides gives a part per parameter set; one run can write several outputs (`-o a.stl -o b.png`).
- Exports measured in VCR: STL, 3MF, SVG (2D only), PNG preview.
- Not for fillets, STEP or B-rep (build123d), triangle-mesh Booleans in Node (manifold), or lighting and materials (Blender, Three.js).
- Circles are inscribed polygons set by `$fn`: compare volume with the polygon area, not pi r squared.

## Capability map
Documented: language reference, customizer parameter sets (`-p`, `-P`), `--animate N` with `$t`, more export formats (OFF, DXF, PDF, POV); see the [documentation](https://openscad.org/documentation.html) and `openscad --help`. VCR exercised: `-D`, `--backend`, `--export-format`, STL, 3MF, SVG via `projection()`, PNG with `--camera`, `--imgsize`, `--render 1`. Untested: `--animate`, libraries (BOSL2), the GUI, `-p/-P`, other formats.

## Install and doctor
```text
brew install --cask openscad@snapshot
openscad --version   # expect: OpenSCAD version 2026.10.11
```
The stable cask is 2021.01; the fixture ran the snapshot, so pin it. Validated 2026.10.11, macOS arm64, `examples/openscad-parametric`.

## Smoke test
```text
vcr example create openscad-parametric && (cd examples/openscad-parametric && ./run.sh)
# expect: KNOWN FAIL lines for 3MF and CGAL volume, then openscad-parametric: OK
```
`run.sh` builds `output/venv` (trimesh, numpy) for the analytic checks; it fails with the install command if `openscad` is missing.

## Recipes
```text
openscad -o part.stl --export-format asciistl -D width=50 -D holeRadius=7 part.scad
openscad -o foot.svg -D 'mode="projection"' part.scad          # script must wrap in projection()
openscad -o still.png --imgsize 400,300 --camera 20,15,5,55,0,25,120 --render 1 part.scad
```
Camera is `translate_x,y,z,rot_x,y,z,dist`. `--backend Manifold` is the default; `--backend CGAL` is the old engine.

## Determinism
- STL (ASCII) and PNG were byte-identical across runs, seconds apart. PNG colours depend on version and colour scheme.
- 3MF is not: it embeds `CreationDate` and random UUIDs. Compare the unzipped mesh, not the file hash.
- CGAL STL volume was off analytic by 3.4e-9 relative; Manifold was within 1e-9.

## Troubleshooting
- `--render=` or `--imgsize=` joined with `=` and no value printed usage and no PNG: use `--render 1`.
- Binary STL is not the default; pass `--export-format asciistl` or `binstl` explicitly.

## Official docs
- https://openscad.org/documentation.html
- https://github.com/openscad/openscad
