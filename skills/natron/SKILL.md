---
name: natron
description: "Unproven in VCR: Natron is demoted (stalled compositor, no arm64 macOS build); prefer blender-background's compositor, mlt-melt or ffmpeg for compositing."
---

# Natron (unproven)

Written from official docs only. No VCR fixture has run it; every command is documentation-only, untested in VCR.

## Status
Demoted. Assessment rationale: "Latest release is a September 2024 pre-release with an x86_64-only macOS dmg; the Homebrew cask was disabled on 2026-09-01 for Gatekeeper. Repo still gets sporadic commits (July 2026). Blender's compositor covers the arm64 case." Not tested. Might be worth it only to render an existing `.ntp` project someone supplies, where Rosetta and Gatekeeper are acceptable.

## Use cases and limits
- Open-source node compositor. `NatronRenderer` renders a `.ntp` project headlessly; Reader and Writer files and frame ranges can be overridden from the command line; Python can build graphs.
- Latest release is a 2024 pre-release (2.5.1-pre2); macOS builds are x86_64 only, so Apple Silicon runs it under Rosetta if at all. Docs read were 2.3.15, not the newest.
- Not seek-driven web capture: it consumes image sequences or video and writes image sequences or video.

## Prefer instead
- `skills/blender-background/SKILL.md` for node compositing on arm64.
- `skills/mlt-melt/SKILL.md` for layered timeline composition.
- `skills/ffmpeg/SKILL.md` for filtergraph overlays and merges.
- `skills/imagemagick/SKILL.md`, `skills/libvips/SKILL.md` for single-pass layer ops; `skills/openimageio-oiiotool/SKILL.md`, `skills/opencolorio/SKILL.md` for image ops and colour.

## Install route
No supported route is recorded: the Homebrew cask `natron` 2.5.0 was disabled and `install.macos` was removed. The latest GitHub release asset is an x86_64 macOS dmg. Check: `NatronRenderer --version`. Review Gatekeeper and provenance before installing; not done here.

## Surface (2.3.15 execution docs, unverified in VCR)
- `NatronRenderer [options] project.ntp` renders without a GUI.
- A writer option naming a Writer node with optional output path and frame range (believed `-w`; confirm syntax in the docs).
- Python script execution and a Python API for building node graphs.

## Recipe (documentation-only, untested in VCR)
```text
NatronRenderer -w Write1 out/frame_####.png 1-90 project.ntp
```
Flag spelling is unverified; read the execution page before running.

## Licence
GPL-2.0; community-maintained, no arm64 macOS build published. OpenFX plugins carry their own licences.

## Official docs
- https://natron.readthedocs.io/en/v2.3.15/devel/natronexecution.html
- https://github.com/NatronGitHub/Natron/releases
