---
name: rhubarb-lip-sync
description: "Unproven in VCR: Rhubarb Lip Sync turns a WAV or Ogg dialogue recording into timed mouth-shape cues (A to H and X) for 2D mouth animation; load it when cues must drive a character, knowing its only VCR fixture crashed."
---

# Rhubarb Lip Sync (unproven)

`vcr` below means `pnpm vcr` inside the VCR repository. Written from official docs and a failed fixture. Recipes are documentation-only, untested in VCR unless labelled observed.

## Status
- Validation: `not-validated`. Evidence is one FAIL, `examples/rhubarb-lip-sync-cues` (Rhubarb 1.14.0, x86_64 macOS build under Rosetta 2 on Apple M3 Pro, macOS 26.6, 2026-11-24).
- Observed: `run.sh` exited 139 (SIGSEGV) at the first rhubarb run on a 9.12 s generated 16 kHz mono speech WAV; no cues written. The same crash came with `-r phonetic`, `--threads 1`, a 2 s excerpt, a 16 kHz re-encode and an explicit `arch -x86_64` launch. `rhubarb --version` exited 0, and a bundled sine sample exited 0 without reaching speech recognition. Binary sha256 `93fa4a16...c946d3` (full value in the record).
- Likely cause: the crash report faults in PocketSphinx `ps_init` during `createDecoder`, inside its log callback (`sphinxLogCallback` to `vsnprintf`) while formatting an error, which hides the real init error. Whether Rosetta, macOS 26 or the archive's model set is to blame is not established, and no arm64 release exists to separate them.
- Next fixture to try: a native arm64 build if one appears, or the phonetic recogniser from such a build; otherwise an x86_64 Mac or Linux host to confirm the claim at all. Predeclare the same structural checks: cues tile the timeline, only A to H and X, X during silent gaps, rerun determinism, and `--dialogFile`.

## Use cases and limits
- Would do: timed mouth cues (TSV, XML, JSON) from recorded dialogue, to drive 2D mouth animation; the project lists integrations for several animation tools.
- Does not do: word-level transcript timing (use `whisperx`), live or real-time animation, or any judgement of cue quality. English uses PocketSphinx; the phonetic recogniser covers other languages at lower precision.
- MIT project; bundled third-party dependencies carry their own permissive licences. Input is WAV or Ogg.

## Install
Record route: download the v1.14.0 macOS zip from GitHub releases (checksum in the record), unzip, and run `rhubarb` from the extracted directory so it finds `res/`. It is an x86_64 build and needs Rosetta 2 on arm64. `rhubarb --version` printed `Rhubarb Lip Sync version 1.14.0`. Run `vcr doctor`; never assume it is installed.

## CLI surface (documentation-only, untested in VCR)
```text
rhubarb -f json -o cues.json speech.wav
rhubarb -f json -r phonetic -o cues.json speech.wav
rhubarb -f json --dialogFile dialog.txt -o cues.json speech.wav
```
Documented options include `-f` (tsv, xml, json, dat), `--extendedShapes` (default `GHX`), `--dialogFile`, `--threads`, `--machineReadable`, `--datUsePrestonBlair`. Confirm on `rhubarb --help`; the speech path has never succeeded in VCR.

## What the failed fixture taught (observed in the failed fixture)
- A passing `--version` and a sine-sample run prove nothing: the sample never reaches recognition. Test with real speech.
- The crash did not depend on thread count, clip length, sample rate, recogniser choice or `arch -x86_64`.
- The fixture's reference timeline (speech spans 0.5 to 2.02 s, 3.02 to 5.96 s, 6.96 to 8.12 s; silent gaps between) is reusable for a rerun.
- Sync context if cues ever work: `SOUND-SYNC-LAG` and `SOUND-SYNC-LEAD` (limits via `vcr rules info <ID>`); this guide sets none.

## Neighbours that are validated today
- `whisperx`: word start and end times for narration, which can place mouth changes by hand.
- `aubio` and `librosa`: onset and energy timing, enough for a coarse open and closed mouth from loudness (documentation-only idea). `ffmpeg` for audio prep (16 kHz mono WAV).

## Official docs
- https://github.com/DanielSWolf/rhubarb-lip-sync (README, options, output formats)
- https://github.com/DanielSWolf/rhubarb-lip-sync/releases/tag/v1.14.0
- Upstream issues were not searched. Fixture: `examples/rhubarb-lip-sync-cues/`
