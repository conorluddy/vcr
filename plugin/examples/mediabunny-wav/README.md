# Mediabunny WAV read fixture

## Intent and scope

- Tool ID and version/build: Mediabunny 1.62.1.
- VCR job and exact claim being tested: read metadata from an owned PCM WAVE file and extract decoded PCM samples through Mediabunny's `AudioSampleSink` in Node.
- Explicit exclusions: compressed codecs, video, encoding, conversion, browser support, and other operating systems.
- Tool documentation: https://mediabunny.dev/guide/reading-media-files and https://mediabunny.dev/guide/media-sinks (checked 2026-11-16); MPL-2.0.
- Environment: macOS 26.6 arm64, Node.js v25.6.1; no browser/GPU required.
- Input: generated 16-bit mono PCM WAV, 8 kHz, 800 frames; deterministic recipe in `make_input.py`; output is ignored under `output/`.
- Dependencies: fixture-local exact npm dependency `mediabunny@1.62.1`; installed by `npm install --prefix examples/mediabunny-wav --save-exact mediabunny@1.62.1`. This added Mediabunny and its two type-only dependencies in the example directory; no global or workspace-root package was changed.
- Generated output and cleanup: `output/input.wav`; expected evidence is lightweight JSON in `expected/`.

## Plan, before running

- Exact commands: `./examples/mediabunny-wav/run.sh --record`, then `./examples/mediabunny-wav/run.sh` twice.
- Fixture recipe: Python standard-library `wave` writes mono 16-bit PCM. The first samples are the fixed sequence `0, 8192, -8192, 16384, -16384, 32767, -32768, 0`; remaining frames repeat it.
- Mediabunny recipe: `Input` with `WAVE` and `BlobSource`, query readability, format, computed duration, audio/video track counts and track duration; use `AudioSampleSink.samples()` and `AudioSample.copyTo(..., { format: 'f32', planeIndex: 0 })` to inspect decoded content.
- Predeclared checks: WAVE recognized; exactly one audio and zero video tracks; duration 0.1 s; sample rate 8000 Hz; one channel; exactly 800 decoded frames; first eight float samples match signed-16/32768 within 1e-6; repeated calls produce identical metrics and hash.
- Expected artifacts: `expected/metrics.json`; generated WAV remains in ignored `output/`.
- Stop conditions: stop without claiming decode evidence if `AudioSampleSink` cannot decode PCM WAV under this Node runtime or any predeclared check fails.
- Inspection: compare numeric decoded samples against the deterministic PCM recipe; no perceptual/audio-quality claim.

## Observation, after running

- 2026-11-16, macOS 26.6 arm64, Node.js v25.6.1, Python 3.9.6, `Conors-MacBook-Pro-2.local`.
- `./examples/mediabunny-wav/run.sh --record` and two separate `./examples/mediabunny-wav/run.sh` executions passed. Mediabunny recognized WAVE, reported one audio and zero video tracks and 0.1 s duration, and `AudioSampleSink` extracted 800 mono frames at 8 kHz. First eight decoded float samples matched the declared PCM values within 1e-6. Both runs produced SHA-256 `2b59354ab3065e00f0c6b820a44cfbc7ae266c7039228ebffd96298e6ec77fe2` over decoded float data.
- Pass for reading metadata and decoded samples from this generated PCM WAVE with Mediabunny in Node on macOS arm64. No listening or audio-quality claim is made; compressed codecs, video, encoding/conversion, browsers and other platforms were not exercised.
- Install required network access after the sandboxed attempt received `ENOTFOUND`; the authorized escalation installed exact Mediabunny 1.62.1 plus `@types/dom-mediacapture-transform` 0.1.12 and `@types/dom-webcodecs` 0.1.13 in this example only.
