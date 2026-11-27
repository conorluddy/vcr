# pysubs2 ASS authoring, SRT conversion and retime

## Intent and scope

- Tool/version: pysubs2 1.9.1 (PyPI), MIT, no dependencies. Pinned in `requirements.txt`.
- Claim: from Python, pysubs2 writes an ASS file with a custom style and events carrying override tags (`\an8`, `\fad`, `\k`), and the file reloads with styles, tags and millisecond timings intact; it converts an SRT to ASS with a `shift`, and its CLI converts SRT to WebVTT without touching the input.
- Exclusions: rendering the ASS (libass, FFmpeg `subtitles` filter; the local FFmpeg has no such filter), fonts, frame-rate transforms, other formats, encodings, and large files.
- Docs and licence: https://pysubs2.readthedocs.io, https://github.com/tkarabela/pysubs2; MIT from the installed 1.9.1 metadata, checked 2026-11-27.
- Environment: macOS 26.6 arm64, Python 3.12.2 (pyenv), venv in `output/venv` (git-ignored). No network at run time.
- Input: `input.srt` (hand-written, 3 cues, one two-line, one italic) and literals in `check.py`.
- Install (venv local to the example): `python3 -m venv output/venv && output/venv/bin/pip install -r requirements.txt`. Cleanup: remove `output/`.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`. `check.py` runs twice in separate processes and the JSON must be identical.
- Checks (all gating): version 1.9.1; authored ASS contains the `Kinetic` style line, 2 Dialogue lines and PlayRes 1920x1080; reload keeps override-tag text, timings (1000-3500, 4000-6000 ms) and style size and bold; SRT gives 3 cues, shift +2.5 s gives 3500-5000, 5620-7540, 8000-9750 ms; SRT line break becomes `\N`; `<i>` becomes `{\i1}`; CLI `--to vtt -o DIR` writes a WEBVTT file with the first cue and leaves the SRT unchanged.
- Stop conditions: version differs, or the two processes differ.
- Failure interpretation: any failed check is `fail`; no rendering claim is made.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. All 11 checks pass and the two processes agree. The written ASS and WebVTT files were read in full: the Kinetic style line carries `Inter,72,&H0000DCFF,…,-1` (bold, yellow in BGR), the events keep their tags verbatim, and ASS times are written as centiseconds (`0:00:05.62`). Finding: the first CLI attempt failed because `-o` takes a directory, not a file; it writes `output/cli/input.vtt`. This proves authoring and conversion of text; it does not show the ASS renders as intended in libass.
