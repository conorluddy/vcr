---
name: brief
description: Interview the person for a VCR video's brief before anything is built, offer distinct concept routes, and write the brief files every reviewer judges against. Use when the user wants a new video, episode or series in a VCR workspace, says "brief", or hands over loose notes for a video; also when `vcr validate` reports a stale or invalid brief. Not for reviewing a render (use the findings and reviewer agents) or choosing a toolkit (use start).
---

# brief: what this video must do, before it is built

> Unpublished proposed replacement; advisory and uncalibrated. Links target the intended final location `skills/brief/SKILL.md` and resolve after relocation.

Before applying a limit, look up the applicable rule or its referenced section; do not copy thresholds from this draft.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

A brief holds decisions, not descriptions. Every reviewer judges a render against it, so a field that changes no decision does not belong in it. Two files, one per level:

| File | Holds | Schema |
| --- | --- | --- |
| `projects/<project>/brief.json` | The series or project brief: intent, tone, mandatories, tokens, deliverables, evaluation, priorities. Tokens live in `projects/<project>/brand/`. | `catalog/schemas/series-brief.schema.json` (BRIEF §12.1) |
| `projects/<project>/videos/<video>/brief.md` | The video brief: front matter plus five sections. It narrows the series brief and never contradicts it. | `catalog/schemas/video-brief.schema.json` |

A one-off video may have only `brief.md`. A series, or any project with more than one video, gets `brief.json` first.

## Steps

1. **Orient.** Run `vcr status --brief`. Run `vcr video init <project>/<video>`; it is safe to re-run. If `projects/<project>/brief.json` exists, read it and treat its contents as settled: the interview covers only what this video adds or narrows. Read the person's notes, attachments and any earlier briefs before asking anything.
2. **Interview for the decision fields only** (`vcr refs section series-brief 1.2`). Ask a manageable group of questions at a time, fill in what the notes already answer, and confirm rather than re-ask. In order:
   - **Objective**: exactly one, with its kind and a success measure (`BRIEF-OBJECTIVE-SINGLE`, `BRIEF-OBJECTIVE-MEASURE`).
   - **Audience and viewing context**: a portrait beyond demographics, and the watch mode, muted-first, sound-on or mixed (`BRIEF-AUDIENCE-SPECIFIC`).
   - **Proposition**: one sentence, no "and" joining two benefits, plus any approved paraphrases and where it must appear (`BRIEF-PROPOSITION-SINGLE`).
   - **Proof points**: select those that support the proposition; consult the applicable story rules.
   - **Tone**: choose decision-useful adjectives. See step 3.
   - **Mandatories**: each with its source and the rule that checks it, or "judgement" (`BRIEF-MANDATORY-SOURCED`). They constrain ends, not means (`BRIEF-NO-PRESCRIBE`): "the logo holds at rest at the end" is a mandatory, but "use a slide-in" is not.
   - **Deliverables**: aspect, width, height, fps, codec, duration.
   - **Evaluation**: the decision-useful questions a reviewer will ask, each tied to a brief path (`BRIEF-EVAL-CRITERIA`).
   - **Priorities**: what wins when two of these conflict (`BRIEF-PRIORITY-APPLIED`).

   Research only what can change a decision. Explicitly commission the existing specialist for the unresolved question: `domain-researcher` for subject evidence, `visual-researcher` for formal precedent, `cultural-reader` for scoped audience readings, or `image-director` for imagery selection once a concept and composition slot exist. Pass the decision, scope, relevant prior records, budget and stop condition; specify whether workspace notes are requested. Give the cultural reader the named audience and markets. Researchers return evidence and alternatives, not a creative verdict; keep observations and hypotheses in workspace notes and record the selected decision and evidence links in the brief. Assign relevant mandatories/preferences to the corresponding research consumers. Read [research handoff](../../references/domain-exploration/research-handoff.md) for existing record fields; no research-pack schema or approval exists. If an answer is vague, ask what it should cause in the viewer and what evidence would distinguish success; record the decision and remaining uncertainty.
