# Two solid RGB clips, a per-frame crossfade between them, spliced and converted to YUV420P8.
# Core functions only: BlankClip, FrameEval, Merge, Splice, resize.Bicubic.
import vapoursynth as vs

core = vs.core

red = core.std.BlankClip(width=320, height=180, format=vs.RGB24, length=24, fpsnum=24, fpsden=1, color=[200, 40, 40])
blue = core.std.BlankClip(width=320, height=180, format=vs.RGB24, length=24, fpsnum=24, fpsden=1, color=[40, 80, 220])

CROSSFADE_LAST_INDEX = 23


def blendAtFrame(n: int) -> vs.VideoNode:
    # The weight ramps 0 to 1 across the crossfade, so frame n is red at 0 and blue at 23.
    weight = n / CROSSFADE_LAST_INDEX
    return core.std.Merge(red, blue, weight=[weight, weight, weight])


crossfade = core.std.FrameEval(red, blendAtFrame)
spliced = core.std.Splice([red, crossfade, blue])
converted = core.resize.Bicubic(spliced, format=vs.YUV420P8, matrix_s="709", range_s="limited")
converted.set_output()
