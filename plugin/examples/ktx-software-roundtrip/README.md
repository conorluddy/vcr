# KTX-Software UASTC round-trip fixture

## Intent and scope

- Tool ID and version/build: `ktx-software`, `ktx` v4.4.2 (latest stable release, 2025-10-04; the inbox lead named 5.0.0, which is only a release candidate).
- VCR job and exact claim: `ktx create` builds a mipmapped UASTC KTX2 from a generated PNG; `ktx validate` passes; `ktx info` reports the expected header and colour model; `ktx extract` returns level 0 within a stated tolerance.
- Explicit exclusions: ETC1S/Basis LZ, zstd supercompression, normal maps, cubemaps, arrays, GPU transcode targets, GPU rendering, glTF Transform integration, other OSes, the 5.0 release line.
- Sources, checked 2026-11-27: [KTX-Software releases](https://github.com/KhronosGroup/KTX-Software/releases), [`ktx create` docs](https://github.khronos.org/KTX-Software/ktxtools/ktx_create.html). Licence: Apache-2.0 for repository-own files, other open licences for bundled material (see LICENSE.md).
- Environment: macOS 26.6 arm64, Python 3.x standard library only.
- Input: `make-input.py` writes a 256x256 RGBA PNG (RGB gradient, disc, two alpha levels). No external assets.
- Install plan (approved, no sudo): `run.sh` downloads `KTX-Software-4.4.2-Darwin-arm64.pkg`, verifies SHA-256 `500bd8f9d63358c3f3a0d83b724c8574436a72c37dc0e4bad90ec1ca38032c3c`, expands it with `pkgutil --expand-full` into ignored `output/pkg`, and copies `ktx` and `libktx*` into `output/root/{bin,lib}` so the binary's `@rpath` resolves with no DYLD variables. Nothing is installed; no PATH or `/usr/local` writes.

## Plan, before running

- Commands: `ktx create --format R8G8B8A8_SRGB --generate-mipmap --encode uastc --threads 1 in.png a.ktx2` (twice), `ktx validate --format json`, `ktx info --format json`, `ktx extract a.ktx2 ex.png`.
- Predeclared checks: two `--threads 1` encodes byte-identical; validate `valid: true` with no messages; 256x256, `levelCount` 9, colour model `KHR_DF_MODEL_UASTC`, sRGB transfer; extracted level 0 is 256x256 RGBA with PSNR >= 40 dB and max absolute channel error <= 16 against the input.
- Stop conditions: wrong version or pkg hash, validation failure, tolerance exceeded.
- Reproduce: `./run.sh --record`, then `./run.sh`. The first run downloads about 8 MB.

## Observation, after running

- 2026-11-27, onboarding worker, Conors-MacBook-Pro-2.local. `./run.sh --record` then `./run.sh` from an empty `output/` both exited 0.
- Result: validate valid; 256x256, 9 levels, UASTC, sRGB; level 0 is 65536 bytes; round trip PSNR 54.5 dB, max error 3; `--threads 1` output SHA-256 `643109a1...ece29`. The extracted picture was viewed and matches the input.
- Ad hoc, not in `run.sh`: a default-thread encode repeated three times was identical to itself but differed from the `--threads 1` bytes, so pin `--threads` when hashing. `--encode basis-lz` also validated (ETC1S, 11.5 KB against 87.8 KB for UASTC with mips).
- `ktx validate` prints nothing in plain text mode when output is captured; use `--format json`. `ktx create` warns that 8-bit PNG has no transfer function and defaults to sRGB.
- Not established: other platforms or versions, GPU behaviour, visual quality on real photographs, ETC1S tolerance. Evidence: `expected/metrics.json`.
