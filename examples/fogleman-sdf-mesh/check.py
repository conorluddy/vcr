"""Measure the classic fogleman/sdf STL against predeclared analytic checks.

Usage: check.py PRIMARY_STL RERUN_STL
Prints JSON to stdout and exits 1 when any gating check fails.
Plain Python only: no numpy or trimesh is imported.
"""
import hashlib
import json
import math
import struct
import sys
from collections import Counter

ANALYTIC_BOUND_PER_AXIS = 0.75
BOUNDS_TOLERANCE = 0.01
RESIDUAL_TOLERANCE = 0.01
WELD_DECIMALS = 6
STL_HEADER_BYTES = 80
STL_TRIANGLE_BYTES = 50


def read_binary_stl_triangles(path):
    with open(path, 'rb') as stl_file:
        data = stl_file.read()
    triangle_count = struct.unpack_from('<I', data, STL_HEADER_BYTES)[0]
    expected_length = STL_HEADER_BYTES + 4 + STL_TRIANGLE_BYTES * triangle_count
    triangles = []
    for index in range(triangle_count):
        offset = STL_HEADER_BYTES + 4 + STL_TRIANGLE_BYTES * index + 12
        triangles.append(struct.unpack_from('<9f', data, offset))
    return data, triangles, len(data) == expected_length


def analytic_composed_distance(x, y, z):
    sphere_distance = math.sqrt(x * x + y * y + z * z) - 1.0
    box_distance = max(abs(x), abs(y), abs(z)) - ANALYTIC_BOUND_PER_AXIS
    intersection = max(sphere_distance, box_distance)
    cylinder_along_x = math.sqrt(y * y + z * z) - 0.5
    cylinder_along_y = math.sqrt(x * x + z * z) - 0.5
    cylinder_along_z = math.sqrt(x * x + y * y) - 0.5
    cutter = min(cylinder_along_x, cylinder_along_y, cylinder_along_z)
    return max(intersection, -cutter)


def weld_vertices(triangles):
    index_by_key = {}
    vertices = []
    indexed_triangles = []
    for triangle in triangles:
        corners = []
        for corner in range(3):
            point = triangle[corner * 3:corner * 3 + 3]
            key = tuple(round(value, WELD_DECIMALS) for value in point)
            if key not in index_by_key:
                index_by_key[key] = len(vertices)
                vertices.append(point)
            corners.append(index_by_key[key])
        indexed_triangles.append(tuple(corners))
    return vertices, indexed_triangles


def edge_statistics(indexed_triangles):
    directed = Counter()
    degenerate_triangles = 0
    for a, b, c in indexed_triangles:
        if len({a, b, c}) < 3:
            degenerate_triangles += 1
        for start, end in ((a, b), (b, c), (c, a)):
            if start != end:
                directed[(start, end)] += 1
    undirected_keys = {tuple(sorted(edge)) for edge in directed}
    boundary = non_manifold = orientation_conflicts = 0
    for low, high in undirected_keys:
        forward = directed[(low, high)]
        backward = directed[(high, low)]
        total = forward + backward
        if total == 1:
            boundary += 1
        elif total > 2:
            non_manifold += 1
        elif forward != backward:
            orientation_conflicts += 1
    return {
        'edges': len(undirected_keys),
        'boundary_edges': boundary,
        'non_manifold_edges': non_manifold,
        'orientation_conflicts': orientation_conflicts,
        'degenerate_triangles': degenerate_triangles,
    }


def sha256_hex(data):
    return hashlib.sha256(data).hexdigest()


def measure(primary_path, rerun_path):
    data, triangles, length_matches = read_binary_stl_triangles(primary_path)
    _, rerun_triangles, _ = read_binary_stl_triangles(rerun_path)
    with open(rerun_path, 'rb') as rerun_file:
        rerun_data = rerun_file.read()

    vertices, indexed_triangles = weld_vertices(triangles)
    axis_minimum = [min(vertex[axis] for vertex in vertices) for axis in range(3)]
    axis_maximum = [max(vertex[axis] for vertex in vertices) for axis in range(3)]
    max_residual = max(
        abs(analytic_composed_distance(*vertex)) for vertex in vertices
    )
    edges = edge_statistics(indexed_triangles)
    bounds_error = max(
        abs(axis_minimum[axis] + ANALYTIC_BOUND_PER_AXIS) for axis in range(3)
    )
    bounds_error = max(
        bounds_error,
        max(abs(axis_maximum[axis] - ANALYTIC_BOUND_PER_AXIS) for axis in range(3)),
    )
    watertight = (
        edges['boundary_edges'] == 0
        and edges['non_manifold_edges'] == 0
        and edges['orientation_conflicts'] == 0
    )
    checks = {
        'triangle_count_positive': len(triangles) > 0,
        'stl_length_matches_count': length_matches,
        'bounds_within_tolerance': bounds_error <= BOUNDS_TOLERANCE,
        'vertices_on_composed_surface': max_residual <= RESIDUAL_TOLERANCE,
        'watertight_edge_manifold': watertight,
    }
    return {
        'measurements': {
            'triangle_count': len(triangles),
            'welded_vertex_count': len(vertices),
            'bounds_min': [round(value, WELD_DECIMALS) for value in axis_minimum],
            'bounds_max': [round(value, WELD_DECIMALS) for value in axis_maximum],
            'max_bounds_error': round(bounds_error, WELD_DECIMALS),
            'max_composed_residual': round(max_residual, WELD_DECIMALS),
            **edges,
            'stl_bytes': len(data),
            'stl_sha256': sha256_hex(data),
            'rerun_triangle_count': len(rerun_triangles),
            'rerun_byte_identical': rerun_data == data,
        },
        'tolerances': {
            'bounds_per_axis': BOUNDS_TOLERANCE,
            'composed_residual': RESIDUAL_TOLERANCE,
            'analytic_bounds_per_axis': [-ANALYTIC_BOUND_PER_AXIS, ANALYTIC_BOUND_PER_AXIS],
        },
        'checks': checks,
    }


def main():
    if len(sys.argv) != 3:
        sys.exit('usage: check.py PRIMARY_STL RERUN_STL')
    report = measure(sys.argv[1], sys.argv[2])
    print(json.dumps(report, indent=2, sort_keys=True))
    if not all(report['checks'].values()):
        sys.exit(1)


if __name__ == '__main__':
    main()
