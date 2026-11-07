# Cultural Context Knowledge Base (`CULTURE-*`): Researching How Audiences Read References, Codes, Genres and Contemporary Expressions

> **VCR integration (2026-11-07):** Reference-only research seed; candidate rules have no implemented checks, skill or reviewer. Source-verification statements below are reported by the supplied research, not independently reverified during import. Structural criteria do not establish truth or creative quality. Production research stays in its selected workspace.

An AI creative agent should treat every cultural reference, visual code, genre convention or contemporary expression as a *hypothesis about a specific audience's reading*, recorded with its evidence, its uncertainty and a recheck trigger. It is not a fact about the image. The best-supported research says meaning is shared in part and varies in part: colour–emotion associations are highly similar across 30 nations, yet nation still predicts differences beyond the shared pattern (Jonauskaite et al. 2020).\[1\] Emblematic gestures are mostly culture-specific, with only a small cross-cultural core (Matsumoto & Hwang 2013).\[2\] The same emoji rendering drew conflicting sentiment readings 25% of the time (Miller et al. 2016).\[3\] The method below therefore separates recognition from interpretation, intent from reception, and hypothesis from validated finding. It stores production-specific research in the production workspace and leaves severity to `REVIEW-*`.

## TL;DR

- **Treat meaning as audience-scoped and evidence-graded.** For each cue, build the chain *cue → documented context → plausible audience reading → creative opportunity → uncertainty or misreading*. Mark each link as evidence, assumption or agent inference. No published standard sets audience-interpretation criteria, so every proposed `CULTURE-*` rule is tiered `heuristic`.
- **Recognition is not liking, and visibility is not reception.** Polysemy in advertising is well documented (Puntoni, Schroeder & Ritson 2010).\[4\] Humour raises attention and liking of the ad but lowers source credibility (Eisend 2009).\[5\] Engagement counts, sentiment scores and model agreement cannot establish how an audience interprets work. Vision-language models perform better on the Western than the East Asian split of image-understanding tasks (Ananthram et al. 2024). They also show "strong cultural understanding capabilities for North America while significantly lower performance for Africa" (Nayak et al. 2024).
- **Contemporary references are perishable, and their lifespans differ in ways no universal rule captures.** One study of 2,126 memes found four distinct popularity patterns, with weak cluster separation (Little & Xiao 2025).\[6\] Record a production-specific recheck trigger tied to production and distribution dates rather than a fixed expiry. Always keep a durable treatment that does not depend on recognition.

---

## Status

| Field | Value |
| --- | --- |
| Path | `references/cultural-context/cultural-context-knowledge-base.md` |
| Rule prefix | `CULTURE-` (candidate rules; no rules data, checks, skills or reviewers exist) |
| Type | Research brief and reference method. Not a trend feed, reference catalogue or audience-testing service |
| Verification date | 2026-11-07 |
| Rule tiers used | `heuristic` only (see §11) |
| Research siblings | `DOMAIN-*`, `VREF-*` and `IMAGE-*` exist as reference-only pillars with candidate rules |
| Catalogue independence | Methods describe capabilities, not tools or providers (ADR 0006) |

## Concise summary

This knowledge base gives a creative agent a method for asking *whose* meaning matters, reading codes as learned associations, handling perishable contemporary expressions, comparing meanings across contexts, turning context into creative options, and recording findings so they can be refreshed. Evidence is labelled as **empirical audience findings**, **interpretive scholarship**, **practitioner and institutional guidance**, or **proposed VCR conventions**.

## Section routing table

| If you need to… | Go to |
| --- | --- |
| Turn a brief's audience into explicit context | §1 |
| Classify a cue (connotation, convention, quotation, parody, allusion) | §2 |
| Research a meme, vernacular or subcultural aesthetic without cataloguing it | §3 |
| Check how a meaning shifts across contexts | §4 |
| Convert research into creative options | §5 |
| Record and refresh findings | §6 |
| Run creation or review workflows | §7–§8 |
| Copy a template or see a worked chain | §9 |
| See capabilities, candidate rules and measurement limits | §10–§12 |
| Use the checklists, ownership notes, caveats and ledger | §13–§16 |

---

## 1. Defining whose meaning matters

### 1.1 From brief audience to explicit context

A brief's audience label (owned by `BRIEF-*`) is a starting proxy. Translate it into an **audience scope** with these dimensions, each marked *stated in brief*, *evidenced* or *assumed*:

| Dimension | Question to answer |
| --- | --- |
| Language(s) | Which languages, registers and scripts will the audience read and hear the work in? |
| Location(s) | Where will it be seen? Is distribution multi-locale? |
| Experience | What prior exposure to the genre, medium or subject is assumed? |
| Community | Which communities of practice, fandoms or subcultures matter, and is the audience inside or outside them? |
| Viewing situation | Device, attention level, sound on or off, feed vs dedicated viewing, captioned or not |
| Shared knowledge | Which specific references, conventions and events must be known for the work to land? |

Reception research is why the label alone is not enough. In Hall's encoding/decoding model, a message is "encoded" through production codes and "decoded" through the audience's own frameworks. Readers can take dominant-hegemonic, negotiated or oppositional positions, but the model does not claim a message can mean anything at all (Hall 1973, via secondary summaries; primary not inspected).\[7\] Morley's 1980 reception study ran discussion sessions with 29 small groups shown current-affairs television. It found that groups sharing a working-class position decoded the same programme in dominant, negotiated and oppositional directions depending on "the discourses and institutions in which they are situated" (Morley 1983, quoted in Chandler's secondary summary; primary not inspected).\[8\] **Implication: demographic categories are incomplete proxies.** Keep sub-audiences separate rather than averaging them.

### 1.2 Four response layers, recorded separately

| Layer | What it asks | Typical evidence | What it does *not* establish |
| --- | --- | --- | --- |
| Recognition | Does the audience notice and identify the cue or reference? | Recognition checks, documented usage within the community | Liking, agreement or acceptance |
| Interpretation | What do they take it to mean? | Open-ended reader responses, reception studies | Emotional valence or willingness to engage |
| Emotional response | How do they feel about it? | Affect measures, qualitative accounts | Whether they accept *this* use of it |
| Willingness to engage | Do they accept the reference being used here, by this speaker, in this context? | Community accounts, consultation | Generalisation beyond those consulted |

The advertising literature shows these layers separating in practice. In Eisend's meta-analysis of 369 correlations, humour significantly raised attitude toward the ad, attention and positive affect, yet *reduced* source credibility (Eisend 2009).\[5\] His follow-up model describes a "vampire effect", where humour distracts from processing the central message (Eisend 2011).\[9\] A reference can be recognised and enjoyed and still undermine the brief's essential message.

### 1.3 Decision-changing questions and proportionate depth

Frame each research question so that a different answer would change a creative decision. Examples (abstract):

