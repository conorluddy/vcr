# ThorVG SVG and Lottie raster (native C++)

Status: validated on macOS arm64 with ThorVG 1.1.4 (Homebrew), Apple clang 21.0.0 and Node v22.19.0 (checker only), 2026-11-24. The plan below was written before the first run; the observation section records what happened.

```text
./run.sh --record   # builds, renders twice, records expected/hashes.json only
./run.sh            # expect: thorvg-svg-raster: OK
```

`expected/probes.json` holds the predeclared pixels and was not changed after the first run. `expected/hashes.json` holds SHA-256 values of this machine's raw buffers and is the only recorded output.

## Intent and scope

- Tool ID and version/build: `thorvg` 1.1.4, Homebrew build (`pkg-config --modversion thorvg-1`). Library only, no CLI.
- VCR job and exact claim being tested: a small C++ program linked against ThorVG 1.1.4 loads a fixed inline SVG (filled shapes and one linear gradient) and rasterises it with the software canvas to a predeclared 120x80 size. Predeclared ARGB pixel values at known positions match, and reruns are byte-identical. The Lottie loader is present in this build, so the same program also renders frame 5 of a tiny inline Lottie and checks predeclared pixels for it.
- Explicit exclusions: no text, no masks, no blend modes, no strokes, no GPU backend, no threads (engine initialised with 0 threads), no ThorVG C API (C++ API only). No semantic claim about SVG conformance beyond the probed pixels. No claim about Lottie feature coverage beyond one translated rectangle. No other OS or architecture. Nothing is compared against resvg or any other renderer.
- Tool documentation and licence sources, checked 2026-11-24: `https://github.com/thorvg/thorvg` and `https://www.thorvg.org`. Licence MIT, read from the Homebrew formula metadata (`brew info --json=v2 thorvg`, read-only) and the catalogue card.
- Environment: macOS 26.6 arm64 (Darwin 25.6.0), Apple clang via `/usr/bin/clang++`, software ThorVG engine on the CPU. No GPU.
- Input: inline SVG and inline Lottie JSON as string constants in `render.cpp`. No external assets; both are written by hand for this fixture.
- Dependencies, installation plan, permissions, network and side effects: the Homebrew `thorvg` 1.1.4 formula is already installed (with `libomp`). Nothing new is installed. The build is a single `clang++` invocation writing into `output/`. No network access is needed.
- Selected workspace, generated output and cleanup paths: `examples/thorvg-svg-raster/output/` (git-ignored) holds the binary, raw buffers and `measured.json`. `rm -rf output` removes everything.

## Plan, before running

- Exact commands: `./run.sh --record` (builds, renders twice, writes `expected/hashes.json` only), then `./run.sh` (must print `thorvg-svg-raster: OK`). Build: `clang++ -std=c++17 -O2 -Wall $(pkg-config --cflags thorvg-1) render.cpp $(pkg-config --libs thorvg-1)`.
- Versions: ThorVG 1.1.4 (checked by `run.sh`, which fails on any other version), Apple clang from Xcode CLT, Node v22.19.0 for the checker only.
- Canvas: `tvg::SwCanvas`, `ARGB8888S` target (un-premultiplied), 120x80, transparent clear, `Initializer::init(0)` (single thread).
- Predeclared checks, all in `expected/probes.json`, written before the first run:
  1. Canvas size 120x80 and raw buffer length 38400 bytes.
  2. SVG probes (x, y, expected ARGB, tolerance per channel):
     - (20,20) red rect interior: `ffff0000`, tolerance 0.
     - (90,20) blue circle centre: `ff0000ff`, tolerance 0.
     - (20,60), (60,60), (99,60) on a black-to-white linear gradient spanning x 20..100: `ff020202`, `ff818181`, `fffdfdfd`, tolerance 3 (gradient interpolation is the only non-exact value).
     - (5,70) outside every shape: `00000000`, tolerance 0.
  3. Lottie loader present (its `Picture::load` with `lottie+json` returns Success), `totalFrame` = 10, and frame 5 is the rendered frame.
  4. Lottie probes at frame 5: (50,40) inside a 20x20 blue rectangle centred at x = 50 (linear progress 0.5 of a symmetric ease from x 10 to x 90): `ff0080ff`, tolerance 2. (10,40) and (90,40) outside the rectangle: `00000000`.
  5. Byte-identical reruns: `cmp` of `svg.argb`, `lottie-frame-5.argb` and `measured.json` between two separate runs.
  6. SHA-256 of each raw buffer and of `measured.json` equals `expected/hashes.json` (recorded on this machine; a machine or ThorVG build change invalidates it and needs `--record`).
