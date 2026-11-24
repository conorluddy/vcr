---
name: syncalong
description: "Unproven in VCR: syncalong aligns supplied lyrics or a known transcript to audio with Whisper word timestamps and writes line-timed LRC; load it when line timings for known text are needed, knowing its only VCR fixture failed."
---

# syncalong (unproven)

`vcr` below means `pnpm vcr` inside the VCR repository. Written from official docs and a failed fixture; no passing run exists. Recipes are documentation-only, untested in VCR unless labelled observed.

## Status
- Validation: `not-validated`. Evidence is one FAIL, `examples/syncalong-text-align` (syncalong 2.0.1 from PyPI, openai-whisper 20250625, torch 2.15.0 CPU, Whisper `base`, macOS arm64, 2026-11-24), on an 8-line macOS `say` narration.
- Default route (lyrics used as Whisper's `initial_prompt`): the transcript looped, 20 words of 60, mostly the last line repeated. Line starts were 25.31 to 27.28 s against truth 1.000 to 25.380 s: max error 24.31 s (limit 0.5 s). A rerun gave different LRC bytes and a different transcript.
- Post-hoc diagnostic, not credited as a pass: without the prompt the transcript was correct word for word and repeats shared one hash; alignment was repeatable and lines 2 to 8 were within 0.5 s, but line 1 was 1.0 s early (0.00 against 1.000 s) because Whisper gave the first word the start of the lead-in silence. That still fails the 0.5 s check.
- Likely cause: the prompt makes Whisper loop, and its temperature fallback samples with an unseeded torch RNG (consistent with the output, not proven). The alignment step was not the failing part.
- Next fixture to try: a new predeclared plan that runs without the lyrics prompt (how to disable it was not checked in the CLI), greedy or seeded decoding, and a leading-silence rule declared in advance (for example trim the lead-in or judge line 1 separately), on real spoken or sung material beyond one `say` voice.

## Use cases and limits
- Would do: line-level start times for text you already have, as LRC, using Whisper word timestamps plus sequence alignment (rapidfuzz). Optional Demucs vocal separation; optional remote transcription (`--server`).
- Does not do: word-level output (the library returns one start per line), transcription of unknown text (use `whisper-cpp` or `whisperx`), caption styling.
- Unmatched lines are interpolated by the library, so a line start that is not a Whisper word start was not matched from audio.
- MIT licence. Heavy install: torch and Whisper weights (`base` is 139 MB; the fixture output directory reached about 1.1 GB).

## Install
Record route: `python3 -m pip install syncalong`, check `syncalong --help`. Whisper support is the `whisper` extra (the fixture used `syncalong[whisper]==2.0.1` in a venv). Run `vcr doctor`; never assume it is installed.

## CLI and API (documentation-only, untested in VCR)
```text
syncalong song.wav lyrics.txt -o song.lrc
```
Argument order and flag names above are unverified; read `syncalong --help` and the readthedocs site. Documented surface: local Whisper model choice, remote transcription, Demucs separation, an importable `align()` returning one timestamp per line.

## What the failed fixture taught (observed in the failed fixture)
- The text check passes trivially: LRC lines come from the lyrics, not the audio. Check timings against an independent reference.
- The default lyrics prompt made `base` hallucinate: three repeats of one WAV gave 64, 80 and 21 words and three different hashes (wrong words such as "burglar", "connivators"). Without it: 60 correct words and one hash.
- Whisper's first-word start can be 0.0 under leading silence; expect line 1 to run early.
- Byte-identical reruns are the cheapest health check; the default route failed it.
- Sync context: `PACE-NARR-03` (AV temporal contiguity) and `SOUND-SYNC-LAG` / `SOUND-SYNC-LEAD` give limits via `vcr rules info <ID>`; this guide sets none.

## Neighbours that are validated today
- `whisperx`: word start and end times, validated 10/10 words on a generated sentence (tiny.en, CPU). With a known transcript, align it yourself against those words.
- `whisper-cpp`: transcript. `aubio` or `librosa`: onsets. `ffmpeg`: trim lead-in silence before alignment.

## Official docs
- https://github.com/wickeddoc/syncalong (README, MIT)
- https://syncalong.readthedocs.io/
- https://pypi.org/project/syncalong/ (2.0.1, uploaded 2026-07-24)
- Fixture: `examples/syncalong-text-align/` (README Observation section)
