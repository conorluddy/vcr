# Roadmap

What to build next, in order, and why. Status per layer lives in [README.md](README.md); requirement IDs live in the PRDs; this file only sequences the work. Update it when an item lands or the order changes.

Updated 2026-11-06.

## Where we are

- **Layer 0 and plugin P0 and P1 are done.** The catalogue, the CLI and the plugin are installable on Claude Code and Codex.
- **Typography has the whole pillar pipeline:** `rules.json`, `vcr lint`, the `typography` skill and the `typographer` agent.
- **Twelve reference pillars exist in `references/`:** typography, art, motion, pacing, sound, accessibility, series brief, critique, story, delivery, adaptation and data visualisation. [ADR 0006](decisions/0006-creative-pillars-independent-of-tools.md) fixes how they turn into tools, and `references/README.md` holds the rule owners. Image treatment (`FX-`), lighting (`LIGHT-`) and materials (`MAT-`) are being researched.

## Sequencing principle

Build whatever unlocks the most later work first. Deterministic checks come before judgement, and every heuristic stays advisory until it is calibrated.

| Stage | Why it comes here |
| --- | --- |
| Ways in | Skills and agents cannot cite rules that agents cannot reach. |
| Contracts | Every check writes a finding, reads a brief and measures a scene, so those three shapes must exist first. |
| Deterministic checks | These have exact standards and catch the most damaging failures cheaply. |
| Measurement and data | These unlock about half the motion, pacing and data rules. |
| Judgement | Reviewer agents are only as good as the measurements they run first. |

## Now

1. **Land the round-three knowledge bases** (`FX-`, `LIGHT-`, `MAT-`) on the local docs branch as they arrive, then open one PR.
2. **Ways in, done:**
   - #139 / #159: `references/INDEX.md`, `vcr rules info|list` and `vcr refs list|section`;
   - #140 / #156: the plugin ships every pillar's references.
3. **Small fixes:**
   - #151 / #158, done: the typographer's text size, plus its trial;
   - #154: lint in the example's next steps is done (#157). The Codex run of `vcr lint` still needs a Codex session.

## Next: contracts

4. **Plugin P2, the contract** (`vcr-plugin-prd.md` §8): finding files, the render manifest subset, approvals, `vcr status`, `vcr findings` and `vcr brief`. Every pillar check writes the §6.4 finding, and the delivery manifest extends the render manifest, so this comes before the checks. Do it together with:
   - #141: the series brief schema and the `briefing` skill (the P2 `brief` slice, and the front door for users without a brief).
5. **#143: scene contract decisions.** Should `regions(t)` replace or extend `textBounds()`? Plus named markers, the `params` echo and the data block. Settle these on paper; each check implements the fields it needs.
6. **#142: the beat sheet schema and `vcr plan check`.** Plan checks before rendering, with beats exported to `markers` and `sound_cues` to #60.

## Then: deterministic checks, each writing findings

7. **#144: the delivery `ffprobe` gate.** Cheap, and catches rejected uploads and washed-out colour.
8. **#145: the flash analyser.** The only failure that can harm a viewer. It reports only until it matches a reference tool.
9. **#146: one determinism check** for picture and sound.
10. **#63: frame selection for agents and the contact sheet.** Dedup, settle frames, native text crops and a phone-size view.

## Later: measurement, data and judgement

11. **#147: `vcr motion sample`**, the time series behind the motion, pacing and data checks.
12. **#148: per-pillar `rules.json`.** Rename the draft IDs and leave out the dropped rules. Delivery and accessibility go first, because their checks land first.
13. **#149: workflow skills and reviewer agents** for motion, art and pacing, plus a plan reviewer for story. Tool recipes from the knowledge bases move to the matching toolkit guides.
14. **#150: a calibration gold set** of 20–30 human-reviewed renders. It decides which heuristics may gate.
15. **Plugin P3 and P4:** review pages and the review loop, where humans see all of the above.

## Parked

- **Capability graph** (#65). CG0 kept the current workflow; #74 and #76 continue on tool records, and the rest waits for its reopen conditions.
- **Layer 1 onwards** (workspace, timeline, compositor) beyond the P2 and brief slices above. These open with their own spikes, per `README.md`.
- **Research not yet commissioned:** category conventions and differentiation, which would feed `briefing`. Commission it when #141 starts.

## Known bugs to fix in passing

- #52: `beginframe` hangs on a 1080 × 1920 DOM scene.
- #53: capture has no timeout or progress output.
- #49: `workspace init` writes ignore rules that are not anchored.
- #50: no CLI for `projects`.
