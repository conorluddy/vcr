# Series Brief, Brand Systems and Series Bibles: A Knowledge Base for VCR Reviewer Agents (`BRIEF-*`)

> **Bottom line:** A series brief can only be judged against if it holds one objective, one proposition, explicit evaluation criteria, and a typed split between hard mandatories, weighted preferences and declared rule-breaks, with motion, colour and sound expressed as DTCG 2025.10 tokens plus VCR extensions. Published UI motion tokens (Carbon, Material, Fluent) are useful vocabulary, but they are too short to be used unchanged as video timing.
>
> **Scope:** how creative intent is specified so that work and reviews can be judged against it. Covers creative briefs, brand motion guidelines, design tokens, voice-to-visual translation, series bibles, templates and controlled variation, review against the brief, and pitfalls. It feeds a machine-readable series brief that is read by every VCR reviewer pillar (typography, motion, pacing, art, sound). Platform safe zones and caption reading speeds belong to the `TYPO-*` pillar and are only referenced here.
>
> **Confidence tiers:** `standard` means a published standard, industry-body guide or brand/design-system style guide, checked against the primary source. `platform` means published by a platform or vendor and liable to change without notice. `heuristic` means a practitioner rule of thumb, a secondary source, or a VCR-internal convention. Every rule also states whether it is **measurable** (and how) or **judgement only**.
>
> **Verification date:** all checks were run on 2026-11-06 unless the ledger says otherwise.

## TL;DR

- **The brief is the reviewer's reference point.** The IPA/BetterBriefs guide says good briefs "act as a neutral reference point for assessing the work", yet "only 30% of brands have evaluation criteria in place" [19].\[1\] A VCR series brief must carry its evaluation criteria, or every reviewer drifts towards generic taste.
- **Few brief fields change creative decisions:** objective (one), audience (a specific person in a specific viewing context), proposition (one message, "not a tagline"), tone (adjectives turned into parameters), mandatories (sourced) and evaluation criteria [19][21].\[1\] Background, market data and long histories rarely change a frame; keep them in an appendix.
- **Split intent into three typed buckets.** *Mandatories* are blockers and are binary. *Preferences* are weighted and can be traded against each other. *Rule-breaks* are deliberate, scoped deviations with a stated success condition. A reviewer that cannot tell these apart either over-polices expressive work or waves through real violations.
- **DTCG 2025.10 is stable.** The W3C Community Group announced it on 28 October 2025 and says it was "developed by more than 20 editors and authors" from organisations including Adobe, Amazon, Google, Microsoft, Meta, Figma and Pinterest [1]. It defines `duration`, `cubicBezier` and a `transition` composite (duration, delay, timingFunction) [1][2]. It has no spring, keyframe, stagger, fps, audio or "per-episode variation" types, so VCR must carry those in `$extensions` [2]. Tool support is still uneven: the announcement says "More than 10 design tools and open-source projects" already support or are implementing it [1], but Penpot 2.18.3 still lacks the motion types [5].
- **UI motion tokens are mostly sub-frame at video frame rates.** Carbon's `duration-fast-01` is 70ms [6], which is 1.68 frames at 24 fps.\[2\] Material 3's shortest duration token is 50ms, and Material now says its easing/duration system "is no longer maintained" in favour of springs [9].\[3\]\[4\] Use these systems for their *grammar*, not their values: productive vs expressive [6], entrance/exit/standard easing [6], and duration growing with distance [6].
- **Evidence on brand personality from visuals is real but weak, and motion-specific evidence is thin.** Typeface naturalness, harmony and flourish drive most Aaker dimensions, but with "relatively small R² values" [25].\[5\] Animated logos that move "of [their] own volition" help dynamic brands and hurt stable ones [28]. No peer-reviewed study was found that maps easing or bounce to Aaker dimensions, so adjective-to-motion mappings are `heuristic`.
- **Series stay alive through declared variable axes, not randomness.** Fix the ident, end card, type system, palette and sonic logo. Vary content, layout within the grid, accent colour, segment order and tempo, and log every variation. GitLab's brand motion guide states that "Animation speed is variable and can change based on video length, music, and voice over" [15]. That is a declared variable axis in a published guide.

## Key findings

1. **Briefs fail mostly through mismatched perceptions, not missing templates.** "80% of marketers think they're good at writing briefs. Only 10% of agencies agree" [19]. Reviewer agents should assume the brief is under-specified and lint it before reviewing renders. (Audience data: survey.)
2. **Objectives are the most important field and the worst-written one.** "61% of marketers and 71% of creative agencies rank objectives as the most critical element of marketing briefs", and objectives are "the most critical yet most poorly defined element of every brief" [19]. (Survey plus expert opinion.)
3. **One brief, one strategy, one message.** Briefs "are mutually exclusive" across choices such as acquisition vs upsell: "The need to address more than one of these choices requires multiple briefs." "A single-minded brief contains only one key message. That message is not a tagline" [19]. (Expert guidance.)
4. **Evaluation criteria belong in the brief.** "Decide which brief (client or creative) should be used to evaluate the work and try to include assessment criteria in it… Currently, only 30% of brands have evaluation criteria in place" [19]. In the older ISBA/CAF guide, "72% of agencies and 84% of clients" said all briefs should have effectiveness criteria [21]. (Survey.)
5. **The DTCG format is stable but is a Community Group Report, not a W3C Recommendation.** The stable version is 2025.10, announced 28 October 2025 and "developed by more than 20 editors and authors" [1]. The format document states: "It is not a W3C Standard nor is it on the W3C Standards Track" [2]. A 2026 preview draft already exists, dated 08 September 2026, and carries the warning "Do not attempt to implement this version" [2]. (Standard.)
6. **Carbon gives the clearest published productive/expressive split with exact curves.** For example, standard productive is `cubic-bezier(0.2, 0, 0.38, 0.9)` and standard expressive is `cubic-bezier(0.4, 0.14, 0.3, 1)`, with After Effects equivalents ("outgoing 20%, incoming 62%"). Carbon says: "Reserve expressive motion for occasional, important moments" [6]. (Standard; page last updated Aug 12, 2026.)
7. **Material 3 has moved from easing/duration tokens to springs.** "In the expressive update, components and motion now use the motion physics system, which uses springs… The easing and duration system is still used for transitions… but is no longer maintained" [9]. Any VCR token set modelled on M3 easing will drift from Google's current practice. (Platform; the page renders client-side and was read via search extract.)
8. **Typeface characteristics shift brand personality perception, but only slightly.** "Type font naturalness, harmony and flourish emerge as the most important type font characteristics evoking higher levels of most personality dimensions" [25]. The authors also warn that "the effect of type font alone may not be powerful enough to differentiate brand personality" [25]. (Peer-reviewed; audience perception.)
9. **The type of animation interacts with brand personality.** "As compared with object-animated or static logos, agent animation encourages more favorable attitudes toward dynamic firms but less favorable attitudes toward stable firms," and attitudes improve "when the brand personality suggested by the animation is consistent with other brand cues" [28]. (Peer-reviewed; abstract only was read.)
10. **Motion guidelines retrofitted after a static rebrand produce inconsistency.** The DIA studio, discussing its Mailchimp and Pinterest projects, said: "When motion is considered only after a visual rebrand… it leads to inconsistency and compromises," and advised treating "motion as a behavioural system, not a set of animations" [17]. (Practitioner, secondary interview.)

---

## 1. Creative briefs: what they contain and which fields change decisions

### 1.1 Canonical structures

**IPA / BetterBriefs, "The best way for a client to brief an agency"** (written by BetterBriefs and Mark Ritson in partnership with the IPA) [19]:
- **Backbone:** "The backbone consists of the objectives, the target audience and the budget. Together they set the parameters of what's possible and what's not."
- **Objectives come in three linked types:** commercial, behavioural and attitudinal. "These three types of objectives should be linked and logical. Avoid being wishful."
- **Audience:** "A well-defined target audience is a vivid picture of demographics, psychographics and needs or wants." Ritson adds: "Demographic cliches like 'millennials' are as sure a sign as any that you have not got a strategy."
- **Message:** "A single-minded brief contains only one key message. That message is not a tagline. It does not try to be creative." It is "supported only by relevant proof points. They are not shopping lists."
- **Evaluation:** "Align on evaluation… Good evaluation criteria help foster an idea's potential rather than act as a judgement tool."
- **Tips:** "Keep the brief brief"; "Insightful > insight"; "Don't prescribe the solution"; "Scrum not relay race".
- **Briefing:** "A brief is not a contract until the agency accepts it."

**ISBA / Communications Agencies Federation (IPA, MCCA, PRCA), "The Client Brief"** (2002 research; third-party-hosted PDF) [21]. It has eight headings:
1. Project management
2. Where are we now?
3. Where do we want to be?
4. What are we doing to get there?
5. Who do we need to talk to?
6. How will we know we've arrived?
7. Practicalities
8. Approvals

Under campaign strategy it asks: "what is the key message? What brand/tonal values are required?" It also says: "Briefs are called 'briefs' because they are meant to be brief."

**Agency creative brief (practitioner convention, secondary).** The usual fields are objective, audience, insight, single-minded proposition (SMP), reasons to believe, tone, mandatories and deliverables.\[6\] One planning studio's test: the SMP "should be one sentence, ideally without conjoining ideas with commas, lists or semicolons" [37].\[7\] Popular templates repeat a "10–12 words" limit with no traceable origin, so it is treated as folklore (`heuristic`).\[8\]

### 1.2 Which fields change creative decisions (for VCR reviewers)

| Field | Changes decisions? | How it changes a render | Reviewer pillars |
|---|---|---|---|
| Objective (one; commercial → behavioural → attitudinal) | **Yes, strongly** | Sets what the piece must *cause*. Awareness favours a dwell-heavy logo and a repeated proposition; behaviour favours a CTA end card and earlier payoff | pacing, art |
| Audience + viewing context | **Yes** | Muted-first feed vs sound-on; first-time vs returning viewer; reading speed | typography, pacing, sound |
| Insight | Indirectly | Picks the angle and hook; seldom maps to a parameter | art, pacing (hook) |
| Proposition (SMP) | **Yes, strongly** | The one thing that must be legible or audible; sets hierarchy | typography, pacing, sound |
| Proof points | Moderately | Content of the middle section; how many beats | pacing |
| Tone / voice adjectives | **Yes, if operationalised** | Easing family, duration band, palette weighting, type weight, music tempo | motion, art, typography, sound |
| Mandatories | **Yes (binary)** | Logo, legal text, colours, sonic logo, durations | all |
| Deliverables | **Yes (binary)** | Aspect, resolution, fps, duration, codec | all (lint) |
| Evaluation criteria | **Yes, for review** | Defines what "good" means for this piece | all reviewers |
| Background / market / history | Rarely | Context only; keep it in an appendix [19][21] | none directly |
| Budget | Not for VCR renders | Limits scope (e.g. 3D vs 2D) | none |

**Failure modes.**
- *Strategy-by-iteration:* "60% of marketers use the creative process to clarify their strategies" [19]. In VCR this shows up as an agent asked to "try a few looks" with no proposition. Reviewers then have nothing to judge against.
- *Moving goalposts:* "75% of agencies and 55% of clients agreed that: 'The briefs that we work on are often changed once the project has started'" [21]. Version the brief and stamp each review with the brief version.
- *Bloat:* "54% of agencies agree that briefs are too long; 32% too short; and only 14% succinct" [19].

**Conflicting statistic.** The share of budget wasted on poor briefs is "one third of all marketing budgets" in the IPA guide, citing the 2021 *global* report [19].\[1\] Marketing Week reports "more than a quarter (26%)" for the *UK* research [20].\[9\] These are different samples. Do not merge them.

---

## 2. Brand guidelines for motion: published examples

### 2.1 IBM Carbon (product UI; the clearest token grammar) [6][7][8]

- **Two styles.** "Productive motion creates a sense of efficiency and responsiveness, while remaining subtle and out of the way." "Expressive motion delivers enthusiastic, vibrant, and highly visible movement." "Reserve expressive motion for occasional, important moments, to better capture the user's attention and offer a rhythmic break to the productive experience" [6].
- **Easing, verbatim from the current page** (last updated Aug 12, 2026) [6]:

| Easing | Productive | Expressive |
|---|---|---|
| Standard | `cubic-bezier(0.2, 0, 0.38, 0.9)` | `cubic-bezier(0.4, 0.14, 0.3, 1)` |
| Entrance | `cubic-bezier(0, 0, 0.38, 0.9)` | `cubic-bezier(0, 0, 0.3, 1)` |
| Exit | `cubic-bezier(0.2, 0, 1, 0.9)` | `cubic-bezier(0.4, 0.14, 1, 1)` |

