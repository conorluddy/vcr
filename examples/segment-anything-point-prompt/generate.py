"""Write the synthetic two-object scene (red shaded disc, blue square) and its prompts and ground-truth geometry."""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SIZE_PX = 512
DISC_CENTRE_PX = (160.0, 176.0)
DISC_RADIUS_PX = 80.0
SQUARE_BOUNDS_PX = {"x0": 284.0, "y0": 268.0, "x1": 420.0, "y1": 404.0}
DISC_BOX_XYXY = [72, 88, 248, 264]
SQUARE_BOX_XYXY = [276, 260, 428, 412]
SQUARE_CENTRE_PX = [352, 336]
GRID_PX = 32
DISC_BASE_RGB = np.array([200.0, 30.0, 40.0])
SQUARE_BASE_RGB = np.array([30.0, 90.0, 220.0])
BACKGROUND_RGB = np.array([90.0, 110.0, 100.0])
SPECULAR_STRENGTH = 140.0
SPECULAR_EXPONENT = 32.0


def normalise(vector: np.ndarray) -> np.ndarray:
    return vector / np.linalg.norm(vector)


LIGHT_DIRECTION = normalise(np.array([-0.45, -0.55, 0.70]))
HALF_VECTOR = normalise(LIGHT_DIRECTION + np.array([0.0, 0.0, 1.0]))


def build_background(xs: np.ndarray, ys: np.ndarray) -> np.ndarray:
    texture = 0.8 + 0.2 * np.sin(0.09 * (xs + ys)) + 0.1 * np.sin(0.31 * xs) * np.cos(0.23 * ys)
    grid = np.where(((xs.astype(int) % GRID_PX) == 0) | ((ys.astype(int) % GRID_PX) == 0), 0.85, 1.0)
    return BACKGROUND_RGB * (texture * grid)[..., None]


def build_disc(dx: np.ndarray, dy: np.ndarray) -> np.ndarray:
    normal_x = dx / DISC_RADIUS_PX
    normal_y = dy / DISC_RADIUS_PX
    normal_z = np.sqrt(np.clip(1.0 - normal_x**2 - normal_y**2, 0.0, None))
    diffuse = np.clip(
        normal_x * LIGHT_DIRECTION[0] + normal_y * LIGHT_DIRECTION[1] + normal_z * LIGHT_DIRECTION[2],
        0.0,
        1.0,
    )
    specular = np.clip(
        normal_x * HALF_VECTOR[0] + normal_y * HALF_VECTOR[1] + normal_z * HALF_VECTOR[2], 0.0, 1.0
    ) ** SPECULAR_EXPONENT
    shaded = DISC_BASE_RGB * (0.25 + 0.75 * diffuse)[..., None] + SPECULAR_STRENGTH * specular[..., None]
    return np.clip(shaded, 0.0, 255.0)


def build_square(ys: np.ndarray) -> np.ndarray:
    top, bottom = SQUARE_BOUNDS_PX["y0"], SQUARE_BOUNDS_PX["y1"]
    brightness = 0.75 + 0.25 * (ys - top) / (bottom - top)
    return np.clip(SQUARE_BASE_RGB * brightness[..., None], 0.0, 255.0)


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("usage: generate.py SCENE_PNG SCENE_JSON", file=sys.stderr)
        return 2
    scene_png, scene_json = Path(argv[1]), Path(argv[2])
    ys, xs = np.mgrid[0:SIZE_PX, 0:SIZE_PX].astype(float)
    pixel_x = xs + 0.5
    pixel_y = ys + 0.5
    dx = pixel_x - DISC_CENTRE_PX[0]
    dy = pixel_y - DISC_CENTRE_PX[1]
    in_disc = np.hypot(dx, dy) <= DISC_RADIUS_PX
    in_square = (
        (pixel_x >= SQUARE_BOUNDS_PX["x0"])
        & (pixel_x <= SQUARE_BOUNDS_PX["x1"])
        & (pixel_y >= SQUARE_BOUNDS_PX["y0"])
        & (pixel_y <= SQUARE_BOUNDS_PX["y1"])
    )
    rgb = build_background(xs, ys)
    rgb = np.where(in_square[..., None], build_square(ys), rgb)
    rgb = np.where(in_disc[..., None], build_disc(dx, dy), rgb)
    Image.fromarray(np.clip(np.rint(rgb), 0, 255).astype(np.uint8), mode="RGB").save(scene_png)
    geometry = {
        "size_px": SIZE_PX,
        "disc": {
            "centre_px": list(DISC_CENTRE_PX),
            "radius_px": DISC_RADIUS_PX,
            "point_prompt_px": [DISC_CENTRE_PX[0], DISC_CENTRE_PX[1]],
            "box_prompt_xyxy": DISC_BOX_XYXY,
        },
        "square": {
            "bounds_px": SQUARE_BOUNDS_PX,
            "point_prompt_px": SQUARE_CENTRE_PX,
            "box_prompt_xyxy": SQUARE_BOX_XYXY,
        },
    }
    scene_json.write_text(json.dumps(geometry, indent=2) + "\n")
    print(f"wrote {scene_png} and {scene_json}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
