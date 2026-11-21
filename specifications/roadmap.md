# Roadmap

What to build next, in order, and why. Status per layer lives in [README.md](README.md); requirement IDs live in the PRDs; this file only sequences the work. Update it when an item lands or the order changes.

Updated 2026-11-21.

## Where we are

- Advisory making workflows now ship for the craft pillars, with revised brief/typography workflows, a CLI-only review workflow and a draft accessibility reviewer (ADR 0008). Measurement and calibration work remains; this does not complete plugin P3/P4.

- **Layer 0 and plugin P0, P1 and P2 are done.** The catalogue, the CLI and the plugin are installable on Claude Code and Codex. P2 (#161, #163–#169) added the review contract: render manifests from `vcr capture --video`, one file per finding (`vcr findings`), human-only approvals at a terminal (`vcr review`), `vcr status --brief`, the series and video briefs with the `brief` skill, and `vcr storage`. `vcr lint --video` is the first check that writes findings.
- **Typography has the whole pillar pipeline:** `rules.json`, `vcr lint`, the `typography` skill and the `typographer` agent.
- **Draft agents exist for every other pillar except delivery:** they run ahead of their checks, follow `references/critique-methodology/reviewer-contract.md`, and are advisory and uncalibrated.
- **Nineteen reference pillars exist in `references/`:** typography, art, motion, pacing, sound, accessibility, series brief, critique, story, delivery, adaptation, data visualisation, image treatment, lighting, materials, domain exploration, visual research, cultural context and image direction. [ADR 0006](decisions/0006-creative-pillars-independent-of-tools.md) fixes how they turn into tools, [ADR 0007](decisions/0007-draft-pillar-agents-before-rules-data.md) lets advisory agents run ahead of their data, and `references/README.md` holds the rule owners.

## Sequencing principle

Build whatever unlocks the most later work first. Deterministic checks come before judgement, and every heuristic stays advisory until it is calibrated.

| Stage | Why it comes here |
| --- | --- |
| Ways in | Skills and agents cannot cite rules that agents cannot reach. |
| Contracts | Every check writes a finding, reads a brief and measures a scene, so those three shapes must exist first. |
| Deterministic checks | These have exact standards and catch the most damaging failures cheaply. |
| Measurement and data | These unlock about half the motion, pacing and data rules. |
| Judgement | Reviewer agents are only as good as the measurements they run first. |

## Now: real-production workflow evidence

The scene contract (#143), beat sheet and plan checks (#142), and advisory workflow extraction (#179–#180) have shipped. Continue from the [pillar workflow handoff](handoffs/pillar-workflow-publication.md).

Use the live skills on two or three real renders in a user-selected production workspace. Record where workflows or reviewers are wrong, silent or difficult to use; link focused follow-ups to production field notes. Synthetic cases in `specifications/drafts/pillar-extraction/evaluation/` support scoped workflow decisions, not production performance or calibration. Keep production-specific material outside this repository.

**Alongside:** #144 remains the next engineering implementation, followed by #146 and #145. #173 (plan approvals) would let plan findings be filed rather than printed. Sound-cue export still waits for #60.

## Next major: look frames (stills before motion)

A step skipped on the way to video. Most of what makes a piece look good is settled in one frame: palette, type, composition, texture. A frame costs seconds to render and review; a scene costs minutes. Both technique-layer builds (#183, 2026-11-20) went straight to motion and came out competent but plain, with nothing approved to aim at.

Give stills first-class treatment inside a video project, not as a separate project type:

- **Look frames:** one or a few scenes captured at a single time, kept with the video so the approved frame becomes the starting point of the motion scene and is not thrown away. `vcr preview --at` and `vcr lint` already render and check single frames.
- **Variants side by side:** render three or four candidate looks on one sheet, each naming the techniques it uses (`vcr techniques`) and, once intake exists, the inspiration it draws on.
- **A recorded choice:** which variant was picked, by whom and why, so later scenes and reviewers can be held to it. Approval stays human, as for renders.
- **Out of scope here:** standalone still deliverables (posters, store screenshots), which wait for a production that needs one.

Open before building: where look frames live in the video directory, whether a choice reuses the approval contract or gets its own record, and how a look frame relates to `beats.json`. Inspiration intake is planned separately and comes first, since a look frame needs something to be judged against. [ADR 0014](decisions/0014-look-approved-in-stills-before-motion.md) proposes the look-frames decision and lists these questions as open. Intake is decided in [ADR 0011](decisions/0011-inspiration-workspace-library.md), [0012](decisions/0012-stated-measured-judged-kept-apart.md) and [0013](decisions/0013-models-chosen-per-agent-in-workspace.md); it is built end to end (records, validation, `vcr inspiration`, the `inspiration` skill, the draft `inspiration-analyst` agent, workspace `models`) and awaits a production trial.

## Production usability runway

[Field notes #183](https://github.com/conorluddy/vcr/issues/183) collect the installed-plugin pilot evidence. Work in small independently verified slices:

Asset/readiness diagnostics and capture review-summary refresh now ship. Capture and lint name the serving root, failed resource/status and page errors on readiness failure. Retained captures refresh generated review summaries, preserving pre-existing drift with a warning. #51 shared-root configuration remains a separate slice.

3. **#63: previews and contact sheets.** Browser scenes now support selected timestamps, named markers and neighboring frames before full capture. MP4 sampling and retained revision comparison remain open.
4. **#184: validate and explain social safe-zone geometry.** Retain evidence and uncertainty before changing presets; show an overlay from shared data.
5. **#186: selected-video dependency readiness.** Check the actual package root without reopening the parked capability graph.
6. **#187: separate capture and verification timings.** Coordinate progress with #53; preserve verification coverage semantics.

Each fix links its PR and verification back to #183. Re-run a fresh-workspace fixture with a shared font, nested package and short scene; compare time to first useful inspected frame, missing-asset diagnosis and full-render count. #144 remains the parallel next engineering implementation; this runway adds no new renderer, editor or calibrated gate.

## Next: deterministic checks, each writing findings

3. **#144: the delivery `ffprobe` gate** (S). Cheap, and catches rejected uploads and washed-out colour.
4. **#146: one determinism rule** (S). Picture already has `vcr capture --verify`; this names the rule, writes `--verify` results as findings, adds a tolerance for GPU paths, and covers sound after #60.
5. **#145: the flash analyser** (M). The only failure that can harm a viewer. It reports only until it matches a reference tool.
6. **A `MAT-*` scene-data validator over `.glb`** (S): albedo ranges, texture colour spaces, normal convention, ORM packing. It needs no render.
7. **#63: frame selection and the contact sheet.** Dedup, settle frames, native-resolution text crops and a phone-size view. It fills each retained revision's evidence frames, and P3 and every reviewer agent need it.

## Then: review pages, measurement and judgement

8. **Plugin P3 review pages** (Videos, Render, the note form, Decide, Storage), then **P4, the loop** (extend the shipped CLI-only `review` skill with session-start hooks, evidence pairs and Compare). By then the pages show real findings from real checks.
9. **#147: `vcr motion sample`** (L), after #143. It unlocks most of the motion, pacing and data checks.
10. **#148: per-pillar `rules.json`.** Rename the draft IDs and leave out the dropped rules, in the order checks land: delivery, accessibility, motion, pacing, story, brief, sound, materials, lighting, FX, art, adaptation, data, critique.
11. **#149: strengthen workflow skills and calibrate reviewers**, one pillar at a time as data and checks land. Advisory making workflows already ship under ADR 0008; draft reviewers exist except for delivery. Improve them from production evidence, migrate renamed rule citations together, and keep tool recipes in toolkit guides. Publication does not make reviewers calibrated or permit heuristic gates.
12. **#150: a calibration gold set** of 20–30 human-reviewed renders. Only after it may a heuristic gate anything.
13. **Plugin P5, share:** static bundle, proxy and comment import.
14. **PRD layers**, each opened by its own spike: L1 workspace (asset store and manifest, one provenance rule for music, HDRIs, textures and fonts), L2 timeline (named markers from #143), L5 production delivery (fed by `DELIVERY-*`), L3 compositor (fed by `FX-*`, `LIGHT-*`, `MAT-*`), then L4 advanced motion and L7 reference corpus.

**Fix in passing:** #154 (a Codex run of `vcr lint`), #52 and #53 (one per-frame watchdog: the `beginframe` hang and the silent capture death), #51 (expose `--root` on `vcr capture`), #49 (anchor the ignore rules: `/output/`), #50 (no CLI for `projects`).

## Parked

- **Capability graph** (#65). CG0 kept the current workflow; #74 and #76 continue on tool records, and the rest waits for its reopen conditions.
- **Category conventions and differentiation research:** commission when the existing `brief` workflow needs more than fit-or-break.

## Technique-to-tool discovery

The foundation ships under [ADR 0010](decisions/0010-technique-mapping-layer.md) (#212): hand-curated records in `catalog/techniques/`, link checks in `vcr validate`, `vcr techniques list|info [--full]` and the generated `catalog/TECHNIQUES.md`. A record holds links only; a route's evidence class, tool validation and machine readiness are derived when it is read. The capability graph (#65) stays parked.

What remains, in order:

1. **Production trial** on two or three real treatment decisions, recorded in #183: whether a less obvious treatment surfaced, whether evidence class and readiness were accurate, where vocabulary or filters failed, and bytes loaded per tier. Fixes follow in one PR.
2. **More fixtures**, so common routes move from `documented` to `retained-fixture`. Most seed routes have none.
3. **Toolkit guides cite pillar rule IDs** for the techniques they can execute, so a route's last hop lands on a recipe.
4. **Previews** (stills or short loops per technique). The plugin ships no media (PL-04), so this needs a distribution decision first.
