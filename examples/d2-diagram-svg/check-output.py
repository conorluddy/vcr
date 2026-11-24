#!/usr/bin/env python3
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET

EXPECTED_NODE_LABELS = ["Inspect", "Layout", "SVG", "Source"]
EXPECTED_NODE_COUNT = 4
EXPECTED_EDGE_COUNT = 3


def localName(element: ET.Element) -> str:
    return element.tag.split("}")[-1]


def classTokens(element: ET.Element) -> set[str]:
    return set(element.attrib.get("class", "").split())


def textContent(element: ET.Element) -> str:
    return "".join(element.itertext()).strip()


source_path, output_path, version_path, metrics_path = sys.argv[1:]
source = open(source_path, "rb").read()
output = open(output_path, "rb").read()
version_line = open(version_path, encoding="utf-8").read().strip()
assert re.fullmatch(r"[0-9.]+", version_line), f"could not parse D2 version from {version_line!r}"
version = version_line

root = ET.fromstring(output)
assert localName(root) == "svg", f"unexpected SVG root {root.tag!r}"
assert root.attrib.get("viewBox"), "SVG viewBox is missing"
viewBoxValues = [float(value) for value in root.attrib["viewBox"].split()]
assert len(viewBoxValues) == 4 and viewBoxValues[2] > 0 and viewBoxValues[3] > 0, "SVG viewBox has no positive size"

texts = {textContent(element) for element in root.iter() if localName(element) == "text"}
missing_labels = [label for label in EXPECTED_NODE_LABELS if label not in texts]
assert not missing_labels, f"labels missing from SVG text: {missing_labels}"

shape_groups = [element for element in root.iter() if localName(element) == "g" and "shape" in classTokens(element)]
edge_paths = [
    element
    for element in root.iter()
    if localName(element) == "path" and "connection" in classTokens(element) and any(token.startswith("stroke-") for token in classTokens(element))
]
assert len(shape_groups) == EXPECTED_NODE_COUNT, f"expected {EXPECTED_NODE_COUNT} shape groups, found {len(shape_groups)}"
assert len(edge_paths) == EXPECTED_EDGE_COUNT, f"expected {EXPECTED_EDGE_COUNT} connection paths, found {len(edge_paths)}"

metrics = {
    "version": version,
    "input_sha256": hashlib.sha256(source).hexdigest(),
    "svg_sha256": hashlib.sha256(output).hexdigest(),
    "svg_bytes": len(output),
    "viewBox": root.attrib["viewBox"],
    "labels_present": sorted(label for label in texts if label in EXPECTED_NODE_LABELS),
    "shape_group_count": len(shape_groups),
    "connection_path_count": len(edge_paths),
}
with open(metrics_path, "w", encoding="utf-8") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