- "If `{AUDIENCE-SEGMENT-A}` does not recognise `{CUE-X}`, does the piece still communicate `{CORE-MESSAGE}`?"
- "Does `{CUE-X}` carry a documented reading among `{AUDIENCE-SEGMENT-B}` that contradicts `{INTENDED-TONE}`?"

**Depth and stopping conditions (proposed convention).** Scale effort to consequence:

| Consequence if misread | Suggested depth | Stop when… |
| --- | --- | --- |
| Low: decorative cue, meaning carried elsewhere | Desk check of dated sources | The miss-survival question (§3.4) is answered "yes" |
| Medium: cue carries part of the message or tone | Original-context inspection plus contrary-evidence search | Competing readings are documented, or a search across distinct source types finds none |
| High: cue involves identity, sacred or community-owned material, or carries the core message | Above, plus consultation or a small audience check (§4.4), routed through `BRIEF-*` | The uncertainty is resolved, or it is surfaced as a brief assumption for a human decision |

These tiers are proposed defaults, not validated thresholds.

## 2. Reading cultural codes

### 2.1 Codes as learned associations

Symbols, gestures, visual tropes, genre conventions, typography, editing patterns and sonic cues should be analysed as **learned, context-dependent associations**. The best evidence supports this but rules out both extremes:

- **Colour.** Jonauskaite et al. (2020) tested 4,598 participants from 30 nations speaking 22 native languages. Each associated 20 emotion concepts with 12 colour *terms*. Average pattern similarity was high (r = .88), yet "nation predicted color-emotion associations above and beyond those observed universally", and similarity was greater for linguistically or geographically close nations.\[1\]\[10\] Scope limits: the study used colour words, not rendered colours in composed images, and self-reported associations, not responses to creative work. It therefore cannot prescribe palette meaning for a piece. Colour-in-context theory proposes that colour meaning and effects depend on physical and psychological context (Elliot & Maier 2012, secondary summary).\[11\] Buechner & Maier (2016, *PeerJ*) ran a 2 (red vs blue) × 2 (test vs neutral context) experiment. They found that "red increased arousal perceptions of stimuli irrespective of their valence but a context × color interaction was found for valence perceptions." **Conclusion: unsupported universal colour-meaning claims fail, and so do claims of pure arbitrariness. Palette associations inform `ART-*`; they do not prescribe it.**
- **Gesture.** Matsumoto & Hwang (2013) had encoders from six world regions produce gestures for a standard list of verbal messages. A gesture counted as an emblem only if at least 70% of encoders produced it similarly *and* at least 70% of same-region observers decoded it correctly. They catalogued many region-specific emblems and, "surprisingly", a small group of 15 emblems encoded similarly across regions. Scope limits: many encoders were immigrants living in the United States, observer samples per region were small (for example 35–39 for three regions), and the fixed message list cannot reveal differences outside it.\[2\]
- **Digital pictographs.** Miller et al. (2016) surveyed 304 participants, giving 4,560 interpretations of 22 emoji across 5 platform renderings. Participants disagreed on whether the *same rendering* was positive, neutral or negative 25% of the time, and disagreement increased across platforms.\[3\]\[12\] **Implication: the rendering and the medium are part of the cue.**

### 2.2 Distinguish the type of signification

| Type | Working definition (VCR convention) | Analytic question |
| --- | --- | --- |
| Literal content (denotation) | What is depicted or said | What would a viewer with no cultural framing identify? |
| Connotation | Associated meanings layered on the literal | Which associations are documented, for whom? |
| Convention | A repeated formal pattern a genre or community expects | Which community holds the expectation, and since when? |
| Quotation | Recognisable reproduction of a specific prior work | Does the work depend on the source being known? |
| Parody | Imitation that comments on or mocks its source | Does the critical stance survive if the source is unknown? |
| Allusion | Indirect, partial reference | Is partial recognition enough, or does it confuse? |

Barthes' "Rhetoric of the Image" separates a linguistic message, a coded (connoted) iconic message and a non-coded (literal) iconic message. It describes text as **anchoring** an image's floating meanings or acting as **relay** in a complementary, narrative relationship (Barthes 1964, via secondary summaries; primary not inspected).\[13\]\[14\] This vocabulary is useful for image–text work (§5.5), but it is interpretive theory. **Formal analysis proposes readings; it does not prove audience response.**

### 2.3 Limits of interpretive frameworks and competing readings

McQuarrie & Mick (1999) combined text-interpretive analysis, two experiments and reader-response interviews. Visual rhetorical figures produced more elaboration and more favourable attitude toward the ad without being harder to comprehend. Interviews confirmed that *several* (not all) meanings generated by informants matched the a priori textual analysis.\[15\] This is the strongest available argument for **critical pluralism**: pair formal reading with audience evidence, because each catches what the other misses.

### 2.4 Origins and changes of use

Trace origin, change of use and context only as far as sources allow. Matsumoto & Hwang's account of one gesture moving from covert religious signal to generic good-luck sign shows that meanings drift.\[2\] Even so, the agent should record such histories as *reported* by named sources, not as settled fact. Rogers (2006) argues that **transculturation**, meaning cultural elements formed from multiple cultures, makes it "problematic" to identify a single originating culture.\[16\] **Rule of thumb: when sources disagree or are absent, record "origin distributed or undocumented" rather than inventing one.**

### 2.5 Intent, community report and agent inference

Keep three columns separate in every record:

1. **Creator-stated intent**: what the originator or production says it means.
2. **Community-reported meaning**: what people inside the relevant community say, with locator and date.
3. **Agent inference**: what the agent concludes from 1, 2 and formal analysis, labelled as inference.

Neither 1 nor formal analysis establishes 2. Hall's model treats encoding and decoding as "relatively autonomous" moments (Hall 1973, secondary).\[17\]

## 3. Popular culture and contemporary expressions

### 3.1 Method, not a catalogue

Research memes, entertainment conventions, internet vernacular, subcultural aesthetics and remix practices *at time of use* in the production workspace. This knowledge base holds no list of examples.

### 3.2 Four layers to distinguish

Shifman defines internet memes as "(a) a group of digital items sharing common characteristics of content, form, and/or stance, which (b) were created with awareness of each other, and (c) were circulated, imitated, and/or transformed via the Internet by many users" (Shifman 2014, p. 41, quoted in a review).\[18\] She proposes **content, form and stance** as memetic dimensions (Shifman 2013).\[19\] Adapted for VCR:

| Layer | Definition | Why it matters creatively |
| --- | --- | --- |
| Reference | A specific source item (scene, line, image, sound) | Most recognition-dependent; most perishable |
| Reusable format | A template whose *form* is imitated with new content | Can work if the format is known even when the original is not |
| Stylistic convention | Aesthetic or editing pattern detached from a source | Often more durable; may read as genre rather than reference |
| Underlying mechanism | The joke, irony or stance structure (incongruity, reversal, escalation) | Transferable without the reference; `STORY-*` owns its development |

