---
name: lv2
description: Use LV2 when authoring or inspecting audio-plugin bundles and when a compatible host is selected. The VCR evidence covers one locally authored mono gain plugin hosted by Lilv, not DAWs, realtime playback, or third-party plugins.
---

# LV2

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- LV2 is a plugin interface and bundle format, not a standalone effect or renderer. A compatible host and separately licensed plugin are required.
- In VCR, use the documented Lilv command-line host for offline plugin inspection and processing; use FFmpeg for media encoding and assembly.
- Evidence is one locally authored mono control/audio plugin and a 256-sample gain pass under Lilv 0.28.0 on macOS arm64. It does not establish support for other hosts, third-party plugins, extensions, realtime playback, or other channel layouts.

## Capability map
- **Plugin structure and ports:** C-compatible plugin entry points and Turtle metadata/bundles are introduced in the [LV2 programming guide](https://lv2plug.in/book/) and [bundle definition](https://lv2plug.in/pages/bundle-definition.html). The fixture exercises one audio input/output and one gain control.
- **Discovery and offline hosting:** Lilv provides discovery, metadata inspection, and `lv2apply`; see the [Lilv project](https://gitlab.com/lv2/lilv). The fixture exercises `lv2ls`, `lv2info`, and `lv2apply` only.
- **Extensions, UI, MIDI, and other hosts:** documented by LV2, but untested in VCR.

## Install and doctor
Install a host/toolchain for your platform; on the validated macOS setup:

```sh
brew install lv2 lilv
pkg-config --modversion lv2
pkg-config --modversion lilv-0
command -v clang lv2ls lv2info lv2apply ffmpeg
```

`vcr doctor` reports registered machine probes; the LV2 card has no executable probe because LV2 is a standard. The commands above check the fixture's actual prerequisites. The fixture compiles its owned plugin under ignored `output/`.

## Smoke test
```sh
cd examples/lv2-lilv-gain && ./run.sh
# expect: JSON reports "operation": "mono gain 0.5 via lv2apply" and "repeat_bytes_match": true
```
The exact versions and host platform are printed and compared with `expected/result.json`.

## Troubleshooting
- `lv2ls` cannot find the fixture bundle: run the example script from its directory; it sets `LV2_PATH` to the fixture's generated bundle.
- Compilation or `lv2apply` fails: check the LV2/Lilv pkg-config versions and that `clang`, `lv2apply`, and FFmpeg are on `PATH`.
- A different host or plugin does not load: this fixture proves only the Lilv pairing and one minimal plugin; check that host's LV2 version and extension support separately.

## Official docs
- [LV2 programming guide](https://lv2plug.in/book/)
- [LV2 bundle definition](https://lv2plug.in/pages/bundle-definition.html)
- [LV2 source and specification](https://gitlab.com/lv2/lv2)
- [Lilv source](https://gitlab.com/lv2/lilv)
