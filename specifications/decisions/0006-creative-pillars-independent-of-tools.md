# 0006. Creative pillars: craft knowledge as rules, independent of tools

Date: 2026-11-06
Status: accepted

## Context

Between #116 and #138, VCR gained eleven reference pillars in `references/`: typography, art direction, motion, pacing, sound, accessibility, series briefs, critique, story, delivery, adaptation and data visualisation. Each is a deep-research knowledge base of 13–23k tokens, holding a rules table (about 500 rules across all of them), measurement notes and a verification ledger. Only typography has gone further: `rules.json`, `vcr lint`, the `typography` skill and the `typographer` agent.

Placing the pillars side by side showed four problems:

- **Overlap and contradiction.** Four pillars set different minimum reading holds, and three set different beat tolerances.
- **Tool recipes inside craft rules.** There are FFmpeg filter chains in delivery and GSAP ease names in motion. A natural next step, folding a delivery skill into the `ffmpeg` toolkit guide, would have tied a craft layer to one tool, while the catalogue holds several tools for most jobs.
- **Production values inside general rules.** Some advice in the research only held for particular productions.
- **No cheap way in.** The rules are trapped inside files too large to load whole.

The working decisions were recorded piecemeal in `references/README.md` and the pillar READMEs (#129–#138). This record states the architecture they add up to.

## Options considered

1. **Keep the references as prose** that agents read when needed. No cost, but numbers drift from what agents do, nothing is checkable, and overlaps return with every pillar.
2. **Distil each pillar into skills and agents directly**, skipping data. Fast, but numbers get copied into prompts, tool recipes leak into craft guidance, and every change must be made in several places.
3. **Treat each pillar as a pipeline from data to tools, with fixed layers and one owner per rule.** More upfront structure, which typography has already proved.

## Decision

Option 3.

1. **The pipeline.** Each pillar goes from knowledge base to `rules.json` to automatic checks to a workflow skill to a reviewer agent. `rules.json` is canonical, and `pnpm validate` holds it and the knowledge base in agreement (as `typography-rules.ts` does). Skills and agents cite rule IDs and never restate a number.
2. **Three layers, with dependencies pointing one way.**

   | Layer | Holds | Must not |
   | --- | --- | --- |
   | Pillar (references, `rules.json`, workflow skill, reviewer agent) | What good looks like, limits, how to judge | Name a catalogue tool, or hold a tool recipe |
   | Catalogue (tool records, toolkit guides, examples) | How one tool meets a rule | Restate a pillar's threshold. It cites the rule ID and shows its recipe. |
   | Checks (`vcr lint`, delivery, flash, motion sampling) | Whether the output met the rule | Depend on which tool produced the output |

   Checks may use harness infrastructure (Chromium for lint, `ffprobe` for files); that is plumbing, not a choice from the catalogue. A tool record may claim it can meet a pillar rule only with evidence from the `evidence` skill.
3. **One owner per rule.** `references/README.md` keeps the owner table. Other pillars cite the owner's ID, and rules marked *drop* stay out of `rules.json`. A check at plan time cites the threshold owned by the check at render time.
4. **Values belong to the brief, checks to the pillars.** A production's values (palette, motion tokens, durations, mandatories, market profiles, claim registry) live in its brief in the workspace, never in this repository. Pillar checks read them.
5. **One finding contract and one scene contract.** Findings use plugin PRD §6.4 with its reviewer fields and severity caps. The scene interface (`markers`, `textBounds()`, reserved tags and future additions) is defined once in `skills/start/references/scene-contract.md`.
6. **Named rule IDs.** An ID is a prefix plus words, with no digits. Numbered draft IDs are renamed when the pillar's `rules.json` is built.
7. **Advisory until calibrated.** Heuristic thresholds and judged findings inform the human and gate nothing until they are checked against human review of real renders (`REVIEW-CAL-*`). Standards (for example WCAG flash thresholds) may gate once their check is validated.
8. **Disclosure in tiers.** A generated pillar index comes first, then single rules by ID, then single knowledge base sections. A whole knowledge base is never loaded (ADR 0004).

## Consequences

- **Easier:**
  - An agent finds a limit without loading 20k tokens.
  - A new encoder or animation tool slots in under existing rules.
  - Checks, reviewers and humans share one vocabulary of rule IDs.
  - Contradictions surface as owner decisions, not silent drift.
- **Harder:**
  - Each pillar needs a schema-checked `rules.json` before skills or agents can cite it.
  - Toolkit guides gain a duty to map their recipes onto rule IDs.
  - Renaming numbered draft IDs touches the knowledge bases.
- **Must now do:** the work is tracked in epic #152 (#139–#151), starting with disclosure (index and `vcr rules`), shipping pillar references in the plugin, and the brief and beat sheet schemas. When distilling skills, move tool recipes from the knowledge bases into the matching toolkit guides.

## Revisit when

When the second pillar reaches `rules.json` and a check, compare its cost with typography's. If keeping the data and the knowledge base in agreement costs more than it prevents, consider making the data the only source and generating the rules tables of the knowledge bases from it. If a toolkit guide cannot express a rule without restating its number, the layer boundary needs adjusting.