- Expected artifacts: `output/run1/svg.argb` (38400 bytes), `output/run1/lottie-frame-5.argb` (38400 bytes), `output/run1/measured.json`.
- Intended consumer and handoff settings: none; this proves the native rasterisation route only. No delivery encode.
- Delivery constraints: none.
- Expected failure modes and stop conditions: pkg-config reports a version other than 1.1.4 (stop); compile fails (stop and report blocked); the Lottie load fails (the Lottie half is not claimed; result becomes `partial`, with the SVG half still scored); any probe outside tolerance or any rerun mismatch (`fail`).
- Reproduction and inspection: `./run.sh`; read `output/run1/measured.json`. Contact sheet: `magick -size 120x80 -depth 8 bgra:output/run1/svg.argb -background '#808080' -flatten -scale 400% output/svg-view.png` (same for the Lottie buffer), then `magick ... +append output/contact.png`. ARGB8888S buffers are little-endian, so ImageMagick reads them as `bgra`.

## Observation, after running

- Date and executor: 2026-11-24, Conors-MacBook-Pro-2.local (macOS 26.6, Darwin 25.6.0, arm64), Claude agent in worktree `agent-a658628a570b2a2fa`.
- Versions: ThorVG 1.1.4 (`pkg-config --modversion thorvg-1`, Homebrew Cellar 1.1.4, `libthorvg-1.dylib`); Apple clang 21.0.0 (clang-2100.3.34.2); Node v22.19.0; no Playwright or Chromium (not used); ImageMagick 7.1.2-35 for the contact sheet only.
- Commands: `./run.sh --record`, then `./run.sh`, which printed `reruns byte-identical` and `thorvg-svg-raster: OK`, exit 0.
- Measured (`output/run1/measured.json`, 120x80, 38400 bytes per buffer):
  - SVG (0xAARRGGBB): (20,20) `ffff0000`; (90,20) `ff0000ff`; (20,60) `ff010101` (predeclared `ff020202`, within tolerance 3); (60,60) `ff818181`; (99,60) `fffdfdfd`; (5,70) `00000000`. All as predeclared.
  - Lottie: loader present; totalFrame 10; frame 5. (50,40) `ff0080ff`; (10,40) and (90,40) `00000000`. All as predeclared.
  - Two runs, `cmp` identical for `svg.argb`, `lottie-frame-5.argb` and `measured.json`.
  - SHA-256 (recorded in `expected/hashes.json`): svg.argb `cac5a45b…d9bcb`, lottie-frame-5.argb `c1f332b8…a180`, measured.json `50fa33ef…2bb1`.
- Inspection (contact sheet `output/contact.png`, read at 4x): left panel shows the SVG with a red square at top left, a blue circle at top centre and a black-to-white gradient bar at lower left, on transparent background. Right panel shows the Lottie frame at frame 5 with one blue square (about 20x20) at the horizontal centre, on transparent background. Nothing clipped; the gradient runs smoothly from black at the left edge to white at the right edge.
- Pass / partial / fail / blocked: pass. Every predeclared probe is within tolerance, the Lottie loader is present, and reruns are byte-identical.
- Deviations and limitations: one gradient pixel differs by 1 from the predeclared value (within the declared tolerance of 3). The SVG and Lottie probes are single pixels, not a whole-image comparison, so edge antialiasing and shape geometry are not checked beyond those points. Hashes are specific to this machine's ThorVG build and to the single-threaded software engine; a different build or thread count may change them and needs `--record`.
- What this result establishes: a C++ program linked to Homebrew ThorVG 1.1.4 rasterises an inline SVG with filled shapes and a linear gradient to a 120x80 ARGB buffer on the software canvas, at the probed pixels; the Lottie loader in this build renders a frame at a predeclared frame number; repeated runs produce byte-identical output on this machine.
- What it does not establish: SVG or Lottie conformance beyond the probed pixels; text, masks, strokes or blend modes; GPU backends; multi-threaded output; the C API; other platforms; other ThorVG versions; output quality versus resvg or a browser.
- Reviewer, decision, follow-up and invalidation triggers: revisit on any ThorVG upgrade (the `run.sh` version gate will stop it first), on a change to `render.cpp` or the probes, or if the Lottie loader is removed from a build.
