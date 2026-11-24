#!/usr/bin/env python3
"""Parses GIF blocks directly and checks gifsicle's claim against the input GIF; writes metrics JSON."""
import hashlib
import json
import os
import struct
import sys

EXPECTED_FRAME_COUNT = 6
EXPECTED_SIZE = (64, 64)
EXPECTED_DELAYS_CENTISECONDS = [12, 24, 4, 16, 28, 4]
EXPECTED_LOOP_COUNT = 2
LOSSY_QUALITY = 80
COLOR_LIMIT = 16


def read_sub_blocks(data: bytes, position: int) -> tuple[list[bytes], int]:
    blocks = []
    while True:
        size = data[position]
        position += 1
        if size == 0:
            return blocks, position
        blocks.append(data[position:position + size])
        position += size


def parse_gif(data: bytes) -> dict:
    if data[:6] not in (b"GIF87a", b"GIF89a"):
        raise ValueError(f"not a GIF: header {data[:6]!r}")
    width, height, packed = struct.unpack("<HHB", data[6:11])
    position = 13
    global_entries = 0
    if packed & 0x80:
        global_entries = 2 ** ((packed & 0x07) + 1)
        position += 3 * global_entries
    frames = []
    loop_count = None
    control = {"delay_cs": 0, "disposal": 0, "transparent": False}
    while True:
        marker = data[position]
        position += 1
        if marker == 0x3B:
            break
        if marker == 0x21:
            label = data[position]
            position += 1
            if label == 0xF9:
                packed_control = data[position + 1]
                delay_cs = struct.unpack("<H", data[position + 2:position + 4])[0]
                control = {
                    "delay_cs": delay_cs,
                    "disposal": (packed_control >> 2) & 0x07,
                    "transparent": bool(packed_control & 0x01),
                }
                position += 6
                continue
            if label == 0xFF:
                identifier_size = data[position]
                identifier = data[position + 1:position + 1 + identifier_size]
                position += 1 + identifier_size
                blocks, position = read_sub_blocks(data, position)
                if identifier == b"NETSCAPE2.0" and blocks and blocks[0][0] == 1:
                    loop_count = struct.unpack("<H", blocks[0][1:3])[0]
                continue
            _, position = read_sub_blocks(data, position)
            continue
        if marker == 0x2C:
            left, top, frame_width, frame_height, packed_image = struct.unpack("<HHHHB", data[position:position + 9])
            position += 9
            local_entries = None
            if packed_image & 0x80:
                local_entries = 2 ** ((packed_image & 0x07) + 1)
                position += 3 * local_entries
            position += 1
            _, position = read_sub_blocks(data, position)
            frames.append({
                "left": left,
                "top": top,
                "width": frame_width,
                "height": frame_height,
                "local_table_entries": local_entries,
                **control,
            })
            control = {"delay_cs": 0, "disposal": 0, "transparent": False}
            continue
        raise ValueError(f"unexpected GIF block 0x{marker:02x} at byte {position - 1}")
    tables = [global_entries] if global_entries else []
    tables += [frame["local_table_entries"] for frame in frames if frame["local_table_entries"]]
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "width": width,
        "height": height,
        "frame_count": len(frames),
        "delays_centiseconds": [frame["delay_cs"] for frame in frames],
        "loop_count": loop_count,
        "max_colour_table_entries": max(tables) if tables else 0,
        "frames": frames,
    }


def read_rgba_frames(path: str, frame_count: int) -> list[bytes]:
    with open(path, "rb") as handle:
        raw = handle.read()
    frame_bytes = len(raw) // frame_count
    if frame_bytes * frame_count != len(raw):
        raise ValueError(f"{path}: {len(raw)} bytes is not {frame_count} equal frames")
    return [raw[index * frame_bytes:(index + 1) * frame_bytes] for index in range(frame_count)]


def distinct_colour_count(frames: list[bytes]) -> int:
    colours = set()
    for frame in frames:
        for offset in range(0, len(frame), 4):
            colours.add(frame[offset:offset + 4])
    return len(colours)


def frame_hashes(frames: list[bytes]) -> list[str]:
    return [hashlib.sha256(frame).hexdigest() for frame in frames]


