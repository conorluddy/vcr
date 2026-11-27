---
name: ffsubsync
description: Shift an existing SRT to match the speech in an audio or video file with ffsubsync in a venv, without transcribing. Load when a caption file is a constant offset from the audio; it cannot fix drift across cuts.
---

# ffsubsync

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Correct a caption file that is a constant offset from the speech (after a re-edit or a new voiceover take) by matching voice activity to cue timing. No ASR.
- It applies one offset and an optional framerate scale. It cannot fix drift across cuts. For new timings from audio use `whisperx` or `syncalong`; to shift by a known number use `pysubs2`; to check limits use `caption-checker`.
- VCR evidence is partial: ffsubsync 0.5.1, Python 3.12, macOS arm64, clean synthetic speech on a 30 s track, offsets +3.0 s and -1.5 s. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `ffsubsync <audio-or-video> -i in.srt -o out.srt` | [README](https://github.com/smacke/ffsubsync) | tested with a WAV |
| `--max-offset-seconds` | `ffsubsync --help` | tested (5, 10 and default 60) |
| `--vad` (webrtc, auditok, silero), `--no-fix-framerate`, `--gss` | `ffsubsync --help` | untested |
| Subtitle-to-subtitle reference sync, split/drift options | README | untested |

## Install and doctor
```sh
python3.12 -m venv output/venv && output/venv/bin/pip install ffsubsync==0.5.1
```
Needs FFmpeg on `PATH`; it pulls numpy, webrtcvad-wheels, auditok and pysubs2. A project-local venv: `vcr doctor` does not probe it.

## Smoke test
```sh
cd examples/ffsubsync-offset-correction && ./run.sh
# expect: ffsubsync-offset-correction: KNOWN FAIL (default flags on a 30 s clip; see expected/metrics.json)
```
It builds the venv, synthesises speech with macOS `say`, shifts an SRT by +3.0 s and -1.5 s, and corrects each with default flags (fail) and with `--max-offset-seconds 10` (worst error 0.01 s).

## Recipe
```sh
ffsubsync speech.wav -i late.srt -o fixed.srt --max-offset-seconds 10
```
Bound the search to the largest offset you expect. The log lines `score` and `offset seconds` show what it chose; check them.

## Troubleshooting
- Default flags on a 30 s clip chose offset -23 s for a +3 s shift (score 712) and the output kept 2 of 7 cues. Cause not established; `--max-offset-seconds 5` found -2.99 s (score 2675). Always bound the search on short clips.
- Cues whose shifted start is below zero are skipped (logged only as `Start time < 0` at INFO), so compare cue counts.
- `-o /dev/null` fails with an unsupported output format; give a `.srt` path.

## Official docs
- [ffsubsync on GitHub](https://github.com/smacke/ffsubsync)
- [ffsubsync on PyPI](https://pypi.org/project/ffsubsync/)
