#!/usr/bin/env python3
import hashlib
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output/scaled.svg"
EXPECTED = ROOT / "expected/metrics.json"
NS = {"svg": "http://www.w3.org/2000/svg"}

version = subprocess.run(["vpype", "--version"], check=True, capture_output=True, text=True).stdout.strip()
tree = ET.parse(OUTPUT)
root = tree.getroot()
polylines = root.findall(".//svg:polyline", NS)
assert len(polylines) == 1, f"expected one polyline, got {len(polylines)}"
points = [[float(value) for value in pair.split(",")] for pair in polylines[0].attrib["points"].split()]
assert points == [[10.0, 10.0], [50.0, 10.0], [50.0, 50.0]], points
view_box = [float(value) for value in root.attrib["viewBox"].split()]
assert view_box == [0.0, 0.0, 100.0, 80.0], view_box
first_hash = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
result = {"version": version, "viewBox": view_box, "polyline_points": points, "sha256": first_hash}
if sys.argv[1:] == ["--record"]:
    EXPECTED.parent.mkdir(exist_ok=True)
    EXPECTED.write_text(json.dumps(result, indent=2) + "\n")
else:
    expected = json.loads(EXPECTED.read_text())
    assert result == expected, f"expected {expected}, got {result}"
print(json.dumps(result, sort_keys=True))
print("OK: vpype scaled the path and repeated output matched")
