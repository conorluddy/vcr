"""Measure trimesh primitives, a GLB reload and a transformed re-export against analytic values.

Usage: mesh_checks.py OUTPUT_DIR
Writes exports, checks.json and summary.txt into OUTPUT_DIR, prints checks.json to stdout
and exits 1 when any gating check fails. Plain Python with trimesh and numpy only.
"""
import hashlib
import json
import math
import sys
from pathlib import Path

import numpy as np
import trimesh

BOX_EXTENTS = (2.0, 4.0, 6.0)
BOX_VOLUME = 48.0
BOX_AREA = 88.0
BOX_BOUNDS = ((-1.0, -2.0, -3.0), (1.0, 2.0, 3.0))
TRANSFORM_SCALE = 2.0
TRANSFORM_ANGLE_Z_RADIANS = math.pi / 2
TRANSFORM_TRANSLATE = (1.0, 2.0, 3.0)
TRANSFORMED_VOLUME = 384.0
TRANSFORMED_BOUNDS = ((-3.0, 0.0, -3.0), (5.0, 4.0, 9.0))
ICOSPHERE_SUBDIVISIONS = 4
ICOSPHERE_VERTEX_COUNT = 2562
ICOSPHERE_FACE_COUNT = 5120
SPHERE_VOLUME = 4.0 / 3.0 * math.pi
SPHERE_AREA = 4.0 * math.pi
SPHERE_RELATIVE_TOLERANCE = 0.005
RELATIVE_TOLERANCE = 1e-6
ABSOLUTE_TOLERANCE = 1e-9
ROUND_DECIMALS = 9


def load_single_mesh(path: Path) -> trimesh.Trimesh:
    loaded = trimesh.load(str(path), force="mesh")
    if not isinstance(loaded, trimesh.Trimesh):
        sys.exit(f"expected one mesh from {path.name}, got {type(loaded).__name__}")
    return loaded


def sha256_of_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def mesh_facts(mesh: trimesh.Trimesh) -> dict:
    return {
        "vertex_count": int(len(mesh.vertices)),
        "face_count": int(len(mesh.faces)),
        "volume": float(mesh.volume),
        "area": float(mesh.area),
        "bounds_min": mesh.bounds[0].tolist(),
        "bounds_max": mesh.bounds[1].tolist(),
        "watertight": bool(mesh.is_watertight),
        "winding_consistent": bool(mesh.is_winding_consistent),
        "euler_number": int(mesh.euler_number),
    }


def relative_error(measured: float, expected: float) -> float:
    return float(abs(float(measured) - expected) / abs(expected))


def reload_matches(reloaded: dict, original: dict) -> bool:
    return (
        reloaded["vertex_count"] == original["vertex_count"]
        and reloaded["face_count"] == original["face_count"]
        and relative_error(reloaded["volume"], original["volume"]) <= RELATIVE_TOLERANCE
    )


def bounds_match(facts: dict, expected: tuple) -> bool:
    expected_min, expected_max = expected
    return bool(
        np.allclose(facts["bounds_min"], expected_min, rtol=0, atol=ABSOLUTE_TOLERANCE)
        and np.allclose(facts["bounds_max"], expected_max, rtol=0, atol=ABSOLUTE_TOLERANCE)
    )


def round_floats(value):
    if isinstance(value, float):
        return round(value, ROUND_DECIMALS)
    if isinstance(value, list):
        return [round_floats(item) for item in value]
    if isinstance(value, dict):
        return {key: round_floats(item) for key, item in value.items()}
    return value


