---
name: lmms
description: "Unproven in VCR: LMMS is a free music workstation whose `lmms render` action turns a project file into audio; load it only when a person supplies an LMMS project to render, and no VCR evidence exists."
---

# LMMS (unproven)

Documentation-only, untested in VCR. Written from official docs and source on 2026-11-24. Nothing here has been run.

## Status
- No VCR evidence. `validation.status` is `not-validated`.
- Blocker: Homebrew disabled the cask on 2026-09-01 because it fails Gatekeeper, so there is no sanctioned install.
- To unblock, a person decides one of: (a) fetch a signed or notarised upstream build from https://github.com/LMMS/lmms/releases (macOS arm64 availability not verified), (b) accept clearing quarantine on a copy inside `output/` only, or (c) retire the tool.

## Use cases and limits
- Renders an existing `.mmp` or `.mmpz` project (instruments, MIDI, effects) to WAV, FLAC, OGG or MP3. Fits a person who authors in LMMS.
- Not scripted synthesis: projects are made in the GUI. For code-first audio use the neighbours below.
- Render determinism, plug-in availability on macOS and project-version compatibility are unknown.
- Licence: GPL-2.0-or-later; bundled samples and plug-ins need separate review (SOUND-LICENSE-RECORD).

## Install routes
- Upstream: https://lmms.io/ and https://github.com/LMMS/lmms/releases (macOS assets not verified).
- Homebrew cask: disabled (Gatekeeper). Do not bypass quarantine without a person's approval.

## Headless surface
From `src/core/main.cpp` on master; the installed build may differ.
- Actions: `render <project>`, `rendertracks <project>`, `dump <in>`, `compress <in>`, `upgrade <in> [out]`, `makebundle <in> [out]`. No action starts the GUI (`--import <in> [-e]`, `--geometry`).
- Render options: `-o/--output <path>`, `-f/--format wav|flac|ogg|mp3`, `-s/--samplerate`, `-b/--bitrate` (default 160), `-a/--float`, `-l/--loop`, `-m/--mode s|j|m` (default j), `-p/--profile <out>`. Global: `-c/--config`, `-h`, `-v`, `--allowroot`.
- The help text's `--samplerate` entry is inconsistent upstream (a 44100-192000 range beside "possible values 1, 2, 4, 8"); read `lmms --help` on the installed build.
```text
# documentation-only, untested in VCR
lmms render project.mmp -f wav -s 48000 -o out.wav
```
Not verified: whether rendering needs a display or audio device on macOS.

## Would-be fixture
One predeclared claim: `lmms render` on a tiny project (one instrument, one note, 2.0 s) exits 0 and writes a WAV with predeclared duration and sample rate (SOUND-SAMPLE-RATE by name), and two reruns agree in sample count; byte identity recorded either way. The project file must be supplied, or hand-written XML that is itself unproven.

## Neighbours (validated in the catalogue)
- `csound`, `supercollider`, `pure-data` (code-first synthesis), `fluidsynth` (MIDI to audio with a SoundFont), `sox`, `pedalboard`, `tone-js`.

## Official links
- https://lmms.io/
- https://github.com/LMMS/lmms
- https://github.com/LMMS/lmms/blob/master/src/core/main.cpp