- **After Effects equivalents** (useful for Blender and keyframe tools): standard productive is "outgoing 20%, incoming 62%"; standard expressive is "outgoing 40%, incoming 70%"; exit productive is "outgoing 20%, incoming 0%"; exit expressive is "outgoing 40%, incoming 0%" [6].
- **Usage rules** [6]:
  - "Strictly linear movement appears unnatural to the human eye."
  - "Avoid easing curves that are unnatural, distracting, or purely decorative."
  - Exits speed up, "implying that its departure from the screen is permanent"; but "if an element leaves the view but stays nearby, ready to reappear upon user action, use standard easing instead."
- **Duration grows with distance.** "the larger the change in distance (traveled) or size (scaling) of the element, the longer the animation takes," and "productive motion is significantly faster than expressive motion" [6].
- **Duration tokens** [6][7]:

| Token | Usage | Value |
|---|---|---|
| `duration-fast-01` | "Micro-interactions such as button and toggle" | 70ms |
| `duration-fast-02` | "Micro-interactions such as fade" | 110ms |
| `duration-moderate-01` | "Micro-interactions, small expansion, short distance movements" | 150ms |
| `duration-moderate-02` | "Expansion, system communication, toast" | 240ms |
| `duration-slow-01` | "Large expansion, important system notifications" | 400ms |
| `duration-slow-02` | "Background dimming" | 700ms |

  The current-page fetch was truncated after `duration-slow-01`. The `slow-02` value was confirmed on the v10 page [7] and in the package README extract [8].
- **Scope:** Carbon says page-level choreography "is up to each product team to implement" [6]. It is a UI system, not a video brand guide.

### 2.2 Google Material Design 3 [9][10]

- **Duration tokens** (read via search extract; the page needs JavaScript and the direct fetch returned no content) [9]:
  - `md.sys.motion.duration.short1`–`short4` = 50 / 100 / 150 / 200ms
  - `medium1`–`medium4` = 250 / 300 / 350 / 400ms
  - `long1`–`long4` = 450 / 500 / 550 / 600ms
  - `extra-long1`–`extra-long4` = 700 / 800 / 900 / 1000ms
  - Examples on the page: "Selection controls have a short duration of 200ms with Standard easing"; "A FAB expanding into a Sheet uses a 400ms duration with Emphasized easing".
- **Easing tokens:** `md.sys.motion.easing.emphasized`, `.emphasized.decelerate`, `.emphasized.accelerate`, `.standard`, `.standard.decelerate`, `.standard.accelerate` [9]. **The cubic-bezier values were not confirmed from primary documentation** in this research (the page renders client-side).\[4\] The widely repeated values come from secondary repositories and are marked `unverified` in the ledger. Do not encode them as `standard`.
- **Current status:** "In the expressive update, components and motion now use the motion physics system, which uses springs. Products should migrate to the new system. The easing and duration system is still used for transitions… but is no longer maintained" [9].
- **Legacy M2 guidance that maps tone to motion.** This is useful for §4 even though M2 is marked no longer maintained. "A productivity app might take a more reserved approach with standard easing and short durations… a more playful app might express its brand more noticeably and freely with oscillation, arc motion paths, emphasized elevation, and staggers." The page's paired examples are "Standard easing with a quick 300ms duration" and "Emphasized easing with a long 650ms duration" [10].

### 2.3 Microsoft Fluent 2 [11][12][13]

- **Token architecture.** "Fluent uses two layers of tokens. First, global tokens are context-agnostic and store raw values… Global tokens also store information for typography, border radius, stroke width, and animation." Alias tokens "add semantic meaning" [11].
- **Token names, from the shipped package type definitions** [12]:
  - `CurveTokens`: `curveAccelerateMax`, `curveAccelerateMid`, `curveAccelerateMin`, `curveDecelerateMax`, `curveDecelerateMid`, `curveDecelerateMin`, `curveEasyEaseMax`, `curveEasyEase`, `curveLinear`
  - `DurationTokens`: `durationUltraFast`, `durationFaster`, `durationFast`, `durationNormal`, `durationGentle`, …
- **Values are not confirmed from primary documentation.** Secondary sources consistently give durations of 50/100/150/200/250/300/400/500ms.\[10\]\[11\]\[12\] A Fluent UI GitHub issue documents that motion-package curve values "do not match theme values" [13].\[13\] For example, `easingDecelerateMid = 'cubic-bezier(0.1,0.9,0.2,1)'` in the motion package sat alongside a different theme-token value. Treat Fluent curve values as `contradicted/unverified` until read from `packages/tokens/src/global` at a pinned commit.

### 2.4 Uber Base (product) [14]

- Motion should "adhere to the personality of the Uber brand: Bold, Direct, with Heart"; "Base motion is smooth, direct, and efficient."
- "Non-essential animations such as animated brand illustrations should be replaced with static counterparts" under reduced motion, citing "WCAG 2.3.3 Animation from interactions."
- Source quality: read via search extract; the zeroheight page fetch returned metadata only. Widely shared "Uber motion guidelines" on Behance are a designer's *self-initiated* project and are **not** Uber guidance.\[14\] Do not cite them as Uber.

### 2.5 GitLab Pajamas brand motion (a real *video* brand guide) [15]

This is the most video-relevant primary example found:
- **Scope:** "These guidelines are the standard for any video involving motion graphics to any degree."
- **Two eases:** "Interactive ease is a standard ease in and out and the Expressive ease is an overshoot and snap back." It is specified as After Effects Flow-plugin data.
- **Icons:** "Motion should be swift at 0.65 seconds."
- **Logo:** the trace logo "should animate on using a stroke reveal using Interactive ease."
- **Composition:** "maintain a large amount of negative space and do not clutter the frame with excessive elements or text."
- **Lower thirds:** "Transition in: Animate opacity from 0% to 100% over 1 second"; "Transition out: Animate opacity from 100% to 0% over 1 second."
- **Variation is declared:** "Animation speed is variable and can change based on video length, music, and voice over."
- The guide also includes an "Incorrect use of gradients" section, which is a published *don't* gallery.

### 2.6 Mailchimp (expressive illustration-led brand) [16][17]

- **Colour:** "Cavendish Yellow is an energetic brand expression… We anchor on a single color, used with purpose, to drive consistency" [16].
- **Animation:** "We create a moving world where creatures, characters, and objects appear free but observed, and familiar but abstracted… and play with motion in unexpected ways." Surprise is written into the brand, so a reviewer must not flag it as inconsistency [16].
- **Process lesson** (DIA, practitioner): motion retrofitted after the rebrand caused "inconsistency and compromises" [17].

### 2.7 Spotify (logo and artwork integrity, platform rules) [18]

- **Logo:** "Don't stretch or alter the shape of the logo"; "Don't use the logo to make new objects or shapes"; "Don't place the logo in a busy area, or in low-contrast areas where legibility is compromised."
- **Third-party artwork:** "Artwork must be kept in its original form. Don't animate or distort it in any way. This includes applying overlays and blurring."
- **Scope:** this is developer/partner guidance, so it is `platform` tier.

### 2.8 Patterns across these guides (what a VCR brief should copy)

| Dimension | How published systems specify it | Encode in series brief as |
|---|---|---|
| Easing | Named families × modes (Carbon productive/expressive; GitLab interactive/expressive) with exact curves [6][15] | `cubicBezier` tokens + `$extensions` springs/overshoot |
| Duration | Discrete ramp (Carbon 6 steps; M3 16 steps) + "scale with distance" rule [6][9] | `duration` tokens + distance→duration rule + frame quantisation |
| Expressive budget | "occasional, important moments" [6] | `motion.expressiveBudget` (share of runtime / count of moments) |
| Logo animation | Reveal method + ease (GitLab stroke reveal, Interactive ease) [15]; integrity don'ts [18] | `mandatories.logo.*` |
| Type in motion | Lower-third fade timing [15]; legibility over busy backgrounds [18] | Typography tokens + pointer to `TYPO-*` |
| Colour in video | Single anchor colour "used with purpose" [16] | Palette tokens + proportion preferences |
| Sound logo | Not specified in any design system reviewed; agency literature only (§2.9) | `sound.sonicLogo` with file hash, length, sync marker |
| Do/don't | Misuse galleries [18], "Incorrect use" sections [15] | `examples.do[] / examples.dont[]` with frame refs |

### 2.9 Sound logos (weak evidence)

- **Length claims disagree.** Agency sources variously give "typically 2–5 seconds" [33], "between two and six seconds" [34] and "between one and three seconds" [35].\[15\]\[16\]\[17\]
- **An untraceable research claim.** One blog attributes to "the International Association of Audio Branding" a finding that signatures over five seconds "show dramatically decreased recall rates" [36].\[18\] No primary study was found, so the claim is `unverified`.
- **Encoding consequence:** sonic-logo length is a *brief-declared* value checked for consistency. It is not a universal threshold.

---

## 3. Design tokens: the W3C DTCG format (status as of 2026-11-06)

### 3.1 Status

- **Release:** "The Design Tokens Community Group today announced the first stable version of the Design Tokens Specification (2025.10)", dated October 28, 2025. The announcement says it was "developed by more than 20 editors and authors" from organisations including "Adobe, Amazon, Google… Microsoft, Meta… Figma… Pinterest" [1]. The homepage reads "First stable version 2025.10 now available" [3].
- **Standing:** it is published by a W3C Community Group: "It is not a W3C Standard nor is it on the W3C Standards Track" [2].
- **Drafts in progress:** the designtokens.org drafts page shows a "Draft Community Group Report 08 September 2026" preview marked "Do not attempt to implement this version." The latest published version is `https://www.designtokens.org/TR/2025.10/format/` [2].
- **Companion modules:** Color 2025.10 and Resolver 2025.10. The Resolver defines `sets`, `modifiers` and `resolutionOrder` for theming [4].

### 3.2 Core mechanics (verified in the fetched format text) [2]

- **Tokens vs groups:** "An object with a **`$value`** property is a token." Groups are objects without `$value`. "Groups are arbitrary and tools *SHOULD NOT* use them to infer the type or purpose of design tokens."
- **File conventions:** media type `application/design-tokens+json`; file extensions `.tokens` / `.tokens.json`.
- **Type resolution:** `$type` comes from the token, from the referenced token (for aliases), or from the closest parent group. "Tools *MUST NOT* attempt to guess the type of a token by inspecting the contents of its value."
- **Extensions:** "each tool *MUST* use a vendor-specific key"; reverse-domain notation is recommended. Tools "*MUST* preserve any extension data they do not themselves understand."
- **Other keys:** `$deprecated` (true/false/string); `$extends` for group inheritance with deep-merge override; `$root` for a group's base token.
- **Aliases:** curly-brace references `{group.token}`, plus JSON Pointer `$ref` support for property-level references.

### 3.3 Motion types (from the format module's search extract; section 8–9 text was not in the truncated fetch)

- **Duration:** "Represents the length of time in milliseconds an animation or animation cycle takes to complete… The value *MUST* be an object containing a numeric value (either integer or floating-point) and a unit of milliseconds ("ms") or seconds ("s")" [2]. Note that pre-stable drafts used a string such as `"100ms"`, and older exporters still emit strings.
- **Cubic Bézier:** "Represents how the value of an animated property progresses towards completion over the duration of an animation… The $type property *MUST* be set to the string cubicBezier" [2]. The value is four numbers `[P1x, P1y, P2x, P2y]`. Secondary implementers state that x values must lie in [0, 1]; an earlier draft example used `[0.5, 0, 1, 1]`.
- **Transition (composite):** "Represents a animated transition between two states", with `duration`, `delay` and `timingFunction` [2].

### 3.4 Limitations for video (why VCR needs `$extensions`)

| Need in VCR | DTCG 2025.10 | Workaround |
|---|---|---|
| Springs / physics (M3 has moved here [9]) | None | `$extensions["dev.vcr.motion"].spring = {stiffness, damping, mass}` plus a baked cubic-bezier fallback |
| Multi-keyframe / overshoot eases (GitLab "overshoot and snap back" [15]) | cubicBezier y may exceed [0,1]; multi-segment not expressible | Extension: keyframe list `[{t,v,ease}]` |
| Stagger, choreography, order | None | Extension: `stagger` (duration), `order` (enum) |
| Frame rate / frame quantisation | None | Brief-level `deliverables[].fps`; tokens declared in ms and quantised at render |
| Audio (sonic logo, loudness, tempo) | None | Brief-level `sound` block (not tokens) |
| Per-episode variation | Resolver `modifiers` can model themes [4] | Use the Resolver for palette/theme variants; per-episode params in the brief |
| Tool support | Uneven. The W3C announcement says "More than 10 design tools and open-source projects – including Penpot, Figma, Sketch, Framer, Knapsack, Supernova, and zeroheight – already support or are implementing the standard", with "reference implementations in leading tools including Style Dictionary, Tokens Studio, and Terrazzo" [1]. Yet Penpot (2.18.3) "has no equivalent" for cubicBezier/duration [5] | Validate with the VCR schema; do not rely on design-tool round-trips |

