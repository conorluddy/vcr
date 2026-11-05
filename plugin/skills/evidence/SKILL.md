---
name: evidence
description: Run a scoped fixture for a catalogued VCR tool and record the result as validation evidence. Use when asked to validate, gather evidence for, smoke-test or prove a catalogued tool in VCR; not for assessing a new candidate (use ingest) or for production work.
---

# Gather evidence for a VCR tool

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run `vcr status --json` to identify the harness, workspace and machine roots. Evidence records are written only inside the VCR repository; from an installed plugin, write a report in the workspace and say it does not update the shared catalogue.

Read `<harness>/catalog/FIXTURE-EVIDENCE-TEMPLATE.md` first. It is the contract for evidence entries; this skill is the order of work.

## 1. Choose the claim

- `vcr tools info <id>`: read the card, its current evidence and `Evidence scope`. Pick one concrete VCR job the card claims, such as "seeked timeline captured deterministically with alpha". One claim per fixture.
- Prefer an existing chain. A browser tool that seeks from `t` reuses the `packages/capture` route (`window.__scene = { duration, seek }`); copy the shape of `examples/browser-capture`, not its scene. A native CLI copies `examples/native-svg` or `examples/ffmpeg-assembly`.
- If an existing example already exercises the tool, extend it instead of adding one, and add the tool id to its `example.json` `tools`.

## 2. Plan before running

Fill the template's "Plan, before running" section in the example's `README.md`: exact versions, commands, predeclared checks and stop conditions. Checks are facts a script can diff (frame count, dimensions, hashes, alpha range, shuffled-equals-sequential, ffprobe fields), retained as `expected/*.json`, never media.

Check the machine with `vcr doctor`. If a dependency is missing, show the installation plan (method, version, destination) and get approval. Do not install silently, and never substitute another tool and credit the original.

## 3. Build and run the fixture

Layout per `examples/README.md`: `example.json` (schema `catalog/schemas/example.schema.json`), `run.sh` that diffs against `expected/` and supports `--record`, `expected/`, ignored `output/`.

1. Run once with `--record`, then inspect the actual output at its intended scale (open frames or the movie; use `imagemagick` montage for a contact sheet). A passing diff of a wrong picture is not evidence.
2. Run again without `--record`; it must print OK. For seeked scenes, rely on the shuffled-order check: determinism is the claim most likely to be false.
3. Record failure honestly. A blocked or failed run is reported, and the record keeps `not-validated`; a partial result may set `partial` with a scope saying what failed.

## 4. Record the evidence

Append one entry to `validation.evidence` in `catalog/tools/<id>.json`, following the template's rules: exact `version` (not a range), `hostname`, `command` under the cited `example`, `result` with the observed numbers, and a `scope` (at most 200 characters) saying what it proves and what it does not. Never edit earlier entries. Link the example from the record's `examples` and set `status` only as far as the evidence supports.

Then run `pnpm vcr catalog build`, `pnpm vcr plugin build`, `pnpm validate && pnpm test`, and commit the source record, example and generated output together on a branch.

## 5. Report

State pass, partial, fail or blocked; the evidence path; what the run does not establish (other OS, other routes, quality); and whether a toolkit skill is now justified (`skills/README.md`: only once an example has produced evidence). The `guide` skill writes it; do not start it unless asked. A reviewer decides promotion to core.

## Batches

For several tools, give each one its own agent, worktree and example directory, so no two agents edit the same file. Merge into one integration branch and rebuild the catalogue once, as `AGENTS.md` describes.
