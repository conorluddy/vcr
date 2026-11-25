---
name: clap
description: "Unproven in VCR: CLAP is a C plugin API for audio instruments and effects that would be loaded when a CLAP plug-in must be inspected or validated before hosting; no VCR evidence exists and CLAP itself is not an executable."
---

# CLAP (unproven)

Documentation-only, untested in VCR. Written from official docs on 2026-11-24. Nothing here has been run.

## Status
- No VCR evidence. `validation.status` is `not-validated`; no evidence entries.
- Blocker: CLAP is a specification and headers, not a tool. A fixture needs an inspection tool plus a real `.clap` plug-in, and the only candidate plug-in (Surge XT CLAP) needs a sudo `.pkg` install.
- To unblock, a person runs `brew install --cask surge-xt`, then chooses the tool the fixture uses: `clap-info` (cmake build) or `clap-validator` (Rust build or an unsigned nightly).

## Use cases and limits
- Inspect which CLAP plug-ins exist and what ports and parameters they expose; validate a plug-in for spec violations.
- CLAP itself renders nothing. Audio needs a host that loads the plug-in; none is chosen for VCR.
- Licence: MIT for the API repo. Each host and plug-in has separate terms (SOUND-LICENSE-RECORD).

## Install routes
- API headers: https://github.com/free-audio/clap (MIT), header-only.
- `clap-info`: `git clone --recurse-submodules https://github.com/free-audio/clap-info && cd clap-info && cmake -Bbuild && cmake --build build`. Needs cmake and a compiler.
- `clap-validator`: `cargo build --release` gives `./target/release/clap-validator`. nightly.link binaries are unsigned on macOS (Gatekeeper or quarantine removal is a person's decision).
- A plug-in: Surge XT CLAP (see the `surge-xt` guide; blocked on sudo).

## Inspection surface (documentation-only, untested in VCR)
- `clap-info -l` lists installed CLAPs; `clap-info -s` scans and prints descriptors; `clap-info "/path/X.clap"` prints full information for plugin 0 as JSON; `clap-info --help` lists the rest.
- `clap-validator validate /path/X.clap` runs the test suite; options `--only-failed`, `--include`/`--exclude <regex>`, `--in-process`, `--trace`. `clap-validator list tests` lists tests. `fuzz` is experimental.
- Not verified: default CLAP search folders per OS (documented in `entry.h`), and how a CLAP is hosted offline for rendering. No host was assessed.

## Would-be fixture
One predeclared claim: `clap-info` on the Surge XT `.clap` exits 0 and prints JSON whose plug-in id and parameter count match a second independent pass, and `clap-validator validate` reports zero failed tests (or the failures are recorded). It says nothing about rendered audio.

## Neighbours (validated in the catalogue)
- `pedalboard` (hosts VST3 and AU plug-ins in Python), `fluidsynth`, `csound`, `supercollider`, `pure-data`, `sox`, `tone-js`.

## Official links
- https://github.com/free-audio/clap
- https://github.com/free-audio/clap-info
- https://github.com/free-audio/clap-validator
