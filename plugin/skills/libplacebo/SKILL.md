---
name: libplacebo
description: Use libplacebo's CPU-only C API for colour-primaries, RGB-to-XYZ, gamut-matrix, PQ and BT.2390 tone-map maths. Load when HDR or wide-gamut numbers must be computed or cross-checked; GPU rendering is untested and Homebrew FFmpeg here has no libplacebo filter.
---

# libplacebo

Inside the VCR repository, vcr is pnpm vcr. From an installed plugin, vcr is node <plugin-root>/cli/vcr.mjs.

## Use cases and limits
- libplacebo is a C library of GPU video-processing and colour-management algorithms. VCR evidence covers only its CPU functions, called from a small C program: no GPU context, no picture.
- Tested (Homebrew 7.387.0, macOS arm64): BT.709 and BT.2020 primaries and RGB-to-XYZ matrices match published values within 3.5e-7; 14 conversions between BT.709 and BT.2020 (7 colours each way) match closed form within 3.6e-7; PQ encoding matches ST 2084 within 2.3e-6; reruns are byte-identical.
- BT.2390 tone map: checked structurally only. From 0.1 to 1000 nits into 0 to 100 nits the output is strictly increasing, stays in range and ends at 99.9995. It is not a numeric match to a spec table.
- libplacebo's default constants use knee offset 1.0; the BT.2390 spec default is 0.5. The tested curve is libplacebo's, not the spec's.
- Untested: GPU rendering (Vulkan, MoltenVK, `pl_renderer`), shaders, gamut mapping, ICC, dithering, film grain, Dolby Vision, other tone-map functions.
- The Homebrew FFmpeg here has no libplacebo filter; mpv and plplay were not used. For encoding use FFmpeg; for config-driven transforms use OpenColorIO; for Python colour maths use colour-science.
- Delivery context: HDR and colour tags are a delivery concern. See DELIVERY-HDR-AVOID, DELIVERY-HDR-METADATA, DELIVERY-COLOR-TAGS and DELIVERY-COLOR-MATRIX-MATH (`vcr rules info <ID>`). This guide proves arithmetic, not a delivered file.

## Capability map
Discoverability only; the upstream docs are the authority.
- [Colour spaces](https://libplacebo.org/colorspace/) (`libplacebo/colorspace.h`): primaries, transfer functions, `pl_get_rgb2xyz_matrix`, `pl_get_color_mapping_matrix`, `pl_hdr_rescale`. Tested.
- [Tone mapping](https://libplacebo.org/tone_mapping/) (`libplacebo/tone_mapping.h`): `pl_tone_map_sample` with `pl_tone_map_bt2390`. Tested for BT.2390 only, structurally.
- [Gamut mapping](https://libplacebo.org/gamut_mapping/): documented, untested.
- [Renderer and shaders](https://libplacebo.org/renderer/) (`pl_renderer`, `pl_gpu`, Vulkan, OpenGL, D3D11): documented, untested. Needs a GPU context.
- [ICC profiles](https://libplacebo.org/icc/): documented, untested.
- FFmpeg `libplacebo` filter and mpv/plplay consumers: not available or not used here.

## Install and doctor
    brew install libplacebo
    pkg-config --modversion libplacebo   # fixture needs 7.387.0

Run `vcr doctor` to record machine availability. This guide does not claim it is installed.

## Smoke test
    vcr example create libplacebo-colour-maths
    cd examples/libplacebo-colour-maths && ./run.sh
    # expect: libplacebo-colour-maths: OK

`run.sh` stops on any other libplacebo version, builds once, runs twice, requires identical output, then `check.mjs` compares with predeclared references in `expected/reference.json`. The SHA-256 in `expected/hashes.json` is specific to this build; use `./run.sh --record` after a deliberate change.

## Recipe: CPU colour maths
Build:

    clang -std=c11 -O2 -Wall -Wextra $(pkg-config --cflags libplacebo) render.c $(pkg-config --libs libplacebo) -o render

Calls proven in the fixture (no `pl_context`, no `pl_gpu`):

    const struct pl_raw_primaries *bt709 = pl_raw_primaries_get(PL_COLOR_PRIM_BT_709);
    pl_matrix3x3 m = pl_get_color_mapping_matrix(bt709, bt2020, PL_INTENT_RELATIVE_COLORIMETRIC);
    pl_matrix3x3_apply(&m, rgbLinear);                      /* linear light only */
    float pq = pl_hdr_rescale(PL_HDR_NITS, PL_HDR_PQ, 1000.0f);

Tone map: fill `struct pl_tone_map_params` with `.function = &pl_tone_map_bt2390`, `.constants = {PL_TONE_MAP_CONSTANTS}`, PQ input scaling, nits output scaling and the input and output ranges, then call `pl_tone_map_sample(pq, &params)`.

Anchors: BT.709 red in BT.2020 is about (0.627404, 0.069097, 0.016391); BT.2020 red in BT.709 about (1.660491, -0.124550, -0.018151), so out-of-gamut values go negative.

## Troubleshooting
- Version gate fails: `pkg-config` reports a version other than 7.387.0; re-plan rather than editing tolerances.
- Hash mismatch on another build or compiler: float last bits may differ; re-record deliberately.
- Checker reported errors near 1 or more on a first run: that was a checker bug (non-transposed inverse), caught by the published-matrix self-check. Fix the checker, not the expectations.
- Do not set constants by hand and call the result spec BT.2390; the default knee offset differs from the spec.

## Official docs
- [libplacebo](https://code.videolan.org/videolan/libplacebo) (primary) and [GitHub mirror](https://github.com/haasn/libplacebo)
- [API documentation](https://libplacebo.org/)
