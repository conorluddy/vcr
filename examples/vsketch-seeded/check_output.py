import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"svg": "http://www.w3.org/2000/svg"}
path = Path("output/sketch_s1701.svg")
root = ET.parse(path).getroot()
lines = root.findall(".//svg:line", NS)
assert root.attrib["viewBox"] == "0 0 377.9527559055118 302.3622047244095"
assert len(lines) == 2
coordinates = [[line.attrib[key] for key in ("x1", "y1", "x2", "y2")] for line in lines]
assert coordinates == [["181.557", "141.1811", "196.3958", "141.1811"], ["196.3958", "141.1811", "196.3958", "161.1811"]]
metrics = {
    "tool_version": "1.2.0",
    "viewBox": root.attrib["viewBox"],
    "layer_ids": [layer.attrib["id"] for layer in root.findall(".//svg:g", NS)],
    "line_count": len(lines),
    "coordinates": coordinates,
    "sha256": __import__("hashlib").sha256(json.dumps(coordinates, separators=(",", ":")).encode()).hexdigest(),
}
expected_path = Path("expected/metrics.json")
encoded = json.dumps(metrics, indent=2, sort_keys=True) + "\n"
if sys.argv[1:] == ["--record"]:
    expected_path.parent.mkdir(exist_ok=True)
    expected_path.write_text(encoded)
elif not expected_path.exists() or expected_path.read_text() != encoded:
    raise SystemExit("SVG geometry differs from expected/metrics.json; inspect output/sketch_s1701.svg")
print("OK vsketch SVG geometry: 2 seeded lines, expected viewBox, geometry hash " + metrics["sha256"])