A treatment that keeps the mechanism and drops the specific reference often keeps much of the effect with far less recognition risk. This is a design hypothesis, not a tested law.

### 3.3 Circulation, reach and lifecycle

- **Circulation is not reach is not reception.** Jenkins, Ford & Green (2013) contrast "stickiness", which aggregates attention in central places, with "spreadability", which disperses content through formal and informal networks.\[20\] Visible circulation therefore reflects the networks it travelled through, not a representative audience.
- **Lifespans are heterogeneous.** Little & Xiao (2025) clustered Google Trends series for 2,126 memes drawn from a community-maintained meme archive. They found four patterns: rapid surge with roughly exponential decay, long-term growth, peak then plateau, and spiky decay with resurgences. Event-driven content tended toward short-lived patterns and adaptable templates toward sustained ones. Limitations: the silhouette score was 0.27 (weak separation), Google Trends gives relative search interest rather than usage, and the paper labels some clusters inconsistently.\[6\] Coscia (2013) found a roughly power-law popularity distribution across 499 memes and 178,801 implementations on one meme-generator site.\[21\] Weng et al. (2012) argue from a model that limited attention plus network structure is enough to produce broad diversity in meme popularity and lifetime (abstract only).\[22\]
- **Conclusion:** there is no defensible universal trend lifetime. Record dated observations and source limitations, and do not invent half-lives.

**Source limitations to record:** search-interest indices are relative and platform-shaped; community archives are secondary, editor-curated and skewed towards what the archive's own community noticed; platform engagement reflects ranking systems and the people who reacted.

### 3.4 Explanation and miss-survival

For each recognition-dependent element, answer three questions:

1. **Does it need explanation for the scoped audience?**
2. **Does explanation destroy the effect?** Humour and allusion often depend on the viewer completing the inference. Phillips (2000) tested explanatory headlines at different levels of verbal anchoring on ads with pictorial metaphors, measuring comprehension and liking.\[23\] Later work shows verbal anchoring generally increases comprehensibility (Bünzli & Dillard 2022), while its effect on liking is more mixed (detailed results unverified here).\[24\]
3. **Does the idea survive if the reference is missed?** If not, the piece depends on recognition. Either supply context, select an audience scope where recognition is evidenced, or adopt a less reference-dependent treatment.

### 3.5 Topicality vs production and distribution time

Compare the **evidence date** of a reference's currency against the **expected production lock date**, **release date** and **distribution window**. Where the gap is material for that reference (judged per case; there is no universal interval), set a **recheck trigger** (§6.2). Popularity alone is not a creative objective. Always keep a **durable alternative** that does not depend on recognition (`CULTURE-DURABLE-ALTERNATIVE-KEPT`).

## 4. Meaning across contexts

### 4.1 Axes of shift

Meanings shift across **language** (wordplay, script, register), **place**, **generation**, **community** (insider vs outsider), **medium** (rendering alone changes readings; Miller et al. 2016) and **time** (§3.3).

### 4.2 Documented difference vs stereotype

Accept a cross-context difference claim only when a named source documents it, with sample and scope. Reject:

- universal colour, shape or "personality" claims, which conflict with Jonauskaite et al. (2020) and Elliot & Maier (2012);
- national or demographic stereotypes presented as interpretation;
- single-country findings presented as regional.

Large-sample similarity (r = .88 in one study) does not license a universal claim for a particular cue, and documented variation does not license "anything goes".

### 4.3 Representation and borrowed material

Ask who is represented, who is speaking, and whose account is missing from the sources. Rogers (2006) classifies cultural appropriation into four kinds: **exchange, dominance, exploitation and transculturation**.\[25\] Power asymmetry is what distinguishes them.\[26\] Use this as an analytic lens for when borrowed imagery or language loses essential context, not as a verdict generator. Some communities publish protocols. One example is Creative Australia's *Protocols for using First Nations Cultural and Intellectual Property in the Arts* (first published 2002, revised 2007, current edition prepared by Terri Janke and Company).\[27\] Funded projects must comply with it, and it centres free, prior and informed consent.\[28\]\[29\] Where such protocols exist for the material in question, the production should follow them and record that it did. Such protocols are jurisdiction- and community-specific. The agent must not generalise from one to others.

### 4.4 Consultation and small audience checks

Consultation, or a small qualitative check, can resolve *specific* consequential uncertainty. Examples: "Does this cue read as respectful use within `{COMMUNITY-C}`?" or "Is `{REFERENCE-R}` recognised by `{AUDIENCE-SEGMENT-A}`?" Malterud, Siersma & Guassora (2016) argue that adequate qualitative sample size depends on **information power**, shaped by study aim, sample specificity, use of established theory, quality of dialogue and analysis strategy, rather than on a fixed N.\[30\] Accordingly:

- **What a small or unrepresentative sample can establish:** that particular readings *exist*, that a misreading is *possible*, the vocabulary people use, and whether consulted members accept a use.
- **What it cannot establish:** prevalence, representativeness, absence of a misreading in the wider audience, or endorsement by a community as a whole. Only custodians can speak for community-owned culture where protocols say so.
- **No minimum sample size is prescribed here.**

### 4.5 Interpretation is not permission

Cultural interpretation is separate from legal permission and platform rules. Refer asset permissions, licensing and rights questions to the shared provenance concern. The localisation literature lists "varying legal requirements" as a separate concern from cultural misinterpretation (W3C Internationalization).\[31\] Make no blanket legal conclusions.

## 5. Turning context into creative options

**Creative handoff.** [Story §2](../story/README.md) develops the metaphor or humour mechanism; [Art Direction §7](../art-director/README.md) selects visual language. [Image Direction §3–4](../image-direction/README.md) uses the documented readings when briefing and comparing imagery (`IMAGE-BRIEF-EXCLUSIONS`). [Adaptation §6](../adaptation/README.md) checks coverage of affected locales (`ADAPT-CULTURE-REVIEW`). Culture supplies scoped evidence and alternatives, not a substitute for those decisions.

### 5.1 The chain

**cue → documented context → plausible audience reading → creative opportunity → uncertainty or misreading**

Each link carries an evidence label (*documented*, *community-reported*, *inferred*, *assumed*) and source IDs. A chain with an *inferred* reading and no contrary-evidence search is incomplete (`CULTURE-CHAIN-COMPLETE`).

### 5.2 Use, subvert, contextualise or avoid

| Choice | When it fits | Risk |
| --- | --- | --- |
| Use the familiar code | Recognition is evidenced for the scoped audience, and the code supports the core message | Cliché; reads as generic |
| Subvert it | The audience reliably knows the code, so the deviation registers | Audiences who miss the code read the subversion literally |
| Supply context | Recognition is uneven and explanation does not kill the effect | Over-anchoring flattens ambiguity |
| Avoid depending on recognition | Recognition is unevidenced, perishable or consequential if missed | Loses resonance with insiders |

