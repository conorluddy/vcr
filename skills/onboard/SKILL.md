---
name: onboard
description: Take one incoming tool or library all the way into VCR on a single branch and pull request: lead triage, candidate record, documentation assessment, a fixture example with validation evidence, and a toolkit guide. Use whenever the person names one tool to "add", "onboard", "set up", "bring in" or "process" in the VCR repository, or picks a lead from prospects/inbox (for example "onboard mathjax" or "let's do tippecanoe from the inbox"); not for a batch of backlog tools (use backfill), only one step on its own (use ingest, evidence or guide) or choosing a tool for production work (use start).
---

# Onboard one tool

Repository only: `vcr` is `pnpm vcr`. From an installed plugin, stop and say onboarding writes the shared catalogue, which lives in the VCR repository.

This skill coordinates one tool through four deliverables: **documentation** (the card), an **example** (the fixture under `examples/`), **proof** (the evidence entry) and a **skill** (the toolkit guide). The rules for each step belong to `ingest`, `evidence` and `guide`. Read those skills as you reach each step, and don't restate them here, so there is only one place to change a rule.

The argument is a tool id or name, optionally with the digest it came from: `onboard mathjax` or `onboard 2026-11-27 mathjax`.

## 1. Find where the tool stands

Onboarding resumes. A tool may already be part of the way through, and redoing a finished step wastes a run and can overwrite reasoning someone reviewed.

- Lead: `grep -n '(\`<id>\`)' prospects/inbox/*.md`. Read only that lead's block. It is unassessed: its URL, licence and version are pointers to check, not facts to copy.
- Records: `catalog/tools/<id>.json` (live) and `catalog/retired/<id>.json`. A retired record means stop and show the person the reason it was retired; reopening it is their call.
- Work in flight: `gh pr list --search "<id> in:title"`, plus branches and worktrees named after the id. If one exists, offer to continue it, not to start again.

Then jump to the first step that is not done:

| State | Start at |
| --- | --- |
| lead only, no record | 2 |
| record, no assessment | 3 |
| assessed, no evidence | 4 |
| evidence passed or partial, no `skill` | 5 |
| `skill` set | report it is onboarded; offer a revision via `guide` |

Say in one line which state you found and where you are starting.

## 2. Capture and triage

Follow `catalog/CANDIDATE-INGESTION.md` §1: write one `candidate` record from official sources, applying the free-software gate. A non-free or source-available lead gets no record; it stays in the inbox.

If the tool came from a digest, tick its triage box with the decision (`- [x] triage: assess`, or `defer` or `retire` with the reason on the next line). That is the only edit a digest allows; everything else in it is history the discovery routine dedupes against.

## 3. Assess

Run the `ingest` skill's documentation assessment and write the card. If the verdict is `defer` or `retire`, record it on the card and skip to step 6 with the record alone. That outcome is still a valid onboarding, because the reasoning is preserved and the lead won't come back.

## 4. Example and proof

Run the `evidence` skill inline. Most of the time and risk sit in this step:

- Choose the claim before writing code: the one VCR job a person would most likely use this tool for, which is usually the gap the lead names against its neighbours.
- Prefer a route with no system install (a `pnpm add` inside the example, or a binary already on `PATH`). If an install is needed, show the plan and wait for approval. If the person declines, the step is `blocked`, which is a recorded result, not a failure of the skill.
- Look at the output at its intended scale before recording it. A passing diff of a wrong picture is not proof.

A failed or blocked fixture still gets its evidence entry and README, and the tool stops before step 5.

## 5. Skill

If the evidence passed or partly passed, run the `guide` skill to write `skills/<id>/SKILL.md` and set `skill` on the record. Don't write an unproven guide unless the person asks for one.

## 6. Verify, integrate and open the PR

Work on the branch `onboard/<id>`. Never commit to `main`.

```sh
pnpm install   # when the example added dependencies
pnpm vcr catalog build && pnpm vcr plugin build && pnpm typecheck && pnpm validate && pnpm test
```

Commit everything the builds regenerate, including the root `README.md` index. Then check that each deliverable can be reached the way an agent will reach it, one tier at a time:

- `pnpm vcr tools info <id>` shows the card and the evidence.
- `pnpm vcr tools examples <id>` lists the example.
- `pnpm vcr tools info <id> --full` loads the guide.

If a check fails, fix the cause. Never weaken a check to get green.

Open the PR against `main` with `gh pr create`. Title: `onboard: <id>`. Body:

| tool | triage | assessment | example | evidence | guide |
| --- | --- | --- | --- | --- | --- |

Fill the row with the decision, verdict, example path, pass, partial, fail or blocked with a link to the evidence entry, and the guide path or the reason it has none.

## 7. Report

Give the PR link, the one-line claim the fixture proves and what it does not, anything left untested in the guide, and the next step: a reviewer decides promotion to core.
