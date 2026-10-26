# Native SVG title card

Status: validated on macOS arm64 with resvg 0.47.0 and FFmpeg 8.0.1, 2026-10-26.

A dependency-free SVG, rasterised by resvg and held for three seconds by FFmpeg. The first VCR fixture: it proves the static-asset path and the delivery path with no timeline involved.

```text
./run.sh            # expect: native-svg: OK
./run.sh --record   # re-record expected/ after a deliberate change or tool upgrade
```

`expected/` holds the PNG hash and the ffprobe metadata, not the media. Open `title-card.svg` in any editor to change it.
