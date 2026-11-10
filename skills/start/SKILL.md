---
name: start
description: Entry point for VCR, the code-first motion graphics and video studio. Use when the user names VCR or the vcr CLI, or when the working directory (or an ancestor) holds a vcr.json workspace and they want to make, render or review a video, title card, loop or motion asset. Routes to the right toolkit through VCR's catalogue. Not for HyperFrames projects or requests that do not mention VCR outside a VCR workspace.
---

# VCR: start here

VCR is a catalogue of code-first motion tools (GSAP, p5.js, Three.js, SVG, FFmpeg, Blender and more), a CLI that drives them, and deterministic frame-by-frame browser capture. The agent edits source; the human reviews renders.

## Calling the CLI

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md. Inside the VCR repository itself it is `pnpm vcr`. Never hard-code a versioned plugin path: hosts replace it on update. Add `--json` when you need to parse output; errors are `{ code, message, retryable }`.

## First: is there a workspace?

Run `vcr status --brief`: it lists videos awaiting review and their open findings, so address those before starting new work. If it reports no workspace, use the `init` skill before anything else. All projects, examples and renders live in the workspace; never write into the plugin directory. A video lives at `projects/<project>/videos/<video>/`; create it with `vcr video init <project>/<video>`, which registers the project and is safe to re-run. `vcr capture <scene.html> … --video <project>/<video>` records a render: frames under `output/<video>/<render_id>/` and a retained manifest under the video's `review/renders/`, which findings and approvals point at. Record problems with `vcr findings add`, and claim a fix with `vcr findings address` once a new render carries it. Plan before building: a confirmed `brief.md` (the `brief` skill), then `beats.json` checked with `vcr plan check --video <project>/<video>`. Only a person resolves a finding or approves a render, at their own terminal (`vcr review approve|request-changes|resolve`); never try to work around the refusal.

## Choosing a tool: four tiers, one at a time

1. Route: `vcr tools list` (or read `<plugin-root>/catalog/INDEX.md` whole). One line per routable tool; unassessed candidates are in `CANDIDATES.md`; filter with `--capability`, `--tier`, `--category`.
2. Shortlist: `vcr tools info <id>` for two or three candidates. Summary, use when, avoid when, pairs with, evidence.
3. Commit: `vcr tools info <id> --full`, or load that tool's skill (`gsap`, `three-js`, `p5-js`, `svg`, `resvg`, `ffmpeg`, `imagemagick`, `blender-background`). One guide at a time.
4. Do: `vcr tools examples <id>`, then `vcr example create <example-id>` and follow the steps it prints.

A card or guide never claims the tool is installed on this machine; `vcr doctor` does. Prefer `core` tier tools: they carry validation evidence.

## Producing an asset

For native asset creation, tool-to-tool handoffs or delivery variants, read
[Produce and verify a native asset](references/native-assets.md). It covers
source and parameter separation, output-specific checks, delivery budgets and
inspection. Load the selected toolkit guide for its actual commands.

## Choosing craft guidance

Read the [pillar index](../../references/INDEX.md) (`vcr refs list`) to select the workflow for the current decision, then load only that workflow and the selected toolkit guide. Briefing and research handoffs start with `brief`; narrative development uses `story`, editorial timing `pacing`, and movement within beats `motion`. Visual decisions route to `art-direction`, `image-treatment`, `lighting`, `materials` or `data-visualisation` as applicable. Use `sound-design` for audio decisions, `accessibility` for access requirements, `adaptation` for version transformations, `delivery` for file QC, and `review` for the current CLI review loop.

These workflows are advisory. The index distinguishes available rules data and checks from reference guidance and draft reviewers; do not infer a check exists because a skill does. Keep initial making and self-checks separate from independent review and human approval.

## Text, captions and titles

For choosing, sizing, placing or timing text (hooks, titles, captions, lower thirds, labels), or checking text before capture, load the `typography` skill alongside the toolkit guide.

## Rendering browser scenes

A browser scene exposes `window.__scene = { duration, seek(t) }` with a pure seek; [the scene contract](references/scene-contract.md) defines it, with `markers`, `textBounds()` and the reserved element tags. Before capturing, run `vcr lint <scene.html> --safe-zone <preset|none>`. It reports text outside the safe zone or the frame, and boxes that overflow, and exits 1 on any finding. The presets are `ebu-16x9`, `tiktok`, `reels`, `shorts` and `composite-9x16`. Capture it with `vcr capture <scene.html> --width W --height H --fps F --verify`. The first time on a machine, `vcr setup capture` shows what it will install; `vcr setup capture --yes` installs it. If `--verify` reports a mismatch, read [Determinism pitfalls](references/determinism.md). Assemble frames to video with the `ffmpeg` skill.

## Inside Codex

`vcr status` reports when the Codex sandbox is detected. VCR then keeps its machine files in `<workspace>/.vcr` and captures with `--single-process`. Capture and installs need network access in the sandbox, and `npm install` needs `--cache .vcr/.npm-cache` because the sandbox blocks `~/.npm`. If a capture or install fails with EPERM, ask the user to rerun Codex with VCR's profile (`codex -p vcr`, see the VCR README) or with `-c sandbox_workspace_write.network_access=true` for this run; never suggest enabling it in the global `~/.codex/config.toml`, which opens the network to every Codex session; if Chromium has never been downloaded on this machine, ask the user to run `vcr setup capture --yes` once in their own terminal.

## Early visual feedback

For a new visual system, move from the selected route and rough beats to a representative style frame before implementing the full piece. Use real content at delivery aspect ratio, testing recurring hierarchy and difficult copy; inspect a sparse state when it tests a different requirement. Explain inherited choices, proposed choices and open questions alongside the image. Iterate from visual feedback, then test a short representative motion interval before extending the system. Concept selection does not select a visual treatment, and a still does not establish motion quality or publication approval. Reuse settled series direction unless content or delivery introduces a meaningful exception. Keep frame purpose, revision links and feedback in existing workspace notes.

Export a browser style frame with `vcr preview still scene.html --width W --height H --fps F --at SECONDS` or replace `--at` with `--marker ID`. Outputs and provenance live under workspace `output/previews/`; each invocation preserves earlier versions. Time is rounded to the nearest delivery frame. Inspect at delivery size and intended viewing size. This is separate from retained full renders and approval.
