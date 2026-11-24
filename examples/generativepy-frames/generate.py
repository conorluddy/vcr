"""Render a 48-frame generativepy sequence, in order and out of order, as PNGs.

Usage: generate.py OUTPUT_DIR
Writes OUTPUT_DIR/sequential/frameNNNNNNNN.png in order, then OUTPUT_DIR/shuffled/
with the same frame names, drawn in a fixed permutation. Each frame is a pure function
of its frame number; the scene reads no clock and no random source.
"""
import math
import os
import sys

from generativepy.color import Color
from generativepy.drawing import make_image, make_images
from generativepy.geometry import Circle, LinearGradient, Rectangle

FRAME_WIDTH_PX = 320
FRAME_HEIGHT_PX = 240
FRAME_COUNT = 48
SHUFFLE_STRIDE = 29  # coprime with FRAME_COUNT, so position k maps to a unique frame
CHANNELS_RGBA = 4
ORBIT_CENTRE_Y_PX = 100


# === PUBLIC API ===

def draw_frame(ctx, width, height, frame_number, frame_count):
    progress = frame_number / frame_count
    angle = 2 * math.pi * progress

    gradient = (LinearGradient()
                .of_points((0, 0), (width, 0))
                .with_stops([(0, Color(0.10, 0.45, 0.90, 1.0)), (1, Color(0.95, 0.35, 0.15, 0.0))])
                .build())
    Rectangle(ctx).of_corner_size((0, 176), width, 64).fill(gradient)

    Rectangle(ctx).of_corner_size((0, 0), width * (0.25 + 0.75 * progress), 12).fill(Color(0.2, 0.9, 0.6))

    orbit_x = 80 * math.cos(angle)
    orbit_y = 50 * math.sin(angle)
    Circle(ctx).of_center_radius((width / 2 + orbit_x, ORBIT_CENTRE_Y_PX + orbit_y), 18).fill(Color(1.0, 0.8, 0.1))
    Circle(ctx).of_center_radius((width / 2 - orbit_x, ORBIT_CENTRE_Y_PX - orbit_y), 10).fill(Color(0.9, 0.2, 0.7))


def write_sequential_frames(outputDirectory):
    os.makedirs(os.path.join(outputDirectory, 'sequential'), exist_ok=True)
    make_images(os.path.join(outputDirectory, 'sequential', 'frame'), draw_frame,
                FRAME_WIDTH_PX, FRAME_HEIGHT_PX, FRAME_COUNT, channels=CHANNELS_RGBA)


def write_shuffled_frames(outputDirectory):
    shuffledDirectory = os.path.join(outputDirectory, 'shuffled')
    os.makedirs(shuffledDirectory, exist_ok=True)
    for position in range(FRAME_COUNT):
        frameNumber = (SHUFFLE_STRIDE * position) % FRAME_COUNT
        make_image(os.path.join(shuffledDirectory, f'frame{frameNumber:08d}'),
                   draw_numbered_frame(frameNumber), FRAME_WIDTH_PX, FRAME_HEIGHT_PX, channels=CHANNELS_RGBA)


# === HELPERS ===

def draw_numbered_frame(frameNumber):
    """Adapts draw_frame to make_image's (ctx, width, height, index, count) signature."""
    def draw(ctx, width, height, _index, _count):
        draw_frame(ctx, width, height, frameNumber, FRAME_COUNT)
    return draw


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('usage: generate.py OUTPUT_DIR')
    write_sequential_frames(sys.argv[1])
    write_shuffled_frames(sys.argv[1])
