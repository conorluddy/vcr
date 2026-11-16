#!/usr/bin/env python3
import hashlib
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

first, second = map(Path, sys.argv[1:3])
mode, expected_path = sys.argv[3], Path(sys.argv[4])
data = first.read_bytes()
root = ET.fromstring(data)
if data != second.read_bytes():
    raise SystemExit("repeat render differs byte-for-byte")

texts = ["".join(el.itertext()).strip() for el in root.iter() if el.tag.rsplit("}", 1)[-1] in {"p", "text"}]
expected = {"Start", "Review", "Done", "Draft", "pass", "revise"}
missing = expected - set(texts)
if missing:
    raise SystemExit(f"missing SVG text labels: {sorted(missing)}; found {texts}")
nodes = [el for el in root.iter() if el.tag.rsplit("}", 1)[-1] == "g" and "node" in el.get("class", "").split()]
edges = [el for el in root.iter() if el.get("data-edge") == "true"]
if len(nodes) != 4 or len(edges) != 4:
    raise SystemExit(f"expected 4 node and 4 edge groups, got {len(nodes)} and {len(edges)}")
width = root.get("width")
viewbox = root.get("viewBox")
if not width or not viewbox or len(viewbox.split()) != 4:
    raise SystemExit(f"missing SVG dimensions: width={width!r}, viewBox={viewbox!r}")
actual = {
    "nodes": len(nodes),
    "edges": len(edges),
    "labels": sorted(expected),
    "width": width,
    "viewBox": viewbox,
    "sha256": hashlib.sha256(data).hexdigest(),
    "repeat_matches": True,
}
rendered = json.dumps(actual, indent=2, sort_keys=True) + "\n"
if mode == "--record":
    expected_path.parent.mkdir(parents=True, exist_ok=True)
    expected_path.write_text(rendered)
    print(f"RECORDED {expected_path}")
elif mode == "--expected":
    expected_text = expected_path.read_text()
    if rendered != expected_text:
        raise SystemExit(f"metrics differ from {expected_path}:\n{rendered}")
    print("OK: SVG metrics and repeated bytes match expected/result.json")
else:
    raise SystemExit("usage: check_output.py FIRST.svg SECOND.svg (--record|--expected) EXPECTED.json")
