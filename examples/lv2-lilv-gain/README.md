# LV2 bundle hosted with Lilv

## Intent and scope

- **Tool/version:** LV2 1.18.10 headers and Lilv 0.28.0 host utilities on macOS 26.6 arm64.
- **Claim:** compile an owned minimal mono gain LV2 plugin, discover its bundle with Lilv, inspect its metadata, then process a generated 48 kHz mono WAV with `lv2apply` at gain 0.5. Two host runs must have matching WAV bytes and measured samples within one PCM16 step of the expected half-gain output.
- **Exclusions:** DAWs, real-time playback, stereo ports, UI extensions, other hosts, user plugins, realtime guarantees, and all LV2 extensions beyond the ports used here.
- **Documentation and license:** the official [LV2 programming guide](https://lv2plug.in/book/), [bundle definition](https://lv2plug.in/pages/bundle-definition.html), and [LV2 source license](https://github.com/lv2/lv2/blob/master/COPYING), checked 2026-11-16. The plugin source and Turtle metadata in this fixture are original and MIT licensed; LV2 host and plugin licensing remain separate facts.
- **Dependencies:** Homebrew LV2 headers 1.18.10, Lilv 0.28.0 (`lv2ls`, `lv2info`, `lv2apply`), Clang, FFmpeg for decoded sample measurement, and Python 3 standard library for WAV creation and assertions. The compiled `.dylib`, bundle copy and WAVs stay under ignored `output/`.

## Plan, before running

- **Command:** `./run.sh --record`, then `./run.sh`. The runner compiles the C plugin, sets `LV2_PATH` to the fixture-local bundle, confirms URI discovery and metadata, applies gain 0.5, and decodes outputs to float samples for comparison.
- **Expected checks:** all 256 frames are mono 48 kHz; samples match the generated source ×0.5 within 1/32768; independent WAV files have identical SHA-256.
- **Stop conditions:** missing host tools, compiler or header failure, bundle discovery or metadata failure, plugin-host error, wrong samples or nonrepeatable output.

## Observation, after running

- Result: pass. Lilv discovered the owned plugin URI and reported its metadata. `lv2apply` processed 256 mono samples at 48 kHz with gain 0.5; decoded samples matched half the source within 1/32768, and two independent WAV outputs had identical SHA-256 `ca26870d0c1ba96871d20ec19045ee0087e913b4419d05d4b9da1a577214ec1a`.
- Runtime: LV2 headers 1.18.10 and Lilv 0.28.0 on macOS 26.6 arm64. The C plugin binary and all audio outputs are generated under ignored `output/`.
- Limits: validates one custom mono control/audio plugin under Lilv. It does not establish compatibility with other LV2 hosts or effects.
