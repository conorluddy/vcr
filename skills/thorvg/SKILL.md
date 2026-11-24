---
name: thorvg
description: Rasterise inline SVG or one Lottie frame to a raw ARGB buffer with ThorVG's C++ software canvas. Use when one native library should render both SVG and Lottie without a browser; for static SVG alone use resvg.
---

# ThorVG

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Tested: a small C++ program linked to Homebrew ThorVG 1.1.4 loads inline SVG (filled shapes, one linear gradient) and one Lottie frame, draws each with `SwCanvas` at 120x80 and writes raw ARGB. Probed pixels match predeclared values and reruns are byte-identical. macOS arm64, CPU only.
- Library only: the Homebrew formula ships no CLI, so you write and compile C++ yourself. Output is a raw buffer; convert to PNG with ImageMagick, then FFmpeg.
- Use resvg instead when you only need a static SVG as PNG: it is a one-line CLI with a larger, documented SVG feature set. ThorVG earns its place when SVG and Lottie must go through one native renderer, or the work is already in native code.
- Use browser capture for anything needing DOM, CSS or browser APIs.
- Not tested: text, masks, strokes, blend modes, GPU backends, threads (engine ran with 0 threads), the C API, SVG or Lottie conformance, other platforms or versions.

## Capability map
Discovery only; documented does not mean validated. Entry points: [repository and API headers](https://github.com/thorvg/thorvg), [project site](https://www.thorvg.org).
- Canvases: `SwCanvas` (tested), plus GPU canvases in builds that enable them (untested).
- Paints: shapes, scenes, `Picture` (loads SVG, Lottie, raster formats by loader; SVG tested, Lottie tested via `LottieAnimation`), text (untested).
- Fills and effects: linear gradient from SVG (tested); radial, strokes, masks, blend modes (untested).
- Animation: `LottieAnimation::frame`, `totalFrame` (tested for one frame); other animation extensions untested.
- Loaders depend on the build; check at runtime (below).

## Install and doctor
```text
brew install thorvg
pkg-config --modversion thorvg-1   # expect: 1.1.4
```
The pkg-config name is `thorvg-1`. Validated: 1.1.4 on macOS arm64. `vcr doctor` reports whether it is installed.

## Smoke test
```text
vcr example create thorvg-svg-raster && (cd examples/thorvg-svg-raster && ./run.sh)
# expect: thorvg-svg-raster: OK  (preceded by "reruns byte-identical")
```
`run.sh` stops on any version other than 1.1.4. Hashes in `expected/hashes.json` are machine- and build-specific; `./run.sh --record` re-records them.

## Recipe (the tested route)
```cpp
#include <thorvg.h>
#include <thorvg_lottie.h>
tvg::Initializer::init(0);                      // 0 threads
auto picture = tvg::Picture::gen();
picture->load(svgText, svgLength, "svg", nullptr, true);   // true: copy the string
auto canvas = tvg::SwCanvas::gen();
std::vector<uint32_t> buffer(120 * 80, 0);      // transparent clear
canvas->target(buffer.data(), 120, 120, 80, tvg::ColorSpace::ARGB8888S);  // un-premultiplied
canvas->add(picture); canvas->draw(true); canvas->sync();
tvg::Initializer::term();                       // also frees canvas and paint
```
Lottie: `auto a = tvg::LottieAnimation::gen(); a->picture()->load(json, len, "lottie+json", nullptr, true); a->frame(5.0f);` then add `a->picture()` to a canvas. If `load` does not return `Success`, the build lacks the loader; the fixture reports `loader: absent`. In 1.1.4 here it is present.

Build:
```text
clang++ -std=c++17 -O2 -Wall $(pkg-config --cflags thorvg-1) render.cpp $(pkg-config --libs thorvg-1) -o render
```
View a buffer (ARGB8888S little-endian reads as `bgra`):
```text
magick -size 120x80 -depth 8 bgra:svg.argb -background '#808080' -flatten -scale 400% view.png
```

## Tested behaviour
- The SVG's pixel values at probes: solid fills exact, outside shapes `00000000`; the gradient was within 1 of its ideal and was checked with tolerance 3.
- Lottie frame 5 of a 10-frame animation rendered a translated rectangle at the predeclared position and colour.
- Probes are single pixels; edge antialiasing and whole-image fidelity were not compared.

## Troubleshooting
- `pkg-config` not found or wrong version: `brew install thorvg pkg-config`; the fixture refuses versions other than 1.1.4.
- Lottie `load` fails: the build has no Lottie loader; the SVG route still works.
- Hash mismatch after an upgrade, or with a different thread count: expected; re-record and note the version.

## Official docs
- https://github.com/thorvg/thorvg
- https://www.thorvg.org
