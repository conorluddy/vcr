#!/usr/bin/env python3
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET

source_path, output_path, version_path, metrics_path = sys.argv[1:]
source = open(source_path, "rb").read()
output = open(output_path, "rb").read()
version_line = open(version_path, encoding="utf-8").read().strip()
match = re.fullmatch(r"dot - graphviz version ([0-9.]+) \(.+\)", version_line)
assert match, f"could not parse exact Graphviz version from {version_line!r}"
version = match.group(1)

root = ET.fromstring(output)
assert root.tag == "{http://www.w3.org/2000/svg}svg", "unexpected SVG root"
assert root.attrib.get("viewBox"), "SVG viewBox is missing"
assert float(root.attrib["width"].removesuffix("pt")) > 0, "SVG width is not positive"
assert float(root.attrib["height"].removesuffix("pt")) > 0, "SVG height is not positive"

groups = [element for element in root.iter() if element.tag.endswith("}g")]
node_groups = [element for element in groups if "node" in element.attrib.get("class", "").split()]
edge_groups = [element for element in groups if "edge" in element.attrib.get("class", "").split()]
node_titles = sorted(child.text for group in node_groups for child in group if child.tag.endswith("}title"))
edge_titles = sorted(child.text for group in edge_groups for child in group if child.tag.endswith("}title"))
assert node_titles == ["inspect", "layout", "render", "source"], node_titles
assert edge_titles == ["layout->render", "render->inspect", "source->layout"], edge_titles

metrics = {
    "version": version,
    "input_sha256": hashlib.sha256(source).hexdigest(),
    "svg_sha256": hashlib.sha256(output).hexdigest(),
    "svg_bytes": len(output),
    "viewBox": root.attrib["viewBox"],
    "node_titles": node_titles,
    "edge_titles": edge_titles,
}
with open(metrics_path, "w", encoding="utf-8") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
