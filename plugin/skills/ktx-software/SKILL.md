---
name: ktx-software
description: Create, validate, inspect and extract KTX2 GPU textures (UASTC or ETC1S) with the Khronos `ktx` CLI. Load when a 3D asset needs a compressed texture, or a KTX2 file must be checked.
---

# KTX-Software (`ktx`)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Turn a PNG into a mipmapped KTX2 texture, then prove it is valid and round-trips. The fixture covers UASTC with sRGB RGBA at 256x256 only.
- It compresses textures, not geometry (use `meshoptimizer`) and does not edit glTF scenes (use `gltf-transform`, whose KTX2 commands call this binary).
- GPU decoding and photographic quality are untested.

## Capability map
The unified `ktx` command groups [create, encode, extract, info, validate, transcode, compare and more](https://github.khronos.org/KTX-Software/ktxtools/ktx.html). Older tools (`toktx`, `ktx2check`, `ktxinfo`) are deprecated aliases. Libraries (`libktx`, `pyktx`, WebAssembly builds) are documented at the [project docs](https://github.khronos.org/KTX-Software/). VCR exercised `create --encode uastc`, `validate`, `info` and `extract` only; ETC1S was run once ad hoc and validated.

## Install and doctor
No Homebrew formula. Pinned route without sudo, used by the fixture: download `KTX-Software-4.4.2-Darwin-arm64.pkg` from the v4.4.2 release, check SHA-256 `500bd8f9d63358c3f3a0d83b724c8574436a72c37dc0e4bad90ec1ca38032c3c`, run `pkgutil --expand-full`, and copy `usr/local/bin/ktx` and `usr/local/lib/libktx*` from the tools and library sub-packages into sibling `bin/` and `lib/` folders (the binary finds the dylib via `@rpath/../lib`). System install instead: `sudo installer -pkg <pkg> -target /`.
```text
ktx --version   # expect: ktx version: v4.4.2
vcr doctor
```

## Smoke test
```text
vcr example create ktx-software-roundtrip
cd examples/ktx-software-roundtrip && ./run.sh
# expect: ktx-software-roundtrip: OK
```
First run downloads about 8 MB. Recorded: 9 levels, UASTC, sRGB, round-trip PSNR 54.5 dB.

## Recipe
```text
ktx create --format R8G8B8A8_SRGB --generate-mipmap --encode uastc --threads 1 in.png out.ktx2
ktx validate --format json out.ktx2
ktx info --format json out.ktx2
ktx extract out.ktx2 level0.png      # transcodes UASTC to RGBA8 itself
```
- `--format` is required and names the pre-encode VkFormat. 8-bit PNG has no transfer function, so `ktx create` warns and assumes sRGB; use `--assign-tf` to override.
- Swap `--encode uastc` for `basis-lz` to get ETC1S (much smaller, lossier; not toleranced here).
- Pin `--threads` before hashing: a default-thread encode differed from the `--threads 1` bytes in the fixture (repeatable by itself).

## Troubleshooting
- `Library not loaded: @rpath/libktx.4.dylib`: the binary was copied away from its `lib/` sibling; keep `bin/` and `lib/` side by side.
- `ktx validate` prints nothing in plain mode when captured; use `--format json` and read `valid`.
- Do not trust the lead's "5.0.0": only release candidates exist; this guide is for 4.4.2.

## Official docs
- [KTX-Software repository and releases](https://github.com/KhronosGroup/KTX-Software)
- [ktx create](https://github.khronos.org/KTX-Software/ktxtools/ktx_create.html)
- [ktx validate](https://github.khronos.org/KTX-Software/ktxtools/ktx_validate.html)
