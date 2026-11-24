#!/usr/bin/env python3
"""Render 20 original views of a procedurally textured cube on a circular orbit.

Ray-casts an axis-aligned box with seeded random colour cells per face. No external
images, no unseeded randomness; output depends only on this file.
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image

VIEW_COUNT = 20
WIDTH, HEIGHT = 384, 288
FOCAL_PX = 300.0
ORBIT_RADIUS = 4.6
ELEVATION_RAD = np.radians(25.0)
TEXTURE_CELLS = 32
SEED = 20261124
BACKGROUND = np.array([235, 235, 228], dtype=np.uint8)
FACE_BRIGHTNESS = {0: 0.85, 1: 0.7, 2: 0.55}


def build_face_textures() -> np.ndarray:
    rng = np.random.default_rng(SEED)
    return rng.integers(0, 256, size=(6, TEXTURE_CELLS, TEXTURE_CELLS, 3), dtype=np.uint8)


def camera_basis(azimuth_rad: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    eye = ORBIT_RADIUS * np.array([
        np.cos(ELEVATION_RAD) * np.cos(azimuth_rad),
        np.cos(ELEVATION_RAD) * np.sin(azimuth_rad),
        np.sin(ELEVATION_RAD),
    ])
    forward = -eye / np.linalg.norm(eye)
    right = np.cross(forward, np.array([0.0, 0.0, 1.0]))
    right /= np.linalg.norm(right)
    up = np.cross(right, forward)
    return eye, forward, right, up


def ray_directions(forward: np.ndarray, right: np.ndarray, up: np.ndarray) -> np.ndarray:
    xs = (np.arange(WIDTH) + 0.5 - WIDTH / 2) / FOCAL_PX
    ys = -(np.arange(HEIGHT) + 0.5 - HEIGHT / 2) / FOCAL_PX
    dx, dy = np.meshgrid(xs, ys)
    directions = forward[None, None, :] + dx[..., None] * right + dy[..., None] * up
    return directions / np.linalg.norm(directions, axis=-1, keepdims=True)


def render_view(azimuth_rad: float, textures: np.ndarray) -> np.ndarray:
    eye, forward, right, up = camera_basis(azimuth_rad)
    directions = ray_directions(forward, right, up)
    safe = np.where(np.abs(directions) < 1e-9, 1e-9, directions)
    t_near_axes = np.minimum((-1.0 - eye) / safe, (1.0 - eye) / safe)
    t_far_axes = np.maximum((-1.0 - eye) / safe, (1.0 - eye) / safe)
    t_near = t_near_axes.max(axis=-1)
    t_far = t_far_axes.min(axis=-1)
    hit = (t_near <= t_far) & (t_far > 0)
    entry_axis = t_near_axes.argmax(axis=-1)
    entry_positive = np.take_along_axis(directions, entry_axis[..., None], axis=-1)[..., 0] > 0
    face = entry_axis * 2 + np.where(entry_positive, 0, 1)

    points = eye[None, None, :] + t_near[..., None] * directions
    image = np.empty((HEIGHT, WIDTH, 3), dtype=np.uint8)
    image[:] = BACKGROUND
    for axis in range(3):
        for side in range(2):
            face_id = axis * 2 + side
            mask = hit & (face == face_id)
            if not mask.any():
                continue
            other_axes = [a for a in range(3) if a != axis]
            u = (points[..., other_axes[0]][mask] + 1.0) / 2.0
            v = (points[..., other_axes[1]][mask] + 1.0) / 2.0
            ix = np.clip((u * TEXTURE_CELLS).astype(int), 0, TEXTURE_CELLS - 1)
            iy = np.clip((v * TEXTURE_CELLS).astype(int), 0, TEXTURE_CELLS - 1)
            colours = textures[face_id][iy, ix].astype(float)
            colours *= FACE_BRIGHTNESS[axis]
            image[mask] = np.clip(colours, 0, 255).astype(np.uint8)
    return image


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: generate.py <output-images-dir>")
    output_dir = Path(sys.argv[1])
    output_dir.mkdir(parents=True, exist_ok=True)
    textures = build_face_textures()
    for index in range(VIEW_COUNT):
        azimuth = 2 * np.pi * index / VIEW_COUNT
        Image.fromarray(render_view(azimuth, textures)).save(output_dir / f"view-{index + 1:02d}.png")


if __name__ == "__main__":
    main()
