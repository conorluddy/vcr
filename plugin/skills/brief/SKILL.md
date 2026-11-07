---
name: brief
description: Interview the person for a VCR video's brief before anything is built, offer two or three concept routes, and write the brief files every reviewer judges against. Use when the user wants a new video, episode or series in a VCR workspace, says "brief", or hands over loose notes for a video; also when `vcr validate` reports a stale or invalid brief. Not for reviewing a render (use the findings and reviewer agents) or choosing a toolkit (use start).
---

# brief: what this video must do, before it is built

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

A brief holds decisions, not descriptions. Every reviewer judges a render against it, so a field that changes no decision does not belong in it. Two files, one per level:

| File | Holds | Schema |
| --- | --- | --- |
| `projects/<project>/brief.json` | The series or project brief: intent, tone, mandatories, tokens, deliverables, evaluation, priorities. Tokens live in `projects/<project>/brand/`. | `catalog/schemas/series-brief.schema.json` (BRIEF §12.1) |
| `projects/<project>/videos/<video>/brief.md` | The video brief: front matter plus five sections. It narrows the series brief and never contradicts it. | `catalog/schemas/video-brief.schema.json` |

A one-off video may have only `brief.md`. A series, or any project with more than one video, gets `brief.json` first.

## Steps

1. **Orient.** Run `vcr status --brief`. Run `vcr video init <project>/<video>`; it is safe to re-run. If `projects/<project>/brief.json` exists, read it and treat its contents as settled: the interview covers only what this video adds or narrows. Read the person's notes, attachments and any earlier briefs before asking anything.
2. **Interview for the decision fields only** (`vcr refs section series-brief 1.2`). Ask two or three questions at a time, fill in what the notes already answer, and confirm rather than re-ask. In order:
   - **Objective**: exactly one, with its kind and a success measure (`BRIEF-OBJECTIVE-SINGLE`, `BRIEF-OBJECTIVE-MEASURE`).
   - **Audience and viewing context**: a portrait beyond demographics, and the watch mode, muted-first, sound-on or mixed (`BRIEF-AUDIENCE-SPECIFIC`).
   - **Proposition**: one sentence, no "and" joining two benefits, plus any approved paraphrases and where it must appear (`BRIEF-PROPOSITION-SINGLE`, `STORY-SMP`).
   - **Proof points**: at most three.
   - **Tone**: two or three adjectives. See step 3.
   - **Mandatories**: each with its source and the rule that checks it, or "judgement" (`BRIEF-MANDATORY-SOURCED`). They constrain ends, not means (`BRIEF-NO-PRESCRIBE`): "the logo holds at rest at the end" is a mandatory, but "use a slide-in" is not.
   - **Deliverables**: aspect, width, height, fps, codec, duration.
   - **Evaluation**: the two to four questions a reviewer will ask, each tied to a brief path (`BRIEF-EVAL-CRITERIA`).
   - **Priorities**: what wins when two of these conflict (`BRIEF-PRIORITY-APPLIED`).

   Research only what can change a decision. For unfamiliar subjects use `DOMAIN-*`; for formal references use `VREF-*`; for audience meanings use `CULTURE-*`; for imagery selection use `IMAGE-*`. Assign relevant mandatories/preferences to consumers `domain-exploration`, `visual-research`, `cultural-context` or `image-direction`. Keep source observations and hypotheses in workspace research notes; copy selected decisions into the brief with their evidence links. If an answer is vague ("make it pop"), ask what it should cause in the viewer, and record that.
3. **Turn each tone adjective into parameters** (`BRIEF-ADJECTIVE-OPERATIONALISED`; method in `vcr refs section series-brief 4.2`). For each adjective, write what it means here, what it does not mean, and at least one parameter per affected pillar. A parameter is a token reference (`{motion.easing.entrance}`) or a rule ID with the brief's value. Find the rule with `vcr rules list --pillar <motion|art|typography|sound>`, then `vcr rules info <ID>`. Never copy a threshold into the brief; cite the rule and the value this brief chooses. When two adjectives pull against each other ("calm" and "bold"), record which pillar carries which ("bold type, calm motion").
4. **Category conventions: fit or break, on purpose.** Name the two or three conventions the category usually follows (the usual opening, palette or rhythm) and ask the person whether this video fits or breaks each. Never apply a genre preset, and never default to the category median (STORY §1.1, "category wallpaper"). A break goes in the series brief's `ruleBreaks` with why, its scope, a success condition and who approved it (`BRIEF-RULEBREAK-DECLARED`).
5. **Offer two or three routes** as route cards (`vcr refs section story 1.3`; `STORY-ROUTE-CARD`, `STORY-ROUTE-DISTINCT`). Each route is a different idea or mechanism, not a different styling, and passes the three-slot sentence (`STORY-ONE-IDEA`, `STORY-MECHANISM`). Present them side by side, ordered, with your recommendation stated. Never pad one strong route with strawmen. Describe each key frame in words; a style frame is rendered only after the person chooses.
6. **Write the files.**
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
7. **Validate.** Run `vcr validate` and fix every error before showing the brief. A warning that the video cites an older series version means the brief must be re-read and re-confirmed.
8. **Confirm before rendering** (AG-04). Show the person the brief: the proposition, the tone parameters, the chosen route and the deliverables. Ask them to confirm or change it. Only after an explicit yes, add `confirmed: <YYYY-MM-DD>` to the front matter. Do not build or render anything before then.
9. **Offer the beat sheet.** Once the brief is confirmed, offer to draft `beats.json` beside `brief.md` from the route's beat outline (`vcr refs section story 4.2` for the beat record; schema `catalog/schemas/beat-sheet.schema.json`). Run `vcr validate`, then `vcr plan check --video <project>/<video>` and fix every blocker and major before building. `vcr plan markers` gives the scene its `window.__scene.markers`.

## Rules

- One objective, one proposition. If the person gives two, ask which one wins, or propose two videos.
- The brief states values, and pillar rules own the checks. Cite rule IDs and never restate their thresholds.
- Keep the brief to what reviewers judge against. Put notes, history and inspiration in the person's own documents.
- Never invent a mandatory, a claim or a source. Ask, or leave it out and say so.
- A video brief never contradicts its series brief. If the video needs something the series forbids, change the series brief first (a new version, with the person's approval), or record a declared break.
- Never write a real client, brand or product name into the harness. Briefs live in the workspace.
