"""Predeclared checks for the ntsc-rs preset fixture; writes metrics.json."""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

out = Path(sys.argv[1])


def frame_hashes(name):
    text = subprocess.run(["ffmpeg", "-v", "error", "-i", str(out / name), "-f", "framemd5", "-"],
                          check=True, capture_output=True, text=True).stdout
    return [line.split(",")[-1].strip() for line in text.splitlines() if line and not line.startswith("#")]


def psnr_db(name):
    text = subprocess.run(["ffmpeg", "-i", str(out / "src.mp4"), "-i", str(out / name), "-lavfi", "psnr", "-f", "null", "-"],
                          check=True, capture_output=True, text=True).stderr
    return float(re.search(r"average:([\d.]+)", text).group(1))


def probe(name):
    return subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames",
                           "-show_entries", "stream=codec_name,width,height,nb_read_frames", "-of", "csv=p=0", str(out / name)],
                          check=True, capture_output=True, text=True).stdout.strip()


a, b, c = frame_hashes("a.mkv"), frame_hashes("b.mkv"), frame_hashes("c.mkv")
src = frame_hashes("src.mp4")
psnr = psnr_db("a.mkv")
failures = []
if probe("a.mkv") != "ffv1,320,240,10":
    failures.append(f"output stream {probe('a.mkv')}")
if a != b:
    failures.append("same preset and seed gave different frames")
if sum(x != y for x, y in zip(a, c)) < 10:
    failures.append("different seed left some frames identical")
if any(x == y for x, y in zip(a, src)):
    failures.append("some frames unchanged from source")
if not 10 < psnr < 25:
    failures.append(f"PSNR vs source {psnr} dB outside (10, 25)")
if failures:
    print("FAIL:", "; ".join(failures))
    sys.exit(1)

metrics = {
    "version": (out / "version.txt").read_text().strip(),
    "stream": probe("a.mkv"),
    "frames": len(a),
    "frame_md5_digest": hashlib.sha256("".join(a).encode()).hexdigest(),
    "seed2_frame_md5_digest": hashlib.sha256("".join(c).encode()).hexdigest(),
    "psnr_vs_source_db": round(psnr, 1),
    "repeat_identical": True,
    "frames_differing_between_seeds": sum(x != y for x, y in zip(a, c)),
}
(out / "metrics.json").write_text(json.dumps(metrics, indent=2) + "\n")
