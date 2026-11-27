"""Measure OpenSCAD outputs against analytic values. Usage: checks.py <outdir>; writes checks.json."""
import hashlib, json, math, re, struct, sys, zipfile
from pathlib import Path
import trimesh

out = Path(sys.argv[1])

def ngon_area(radius, segments):  # OpenSCAD's $fn circle is an inscribed regular polygon
    return 0.5 * segments * radius**2 * math.sin(2 * math.pi / segments)

def analytic_volume(width, depth, height, hole_radius, segments=128):
    return (width * depth - ngon_area(hole_radius, segments)) * height

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()[:16]

def mesh_report(path, expected_volume):
    mesh = trimesh.load(path, file_type=Path(path).suffix[1:], force="mesh")
    error = abs(mesh.volume - expected_volume) / expected_volume
    return {"watertight": bool(mesh.is_watertight), "winding_consistent": bool(mesh.is_winding_consistent),
            "faces": len(mesh.faces), "volume_relative_error_lt_1e-9": bool(error < 1e-9),
            "bounds": [[round(v, 6) for v in row] for row in mesh.bounds.tolist()]}

report = {}
for name, dims in {"default": (40, 30, 10, 5), "override": (50, 20, 8, 7)}.items():
    expected = analytic_volume(*dims)
    report[name] = {"analytic_volume": round(expected, 6),
                    "manifold": mesh_report(out / f"{name}-manifold.stl", expected),
                    "cgal": mesh_report(out / f"{name}-cgal.stl", expected)}
    report[name]["stl_manifold_sha256_16"] = sha(out / f"{name}-manifold.stl")

# STL byte determinism: a second export, made seconds later, hashes the same.
report["stl_repeat_identical"] = sha(out / "default-manifold.stl") == sha(out / "default-manifold-2.stl")
# 3MF: carries a CreationDate and random UUIDs, so two exports differ.
report["3mf_repeat_identical"] = sha(out / "default-1.3mf") == sha(out / "default-2.3mf")

with zipfile.ZipFile(out / "default-1.3mf") as archive:
    model = archive.read("3D/3dmodel.model").decode()
vertices = len(re.findall(r"<vertex ", model))
triangles = len(re.findall(r"<triangle ", model))
report["3mf_vertices_triangles"] = [vertices, triangles]

svg = (out / "default.svg").read_text()
view_box = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
report["svg"] = {"viewBox": view_box, "contours": len(re.findall(r"^M ", svg, re.M)),
                 "footprint_40x30_plus_1mm_margin": view_box[2:] == [42.0, 32.0]}

png = (out / "default.png").read_bytes()
width, height = struct.unpack(">II", png[16:24])
report["png"] = {"size": [width, height], "repeat_identical": sha(out / "default.png") == sha(out / "default-2.png"),
                 "sha256_16": sha(out / "default.png")}
(out / "checks.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
