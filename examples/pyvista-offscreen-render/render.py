"""Render a fixed scene off-screen with PyVista; print metrics JSON; write output/scene.png."""
import hashlib
import json
import math

import numpy as np
import pyvista as pv
import vtk

WIDTH, HEIGHT = 960, 540
BACKGROUND = (16, 24, 40)

# Perspective silhouette of a unit sphere at distance 4 with a 30 degree vertical view angle.
EXPECTED_DIAMETER_PX = math.tan(math.asin(1 / 4)) / math.tan(math.radians(15)) * HEIGHT

plotter = pv.Plotter(off_screen=True, window_size=(WIDTH, HEIGHT))
plotter.set_background(BACKGROUND)
plotter.enable_anti_aliasing("ssaa")
plotter.add_mesh(
    pv.Sphere(radius=1.0, theta_resolution=96, phi_resolution=96),
    color=(255, 140, 0),
    smooth_shading=True,
)
plotter.camera_position = [(0.0, -4.0, 0.0), (0.0, 0.0, 0.0), (0.0, 0.0, 1.0)]
plotter.camera.view_angle = 30.0
image = plotter.screenshot("output/scene.png", return_img=True)
plotter.close()

differs = np.any(image != np.array(BACKGROUND), axis=2)
ys, xs = np.nonzero(differs)
width_px = int(xs.max() - xs.min() + 1)
height_px = int(ys.max() - ys.min() + 1)
r, g, b = (image[..., c].astype(int) for c in range(3))
orange = (r > 150) & (r > b + 60) & (g > 40)
checks = {
    "version": pv.__version__ == "0.49.3",
    "size_960x540": image.shape == (HEIGHT, WIDTH, 3),
    "corners_are_background": all(
        tuple(int(v) for v in image[y, x]) == BACKGROUND for y in (0, -1) for x in (0, -1)
    ),
    "sphere_centred": bool(
        abs((xs.min() + xs.max()) / 2 - WIDTH / 2) <= 2
        and abs((ys.min() + ys.max()) / 2 - HEIGHT / 2) <= 2
    ),
    "sphere_extent_matches_projection": abs(width_px - height_px) <= 2
    and abs(height_px - EXPECTED_DIAMETER_PX) <= 6,
    "centre_pixel_orange": bool(orange[HEIGHT // 2, WIDTH // 2]),
    "shaded_orange_covers_most_of_disc": 0.5 <= float(orange.sum()) / differs.sum() <= 0.95,
}
print(
    json.dumps(
        {
            "vtk": vtk.vtkVersion.GetVTKVersion(),
            "pixels_sha256": hashlib.sha256(image.tobytes()).hexdigest(),
            "sphere_bbox_px": [width_px, height_px],
            "orange_fraction": round(float(orange.mean()), 3),
            "checks": {name: bool(passed) for name, passed in checks.items()},
            "all_passed": all(bool(passed) for passed in checks.values()),
        },
        indent=1,
        sort_keys=True,
    )
)
