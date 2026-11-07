# Typography reference

This directory contains reference material, check definitions and the canonical [rules data](rules.json). `vcr lint` implements `TYPO-SAFE` and text overflow for browser scenes; every other rule is still a manual check. The `typography` skill (`skills/typography/SKILL.md`) is the workflow that routes into it. Read only the section needed in [the knowledge base](typography-knowledge-base.md).

| Task | Read |
| --- | --- |
| Research inputs and cross-pillar handoffs | §3, §12 |
| Choose or pair fonts | §3–4 |
| Refine spacing and layout | §5–6 |
| Make expressive type | §7 |
| Assess contrast | §8, `TYPO-CONTRAST` in §14 |
| Design for a specific medium | Relevant subsection of §9 |
| Handle language and script | §10 |
| Critique or create a composition | §11 or §12 |
| Define a proposed check | §14, [rules.json](rules.json) and [rule template](rule-template.md) |
| Capture and deliver reproducibly | Relevant subsection of §15 |
| Check a claim's evidence | Verification ledger and the cited source |

Start with the medium, language/script, text role, intended display size and delivery requirements. Choose applicable rules; do not apply the entire checklist to every production. Platform defaults and practitioner heuristics are not universal conformance gates. The ledger's unresolved claims remain unresolved even where a summary repeats their numbers.

[rules.json](rules.json) is canonical for thresholds, safe-zone presets and caption profiles; the §14 table is generated from it by `vcr catalog build`, so change a number there, never in the table. New guidance should cite rule IDs and section links rather than duplicate thresholds. Distinguish documented behaviour, machine installation, fixture evidence and implemented checks. No extraction or generation pipeline is currently provided here.
