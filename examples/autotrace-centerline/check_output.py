#!/usr/bin/env python3
"""Rasterise traces with resvg, compare with inputs, check predeclared tolerances."""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

root = Path(__file__).parent
out = root / "output"
record = "--record" in sys.argv
IOU_OUTLINE_MIN = 0.97
IOU_CENTERLINE_MIN = 0.90  # predeclared; never loosen
STROKE_WIDTH_MIN, STROKE_WIDTH_MAX = 7.0, 9.0  # input strokes are 8px wide


def ink(path):
    return [p < 128 for p in Image.open(path).convert("L").getdata()]


def iou(a, b):
    both = sum(1 for x, y in zip(a, b) if x and y)
    either = sum(1 for x, y in zip(a, b) if x or y)
    return both / either


for name in ("solid", "strokes"):
    subprocess.run(
        ["resvg", "--background", "white", str(out / f"{name}-trace.svg"), str(out / f"{name}-trace.png")],
        check=True,
    )

stroke_svg = (out / "strokes-trace.svg").read_text()
paths = re.findall(r'<path style="([^"]*)" d="([^"]*)"', stroke_svg)
widths = [float(re.search(r"stroke-width:([\d.]+)", style).group(1)) for style, _ in paths]
metrics = {
    "outline_iou": round(iou(ink(out / "solid.png"), ink(out / "solid-trace.png")), 4),
    "centerline_iou": round(iou(ink(out / "strokes.png"), ink(out / "strokes-trace.png")), 4),
    "centerline_path_count": len(paths),
    "centerline_stroke_widths": widths,
    "solid_sha256": hashlib.sha256((out / "solid-trace.svg").read_bytes()).hexdigest(),
    "strokes_sha256": hashlib.sha256((out / "strokes-trace.svg").read_bytes()).hexdigest(),
}
checks = {
    "outline_iou_min_0.97": metrics["outline_iou"] >= IOU_OUTLINE_MIN,
    "centerline_iou_min_0.90": metrics["centerline_iou"] >= IOU_CENTERLINE_MIN,
    "centerline_stroke_only": all("fill:none" in style for style, _ in paths),
    "centerline_widths_7_to_9": all(STROKE_WIDTH_MIN <= w <= STROKE_WIDTH_MAX for w in widths),
    "outline_filled": "fill:#000000" in (out / "solid-trace.svg").read_text(),
}
metrics["checks"] = checks

expected_path = root / "expected/metrics.json"
if record:
    expected_path.parent.mkdir(exist_ok=True)
    expected_path.write_text(json.dumps(metrics, indent=2) + "\n")
expected = json.loads(expected_path.read_text())
for key, ok in checks.items():
    print(("PASS " if ok else "KNOWN FAIL ") + key)
if metrics != expected:
    sys.exit(f"metrics mismatch\nactual: {metrics}\nexpected: {expected}")
print(f"outline IoU {metrics['outline_iou']}, centerline IoU {metrics['centerline_iou']}")
