#!/usr/bin/env python3
import hashlib
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
output = root / "output"
expected_path = root / "expected" / "summary.json"
pinned_exiftool_version = "13.50"
predeclared_tags = {
    "Title": "VCR metadata fixture",
    "Rights": "CC0 fixture; no rights claimed",
    "Artist": "VCR fixture",
}
predeclared_tag_flags = ["-XMP-dc:Title", "-XMP-dc:Rights", "-EXIF:Artist"]
metadata_group_prefixes = ("XMP", "EXIF", "IFD0", "IFD1", "ExifIFD")
image_rgba_bytes = 64 * 48 * 4
formats = ("png", "jpg")


def run_capture(command: list[str]) -> bytes:
    completed = subprocess.run(command, check=True, capture_output=True)
    return completed.stdout


def read_exiftool_json(path: Path, flags: list[str]) -> dict[str, object]:
    stdout = run_capture(["exiftool", "-j", *flags, str(path)])
    records = json.loads(stdout)
    assert len(records) == 1, f"expected one record for {path}, got {len(records)}"
    record = dict(records[0])
    record.pop("SourceFile")
    return record


def read_all_grouped_keys(path: Path) -> list[str]:
    stdout = run_capture(["exiftool", "-j", "-a", "-G1", str(path)])
    record = json.loads(stdout)[0]
    return sorted(key for key in record if key != "SourceFile")


def rgba_sha256(path: Path) -> tuple[str, int]:
    raw = run_capture(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "rawvideo", "-pix_fmt", "rgba", "-"]
    )
    return hashlib.sha256(raw).hexdigest(), len(raw)


def check_format(format: str) -> dict[str, object]:
    original = output / f"input.{format}"
    tagged = output / f"tagged.{format}"
    stripped = output / f"stripped.{format}"

    original_hash, original_length = rgba_sha256(original)
    tagged_hash, _ = rgba_sha256(tagged)
    stripped_hash, _ = rgba_sha256(stripped)
    assert original_length == image_rgba_bytes, f"{format}: decoded {original_length} bytes, expected {image_rgba_bytes}"
    assert tagged_hash == original_hash, f"{format}: tagging changed decoded pixels"
    assert stripped_hash == original_hash, f"{format}: stripping changed decoded pixels"

    assert original.read_bytes() != tagged.read_bytes(), f"{format}: tagging left bytes unchanged"
    assert tagged.read_bytes() != stripped.read_bytes(), f"{format}: stripping left bytes unchanged"

    tagged_readback = read_exiftool_json(tagged, predeclared_tag_flags)
    assert tagged_readback == predeclared_tags, f"{format}: read-back {tagged_readback} != {predeclared_tags}"

    stripped_readback = read_exiftool_json(stripped, predeclared_tag_flags)
    assert stripped_readback == {}, f"{format}: stripped file still reports {stripped_readback}"

    stripped_keys = read_all_grouped_keys(stripped)
    surviving = [key for key in stripped_keys if key.split(":")[0].startswith(metadata_group_prefixes)]
    assert surviving == [], f"{format}: metadata groups survived -all=: {surviving}"

    return {
        "pixel_rgba_sha256": original_hash,
        "tagged_readback": tagged_readback,
        "stripped_readback": stripped_readback,
        "stripped_metadata_keys": surviving,
    }


def exiftool_version() -> str:
    return run_capture(["exiftool", "-ver"]).decode().strip()


version = exiftool_version()
assert version == pinned_exiftool_version, f"exiftool {version}, expected {pinned_exiftool_version}"

summary = {
    "exiftool_version": version,
    "image": {"width": 64, "height": 48, "rgba_bytes": image_rgba_bytes},
    "formats": {format: check_format(format) for format in formats},
}
rendered = json.dumps(summary, indent=2, sort_keys=True) + "\n"
if "--record" in sys.argv:
    expected_path.parent.mkdir(parents=True, exist_ok=True)
    expected_path.write_text(rendered)
if not expected_path.exists() or expected_path.read_text() != rendered:
    print("ExifTool summary differs from expected/summary.json", file=sys.stderr)
    sys.exit(1)
print("exiftool-metadata-roundtrip: OK")