McQuarrie & Mick's (1999) finding that artful deviation increased elaboration *without* harming comprehension supports subversion when the code is known. Their reliance on cultural competency (after Scott 1994) is the reason subversion fails when it is not.\[15\]

### 5.3 Humour, play and ambiguity

Ambiguity is not failure by default. Puntoni, Schroeder & Ritson (2010) treat **purposeful polysemy** as strategic ambiguity, where different interpretations can each serve the communicator.\[32\] Ambiguity becomes a problem when it obscures the brief's essential message. **Test:** with the most likely alternative readings listed, is `{CORE-MESSAGE}` still received under each? If yes, the ambiguity is productive. If not, adjust (§5.4). `STORY-*` owns the humour mechanism and narrative; `CULTURE-*` supplies the contextual evidence.

### 5.4 Alternative readings and adjustments

For each consequential cue, list at least the intended reading and the most plausible competing reading(s), with evidence labels. Offer targeted adjustments rather than generic flattening: re-anchor with text, change one cue, shift framing, add an establishing beat, or provide a durable variant.

### 5.5 Applying the method by format

| Format | Where cultural meaning concentrates | Method emphasis |
| --- | --- | --- |
| Single image | Composition, gesture, colour-in-context, symbols, typography | Separate literal from connoted; check each consequential cue against the audience scope |
| Image–text | Anchorage vs relay (Barthes); puns; wordplay | Does text over-anchor (kills play) or under-anchor (obscures the message)? Flag language dependency to `ADAPT-*` |
| Sequence or series | Editing conventions, genre beats, running references | Track recognition dependency across pieces; recheck freshness per release |
| Sound–image | Sonic cues, music genre codes, voice register, timing | Sound can carry or contradict the visual reading; check sound-off contexts; coordinate with `SOUND-*` and `PACE-*` |

## 6. Recording and refreshing findings

### 6.1 Where records live

Store audience-assumption and cultural-reference records (fields in §9) in the **selected production workspace**. Keep generated previews and temporary captures in ignored output directories. Do not promote production-specific cultural research into the harness or any global corpus.

### 6.2 Recheck triggers, not universal expiry

Choose a trigger that fits the evidence. Examples:

- before production lock, if the evidence predates it materially;
- before release, if the cue is event-linked or follows a surge-and-decay pattern;
- on a change of locale, audience scope or distribution platform;
- on a reported event that alters the reference's meaning;
- before each instalment of a series that reuses the reference.

No single expiry interval is prescribed.

### 6.3 Hypothesis vs validated finding

| Status | Meaning | Required fields |
| --- | --- | --- |
| `hypothesis` | Agent inference from sources and formal analysis | Sources, inference, contrary evidence |
| `community-reported` | Documented statements from community members or custodians | Locator, date, who, context |
| `checked` | Small audience check or consultation done | What was shown, to whom (scope, not identities), how many, conditions, date, questions asked, what it can and cannot establish |
| `contradicted` | Evidence against the reading | Locator and date |

Never upgrade `hypothesis` to `checked` without a recorded check.

---

## 7. Creation workflow

1. **Read the brief** (`BRIEF-*`): audience label, tone, mandatories, core message.
2. **Scope the audience** (§1.1), marking each dimension stated, evidenced or assumed; record new assumptions as proposed brief revisions.
3. **List cues**: references, codes, conventions, expressions, sonic cues.
4. **Frame decision-changing questions** (§1.3) and set depth by consequence.
5. **Classify each cue** (§2.2, §3.2).
6. **Research context** with dated sources, including contrary evidence (§10).
7. **Build the chain** (§5.1) with alternative readings (§5.4).
8. **Assess recognition dependency**: miss-survival (§3.4) and topicality vs schedule (§3.5).
9. **Hand off options** to `IMAGE-*`, `STORY-*`, `ART-*` and `ADAPT-*`. They choose; this pillar does not.
10. **Surface consequential uncertainty** through the brief and review process; propose consultation where §4.4 applies.
11. **Set recheck triggers** and store records in the production workspace.
12. **Recheck at triggers**, update status and note any decision changes.

## 8. Review workflow

Advisory only. Severity and calibration belong to `REVIEW-*`. There is no automatic taste gate.

| Review lens | Questions | Related candidate rules |
| --- | --- | --- |
| Recognition dependency | Which elements fail if unrecognised? Does the core message survive? | `CULTURE-MISS-SURVIVAL-STATED`, `CULTURE-DURABLE-ALTERNATIVE-KEPT` |
| Contextual fidelity | Was the original context inspected? Is the use consistent with it, or knowingly transformed? | `CULTURE-ORIGINAL-CONTEXT-INSPECTED`, `CULTURE-ORIGIN-NOT-INVENTED` |
| Source quality | Are sources dated and labelled? Is engagement treated as reception? | `CULTURE-SOURCE-DATED`, `CULTURE-METRIC-NOT-MEANING` |
| Misreading | Are competing readings listed? Is ambiguity productive or obscuring? | `CULTURE-ALTERNATIVE-READINGS-LISTED`, `CULTURE-CORE-MESSAGE-ANCHORED` |
| Unsupported generalisation | Universal claims, stereotypes, overclaimed small samples? | `CULTURE-NO-UNIVERSAL-CLAIM`, `CULTURE-CONSULTATION-SCOPED` |
| Representation | Whose account is missing? Are community protocols relevant? | `CULTURE-REPRESENTATION-ACCOUNTED` |

Reviewers report findings with evidence. They do not certify cultural meaning, and neither can an agent.

---

## 9. Templates and abstract worked chain

### 9.1 Audience-assumption record

```yaml
record_type: audience-assumption
id: AA-{slug}
brief_ref: {BRIEF-ID}
audience_scope:   # each item: stated | evidenced | assumed
  languages: [{LANG}]
  locations: [{LOCALE}]
  experience: {DESCRIPTION}
  communities: [{COMMUNITY}]
  viewing_situation: {DESCRIPTION}
  shared_knowledge_required: [{KNOWLEDGE-ITEM}]
sources: [{SOURCE-ID}]
sub_audiences_kept_separate: [{SEGMENT}]
decision_affected: {DECISION}
proposed_brief_revision: {TEXT or none}
recheck_trigger: {TRIGGER}
recorded: {YYYY-MM-DD}
```

### 9.2 Cultural-reference record

