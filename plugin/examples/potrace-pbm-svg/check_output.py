#!/usr/bin/env python3
import hashlib
import json
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).parent
output = root / "output/trace.svg"
svg = ET.parse(output).getroot()
ns = {"svg": "http://www.w3.org/2000/svg"}
paths = svg.findall(".//svg:path", ns)
assert svg.tag.endswith("svg")
assert svg.attrib.get("viewBox")
assert len(paths) == 1, f"expected one traced path, got {len(paths)}"
data = paths[0].attrib.get("d", "")
move_commands = data.count("M") + data.count("m")
assert move_commands >= 2, "expected outer and inner contours in path data"
metrics = {
    "viewBox": svg.attrib["viewBox"],
    "path_count": len(paths),
    "move_commands": move_commands,
    "path_data_bytes": len(data.encode()),
    "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
}
(root / "output/metrics.json").write_text(json.dumps(metrics, indent=2) + "\n")
expected_path = root / "expected/metrics.json"
if len(__import__("sys").argv) > 1 and __import__("sys").argv[1] == "--record":
    expected_path.write_text(json.dumps(metrics, indent=2) + "\n")
else:
    expected = json.loads(expected_path.read_text())
    assert metrics == expected, f"metrics mismatch\nactual: {metrics}\nexpected: {expected}"
print("Potrace SVG structure and metrics OK")
