"""Create MPFB default humans at three height macros, measure their geometry and render the default one.

Run via: Blender -b --factory-startup --python build_figure.py -- <output_dir>
run.sh sets HOME and BLENDER_USER_* under output/blender-home, so MPFB loads only from that isolated repository.
"""
import hashlib
import importlib
import json
import math
import os
import sys
import tomllib

import addon_utils
import bpy
from mathutils import Vector

ADDON_MODULE = "bl_ext.user_default.mpfb"
HEIGHT_VALUES = (0.0, 0.5, 1.0)
DEFAULT_HEIGHT = 0.5
RENDER_WIDTH_PX = 480
RENDER_HEIGHT_PX = 720
CAMERA_DISTANCE_M = 10.0
FRAME_MARGIN_FACTOR = 1.15
MINIMUM_HEIGHT_GAIN_RATIO = 1.02


class PredeclaredCheckFailed(RuntimeError):
    pass


def main() -> None:
    output_dir = os.path.realpath(sys.argv[sys.argv.index("--") + 1])
    os.makedirs(output_dir, exist_ok=True)
    isolated_root = os.path.dirname(os.path.realpath(os.environ["BLENDER_USER_CONFIG"]))

    bpy.ops.wm.read_factory_settings(use_empty=True)
    redirect_user_resource_path(os.path.join(isolated_root, "resource-user"))
    addon_module = enable_isolated_addon(isolated_root)
    humanservice = importlib.import_module(ADDON_MODULE + ".services.humanservice")
    targetservice = importlib.import_module(ADDON_MODULE + ".services.targetservice")

    measurements: dict[str, dict] = {}
    default_bounds = None
    for height in HEIGHT_VALUES:
        macros = targetservice.TargetService.get_default_macro_info_dict()
        macros["height"] = height
        figure = humanservice.HumanService.create_human(macro_detail_dict=macros)
        measurement, bounds = measure_figure(figure)
        measurements[format_height(height)] = measurement
        if height == DEFAULT_HEIGHT:
            default_bounds = bounds
        else:
            bpy.data.objects.remove(figure, do_unlink=True)

    assert_predeclared_geometry(measurements)
    render_figure(output_dir, default_bounds)
    write_geometry(output_dir, addon_module, measurements)
    print(f"rendered {os.path.join(output_dir, 'figure.png')} with Blender {bpy.app.version_string}")


def redirect_user_resource_path(isolated_user_directory: str) -> None:
    # MPFB's logservice reads bpy.utils.resource_path('USER'), which ignores BLENDER_USER_* and would write
    # into ~/Library/Application Support/Blender. Redirect that one lookup for this process only.
    original_resource_path = bpy.utils.resource_path

    def resource_path_in_isolation(resource_type: str, *args, **kwargs) -> str:
        if resource_type == "USER":
            return isolated_user_directory
        return original_resource_path(resource_type, *args, **kwargs)

    bpy.utils.resource_path = resource_path_in_isolation


def enable_isolated_addon(isolated_root: str):
    addon_utils.enable(ADDON_MODULE, default_set=True, persistent=False)
    module = importlib.import_module(ADDON_MODULE)
    user_path = os.path.realpath(bpy.utils.resource_path("USER"))
    if not user_path.startswith(isolated_root + os.sep):
        raise PredeclaredCheckFailed(f"C1: resource_path('USER') is {user_path}, outside {isolated_root}")
    module_path = os.path.realpath(module.__file__)
    if not module_path.startswith(isolated_root + os.sep):
        raise PredeclaredCheckFailed(f"C1: MPFB loaded from {module_path}, outside {isolated_root}")
    return module


