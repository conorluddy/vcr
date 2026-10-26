# Tool assessment brief

One brief for every assessor so every record answers the same questions. You are assessing a section of PRD Appendix A; write only to the files named in your assignment under `catalog/tools/`. Run `pnpm validate` before you report.

## What to produce, per record

1. **Check the official source** named in `official_url` (and the repository or registry page if that differs). Record in `assessment`:
   - `date`: today. `assessed_by`: your agent name.
   - `version_seen`: the current release as the source shows it. `last_release`: its date, as precisely as the source gives.
   - `maintenance`: `active` (release or substantive commit within 12 months), `slow` (12 to 36 months), `unmaintained` (older, archived, or the author says so), `unknown` (you could not tell; say why in `rationale`).
   - `verdict`: `keep` the tier, `promote` candidate to catalogued, `demote` catalogued to candidate, or `drop` (unmaintained with a maintained successor, no automation route, or no incremental value over a neighbour). You recommend; the tier is changed only in review.
   - `rationale`: one or two sentences, 400 characters at most, facts first.
   - `sources`: the URLs you actually read.
2. **Write the tier 1 card**:
   - `summary` (≤ 600 chars): what it is, how it is driven, what output it produces, its one distinguishing strength.
   - `use_when` (≤ 4 × ≤ 120 chars): concrete and comparative. "Over PixiJS when the scene is vector-first and small" beats "for 2D graphics".
   - `avoid_when` (≤ 4 × ≤ 120 chars): name the neighbour that wins in that case.
   - `pairs_with`: tool ids this is commonly combined with. Ids must exist in `catalog/tools/`.
3. **Correct what you now know**: `capabilities` (only values from `catalog/capabilities/vocabulary.json`; propose additions in your report, do not add them yourself), `automation_route`, `license`, `install.macos`, `install.check_command`, `role` (≤ 100 chars).
4. **Leave alone**: `tier`, `validation`, `installation_status`, `adapter_maturity`, `documentation_status`, `skill`, `examples`, `facets`. Those change through evidence and review, not assessment.

## Rules

- Never claim a tool is installed, tested or validated. You read documentation; that is all the evidence you have.
- Uncertainty goes in `notes` as a dated sentence, never softened into the card.
- Do not paraphrase upstream docs into `summary`. Say what an agent choosing between tools needs.
- Do not touch files outside your section. Do not touch `catalog/tools.json` or `catalog/INDEX.md`; `pnpm vcr catalog build` regenerates them and the reviewer runs it.
- If a source is unreachable, record `maintenance: unknown` with the URL you tried, and move on.

## Report back

Three lines per record: id, verdict, one-line reason. Then any proposed vocabulary additions with the record that needs them, and any record whose `official_url` should change.

## Re-assessment

An assessment is a dated fact. Re-run this brief for a record when its `assessment.date` is more than six months old, when a verdict is challenged, or before promoting a tool to core. The reviewer applies verdicts; retired records go to `catalog/retired/` with their assessment intact.
