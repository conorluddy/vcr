# 0002. Headless first; read-only visualisers, no editor

Date: 2026-10-26
Status: accepted

## Context

The PRD lists a graphical nonlinear editor and replacing native authoring applications as non-goals (§1, §4), and plans a review surface in Layer 6: contact sheets, marker captures, comparisons and findings that resolve to a scene, frame and render revision. Once a timeline resolver exists the question of an interactive timeline UI will recur every session.

The founding purpose of the repository is a thoroughly documented tool suite that agents discover through progressive disclosure. The agent is the editor; the human is the reviewer.

## Options considered

1. **Headless with read-only visualisers.** CLI and files are the source of truth. Visual output is generated: a resolved-timeline strip (SVG or HTML), contact sheets, and a review page where findings become structured records. Cheap, no state synchronisation.
2. **Scrubbable preview that seeks live browser scenes.** Useful, but a real application with its own state, and it is what HyperFrames Studio already is.
3. **Full editor on Konva or Theatre.js.** Months of work that competes with the catalogue, the engine and real productions for attention.

## Decision

Option 1 through M3 at least. Every visual surface VCR produces is generated from files and is read-only; the only input it accepts is a review finding. No interactive timeline, no drag-and-drop, no in-browser editing of scene source.

## Consequences

- `vcr timeline resolve` will emit a visual strip alongside its JSON when the resolver lands.
- Layer 6 review is a generated page per render with frame thumbnails and a findings form, nothing more.
- Konva, Theatre.js and HyperFrames stay catalogued as editor foundations should the decision change.

## Revisit when

After several real productions, the agent-edits-files loop is measurably the bottleneck rather than rendering or content, or a review round regularly needs more than a frame reference and a sentence to communicate a change.
