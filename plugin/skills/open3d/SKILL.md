---
name: open3d
description: Use Python Open3D to sample, downsample, estimate normals for and reconstruct point clouds, and read or write PLY. Load for scripted point-cloud work; VCR evidence is partial (macOS arm64, open3d 0.20.0), and Poisson meshes are not reproducible.
---

# Open3D

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Point clouds in Python: sample a mesh surface, voxel-downsample, estimate normals, Poisson-reconstruct a mesh, round-trip PLY, and render one offscreen image.
- Evidence is **partial**, on a sphere (radius 1) and a box (2 x 4 x 6) only, macOS arm64 (Apple M3 Pro, Metal), Python 3.12.13, open3d 0.20.0, numpy 2.5.5. `run.sh` exits 1 (see Troubleshooting), so the example is not validated.
- Use [trimesh](../trimesh/SKILL.md) for plain mesh checks (volume, bounds, watertightness, GLB/STL). Use open3d for point clouds, normals and reconstruction. Author and render production scenes in Blender.
- Not tested: real scans, registration (ICP), the tensor `o3d.t` API, CUDA, ball pivoting, OBJ/STL/PCD/XYZ/GLB, GUI windows, other seeds, thread counts or machines.

## Capability map
Official reference: [open3d.org](https://www.open3d.org/) (documentation index). Stable top-level areas: `o3d.geometry` (PointCloud, TriangleMesh, voxel and octree types), `o3d.io` (file formats), `o3d.pipelines` (registration, odometry, integration), `o3d.t` (tensor API), `o3d.visualization` (viewers, offscreen rendering), `o3d.ml` (machine learning). This is discovery, not validation.

Exercised by the fixture: `TriangleMesh.create_sphere` and `create_box`, `sample_points_uniformly`, `voxel_down_sample`, `estimate_normals` with `KDTreeSearchParamHybrid`, `orient_normals_consistent_tangent_plane`, `TriangleMesh.create_from_point_cloud_poisson`, `remove_vertices_by_mask`, `o3d.io` PLY read and write, `o3d.utility.random.seed`, and one `OffscreenRenderer` image. Everything else is documented but untested.

## Install and doctor
The fixture keeps its venv under the git-ignored `output/`. pip pulls a large dependency tree (dash, plotly, ipython and others); the script imports none of them.
```text
cd examples/open3d-point-cloud
/opt/homebrew/bin/python3.12 -m venv output/venv && output/venv/bin/python -m pip install -r requirements.txt
output/venv/bin/python -c "import open3d; print(open3d.__version__)"   # expect: 0.20.0
vcr doctor
```
Pins: open3d 0.20.0, numpy 2.5.5. Requires Python 3.10 or newer. Never assume it is installed.

## Smoke test
```text
vcr example create open3d-point-cloud
cd examples/open3d-point-cloud && output/venv/bin/python open3d_checks.py output/run-a
```
Expected: prints `checks.json` and exits 1, because `primitives.box` fails the voxel gate (below). Passing in the recorded run: 20000 sampled points each, normals radial-outward fraction 1.0, Poisson bounds deviation 0.0009 (sphere) and 0.028 (box), PLY point and mesh counts identical after read-back. `output/run-a/offscreen.json` should say `rendered`. No `expected/` is kept: `run.sh` cannot pass while a gate is false.

## Recipes
```python
import numpy as np, open3d as o3d
o3d.utility.random.seed(20261124)
mesh = o3d.geometry.TriangleMesh.create_sphere(radius=1.0, resolution=40)
cloud = mesh.sample_points_uniformly(number_of_points=20000)
small = cloud.voxel_down_sample(0.05)                      # 5654 points for the sphere
cloud.estimate_normals(o3d.geometry.KDTreeSearchParamHybrid(radius=0.25, max_nn=30))
cloud.orient_normals_consistent_tangent_plane(30)          # coherent, but the global sign is not set
```
- Fix the sign yourself: if `np.median(np.sum(normals * points, axis=1)) < 0` for a shape around the origin, negate all normals. Neither primitive needed the flip. Outward fraction was then 1.0 on both.
- Poisson: `create_from_point_cloud_poisson(cloud, depth=8)` returns `(mesh, densities)`. Dropping vertices below the 5% density quantile left bounds within 0.001 (sphere) and 0.028 (box) of analytic.
- Write PLY with `o3d.io.write_point_cloud(path, cloud, write_ascii=False)` and `write_triangle_mesh`; read back with the matching `read_*`. Counts matched exactly.
- Offscreen (no window, Metal): `OffscreenRenderer(640, 480)`, a `MaterialRecord` with `shader = "defaultLit"`, `renderer.setup_camera(60.0, center, eye, up)`, then `render_to_image()` and `o3d.io.write_image`. One shaded sphere PNG, viewed once. The bounding-box overload of `setup_camera` does not exist in 0.20.0.

## Determinism and tolerances
- Seeded sampling, voxel counts and normals repeated exactly between two runs, and so did the point-cloud PLY hashes.
- **Poisson reconstruction is not deterministic across reruns**: triangle counts differed by 1 to 5 (box 61704 vs 61703, sphere 114326 vs 114321) and bounds by about 1e-7. Mesh PLY hashes differ. Do not hash meshes or diff them byte for byte; compare counts and bounds with a tolerance.
- It also aborted once in seven runs (`FEMTree.IsoSurface`: `Failed to close loop`, then `libc++abi: terminating`), seen with `OMP_NUM_THREADS=1`. The process dies, so run it in a subprocess and retry. Cause and other thread counts untested.

## Troubleshooting
- Box voxel gate fails (ratio 0.435 against a predeclared 0.8 to 2.5): the fixture's expectation was wrong, not the tool. Voxel count depends on sample density: the box has about 35200 surface voxels at 0.05, but 20000 samples hit each with probability about 0.43, giving about 15300 (measured 15317). The sphere has about 5027 voxels, saturated by the same samples. Predict occupancy from samples per voxel, not area over voxel area.
- `TypeError` on `setup_camera`: use the `(fov, center, eye, up)` overload.
- Poisson process abort: see above; retry.
- Slow or heavy install: expected, see Install.

## Official docs
- [Open3D documentation](https://www.open3d.org/docs/release/)
- [Repository](https://github.com/isl-org/Open3D) (MIT licence; dependency terms not reviewed)
