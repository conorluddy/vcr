# 0007. Draft pillar agents before rules data

Date: 2026-11-07
Status: accepted

## Context

ADR 0006 orders each creative pillar as knowledge base, `rules.json`, automatic checks, workflow skill, then reviewer agent. By November 2026 only typography had `rules.json` and a check. The other knowledge bases held about 700 rules, mostly with numbered draft IDs that `vcr rules info` already resolves. Nothing showed which pillar most needed data and checks first, and nothing had been reviewed on real renders except typography. The plugin PRD also listed subagents as not in v1, although `typographer` already shipped.

## Options considered

1. **Keep the ADR 0006 order.** Agents wait for each pillar's `rules.json` and checks. Safe, but the judgement half of each pillar stays untested until its data is done, and the order of pillars is a guess.
2. **Draft every agent now, advisory, citing rule IDs.** Agents look up each threshold with `vcr rules info`, never restate it, and follow one shared reviewer contract. Draft IDs will be renamed, so citations can go stale.
3. **Draft agents with the numbers written in.** Fastest to write, and exactly the drift ADR 0006 rejected.

## Decision

Option 2. A pillar may ship a draft reviewer or research agent before its `rules.json` and checks exist, on four conditions: it cites rule IDs and looks up every threshold (no number in the agent file); it follows `references/critique-methodology/reviewer-contract.md`; it is labelled draft, advisory and uncalibrated and gates nothing; and `pnpm validate` fails when it cites a rule that does not resolve or a superseded rule outside a line saying it is dropped. The rest of ADR 0006 stands: data, then checks, then a calibrated reviewer. When a pillar gets `rules.json`, its agent's citations move to the named IDs in the same PR. Subagents are part of the plugin (plugin PRD §6.2); the CLI remains the only tool surface.

## Consequences

- **Easier:** real renders can exercise every pillar's judgement now, and what the drafts miss decides which pillar gets data and checks next. Gaps in checks, ownership and the scene contract surface early, as they did in PR #176.
- **Harder:** a draft reviewer measures by hand, so its findings stay heuristic and capped; renaming draft IDs now touches `agents/*.md` as well as the knowledge bases.
- **Must now do:** keep the validate check on agent citations; calibrate each agent against human review (#150) before it gates anything; turn each draft into a calibrated reviewer as its pillar's data and checks land (#149, #148).

## Revisit when

A draft agent's findings are acted on as if calibrated, or keeping agent citations in step with renamed IDs costs more than the early feedback is worth.
