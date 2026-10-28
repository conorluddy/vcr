---
name: imagemagick
description: Generate, convert, inspect, compare and montage images from the CLI with ImageMagick 7 (`magick`). Use for test frames, contact sheets, pixel probes, alpha checks and image-sequence fixes in VCR.
---

# ImageMagick 7

## Use cases and limits
- Synthetic frames for fixtures, contact sheets for review, pixel and alpha inspection, format conversion, perceptual diffs.
- Not for video: hand sequences to FFmpeg. Text rendering needs an explicit `-font` on macOS (no default font is configured).

## Install and doctor
```text
brew install imagemagick
magick --version | head -1   # expect: Version: ImageMagick 7.x
```
Validated: 7.1.2-15 on macOS arm64, see `examples/ffmpeg-assembly` and `examples/browser-capture`.

## Recipes
Synthetic frame with a per-frame marker (no fonts needed):
```text
magick -size 320x180 "xc:hsl(120,60%,30%)" -fill white -draw "rectangle 0,0 60,20" frame-0010.png
```
Dimensions and channels:
```text
magick identify -format "%w %h %[channels]\n" in.png
```
Alpha statistics (0 = fully transparent, 1 = opaque):
```text
magick in.png -alpha extract -format "min=%[fx:minima] max=%[fx:maxima] mean=%[fx:mean]\n" info:
```
Contact sheet from a sequence:
```text
magick montage frames/frame-00*.png -tile 6x -geometry 320x180+4+4 -background '#111410' sheet.png
```
Perceptual difference between two renders:
```text
magick compare -metric AE -fuzz 1% a.png b.png diff.png
```

## Troubleshooting
- `unable to read font`: pass `-font /System/Library/Fonts/Supplemental/Arial.ttf` or avoid text.
- `convert` is deprecated in v7; always call `magick`.

## Official docs
https://imagemagick.org/script/command-line-tools.php
