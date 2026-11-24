"""Write the synthetic scene: a shaded sphere over a busy patterned background, plus its geometry."""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SIZE_PX = 512
CENTRE_PX = 256.0
SPHERE_RADIUS_PX = 120.0
SUBJECT_REGION_OUTER_PX = 96.0  # 0.8 radius: predeclared subject region
BACKGROUND_REGION_INNER_PX = 150.0  # 1.25 radius: predeclared background region
CELL_PX = 24
BACKGROUND_PALETTE = np.array(
    [[220, 40, 60], [30, 140, 220], [250, 210, 40], [40, 180, 90], [160, 60, 200], [240, 240, 240]],
    dtype=float,
)
SPHERE_BASE_RGB = np.array([230.0, 120.0, 40.0])
SPECULAR_STRENGTH = 150.0
SPECULAR_EXPONENT = 40.0


def normalise(vector: np.ndarray) -> np.ndarray:
    return vector / np.linalg.norm(vector)


LIGHT_DIRECTION = normalise(np.array([-0.45, -0.55, 0.70]))
HALF_VECTOR = normalise(LIGHT_DIRECTION + np.array([0.0, 0.0, 1.0]))


def build_background(xs: np.ndarray, ys: np.ndarray) -> np.ndarray:
    cell_index = (xs // CELL_PX + ys // CELL_PX).astype(int) % len(BACKGROUND_PALETTE)
    modulation = 0.85 + 0.15 * np.sin(0.35 * xs + 0.2 * ys)
    return BACKGROUND_PALETTE[cell_index] * modulation[..., None]


def build_sphere(dx: np.ndarray, dy: np.ndarray, inside: np.ndarray) -> np.ndarray:
    normal_x = dx / SPHERE_RADIUS_PX
    normal_y = dy / SPHERE_RADIUS_PX
    normal_z = np.sqrt(np.clip(1.0 - normal_x**2 - normal_y**2, 0.0, None))
    diffuse = np.clip(
        normal_x * LIGHT_DIRECTION[0] + normal_y * LIGHT_DIRECTION[1] + normal_z * LIGHT_DIRECTION[2],
        0.0,
        1.0,
    )
    specular = np.clip(
        normal_x * HALF_VECTOR[0] + normal_y * HALF_VECTOR[1] + normal_z * HALF_VECTOR[2], 0.0, 1.0
    ) ** SPECULAR_EXPONENT
    shaded = SPHERE_BASE_RGB * (0.2 + 0.8 * diffuse)[..., None] + SPECULAR_STRENGTH * specular[..., None]
    return np.where(inside[..., None], np.clip(shaded, 0.0, 255.0), 0.0)


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("usage: generate.py SCENE_PNG SCENE_JSON", file=sys.stderr)
        return 2
    scene_png, scene_json = Path(argv[1]), Path(argv[2])
    ys, xs = np.mgrid[0:SIZE_PX, 0:SIZE_PX].astype(float)
    dx = xs + 0.5 - CENTRE_PX
    dy = ys + 0.5 - CENTRE_PX
    inside = np.hypot(dx, dy) <= SPHERE_RADIUS_PX
    rgb = build_background(xs, ys)
    rgb = np.where(inside[..., None], build_sphere(dx, dy, inside), rgb)
    Image.fromarray(np.clip(np.rint(rgb), 0, 255).astype(np.uint8), mode="RGB").save(scene_png)
    geometry = {
        "size_px": SIZE_PX,
        "centre_px": CENTRE_PX,
        "sphere_radius_px": SPHERE_RADIUS_PX,
        "subject_region_outer_px": SUBJECT_REGION_OUTER_PX,
        "background_region_inner_px": BACKGROUND_REGION_INNER_PX,
    }
    scene_json.write_text(json.dumps(geometry, indent=2) + "\n")
    print(f"wrote {scene_png} and {scene_json}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
