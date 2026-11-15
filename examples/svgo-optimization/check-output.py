#!/usr/bin/env python3
import hashlib
import json
import os
import sys
import xml.etree.ElementTree as ET

source_path, output_path, version_path, metrics_path = sys.argv[1:]
source = open(source_path, "rb").read()
optimized = open(output_path, "rb").read()
version = open(version_path, encoding="utf-8").read().strip()
root = ET.fromstring(optimized)

assert root.tag == "{http://www.w3.org/2000/svg}svg", "unexpected SVG root"
assert root.attrib.get("viewBox") == "0 0 100 100", "viewBox changed"
ids = sorted(element.attrib["id"] for element in root.iter() if "id" in element.attrib)
assert "motion-target" in ids, "motion-target ID was removed or renamed"
assert len(optimized) < len(source), "fixture was not reduced"

metrics = {
    "version": version,
    "input_bytes": len(source),
    "output_bytes": len(optimized),
    "sha256": hashlib.sha256(optimized).hexdigest(),
    "viewBox": root.attrib["viewBox"],
    "ids": ids,
}
with open(metrics_path, "w", encoding="utf-8") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
