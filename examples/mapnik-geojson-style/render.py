"""Render places.geojson with style.xml through Mapnik's Python bindings; write render.json and frame PNGs.

Frame 0 covers lon/lat 0..8 at 64 px per degree (512x512); frames 1 and 2 pan east by 1 degree each.
Frames are rendered in order, then in shuffled order in the same process; both must match.
"""
import hashlib
import json
import os
import struct
import sys

import mapnik

SIZE = 512
PAN_DEGREES = 1.0
FRAME_COUNT = 3
SHUFFLED_ORDER = [2, 0, 1]


def render_frame(frame_index):
    style_map = mapnik.Map(SIZE, SIZE)
    mapnik.load_map(style_map, "style.xml")
    west = frame_index * PAN_DEGREES
    style_map.zoom_to_box(mapnik.Box2d(west, 0, west + 8, 8))
    image = mapnik.Image(SIZE, SIZE)
    mapnik.render(style_map, image)
    return image.to_string("png")


def read_png_size(png_bytes):
    return list(struct.unpack(">II", png_bytes[16:24]))


def main():
    output_dir = sys.argv[1]
    os.makedirs(output_dir, exist_ok=True)
    sequential = {i: render_frame(i) for i in range(FRAME_COUNT)}
    shuffled = {i: render_frame(i) for i in SHUFFLED_ORDER}
    for index, png_bytes in sequential.items():
        with open(os.path.join(output_dir, f"frame-{index}.png"), "wb") as handle:
            handle.write(png_bytes)
    hashes = [hashlib.sha256(sequential[i]).hexdigest() for i in range(FRAME_COUNT)]
    report = {
        "versions": {"mapnik": mapnik.version_string(), "python": sys.version.split()[0]},
        "size": {"width": SIZE, "height": SIZE},
        "frames": [
            {"index": i, "bytes": len(sequential[i]), "ihdr": read_png_size(sequential[i]), "sha256": hashes[i]}
            for i in range(FRAME_COUNT)
        ],
        "shuffledEqualsSequential": all(sequential[i] == shuffled[i] for i in range(FRAME_COUNT)),
        "distinctFrameHashes": len(set(hashes)),
    }
    with open(os.path.join(output_dir, "render.json"), "w") as handle:
        json.dump(report, handle, indent=2, sort_keys=True)
        handle.write("\n")


main()