---

## 4. From voice and tone to visual, motion and sound choices

### 4.1 What the research supports (audience perception)

- **Aaker (1997),** in *Journal of Marketing Research* 34(3), 347–356, names the five brand-personality dimensions in its abstract: "(Sincerity, Excitement, Competence, Sophistication, and Ruggedness)". They are measured with a 42-item scale [24]. The full text was not fetched.
- **Henderson, Giese & Cote (2004)** found that typeface selection "can be simplified with the use of six underlying design dimensions: elaborate, harmony, natural, flourish, weight, and compressed." Impressions trade off: pleasing, engaging, reassuring, prominent [26]. The authors' accepted manuscript was read.
- **Grohmann, Giese & Parkman (2013)** [25]:
  - "Increased type font weight enhances ruggedness and competence; decreased weight signals sincerity, excitement and sophistication. Elaborate type fonts did not affect brand personality."
  - "To differentiate a brand as rugged or competent, managers are advised to select heavy, compressed fonts. Light, extended fonts make the brand appear more sincere, exciting and sophisticated (but less rugged and competent)."
  - Colour effects were "independent of the impact of the type font itself."
  - Caveat: Study 1 R² was about 0.07–0.09.
- **Cian, Krishna & Elder (2014):** *static* logos that imply movement raise engagement and attitudes, "moderated by the congruence between perceived movement and brand characteristics" [27].
- **Brasel & Hagtvedt (2016):** *agent* animation (the logo appears to move "of its own volition") vs *object* animation. Agent animation helps dynamic firms and hurts stable ones, and is "contingent on the fluent processing of the animation in the context it is used" [28].
- **Malik, Aitken & Waalen (2009),** *Visual Communication* 8(4), 469–479, describe their work as a "pilot study… to provide conceptual validation for the hypothesis that animated text can communicate certain emotions such as anger, sadness, happiness and fear" [29]. This is pilot-level evidence only.
- **Gap:** no peer-reviewed study was found that varies easing curves, smoothness or bounce and measures Aaker dimensions. Every easing-to-adjective mapping below is therefore `heuristic` (expert taste).

### 4.2 Operationalising adjectives (heuristic translation table)

Use it this way: every adjective in the brief must name (a) what it *means* here, (b) what it does **not** mean, and (c) at least one parameter per pillar. The values are starting points to be tuned per brief, not universal rules.

| Adjective | Motion | Type | Colour | Sound | Evidence |
|---|---|---|---|---|---|
| Calm / reassuring | Productive-style curves (e.g. Carbon standard productive [6]); longer holds; few simultaneous movers; no overshoot | Harmonious, natural, moderate weight ("reassuring when they are harmonious" [25] via Henderson) | Low chroma, narrow palette | Slow tempo, soft transients, low SFX density | Type: peer-reviewed; motion/sound: heuristic |
| Authoritative / competent | Direct paths, decelerating entrances, minimal secondary motion | Heavier, compressed ("rugged or competent" [25]) | High contrast, restrained accent | Steady tempo, clear VO, little reverb | Type: peer-reviewed; rest heuristic |
| Playful / exciting | Expressive curves, overshoot ("oscillation, arc motion paths… staggers" [10]); agent-like motion [28] | Natural, flourish; lighter weight ("exciting" [25]) | Saturated anchor + accents | Faster tempo, pitched SFX, sonic flourishes | Motion: M2 guidance + peer-reviewed (agent animation); rest heuristic |
| Sophisticated | Longer durations, emphasised decelerate, precise alignment | Light, extended, harmonious ("sophisticated" [25]) | Desaturated, dark grounds, one accent | Sparse arrangement, wide dynamics | Type: peer-reviewed; rest heuristic |
| Efficient / direct | Short productive durations, no decorative motion ("smooth, direct, and efficient" [14]) | Neutral sans, clear hierarchy | Functional palette | Minimal music, crisp UI-like SFX | Platform guidance; heuristic |

**Agent failure modes:**
- Mapping "playful" to bounce on *everything*. Carbon's budget logic applies to expressive brands too: concentrate expression in a few moments.
- Treating the adjective list as additive. "Calm + bold" needs a declared resolution, e.g. bold *type*, calm *motion*.
- Judging tone from a still frame. Easing and rhythm only exist across frames (see §10).

---

## 5. Series bibles and their short-form equivalents

### 5.1 What TV bibles contain (secondary sources; no industry standard exists)

- **Typical sections:** logline, series overview, tone and format, characters, world/setting, episode structure, season arcs, sample episodes [30][31][32].\[19\]\[20\]
- **Format bibles** add "Detailed breakdown of episode structure: act-by-act beats, segment timing, recurring set-pieces, and structural rules that define the show's form" [30].
- **Length:** "There is no official page count. Bibles range from ten pages to fifty" [31].\[21\]
- **Two different documents share the name.** The *pitch* bible should "not to be confused with an internal document used by showrunners to track" continuity [32]. VCR needs the **internal/production** kind: rules of the world plus continuity.

### 5.2 Short-form series bible (what VCR needs)

| Bible element | Short-form / motion equivalent | Fixed or variable | Consumed by |
|---|---|---|---|
| Format / episode structure | Segment map: hook (0–n s) → beats → payoff → end card, with time budgets | Structure fixed; durations within ranges | pacing |
| Recurring set-pieces | Ident, recurring segment bumpers, signature transitions | Fixed | motion, art, sound |
| Rules of the world | Visual grammar: grid, palette, type system, camera rules (e.g. "2D flat only, no perspective"), physics rules ("objects never overshoot except the mascot") | Fixed | art, motion |
| Characters | Mascot/host specs, voice casting, TTS voice ID + prosody | Fixed | art, sound |
| Tone | Operationalised adjectives (§4.2) | Fixed, with declared per-episode "temperature" range | all |
| Episode guide | Per-episode brief: topic, proposition, variable-axis values, any rule-breaks | Variable | all |
| Continuity log | Record of used variants (accent colour, music cue, layout) per episode | Variable, tracked | art, sound (anti-monotony) |

### 5.3 Avoiding monotony (practitioner patterns; heuristic)

- **Declare the variable axes.** Pick a few axes, e.g. accent colour from a palette subset, layout variant from a set, music cue from a library, segment order permutation, and a pacing "temperature". GitLab's guide openly varies animation speed "based on video length, music, and voice over" [15].
- **Rotate and log:** do not repeat the same variable combination in consecutive episodes (`BRIEF-SERIES-ROTATION`).
- **Protect the recognisers:** ident, end card, type system, anchor colour and sonic logo stay fixed, so variation reads as freshness rather than inconsistency.
- **Schedule tentpole episodes:** occasional episodes with a declared rule-break (e.g. a monochrome special). This is the series version of Carbon's "occasional, important moments" [6].

---

## 6. Templates vs variation at scale

- **Systems over assets.** DIA: "view motion as a behavioural system, not a set of animations… Scalability emerges from building a structure that generates motion" [17].
- **Controlled variation = parameters + ranges + constraints.** Each template exposes named parameters. The brief fixes some, gives ranges for others, and forbids combinations (e.g. accent colour X never with background Y).
- **Documented rule-breaking.** Mailchimp writes surprise into the brand ("play with motion in unexpected ways") [16]. GitLab defines a separate *Expressive* ease with overshoot [15]. A rule-break is legitimate when it is **declared, scoped, motivated and checkable**:
  - which rule it breaks;
  - where (episode, segment, time range);
  - why (which brief field it serves);
  - what makes it succeed (e.g. "the overshoot lands on the music downbeat"; "the monochrome segment keeps the anchor colour on the proposition only").