def read_text(path: str) -> str:
    with open(path, encoding="utf-8") as handle:
        return handle.read().strip()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def summarise_gif(gif: dict) -> dict:
    return {key: gif[key] for key in ("bytes", "sha256", "width", "height", "frame_count", "delays_centiseconds", "loop_count", "max_colour_table_entries")}


outputDirectory = sys.argv[1]
gif = {}
rgba = {}
for name in ("input", "o3", "lossy", "colors"):
    with open(os.path.join(outputDirectory, f"{name}.gif"), "rb") as handle:
        gif[name] = parse_gif(handle.read())
    rgba[name] = read_rgba_frames(os.path.join(outputDirectory, f"{name}.rgba"), gif[name]["frame_count"])

inputHashes = frame_hashes(rgba["input"])
o3Hashes = frame_hashes(rgba["o3"])
lossyHashes = frame_hashes(rgba["lossy"])
inputColours = distinct_colour_count(rgba["input"])
colorsColours = distinct_colour_count(rgba["colors"])

require(gif["input"]["frame_count"] == EXPECTED_FRAME_COUNT, f"input frames {gif['input']['frame_count']}")
require((gif["input"]["width"], gif["input"]["height"]) == EXPECTED_SIZE, "input size")
require(gif["input"]["delays_centiseconds"] == EXPECTED_DELAYS_CENTISECONDS, f"input delays {gif['input']['delays_centiseconds']}")
require(gif["input"]["loop_count"] == EXPECTED_LOOP_COUNT, f"input loop {gif['input']['loop_count']}")
require(len(set(inputHashes)) >= 2, "input frames are not distinct")
require(inputColours > COLOR_LIMIT, f"input has only {inputColours} colours, so --colors is not exercised")

for name in ("o3", "lossy", "colors"):
    require(gif[name]["frame_count"] == EXPECTED_FRAME_COUNT, f"{name} frame count {gif[name]['frame_count']}")
    require((gif[name]["width"], gif[name]["height"]) == EXPECTED_SIZE, f"{name} size")
    require(gif[name]["delays_centiseconds"] == gif["input"]["delays_centiseconds"], f"{name} delays differ")
    require(gif[name]["loop_count"] == gif["input"]["loop_count"], f"{name} loop count differs")

require(o3Hashes == inputHashes, "-O3 changed decoded pixels")
require(gif["o3"]["bytes"] <= gif["input"]["bytes"], f"-O3 output {gif['o3']['bytes']} larger than input {gif['input']['bytes']}")
require(gif["lossy"]["bytes"] < gif["o3"]["bytes"], f"--lossy output {gif['lossy']['bytes']} not smaller than -O3 {gif['o3']['bytes']}")
require(gif["colors"]["max_colour_table_entries"] <= COLOR_LIMIT, f"colour table {gif['colors']['max_colour_table_entries']} exceeds {COLOR_LIMIT}")
require(colorsColours <= COLOR_LIMIT, f"--colors output decodes to {colorsColours} colours")
require(gif["colors"]["bytes"] < gif["o3"]["bytes"], f"--colors output {gif['colors']['bytes']} not smaller than -O3 {gif['o3']['bytes']}")

metrics = {
    "versions": {
        "gifsicle": read_text(os.path.join(outputDirectory, "gifsicle-version.txt")),
        "ffmpeg": read_text(os.path.join(outputDirectory, "ffmpeg-version.txt")),
        "imagemagick": read_text(os.path.join(outputDirectory, "magick-version.txt")),
        "python": read_text(os.path.join(outputDirectory, "python-version.txt")),
    },
    "input": {**summarise_gif(gif["input"]), "distinct_frame_hashes": len(set(inputHashes)), "distinct_decoded_colours": inputColours},
    "o3": {**summarise_gif(gif["o3"]), "frames_pixel_identical_to_input": sum(a == b for a, b in zip(o3Hashes, inputHashes))},
    "lossy": {**summarise_gif(gif["lossy"]), "frames_pixel_identical_to_input": sum(a == b for a, b in zip(lossyHashes, inputHashes))},
    "colors": {**summarise_gif(gif["colors"]), "distinct_decoded_colours": colorsColours},
}
with open(os.path.join(outputDirectory, "metrics.json"), "w", encoding="utf-8") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
