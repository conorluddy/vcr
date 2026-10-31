"""Check the actual imported GLB in Blender, then render its fine mesh."""
import json
import math
from pathlib import Path
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

out = Path(__file__).parent / "output"
expected_volume = (60 * 40 - (4 - math.pi) * 4**2 - math.pi * 3**2) * 12 * 1e-9
reports = {}
for quality in ["coarse", "fine"]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(out / f"part-{quality}.glb"))
    bpy.context.view_layer.update()
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    assert meshes
    vertices, triangles = [], []
    for obj in meshes:
        offset = len(vertices)
        vertices.extend(obj.matrix_world @ v.co for v in obj.data.vertices)
        obj.data.calc_loop_triangles()
        triangles.extend(tuple(offset + i for i in t.vertices) for t in obj.data.loop_triangles)
    bounds = [(min(v[i] for v in vertices), max(v[i] for v in vertices)) for i in range(3)]
    dimensions = [hi - lo for lo, hi in bounds]
    assert all(abs(a - b) < 1e-4 for a, b in zip(dimensions, [0.06, 0.04, 0.012])), dimensions
    signed_volume = 0
    for indices in triangles:
        a, b, c = [vertices[i] for i in indices]
        normal = (b - a).cross(c - a)
        assert all(math.isfinite(x) for x in normal) and normal.length > 1e-15
        signed_volume += a.dot(b.cross(c)) / 6
    assert signed_volume > 0
    if quality == "fine":
        assert abs(signed_volume / expected_volume - 1) < 0.01
    tree = BVHTree.FromPolygons(vertices, triangles, all_triangles=True)
    assert tree.ray_cast(Vector((0.015, 0, 0.1)), Vector((0, 0, -1)))[0] is None
    assert tree.ray_cast(Vector((-0.015, 0, 0.1)), Vector((0, 0, -1)))[0] is not None
    reports[quality] = {"objects": len(meshes), "vertices": len(vertices),
                        "triangles": len(triangles), "bounds_m": bounds,
                        "dimensions_m": dimensions, "signed_volume_m3": signed_volume}
assert reports["fine"]["triangles"] > reports["coarse"]["triangles"]
scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.light = "STUDIO"
scene.display.shading.color_type = "SINGLE"
scene.display.shading.single_color = (0.12, 0.48, 0.62)
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.render.resolution_x = 800
scene.render.resolution_y = 600
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.color_mode = "RGBA"
bpy.ops.object.camera_add(location=(0.10, -0.13, 0.10))
camera = bpy.context.object
camera.rotation_euler = (-camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = 0.10
camera.data.clip_start = 0.001
scene.camera = camera
scene.render.filepath = str(out / "part.png")
bpy.ops.render.render(write_still=True)
reports["blender"] = bpy.app.version_string
reports["engine"] = scene.render.engine
(out / "blender-checks.json").write_text(json.dumps(reports, indent=2) + "\n")
print(json.dumps(reports))
