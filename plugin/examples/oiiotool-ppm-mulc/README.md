# oiiotool PPM multiply by one half

## Intent and scope

- **Tool/version:** `openimageio-oiiotool`, Homebrew OpenImageIO 3.2.2.0 (`oiiotool`).
- **Claim:** the actual native CLI multiplies all channels of an owned 2×2 8-bit RGB PPM by 0.5, preserving dimensions and producing exact expected RGB pixels; two runs are repeatable.
- **Exclusions:** no EXR, float/multichannel formats, sequences, metadata preservation beyond PPM dimensions/channels/bit depth, OCIO, color conversion, or broad format support.
- **Environment:** macOS 26.6 arm64; Homebrew formula metadata reported OpenImageIO 3.2.2.0 before installation. Python was 3.9.6 before install; Homebrew's install changed the selected runtime to 3.15.2, recorded below.
- **Input/rights:** generated four-pixel P6 PPM, no external imagery.
- **Dependencies/install plan:** `brew install openimageio` if absent. Homebrew formula reports 3.2.2.0. Native package install is authorized; it may install formula dependencies. No source checkout or network asset retrieval by the fixture. Source, output images and caches stay within ignored `output/`.
- **Documentation:** [official oiiotool docs](https://openimageio.readthedocs.io/en/stable/oiiotool.html), checked 2026-11-16; Homebrew formula metadata reports stable 3.2.2.0.

## Plan, before running

- **Command:** `./run.sh --record` creates `output/source.ppm`, then runs `oiiotool output/source.ppm --mulc 0.5 -o output/first.ppm` and repeats to `output/second.ppm`; `./run.sh` repeats and diffs against `expected/result.json`.
- **Expected artifacts/checks:** source rows repeat two distinct, even-valued RGB triplets `[20,40,60]`, `[80,100,120]`; expected half values in row-major file order are `[10,20,30]`, `[40,50,60]`, `[10,20,30]`, `[40,50,60]`. Assert exact CLI version 3.2.2.0, P6, 2×2, max value 255, 3 channels, and two output files byte-identical with the recorded SHA-256. Inspect CLI verbose metadata and raster preview.
- **Expected failure/stop conditions:** executable missing after install, actual version differs from 3.2.2.0, CLI failure, wrong dimensions/channel/depth/pixels, or nonrepeat output.
- **Reproduction/inspection:** from repository root, run `examples/oiiotool-ppm-mulc/run.sh --record`, then run it again. Review `oiiotool --info -v` and open the ignored PNG preview.

## Observation, after running

- **Plan adjustment:** `--flip` left the PPM byte raster unchanged in this path; `--flop` yielded a 180° byte ordering, and `--mulc 0.5` with four distinct source pixels appeared vertically reversed in the output PPM bytes. To isolate channel math without claiming row-orientation semantics, use two known colors repeated on both rows.
- **Date/executor and observed environment:** 2026-11-16, `Conors-MacBook-Pro-2.local`; macOS 26.6 arm64 (Darwin 25.6.0); Homebrew OpenImageIO 3.2.2.0_1 (`oiiotool --version`: 3.2.2.0); Python 3.15.2.
- **Observed output/checks:** output is P6 PPM, 2×2, 3-channel uint8, max 255; exact RGB pixels `[10,20,30]`, `[40,50,60]`, `[10,20,30]`, `[40,50,60]`. `oiiotool --info -v` reported 2×2, three channels, uint8 PNM. Two output files matched byte-for-byte; SHA-256 `0274406f50e14af03f177a7800c8d4528959a3aa6c128bb6f9e5adbf30c7027d`. Record and verify exited 0.
- **Inspection:** opened a nearest-neighbor enlarged preview; the two distinct dark RGB colors appear across both repeated rows as expected. No image defects noted.
- **Install effects:** `brew install openimageio` installed 3.2.2.0_1 plus `minizip-ng`, `pystring`, `yaml-cpp`, `zlib-ng-compat`, `opencolorio`, `pugixml`, `python@3.15`, `hwloc` and `tbb`; upgraded `fmt`, `highway`, `little-cms2`, `jpeg-xl`, `libde265`, `libheif`, `libraw` and `sqlite`; updated Homebrew 7.0.13→7.0.14; then auto-cleaned outdated formula versions and cached downloads, including old Node 23.9.0, Python 3.12, FFmpeg 8.0.1_4 and OpenEXR 3.4.5/3.4.6. No install or network operation occurs in the fixture.
- **Deviations/limits:** PPM orientation behavior made spatial flip assertions ambiguous, so this fixture tests only channel multiplication. No EXR, float, multichannel, sequence, OCIO, color-management or other format claims.
- **Pass:** exact pixel, metadata and byte-repeat assertions passed. No guide was added; the evidence may justify one.
