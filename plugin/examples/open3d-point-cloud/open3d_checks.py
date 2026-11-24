"""Check Open3D sampling, voxel downsampling, normals, Poisson reconstruction and PLY round trips.

Usage: open3d_checks.py OUTPUT_DIR
Writes checks.json (gating, deterministic), hashes.json (informational), offscreen.json and
PLY files into OUTPUT_DIR, prints checks.json and exits 1 when any gating check fails.
"""
import hashlib
import json
import math
import sys
from pathlib import Path

import numpy as np
import open3d as o3d

RANDOM_SEED = 20261124
SAMPLE_COUNT = 20000
VOXEL_SIZE = 0.05
VOXEL_RATIO_MIN = 0.8
VOXEL_RATIO_MAX = 2.5
NORMAL_RADIUS = 0.25
NORMAL_MAX_NEIGHBOURS = 30
NORMAL_ORIENTATION_NEIGHBOURS = 30
RADIAL_OUTWARD_FRACTION_MIN = 0.98
ANALYTIC_ALIGNMENT_COSINE_MIN = 0.9
ANALYTIC_ALIGNMENT_FRACTION_MIN = 0.9
POISSON_DEPTH = 8
POISSON_TRIM_QUANTILE = 0.05
BOUNDS_TOLERANCE = 0.1
SPHERE_RADIUS = 1.0
SPHERE_RESOLUTION = 40
BOX_SIZE = (2.0, 4.0, 6.0)
OFFSCREEN_WIDTH = 640
OFFSCREEN_HEIGHT = 480
ROUND_DECIMALS = 9


# === PUBLIC API ===

def main(argv: list[str]) -> int:
    if len(argv) != 2:
        sys.exit("usage: open3d_checks.py OUTPUT_DIR")
    output_dir = Path(argv[1])
    output_dir.mkdir(parents=True, exist_ok=True)
    primitives = {shape: measure_primitive(shape, output_dir) for shape in ("sphere", "box")}
    gates = {f"{shape}.{name}": passed for shape, result in primitives.items() for name, passed in result["gates"].items()}
    checks = {
        "seed": RANDOM_SEED,
        "parameters": {
            "sample_count": SAMPLE_COUNT,
            "voxel_size": VOXEL_SIZE,
            "voxel_ratio_range": [VOXEL_RATIO_MIN, VOXEL_RATIO_MAX],
            "normal_radius": NORMAL_RADIUS,
            "normal_max_neighbours": NORMAL_MAX_NEIGHBOURS,
            "normal_orientation_neighbours": NORMAL_ORIENTATION_NEIGHBOURS,
            "radial_outward_fraction_min": RADIAL_OUTWARD_FRACTION_MIN,
            "analytic_alignment_cosine_min": ANALYTIC_ALIGNMENT_COSINE_MIN,
            "analytic_alignment_fraction_min": ANALYTIC_ALIGNMENT_FRACTION_MIN,
            "poisson_depth": POISSON_DEPTH,
            "poisson_trim_quantile": POISSON_TRIM_QUANTILE,
            "bounds_tolerance": BOUNDS_TOLERANCE,
        },
        "primitives": {shape: {k: v for k, v in result.items() if k != "gates"} for shape, result in primitives.items()},
        "gates": gates,
        "all_gates_pass": all(gates.values()),
    }
    write_json(output_dir / "checks.json", checks)
    write_json(output_dir / "hashes.json", {path.name: sha256_of(path) for path in sorted(output_dir.glob("*.ply"))})
    write_json(output_dir / "offscreen.json", attempt_offscreen_render(output_dir))
    print(json.dumps(checks, indent=2, sort_keys=True))
    return 0 if checks["all_gates_pass"] else 1


# === PRIMITIVE MEASUREMENT ===