def build_report(output_dir: Path) -> dict:
    box = trimesh.creation.box(extents=BOX_EXTENTS)
    box_facts = mesh_facts(box)

    sphere = trimesh.creation.icosphere(subdivisions=ICOSPHERE_SUBDIVISIONS, radius=1.0)
    sphere_facts = mesh_facts(sphere)
    sphere_radius_error = float(np.max(np.abs(np.linalg.norm(sphere.vertices, axis=1) - 1.0)))
    sphere_volume_error = relative_error(sphere.volume, SPHERE_VOLUME)
    sphere_area_error = relative_error(sphere.area, SPHERE_AREA)

    sphere_glb_path = output_dir / "icosphere.glb"
    sphere.export(str(sphere_glb_path))
    sphere_glb_facts = mesh_facts(load_single_mesh(sphere_glb_path))

    transform = trimesh.transformations.compose_matrix(
        scale=[TRANSFORM_SCALE] * 3,
        angles=[0.0, 0.0, TRANSFORM_ANGLE_Z_RADIANS],
        translate=list(TRANSFORM_TRANSLATE),
    )
    transformed = box.copy()
    transformed.apply_transform(transform)
    transformed_facts = mesh_facts(transformed)

    glb_path = output_dir / "box-transformed.glb"
    stl_path = output_dir / "box-transformed.stl"
    transformed.export(str(glb_path))
    transformed.export(str(stl_path))
    glb_reload_facts = mesh_facts(load_single_mesh(glb_path))
    stl_reload_facts = mesh_facts(load_single_mesh(stl_path))

    checks = {
        "box_volume_matches_analytic": relative_error(box.volume, BOX_VOLUME) <= RELATIVE_TOLERANCE,
        "box_area_matches_analytic": relative_error(box.area, BOX_AREA) <= RELATIVE_TOLERANCE,
        "box_bounds_match_analytic": bounds_match(box_facts, BOX_BOUNDS),
        "box_watertight_and_closed": box_facts["watertight"]
        and box_facts["winding_consistent"]
        and box_facts["euler_number"] == 2,
        "icosphere_counts_match_subdivision": sphere_facts["vertex_count"] == ICOSPHERE_VERTEX_COUNT
        and sphere_facts["face_count"] == ICOSPHERE_FACE_COUNT,
        "icosphere_vertices_on_unit_sphere": sphere_radius_error <= ABSOLUTE_TOLERANCE,
        "icosphere_watertight_and_closed": sphere_facts["watertight"]
        and sphere_facts["winding_consistent"]
        and sphere_facts["euler_number"] == 2,
        "icosphere_volume_within_tolerance": sphere_volume_error <= SPHERE_RELATIVE_TOLERANCE,
        "icosphere_area_within_tolerance": sphere_area_error <= SPHERE_RELATIVE_TOLERANCE,
        "icosphere_glb_reload_matches": reload_matches(sphere_glb_facts, sphere_facts),
        "transformed_volume_matches_analytic": relative_error(transformed.volume, TRANSFORMED_VOLUME)
        <= RELATIVE_TOLERANCE,
        "transformed_bounds_match_analytic": bounds_match(transformed_facts, TRANSFORMED_BOUNDS),
        "transformed_still_watertight": transformed_facts["watertight"],
        "transformed_glb_reload_matches": reload_matches(glb_reload_facts, transformed_facts),
        "transformed_stl_reload_matches": reload_matches(stl_reload_facts, transformed_facts),
    }

    return {
        "measurements": {
            "box": box_facts,
            "box_transformed": transformed_facts,
            "box_transformed_glb_reload": glb_reload_facts,
            "box_transformed_stl_reload": stl_reload_facts,
            "icosphere": sphere_facts,
            "icosphere_glb_reload": sphere_glb_facts,
            "icosphere_radius_max_error": sphere_radius_error,
            "icosphere_volume_relative_error": sphere_volume_error,
            "icosphere_area_relative_error": sphere_area_error,
            "export_sha256": {
                path.name: sha256_of_file(path)
                for path in (sphere_glb_path, glb_path, stl_path)
            },
        },
        "analytic": {
            "box_volume": BOX_VOLUME,
            "box_area": BOX_AREA,
            "box_bounds": BOX_BOUNDS,
            "transformed_volume": TRANSFORMED_VOLUME,
            "transformed_bounds": TRANSFORMED_BOUNDS,
            "icosphere_vertex_count": ICOSPHERE_VERTEX_COUNT,
            "icosphere_face_count": ICOSPHERE_FACE_COUNT,
            "sphere_volume": SPHERE_VOLUME,
            "sphere_area": SPHERE_AREA,
        },
        "tolerances": {
            "relative": RELATIVE_TOLERANCE,
            "absolute": ABSOLUTE_TOLERANCE,
            "sphere_relative": SPHERE_RELATIVE_TOLERANCE,
        },
        "checks": checks,
    }


def build_summary(report: dict) -> str:
    lines = []
    for name, facts in report["measurements"].items():
        if isinstance(facts, dict) and "vertex_count" in facts:
            lines.append(
                f"{name}: vertices={facts['vertex_count']} faces={facts['face_count']} "
                f"volume={facts['volume']:.9g} bounds={facts['bounds_min']}..{facts['bounds_max']}"
            )
    return "\n".join(lines) + "\n"


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("usage: mesh_checks.py OUTPUT_DIR")
    output_dir = Path(sys.argv[1])
    output_dir.mkdir(parents=True, exist_ok=True)
    report = round_floats(build_report(output_dir))
    text = json.dumps(report, indent=2, sort_keys=True) + "\n"
    (output_dir / "checks.json").write_text(text)
    (output_dir / "summary.txt").write_text(build_summary(report))
    sys.stdout.write(text)
    if not all(report["checks"].values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
