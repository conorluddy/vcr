# Mediabunny server extension AAC transcode

## Intent and scope

- Tool ID and versions: @mediabunny/server 1.66.0 with mediabunny 1.66.0; NodeAV native backend exact version recorded from the fixture lock.
- VCR job and exact claim being tested: register the server extension in Node, decode generated compressed AAC through its NodeAV decoder, force an AAC transcode through its encoder, then decode the output and measure the tone.
- Explicit exclusions: video, other codecs, hardware acceleration, cross-platform behavior, production quality, and direct comparison with FFmpeg's decoding results.
- Documentation: https://mediabunny.dev/guide/extensions/server, https://mediabunny.dev/guide/converting-media-files, https://mediabunny.dev/guide/media-sinks and https://mediabunny.dev/guide/reading-media-files (checked 2026-11-16); packages are MPL-2.0.
- Environment: macOS 26.6 arm64, Node.js v25.6.1, FFmpeg 9.0.2 source-fixture generator. The actual NodeAV native package version and codec details will be retained in metrics.
- Input: locally generated 440 Hz mono tone, encoded by FFmpeg to AAC/M4A at 48 kHz, 96 kb/s. No external asset.
- Dependency/install plan: exact local dependencies mediabunny@1.66.0 and @mediabunny/server@1.66.0 via npm in this example only; installation will include NodeAV's platform-native package. User authorized installs. No root package changes.
- Generated WAV, M4A input/output, logs and temporary metrics stay under ignored output/.

## Plan, before running

- Exact commands: ./examples/mediabunny-server-aac/run.sh --record once, then ./examples/mediabunny-server-aac/run.sh twice.
- Register route: call registerMediabunnyServer() from @mediabunny/server before constructing Mediabunny inputs or conversions.
- Source generation: ffmpeg -f lavfi -i sine=frequency=440:sample_rate=48000:duration=1 -af volume=0.25 -ac 1 -c:a aac -b:a 96k -movflags +faststart output/source.m4a.
- Extension path: Mediabunny Input with FilePathSource, decode using AudioSampleSink, then Conversion with Mp4OutputFormat and audio { codec: aac, forceTranscode: true, sampleRate: 48000, numberOfChannels: 1 } to output/transcoded.m4a; read and decode the transcoded output with the same registered extension.
- Predeclared checks: before registration AAC cannot decode; after registerMediabunnyServer() it can. Source and output codec AAC; one mono 48 kHz track; source/output duration in 0.97–1.05 s; decoded frame counts in 46,000–50,500; RMS 0.10–0.24; zero-crossing frequency 420–460 Hz; converted output is nonempty; converter reports one utilized audio track and no discarded audio track. Compare stable semantic metrics across independent fixture runs, not compressed file hashes.
- Expected artifacts: expected/metrics.json records package/runtime/native backend, codecs, duration, sample counts, RMS, frequency estimate and deterministic source-WAV hash. Media stays in ignored output/.
- Stop conditions: stop if native installation fails, registration does not enable AAC, NodeAV decode or forced AAC encode fails, or decoded sample checks miss the expected tone. Do not credit the base package or external FFmpeg with extension functionality.
- Reproduction and inspection: run from the repository root; inspect retained numeric tone measurements and generated waveform metadata. No listening-quality claim.

## Observation, after running

- 2026-11-16, Conors-MacBook-Pro-2.local, macOS 26.6 arm64 / Darwin 25.6.0; Node.js v25.6.1; @mediabunny/server 1.66.0; mediabunny 1.66.0; NodeAV 6.2.0 with FFmpeg 8.1. Source fixture generator was FFmpeg 9.0.2.
- ./examples/mediabunny-server-aac/run.sh --record and two separate ./examples/mediabunny-server-aac/run.sh executions passed. For the same parsed AAC track, canDecode() was false before registerMediabunnyServer() and true immediately after registration. Conversion then used one input track with no discarded tracks and forceTranscode enabled for AAC/M4A output.
- Source readback: 1.000000 s metadata duration; 48 kHz mono, 49,152 decoded frames (1.024000 s), RMS 0.174804, peak 0.308553, zero-crossing estimate 446.289063 Hz. Output readback: 1.002667 s metadata duration; 48 kHz mono, 49,152 decoded frames (1.024000 s), RMS 0.175801, peak 0.461866, zero-crossing estimate 454.589844 Hz. Output file size 13,435 bytes. Semantic metrics and source WAV hash were identical in all three runs.
- Pass for NodeAV-backed AAC decode and forced AAC re-encode/decode on this macOS arm64 runtime. Decoded frame duration (1.024 s) is longer than the input's 1.0 s track metadata duration; the fixture records both and does not claim exact trimming semantics. No video, other codecs, hardware acceleration, other platforms, or production-quality claim is established.
- Both packages and NodeAV's platform-native dependency were installed only under the example directory; the repository root package files were unchanged. Generated source WAV, compressed files and logs are ignored output.
