"""A pygfx scene that is a pure function of t, rendered offscreen to RGBA arrays."""
import math

import numpy as np
import pygfx as gfx
import pylinalg as la
from rendercanvas.offscreen import RenderCanvas

WIDTH, HEIGHT = 320, 180
DURATION = 2.0


def build():
    canvas = RenderCanvas(size=(WIDTH, HEIGHT), pixel_ratio=1)
    renderer = gfx.renderers.WgpuRenderer(canvas)
    scene = gfx.Scene()
    scene.add(gfx.Background.from_color("#101418"))
    scene.add(gfx.AmbientLight(intensity=0.6))
    key = gfx.DirectionalLight(intensity=2.5)
    key.local.position = (2, 3, 4)
    scene.add(key)
    cube = gfx.Mesh(gfx.box_geometry(1, 1, 1), gfx.MeshStandardMaterial(color="#e8a33d"))
    moon = gfx.Mesh(gfx.sphere_geometry(0.3), gfx.MeshStandardMaterial(color="#3d8be8"))
    scene.add(cube, moon)
    camera = gfx.PerspectiveCamera(50, WIDTH / HEIGHT)
    camera.local.position = (0, 0.8, 4)
    camera.show_pos((0, 0, 0))

    def render(t):
        angle = 2 * math.pi * t / DURATION
        cube.local.rotation = la.quat_from_euler((0.5 + 0.3 * math.sin(angle), angle, 0.3))
        moon.local.position = (
            1.6 * math.cos(angle),
            0.4 * math.sin(2 * angle),
            1.6 * math.sin(angle),
        )
        renderer.render(scene, camera)
        return np.asarray(canvas.draw()).copy()

    return render
