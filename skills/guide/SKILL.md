---
name: guide
description: Write or revise the toolkit guide (tier 2, skills/<id>/SKILL.md) for a VCR tool that already has validation evidence. Use when asked to write, add or update a tool's guide or toolkit skill in VCR, or after the evidence skill reports a guide is justified; not for gathering evidence (use evidence) or assessing a candidate (use ingest).
---

# Write a VCR toolkit guide

Inside the VCR repository `vcr` is `pnpm vcr`. Guides live only in this repository's `skills/`; from an installed plugin, draft the guide in the workspace and say it is not part of the shared catalogue.

A guide is tier 2 of the catalogue tree: how to operate one tool once it has been chosen. The card (tier 1) already says what it is and when to pick it, so don't repeat that here. Read `skills/README.md` for the rules, then one existing guide as a model: `skills/resvg/SKILL.md` for a small CLI, `skills/gsap/SKILL.md` for a browser library with facets.

## 1. Check it is justified

- `vcr tools info <id>`: the record needs at least one evidence entry whose `example` exists under `examples/`. No evidence means no guide; run the `evidence` skill first.
- If `skill` is already set, revise that file instead of creating another.

## 2. Gather only what is proven

Read, in order: the card, every evidence entry's `scope` and `result`, the example's `README.md`, `run.sh` and scene source, then the official docs for the version that ran. Every rule in the guide is either shown by the fixture or cited from official docs for that version. Mark anything else as untested. Never generalise beyond the evidence scope; say which OS and version it covers.

## 3. Write `skills/<id>/SKILL.md`

The directory is usually the tool id; a shorter, clearer name is allowed (`ffmpeg`, `blender-background`). Frontmatter: `name` matching the directory, and a `description` that says when to load it in one or two sentences. Under 12 KB; existing guides run 2 to 5 KB, so aim there.

Sections, in this order (add tool-specific ones between Smoke test and Troubleshooting):

- `## Use cases and limits`: what it does in VCR and where it stops; name the neighbour to use instead.
- `## Install and doctor`: install command and the `vcr doctor` check. Never claim the tool is installed.
- `## Smoke test`: the example's run command and its exact expected output, as a `# expect:` line.
- Tool-specific sections: for browser tools a `## Scene contract` (`window.__scene = { duration, seek }`, everything a pure function of `t` and seed); then recipes and clock rules.
- `## Troubleshooting`: failures actually seen in runs, with fixes.
- `## Official docs`: links for the version that ran.

Code is short and copyable. No upstream docs paraphrased at length; link them.

## 4. Wire it up

- Set `skill` on `catalog/tools/<id>.json`. A core record's `facets` name section headings that must exist (`skill_section`); add or rename both together.
- Run `pnpm vcr catalog build`, `pnpm vcr plugin build`, `pnpm validate && pnpm test`, and commit the guide, the record and the generated output together on a branch.

## 5. Report

The guide path and size, the evidence it rests on, the sections marked untested, and whether the tool now looks like a core candidate. A reviewer decides promotion.
