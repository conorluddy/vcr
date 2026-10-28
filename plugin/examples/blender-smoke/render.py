"""Minimal deterministic Blender scene: one cube, one light, Workbench engine, one PNG frame.
Run via: Blender -b --python render.py -- <output.png>
"""
import sys
import bpy

output_path = sys.argv[sys.argv.index("--") + 1]

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
bpy.ops.object.light_add(type="SUN", location=(4, -4, 6))
bpy.ops.object.camera_add(location=(6, -6, 4), rotation=(1.1, 0, 0.785))
scene.camera = bpy.context.object

scene.render.resolution_x = 320
scene.render.resolution_y = 240
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = True
scene.render.filepath = output_path
scene.frame_set(1)
try:
    scene.render.engine = "BLENDER_WORKBENCH"
except TypeError as error:
    print(f"engine selection failed: {error}", file=sys.stderr)
    raise

bpy.ops.render.render(write_still=True)
print(f"rendered {output_path} with Blender {bpy.app.version_string} engine {scene.render.engine}")
