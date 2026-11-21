---
id: ADR-0009
title: Free software is the catalogue boundary
status: accepted
date: "2026-11-16"
---

# ADR-0009: Free software is the catalogue boundary

## Context

VCR's catalogue included proprietary applications and hosted services alongside free software. ADR 0005 allowed tools that were merely free for the owner's current use, including source-available and size-restricted licences. The owner has clarified that VCR should contain and use free software only. A no-cost plan or visible source does not grant the freedoms needed for this repository's public, reusable workflows.

## Options considered

1. **Keep all tools and mark proprietary entries reference-only.** Preserves discovery, but leaves users and agents to route through software that does not meet the project's scope.
2. **Retire only paid products.** Removes obvious subscriptions but keeps source-available and field-restricted software such as small-business licences.
3. **Limit the routable catalogue to free/libre software and retain prior records in the retired archive.** Makes the boundary clear in the index, CLI and plugin while preserving assessment history in Git.

## Decision

Option 3. Software in `catalog/tools/` must be licensed so users can run it for any purpose, study and modify its source, and share original or modified copies, including for commercial purposes. A licence that restricts users by organisation size, field of use, non-commercial status, or required payment does not qualify. Free-of-charge access and source visibility alone do not qualify. OSI approval is useful evidence but is not a separate requirement when the licence otherwise grants these freedoms. A paid support or hosting option does not disqualify free local software, but a hosted API is not a substitute for a free software implementation.

Assess source code separately from model weights, datasets, media, bundled assets, plugins, services and output rights. A free-software tool may remain catalogued when restricted optional assets are clearly identified and excluded from its free workflow. Native platform APIs have no standalone executable licence; their implementations and capture runtimes are assessed separately. Unresolved software licences must be verified before promotion or installation fixtures.

Retire existing proprietary, source-available and field-restricted tool records to `catalog/retired/`, retaining their assessments and historical evidence. Remove their install recipes, skills, fixture dependencies and active tool recommendations. Historical discussion, citations and technique vocabulary may still name them when they are not presented as usable VCR tools. Supersede ADR 0005's catalogue-inclusion rule and its acceptance of source-available or size-limited terms; retain its separate attention to model, asset, service, distribution and output rights.

## Consequences

- Easier: tool search, setup and examples have one consistent licence boundary; candidates with restrictive terms stay outside the routable catalogue.
- Harder: existing workflows using non-free software must migrate to free alternatives, and uncertain licences can delay intake.
- Must now do: retire the existing non-free records, migrate GSAP-dependent capture fixtures to Web Animations API, update generated catalogue/plugin output, and audit future candidates against this rule.

## Revisit when

The owner explicitly changes VCR's free-software scope. A proprietary product may not be reintroduced as a routable tool by a local exception; it requires a superseding decision.
