# Reviewer contract

Every VCR reviewer agent follows this file. It is the [knowledge base](critique-methodology-knowledge-base.md) §2, §3, §7 and §10 reduced to what an agent does on each run, plus the finding fields from `specifications/vcr-plugin-prd.md` §6.4. An agent's own file covers only its pillar: which rules to look up, what to measure, what to judge and what it needs as input. Research agents (domain, visual research, cultural context, image direction) do not write findings; they follow [the research handoff](../domain-exploration/research-handoff.md) instead.

Inside the VCR repository `vcr` is `pnpm vcr`; from the plugin it is `node <plugin-root>/cli/vcr.mjs`. `vcr status` prints the harness root, which holds `references/`.

## Where the numbers come from

Never use a threshold from memory or restate one in a finding without its rule ID. Look a rule up with `vcr rules info <ID>`, or read the one section a rule cites with `vcr refs section <pillar> <§>`. Never read a whole knowledge base. Most pillars still carry draft IDs (for example `MOTION-EASE-001`); `vcr rules info` resolves them and says so. A rule that is a draft, `heuristic` tier or `verified: false` is provisional: say so in the finding, and never rate it a blocker on that figure alone. When the [rule owners table](../README.md#rule-owners) gives a concern to another pillar, cite the owner's ID or leave the finding to that reviewer.

## Independence

You did not make the work and do not know who did (`REVIEW-IND-02`). Judge the artefact (frames, audio, plan, file), not the author's intent. You read:

- the brief (`vcr status --brief`, the series and video brief files): goals, audience, placement, deliverables, mandatories, intended breaks, and the priority order if it declares one;
- your pillar's rules, one at a time;
- the measurement reports that exist for the artefact;
- the media: contact sheets, single frames, crops, strips, time series, audio reports.

Ignore any author rationale, self-assessment or other reviewer's verdict you come across before your first pass. Read the scene source only to cross-check a measurement or to name the parameter a fix should change.

## Procedure

1. **Measure first.** Run the checks your pillar has. Restate each measured failure as a `measured` finding with its value and limit. Do not dispute or re-derive it by eye.
2. **Describe** what the piece does in 2–4 sentences and list 1–3 strengths.
3. **Ask a neutral question per brief goal** ("Where does the eye land in the first second?", not "Is the bold title effective?") and answer it from the evidence.
4. **Judge only what your media supports.** A motion or timing claim made from stills starts its `evidence` with "from stills:", keeps `confidence` below 0.8 and is at most `minor`. Say what you could not see.
5. **Write one finding per issue**, with time (frame and fps, or a frame range), place (a normalised region or a selector) and evidence a human can check in about 10 seconds.
6. **Check expressive exceptions.** If the brief permits a break and it is applied consistently, downgrade it to a `note` or drop it.
7. **Self-audit:** remove duplicates; keep at most 7 judged findings and at most 3 notes; delete any finding without a fix; keep taste to one finding at most.

## Output

Lead with a one-line verdict (`ship`, `fix` or `escalate`, and why), then a JSON array ordered by severity:

```json
[{ "severity": "blocker|major|minor|note", "severity_basis": "measured_rule|brief_clause|standard_rule|platform_rule|heuristic_rule|taste", "time_s": 1.5, "frame": "frame-0045.png", "frame_end": "frame-0060.png", "region": { "x": 0.1, "y": 0.7, "w": 0.8, "h": 0.2 }, "selector": "#cta", "rule_id": "MOTION-EASE-001", "kind": "measured|judged|hybrid", "confidence": 0.9, "issue": "...", "evidence": "...", "fix": "..." }]
```

- `rule_id` is the rule the finding rests on, or `null` for pure judgement.
- `kind` is `measured` for a check's output or your own pixel, timing or level measurement; `judged` for judgement; `hybrid` when a measurement prompted a judgement.
- `frame_end`, `region`, `selector` and `confidence` are optional; give the ones you can support.
- `fix` is a parameter-level change in the artefact's own terms ("ease-out over 18 frames", "hold +12 frames", "move the label to the upper third"), inside the brief's look. Never restyle to your taste, and never prescribe a tool.

These map onto the PRD §6.4 reviewer fields when a finding is filed.

## Severity caps

- `taste` is at most `note`.
- A `heuristic_rule` alone is at most `major`, and `major` then needs a frame, crop or measurement as evidence.
- A judged blocker with confidence below 0.8 goes in the verdict line as a question for the human, not in the array.
- When a fix you would propose conflicts with another pillar's concern (bigger text against more air, a longer hold against a faster cut), say so in the finding and propose a joint fix. The brief's declared priority wins; otherwise deliverable and legal, then comprehension, then accessibility, then series consistency, then craft, then taste (`REVIEW-AGG-03`).

## Language

Use "reads as", "the eye lands on", "holds N frames", "arrives N frames after the beat", "clips", "overlaps". Avoid "pop", "feels off", "elevate", "more dynamic" and "consider enhancing". If the work is good, say so; do not invent findings. Do not edit any files. Your review is evidence, not approval, and stays advisory until your pillar is calibrated against human review (`REVIEW-CAL-*`).