def measure_figure(figure):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = figure.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    try:
        world_coordinates = [evaluated.matrix_world @ vertex.co for vertex in mesh.vertices]
        vertex_count = len(mesh.vertices)
        face_count = len(mesh.polygons)
    finally:
        evaluated.to_mesh_clear()
    low = Vector(tuple(min(point[axis] for point in world_coordinates) for axis in range(3)))
    high = Vector(tuple(max(point[axis] for point in world_coordinates) for axis in range(3)))
    coordinate_text = "\n".join(f"{point.x:.6f} {point.y:.6f} {point.z:.6f}" for point in world_coordinates)
    measurement = {
        "vertex_count": vertex_count,
        "face_count": face_count,
        "bounding_box_height_m": round(high.z - low.z, 6),
        "bounding_box_min_m": [round(value, 6) for value in low],
        "bounding_box_max_m": [round(value, 6) for value in high],
        "coordinate_sha256": hashlib.sha256(coordinate_text.encode("utf-8")).hexdigest(),
    }
    return measurement, (low, high)


def assert_predeclared_geometry(measurements: dict[str, dict]) -> None:
    low = measurements[format_height(0.0)]
    default = measurements[format_height(DEFAULT_HEIGHT)]
    high = measurements[format_height(1.0)]
    counts = {low["vertex_count"], default["vertex_count"], high["vertex_count"]}
    if len(counts) != 1:
        raise PredeclaredCheckFailed(f"C2: vertex counts differ across heights: {counts}")
    if low["coordinate_sha256"] == high["coordinate_sha256"]:
        raise PredeclaredCheckFailed("C2: height 0.0 and 1.0 produced identical coordinates")
    if high["bounding_box_height_m"] < low["bounding_box_height_m"] * MINIMUM_HEIGHT_GAIN_RATIO:
        raise PredeclaredCheckFailed(
            f"C2: height 1.0 ({high['bounding_box_height_m']} m) is not at least 2% taller than 0.0 ({low['bounding_box_height_m']} m)"
        )
    if not low["bounding_box_height_m"] < default["bounding_box_height_m"] < high["bounding_box_height_m"]:
        raise PredeclaredCheckFailed("C2: default height is not between the two macro extremes")


def render_figure(output_dir: str, bounds: tuple[Vector, Vector]) -> None:
    low, high = bounds
    scene = bpy.context.scene
    camera_data = bpy.data.cameras.new("FigureCamera")
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = FRAME_MARGIN_FACTOR * (high.z - low.z)
    camera = bpy.data.objects.new("FigureCamera", camera_data)
    scene.collection.objects.link(camera)
    camera.location = ((low.x + high.x) / 2, -CAMERA_DISTANCE_M, (low.z + high.z) / 2)
    camera.rotation_euler = (math.pi / 2, 0.0, 0.0)
    scene.camera = camera

    try:
        scene.render.engine = "BLENDER_WORKBENCH"
    except TypeError as error:
        print(f"engine selection failed: {error}", file=sys.stderr)
        raise
    shading = scene.display.shading
    shading.light = "STUDIO"
    shading.color_type = "SINGLE"
    shading.single_color = (0.6, 0.6, 0.6)

    scene.render.resolution_x = RENDER_WIDTH_PX
    scene.render.resolution_y = RENDER_HEIGHT_PX
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.render.filepath = os.path.join(output_dir, "figure.png")
    scene.frame_set(1)
    bpy.ops.render.render(write_still=True)


def write_geometry(output_dir: str, addon_module: object, measurements: dict[str, dict]) -> None:
    manifest_path = os.path.join(os.path.dirname(os.path.realpath(addon_module.__file__)), "blender_manifest.toml")
    with open(manifest_path, "rb") as manifest_file:
        mpfb_version = tomllib.load(manifest_file)["version"]
    document = {
        "blender_version": bpy.app.version_string,
        "mpfb_version": mpfb_version,
        "addon_module": ADDON_MODULE,
        "render": {"width_px": RENDER_WIDTH_PX, "height_px": RENDER_HEIGHT_PX, "engine": "BLENDER_WORKBENCH"},
        "measurements_by_height_macro": measurements,
    }
    with open(os.path.join(output_dir, "geometry.json"), "w", encoding="utf-8") as geometry_file:
        geometry_file.write(json.dumps(document, indent=2, sort_keys=True) + "\n")


def format_height(height: float) -> str:
    return f"{height:.1f}"


if __name__ == "__main__":
    try:
        main()
    except PredeclaredCheckFailed as failure:
        print(f"predeclared check failed: {failure}", file=sys.stderr)
        sys.exit(1)
