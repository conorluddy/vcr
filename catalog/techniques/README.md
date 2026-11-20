# Technique records

One file per visual technique, `<id>.json`, joining creative intent to catalogue tools ([ADR 0010](../../specifications/decisions/0010-technique-mapping-layer.md)). Schema: `../schemas/technique.schema.json`. `vocabulary.json` holds the allowed `purposes` and `mechanisms`. Agents read these through `vcr techniques list`, then `vcr techniques info <id>`, then `--full`; the generated tier 0 is `../TECHNIQUES.md`.

## What a record may hold

- **Links only.** Pillar sections and rule IDs in `craft`; capability IDs and tool ids in route steps; an example id on a route. Never an evidence class, a validation status, an installation claim, a threshold, a command or a recipe. Those are read from tool records, examples, the machine record and the pillar when the technique is shown.
- **`summary`** says what it looks like and what it expresses, in words a brief could use. No numbers: a number belongs to the rule the `craft` pointer cites.
- **`craft`** needs at least one pointer. `pillar` is the directory under `references/` (`fx`, `motion-director`); `section` is what `vcr refs section` takes (`5.1`, `9c`); `rules` are IDs owned by that pillar and may be empty. Read the section before citing it.
- **`related`** names techniques worth weighing against this one (`contrasts`) or layering with it (`combines`). Prefer at least one contrast, so a shortlist is never one idea three ways.

## Routes

- A route is one concrete way to execute the technique. Alternatives are separate routes; `tools` in a step are used together.
- Each step names one capability from `../capabilities/vocabulary.json`, and every tool in the step must list it on its record. If a tool does not, split the step or pick the capability it does carry; do not edit the tool record to fit.
- No capture step. `vcr capture` renders any browser scene, so a route that ends in a browser scene stops there; listing the capture tool only adds a readiness line that reads like a blocker.
- `does` says what the step contributes, not how to type it. The how lives in the toolkit guide (`vcr tools info <tool> --full`).
- `limits` is where honesty goes: what the tool's evidence does not cover for this use, and what the route cannot do. Read each tool's `Evidence scope` first (`vcr tools info <tool>`).
- `example` only when a fixture truly exercises the whole route: it uses every tool in the route and shows the effect. Add `"<technique>/<route>"` to that example's `techniques` in the same change. Leave everything else without an example; it shows as `documented` (the tools' docs say it works; no fixture here has run it), which is accurate and does not stop anyone using it.
- `routes: []` is allowed and useful: it marks a technique nothing in the catalogue can yet do.

## Checks

`pnpm vcr validate` resolves every link and fails on an unknown, foreign or superseded rule ID, a missing section, a tool that is absent, retired or lacks the step's capability, a one-way example link, or an example that does not use every route tool. A rule rename must update the records that cite it in the same PR. After adding or editing a record run `pnpm vcr catalog build`, then `pnpm vcr plugin build`.

The index is inspiration, not a whitelist. A technique missing here is not forbidden; propose it, and add a record when it has been used.
