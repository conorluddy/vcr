#!/usr/bin/env python3
"""Compare node boxes of two reladraw SVGs: v2 adds one node to v1."""
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET

v1_path, v2_path, version_path, metrics_path = sys.argv[1:]
VERSION = "0.32.1"
V1_LABELS = ["Source", "Layout", "SVG"]
V2_LABELS = ["Source", "Layout", "SVG", "Inspect"]


def local(element):
    return element.tag.split("}")[-1]


def parse(path, labels, edge_count):
    data = open(path, "rb").read()
    root = ET.fromstring(data)
    assert local(root) == "svg" and root.attrib.get("viewBox"), f"{path}: not an SVG with a viewBox"
    # Node boxes are the only rounded-rect <path> elements that have a fill and stroke; pair each with the next <text>.
    nodes = {}
    pending = None
    for element in root.iter():
        name = local(element)
        if name == "path" and element.attrib.get("stroke") and element.attrib.get("d", "").startswith("M"):
            if "a8 8" in element.attrib["d"]:
                pending = element.attrib["d"]
        elif name == "text" and pending is not None:
            nodes[(element.text or "").strip()] = pending
            pending = None
    assert sorted(nodes) == sorted(labels), f"{path}: labels {sorted(nodes)} != {sorted(labels)}"
    lines = [e for e in root.iter() if local(e) == "line" and e.attrib.get("marker-end")]
    assert len(lines) == edge_count, f"{path}: expected {edge_count} arrows, found {len(lines)}"
    return data, root.attrib["viewBox"], nodes


version = open(version_path, encoding="utf-8").read().strip()
assert version == VERSION, f"expected reladraw {VERSION}, got {version!r}"
d1, box1, nodes1 = parse(v1_path, V1_LABELS, 2)
d2, box2, nodes2 = parse(v2_path, V2_LABELS, 3)

# The claim: every node v1 already had is drawn at the same place in v2.
moved = [label for label in V1_LABELS if nodes1[label] != nodes2[label]]
if moved:
    print(f"KNOWN FAIL: nodes moved between v1 and v2: {moved}")
shared = [label for label in V1_LABELS if nodes1[label] == nodes2[label]]

metrics = {
    "version": version,
    "v1_sha256": hashlib.sha256(d1).hexdigest(),
    "v2_sha256": hashlib.sha256(d2).hexdigest(),
    "v1_viewBox": box1,
    "v2_viewBox": box2,
    "nodes_v1": len(nodes1),
    "nodes_v2": len(nodes2),
    "arrows_v1": 2,
    "arrows_v2": 3,
    "nodes_unmoved": shared,
    "nodes_moved": moved,
}
with open(metrics_path, "w", encoding="utf-8") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
