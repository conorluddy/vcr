#!/usr/bin/env python3
# Checks the generated GLB and the two gltfjsx TSX runs against predeclared facts, then writes a summary.
import hashlib
import json
import re
import struct
import sys
from pathlib import Path

GLB_PATH, FIRST_TSX_PATH, SECOND_TSX_PATH, SUMMARY_PATH = sys.argv[1:5]
GLTFJSX_VERSION = "6.5.3"
PREDECLARED_NODE_NAMES = ["Body", "Clasp", "CrateGroup"]
PREDECLARED_MATERIAL_NAMES = ["Metal", "Wood"]
PREDECLARED_MESH_ELEMENTS = 2
REQUIRED_SUBSTRINGS = ["type GLTFResult", "export function Model", "useGLTF(", "nodes.Body", "nodes.Clasp", "materials.Wood", "materials.Metal"]


def fail(message: str) -> None:
    print(f"check-output: FAIL {message}", file=sys.stderr)
    sys.exit(1)


def sha256_of(path: str) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def read_glb_json(path: str) -> dict:
    data = Path(path).read_bytes()
    magic, version, total_length = struct.unpack_from("<III", data, 0)
    if magic != 0x46546C67 or version != 2 or total_length != len(data):
        fail(f"{path} is not a valid GLB 2.0 container")
    json_length, json_type = struct.unpack_from("<II", data, 12)
    if json_type != 0x4E4F534A:
        fail(f"{path} first chunk is not JSON")
    return json.loads(data[20 : 20 + json_length])


def check_glb(path: str) -> dict:
    document = read_glb_json(path)
    node_names = sorted(node["name"] for node in document["nodes"] if "name" in node)
    material_names = sorted(material["name"] for material in document["materials"])
    mesh_count = len(document["meshes"])
    if node_names != sorted(PREDECLARED_NODE_NAMES):
        fail(f"GLB node names {node_names} differ from predeclared {sorted(PREDECLARED_NODE_NAMES)}")
    if material_names != sorted(PREDECLARED_MATERIAL_NAMES):
        fail(f"GLB material names {material_names} differ from predeclared {sorted(PREDECLARED_MATERIAL_NAMES)}")
    if mesh_count != PREDECLARED_MESH_ELEMENTS:
        fail(f"GLB mesh count {mesh_count} differs from predeclared {PREDECLARED_MESH_ELEMENTS}")
    return {"sha256": sha256_of(path), "node_names": node_names, "material_names": material_names, "mesh_count": mesh_count}


def check_tsx(path: str) -> dict:
    text = Path(path).read_text(encoding="utf-8")
    missing = [needle for needle in REQUIRED_SUBSTRINGS if needle not in text]
    if missing:
        fail(f"{path} lacks {missing}")
    mesh_elements = len(re.findall(r"<mesh[\s>]", text))
    if mesh_elements != PREDECLARED_MESH_ELEMENTS:
        fail(f"{path} has {mesh_elements} <mesh> elements, predeclared {PREDECLARED_MESH_ELEMENTS}")
    names_found = {name: bool(re.search(rf"\b{name}\b", text)) for name in PREDECLARED_NODE_NAMES + PREDECLARED_MATERIAL_NAMES}
    return {"sha256": sha256_of(path), "bytes": Path(path).stat().st_size, "mesh_elements": mesh_elements, "names_found": names_found}


def read_installed_gltfjsx_version() -> str:
    package = json.loads(Path("node_modules/gltfjsx/package.json").read_text(encoding="utf-8"))
    return str(package["version"])


def main() -> None:
    installed_version = read_installed_gltfjsx_version()
    if installed_version != GLTFJSX_VERSION:
        fail(f"installed gltfjsx {installed_version} differs from pinned {GLTFJSX_VERSION}")
    if Path(FIRST_TSX_PATH).read_bytes() != Path(SECOND_TSX_PATH).read_bytes():
        fail("two gltfjsx runs over the same GLB are not byte-identical")
    tsx = check_tsx(FIRST_TSX_PATH)
    summary = {
        "gltfjsx_version": installed_version,
        "glb": check_glb(GLB_PATH),
        "tsx": tsx,
        "rerun_byte_identical": True,
        "typecheck": "not-run",
        "render": "not-run",
    }
    Path(SUMMARY_PATH).write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    absent_names = [name for name, found in tsx["names_found"].items() if not found]
    if absent_names:
        fail(f"{FIRST_TSX_PATH} does not reference predeclared names {absent_names}; summary written to {SUMMARY_PATH}")


main()
