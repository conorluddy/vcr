#!/usr/bin/env python3
"""Checks mmdr and mmdc outputs for the owned flowchart; writes or compares expected/result.json."""
import argparse
import hashlib
import json
import struct
import xml.etree.ElementTree as ET
from pathlib import Path

EXPECTED_LABELS = {"Start", "Review", "Done", "Draft", "pass", "revise"}
EXPECTED_NODES = 4
EXPECTED_EDGES = 4
PNG_TOLERANCE_PX = 1
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def localName(element: ET.Element) -> str:
    return element.tag.rsplit("}", 1)[-1]


def classTokens(element: ET.Element) -> set[str]:
    return set(element.get("class", "").split())


SHAPE_TAGS = {"rect", "polygon", "path", "circle", "ellipse"}


def isMmdrNode(element: ET.Element) -> bool:
    # mmdr 0.3.1 draws each node as an untagged <g transform> holding one shape; its label <text> is a sibling.
    if localName(element) != "g" or classTokens(element):
        return False
    childTags = [localName(child) for child in element]
    return len(childTags) == 1 and childTags[0] in SHAPE_TAGS


def isMmdrEdge(element: ET.Element) -> bool:
    return localName(element) == "path" and "edgePath" in classTokens(element)


def isMmdcEdge(element: ET.Element) -> bool:
    return element.get("data-edge") == "true"


def isMmdcNode(element: ET.Element) -> bool:
    return localName(element) == "g" and "node" in classTokens(element)


def summariseSvg(path: Path, isNode, isEdge) -> dict:
    try:
        root = ET.fromstring(path.read_bytes())
    except ET.ParseError as error:
        raise SystemExit(f"{path.name} is not well-formed XML: {error}")
    texts = {"".join(el.itertext()).strip() for el in root.iter() if localName(el) in {"p", "text"}}
    missingLabels = EXPECTED_LABELS - texts
    if missingLabels:
        raise SystemExit(f"{path.name}: missing SVG labels {sorted(missingLabels)}; found {sorted(texts)}")
    nodes = [el for el in root.iter() if isNode(el)]
    edges = [el for el in root.iter() if isEdge(el)]
    if len(nodes) != EXPECTED_NODES or len(edges) != EXPECTED_EDGES:
        raise SystemExit(f"{path.name}: expected {EXPECTED_NODES} nodes and {EXPECTED_EDGES} edges, got {len(nodes)} and {len(edges)}")
    width = root.get("width")
    viewBox = root.get("viewBox")
    if not width or not viewBox or len(viewBox.split()) != 4:
        raise SystemExit(f"{path.name}: missing SVG dimensions width={width!r} viewBox={viewBox!r}")
    return {"nodes": len(nodes), "edges": len(edges), "labels": sorted(EXPECTED_LABELS & texts), "width": width, "viewBox": viewBox}


def pngDimensions(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if not data.startswith(PNG_SIGNATURE) or data[12:16] != b"IHDR":
        raise SystemExit(f"{path.name} is not a PNG with an IHDR chunk")
    return struct.unpack(">II", data[16:24])


def sizeFromMmdrOutput(sizeText: str) -> tuple[float, float]:
    try:
        sizeJson = json.loads(sizeText)
    except json.JSONDecodeError as error:
        raise SystemExit(f"mmdr --size did not print JSON ({error}): {sizeText!r}")
    width = sizeJson.get("width")
    height = sizeJson.get("height")
    if not isinstance(width, (int, float)) or not isinstance(height, (int, float)):
        raise SystemExit(f"mmdr --size JSON lacks numeric width/height: {sizeText!r}")
    return float(width), float(height)


def buildSummary(args: argparse.Namespace) -> dict:
    firstBytes = args.mmdr_svg.read_bytes()
    repeatMatches = firstBytes == args.mmdr_svg_repeat.read_bytes()
    if not repeatMatches:
        raise SystemExit("mmdr repeat render differs byte-for-byte")
    mmdrSummary = summariseSvg(args.mmdr_svg, isMmdrNode, isMmdrEdge)
    mmdcSummary = summariseSvg(args.mmdc_svg, isMmdcNode, isMmdcEdge)
    if mmdrSummary["nodes"] != mmdcSummary["nodes"] or mmdrSummary["edges"] != mmdcSummary["edges"]:
        raise SystemExit("mmdr and mmdc disagree on node or edge counts")
    if mmdrSummary["labels"] != mmdcSummary["labels"]:
        raise SystemExit(f"mmdr labels {mmdrSummary['labels']} differ from mmdc labels {mmdcSummary['labels']}")
    pngWidth, pngHeight = pngDimensions(args.mmdr_png)
    sizeWidth, sizeHeight = sizeFromMmdrOutput(args.mmdr_size_json.read_text())
    if abs(pngWidth - sizeWidth) > PNG_TOLERANCE_PX or abs(pngHeight - sizeHeight) > PNG_TOLERANCE_PX:
        raise SystemExit(f"PNG {pngWidth}x{pngHeight} differs from mmdr --size {sizeWidth}x{sizeHeight} beyond {PNG_TOLERANCE_PX}px")
    return {
        "mmdr": {
            **mmdrSummary,
            "sha256": hashlib.sha256(firstBytes).hexdigest(),
            "repeat_matches": repeatMatches,
            "png_width": pngWidth,
            "png_height": pngHeight,
        },
        "mmdc_comparison": {"labels_match": True, "nodes": mmdcSummary["nodes"], "edges": mmdcSummary["edges"]},
        # labels_match is enforced above: the run aborts unless the two label sets are equal.
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mmdr-svg", type=Path, required=True)
    parser.add_argument("--mmdr-svg-repeat", type=Path, required=True)
    parser.add_argument("--mmdr-png", type=Path, required=True)
    parser.add_argument("--mmdr-size-json", type=Path, required=True)
    parser.add_argument("--mmdc-svg", type=Path, required=True)
    parser.add_argument("--record", type=Path)
    parser.add_argument("--expected", type=Path)
    args = parser.parse_args()
    if bool(args.record) == bool(args.expected):
        raise SystemExit("usage: pass exactly one of --record PATH or --expected PATH")
    rendered = json.dumps(buildSummary(args), indent=2, sort_keys=True) + "\n"
    if args.record:
        args.record.parent.mkdir(parents=True, exist_ok=True)
        args.record.write_text(rendered)
        print(f"RECORDED {args.record}")
        return
    if rendered != args.expected.read_text():
        raise SystemExit(f"summary differs from {args.expected}:\n{rendered}")
    print("OK: mmdr SVG and PNG checks, repeat bytes and mmdc comparison match expected/result.json")


if __name__ == "__main__":
    main()
