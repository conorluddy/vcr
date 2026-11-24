---
name: chainner
description: "Unproven in VCR: chaiNNer is manual-only (GUI node editor, no documented headless route); prefer imagemagick, libvips or resvg for scripted image work."
---

# chaiNNer (unproven)

Written from official docs only. Never run in VCR.

## Status
Manual-only (automation route `manual-only`). Assessment rationale: "Official README documents a node-based GUI; no unattended CLI was established from that source. Release and substantive activity dates not verified." Not tested. Might be worth it when a person wants to explore image graphs or model-based upscaling interactively and hand the resulting images to VCR as plain assets.

## Use cases and limits
- Node-based image-processing application, including neural-network upscaling that needs model files with their own licences.
- The reviewed README documents a graphical interface only. No CLI or headless mode was found; whether one exists elsewhere (for example a backend process or saved-chain runner) was not checked and must not be assumed.
- Not seek-driven and not agent-scriptable as documented. Treat output as an input asset with recorded provenance.

## Prefer instead
`skills/imagemagick/SKILL.md` for resizing and compositing, `skills/libvips/SKILL.md` for batch resizing, `skills/resvg/SKILL.md` for vector rasterising, `skills/openimageio-oiiotool/SKILL.md` for image ops.

## Install route
Download from the project's GitHub releases (https://github.com/chaiNNer-org/chaiNNer). `installation_status` is unknown; nothing was installed or verified. Models and optional Python dependencies are installed separately (unverified).

## Surface
Only what the README establishes: a node editor for chaining image operations and model-based processing. No command reference exists to map.

## Recipe
None. Documentation-only workflow: build and run a chain in the GUI, export images, place them in the workspace and record the model name and licence with the asset.

## Licence
GPL-3.0 (repository label). Models, dependencies and the exact variant need separate review; model terms may restrict commercial output.

## Official docs
- https://github.com/chaiNNer-org/chaiNNer
