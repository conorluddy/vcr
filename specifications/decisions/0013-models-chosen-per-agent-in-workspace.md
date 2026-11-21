---
id: ADR-0013
title: Models are chosen per agent, in the workspace
status: accepted
date: "2026-11-21"
---

# ADR-0013: Models are chosen per agent, in the workspace

## Context

Reading an image or a clip well depends on the model doing the reading, and the user wants to choose it: to compare two models on the same items, to spend more on a production that matters, or to use what their host offers. VCR's agents each carry a default `model` in their definition under `agents/`, and nothing lets a workspace change it. Skills run in whatever model the session is using and have no model of their own.

The plugin is read-only and shared across every workspace on a machine (ADR 0003), and it ships to two hosts whose model names differ. VCR has no way to know which models exist, what they cost or which is better at a task, and any table saying so would be stale on release.

## Options considered

1. **A one-off `inspirationModel` key in `vcr.json`.** The least to build, and the next agent that wants the same choice adds a second key with a different name.
2. **A model field on skills.** Puts the choice where the workflow is described, but a skill is instructions for the session's own model; the host does not switch models for it, so the field would promise something that does not happen.
3. **A default table in the harness.** One place to look, but the harness is shared and read-only: one user's preference becomes everyone's, and it cannot differ between productions.
4. **Machine-level configuration under `VCR_HOME`.** Per user, but not per production, and not visible to a collaborator or a later session reading the workspace.
5. **A per-agent map in the workspace marker.**

## Decision

Option 5. `vcr.json` may carry `models: { "<agent-name>": "<model>" }`, and an entry may be given per host where the names differ. The agent definition's own `model` remains the default when the workspace says nothing. VCR reports the setting (`vcr status`); it never recommends a model and never validates a model name, since only the host knows what it accepts. Skills stay model-agnostic: work that benefits from a particular model is given to an agent, and the skill tells the orchestrator to pass the workspace's choice when it spawns that agent. Anything a model writes into a record is stamped with the model that wrote it (ADR 0012), so a change of setting is visible in the output.

## Consequences

- **Easier:** every agent, present and future, gets the same override with no new key; two models can be compared on the same input by changing one line; the choice travels with the production.
- **Harder:** an unknown agent name or a model the host rejects is only discovered at spawn time; the override is a convention the orchestrator must follow, since the CLI does not spawn agents and cannot enforce it; per-host entries add a shape most workspaces will never use.
- **Must now do:** document `models` in `workspace.schema.json` without enumerating values; report the map in `vcr status --json`; keep model names out of skills, ADRs and pillar material.

## Revisit when

A host offers its own per-agent model setting that makes the map redundant; or users set the same map in every workspace, which argues for a machine-level default beneath it; or a skill's own work, not an agent's, proves to need a particular model.
