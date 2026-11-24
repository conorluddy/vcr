#!/usr/bin/env python3
# Writes a two-material GLB: CrateGroup (group) holds Body and Clasp (single-triangle meshes).
import json
import struct
import sys

out_path = sys.argv[1]
body_positions = [(-0.5, 0.0, 0.0), (0.5, 0.0, 0.0), (0.0, 1.0, 0.0)]
clasp_positions = [(0.6, 0.0, 0.0), (0.9, 0.0, 0.0), (0.75, 0.3, 0.0)]
binary = b"".join(struct.pack("<3f", *vertex) for vertex in body_positions + clasp_positions)


def accessor(buffer_view_index: int, positions: list[tuple[float, float, float]]) -> dict:
    lows = [min(p[axis] for p in positions) for axis in range(3)]
    highs = [max(p[axis] for p in positions) for axis in range(3)]
    return {
        "bufferView": buffer_view_index,
        "componentType": 5126,
        "count": len(positions),
        "type": "VEC3",
        "min": lows,
        "max": highs,
    }


document = {
    "asset": {"version": "2.0", "generator": "gltfjsx-r3f-component-fixture"},
    "scene": 0,
    "scenes": [{"nodes": [0]}],
    "nodes": [
        {"name": "CrateGroup", "children": [1, 2]},
        {"name": "Body", "mesh": 0},
        {"name": "Clasp", "mesh": 1, "translation": [0.0, 0.5, 0.0]},
    ],
    "meshes": [
        {"name": "BodyMesh", "primitives": [{"attributes": {"POSITION": 0}, "material": 0, "mode": 4}]},
        {"name": "ClaspMesh", "primitives": [{"attributes": {"POSITION": 1}, "material": 1, "mode": 4}]},
    ],
    "materials": [
        {"name": "Wood", "pbrMetallicRoughness": {"baseColorFactor": [0.55, 0.32, 0.18, 1.0], "metallicFactor": 0.0, "roughnessFactor": 0.8}},
        {"name": "Metal", "pbrMetallicRoughness": {"baseColorFactor": [0.75, 0.75, 0.8, 1.0], "metallicFactor": 1.0, "roughnessFactor": 0.3}},
    ],
    "buffers": [{"byteLength": len(binary)}],
    "bufferViews": [
        {"buffer": 0, "byteOffset": 0, "byteLength": 36, "target": 34962},
        {"buffer": 0, "byteOffset": 36, "byteLength": 36, "target": 34962},
    ],
    "accessors": [accessor(0, body_positions), accessor(1, clasp_positions)],
}
json_chunk = json.dumps(document, separators=(",", ":")).encode("utf-8")
json_chunk += b" " * ((-len(json_chunk)) % 4)
bin_chunk = binary + b"\0" * ((-len(binary)) % 4)
total_length = 12 + 8 + len(json_chunk) + 8 + len(bin_chunk)
with open(out_path, "wb") as handle:
    handle.write(struct.pack("<III", 0x46546C67, 2, total_length))
    handle.write(struct.pack("<II", len(json_chunk), 0x4E4F534A))
    handle.write(json_chunk)
    handle.write(struct.pack("<II", len(bin_chunk), 0x004E4942))
    handle.write(bin_chunk)
