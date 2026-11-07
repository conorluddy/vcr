# STORY: Concept Development, Scriptwriting and Storyboarding for Motion Graphics and Short-Form Video

> **Status:** seed reference for the `STORY-*` pillar in VCR (`references/story/`), researched 2026-11-06.
> **Scope:** everything that happens between receiving a brief and building the first scene: concept routes, the one-idea test, visual metaphor and demonstration, scripts (two-column AV, narration for the ear, on-screen copy for the eye, TTS), beat sheets and shot lists, storyboards and style frames, animatics, greybox and blocking passes, review gates, series formats, plan-level measurement, and critique. Timing and structure belong to `PACE-*`. Movement belongs to `MOTION-*`. Production values (tokens, palette, durations, mandatories) belong to `BRIEF-*`. Narration rate belongs to `SOUND-NARRATION-WPM`. Text legibility belongs to `TYPO-*`. Accessibility belongs to `A11Y-*`. This document cites those prefixes and does not restate their numbers.
> **Confidence tiers:** `standard` means a published standard or specification, checked against the primary source (here: file-format specs such as Fountain and OTIO, and SSML vendor documentation). `platform` means published by a platform or vendor, and may change without notice (TikTok, Google/YouTube). `heuristic` means a practitioner rule of thumb, a secondary source, or lab research that no standard has adopted. Every rule is also tagged with its **evidence type**: *audience* (studies or platform data about what viewers do) or *taste* (expert practice).
> **Honesty note:** creative-effectiveness evidence is mostly correlational, drawn from award-entry databanks and vendor panels. Treat it as directional. Very few numbers in this pillar are thresholds in the way a caption CPS figure is; most rules here are structural (does the plan contain X?) rather than numeric.

---

## TL;DR

- **The plan is where renders are saved.** Studios lock decisions in order (concept, script, board/style frames, animatic, animation, final) because each stage is cheaper to change than the next. Pixel Studios Inc.'s production-process guide calls the storyboard "a blueprint: cheap to revise, expensive to skip" and says "Reviewing an animatic is genuinely the last cheap opportunity to restructure a video." An agent should never start polished scene code before an approved concept, script and timed plan.
- **Generate several genuinely different routes, then choose one idea.** Controlled experiments on ad design found that producing multiple prototypes in parallel before feedback beat serial iteration on click-through, expert ratings and diversity (Dow et al., 2010). The finished piece must still pass the one-idea test: a single-minded proposition stated in one sentence, with one mechanism (metaphor, demonstration, transformation, comparison, build-up or twist).
- **One message beats many.** Kantar's Link analysis is summarised as "the more messages an ad attempts to communicate, the lower the likelihood any single message will be communicated strongly"; secondary sources quote the Millward Brown index as 100 for one message falling to 65 with two and 43 with four. The figures' origin is murky, so treat this as a heuristic, not a law.
- **Narration and on-screen text do different jobs.** Mayer's multimedia research finds people learn more when extraneous material is cut (coherence, median d = 0.86 across 23 of 23 tests) and when identical on-screen text is not added to narrated graphics (redundancy). Write narration for the ear, write supers as condensed key phrases for the eye, and keep word counts inside `SOUND-NARRATION-WPM`.
- **A beat is the unit an agent builds.** Every beat needs an ID, purpose, what must be seen, verbatim on-screen text, audio/VO, a duration budget, transitions in and out, sound cues, and links to the brief mandatories and claim sources it satisfies. Most plan checks (word budget, duration sum, mandatory coverage, claim sourcing, board coverage, animatic drift) are mechanical over that structure.
- **Platforms reward front-loaded propositions.** TikTok's help centre says to "Introduce your content proposition in the first 3 seconds" and "Prioritize your hook in the first 6 seconds". Google's ABCDs ask advertisers to "Brand early, often, and richly". These are `platform` rules for ads and social placements, not universal laws; title sequences and art pieces can delay legitimately.
- **Use structured, diff-able formats.** For agents: a JSON beat sheet as the source of truth, Fountain for prose scripts that humans read, OTIO JSON for timelines and animatic markers, and CMX 3600 EDL only for legacy interchange (999 events, 8-character reels).
- **The biggest agent failure modes** are generic, homogenised concepts (the first idea from the training distribution), feature lists dressed as stories, illustrating every noun in the narration, rules over-applied to expressive work, and judging motion from still boards.

---

## Key Findings

