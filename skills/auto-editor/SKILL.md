---
name: auto-editor
description: Cut silent spans from recorded audio or video with auto-editor and export the cut points as a v1, v3 or Premiere XML timeline for assembly with FFmpeg. Load once auto-editor has been chosen for a rough cut of narration or a screen-capture take.
---

# auto-editor

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Find and remove dead air in a recorded take; export where the cuts fall so FFmpeg does the final encode.
- It does not find shot cuts (`pyscenedetect`) or edit timelines you write (`opentimelineio`, `mlt-melt`).
- VCR evidence covers auto-editor 29.3.1 from PyPI, macOS arm64, on synthetic tones only. Speech, room noise, the 31.x series and `--edit motion` are untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `--edit audio:threshold=`, `--margin` | [repository README](https://github.com/WyattBlue/auto-editor) | tested on tones |
| `-ex v1`, `v3`, `premiere`; render with `-o x.mp4` | `auto-editor --help` | tested |
| `--edit motion`, Resolve, Final Cut, Shotcut, Kdenlive, clip sequence exports | same | untested |
| `--cut-out`, `--set-speed`, `--when-silent` actions, `info`, `levels` | same | untested |

## Install and doctor
```sh
python3 -m venv output/venv && output/venv/bin/pip install auto-editor==29.3.1
output/venv/bin/auto-editor --version
```
The PyPI package is a launcher: the first run downloads the native binary from the GitHub release into the venv, so it needs network once. PyPI stops at 29.3.1; Homebrew had 31.x (untested). Pin the version, since majors change the CLI. `vcr doctor` does not probe a project venv.

## Smoke test
```sh
cd examples/auto-editor-silence-timeline && ./run.sh
# expect: auto-editor-silence-timeline: OK
```
The input is generated: 2 s tone, 3 s silence, 2 s tone at 30 fps, so silence is frames 60 to 150.

## Recipes
Export the cut points, then assemble with FFmpeg yourself:
```sh
auto-editor in.mp4 --edit audio:threshold=0.04 --margin 0sec -ex v1 -o cuts.json
```
`v1` gives `{"chunks": [[0,60,1.0],[60,150,99999.0],[150,210,1.0]]}`: start frame, end frame, speed; 99999.0 means cut. `-ex v3` (name the output `cuts.v3`) lists kept clips as start (timeline), dur and offset (source) in frames; `-ex premiere` writes XML. Omit `-ex` and use `-o cut.mp4` to render; it re-encodes (4.0 s from the 7 s input).

## Troubleshooting
- `Unknown export format: json` or `cmx-3600`: use `v1`, `v3`, `premiere`; the `-o` extension does not choose the format.
- The Premiere XML embeds the absolute source path; do not diff it whole.
- Margin defaults to 0.2 s, which keeps padding around sound; the fixture sets `--margin 0sec` for exact cuts.

## Official docs
- [auto-editor repository](https://github.com/WyattBlue/auto-editor)
- [auto-editor on PyPI](https://pypi.org/project/auto-editor/)
