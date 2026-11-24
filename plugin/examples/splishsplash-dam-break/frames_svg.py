"""Draw recorded dam-break frames as SVG for a human look. Not gating: no check reads it.

Usage: frames_svg.py SIMULATION.json OUTPUT_DIRECTORY
Writes frame-NNNN.svg (NNNN = step) for each recorded frame, in the box coordinates of scene.json.
"""
import json
import os
import sys

PIXELS_PER_METRE = 200
MARGIN_PIXELS = 20
BOX_MIN_X, BOX_MAX_X = -1.0, 1.0
BOX_MIN_Y, BOX_MAX_Y = 0.0, 2.0
PARTICLE_RADIUS_PIXELS = 0.02 * PIXELS_PER_METRE


def toPixelX(metresX: float) -> float:
    return MARGIN_PIXELS + (metresX - BOX_MIN_X) * PIXELS_PER_METRE


def toPixelY(metresY: float) -> float:
    return MARGIN_PIXELS + (BOX_MAX_Y - metresY) * PIXELS_PER_METRE


def frameSvg(frame: dict) -> str:
    width = (BOX_MAX_X - BOX_MIN_X) * PIXELS_PER_METRE + 2 * MARGIN_PIXELS
    height = (BOX_MAX_Y - BOX_MIN_Y) * PIXELS_PER_METRE + 2 * MARGIN_PIXELS
    boxLeft = toPixelX(BOX_MIN_X)
    boxTop = toPixelY(BOX_MAX_Y)
    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" height="{height:.0f}" viewBox="0 0 {width:.0f} {height:.0f}">',
        '<rect width="100%" height="100%" fill="#ffffff"/>',
        f'<rect x="{boxLeft:.1f}" y="{boxTop:.1f}" width="{(BOX_MAX_X - BOX_MIN_X) * PIXELS_PER_METRE:.1f}" height="{(BOX_MAX_Y - BOX_MIN_Y) * PIXELS_PER_METRE:.1f}" fill="none" stroke="#2a6f97" stroke-width="3"/>',
    ]
    for x, y, _ in frame["positions"]:
        lines.append(f'<circle cx="{toPixelX(x):.2f}" cy="{toPixelY(y):.2f}" r="{PARTICLE_RADIUS_PIXELS:.2f}" fill="#1d4e89"/>')
    lines.append(f'<text x="10" y="{height - 8:.0f}" font-size="14" fill="#333">t = {frame["timeSeconds"]:.2f} s, {frame["particleCount"]} particles</text>')
    lines.append("</svg>")
    return "\n".join(lines) + "\n"


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__, file=sys.stderr)
        return 2
    with open(argv[1], encoding="utf-8") as handle:
        run = json.load(handle)
    os.makedirs(argv[2], exist_ok=True)
    for stepKey, frame in run["frames"].items():
        outputPath = os.path.join(argv[2], f"frame-{int(stepKey):04d}.svg")
        with open(outputPath, "w", encoding="utf-8") as handle:
            handle.write(frameSvg(frame))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
