# FFmpeg assembly

Status: validated on macOS arm64 with ImageMagick 7.1.2-15 and FFmpeg 8.0.1, 2026-10-26.

ImageMagick draws 48 frames whose hue and a marker bar encode the frame index, FFmpeg generates a 440 Hz tone, and the two are muxed into an MP4. ffprobe metadata is diffed against `expected/`.

```text
./run.sh            # expect: ffmpeg-assembly: OK
./run.sh --record
```

Observed duration policy, feeding PRD L2-07: 48 frames at 24 fps probe as exactly 2.000000 s with `-shortest` and a 2 s tone; the AAC stream reports 95 frames at 48 kHz.
