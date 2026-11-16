---
name: opentimelineio
description: Read and write editorial timeline interchange data with OpenTimelineIO. Load when a VCR task needs native OTIO structure or adapter-based interchange; it does not render media.
---

# OpenTimelineIO

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits

- Use OTIO to represent clips, tracks, timing, markers and external media references in an interchange timeline.
- VCR evidence covers a one-track, one-clip native JSON write/reopen round-trip with repeatable serialization on macOS arm64, Python 3.12.13 and OpenTimelineIO 0.18.1.
- The fixture does not test editorial adapters, media resolution, playback, timeline evaluation or rendering. A media reference is only a URL; it does not package or verify the media.
- Use `ffmpeg-ffprobe` for rendering, encoding and probing. VCR does not yet resolve or render OTIO timelines.

## Capability map

- [Quickstart](https://opentimelineio.readthedocs.io/en/v0.18.1/tutorials/quickstart.html): construct a timeline and use Python APIs. The fixture exercises `Timeline`, `Track`, `Clip`, `ExternalReference`, `RationalTime`, and native adapter serialization.
- [Schema API](https://opentimelineio.readthedocs.io/en/v0.18.1/api/python/opentimelineio.schema.html): documented schema types; only the types above are fixture-tested.
- [Adapter tutorial](https://opentimelineio.readthedocs.io/en/v0.18.1/tutorials/adapters.html): adapter discovery and use are documented but AAF, EDL, XML, and third-party adapters are untested here.

## Install and doctor

Use Python 3.12 and pin the evidence version when reproducing:

```sh
uv venv .venv --python 3.12
uv pip install --python .venv/bin/python opentimelineio==0.18.1
python -c "import opentimelineio; print(opentimelineio.__version__)"
vcr doctor
```

The repository fixture installs into its ignored `output/venv`; no global install is required. Optional adapters and their dependencies need separate installation and licence review.

## Smoke test

```sh
vcr example create opentimelineio-native-json
cd examples/opentimelineio-native-json && ./run.sh
# expect: opentimelineio-native-json: OK
```

The runner writes two native `.otio` files, reopens one, checks one video track, one 48-frame clip at 24 fps and the `media/sample.mov` reference, then compares serialized bytes. Expected SHA-256: `a567ca427ce4edf2d249f78aacf90b508fb02d8d19fc04a3e0e32caebcd7df07`.

## Troubleshooting

- Serialization hash or structure differs: confirm Python 3.12 and OTIO 0.18.1, then inspect `output/timeline.otio` and `output/metrics.json`.
- Adapter import or format fails: the fixture covers only OTIO's native JSON adapter; install and validate any optional adapter separately.

## Official docs

- [OpenTimelineIO 0.18.1 quickstart](https://opentimelineio.readthedocs.io/en/v0.18.1/tutorials/quickstart.html)
- [OpenTimelineIO 0.18.1 schema API](https://opentimelineio.readthedocs.io/en/v0.18.1/api/python/opentimelineio.schema.html)
- [OpenTimelineIO 0.18.1 adapter tutorial](https://opentimelineio.readthedocs.io/en/v0.18.1/tutorials/adapters.html)
