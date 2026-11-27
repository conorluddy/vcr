---
name: gopro-overlay
description: Render telemetry widgets (speed, heart rate, altitude, bar gauge) as a transparent overlay movie from a GPX track with gopro-dashboard-overlay and an XML layout. Load once it has been chosen to turn timed GPS data into frame-synced gauges; the VCR run covers GPX-only input, not GoPro video or maps.
---

# gopro-overlay (gopro-dashboard-overlay)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Timestamped GPS (GPX, FIT or GoPro GPMF) becomes gauges, charts or a route trace as video, drawn by an XML layout and piped to FFmpeg.
- GPL-3.0-or-later: run it as a separate process; do not import or link it into a scene.
- VCR evidence covers 0.134.0, Python 3.12, macOS arm64, `--use-gpx-only` with text, metric and bar widgets. GoPro and FIT input, map widgets (online tiles) and the bundled layouts are untested. Static maps: `maplibre-native` or `chiitiler`.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `--use-gpx-only --gpx FILE --overlay-size WxH` | [README](https://github.com/time4tea/gopro-dashboard-overlay) | tested |
| XML layouts: `text`, `metric`, `bar`, `composite` | README, bundled `layouts/*.xml` | tested |
| FFmpeg `--profile` (output codec) | README | qtrle/argb tested |
| GoPro MP4 input, `--generate overlay`, FIT | README | untested |
| `map`, `journey`, `chart`, icon widgets, `--map-style` | README | untested (tiles need network) |

## Install and doctor
```sh
python3.12 -m venv output/venv && output/venv/bin/pip install gopro-overlay==0.134.0
```
Needs FFmpeg on `PATH` and a font file (default Roboto; pass `--font Arial.ttf` on macOS). A project-local venv; `vcr doctor` does not probe it. Never install globally.

## Smoke test
```sh
cd examples/gopro-overlay-gpx-widgets && ./run.sh
# expect: gopro-overlay-gpx-widgets: OK (partial; failed as recorded: distinct_frames_101 numbers_match_gpx)
```
Renders twice, compares frame hashes, and reads the drawn digits with tesseract (needed by the fixture only).

## Recipe
```sh
echo '{"qtrle": {"input": [], "output": ["-vcodec", "qtrle", "-pix_fmt", "argb"]}}' > cfg/ffmpeg-profiles.json
gopro-dashboard.py --use-gpx-only --gpx track.gpx --overlay-size 640x360 \
  --layout xml --layout-xml layout.xml --font Arial.ttf --profile qtrle \
  --config-dir cfg --cache-dir cache overlay.mov
```
`layout.xml`: `<component type="metric" x="20" y="44" metric="speed" units="kph" dp="0" size="120"/>`; a `bar` must sit inside a `<composite x= y=>` and takes `width`, `height`, `metric`, `units`, `min`, `max`. Heart rate comes from `gpxtpx:hr` extensions. The source rate is 10 fps; the movie is resampled to 30 fps.

## Troubleshooting
- `--generate overlay` with `--use-gpx-only` is rejected; the overlay movie is the normal output.
- Default output is H.264 and has no alpha; add a profile as above.
- `bar` with `fill="True"` fails (`int()` expected); omit it. `bar` outside a composite fails on `x,y`.
- Speed at the first second was 33 km/h on a true 36 km/h track; trim or ignore the first second.
- One source frame repeated near 5.5 s (100 distinct of 101); identical on both renders.
- Without `--config-dir` and `--cache-dir` it writes to `~/.gopro-graphics`.

## Official docs
- [Repository and README](https://github.com/time4tea/gopro-dashboard-overlay)
- [gopro-overlay on PyPI](https://pypi.org/project/gopro-overlay/)
