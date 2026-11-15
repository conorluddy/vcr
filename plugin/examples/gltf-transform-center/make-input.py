#!/usr/bin/env python3
import json
import struct
import sys

out_path = sys.argv[1]
positions = [(2.0, 1.0, 0.0), (4.0, 1.0, 0.0), (2.0, 3.0, 0.0)]
binary = b"".join(struct.pack("<3f", *vertex) for vertex in positions)
document = {
    "asset": {"version": "2.0", "generator": "gltf-transform-center-fixture"},
    "scene": 0,
    "scenes": [{"nodes": [0]}],
    "nodes": [{"mesh": 0, "name": "off-origin-triangle"}],
    "meshes": [{"name": "triangle", "primitives": [{"attributes": {"POSITION": 0}, "mode": 4}]}],
    "buffers": [{"byteLength": len(binary)}],
    "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": len(binary), "target": 34962}],
    "accessors": [{
        "bufferView": 0,
        "componentType": 5126,
        "count": len(positions),
        "type": "VEC3",
        "min": [2.0, 1.0, 0.0],
        "max": [4.0, 3.0, 0.0],
    }],
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
