"""Write the synthetic scene: a receding checkerboard floor with a near and a far object.

Usage: generate.py <scene.png> <scene.json>. Pure procedural maths; no randomness.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

WIDTH_PX = 640
HEIGHT_PX = 480
HORIZON_ROW_PX = 200
FOCAL_LENGTH_PX = 400.0
CAMERA_HEIGHT_UNITS = 1.0
CHECKER_CELL_UNITS = 0.5
SUPERSAMPLE = 4
FLOOR_LIGHT_GREY = 200.0
FLOOR_DARK_GREY = 120.0
SKY_RGB = (170, 200, 235)
NEAR_DISC_CENTRE_XY = (150.0, 370.0)
NEAR_DISC_RADIUS_PX = 60.0
NEAR_DISC_RGB = (220, 50, 50)
FAR_DISC_CENTRE_XY = (500.0, 214.0)
FAR_DISC_RADIUS_PX = 12.0
FAR_DISC_RGB = (50, 90, 220)
NEAR_REGION_RADIUS_PX = 36.0  # 0.6 of the near disc radius
FAR_REGION_RADIUS_PX = 6.0  # 0.5 of the far disc radius
FLOOR_BAND_FIRST_ROW_PX = 210
FLOOR_BAND_LAST_ROW_PX = 470
FLOOR_BAND_FIRST_COLUMN_PX = 300
FLOOR_BAND_LAST_COLUMN_PX = 340


def renderFloorGrey() -> np.ndarray:
    """Floor shade per pixel, box-filtered from a SUPERSAMPLE x SUPERSAMPLE grid. Rows above the horizon are not meaningful."""
    offsets = (np.arange(SUPERSAMPLE) + 0.5) / SUPERSAMPLE
    rowSamples = np.arange(HEIGHT_PX)[:, None] + offsets[None, :]  # (H, SY)
    columnSamples = np.arange(WIDTH_PX)[:, None] + offsets[None, :]  # (W, SX)
    rowOffsetFromHorizon = np.maximum(rowSamples - HORIZON_ROW_PX, 1e-6)
    depthUnits = FOCAL_LENGTH_PX * CAMERA_HEIGHT_UNITS / rowOffsetFromHorizon  # (H, SY)
    lateralUnits = (columnSamples - WIDTH_PX / 2.0) / FOCAL_LENGTH_PX  # (W, SX)
    depth4d = depthUnits[:, None, :, None]  # (H, 1, SY, 1)
    worldX = lateralUnits[None, :, None, :] * depth4d  # (H, W, SY, SX)
    parity = (
        np.floor(worldX / CHECKER_CELL_UNITS) + np.floor(depth4d / CHECKER_CELL_UNITS)
    ) % 2
    shade = np.where(parity == 0, FLOOR_LIGHT_GREY, FLOOR_DARK_GREY)
    return shade.mean(axis=(2, 3))  # (H, W)


def renderScene() -> np.ndarray:
    floorGrey = renderFloorGrey()
    image = np.empty((HEIGHT_PX, WIDTH_PX, 3), dtype=float)
    image[:HORIZON_ROW_PX] = np.array(SKY_RGB, dtype=float)
    image[HORIZON_ROW_PX:] = floorGrey[HORIZON_ROW_PX:, :, None]
    for centreXy, radiusPx, rgb in (
        (NEAR_DISC_CENTRE_XY, NEAR_DISC_RADIUS_PX, NEAR_DISC_RGB),
        (FAR_DISC_CENTRE_XY, FAR_DISC_RADIUS_PX, FAR_DISC_RGB),
    ):
        mask = pixelDistancePx(centreXy) <= radiusPx
        image[mask] = np.array(rgb, dtype=float)
    return np.clip(np.round(image), 0, 255).astype(np.uint8)


def pixelDistancePx(centreXy: tuple[float, float]) -> np.ndarray:
    rowCentres, columnCentres = np.mgrid[0:HEIGHT_PX, 0:WIDTH_PX].astype(float)
    return np.hypot(columnCentres + 0.5 - centreXy[0], rowCentres + 0.5 - centreXy[1])


def writeGeometry(geometryPath: Path) -> None:
    geometry = {
        "width_px": WIDTH_PX,
        "height_px": HEIGHT_PX,
        "horizon_row_px": HORIZON_ROW_PX,
        "near_region": {"centre_xy": NEAR_DISC_CENTRE_XY, "radius_px": NEAR_REGION_RADIUS_PX},
        "far_region": {"centre_xy": FAR_DISC_CENTRE_XY, "radius_px": FAR_REGION_RADIUS_PX},
        "floor_band": {
            "first_row_px": FLOOR_BAND_FIRST_ROW_PX,
            "last_row_px": FLOOR_BAND_LAST_ROW_PX,
            "first_column_px": FLOOR_BAND_FIRST_COLUMN_PX,
            "last_column_px": FLOOR_BAND_LAST_COLUMN_PX,
        },
    }
    geometryPath.write_text(json.dumps(geometry, indent=2) + "\n")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: generate.py <scene.png> <scene.json>")
    scenePath = Path(sys.argv[1])
    geometryPath = Path(sys.argv[2])
    Image.fromarray(renderScene(), mode="RGB").save(scenePath)
    writeGeometry(geometryPath)
    print(f"wrote {scenePath} ({WIDTH_PX}x{HEIGHT_PX}) and {geometryPath}")


if __name__ == "__main__":
    main()
