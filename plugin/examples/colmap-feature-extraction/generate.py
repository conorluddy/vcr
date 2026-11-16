#!/usr/bin/env python3
"""Generate small deterministic views with repeated geometric features."""
from pathlib import Path
import random
import sys

WIDTH, HEIGHT = 384, 288
COLORS = [(28, 49, 74), (220, 74, 55), (43, 135, 105), (238, 186, 55), (114, 83, 156)]


def image_pixels():
    return bytearray((238, 238, 230)) * (WIDTH * HEIGHT)


def set_pixel(pixels, x, y, color):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        i = (y * WIDTH + x) * 3
        pixels[i:i + 3] = bytes(color)


def rect(pixels, x, y, w, h, color):
    for yy in range(max(0, y), min(HEIGHT, y + h)):
        for xx in range(max(0, x), min(WIDTH, x + w)):
            set_pixel(pixels, xx, yy, color)


def circle(pixels, cx, cy, radius, color):
    r2 = radius * radius
    for y in range(max(0, cy - radius), min(HEIGHT, cy + radius + 1)):
        for x in range(max(0, cx - radius), min(WIDTH, cx + radius + 1)):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r2:
                set_pixel(pixels, x, y, color)


def line(pixels, x0, y0, x1, y1, color, thickness=2):
    dx, dy = abs(x1 - x0), abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err = dx - dy
    while True:
        rect(pixels, x0 - thickness // 2, y0 - thickness // 2, thickness, thickness, color)
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            x0 += sx
        if e2 < dx:
            err += dx
            y0 += sy


def build_view(offset):
    pixels = image_pixels()
    rng = random.Random(20261116)
    for i in range(90):
        x = rng.randrange(24, WIDTH - 48) + offset
        y = rng.randrange(24, HEIGHT - 48)
        color = COLORS[i % len(COLORS)]
        size = rng.randrange(8, 30)
        if i % 3 == 0:
            circle(pixels, x, y, size // 2, color)
            circle(pixels, x, y, max(2, size // 5), (245, 245, 240))
        elif i % 3 == 1:
            rect(pixels, x - size // 2, y - size // 2, size, size, color)
            rect(pixels, x - size // 4, y - size // 4, size // 2, size // 2, (245, 245, 240))
        else:
            line(pixels, x - size, y - size // 2, x + size, y + size // 2, color, 3)
            line(pixels, x - size, y + size // 2, x + size, y - size // 2, color, 3)
    for y in range(16, HEIGHT, 32):
        line(pixels, 0, y, WIDTH - 1, y, (209, 211, 204), 1)
    return pixels


def main():
    target = Path(sys.argv[1])
    target.mkdir(parents=True, exist_ok=True)
    for index, offset in enumerate((0, 4, 8), start=1):
        path = target / f"view-{index:02d}.ppm"
        path.write_bytes(f"P6\n{WIDTH} {HEIGHT}\n255\n".encode() + build_view(offset))
        print(f"{path.name}: {WIDTH}x{HEIGHT} PPM")


if __name__ == "__main__":
    main()