def measure_primitive(shape: str, output_dir: Path) -> dict:
    mesh = build_mesh(shape)
    o3d.utility.random.seed(RANDOM_SEED)
    sampled = mesh.sample_points_uniformly(number_of_points=SAMPLE_COUNT)
    points = np.asarray(sampled.points)
    voxel_count = len(sampled.voxel_down_sample(VOXEL_SIZE).points)
    area = analytic_surface_area(shape)
    voxel_ratio = voxel_count / (area / VOXEL_SIZE**2)

    cloud = o3d.geometry.PointCloud()
    cloud.points = o3d.utility.Vector3dVector(points)
    cloud.estimate_normals(
        search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=NORMAL_RADIUS, max_nn=NORMAL_MAX_NEIGHBOURS)
    )
    cloud.orient_normals_consistent_tangent_plane(NORMAL_ORIENTATION_NEIGHBOURS)
    normals = np.asarray(cloud.normals)
    normals_flipped = bool(np.median(np.sum(normals * points, axis=1)) < 0)
    if normals_flipped:
        normals = -normals
        cloud.normals = o3d.utility.Vector3dVector(normals)
    radial_outward_fraction = float(np.mean(np.sum(normals * points, axis=1) > 0))
    reference = analytic_outward_normals(shape, points)
    alignment_fraction = float(np.mean(np.abs(np.sum(normals * reference, axis=1)) >= ANALYTIC_ALIGNMENT_COSINE_MIN))

    poisson_mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(cloud, depth=POISSON_DEPTH)
    densities = np.asarray(densities)
    poisson_mesh.remove_vertices_by_mask(densities < np.quantile(densities, POISSON_TRIM_QUANTILE))
    bounds_min = np.asarray(poisson_mesh.get_min_bound())
    bounds_max = np.asarray(poisson_mesh.get_max_bound())
    analytic_min, analytic_max = analytic_bounds(shape)
    bounds_deviation = float(max(np.max(np.abs(bounds_min - analytic_min)), np.max(np.abs(bounds_max - analytic_max))))

    ply_points = round_trip_point_cloud(output_dir / f"{shape}-points.ply", cloud)
    ply_mesh = round_trip_mesh(output_dir / f"{shape}-poisson.ply", poisson_mesh)

    gates = {
        "sample_count_exact": len(points) == SAMPLE_COUNT,
        "voxel_count_within_ratio_range": VOXEL_RATIO_MIN <= voxel_ratio <= VOXEL_RATIO_MAX and voxel_count <= SAMPLE_COUNT,
        "normals_radial_outward_fraction": radial_outward_fraction >= RADIAL_OUTWARD_FRACTION_MIN,
        "normals_analytic_alignment": alignment_fraction >= ANALYTIC_ALIGNMENT_FRACTION_MIN,
        "poisson_bounds_within_tolerance": bounds_deviation <= BOUNDS_TOLERANCE,
        "ply_point_count_identical": ply_points["written"] and ply_points["read_count"] == len(points),
        "ply_mesh_counts_identical": ply_mesh["written"]
        and ply_mesh["read_vertex_count"] == ply_mesh["vertex_count"]
        and ply_mesh["read_triangle_count"] == ply_mesh["triangle_count"],
    }
    return {
        "sampled_points": len(points),
        "voxel_points": voxel_count,
        "voxel_ratio": round(voxel_ratio, ROUND_DECIMALS),
        "normals_flipped_to_outward": normals_flipped,
        "normals_radial_outward_fraction": round(radial_outward_fraction, ROUND_DECIMALS),
        "normals_analytic_alignment_fraction": round(alignment_fraction, ROUND_DECIMALS),
        "poisson_vertex_count": ply_mesh["vertex_count"],
        "poisson_triangle_count": ply_mesh["triangle_count"],
        "poisson_bounds_min": [round(v, ROUND_DECIMALS) for v in bounds_min.tolist()],
        "poisson_bounds_max": [round(v, ROUND_DECIMALS) for v in bounds_max.tolist()],
        "poisson_bounds_deviation": round(bounds_deviation, ROUND_DECIMALS),
        "ply_points": {"written": ply_points["written"], "read_count": ply_points["read_count"]},
        "ply_mesh": {
            "written": ply_mesh["written"],
            "read_vertex_count": ply_mesh["read_vertex_count"],
            "read_triangle_count": ply_mesh["read_triangle_count"],
        },
        "gates": gates,
    }


