"""Write one drawsvg SVG per predeclared time t. Each frame is a pure function of t.

Usage: generate.py OUT_DIR [sequential|shuffled]
"""

import sys
from pathlib import Path

import drawsvg as dw

CANVAS_WIDTH_PX = 480
CANVAS_HEIGHT_PX = 270
DURATION_SECONDS = 2.0
FRAME_TIMES_SECONDS = (0.0, 0.5, 1.0, 1.5, 2.0)
SHUFFLED_FRAME_INDEXES = (4, 1, 3, 0, 2)

CIRCLE_TRACK_START_X_PX = 60.0
CIRCLE_TRACK_END_X_PX = 420.0
CIRCLE_Y_PX = 80.0
CIRCLE_RADIUS_PX = 30.0
CIRCLE_COLOUR = "#e4572e"

SQUARE_CENTRE_X_PX = 240.0
SQUARE_CENTRE_Y_PX = 150.0
SQUARE_HALF_SIZE_PX = 30.0
SQUARE_COLOUR = "#29335c"
SQUARE_TURNS_PER_DURATION = 0.25

BAND_X_START_PX = 40.0
BAND_X_END_PX = 440.0
BAND_Y_PX = 200.0
BAND_HEIGHT_PX = 20.0
BAND_START_COLOUR = "#ff0000"
BAND_END_COLOUR = "#0000ff"

CAPTION_FONT_FAMILY = "JetBrains Mono"
CAPTION_FONT_SIZE_PX = 22
CAPTION_X_PX = 240.0
CAPTION_BASELINE_Y_PX = 252.0
CAPTION_COLOUR = "#111111"


# === PUBLIC API ===

def build_frame_drawing(frameTimeSeconds: float) -> dw.Drawing:
    progress = frameTimeSeconds / DURATION_SECONDS
    drawing = dw.Drawing(CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX, origin=(0, 0))

    bandCentreY = BAND_Y_PX + BAND_HEIGHT_PX / 2
    bandGradient = dw.LinearGradient(
        BAND_X_START_PX, bandCentreY, BAND_X_END_PX, bandCentreY, id="band-gradient"
    )
    bandGradient.add_stop(0, BAND_START_COLOUR)
    bandGradient.add_stop(1, BAND_END_COLOUR)
    drawing.append_def(bandGradient)

    circleCentreX = CIRCLE_TRACK_START_X_PX + (CIRCLE_TRACK_END_X_PX - CIRCLE_TRACK_START_X_PX) * progress
    drawing.append(
        dw.Circle(circleCentreX, CIRCLE_Y_PX, CIRCLE_RADIUS_PX, fill=CIRCLE_COLOUR, id="moving-circle")
    )

    squareAngleDegrees = 360.0 * SQUARE_TURNS_PER_DURATION * progress
    drawing.append(
        dw.Rectangle(
            SQUARE_CENTRE_X_PX - SQUARE_HALF_SIZE_PX,
            SQUARE_CENTRE_Y_PX - SQUARE_HALF_SIZE_PX,
            2 * SQUARE_HALF_SIZE_PX,
            2 * SQUARE_HALF_SIZE_PX,
            fill=SQUARE_COLOUR,
            id="rotating-square",
            transform=f"rotate({squareAngleDegrees!r} {SQUARE_CENTRE_X_PX!r} {SQUARE_CENTRE_Y_PX!r})",
        )
    )

    drawing.append(
        dw.Rectangle(
            BAND_X_START_PX,
            BAND_Y_PX,
            BAND_X_END_PX - BAND_X_START_PX,
            BAND_HEIGHT_PX,
            fill="url(#band-gradient)",
            id="band",
        )
    )

    drawing.append(
        dw.Text(
            f"t={frameTimeSeconds:.1f}s",
            CAPTION_FONT_SIZE_PX,
            CAPTION_X_PX,
            CAPTION_BASELINE_Y_PX,
            font_family=CAPTION_FONT_FAMILY,
            text_anchor="middle",
            fill=CAPTION_COLOUR,
            id="caption",
        )
    )
    return drawing


# === ENTRY POINT ===

def writeFramesInOrder(outputDirectory: Path, frameIndexOrder: tuple[int, ...]) -> None:
    outputDirectory.mkdir(parents=True, exist_ok=True)
    for frameIndex in frameIndexOrder:
        drawing = build_frame_drawing(FRAME_TIMES_SECONDS[frameIndex])
        drawing.save_svg(outputDirectory / f"frame-{frameIndex:04d}.svg")


def main(argumentValues: list[str]) -> int:
    if len(argumentValues) != 3 or argumentValues[2] not in ("sequential", "shuffled"):
        print("usage: generate.py OUT_DIR [sequential|shuffled]", file=sys.stderr)
        return 2
    outputDirectory = Path(argumentValues[1])
    if argumentValues[2] == "shuffled":
        writeFramesInOrder(outputDirectory, SHUFFLED_FRAME_INDEXES)
    else:
        writeFramesInOrder(outputDirectory, tuple(range(len(FRAME_TIMES_SECONDS))))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
