---
id: ADR-0011
title: Inspiration is a workspace library, separate from assets
status: accepted
date: "2026-11-21"
---

# 0011. Inspiration is a workspace library, separate from assets

## Context

A user cannot hand VCR reference material. Colours are pasted into a brief by hand, saved posts and posters sit in a folder the agent has to be told about, and nothing records what each item is for or what the user likes in it. Both technique-layer builds (#183, 2026-11-20) had only a text brief to aim at and came out competent and plain.

Reference material is mostly third-party media: screenshots, posters, clips, typefaces. The user holds it to look at, not to publish. The pillars already ask for the line to be kept ("distinguish inspiration from permission to reuse"), and the open asset-manifest rule (`references/README.md`, shared concerns; PRD Layer 1) needs that line drawn before it can be written. PRD §7 keeps large media out of git behind an asset-store interface whose first backend is a Layer 1 choice, and ADR 0003 makes the harness read-only and shared, so neither git history nor the plugin may hold a user's files.

## Options considered

1. **Commit the files.** The simplest thing to clone, but third-party media enters git history for good, where it cannot be withdrawn, and the repository grows with every poster.
2. **Link to files where they are, without copying.** No duplication, but a record breaks when the user tidies a folder, and a hash cannot be re-checked against a file that has moved.
3. **Scope the library to a project or a video.** Matches how a brief is scoped, but taste is shared across a workspace: the same poster informs several videos, and it would be added, annotated and stored once for each.
4. **Fold it into the Layer 7 `reference` records.** One store, but those records describe VCR's own examples and reusable parts (`catalog/schemas/reference.schema.json`); a user's saved poster has none of their fields and a different owner.
5. **Wait for the full Layer 1 asset store.** Avoids constraining that design, and leaves the next production with a text brief again.
6. **A workspace library: a committed record per item, the file copied into an ignored folder.**

## Decision

Option 6. A workspace has one inspiration library. Each item is one committed record under `inspiration/items/`, and its file, when it has one, is copied into the git-ignored `inspiration/files/` and identified by its content hash. Intake takes local files only: a source address is recorded as text and nothing is fetched. Projects and videos cite the items they draw on by id; they do not hold copies. Every item declares `use: inspiration | asset`, defaulting to `inspiration`. Only an asset may appear in output, and only when its record carries rights evidence; an inspiration item informs a treatment and is never placed in a frame. No agent infers permission to reuse from an item's presence in the library. Whatever is measured about an item at intake is measured with free software already in the catalogue (ADR 0009), and how a record keeps what was said, measured and judged apart is ADR 0012.

## Consequences

- **Easier:** an agent choosing a treatment has something to read besides the brief; the asset-manifest rule has its inspiration and asset line and a place for rights evidence; third-party media has one known location that `vcr storage` can report.
- **Harder:** a fresh clone has the records and not the files, so every reader must treat an absent file as normal and say so; the copy doubles disk use for the user's originals; the ignored folder is not regenerable, so storage must never offer to clear it.
- **Must now do:** have `vcr validate` reject an asset without rights evidence and a file whose hash no longer matches its record, and warn on an absent file; keep `inspiration/files/` ignored in every workspace VCR creates; treat this library as the first slice of the Layer 1 asset store, so that design extends it or records why it replaces it; keep production names and imagery out of this repository when trialling it.

## Revisit when

The Layer 1 asset store is designed and its backend does not fit record-plus-ignored-copy; or a second machine or collaborator needs the files and cannot get them; or users ask for the same item across workspaces often enough that a machine-level library is the simpler home.
