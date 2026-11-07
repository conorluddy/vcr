# Image Direction Knowledge Base (`IMAGE-*`)

> **VCR integration (2026-11-07):** Reference-only research seed. Verification statements below are reported by the supplied research, not independently reverified during import. Selection criteria are advisory until calibrated under `REVIEW-*`; no automatic delivery or approval gates are implemented. Manifest fields and derivative relations are proposals for the shared asset-manifest concern, not a shipped schema. Production assets and records stay in their selected workspace.

**Path:** `references/image-direction/image-direction-knowledge-base.md`
**Status:** Reference-only research seed with candidate rules; not an implemented workflow. Delivers or implies no rules data, checks, skills, reviewers, asset browser, generation integration or retrieval service. Domain-agnostic; all examples use placeholders.
**Verification date:** 2026-11-07

Declare an image's job before looking for any asset, then judge every later step (medium, brief, selection, preparation, handoff) against that job — not against attractiveness, resolution or closeness to a prompt. Learning research shows irrelevant pictures reduce comprehension; photojournalism codes separate records from constructions; and provenance standards (IPTC Digital Source Type, C2PA) record how an asset was made without proving that its depiction is true.

## TL;DR

- **Declare the image's job first, then select against it.** Decorative or "seductive" pictures measurably hurt comprehension: Rey's 2012 meta-analysis of 39 experimental effects found small-to-medium harm to retention and medium harm to transfer. Citing work reports these as Cohen's d = −0.30 and d = −0.48. `IMAGE-PURPOSE-DECLARED` and `IMAGE-NEED-JUSTIFIED` are proposed selection heuristics. An attractive candidate that does not do its declared job is a failure, not a near-miss.
- **Keep three questions apart: what the image shows, how it was made, and whether this use is permitted.** Looking plausible is not documentary truth (NPPA: editing must "maintain the integrity of the photographic images' content and context"). Public availability is not reuse permission. Record generated or composited depictions with the existing IPTC Digital Source Type terms, not a parallel registry.
- **Judge candidates at final placement with explicit criteria, and hand off traceable records.** Inspect the actual asset at placement scale, across variants and across any move. Compare criterion by criterion, with no aggregate scores. Record original-to-derivative links (C2PA's `parentOf` / `componentOf` / `inputTo` is the reference pattern). Never promise identical regeneration of a generated asset.

---

## Section routing table

| If you need to… | Go to | Adjacent owner |
|---|---|---|
| Decide whether an image is needed and what it must do | §1 | `STORY-*`, `A11Y-*` |
| Choose a medium; find or make | §2 | `DOMAIN-*` reference |
| Brief capture, commission, rendering or generation | §3, Template A | `ART-*`, `LIGHT-*`, `MAT-*` |
| Compare and select candidates | §4, Template B, §9 | `ART-*`, `DELIVERY-*` |
| Build sets, prepare assets, plan motion | §5 | `FX-*`, `MOTION-*`, `ADAPT-*`, `PACE-*` |
| Provenance, licences, derivatives, handoff | §6 | Shared asset manifest |
| End-to-end process | §7, §8 | `BRIEF-*`, `REVIEW-*` |
| Structural checks vs judgement | §11, §13 | `REVIEW-*` |
| Candidate rules | §12 | — |
| What has been verified | §16 | — |

**Evidence classes:** *Technical* (published standards: IPTC, C2PA, Creative Commons, W3C/WAI); *Audience* (empirical research on learning, image–text relations, artefact perception); *Practice* (codes and practitioner accounts); *Taste* (aesthetic judgement, labelled); *Proposed VCR convention* (a default proposed here, tiered `heuristic`).

---

## 1. Defining the image's job

### 1.1 What the image must accomplish

Before any search, capture or generation, state:

1. **Viewer outcome:** what the viewer must understand, notice or feel, phrased as an outcome ("the viewer can tell which of two states has changed"), not as content.
2. **Contribution beyond text, voice-over or captions:** what only the image provides (spatial arrangement, scale, texture, emotional register, a specific instance). An image that only repeats the words is reinforcement at best.
3. **Failure mode:** what a wrong image would make the viewer believe. This sharpens selection more than any positive description.

**Picture functions.** Levin's framework names eight functions of pictures in prose: decoration, remuneration, motivation, reiteration, representation, organization, interpretation and transformation. Representation and transformation were the most useful for anticipating reliable learning effects.\[1\] Levin, Anglin and Carney later condensed these to five functions and summarised text-irrelevant decorative pictures as "not at all facilitative", while text-relevant pictures were.\[2\]

**Image–text relations.** Marsh and White's taxonomy (Journal of Documentation, 2003) distinguishes images with little relation to the text, images closely related to it, and images that go beyond it\[3\] — a vocabulary for "contribution beyond the text".

**The cost of decoration.** Mayer's coherence principle holds that people learn better when extraneous words, pictures and sounds are left out.\[4\]

- **Rey (2012).** This meta-analysis of 39 experimental effects found a significant seductive-detail effect: small-to-medium for retention and medium for transfer. Citing work gives these as d = −0.30 and d = −0.48.
- **Sundararajan and Adesope (2020).** "Keep it Coherent" (Educational Psychology Review 32, 707–734) found that "including seductive detail results in lower learning performance (g = − 0.33)". Citing sources say it pooled 68 effect sizes.
- **Cheng, Wu, Wang et al. (2026).** "Seductive Details, Cognitive Load, and Learning Outcomes" (Educational Psychology Review 38, 28) is a multilevel meta-analysis of 177 effect sizes from 50 studies. It accounted for effect sizes that are not independent. It found a smaller effect: g = −0.16 overall, −0.19 for comprehension, −0.17 for recall and −0.12 for transfer.

So the size of the harm is contested, but its direction is consistent. These findings come from instructional settings. Transfer to creative explanation and evidence roles still needs judgement; these studies do not establish a universal ban on decoration or a threshold for atmospheric and promotional work.

### 1.2 Image roles and how each changes selection

Assign each slot one primary role; a secondary role may not override it. This typology adapts Levin's functions and the W3C/WAI informative/decorative split.

| Role | Job | Weight most | Typical failure |
|---|---|---|---|
| **Evidence** | Show that something exists or happened, as recorded | Factual authenticity, verifiable source and context, unaltered content | Reconstruction or generated depiction presented as a record |
| **Explanation** | Make a structure, process or relationship understandable | Clarity of relevant parts, revealing viewpoint, low clutter | Attractive image with the key relationship hidden or out of focus |
| **Identification** | Let the viewer recognise a specific thing, place, type or role | Specificity, distinguishing features | Generic stand-in that only resembles the subject |
| **Atmosphere** | Set tone, place or emotional register | Light, palette, texture, set coherence | Mood conflicts with the concept or misleads about the subject |
| **Metaphor** | Carry an idea figuratively | Mapping legible to the audience; competing readings assessed against intent | Misread or unintended load (route to `CULTURE-*` reference) |
| **Decoration** | Add rhythm or texture with no informational load | No interference with hierarchy; fits the set | Pulls attention from the message (seductive-detail risk) |

W3C/WAI calls the informative-versus-decorative decision a judgement authors make "based on the reason for including the image".\[5\] Text alternatives are owned by `A11Y-*`.

### 1.3 Translating the concept into an image requirement

`STORY-*` owns the concept, which often arrives as a sentence. The common failure is one picture per noun. Instead:

- **Name the relation, not the nouns:** the one contrast, change or tension the concept turns on ("scale contrast between [ELEMENT-A] and [ELEMENT-B] must read at a glance").
- **Choose the level of abstraction deliberately:** instance, exemplar, schematic or figurative. Marsh and White distinguish *sample* (any instance) from *exemplify* (an ideal example).\[6\]
- **One idea per image.** Three relations probably need three slots, a sequence or a diagram.
- **Write the requirement so that the wrong image fails it.**

### 1.4 When an image is unnecessary

Prefer an alternative when the information is relational or quantitative (diagram or data graphic, `DATA-*`); when the message is the words (typographic solution, `TYPO-*`); when the job is evidence and no verified record exists (a labelled construction, diagram or type is more honest than a plausible fake); when the image would be decorative in a content-dense slot (remove or demote it); or when a constructed composition of shapes, type, texture or crops carries the idea with more control. Record the decision either way (`IMAGE-NEED-JUSTIFIED`).

---

## 2. Choosing a medium and acquisition route

### 2.1 Medium comparison

| Medium | Strengths | Limitations | Default truth status |
|---|---|---|---|
| **Photography** | Specificity, credibility, texture of the real | Little control after capture; incidental content; consent and context obligations | Record, shaped by framing and editing |
| **Illustration** | Emphasis, abstraction, metaphor, the invisible; series consistency | Lower evidential weight; style can dominate | Interpretation |
| **Diagram** | Structure, process, labelled relations | Low emotional register; can oversimplify | Model of a claim (data via `DOMAIN-*`) |
| **Archival** | Historical evidence, period texture | Context or caption may be lost; rights often unclear | Record only with verified provenance |
| **Collage / composite** | Juxtaposition, argument, metaphor | Mixed provenance; can be mistaken for a record | Constructed |
| **Rendered** | Full control of viewpoint, light, material; layers and views on demand | Can look synthetic; build cost | Constructed |
| **Generated** | Fast exploration, cheap variants | Artefacts, uncertain reproducibility and rights; can imply a false record | Invented; record as such |

### 2.2 Acquisition route comparison

| Route | Control | Authenticity | Set consistency | Editability | Cost and iteration |
|---|---|---|---|---|---|
| **Find existing** | Low | Depends on verifying source and context | Low unless one source | Fixed pixels | Fast to search; slow to verify rights and context |
| **Commission / capture** | High via brief | High for capture; interpretive for illustration | High with one creator | Raw files, alternates, layers on request | Highest cost and lead time |
| **Construct** | Highest | Constructed | High | Layered, parametric | Upfront cost; cheap variants |
| **Generate** | Moderate, probabilistic | Invented | Hard across many images | Usually flat | Cheap per attempt; inspection and fixes take real time; no identical regeneration (§3.4) |

**Commissioning practice.** The Illustrators Ireland / Association of Illustrators guide says "illustration is costed according to its usage" and recommends a licence stating "the use, territory and time period" rather than an all-rights transfer. It asks briefs to give size and shape, colour or mono, space for typography, accompanying text, additional uses, technical constraints, and whether the brief is open to interpretation.\[7\]

### 2.3 Records, reconstructions and invented imagery

Mark every asset as one of: **record** (captured from the subject, verifiable source and context, only edits that do not change content or context); **reconstruction** (labelled depiction of something real, built from evidence cited via `DOMAIN-*`); or **invented** (no claim to show a particular real instance).

Practice evidence:

- The NPPA Code of Ethics says editing "should maintain the integrity of the photographic images' content and context" and forbids manipulating images "in any way that can mislead viewers or misrepresent subjects".\[8\]
- NPPA's 2026 Best of Photojournalism rules state that "the use of AI generative tools to create, add, remove, expand or alter images or videos in any way is expressly prohibited" and that content "is locked at the moment it is recorded".\[9\]\[10\]
- The Associated Press's 2023 standards said AP does "not allow the use of generative AI to add or subtract any elements" and would refrain from transmitting AI-generated images "suspected or proven to be false depictions of reality", but allowed an AI illustration that is itself the subject of a story if "clearly labeled as such in the caption".\[11\]

These are journalism norms, not universal rules, but they mark the boundary VCR needs: **visual authenticity is not factual authenticity**.\[12\]\[13\] Anything that could be read as a record must be one or be labelled as not one (`IMAGE-RECORD-STATUS-DECLARED`, `IMAGE-SYNTHETIC-NOT-EVIDENCE`).

Audience evidence: Kamali and colleagues note that photorealism makes generated images "difficult for untrained humans" to distinguish from photographs, and that it is "often difficult to draw conclusions about an image's provenance without any context beyond the pixels".\[14\]\[15\] Viewers cannot be relied on to detect invention, so the work must disclose it.

### 2.4 Keep concept and medium distinct

Write the requirement (§1.3) **before** browsing or generating and do not change it while searching. Record a medium reason tied to the role ("evidence role, so captured or archival only"). If nothing fits, return the gap to the concept owner rather than rewriting the requirement to match what was found (`IMAGE-CONCEPT-MEDIUM-SEPARATED`).

---

## 3. Briefing imagery

**Reference and concept handoff.** [Story §1–2](../story/README.md) supplies the concept; [Art Direction §7](../art-director/README.md) supplies composition and treatment constraints. [Visual Research §4–5](../visual-research/README.md) supplies principles and exclusions (`VREF-TRANSFER-EXPLAINED`); [Domain Exploration §3–5](../domain-exploration/README.md) supplies subject findings (`DOMAIN-SOURCE-TRACE`); [Cultural Context §5](../cultural-context/README.md) supplies plausible readings (`CULTURE-ALTERNATIVE-READINGS-LISTED`). Image Direction translates those inputs into content, treatment, motion needs and placement requirements; FX, Lighting and Materials own execution.

### 3.1 Four separate layers

Never collapse these into a single style adjective:

1. **Content:** subject roles, required elements and relationship, viewpoint and framing, gesture or state, background, specificity, accuracy constraints, exclusions.
2. **Treatment:** light character (`LIGHT-*`), material cues (`MAT-*`), palette and tonal key relative to the composition (`ART-*`), abstraction, finish. Recipes stay with `FX-*`.
3. **Motion:** move type and extent, overscan, depth planes, separable elements, reveals, loop or continuity constraints (`MOTION-*`, `PACE-*`).
4. **Placement:** slot, aspect ratios and variants, text zones and negative space, crop-safe regions, delivery formats (`ADAPT-*`, `DELIVERY-*` own thresholds).

"Cinematic", "clean" or "premium" are not briefs; translate each into the specific light, framing, space or material decision it implies, in the right layer. Template A lists all fields, including deliverables (commissioning practice expects each asset listed with a short description), usage scope and openness.\[16\]

### 3.2 Connecting to composition, text, variants and movement

- Derive the brief from the composition decision: `ART-*` decides the slot; the brief says what the image must supply.
- Declare a **crop-safe region** that survives every variant. If variants need conflicting crops, brief for a wider frame, alternative framings or separate assets.
- Declare **text zones** as negative space with the tonal and textural quiet the text needs; legibility thresholds stay with `TYPO-*` and `A11Y-*`.
- If movement is possible, brief now for coverage beyond the frame and separable planes; retrofitting is costly or impossible (§5.4).

### 3.3 Route-specific additions (provider-independent)

| Route | Brief additions | Iteration control |
|---|---|---|
| **Capture** | Shot list per slot; alternates (wider, tighter, clean background, other orientation); consent; raw files | Contact-sheet selection against criteria |
| **Illustration** | Deliverables list; reference roles; openness; roughs to final; layered files | Review roughs against content before treatment |
| **Rendering** | Scene inventory, cameras, light and material targets, passes, alternative views | Log parameter changes; keep scene saved |
| **Generation** | Content and exclusions separate from treatment; references with roles; round budget; inspection plan | Controlled iteration (below) |
| **Find existing** | Search intent from the requirement; disallowed sources; rights and context evidence before shortlisting | Stop when criteria met or budget spent |

**Controlled iteration for generated assets.** Treat each round as an experiment: keep the content requirement fixed, vary one factor at a time, record what changed, and reject by criterion rather than impression. Watch for drift, where small rewordings accumulate until the brief has quietly changed. No vendor-specific syntax is given, by design.

### 3.4 Reproducibility records and their limits

For each generated asset retain: brief version; inputs and parameters as used; references and roles; system and version; seed where exposed; date; selected variants with reasons; summary of rejected variants.\[17\] The IPTC Photo Metadata Standard already defines *AI System Used*, *AI System Version Used*, *AI Prompt Information* and *AI Prompt Writer Name* alongside *Digital Source Type*;\[18\] map to these rather than inventing fields.

**Identical regeneration cannot be promised.** The Hugging Face Diffusers "Reproducible pipelines" guide is cited here as evidence only, not as a tool recommendation. It says "full reproducibility across different hardware is not guaranteed because matrix multiplication… is less deterministic on a GPU than a CPU". It also quotes PyTorch: "results may not be reproducible between CPU and GPU executions, even when using identical seeds". Hosted services may also change their models. The selected output file is therefore the asset of record. The input record documents how the file was made; it does not guarantee that it can be remade (`IMAGE-REGENERATION-NOT-PROMISED`).

### 3.5 Reference roles

Give every reference a declared role — *content*, *composition*, *light/material*, *palette*, *motion* or *negative* (what to avoid) — so it is not copied wholesale, and keep its provenance. Extracting principles from references belongs to the `VREF-*` reference. Commissioning guidance adds that asking an illustrator to "imitate, mimic, or copy the style of another illustrator" is unethical.\[7\]

---

## 4. Selecting candidates

### 4.1 Criteria

| Criterion | Question | Evidence |
|---|---|---|
| **Semantic fit** | Does it do the declared job? | Judgement against §1 |
| **Specificity** | Right instance or level of abstraction? | Judgement; `DOMAIN-*` |
| **Focal clarity** | Is the meaning-bearing element most salient at placement scale? | Inspection |
| **Viewpoint** | Does the angle expose the required relationship? | Inspection |
| **Expression / state** | Intended reading supported; ambiguity purposeful and compatible with the brief? | Judgement; `CULTURE-*` |
| **Crop flexibility** | Do crop-safe regions survive every variant? | Overlay test |
| **Silhouette** | Does the shape read at the smallest size and in motion? | Inspection |
| **Negative space** | Is the text zone present, placed and quiet enough? | Overlay test; `TYPO-*` |
| **Contextual accuracy** | Setting, period, details correct? | `DOMAIN-*`; source caption |
| **Technical fitness** | Usable detail at placement; no role-relevant defects? | Inspection; `DELIVERY-*` |
| **Provenance** | Source, status, licence known and compatible? | Records (§6) |

### 4.2 Inspect the actual asset at useful scales

Thumbnails and descriptions hide defects and context. Inspect:

- the full-resolution original
- the crop at final placement size
- each variant
- a magnified pass over faces, hands, text, edges and repeated structures
- for found assets, the original page or record: caption, date, place and creator

Jenni Mäenpää's 2022 study of news photo professionals (Visual Communication) describes photo editors as those "who broker, select, validate and make publication decisions about news photographs". Practitioner guidance warns against pictures from a place, community or time that does not match the story.

### 4.3 Usable detail at placement, not nominal dimensions

Usable detail depends on the crop used, scale at placement, upscaling or compression already applied, focus and blur in the region that matters, and noise or generation texture. A large file can be unusable if the meaningful region is a small soft crop. `DELIVERY-*` owns the limits; this pillar requires the check at placement (`IMAGE-PLACEMENT-FIT`).

### 4.4 Defect scan

- **Unintended text, marks, symbols:** pseudo-text, logos, signage, watermarks, symbols with unintended readings.
- **Implausible geometry or anatomy:** merged or extra parts, impossible joins, warped perspective, objects that could not work.
- **Inconsistent light and physics:** disagreeing shadows or reflections; mismatched light direction in composites.
- **Duplication:** cloned textures, repeated faces or objects, tiling.
- **Edge artefacts:** halos, fringes, cut-out remnants, stretched fill.
- **Context errors:** anachronisms, wrong place markers, wrong instance.

Kamali et al. sort generated-image artefacts into anatomical, stylistic, functional, violations of physics and sociocultural categories.\[19\] The taxonomy suits all images, because compositing and retouching produce the same failure classes. The authors note perceptible artefacts "are not always present", so finding none does not prove capture.\[15\]

### 4.5 Style, compromise or brief failure

- **Valid stylistic choice:** deliberate, consistent across the set, harmless to the role.
- **Acceptable compromise:** lowers quality but not the outcome; fixable in preparation (`FX-*`) or tolerable at placement scale. Record it.
- **Brief failure:** blocks the outcome, misleads about content or status, or breaks a placement requirement. Reject or return to creation.

The same flaw can land in different classes: invented detail is acceptable in a metaphor and a failure in evidence (`IMAGE-FLAW-CLASSIFIED`).

### 4.6 Comparing candidates

Mark each criterion as met, failed or unknown and state the tradeoff. **Do not use an aggregate quality score**: it hides which criterion failed and lets a role failure be averaged against aesthetic strengths. Semantic fit, record status and permission are selection criteria; record unresolved questions and argue the tradeoffs in words. These criteria implement no automatic gates. Write a one- or two-sentence rationale citing criteria, and keep the runner-up with the reason it lost (`IMAGE-COMPARISON-CRITERIA-EXPLICIT`, `IMAGE-NO-AGGREGATE-SCORE`).

---

## 5. Sets, preparation and motion potential

### 5.1 Coherent sets

A set reads as one voice when its images share viewpoint logic, perspective, light character, palette and tonal key, texture and finish, and level of abstraction. Name intentional variation (e.g. one contrasting image marking a turn). Review side by side, at placement scale, in sequence order (`IMAGE-SET-COHERENCE`).

### 5.2 Reconcile with treatment, or replace

Treatment (`FX-*`) can reconcile palette, tone, grain and some light mismatches. It rarely fixes viewpoint, perspective, light direction, abstraction or subject scale without becoming reconstruction. Replace when reconciling would change what is depicted or add invented content to an evidence-role image; otherwise specify the preparation need for `FX-*` (`IMAGE-SET-RECONCILE-OR-REPLACE`).

### 5.3 Preparation needs

List per asset: crops per variant, masks or mattes, background extension, depth-plane separation, clean plates, alternative views, tonal matching, delivery variants. Link each derivative to its original. **Preserve originals untouched**; prepare only derivatives (`IMAGE-ORIGINAL-PRESERVED`, `IMAGE-DERIVATIVE-LINKED`). Generative extension changes a record's status: IPTC's `compositeWithTrainedAlgorithmicMedia` covers "augmentation, correction or enhancement using a Generative AI model, such as with inpainting or outpainting operations".\[20\]

### 5.4 Motion potential

A still holds a fixed amount of information. Before planning a move, check:

- **Overscan:** image beyond the frame for the full move, in every variant?
- **Depth planes:** can foreground, subject and background separate cleanly? Practitioners isolate planes, rebuild the background behind the subject as a clean plate, and keep the original untouched.\[21\]
- **Occlusion and reveals:** what will the move reveal that the still never contained? That area must be painted, extended or generated — invented content.\[22\]
- **Depth assumptions:** a wrong plane order produces visible errors.\[23\]
- **Cut-out edges:** hair and soft or transparent edges degrade under movement. Practitioner guidance says to test the full camera range, because a cut-out clean in the first frame can show gaps at the widest position.\[24\]

If the still cannot support the move: reduce the move, brief for alternative views or layered capture or rendering, or choose another asset (`IMAGE-MOTION-COVERAGE`, `IMAGE-MOTION-RANGE-TESTED`). Move design belongs to `MOTION-*`.

### 5.5 Continuity

For adjacent shots and recurring series imagery, keep a continuity sheet of recurring elements, viewpoint conventions, light character and abstraction level, and check new candidates against it. Continuity rules belong to `MOTION-*` and `ADAPT-*`; series briefs to `BRIEF-*`.

---

## 6. Provenance, uncertainty and handoff

### 6.1 Status distinctions

| Pair | Distinction | Consequence |
|---|---|---|
| **Preview vs acquired asset** | Comp, watermark, thumbnail or low-res preview is not the licensed file | Previews never reach delivery; re-inspect the acquired file |
| **Reference vs deliverable** | A reference informs direction; a deliverable appears in the work | Reference status alone grants no permission; acquisition and suitability must be assessed separately |
| **Generated depiction vs verified record** | A depiction shows; a record documents | Only records can play the evidence role |
| **Public availability vs reuse permission** | Being visible online grants no rights | Licence evidence required |

### 6.2 Fields to retain in the shared asset manifest

Creator; original source with locator; acquisition date; licence evidence captured at acquisition **or an explicit "unknown"**; required attribution; use limits (territory, duration, media, modifications, releases); digital source type; transformations; selected variant and its parent. For Creative Commons material, the CC wiki recommends TASL (Title, Author, Source, License) with links where possible.\[25\] For commissions, the licence should state use, territory and period.\[7\] For generated material, keep the input record (§3.4).

**Legal scope.** Rights questions are jurisdiction-specific and not settled here. Example: the US Copyright Office's March 2023 registration guidance says copyright protects only material produced by human creativity and asks applicants to disclose more than de minimis AI-generated content.\[26\]\[27\] That covers US registration only, not other jurisdictions or any generation service's terms. Verify at source and record scope.

### 6.3 Digital source type and content credentials

Use the IPTC Digital Source Type vocabulary. Current terms verified at the IPTC vocabulary page on 2026-11-07:

| Term | IPTC definition (verbatim, abridged) |
|---|---|
| `digitalCapture` | "captured from a real-life source using a digital camera or digital recording device" |
| `digitalCreation` | "Media created by a human using non-generative tools" |
| `trainedAlgorithmicMedia` | "created algorithmically using an Artificial Intelligence model trained on captured content" |
| `compositeWithTrainedAlgorithmicMedia` | "Augmentation, correction or enhancement using a Generative AI model, such as with inpainting or outpainting operations" |
| `compositeSynthetic` | "Mix or composite of several elements, at least one of which is Generative AI" |
| `composite` | "Mix or composite of several elements, any of which may or may not be generative AI" |
| `algorithmicallyEnhanced` | "Modification or correction by algorithm without changing the main content of the media" |

The vocabulary has 17 current terms; `softwareImage`, `digitalArt` and `minorHumanEdits` are retired.\[20\]\[28\] Older wordings circulate in secondary sources, so check the vocabulary itself.\[29\]

**C2PA Content Credentials** are a signed manifest of assertions, including actions and ingredients. The C2PA explainer states there are "no value judgments about whether the provenance data is good or bad": a valid credential shows how an asset was made and who signed it, not that its depiction is true.\[30\] Metadata can be stripped, so absence proves nothing.\[31\]

### 6.4 Recording transformations and variants

Model source–derivative links on the C2PA ingredient pattern: `parentOf` (the derivative is an edit or rendition of this ingredient; at most one parent), `componentOf` (an element composited into the derivative), `inputTo` (an input to a computational process), plus the actions applied.\[32\]\[33\] VCR need not emit C2PA manifests; this is a proposed pattern for future shared-manifest derivative links, not an implemented schema requirement.

### 6.5 Handoff package

Hand builders: (1) image briefs (Template A); (2) an asset shortlist (Template B) with selected and runner-up candidates, inspection evidence and rationale; (3) preparation notes per selected asset, with the `FX-*` owner noted; (4) unresolved gaps with owners — missing assets, unknown licences, unverified context, motion-coverage shortfalls. All records and assets live in the selected workspace, outside this repository. Generated previews and temporary derivatives go in ignored output directories and are never assets of record (`IMAGE-WORKSPACE-LOCATION`).

---

## 7. Creation workflow

Budgets are adjustable per piece; no universal counts are prescribed. Set them in the brief and record when reached.

1. **Receive** concept (`STORY-*`) and composition slot (`ART-*`); stop and return if either is undefined.
2. **Declare each slot's job**: role, outcome, contribution, failure mode (`IMAGE-PURPOSE-DECLARED`, `IMAGE-ROLE-CLASSIFIED`).
3. **Test necessity** (`IMAGE-NEED-JUSTIFIED`).
4. **Choose medium and route; declare record status** (`IMAGE-MEDIUM-RATIONALE`, `IMAGE-RECORD-STATUS-DECLARED`).
5. **Write the brief** (Template A) (`IMAGE-BRIEF-LAYERS-SEPARATED`, `IMAGE-BRIEF-PLACEMENT-LINKED`, `IMAGE-BRIEF-EXCLUSIONS`).
6. **Set budgets:** search, generation rounds, commission revisions, inspection depth.
7. **Acquire** candidates, recording source and status at intake (`IMAGE-PREVIEW-NOT-ASSET`, `IMAGE-PROVENANCE-RETAINED`).
8. **Screen** against selection criteria (semantic fit, record status, permission), one-line reason per discard.
9. **Inspect** survivors at placement scale and across variants, with defect pass and context check (`IMAGE-FULL-INSPECTION`, `IMAGE-PLACEMENT-FIT`, `IMAGE-DEFECT-SCAN`, `IMAGE-CONTEXT-VERIFIED`).
10. **Compare** on explicit criteria; select; keep runner-up (`IMAGE-COMPARISON-CRITERIA-EXPLICIT`).
11. **Check the set** for coherence and continuity (§5).
12. **Specify** preparation and motion needs.
13. **Hand off** (`IMAGE-GAPS-HANDED-OFF`).

**Stopping conditions:**
- **Success:** every slot meets its declared selection criteria with no brief failure; set review complete.
- **Budget reached:** record the best candidate and what it fails; escalate through the existing brief process, adding no new approval gate.
- **Not achievable honestly** (e.g. evidence role, no record): propose an alternative form (§1.4) to the concept owner.
- **Diminishing returns in generation:** if rounds stop improving the failing criterion, switch route.
- **Unresolved rights:** flag unknown or incompatible terms in the shared provenance record and hand off the use decision through the existing brief and review process. This research adds no automatic delivery gate.

---

## 8. Review workflow

Reviews stay advisory under `REVIEW-*`. Keep the four evidence types separate so one cannot mask another.

**Individual candidate:**
- **Semantic:** does it do the job, with competing readings assessed under `CULTURE-ALTERNATIVE-READINGS-LISTED` and `CULTURE-CORE-MESSAGE-ANCHORED`? Judge against role and outcome, using `CULTURE-*` and `DOMAIN-*` references. Output pass / fail / uncertain with reason.
- **Aesthetic:** does it fit composition, palette, hierarchy, light and material? Judge against `ART-*`, `LIGHT-*`, `MAT-*`, labelling taste. Output notes and tradeoffs.
- **Technical:** usable detail at placement, defects, crop survival, motion coverage. Inspect at placement and variants, run structural checks, cite `DELIVERY-*` limits. Output a classified defect list.
- **Provenance:** status, licence, attribution, source type, links. Check record completeness and re-check the source page. Output complete / incomplete / unknown.

**Set:** lay out in sequence at placement scale; check viewpoint, perspective, light, palette, texture and abstraction, marking intentional variations; check the continuity sheet; decide reconcile (`FX-*`) or replace per mismatch; confirm every asset's provenance is complete or its gap listed.

---

## 9. Abstract worked comparison

*Illustrative only: no production subject, no real evidence; the three candidates are hypothetical.*

**Slot** `[SLOT-B]`; **role** explanation; **viewer outcome** the viewer sees that `[COMPONENT-A]` connects to `[COMPONENT-B]` before `[STATE-CHANGE]`; **placement** text zone in the upper third, wide and tall variants, possible slow push-in.

| Criterion | X (generated, atmospheric) | Y (captured, plain) | Z (constructed diagram) |
|---|---|---|---|
| Semantic fit | **Fails:** join in shallow-focus blur; backlight pulls the eye to an unrelated surface | Meets: both components and join sharp | Meets: explicit, labelled |
| Specificity | Generic; implausible functional detail | Specific instance | Schematic; depends on `DOMAIN-*` data |
| Focal clarity | Rim-lit edge, not the join | Join is highest-contrast region | Highest |
| Viewpoint | Low angle hides the join | Three-quarter view exposes it | Orthographic |
| Negative space | Busy upper third | Quiet upper third | Designed |
| Crop flexibility | Tall crop loses component B | Both variants hold | Re-laid out per variant |
| Defects | Implausible join; pseudo-text | Edge dust (compromise) | None found |
| Motion | Push-in reveals invented areas | Enough overscan; subject separates | Native layers |
| Record status | Invented; could be read as a record | Record | Obviously constructed |
| Provenance | Inputs recorded; service terms to verify | Licence evidence on file | Built in workspace |

**Reading it.** X is the most attractive and would probably win on a thumbnail grid, but fails the job on semantic fit, focal clarity and viewpoint and adds a seductive-detail risk; because the role is explanation, these are brief failures, not stylistic choices. Y meets the stated selection criteria with one acceptable compromise. Z does the job most explicitly but may break set coherence if neighbouring slots are photographic. **Selection:** Y, edge defect noted for preparation; Z runner-up if the concept owner prefers clarity over photographic continuity; X rejected for this slot, reconsiderable for an atmosphere slot only with its status disclosed. No aggregate score was used.

---

## 10. Templates

### Template A — Image brief

```markdown
Image brief: [SLOT-ID]
- Version / date: [VERSION] / [YYYY-MM-DD]; concept: [STORY-REF]; composition: [ART-REF]
- Intended role: [evidence | explanation | identification | atmosphere | metaphor | decoration]
- Viewer outcome: [OUTCOME]; contribution beyond text: [CONTRIBUTION]; failure mode: [WRONG BELIEF]
- Necessity: [image | diagram | typographic | constructed | none] — [REASON]
- Medium / route: [MEDIUM] via [find | commission/capture | construct | generate] — [REASON]
- Record status required: [record | reconstruction (labelled) | invented]
Content
- Required content (abstract roles): [SUBJECT-ROLE], [OBJECT-A], [RELATIONSHIP]
- Viewpoint / framing: [ANGLE, DISTANCE, ORIENTATION]; gesture / state: [STATE]
- Background: [CONTEXTUAL | NEUTRAL]; exclusions: [TEXT, MARKS, SYMBOLS, LIKENESSES, READINGS]
Treatment
- Light: [RESULT] ([LIGHT-RULE-ID]); material: [CUES] ([MAT-RULE-ID]); palette: per [ART-REF]
- Abstraction: [INSTANCE | EXEMPLAR | SCHEMATIC | FIGURATIVE]
Placement
- Slot / variants: [SLOT-ID]; [VARIANT-LIST]; crop-safe region: [DESCRIPTION]
- Text zone / negative space: [POSITION, QUIETNESS] (thresholds: TYPO/A11Y); continuity: [REFS]
Motion needs
- Move: [NONE | DESCRIPTION]; overscan, planes, separable elements, alternative views: [NEEDS]
References
- [REF-ID] — role: [content | composition | light/material | palette | motion | negative]; provenance: [MANIFEST-REF]
Deliverables and usage
- Deliverables: [ASSETS WITH SHORT DESCRIPTIONS; RAW/LAYERED FILES]
- Usage scope: [MEDIA, TERRITORY, PERIOD]; openness: [FIXED] / [OPEN]
- Budgets: [SEARCH / ROUND / REVISION]; stopping conditions per §7
```

### Template B — Asset shortlist

```markdown
Shortlist: [SLOT-ID] (brief [VERSION])
| Field | [CANDIDATE-1] | [CANDIDATE-2] |
|---|---|---|
| Source or asset ID / provenance record | [ASSET-ID] / [MANIFEST-REF] | … |
| Status | [preview/acquired]; [reference/deliverable] | … |
| Digital source type / record status | [IPTC TERM] / [record/reconstruction/invented] | … |
| Role / content / treatment fit | [meets/fails + reason] | … |
| Placement fit | [per variant; crop-safe; text zone] | … |
| Motion fit | [overscan; planes; reveals] | … |
| Exclusions check | [clear/issues] | … |
| Inspection evidence | [scales; variants; defect pass; context check; date] | … |
| Defects → classification | [style/compromise/brief failure] | … |
| Licence / attribution | [evidence or UNKNOWN; text; limits] | … |
| Selection rationale | [criteria-based] | [why runner-up/rejected] |
| Preparation requirements | [crops, masks, extension, layers, views → FX owner] | … |
| Unresolved gaps | [GAP → OWNER] | … |
```

---

## 11. Capability matrix

| Need | Capability | Evidence returned | Limitation | Fallback |
|---|---|---|---|---|
| **Discovery** | Search sources by intent from the requirement | Previews, locators, captions | Favours the common and well tagged; previews hide defects | Commission, construct or generate |
| **Acquisition** | Obtain the full asset under recorded terms | Original file, licence evidence, date | Terms missing or changed; previews mistaken for assets | Mark UNKNOWN; exclude from delivery |
| **Direct inspection** | View the actual file at full resolution, placement crops, variants | Defects, detail, crop survival, context | Needs judgement; cannot prove a record genuine | Second pass under `REVIEW-*`; return to source page |
| **Metadata reading** | Read embedded metadata, sidecars, credentials | Creator, dates, source type, AI fields, links | Can be stripped, wrong or forged; not proof of truth | Supporting evidence only; record "no metadata" |
| **Creation** | Capture, commission, render or generate to a brief | Candidates plus input record | Generation not reliably reproducible; commission lead time | Change route; reduce scope |
| **Variant comparison** | Lay out candidates side by side against criteria | Criterion table, rationale, runner-up | Only as good as the criteria | Return to §1; refine criteria |
| **Derivative tracking** | Link derivatives to originals and actions | Relations, actions, variant IDs | Links break on export or rename | Rebuild from preserved originals; flag gaps |

---

## 12. Candidate rules

All candidate rules below are `heuristic`: adopting source vocabularies, provenance models and provider reproducibility guidance as VCR workflow requirements is a proposed transfer. Source standards and licence obligations retain their own scope; these rules do not implement or certify compliance. Tier describes the rule basis, not its evaluation method. Reported verification status is in §16. "Presence" = structural field check; "judged" = reviewer judgement.

| ID | Check | Threshold | Tier | Applies to | Evidence | Evaluation method |
|---|---|---|---|---|---|---|
| `IMAGE-PURPOSE-DECLARED` | Job declared | Role, outcome, contribution, failure mode before acquisition | heuristic | All slots | Levin; Marsh & White; coherence | Presence; judged |
| `IMAGE-ROLE-CLASSIFIED` | Role assigned | One primary role from §1.2 | heuristic | All slots | Levin; W3C/WAI | Presence; judged |
| `IMAGE-NEED-JUSTIFIED` | Necessity tested | Alternatives considered; decision recorded | heuristic | All slots | Rey 2012; Sundararajan & Adesope 2020 | Presence; judged |
| `IMAGE-CONCEPT-MEDIUM-SEPARATED` | Idea not chosen by library | Requirement fixed before search; gaps returned | heuristic | All slots | Proposed convention | Requirement vs acquisition log |
| `IMAGE-MEDIUM-RATIONALE` | Medium justified | Medium and route linked to role | heuristic | All slots | §2 | Presence; judged |
| `IMAGE-RECORD-STATUS-DECLARED` | Truth status | Record, reconstruction or invented | heuristic | All assets | NPPA; AP | Presence |
| `IMAGE-SYNTHETIC-NOT-EVIDENCE` | No synthetic evidence | Evidence slots use only verified records | heuristic | Evidence slots | NPPA; AP; Kamali et al. | Cross-check role, status, source type |
| `IMAGE-SOURCE-TYPE-RECORDED` | Source type | Current IPTC Digital Source Type term | heuristic | All assets | IPTC vocabulary | Value present and current |
| `IMAGE-BRIEF-LAYERS-SEPARATED` | Brief layers | Content, treatment, motion, placement separate | heuristic | Briefs | Commissioning guidance | Presence; judged |
| `IMAGE-BRIEF-EXCLUSIONS` | Exclusions | Things to avoid listed | heuristic | Briefs | Kamali et al. | Presence |
| `IMAGE-BRIEF-PLACEMENT-LINKED` | Placement linked | Slot, variants, crop-safe region, text zone | heuristic | Briefs | Commissioning guidance | Presence |
| `IMAGE-USAGE-SCOPE-STATED` | Usage scope | Use, territory, period | heuristic | Commissions, licences | Illustrators Ireland / AOI | Presence |
| `IMAGE-REFERENCE-ROLE-DECLARED` | Reference roles | Each reference has role and provenance | heuristic | Briefs | Proposed convention | Presence |
| `IMAGE-GENERATION-RECORD` | Generation inputs | Inputs, references, system/version, seed if exposed, date, selection | heuristic | Generated assets | IPTC AI fields | Presence |
| `IMAGE-REGENERATION-NOT-PROMISED` | No remake promise | Output file is asset of record | heuristic | Generated assets | Diffusion library and framework docs | File stored; claims reviewed |
| `IMAGE-FULL-INSPECTION` | Actual asset inspected | Full-resolution file, not only preview | heuristic | All candidates | Photo-editing practice | Inspection log |
| `IMAGE-PLACEMENT-FIT` | Fit at placement | Meaning-bearing region usable at placement in every variant | heuristic | All candidates | Practice; `DELIVERY-*` | Placement-crop inspection |
| `IMAGE-CROP-SURVIVES-VARIANTS` | Crop survival | Crop-safe region holds per variant | heuristic | All candidates | `ADAPT-*` | Overlay test |
| `IMAGE-DEFECT-SCAN` | Defect pass | Magnified pass over §4.4 classes | heuristic | All candidates | Kamali et al. | Checklist |
| `IMAGE-FLAW-CLASSIFIED` | Flaw classified | Style, compromise or brief failure | heuristic | All candidates | Proposed convention | Judged |
| `IMAGE-CONTEXT-VERIFIED` | Context checked | Caption, date, place, creator vs claim | heuristic | Found, archival | NPPA; journalism practice | Source re-check |
| `IMAGE-COMPARISON-CRITERIA-EXPLICIT` | Explicit comparison | Rationale cites criteria; runner-up kept | heuristic | Shortlists | Proposed convention | Presence; judged |
| `IMAGE-NO-AGGREGATE-SCORE` | No aggregate score | No composite score used to select | heuristic | Shortlists | Proposed convention | Review |
| `IMAGE-SIMILARITY-NOT-PROOF` | Similarity ≠ suitability | Match scores not cited as proof of fit | heuristic | Shortlists | §13 | Review |
| `IMAGE-SET-COHERENCE` | Set coherence | Side-by-side review on §5.1 dimensions | heuristic | Sets | Practice | Judged |
| `IMAGE-SET-RECONCILE-OR-REPLACE` | Reconcile decision | Each mismatch treated or replaced, with reason | heuristic | Sets | Proposed convention | Presence; judged |
| `IMAGE-PREP-DECLARED` | Preparation listed | §5.3 needs listed with owner | heuristic | Selected assets | Practice | Presence |
| `IMAGE-ORIGINAL-PRESERVED` | Original kept | Original unmodified; work on derivatives | heuristic | All assets | Compositing practice | Original unchanged |
| `IMAGE-DERIVATIVE-LINKED` | Derivative links | Ingredients, relation type, actions | heuristic | Derivatives | C2PA ingredient model | Links resolve |
| `IMAGE-MOTION-COVERAGE` | Motion coverage | Overscan, planes, reveals vs move | heuristic | Motion assets | Parallax practice | Test move |
| `IMAGE-MOTION-RANGE-TESTED` | Full range | Review full move and extrema; start/middle/end samples alone do not establish coverage | heuristic | Motion assets | Parallax practice | Test frames |
| `IMAGE-PREVIEW-NOT-ASSET` | Preview status | Previews flagged, never delivered | heuristic | All candidates | Proposed convention | Status field |
| `IMAGE-REFERENCE-NOT-DELIVERABLE` | Reference status | Reference status alone does not authorise placement | heuristic | References | Proposed convention | Status field |
| `IMAGE-PROVENANCE-RETAINED` | Provenance fields | §6.2 fields in shared manifest | heuristic | All assets | IPTC; CC TASL | Completeness |
| `IMAGE-LICENCE-UNKNOWN-FLAGGED` | Unknown licence | Explicit; unresolved use decision handed off | heuristic | All assets | Proposed convention | Presence |
| `IMAGE-ATTRIBUTION-CAPTURED` | Attribution | Required attribution (TASL for CC) | heuristic | Licensed assets | CC licences and wiki | Matches licence |
| `IMAGE-WORKSPACE-LOCATION` | Location | Records in workspace; temporaries ignored | heuristic | All records | Proposed convention | Path check |
| `IMAGE-GAPS-HANDED-OFF` | Gaps handed off | Gaps listed with owners | heuristic | Handoff | Proposed convention | Presence |

---

## 13. Measurement notes

- **Structural checks are possible** for field presence (role, outcome, record status, source type, licence or UNKNOWN, attribution, derivative links), declared dimensions against declared placement, preserved originals, valid vocabulary terms, resolvable links and inspection logs. A missing record is itself a finding.
- **Semantic fit, credibility and visual coherence require judgement**, and stay advisory under `REVIEW-*`.
- **Automatic similarity is not suitability.** A similarity score measures resemblance to a description or reference, not whether the image does its job, is accurate, is permitted, or fits the placement (`IMAGE-SIMILARITY-NOT-PROOF`).
- **Metadata is evidence, not proof**; C2PA makes no value judgement about provenance data,\[30\] and metadata can be stripped.\[34\]
- **Spotting generated imagery by eye is unreliable**; absence of artefacts does not establish capture.
- **No thresholds are set here**; `DELIVERY-*`, `TYPO-*`, `A11Y-*` and `ADAPT-*` own them.

---

## 14. Checklists

**Analysis (before acquisition):** concept and slot received · `IMAGE-PURPOSE-DECLARED` · `IMAGE-ROLE-CLASSIFIED` · `IMAGE-NEED-JUSTIFIED` · `IMAGE-CONCEPT-MEDIUM-SEPARATED` · `IMAGE-MEDIUM-RATIONALE` · `IMAGE-RECORD-STATUS-DECLARED` · `IMAGE-SYNTHETIC-NOT-EVIDENCE` · `IMAGE-BRIEF-LAYERS-SEPARATED` · `IMAGE-BRIEF-EXCLUSIONS` · `IMAGE-BRIEF-PLACEMENT-LINKED` · `IMAGE-USAGE-SCOPE-STATED` · `IMAGE-REFERENCE-ROLE-DECLARED` · budgets and stopping conditions set.

**Creation and selection:** `IMAGE-PREVIEW-NOT-ASSET` · `IMAGE-REFERENCE-NOT-DELIVERABLE` · `IMAGE-PROVENANCE-RETAINED` · `IMAGE-LICENCE-UNKNOWN-FLAGGED` · `IMAGE-ATTRIBUTION-CAPTURED` · `IMAGE-SOURCE-TYPE-RECORDED` · `IMAGE-GENERATION-RECORD` · `IMAGE-REGENERATION-NOT-PROMISED` · `IMAGE-FULL-INSPECTION` · `IMAGE-PLACEMENT-FIT` · `IMAGE-CROP-SURVIVES-VARIANTS` · `IMAGE-DEFECT-SCAN` · `IMAGE-FLAW-CLASSIFIED` · `IMAGE-CONTEXT-VERIFIED` · `IMAGE-COMPARISON-CRITERIA-EXPLICIT` · `IMAGE-NO-AGGREGATE-SCORE` · `IMAGE-SIMILARITY-NOT-PROOF` · `IMAGE-SET-COHERENCE` · `IMAGE-SET-RECONCILE-OR-REPLACE` · `IMAGE-PREP-DECLARED` · `IMAGE-ORIGINAL-PRESERVED` · `IMAGE-DERIVATIVE-LINKED` · `IMAGE-MOTION-COVERAGE` · `IMAGE-MOTION-RANGE-TESTED` · `IMAGE-WORKSPACE-LOCATION` · `IMAGE-GAPS-HANDED-OFF`.

---

## 15. Ownership notes and caveats

**Ownership.** `IMAGE-*` owns image purpose, medium choice, creation briefs, candidate selection and asset-set coherence. `STORY-*` owns the idea; `ART-*` composition, palette and hierarchy; `FX-*` execution; `LIGHT-*` and `MAT-*` light and material; `TYPO-*`, `A11Y-*`, `ADAPT-*`, `DELIVERY-*` thresholds; `MOTION-*` and `PACE-*` move design. Sibling `DOMAIN-*`, `VREF-*` and `CULTURE-*` references supply subject understanding, reference analysis and audience context; they remain reference only. Provenance belongs to the shared asset manifest. Under ADR 0006, capabilities are tool-independent; no providers or prompting recipes are recommended.

**Caveats.**
- **Research transfer:** seductive-detail findings come from instructional settings; direction consistent, size contested.
- **Journalism norms:** NPPA and AP define the record/depiction boundary here, not a ban on disclosed invention in creative work.
- **Legal scope:** US Copyright Office guidance covers US registration only.\[35\] Nothing here is legal advice.
- **Fragile metadata:** presence records origin claims; it proves neither origin nor depicted truth.
- **Secondary figures:** some effect sizes and study counts were not read in full text (see ledger).
- **Taste:** aesthetic criteria rest on practitioner judgement, not empirical thresholds.

---

## 16. Verification ledger (checked 2026-11-07)

| Claim | Result | Source locator |
|---|---|---|
| IPTC Digital Source Type: 17 current, 3 retired terms; definitions as §6.3 | confirmed | IPTC NewsCodes Digital Source Type page |
| `compositeWithTrainedAlgorithmicMedia` label "Edited using" vs "Edited with" | contradicted (minor wording) | IPTC vocabulary page vs IPTC news post |
| IPTC AI System / Prompt fields | confirmed | IPTC Photo Metadata User Guide (Nov 2025) |
| C2PA ingredient relationships; at most one parent | confirmed | C2PA spec 2.4; CAI "Reading ingredients" |
| C2PA "no value judgments" | confirmed | C2PA Explainer 2.4 |
| Informative vs decorative is author judgement | confirmed | W3C WAI Informative Images |
| Levin's eight functions | confirmed | ERIC ED186847 |
| Rey 2012: 39 effects; small-to-medium retention, medium transfer | confirmed | ERIC EJ986386 |
| Rey 2012: d = −0.30 (retention), d = −0.48 (transfer) | unverified (secondary citations only) | Rey 2014, Computers in Human Behavior; "Seductive details do their damage also in longer learning sessions" |
| Sundararajan & Adesope 2020, Educ. Psychol. Rev. 32, 707–734: g = −0.33; 68 effect sizes | unverified (secondary quotations; full text not read) | doi:10.1007/s10648-020-09522-4 |
| Sundararajan & Adesope 2020: 58 vs 42 studies | contradicted | Press release vs conference abstract |
| Cheng, Wu, Wang et al. 2026, Educ. Psychol. Rev. 38, 28: g = −0.16 (177 effect sizes, 50 studies) | confirmed (abstract) | Educational Psychology Review abstract |
| NPPA Code; BOP 2026 generative-AI prohibition | confirmed | NPPA Code of Ethics; BOP 2026 rules |
| AP 2023 generative-AI image rules | confirmed (secondary quotation) | Nieman Lab, Aug 2023 |
| Commissioning: usage costing; licence scope; imitation unethical | confirmed | Illustrators Ireland / AOI guide |
| CC TASL attribution | confirmed | CC wiki |
| US Copyright Office human authorship; AI disclosure | confirmed (US only) | 88 FR 16190 |
| Kamali et al. five artefact categories | confirmed | arXiv 2406.08651 |
| Diffusion reproducibility not guaranteed across hardware | confirmed | Hugging Face Diffusers "Reproducible pipelines" guide |
| Photo editors "broker, select, validate and make publication decisions" | confirmed (abstract only) | Mäenpää, Visual Communication, 2022 |
| Parallax: clean plate, keep original, test full range | confirmed (practice) | Practitioner tutorials |

## Sources

1. [ERIC - ED186847 - On Functions of Pictures in Prose., 1979-Dec](https://eric.ed.gov/?id=ED186847)
2. [5 A Transfer-Appropriate-Processing Perspective of Pictures in Prose - ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0166411508621494)
3. [Integrating Text and Image: Determining Multimodal Document Intent in Instagram Posts](https://arxiv.org/pdf/1904.09073)
4. [The Coherence Principle: Less is More in Multimedia Design](https://fox-ae.com/the-coherence-principle-less-is-more-in-multimedia-design/)
5. [Informative Images](https://www.w3.org/WAI/tutorials/images/informative/)
6. [\[1901.07878\] ”Is this an example image?”](https://ar5iv.labs.arxiv.org/html/1901.07878)
7. <https://www.illustratorsireland.com/wp-content/uploads/2020/05/Guide-to-Commissioning-Illustrators-by-Illustrators-Ireland-and-The-AOI.pdf>
8. [Code of Ethics for Visual Journalists](https://nppa.org/resources/code-ethics)
9. [The Art of Editing in Photojournalism: Enhancing Visual Narratives • Journalism University](https://journalism.university/writing-and-editing-for-print-media/editing-photojournalism-visual-narratives/)
10. [Entry Rules and Guidelines - 2026 NPPA Best of Photojournalism](https://bop.nppa.org/2026/technical-guidelines/)
11. [“Not a replacement of journalists in any way”: AP clarifies standards around generative AI](https://www.niemanlab.org/2023/08/not-a-replacement-of-journalists-in-any-way-ap-clarifies-standards-around-generative-ai/)
12. [Can You Use AI in a Photo Contest? The 2026 Rules of 87 Competitions](https://www.lumethic.com/en/articles/contest-ai-policies-database)
13. [2026 Photojournalism Interclub Scoring Guide. Image Creation and Authorship:](https://cdn.ymaws.com/psaphotoworldwide.org/resource/resmgr/pdf/divisions/interclub/2026-27/pjd-ic-scoring-2026-27.pdf)
14. [(PDF) In search of visual expertise: examining skilled vision in the work of news photo professionals](https://www.researchgate.net/publication/339198006_In_search_of_visual_expertise_examining_skilled_vision_in_the_work_of_news_photo_professionals)
15. [How to Distinguish AI-Generated Images from Authentic Photographs](https://arxiv.org/pdf/2406.08651)
16. [How to brief an illustrator. • \<!-- --\>Handsome Frank • Home to the world's greatest illustrators](https://www.handsomefrank.com/insights/read/how-to-brief-an-illustrator)
17. [Why the Same Seed Can Produce a Different Image](https://movey.ai/en/articles/same-seed-different-image)
18. [IPTC Photo Metadata User Guide](https://www.iptc.org/std/photometadata/documentation/userguide/)
19. [Characterizing Photorealism and Artifacts in Diffusion Model-Generated Images](https://dl.acm.org/doi/10.1145/3706598.3713962)
20. [Human readable concept data](https://cv.iptc.org/newscodes/digitalsourcetype/)
21. [Pat David: 2.5D Parallax Animated Photo Tutorial (using Free Software)](https://patdavid.net/2014/02/25d-parallax-animated-photo-tutorial/)
22. [Parallax Animation: Bringing Still Photographs to Life](https://www.picturecorrect.com/parallax-animation-bringing-still-photographs-to-life/)
23. [Parallax animation guide for layered photo motion](https://www.tryclout.ai/blog/parallax-animation-guide)
24. [What Is the Parallax Effect? A Guide to 2D and 3D Animation](https://www.foxrenderfarm.com/share/what-is-parallax-effect/)
25. [Recommended practices for attribution - CC Public Wiki](https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution)
26. [Copyright Office Publishes Report on Copyrightability of AI-Generated Materials](https://www.skadden.com/insights/publications/2025/02/copyright-office-publishes-report)
27. [When Registering Works Incorporating AI-Generated Material, It Pays to Be Truthful](https://www.finnegan.com/en/insights/articles/when-registering-works-incorporating-ai-generated-material-it-pays-to-be-truthful.html)
28. [Every IPTC Digital Source Type Code Explained](https://adaptlypost.com/blog/iptc-digital-source-type)
29. [P: Digital Source Type IPTC field controlled vocabulary needs updating](https://community.adobe.com/feature-requests-676/p-digital-source-type-iptc-field-controlled-vocabulary-needs-updating-665966)
30. [C2PA and Content Credentials Explainer :: C2PA Specifications](https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html)
31. [Soft Redaction of Image Provenance via Zero-Knowledge Proofs](https://arxiv.org/pdf/2608.07063)
32. [schema package - github.com/duggaraju/c2pa-go/schema - Go Packages](https://pkg.go.dev/github.com/duggaraju/c2pa-go/schema)
33. [Reading ingredients](https://opensource.contentauthenticity.org/docs/manifest/reading/reading-ingredients/)
34. [How to Detect AI-Generated Images Using Metadata in 2026](https://fast.io/resources/ai-generated-image-metadata-detection-tools/)
35. [US Copyright Office AI guidance, in plain English](https://copyrightinformation.org/ai/copyright-office-ai-guidance/)