1. **Changes get more expensive at every gate, and the animatic is the last cheap restructure.** Practitioner studio process writing describes each phase as existing "to lock in a decision before the next, more expensive phase begins" (Pixel Studios Inc., 2026).\[1\] Austin Visuals warns that a change after approval "can require rework at that stage and every stage that followed".\[2\] This is practitioner consensus (*taste*). No independent cost study was found.
2. **Story reels (animatics) are how feature animation de-risks story.** Pixar's own teaching material defines the story reel as "a rough draft of the film in video form", built from boards, scratch dialogue, effects and music.\[3\] Pixar iterates reels many times before production. Lasseter's remark that a reel that is not working "will never be improved by all this animation" is reported secondhand (*taste*, high-authority practitioner).\[4\]
3. **Parallel exploration produces better and more diverse work.** In Dow et al. (ACM TOCHI 2010), participants who made multiple ad prototypes before feedback outperformed serial iterators on both click-through data and expert ratings, produced more divergent designs, and gained self-efficacy (*audience* + lab evidence; a single study in one domain).\[5\]
4. **Creativity is a multiplier, but the award-to-effectiveness link has weakened.** Binet & Field's *The Long and the Short of It* (996 campaigns, 700 brands, 83 categories) reports annualised ESOV efficiency of 2.8 for creatively awarded campaigns against 0.3 for others.\[6\] Field's 2019 *Crisis in Creative Effectiveness* (almost 600 cases, 1996–2018) found creatively awarded work "now no more effective than non-awarded", which he blames on short-termism (*audience*, correlational, award-entry sample).\[7\]\[8\]
5. **Recurring creative devices correlate with business effects.** System1/IPA analysis reports that campaigns with a "fluent device" (a recurring character or scenario) are 73% more likely to report a large profit gain.\[9\] Other System1 releases give different percentages: 30% more likely to increase profit gains, 37% for market share. Fluent-device use among IPA entries fell from 41% in 1992 to 12% (*audience*, vendor research, inconsistent figures).\[10\]
6. **Message count is inversely related to message take-out.** Kantar's Link database analysis shows playback of each key message falling as ads go from 1 to 2 to 3+ messages.\[11\]\[12\] Kantar Millward Brown's *Make a Lasting Impression* release of 16 May 2017 analysed more than 1,000 ads from its database of 160,000 tested ads: typically 30% of viewers took out the key message of a single-message ad, against 14% for the first message of a three-message ad (*audience*, vendor data).\[13\]\[14\]
7. **Cut extraneous material; don't caption narration verbatim.** Mayer & Fiorella's handbook chapter reports coherence (23/23 tests, median d = 0.86), redundancy (16/16, median d = 0.86), spatial contiguity (22/22, median d = 1.10) and temporal contiguity (9/9, median d = 1.22).\[15\]\[16\] Cromley & Chen's 2025 multilevel meta-analysis of Mayer's corpus (*Educational Research Review*; 92 articles, 181 studies, 591 effects, overall g = 0.37) found smaller effects, for example multimedia g = 0.39 against Mayer's median d = 0.68.\[17\]\[18\] So the direction is robust and the magnitudes are inflated (*audience*, lab learning research).
8. **Visual metaphors vary in processing demand.** Phillips & McQuarrie (2004) classify visual figures by structure (juxtaposition, fusion, replacement) crossed with meaning operation (connection, similarity, opposition), giving nine types. They predicted complexity rises from juxtaposition to replacement.\[19\] Later empirical work partly contradicts the predicted liking and elaboration ordering (*audience*, mixed).\[20\]
9. **Short-form platforms specify the opening, not the whole arc.** TikTok's help centre recommends a hook, unique selling points and "a clear call-to-action", with the proposition in 3 seconds and the hook prioritised within 6.\[21\]\[22\] TikTok's "Creative Codes" blog (Creative Code #4, footnote 6) claims "90% of ad recall impact is captured within the first six seconds"; a secondary source attributes this to a TikTok Marketing Science/Kantar analysis of 3,500 ads, which is unverified.\[23\]\[24\] Google reports the ABCDs deliver "a 30% lift in short-term sales likelihood and a 17% lift in long-term brand contribution", citing Google/Kantar's "The Short & the Long of ABCDs Effectiveness" (global, April 2021, 11,000 ads) (*platform*, self-reported).\[25\]\[26\]
10. **Machine-readable formats already exist for every planning artefact.** Fountain is an open plain-text screenplay syntax with sections and synopses that do not print.\[27\]\[28\] OTIO is a JSON timeline model with tracks, clips, markers and free metadata, and is explicitly "not however, a container format for media".\[29\] FDX is undocumented vendor XML.\[30\] CMX 3600 EDL is capped at 999 events and 8-character reel names (*standard* for Fountain and OTIO; secondary for FDX and EDL).\[31\]

---

## 1. Concept development

**Research inputs.** [Domain Exploration §1–5](../domain-exploration/README.md) supplies decision-linked evidence and opportunities (`DOMAIN-OPPORTUNITY-CHAIN`); [Visual Research §4](../visual-research/README.md) supplies transferable principles and fixation management (`VREF-FIXATION-MANAGED`). Story owns the developed concept and route cards. Research opportunities are inputs, not already selected routes.

### 1.1 What a concept is (and is not)

A **concept** is a single idea that makes the proposition memorable, plus the **mechanism** that dramatises it. It is not the proposition itself ("our app saves time"), not a mood ("dark, premium, kinetic"), and not a format ("three-scene explainer").

A useful test is to fill a three-slot sentence:

> *"We show [proposition] by [mechanism] so the viewer feels/understands [single takeaway]."*

If any slot is empty or plural, the concept is not ready.

**Strong concept properties** (practitioner consensus, *taste*):

| Property | Description | Example shape |
|---|---|---|
| Single-minded | One proposition, statable in one sentence, with no "and" joining two benefits | "Your files are always where you left them." |
| Mechanism named | A visual metaphor, demonstration, transformation, comparison, build-up or twist | A demo: a file follows the viewer across three devices in one continuous move |
| Turn | A moment where understanding or feeling changes (a reveal, reversal or payoff) | The "three devices" are revealed to be the same desk, shot at three times of day |
| Ownable | Could not run unchanged for a competitor; uses or builds distinctive assets | The brand's colour becomes the "thread" that the file travels along |
| Buildable | Achievable in the toolchain and budget at the target quality | 2D vector plus one camera move, not photoreal fluids |

**Weak concept patterns** (the named failure modes):

- **"It's a list."** Features or benefits presented in sequence with no organising idea. Signature: beats that could be reordered without loss.
- **"Mood with no idea."** A style frame and a music reference, with nothing that happens.
- **"Tell, don't show."** The narration states the benefit and the picture decorates it.
- **"Too many messages."** Two or more propositions competing; see Finding 6.\[32\]
- **"Category wallpaper."** The concept could belong to any brand in the category, which is the typical output of an agent sampling the median of its training data.

### 1.2 How studios generate and choose

- **Diverge, then converge.** Agencies and studios develop several routes before selecting one. The evidence base for parallel exploration is Dow et al. (2010): parallel prototyping produced better results, more divergence, and less defensiveness under critique than serial iteration.\[33\] The research does not prescribe a number of routes. "Three routes" is common agency practice and folklore with no traceable origin, so this document makes it a `heuristic` (`STORY-ROUTES-COUNT`).
- **Pixar's practice** at feature scale: directors develop several story ideas to pitch. A secondary account says three ideas each over 4–5 months; that figure is unverified and should not be relied on.\[34\]
- **Make routes genuinely distinct.** Routes must differ in *idea or mechanism*, not only in palette or typeface. Three colourways of one idea are one route. A cheap check is to write each route's three-slot sentence: if two share the mechanism and takeaway, merge them.
- **Converge with criteria, not taste alone.** Score each route against the brief's objective, single-mindedness, ownability (distinctive assets per `BRIEF-*`), buildability, and the risk of misreading.

### 1.3 Presenting routes so a human can choose

Each route card should carry:

1. **Name**: two to four words, evocative.
2. **One-line idea**: the three-slot sentence.
3. **Mechanism**: one of metaphor, demonstration, transformation, comparison, build-up or twist (or a named hybrid).
4. **Key frame**: one thumbnail or style frame at the delivery aspect, showing the *moment of the idea*, not the logo end card.
5. **Beat outline**: three to seven lines.
6. **Why it works**: tie it to the brief objective and audience.
7. **Risk**: what could misread, what is hard to build, and what depends on assets we don't have.
8. **Cost signal**: relative build effort (S/M/L) and render-heavy elements.

Present the routes side by side, ordered by recommendation, with the recommendation stated. Do not present one strong route padded with two strawmen; reviewers notice and lose trust.

### 1.4 Evidence on creativity and effectiveness (labelled)

| Claim | Source | Strength | Use in VCR |
|---|---|---|---|
| Creatively awarded campaigns: annualised ESOV efficiency 2.8 against 0.3 | Binet & Field, *The Long and the Short of It* (IPA presentation)\[6\] | Correlational; IPA Effectiveness Awards entries are self-selected | Justifies spending plan effort on idea quality |
| "11 times as efficient" at driving share growth | Binet & Field, *The Link Between Creativity and Effectiveness* (Thinkbox/IPA), seen via secondary compilations\[35\]\[36\] | Secondary, figure-level | Do not quote as a threshold |
| Award-effectiveness advantage collapsed (about 12× before 2008 to 4×, now "no more effective") | Field, *Crisis in Creative Effectiveness*, IPA 2019; multiplier figures reported by Contagious (secondary)\[7\]\[8\] | Correlational | Creativity must serve a long-term idea, not award tricks |
| High-performing awarded campaigns "eight times more effective" than low-performing peers | IPA 2019, quoted by Campaign\[37\] | Correlational | The *kind* of creativity matters |
| Fluent devices: 73% more likely to report large profit gain | System1/Orlando Wood with IPA\[9\] | Vendor analysis; percentages vary between releases | Supports recurring devices in series (§8) |
| ABCDs: +30% short-term sales likelihood, +17% long-term brand contribution | Google/Kantar, "The Short & the Long of ABCDs Effectiveness" (global, April 2021, 11,000 ads), cited on Google Ads Help\[25\] | Platform self-report | `platform` rules for ads |

**Interpretation for an agent.** The evidence says ideas and distinctiveness are worth investing in. It does not say which idea is good, and it does not supply thresholds. Use it to justify the gates and the one-idea test, never to score a specific concept numerically.

---

## 2. Visual metaphor and demonstration

**Bound the mapping and audience assumption.** Use `DOMAIN-ANALOGY-BREAK` to state where the analogy fails, then [Cultural Context §3–5](../cultural-context/README.md) for `CULTURE-MISS-SURVIVAL-STATED` and competing readings. `STORY-METAPHOR-LEGIBLE` judges the resulting mechanism; the cultural reference supplies evidence about recognition, not a guarantee of comprehension.

### 2.1 The six mechanisms for explaining the abstract

| Mechanism | What it does | Works best when | Typical failure |
|---|---|---|---|
| **Metaphor** | Maps an unfamiliar target onto a familiar source (data as water, security as a lock) | The source is instantly familiar to the audience and the mapping holds for the key attribute | Cliché (lightbulb = idea), or a mapping that breaks on the attribute that matters |
| **Demonstration** | Shows the thing doing the thing | The product's behaviour is visible and the claim is concrete | A "demo" of UI that is too small to read at 9:16 (cite `TYPO-*`) |
| **Transformation** | One state morphs into another (before to after, problem to solution) | The change *is* the message | Morph for its own sake; the viewer can't tell what changed |
| **Comparison** | Juxtaposes two states, options or scales | The difference is the message (speed, size, cost) | Unequal framing that looks like cheating; no shared baseline |
| **Build-up** | Accumulates parts into a whole (a system, a stack, a total) | The message is "these pieces combine" | Turns into a list; no payoff when the whole assembles |
| **Twist/reveal** | Withholds, then recontextualises | There is a genuine reversal and time to land it | A twist with no setup, or a reveal after the viewer has scrolled away |

### 2.2 Visual metaphor structure (Phillips & McQuarrie)

The typology crosses **visual structure** with a **meaning operation**:

- **Visual structure:**
  - *juxtaposition*: both elements shown side by side;\[38\]
  - *fusion*: the elements merged into one object;\[38\]
  - *replacement*: one element absent and inferred from context.\[38\]
- **Meaning operation:** *connection*, *comparison for similarity* or *comparison for opposition*.\[39\]

Together these give nine types. The authors predicted processing demand rises from juxtaposition through fusion to replacement.\[19\] Later studies found juxtaposition sometimes elicits *more* elaboration, and found liking does not rise monotonically, so the predicted ordering is contested.\[20\]

**Practical guidance (heuristic):**
- In motion, **a fusion can be animated as a transformation**: start juxtaposed, then fuse. This lets the viewer acquire both domains before the hybrid appears, which reduces misreading of complex figures.
- Use **replacement only when the context makes the absent element unmistakable**, and when the audience shares the cultural reference. Replacement is the most culture-bound structure.
- In vertical short-form with sound off, prefer structures readable in **one glance per beat** (juxtaposition or an animated fusion) over replacement.

### 2.3 When literal beats metaphorical

Prefer literal (show the actual product, data or process) when:
- precision matters (data stories, safety, finance, medical): a metaphor can imply properties the data does not have;
- the product's behaviour is already visually interesting, so demonstration is the idea;
- the audience is expert, since a metaphor can patronise;
- the claim is regulated, because literal depiction keeps claim and evidence aligned (`STORY-CLAIM-SOURCE`).

Prefer metaphor when the subject is invisible (latency, trust, security, emotions), when the literal picture is a screen of text, or when distinctiveness matters more than precision.

**Hybrid pattern:** open on the metaphor to get attention and an intuition, then cut to the literal proof. This is the "hook, then proof" shape that TikTok's hook / selling points / CTA structure and Google's Attract/Connect both describe.

### 2.4 The failure of illustrating every word

"Illustrating the narration" is the agent's most predictable explainer failure. Each noun in the voiceover gets its own icon: "Our *platform* connects *teams* across *time zones*" becomes platform icon, people icon, globe icon. The result:
- breaks coherence, because extraneous visuals compete with the essential ones (Mayer's coherence principle);
- raises the visual change rate without adding meaning, which is a `PACE-*` issue;
- yields no turn and no idea; it is a list rendered in icons.

**Rule:** the picture should carry *what the words can't*: the relationship, the change, the scale, the proof. Narration and visuals should be complementary and temporally aligned (Mayer's temporal contiguity, median d = 1.22), not duplicative.\[16\] Measurable proxy: the ratio of new visual elements introduced to content nouns in the VO line, per beat (`STORY-NO-WORD-ILLUSTRATION`). It is heuristic and flags for human review; it is not a hard fail.

---

## 3. Scriptwriting

### 3.1 Formats

- **Two-column AV script**: the standard for commercials, explainers, corporate and training video. Each row is a moment: VIDEO (what we see) beside AUDIO (VO, dialogue, music, SFX), with a duration column that practitioners describe as "optional in principle, essential in practice".\[40\] Practitioners recommend giving **on-screen text its own column**, because supers, lower thirds and legal lines are read, not heard; inside the audio column they get recorded by mistake or dropped.\[41\]
- **Lead column:** write the audio column first when words carry the film (explainers, testimonials). Write the video column first in visual spots, and let the VO answer the pictures.\[41\]
- **Screenplay format (Fountain/FDX)** suits dialogue-driven narrative pieces (character shorts, sketches). It is rarely right for motion-graphics explainers.\[42\]
- **For VCR:** the canonical artefact is a **beat sheet JSON** (§4) from which an AV-table view is rendered for the human. Add a third column, ON-SCREEN TEXT, and a fourth, DURATION.

### 3.2 Writing for the ear and for the eye

**Narration (ear):**
- One idea per sentence. Front-load the subject and the verb. Avoid nested clauses the listener must hold in memory.
- Use spoken numbers sparingly; round where the brief allows, and put the precise figure on screen.
- Repeat key terms rather than swapping in synonyms. The ear can't scan back, and elegant variation reads as a new concept.
- Signal structure aloud ("Three things changed. First…"), which echoes Mayer's signalling principle. Pooled signalling effects are modest: d ≈ 0.38 in Alpizar et al.'s meta-analysis.\[43\]
- Read it aloud (or TTS it) and time it. If you stumble, the listener will too.

**On-screen copy (eye):**
- Key phrases, not sentences. The super should be the *takeaway*, not a transcript.
- Do not put verbatim narration on screen alongside narrated graphics. Mayer's redundancy principle (graphics + narration beats graphics + narration + identical text; median d = 0.86) applies to learning-oriented explainers.\[43\] **Captions for accessibility are a separate track governed by `A11Y-*` and are not "redundant on-screen text" in this sense.**
- **Muted placements invert the priority.** If the placement is mostly watched muted, on-screen text must carry the proposition on its own (condensed, not verbatim). Readability limits belong to `TYPO-*` (for example `TYPO-CAPTION-CPS`) and `PACE-*`. TikTok's "5–10 words per second" text guidance appears only in secondary sources and was not verified against TikTok's page; do not use it.\[44\]\[45\]

### 3.3 Word count by duration

The word budget is `duration_s × SOUND-NARRATION-WPM / 60`, minus the seconds reserved for VO-free beats (logo, music stings, reveals, the breath after a turn). This document deliberately does not restate the WPM value; take it from `SOUND-NARRATION-WPM` and from the project's TTS voice measurement. The two-column template tools surveyed time scripts across a user-selectable range of rates rather than a single standard, which confirms that rate is a production parameter, not a constant.\[46\]

**Practical rules:**
- Budget against the *measured* rate of the actual voice (human take or TTS output), not a nominal rate. Re-measure after the first TTS render.
- Reserve VO-free time explicitly in the beat sheet (`vo: null`). A script that fills 100% of runtime with words leaves no room for a turn to land.

### 3.4 Structures by genre

These are skeletons, not mandates. Beat durations come from `PACE-*` and the brief.

| Genre | Skeleton | The "turn" usually sits | Notes |
|---|---|---|---|
| **Explainer** | Problem → why it matters → how it works (mechanism) → benefit → next step | At "how it works": the mechanism reveal | Boords' worked example follows problem → how it works → benefit → next step\[47\] |
| **Ad (social, performance)** | Hook → unique selling points/proof → CTA | In the hook (a surprise or suspense) or at the proof | TikTok help centre structure; proposition in 3 s, hook within 6 s\[21\] |
| **Ad (brand, long-term)** | Situation → tension → resolution involving brand → brand/end line | At resolution | Google's ABCD playbook describes a "heartbeat" arc for YouTube: "a strong cue followed by multiple peaks, unexpected shifts and brand cues throughout"\[48\] |
| **Product launch** | Tease (withhold) → reveal → 2–3 proof demos → availability/CTA | At reveal | The reveal must be earned by the tease; no reveal in frame 1 unless the platform demands it (then reveal and *re-reveal* the detail) |
| **Title sequence** | Tone establishment → motif development → credits rhythm → title card | Often at the title card or a motif's final transformation | Free of message constraints; the "idea" is a motif or metaphor for the show's theme |
| **Data story** | Question → context/baseline → the surprising comparison → implication | At the comparison | Segel & Heer's "martini glass" (author-driven, then reader-driven) suits interactive work; video is fully author-driven (their Film/Video/Animation genre)\[49\] |
| **Music visual** | Follows song sections (intro/verse/chorus/drop) | At the drop or chorus | Beats come from `markers`; structure is owned by the music, see `SOUND-*` and `PACE-*` |

### 3.5 Drafts and table reads

- **Draft 0:** the three-slot sentence plus a beat outline (no prose).
- **Draft 1:** full AV script with word counts per row.
- **Table read:** read aloud (or TTS) against a timer. Mark stumbles, unclear antecedents, and any line where the picture must carry meaning the words don't state.
- **Cut pass:** remove every line that doesn't serve the single-minded proposition. Expect to cut.
- **Lock:** the script is locked at the script gate. Wording changes after the animatic cost re-timing everything downstream.\[2\]

### 3.6 TTS-specific writing

- **Normalise before synthesis.** Engines guess how to read numbers, dates, units, acronyms and symbols. Either write them out in the script ("twenty-four frames per second") or mark them up.
- **SSML `say-as`.** Google Cloud TTS supports `<say-as interpret-as="…">` with values including `cardinal`, `ordinal`, `characters`, `date` and `telephone`. Its documentation gives the example that `cardinal` reads 12345 as "Twelve thousand three hundred forty five" in US English and "…and forty five" in UK English.\[50\] **SSML 1.1 does not standardise the list of `interpret-as` values;** they are vendor conventions, so check them per engine.\[51\] Tier: `standard` (vendor doc) for each engine's own documentation; do not assume portability.
- **Pronunciation lexicon.** Every brand name, product name, acronym and non-dictionary word needs a pronunciation entry (SSML `sub`/`phoneme` or the engine's lexicon) checked by ear once and then reused across a series.
- **Determinism.** VCR requires deterministic audio. Pin the voice ID, engine version and markup, and cache the rendered audio by hash of (text, SSML, voice, engine). Re-synthesis can change timing; any change invalidates the animatic timing.
- **Prosody.** Use `break` sparingly at structural boundaries, such as the beat before a turn. Over-marked SSML sounds robotic.

---

## 4. Shot lists and beat sheets

### 4.1 From script to beats

A **beat** is the smallest unit with one purpose: one thing the viewer must see, understand or feel. A row in the AV script may hold one or several beats. Split a row whenever the purpose changes.

### 4.2 Minimum beat record (what a builder needs to work without asking)

| Field | Content | Why it's required |
|---|---|---|
| `id` | Stable, such as `B03` | References from boards, scenes and reviews |
| `purpose` | One sentence: what this beat makes the viewer understand or feel | Lets the reviewer test "does it land?" |
| `must_show` | Concrete visual content (objects, states, relationships) | The builder's spec |
| `on_screen_text` | Verbatim copy, or `null` | Typography and lint (`TYPO-*`) need exact strings |
| `vo` | Verbatim narration, or `null` | Word budget, TTS |
| `duration_s` | Budget in seconds (and frames at the project fps) | Sum check; `PACE-*` |
| `transition_in` / `transition_out` | Cut, match cut, morph, wipe, camera move… | Continuity between scenes; `MOTION-*` |
| `sound_cues` | SFX/music hits with relative time | `SOUND-*`; becomes `markers` |
| `mandatories` | IDs of brief mandatories satisfied | Coverage check (`STORY-MANDATORY-MAP`) |
| `claims` | IDs of claims made, each linked to a source | `STORY-CLAIM-SOURCE` |
| `board_frames` | IDs of board frames | Coverage check |
| `aspects` | Delivery aspects this beat appears in, with per-aspect notes | Multi-aspect deliveries |
| `notes` | Intent, references, risks | Human context |

A beat missing `purpose`, `must_show`, `duration_s` or the transitions is not buildable. An agent will invent the missing piece, and the invention is where homogenised output creeps in.

### 4.3 Duration budgeting

- The sum of beat durations must equal the target runtime (per `BRIEF-*`) exactly, in frames at the project fps. Any VO-free "air" is itself a beat.
- Beat density (beats per second of runtime) is reported as a metric. Acceptable ranges are owned by `PACE-*`. This pillar flags plans whose density falls outside the `PACE-*` range for the genre and placement.
- Any beat with on-screen text must be long enough to read that text. The reading-time model belongs to `TYPO-*` and `PACE-*`, so cite it; don't recompute.

### 4.4 Example (abbreviated, JSON)

```json
{
  "piece": "launch-teaser-916",
  "fps": 30,
  "target_s": 15,
  "smp": "Your files follow you, not your device.",
  "mechanism": "demonstration",
  "beats": [
    {"id":"B01","purpose":"Stop the scroll: a file visibly leaves a laptop","must_show":["laptop","file card lifting off screen"],
     "on_screen_text":"Where's it going?","vo":null,"duration_s":2.5,
     "transition_in":"cold open","transition_out":"match-cut on file card",
     "sound_cues":[{"t":0.4,"cue":"whoosh-up"}],"mandatories":[],"claims":[],"board_frames":["F01","F02"]}
  ]
}
```

---

## 5. Storyboards

### 5.1 What a board frame must carry

- **Composition at the delivery aspect**: framing, focal element, hierarchy, and safe zones (`TYPO-SAFE` for placement).
- **Key text verbatim**, positioned roughly where it will sit.
- **Motion notation**: arrows for object and camera movement, start and end positions, and easing intent where it matters (detailed movement belongs to `MOTION-*`).
- **Timing**: beat ID, frame time or duration, and VO/SFX under the frame.
- **Notes**: transition into the next frame, any effect, and the purpose line.

### 5.2 Thumbnails vs finished boards vs style frames

| Artefact | Fidelity | Purpose | When |
|---|---|---|---|
| **Thumbnails** | Stick figures, boxes, arrows | Explore staging and sequence quickly; many options per beat | Concept and script stages |
| **Boards** | Clear composition, readable text, motion notes | Communicate the sequence to the builder and the approver | After script lock |
| **Style frames** | Final-quality stills of key moments | Lock the *look* (palette, type, texture, lighting) | Parallel to or just after boards |

Practitioners disagree on the number and order of style frames. One review-software vendor says 3–4 representative frames usually suffice to lock a look (marketing source); Motion Forward Design keeps styleboards to "4-6 frames".\[52\]\[53\] Some studios put the storyboard before style frames and others the reverse.\[52\]\[54\] **Rule:** at least one style frame per *distinct visual world* in the piece, chosen from the beats that carry the idea, not the logo end card.

### 5.3 Boards for 9:16 against 16:9

- Draw boards **at the delivery aspect**. A 16:9 board cropped to 9:16 loses side information and lands text in platform UI zones.
- For multi-aspect deliveries, board the **hero aspect** fully, then board **key frames per additional aspect** wherever composition changes (not just a crop). Typical change points are text blocks, side-by-side comparisons, and wide establishing shots.
- In 9:16, comparisons that sit side by side in 16:9 usually become stacked or sequential. That changes timing, so update the beat sheet, not just the board.

### 5.4 Handing boards to builders (agents)

- Every frame links to a beat ID; every beat links to frames.
- Include start and end frames for any beat with significant motion; one still cannot specify motion.
- State what is *fixed* (copy, composition, the idea moment) and what is *builder's discretion* (secondary motion, texture), to stop the builder over-literalising the board.

---

## 6. Animatics and previz

### 6.1 Timing a board to scratch audio

Place the board frames on a timeline at their beat durations, over scratch VO (a TTS or guide read), temp music and key SFX. In VCR this can be a cheap browser scene that shows stills or greybox elements with a real `duration`, `seek(t)` and `markers`. It renders with the same pipeline, so its timing is the real timing.

Pixar's definition of the story reel ("a rough draft of the film in video form") and its iterative loop of re-cutting reels before production are the canonical model.\[3\]\[55\] School of Motion describes the animatic as "a rough visual preview of your animation, timed to the voice over and/or music", which allows client feedback "before you've actually animated anything".\[56\]

### 6.2 What an animatic proves and what it can't

**It proves:**
- the total runtime and per-beat timing;
- whether the VO fits the picture;
- the order and logic of the story;
- whether the turn lands with enough air;
- music and SFX sync points;
- whether each beat is legible at speed.

**It cannot prove:**
- the final motion quality, easing and secondary animation (`MOTION-*`);
- the final look and texture (style frames do that);
- performance in feed against real competition;
- render cost;
- how text holds up after platform re-encoding (§17).

**Agent pitfall:** do not judge motion from boards or animatic stills. Animatic approval is approval of *structure and timing*, not of movement.

### 6.3 When to skip (or shrink) it

| Situation | Animatic? |
|---|---|
| Single still or poster | No; use a thumbnail and then a style frame |
| Loop of 6 s or less with no VO and one motion idea | Shrink it to a greybox of the loop with the seam visible |
| Episode N of a series with a locked template, only content changes | A beat-sheet timing check plus TTS timing may replace a full animatic, provided the template animatic was approved |
| Any piece with narration, a turn, or multiple beats | Yes |
| Music-led piece | Yes: board-to-markers timing is the main risk |

### 6.4 Greybox and blocking passes

- **Greybox:** flat shapes standing in for final elements, with real positions, scale and timing, plus the camera. It catches composition collisions, text overflow, safe-zone violations and camera problems before polish.
- **Blocking pass:** key poses and positions on beat with no easing polish (stepped or linear). It catches structural timing problems.
- In Blender: low-sample viewport or Workbench renders. In browser scenes: placeholder rectangles carrying the real text strings, so `vcr lint` (safe zones, overflow) can run on them.
- A blocking pass is cheap enough that it should precede polish for any beat with camera moves, 3D, or text interacting with motion.

---

## 7. Review gates

**Implementation boundary.** The sequence below is proposed production practice. Plan approvals are not implemented; the current approval contract is keyed to renders. Follow the user's established review scope, use existing approval channels where applicable, and never invent approval records or treat these research steps as additional mandatory pauses.

### 7.1 Typical gates and what the human approves

| Gate | Human approves | Typical rounds (practitioner, *taste*) | Cost of change after this gate |
|---|---|---|---|
| **Concept** | Route choice; SMP; mechanism; key frame | — | Low before; a later change restarts everything |
| **Script** | Locked words (VO and on-screen), claims, mandatories | ~2 (Austin Visuals) | Re-timing, re-boarding, re-TTS |
| **Style frames** | Look: palette, type, texture | ~1 (Austin Visuals) | Re-skinning every scene |
| **Storyboard** | Composition and sequence per beat | 1–2 | Re-layout |
| **Animatic** | Timing, structure, sync | 1 | "Last cheap opportunity to restructure" (Pixel Studios Inc.) |
| **First cut / animation** | Motion, polish, sound mix | 1–2 | Rebuilding sequences |
| **Final** | Delivery specs, legal, captions | Fixes only | Re-render and re-encode |

The stage order varies by studio; for example, Lucid Motion Studio lists "Script, storyboard, style frames, preview and final: each is signed off before the next begins."\[57\] The round counts are studio marketing figures. Treat them as *typical*, not normative.

### 7.2 Gates an AI agent should never skip

1. **Concept gate.** Never build a polished scene without a human-approved route. This prevents the most expensive waste: well-executed wrong ideas.
2. **Script gate**, covering words, claims and mandatories. Changing locked wording later breaks the timing, the TTS and the boards.
3. **Timed-plan gate** (animatic, or for template episodes a timing check against the approved template animatic). This proves the runtime and structure before polish.
4. **Final gate.** A human views the encoded delivery file, not the PNG frames.

The agent may merge the style-frame and board gates for small pieces, and may run boards as greybox scenes. It may not merge concept with script for a new format, because a human must approve the idea before the words are written to it.

### 7.3 Feedback hygiene at gates

- Ask for a decision *at the gate's level*: at the concept gate, "which idea?"; at the animatic gate, "timing and order?". Polish notes on an animatic are logged and deferred.
- Record each approval with what was approved (hash of beat sheet, script and boards) so later changes are detectable as gate regressions.

---

## 8. Series formats

- **Episode template.** A fixed slot structure (for example cold-open hook / setup / mechanism / payoff / sign-off), each slot with a duration range and purpose. The template is approved once, through the full gates. Episodes then go through concept-lite (the hook and the payoff), script and timing checks.
- **Series bible.** Tokens, palette, recurring assets and durations live in the `BRIEF-*` series brief. This pillar owns the story-level checks.
- **Story bank.** A list of candidate episode ideas, each with an SMP, mechanism, hook type and payoff, and with source links for claims. The bank lets an agent choose for variety across a run rather than generating episodes one at a time.
- **Fluent device.** A recurring character, scenario or structural device that drives the creative across episodes. System1/IPA data associates fluent devices with large profit gains (73% more likely, per one release; figures vary).\[58\]\[59\] For series, design one in deliberately.
- **Avoiding repetition.** Track the hook type, mechanism, metaphor source domain and opening line per episode. Flag:
  - consecutive episodes sharing a hook type *and* a mechanism;
  - a metaphor source domain reused within a window set in the brief;
  - opening lines with high lexical similarity.
  Variety lives inside the template; the device and the structure stay fixed.
- **Expressive exception:** a deliberate running gag or refrain is repetition by design. Mark it in the bible so the repetition check whitelists it.

---

## 9. Measurement: what can be checked before rendering

### 9.1 Plan-level checks

| Check | Input | Calculation |
|---|---|---|
| Word budget | Script VO text; target duration; `SOUND-NARRATION-WPM` | `words ≤ (Σ VO-beat durations) × wpm / 60` |
| Duration sum | Beat sheet | `Σ duration_frames == target_frames` |
| Beat density | Beat sheet | `beats / target_s`, compared against the `PACE-*` range |
| Mandatory coverage | Brief mandatories; beat `mandatories` | Every mandatory ID appears in ≥1 beat |
| Claim sourcing | On-screen text and VO; claims registry | Every numeric or comparative claim maps to a source ID |
| Board coverage | Beats; board frames | Every beat has ≥1 frame; motion beats have ≥2 |
| Animatic timing | Animatic `markers`; beat sheet | Per-beat start drift ≤ 1 frame; total = target |
| SMP form | SMP string | One sentence; no conjunction joining two benefits (flag only) |
| Hook window (ads/social) | Beat sheet | Proposition beat starts within the platform window |
| TTS normalisation | VO text | No unnormalised digits, symbols or unknown tokens without SSML or a lexicon entry |

### 9.2 Machine-readable formats

| Format | What it is | Strengths for agents | Weaknesses | Recommendation |
|---|---|---|---|---|
| **Beat sheet JSON (VCR-native)** | Custom schema (§4.2) | Fully structured, diff-able, validates against a schema | Not an industry standard | **Source of truth** |
| **Fountain** | Open plain-text screenplay markup; UTF-8 `.fountain` files\[27\]\[60\] | Human-readable; `#` Sections and `=` Synopses don't print, so they can hold beat IDs; `/* */` boneyard comments\[28\] | Screenplay-centric; no AV columns; no timing; excludes production features "such as MOREs, CONTINUEDs, revision marks"\[27\] | Use for dialogue-driven narrative pieces; generate from the beat sheet |
| **Final Draft FDX** | Vendor XML: `<FinalDraft><Content><Paragraph Type="…">` | Typed paragraphs (Scene Heading, Action, Character, Dialogue…) | No public spec found; layout-heavy | Import/export only, when a human uses Final Draft\[61\] |
| **OTIO** | Open JSON timeline (`Timeline → Stack → Track → Clip`), with markers and free `metadata` on most objects;\[29\]\[62\] `RationalTime` (value, rate) | Precise rational time; markers map to beats; adapters to EDL, FCP XML and others | Editorial model, not a script | **Animatic and timeline interchange**; store beat IDs in clip/marker metadata |
| **CMX 3600 EDL** | Fixed-column text edit list | Universal NLE import | Max 999 events, 8-char reel names, 4 audio channels; no titles or effects metadata | Legacy interchange only\[31\] |

---

## 10. Critique practice

### 10.1 Creative-director vocabulary, mapped to plan properties

| CD note | Plan property it refers to | Detectable signal |
|---|---|---|
| "There's no idea here." | No mechanism; the three-slot sentence fails | `mechanism` empty or "montage"; the SMP restates the brief |
| "It's a list." | Beats are parallel and re-orderable; no build or payoff | Shuffle test: reordering beats B2…Bn-1 doesn't change meaning |
| "Tell, don't show" (said as a complaint: it *tells*) | The VO states the benefit; the visuals decorate | The benefit word appears in VO/supers with no beat whose `must_show` demonstrates it |
| "Where's the turn?" | No change in understanding or feeling | No beat tagged `turn`; flat purpose lines |
| "Too many messages." | More than one proposition | More than one SMP clause; multiple CTAs |
| "Could be anyone's." | Not ownable; no distinctive assets | No brief distinctive asset in the idea beat |
| "I don't get it." | Metaphor mapping is opaque or culture-bound | Replacement structure without context; unfamiliar source domain |
| "It's late." | Hook or proposition outside the window | Proposition beat start > platform window |
| "It's wall-to-wall." | No air; VO fills 100% of the runtime | Word budget at 100% with no VO-free beats |
| "Over-illustrated." | A visual for every noun | High new-element-per-noun ratio |

### 10.2 Breaking rules legitimately

- **Delayed hook** works in title sequences, cinema pre-rolls and sound-led art pieces where the audience is captive or opted in. It succeeds when the opening creates *tension* (a mystery, rhythm or anticipation), not emptiness.
- **List structure** works when the list *is* the joke or the idea (a rapid-fire build to an absurd last item), or when the rhythm is the point (music visuals). It succeeds when the final item is a payoff that recontextualises the rest.
- **Multiple messages** work in long-form explainers with chaptering, but each chapter should then have its own single-minded point.
- **Literal-only** pieces (no metaphor) succeed when the demonstration is itself surprising.

---

## 11. Medium-specific guidance

### 9:16 social (TikTok, Reels, Shorts)
- Front-load: the proposition within TikTok's "first 3 seconds" and the hook within "the first 6 seconds" (`platform`). TikTok's structure is hook → unique selling points → "a clear call-to-action".\[21\]\[22\]\[63\]
- Board inside UI safe zones (`TYPO-SAFE`), and board stacked rather than side-by-side comparisons.
- Plan for muted viewing where the brief says so: the proposition must be legible from picture plus supers alone.
- Native feel: TikTok recommends people on screen and a "DIY or not overly polished style".\[21\] For code-first motion graphics this means directness and energy, not artificial roughness. Treat it as a platform taste signal, not a mandate.

### 16:9 (YouTube, web, presentation, broadcast)
- More room for side-by-side comparison and data. YouTube ads: ABCD guidance ("Brand early, often, and richly"; the playbook says to introduce the brand or product "in the first 5 seconds").\[25\]\[48\] Think with Google's "The First 5 Seconds" (16 June 2015) found that ads with the brand in the first five seconds have higher ad recall and brand-awareness lift, but "people are also more likely to skip them", so brand *organically* inside the story.\[64\]
- Longer explainers can chapter. Each chapter gets its own turn.

### Square (1:1)
- A compromise crop: board it as its own aspect. Comparisons usually go stacked or sequential. Text blocks are narrower, so re-check copy length against `TYPO-*`.

### Stills
- The concept must land in **one read**. The mechanism is usually a juxtaposition or fusion metaphor, or a single demonstration frame. "Script" means headline + visual + sign-off, and "board" means thumbnails → style frame. Skip the animatic.

### Loops
- The story is a cycle: the idea is a transformation that returns to its start, or an infinite build. Board the **seam** explicitly (last frame → first frame). There is no hook/CTA structure unless it is an ad; the turn is the moment the loop "clicks".

---

## 12. The analysis/critique process (reviewing a plan)

Run these steps in order. Stop at the first blocker and report it; don't polish-critique a plan with no idea.

1. **Restate the brief objective and audience** in one line, from `BRIEF-*`. If you can't, the brief is the problem; escalate.
2. **Extract the SMP and mechanism.** Write the three-slot sentence. If it fails: **Blocker**, "no idea here" (`STORY-ONE-IDEA`, `STORY-MECHANISM`).
3. **Count the messages.** More than one proposition: **Major**, "too many messages" (`STORY-MESSAGE-COUNT`).
4. **Shuffle test** on the middle beats. If they are re-orderable without loss: **Major**, "it's a list" (`STORY-NOT-A-LIST`), unless list form is the declared idea.
5. **Find the turn.** None: **Major** for ads, explainers and launches; **Minor** for loops and ambient pieces (`STORY-TURN`).
6. **Show/tell check.** The benefit is stated but not demonstrated: **Major** (`STORY-SHOW-NOT-TELL`).
7. **Platform window** (ads/social only). Proposition late: **Major** (`STORY-HOOK-WINDOW`).
8. **Mechanical checks:** word budget, duration sum, mandatory coverage, claim sourcing, board coverage, TTS normalisation. Any failure is **Blocker** for mandatories and unsourced claims, and **Major** otherwise.
9. **Metaphor legibility.** Is the source domain familiar to the audience? Is a replacement figure supported by context? **Major** if not.
10. **Over-illustration and redundancy.** **Minor** to **Major**, depending on density.
11. **Medium fit:** aspect-specific boards, safe zones, muted legibility (cross-reference `TYPO-*`, `A11Y-*`).
12. **Series checks** (if episodic): template conformance, repetition flags, fluent-device presence.

**Severity guidance:**
- **Blocker**: the plan cannot proceed to build (no idea, missing mandatory, unsourced claim, runtime impossible).
- **Major**: it will produce a weak piece (list, too many messages, no turn, late hook).
- **Minor**: craft improvements (wording for the ear, metaphor polish).
- **Note**: an observation or option.

**Finding format:** `[Severity] RULE-ID — beat(s) — observation — why it matters — concrete fix`. Example: `[Major] STORY-NOT-A-LIST — B02–B05 — four parallel feature beats, any order works — no build or payoff, so nothing is remembered — reframe as a build-up where each feature adds a layer to one object, and payoff at B06`.

**Agent reviewer pitfalls:**
- Don't penalise legitimate breaks (see §10.2). Check the brief's declared genre and intent first.
- Don't critique motion from boards.
- Don't let fluent prose in a script mask the absence of an idea.

---

## 13. The creation process (brief to verified plan)

**Before developing routes.** Consult the subject pack and annotated references only where an open decision needs them. Use [Image Direction §1–4](../image-direction/README.md) to establish the image job and acquisition needs (`IMAGE-PURPOSE-DECLARED`, `IMAGE-MEDIUM-RATIONALE`) before treating a route as buildable. Research proposes claims; `STORY-CLAIM-SOURCE` checks their plan coverage, while `DATA-*` checks any chart against its source. Art Direction owns the style-frame treatment.

1. **Ingest the brief** (`BRIEF-*`): objective, audience, placement(s), aspect(s), runtime, audio mode (VO/music/muted), mandatories, claims with sources, distinctive assets.
2. **Write the SMP** in one sentence. If the brief carries several propositions, ask the human to rank them, or propose a hierarchy (one primary, others demoted to supers or end card).
3. **Diverge:** generate many raw ideas, then develop **at least three routes that differ in mechanism or idea**. Deliberately push away from the first, most obvious idea; it is likely the category median.
4. **Converge:** score the routes against objective, single-mindedness, ownability, buildability and misread risk. Write route cards (§1.3) and recommend one. → **Concept gate.**
5. **Script:** an AV table with VO, on-screen text and duration columns. Check the word budget against `SOUND-NARRATION-WPM`. Normalise for TTS. Table-read via TTS and time it. → **Script gate.**
6. **Beat sheet:** split the script into beats with every required field; map mandatories and claims.
7. **Thumbnails → boards** at each delivery aspect; **style frames** for each visual world. → **Board/style gate** (may be merged for small pieces).
8. **Animatic:** a stills or greybox scene with real `duration`, `seek`, `markers` and TTS/scratch audio, rendered through the real pipeline. Check timing drift. → **Animatic gate.**
9. **Blocking pass** for complex beats, with `vcr lint` on the real strings.
10. **Hand off to build**, with the beat sheet as the contract. The other pillars (`MOTION-*`, `TYPO-*`, `ART-*`, `SOUND-*`, `PACE-*`) take over.
11. **Verify:** at first cut, re-run the story review on the render (does the turn land; is the proposition early enough), on the *encoded* file.

---

## 14. Authoritative sources and canon

- **Les Binet & Peter Field, *The Long and the Short of It* (IPA, 2013), and Field's *Selling Creativity Short* (2016) and *The Crisis in Creative Effectiveness* (2019).**\[6\]\[8\] The largest body of evidence on creativity and effectiveness, from the IPA Databank. Use them for *why* idea quality matters. Caveat: award-entry samples.
- **Orlando Wood / System1 (*Lemon*, fluent-device research).** Evidence for recurring characters and devices, relevant to series.
- **Google/YouTube ABCDs (with Ipsos, Kantar, Nielsen).**\[65\] Platform creative guidance for video ads; self-reported lift.
- **TikTok Ads help centre, "Creative best practices for performance ads".** Platform guidance for the opening seconds and structure.
- **Kantar / Millward Brown Link analyses.** Message-count evidence.
- **Richard E. Mayer, *Multimedia Learning* and the *Cambridge Handbook of Multimedia Learning* (with Fiorella).** The research base for coherence, signalling, redundancy and contiguity in explainers. Read alongside independent meta-analyses that find smaller effects.
- **Barbara Phillips & Edward McQuarrie, "Beyond Visual Metaphor" (*Marketing Theory*, 2004).** A vocabulary for visual metaphor structure.\[38\]
- **Edward Segel & Jeffrey Heer, "Narrative Visualization: Telling Stories with Data" (IEEE TVCG, 2010).** Genres and structures for data stories, from 58 examples.\[66\]
- **Steven Dow et al., "Parallel Prototyping…" (ACM TOCHI, 2010).** Evidence for divergence before convergence.\[67\]
- **Pixar (Pixar in a Box on Khan Academy; "The Making of Toy Story" paper).** Story reels and iterative story development.
- **School of Motion and motion-studio process writing.** Practitioner norms for animatics, style frames and revision rounds (secondary, *taste*).
- **Fountain spec (fountain.io), the OpenTimelineIO file-format specification, CMX 3600 references, and Google Cloud TTS SSML documentation.** Format standards.

---

## 15. Encoding for an AI agent: rules table

Columns: **ID | Check | Threshold | Tier | Applies to**. Each row also states *measurable (how)* or *judgement*.

| ID | Check | Threshold | Tier | Applies to |
|---|---|---|---|---|
| `STORY-SMP` | The plan states a single-minded proposition | Superseded: use `BRIEF-PROPOSITION-SINGLE`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | All pieces with a message (ads, explainers, launches, data stories); not title sequences/art loops |
| `STORY-ONE-IDEA` | The concept passes the three-slot sentence test (proposition, mechanism, takeaway) | All three slots filled, each singular. Judgement, with schema presence check | heuristic (*taste*) | All |
| `STORY-MECHANISM` | Concept names its mechanism | One of metaphor/demonstration/transformation/comparison/build-up/twist, or a named hybrid. Measurable: field present and in the enum | heuristic (*taste*) | All except pure abstract loops |
| `STORY-ROUTES-COUNT` | Routes developed before convergence | ≥3 routes for a new piece or format (folklore value; the evidence supports "multiple, in parallel"). Measurable: count route cards | heuristic (*audience*: Dow et al.; number is folklore) | New pieces and new series formats; not template episodes |
| `STORY-ROUTE-DISTINCT` | Routes differ in idea or mechanism, not styling | No two routes share mechanism + takeaway. Partly measurable (field equality); judgement | heuristic (*taste*) | Concept stage |
| `STORY-ROUTE-CARD` | Each route card carries name, idea line, mechanism, key frame, beat outline, rationale, risk, cost | All fields present. Measurable: schema | heuristic (*taste*) | Concept gate |
| `STORY-MESSAGE-COUNT` | Number of primary propositions | 1 primary; others demoted to supporting. Partly measurable (count `proposition` tags); judgement | heuristic (*audience*: Kantar/Millward Brown, secondary figures) | Ads, launches, social; explainers per chapter |
| `STORY-NOT-A-LIST` | Middle beats are not interchangeable features | Fail if middle beats are re-orderable without loss and no payoff beat exists. Judgement (LLM shuffle test as an aid) | heuristic (*taste*) | Ads, explainers, launches |
| `STORY-TURN` | An identifiable turn or reveal | ≥1 beat tagged `turn`, located after the setup. Measurable: tag present; judgement on whether it lands | heuristic (*taste*) | Ads, explainers, launches, data stories; optional for loops/ambient |
| `STORY-SHOW-NOT-TELL` | Each stated benefit is demonstrated by a beat | Every benefit claim in VO/supers has a beat whose `must_show` depicts it. Partly measurable (link check); judgement | heuristic (*taste*) | Ads, explainers, launches |
| `STORY-METAPHOR-LEGIBLE` | Metaphor source domain familiar; replacement figures supported by context | Judgement only | heuristic (*audience*: Phillips & McQuarrie and follow-ups, mixed) | Pieces using metaphor; stricter for global or muted placements |
| `STORY-LITERAL-PRECISION` | Precision-critical content shown literally | Data, safety, finance and medical claims have a literal depiction beat. Judgement | heuristic (*taste*) | Data stories, regulated claims |
| `STORY-NO-WORD-ILLUSTRATION` | Visuals not 1:1 with VO nouns | Flag when new visual elements per beat ≈ content nouns in VO across ≥3 consecutive beats. Measurable proxy; the threshold is a VCR heuristic, not sourced | heuristic (*audience*: Mayer coherence, direction only) | Narrated explainers |
| `STORY-REDUNDANT-TEXT` | On-screen text does not duplicate narration verbatim | Flag supers whose token overlap with the concurrent VO line is high (VCR sets the cut-off; no sourced value). Excludes accessibility captions | heuristic (*audience*: Mayer redundancy, lab) | Narrated explainers; not muted placements; not captions |
| `STORY-TEMPORAL-SYNC` | The visual for a narrated concept appears in the same beat as its mention | Concept tag in VO and `must_show` share a beat. Measurable: tag join | heuristic (*audience*: Mayer temporal contiguity, lab) | Narrated pieces |
| `STORY-WORD-BUDGET` | VO word count fits time | `words ≤ Σ(VO beat s) × SOUND-NARRATION-WPM / 60`. Measurable | heuristic (value owned by `SOUND-NARRATION-WPM`) | Any piece with narration |
| `STORY-VO-AIR` | Narration leaves VO-free time | ≥1 VO-free beat in any piece with a turn or reveal. Measurable | heuristic (*taste*) | Narrated pieces |
| `STORY-EAR-WRITING` | Narration written for the ear | One idea per sentence; consistent terms; no unread symbols. Measurable proxies (sentence length vs project max, term-consistency lint); judgement | heuristic (*taste*) | Narrated pieces |
| `STORY-TTS-NORMALISE` | Numbers, dates, units, acronyms, symbols normalised or marked up | Zero unnormalised tokens without SSML `say-as`, `sub`, or a lexicon entry. Measurable | standard (per-engine SSML docs; values not portable) | TTS narration |
| `STORY-TTS-LEXICON` | Brand/product/non-dictionary words have a pronunciation entry | 100% coverage of the brief's names list. Measurable | heuristic (*taste*) | TTS narration, series |
| `STORY-TABLE-READ` | Script read aloud/TTS'd and timed before boarding | A timed read exists with measured duration. Measurable (artefact present; duration vs budget) | heuristic (*taste*) | Narrated pieces |
| `STORY-BEAT-FIELDS` | Each beat has the minimum record | `id`, `purpose`, `must_show`, `on_screen_text`, `vo`, `duration_s`, `transition_in/out`, `sound_cues`, `mandatories`, `claims`, `board_frames`. Measurable: JSON schema | heuristic (VCR convention) | All video pieces |
| `STORY-BEAT-SUM` | Beat durations sum to target | `Σ frames == target frames` at project fps. Measurable | heuristic (VCR convention; target from `BRIEF-*`) | All video |
| `STORY-BEAT-DENSITY` | Beats per second within the pacing range | Range owned by `PACE-*`. Measurable | heuristic (cites `PACE-*`) | All video |
| `STORY-TEXT-READTIME` | Beats with text long enough to read | Model owned by `TYPO-*`/`PACE-*`. Measurable | heuristic (cites `TYPO-*`) | Beats with on-screen text |
| `STORY-MANDATORY-MAP` | Every brief mandatory mapped to ≥1 beat | 100%. Measurable | heuristic (VCR convention) | All |
| `STORY-CLAIM-SOURCE` | Every factual/numeric/comparative claim linked to a source | 100% of claims have a source ID present in the brief's registry. Measurable (claim extraction + registry join; extraction needs review) | heuristic (VCR convention; legal context varies by market) | All pieces with claims |
| `STORY-HOOK-WINDOW` | Proposition and hook timing for social ads | Proposition beat starts within "the first 3 seconds"; hook within "the first 6 seconds" (TikTok).\[21\] Measurable from the beat sheet | platform (TikTok) | TikTok/short-form performance ads; advisory for organic social; not title sequences |
| `STORY-BRAND-EARLY` | Brand presence early and throughout in YouTube ads | Brand/product introduced "in the first 5 seconds" (ABCD playbook), integrated in the story. Measurable (first brand beat start) | platform (Google) | YouTube ads; not organic or editorial pieces |
| `STORY-CTA` | Performance ads end with a clear CTA | One CTA beat present. Measurable | platform (TikTok, Google) | Performance ads |
| `STORY-BOARD-COVERAGE` | Every beat boarded | ≥1 frame per beat; ≥2 (start/end) for motion beats. Measurable | heuristic (*taste*) | All video |
| `STORY-BOARD-FIELDS` | Frames carry composition, verbatim key text, motion notes, timing, beat ID | All fields present. Measurable (schema) | heuristic (*taste*) | All boards |
| `STORY-BOARD-ASPECT` | Boards at each delivery aspect where composition differs | Hero aspect fully boarded; key frames for the others. Measurable (aspect tags) | heuristic (*taste*) | Multi-aspect deliveries |
| `STORY-STYLE-FRAMES` | Look locked before full build | ≥1 style frame per distinct visual world, from idea beats. Measurable (count + tag) | heuristic (practitioner ranges 3–6 conflict) | New looks; not template episodes |
| `STORY-ANIMATIC-TIMING` | Animatic matches the plan | Total = target; per-beat marker drift ≤ 1 frame. Measurable | heuristic (VCR convention) | Pieces requiring an animatic |
| `STORY-ANIMATIC-REQUIRED` | Animatic exists where needed | Required for narration, a turn, multiple beats, or music-led pieces; skip rules per §6.3. Measurable (artefact + skip reason) | heuristic (*taste*) | All video |
| `STORY-BLOCKING-PASS` | Greybox/blocking before polish for complex beats | Beats with camera moves, 3D, or text-motion interaction have a blocking render. Measurable | heuristic (*taste*) | Complex beats |
| `STORY-GATE-SEQUENCE` | Never-skip gates passed in order | Concept → script → timed plan → final, each with a recorded approval hash. Measurable | heuristic (practitioner consensus) | All new pieces/formats |
| `STORY-GATE-REGRESSION` | Changes after approval flagged | Hash of approved artefact ≠ current → re-approval required. Measurable | heuristic (VCR convention) | All |
| `STORY-SERIES-TEMPLATE` | Episode conforms to the approved template slots | Slots present, durations in range. Measurable | heuristic (*taste*) | Series |
| `STORY-SERIES-REPEAT` | Variety across episodes | Flag consecutive episodes sharing hook type and mechanism; flag high opening-line similarity (window and cut-off set in `BRIEF-*`). Measurable | heuristic (*taste*) | Series |
| `STORY-FLUENT-DEVICE` | Series has a recurring device | Device defined in the bible and present per episode. Measurable (tag) | heuristic (*audience*: System1/IPA, vendor) | Series, brand campaigns |
| `STORY-MUTED-LEGIBLE` | Proposition legible with sound off | Proposition present in supers or picture, not VO only. Measurable (proposition tag in `on_screen_text` or `must_show`) | heuristic (placement-dependent) | Mostly-muted placements |
| `STORY-LOOP-SEAM` | Loop seam boarded and planned | Board frames for the last→first transition; plan states the cycle. Measurable | heuristic (*taste*) | Loops |
| `STORY-STILL-ONE-READ` | Still lands its idea in one read | Judgement | heuristic (*taste*) | Stills |

---

## 16. How to measure in VCR

| Rule | Inputs | Calculation | Sampling | Known failure modes |
|---|---|---|---|---|
| `STORY-WORD-BUDGET` | Beat sheet JSON (`vo`, `duration_s`); `SOUND-NARRATION-WPM`; after TTS, the audio file and its duration | Word count (tokenise, counting normalised numbers as spoken words) against budget; after TTS, measured audio duration per beat against `duration_s` | Whole script; per beat | Word count ≠ speech time (numbers, acronyms, pauses); measure actual TTS durations once available |
| `STORY-BEAT-SUM` | Beat sheet; fps | `Σ round(duration_s × fps)` against `target_s × fps` | Once | Rounding per beat accumulates; store frames as integers |
| `STORY-BEAT-DENSITY` | Beat sheet | `count / target_s` against the `PACE-*` range | Once | Beat granularity varies by author; normalise by definition (one purpose per beat) |
| `STORY-MANDATORY-MAP` | Brief mandatories list; beat `mandatories` | Set difference | Once; again at each gate | Tagged ≠ actually shown; verify in the render review |
| `STORY-CLAIM-SOURCE` | All `on_screen_text` and `vo`; claims registry | Extract numeric/comparative/superlative statements (regex + LLM); require a claim ID → source | Once per script version | Extraction misses implicit claims (visual comparisons); human review required |
| `STORY-HOOK-WINDOW` / `STORY-BRAND-EARLY` | Beat sheet tags (`proposition`, `hook`, `brand`); later, rendered frames | Start time of the first tagged beat; after render, verify the brand asset is visible (template match or DOM presence at time t) | Plan; then frames 0–window at full fps | Tag says "proposition" but the frame doesn't communicate it; judgement on the render |
| `STORY-TTS-NORMALISE` | VO text + SSML | Lint for digits, symbols (%, $, /, &), all-caps tokens, out-of-lexicon words not wrapped in `say-as`/`sub`/`phoneme` | Per line | Engine-specific behaviours; listen to flagged lines |
| `STORY-BOARD-COVERAGE` | Beat sheet; board manifest | Join on beat ID; count frames; motion beats (non-`cut` transition or `motion` flag) need ≥2 | Once | Boards drawn but stale after a script change; compare hashes |
| `STORY-ANIMATIC-TIMING` | Animatic scene `window.__scene.markers`; beat sheet | `abs(marker_t − planned_start_t) × fps ≤ 1`; `duration == target` | Every marker | Markers authored by hand drift from the beat sheet; generate markers from the beat sheet |
| `STORY-REDUNDANT-TEXT` | `on_screen_text` and concurrent `vo` | Token overlap ratio (after stop-word removal) | Per beat | Key-phrase supers legitimately share key words; flag only high verbatim overlap |
| `STORY-NO-WORD-ILLUSTRATION` | `vo` nouns; `must_show` items or DOM elements introduced per beat (sampling the scene at beat boundaries) | Ratio of new elements to content nouns, over consecutive beats | Beat boundaries | Noun extraction noise; icons as a deliberate style choice; human review |
| `STORY-MUTED-LEGIBLE` | `proposition` tag; `on_screen_text`; `must_show` | Proposition present in a non-audio channel | Once | Present but too brief to read; cite the `TYPO-*` read-time check |
| `STORY-SERIES-REPEAT` | Episode records (hook type, mechanism, source domain, first line) | Equality on categorical fields; cosine/Jaccard on first lines | Across the episode window | Embedding similarity flags intentional refrains; whitelist via the bible |
| `STORY-GATE-SEQUENCE` / `STORY-GATE-REGRESSION` | Approval log with artefact hashes | Ordered presence; hash equality | On each build request | Approvals recorded informally (chat); require a structured log |
| `STORY-LOOP-SEAM` | Rendered first and last frames | Pixel diff (last→first) within the `MOTION-*`/`ART-*` tolerance | Frame 0 and frame N−1 at delivery fps | A seam can be visually continuous but motion-discontinuous; check velocity via property sampling across frames |

---

## 17. VCR-specific rendering and delivery notes

- **Seekable scenes make the animatic real.** Because every scene exposes `duration` and `seek(t)`, a stills or greybox animatic rendered by the same Playwright pipeline gives exact timing. Generate `markers` from the beat sheet so plan and scene can't drift.
- **Fixed fps quantises beats.** Durations must be integer frames at the project fps (24/25/30/60). A 2.5 s beat is 75 frames at 30 fps but 62.5 at 25 fps, so round deliberately and keep the sum exact. Re-check the plan when the fps changes between deliveries.
- **Sampling time series supports story checks.** Brand-asset visibility in the hook window, text presence in a beat, and loop velocity continuity can all be sampled from DOM/computed styles at time t, without pixel inference. For canvas text use `textBounds()`.
- **`yuv420p` and platform re-encoding** soften fine detail and saturated thin type. A demonstration that relies on reading small UI text may fail after re-encode even if the PNG frames read well. Plan larger demonstrations for social (`TYPO-*`, `ART-*` own the checks). The final gate must review the encoded file.
- **Deterministic audio.** TTS and procedural SFX must be cached by content hash. Any re-synthesis that changes duration invalidates the animatic approval (`STORY-GATE-REGRESSION`).
- **Still frames lie about motion.** Reviewer agents must assess turns, reveals and transitions from video (or dense frame sequences), never from a single board or frame.

---

## 18. Master checklists

### Analysis (reviewing a plan or render)
- [ ] Brief objective restated (`BRIEF-*`)
- [ ] SMP: one sentence, one proposition (`STORY-SMP`, `STORY-MESSAGE-COUNT`)
- [ ] Idea passes the three-slot test; mechanism named (`STORY-ONE-IDEA`, `STORY-MECHANISM`)
- [ ] Not a list; turn present; shows rather than tells (`STORY-NOT-A-LIST`, `STORY-TURN`, `STORY-SHOW-NOT-TELL`)
- [ ] Metaphor legible / literal where precision matters (`STORY-METAPHOR-LEGIBLE`, `STORY-LITERAL-PRECISION`)
- [ ] Word budget, VO air, ear-writing (`STORY-WORD-BUDGET`, `STORY-VO-AIR`, `STORY-EAR-WRITING`)
- [ ] No over-illustration or redundancy; temporal sync (`STORY-NO-WORD-ILLUSTRATION`, `STORY-REDUNDANT-TEXT`, `STORY-TEMPORAL-SYNC`)
- [ ] Beats complete; sum exact; density in range (`STORY-BEAT-FIELDS`, `STORY-BEAT-SUM`, `STORY-BEAT-DENSITY`)
- [ ] Mandatories mapped; claims sourced (`STORY-MANDATORY-MAP`, `STORY-CLAIM-SOURCE`)
- [ ] Platform windows (`STORY-HOOK-WINDOW`, `STORY-BRAND-EARLY`, `STORY-CTA`), where applicable
- [ ] Boards cover beats at each aspect (`STORY-BOARD-COVERAGE`, `STORY-BOARD-FIELDS`, `STORY-BOARD-ASPECT`)
- [ ] Animatic timing matches (`STORY-ANIMATIC-TIMING`)
- [ ] Muted legibility / loop seam / still one-read, by medium (`STORY-MUTED-LEGIBLE`, `STORY-LOOP-SEAM`, `STORY-STILL-ONE-READ`)
- [ ] Series conformance and variety (`STORY-SERIES-TEMPLATE`, `STORY-SERIES-REPEAT`, `STORY-FLUENT-DEVICE`)
- [ ] Gate log intact (`STORY-GATE-SEQUENCE`, `STORY-GATE-REGRESSION`)

### Creation
- [ ] Brief ingested; SMP written (`STORY-SMP`)
- [ ] ≥3 distinct routes; route cards; recommendation (`STORY-ROUTES-COUNT`, `STORY-ROUTE-DISTINCT`, `STORY-ROUTE-CARD`) → concept gate
- [ ] AV script with on-screen text column; word budget; TTS normalised and lexicon; table read (`STORY-WORD-BUDGET`, `STORY-TTS-NORMALISE`, `STORY-TTS-LEXICON`, `STORY-TABLE-READ`) → script gate
- [ ] Beat sheet complete; mandatories and claims mapped (`STORY-BEAT-FIELDS`, `STORY-MANDATORY-MAP`, `STORY-CLAIM-SOURCE`)
- [ ] Boards per aspect; style frames (`STORY-BOARD-*`, `STORY-STYLE-FRAMES`)
- [ ] Animatic via pipeline; markers from beat sheet (`STORY-ANIMATIC-REQUIRED`, `STORY-ANIMATIC-TIMING`) → animatic gate
- [ ] Blocking pass on complex beats (`STORY-BLOCKING-PASS`)
- [ ] Hand-off; final review on the encoded file (`STORY-GATE-SEQUENCE`)

---

## 19. Caveats

- **Effectiveness data are correlational and self-selected.** The IPA Databank consists of awards entries; System1 and Kantar are vendors analysing their own panels; Google's ABCD lift is self-reported. The direction (ideas and distinctiveness matter) is consistent across sources; the magnitudes are not transferable.
- **Inconsistent fluent-device figures.** System1 releases cite 73% (large profit gain), 30% (profit gains), 37% (market share) and 22–23% ("very large" effects) on different bases. Quote the base with the number, or don't quote it.
- **The message-count chart's origin is murky.** Mark Ritson notes that its "empirical origins are famously murky" and that it measures recall only, not persuasion. The 100/65/43 figures come from secondary sources. Kantar's own 2021 page shows the effect for 1/2/3+ messages without the numbers in its text.
- **Mayer effect sizes are inflated relative to independent meta-analyses,** and come from lab learning tasks rather than ads. Use them for direction in explainers.
- **Phillips & McQuarrie's complexity ordering is contested** by later experiments.
- **Platform guidance changes without notice.** The TikTok help article and the Google ABCD pages are 2022–2025 material as surfaced in 2026. Re-verify before encoding thresholds into `rules.json`.
- **Studio gate and revision norms are practitioner marketing.** Round counts and stage order vary (storyboard before or after style frames).
- **Several thresholds here are VCR conventions,** not sourced (one-frame drift, the overlap cut-offs, three routes). They are labelled `heuristic` and should be tuned on real projects.
- **Culture.** Metaphor legibility, humour and twist conventions are culture-bound. Rules about metaphor apply per audience, not universally.
- **Expressive work.** Title sequences, music visuals and art loops can legitimately break the message, hook and CTA rules. The reviewer must check the declared genre first.

---

## 20. Verification ledger (checked 2026-11-06)

| Claim | Result | Source checked |
|---|---|---|
| TikTok: "Prioritize your hook in the first 6 seconds" | confirmed (search extract of primary page) | TikTok Ads help centre, "Creative best practices for performance ads" |
| TikTok: "Introduce your content proposition in the first 3 seconds" | confirmed (search extract of primary page) | Same |
| TikTok: hook, USPs, "a clear call-to-action"; "at least 720P"; "DIY or not overly polished style" | confirmed (search extract) | Same |
| TikTok: "90% of ad recall impact is captured within the first six seconds" | confirmed (search extract of primary blog, Creative Code #4, footnote 6); the attribution to a TikTok Marketing Science/Kantar analysis of 3,500 ads is secondary and unverified | TikTok for Business blog, "Creative Codes" |
| TikTok text overlay "5–10 words per second" | unverified: found only in secondary blogs, not in the primary extract | Secondary (starti.ai, sume.com) |
| Google ABCD: "30% lift in short-term sales likelihood and a 17% lift in long-term brand contribution" | confirmed (search extract); underlying study is Google/Kantar, "The Short & the Long of ABCDs Effectiveness", global, April 2021, 11,000 ads | Think with Google, "Understanding the ABCDs of effective creative on YouTube"; Google Ads Help |
| Google: "Brand early, often, and richly" | confirmed (search extract) | Google Ads Help, "About the ABCDs of effective video ads" |
| ABCD playbook: brand/product "in the first 5 seconds"; "heartbeat" arc wording | confirmed (search extract) | Think with Google ABCD playbook PDF |
| Early-branded ads: higher ad recall and brand-awareness lift, but "people are also more likely to skip them" | confirmed (enricher check of primary source) | Think with Google, "The First 5 Seconds", 16 June 2015 |
| Binet & Field: 996 campaigns, 700 brands, 83 categories; ESOV efficiency 2.8 vs 0.3 | confirmed (search extract) | IPA, "The Long and the Short of It" presentation PDF |
| "11 times as efficient" | confirmed as cited figure; primary Thinkbox/IPA report not fetched | Secondary compilations (Tom Roach; McConkey) |
| IPA 2019: almost 600 cases 1996–2018; awarded now "no more effective" | confirmed (search extract) | IPA publication page |
| IPA 2019: "eight times more effective… almost 16 times more likely" | confirmed (quoted by Campaign; secondary) | Campaign |
| Awarded efficiency multiplier ~12× to 4 | confirmed as reported (secondary) | Contagious |
| System1: fluent device "73% more likely to report a large profit gain" | confirmed (trade press quoting System1) | LBB Online; Marketing Beat |
| System1: 37%/27%/30%; usage 41% (1992) → 12% | confirmed (trade press) | LBB Online |
| Kantar Link: playback per key message falls 1→2→3+ messages | confirmed (search extract; numbers in chart image not visible) | Kantar UK, "The art of brand strategy…", 2 Dec 2021 |
| Millward Brown 100 → 65 (two messages) → 43 (four) | unverified at primary; confirmed as quoted in secondary | Coleman Insights (2019); Marketing Week (Ritson) |
| Kantar Millward Brown 2017: 30% vs 14% take-out | confirmed (press release of 16 May 2017; more than 1,000 ads analysed from a 160,000-ad database) | adobo Magazine / PR Newswire |
| Mayer coherence 23/23, median 0.86; spatial 22/22, 1.10; temporal 9/9, 1.22; redundancy 16/16, 0.86 | confirmed (search extract of chapter abstract and PDF) | Cambridge Handbook ch. 12 (Mayer & Fiorella) |
| Mayer 2017: coherence 0.70, signalling 0.46, redundancy 0.87, spatial 0.79, temporal 1.30 | confirmed (search extract of abstract) | Mayer 2017, *J. Computer Assisted Learning* |
| Cromley & Chen (2025) meta-analysis: 92 articles, 181 studies, 591 effects, overall g = 0.37; multimedia g = 0.39 vs Mayer median d = 0.68 | confirmed (search extract) | NSF PAR, "A Meta-Analysis of Richard Mayer's Multimedia Learning…" (*Educational Research Review*) |
| Signalling meta-analysis d = .38 | confirmed (search extract of abstract) | Alpizar et al. 2020 (ResearchGate listing) |
| Dow et al.: parallel > serial on click-through and expert ratings; more diverse; self-efficacy | confirmed (search extract) | Stanford HCI PDF; Human Factors International summary |
| Phillips & McQuarrie: 3 structures × 3 meaning operations = 9 types; complexity hypothesis | confirmed (search extract) | Academia.edu / ResearchGate copies of the 2004 paper |
| Later studies contradict the ordering | confirmed (search extract) | ResearchGate, "The Impact of Visual Structure Complexity…"; T&F "Refining replacements" |
| Segel & Heer: 58 examples, seven genres | confirmed (search extract of PDF and follow-up) | Stanford vis PDF; arXiv 2202.00047 |
| Pixar story reel "a rough draft of the film in video form" | confirmed (search extract) | Khan Academy, Pixar in a Box |
| Lasseter on story reels | confirmed as secondhand report only | Denki Games blog (secondary) |
| Pixar: three ideas each over 4–5 months | unverified (secondary blog only) | Medium post (secondary) |
| Fountain syntax: sections/synopses not in output; boneyard `/* */`; no revision marks; UTF-8 `.fountain` | confirmed (fetched) | fountain.io/syntax; fountain.io FAQ/home |
| FDX: XML, `Paragraph Type` values | confirmed (secondary); no public spec found | Go package docs; libertyseeds.ca; Final Draft KB |
| OTIO: JSON, Timeline/Stack/Track/Clip, markers, metadata, `.otio` | confirmed (search extract of spec) | OpenTimelineIO docs (readthedocs) |
| OTIO "not however, a container format for media" | confirmed as quoted (secondary) | metavert.io |
| CMX 3600: 999 events, 8-char reels, 4 audio channels | confirmed (secondary, consistent across sources) | valmera.io; cutconvert.com; edlmax.com |
| SSML say-as values (cardinal, ordinal, characters, date, telephone); cardinal example | confirmed (search extract) | Google Cloud TTS SSML docs |
| SSML 1.1 does not standardise interpret-as values | confirmed (secondary) | smallest.ai blog |
| Gate phrasing: "cheap to revise, expensive to skip"; "last cheap opportunity to restructure" | confirmed (fetched by subagent) | Pixel Studios Inc. blog, 17 Aug 2026 |
| Rounds: two at script, 1–2 at storyboard/style frames, 1–2 animation | confirmed (search extract; fetch blocked) | Austin Visuals |
| Style frames 3–4 (PlayPause) vs 4–6 (Motion Forward) | confirmed (search extracts; marketing sources) | PlayPause; Motion Forward Design |
| School of Motion animatic definition | confirmed (fetched by subagent) | School of Motion, "What Are Animatics…" |

---

## 21. Sources

The numbered list below matches the escaped `\[n\]` markers in the text. The verification ledger above names the source checked for every load-bearing number.


1. [The Animation Production Process: Discovery to Delivery | Pixel Studios Inc](https://www.pixelstudiosinc.com/blog/animation-production-process)
2. [How Many Revisions Should You Expect in an Animated Video Project?](https://austinvisuals.com/how-many-revisions-for-an-animated-video/)
3. [Storyreels (video)](https://www.khanacademy.org/partner-content/pixar/storytelling/storyboard-your-film/v/pitching4)
4. [The Importance of Story Reels - Denki Games](https://denki.co.uk/2009/09/15/the-importance-of-story-reels/)
5. [Parallel Prototyping](https://www.humanfactors.com/newsletters/parallel_prototyping.html)
6. [IPA (Les Binet & Peter Field). The Long and the Short of It](https://ipa.co.uk/media/5811/long_and_short_of_it_presentation_final.pdf)
7. [Peter Field IPA report reveals creative effectiveness crisis](https://www.contagious.com/news-and-views/creative-effectiveness-peter-field-IPA-crisis-report)
8. [IPA](https://ipa.co.uk/knowledge/publications-reports/the-crisis-in-creative-effectiveness)
9. [System1 Launches Test Your Distinctive Assets+ — LBB](https://lbbonline.com/news/system1-launches-test-your-distinctive-assets)
10. [Research by System1 Shows Memorable Characters in Ads Boost Chances of Profit by 30%](https://lbbonline.com/news/research-by-system1-shows-memorable-characters-in-ads-boost-chances-of-profit-by-30)
11. [Only bad marketers think more messages mean more effectiveness](https://www.marketingweek.com/more-messages-more-effectiveness/)
12. [The art of brand strategy and how to get it right](https://upg-cd-ne.kantar.com/uki/Inspiration/Brands/The-art-of-brand-strategy-and-how-to-get-it-right)
13. [Marketers Need to Deliver Creative That Makes a Lasting Impression and Focus Less on Functional Messages](https://www.prnewswire.com/news-releases/marketers-need-to-deliver-creative-that-makes-a-lasting-impression-and-focus-less-on-functional-messages-622451813.html)
14. [Marketers need to deliver creative that makes a lasting impression and focus less on functional messages - Kantar](https://www.bizcommunity.com/Article/196/12/161891.html)
15. [Principles for Reducing Extraneous Processing in Multimedia Learning: Coherence, Signaling, Redundancy, Spatial Contiguity, and Temporal Contiguity Principles (Chapter 12) - The Cambridge Handbook of Multimedia Learning](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles/CD5B7AE1279A9AB81F8EEBB53DBEC86E)
16. [Coherence, Signaling, Redundancy, Spatial Contiguity](https://edtechuvic.ca/wp-content/uploads/sites/11/2022/09/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles.pdf)
17. [A meta-analysis of Richard Mayer's multimedia learning research: Searching for boundary conditions of design principles across multiple media types - ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1747938X25000673)
18. [Multimedia in education: what works? (New meta-analysis)](https://theeconomyofmeaning.com/2026/04/15/multimedia-works-but-not-always-the-way-we-think/)
19. [(PDF) Beyond visual metaphor: A new typology of visual rhetoric in advertising](https://www.academia.edu/1093616/Beyond_visual_metaphor_A_new_typology_of_visual_rhetoric_in_advertising)
20. [(PDF) The Impact of Visual Structure Complexity on Ad Liking, Elaboration and Comprehension](https://www.researchgate.net/publication/398298193_The_Impact_of_Visual_Structure_Complexity_on_Ad_Liking_Elaboration_and_Comprehension)
21. [Creative best practices for performance ads](https://ads.tiktok.com/resources/help/article/creative-best-practices)
22. [TikTok ad creative best practices: 9:16, 720p, hook](https://www.sume.com/blog/tiktok-ads-creative-best-practices-9-16-720p)
23. [Creative Best Practices for TikTok Ads](https://ads.tiktok.com/business/en-US/blog/creative-best-practices-top-performing-ads)
24. [60+ Short-Form Video Statistics for 2026 (Every Stat Sourced)](https://vidico.com/news/short-form-video-statistics/)
25. [About the ABCDs of effective video ads - Google Ads Help](https://support.google.com/google-ads/answer/14783551?hl=en)
26. [A Guide To Creating Effective Video Ads - YouTube Ads](https://business.google.com/ca-en/resources/articles/abcds-of-effective-video-ads/)
27. [Fountain](https://fountain.io/)
28. [Syntax](https://fountain.io/syntax/)
29. [OpenTimelineIO (OTIO)](https://metavert.io/opentimelineio)
30. [Investigating Final Draft's XML document format with Ruby](https://libertyseeds.ca/2015/07/21/Investigating-Final-Draft-s-XML-document-format-with-Ruby/)
31. [Edit Decision List (EDL) — Definition, Format and Why It Matters](https://valmera.io/glossary/edit-decision-list)
32. [Be Brave: The Power of a Focused Message - YourFilm](https://your.film/learn/insights/be-brave-the-power-of-a-focused-message/)
33. [Parallel Prototyping Leads to Better Design Results, More ...](https://hci.stanford.edu/publications/2010/parallel-prototyping/ParallelPrototyping2010-submitted.pdf)
34. [How Pixar’s Design Process Creates Compelling and Believable Stories](https://amy-b.medium.com/how-pixars-design-process-creates-compelling-and-believable-stories-83e0f35c9d02)
35. [Binet\_and\_Field](https://www.slideshare.net/slideshow/binetandfield/252553543)
36. [2% 0% 2% 4% 6% 8% 10% 12% 4% 6% 8% 10% 12% 14%](https://mcconkey.media/wp-content/uploads/2018/10/Les_and_Peter_The_Greatest_Hits.pdf)
37. [Creatively awarded campaigns less effective than ever, IPA study finds](https://www.campaignlive.co.uk/article/creatively-awarded-campaigns-less-effective-ever-ipa-study-finds/1587858)
38. [(PDF) Beyond Visual Metaphor: A New Typology of Visual Rhetoric in Advertising](https://www.researchgate.net/publication/235361038_Beyond_Visual_Metaphor_A_New_Typology_of_Visual_Rhetoric_in_Advertising)
39. [(PDF) Marketing Theory Beyond Visual Metaphor: A New Typology of Visual Rhetoric in Advertising](https://www.academia.edu/6886897/Marketing_Theory_Beyond_Visual_Metaphor_A_New_Typology_of_Visual_Rhetoric_in_Advertising)
40. [AV Scripts: The Two-Column Format for Commercials and Corporate Work](https://www.film-logic.com/blog/av-scripts-two-column-format/)
41. [Two Column Script Template (AV Script Format)](https://storyflow.so/two-column-script-template)
42. [The Ultimate Guide to the A/V (Two-Column) Script Format for Commercials](https://scriptease.app/blog/av-two-column-script-format/)
43. [A meta-analysis of signaling principle in multimedia learning environments](https://www.researchgate.net/publication/339545308_A_meta-analysis_of_signaling_principle_in_multimedia_learning_environments)
44. [TikTok Ads Best Practices 2026: 10 Rules for DTC Brands](https://selzee.com/blog/tiktok-ads-best-practices)
45. [TikTok Ad Specs 2026: Sizes, Lengths, and Safe Zones - Starti AI & CTV](https://starti.ai/news/tiktok-ad-specs-2026-sizes-lengths-and-safe-zones)
46. [Free Video Script Template (Two-Column AV Format)](https://boords.com/video-script-template)
47. [How to Write a Video Script (Step by Step, With an Example)](https://boords.com/how-to-write-a-video-script)
48. [A playbook for building effective creative on YouTube](https://www.thinkwithgoogle.com/_qs/documents/8472/ABCD_Complete_V7b_HR_1.pdf)
49. [Narrative Visualization: Telling Stories with Data](http://vis.stanford.edu/files/2010-Narrative-InfoVis.pdf)
50. [Speech Synthesis Markup Language (SSML) | Cloud Text-to-Speech | Google Cloud Documentation](https://docs.cloud.google.com/text-to-speech/docs/ssml)
51. [SSML Text to Speech: Natural Voice Control - Smallest.ai](https://smallest.ai/blog/ssml-text-to-speech-a-developer-s-guide-to-natural-voice-control)
52. [Motion Graphics Process](https://motionforward.design/blog/tutorials/motion-graphics-process.html)
53. [Style Frame Approval Before Full Animation Production: Avoiding a Mid-Project Redesign](https://playpause.io/blogs/style-frame-approval-animation)
54. [This Is the Workflow Every Motion Design Studio Uses - Runner](https://runner.studio/blog/this-is-the-workflow-every-motion-design-studio-uses/)
55. [The Making of Toy Story](https://people.uncw.edu/ricanekk/teaching/spring09/csc100/lectures/pattersone/TheMakingOfToyStory.pdf)
56. [What Are Animatics, and Why Are They Important?](https://schoolofmotion.com/blog/what-are-animatics-and-why-are-they-important)
57. [How Animation Production Works](https://lucidmotionstudio.com/how-it-works)
58. [System1 launches new tool to test distinctive brand assets](https://www.marketing-beat.co.uk/2024/01/17/system1-distinctive-assets/)
59. [The Seven Habits Of Highly Effective Characters - System1 Group](https://testgroup.system1group.com/blog/the-seven-habits-of-highly-effective-characters)
60. [FAQ](https://fountain.io/faq/)
61. [fdx package - github.com/LaPingvino/lexington/fdx - Go Packages](https://pkg.go.dev/github.com/LaPingvino/lexington/fdx)
62. [File Format Specification — OpenTimelineIO 0.19.0.dev1 documentation](https://opentimelineio.readthedocs.io/en/latest/tutorials/otio-file-format-specification.html)
63. [DeepClick Inventor of ReflowLink](https://deepclick.com/resources/blog/tiktok-ads-creative-best-practices/)
64. [The First 5 Seconds: Creating YouTube Ads That Break Through in a Skippable World](https://business.google.com/aunz/think/marketing-strategies/creating-youtube-ads-that-break-through-in-a-skippable-world/)
65. [YouTube ABCDs: Video ad best practices - Think with Google](https://business.google.com/en-all/think/future-of-marketing/youtube-video-ad-creative/)
66. [Telling Stories with Data: What Segel and Heer’s “Narrative Visualization” Taught Us](https://medium.com/@agrima_kumar/telling-stories-with-data-what-segel-and-heers-narrative-visualization-taught-us-657c4e5adbdf)
67. [Keyframer: Empowering Animation Design using Large Language Models](https://arxiv.org/pdf/2402.06071)
