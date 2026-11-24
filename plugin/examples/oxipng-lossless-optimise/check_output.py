#!/usr/bin/env python3
"""Checks oxipng outputs against their inputs and writes per-frame facts to metrics.json."""
import filecmp
import hashlib
import json
import os
import struct
import subprocess
import sys

METADATA_CHUNKS_REMOVED_BY_SAFE = {"tEXt", "zTXt", "iTXt", "tIME"}
METADATA_CHUNK_KEPT_BY_SAFE = "pHYs"
MIDDLE_FRAME = "rgba001"
EXPECTED_OXIPNG_VERSION = "oxipng 10.1.0"


def fail(message: str) -> None:
    raise SystemExit(f"oxipng-lossless-optimise: FAILED: {message}")


def read_chunks(path: str) -> list:
    with open(path, "rb") as handle:
        data = handle.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        fail(f"{path} is not a PNG")
    chunks = []
    position = 8
    while position < len(data):
        (length,) = struct.unpack(">I", data[position : position + 4])
        kind = data[position + 4 : position + 8].decode("ascii")
        payload = data[position + 8 : position + 8 + length]
        chunks.append((kind, payload))
        position += 12 + length
    return chunks


def chunk_types(path: str) -> list:
    return [kind for kind, _ in read_chunks(path)]


def header_fields(path: str) -> tuple:
    payload = next(payload for kind, payload in read_chunks(path) if kind == "IHDR")
    width, height, bit_depth, color_type = struct.unpack(">IIBB", payload[:10])
    return width, height, bit_depth, color_type


def decoded_rgba(path: str) -> bytes:
    result = subprocess.run(["magick", path, "-depth", "8", "RGBA:-"], capture_output=True, check=True)
    return result.stdout


def sha256_of(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha256(path: str) -> str:
    with open(path, "rb") as handle:
        return sha256_of(handle.read())


def main() -> None:
    input_dir, keep_dir, safe_dir, repeat_dir, versions_path, metrics_path = sys.argv[1:]
    with open(versions_path, encoding="utf-8") as handle:
        oxipng_version, magick_version = [line.strip() for line in handle.readlines()[:2]]
    if oxipng_version != EXPECTED_OXIPNG_VERSION:
        fail(f"expected '{EXPECTED_OXIPNG_VERSION}', got '{oxipng_version}'")

    names = sorted(name for name in os.listdir(input_dir) if name.endswith(".png"))
    if len(names) != 6:
        fail(f"expected six input frames, found {len(names)}")

    frames = []
    for name in names:
        stem = name[:-4]
        input_path = os.path.join(input_dir, name)
        keep_path = os.path.join(keep_dir, name)
        safe_path = os.path.join(safe_dir, name)
        repeat_path = os.path.join(repeat_dir, name)

        width, height, bit_depth, color_type = header_fields(input_path)
        if (width, height) != (64, 64):
            fail(f"{name} is {width}x{height}, expected 64x64")
        expected_colour_type = 6 if stem.startswith("rgba") else 3
        if color_type != expected_colour_type:
            fail(f"{name} colour type {color_type}, expected {expected_colour_type}")

        input_pixels = decoded_rgba(input_path)
        keep_pixels = decoded_rgba(keep_path)
        safe_pixels = decoded_rgba(safe_path)
        input_hash = sha256_of(input_pixels)
        safe_hash = sha256_of(safe_pixels)
        if keep_pixels != input_pixels:
            fail(f"{name}: no-strip control decodes differently from input")
        if safe_hash != input_hash:
            fail(f"{name}: --strip safe output decodes differently from input")

        input_bytes = os.path.getsize(input_path)
        safe_bytes = os.path.getsize(safe_path)
        if safe_bytes > input_bytes:
            fail(f"{name}: safe output {safe_bytes} B is larger than input {input_bytes} B")

        safe_types = chunk_types(safe_path)
        keep_types = chunk_types(keep_path)
        input_types = chunk_types(input_path)
        for kind in METADATA_CHUNKS_REMOVED_BY_SAFE:
            if kind in safe_types:
                fail(f"{name}: {kind} survived --strip safe")
            if kind not in keep_types:
                fail(f"{name}: {kind} missing from no-strip control, so the input was not carrying it")
        if METADATA_CHUNK_KEPT_BY_SAFE not in safe_types:
            fail(f"{name}: pHYs was removed by --strip safe, but the help text says it is kept")

        if not filecmp.cmp(safe_path, repeat_path, shallow=False):
            fail(f"{name}: repeated --strip safe output is not byte-identical")

        if stem == MIDDLE_FRAME:
            for label, pixels in (("input", input_pixels), ("safe", safe_pixels)):
                alphas = pixels[3::4]
                if 0 not in alphas or max(alphas) <= 128:
                    fail(f"{name}: {label} alpha range is {min(alphas)}..{max(alphas)}, expected 0 and above 128")

        frames.append(
            {
                "frame": stem,
                "width": width,
                "height": height,
                "bit_depth": bit_depth,
                "color_type": color_type,
                "input_bytes": input_bytes,
                "keep_bytes": os.path.getsize(keep_path),
                "safe_bytes": safe_bytes,
                "decoded_sha256_input": input_hash,
                "decoded_sha256_safe": safe_hash,
                "input_chunks": input_types,
                "keep_chunks": keep_types,
                "safe_chunks": safe_types,
                "safe_file_sha256": file_sha256(safe_path),
            }
        )

    input_total = sum(frame["input_bytes"] for frame in frames)
    safe_total = sum(frame["safe_bytes"] for frame in frames)
    metrics = {
        "oxipng_version": oxipng_version,
        "magick_version": magick_version,
        "strip_mode": "safe",
        "preset": 4,
        "frame_count": len(frames),
        "input_total_bytes": input_total,
        "safe_total_bytes": safe_total,
        "saved_bytes": input_total - safe_total,
        "saved_percent": round(100 * (input_total - safe_total) / input_total, 2),
        "frames": frames,
    }
    with open(metrics_path, "w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2, sort_keys=True)
        handle.write("\n")


if __name__ == "__main__":
    main()