```yaml
record_type: cultural-reference
id: CR-{slug}
cue: {CUE-DESCRIPTION}
signification_type: literal | connotation | convention | quotation | parody | allusion
layer: reference | format | convention | mechanism
scope: {AUDIENCE-SCOPE-ID}
sources:
  - id: {SOURCE-ID}
    kind: primary | secondary | community-report | archive
    source_date: {YYYY-MM-DD or unknown}
    observed: {YYYY-MM-DD}
    locator: {DIRECT-INSPECTION-LOCATOR}
original_context: {DESCRIPTION or "undocumented"}
origin_status: documented | distributed | undocumented
creator_intent: {TEXT or unknown}
community_reported_meaning: {TEXT or none found}
observed_usage: {TEXT}
agent_inference: {TEXT}
alternative_readings: [{READING}]
contrary_evidence: [{SOURCE-ID}: {SUMMARY}]
uncertainty: {TEXT}
miss_survival: yes | partial | no
decision_affected: {DECISION}
status: hypothesis | community-reported | checked | contradicted
check: {null or {shown, to_whom_scope, n, conditions, date, questions, limits}}
recheck_trigger: {TRIGGER}
```

### 9.3 Abstract worked chain (placeholders only; no evidence fabricated)

| Link | Content |
| --- | --- |
| Cue | `{CUE-X}`, a visual convention in `{FORMAT-F}` |
| Documented context | `{SOURCE-ID-A}` (dated `{DATE}`) documents `{CUE-X}` used within `{COMMUNITY-C}` to signal `{READING-ONE}`; `{SOURCE-ID-B}` reports a later use signalling `{READING-TWO}`; origin recorded as `distributed` |
| Plausible audience reading | For `{AUDIENCE-SEGMENT-A}` (insiders): `{READING-ONE}` (*community-reported*). For `{AUDIENCE-SEGMENT-B}`: `{READING-TWO}` or no recognition (*inferred*) |
| Creative opportunity | Subvert `{CUE-X}` to support `{CORE-MESSAGE}` for segment A; anchor with `{TEXT-T}` for segment B |
| Uncertainty or misreading | Segment B may read the subversion literally; anchoring may flatten the joke for segment A. Miss-survival: `partial`. Status: `hypothesis`. Recheck trigger: before release and on any locale change. Durable alternative: `{TREATMENT-D}` using the mechanism without `{CUE-X}` |

---

## 10. Capability matrix

| Need | Capability | Evidence returned | Limitation | Fallback |
| --- | --- | --- | --- | --- |
| Dated source discovery | Search across scholarly, archival, community and press sources with date filtering | Candidate sources with publication and observation dates | Visibility bias; ranking is not representativeness; undated pages | Record "date unknown"; triangulate across distinct source types; lower confidence |
| Original-context retrieval | Retrieve the earliest locatable instance and its surrounding context | Locator, context description, earliest-found date | Earliest *found* is not origin; deleted or private material; distributed origins | Record `origin_status: undocumented` or `distributed` |
| Image inspection | Inspect stills for literal content, symbols, gestures, typography, colour in context | Described cues with frame or region locators | Agent and model readings carry training-data bias (Ananthram et al. 2024; Nayak et al. 2024)\[33\]\[34\] | Label as inference; seek community-reported meaning |
| Temporal inspection | Inspect video and audio for editing patterns, sonic cues, timing | Timestamped observations | Rendering, platform and sound-off contexts change reception | Check under the scoped viewing situation; note medium dependence |
| Language/context comparison | Compare usage across languages, locales, communities and time | Documented differences with sample and scope | Translation loses register; sparse sources for some languages | Flag dependency to `ADAPT-*`; seek speaker or community input |
| Optional audience feedback | Consultation or a small qualitative check, run by humans | What was shown, to whom (scope), conditions, responses | Small or unrepresentative; cannot establish prevalence (Malterud et al. 2016) | Record as `checked` with limits; surface remaining uncertainty to `BRIEF-*` |

No specific tool, provider or integration is implied. Live trend monitoring, reference retrieval and audience-testing integration do not exist.

## 11. Candidate rules

All rules are tiered `heuristic`. No published standard or provider documentation governs audience interpretation; localisation guidance (W3C) informs but does not specify these criteria. Tier is separate from verification status.

| ID | Check | Threshold | Tier | Applies to | Evidence | Evaluation method |
| --- | --- | --- | --- | --- | --- | --- |
| `CULTURE-AUDIENCE-SCOPED` | Audience scope exists | Scope records language, location, experience, community, viewing situation and shared knowledge, each marked stated/evidenced/assumed | heuristic | Any piece with consequential cues | Hall 1973; Morley 1980/1983 (secondary) | Structural: fields present |
| `CULTURE-ASSUMPTION-LABELLED` | Evidence vs assumption | Every audience claim labelled evidenced or assumed, with sources for evidenced | heuristic | Records | Proposed convention | Structural plus judgement |
| `CULTURE-RESPONSE-LAYERS-SEPARATED` | Recognition ≠ liking | Recognition, interpretation, emotion and willingness to engage recorded separately | heuristic | Consequential cues | Eisend 2009, 2011 | Structural |
| `CULTURE-INTERPRETATION-SEPARATED` | Intent / report / inference | Creator intent, community-reported meaning and agent inference in separate fields | heuristic | Cultural-reference records | Hall 1973; McQuarrie & Mick 1999 | Structural plus judgement |
| `CULTURE-DECISION-QUESTION-FRAMED` | Research is decision-linked | Each question names the decision it could change; depth matches consequence | heuristic | Research plans | Proposed convention | Judgement |
| `CULTURE-CODE-TYPE-NAMED` | Signification classified | Cue labelled by signification type and by layer | heuristic | Cues | Barthes 1964; Shifman 2013 | Structural |
| `CULTURE-ORIGIN-NOT-INVENTED` | No invented origin | Origin documented with source, or marked distributed or undocumented | heuristic | Cultural-reference records | Rogers 2006 | Judgement against sources |
| `CULTURE-SOURCE-DATED` | Dated evidence | Each source has source date (or "unknown") and observation date | heuristic | Records | Little & Xiao 2025 | Structural |
| `CULTURE-ORIGINAL-CONTEXT-INSPECTED` | Direct inspection | Locator to the inspected original or earliest-found instance; secondary sources labelled | heuristic | Quotation, parody, reference | Proposed convention | Structural plus judgement |
| `CULTURE-MISS-SURVIVAL-STATED` | Recognition dependency | Record states whether the core message survives if the cue is missed | heuristic | Recognition-dependent cues | Phillips 2000; Bünzli & Dillard 2022 | Judgement |
| `CULTURE-FRESHNESS-TRIGGER-SET` | Perishability handled | Time-sensitive evidence has a recheck trigger tied to production or distribution events | heuristic | Contemporary references | Little & Xiao 2025; Weng et al. 2012 | Structural (presence); judgement (fit) |
| `CULTURE-DURABLE-ALTERNATIVE-KEPT` | Durable option | A less reference-dependent treatment is identified for recognition-dependent concepts | heuristic | Concepts relying on contemporary references | Proposed convention | Structural |
| `CULTURE-NO-UNIVERSAL-CLAIM` | No unsupported universals | No universal colour, shape, gesture or personality claim without scoped evidence | heuristic | All analysis | Jonauskaite et al. 2020; Matsumoto & Hwang 2013; Elliot & Maier 2012 | Judgement |
| `CULTURE-ALTERNATIVE-READINGS-LISTED` | Competing readings | At least the intended and the most plausible competing reading listed for consequential cues | heuristic | Consequential cues | Puntoni et al. 2010; Miller et al. 2016 | Structural plus judgement |
| `CULTURE-CORE-MESSAGE-ANCHORED` | Productive vs obscuring ambiguity | Core message received under each listed reading, or adjustment proposed | heuristic | Ambiguous treatments | Puntoni et al. 2010 | Judgement |
| `CULTURE-REPRESENTATION-ACCOUNTED` | Missing voices | Record notes who is represented, whose account is missing, and any applicable community protocol | heuristic | Identity-, community- or heritage-related cues | Rogers 2006; Creative Australia protocols | Judgement |
| `CULTURE-CONSULTATION-SCOPED` | Small-sample limits | Checks record what was tested, scope of participants, conditions, and what cannot be concluded | heuristic | Audience checks | Malterud et al. 2016 | Structural plus judgement |
| `CULTURE-PERMISSION-REFERRED` | Interpretation ≠ permission | Rights and platform questions referred to the provenance concern; no legal conclusions | heuristic | Borrowed material | W3C Internationalization | Structural |
| `CULTURE-METRIC-NOT-MEANING` | Metrics not reception | Engagement, sentiment scores or model agreement not cited as sole evidence of interpretation | heuristic | All findings | Jenkins et al. 2013; Poria et al. 2020; Ananthram et al. 2024 | Judgement |
| `CULTURE-MODEL-INFERENCE-LABELLED` | Model readings labelled | Model-generated readings labelled inference, never community-reported or checked | heuristic | Agent analysis | Ananthram et al. 2024; Nayak et al. 2024 | Structural |
| `CULTURE-HYPOTHESIS-VALIDATION-DISTINGUISHED` | Status honesty | Status is hypothesis unless a recorded check or community report supports otherwise | heuristic | Records | Proposed convention | Structural |
| `CULTURE-RECORD-IN-WORKSPACE` | Containment | Production research stored in the production workspace; previews in ignored outputs | heuristic | All records | Proposed convention | Structural (path) |
| `CULTURE-CHAIN-COMPLETE` | Chain integrity | All five chain links present with evidence labels and contrary-evidence search noted | heuristic | Consequential cues | Proposed convention | Structural plus judgement |
| `CULTURE-LOCALE-DEPENDENCY-HANDED-OFF` | Adaptation handoff | Language- and locale-dependent cues flagged to `ADAPT-*` without duplicating locale rules | heuristic | Multi-locale work | W3C Internationalization | Structural |

