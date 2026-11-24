#!/usr/bin/env python3
import hashlib
import json
import os
import struct
import subprocess
import sys


MAX_PALETTE_COLOURS = 64
MIN_PSNR_DB = 30.0
MIN_SSIM = 0.95
EXPECTED_PNGQUANT_VERSION = "pngquant 3.0.3"


def run_magick(arguments: list[str]) -> str:
    completed = subprocess.run(["magick", *arguments], capture_output=True, text=True, check=False)
    return (completed.stdout + completed.stderr).strip()


def read_metric(first_path: str, second_path: str, metric: str) -> float:
    return float(run_magick(["compare", "-metric", metric, first_path, second_path, "null:"]).split()[0])


def read_ssim_similarity(first_path: str, second_path: str) -> float:
    # ImageMagick 7 prints SSIM as a dissimilarity in parentheses (0 means identical); similarity is 1 minus it.
    output = run_magick(["compare", "-metric", "SSIM", first_path, second_path, "null:"])
    dissimilarity = float(output[output.index("(") + 1:output.index(")")])
    return 1.0 - dissimilarity


def read_alpha_range(path: str) -> tuple[float, float]:
    minimum, maximum = run_magick(["-alpha", "extract", path, "-format", "%[fx:minima] %[fx:maxima]", "info:"]).split()
    return round(float(minimum), 6), round(float(maximum), 6)


def read_png_chunks(path: str) -> dict[str, bytes]:
    with open(path, "rb") as handle:
        data = handle.read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"not a PNG: {path}"
    chunks: dict[str, bytes] = {}
    offset = 8
    while offset < len(data):
        length = struct.unpack(">I", data[offset:offset + 4])[0]
        kind = data[offset + 4:offset + 8].decode("ascii")
        chunks.setdefault(kind, data[offset + 8:offset + 8 + length])
        offset += 12 + length
    return chunks


def sha256_of(path: str) -> str:
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


source_path, palette_path, palette_again_path, source_again_path, version_path, metrics_path = sys.argv[1:]

source_chunks = read_png_chunks(source_path)
palette_chunks = read_png_chunks(palette_path)
source_width, source_height, _, source_colour_type = struct.unpack(">IIBB", source_chunks["IHDR"][:10])
width, height, bit_depth, colour_type = struct.unpack(">IIBB", palette_chunks["IHDR"][:10])
palette_entries = len(palette_chunks["PLTE"]) // 3
unique_colours = int(run_magick(["identify", "-format", "%k", palette_path]))
source_bytes = os.path.getsize(source_path)
palette_bytes = os.path.getsize(palette_path)
source_alpha = read_alpha_range(source_path)
palette_alpha = read_alpha_range(palette_path)
psnr_db = round(read_metric(source_path, palette_path, "PSNR"), 3)
ssim = round(read_ssim_similarity(source_path, palette_path), 4)
pngquant_version = open(version_path, encoding="utf-8").read().strip()
source_hash = sha256_of(source_path)
palette_hash = sha256_of(palette_path)

assert (source_width, source_height, source_colour_type) == (256, 256, 6), (source_width, source_height, source_colour_type)
assert source_alpha == (0.0, 1.0), source_alpha
assert (width, height) == (256, 256), (width, height)
assert colour_type == 3, f"expected indexed PNG, got colour type {colour_type}"
assert 1 <= palette_entries <= MAX_PALETTE_COLOURS, palette_entries
assert "tRNS" in palette_chunks, "palette PNG has no tRNS chunk, so alpha is not preserved"
assert unique_colours <= MAX_PALETTE_COLOURS, unique_colours
assert palette_alpha == (0.0, 1.0), palette_alpha
assert palette_bytes < source_bytes, (palette_bytes, source_bytes)
assert psnr_db >= MIN_PSNR_DB, psnr_db
assert ssim >= MIN_SSIM, ssim
assert sha256_of(palette_again_path) == palette_hash, "palette repeat is not byte-identical"
assert sha256_of(source_again_path) == source_hash, "source regeneration is not byte-identical"
assert pngquant_version == EXPECTED_PNGQUANT_VERSION, pngquant_version

metrics = {
    "pngquant_version": pngquant_version,
    "imagemagick_version": run_magick(["-version"]).splitlines()[0],
    "source": {
        "width": source_width,
        "height": source_height,
        "colour_type": source_colour_type,
        "bytes": source_bytes,
        "alpha_min": source_alpha[0],
        "alpha_max": source_alpha[1],
        "sha256": source_hash,
    },
    "palette": {
        "width": width,
        "height": height,
        "colour_type": colour_type,
        "bit_depth": bit_depth,
        "plte_entries": palette_entries,
        "unique_colours": unique_colours,
        "trns_present": "tRNS" in palette_chunks,
        "bytes": palette_bytes,
        "alpha_min": palette_alpha[0],
        "alpha_max": palette_alpha[1],
        "sha256": palette_hash,
    },
    "psnr_db": psnr_db,
    "ssim": ssim,
    "repeat_palette_identical": True,
    "repeat_source_identical": True,
}
with open(metrics_path, "w", encoding="utf-8") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
