---
name: magenta-studio
description: "Unproven in VCR: Magenta Studio is manual-only (interactive Ableton and standalone MIDI tools); prefer mido or pretty-midi for scriptable MIDI work."
---

# Magenta Studio (unproven)

Written from official docs only. Never run in VCR.

## Status
Manual-only (automation route `manual-only`). Assessment rationale: "Official pages document interactive Ableton and standalone MIDI tools; a reusable CLI automation route and current release activity were not established." Not tested. Might be worth it when a person wants model-assisted MIDI variations and will audition results by ear, supplying the final MIDI file to VCR.

## Use cases and limits
- Model-assisted MIDI tools offered as Ableton Live devices and as standalone applications, both interactive.
- Outputs are generative and not reproducible by default; they need a listen and an independent terms check. No documented CLI or batch interface.
- Individual tool names (Continue, Generate, Interpolate, GrooVAE, Drumify) are recalled, not verified; confirm on the Studio page.

## Prefer instead
- `skills/mido/SKILL.md` and `skills/pretty-midi/SKILL.md` for scriptable, deterministic MIDI reading, editing and writing; `skills/music21/SKILL.md` for notation-level analysis.
- Possible scriptable route, untested: Magenta's Python libraries (the `magenta` repository and `note_seq`) expose related models programmatically. They are separate from Magenta Studio, need Python and TensorFlow, and may be unmaintained; verify before use.

## Install route
Standalone and Ableton downloads are linked from https://magenta.tensorflow.org/studio. The Ableton devices need Ableton Live (commercial). `installation_status` is unknown; nothing was installed.

## Surface
Interactive only; no command map. Inputs and outputs are MIDI files (and clips in Ableton).

## Recipe
None. Documentation-only workflow: generate in the UI, export `.mid`, edit or analyse with mido or pretty-midi, render audio with a synth skill such as `skills/fluidsynth/SKILL.md`.

## Licence
Apache-2.0 for repository code. Model weights, third-party dependencies and Ableton terms need separate review.

## Official docs
- https://magenta.tensorflow.org/studio
- https://magenta.tensorflow.org/v1/studio/standalone
- https://github.com/magenta/magenta-studio
