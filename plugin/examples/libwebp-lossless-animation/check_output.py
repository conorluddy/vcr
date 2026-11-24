#!/usr/bin/env python3
import hashlib
import json
import re
import subprocess
import sys


FRAME_COUNT = 3
CANVAS_SIZE = 64
DECLARED_DURATIONS_MS = (100, 250, 400)
SOURCE_ALPHA_VALUES = (0, 128, 255)
FRAME_ROW_PATTERN = re.compile(
    r"^\s*(\d+):\s+(\d+)\s+(\d+)\s+(yes|no)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(yes|no)\s+(\d+)\s+(\S+)\s*$"
)


def raw_rgba_sha256(path: str) -> str:
    result = subprocess.run(
        ["magick", path, "-depth", "8", "rgba:-"], check=True, capture_output=True
    )
    return hashlib.sha256(result.stdout).hexdigest()


def raw_rgba_alpha_values(path: str) -> set[int]:
    result = subprocess.run(
        ["magick", path, "-depth", "8", "rgba:-"], check=True, capture_output=True
    )
    return set(result.stdout[3::4])


def read_text(path: str) -> str:
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def first_line(path: str) -> str:
    return read_text(path).splitlines()[0].strip()


def feature_line(info_text: str) -> str:
    for line in info_text.splitlines():
        if line.startswith("Features present:"):
            return line
    raise AssertionError(f"no 'Features present' line in webpmux output:\n{info_text}")


def parse_frame_durations(info_text: str) -> list[int]:
    durations = []
    for line in info_text.splitlines():
        match = FRAME_ROW_PATTERN.match(line)
        if match:
            durations.append(int(match.group(7)))
    return durations


def main() -> None:
    output_dir = sys.argv[1]
    frame_paths = [f"{output_dir}/frames/frame{index}.png" for index in range(FRAME_COUNT)]

    source_hashes = [raw_rgba_sha256(path) for path in frame_paths]
    decoded_hashes = []
    for index in range(FRAME_COUNT):
        decoded_hashes.append(raw_rgba_sha256(f"{output_dir}/still{index}.pam"))
        assert decoded_hashes[index] == source_hashes[index], (
            f"frame {index}: decoded RGBA differs from source "
            f"({decoded_hashes[index]} != {source_hashes[index]})"
        )

    source_alpha = raw_rgba_alpha_values(frame_paths[0])
    missing_alpha = [value for value in SOURCE_ALPHA_VALUES if value not in source_alpha]
    assert not missing_alpha, f"source frame 0 lacks alpha values {missing_alpha}"

    animation_info = read_text(f"{output_dir}/webpmux-info.txt")
    assert f"Canvas size: {CANVAS_SIZE} x {CANVAS_SIZE}" in animation_info, animation_info
    animation_features = feature_line(animation_info)
    assert "animation" in animation_features and "transparency" in animation_features, animation_features
    assert f"Number of frames: {FRAME_COUNT}" in animation_info, animation_info
    durations = parse_frame_durations(animation_info)
    assert tuple(durations) == DECLARED_DURATIONS_MS, (durations, DECLARED_DURATIONS_MS)

    for index in range(FRAME_COUNT):
        still_info = read_text(f"{output_dir}/still-info{index}.txt")
        assert "transparency" in feature_line(still_info) and "(with alpha)" in still_info, still_info

    animation_bytes = open(f"{output_dir}/animation.webp", "rb").read()
    metrics = {
        "libwebp_version": first_line(f"{output_dir}/versions/cwebp.txt"),
        "dwebp_version": first_line(f"{output_dir}/versions/dwebp.txt"),
        "img2webp_version": first_line(f"{output_dir}/versions/img2webp.txt"),
        "webpmux_version": first_line(f"{output_dir}/versions/webpmux.txt"),
        "imagemagick_version": first_line(f"{output_dir}/versions/magick.txt"),
        "frame_count": FRAME_COUNT,
        "canvas_size": CANVAS_SIZE,
        "declared_durations_ms": list(DECLARED_DURATIONS_MS),
        "webpmux_durations_ms": durations,
        "source_rgba_sha256": source_hashes,
        "decoded_rgba_sha256": decoded_hashes,
        "source_alpha_values_frame0": sorted(source_alpha),
        "animation_bytes": len(animation_bytes),
        "animation_sha256": hashlib.sha256(animation_bytes).hexdigest(),
    }
    with open(f"{output_dir}/metrics.json", "w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2, sort_keys=True)
        handle.write("\n")


if __name__ == "__main__":
    main()
