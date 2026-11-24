#!/usr/bin/env python3
"""Write a unit cube centred at the origin as a GLB with one orange PBR material."""
import json
import struct
import sys

HALF_SIZE = 0.5
# Each face: outward normal, then four corners counter-clockwise seen from outside.
FACES = [
    ((1, 0, 0), [(1, -1, -1), (1, 1, -1), (1, 1, 1), (1, -1, 1)]),
    ((-1, 0, 0), [(-1, -1, 1), (-1, 1, 1), (-1, 1, -1), (-1, -1, -1)]),
    ((0, 1, 0), [(-1, 1, -1), (-1, 1, 1), (1, 1, 1), (1, 1, -1)]),
    ((0, -1, 0), [(-1, -1, 1), (-1, -1, -1), (1, -1, -1), (1, -1, 1)]),
    ((0, 0, 1), [(-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)]),
    ((0, 0, -1), [(1, -1, -1), (-1, -1, -1), (-1, 1, -1), (1, 1, -1)]),
]


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def sub(a, b):
    return tuple(x - y for x, y in zip(a, b))


def build_geometry():
    positions, normals, indices = [], [], []
    for face_index, (normal, corners) in enumerate(FACES):
        scaled = [tuple(HALF_SIZE * c for c in corner) for corner in corners]
        # Fail fast if winding and normal disagree; a flipped face would be culled.
        facing = cross(sub(scaled[1], scaled[0]), sub(scaled[2], scaled[0]))
        assert sum(f * n for f, n in zip(facing, normal)) > 0, f"face {face_index} winds inward"
        base = face_index * 4
        positions.extend(scaled)
        normals.extend([normal] * 4)
        indices.extend([base, base + 1, base + 2, base, base + 2, base + 3])
    return positions, normals, indices


def main(out_path):
    positions, normals, indices = build_geometry()
    position_bytes = b"".join(struct.pack("<3f", *v) for v in positions)
    normal_bytes = b"".join(struct.pack("<3f", *v) for v in normals)
    index_bytes = b"".join(struct.pack("<H", i) for i in indices)
    binary = position_bytes + normal_bytes + index_bytes
    assert len(binary) % 4 == 0
    document = {
        "asset": {"version": "2.0", "generator": "f3d-headless-still-fixture"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": "unit-cube"}],
        "materials": [{
            "name": "orange",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.9, 0.35, 0.1, 1.0],
                "metallicFactor": 0.0,
                "roughnessFactor": 0.7,
            },
        }],
        "meshes": [{"name": "cube", "primitives": [
            {"attributes": {"POSITION": 0, "NORMAL": 1}, "indices": 2, "material": 0, "mode": 4},
        ]}],
        "buffers": [{"byteLength": len(binary)}],
        "bufferViews": [
            {"buffer": 0, "byteOffset": 0, "byteLength": len(position_bytes), "target": 34962},
            {"buffer": 0, "byteOffset": len(position_bytes), "byteLength": len(normal_bytes), "target": 34962},
            {"buffer": 0, "byteOffset": len(position_bytes) + len(normal_bytes),
             "byteLength": len(index_bytes), "target": 34963},
        ],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": len(positions), "type": "VEC3",
             "min": [-HALF_SIZE] * 3, "max": [HALF_SIZE] * 3},
            {"bufferView": 1, "componentType": 5126, "count": len(normals), "type": "VEC3"},
            {"bufferView": 2, "componentType": 5123, "count": len(indices), "type": "SCALAR"},
        ],
    }
    json_chunk = json.dumps(document, separators=(",", ":")).encode("utf-8")
    json_chunk += b" " * ((-len(json_chunk)) % 4)
    total_length = 12 + 8 + len(json_chunk) + 8 + len(binary)
    with open(out_path, "wb") as handle:
        handle.write(struct.pack("<III", 0x46546C67, 2, total_length))
        handle.write(struct.pack("<II", len(json_chunk), 0x4E4F534A))
        handle.write(json_chunk)
        handle.write(struct.pack("<II", len(binary), 0x004E4942))
        handle.write(binary)


if __name__ == "__main__":
    main(sys.argv[1])
