---
name: dovi-tool
description: Generate, inject, extract and read back Dolby Vision RPU and HDR10+ dynamic metadata in HEVC elementary streams with dovi_tool and hdr10plus_tool. Load when HDR delivery needs metadata plumbing that FFmpeg and MediaInfo cannot do; evidence is partial and covers synthetic metadata only.
---

# dovi_tool and hdr10plus_tool

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use these CLIs to put dynamic metadata into, or read it out of, an existing HEVC stream. They do not encode: make the stream with `ffmpeg` first. Whether to deliver HDR at all, and how to tag it, belongs to the delivery pillar (`vcr rules info DELIVERY-HDR-AVOID`, `DELIVERY-HDR-METADATA`, `DELIVERY-COLOR-TAGS`, `DELIVERY-WIDE-GAMUT`); this guide does not restate them.
- The fixture validates one case, partially: a 48-frame 640x360 10-bit HEVC stream (FFmpeg 9.0.2, libx265 4.3, `testsrc2`, PQ and BT.2020 tagged) with dovi_tool 2.3.4 and hdr10plus_tool 1.7.2 on macOS arm64.
- **This proves metadata plumbing only.** The metadata is synthetic and the picture is an unmodified test pattern. Nothing here shows playback, display mapping, grading, colour accuracy or any device behaviour. Do not present output as a verified Dolby Vision or HDR10+ master.
- Untested: `editor`, `convert`, `demux`, `mux`, `remove`, profile 5 and 8.4, HDR10+ profile B, Dolby Vision and HDR10+ in one stream, real (measured) metadata, Linux and Windows.
- Dolby Vision and HDR10+ are trademarks of their owners; check licensing and certification terms before shipping.

## Capability map
Discovery only; each tool's README and `--help` are authoritative. Listing a command is not VCR validation.
- **dovi_tool `generate` (tested, partly wrong read-back):** build an RPU from a JSON config (`-j`, `-p 8.1`). See the L1 warning below.
- **dovi_tool `inject-rpu` (tested):** interleave an RPU file into an HEVC stream.
- **dovi_tool `extract-rpu` (tested):** pull the RPU out of a stream; result was byte-identical to the generated file.
- **dovi_tool `info` (partly tested):** `-s` summary and `-f N` per-frame dump. Frame count and `max_pq` read back; the sub-profile does not.
- **dovi_tool `editor`, `convert`, `demux`, `mux`, `remove`, `export`, `plot` (untested):** see the [dovi_tool README](https://github.com/quietvoid/dovi_tool).
- **hdr10plus_tool `inject` and `extract` (tested, profile A):** JSON in, JSON out, 48 frames matched.
- **hdr10plus_tool other commands (untested):** see the [hdr10plus_tool README](https://github.com/quietvoid/hdr10plus_tool).

## Install and doctor
```sh
brew install dovi_tool hdr10plus_tool
dovi_tool --version
```
`vcr doctor` runs the record's check command. The fixture also needs `ffmpeg` (with libx265), `ffprobe`, `jq` and `shasum`. Installation is not implied by this guide.

## Smoke test
```sh
vcr example create dovi-tool-metadata-roundtrip
cd examples/dovi-tool-metadata-roundtrip && ./run.sh --record && ./run.sh
# expect: dovi-tool-metadata-roundtrip: FAIL (2 checks failed)
```
`--record` writes the generated-stream hashes first. The expected output is the recorded one: 9 of 11 predeclared checks pass and 2 fail (below). `OK` would mean a later tool version fixed them; re-read the example before updating this guide. Generated streams were byte-identical between runs here; recorded, not gated.

## Recipe
```sh
ffmpeg -y -f lavfi -i testsrc2=size=640x360:rate=24 -frames:v 48 -pix_fmt yuv420p10le \
  -c:v libx265 -crf 20 -x265-params "colorprim=bt2020:transfer=smpte2084:colormatrix=bt2020nc:range=limited:repeat-headers=1:log-level=error" \
  -f hevc base.hevc
dovi_tool generate -j dv-config.json -p 8.1 -o rpu.bin
dovi_tool inject-rpu -i base.hevc -r rpu.bin -o dv.hevc
dovi_tool extract-rpu -i dv.hevc -o rpu-extracted.bin
dovi_tool info -s -i rpu-extracted.bin
dovi_tool info -i rpu-extracted.bin -f 20          # per-frame L1
hdr10plus_tool inject -i base.hevc -j hdr10plus.json -o hdr10plus.hevc
hdr10plus_tool extract -i hdr10plus.hevc -o hdr10plus-extracted.json
```
Config shapes that worked: dovi_tool `{ "cm_version": "V29", "length": 48, "shots": [{ "start": 0, "duration": 16, "metadata_blocks": [{ "Level1": { "min_pq", "max_pq", "avg_pq" } }] }] }`. hdr10plus_tool wants `JSONInfo`, `SceneInfoSummary`, `SceneInfo` and `ToolInfo`, with per-frame `LuminanceParameters.AverageRGB`, `MaxScl` and `LuminanceDistributions.DistributionValues`. Start from `inputs/` in the example.

## What passed
- Injection left decoded pixels identical (SHA-256 of raw `yuv420p10le`) and ffprobe stream facts unchanged for both the DV and HDR10+ copies.
- 48 RPUs extracted, byte-identical (SHA-256) to the generated `rpu.bin`.
- HDR10+ profile A: AverageRGB, MaxScl and DistributionValues matched for all 48 frames.

## Read-back warnings (failed checks)
- **Read L1 back after `generate`; do not trust config values.** Per-frame L1 did not read back as written: `avg_pq` 300 and 650 both read 819, and `min_pq` 20 read 12. `max_pq` (3079, 2600, 3400) and `avg_pq` 1100 matched. A scratch diagnostic saw `avg_pq` 100, 300 and 650 all give 819, and 1100 and 2000 unchanged. The mechanism is unknown (quantisation, clamping or a documented rule; not established). Always run `info -f N` on the output and compare with what you intended.
- **`info -s` does not show the sub-profile.** It printed `Profile: 8` although generation printed `Profile 8.1 (HDR10)`. The `.1` cannot be confirmed from `info`; read the generate log instead, and treat the sub-profile as unverified.

## Troubleshooting
- `missing field duration` from `generate`: shots take `start` plus `duration`, not `end`.
- `hdr10plus_tool inject` rejects the JSON: use the tool's key names above, and for profile B a nonzero `TargetedSystemDisplayMaximumLuminance` was rejected as profile A. The fixture therefore uses profile A with targeted luminance 0; profile B is untested.
- The card recorded dovi_tool 2.3.3 at assessment; the fixture ran 2.3.4. Re-run after upgrading.

## Official docs
- [dovi_tool](https://github.com/quietvoid/dovi_tool) and [releases](https://github.com/quietvoid/dovi_tool/releases); [hdr10plus_tool](https://github.com/quietvoid/hdr10plus_tool). Fixture run 2026-11-24 with dovi_tool 2.3.4 and hdr10plus_tool 1.7.2; upstream pages were not re-fetched for it.
