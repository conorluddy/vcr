# MLT color-render fixture

## Intent and scope

- **Tool/version:** MLT 7.42.0 (Homebrew formula 7.42.0_1), using its built-in `colour` producer and `avformat` consumer with FFV1.
- **Claim:** render a five-frame, 64×48 red clip at 25 fps and verify its metadata and decoded center pixel; compare decoded RGB bytes across repeated renders.
- **Exclusions:** XML project files, multiple tracks, transitions, filters, audio, alpha, other consumers, other operating systems and full timeline behavior.
- **Documentation:** [MLT melt command-line documentation](https://mltframework.org/docs/melt/) and [avformat consumer metadata](https://github.com/mltframework/mlt/blob/master/src/modules/avformat/consumer_avformat.yml). Checked 2026-11-16.
- **Environment:** macOS 26.6 arm64 (Darwin 25.6.0), MLT 7.42.0_1 and FFmpeg/ffprobe 9.0.2, host `Conors-MacBook-Pro-2.local`.
- **Input:** MLT's built-in `colour:red` producer; no external media.
- **Side effects:** writes two short MKV files and logs under ignored `output/`.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. Each run creates two separate renders, probes both with ffprobe, decodes them to raw RGB, and reads the center pixel.
- **Checks:** exact MLT version; FFV1 codec; 64×48 dimensions; five frames at 25 fps; 0.2 s duration; red center pixel; equal decoded bytes and expected SHA-256 across repeated renders.
- **Stop conditions:** unexpected MLT version, producer/consumer error, missing stream metadata, wrong frame count or color, or repeated decoded pixels differing from `expected/render.json`.
- **Inspection:** view `output/red.mkv` in a media player or extract its first frame with FFmpeg. Pixel checks measure this built-in color producer only.

## Observation, after running

- **Result:** pass. `./run.sh --record` and a separate clean-output `./run.sh` passed.
- **Measurements:** FFV1, 64×48, five frames, 25 fps, 0.2 s. Center RGB was `[254,0,0]`; decoded RGB SHA-256 was `4b914e23d014c3fcfba6fd46b59ed324bbac561a7ef7e8910f80bb7e07c212b0` for both renders.
- **Runtime:** MLT 7.42.0_1, FFmpeg/ffprobe 9.0.2, macOS 26.6 arm64 (Darwin 25.6.0).
- **Limits:** only the built-in color producer and avformat FFV1 output path are validated. This does not demonstrate timeline XML, filters, transitions, audio, alpha behavior or arbitrary media support.