## 12. Measurement notes

**Structural checks** (could be automated later) verify presence and form: fields filled, dates present, locators present, status values valid, path in the workspace, trigger present. **They do not verify meaning.** A record can contain an audience scope and a date without establishing that the audience recognises or interprets the cue as claimed.

**Judgement checks** need a human or reviewer: whether the inference follows from the sources, whether competing readings are plausible and complete, whether ambiguity is productive, whether a trigger fits the evidence. `REVIEW-*` owns calibration.

**What cannot establish audience interpretation by itself:**

- **Engagement counts**: they reflect circulation through networks and ranking systems (Jenkins et al. 2013), not representative reception, and they cannot say *which* reading drove a reaction.
- **Sentiment scores**: automated sentiment struggles with sarcasm and irony, which are often apparent "only when put into context" (Poria et al. 2020).\[35\] Farabi et al.'s IJCAI 2024 survey of multimodal sarcasm detection states that "sarcasm detection often requires additional information present in tonality, facial expression, and contextual images." Even human readers disagree on the sentiment of a single pictograph rendering 25% of the time (Miller et al. 2016).\[3\]
- **Model agreement**: several models agreeing is not audience evidence, because agreement can reflect shared training bias. Ananthram, Stengel-Eskin, Bansal & McKeown report that "VLMs perform better on the Western split than on the East Asian split of each task" (Ananthram et al. 2024). The CulturalVQA benchmark (2,378 image–question pairs from 11 countries) found that the evaluated vision-language models show "strong cultural understanding capabilities for North America while significantly lower performance for Africa" (Nayak et al. 2024).
- **Recognition-percentage claims**: no universal recognition percentages, cultural-risk scores, trend lifetimes or minimum sample sizes are given here, because the evidence does not support them.

**What would change a decision:** a dated community report contradicting the intended reading; a recorded check where scoped participants miss the cue or read it against the message; evidence that a reference's meaning shifted after the source date.

## 13. Checklists

### 13.1 Analysis checklist

- [ ] Audience scope recorded, sub-audiences kept separate (`CULTURE-AUDIENCE-SCOPED`, `CULTURE-ASSUMPTION-LABELLED`)
- [ ] Decision-changing question stated; depth proportionate (`CULTURE-DECISION-QUESTION-FRAMED`)
- [ ] Cue classified by signification type and layer (`CULTURE-CODE-TYPE-NAMED`)
- [ ] Sources dated; original context inspected or marked secondary (`CULTURE-SOURCE-DATED`, `CULTURE-ORIGINAL-CONTEXT-INSPECTED`)
- [ ] Origin documented or marked distributed/undocumented (`CULTURE-ORIGIN-NOT-INVENTED`)
- [ ] Intent, community report and inference separated (`CULTURE-INTERPRETATION-SEPARATED`, `CULTURE-MODEL-INFERENCE-LABELLED`)
- [ ] Response layers separated (`CULTURE-RESPONSE-LAYERS-SEPARATED`)
- [ ] Contrary evidence searched; alternative readings listed (`CULTURE-ALTERNATIVE-READINGS-LISTED`)
- [ ] No universal or stereotyped claims (`CULTURE-NO-UNIVERSAL-CLAIM`)
- [ ] Representation and missing accounts noted; protocols checked (`CULTURE-REPRESENTATION-ACCOUNTED`)
- [ ] Metrics not used as meaning (`CULTURE-METRIC-NOT-MEANING`)

### 13.2 Creation checklist

