---
name: backfill
description: Work down the VCR catalogue's undocumented-tool backlog a small batch at a time, taking each tool from assessment through fixture evidence to a toolkit guide, and open one pull request. Use when asked to backfill, document the backlog, or work through undocumented tools in the VCR repository; not for one tool on its own (use ingest, evidence or guide directly) or for production work.
---

# Backfill undocumented tools

Repository only: `vcr` is `pnpm vcr`. From an installed plugin, stop and say the backlog lives in the VCR repository. This skill only coordinates. The rules for each step belong to `ingest`, `evidence` and `guide`, so read those skills and do not restate them here.

The argument is a batch size (default 3) or a list of tool ids, for example `backfill 5` or `backfill ab-av1 agg`.

## 1. Pick the batch

- `vcr tools status --json --documentation listed-in-prd` lists the backlog.
- Drop any record whose `assessment.verdict` is already `demote` or `retire`, and note it for the PR body.
- Rank the rest in this order: tools that need no system install (a project-local `pnpm add` in the example, or a binary already on `PATH`: run the record's `install.check_command`, but don't trust `pnpm dlx` or `pnpm list`, which succeed without an install; `vcr doctor` does not probe candidates); those that fill a capability gap (a `catalog/capabilities/vocabulary.json` entry with no validated tool); then the oldest `checkedAt`.
- Skip any id that already has an open `backfill/*` PR (`gh pr list --search "head:backfill"`) or a worktree under `.claude/worktrees/`.
- Show the picked ids with a one-line reason each. If any of them needs a system install, show the install plan and wait for approval, as `evidence` requires.

## 2. Assess (inline)

Run the `ingest` assessment for each tool. A tool that comes out as `defer` or `retire` leaves the batch: record the decision on its card, give it no fixture, and note it for the PR body.

## 3. Evidence (parallel)

Follow `## Batches` in the `evidence` skill. Run one `evidence-runner` agent per tool, with `isolation: worktree`, its own `examples/<dir>`, and the claim and template chosen up front (step 1 of `evidence`). Launch them all in one message. Tell each worker to commit only its own record and example. Examples are part of the pnpm workspace, so the lockfile is regenerated once at integration.

## 4. Guide (parallel, passed or partial only)

For each tool whose evidence passed or partly passed, run one agent, in that tool's worktree, that follows the `guide` skill. The guide sets the record to `skill-written`. A failed or blocked tool keeps its evidence as recorded and gets no guide.

## 5. Integrate

Follow `AGENTS.md`'s worktree rule: merge every worker branch into `backfill/<YYYY-MM-DD>`, rebuild once, and never `git add -A` while worktrees exist. Run `pnpm install` first so `pnpm-lock.yaml` picks up the new examples' dependencies, then rerun each new example's `run.sh`. Remove the worker worktrees after the merge.

```sh
pnpm vcr catalog build && pnpm vcr plugin build && pnpm typecheck && pnpm validate && pnpm test
```

Commit everything those builds regenerate, including the root `README.md` index, not just `catalog/` and `plugin/`. If a check fails, fix the problem or drop that tool's branch. Never weaken a check.

## 6. Pull request and report

`gh pr create` against `main`, never pushing to `main` itself. Wait for CI to pass before merging: `main` does not enforce it. The body holds:

| tool | assessment | evidence | guide | example |
| --- | --- | --- | --- | --- |

Fill one row per tool with pass, partial or blocked, a link to the evidence entry, and the deferred and retired tools along with the reasons. End with one line giving how many tools are still `listed-in-prd`.
