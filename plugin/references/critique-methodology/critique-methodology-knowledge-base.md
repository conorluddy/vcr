# Creative Critique Methodology and AI Reviewers (`REVIEW-*`)

A VCR reviewer should be a separate, blinded model. It runs deterministic measurements first, then judges against a fixed rubric (comparing or ranking rather than scoring), and reports located, evidence-backed findings on a 0–4 severity scale. It should be trusted only as far as a small, regularly re-run gold set against the human director shows.

> **Status.** Scope: human critique practice; severity; findings format; combining reviewers; how reliable LLM/VLM judges are; calibration; independence; measurement vs judgement. Researched 2026-11-06. **Tiers:** `standard` = published standard, checked against the primary source; `platform` = vendor or platform documentation, may change without notice; `heuristic` = rule of thumb, research-derived default, or secondary source. Almost every rule here is `heuristic`: critique method has no ISO-style standard. **⚑18mo** = first published before May 2025. Evidence labels: **[audience]** = what people actually do or perceive; **[expert]** = practitioner doctrine; **[model]** = measured AI-judge behaviour.

## TL;DR

- **Measure first, then judge, and keep the two apart.** VLM judges do reasonably well at choosing between two options, worse at absolute scores, and collapse on fine-grained motion. In MLLM-as-a-Judge (Chen et al., ICML 2024 ⚑18mo), GPT-4V matched human pair choices at 0.773 without ties.\[1\] NextMotionQA (June 2026) found κ = 0.70 on coarse motion criteria but κ = 0.10 on part-level judgement.\[2\]
- **The reviewer must not be the author, and should not know who the author is.** LLM judges favour their own outputs and outputs from similar models (Panickssery et al., 2024 ⚑18mo; Goel et al., 2025 ⚑18mo).\[3\] Their feedback turns more positive when the user claims authorship (Sharma et al., 2023 ⚑18mo).\[4\] Blinded evaluation removes most self-preference (arXiv 2608.18091, 2026).\[5\]
- **Findings are structured, located, cited objects, and trust is earned by calibration.** Use Nielsen's 0–4 severity scale adapted for creative work. Cap taste at severity 1. Calibrate on 20–30 renders using weighted κ (Landis & Koch bands) or Krippendorff's α (0.667 tentative, 0.800 reliable). Even for humans, Nielsen says a single evaluator's severity ratings are too unreliable to trust.

## Key findings

1. **Severity combines several factors, and one rater is not enough.** Nielsen's 0–4 scale combines frequency, impact, persistence and market impact. Severity ratings "from a single evaluator are too unreliable to be trusted"; the mean of three evaluators is good enough for practical use (NN/g, 1994 ⚑18mo; fetched). [expert]\[6\]
2. **Helpful critique is specific, actionable and justified, with some positive tone.** Yuan et al. (CSCW 2016 ⚑18mo) found highly rated critiques were conceptual, specific, actionable and positive, and that expert critiques gave clearer justifications.\[7\] Krause et al.'s critique style guide (CHI 2017 ⚑18mo) significantly raised the perceived helpfulness of revised feedback (Study 1: 52 students, 176 providers; Study 2: n = 50).\[8\] [audience: perceived helpfulness]
3. **How you ask changes what you get.** Critiquing your own design, offering variants to compare, and signalling newbie status drew more actionable or justified feedback. These strategies appeared in only 6%, 22% and 11% of requests (Cheng et al., CSCW 2020 ⚑18mo).\[9\] [audience]
4. **LLM judges can match human–human agreement on pairwise text preference, but they have biases.** GPT-4 reached "over 80% agreement"; without ties, GPT-4–human agreement was 85%, above the 81% between humans. Position, verbosity and self-enhancement biases were documented, and swapping answer order helps (Zheng et al., June 2023 ⚑18mo). [model]
5. **Multimodal judges can rank but cannot score.** GPT-4V reached 0.636 pair agreement with ties and 0.773 without. Scoring and batch ranking diverged from human judgement, with egocentric, position and length biases (Chen et al., Feb 2024 ⚑18mo).\[10\] A 2026 re-analysis reports 32–34% exact agreement on a 5-point scale (arXiv 2604.25235, under review).\[11\] [model]
6. **VLMs are weak judges of graphic-design aesthetics.** AesEval-Bench (An et al., March 2026, ICLR 2026) covers 4 dimensions, 12 indicators and 3 tasks. It found "clear performance gaps", with limited benefit from reasoning. [model]\[12\]
7. **Judging motion from sampled frames is the weakest area.** Agreement falls from κ = 0.70 on coarse criteria to κ = 0.10 on fine ones (NextMotionQA, 2026).\[2\] VLMs miscount repetitions (PushupBench, April 2026). Existing motion metrics do not fully match human perception (VMBench, ICCV 2025).\[13\] [model]
8. **Self-preference is real, and blinding removes most of it.** Self-recognition and self-preference correlate linearly (Panickssery, Bowman & Feng, NeurIPS 2024 ⚑18mo).\[14\] Judges favour models similar to themselves, and errors correlate more as capability rises (Goel et al., ICML 2025 ⚑18mo).\[15\] In a 2026 study, self-preference "largely disappears" under blind evaluation once quality is controlled (arXiv 2608.18091).\[5\] [model]
9. **Sycophancy skews feedback once preference or authorship is revealed.** Feedback became more positive when the user said they liked or wrote the text, with the text itself unchanged (Sharma et al., Oct 2023, ICLR 2024 ⚑18mo).\[4\] [model]
10. **AI help raises individual quality but narrows collective variety.** Stories written with AI ideas were rated more creative but were more similar to each other, with a 10.7% increase in similarity for writers given one AI idea vs none (Doshi & Hauser, Science Advances, 12 July 2024 ⚑18mo; figure via ScienceDaily). A reviewer that steers every render towards its own idea of "good" risks a monoculture across a series. [audience]

---

## 1. Human critique practice

| Format | Mechanic | What VCR borrows | Source |
|---|---|---|---|
| **Liz Lerman's Critical Response Process** | Roles: artist, responders, facilitator. Steps: (1) Statements of Meaning; (2) Artist as Questioner; (3) Neutral Questions; (4) Permissioned Opinions. Negative opinions are held back until later steps.\[16\]\[17\] | Describe before judging. The brief's questions set the focus. Questions are neutral. Opinions are opt-in and labelled. | lizlerman.com one-pager (2020); Lerman & Borstel, *Critique Is Creative* (2022). [expert] |
| **Pixar Braintrust** | Peers give candid notes on rough cuts. The group "has no authority", so the director need not follow its suggestions.\[18\] | The reviewer **advises; the director decides**. Notes target the work, not the maker. | Catmull & Wallace, *Creativity, Inc.* (2014), via secondary summaries. [expert] |
| **"Plussing"** | Commonly described as criticism that must come with a constructive addition. | Every negative finding carries a `suggested_fix`. | **Not found** in a primary source; folklore-grade, `heuristic`. |
| **"I like / I wish / what if"** | Strength, gap, possibility. | Envelope holds strengths, findings and optional explorations. | Origin **not traced**; `heuristic`. |
| **Design / art-school crit; agency CD notes** | Work shown against stated goals. The CD weighs strategy, brand, craft and deadline, then decides. | Review against the brief, not the reviewer's taste. The human arbitrates conflicts (§4). | Practitioner practice, not separately sourced. [expert] |

