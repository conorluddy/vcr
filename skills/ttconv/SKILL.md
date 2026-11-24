---
name: ttconv
description: Convert caption files between timed-text formats (SRT, WebVTT, TTML) with the ttconv `tt` CLI. Use when caption cues already exist as a file and a delivery format is needed; not for authoring captions or burning them into video.
---

# ttconv

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Tested: ttconv 1.2.3 converts a hand-written SRT of 3 cues (one two-line, one italic) to WebVTT and to TTML. Cue count, millisecond timings, text and line breaks match predeclared values; the TTML is well-formed XML in the TTML namespace with an italic span; WebVTT converted back to SRT keeps the timings; a second conversion is byte-identical. Python 3.12.2, macOS arm64.
- ttconv converts caption files. It does not draw them: libass (ASS) or FFmpeg burn captions into frames, and sidecar files go to the player as they are.
- Not IMSC-validated: the writer emitted `xml:lang=""` and no `ttp:profile`, and no IMSC validator ran. There is no `--otype imsc`. Do not call the TTML an IMSC deliverable without a separate check.
- Caption wording, reading speed, line length and duration are pillar decisions (`vcr rules info TYPO-CAPTION-CPS`, `TYPO-CAPTION-DURATION`, `TYPO-CAPTION-LINES`); ttconv checks none of them. No `ACCESS-*` rule backs this fixture; for access needs use the accessibility skill.
- Not tested: STL, SCC and other formats, styling, regions, positioning, SRT `{\an}` tags, rendering, player behaviour, other platforms or versions.

## Capability map
Discovery only; documented does not mean validated. Entry points: [repository](https://github.com/sandflow/ttconv), [`tt` CLI usage](https://github.com/sandflow/ttconv#command-line-application), [PyPI](https://pypi.org/project/ttconv/).
- `tt convert`: input and output files, format by extension; SRT to WebVTT and TTML, WebVTT to SRT (tested). Other format pairs (untested).
- `--config` JSON for reader and writer options: `srt_reader.extended_tags` (tested). Other options (untested).
- `tt` further subcommands and the Python library API (untested).

## Install and doctor
```text
python3 -m venv output/venv && output/venv/bin/pip install ttconv==1.2.3
output/venv/bin/tt --help
```
Validated: 1.2.3 in a venv, no other dependencies. `vcr doctor` reports whether it is installed. The licence file is BSD with two clauses (Sandflow, 2020).

## Smoke test
```text
vcr example create ttconv-caption-convert   # then follow its README to create output/venv
(cd examples/ttconv-caption-convert && ./run.sh)
# expect: ttconv-caption-convert: OK
```
`run.sh` stops if `output/venv/bin/tt` is missing; it never installs. `./run.sh --record` re-records `expected/`.

## Recipe (the tested route)
```text
tt convert -i captions.srt -o captions.vtt  --config '{"srt_reader": {"extended_tags": true}}'
tt convert -i captions.srt -o captions.ttml --config '{"srt_reader": {"extended_tags": true}}'
tt convert -i captions.vtt -o roundtrip.srt
```
Output formats are chosen by file extension.

## Tested behaviour
- WebVTT: cues at 1.000-2.500, 3.120-5.040 and 5.500-7.250 s; cue 2 keeps two lines; cue 3 keeps `<i>italic</i>`.
- TTML: root `{http://www.w3.org/ns/ttml}tt`, three `p` with matching begin and end, one `br` in cue 2, and a `tts:fontStyle="italic"` span.
- Round trip: the SRT from WebVTT has the same cues, timings and breaks.
- Byte identity of a rerun is observed on this machine only.

## Troubleshooting
- Italic lost or tags left as text: the SRT reader needs `extended_tags` enabled; pass the `--config` above. Behaviour without it was not tested.
- TTML text compares unequal to the SRT text: TTML carries italics as spans, not `<i>` tags; strip the markup before comparing.
- `tt` prints a progress bar to stderr; capture it in a log if output must stay clean.

## Official docs
- https://github.com/sandflow/ttconv
- https://pypi.org/project/ttconv/1.2.3/
