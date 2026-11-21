---
id: ADR-0012
title: Stated, measured and judged are kept apart
status: accepted
date: "2026-11-21"
---

# 0012. Stated, measured and judged are kept apart

## Context

An inspiration item (ADR 0011) can be described from three sources: what the user says they like in it, what a tool can measure (dimensions, duration, dominant colours, a font's name table), and what a model sees when it looks. These differ in authority. The first is the user's taste and the reason the item is in the library. The second is reproducible. The third is a reading that changes with the model and the day.

VCR already separates sources of truth elsewhere. A finding declares `kind: measured | judged | hybrid` and its severity basis (`catalog/schemas/finding.schema.json`). ADR 0010 separates stored links from status derived at read time. The visual-research pillar asks for description, analysis, interpretation and judgement to stay distinct (`VREF-LAYERS-SEPARATED`). Inspiration records are the first workspace records where a person, a tool and a model all write about the same object, and more will follow (look frames, asset records).

## Options considered

1. **One free-text description field.** Simple to write and read, but after two edits nobody can tell the user's sentence from the agent's, and a check for "has the user said what they like?" passes on a model's paragraph.
2. **Judged observations only at read time, never stored.** Nothing judged can go stale or be mistaken for a statement, but every reader pays for the analysis again, two readers get different answers, and a comparison between models has nothing to compare.
3. **Let the agent draft the note for the user to approve.** Fills the library quickly, but an approved draft anchors on the model's reading; the user ends up agreeing with a description instead of saying what drew them to the item.
4. **Separate, labelled fields per source, each stamped with who or what wrote it.**

## Decision

Option 4. A workspace record that mixes sources of truth keeps them in separate, labelled fields. What a person said goes in a stated field (for inspiration, `note`, with `use` and `rights`). What a tool measured goes in `facts`, stamped with the tool and its version. What a model judged goes in `observations`, each stamped with the agent, the model and the date. Three rules follow. No agent writes or edits a person's statement. A judged field never satisfies a check that asks for a stated one: an item with observations and no note is still unannotated. And every reader shows the three in that order with their labels, so a judged line is never presented as the user's.

Facts are stored, unlike ADR 0010's derived status, for two reasons: the file is identified by its hash and does not change, so a measurement of it cannot drift; and the tool that measured it, or the file itself, may be absent on the machine that reads the record later. The stamp records which tool and version to distrust if a measurement proves wrong. Tools that measure are free software (ADR 0009). An agent that judges cites the rule IDs for its method and restates none of them (ADR 0006), and its observations are draft and advisory (ADR 0007).

## Consequences

- **Easier:** a reader can weigh each line by its source; two models' observations on the same item can sit side by side and be compared against the file; a wrong measurement is traceable to a tool version.
- **Harder:** records and schemas carry three shapes where one text field would do; an unannotated library stays flagged however much analysis is run on it, which is the point and will still feel like friction.
- **Must now do:** give the analyst agent a single write path that can only append observations; have `vcr validate` warn on a missing note regardless of observations; apply the same split to the next workspace record that mixes sources, and cite this ADR when it does.

## Revisit when

A second record type adopts the split and the three labels do not fit it; or stored facts are found wrong often enough that re-measuring at read time would be cheaper than trusting the stamp; or users routinely paste a model's observation into the note, which would mean the stated field is not earning its separation.
