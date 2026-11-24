---
name: frei0r
description: Apply frei0r video-effect plugins to frames through MLT's `melt`, with FREI0R_PATH set. Load when a frame effect such as invert or brightness should come from a frei0r plugin; use FFmpeg for ordinary filters.
---

# frei0r

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- frei0r is a plugin collection (filters, generators, mixers), not a program. It needs a host; the tested host is MLT's `melt`, see `mlt-melt`.
- VCR evidence covers only frei0r 3.7.1 (Homebrew) through MLT 7.42.0 `melt` on macOS arm64, with `FREI0R_PATH` set: `invert0r` and `brightness` on one generated 64×48 four-quadrant frame, raw RGBA output.
- Untested: GStreamer, the C API, other plugins, video codecs, non-opaque input, animation or keyframes, other platforms. Homebrew FFmpeg 9.0.2 has no frei0r filter, so FFmpeg is not a route here.
- Treatment intent, stack order and encode survival belong to the image-treatment pillar: `FX-BLEND-SPACE-DECLARED`, `FX-INTENSITY-RESTRAINT`, `FX-DETERMINISM`, `FX-PRESET-SMELL`; load `image-treatment`. This guide gives no thresholds.

## Capability map
Discovery only; documentation is not VCR validation.
- [frei0r project](https://frei0r.dyne.org/) and [source and plugin list](https://github.com/dyne/frei0r): the plugin API and the effect collection. Tested: `invert0r`, `brightness`. Documented, untested: every other plugin (MLT registered about 107 frei0r services on the test host).
- MLT's frei0r notes ship in `<mlt prefix>/share/mlt/frei0r/`; the [MLT docs](https://mltframework.org/docs/) cover filters in a melt command line. Tested: `-filter frei0r.<name> <index>=<value>`. Untested: transitions, producers, XML projects, keyframes.

## Install and doctor
```text
brew install frei0r mlt
brew list --versions frei0r
vcr doctor
```
Validated: frei0r 3.7.1, MLT 7.42.0_1, macOS 26.6 arm64. Plugins live in `$(brew --prefix)/lib/frei0r-1/`.

## Smoke test
```text
vcr example create frei0r-effect
cd examples/frei0r-effect && ./run.sh
# expect: OK
```
`run.sh` sets `FREI0R_PATH`, renders six variants twice and checks every pixel.

## Recipe
```text
export FREI0R_PATH="$(brew --prefix)/lib/frei0r-1"
melt in.ppm out=0 -filter frei0r.invert0r -consumer avformat:out.rgba f=rawvideo pix_fmt=rgba s=64x48 r=25
melt in.ppm out=0 -filter frei0r.brightness 0=0.75 -consumer avformat:out.rgba f=rawvideo pix_fmt=rgba s=64x48 r=25
```
Proven on the fixture:
- `invert0r` gives exactly `255 - v` per RGB channel (tolerance 0); applied twice it restores the input; alpha stays 255.
- `brightness` parameter 0.5 is the identity. 0.25 matches `floor(v*0.5)` and 0.75 matches `v + (255-v)*0.5`, each within ±1; output is monotonic in the parameter at every pixel and channel.
- Reruns are byte-identical (`FX-DETERMINISM`, on this host only).

## Hazard: silent no-op
Without `FREI0R_PATH`, melt registers zero frei0r filters and a `frei0r.*` filter passes frames through unchanged, with no error. Always export it, and always include a detector: render a known frame through `frei0r.invert0r` and confirm the output is not equal to the input (the fixture's `invert` equals `255 - v`; a no-op equals the input). Run it before trusting any other frei0r filter in the same environment.

## Troubleshooting
- Output equals input: `FREI0R_PATH` unset or wrong; check `$FREI0R_PATH/invert0r.so` exists.
- `run.sh` exits on a version mismatch: it pins melt 7.42.0 and frei0r 3.7.1; a different build may round brightness differently (the check absorbs only ±1).
- Reruns differ: stop and inspect; do not update `expected/` until understood.

## Official docs
- [frei0r](https://frei0r.dyne.org/)
- [frei0r source](https://github.com/dyne/frei0r)
- [MLT documentation](https://mltframework.org/docs/)