# === OFFSCREEN (NOT GATING) ===

def attempt_offscreen_render(output_dir: Path) -> dict:
    image_path = output_dir / "offscreen-sphere.png"
    try:
        renderer = o3d.visualization.rendering.OffscreenRenderer(OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT)
        mesh = build_mesh("sphere")
        mesh.compute_vertex_normals()
        material = o3d.visualization.rendering.MaterialRecord()
        material.shader = "defaultLit"
        renderer.scene.add_geometry("sphere", mesh, material)
        renderer.setup_camera(
            60.0,
            center=[0.0, 0.0, 0.0],
            eye=[0.0, 0.0, 4.0],
            up=[0.0, 1.0, 0.0],
        )
        image = renderer.render_to_image()
        written = bool(o3d.io.write_image(str(image_path), image))
        return {"status": "rendered" if written else "not exercised", "path": image_path.name, "size": [OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT]}
    except Exception as error:  # the attempt is recorded, not hidden; the claim is not gated on it
        return {"status": "not exercised", "error": f"{type(error).__name__}: {error}"}


# === HELPERS ===

def build_mesh(shape: str) -> o3d.geometry.TriangleMesh:
    if shape == "sphere":
        return o3d.geometry.TriangleMesh.create_sphere(radius=SPHERE_RADIUS, resolution=SPHERE_RESOLUTION)
    box = o3d.geometry.TriangleMesh.create_box(width=BOX_SIZE[0], height=BOX_SIZE[1], depth=BOX_SIZE[2])
    box.translate(tuple(-side / 2 for side in BOX_SIZE))
    return box


def analytic_surface_area(shape: str) -> float:
    if shape == "sphere":
        return 4.0 * math.pi * SPHERE_RADIUS**2
    a, b, c = BOX_SIZE
    return 2.0 * (a * b + b * c + c * a)


def analytic_bounds(shape: str) -> tuple[np.ndarray, np.ndarray]:
    if shape == "sphere":
        return np.full(3, -SPHERE_RADIUS), np.full(3, SPHERE_RADIUS)
    half = np.array(BOX_SIZE) / 2
    return -half, half


def analytic_outward_normals(shape: str, points: np.ndarray) -> np.ndarray:
    if shape == "sphere":
        return points / np.linalg.norm(points, axis=1, keepdims=True)
    half = np.array(BOX_SIZE) / 2
    axis = np.argmax(np.abs(points) / half, axis=1)
    rows = np.arange(len(points))
    normals = np.zeros_like(points)
    normals[rows, axis] = np.sign(points[rows, axis])
    return normals


def round_trip_point_cloud(path: Path, cloud: o3d.geometry.PointCloud) -> dict:
    written = bool(o3d.io.write_point_cloud(str(path), cloud, write_ascii=False))
    read_back = o3d.io.read_point_cloud(str(path))
    return {"written": written, "read_count": len(read_back.points)}


def round_trip_mesh(path: Path, mesh: o3d.geometry.TriangleMesh) -> dict:
    vertex_count = len(mesh.vertices)
    triangle_count = len(mesh.triangles)
    written = bool(o3d.io.write_triangle_mesh(str(path), mesh, write_ascii=False))
    read_back = o3d.io.read_triangle_mesh(str(path))
    return {
        "written": written,
        "vertex_count": vertex_count,
        "triangle_count": triangle_count,
        "read_vertex_count": len(read_back.vertices),
        "read_triangle_count": len(read_back.triangles),
    }


def sha256_of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n")


if __name__ == "__main__":
    sys.exit(main(sys.argv))
