---
name: ardour
description: "Unproven in VCR: Ardour is a free-software multitrack audio workstation with Lua scripting and command-line session utilities; load it only when a person has an Ardour session to export or script, and no VCR evidence exists."
---

# Ardour (unproven)

Documentation-only, untested in VCR. Written from official docs and the blocked fixture on 2026-11-24. Nothing here has been run.

## Status
- No VCR evidence beyond a `blocked` entry: `examples/ardour-headless-session/` ran nothing.
- Blocker: macOS ready-to-run builds on ardour.org are a payment flow (one-time amount or subscription; a demo form exists, terms not read). No Homebrew cask; GitHub has no release assets (source tags only, latest seen 9.10).
- To unblock, a person decides one of: buy a licence, request the demo and read its terms, approve a source build (waf, many dependencies; not evidence for a release binary), or retire the tool. Then rerun `examples/ardour-headless-session/run.sh`.

## Use cases and limits
- Multitrack recording, editing, mixing and MIDI in a session, scripted via Lua. Fits reviewing or exporting a person's existing session.
- Not a simple filter: automation needs session context. The manual warns the Lua API may change.
- Licence: GPL v2 per the ardour.org footer; terms of purchased binaries not verified.

## Install routes
- Official binaries: https://ardour.org/download.html (payment flow or demo; blocked). Source: https://github.com/Ardour/ardour (free, large build).
- Homebrew: no cask or formula (checked 2026-11-24).

## Headless surface
- Verified from the manual: `luasession`, a standalone tool giving session access without the GUI; usable as a `#!` interpreter; provides `load_session` and `close_session`; exposes `AudioEngine`. Limited, because most actions live in the editor GUI.
```lua
-- documentation-only, untested in VCR (from the manual)
AudioEngine:set_backend("None (Dummy)", "", "")
s = load_session("/path/to/sessions/", "sessionname")
assert(s)
close_session()
```
- Not verified from the pages read: where the binaries sit in the app bundle, and their names in release 9. Earlier majors used versioned names such as `ardour8-lua`, `ardour8-export`, `ardour8-new_empty_session`; the fixture README plans on "or the current equivalent". Check the installed bundle and `--help`.
- Not verified: WAV import and headless export syntax.

## Would-be fixture
Use the claim already predeclared in `examples/ardour-headless-session/README.md`: create a session from the CLI, import a 2.0 s mono 48 kHz sine WAV, export headlessly; duration within 0.01 s, 48000 Hz, 1 channel, peak within 0.01 of the source; two reruns compared by sample count and peak. Cite SOUND-SAMPLE-RATE by name only.

## Neighbours (validated in the catalogue)
- `sox` for offline edits, `fluidsynth`, `csound`, `supercollider`, `pure-data`, `pedalboard`, `tone-js`.

## Official links
- https://ardour.org/
- https://manual.ardour.org/lua-scripting/
- https://github.com/Ardour/ardour
