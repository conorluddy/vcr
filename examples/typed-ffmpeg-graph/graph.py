"""Build the typed-ffmpeg filter graph, compile it, render it, or show an invalid-graph rejection.

Modes: `compile` prints the compiled command as JSON, `render` runs system ffmpeg on the compiled
arguments, `invalid` prints the error raised when an audio stream feeds a video input.
"""

import json
import subprocess
import sys

from ffmpeg import FFMpegTypeError, sources
from ffmpeg.compile import compile_cli
from ffmpeg.dag.nodes import OutputStream

OUTPUT_PATH = "output/graph.mp4"
FRAME_RATE = "24"
DURATION_SECONDS = "2"


def build_output_stream() -> OutputStream:
    base = sources.testsrc(size="320x180", rate=FRAME_RATE, duration=DURATION_SECONDS)
    logo = sources.testsrc2(size="640x360", rate=FRAME_RATE, duration=DURATION_SECONDS).scale(w=160, h=90)
    boxed = base.overlay(logo, x=10, y=10).drawbox(
        x=0, y=0, width=50, height=20, color="white", thickness="fill"
    )
    return boxed.output(
        filename=OUTPUT_PATH,
        vcodec="libx264",
        pix_fmt="yuv420p",
        r=FRAME_RATE,
        t=DURATION_SECONDS,
        extra_options={"movflags": "+faststart"},
    )


def compile_command_json() -> str:
    return json.dumps({"command": compile_cli.compile(build_output_stream())}, indent=2, sort_keys=True)


def render_graph() -> None:
    arguments = compile_cli.compile_as_list(build_output_stream())
    completed = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *arguments], check=False)
    if completed.returncode != 0:
        sys.exit(f"ffmpeg exited with status {completed.returncode}")


def invalid_graph_rejection() -> str:
    video = sources.testsrc(size="320x180", rate=FRAME_RATE, duration=DURATION_SECONDS)
    tone = sources.sine(frequency=440, sample_rate=48000, duration=DURATION_SECONDS)
    try:
        video.overlay(tone)
    except FFMpegTypeError as error:
        return json.dumps({"error_type": type(error).__name__, "message": str(error)}, indent=2, sort_keys=True)
    sys.exit("invalid graph was accepted; expected FFMpegTypeError")


def main(arguments: list[str]) -> None:
    mode = arguments[0] if arguments else ""
    if mode == "compile":
        print(compile_command_json())
    elif mode == "render":
        render_graph()
    elif mode == "invalid":
        print(invalid_graph_rejection())
    else:
        sys.exit("usage: graph.py compile | render | invalid")


if __name__ == "__main__":
    main(sys.argv[1:])
