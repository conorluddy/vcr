---
name: vapoursynth
description: Build a clip in a VapourSynth .vpy script with core functions and stream it as Y4M with vspipe into FFmpeg. Load when per-frame scripted video processing is needed; FFmpeg alone covers plain encoding and filtergraphs.
---

# VapourSynth

A frame-server for scripted per-frame processing. A `.vpy` script defines a clip; `vspipe` serves its frames as Y4M; FFmpeg encodes.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Per-frame logic in Python (a frame number drives a blend weight), core filters, format and colour conversion, frame ranges rendered in separate processes.
- Encoding and muxing are not VapourSynth's job: pipe to FFmpeg (`ffmpeg`).
- Tested here: core functions only, no plugins, no alpha, macOS arm64 (Homebrew, Core R82, API R4.3, FFmpeg 9.0.2).
- Source filters (ffms2, lsmas) and other plugins are untested.

## Capability map
- Tested: `std.BlankClip`, `std.FrameEval` with `std.Merge` weight per frame, `std.Splice`, `resize.Bicubic` to YUV420P8 (matrix 709, limited range); `vspipe --info`, `-c y4m`, `-s/-e` ranges, piping to stdout.
- Documented, untested: other `std` and `resize` functions, plugins and plugin loading, audio nodes, script arguments (`-a`), other output formats (e.g. `-c wav`), multithreading options ([Python reference](https://www.vapoursynth.com/doc/pythonreference.html), [functions](https://www.vapoursynth.com/doc/functions/video/index.html), [vspipe](https://www.vapoursynth.com/doc/vspipe.html), [plugins](https://www.vapoursynth.com/doc/plugins/index.html)).

## Install and doctor
```text
brew install vapoursynth
vspipe --version     # Core R82, API R4.3 when validated
vcr doctor
```
Validated 2026-11-24 on macOS arm64, see `examples/vapoursynth-script-frames`.

## Smoke test
```text
vcr example create vapoursynth-script-frames && (cd examples/vapoursynth-script-frames && ./run.sh)
# expect: vapoursynth-script-frames: OK
```
Checks 320x180, 72 frames, 24/1, YUV420P8; exact pixels at five frames (within 2 codes); out-of-order ranges byte-identical to sequential; reruns byte-identical.

## Script and run
```python
import vapoursynth as vs
core = vs.core
red = core.std.BlankClip(width=320, height=180, format=vs.RGB24, length=24, fpsnum=24, fpsden=1, color=[200, 40, 40])
blue = core.std.BlankClip(width=320, height=180, format=vs.RGB24, length=24, fpsnum=24, fpsden=1, color=[40, 80, 220])
def blendAtFrame(n):
    w = n / 23
    return core.std.Merge(red, blue, weight=[w, w, w])
clip = core.std.Splice([red, core.std.FrameEval(red, blendAtFrame), blue])
core.resize.Bicubic(clip, format=vs.YUV420P8, matrix_s="709", range_s="limited").set_output()
```
```text
vspipe --info scene.vpy -                                    # width, height, frames, fps, format
vspipe -c y4m scene.vpy - | ffmpeg -y -i - -c:v libx264 -pix_fmt yuv420p out.mp4
vspipe -c y4m -s 24 -e 35 scene.vpy part.y4m                 # frames 24 to 35 only
```
- Call `set_output()` once; `vspipe` fails without it.
- Convert from RGB to YUV with explicit `matrix_s` and `range_s`. Measured at luma (160,90): red (200,40,40) is Y80 U112 V198; blue (40,80,220) is Y86 U194 V105.
- `-s/-e` ranges are inclusive frame indices; separate processes in any order matched the sequential frames byte for byte. Reruns are byte-identical (Y4M only; MP4 bytes are not hashed, probe them instead).

## Troubleshooting
- `import vapoursynth` fails in `python3`: VapourSynth embeds its own Python (3.15 under `/opt/homebrew/Cellar/vapoursynth/82/libexec/bin/python`), and the system `python3` has no module. Run scripts through `vspipe` or that interpreter.
- `vspipe` prints progress to stderr; that is normal, keep it out of the pipe.
- PNG frames from FFmpeg number from 1 by default; pass `-start_number 0` for index-matching names.

## Official docs
https://www.vapoursynth.com/doc/ (Core R82)
