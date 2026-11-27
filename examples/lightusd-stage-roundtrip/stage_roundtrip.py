"""Author a stage with lightusd, save .usda/.usdc/.usdz, reload with lightusd and read with usd-core."""
import hashlib
import json
import struct
import sys
import zipfile
from pathlib import Path

import lightusd
from pxr import Usd

FRAMES = [0, 6, 12, 18, 24]
SHUFFLED = [24, 0, 18, 6, 12]
PRIMS = {
    "/World": "Xform", "/World/Cube": "Cube", "/World/Sphere": "Sphere",
    "/World/Looks": "Scope", "/World/Looks/RedMat": "Material",
    "/World/Looks/RedMat/PreviewSurface": "Shader",
}
META = {"metersPerUnit": 0.01, "upAxis": "Y", "defaultPrim": "World",
        "startTimeCode": 0.0, "endTimeCode": 24.0, "timeCodesPerSecond": 24.0}
TRANSLATE = {str(f): [2.0 * f, 0.0, 0.0] for f in FRAMES}
EXPECTED_VALUES = {"cube_size": 2.0, "sphere_radius": 0.5, "sphere_translate": [0.0, 3.0, 0.0],
                   "diffuse_color": [1.0, 0.0, 0.0], "binding": ["/World/Looks/RedMat"]}


def author(path_stem: Path) -> None:
    stage = lightusd.Stage.create()
    stage.define_prim("/World", "Xform")
    stage.set_default_prim("World")
    for key, value in (("metersPerUnit", 0.01), ("upAxis", "Y"), ("startTimeCode", 0.0),
                       ("endTimeCode", 24.0), ("timeCodesPerSecond", 24.0)):
        stage.set_metadata(key, value)
    cube = stage.define_prim("/World/Cube", "Cube")
    cube.set("size", 2.0)
    for frame in FRAMES:
        cube.set("xformOp:translate", (2.0 * frame, 0.0, 0.0), type="double3", time=frame)
    cube.set("xformOpOrder", ["xformOp:translate"], type="token[]", uniform=True)
    sphere = stage.define_prim("/World/Sphere", "Sphere")
    sphere.set("radius", 0.5)
    sphere.set("xformOp:translate", (0.0, 3.0, 0.0), type="double3")
    stage.define_prim("/World/Looks", "Scope")
    stage.define_prim("/World/Looks/RedMat", "Material")
    shader = stage.define_prim("/World/Looks/RedMat/PreviewSurface", "Shader")
    shader.set("info:id", "UsdPreviewSurface", type="token", uniform=True)
    shader.set("inputs:diffuseColor", (1.0, 0.0, 0.0), type="color3f")
    cube.add_relationship("material:binding", ["/World/Looks/RedMat"])
    for ext in ("usda", "usdc", "usdz"):
        stage.save(f"{path_stem}.{ext}")


def floats(value) -> list:
    return [float(x) for x in value]


def read_lightusd(path: Path) -> dict:
    stage = lightusd.load(str(path))
    cube = stage.get_prim_at("/World/Cube")
    translate = cube.attribute("xformOp:translate")
    sample_times = sorted(float(t) for t in translate.timesamples.times)
    return {
        "prims": {p.path: p.type_name for p in stage.traverse()},
        "meta": {"metersPerUnit": float(stage.meters_per_unit), "upAxis": stage.up_axis,
                 "defaultPrim": stage.default_prim.name, "startTimeCode": float(stage.start_time),
                 "endTimeCode": float(stage.end_time), "timeCodesPerSecond": float(stage.time_codes_per_second)},
        "values": {
            "cube_size": float(cube.attribute("size").eval()),
            "sphere_radius": float(stage.get_prim_at("/World/Sphere").attribute("radius").eval()),
            "sphere_translate": floats(stage.get_prim_at("/World/Sphere").attribute("xformOp:translate").eval()),
            "diffuse_color": floats(stage.get_prim_at("/World/Looks/RedMat/PreviewSurface").attribute("inputs:diffuseColor").eval()),
            "binding": [str(t) for t in cube.relationship("material:binding").targets],
        },
        "translate_samples": {str(int(t)): floats(translate.eval(t)) for t in sample_times},
        "translate_shuffled": [floats(translate.eval(float(f))) for f in SHUFFLED],
    }


