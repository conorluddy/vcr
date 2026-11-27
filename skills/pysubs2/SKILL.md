---
name: pysubs2
description: Write ASS styles and override-tag events from Python, retime, and convert subtitle files (SRT, ASS, WebVTT and others) with pysubs2 in a venv. Load once pysubs2 has been chosen to author or edit subtitle files; it does not render them.
---

# pysubs2

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Build an ASS file from code (styles, positions, fades, karaoke `\k`), as input for `libass` or FFmpeg's `subtitles` filter; retime with `shift`; convert between formats.
- It edits text files only. Rendering is `libass`; delivery formats (IMSC, SCC) are `ttconv`; limit checks are `caption-checker`.
- VCR evidence covers pysubs2 1.9.1, Python 3.12, macOS arm64: the three recipes below. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `SSAFile`, `SSAStyle`, `SSAEvent`, `load`, `save`, `shift` | [api reference](https://pysubs2.readthedocs.io/en/latest/api-reference.html) | tested |
| CLI (`--to`, `-o DIR`) | [CLI](https://pysubs2.readthedocs.io/en/latest/cli.html) | SRT to WebVTT tested |
| Formats: srt, ass, ssa, vtt, microdvd, mpl2, tmp, json, sami, ttml | [formats](https://pysubs2.readthedocs.io/en/latest/formats.html) | srt, ass, vtt tested; others untested |
| `--transform-framerate`, `--clean`, encodings | [CLI](https://pysubs2.readthedocs.io/en/latest/cli.html) | untested |

## Install and doctor
```sh
python3 -m venv output/venv && output/venv/bin/pip install pysubs2==1.9.1
```
Needs Python 3.12 or later. A project-local venv: `vcr doctor` does not probe it. Never install it globally.

## Smoke test
```sh
cd examples/pysubs2-ass-authoring && ./run.sh
# expect: pysubs2-ass-authoring: OK
```
Runs `check.py` twice in separate processes, requires identical JSON, and diffs it against `expected/metrics.json`.

## Recipes
Author ASS from code:
```py
import pysubs2
subs = pysubs2.SSAFile()
subs.info["PlayResX"], subs.info["PlayResY"] = "1920", "1080"
subs.styles["Kinetic"] = pysubs2.SSAStyle(fontname="Inter", fontsize=72, bold=True,
    primarycolor=pysubs2.Color(255, 220, 0), alignment=pysubs2.Alignment.BOTTOM_CENTER)
subs.append(pysubs2.SSAEvent(start=1000, end=3500, style="Kinetic",
    text=r"{\an8\fad(200,200)}Line one\NLine two"))
subs.save("out.ass")
```
Convert and retime: `s = pysubs2.load("in.srt"); s.shift(s=2.5); s.save("out.ass")`. SRT `<i>` becomes `{\i1}…{\i0}` and a line break becomes `\N`.

CLI: `pysubs2 --to vtt -o outdir in.srt` writes `outdir/in.vtt`.

## Troubleshooting
- `-o` takes a directory. Giving it a file name creates a directory of that name. Without `-o` the CLI rewrites the input file in place.
- ASS writes times as centiseconds (`0:00:05.62`); the fixture used 10 ms-aligned times, so rounding of other millisecond values is untested.
- The FFmpeg on the fixture machine had no `subtitles` filter (built without libass), so burn-in was not tested here.

## Official docs
- [pysubs2 documentation](https://pysubs2.readthedocs.io)
- [pysubs2 repository](https://github.com/tkarabela/pysubs2)
- [pysubs2 on PyPI](https://pypi.org/project/pysubs2/)
