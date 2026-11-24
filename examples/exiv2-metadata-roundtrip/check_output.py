#!/usr/bin/env python3
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
output = root / "output"
expected_path = root / "expected" / "summary.json"
pinned_exiv2_version = "0.28.9"
pinned_exiftool_version = "13.50"
predeclared_exiv2_keys = {
    "Xmp.dc.title": "VCR metadata fixture",
    "Xmp.dc.rights": "CC0 fixture; no rights claimed",
    "Exif.Image.Artist": "VCR fixture",
    "Iptc.Application2.Caption": "VCR caption fixture",
}
predeclared_exiftool_tags = {
    "Title": "VCR metadata fixture",
    "Rights": "CC0 fixture; no rights claimed",
    "Artist": "VCR fixture",
    "Caption-Abstract": "VCR caption fixture",
}
predeclared_exiftool_flags = ["-XMP-dc:Title", "-XMP-dc:Rights", "-EXIF:Artist", "-IPTC:Caption-Abstract"]
exiv2_lang_alt_prefix = 'lang="x-default" '
metadata_key_prefixes = ("Xmp.", "Exif.", "Iptc.")
metadata_group_prefixes = ("XMP", "EXIF", "IFD0", "IFD1", "ExifIFD", "IPTC")
image_rgba_bytes = 64 * 48 * 4
print_line_pattern = re.compile(r"^(\S+)\s+(\S+)\s+(\d+)\s+(.*)$")


def run_capture(command: list[str]) -> bytes:
    completed = subprocess.run(command, check=True, capture_output=True)
    return completed.stdout


def exiv2_version() -> str:
    first_line = run_capture(["exiv2", "--version"]).decode().splitlines()[0]
    return first_line.split()[1]


def exiftool_version() -> str:
    return run_capture(["exiftool", "-ver"]).decode().strip()


def read_exiv2_print(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in run_capture(["exiv2", "-pa", str(path)]).decode().splitlines():
        match = print_line_pattern.match(line)
        if match is None:
            continue
        key, _type, _count, value = match.groups()
        if key.startswith(metadata_key_prefixes) and value.startswith(exiv2_lang_alt_prefix):
            value = value[len(exiv2_lang_alt_prefix):]
        assert key not in values, f"{path.name}: key {key} printed twice"
        values[key] = value
    return values


def read_exiftool_json(path: Path, flags: list[str]) -> dict[str, object]:
    records = json.loads(run_capture(["exiftool", "-j", *flags, str(path)]))
    assert len(records) == 1, f"expected one record for {path}, got {len(records)}"
    record = dict(records[0])
    record.pop("SourceFile")
    return record


def read_all_grouped_keys(path: Path) -> list[str]:
    record = json.loads(run_capture(["exiftool", "-j", "-a", "-G1", str(path)]))[0]
    return sorted(key for key in record if key != "SourceFile")


def rgba_sha256(path: Path) -> tuple[str, int]:
    raw = run_capture(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "rawvideo", "-pix_fmt", "rgba", "-"]
    )
    return hashlib.sha256(raw).hexdigest(), len(raw)


def check_jpeg_roundtrip() -> dict[str, object]:
    original = output / "input.jpg"
    tagged = output / "tagged.jpg"
    stripped = output / "stripped.jpg"

    original_hash, original_length = rgba_sha256(original)
    tagged_hash, _ = rgba_sha256(tagged)
    stripped_hash, _ = rgba_sha256(stripped)
    assert original_length == image_rgba_bytes, f"decoded {original_length} bytes, expected {image_rgba_bytes}"
    assert tagged_hash == original_hash, "tagging changed decoded pixels"
    assert stripped_hash == original_hash, "stripping changed decoded pixels"

    assert original.read_bytes() != tagged.read_bytes(), "tagging left bytes unchanged"
    assert tagged.read_bytes() != stripped.read_bytes(), "stripping left bytes unchanged"

    exiv2_readback = read_exiv2_print(tagged)
    exiv2_predeclared_found = {key: exiv2_readback.get(key) for key in predeclared_exiv2_keys}
    assert exiv2_predeclared_found == predeclared_exiv2_keys, (
        f"exiv2 read-back {exiv2_predeclared_found} != {predeclared_exiv2_keys}"
    )

    exiftool_readback = read_exiftool_json(tagged, predeclared_exiftool_flags)
    assert exiftool_readback == predeclared_exiftool_tags, (
        f"exiftool read of exiv2 tags {exiftool_readback} != {predeclared_exiftool_tags}"
    )

    stripped_exiv2 = read_exiv2_print(stripped)
    surviving_exiv2 = sorted(key for key in stripped_exiv2 if key.startswith(metadata_key_prefixes))
    assert surviving_exiv2 == [], f"exiv2 keys survived rm: {surviving_exiv2}"

    stripped_keys = read_all_grouped_keys(stripped)
    surviving_exiftool = [key for key in stripped_keys if key.split(":")[0].startswith(metadata_group_prefixes)]
    assert surviving_exiftool == [], f"exiftool metadata groups survived rm: {surviving_exiftool}"

    return {
        "pixel_rgba_sha256": original_hash,
        "exiv2_readback": exiv2_predeclared_found,
        "exiftool_readback_of_exiv2_tags": exiftool_readback,
        "stripped_exiv2_keys": surviving_exiv2,
        "stripped_exiftool_metadata_keys": surviving_exiftool,
    }


version_exiv2 = exiv2_version()
version_exiftool = exiftool_version()
assert version_exiv2 == pinned_exiv2_version, f"exiv2 {version_exiv2}, expected {pinned_exiv2_version}"
assert version_exiftool == pinned_exiftool_version, f"exiftool {version_exiftool}, expected {pinned_exiftool_version}"

summary = {
    "exiv2_version": version_exiv2,
    "exiftool_version": version_exiftool,
    "image": {"width": 64, "height": 48, "rgba_bytes": image_rgba_bytes},
    "formats": {"jpg": check_jpeg_roundtrip()},
}
rendered = json.dumps(summary, indent=2, sort_keys=True) + "\n"
if "--record" in sys.argv:
    expected_path.parent.mkdir(parents=True, exist_ok=True)
    expected_path.write_text(rendered)
if not expected_path.exists() or expected_path.read_text() != rendered:
    print("Exiv2 summary differs from expected/summary.json", file=sys.stderr)
    sys.exit(1)
print("exiv2-metadata-roundtrip: OK")