- [ ] Chain complete for each consequential cue (`CULTURE-CHAIN-COMPLETE`)
- [ ] Miss-survival stated; explanation effect considered (`CULTURE-MISS-SURVIVAL-STATED`)
- [ ] Core message survives listed readings, or adjustment proposed (`CULTURE-CORE-MESSAGE-ANCHORED`)
- [ ] Durable alternative identified (`CULTURE-DURABLE-ALTERNATIVE-KEPT`)
- [ ] Recheck trigger set against production and distribution dates (`CULTURE-FRESHNESS-TRIGGER-SET`)
- [ ] Locale dependencies handed to `ADAPT-*` (`CULTURE-LOCALE-DEPENDENCY-HANDED-OFF`)
- [ ] Permissions referred to provenance (`CULTURE-PERMISSION-REFERRED`)
- [ ] Checks recorded with limits (`CULTURE-CONSULTATION-SCOPED`, `CULTURE-HYPOTHESIS-VALIDATION-DISTINGUISHED`)
- [ ] Records in production workspace; previews in ignored outputs (`CULTURE-RECORD-IN-WORKSPACE`)

## 14. Ownership notes

| Concern | Owner | `CULTURE-*` contribution |
| --- | --- | --- |
| General subject research, source evaluation | `DOMAIN-*` (reference only) | Audience-specific meaning only |
| Visual analysis, influence, transferable principles | `VREF-*` (reference only) | What a visual code means *to whom*, not how to analyse or borrow its form |
| Audience meanings, recognition assumptions, context, freshness | `CULTURE-*` | Owns |
| Image briefs, asset selection | `IMAGE-*` (reference only) | Supplies interpretation risks and opportunities |
| Concept, metaphor, humour, scripts | `STORY-*` | Supplies contextual evidence; does not choose the concept |
| Palette, hierarchy, treatment | `ART-*` | Associations inform, never prescribe |
| Audience definition, tone, mandatories, decisions | `BRIEF-*` | Records assumptions and proposed revisions explicitly |
| Localisation, variants | `ADAPT-*` | Supplies cultural dependencies; no duplicated locale rules |
| Severity, calibration | `REVIEW-*` | Interpretation findings stay advisory |
| Asset permissions | Shared provenance concern | Refers; no legal conclusions |

Implementation varies by pillar. Consult the [status table](../README.md): typography has rules data and limited layout checks, Story has six plan checks, and the four research pillars remain reference only.

## 15. Caveats

- **Theory vs evidence.** Hall, Barthes, Shifman and Rogers were consulted via abstracts and secondary summaries; the primary texts of Hall (1973), Barthes (1964) and Morley (1980) were not inspected.
- **Advertising-skewed evidence.** Much of the empirical work comes from advertising research with convenience or student samples; transfer to other formats is a hypothesis.
- **Narrow scope.** Colour terms are not composed images; emblem studies cover fixed message lists and small regional samples.
- **Meme-lifecycle evidence is thin and platform-shaped.**
- **Model bias applies to this agent.** Agent inference never stands in for community-reported meaning.
- **No certification.** Neither the agent nor this method can certify cultural meaning.

## 16. Verification ledger (verified 2026-11-07)

| # | Claim | Result | Source locator |
| --- | --- | --- | --- |
| L1 | Jonauskaite et al. 2020: 4,598 participants, 30 nations; r = .88; nation predicts beyond universal | confirmed (abstract) | https://www.psychologicalscience.org/journals/psychological-science/0956797620948810/ |
| L2 | Matsumoto & Hwang 2013: 70% criteria; six regions; 15 similar emblems | confirmed (author copy, pp. 1–7) | https://link.springer.com/article/10.1007/s10919-012-0143-8 |
| L3 | Miller et al. 2016: 25% disagreement; 304 participants | confirmed | https://experts.umn.edu/en/publications/blissfully-happy-or-ready-to-fight-varying-interpretations-of-emo/ |
| L4 | Hall 1973: three decoding positions | unverified at primary | https://literariness.org/2020/11/07/analysis-of-stuart-halls-encoding-decoding/ |
| L5 | Morley 1980/1983: 29 groups; same class, different decodings | unverified at primary (group-size reports conflict) | http://visual-memory.co.uk/daniel/Documents/short/morleynw.html |
| L6 | Puntoni et al. 2010: purposeful polysemy | confirmed (abstract) | https://repub.eur.nl/pub/20262 |
| L7 | Shifman 2013/2014: meme definition | confirmed (via review) | https://www.digitalhumanities.org/dhq/vol/10/2/000243/000243.html |
| L8 | Barthes 1964: anchorage and relay | unverified at primary | https://www.uv.es/~fores/programa/barthes_rhetoricimage.html |
| L9 | Phillips 2000: anchoring design | confirmed (design); results unverified | https://www.jstor.org/stable/4189131 |
| L10 | Bünzli & Dillard 2022: anchoring aids comprehensibility | confirmed (excerpt) | https://www.tandfonline.com/doi/full/10.1080/1051144X.2022.2053817 |
| L11 | McQuarrie & Mick 1999 | confirmed (abstract) | https://www.jstor.org/stable/10.1086/209549 |
| L12 | Eisend 2009: 369 correlations; lower credibility | confirmed (abstract) | https://www.semanticscholar.org/paper/A-meta-analysis-of-humor-in-advertising-Eisend/42c07f9f81c0e83cbff91afa697d94cf430ae508 |
| L13 | Eisend 2011: vampire effect | confirmed (abstract) | https://link.springer.com/article/10.1007/s11002-010-9116-z |
| L14 | Rogers 2006: four categories | confirmed (abstract) | https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1468-2885.2006.00277.x |
| L15 | Malterud et al. 2016: information power | confirmed (abstract) | https://journals.sagepub.com/doi/abs/10.1177/1049732315617444 |
| L16 | Jenkins et al. 2013: stickiness vs spreadability | confirmed (publisher) | https://nyupress.org/9780814743508/spreadable-media/ |
| L17 | Elliot & Maier 2012 | unverified at primary | https://www.researchgate.net/publication/279871278_Color-in-Context_Theory |
| L18 | Buechner & Maier 2016: red arousal direct, valence context × colour interaction | confirmed (abstract) | https://pmc.ncbi.nlm.nih.gov/articles/PMC5045874/ |
| L19 | W3C localisation scope; legal listed separately | confirmed (full page) | https://www.w3.org/International/questions/qa-i18n \[31\] |
| L20 | Creative Australia protocols | confirmed | https://creative.gov.au/first-nations-arts/protocols-for-using-first-nations-cultural-and-intellectual-property-in-the-arts \[36\] |
| L21 | Ananthram et al. 2024 | confirmed (abstract) | https://arxiv.org/abs/2406.11665 \[33\] |
| L22 | Nayak et al. 2024 | confirmed (abstract) | https://arxiv.org/abs/2407.10920 \[34\] |
| L23 | Poria et al. 2020 | confirmed (excerpt) | https://arxiv.org/pdf/2005.00357 |
| L24 | Farabi et al., IJCAI 2024 survey: sarcasm detection often needs tonality, facial expression and contextual images | confirmed (excerpt) | https://www.ijcai.org/proceedings/2024/0887.pdf |
| L25 | Little & Xiao 2025: 2,126 memes; silhouette 0.27 | confirmed (subagent read) | https://www.aimspress.com/article/doi/10.3934/era.2025238 |
| L26 | Coscia 2013: 499 memes; 178,801 implementations | confirmed (subagent read) | https://arxiv.org/pdf/1304.1712 |
| L27 | Weng et al. 2012 | unverified (snippet only) | https://www.nature.com/articles/srep00335 |
| L28 | Any universal recognition percentage, trend lifetime or minimum sample size | not found | n/a |

