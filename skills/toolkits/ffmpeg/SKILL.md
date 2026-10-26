---
name: vcr-ffmpeg
description: Assemble image sequences into video, mux audio, trim, inspect media with ffprobe, and export delivery formats including alpha-preserving ProRes 4444. Use for any encode, mux, probe or filtergraph task in a VCR project.
---

# FFmpeg and ffprobe

Delivery path for every renderer in VCR. Native output (Blender, browser capture, ImageMagick sequences) always becomes video here.

## Use cases and limits
- Image sequence to MP4/MOV/WebM/GIF; audio mux; trim and concatenate; overlay and crossfade via filtergraphs; probe any media.
- Not a timeline: composition decisions live in VCR's resolver (Layer 2). FFmpeg receives resolved frame intervals.
- Output bytes differ across FFmpeg builds; verify with ffprobe metadata and frame hashes, not container hashes.

## Install and doctor
```text
brew install ffmpeg          # macOS
ffmpeg -version | head -1    # expect: ffmpeg version 8.x
pnpm doctor                  # records it in environment/<hostname>.json
```
Validated: 8.0.1 on macOS arm64, see `examples/ffmpeg-assembly`.

## Smoke test
```text
examples/ffmpeg-assembly/run.sh
# expect: ffmpeg-assembly: OK  (48 frames at 24 fps = 2.000000 s, aac audio 48 kHz)
```

## Recipes
Sequence to MP4 (web delivery):
```text
ffmpeg -y -framerate 30 -i frames/frame-%04d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart out.mp4
```
Sequence with alpha to ProRes 4444 (intermediate for compositing):
```text
ffmpeg -y -framerate 30 -i frames/frame-%04d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le out.mov
```
Still image held for N seconds:
```text
ffmpeg -y -loop 1 -framerate 30 -i card.png -t 3 -c:v libx264 -pix_fmt yuv420p out.mp4
```
Probe as JSON (what the examples diff against):
```text
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -show_entries format=duration -of json in.mp4
```

## Clock rules
- `-framerate` on the input sets the sequence clock; `-r` on the output resamples. Use only `-framerate` for sequences.
- `-shortest` ends at the shorter of audio and video; declare which is authoritative in the render manifest.
- Durations round to the container timebase. Record the ffprobe duration; do not assume frames / fps.

## Troubleshooting
- `height not divisible by 2`: libx264 with yuv420p needs even dimensions; pad or scale with `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"`.
- Washed-out colour from PNGs: add `-color_range pc` awareness or convert deliberately; record the choice in the compositor spike.
- Missing frames in a sequence break `%04d`; use `-pattern_type glob -i 'frames/*.png'` only when gaps are intended.

## Official docs
https://ffmpeg.org/documentation.html · https://ffmpeg.org/ffmpeg-filters.html