**Evidence on useful feedback.** Feedback is rated most helpful when it is specific, actionable and justified, with a positive tone (Yuan 2016; Krause 2017). Novices given rubrics also produced helpful feedback.\[7\]\[8\] Krause's definition of actionability (the share of directive or suggestive sentences versus purely descriptive ones) can be used as a lint.\[19\] **Limit:** this evidence measures *perceived helpfulness*, not whether the creative work improved.

**Human failure modes that AI copies:**
- Taste presented as a defect. Guard: REVIEW-SEV-03.
- Vague reactions ("make it pop", "consider enhancing visual impact"). Guard: REVIEW-FMT-03.
- Prescriptive restyling towards the reviewer's default. Guard: REVIEW-HOM-01.
- Anchoring on the author's pitch. Guard: REVIEW-IND-02.
- Pile-ons that repeat one note. Guard: REVIEW-AGG-01.

## 2. Severity and prioritisation

**Base scale.** Nielsen (NN/g 1994 ⚑18mo; fetched) runs 0 = not a problem, 1 = cosmetic, 2 = minor (low priority), 3 = major (high priority), and 4 = catastrophe, "imperative to fix this before product can be released".\[6\] His factors map onto VCR as follows:
- **Frequency:** frames, shots or episodes affected. A bug in a shared template ranks high.
- **Impact:** blocks meaning vs polish.
- **Persistence:** a 2-frame glitch vs a whole shot.
- **Market impact:** brand, legal or platform consequences.

| Sev | Label | Creative definition | Ships? |
|---|---|---|---|
| 4 | blocker | Missing or unreadable must-include, clipped text, legal/disclaimer failure, wrong codec or aspect, audio clipping, broken loop seam on a loop deliverable, required accessibility failure | No |
| 3 | major | Hierarchy confusion, key beat missed, text on screen too briefly for the placement, series-look inconsistency | Only with director sign-off |
| 2 | minor | Noticeable craft flaw (timing mush, uneven margins, mechanical easing) | Yes, logged |
| 1 | cosmetic / taste | Preference or polish with no brief anchor | Yes |
| 0 | note | Observation, strength, or not a problem | — |

**Blocker vs taste.** The severity ceiling depends on what the finding is anchored to:
1. A measured rule failure: the rule's own mapping applies.
2. An explicit brief clause: up to 4.
3. A `standard` or `platform` rule: up to 4.
4. A `heuristic` rule only: up to 3, and 3 requires an artifact.
5. Nothing but the reviewer's sense of quality: **taste**, capped at 1, phrased as a permissioned opinion.

**Comparable scales:**
- **axe-core** impact is one of "minor, moderate, serious, or critical", and a rule reports the highest impact among its failed checks (Deque docs; `platform`).\[20\] VCR maps these to 1–4 and adopts the "highest wins" roll-up.
- **Single rater vs several:** Nielsen (CHI '92) reports the mean rating of four evaluators lands within half a rating point of true severity 95% of the time; the matching 55% figure for a single rater comes only from a secondary source (J. Biomed. Inform.) and is unverified.
- **MLLM vs expert severity:** MLLM severity was on average within one level of experts on Nielsen heuristics (arXiv 2508.16165, Aug 2025).\[21\] A Dec 2025 study used weighted κ and concluded model ratings should guide, not replace, experts (arXiv 2512.04262).\[22\] [model]

## 3. Findings format

**Tool precedent (`platform`).** Frame.io V4 (Adobe docs, Sept 2026) supports:
- single-frame comments at a timecode;\[23\]
- range comments that "extend the range of the comment at any two timecode locations";\[23\]
- anchored pins, plus annotations (arrow, line, box, freehand);\[23\]
- internal vs public comments, replies, and up to 6 attachments;\[23\]\[24\]
- "Mark As Complete";\[24\]
- export as CSV, XML, plain text or FIOJSON, and to editing apps as markers.\[24\]\[25\]

Frame.io's search and filter skip replies, so VCR stores the verdict on the finding itself.\[24\]

**Requirements for a finding (`REVIEW-FMT-*`):**
- one issue per finding;
- time (frames and fps) plus space (normalised box or selector);
- evidence a human can check in about 10 seconds;
- the rule ID;
- severity and its basis;
- a parameter-level fix;
- confidence and its basis;
- `kind` = measured | judged | hybrid.

### Proposed shared findings schema (JSON Schema sketch)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "vcr://schemas/review-finding.v1.json",
  "type": "object",
  "required": ["id","pillar","rule_id","kind","severity","location","issue","evidence","suggested_fix","confidence","reviewer","status"],
  "properties": {
    "id": {"type":"string","description":"hash of pillar+rule_id+location bucket"},
    "pillar": {"enum":["typography","motion","pacing","art","sound","accessibility","delivery","brief"]},
    "rule_id": {"type":"string","pattern":"^[A-Z]+-[A-Z0-9-]+$"},
    "kind": {"enum":["measured","judged","hybrid"]},
    "severity": {"type":"object","required":["level","label","basis"],"properties":{
      "level":{"type":"integer","minimum":0,"maximum":4},
      "label":{"enum":["note","cosmetic","minor","major","blocker"]},
      "basis":{"enum":["measured_rule","brief_clause","standard_rule","platform_rule","heuristic_rule","taste"]},
      "brief_clause":{"type":"string"},"frequency":{"type":"string"},"persistence_s":{"type":"number"}}},
    "location": {"type":"object","required":["fps"],"properties":{
      "fps":{"enum":[24,25,30,60]},"frame_start":{"type":"integer"},"frame_end":{"type":"integer"},
      "region":{"type":"object","properties":{"x":{"type":"number"},"y":{"type":"number"},"w":{"type":"number"},"h":{"type":"number"},"space":{"enum":["normalized","px"]}}},
      "selector":{"type":"string"},"audio":{"type":"object","properties":{"track":{"type":"string"},"cue":{"type":"string"}}},
      "deliverable":{"type":"string"}}},
    "issue": {"type":"string","maxLength":280},
    "evidence": {"type":"object","properties":{"metric":{"type":"string"},"value":{},"threshold":{},
      "artifacts":{"type":"array","items":{"type":"string"}},"observation":{"type":"string"}}},
    "suggested_fix": {"type":"string","maxLength":400},
    "fix_scope": {"enum":["parameter","element","timing","layout","asset","concept"]},
    "confidence": {"type":"object","required":["value","basis"],"properties":{
      "value":{"type":"number","minimum":0,"maximum":1},
      "basis":{"enum":["deterministic","multi_sample_agreement","single_judgement","inferred_from_stills"]}}},
    "expressive_exception": {"type":"object","properties":{"brief_permits_break":{"type":"boolean"},"note":{"type":"string"}}},
    "duplicates": {"type":"array","items":{"type":"string"}},
    "conflicts_with": {"type":"array","items":{"type":"string"}},
    "reviewer": {"type":"object","required":["agent","model"],"properties":{"agent":{"type":"string"},"model":{"type":"string"},"prompt_hash":{"type":"string"},"rules_version":{"type":"string"}}},
    "status": {"enum":["open","accepted","rejected","fixed","wontfix","escalated"]},
    "human_verdict": {"type":"object","properties":{"by":{"type":"string"},"agree":{"type":"boolean"},
      "severity_override":{"type":"integer","minimum":0,"maximum":4},
      "reason":{"enum":["true_positive","false_positive","taste_disagreement","intended_break","duplicate","wrong_location","wrong_severity"]},
      "at":{"type":"string","format":"date-time"}}}
  }
}
```

**Envelope:** `{render_id, brief_hash, deliverables[], measurements_report, strengths[1–3], findings[], summary{blockers,majors,minors}, verdict: ship|fix|escalate}`.

**Example finding:**

```json
{"pillar":"typography","rule_id":"TYPO-OVERFLOW-01","kind":"measured",
 "severity":{"level":4,"label":"blocker","basis":"measured_rule"},
 "location":{"fps":30,"frame_start":84,"frame_end":131,"selector":"#cta"},
 "issue":"CTA clips at right edge for 48 frames.",
 "evidence":{"metric":"textBounds.right-box.right","value":"+37px","threshold":"<=0","artifacts":["crops/f0096_cta.png"]},
 "suggested_fix":"Reduce #cta 72px→64px or allow 2-line wrap.","confidence":{"value":1.0,"basis":"deterministic"},
 "reviewer":{"agent":"vcr-lint","model":"n/a"},"status":"open"}
