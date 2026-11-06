# Critique methodology reference

This is the critique methodology knowledge base (`REVIEW-*`), produced from [the research brief](../research-prompts/critique-methodology.md) on 2026-11-06. Every pillar's reviewer shares it: severity, the findings format, combining reviewers, how far AI judges can be trusted, calibration and independence. It is reference material, not an implemented check, and it is about 11k tokens, so read only the section the task needs in [the knowledge base](critique-methodology-knowledge-base.md).

| Task | Read |
| --- | --- |
| Rate a finding's severity (blocker vs taste) | §2 |
| Write a finding; the proposed schema and envelope | §3 |
| Merge, deduplicate or resolve conflicting reviewers | §4 |
| What LLM and VLM judges can and cannot do | §5, §8 |
| Build a gold set and trust levels | §6 |
| Blind the reviewer; author ≠ reviewer | §7 |
| Write a reviewer agent's prompt | §10 (prompt skeleton) |
| Rules for a reviewer, as data | §13, §14 |
| Check a claim | §17 (caveats), §18 (verification ledger) |

## Open decisions before building a findings schema, calibration tooling or more reviewer agents

1. **Reconcile with the plugin PRD's finding.** `specifications/vcr-plugin-prd.md` §6.4 already defines the finding file (`review/findings/F-NNNN.json`), with severity `blocker | major | minor | note` and states `open → addressed → resolved | wontfix`. The KB proposes a 0–4 scale (it adds `cosmetic`) and different states (`accepted`, `rejected`, `fixed`, `escalated`). The PRD is the contract. Extend its finding with the KB's fields where they earn a place (`rule_id`, `kind`, severity `basis`, `confidence`, `evidence`, `reviewer`) rather than ship a second schema. Decide whether `cosmetic` exists or folds into `minor` and `note`.
2. **Bring the existing reviewer into line.** `agents/typographer.md` reports `blocker | major | minor | nit` with `source: lint | measured | visual`. It should move to the shared severity labels and `kind: measured | judged | hybrid`, and follow the KB's caps: taste at most minor, heuristic-only rules at most major.
3. **Independence in practice (`REVIEW-IND-01`).** The KB asks for a reviewer from a different model family where possible. On Claude Code, the reviewer agents run on another Claude model. Decide whether a different model counts, or whether cross-family review (for example a Codex run) is required for gating.
4. **Blinded review packets (`REVIEW-IND-02`).** The packet the reviewer sees must carry no authorship, rationale or earlier verdicts. Today a subagent inherits whatever the parent puts in its prompt. A packet builder, plus a packet lint, is a natural CLI addition next to `vcr lint`.
5. **Calibration before gating (`REVIEW-CAL-*`, `REVIEW-ESC-03`).** No reviewer may gate anything until a gold set of 20–30 human-reviewed renders exists and its agreement is measured. Until then every reviewer is advisory. The trust gates, IoU cut-offs, the cap of 7 findings and the 30% false-positive demotion are uncalibrated proposals (§17).
6. **Rule ID style.** `REVIEW-FMT-01` is numbered, like `ART-*` and `MOTION-*`. Decide once for every pillar.
7. **Schema sketch details to fix when it becomes real.**
   - `location.fps` allows only 24, 25, 30 and 60, which rules out 23.976, 29.97 and 50.
   - The example finding cites `TYPO-OVERFLOW-01`, which does not exist. `vcr lint` reports `overflow`, and its safe-zone rule is `TYPO-SAFE`.
   - `pillar` has no entry for critique itself or for series briefs (`BRIEF-*`); it lists `brief`.

## Editorial notes

- The second, empty-headed sources list was folded into §19. Escaped `\[n\]` markers in the text point to it.
- **⚑18mo** marks a source first published before May 2025.