def read_pxr(path: Path) -> dict:
    stage = Usd.Stage.Open(str(path))
    cube = stage.GetPrimAtPath("/World/Cube")
    translate = cube.GetAttribute("xformOp:translate")
    shader = stage.GetPrimAtPath("/World/Looks/RedMat/PreviewSurface")
    return {
        "prims": {str(p.GetPath()): str(p.GetTypeName()) for p in stage.Traverse()},
        "meta": {"metersPerUnit": float(stage.GetMetadata("metersPerUnit")), "upAxis": stage.GetMetadata("upAxis"),
                 "defaultPrim": stage.GetDefaultPrim().GetName(), "startTimeCode": float(stage.GetStartTimeCode()),
                 "endTimeCode": float(stage.GetEndTimeCode()), "timeCodesPerSecond": float(stage.GetTimeCodesPerSecond())},
        "values": {
            "cube_size": float(cube.GetAttribute("size").Get()),
            "sphere_radius": float(stage.GetPrimAtPath("/World/Sphere").GetAttribute("radius").Get()),
            "sphere_translate": floats(stage.GetPrimAtPath("/World/Sphere").GetAttribute("xformOp:translate").Get()),
            "diffuse_color": floats(shader.GetAttribute("inputs:diffuseColor").Get()),
            "binding": [str(t) for t in cube.GetRelationship("material:binding").GetTargets()],
        },
        "translate_samples": {str(int(t)): floats(translate.Get(t)) for t in translate.GetTimeSamples()},
        "translate_shuffled": [floats(translate.Get(float(f))) for f in SHUFFLED],
    }


def usdz_package_facts(path: Path) -> dict:
    with zipfile.ZipFile(path) as archive:
        entries = archive.infolist()
    with open(path, "rb") as handle:
        handle.seek(entries[0].header_offset)
        header = handle.read(30)
    name_length, extra_length = struct.unpack("<HH", header[26:30])
    data_offset = entries[0].header_offset + 30 + name_length + extra_length
    return {"entries": [e.filename for e in entries], "all_stored": all(e.compress_type == 0 for e in entries),
            "first_entry_data_offset_mod_64": data_offset % 64}


def main(output_dir: Path) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    author(output_dir / "stage")
    paths = {ext: output_dir / f"stage.{ext}" for ext in ("usda", "usdc", "usdz")}
    reads = {f"{reader}_{ext}": fn(path) for ext, path in paths.items()
             for reader, fn in (("lightusd", read_lightusd), ("pxr", read_pxr))}
    reference = reads["lightusd_usda"]
    package = usdz_package_facts(paths["usdz"])
    checks = {
        "G1_prims_and_types": all(r["prims"] == PRIMS for r in reads.values()),
        "G2_values": all(r["values"] == EXPECTED_VALUES for r in reads.values()),
        "G3_metadata": all(r["meta"] == META for r in reads.values()),
        "G4_translate_time_samples": all(r["translate_samples"] == TRANSLATE for r in reads.values()),
        "G5_material_binding": all(r["values"]["binding"] == ["/World/Looks/RedMat"] for r in reads.values()),
        "G6_all_six_reads_equal": all(r == reference for r in reads.values()),
        "G7_shuffled_equals_sequential": all(r["translate_shuffled"] == [TRANSLATE[str(f)] for f in SHUFFLED] for r in reads.values()),
        "G8_usdz_stored_and_64_aligned": package["all_stored"] and package["first_entry_data_offset_mod_64"] == 0,
        "usdz_package": package,
        "usda_sha256": hashlib.sha256(paths["usda"].read_bytes()).hexdigest(),
    }
    (output_dir / "checks.json").write_text(json.dumps({"checks": checks, "reads": reads}, indent=2, sort_keys=True) + "\n")
    failed = [k for k, v in checks.items() if k.startswith("G") and v is not True]
    for name, value in checks.items():
        print(f"{name}: {value}")
    if failed:
        print(f"KNOWN FAIL: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(Path(sys.argv[1])))
