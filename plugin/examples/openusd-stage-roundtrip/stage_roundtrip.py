"""Author a USD stage with usd-core, round-trip it through .usda and .usdc, and check the read-back.

Usage: stage_roundtrip.py OUTPUT_DIR
Writes stage.usda, stage.usdc, checks.json and summary.txt into OUTPUT_DIR, and exits 1 when
any gating check is false. A check that cannot run (usdchecker absent) is recorded as None.
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

from pxr import Gf, Sdf, Usd, UsdGeom, UsdShade

FRAMES = (0, 6, 12, 18, 24)
SHUFFLED_FRAMES = (24, 0, 18, 6, 12)
CUBE_SIZE = 2.0
SPHERE_RADIUS = 0.5
SPHERE_TRANSLATE = (0.0, 3.0, 0.0)
DIFFUSE_COLOR = (1.0, 0.0, 0.0)
METERS_PER_UNIT = 0.01
UP_AXIS = "Y"
DEFAULT_PRIM = "World"
START_TIME_CODE = 0.0
END_TIME_CODE = 24.0
TIME_CODES_PER_SECOND = 24.0
EXPECTED_PRIM_TYPES = {
    "/World": "Xform",
    "/World/Cube": "Cube",
    "/World/Sphere": "Sphere",
    "/World/Looks": "Scope",
    "/World/Looks/RedMat": "Material",
    "/World/Looks/RedMat/PreviewSurface": "Shader",
}
EXPECTED_STAGE_METADATA = {
    "metersPerUnit": METERS_PER_UNIT,
    "upAxis": UP_AXIS,
    "defaultPrim": DEFAULT_PRIM,
    "startTimeCode": START_TIME_CODE,
    "endTimeCode": END_TIME_CODE,
    "timeCodesPerSecond": TIME_CODES_PER_SECOND,
}
EXPECTED_TRANSLATE_SAMPLES = [[float(frame), [2.0 * frame, 0.0, 0.0]] for frame in FRAMES]


# === PUBLIC API ===

def main(output_dir: Path) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    usda_path = output_dir / "stage.usda"
    usdc_path = output_dir / "stage.usdc"

    authored_stage = author_stage()
    root_layer = authored_stage.GetRootLayer()
    if not root_layer.Export(str(usda_path)) or not root_layer.Export(str(usdc_path)):
        sys.exit(f"Sdf.Layer.Export failed for {usda_path} or {usdc_path}")

    authored = summarize_stage(authored_stage)
    usda = summarize_stage(open_stage(usda_path))
    usdc = summarize_stage(open_stage(usdc_path))
    shuffled_matches = shuffled_read_matches_sequential(open_stage(usda_path))
    usdchecker = run_usdchecker(Path(sys.executable).parent / "usdchecker", [usda_path, usdc_path])

    checks = {
        "G1_prim_types_usda": prim_types(usda) == EXPECTED_PRIM_TYPES,
        "G1_prim_types_usdc": prim_types(usdc) == EXPECTED_PRIM_TYPES,
        "G2_attribute_values_usda": attribute_values_match(usda),
        "G2_attribute_values_usdc": attribute_values_match(usdc),
        "G3_stage_metadata_usda": usda["stage"] == EXPECTED_STAGE_METADATA,
        "G3_stage_metadata_usdc": usdc["stage"] == EXPECTED_STAGE_METADATA,
        "G4_translate_time_samples_usda": translate_samples(usda) == EXPECTED_TRANSLATE_SAMPLES,
        "G4_translate_time_samples_usdc": translate_samples(usdc) == EXPECTED_TRANSLATE_SAMPLES,
        "G5_material_binding_usda": material_binding(usda) == ["/World/Looks/RedMat"],
        "G5_material_binding_usdc": material_binding(usdc) == ["/World/Looks/RedMat"],
        "G6_roundtrip_equals_authored": usda == authored and usdc == authored,
        "G7_usdchecker_clean": usdchecker_verdict(usdchecker),
        "G8_shuffled_time_reads_equal_sequential": shuffled_matches,
    }
    report = {
        "usd_core_version": ".".join(str(part) for part in Usd.GetVersion()),
        "checks": checks,
        "usdchecker": usdchecker,
        "sha256": {"stage.usda": sha256_of(usda_path), "stage.usdc": sha256_of(usdc_path)},
        "summaries": {"authored": authored, "usda": usda, "usdc": usdc},
    }
    (output_dir / "checks.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    (output_dir / "summary.txt").write_text(summary_text(usda))
    print(json.dumps(checks, indent=2, sort_keys=True))
    gating_failures = [name for name, value in checks.items() if value is False]
    if gating_failures:
        print(f"gating checks false: {', '.join(gating_failures)}", file=sys.stderr)
        return 1
    return 0


# === AUTHORING ===

def author_stage() -> Usd.Stage:
    stage = Usd.Stage.CreateInMemory()
    UsdGeom.SetStageMetersPerUnit(stage, METERS_PER_UNIT)
    UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.y)
    world = UsdGeom.Xform.Define(stage, "/World")
    stage.SetDefaultPrim(world.GetPrim())
    stage.SetStartTimeCode(START_TIME_CODE)
    stage.SetEndTimeCode(END_TIME_CODE)
    stage.SetTimeCodesPerSecond(TIME_CODES_PER_SECOND)

    cube = UsdGeom.Cube.Define(stage, "/World/Cube")
    cube.GetSizeAttr().Set(CUBE_SIZE)
    translate_op = cube.AddTranslateOp()
    for frame in FRAMES:
        translate_op.Set(Gf.Vec3d(2.0 * frame, 0.0, 0.0), float(frame))

    sphere = UsdGeom.Sphere.Define(stage, "/World/Sphere")
    sphere.GetRadiusAttr().Set(SPHERE_RADIUS)
    sphere.AddTranslateOp().Set(Gf.Vec3d(*SPHERE_TRANSLATE))

    UsdGeom.Scope.Define(stage, "/World/Looks")
    material = UsdShade.Material.Define(stage, "/World/Looks/RedMat")
    shader = UsdShade.Shader.Define(stage, "/World/Looks/RedMat/PreviewSurface")
    shader.CreateIdAttr("UsdPreviewSurface")
    shader.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).Set(Gf.Vec3f(*DIFFUSE_COLOR))
    material.CreateSurfaceOutput().ConnectToSource(shader.ConnectableAPI(), "surface")
    UsdShade.MaterialBindingAPI.Apply(cube.GetPrim()).Bind(material)
    return stage


# === READ-BACK AND SUMMARY ===

def open_stage(path: Path) -> Usd.Stage:
    stage = Usd.Stage.Open(str(path))
    if stage is None:
        sys.exit(f"usd-core could not open {path}; check the file was written and is valid USD")
    return stage


def json_value(value: object) -> object:
    if isinstance(value, (Gf.Vec3d, Gf.Vec3f)):
        return [float(component) for component in value]
    if isinstance(value, Sdf.AssetPath):
        return value.path
    if isinstance(value, Sdf.Path):
        return str(value)
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if hasattr(value, "__iter__"):
        return [json_value(item) for item in value]
    raise TypeError(f"no JSON form for {type(value).__name__}; add a case to json_value before use")


def summarize_stage(stage: Usd.Stage) -> dict:
    prims = {}
    for prim in stage.Traverse():
        attributes = {}
        for attribute in sorted(prim.GetAttributes(), key=lambda item: item.GetName()):
            samples = sorted(attribute.GetTimeSamples())
            attributes[attribute.GetName()] = {
                "type": str(attribute.GetTypeName()),
                "default": json_value(attribute.Get()),
                "time_samples": [[float(t), json_value(attribute.Get(t))] for t in samples],
            }
        relationships = {
            relationship.GetName(): [str(target) for target in relationship.GetTargets()]
            for relationship in sorted(prim.GetRelationships(), key=lambda item: item.GetName())
        }
        prims[str(prim.GetPath())] = {
            "type": str(prim.GetTypeName()),
            "applied_schemas": list(prim.GetAppliedSchemas()),
            "attributes": attributes,
            "relationships": relationships,
        }
    return {"stage": stage_metadata(stage), "prims": prims}


def stage_metadata(stage: Usd.Stage) -> dict:
    return {
        "metersPerUnit": UsdGeom.GetStageMetersPerUnit(stage),
        "upAxis": str(UsdGeom.GetStageUpAxis(stage)),
        "defaultPrim": stage.GetDefaultPrim().GetName(),
        "startTimeCode": stage.GetStartTimeCode(),
        "endTimeCode": stage.GetEndTimeCode(),
        "timeCodesPerSecond": stage.GetTimeCodesPerSecond(),
    }


def prim_types(summary: dict) -> dict:
    return {path: details["type"] for path, details in summary["prims"].items()}


def attribute_values_match(summary: dict) -> bool:
    prims = summary["prims"]
    return (
        prims["/World/Cube"]["attributes"]["size"]["default"] == CUBE_SIZE
        and prims["/World/Sphere"]["attributes"]["radius"]["default"] == SPHERE_RADIUS
        and prims["/World/Sphere"]["attributes"]["xformOp:translate"]["default"] == list(SPHERE_TRANSLATE)
        and prims["/World/Looks/RedMat/PreviewSurface"]["attributes"]["inputs:diffuseColor"]["default"]
        == list(DIFFUSE_COLOR)
    )


def translate_samples(summary: dict) -> list:
    return summary["prims"]["/World/Cube"]["attributes"]["xformOp:translate"]["time_samples"]


def material_binding(summary: dict) -> list:
    return summary["prims"]["/World/Cube"]["relationships"]["material:binding"]


def shuffled_read_matches_sequential(stage: Usd.Stage) -> bool:
    attribute = stage.GetPrimAtPath("/World/Cube").GetAttribute("xformOp:translate")
    shuffled = {frame: json_value(attribute.Get(float(frame))) for frame in SHUFFLED_FRAMES}
    sequential = {frame: json_value(attribute.Get(float(frame))) for frame in sorted(SHUFFLED_FRAMES)}
    return shuffled == sequential


# === EXTERNAL CHECKER ===

def run_usdchecker(executable: Path, stage_paths: list[Path]) -> dict:
    if not executable.exists():
        return {"status": "not-run", "reason": f"{executable.name} is not in the venv bin; usd-core 26.11 ships none"}
    files = {}
    for stage_path in stage_paths:
        completed = subprocess.run(
            [str(executable), str(stage_path)], capture_output=True, text=True, check=False
        )
        output_lines = (completed.stdout + completed.stderr).splitlines()
        files[stage_path.name] = {
            "exit_status": completed.returncode,
            "error_lines": [line for line in output_lines if "error" in line.lower()],
        }
    return {"status": "ran", "files": files}


def usdchecker_verdict(usdchecker: dict) -> bool | None:
    if usdchecker["status"] == "not-run":
        return None
    return all(
        details["exit_status"] == 0 and not details["error_lines"]
        for details in usdchecker["files"].values()
    )


# === OUTPUT ===

def sha256_of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def summary_text(summary: dict) -> str:
    lines = [f"stage: {json.dumps(summary['stage'], sort_keys=True)}"]
    for path, details in summary["prims"].items():
        lines.append(
            f"{path} {details['type']} attributes={len(details['attributes'])} "
            f"time_samples={sum(len(a['time_samples']) for a in details['attributes'].values())}"
        )
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: stage_roundtrip.py OUTPUT_DIR")
    sys.exit(main(Path(sys.argv[1])))
