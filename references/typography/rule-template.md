# Proposed typography rule template

Use this when extracting or revising a rule from §14–15 of the knowledge base. This is an editorial template, not an implemented schema or validation contract. Do not create a second authoritative copy of an existing threshold.

- **ID:** stable `TYPO-…` identifier; preserve existing IDs.
- **Purpose:** the reader or production problem this addresses.
- **Canonical definition:** the rule's entry in [rules.json](rules.json), which is canonical (the KB §14 table is generated from it), plus its knowledge-base section; link to the threshold rather than copying it.
- **Scope:** medium, language/script, text role, delivery profile and viewing conditions.
- **Units:** distinguish CSS pixels, raster pixels, points, seconds and frames; record display scaling and frame rate where relevant.
- **Severity:** advisory or warning by default; a gate needs an explicitly selected accessibility or delivery requirement.
- **Exceptions:** inapplicable cases, intentional deviations and required rationale. Copy edits must preserve literal content and meaning.
- **Authority:** published standard, vendor/platform requirement, style guide or heuristic. Name the applicable standard/version or profile.
- **Source:** primary-source link and relevant section; identify secondary sources explicitly.
- **Verification:** checked date, method and result; mark inaccessible or unconfirmed claims as unverified.
- **Measurement:** required inputs, calculation, sampling strategy and uncertainty; distinguish numerical checks from visual inspection.
- **Evidence:** fixture, tool/version and environment if tested; documentation alone is not runtime evidence.
- **Implementation status:** proposed, implemented or validated, with a concrete path or evidence link for the latter two.
- **Review outcome:** pass, finding, not applicable or unable to assess; include measured values and inspected frames/stills when available.
- **Change impact:** consumers referencing this ID and what needs rechecking after an update.

Keep content, design choices, motion timing and production placement separate when recording a finding. An agent's own inspection is evidence, not human approval.
