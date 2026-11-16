#!/usr/bin/env python3
import hashlib
import json
import sys
from pathlib import Path

import vtk
import vedo
from vedo import Mesh, load, write


output = Path(sys.argv[1])
output.mkdir(parents=True, exist_ok=True)
points = [[0, 0, 0], [2, 0, 0], [0, 3, 0], [0, 0, 4]]
faces = [[0, 1, 2], [0, 1, 3]]
source = Mesh([points, faces])
assert source.npoints == 4
assert source.ncells == 2


def inspect(path: Path) -> dict:
    write(source, str(path))
    assert path.is_file() and path.stat().st_size > 0
    mesh = load(str(path))
    actual_points = [[float(c) for c in row] for row in mesh.points]
    actual_faces = [[int(c) for c in row] for row in mesh.cells]
    actual_bounds = [float(v) for v in mesh.bounds()]
    assert mesh.npoints == 4
    assert mesh.ncells == 2
    assert actual_faces == faces
    assert actual_points == [[float(c) for c in row] for row in points]
    expected_bounds = [0.0, 2.0, 0.0, 3.0, 0.0, 4.0]
    assert len(actual_bounds) == len(expected_bounds)
    assert all(abs(a - e) <= 1e-9 for a, e in zip(actual_bounds, expected_bounds))
    geometry = {"points": actual_points, "faces": actual_faces, "bounds": actual_bounds}
    geometry_hash = hashlib.sha256(json.dumps(geometry, separators=(",", ":")).encode()).hexdigest()
    return {"point_count": mesh.npoints, "polygon_count": mesh.ncells, **geometry, "geometry_sha256": geometry_hash}


first = inspect(output / "mesh.vtp")
metrics = {
    "vedo_version": vedo.__version__,
    "vtk_version": vtk.vtkVersion().GetVTKVersion(),
    "python_version": ".".join(map(str, sys.version_info[:3])),
    **first,
}
(output / "metrics.json").write_text(json.dumps(metrics, indent=2) + "\n")
print(json.dumps(metrics, indent=2))
