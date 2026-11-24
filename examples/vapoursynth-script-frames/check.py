#!/usr/bin/env python3
# Diff vspipe and ffprobe output against the predeclared values in expected/.
# Standard library only; run as `python3 -I check.py [--record]`. --record writes expected/hashes.json first.
import hashlib
import json
import sys
from pathlib import Path

EXPECTED_DIRECTORY = Path("expected")
OUTPUT_DIRECTORY = Path("output")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def sha256_of_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_info_fields(path: Path) -> dict[str, str]:
    fields: dict[str, str] = {}
    for line in path.read_text().splitlines():
        key, separator, value = line.partition(": ")
        if separator:
            # "FPS: 24/1 (24.000 fps)" keeps only the rational rate.
            fields[key] = value.split(" ")[0]
    return fields


def read_y4m(path: Path) -> tuple[int, int, list[bytes]]:
    data = path.read_bytes()
    header_end = data.index(b"\n")
    header_tokens = data[:header_end].decode("ascii").split()
    if header_tokens[0] != "YUV4MPEG2":
        raise SystemExit(f"{path}: not a Y4M stream, first token is {header_tokens[0]!r}")
    width = int(next(token[1:] for token in header_tokens if token.startswith("W")))
    height = int(next(token[1:] for token in header_tokens if token.startswith("H")))
    payload_bytes = width * height + 2 * ((width + 1) // 2) * ((height + 1) // 2)
    frames: list[bytes] = []
    position = header_end + 1
    while position < len(data):
        frame_header_end = data.index(b"\n", position)
        if not data[position:frame_header_end].startswith(b"FRAME"):
            raise SystemExit(f"{path}: expected a FRAME header at byte {position}")
        payload_start = frame_header_end + 1
        payload_end = payload_start + payload_bytes
        if payload_end > len(data):
            raise SystemExit(f"{path}: frame {len(frames)} is truncated")
        frames.append(data[payload_start:payload_end])
        position = payload_end
    return width, height, frames


def sample_yuv420(frame: bytes, width: int, height: int, luma_xy: tuple[int, int], chroma_xy: tuple[int, int]) -> dict[str, int]:
    chroma_width = (width + 1) // 2
    chroma_height = (height + 1) // 2
    luma_size = width * height
    chroma_size = chroma_width * chroma_height
    luma_x, luma_y = luma_xy
    chroma_x, chroma_y = chroma_xy
    if chroma_y >= chroma_height or chroma_x >= chroma_width:
        raise SystemExit(f"chroma sample {chroma_xy} is outside {chroma_width}x{chroma_height}")
    return {
        "y": frame[luma_y * width + luma_x],
        "u": frame[luma_size + chroma_y * chroma_width + chroma_x],
        "v": frame[luma_size + chroma_size + chroma_y * chroma_width + chroma_x],
    }


def check_info(failures: list[str]) -> None:
    expected = load_json(EXPECTED_DIRECTORY / "info.json")
    observed = read_info_fields(OUTPUT_DIRECTORY / "info.txt")
    for key, want in expected.items():
        got = observed.get(key)
        if got != want:
            failures.append(f"info {key}: expected {want!r}, got {got!r}")


def check_sequential_stream(failures: list[str], expected_info: dict[str, str]) -> list[bytes]:
    width, height, frames = read_y4m(OUTPUT_DIRECTORY / "sequential.y4m")
    if str(width) != expected_info["Width"] or str(height) != expected_info["Height"]:
        failures.append(f"y4m dimensions {width}x{height}, expected {expected_info['Width']}x{expected_info['Height']}")
    if len(frames) != int(expected_info["Frames"]):
        failures.append(f"y4m frame count {len(frames)}, expected {expected_info['Frames']}")
    return frames


def check_pixels(failures: list[str], frames: list[bytes], expected_info: dict[str, str]) -> None:
    expected = load_json(EXPECTED_DIRECTORY / "pixels.json")
    tolerance = expected["toleranceCodeValues"]
    width = int(expected_info["Width"])
    height = int(expected_info["Height"])
    luma_xy = (expected["lumaSample"]["x"], expected["lumaSample"]["y"])
    chroma_xy = (expected["chromaSample"]["x"], expected["chromaSample"]["y"])
    for spec in expected["frames"]:
        sampled = sample_yuv420(frames[spec["index"]], width, height, luma_xy, chroma_xy)
        for plane in ("y", "u", "v"):
            if abs(sampled[plane] - spec[plane]) > tolerance:
                failures.append(f"frame {spec['index']} {plane}: expected {spec[plane]}±{tolerance}, got {sampled[plane]}")


def check_out_of_order_ranges(failures: list[str], sequential_frames: list[bytes], expected_ranges: list[list[int]]) -> None:
    for start, end in expected_ranges:
        range_path = OUTPUT_DIRECTORY / f"range-{start}-{end}.y4m"
        _, _, range_frames = read_y4m(range_path)
        if len(range_frames) != end - start + 1:
            failures.append(f"{range_path}: {len(range_frames)} frames, expected {end - start + 1}")
            continue
        mismatched = [start + i for i, frame in enumerate(range_frames) if frame != sequential_frames[start + i]]
        if mismatched:
            failures.append(f"{range_path}: frames {mismatched[:5]} differ from sequential output")


def check_reruns_and_hash(failures: list[str], is_recording: bool) -> None:
    hash_path = EXPECTED_DIRECTORY / "hashes.json"
    sequential_hash = sha256_of_file(OUTPUT_DIRECTORY / "sequential.y4m")
    rerun_hash = sha256_of_file(OUTPUT_DIRECTORY / "rerun.y4m")
    if sequential_hash != rerun_hash:
        failures.append(f"rerun is not byte-identical: {sequential_hash} vs {rerun_hash}")
    if is_recording:
        hash_path.write_text(json.dumps({"sequentialY4mSha256": sequential_hash}, indent=2) + "\n")
        print(f"recorded {hash_path}")
        return
    expected_hash = load_json(hash_path)["sequentialY4mSha256"]
    if sequential_hash != expected_hash:
        failures.append(f"sequential y4m sha256 {sequential_hash} differs from recorded {expected_hash}")


def check_mp4_probe(failures: list[str]) -> None:
    expected = load_json(EXPECTED_DIRECTORY / "ffprobe.json")["streams"][0]
    observed = load_json(OUTPUT_DIRECTORY / "ffprobe.json")["streams"][0]
    for key, want in expected.items():
        got = observed.get(key)
        if got != want:
            failures.append(f"mp4 {key}: expected {want!r}, got {got!r}")


def main() -> int:
    is_recording = "--record" in sys.argv[1:]
    failures: list[str] = []
    expected_info = load_json(EXPECTED_DIRECTORY / "info.json")
    check_info(failures)
    sequential_frames = check_sequential_stream(failures, expected_info)
    check_pixels(failures, sequential_frames, expected_info)
    check_out_of_order_ranges(failures, sequential_frames, load_json(EXPECTED_DIRECTORY / "pixels.json")["outOfOrderRanges"])
    check_reruns_and_hash(failures, is_recording)
    check_mp4_probe(failures)
    if failures:
        for failure in failures:
            print(f"FAIL {failure}")
        return 1
    print("checks passed: info, frame count and dimensions, pixels, out-of-order ranges, rerun bytes, mp4 probe")
    return 0


if __name__ == "__main__":
    sys.exit(main())
