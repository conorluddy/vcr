"""Draw recorded pymunk states as SVG frames for human inspection only.

Usage: frames_svg.py SIMULATION_JSON OUTPUT_DIR
Writes step-NNNN.svg for each recorded step. No check reads these files.
"""
import json
import math
import sys
from pathlib import Path

from scene import BODY_SPECS, FLOOR_HALF_WIDTH_PX, FLOOR_RADIUS_PX

CANVAS_WIDTH_PX = 800
CANVAS_HEIGHT_PX = 520
BALL_COLOUR = "#c0392b"
BODY_COLOUR = "#2c3e50"
FLOOR_COLOUR = "#7f8c8d"


# === PUBLIC API ===

def main(argv: list[str]) -> int:
    if len(argv) != 3:
        sys.exit("usage: frames_svg.py SIMULATION_JSON OUTPUT_DIR")
    simulation = json.loads(Path(argv[1]).read_text())
    output_dir = Path(argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)
    for step_key, state in simulation["states"].items():
        frame_path = output_dir / f"step-{int(step_key):04d}.svg"
        frame_path.write_text(render_frame(state["bodies"]))
    return 0


# === HELPERS ===

def render_frame(bodies: dict) -> str:
    elements = [
        f'<rect x="0" y="{CANVAS_HEIGHT_PX - FLOOR_RADIUS_PX * 2}" '
        f'width="{CANVAS_WIDTH_PX}" height="{FLOOR_RADIUS_PX * 2}" fill="{FLOOR_COLOUR}"/>'
    ]
    for spec in BODY_SPECS:
        state = bodies[spec.name]
        screen_x = state["x"] + FLOOR_HALF_WIDTH_PX
        screen_y = CANVAS_HEIGHT_PX - state["y"]
        colour = BALL_COLOUR if spec.name == "ball" else BODY_COLOUR
        if spec.kind == "box":
            half = spec.size_px / 2
            angle_deg = -math.degrees(state["angle"])
            elements.append(
                f'<rect transform="translate({screen_x:.6f} {screen_y:.6f}) rotate({angle_deg:.6f})" '
                f'x="{-half}" y="{-half}" width="{spec.size_px}" height="{spec.size_px}" fill="{colour}"/>'
            )
        else:
            elements.append(
                f'<circle cx="{screen_x:.6f}" cy="{screen_y:.6f}" r="{spec.size_px}" fill="{colour}"/>'
            )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS_WIDTH_PX}" height="{CANVAS_HEIGHT_PX}" '
        f'viewBox="0 0 {CANVAS_WIDTH_PX} {CANVAS_HEIGHT_PX}">\n  '
        + "\n  ".join(elements)
        + "\n</svg>\n"
    )


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
