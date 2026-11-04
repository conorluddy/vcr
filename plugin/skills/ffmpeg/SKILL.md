---
name: ffmpeg
description: Encode, mux, filter, probe and assemble media with FFmpeg and ffprobe, including image sequences to video and alpha-preserving ProRes 4444. Use for any encode, mux, probe or filtergraph task; it is the delivery path for every renderer in VCR.
---

# FFmpeg and ffprobe

Delivery path for every renderer in VCR. Native output (Blender, browser capture, ImageMagick sequences) always becomes video here.


`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).
## Use cases and limits
- Image sequence to MP4/MOV/WebM/GIF; audio mux; trim and concatenate; overlay and crossfade via filtergraphs; probe any media.
- Not a timeline: composition decisions live in VCR's resolver (Layer 2). FFmpeg receives resolved frame intervals.
- Output bytes differ across FFmpeg builds; verify with ffprobe metadata and frame hashes, not container hashes.
- Licence LGPL-2.1, or GPL when built with GPL components; Homebrew's build is GPL.

## Install and doctor
```text
brew install ffmpeg
ffmpeg -version | head -1    # e.g. 8.x from Homebrew, 6.1 on Ubuntu 24.04; any recent release works
vcr doctor                   # records it in ~/.vcr/environment/<hostname>.json
```
Validated 8.0.1 on macOS arm64 and 6.1.1 on Linux x86_64 (2026-11-04), see `examples/ffmpeg-assembly`.

## Smoke test
```text
vcr example create ffmpeg-assembly && (cd examples/ffmpeg-assembly && ./run.sh)
# expect: ffmpeg-assembly: OK  (48 frames at 24 fps = 2.000000 s, aac audio 48 kHz)
```

## Encode
```text
ffmpeg -y -i in.mov -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart out.mp4   # web delivery
ffmpeg -y -i in.mov -c:v libvpx-vp9 -b:v 0 -crf 30 -pix_fmt yuva420p out.webm                        # web with alpha
ffmpeg -y -i in.mov -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le out.mov                      # intermediate with alpha
```
`yuv420p` needs even dimensions: `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"` when in doubt.

## GIF
```text
ffmpeg -y -framerate 24 -i frames/frame-%04d.png -vf "split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" -loop 0 out.gif
```
Build the palette from the frames themselves; without it colours band badly. GIF has 1-bit alpha only, so soft edges need a matte colour. For higher quality, use gifski on the same frames.

## Mux
```text
ffmpeg -y -i video.mp4 -i voice.wav -c:v copy -c:a aac -b:a 192k -shortest out.mp4
ffmpeg -y -i a.mp4 -i b.mp4 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[v]" -map "[v]" out.mp4
```
`-shortest` ends at the shorter stream; declare which stream is authoritative in the render manifest.

## Filtergraph
```text
ffmpeg -y -i bg.mp4 -i fg.mov -filter_complex "[0:v][1:v]overlay=x=100:y=50:format=auto[v]" -map "[v]" out.mp4
ffmpeg -y -i a.mp4 -i b.mp4 -filter_complex "[0:v][1:v]xfade=transition=fade:duration=1:offset=4[v]" -map "[v]" out.mp4
```
`format=auto` on overlay keeps the foreground's alpha. Filters run in the input's colour range; PNGs are full range, so set `-color_range pc` awareness deliberately.

## Probe
```text
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,pix_fmt -show_entries format=duration -of json in.mp4
ffprobe -v error -select_streams v:0 -show_frames -show_entries frame=pts_time -of csv=p=0 in.mp4 | head
```
The JSON form is what the examples diff against.

## Image sequences
```text
ffmpeg -y -framerate 30 -i frames/frame-%04d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart out.mp4
ffmpeg -y -loop 1 -framerate 30 -i card.png -t 3 -c:v libx264 -pix_fmt yuv420p out.mp4     # hold a still
ffmpeg -y -i in.mp4 -vf fps=30 frames/frame-%04d.png                                      # back to frames
```
- `-framerate` on the input sets the sequence clock; `-r` on the output resamples. Use only `-framerate` for sequences.
- Gaps break `%04d`; use `-pattern_type glob -i 'frames/*.png'` only when gaps are intended.
- Durations round to the container timebase. Record the ffprobe duration; do not assume frames / fps.

## Troubleshooting
- `height not divisible by 2`: see Encode.
- Washed-out colour from PNGs: range or colour-space mismatch; the compositor spike will fix the convention, until then test with `-vf scale=in_range=pc:out_range=tv`.
- Alpha lost: the codec or pixel format has no alpha; use prores_ks 4444, vp9 yuva420p, or PNG/qtrle.

## Official docs
https://ffmpeg.org/documentation.html · https://ffmpeg.org/ffmpeg-filters.html