3. **Turn each tone adjective into parameters** (`BRIEF-ADJECTIVE-OPERATIONALISED`; method in `vcr refs section series-brief 4.2`). For each adjective, write what it means here, what it does not mean, and at least one parameter per affected pillar. A parameter is a token reference (`{motion.easing.entrance}`) or a rule ID with the brief's value. Find the rule with `vcr rules list --pillar <motion|art|typography|sound>`, then `vcr rules info <ID>`. Never copy a threshold into the brief; cite the rule and the value this brief chooses. When two adjectives pull against each other ("calm" and "bold"), record which pillar carries which ("bold type, calm motion").
4. **Series continuity.** For a series, distinguish fixed recognisers from allowed variation, its bounds and forbidden combinations (`BRIEF-VARIABLE-RANGE`). Consult the existing continuity notes when selecting this video's values, record what was used and explain repetition where appropriate (`PACE-SERIES-*`; hook rotation belongs to `STORY-SERIES-REPEAT`). Record meaningful rule-breaks with scope, rationale and success condition (`BRIEF-RULEBREAK-DECLARED`). Use [series brief routing](../../references/series-brief/README.md), §5–6, for this decision; preserve unsupported typed details as workspace notes rather than inventing schema fields. When the series changes, identify affected videos and re-read and re-confirm their briefs against the new version.
5. **Category conventions: fit or break, on purpose.** Name the relevant conventions the category usually follows (the usual opening, palette or rhythm) and ask the person whether this video fits or breaks each. Never apply a genre preset, and never default to the category median (STORY §1.1, "category wallpaper"). A break goes in the series brief's `ruleBreaks` with why, its scope, a success condition and who approved it (`BRIEF-RULEBREAK-DECLARED`).
6. **Offer distinct routes** as route cards (`vcr refs section story 1.3`; `STORY-ROUTE-CARD`, `STORY-ROUTE-DISTINCT`). Each route is a different idea or mechanism, not a different styling, and passes the three-slot sentence (`STORY-ONE-IDEA`, `STORY-MECHANISM`). Present them side by side, ordered, with your recommendation stated. Never pad one strong route with strawmen. Describe each key frame in words; a style frame is rendered only after the person chooses. The brief selects the route; hand the chosen route to story to develop the script, narrative order and buildable plan.
7. **Write the files.**
   - `brief.json`, when the project needs one or the interview changed it. Bump `version` (semver) on every change.
   - `brief.md`, in this shape:

     ```markdown
     ---
     video_id: <project>/<video>
     series_brief: <series id>@<version>     # omit for a one-off video
     deliverables: [1080x1920@30]            # <width>x<height>@<fps>; each one a series deliverable
     flash_profile: broadcast                # optional: wcag, broadcast or strict; never looser than the series
     route: <chosen route name>
     ---

     ## Objective
     ## Audience and placement
     ## Content
     ## Constraints
     ## Review notes
     ```

     *Content* holds the proposition, proof points and chosen route's beat outline. *Constraints* holds this video's mandatories and any declared breaks. *Review notes* holds the evaluation questions and what the person wants to see first.
8. **Validate.** Run `vcr validate` and fix every error before showing the brief. A warning that the video cites an older series version means the brief must be re-read and re-confirmed.
9. **Confirm before rendering** (AG-04). Show the person the brief: the proposition, the tone parameters, the chosen route and the deliverables. Ask them to confirm or change it. Only after an explicit yes, add `confirmed: <YYYY-MM-DD>` to the front matter. Do not build or render anything before then.
10. **Offer the beat sheet.** Once the brief is confirmed, offer to draft `beats.json` beside `brief.md` from the route's beat outline (`vcr refs section story 4.2` for the beat record; schema `catalog/schemas/beat-sheet.schema.json`). Run `vcr validate`, then `vcr plan check --video <project>/<video>` and surface findings and conflicts for a human decision; advisory plan findings do not constitute an approval gate. `vcr plan markers` gives the scene its `window.__scene.markers`.

## Rules

- One objective, one proposition. If the person gives two, ask which one wins, or propose two videos.
- The brief states values, and pillar rules own the checks. Cite rule IDs and never restate their thresholds.
- Keep the brief to what reviewers judge against. Put notes, history and inspiration in the person's own documents.
- Never invent a mandatory, a claim or a source. Ask, or leave it out and say so.
- A video brief never contradicts its series brief. If the video needs something the series forbids, change the series brief first (a new version, with the person's approval), or record a declared break.
- Never write a real client, brand or product name into the harness. Briefs live in the workspace.
