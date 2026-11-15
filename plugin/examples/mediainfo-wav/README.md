# MediaInfo WAV metadata

## Intent and scope

- Tool: MediaInfo CLI 26.10.
- Claim: MediaInfo reports the container and PCM audio facts of one generated WAV file in JSON.
- Exclusions: compressed formats, metadata tags, malformed inputs, GUI behavior, and agreement with other inspectors.
- Documentation: https://mediaarea.net/en/MediaInfo/Support/Fields and https://mediaarea.net/MediaInfo/Support/FAQ; checked 2026-11-15. Homebrew formula `media-info`; dependencies `libmms`, `libzen`, and `libmediainfo`.
- Environment: macOS 26.6 arm64; MediaInfo CLI 26.10.
- Input: generated locally by `make_input.py`; 1 second of mono 8 kHz 16-bit PCM silence in a RIFF/WAVE container.
- Installation: Homebrew formula `mediainfo`; installed to `/opt/homebrew` with three dependencies. No repository files written by installation.
- Output: ignored `output/`; only extracted JSON summary is retained under `expected/`.

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`; inspect the extracted facts and exact CLI version.
- Assert one General track reports Wave and one Audio track reports PCM, 8000 Hz, one channel, 16-bit and 1.000 second duration. Assert generated file size is 16044 bytes.
- Stop if the CLI cannot report JSON, the sample facts differ, or output schema is ambiguous. This fixture does not compare against another tool.
- Reproduce with `./run.sh`; generated WAV and raw MediaInfo JSON remain in ignored `output/`.

## Observation, after running

- 2026-11-15, MediaInfo CLI 26.10, macOS 26.6 arm64, `Conors-MacBook-Pro-2.local`.
- `./run.sh --record` and a second `./run.sh` both passed. JSON reported Wave container, PCM audio, 8000 Hz, one channel, 16-bit, and 1.000 second duration; generated file size was 16044 bytes. Python's WAV reader independently confirmed 8000 frames at 8000 Hz, mono, 16-bit.
- Pass for the declared generated-WAV metadata claim. No audio quality assessment was needed because the generated signal is silence. This does not establish other formats, compressed media, metadata tags, or agreement with another inspector.
- No unexpected side effects beyond installing Homebrew formula `media-info` 26.10 and dependencies `libmms` 0.6.4, `libzen` 0.4.41_1, and `libmediainfo` 26.10.
