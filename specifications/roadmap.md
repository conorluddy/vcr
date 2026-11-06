# Roadmap

What to build next, in order, and why. Status per layer lives in [README.md](README.md); requirement IDs live in the PRDs; this file only sequences the work. Update it when an item lands or the order changes.

Updated 2026-11-06.

## Where we are

- **Layer 0 and plugin P0, P1 and P2 are done.** The catalogue, the CLI and the plugin are installable on Claude Code and Codex. P2 (#161, #163–#169) added the review contract: render manifests from `vcr capture --video`, one file per finding (`vcr findings`), human-only approvals at a terminal (`vcr review`), `vcr status --brief`, the series and video briefs with the `brief` skill, and `vcr storage`. `vcr lint --video` is the first check that writes findings.
- **Typography has the whole pillar pipeline:** `rules.json`, `vcr lint`, the `typography` skill and the `typographer` agent.
- **Fifteen reference pillars exist in `references/`:** typography, art, motion, pacing, sound, accessibility, series brief, critique, story, delivery, adaptation, data visualisation, image treatment, lighting and materials. [ADR 0006](decisions/0006-creative-pillars-independent-of-tools.md) fixes how they turn into tools, and `references/README.md` holds the rule owners.

## Sequencing principle

Build whatever unlocks the most later work first. Deterministic checks come before judgement, and every heuristic stays advisory until it is calibrated.

| Stage | Why it comes here |
| --- | --- |
| Ways in | Skills and agents cannot cite rules that agents cannot reach. |
| Contracts | Every check writes a finding, reads a brief and measures a scene, so those three shapes must exist first. |
| Deterministic checks | These have exact standards and catch the most damaging failures cheaply. |
| Measurement and data | These unlock about half the motion, pacing and data rules. |
| Judgement | Reviewer agents are only as good as the measurements they run first. |

## Now: the rest of the contracts

1. ~~#143: scene contract decisions~~ — done: `regions(t)` beside `textBounds()`, named markers, `params`, `data` and `fx` blocks, `MAT-PHYSICAL-SCOPE` in glTF extras.
2. **#142: the beat sheet schema and `vcr plan check`.** Plan checks before rendering, with beats exported to markers and `sound_cues` to #60.

## Next: deterministic checks, each writing findings

3. **#144: the delivery `ffprobe` gate** (S). Cheap, and catches rejected uploads and washed-out colour.
4. **#146: one determinism check** for picture and sound (S). It reuses the manifest's `frame_sha256`.
5. **#145: the flash analyser** (M). The only failure that can harm a viewer. It reports only until it matches a reference tool.
6. **A `MAT-*` scene-data validator over `.glb`** (S): albedo ranges, texture colour spaces, normal convention, ORM packing. It needs no render.
7. **#63: frame selection and the contact sheet.** Dedup, settle frames, native-resolution text crops and a phone-size view. It fills each retained revision's evidence frames, and P3 and every reviewer agent need it.

## Then: review pages, measurement and judgement

8. **Plugin P3 review pages** (Videos, Render, the note form, Decide, Storage), then **P4, the loop** (the `review` skill, session-start hooks, evidence pairs, Compare). By then the pages show real findings from real checks.
9. **#147: `vcr motion sample`** (L), after #143. It unlocks most of the motion, pacing and data checks.
10. **#148: per-pillar `rules.json`.** Rename the draft IDs and leave out the dropped rules, in the order checks land: delivery, accessibility, motion, pacing, story, brief, sound, materials, lighting, FX, art, adaptation, data, critique.
11. **#149: workflow skills and reviewer agents**, one pillar at a time, each after its checks: a plan reviewer for story first, then motion, art and pacing. Tool recipes move from the knowledge bases to toolkit guides.
12. **#150: a calibration gold set** of 20–30 human-reviewed renders. Only after it may a heuristic gate anything.
13. **Plugin P5, share:** static bundle, proxy and comment import.
14. **PRD layers**, each opened by its own spike: L1 workspace (asset store and manifest, one provenance rule for music, HDRIs, textures and fonts), L2 timeline (named markers from #143), L5 production delivery (fed by `DELIVERY-*`), L3 compositor (fed by `FX-*`, `LIGHT-*`, `MAT-*`), then L4 advanced motion and L7 reference corpus.

**Fix in passing:** #154 (a Codex run of `vcr lint`), #52 (`beginframe` hang on a 1080 × 1920 DOM scene), #53 (capture timeout and progress), #49 (anchor the ignore rules: `/output/`).

## Parked

- **Capability graph** (#65). CG0 kept the current workflow; #74 and #76 continue on tool records, and the rest waits for its reopen conditions.
- **Research on category conventions**, commissioned when the `brief` skill needs more than fit-or-break.
- **Research not yet commissioned:** category conventions and differentiation, which would feed `briefing`. Commission it when #141 starts.

## Known bugs to fix in passing

- #52: `beginframe` hangs on a 1080 × 1920 DOM scene.
- #53: capture has no timeout or progress output.
- #49: `workspace init` writes ignore rules that are not anchored.
- #50: no CLI for `projects`.