- **Do/don't galleries.** Spotify's misuse list [18] and GitLab's "Incorrect use of gradients" [15] show the format: one rule per example, with a short reason. For VCR, store galleries as rendered frame references *and* time ranges (motion don'ts need clips, not stills).
- **Agent failure modes:**
  - *Homogenisation:* reusing the same template parameters every episode, which can still pass every mandatory.
  - *Over-application:* treating preferences as mandatories and flattening expressive moments.
  - *Default leakage:* falling back to library defaults (e.g. a tween library's default ease) when the brief declares tokens.

---

## 7. Approval and review against the brief

- **Criteria belong in the brief** [19]. "Ideally, these evaluation criteria are developed and agreed by the brand and agency and turn into a shared language around creativity" [19].
- **Approvals is a first-class section** in the ISBA/CAF structure (heading 8) [21].
- **Example scoring rubric (agency practice, secondary trade press).** Leo Burnett's HumanKind scale is "a 10-point scale that gives the lowest score of 1 (Destructive) to 10 (Changes the world. A 7 is 'An inspiring idea, beautifully crafted'" [23].\[22\] It is used in a quarterly Global Product Committee that reviews work "through the same lens" [22].\[23\] This is an *idea-quality* scale, not a brief-compliance scale.
- **Recommended VCR review structure** (heuristic; it combines the sources above). There are two independent axes:
  1. **Compliance**: mandatories pass/fail; preferences scored 0–3 with brief weights; rule-breaks are checked against their own success conditions.
  2. **Effectiveness against intent**: does the piece serve the objective and land the proposition for the stated audience and context? Score 1–5 per evaluation criterion declared in the brief.
  - Never collapse the two axes into one number. A fully compliant piece can still be generic.
- **Tie every finding to a brief field.** Each finding cites a JSON path (e.g. `brief.proposition`, `tokens.motion.easing.exit`, `ruleBreaks[2]`) (`BRIEF-TRACE-FINDING`). Findings with no field are labelled "taste" and capped at `minor`.

---

## 8. Pitfalls and conflict resolution

### 8.1 Briefs too vague to judge against

**Symptoms:**
- several objectives;
- proposition containing "and";
- audience given as demographics only;
- adjectives with no parameters;
- no evaluation criteria.

**Fixes:** lint the brief before production (`BRIEF-OBJECTIVE-SINGLE`, `BRIEF-PROPOSITION-SINGLE`, `BRIEF-ADJECTIVE-OPERATIONALISED`, `BRIEF-EVAL-CRITERIA`). The IPA guide says agencies "should be saying 'no' to briefs they don't understand" [19]. A VCR agent should likewise return questions rather than render.

### 8.2 Briefs that over-constrain

- **Symptoms:** mandatories that prescribe the solution ("use a split-screen with a bouncing logo"); every token marked mandatory; no variable axes.
- **Guidance:** "Don't prescribe the solution. Dictating solutions limits creativity from the start" [19].
- **Counterpoint:** the ISBA/CAF guide notes that "giving them the tightest of parameters will often stimulate the most inventive of responses" [21].
- **Resolution:** constrain the *ends* (proposition, mandatories, tokens) and free the *means* (concept, layout within the grid).

### 8.3 Conflicts between pillars

Typical conflicts:
- bigger type vs more negative space vs fewer words;
- louder music vs VO intelligibility;
- expressive motion vs legibility;
- fixed series layout vs a long proposition.

**How creative directors settle them** (practitioner pattern, heuristic):
1. **Return to the proposition and objective.** Whatever best lands the one message for the stated audience and context wins. Ritson: "Strategy is Sacrifice… always subtract, never add" [19].
2. **Apply the declared priority order** (`priorities` in the schema). Example: mandatories > proposition legibility > fixed series recognisers > tone > preferences.
3. **Prefer subtraction to compromise.** Cut words before shrinking type; cut secondary motion before slowing the hero move.
4. **If the conflict recurs, change the system, not the episode.** Amend the brief (new token, new layout variant) and version it.

**Agent failure mode:** splitting the difference on every conflict (medium type, medium space, medium word count), which produces uniformly average frames.

---

## 9. Medium-specific guidance

| Medium | What changes for the series brief | Key rules |
|---|---|---|
| **9:16 social (1080 × 1920)** | Often watched muted and scrolled. The proposition must survive without audio and early. Platform UI overlaps the frame (safe zones live in `TYPO-*`). Declare `audience.watchMode` | `BRIEF-PROPOSITION-ONSCREEN`, `BRIEF-HOOK-WINDOW`, `BRIEF-LOGO-HOLD` |
| **16:9** | More room for hierarchy and lower thirds (GitLab lower-third 1 s fades [15] is a usable precedent). Often sound-on (explainers, YouTube) | `BRIEF-TOKEN-ONLY-DURATION`, `BRIEF-SONIC-LOGO-SYNC` |
| **Square (1:1)** | Layouts cannot be centre-cropped from 16:9 without breaking clear space. Declare a per-aspect layout variant | `BRIEF-LOGO-CLEARSPACE`, `BRIEF-DELIVERABLE-SPEC` |
| **Stills** | Motion tokens do not apply. Tone must be carried by type, colour and composition only. Brand-personality type evidence [25][26] is most relevant here | `BRIEF-TOKEN-ONLY-COLOR`, `BRIEF-LOGO-INTEGRITY` |
| **Loops** | No beginning/end card, so the logo mandatory may need a "persistent mark" alternative. Easing must be continuous at the seam. Linear is legitimate for continuous loops (Carbon's linear warning targets start-stop movement [6]) | `BRIEF-LOOP-SEAM`, `BRIEF-NO-LINEAR-SPATIAL` (exempted) |

---

## 10. The analysis / critique process (reviewer agent)

**Step 0: lint the brief.** Run all brief-level rules. If a blocker-level brief defect exists (no proposition, no objective, contradictory mandatories), stop and report `brief-defect` findings instead of reviewing the render.

**Step 1: check deliverables and mandatories (binary).** Run `BRIEF-DELIVERABLE-SPEC`, logo rules, legal text, sonic logo, colour mandatories. Any failure is a **blocker**.

**Step 2: watch it as the audience would.** Play at 1×, in the declared watch mode (muted if `watchMode = muted-first`), at delivery size. Answer two questions: what is the one thing it says, and does it match `brief.proposition`? Never judge motion only from contact sheets. Easing, rhythm and sync exist only in time.

**Step 3: check tokens with measurements.** Easing, duration, colour and expressive budget (fields in §12, measurements in §14). Classify each deviation:
- declared rule-break → check its success condition;
- undeclared, visible → **major**;
- undeclared, sub-perceptual (e.g. ±1 frame) → **nit**.

**Step 4: check series consistency.** Fixed elements present and unchanged; variable axes inside their ranges; rotation vs the previous N episodes; near-duplicate check.

**Step 5: judge effectiveness.** Score each `evaluation.criteria` item 1–5 with one sentence tied to a brief field.

**Step 6: resolve cross-pillar conflicts.** Where another pillar's finding conflicts (e.g. the typographer wants larger type, the art reviewer wants more space), apply `priorities` and state which field decided it.

**Step 7: write findings.** Each finding has rule ID, severity, timecode/frame range, brief path, observation, expected value, measured value and suggested fix.

**Severity guidance:**

| Severity | Meaning | Examples |
|---|---|---|
| blocker | Violates a mandatory or deliverable; cannot ship | Logo stretched; wrong aspect; legal line missing; sonic logo absent when mandatory |
| major | Undermines the objective or proposition, or a visible undeclared rule-break | Proposition never on screen in a muted-first piece; expressive bounce on every element when the brief says calm |
| minor | Preference drift; small tonal mismatch | Accent colour outside the episode's rotation; durations consistently 1 band slower |
| nit | Sub-perceptual or taste without a brief field | 1-frame duration mismatch; easing within tolerance but not exact |

**Vocabulary for findings:**
- off-brief
- on-token / off-token
- undeclared break
- declared break (succeeds / fails its condition)
- drift (from the series)
- generic default
- proposition buried
- recogniser missing
- monotony risk
- over-constrained by brief
- brief defect

---

## 11. The creation process (creator agent)

1. **Read the brief top-down in this order:** objective → audience/watch mode → proposition → mandatories → tone parameters → fixed/variable → rule-breaks → evaluation criteria. If any of the first four is missing, ask; do not invent.
2. **Write a one-line intent statement:** "For [audience] watching [mode], this episode makes [proposition] land by [device]." Store it in the scene's metadata.
3. **Choose the variable-axis values** for this episode. Check the continuity log so the combination is not reused (`BRIEF-SERIES-ROTATION`).
4. **Load tokens, not literals.** Import the DTCG file and map easing/duration to GSAP/WAAPI/CSS/Blender. Never use a library default ease.
5. **Quantise durations to the delivery fps.** Raise any token shorter than 2 frames to a video band (§12, `BRIEF-DURATION-FRAMES`).
6. **Plan expressive moments explicitly**, within `motion.expressiveBudget`, and tie each to a beat marker.
7. **Build the fixed recognisers first** (ident, end card, sonic logo sync), then the content.
8. **If you need to break a rule**, add a `ruleBreaks[]` entry *before* building it, with a success condition.
9. **Self-verify:** run `vcr lint` plus the `BRIEF-*` checks. Watch once muted and once with sound. Compare against the previous episode's frames.
10. **Hand off** with the intent statement, the variable-axis values used, and the declared breaks.

---

## 12. Proposed machine-readable series brief schema

### 12.1 JSON Schema sketch (draft 2020-12; `x-consumers` lists reviewer pillars; `x-kind` marks hard/preference/break)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://vcr.dev/schemas/series-brief/0.1.json",
  "title": "VCR Series Brief",
  "type": "object",
  "required": ["id", "version", "series", "intent", "mandatories", "tokens", "deliverables", "evaluation", "priorities"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "version": { "type": "string", "description": "Semver; every review records the brief version it judged against" },
    "series": {
      "type": "object",
      "x-consumers": ["pacing", "art"],
      "required": ["name", "logline", "format"],
      "properties": {
        "name": { "type": "string" },
        "logline": { "type": "string", "maxLength": 200 },
        "format": {
          "type": "object",
          "properties": {
            "episodeDurationS": { "type": "object", "properties": { "min": { "type": "number" }, "max": { "type": "number" } } },
            "segments": {
              "type": "array",
              "x-consumers": ["pacing", "sound"],
              "items": {
                "type": "object",
                "required": ["id", "role"],
                "properties": {
                  "id": { "type": "string" },
                  "role": { "enum": ["hook", "ident", "beat", "payoff", "cta", "endcard", "bumper"] },
                  "durationS": { "type": "object", "properties": { "min": { "type": "number" }, "max": { "type": "number" } } },
                  "fixed": { "type": "boolean", "description": "true = recurring set-piece rendered from a locked template" }
                }
              }
            }
          }
        }
      }
    },
    "intent": {
      "type": "object",
      "required": ["objective", "audience", "proposition"],
      "properties": {
        "objective": {
          "type": "object",
          "x-consumers": ["pacing", "art"],
          "required": ["statement", "kind"],
          "properties": {
            "statement": { "type": "string" },
            "kind": { "enum": ["commercial", "behavioural", "attitudinal"] },
            "measure": { "type": "string", "description": "How success is known (IPA/ISBA 'How will we know we've arrived?')" }
          }
        },
        "audience": {
          "type": "object",
          "x-consumers": ["typography", "pacing", "sound"],
          "required": ["portrait", "watchMode"],
          "properties": {
            "portrait": { "type": "string" },
            "watchMode": { "enum": ["muted-first", "sound-on", "mixed"] },
            "familiarity": { "enum": ["first-time", "returning", "mixed"] }
          }
        },
        "insight": { "type": "string", "x-consumers": ["art", "pacing"] },
        "proposition": {
          "type": "object",
          "x-consumers": ["typography", "pacing", "sound"],
          "required": ["text"],
          "properties": {
            "text": { "type": "string", "maxLength": 120 },
            "approvedParaphrases": { "type": "array", "items": { "type": "string" } },
            "mustAppear": { "enum": ["on-screen", "voiced", "both", "either"] }
          }
        },
        "proofPoints": { "type": "array", "maxItems": 3, "items": { "type": "string" }, "x-consumers": ["pacing"] },
        "tone": {
          "type": "array",
          "x-consumers": ["motion", "art", "typography", "sound"],
          "items": {
            "type": "object",
            "required": ["adjective", "means", "notMeans", "parameters"],
            "properties": {
              "adjective": { "type": "string" },
              "means": { "type": "string" },
              "notMeans": { "type": "string" },
              "parameters": {
                "type": "object",
                "properties": {
                  "motion": { "type": "array", "items": { "type": "string", "description": "Token refs or rule IDs" } },
                  "typography": { "type": "array", "items": { "type": "string" } },
                  "colour": { "type": "array", "items": { "type": "string" } },
                  "sound": { "type": "array", "items": { "type": "string" } }
                }
              }
            }
          }
        }
      }
    },
    "mandatories": {
      "type": "array",
      "x-kind": "hard",
      "items": {
        "type": "object",
        "required": ["id", "rule", "source", "check", "consumers"],
        "properties": {
          "id": { "type": "string" },
          "rule": { "type": "string" },
          "source": { "type": "string", "description": "Brand guide page, legal doc, contract clause" },
          "check": { "type": "string", "description": "BRIEF-* rule ID or 'judgement'" },
          "params": { "type": "object" },
          "consumers": { "type": "array", "items": { "enum": ["typography", "motion", "pacing", "art", "sound"] } }
        }
      }
    },
    "preferences": {
      "type": "array",
      "x-kind": "preference",
      "items": {
        "type": "object",
        "required": ["id", "statement", "weight", "consumers"],
        "properties": {
          "id": { "type": "string" },
          "statement": { "type": "string" },
          "weight": { "type": "number", "minimum": 0, "maximum": 1 },
          "check": { "type": "string" },
          "consumers": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "ruleBreaks": {
      "type": "array",
      "x-kind": "break",
      "items": {
        "type": "object",
        "required": ["id", "breaks", "scope", "why", "successCondition", "approvedBy"],
        "properties": {
          "id": { "type": "string" },
          "breaks": { "type": "string", "description": "Path of the token/preference/rule being broken" },
          "scope": { "type": "object", "properties": { "episodes": { "type": "array", "items": { "type": "string" } }, "segments": { "type": "array", "items": { "type": "string" } }, "timeRangeS": { "type": "array", "items": { "type": "number" }, "minItems": 2, "maxItems": 2 } } },
          "why": { "type": "string", "description": "Which intent field it serves" },
          "successCondition": { "type": "string" },
          "approvedBy": { "type": "string" }
        }
      }
    },
    "tokens": {
      "type": "object",
      "x-consumers": ["motion", "art", "typography"],
      "required": ["file"],
      "properties": {
        "file": { "type": "string", "description": "Path to DTCG 2025.10 .tokens.json" },
        "resolver": { "type": "string", "description": "Optional DTCG Resolver file for theme modifiers" },
        "motion": {
          "type": "object",
          "properties": {
            "expressiveBudget": { "type": "object", "properties": { "maxMoments": { "type": "integer" }, "maxRuntimeShare": { "type": "number" } } },
            "durationScalesWithDistance": { "type": "boolean" },
            "minFramesPerTween": { "type": "integer", "default": 3 }
          }
        }
      }
    },
    "sound": {
      "type": "object",
      "x-consumers": ["sound", "pacing"],
      "properties": {
        "sonicLogo": { "type": "object", "properties": { "file": { "type": "string" }, "sha256": { "type": "string" }, "lengthS": { "type": "number" }, "syncMarker": { "type": "string" }, "toleranceMs": { "type": "number" } } },
        "musicTempoBpm": { "type": "object", "properties": { "min": { "type": "number" }, "max": { "type": "number" } } },
        "voice": { "type": "object", "properties": { "kind": { "enum": ["none", "recorded", "tts"] }, "voiceId": { "type": "string" } } }
      }
    },
    "fixed": { "type": "array", "items": { "type": "string" }, "x-consumers": ["art", "motion", "sound"], "description": "Recognisers that never vary" },
    "variable": {
      "type": "array",
      "x-consumers": ["art", "motion", "pacing", "sound"],
      "items": { "type": "object", "required": ["axis", "values"], "properties": { "axis": { "type": "string" }, "values": { "type": "array" }, "noRepeatWithinEpisodes": { "type": "integer" } } }
    },
    "examples": {
      "type": "object",
      "properties": {
        "do": { "type": "array", "items": { "$ref": "#/$defs/exampleRef" } },
        "dont": { "type": "array", "items": { "$ref": "#/$defs/exampleRef" } }
      }
    },
    "priorities": { "type": "array", "items": { "type": "string" }, "description": "Ordered conflict resolution, highest first" },
    "deliverables": {
      "type": "array",
      "items": { "type": "object", "required": ["aspect", "width", "height", "fps", "codec"], "properties": { "aspect": { "enum": ["9:16", "16:9", "1:1", "4:5", "still"] }, "width": { "type": "integer" }, "height": { "type": "integer" }, "fps": { "enum": [24, 25, 30, 60] }, "codec": { "enum": ["h264-yuv420p", "prores4444", "png"] }, "durationS": { "type": "number" } } }
    },
    "evaluation": {
      "type": "object",
      "required": ["criteria"],
      "properties": {
        "criteria": { "type": "array", "items": { "type": "object", "required": ["id", "question", "briefRef"], "properties": { "id": { "type": "string" }, "question": { "type": "string" }, "briefRef": { "type": "string" } } } },
        "scale": { "type": "string", "default": "1-5" }
      }
    }
  },
  "$defs": {
    "exampleRef": { "type": "object", "required": ["src", "note"], "properties": { "src": { "type": "string" }, "timeRangeS": { "type": "array", "items": { "type": "number" } }, "rule": { "type": "string" }, "note": { "type": "string" } } }
  }
}
```

### 12.2 Annotated example: invented series "Low Tide Lab"

A weekly 40–55 s vertical science explainer about rock-pool creatures for curious adults. This is a fictional series. Comments (`//`) are annotations; strip them before validation.

```jsonc
{
  "id": "low-tide-lab",
  "version": "1.3.0",                         // bump on every change; reviews cite it
  "series": {
    "name": "Low Tide Lab",
    "logline": "One rock-pool creature, one surprising fact, under a minute.",
    "format": {
      "episodeDurationS": { "min": 40, "max": 55 },
      "segments": [
        { "id": "hook",    "role": "hook",    "durationS": { "min": 1.5, "max": 3 }, "fixed": false }, // pacing
        { "id": "ident",   "role": "ident",   "durationS": { "min": 1.2, "max": 1.2 }, "fixed": true }, // motion, sound
        { "id": "fact",    "role": "beat",    "durationS": { "min": 8, "max": 14 } },
        { "id": "why",     "role": "beat",    "durationS": { "min": 10, "max": 18 } },
        { "id": "payoff",  "role": "payoff",  "durationS": { "min": 6, "max": 10 } },
        { "id": "endcard", "role": "endcard", "durationS": { "min": 2.5, "max": 2.5 }, "fixed": true }
      ]
    }
  },
  "intent": {
    "objective": { "statement": "Get returning viewers to follow after episode 3", "kind": "behavioural", "measure": "follow rate per view" },
    "audience": { "portrait": "Adults who scroll nature content on the commute, curious but impatient", "watchMode": "muted-first", "familiarity": "mixed" },
    "insight": "People love one weird fact they can repeat to a friend.",
    "proposition": { "text": "Every rock pool hides a superpower.", "approvedParaphrases": ["This tiny creature has a superpower"], "mustAppear": "on-screen" },
    "proofPoints": ["One named creature", "One measurable fact", "One everyday comparison"],
    "tone": [
      {
        "adjective": "curious",
        "means": "Reveals, not explosions; let the viewer look first",
        "notMeans": "Mysterious or dark",
        "parameters": {
          "motion": ["{motion.easing.entrance}", "{motion.duration.reveal}"],
          "typography": ["{type.headline}"],
          "colour": ["{colour.anchor.kelp}"],
          "sound": ["tempo 84-96 bpm", "soft plucked SFX"]
        }
      },
      {
        "adjective": "playful",
        "means": "One cheeky moment per episode, carried by the mascot",
        "notMeans": "Bounce on every element",          // tells reviewers not to want more bounce
        "parameters": { "motion": ["{motion.easing.expressive}", "BRIEF-EXPRESSIVE-BUDGET"] }
      }
    ]
  },
  "mandatories": [
    { "id": "M-LOGO", "rule": "Wordmark never stretched, rotated or recoloured", "source": "LTL brand guide p4", "check": "BRIEF-LOGO-INTEGRITY", "consumers": ["art", "motion"] },
    { "id": "M-ENDCARD", "rule": "End card holds wordmark fully at rest", "source": "LTL brand guide p9", "check": "BRIEF-LOGO-HOLD", "params": { "holdS": 1.5 }, "consumers": ["pacing", "motion"] },
    { "id": "M-SONIC", "rule": "Sonic logo on ident, synced to wordmark lock", "source": "LTL sound guide", "check": "BRIEF-SONIC-LOGO-SYNC", "consumers": ["sound", "motion"] },
    { "id": "M-SPEC", "rule": "1080x1920, 30 fps, h264 yuv420p", "source": "Distribution plan", "check": "BRIEF-DELIVERABLE-SPEC", "consumers": ["pacing"] }
  ],
  "preferences": [
    { "id": "P-SPACE", "statement": "At least 40% of each frame is calm background", "weight": 0.6, "check": "judgement", "consumers": ["art", "typography"] },
    { "id": "P-WORDS", "statement": "No more than 7 words on screen at once", "weight": 0.8, "check": "TYPO pillar", "consumers": ["typography", "pacing"] }
  ],
  "ruleBreaks": [
    {
      "id": "B-MONO-EP12",
      "breaks": "tokens.colour.palette",
      "scope": { "episodes": ["ep12"] },
      "why": "Deep-sea special: reinforces 'no light down here' (insight)",
      "successCondition": "Only the proposition uses the kelp anchor colour; everything else greyscale",
      "approvedBy": "series CD"
    }
  ],
  "tokens": {
    "file": "tokens/low-tide-lab.tokens.json",
    "motion": { "expressiveBudget": { "maxMoments": 1, "maxRuntimeShare": 0.08 }, "durationScalesWithDistance": true, "minFramesPerTween": 4 }
  },
  "sound": {
    "sonicLogo": { "file": "audio/ltl-sonic.wav", "sha256": "…", "lengthS": 1.1, "syncMarker": "wordmark-lock", "toleranceMs": 34 },
    "musicTempoBpm": { "min": 84, "max": 96 },
    "voice": { "kind": "tts", "voiceId": "invented-voice-03" }
  },
  "fixed": ["ident", "endcard", "type.system", "colour.anchor.kelp", "sonicLogo", "mascot.design"],
  "variable": [
    { "axis": "accentColour", "values": ["urchin", "anemone", "sand"], "noRepeatWithinEpisodes": 1 },
    { "axis": "layout", "values": ["specimen-centre", "split-top", "macro-crop"], "noRepeatWithinEpisodes": 1 },
    { "axis": "musicCue", "values": ["cue-a", "cue-b", "cue-c", "cue-d"], "noRepeatWithinEpisodes": 2 }
  ],
  "priorities": ["mandatories", "intent.proposition", "fixed", "intent.tone", "preferences"],
  "deliverables": [ { "aspect": "9:16", "width": 1080, "height": 1920, "fps": 30, "codec": "h264-yuv420p", "durationS": 48 } ],
  "evaluation": {
    "criteria": [
      { "id": "E1", "question": "Muted, at 1x, is the proposition clear by the payoff?", "briefRef": "intent.proposition" },
      { "id": "E2", "question": "Would a returning viewer recognise the series within the ident?", "briefRef": "fixed" },
      { "id": "E3", "question": "Is the one playful moment earned and well-timed?", "briefRef": "intent.tone[1]" }
    ],
    "scale": "1-5"
  }
}
```

### 12.3 Matching DTCG token excerpt (2025.10 shapes + VCR extension)

```json
{
  "motion": {
    "duration": {
      "$type": "duration",
      "reveal":  { "$value": { "value": 600, "unit": "ms" } },
      "settle":  { "$value": { "value": 400, "unit": "ms" } }
    },
    "easing": {
      "$type": "cubicBezier",
      "entrance":   { "$value": [0, 0, 0.3, 1], "$description": "Same values as Carbon entrance expressive" },
      "exit":       { "$value": [0.4, 0.14, 1, 1] },
      "expressive": {
        "$value": [0.4, 0.14, 0.3, 1],
        "$extensions": { "dev.vcr.motion": { "spring": { "stiffness": 380, "damping": 18, "mass": 1 }, "useSpring": true } }
      }
    },
    "transition": {
      "reveal": { "$type": "transition", "$value": { "duration": "{motion.duration.reveal}", "delay": { "value": 0, "unit": "ms" }, "timingFunction": "{motion.easing.entrance}" } }
    }
  }
}
```

The spring numbers are invented for the example. The fallback curve is what tools without the extension will render.

---

## 13. Encoding for an AI agent: rules table

| ID | Check | Threshold | Tier | Applies to |
|---|---|---|---|---|
| `BRIEF-SCHEMA-VALID` | Brief validates against VCR series-brief schema | 0 errors | heuristic (VCR-internal) | All projects; measurable (JSON Schema validator) |
| `BRIEF-OBJECTIVE-SINGLE` | Exactly one primary objective; `kind` set | count = 1 ("One brief = one strategy" [19]) | standard (IPA guide) | Brief; measurable (schema + count) |
| `BRIEF-OBJECTIVE-MEASURE` | Objective has a success measure | non-empty `measure` ("How will we know we've arrived?" [21]) | standard (ISBA/CAF) | Brief; measurable (presence); quality is judgement |
| `BRIEF-AUDIENCE-SPECIFIC` | Audience portrait is more than demographics; watchMode declared | `watchMode` present; portrait not only age/gender terms | standard (IPA guide [19]) for portrait; heuristic for detection | Brief; partly measurable (lexical check) + judgement |
| `BRIEF-PROPOSITION-SINGLE` | One message; no conjoined ideas | no " and ", ";", list commas in `proposition.text` (heuristic proxy for [19][37]) | heuristic | Brief; measurable (string test), with judgement override |
| `BRIEF-EVAL-CRITERIA` | Evaluation criteria present, each tied to a brief path | ≥1 criterion; every `briefRef` resolves | standard (IPA guide [19]) | Brief; measurable |
| `BRIEF-ADJECTIVE-OPERATIONALISED` | Each tone adjective has means/notMeans and ≥1 parameter in ≥2 pillars | 100% of adjectives | heuristic | Brief; measurable |
| `BRIEF-MANDATORY-SOURCED` | Each mandatory names a source and a check | 100% | heuristic (practitioner) | Brief; measurable |
| `BRIEF-NO-PRESCRIBE` | Mandatories constrain ends, not means | judgement | standard (IPA "Don't prescribe the solution" [19]) | Brief; judgement only |
| `BRIEF-MANDATORY-PASS` | Every mandatory's check passes in the render | 100% pass; any fail = blocker | heuristic (VCR-internal aggregator) | All renders; measurable (aggregates child checks) |
| `BRIEF-DELIVERABLE-SPEC` | Render matches declared width, height, fps, codec, pix_fmt, duration | exact; duration ±1 frame | heuristic (VCR-internal) | Delivery files; measurable (ffprobe) |
| `BRIEF-DTCG-FORMAT` | Token file conforms to DTCG 2025.10 shapes | duration = `{value, unit∈{ms,s}}`; cubicBezier = 4 numbers; transition = duration/delay/timingFunction [2] | standard (DTCG 2025.10) | Token files; measurable |
| `BRIEF-DTCG-EXTENSIONS` | VCR-only data lives under a vendor key in `$extensions` | key matches reverse-domain pattern [2] | standard (DTCG 2025.10) | Token files; measurable |
| `BRIEF-TOKEN-ONLY-EASING` | Each sampled tween's progress curve matches a declared easing token (or a declared break) | RMS error ≤ 0.03 in normalised progress (heuristic) | heuristic | Browser scenes, Blender exports; measurable (time-series fit) |
| `BRIEF-TOKEN-ONLY-DURATION` | Each tween's duration matches a declared duration token | \|measured − token\| ≤ 1 frame period | heuristic | Video scenes; measurable |
| `BRIEF-DURATION-FRAMES` | No tween shorter than `minFramesPerTween` at delivery fps | default ≥ 3 frames (heuristic) | heuristic | Video; measurable |
| `BRIEF-DURATION-DISTANCE` | Larger moves take longer (when `durationScalesWithDistance`) | Spearman ρ(distance, duration) > 0 across spatial tweens in a scene (heuristic proxy for Carbon [6]) | standard (Carbon principle) / heuristic (threshold) | Spatial tweens; measurable |
| `BRIEF-EXIT-ACCEL` | Exits that leave permanently use exit/accelerate easing | progress curve convex (late speed > early speed) | standard (Carbon [6]); scope: brands adopting this grammar | Exiting elements; measurable |
| `BRIEF-NO-LINEAR-SPATIAL` | No linear easing on start-stop spatial moves | max deviation from linear ≥ 0.05; exempt loops and progress bars | standard (Carbon "Strictly linear movement appears unnatural" [6]) | Spatial tweens; measurable |
| `BRIEF-EXPRESSIVE-BUDGET` | Expressive tweens limited to declared moments | count ≤ `maxMoments`; runtime share ≤ `maxRuntimeShare` | standard (Carbon "occasional, important moments" [6]) / heuristic (numbers) | Motion; measurable |
| `BRIEF-TOKEN-ONLY-COLOR` | Flat-region colours map to palette tokens | ΔE2000 ≤ 5 after decode (heuristic) | heuristic | Frames, delivery video; measurable |
| `BRIEF-COLOR-ANCHOR-SHARE` | Anchor colour present within declared share range | brief-declared range | heuristic (pattern from [16]) | Frames; measurable |
| `BRIEF-LOGO-INTEGRITY` | Logo not stretched, skewed, rotated, recoloured or re-shaped | \|scaleX/scaleY − 1\| ≤ 0.01; skew = 0; rotation = 0 unless declared; fills ∈ logo colours | platform ([18] for Spotify) / brief-declared for own brand | Logo elements; measurable |
| `BRIEF-LOGO-CLEARSPACE` | No other element intrudes on logo clear space | 0 px intersection with declared clearspace box | heuristic (brief-declared values) | Logo frames; measurable |
| `BRIEF-LOGO-HOLD` | Logo fully at rest for declared hold | ≥ `holdS` with opacity ≥ 0.99, velocity 0 | heuristic (brief-declared) | End cards; measurable |
| `BRIEF-THIRD-PARTY-ART` | Third-party artwork not animated, cropped, overlaid or blurred | 0 transforms/filters on tagged artwork | platform (Spotify [18]) | Partner content; measurable |
| `BRIEF-SONIC-LOGO-PRESENT` | Declared sonic logo present and unmodified | cross-correlation peak ≥ 0.9 vs reference file (heuristic) | heuristic | Audio; measurable |
| `BRIEF-SONIC-LOGO-SYNC` | Sonic-logo onset aligned with visual lock marker | \|Δt\| ≤ `toleranceMs` (default 1 frame) | heuristic | Audio + motion; measurable |
| `BRIEF-PROPOSITION-ONSCREEN` | In muted-first placements the proposition (or approved paraphrase) appears on screen | present, fuzzy match ≥ 0.8, readable per `TYPO-*` reading-time rules | heuristic | 9:16/social; measurable (DOM/OCR) |
| `BRIEF-HOOK-WINDOW` | Hook segment ends within declared window | hook end ≤ `segments.hook.durationS.max` | heuristic | Social; measurable (markers) |
| `BRIEF-SEGMENT-BUDGET` | Each segment within its declared duration range | within [min,max] | heuristic | Series; measurable (markers) |
| `BRIEF-FIXED-PRESENT` | All fixed recognisers present and unchanged | pHash distance to canonical ≤ 6/64 bits (heuristic) | heuristic | Series episodes; measurable |
| `BRIEF-VARIABLE-RANGE` | Variable axes take only declared values | 100% | heuristic | Series episodes; measurable |
| `BRIEF-SERIES-ROTATION` | Variable combination not repeated within window | per-axis `noRepeatWithinEpisodes` | heuristic | Series; measurable (continuity log) |
| `BRIEF-SERIES-DISTINCT` | Episode not a near-duplicate of recent episodes outside fixed segments | median keyframe pHash distance ≥ 12/64 bits (heuristic) | heuristic | Series; measurable |
| `BRIEF-RULEBREAK-DECLARED` | Every off-token/off-preference deviation is covered by a `ruleBreaks` entry in scope | 0 undeclared visible deviations | heuristic | All; measurable (diff against tokens) |
| `BRIEF-RULEBREAK-SUCCESS` | Declared break meets its success condition | judgement (sometimes measurable, e.g. colour isolation) | heuristic | Declared breaks; mostly judgement |
| `BRIEF-LOOP-SEAM` | Loops continuous at the seam | frame(0) vs frame(N) ΔE ≤ 2 and velocity continuity | heuristic | Loops; measurable |
| `BRIEF-NO-DEFAULT-LEAK` | No library-default eases/fonts/colours when tokens are declared | 0 occurrences of defaults | heuristic | Browser scenes; measurable (static + runtime) |
| `BRIEF-TRACE-FINDING` | Every reviewer finding cites a resolvable brief path or is labelled taste | 100%; taste findings ≤ minor | heuristic (VCR-internal) | Review outputs; measurable |
| `BRIEF-PRIORITY-APPLIED` | Cross-pillar conflicts resolved by declared priority order | resolution cites `priorities` | heuristic | Reviews; judgement (traceable) |
| `BRIEF-VERSION-STAMP` | Render and review record brief version | present and equals current or flagged stale | heuristic | All; measurable |

---

## 14. How to measure in VCR

General rule: **measure with dense seeks, judge with delivered frames.** `window.__scene.seek(t)` is deterministic, so the checker can sample at any t (e.g. every 2 ms) to recover curves. But viewers only see delivery-fps frames, so perceptual judgements use those frames.

### `BRIEF-TOKEN-ONLY-EASING`
- **Inputs:** element transforms/opacity/colour from computed styles at time t (DOM scenes); scene-graph properties via an exposed `__scene.inspect?(t)` (canvas, PixiJS, three.js); the token file.
- **Calculation:**
  1. Segment each property's time series into tweens: runs where |dv/dt| > ε, bounded by rest.
  2. Normalise: x = (t − t0)/(t1 − t0), u = (v − v0)/(v1 − v0).
  3. For each candidate `cubicBezier` token, solve Bx(s) = x by Newton/bisection, then compare By(s) to u.
  4. RMS over samples: best match ≤ 0.03 → on-token.
  5. Overshoot (u > 1.02) → classify as expressive/spring and compare to the extension spring (simulate) or fallback curve.
- **Sampling:** ≥ 50 samples per tween via sub-frame seeks.
- **Failure modes:**
  - GSAP named eases (e.g. `power2.out`) are not exact cubic-béziers, so expect a residual RMS of about 0.01–0.02. Calibrate tolerance per library.
  - Compound tweens on one property (overlapping timelines) merge segments.
  - Motion-path tweens: measure arc-length progress, not x/y separately.
  - Colour tweens interpolate in a colour space that may not be linear in u.
  - Very short tweens (< 3 frames) are perceptually indistinguishable whatever the fit.

### `BRIEF-TOKEN-ONLY-DURATION` and `BRIEF-DURATION-FRAMES`
- **Inputs:** tween segments from above; delivery fps.
- **Calculation:** measured duration = t1 − t0; frame count = duration × fps. Compare to the nearest token: pass if |Δ| ≤ 1000/fps ms.
- **Reference (computed from published values):**

| Token | ms | @24 fps | @25 | @30 | @60 |
|---|---|---|---|---|---|
| Carbon `fast-01` [6] | 70 | 1.68 frames | 1.75 | 2.1 | 4.2 |
| Carbon `moderate-01` [6] | 150 | 3.6 | 3.75 | 4.5 | 9 |
| Carbon `moderate-02` [6] | 240 | 5.76 | 6 | 7.2 | 14.4 |
| Carbon `slow-01` [6] | 400 | 9.6 | 10 | 12 | 24 |
| Carbon `slow-02` [7] | 700 | 16.8 | 17.5 | 21 | 42 |
| M3 `short1` [9] | 50 | 1.2 | 1.25 | 1.5 | 3 |
| M3 `extra-long4` [9] | 1000 | 24 | 25 | 30 | 60 |

- **Failure modes:**
  - Rest detection threshold ε too high truncates the slow tail of decelerating curves, so durations under-measure. Use ε relative to the total delta (e.g. 0.1%).
  - Delays inside transition composites are counted as tween time if the property is constant then jumps.

### `BRIEF-DURATION-DISTANCE`
- **Calculation:** for spatial tweens, distance = Euclidean displacement of the element centre (or scale delta × element diagonal). Compute Spearman ρ against duration across the scene. Flag if ρ ≤ 0 with ≥ 4 tweens.
- **Failure modes:** deliberate rhythmic equal durations (music-locked) legitimately break this. The brief should set `durationScalesWithDistance: false` or declare a break.

### `BRIEF-EXIT-ACCEL`, `BRIEF-NO-LINEAR-SPATIAL`
- **Calculation:**
  - Exit: the element ends with opacity 0 or outside the frame bounds. Require mean velocity in the last 30% > mean velocity in the first 30%.
  - Linear: max |u(x) − x| < 0.05 → linear.
- **Failure modes:** exits that "stay nearby" (Carbon's exception [6]) need a tag (`data-vcr-exit="nearby"`). Loops and progress indicators must be tagged as exempt.

### `BRIEF-EXPRESSIVE-BUDGET`
- **Calculation:** classify tweens as expressive if they match an expressive token, overshoot, or use a spring extension. Moments = clusters of expressive tweens within 250 ms of each other (heuristic). Runtime share = union of expressive tween intervals / scene duration.
- **Failure modes:** a single long ambient float classed as expressive can eat the share. Allow an `ambient` tag.

### `BRIEF-TOKEN-ONLY-COLOR`, `BRIEF-COLOR-ANCHOR-SHARE`
- **Inputs:** rendered PNG frames *and* decoded delivery video.
- **Calculation:** find flat regions (≥ 8×8 px, local variance below threshold). Convert to CIELAB from the decoded frames using the *declared* matrix (BT.709 limited range for H.264 yuv420p delivery). Take ΔE2000 to the nearest palette token. Anchor share = pixel fraction within ΔE ≤ 5 of the anchor.
- **Sampling:** 1 frame per second plus every marker.
- **Failure modes:**
  - Matrix/range mismatch (BT.601 vs BT.709; full vs limited range) creates false failures of several ΔE.
  - 4:2:0 chroma subsampling smears colour on thin strokes and small text, so exclude regions under 8 px.
  - Gradients, blur and anti-aliased edges are not flat.
  - Platform re-encodes shift colours further. Check against VCR's own master, and treat platform-downloaded copies as informational only.

### `BRIEF-LOGO-INTEGRITY`, `BRIEF-LOGO-CLEARSPACE`, `BRIEF-LOGO-HOLD`, `BRIEF-THIRD-PARTY-ART`
- **Inputs:** elements tagged `data-vcr-role="logo"` or `"third-party-art"`; computed transform matrices across all frames; for canvas/WebGL, a proposed `__scene.roleBounds?(t, role)` extension analogous to `textBounds()`; for stills, template matching against the reference SVG.
- **Calculation:**
  - Decompose the 2D/3D matrix into scale, skew and rotation. Check the ratio, skew and rotation thresholds at every frame where the logo is visible.
  - Fill/stroke colours from computed styles against the logo colour list.
  - Clear space: logo box expanded by k × logo height. Intersect with all other visible element boxes.
  - Hold: contiguous interval with opacity ≥ 0.99 and transform velocity 0 ≥ `holdS`.
- **Failure modes:**
  - Intentional build-on animations (stroke reveals [15]) temporarily break "unchanged shape". Only enforce integrity at rest, or declare the reveal as an approved logo animation.
  - SVG `viewBox` scaling hides non-uniform scale. Read the resolved CTM.
  - Text behind the logo with opacity 0 should not count as an intrusion.

### `BRIEF-SONIC-LOGO-PRESENT`, `BRIEF-SONIC-LOGO-SYNC`
- **Inputs:** the final mix (WAV) or the decoded audio from the delivery file; the reference sonic-logo file and hash; the `markers` time for the visual lock.
- **Calculation:**
  - Presence: normalised cross-correlation of the reference against the mix in a ±2 s window around the marker; peak ≥ 0.9.
  - Sync: onset of the matched segment (correlation lag) minus marker time.
- **Failure modes:**
  - Music under the logo lowers correlation, so use a stem if one is available.
  - Lossy AAC encoding adds encoder priming delay. Apple's Technical Note TN2258 says "the most common delay used was 2112 audio samples", which is about 47.9 ms at 44.1 kHz or 44 ms at 48 kHz, and that untrimmed "the audio will be 2112 samples behind the video". It also warns that "The encoding delay for an AAC encoder is implementation dependent" [38]. Measure on the pre-encode mix, and verify delivery offset separately.
  - Time-stretched sonic logos fail presence by design. This is correct if the brief forbids stretching.

### `BRIEF-PROPOSITION-ONSCREEN`, `BRIEF-HOOK-WINDOW`, `BRIEF-SEGMENT-BUDGET`
- **Inputs:** DOM text at time t; `textBounds()` for canvas text; OCR on frames as fallback; segment `markers`.
- **Calculation:** normalised Levenshtein similarity to `proposition.text` or approved paraphrases ≥ 0.8. On-screen duration measured while visible (opacity ≥ 0.9, inside safe zone per `TYPO-*`). Segment durations from marker deltas.
- **Failure modes:**
  - Split across lines/frames (word-by-word reveals) needs concatenation over a window.
  - Kinetic type that is legible for only a few frames passes the string test but fails reading time. Defer to the `TYPO-*` reading-time rules.

### `BRIEF-FIXED-PRESENT`, `BRIEF-SERIES-DISTINCT`, `BRIEF-VARIABLE-RANGE`, `BRIEF-SERIES-ROTATION`
- **Inputs:** rendered frames of the current and previous N episodes; episode parameter manifests; the continuity log.
- **Calculation:**
  - Fixed: 64-bit pHash of K frames sampled in each fixed segment vs the canonical render; distance ≤ 6.
  - Distinct: pHash of keyframes (at markers) outside fixed segments; median nearest-neighbour distance vs the last N episodes ≥ 12.
  - Variable/rotation: manifest lookups.
- **Failure modes:**
  - pHash is insensitive to motion and timing. Two episodes with identical stills but different rhythm look "duplicate"; add a motion-signature vector (tween count, mean duration, expressive share) as a second feature.
  - Dark, low-contrast series compress pHash distances.

### `BRIEF-RULEBREAK-DECLARED`, `BRIEF-NO-DEFAULT-LEAK`
- **Calculation:** union of all off-token findings (easing, duration, colour, logo) minus findings covered by in-scope `ruleBreaks` → undeclared list. Default leak: a static scan for library default eases (e.g. GSAP tweens with no `ease`, CSS `ease` keyword, WAAPI default `linear`), system font fallbacks in computed `font-family`, and unset colours.
- **Failure modes:** static scans miss runtime-constructed eases, so pair them with runtime sampling. Note that the WAAPI default easing is linear, which collides with `BRIEF-NO-LINEAR-SPATIAL`.

### `BRIEF-DELIVERABLE-SPEC`, `BRIEF-LOOP-SEAM`, `BRIEF-VERSION-STAMP`, brief-level lint rules
- **Deliverables:** `ffprobe` stream width, height, r_frame_rate, pix_fmt, codec_name, duration; duration tolerance ±1 frame.
- **Loop:** compare frame 0 and frame N decoded; ΔE ≤ 2 on flat regions; per-element velocity at the seam from seeks at t = duration − δ and t = δ.
- **Brief lint:** JSON Schema validation plus string tests (§13).
- **Failure modes:** variable-frame-rate encodes report average fps; the encoder must force CFR.

---

## 15. VCR-specific rendering and delivery notes

- **Frame quantisation turns UI tokens into video artefacts.** At 24 fps a 70ms token is under two frames (table in §14), so a "micro-interaction" becomes a pop. Video series briefs should declare their own duration ramp, starting at about 3–4 frames, and treat UI-system values as *ratios*, not literals. This is a heuristic based on arithmetic, not on a published standard.
- **Seek-based measurement can see what viewers cannot.** Sub-frame seeks recover exact curves, but the viewer sees only frames. Report on-token/off-token from dense samples, and judge "does it feel calm?" from delivered frames at 1×.
- **Motion cannot be judged from stills.** Contact sheets hide easing, rhythm and sync. Reviewer subagents must receive either the video or sampled time series. A still-only review of motion pillars must be labelled `partial`.
- **Easing at low fps.** At 24 fps a 400ms ease-out has about 9–10 samples, so the shape of the deceleration tail is coarsely visible. Emphasised/expressive curves read differently at 24 vs 60 fps. Declare the fps in the brief and approve motion at that fps.
- **`yuv420p` and colour tokens.** Palette conformance must be checked after decode with the right matrix. Saturated reds and blues on thin strokes lose chroma resolution, so brand colours on small text are least reliable.
- **ProRes 4444 alpha masters** keep full chroma. Run colour checks on the master, and judge delivery copies with a looser tolerance.
- **Platform re-encoding** lowers bitrate and may shift gamma. Mandatory checks run on VCR's masters; downloaded platform copies are a monitoring signal only.
- **Deterministic audio synthesis** makes sonic-logo correlation exact for procedural SFX. Licensed or TTS audio needs a reference hash per version.
- **Springs in a seekable scene** must be computed as closed-form or pre-integrated functions of t, not stepped per frame. Otherwise seeks are not reproducible, and `BRIEF-TOKEN-ONLY-EASING` sees different curves at different fps.

---

## 16. Master checklists

### 16.1 Analysis (reviewer)

1. Brief version stamped; brief lint passes (`BRIEF-SCHEMA-VALID`, `BRIEF-OBJECTIVE-SINGLE`, `BRIEF-OBJECTIVE-MEASURE`, `BRIEF-AUDIENCE-SPECIFIC`, `BRIEF-PROPOSITION-SINGLE`, `BRIEF-EVAL-CRITERIA`, `BRIEF-ADJECTIVE-OPERATIONALISED`, `BRIEF-MANDATORY-SOURCED`, `BRIEF-VERSION-STAMP`).
2. Deliverables exact (`BRIEF-DELIVERABLE-SPEC`).
3. Mandatories all pass (`BRIEF-MANDATORY-PASS`, `BRIEF-LOGO-INTEGRITY`, `BRIEF-LOGO-CLEARSPACE`, `BRIEF-LOGO-HOLD`, `BRIEF-THIRD-PARTY-ART`, `BRIEF-SONIC-LOGO-PRESENT`, `BRIEF-SONIC-LOGO-SYNC`).
4. Watched at 1× in the declared watch mode; proposition identified and compared (`BRIEF-PROPOSITION-ONSCREEN`, `BRIEF-HOOK-WINDOW`).
5. Tokens measured (`BRIEF-TOKEN-ONLY-EASING`, `BRIEF-TOKEN-ONLY-DURATION`, `BRIEF-DURATION-FRAMES`, `BRIEF-DURATION-DISTANCE`, `BRIEF-EXIT-ACCEL`, `BRIEF-NO-LINEAR-SPATIAL`, `BRIEF-EXPRESSIVE-BUDGET`, `BRIEF-TOKEN-ONLY-COLOR`, `BRIEF-COLOR-ANCHOR-SHARE`, `BRIEF-NO-DEFAULT-LEAK`).
6. Deviations classified (`BRIEF-RULEBREAK-DECLARED`, `BRIEF-RULEBREAK-SUCCESS`).
7. Series checks (`BRIEF-FIXED-PRESENT`, `BRIEF-VARIABLE-RANGE`, `BRIEF-SERIES-ROTATION`, `BRIEF-SERIES-DISTINCT`, `BRIEF-SEGMENT-BUDGET`, `BRIEF-LOOP-SEAM` for loops).
8. Evaluation criteria scored 1–5, each tied to a field.
9. Conflicts resolved by priority (`BRIEF-PRIORITY-APPLIED`).
10. Every finding traced (`BRIEF-TRACE-FINDING`); severities assigned; no taste finding above minor.

### 16.2 Creation (creator)

1. Brief read in order; questions raised if objective, audience, proposition or mandatories are missing (`BRIEF-OBJECTIVE-SINGLE`, `BRIEF-PROPOSITION-SINGLE`).
2. Intent statement written into scene metadata.
3. Variable-axis values chosen and logged (`BRIEF-VARIABLE-RANGE`, `BRIEF-SERIES-ROTATION`).
4. Tokens imported; no literals or defaults (`BRIEF-DTCG-FORMAT`, `BRIEF-NO-DEFAULT-LEAK`).
5. Durations quantised to fps (`BRIEF-DURATION-FRAMES`).
6. Expressive moments planned against markers (`BRIEF-EXPRESSIVE-BUDGET`).
7. Fixed recognisers built from locked templates (`BRIEF-FIXED-PRESENT`, `BRIEF-SONIC-LOGO-SYNC`, `BRIEF-LOGO-HOLD`).
8. Rule-breaks declared before building (`BRIEF-RULEBREAK-DECLARED`).
9. Logo and third-party art tagged with `data-vcr-role` (`BRIEF-LOGO-INTEGRITY`, `BRIEF-THIRD-PARTY-ART`).
10. Self-check run; watched muted and with sound; compared with the previous episode (`BRIEF-SERIES-DISTINCT`, `BRIEF-PROPOSITION-ONSCREEN`).

---

## 17. Caveats

- **Industry briefing guidance is survey and expert opinion, not outcome research.** The IPA/BetterBriefs figures are self-reported attitudes [19]. None of the sources links specific brief fields to in-market effectiveness.
- **Wasted-budget figures disagree:** "one third" (global, 2021) vs "26%" (UK) [19][20].
- **Material 3 is mid-transition.** Easing/duration tokens are "no longer maintained", but springs are not yet expressible in DTCG [9][2]. Cubic-bezier values for M3 were not verified from primary documentation.
- **Fluent 2 values are unresolved.** Token *names* are confirmed from the package [12], but curve values have documented internal mismatches [13] and durations were seen only in secondary sources.
- **Uber's Base motion page** was read only via a search extract [14]. Popular "Uber motion guidelines" files online are unofficial.
- **Brand-personality evidence is about type and static/dynamic logos**, with small effect sizes [25]. Motion-parameter mappings (easing → adjective) are expert taste, not tested.
- **Sonic logo length** has no traceable empirical basis in the sources found [33][34][35][36].
- **Series bible guidance** comes from screenwriting blogs (secondary) [30][31][32]. No standards body defines a bible.
- **Leo Burnett's HumanKind scale** is reported in trade press [22][23], not in a primary agency publication. It scores idea quality, not compliance.
- **Likely to go out of date:**
  - DTCG drafts (a 2026 preview exists [2]);
  - Material's spring tokens;
  - Carbon's promised "Dynamic duration" feature ("an upcoming built-in feature" [6]);
  - design-tool DTCG support [5].
- **All numeric thresholds marked heuristic** (RMS 0.03, ΔE 5, pHash 6/12 bits, ≥3 frames) are VCR proposals to be calibrated on real renders. They are not published values.

---

## 18. Verification ledger (all entries checked 2026-11-06)

| # | Claim | Result | Source checked |
|---|---|---|---|
| 1 | DTCG first stable version 2025.10 announced October 28, 2025 | confirmed | [1] W3C CG blog |
| 2 | DTCG format "is not a W3C Standard nor is it on the W3C Standards Track" | confirmed (in preview-draft text; same CG status applies to 2025.10) | [2] |
| 3 | A preview draft dated 08 September 2026 exists, marked do-not-implement | confirmed | [2] |
| 4 | DTCG duration value = object with numeric value and unit "ms" or "s" | confirmed via search extract of the format page; full-text fetch truncated before §8 | [2] |
| 5 | DTCG transition composite = duration, delay, timingFunction | confirmed via search extract | [2] |
| 6 | cubicBezier x-values restricted to [0,1] | unverified (secondary implementers only) | [5] and secondary |
| 7 | Tools MUST preserve unknown `$extensions` data; vendor-specific keys | confirmed | [2] |
| 8 | Carbon standard productive `cubic-bezier(0.2, 0, 0.38, 0.9)`, expressive `cubic-bezier(0.4, 0.14, 0.3, 1)` | confirmed | [6] (page "Last updated Aug 12, 2026") |
| 9 | Carbon entrance `(0, 0, 0.38, 0.9)` / `(0, 0, 0.3, 1)`; exit `(0.2, 0, 1, 0.9)` / `(0.4, 0.14, 1, 1)` | confirmed | [6] |
| 10 | Carbon durations 70 / 110 / 150 / 240 / 400ms | confirmed | [6] |
| 11 | Carbon `duration-slow-02` = 700ms | confirmed on v10 page; current page fetch truncated | [7] |
| 12 | Carbon "Reserve expressive motion for occasional, important moments" | confirmed | [6] |
| 13 | M3 duration tokens short1 50ms … extra-long4 1000ms | confirmed via search extract; direct fetch returned "requires JavaScript" | [9] |
| 14 | M3 easing/duration "no longer maintained"; springs replace it | confirmed via search extract | [9] |
| 15 | M3 easing cubic-bezier values (e.g. standard 0.2,0,0,1) | unverified (secondary repositories only; primary page not readable) | — |
| 16 | M2: "Standard easing with a quick 300ms duration" / "Emphasized easing with a long 650ms duration" | confirmed via search extract | [10] |
| 17 | Fluent token names (curve*/duration*) | confirmed | [12] |
| 18 | Fluent durations 50–500ms ramp | unverified (secondary only) | — |
| 19 | Fluent curve values (e.g. decelerateMid `cubic-bezier(0.1,0.9,0.2,1)`) | contradicted (motion package and theme values documented as mismatched) | [13] |
| 20 | Uber Base: "Bold, Direct, with Heart"; "smooth, direct, and efficient" | confirmed via search extract; fetch returned metadata only | [14] |
| 21 | GitLab icon motion "swift at 0.65 seconds"; Interactive vs Expressive ease definitions | confirmed | [15] |
| 22 | GitLab lower thirds "opacity from 0% to 100% over 1 second" | confirmed via search extract; fetched page truncated before that section | [15] |
| 23 | Mailchimp "anchor on a single color, used with purpose" | confirmed | [16] |
| 24 | Spotify "Don't animate or distort it in any way" (artwork) | confirmed | [18] |
| 25 | IPA: 80% of marketers think they're good at briefs; only 10% of agencies agree | confirmed | [19] |
| 26 | IPA: 61% marketers / 71% agencies rank objectives most critical | confirmed | [19] |
| 27 | IPA: "only 30% of brands have evaluation criteria in place" | confirmed (cites BetterBriefs UK report 2021) | [19] |
| 28 | IPA: 54% too long / 32% too short / 14% succinct | confirmed | [19] |
| 29 | IPA: "one third of all marketing budgets" potentially wasted | confirmed; conflicts with 26% UK figure | [19] vs [20] |
| 30 | ISBA/CAF eight headings; 72% agencies / 84% clients want effectiveness criteria | confirmed (third-party-hosted PDF) | [21] |
| 31 | HumanKind scale 1 (Destructive) to 10 (Changes the world); 7 = "An inspiring idea, beautifully crafted" | confirmed in trade press (secondary) | [23] |
| 32 | Aaker five dimensions; 42-item scale | confirmed from abstract/secondary; full text not fetched | [24] |
| 33 | Grohmann et al.: naturalness, harmony, flourish most important; small R² | confirmed (full text via author copy) | [25] |
| 34 | Henderson et al.: six design dimensions | confirmed (accepted manuscript) | [26] |
| 35 | Brasel & Hagtvedt: agent animation helps dynamic, hurts stable firms | confirmed (abstract only) | [28] |
| 36 | Peer-reviewed mapping of easing/bounce to brand personality | not found | subagent search |
| 37 | Sonic logos over 5 s lose recall (IAAB) | unverified (no primary source traceable) | [36] |
| 38 | Bible length "ten pages to fifty" | confirmed (secondary blog) | [31] |
| 39 | Penpot 2.18.3 lacks DTCG cubicBezier/duration types | confirmed (issue report) | [5] |
| 40 | 70ms = 1.68 frames at 24 fps (and other table values) | confirmed (arithmetic from [6][7][9]) | computed |
| 41 | AAC encoder priming delay most commonly 2112 samples; implementation dependent | confirmed via enrichment pass (Apple TN2258) | [38] |

---

## 19. Sources

1. W3C Design Tokens Community Group, "Design Tokens specification reaches first stable version" (28 Oct 2025). https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/
2. Design Tokens Community Group, "Design Tokens Format Module 2025.10" (drafts page; latest published https://www.designtokens.org/TR/2025.10/format/). https://www.designtokens.org/tr/drafts/format/
3. Design Tokens Community Group homepage. https://www.designtokens.org/
4. Design Tokens Community Group, "Design Tokens Resolver Module 2025.10" (draft). https://www.designtokens.org/tr/drafts/resolver/
5. Penpot, Issue #12337 "Design tokens: add DTCG cubicBezier and duration types" (tool-support evidence). https://github.com/penpot/penpot/issues/12337
6. IBM, Carbon Design System, "Motion" (last updated Aug 12, 2026). https://carbondesignsystem.com/elements/motion/overview/
7. IBM, Carbon Design System v10, "Motion". https://v10.carbondesignsystem.com/guidelines/motion/overview/
8. Carbon Design System, `@carbon/motion` package README. https://github.com/carbon-design-system/carbon/tree/main/packages/motion
9. Google, Material Design 3, "Easing and duration – tokens & specs". https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
10. Google, Material Design 2, "Motion – Customization" (legacy). https://m2.material.io/design/motion/customization.html
11. Microsoft, Fluent 2, "Design tokens". https://fluent2.microsoft.design/design-tokens
12. Microsoft, `@fluentui/tokens` type definitions (unpkg). https://app.unpkg.com/@fluentui/tokens@1.0.0-alpha.14/files/dist/index.d.ts
13. Microsoft Fluent UI, Issue #31191 "Motion token values do not match theme values". https://github.com/microsoft/fluentui/issues/31191
14. Uber, Base design system, "Motion". https://base.uber.com/6d2425e9f/v/0/p/116184-motion
15. GitLab, Pajamas Design System, "Motion" (brand design). https://design.gitlab.com/brand-design/motion
16. Mailchimp, "Mailchimp Design and Brand Identity". https://mailchimp.com/design/
17. Creative Boom, "How to do motion-first branding better" (interview with DIA; secondary). https://www.creativeboom.com/insight/how-to-do-motion-first-branding-better/
18. Spotify for Developers, "Design & Branding Guidelines". https://developer.spotify.com/documentation/design
19. BetterBriefs and Mark Ritson in partnership with the IPA, "The best way for a client to brief an agency" (2022). https://ipa.co.uk/media/12104/better-briefs-booklet_10_single-pages.pdf
20. Marketing Week, "Best practice guide unveiled to tackle ineffective briefs" (secondary). https://www.marketingweek.com/best-practice-guide-better-briefs/
21. ISBA / Communications Agencies Federation (IPA, MCCA, PRCA), "The Client Brief: A best practice guide to briefing communications agencies" (third-party-hosted copy). https://www.studiowide.co.uk/assets/how-to-write-a-brief.pdf
22. Strategy, "Chasing the eight ball" (2014; Leo Burnett GPC; secondary). https://strategyonline.ca/2014/08/25/chasing-the-eight-ball/
23. adobo magazine, "Leo Burnett Asia Pacific mines creativity through unconventional scheme" (2010; secondary). https://www.adobomagazine.com/uncategorized/leo-burnett-asia-pacific-mines-creativity-through-unconventional-scheme/
24. Aaker, J. L. (1997). Dimensions of Brand Personality. *Journal of Marketing Research* 34(3), 347–356. https://doi.org/10.2307/3151897
25. Grohmann, B., Giese, J. L., & Parkman, I. D. (2013). Using type font characteristics to communicate brand personality of new brands. *Journal of Brand Management* 20(5), 389–403. https://doi.org/10.1057/bm.2012.23
26. Henderson, P. W., Giese, J. L., & Cote, J. A. (2004). Impression management using typeface design. *Journal of Marketing* 68(4), 60–72. https://doi.org/10.1509/jmkg.68.4.60.42736
27. Cian, L., Krishna, A., & Elder, R. S. (2014). This Logo Moves Me: Dynamic Imagery from Static Images. *Journal of Marketing Research* 51(2), 184–197. https://doi.org/10.1509/jmr.13.0023
28. Brasel, S. A., & Hagtvedt, H. (2016). Living brands: consumer responses to animated brand logos. *Journal of the Academy of Marketing Science* 44(5), 639–653. https://doi.org/10.1007/s11747-015-0449-2
29. Malik, S., Aitken, J., & Waalen, J. K. (2009). Communicating emotion with animated text. *Visual Communication* 8(4), 469–479. https://doi.org/10.1177/1470357209343375
30. MyEntertainment, "TV Show Bible & Format Bible" (secondary). https://www.myentertainment.tv/tv-pitch-bible
31. Screenweaver, "How to Write a TV Bible" (secondary). https://www.screenweaver.ai/blog/how-to-write-tv-show-bible
32. WeScreenplay, "Crafting a Series Bible" (secondary). https://www.wescreenplay.com/blog/crafting-a-series-bible-a-guide-for-tv-pilot-writers/
33. Swell Music & Sound, "Sonic Branding Agency" (vendor; secondary). https://swellmusicsound.com/learn-more/sonic-branding-agency-audio-identity-for-brands/
34. Music Radio Creative, "Sonic Branding Explained" (vendor; secondary). https://producer.musicradiocreative.com/sonic-branding-explained-2/
35. Brandy Sound, "How to create a sonic identity" (vendor; secondary). https://www.brandysound.fr/en/create-sonic-identity/
36. Rajiv Gopinath, "Sonic Logos and Audio Branding" (blog; untraceable claim). https://www.rajivgopinath.com/blogs/media-planning-hub/sonic-logos-and-audio-branding
37. Square Holes, "Write an 'SMP' (Single Minded Proposition)" (practitioner; secondary). https://squareholes.com/blog/2021/06/18/supercharge-your-creative/
38. Apple, Technical Note TN2258, "AAC Audio – Encoder Delay and Synchronization". https://developer.apple.com/library/archive/technotes/tn2258/_index.html

## 20. Citation links

The escaped `\[n\]` markers in the text point to this list; plain `[n]` markers point to §19.

1. <https://ipa.co.uk/media/12104/better-briefs-booklet_10_single-pages.pdf>
2. [Motion | Carbon Design System](https://carbondesignsystem.com/elements/motion/overview/)
3. [Easing and duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)
4. [Move the motion tokens and components onto M3's motion system · Issue #143 · hfournier/astro-components · GitHub](https://github.com/hfournier/astro-components/issues/143)
5. [(PDF) Using Type Font Characteristics to Communicate Brand Personality of New Brands](https://www.researchgate.net/publication/256016577_Using_Type_Font_Characteristics_to_Communicate_Brand_Personality_of_New_Brands)
6. [Advertising Creative Brief Template](https://www.scribd.com/document/138313255/Creative-Brief-Template)
7. [Write an 'SMP' (Single Minded Proposition) to supercharge your creative - Square Holes - Cultural Insight Studio](https://squareholes.com/blog/2021/06/18/supercharge-your-creative/)
8. [Creative Brief Examples: 5 Copy-and-Paste Templates](https://popjam.io/blog/creative-brief-examples)
9. [Best practice guide unveiled to tackle ineffective briefs](https://www.marketingweek.com/best-practice-guide-better-briefs/)
10. [Microsoft Fluent 2 Design System for Workspace Access](https://open-design.ai/design-system/microsoft-fluent/)
11. [Fluent Design System (Fluent 2)](https://www.claudepluginhub.com/skills/intense-visions-harness-claude/design-fluent-design)
12. [skills/skills/fluent2-design/SKILL.md at main · veronicaward/skills · GitHub](https://github.com/veronicaward/skills/blob/main/skills/fluent2-design/SKILL.md)
13. [Motion token values do not match theme values · Issue #31191 · microsoft/fluentui · GitHub](https://github.com/microsoft/fluentui/issues/31191)
14. [Uber Motion Guidelines - Jason Feng](https://www.behance.net/gallery/69157695/Uber-Motion-Guidelines)
15. [Sonic Branding Agency](https://swellmusicsound.com/learn-more/sonic-branding-agency-audio-identity-for-brands/)
16. [Sonic Branding Explained: How a Sonic Logo Builds Identity](https://producer.musicradiocreative.com/sonic-branding-explained-2/)
17. [How to create a sonic identity that sound like you](https://www.brandysound.fr/en/create-sonic-identity/)
18. [Sonic Logos and Audio Branding - Rajiv Gopinath](https://www.rajivgopinath.com/blogs/media-planning-hub/sonic-logos-and-audio-branding)
19. [TV Bible Template Used by Netflix & HBO Writers in 2026 - River](https://rivereditor.com/blogs/tv-bible-template-netflix-hbo-writers-2026)
20. [TV Show Bible Format: Template + 7 Examples (2026) - AIScriptReader](https://aiscriptreader.com/blog/screenwriting/tv-show-bible-format-template-and-examples)
21. [How to Write a TV Bible: The Ultimate Guide for Series Creators](https://www.screenweaver.ai/blog/how-to-write-tv-show-bible)
22. [Leo Burnett Asia Pacific mines creativity through unconventional scheme - adobo Magazine Online](https://www.adobomagazine.com/uncategorized/leo-burnett-asia-pacific-mines-creativity-through-unconventional-scheme/)
23. [Chasing the eight ball » Strategy](https://strategyonline.ca/2014/08/25/chasing-the-eight-ball/)