```

## 4. Combining several reviewers

**Deduplication.** Two findings are duplicates when they share a rule family, their frame ranges overlap with IoU ≥ 0.5, and their regions overlap with IoU ≥ 0.3 or share a selector. These cut-offs are a VCR proposal. Keep the highest-severity finding, record the others in `duplicates`, and prefer a measured finding over a judged one.
- **Roll-up:** highest severity wins (the axe-core pattern).
- **Averaging:** Nielsen's averaging applies only to *judged* severities from independent raters. A measured blocker is never averaged down.

**Conflicts.** Typical clashes: typography wants bigger text while art wants more air; motion wants a longer hold while pacing wants a faster cut. Priority order (a heuristic modelled on how a creative director weighs things):
1. Deliverable and legal requirements.
2. Comprehension at the target placement, including muted viewing.
3. Accessibility required by the brief or a standard.
4. Series and brand consistency.
5. Craft.
6. Taste.

Record `conflicts_with`. Propose a joint fix that satisfies both ("hold the end card +12 frames *and* cut the copy to one line"), or escalate.

**Escalate to the human** when any of the following holds:
- a judged blocker has confidence < 0.8;
- two specialists conflict at severity ≥ 3;
- the issue is a likely intentional break and the brief is silent;
- repeated runs produce different blocker sets;
- the reviewer is uncalibrated for this deliverable type;
- a severity ≥ 3 motion claim rests only on stills.

**Juries.** Verga et al. (arXiv 2404.18796, April 2024 ⚑18mo) found a panel of smaller judges drawn from disjoint model families showed "less intra-model bias" than a single large judge, at over seven times less cost. But capable models make increasingly correlated errors (Goel 2025), so a jury of similar models is less independent than it looks.\[26\] Mix families and report how often jurors agree.

## 5. AI and LLM/VLM reviewers: the evidence

| Bias | Finding (date) | VCR mitigation |
|---|---|---|
| Position | Most judges favour the first position; under the default prompt, first-position bias was Claude-v1 75.0%, GPT-3.5 50.0%, GPT-4 30.0% (Zheng, June 2023 ⚑18mo) | Run both orders; keep only consistent verdicts |
| Verbosity / length | Favour for longer answers; GPT-4V and Gemini favour longer responses (Zheng 2023; Chen 2024 ⚑18mo)\[10\]\[27\] | Cap output; never judge explanations |
| Self-preference | Linear link to self-recognition (Panickssery, April 2024 ⚑18mo)\[14\] | Reviewer ≠ author; hide authorship |
| Similarity | Judges favour similar models; correlated errors (Goel, Feb 2025 ⚑18mo)\[28\] | Different model family where possible |
| Labels | Self- and other-labels both bias judges; blinding removes most self-preference (arXiv 2608.18091, Aug 2026)\[5\] | Strip authorship metadata |
| Sycophancy | Feedback tracks the user's stated liking or authorship (Sharma, Oct 2023 ⚑18mo)\[29\] | Never say "I made this" or "the director loves it" |
| Task sensitivity | Large variability across 20 datasets and 11 LLMs; validate against humans per task (Bavaresco, ACL 2025; arXiv June 2024 ⚑18mo)\[30\] | Calibrate per pillar × deliverable |
| Run-to-run variance | Treated as a reliability problem in 2026 work (arXiv 2606.13685)\[31\] | Repeat blocker judgements ≥ 3 times; take the majority |

Traced to the primary (Zheng et al. 2023 ⚑18mo): under the default prompt Claude-v1 favoured the first position 75.0% of the time; GPT-4 favoured itself with a 10% higher win rate and Claude-v1 with 25%; and the 65.0%→77.5% consistency gain for GPT-4 came from a few-shot judge, not from position swapping (a 2025 secondary, arXiv 2511.04133, misattributes it).

**Images, layout, typography and design:**
- **Pairwise beats absolute scoring** (Chen 2024). The 2026 re-analysis reports 32–34% exact agreement on 1–5 scales.\[11\]
- **Design aesthetics:** AesEval-Bench (2026) found clear gaps, and reasoning helped little.\[12\] Don't assume chain-of-thought fixes aesthetic judgement.
- **Layout:** AesthetiQ (CVPR 2025) adopted VILA-7B as a judge after a user study found 78.8% agreement with human aesthetic preference.\[32\] One study, pairwise only.
- **UI fidelity:** UI2Code^N (Nov 2025) found the VLM judge exactly reproduced the human ranking of systems, but with more conservative margins.\[33\] This is model-level agreement, not item-level.
- **Expert-equivalence test:** "AI Judges in Design" (April 2025 ⚑18mo) counts a judge as expert-level if it is within 20% of expert–expert agreement.\[34\] A useful method for VCR calibration.
- **Text:** deterministic OCR-based text metrics beat a VLM baseline on human alignment (VISTAR, Aug 2025).\[35\] A purpose-built model beat VLM judges on perceptual text quality (TIQA, March 2026).\[36\] A 32B VLM auditor reached 75% accuracy on 200 samples, with most errors from being too strict (VISTA-Bench, Feb 2026).\[37\] A practitioner blog (secondary) says frontier VLMs are "terrible at detecting font".\[38\] **So measure glyphs, clipping and spelling; let the VLM judge only hierarchy and tone.**
- **3D/graphics editing:** in BlenderGym (CVPR 2025, via a secondary summary), the best VLM verifier reached 0.66 alignment vs 0.79 between humans, and some verifiers showed second-position bias.\[39\]

**Video and motion from sampled frames:**
- **Coarse vs fine:** κ = 0.70 vs 0.10 (NextMotionQA, 2026).\[2\] "Does the logo end centred?" is fair game; "is the overshoot too springy?" is not.
- **Frame budgets per question:** WorldJen (May 2026) uses 16 uniform frames for consistency questions and every 5th frame, up to 60, for smoothness and flicker.\[40\] PushupBench samples at 5 fps with a 112-frame cap, and notes a 100-frame API limit for one vendor's models.\[41\]
- **Counting:** measure periodicity; don't ask the VLM (PushupBench).
- **Motion metrics:** perception-aligned metrics improved Spearman correlation by an average of 35.3% over baselines (VMBench, ICCV 2025).\[13\] Even deterministic motion metrics need validating against people.
- **Agent failure mode:** a VLM looking at a contact sheet will confidently describe easing and sync it cannot see. Give it per-frame transform series from `seek(t)` plus beat `markers`, and tag stills-only claims `inferred_from_stills` (REVIEW-MOT-01).

**Homogenisation:**
- **Evidence:** Doshi & Hauser (2024) and Goel (2025) both suggest model-steered review drifts towards one "safe" style. [audience + model]\[42\]
- **How it shows in VCR:** centred type, the same ease-out, notes that always say "more contrast, more whitespace".
- **Guards:**
  - taste capped at severity 1 (SEV-03);
  - fixes stay inside the brief's look (HOM-01);
  - declared intended breaks are respected (HOM-02);
  - stylistic spread is monitored across a series (HOM-03, an unvalidated proxy).

## 6. Calibration

**Statistics:**
- **Cohen's κ.** Landis & Koch bands, as reproduced by AHRQ on NCBI (fetched): <0 poor; 0.0–0.20 slight; 0.21–0.40 fair; 0.41–0.60 moderate; 0.61–0.80 substantial; 0.81–1.0 almost perfect.\[43\] The bands are a convention, "by no means universally accepted" (Analyse-it).\[44\] Use weighted κ for ordinal severity.
- **Krippendorff's α.** "customary to require α ≥ .800", with .667 as the lowest limit for tentative conclusions (2004, p. 241, via a secondary source).\[45\]
- **Also report:** finding precision and recall, blocker-level κ, order-swap consistency, and run-to-run stability.
- **Small n:** with 20–30 renders, bootstrap the confidence intervals and decide on the **lower bound**.

**Gold set.** This design is a VCR proposal: 24 renders (range 20–30).
- **Mix:** 8 clean; 8 with seeded defects (clipped text, off-beat cut, loop seam, audio clipping, low-contrast caption, platform-UI overlap); 8 contentious or expressive.
- **Coverage:** every aspect ratio in use and at least two looks.
- **Labelling:** the director labels **blind** first, then gives a verdict on each AI finding.
- **Ceiling:** 5 renders are re-labelled after a week or more. The director's self-consistency is the ceiling the AI is measured against.

**FP/FN tracking.**
- A false positive is a verdict reason of false_positive, taste_disagreement, intended_break or wrong_location.
- A false negative is a director issue that no AI finding matches.
- Keep a per-rule ledger. Rules with a false-positive rate > 30% over the last 20 verdicts are demoted to advisory (VCR proposal).
- Re-run the gold set whenever the model, prompt, rules or sampling changes.

| Trust level | Entry (CI lower bound) | Powers |
|---|---|---|
| T0 Advisory | default | Shown only |
| T1 Filing | precision ≥ 0.70; blocker κ ≥ 0.41 | Auto-file sev ≤ 2 |
| T2 Gating | blocker κ ≥ 0.61 and within 0.1 of director self-consistency; seeded recall ≥ 0.9; swap/rerun consistency ≥ 0.9 | Judged blockers hold a render for sign-off |
| Never | — | Judged findings never auto-reject; only measured blockers auto-fail |

**Calibration protocol (one person, about one day):**
1. Assemble the 24 renders. Freeze the model, prompt hash, rules version and sampling.
2. Director pass, blind, about 5–10 minutes per render: verdict, issues, severity, location.
3. Run each AI reviewer 3 times per render. Run pairwise questions in both orders.
4. Match findings using the duplicate key. The director gives a verdict on unmatched AI findings.
5. Compute blocker κ, weighted κ or ordinal α, precision and recall, per-rule FP/FN, and consistency, with bootstrap CIs.
6. Re-label 5 renders after a week.
7. Assign a trust level per pillar × deliverable. Log it, dated, in the ledger.
8. Fix one rule at a time and re-run. Keep 6 renders held out from tuning to catch overfitting.

## 7. Independence

**Why the reviewer must not be the author:**
- Self-preference (Panickssery 2024).
- Similarity bias (Goel 2025).\[46\]
- Intrinsic self-correction does not reliably fix reasoning and can degrade it (Huang et al., ICLR 2024 ⚑18mo).\[47\] A 2026 practitioner note claims frontier reasoning models now self-correct well; this is unverified.\[48\]

**What the reviewer receives:**
- the brief: goals, audience, placement, deliverables, must-includes, intended breaks;
- the slice of rules for its pillar;
- the measurement report;
- frames, strips and time series;
- audio reports.

**What it does not receive:**
- the author's rationale or self-assessment;
- authorship labels;
- other reviewers' verdicts before its own first pass.

Ask CRP-style neutral questions ("Where does the eye go in 0–1 s?"), not leading ones ("Is the bold title effective?").

## 8. Measurement vs judgement

| Property | Measure | Judge |
|---|---|---|
| Clipping, overflow, safe zones, text duration | ✔ `vcr lint`, `textBounds()`, visibility series | ✘ |
| Copy matches brief | ✔ string compare / OCR | Tone only |
| Loop seam | ✔ diff of frame N vs frame 0 | Does it *feel* seamless |
| Timing vs beats | ✔ `markers` vs event times | Is the sync intentional |
| Audio peaks, loudness | ✔ decoded-audio analysis | Mix taste |
| Text contrast | ✔ pixel sampling | — |
| Hierarchy, composition | partial | ✔ pairwise |
| Easing feel | partial (velocity curves) | ✔ with series, low confidence |
| Tone, originality | ✘ | ✔ capped unless anchored in the brief |

**Presentation for the human, in this order:**
1. A verdict line with counts by severity.
2. Measured failures, sorted by severity then time.
3. Judged findings, each with crop, timecode and confidence.
4. 1–3 strengths.
5. Escalations, each phrased as a question.

Use `HH:MM:SS:FF` at the render fps plus the frame index. Export as NLE markers or Frame.io-style CSV.

## 9. Medium-specific guidance

- **9:16 social (1080×1920):** first-second hook, muted comprehension, platform-UI overlap, legibility at phone scale. Review at phone display scale and crop small text for the VLM, which can miss it in downscaled frames.
- **16:9:** lower-thirds, hierarchy across a wide frame. Don't flag empty space as wrong; negative space may be the point.
- **Square:** reframing crops of heads and logos. Check that a fix for one aspect ratio doesn't break another.
- **Stills:** composition, type and colour, with no motion pillar. VLMs are relatively better here than on motion but still weak (AesEval-Bench).\[12\] Prefer pairwise comparison against a previous version.
- **Loops:** measure seam difference and velocity continuity. Watch the loop twice.
- **Series:** consistency with the shared look is not the same as sameness. Apply REVIEW-HOM-03.

## 10. The analysis/critique process

1. **Load the context:** brief, rules slice, measurement report. No author rationale.
2. **Convert every measured failure** into a `measured` finding. Don't re-argue it.
3. **Observe** in 2–4 sentences, then list 1–3 strengths (CRP step 1).
4. **Ask a neutral question** for each brief goal and answer it from evidence.
5. **Judge within the pillar**, pairwise where possible, in both orders.
6. **Write findings** using the §2 severity procedure.
7. **Check expressive exceptions.** Is the break permitted by the brief, applied consistently, and serving a stated goal? If so, downgrade it to a note.
8. **Self-audit:**
   - deduplicate;
   - keep ≤ 7 judged findings;
   - delete any finding without a fix;
   - down-tag motion claims made from stills;
   - keep taste at ≤ 1.
9. **Emit** the JSON envelope.

**Vocabulary:**
- *Use:* "reads as", "the eye lands on", "holds N frames", "arrives Nf after the beat", "clips", "overlaps".
- *Fixes:* "ease-out over 18f", "64px", "hold +12f", "−3 dB under VO".
- *Avoid:* "pop", "feels off", "elevate", "more dynamic", "consider enhancing".

### Reviewer prompt skeleton

```
ROLE: You are the {PILLAR} reviewer for VCR. You advise; the human director decides.
You did not make this work and do not know who did.
INPUTS: BRIEF {goals, audience, placement, deliverables, intended_breaks}; RULES {slice};
MEASUREMENTS {report: ground truth}; MEDIA {contact sheets, dense strips, crops, time series, audio};
SAMPLING NOTE {fps, frames shown, what you cannot see}.
PROCEDURE:
1. Restate measured failures as kind=measured findings. Do not dispute them.
2. Describe what the piece does (2-4 sentences). List 1-3 strengths.
3. For each brief goal, ask a neutral question; answer from evidence.
4. Judge only what your media supports. Motion from stills -> basis=inferred_from_stills, severity<=2.
5. Per issue: one finding; frames + region/selector; evidence; rule_id; severity:
   measured/brief/standard/platform <=4; heuristic <=3 with artifact; taste <=1.
