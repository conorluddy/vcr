---
id: ADR-0010
title: Techniques are a thin, hand-curated layer with derived status
status: accepted
date: "2026-11-20"
---

# 0010. Techniques are a thin, hand-curated layer with derived status

## Context

Pillars say what a look should achieve; the catalogue says what each tool does. Nothing joins them, so an agent choosing a treatment picks a pillar and a tool independently and finds less obvious treatments, and honest ways to execute them, by luck. ADR 0006 forbids pillars from naming tools. The capability graph (#65) would have joined them through typed operations, but CG0 (`specifications/spikes/capability-graph-g0.md`) kept the current workflow: hand-curated operation data repeated the cross-scope evidence errors it was meant to remove, and its reopen conditions do not yet hold. #65 also left open where such a mapping would be stored.

## Options considered

1. **Reopen #65 and model techniques as routes over `operations[]` and ports.** The most expressive, but it needs the operations model CG0 put on hold, and its evidence claims would be curated by hand at a finer grain than any fixture supports.
2. **Add tool pointers to the pillar knowledge bases or skills.** No new store, but it breaks ADR 0006 and puts tool names where rule owners and thresholds live.
3. **Add technique fields to tool records.** Keeps one store, but a technique spans several tools and several pillars; it would be duplicated per tool and drift.
4. **A separate catalogue-layer record per technique that holds links only.** One file per technique, naming pillar sections, rule IDs, existing capability IDs and whole tools. Every status shown beside it is computed when it is read.

## Decision

Option 4. A technique is one record at `catalog/techniques/<id>.json` (`catalog/schemas/technique.schema.json`). It names its expressive purposes and visual mechanisms from a small vocabulary, points into the pillars that own its craft (pillar, section, rule IDs), and lists routes: ordered steps, each naming one existing capability and the whole tools that carry it. It may cite rule IDs and name tools; it never restates a threshold, a command or a recipe, and pillars never point back at it. A route explains; it does not execute. A technique with no route is a visible gap, and the index is inspiration, not a whitelist: agents may propose unmapped techniques.

**Status is derived, never stored.** A record carries no evidence, installation or validation field. A route's evidence class is computed from the example it cites: `retained-fixture` when that example lists the route back, is validated, keeps `expected/` and uses every tool in the route; `fixture-reported` when it meets the same conditions without `expected/`; otherwise `documented`: the tools' own documentation says the route should work and no fixture here has run it, however well each tool is validated on its own. `documented` is the normal state and does not gate use; it marks where the agent works out the details. Each tool's validation status and this machine's readiness are read from the tool record and the `vcr doctor` record and shown beside the step, as separate facts. The claim that a fixture exercises a route is made on both sides (`example.json` `techniques` and the route's `example`) and `vcr validate` rejects a one-way link.

`vcr validate` resolves every link: vocabulary terms, pillar, section, rule IDs (unknown, foreign or superseded IDs are errors), capabilities, tools (which must exist, not be retired under ADR 0009, and list the step's capability), facets, examples and related techniques.

This does not reopen #65. There are no `operations[]`, ports, graph store or search; steps bind to whole tools and existing capability IDs. If #65 reopens, technique routes are the curated input its operations would refine, not a competing model. The Layer 7 `reference.schema.json` `techniques` field is free text today; production reference records should use these ids once that layer starts.

## Consequences

- Easier: an agent can go from intent to a contrasting shortlist, to a route with honest evidence, to one toolkit guide, without loading a knowledge base; a route's status cannot drift from the tool records because it is not written down.
- Harder: a route is only as good as its curation. Capabilities are coarse, so "this tool lists `effects`" does not prove it can do this effect; `limits` and the `documented` class have to carry that honesty.
- Must now do: migrate technique `craft` citations in the same PR as any rule rename (#148), since an unresolved ID fails validation; keep previews out of the plugin (PL-04) until a distribution route for media is decided.

## Revisit when

CG1 reopens under the CG0 conditions; or routes need a grain finer than a whole tool to be honest (the same tool appearing in most routes with different limits); or the production trial shows agents ignoring the layer or being misled by a derived class.
