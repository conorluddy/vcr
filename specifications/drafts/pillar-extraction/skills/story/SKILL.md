---
name: story
description: Develop a selected brief into a concept, script, beat plan and boards for production. Use for narrative structure and buildable plans, not for commissioning a brief or polishing the timing and motion of a finished edit.
---

# Story

Draft, advisory and uncalibrated. Links are deployment-relative: they target the final `skills/story/SKILL.md` location.

Look up applicable rule definitions in the referenced section or canonical rules data before applying a limit; never use thresholds from memory. Read one section at a time and preserve provisional status.

Use the selected workspace brief, relevant research, sourced claims, delivery constraints and existing series decisions. The brief owns the proposition and mandatories (`BRIEF-PROPOSITION-SINGLE`, `BRIEF-MANDATORY-PASS`); surface unresolved conflicts before inventing decisions. Where a route is still open, develop distinct mechanisms and compare their fit, feasibility and misreading risks for the human to choose.

Scale development to the request: revise an affected beat or script passage in context when possible; develop the whole plan when the selected route needs it. Turn the selected route into an ear-and-eye script, then the existing `beats.json`: each beat should communicate purpose, what must be shown, copy, timing and relevant transitions, mandatories and claims as supported by the schema. Map claims to sources (`STORY-CLAIM-SOURCE`). Board meaningful moments at the intended aspects, with beat links and fixed versus discretionary choices. Use an appropriately scoped animatic or blocking pass when timing or staging needs evidence; it does not establish final motion or look.

When feedback says the story is “unclear” or “does not land”, trace the intended proposition through the script, beat and board at the affected moment. Compare what the audience can see or hear with the claim and intended turn; revise the missing link and check downstream beats rather than assuming the timing is at fault.

Read only the needed route in [story](../../references/story/README.md): §1–2 for routes and mechanism, §3–5 for script, beats and boards, §6 for animatics and blocking, §13 and §18 for creation. `STORY-ONE-IDEA`, `STORY-MECHANISM`, `STORY-BEAT-FIELDS` and `STORY-BOARD-COVERAGE` address plan quality. Pacing owns beat timing, typography reading holds, and data visualisation fidelity to source.

Inside this repository `vcr` means `pnpm vcr`; in an installed plugin it means `node <plugin-root>/cli/vcr.mjs`, with the plugin root two directories above this skill. Use `vcr plan check --video <project>/<video>` for its implemented subset and `vcr plan markers --video <project>/<video>` for marker handoff. Findings are printed, not filed; plan approvals are not implemented. Manually inspect claim coverage, visual logic, mute legibility and loop intent as applicable; report gaps and uncertainty. Keep the script, beat plan, boards and evidence in the selected workspace and hand their locations and affected beats to pacing and the relevant craft workflows, with decisions reserved for the human.