6. Every finding needs a parameter-level fix inside the brief's look. Do not restyle to your taste.
7. If the brief permits a break and it is applied consistently, downgrade or drop.
8. Self-audit: dedupe; <=7 judged findings; delete fixless findings.
9. Judged blocker with confidence<0.8, or conflict with brief intent -> status=escalated + question.
OUTPUT: JSON per vcr://schemas/review-finding.v1.json in the review envelope. No prose outside JSON.
```

## 11. The creation process

1. **Brief intake:** goal, audience, placement (muted or sound-led), deliverables, must-includes, series look, **declared intended breaks**, success criteria.
2. **State the review questions up front.** This is CRP's artist-as-questioner move, and it improves the feedback you get (Cheng 2020).
3. **Render 2–3 variants** of key moments so review can be pairwise.
4. **Build measurement hooks:** `__scene`, `markers`, `textBounds()`, stable IDs.
5. **Self-check deterministically only.** Don't self-judge taste.
6. **Hand a blinded packet** to independent reviewers.
7. **Triage:** fix measured blockers, weigh judged findings, and record a verdict reason on every finding.
8. **Re-render, re-measure, and re-review** the changed spans across all deliverables. Then ship or escalate.

## 12. Authoritative sources and canon

- **Severity:** Nielsen (1994).
- **Structured critique:** Lerman & Borstel (2022).
- **Candid notes without authority:** Catmull & Wallace (2014).
- **What makes feedback helpful:** Yuan (2016), Krause (2017), Cheng (2020).
- **The LLM-as-judge founding paper:** Zheng (2023).
- **Multimodal judging:** Chen (ICML 2024).
- **Bias mechanics:** Panickssery (2024), Goel (2025), Sharma (2023), Huang (2024).
- **Validate per task:** Bavaresco (ACL 2025).
- **Design aesthetics:** AesEval-Bench (2026).
- **Motion and sampling:** NextMotionQA, VMBench, WorldJen, PushupBench.
- **Homogenisation:** Doshi & Hauser (2024).
- **Agreement statistics:** Landis & Koch (1977); Krippendorff (2004).
- **Platform structures:** Frame.io V4 and axe-core documentation.

## 13. Rules table

M = measurable; J = judgement only.

| ID | Check | Threshold | Tier | Applies to |
|---|---|---|---|---|
| REVIEW-FMT-01 | Finding is schema-valid | 100% valid (M: JSON Schema) | heuristic | All, universal |
| REVIEW-FMT-02 | Located in time and space | frames + fps; region or selector for visual pillars (M) | heuristic | All |
| REVIEW-FMT-03 | Fix is concrete | References an element, parameter or timing; not adjective-only (M: text lint; J edge cases) | heuristic (Krause 2017) | All |
| REVIEW-FMT-04 | One issue per finding | One rule_id; no compound issues (J) | heuristic | All |
| REVIEW-FMT-05 | Evidence checkable in about 10 s | ≥ 1 artifact or metric (M) | heuristic | All |
| REVIEW-FMT-06 | Strengths stated first | 1–3 in envelope (M) | heuristic (CRP; Yuan 2016) | All |
| REVIEW-SEV-01 | 0–4 severity with label and basis | Fields present (M) | heuristic (Nielsen 1994) | All |
| REVIEW-SEV-02 | Factors recorded for sev ≥ 3 | Frequency and persistence filled (M; values J) | heuristic (Nielsen) | All |
| REVIEW-SEV-03 | Taste capped | basis=taste ⇒ level ≤ 1 (M) | heuristic | All, universal |
| REVIEW-SEV-04 | Heuristic-only capped | ≤ 3; level 3 needs an artifact (M) | heuristic | All |
| REVIEW-SEV-05 | Roll-up uses the maximum | max over checks (M) | platform (axe-core pattern) | All |
| REVIEW-SEV-06 | Averaging only for judged severities | ≥ 3 raters averaged; measured 4 stays 4 (M) | heuristic | Multi-reviewer |
| REVIEW-IND-01 | Reviewer ≠ author | Different agent, ideally a different model family (M: metadata) | heuristic (Panickssery; Goel) | All |
| REVIEW-IND-02 | Packet blinded | No authorship labels, rationale or prior verdicts (M: packet lint) | heuristic (2608.18091; Sharma) | All |
| REVIEW-IND-03 | Self-critique is not review | Never logged as a review (M) | heuristic (Huang 2024) | All |
| REVIEW-BIAS-01 | Pairwise run in both orders | Order-consistent only (M) | heuristic (Zheng 2023) | Judged |
| REVIEW-BIAS-02 | No absolute aesthetic scores for gating | Pairwise or ranking only (M: config) | heuristic (Chen 2024) | Judged |
| REVIEW-BIAS-03 | Output capped | ≤ 7 judged findings per pillar; issue ≤ 280 chars (M) | heuristic | Judged |
| REVIEW-BIAS-04 | Blockers repeated | ≥ 3 runs, majority (M) | heuristic | Judged blockers |
| REVIEW-MOT-01 | Motion claims backed by series or dense strips | Stills-only ⇒ inferred_from_stills, sev ≤ 2 (M) | heuristic (NextMotionQA) | Motion, pacing |
| REVIEW-MOT-02 | Frame budget fits the question | Consistency: ≥ 16 uniform frames per shot; fine motion: every frame (every 2nd at 60 fps) across the event (M) | heuristic (WorldJen) | Motion |
| REVIEW-MOT-03 | Counting is measured | Peak detection on series (M) | heuristic (PushupBench) | Motion, sound |
| REVIEW-MEA-01 | Measure before judging | Measurement report in packet (M) | heuristic | All |
| REVIEW-MEA-02 | Judgement never overrides a measurement | Enforced (M) | heuristic | All |
| REVIEW-MEA-03 | Text correctness measured | DOM / textBounds / OCR (M) | heuristic (VISTAR; TIQA) | Typography |
| REVIEW-AGG-01 | Deduplicate | Time IoU ≥ 0.5 + region IoU ≥ 0.3 or same selector (M) | heuristic | Multi-reviewer |
| REVIEW-AGG-02 | Conflicts recorded | conflicts_with plus joint fix, or escalate (M) | heuristic | Multi-reviewer |
| REVIEW-AGG-03 | Conflict priority | deliverable/legal > comprehension > accessibility > consistency > craft > taste (J) | heuristic | Multi-reviewer |
| REVIEW-ESC-01 | Uncertain judged blocker | confidence < 0.8 ⇒ escalate (M) | heuristic | All |
| REVIEW-ESC-02 | Runs disagree | Blocker sets differ ⇒ escalate (M) | heuristic | All |
| REVIEW-ESC-03 | Uncalibrated | No trust level ⇒ advisory (M) | heuristic | All |
| REVIEW-HOM-01 | Fixes stay in the brief's look | No new style outside brief or series spec (J) | heuristic (Doshi & Hauser) | Art, motion, type |
| REVIEW-HOM-02 | Intended breaks respected | Declared break ⇒ level 0 (M: brief cross-ref) | heuristic | All |
| REVIEW-HOM-03 | Series variety monitored | Keyframe-embedding spread; alert on sustained fall (M, unvalidated) | heuristic | Series |
| REVIEW-CAL-01 | Gold set exists | 20–30 renders, stratified (M) | heuristic | Calibration |
| REVIEW-CAL-02 | Agreement reported with CIs | κ_w or α, precision, recall, bootstrap 95% CI (M) | heuristic (Landis & Koch; Krippendorff) | Calibration |
| REVIEW-CAL-03 | Trust gates | T1: precision ≥ 0.70, κ ≥ 0.41; T2: κ ≥ 0.61, recall ≥ 0.9, consistency ≥ 0.9 (M) | heuristic | Calibration |
| REVIEW-CAL-04 | Re-calibrate on change | Model, prompt, rules or sampling change ⇒ re-run (M) | heuristic (Bavaresco) | Calibration |
| REVIEW-CAL-05 | FP demotion | FP > 30% of last 20 ⇒ advisory (M) | heuristic | Calibration |
| REVIEW-OUT-01 | NLE-exportable | CSV or markers at render fps (M) | platform (Frame.io pattern) | Delivery |

## 14. How to measure in VCR

| Rule(s) | Inputs | Calculation | Sampling | Failure modes |
|---|---|---|---|---|
| FMT, SEV, ESC-01 | Reviewer JSON | Schema plus conditional checks | Every finding | Valid fields, wrong content; catch with calibration |
| FMT-03 | Fix text + element IDs | Detect IDs, parameters, units, frame counts | Every finding | Conceptual fixes; allow `fix_scope=concept` with human review |
| IND-02 | Review packet | Lint for names, "I made", rationale fields | Every packet | Leaks via filenames or source comments; strip and rename |
| BIAS-01/04, ESC-02 | 2–3 runs | Order consistency; Jaccard of blocker sets | Pairwise and blocker judgements | Same wrong answer twice; caching makes runs falsely identical |
| MOT-01/02/03 | `seek(t)` transforms per element per frame; `markers` | Velocity = Δpos × fps; acceleration; Δframes to nearest marker; peak counting | Every frame on animated spans; ≥ 16 per shot for sheets | Nested transforms need composed matrices; canvas/WebGL need instrumentation; CSS animations outside the seek contract |
| MEA-03 | DOM text, styles, `textBounds()`, PNG | Bounds vs safe box; string equality; OCR fallback | Frames where text is visible | OCR fails on stylised type; Blender text is OCR-only |
| AGG-01 | All findings | Temporal and spatial IoU; selector match | Per review | Same root cause reported at different locations |
| CAL-02/03/05 | Gold labels, verdicts | κ_w, α, precision/recall, bootstrap | Per change; rolling 20 | Small n; seeded defects easier than natural ones; director drift |
| HOM-03 | Episode keyframes | Mean pairwise embedding distance over time | Per episode | Embedding bias; intended consistency |
| Loop seam | Last and first frames, velocity | Mean absolute difference; velocity continuity | Seam ± 3 frames | Intentional hard cuts; platform GOP behaviour |

## 15. VCR rendering and delivery notes

- **Determinism:** any frame is reproducible, so findings cite `render_id` + frame index and anyone can regenerate the evidence.
- **Fixed fps:** stills hide strobing and easing. Judge motion from full-rate playback or series, not contact sheets.
- **Timecode:** always state the fps; 25 and 30 fps timecodes are not interchangeable.
- **`yuv420p`:** chroma subsampling can fringe thin coloured type (general technical knowledge, not verified here). Review contrast-critical items on decoded delivery frames.
- **Platform re-encodes:** these can band gradients and smear fine type. Review a low-bitrate proxy for social deliverables.
- **ProRes 4444 alpha masters:** review them composited over light, dark and busy backgrounds.
- **Audio sync:** report sync as measured Δframes from cue times.
- **Muted-first placements:** review the muted version first.

## 16. Master checklists

**Analysis:**
- [ ] Packet blinded (IND-01/02)
- [ ] Measured failures converted to findings (MEA-01/02)
- [ ] Strengths stated first (FMT-06)
- [ ] Neutral question asked for each brief goal
- [ ] Pairwise in both orders (BIAS-01/02)
- [ ] Motion claims backed by series (MOT-01–03)
- [ ] Findings complete (FMT-01–05, SEV-01–04)
- [ ] Taste ≤ 1 (SEV-03)
- [ ] Breaks respected; fixes stay in the brief's look (HOM-01/02)
- [ ] Deduplicated, ≤ 7 judged findings (AGG-01, BIAS-03)
- [ ] Blockers run ×3; escalations raised (BIAS-04, ESC-01–03)
- [ ] fps-correct export (OUT-01)

**Creation:**
- [ ] Brief lists deliverables, placement, intended breaks and review questions
- [ ] Variants rendered for pairwise review (BIAS-02)
- [ ] Measurement hooks in place (MOT-01, MEA-03)
- [ ] Deterministic self-checks only (IND-03)
- [ ] Blinded independent review (IND-01/02)
- [ ] Verdict recorded on every finding (CAL-05)
- [ ] All deliverables re-measured
- [ ] Gold set re-run after any change (CAL-04)

## 17. Caveats

- **Feedback evidence measures perceived helpfulness** in student and crowd settings (2016–2020), not improvement in professional motion work.
- **Pixar sources are secondary.** The Braintrust account comes from secondary summaries. "Plussing" and "I like / I wish / what if" have no traced primary source.
- **The bias figures are mostly from text tasks** (⚑18mo). Multimodal evidence is newer and smaller. UltraText Bench (2026) reports no quantitative human–judge agreement at all.\[49\]
- **High and low agreement figures follow task type.** High agreement (MT-Bench "over 80%", AesthetiQ 78.8%, UI2Code^N ranking match) and low agreement (32–34% exact; κ = 0.10 on fine motion) split along pairwise-vs-absolute and coarse-vs-fine lines. The rules follow that split.
- **Self-preference is contested:** some studies find it robust; the 2026 work finds it largely removable by blinding. Either way, the remedy is to blind the reviewer.
- **Results go out of date with the model.** Trust levels are tied to a model version. The claim that reasoning models now self-correct well is unverified.
- **All VCR thresholds are proposals.** Trust gates, IoU cut-offs, the cap of 7 findings, 30% FP demotion and the 24-render set are heuristic proposals to be tuned, not sourced numbers.
- **κ and α bands are conventions,** and the Landis & Koch bands in particular are not universally accepted.
- **Platform documentation may change without notice.**

## 18. Verification ledger (checked 2026-11-06)

| Claim | Result | Checked against |
|---|---|---|
| Nielsen 0–4 scale; frequency/impact/persistence/market impact; single rater unreliable; mean of three | confirmed (fetched) | NN/g, 1 Nov 1994 |
| 95% (mean of four) within ±0.5; 55% (single rater) | 95% confirmed via abstract; 55% unverified (secondary) | Nielsen, CHI '92 (ACM DL abstract); J. Biomed. Inform. snippet |
| CRP roles and four steps | confirmed (primary one-pager snippet) | lizlerman.com (2020) |
| Braintrust "has no authority" | unverified against primary | Secondary summaries of Catmull (2014) |
| "Plussing"; "I like / I wish / what if" origins | not found | — |
| Krause: 52 students, 176 providers, n = 50, helpfulness up | confirmed (PDF snippet) | CHI 2017 |
| Yuan: conceptual/specific/actionable/positive | confirmed (PDF snippet) | CSCW 2016 |
| Cheng: 6% / 22% / 11% | confirmed (ACM snippet) | CSCW 2020 |
| MT-Bench "over 80%"; position, verbosity, self-enhancement | confirmed | arXiv 2306.05685 (June 2023) |
| GPT-4V 0.636 / 0.773 pair agreement | confirmed | arXiv 2402.04788 (ICML 2024) |
| 32–34% exact on a 5-point scale | confirmed as reported; under review | arXiv 2604.25235 |
| Self-recognition ↔ self-preference | confirmed | NeurIPS 2024 |
| Blinding removes most self-preference | confirmed (snippet) | arXiv 2608.18091 |
| Similarity bias; correlated errors | confirmed (PMLR abstract) | ICML 2025\[46\] |
| Sycophantic feedback | confirmed | arXiv 2310.13548 |
| Intrinsic self-correction fails | confirmed | arXiv 2310.01798 |
| Reasoning models now self-correct | unverified | HackMD note (2026) |
| JUDGE-BENCH 20 datasets, 11 LLMs | confirmed | ACL 2025 |
| AesEval-Bench 4/12/3; clear gaps | confirmed (fetched abstract) | arXiv 2603.01083\[12\] |
| AesthetiQ 78.8% | confirmed (supplement snippet) | CVPR 2025 |
| BlenderGym 0.66 vs 0.79 | unverified (secondary) | cspaper.org summary |
| NextMotionQA κ 0.70 / 0.10 | confirmed | arXiv 2606.04773 |
| WorldJen 16 frames; every 5th up to 60 | confirmed | arXiv 2605.03475 |
| PushupBench 5 fps, 112 cap, 100-frame API limit | confirmed | arXiv 2604.23407 |
| VMBench 35.3% | confirmed | ICCV 2025 |
| VISTAR deterministic > VLM; VISTA-Bench 75% on 200 | confirmed | arXiv 2508.06152; 2602.04802 |
| MLLM severity within one level (MAD) | confirmed | arXiv 2508.16165 |
| Doshi & Hauser findings | confirmed (abstract) | Sci. Adv. 10(28), 2024 |
| Krippendorff .800 / .667 | confirmed via secondary | Statistics How To; PMC |
| Landis & Koch bands | confirmed (fetched, via subagent) | NCBI NBK92287 |
| axe-core impact levels; highest impact reported | confirmed (doc snippet; fetch truncated) | Deque API docs |
| Frame.io V4 comment fields and exports | confirmed (fetched, via subagent) | help.frame.io, Sept 2026 |
| Frame.io EDL marker export in V4 | unverified (Legacy docs only) | support.frame.io Legacy |
| 4:2:0 fringing on thin colour type | unverified | — |
| VCR thresholds (§4, §6, §13) | n/a: proposals | — |

## 19. Sources

Sources are named inline (author, venue, date, arXiv ID) and in the ledger. The numbered list below matches the escaped `\[n\]` markers in the text.

1. [MLLM-as-a-Judge:Assessing Multimodal LLM-as-a-Judge with Vision-Language Benchmark](https://arxiv.org/html/2402.04788v3.pdf)
2. [NextMotionQA: Benchmarking and Judging Human Motion Understanding with Vision-Language Models](https://arxiv.org/html/2606.04773v1)
3. [LLM Evaluators Recognize and Favor Their Own Generations](https://www.researchgate.net/publication/397200002_LLM_Evaluators_Recognize_and_Favor_Their_Own_Generations)
4. [Towards Understanding Sycophancy in Language Models · The Evaluating Self](https://abhinavgautam.in/towards-understanding-sycophancy-in-language-models/)
5. [Self- and Other-Labels Induce Bidirectional Bias in LLM Judges](https://arxiv.org/html/2608.18091v1)
6. [Severity Ratings for Usability Problems: Article by Jakob Nielsen](https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/)
7. [The Effects of Rubrics and Expertise on Perceived Value of ...](https://people.eecs.berkeley.edu/~bjoern/papers/yuan-crowdcrit-cscw2016.pdf)
8. [Critique Style Guide: Improving Crowdsourced Design ...](https://www.mooqita.org/publications/critiquestyleguide.pdf)
9. [Critique Me](https://dl.acm.org/doi/epdf/10.1145/3415232)
10. [MLLM-as-a-Judge: Assessing Multimodal LLM-as-a-Judge with Vision-Language Benchmark](https://www.alphaxiv.org/abs/2402.04788)
11. [Preprint. Under review. VLM Judges Can Rank but Cannot Score: Task-Dependent](https://arxiv.org/pdf/2604.25235)
12. [Can Vision Language Models Assess Graphic Design Aesthetics? A Benchmark, Evaluation, and Dataset Perspective](https://arxiv.org/abs/2603.01083)
13. [VMBench: A Benchmark for Perception-Aligned Video Motion Generation](https://openaccess.thecvf.com/content/ICCV2025/papers/Ling_VMBench_A_Benchmark_for_Perception-Aligned_Video_Motion_Generation_ICCV_2025_paper.pdf)
14. [LLM Evaluators Recognize and Favor Their Own Generations](https://www.alphaxiv.org/abs/2404.13076)
15. [Great Models Think Alike and This Undermines AI Oversight](https://mlanthology.org/icml/2025/goel2025icml-great/)
16. [The art of useful feedback - by E. Andrew Taylor](https://notes.artsmanaged.org/p/the-art-of-useful-feedback)
17. [Liz Lerman's Critical Response Process™ — Teaching](https://thadanderson.com/teaching/liz-lermans-critical-response-process)
18. [Ed Catmull ran Pixar for 30 years and said the key to creative teams is making it safe to show ugly work early](https://mindsetonline.com/ed-catmull-pixar-30-years-braintrust-ugly-work-early/)
19. [161 Critique Me: Exploring How Creators Publicly Request](https://reginachangzhou.github.io/pub/rcheng_cscw2020_feedback_final.pdf)
20. [axe-core/doc/API.md at develop · dequelabs/axe-core · GitHub](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)
21. [Investigating Multimodal Large Language Models to Support Usability Evaluation](https://arxiv.org/pdf/2508.16165)
22. [Catching UX Flaws in Code: Leveraging LLMs to Identify Usability Flaws at the Development Stage](https://arxiv.org/pdf/2512.04262)
23. [Commenting on your media | Frame.io V4 Knowledge Center](https://help.frame.io/en/articles/9105251-commenting-on-your-media)
24. [Comments Panel Overview | Frame.io V4 Knowledge Center](https://support.frame.io/en/articles/414442-comment-exporting)
25. [Comment Printing and Comment Exporting](https://help.frame.io/en/articles/9105309-comment-printing-and-comment-exporting)
26. [Great Models Think Alike and this Undermines AI Oversight](https://www.alphaxiv.org/abs/2502.04313)
27. [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena Lianmin Zheng1∗](https://arxiv.org/pdf/2306.05685)
28. [Great Models Think Alike and this Undermines AI Oversight \[Quick Review\]](https://liner.com/review/great-models-think-alike-and-this-undermines-ai-oversight)
29. [Towards Understanding Sycophancy in Language Models \[Quick Review\]](https://liner.com/review/towards-understanding-sycophancy-in-language-models)
30. [GitHub - dmg-illc/JUDGE-BENCH · GitHub](https://github.com/dmg-illc/JUDGE-BENCH)
31. [The Coin Flip Judge? Reliability and Bias in LLM-as-a-Judge Evaluation](https://arxiv.org/pdf/2606.13685)
32. [AesthetiQ: Enhancing Graphic Layout Design via Aesthetic-Aware Preference](https://openaccess.thecvf.com/content/CVPR2025/supplemental/Patnaik_AesthetiQ_Enhancing_Graphic_CVPR_2025_supplemental.pdf)
33. [UI2Code^N: UI-to-Code Generation as Interactive Visual Optimization](https://arxiv.org/pdf/2511.08195)
34. [AI JUDGES IN DESIGN: STATISTICAL PERSPECTIVES ON](https://arxiv.org/pdf/2504.00938)
35. [VISTAR:A User-Centric and Role-Driven Benchmark for Text-to-Image Evaluation](https://arxiv.org/pdf/2508.06152)
36. [TIQA: Human-Aligned Perceptual Text Quality Assessment in Generated Images](https://arxiv.org/html/2603.07119)
37. [VISTA-Bench: Do Vision-Language Models Really Understand Visualized Text as Well as Pure Text?](https://arxiv.org/pdf/2602.04802)
38. [Font Detection: Benchmarking VLMs & Training a Simple Model](https://david-ferris.medium.com/font-detection-benchmarking-vlms-training-a-simple-model-52be0fa80174)
39. [Systematically Benchmarking and Calibrating VLM-as-a-Judge Failure Modes in Image and Video Generation](https://cspaper.org/open-problems/systematically-benchmarking-and-calibrating-vlm-as-a-judge-failure-modes-in-imag-4bba7d2747f9)
40. [WorldJen: An End-to-End Multi-Dimensional Benchmark for Generative Video Models](https://arxiv.org/pdf/2605.03475)
41. [PushupBench: Your VLM is not good at counting pushups](https://arxiv.org/pdf/2604.23407)
42. [Great Models Think Alike and this Undermines AI Oversight — Lacuna](https://lacuna.tiptreesystems.com/work/great-models-think-alike-and-this-undermines-ai-oversight/wrk_85846d9d96b3cc3c34498cdebf5ac5eb)
43. [Table B, Interpretation of Fleiss' kappa (κ) (from Landis and Koch 1977) - Validity and Inter-Rater Reliability Testing of Quality Assessment Instruments - NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK92287/table/executivesummary.t2/?report=objectonly)
44. [Chance corrected agreement measures for binary and semi-quantitative data | Documentation](https://analyse-it.com/docs/user-guide/method-comparison/kappa)
45. [Krippendorff’s Alpha Reliability Estimate: Simple Definition - Statistics How To](https://www.statisticshowto.com/krippendorffs-alpha/)
46. [Great Models Think Alike and this Undermines AI Oversight](https://proceedings.mlr.press/v267/goel25b.html)
47. [LLMs Lack Intrinsic Self-Correction in Reasoning](https://www.emergentmind.com/papers/2310.01798)
48. [Large Language Models Cannot Self-Correct Reasoning Yet — Paper Notes + 2026 Update - HackMD](https://hackmd.io/@BE82wIFmQzuVS__XrwkYWA/HJBPK8IrGg)
49. [UltraText Bench: A Comprehensive Bilingual Benchmark for Evaluating Visual Text Rendering in Image Generation](https://arxiv.org/html/2610.09823v1)
