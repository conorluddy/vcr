#!/usr/bin/env python3
import hashlib
import json
import math
import struct
import sys

path, version_path, output_path = sys.argv[1:]
data = open(path, "rb").read()
version = open(version_path, encoding="utf-8").read().strip()
magic, glb_version, total_length = struct.unpack_from("<III", data, 0)
assert magic == 0x46546C67, "not a GLB file"
assert glb_version == 2, f"unexpected GLB version: {glb_version}"
assert total_length == len(data), "GLB header length does not match file length"

offset = 12
document = None
binary = None
while offset < len(data):
    chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
    offset += 8
    chunk = data[offset : offset + chunk_length]
    offset += chunk_length
    if chunk_type == 0x4E4F534A:
        document = json.loads(chunk.decode("utf-8").rstrip(" \0"))
    elif chunk_type == 0x004E4942:
        binary = chunk
assert document is not None and binary is not None, "missing JSON or BIN chunk"
assert document["asset"]["version"] == "2.0", "not a glTF 2.0 document"
assert len(document.get("scenes", [])) == 1, "unexpected scene count"
assert len(document.get("nodes", [])) == 1, "unexpected node count"
assert len(document.get("meshes", [])) == 1, "unexpected mesh count"

node = document["nodes"][0]
mesh = document["meshes"][node["mesh"]]
position_accessor_index = mesh["primitives"][0]["attributes"]["POSITION"]
accessor = document["accessors"][position_accessor_index]
view = document["bufferViews"][accessor["bufferView"]]
assert accessor["componentType"] == 5126 and accessor["type"] == "VEC3"
assert accessor["count"] == 3, f"unexpected POSITION vertex count: {accessor['count']}"
start = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
stride = view.get("byteStride", 12)
vertices = [struct.unpack_from("<3f", binary, start + index * stride)
            for index in range(accessor["count"])]

if "matrix" in node:
    matrix = node["matrix"]
    def transform(p):
        return (
            matrix[0] * p[0] + matrix[4] * p[1] + matrix[8] * p[2] + matrix[12],
            matrix[1] * p[0] + matrix[5] * p[1] + matrix[9] * p[2] + matrix[13],
            matrix[2] * p[0] + matrix[6] * p[1] + matrix[10] * p[2] + matrix[14],
        )
else:
    translation = node.get("translation", [0.0, 0.0, 0.0])
    scale = node.get("scale", [1.0, 1.0, 1.0])
    qx, qy, qz, qw = node.get("rotation", [0.0, 0.0, 0.0, 1.0])
    def transform(p):
        x, y, z = (p[i] * scale[i] for i in range(3))
        tx, ty, tz = 2 * (qy * z - qz * y), 2 * (qz * x - qx * z), 2 * (qx * y - qy * x)
        rx = x + qw * tx + (qy * tz - qz * ty)
        ry = y + qw * ty + (qz * tx - qx * tz)
        rz = z + qw * tz + (qx * ty - qy * tx)
        return (rx + translation[0], ry + translation[1], rz + translation[2])

world = [transform(vertex) for vertex in vertices]
bounds = [
    [min(vertex[axis] for vertex in world) for axis in range(3)],
    [max(vertex[axis] for vertex in world) for axis in range(3)],
]
expected_bounds = [[-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]]
assert all(math.isclose(bounds[side][axis], expected_bounds[side][axis], abs_tol=1e-6)
           for side in range(2) for axis in range(3)), f"unexpected world bounds: {bounds}"

metrics = {
    "version": version,
    "glb_version": glb_version,
    "scenes": len(document["scenes"]),
    "nodes": len(document["nodes"]),
    "meshes": len(document["meshes"]),
    "vertices": accessor["count"],
    "world_bounds": bounds,
    "output_bytes": len(data),
    "sha256": hashlib.sha256(data).hexdigest(),
}
with open(output_path, "w", encoding="utf-8") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
