#!/usr/bin/env python3
"""Evaluate every predeclared check, print KNOWN FAIL for failures, write metrics.json.

Exit 1 when any check fails; run.sh then compares against expected/metrics.json.
"""
import hashlib
import json
import math
import re
import subprocess
import sys

import numpy as np

WIDTH, HEIGHT = 128, 96
SDR_PSNR_FLOOR_DB = 30.0
HDR_HIGHLIGHT_FLOOR_10BIT = 900  # SDR source tops out near 0.75 * 1023 = 767
out = sys.argv[1]


def run(command: list[str]) -> str:
    return subprocess.run(command, capture_output=True, text=True, check=True).stdout


def run_bytes(command: list[str]) -> bytes:
    return subprocess.run(command, capture_output=True, check=True).stdout


def sha256(path: str) -> str:
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def first_line(command: list[str]) -> str:
    result = subprocess.run(command, capture_output=True, text=True)
    return (result.stdout + result.stderr).strip().splitlines()[0]


checks: dict[str, bool] = {}
metrics: dict[str, object] = {}
uhdr = f"{out}/uhdr.jpg"
data = open(uhdr, "rb").read()

# 1. Container: JPEG with a Multi-Picture Format directory of two images
checks["starts_with_jpeg_soi"] = data[:2] == b"\xff\xd8"
mpf_count = run(["exiftool", "-s3", "-MPF:NumberOfImages", uhdr]).strip()
metrics["mpf_number_of_images"] = mpf_count
checks["mpf_lists_two_images"] = mpf_count == "2"

# 2. XMP hdrgm gain map description inside the gain map image
gainmap = run_bytes(["exiftool", "-b", "-MPImage2", uhdr])
open(f"{out}/gainmap.jpg", "wb").write(gainmap)
xmp_gain_map_max = run(["exiftool", "-s3", "-XMP-hdrgm:GainMapMax", f"{out}/gainmap.jpg"]).strip()
metrics["xmp_hdrgm_gain_map_max"] = xmp_gain_map_max
checks["xmp_hdrgm_gain_map_max_present"] = xmp_gain_map_max != ""
# Observation only: the ISO 21496-1 APP2 marker
metrics["iso_21496_1_marker_in_primary"] = b"urn:iso:std:iso:ts:21496:-1" in data
metrics["iso_21496_1_marker_in_gainmap"] = b"urn:iso:std:iso:ts:21496:-1" in gainmap

# 3. Library probe reads the gain map metadata
probe = open(f"{out}/probe.txt").read()
boost = re.search(r"--maxContentBoost ([\d.]+)", probe)
metrics["probe_says_ultra_hdr"] = "Ultra HDR Image: Yes" in probe
metrics["probe_max_content_boost"] = float(boost.group(1)) if boost else None
checks["probe_reports_ultra_hdr_with_boost_above_1"] = bool(boost) and metrics["probe_says_ultra_hdr"] and float(boost.group(1)) > 1.0

# 4. A plain JPEG reader decodes the SDR base
identify = run(["magick", "identify", "-format", "%w %h", f"{uhdr}[0]"]).split()
metrics["plain_reader_dimensions"] = [int(v) for v in identify]
ffmpeg = subprocess.run(["ffmpeg", "-v", "error", "-i", uhdr, "-f", "null", "-"], capture_output=True, text=True)
metrics["ffmpeg_decode_exit"] = ffmpeg.returncode
checks["plain_readers_decode_128x96"] = identify == [str(WIDTH), str(HEIGHT)] and ffmpeg.returncode == 0

# 5. The SDR base matches the SDR input
source = np.fromfile(f"{out}/sdr_{WIDTH}x{HEIGHT}.rgba8888", dtype=np.uint8).reshape(HEIGHT, WIDTH, 4)[..., :3]
decoded_rgb = np.frombuffer(run_bytes(["magick", f"{uhdr}[0]", "-depth", "8", "RGB:-"]), dtype=np.uint8).reshape(HEIGHT, WIDTH, 3)
mse = float(np.mean((source.astype(float) - decoded_rgb.astype(float)) ** 2))
psnr = float("inf") if mse == 0 else 10 * math.log10(255 * 255 / mse)
metrics["sdr_base_psnr_db"] = round(psnr, 2)
checks["sdr_base_psnr_at_least_30_db"] = psnr >= SDR_PSNR_FLOOR_DB

# 6. Full decode: HDR highlights exceed the SDR ceiling; sRGB decode has the right size
hlg = np.fromfile(f"{out}/decoded-hlg.rgba1010102", dtype="<u4").reshape(HEIGHT, WIDTH)
highlight_peak = int((hlg[24:72, 70:] & 1023).max())
metrics["hdr_decode_highlight_peak_10bit"] = highlight_peak
checks["hdr_decode_highlight_above_900_of_1023"] = highlight_peak >= HDR_HIGHLIGHT_FLOOR_10BIT
srgb_bytes = len(open(f"{out}/decoded-srgb.rgba8888", "rb").read())
metrics["srgb_decode_bytes"] = srgb_bytes
checks["srgb_decode_is_128x96_rgba8888"] = srgb_bytes == WIDTH * HEIGHT * 4

# 7. Negative control: a plain JPEG has no gain map
plain_status = int(open(f"{out}/probe-plain.status").read())
metrics["plain_jpeg_probe_exit"] = plain_status
checks["plain_jpeg_probe_rejected"] = plain_status != 0

# 8. Repeatability and sizes
checks["repeat_encode_byte_identical"] = sha256(uhdr) == sha256(f"{out}/uhdr-repeat.jpg")
metrics["uhdr_bytes"] = len(data)
metrics["gainmap_bytes"] = len(gainmap)
metrics["uhdr_sha256"] = sha256(uhdr)

usage = open(f"{out}/usage.txt").read()
metrics["versions"] = {
    "ultrahdr_app": re.search(r"lib version: (\S+)", usage).group(1),
    "exiftool": run(["exiftool", "-ver"]).strip(),
    "imagemagick": first_line(["magick", "-version"]),
    "ffmpeg": first_line(["ffmpeg", "-version"]),
    "numpy": np.__version__,
    "python": sys.version.split()[0],
}
metrics["checks"] = checks

failed = [name for name, ok in checks.items() if not ok]
for name in failed:
    print(f"KNOWN FAIL: {name}")
with open(f"{out}/metrics.json", "w") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
print(f"{len(checks) - len(failed)} of {len(checks)} predeclared checks pass")
sys.exit(1 if failed else 0)