## Sources

1. [Universal Patterns in Color-Emotion Associations Are Further Shaped by Linguistic and Geographic Proximity - Psychological Science - APS](https://www.psychologicalscience.org/journals/psychological-science/0956797620948810/)
2. <http://www.davidmatsumoto.com/content/2013%20M%20and%20H%20JNB%20-%20Cultural%20Similarities%20and%20Differences%20in%20Emblematic%20Gestures.pdf>
3. ["blissfully happy" or "ready to fight": Varying interpretations of emoji - Experts@Minnesota](https://experts.umn.edu/en/publications/blissfully-happy-or-ready-to-fight-varying-interpretations-of-emo/)
4. [(PDF) Meaning Matters: Polysemy in Advertising](https://www.researchgate.net/publication/255602160_Meaning_Matters_Polysemy_in_Advertising)
5. [A meta-analysis of humor in advertising](https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Dz4JAqsAAAAJ&citation_for_view=Dz4JAqsAAAAJ:d1gkVwhDpl0C)
6. <https://aimspress.com/aimspress-data/era/2025/9/PDF/era-33-09-238.pdf>
7. [Analysis of Stuart Hall’s Encoding/Decoding](https://literariness.org/2020/11/07/analysis-of-stuart-halls-encoding-decoding/)
8. [David Morley’s Study of the Nationwide Audience](http://visual-memory.co.uk/daniel/Documents/short/morleynw.html)
9. [How humor in advertising works: A meta-analytic test of alternative models - Marketing Letters](https://link.springer.com/article/10.1007/s11002-010-9116-z)
10. [Color-emotion associations are broadly shared across 30 nations, Global Color Meaning Database](https://www.globalcolormeaning.org/entries/gcmd-c01.html)
11. [Color-in-Context Theory](https://www.researchgate.net/publication/279871278_Color-in-Context_Theory)
12. [“Blissfully happy” or “ready to fight”: Varying Interpretations of Emoji](https://jacob.thebault-spieker.com/papers/ICWSM16_emoji.pdf)
13. [Barthes, "Rhetoric of the Image" (abstract)](https://www.uv.es/~fores/programa/barthes_rhetoricimage.html)
14. [Barthes](https://photo-graph.org/2014/10/09/barthes-rhetoric-of-the-image/)
15. [\[PDF\] Visual Rhetoric in Advertising: Text-Interpretive, Experimental, and Reader-Response Analyses](https://www.semanticscholar.org/paper/Visual-Rhetoric-in-Advertising:-Text-Interpretive,-McQuarrie-Mick/f283a99d8449ab06ee2749aad52ad2e95bc1fc71)
16. [“Cultural Appropriation”: Appropriate?](https://www.buquad.com/2013/11/25/cultural-appropriation-appropriate/)
17. [Cultural Reader: Stuart Hall / “Encoding and Decoding in the Television Discourse” - Summary and Overeview](https://culturalstudiesnow.blogspot.com/2025/05/stuart-hall-encoding-and-decoding-in.html)
18. [DHQ: Digital Humanities Quarterly: A Review of Memes in Digital Culture](https://www.digitalhumanities.org/dhq/vol/10/2/000243/000243.html)
19. [Memes in a Digital World: Reconciling with a Conceptual Troublemaker - Shifman - 2013 - Journal of Computer-Mediated Communication - Wiley Online Library](https://onlinelibrary.wiley.com/doi/abs/10.1111/jcc4.12013)
20. [Spreadable Media: Creating Value and Meaning in a Networked Culture - Henry Jenkins, Sam Ford, Joshua Green - Google Books](https://books.google.com/books/about/Spreadable_Media.html?id=M_8TCgAAQBAJ)
21. <https://arxiv.org/pdf/1304.1712>
22. [Competition among memes in a world with limited attention](https://files.core.ac.uk/download/pdf/213840142.pdf)
23. [\[PDF\] The Impact of Verbal Anchoring on Consumer Response to Image Ads](https://www.semanticscholar.org/paper/The-Impact-of-Verbal-Anchoring-on-Consumer-Response-Phillips/f10afaaaadd9d48622b6275a505757541e17c8d8)
24. [How verbal text guides the interpretation of advertisement images: a predictive typology of verbal anchoring](https://academic.oup.com/ct/article/34/4/191/7718069)
25. [From Cultural Exchange to Transculturation: A Review and Reconceptualization of Cultural Appropriation - Rogers - 2006 - Communication Theory - Wiley Online Library](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1468-2885.2006.00277.x)
26. [(PDF) From Cultural Exchange to Transculturation: A Review and Reconceptualization of Cultural Appropriation](https://www.academia.edu/13249060/From_Cultural_Exchange_to_Transculturation_A_Review_and_Reconceptualization_of_Cultural_Appropriation)
27. [Australia Council for the Arts Protocols](https://www.terrijanke.com.au/australia-council-for-the-arts-prot)
28. [First Nations Policy 2024-2029 :: NAVA](https://visualarts.net.au/about/first-nations-policy/)
29. [Indigenous Cultural and Intellectual Property (ICIP) - Arts Law Centre of Australia](https://www.artslaw.com.au/information-sheet/indigenous-cultural-intellectual-property-icip-aitb/)
30. [Sample Size in Qualitative Interview Studies](https://www.semanticscholar.org/paper/Sample-Size-in-Qualitative-Interview-Studies-Malterud-Siersma/1f4a983f42f66540ccbedfca359a5be18769db94)
31. [Localization vs. Internationalization](https://www.w3.org/International/questions/qa-i18n)
32. [Meaning Matters](https://www.semanticscholar.org/paper/Meaning-Matters:-Polysemy-in-Advertising-Puntoni-Schroeder/fd84c9ece79baab6f26b52cc753ef24d0c72f5d2)
33. [\[2406.11665\] See It from My Perspective: How Language Affects Cultural Bias in Image Understanding](https://arxiv.org/abs/2406.11665)
34. [\[2407.10920\] Benchmarking Vision Language Models for Cultural Understanding](https://arxiv.org/abs/2407.10920)
35. [Beneath the Tip of the Iceberg: Current Challenges and New Directions in Sentiment Analysis Research](https://arxiv.org/pdf/2005.00357)
36. [Protocols for using First Nations cultural and intellectual property in the arts](https://creative.gov.au/first-nations-arts/protocols-for-using-first-nations-cultural-and-intellectual-property-in-the-arts)
