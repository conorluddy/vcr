---
name: surge-xt
description: "Unproven in VCR: Surge XT is an open-source software synthesizer (standalone, AU, VST3, CLAP) that would be loaded when a patch-based synth voice is wanted and Csound, SuperCollider or FluidSynth do not fit; no VCR evidence exists."
---

# Surge XT (unproven)

Documentation-only, untested in VCR. Written from official docs on 2026-11-24. Nothing here has been run.

## Status
- No VCR evidence. `validation.status` is `not-validated`; the record has no evidence entries.
- Blocker: the Homebrew cask installs a `.pkg`, which needs sudo, so the evidence runner could not install it.
- To unblock, a person runs `brew install --cask surge-xt` (accept the sudo prompt), then confirms the plug-ins exist (see Install routes). A scripted route to render notes is still to be found (see Headless surface). The same install unblocks the `clap` guide.

## Use cases and limits
- A hybrid, wavetable and modulation-rich synth, used from a plug-in host or as a standalone app. Fits patch-driven sound design where hand-written oscillators are too bare.
- The manual describes no command-line or headless mode (checked 2026-11-24, first 100k characters only). Offline rendering normally means a plug-in host, not Surge XT itself.
- Licence: GPL-3.0 per the repo label. Factory content and third-party patches carry their own terms; record them (SOUND-LICENSE-RECORD).
- Determinism of a render (SOUND-SYNTH-DETERMINISM) is unknown: patches may use random or free-running modulators.

## Install routes
- Official: installer from https://surge-synthesizer.github.io/ ; macOS components are AU, VST3, CLAP and standalone (manual). It installs for all users, hence admin rights.
- Homebrew: `brew install --cask surge-xt` (named in the backfill handoff; the cask runs a `.pkg`, needs sudo). Documentation-only, untested in VCR.
- Requirements per manual: macOS 10.11+, Intel or Apple Silicon.
- Not verified: install paths. macOS plug-in folders are conventionally `/Library/Audio/Plug-Ins/{Components,VST3,CLAP}` (convention, not read from Surge docs).

## Headless surface
- Manual: none documented.
- Not verified from official docs: the source repo may build a `surge-xt-cli` target; whether releases ship it, and its flags, were not read. Check https://github.com/surge-synthesizer/surge before relying on it.
- Route via another host (documentation-only, untested in VCR): load the AU or VST3 in `pedalboard` (check its docs for instrument-plugin support), or the CLAP in a CLAP host (see the `clap` guide).

## Would-be fixture
One predeclared claim: a host loads the Surge XT plug-in, plays one MIDI note (A3, 220 Hz, 1.0 s) on its default patch, and renders a WAV whose duration is within a predeclared tolerance of the scored length, whose fundamental lies within a predeclared cents bound of 220 Hz, and whose second render is sample-identical or the difference is recorded. Stop as blocked if no scriptable host works. Check the tail (SOUND-TAIL-INTACT) and rate (SOUND-SAMPLE-RATE) by name; this guide sets no thresholds.

## Neighbours (validated in the catalogue)
- `csound`, `supercollider`, `pure-data`: scripted synthesis with reproducible offline render.
- `fluidsynth`: SoundFont playback from MIDI. `pedalboard`: plug-in hosting and effects in Python. `tone-js`: browser synthesis. `sox`: effects on rendered WAV.

## Official links
- https://surge-synthesizer.github.io/
- https://surge-synthesizer.github.io/manual-xt/
- https://github.com/surge-synthesizer/surge
