# CG0 pilot operations (B trial data)

> **Known errors: do not use as facts.** The trial review found at least 8 data errors in these files, including evidence borrowed across scopes, unsupported versions and missing join bindings. They are listed under "B pilot: observed trial" in [capability-graph-g0.md](../capability-graph-g0.md). For tool facts, use `vcr tools info`.

Pilot data for an observed trial of approach B in [capability-graph-g0.md](../capability-graph-g0.md) ("Draft recommendation", step 2). It is **not catalogue data**: nothing here is loaded by the CLI, validated by `pnpm validate`, or shipped in the plugin, and it does not change any tool record. The recommendation is still a draft pending owner review.

One file per in-scope tool: `<tool-id>.operations.json`, shaped `{"tool_id", "operations": [...]}`. Every claim cites a repo source (tool record, `examples/*/expected`, `evidence.md`, `run.sh`, README or `skills/*/SKILL.md`). Nothing was rerun to produce these files.

## Field glossary

- `operations[].id` — local name for one input→output pairing on the tool.
- `capabilities` — existing IDs from `catalog/capabilities/vocabulary.json`, reused, not extended.
- `inputs[]` / `outputs[]` — ports: `name`, `domain` (`3d`, `image`, `video`, `audio`), `format` (`glb`, `png`, `png-sequence`, `html-scene`, `mp4`, …), `profile`. `build123d-part` (in-process object) and `blend` are pilot-only formats outside the CG0 table.
- `alternatives[]` — one logical port with conditional variants (encoder or source choice), not extra ports. `when` appears only where the format alone does not distinguish them.
- `profile.<property>` — `{"value", "ev"}`; `ev` keys into the operation's `evidence` map. A requested/claimed/observed object separates parameter-applied from measured values.
- `prerequisites[]` — same shape as a property.
- `evidence.<key>` — `class`, `source` (path, optional `:line`), `date`, `scope`, `version` `{declared, observed}`; `observed: null` means no retained file records the version.
- `class` — `retained-fixture` (the source is a retained file under `examples/*/expected/`), `fixture-reported` (fixture prose or script only, nothing retained), `documentation-only` (skill or record text, not run), `unknown` (explicitly not established).

**A missing port, property or operation means incomplete, never incompatible.** Absent is not "any".
