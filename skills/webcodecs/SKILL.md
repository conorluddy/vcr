---
name: webcodecs
description: Use WebCodecs for low-level browser video frame encoding and decoding when timestamps and codec control matter. This guide covers a VP8 encode/decode round trip only.
---

# WebCodecs

## Use cases and limits

Use WebCodecs for browser-side `VideoFrame` encoding/decoding when an application needs explicit timestamps and codec configuration. The VCR fixture validates three 32×32 solid-color frames through VP8 encode/decode in Chrome 156. It does not validate containers, muxing, audio, other codecs, other engines, playback, or byte-identical encoded output. Use Mediabunny for container I/O and FFmpeg for finished video with audio and filters.

## Capability map

| Area | Reference | VCR evidence |
| --- | --- | --- |
| Video encoding | [VideoEncoder](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder) | Exercised: VP8 support probe, timestamped keyframe encoding and chunk durations. |
| Video decoding | [VideoDecoder](https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder) | Exercised: decode the three VP8 chunks and check frame dimensions, timestamps and RGB values. |
| Frames and chunks | [Using WebCodecs](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API/Using_the_WebCodecs_API) | VideoFrame and EncodedVideoChunk exercised; audio interfaces, workers and other frame sources untested. |
| Codec support | [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) | Only VP8 at 32×32 is checked. Query `isConfigSupported()` for the target codec/config in the actual browser. |

## Install and doctor

WebCodecs is a native browser API; there is no package install and `vcr doctor` does not probe it. The fixture uses Playwright's Chrome for Testing 156.0.8078.4 on macOS arm64. WebCodecs requires a secure context; the fixture serves its page from loopback.

## Smoke test

```sh
./run.sh
# expect: pass; VP8 supported; 3 decoded 32×32 frames at 0/33,333/66,666 μs; RGB means [255,0,0], [0,255,0], [0,0,255]; repeated functional metrics match
```

The fixture checks decoded colors with tolerance 20 and retains metrics, not encoded-byte identity. It writes preview PNGs under ignored `output/`.

## Troubleshooting

- `Required WebCodecs APIs unavailable`: open the page in a supported secure context; `about:blank` did not expose the required globals in the fixture environment.
- Unsupported codec/config: call `VideoEncoder.isConfigSupported()` and `VideoDecoder.isConfigSupported()` for the target browser; support varies by browser and platform.
- Close each `VideoFrame` after use to release its underlying resources.

## Official docs

- [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [Using the WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API/Using_the_WebCodecs_API)
- [W3C WebCodecs specification](https://www.w3.org/TR/webcodecs/)
