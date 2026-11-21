# Architecture decision records

One line on what each record decides. Status and date are in the generated [`INDEX.md`](INDEX.md), which is the authority; this list says nothing about status so it cannot drift from it. Add a line here when a record is created.

- 0001 — build the composition engine in-house.
- 0002 — headless first; read-only visualisers, no editor.
- 0003 — distribute as a plugin with a bundled CLI and three roots.
- 0004 — progressive disclosure and feedback are first-class, enforced by checks.
- 0005 — recommendation policy dimensions and licence migration; replaced by the stricter free-software catalogue scope in 0009.
- 0006 — creative pillars: craft knowledge as rules data, independent of catalogue tools, one owner per rule.
- 0007 — draft pillar agents may ship before rules data: advisory, rule IDs only, one reviewer contract, citations checked by validate.

- 0008 — advisory making workflows may ship before checks; limits stay sourced and approval remains human.
- 0009 — free/libre software is the only routable catalogue scope; retire proprietary and source-available records.
- 0010 — techniques are a thin, hand-curated catalogue layer joining pillars to tools; routes name whole tools and status is derived at read time.
- 0011 — inspiration is a workspace library separate from assets: a committed record per item, the file copied into an ignored folder, local files only; only an asset with rights evidence may appear in output.
- 0012 — what a person stated, a tool measured and a model judged are kept in separate, labelled fields; no agent writes a person's statement and a judged field never satisfies a stated check.
- 0013 — models are chosen per agent in the workspace (`vcr.json` `models`); the agent definition is the default and VCR never recommends or validates a model name.
- 0014 — a video's look is approved on look frames (stills, a recorded human choice) before motion; stills are a stage, not a project type.

One file per decision, `NNNN-kebab-title.md`, managed with `whatwhy` (`node scripts/whatwhy.mjs`; see the process section of `AGENTS.md`). Create a record with `whatwhy new adr "<title>"` from `TEMPLATE.md`, and change its status with `whatwhy accept|reject|deprecate <ID>`; never edit an `id`, a number or a `status` by hand. An accepted record is frozen once merged: supersede it with a new one.

`TEMPLATE.md` carries whatwhy's three required sections (Context, Decision, Consequences) plus two this repository adds, which every record here fills in:

- **Options considered**, after Context: each option with its real cost and benefit.
- **Revisit when**, last: a concrete, observable trigger.

Cite a record as "ADR 0011" or `ADR-0011`; `whatwhy check` reads both in a branch name, commit message or pull request.
