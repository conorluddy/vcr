# ADAPT: Adapting One Master into Many Versions — Reframing, Cutdowns, Localisation and Variants

One master survives many deliverables only if you design it as a parameterised system from the start: named regions with anchors and priorities, copy pulled from locale tables, and beat markers that versions can re-time to. Routine versions can use parameters and repeated checks; changed meaning or composition may require an authored re-edit or sibling master (§1.1). Platforms keep the numbers moving (Google's bumper is now "6 seconds (>=5 seconds minimum)", TikTok's safe zone shrinks as the caption grows), so every platform threshold here is tiered `platform` and dated.

> **Status.** Seed document for the `ADAPT-*` pillar of VCR. Scope: how one code-first master becomes many deliverables across aspect ratio, duration, language/locale, audience and other variant axes, and how an agent verifies the whole version set. Out of scope (owned elsewhere, cited not restated): type sizes, safe-zone values and caption reading speeds (`TYPO-*`, especially `TYPO-SAFE`, `TYPO-FONTS`, `TYPO-CAPTION-CPS`); motion curves (`MOTION-*`); pacing and beat structure (`PACE-*`); colour, composition and brand look (`ART-*`); music, VO and SFX mixing (`SOUND-*`); per-production values (`BRIEF-*`); review method (`REVIEW-*`); accessibility (`A11Y-*`, reference only).
>
> **Confidence tiers.** `standard`: a published standard, regulator guidance or style guide, checked against the primary source on the date in the ledger. `platform`: published by a platform or vendor; may change without notice; re-check before each campaign. `heuristic`: practitioner rule of thumb, secondary source, or a VCR proposal not yet validated. Every rule also says whether it is **measurable** (and how) or **judgement only**.
>
> **Evidence labels.** *Audience evidence* means studies or platform data about what viewers do. *Production evidence* means data about what professionals actually do. *Expert taste* means practitioner opinion. The labels are kept separate throughout.
>
> **Citation note.** Source titles are named inline and in the verification ledger. The numbered list in §20 matches the escaped `\[n\]` markers in the text.

## TL;DR

- **Build the master as a system.** Every VCR scene should expose `aspect`, `durationTarget`, `locale`/`dir`, `copy` and `variant` parameters. It should declare its regions (focal, text, logo, legal, CTA) with anchors, priorities and a `required` flag, and publish beat `markers`. Reframes are then re-layouts, not crops. Cutdowns re-time to markers instead of trimming. Localisation swaps string tables and fonts. Automatic reframers (Google's AutoFlip, Adobe Auto Reframe) are built for live-action footage. AutoFlip support ended on March 1, 2023, and Adobe warns that results "may not be great if the action is very fast". Use them for footage plates only, never for graphics or type.
- **Every version has hard, checkable invariants.** Duration must fall inside the platform window, measured from the decoded file: Google lists bumpers as "6 seconds (>=5 seconds minimum)", standard non-skippable as "7 to 15 seconds", and requires YouTube TV 30-second ads to run ":29 and :31 seconds".\[1\] Mandatory elements (proposition, brand, CTA, any legal super) must be present in every cutdown. Text must fit in every locale: pseudo-localise at Microsoft's "lengthen the text by 40%" baseline, and stress short strings at the IBM tiers W3C reproduces ("Up to 10" characters → "200–300%").\[2\] Safe zones per aspect come from `TYPO-SAFE`. The focal subject must stay in frame. Captions and VO must line up after re-timing. The version matrix must be complete.
- **Localise timing, not just text, and treat legal text as its own track.** Dubbed lines have to fit their slots. Production evidence from 319.57 hours of professional dubs shows that dubbers respect timing but do not speed up their speech to make lines fit, so neither should a TTS pipeline: rewrite the line or re-time the picture.\[3\] Disclosures are market-specific. UK TV supers need roughly "0.2 seconds per word plus 2 seconds recognition time" for 9 words or fewer.\[4\]\[5\] The US FTC sets no formula, only "a duration sufficient for consumers to notice, read, and understand".\[6\]\[7\] A cutdown that drops the claim's qualifier is a compliance failure, not a style note.

## Key findings

1. **AutoFlip, the best-documented open reframer, is a legacy pipeline with explicit design choices worth copying, not running.** MediaPipe's documentation says "We have ended support for this MediaPipe Legacy Solution as of March 1, 2023" and "AutoFlip currently only works with OpenCV 3". Its ideas transfer to VCR's code-first world: weighted saliency signals, an `is_required` hard constraint, a padding fallback when required content "cannot be all covered", a steady-versus-tracking decision (`motion_stabilization_threshold_percent`, where "0.5 = 50%… then the camera is held steady"), and snap-to-centre. (MediaPipe AutoFlip documentation; `platform`.)\[8\]
2. **Adobe Auto Reframe creates a duplicate sequence and tracks motion, but Adobe itself warns about fast action.** Premiere "creates a duplicate sequence with the correct dimensions for the new aspect ratio", and in Faster Motion mode "the Auto Reframe effect follows the action, however the results may not be great if the action is very fast". A practitioner source adds that Auto Reframe "does not work with still images". (Adobe Premiere Help; Larry Jordan, secondary; `platform`/`heuristic`.)\[9\]\[10\]
3. **Google's YouTube ad lengths are now windows with floors, and Google's own help pages disagree.** Google Ads "About video ad formats" lists Bumper max length as "6 seconds (>=5 seconds minimum)" and non-skippable as "15-60 seconds (depending on the campaign subtype)". The "Non-skippable in-stream ads" page lists "Bumper ads: Videos up to 6 seconds long", "Standard non-skippable: Videos between 7 to 15 seconds long" and "30-second non-skippable (CTV): Videos 16-30 seconds long".\[1\] Display & Video 360 still says "Videos must be 6 seconds or shorter". A 4-second bumper is therefore valid on one Google surface and invalid on another. (Google Ads Help; DV360 Help; `platform`.)\[1\]\[11\]\[12\]
4. **Google describes the bumper as a distinct job, not a short cut.** Google's format table describes Bumper as a "Quick message that can't be skipped to raise awareness or reinforce other ads". That supports building the 6 s as its own piece around one idea, not trimming the first 6 s of the 30. (Google Ads Help; `platform`; the creative conclusion is `heuristic`.)\[12\]
5. **TikTok's safe zone is not a constant, and it has a right-to-left variant.** TikTok says "The safe zone size is determined by the ad caption length and any Interactive Add-on usage; the longer the caption, the smaller the safe zone will be". It ships separate files "between left-to-right and right-to-left languages" and notes "In-feed safe zone is more restrictive than open screen".\[13\] Localising the caption can therefore change the safe zone of the same video. (TikTok Business Help Center, TopView specifications, last updated October 2026; `platform`.)\[13\]\[14\]
6. **Text expansion depends on string length, and the two IBM tables disagree in one row.** W3C reproduces IBM's averages: "Up to 10 | 200–300%", "11–20 | 180–200%", "21–30 | 160–180%", "31–50 | 140–160%", "51–70 | 151-170%", "Over 70 | 130%".\[2\] IBM's own current page gives "Additional space required" of "51 to 70 | 31 to 40%", which is 131–140% total, not 151–170%. The W3C row looks like a transcription error, but this is not confirmed. (W3C i18n; IBM Docs; `platform`.)\[2\]\[15\]
7. **Microsoft's pseudo-localisation guidance gives a concrete default and an extreme.** "When the source language is English, a good heuristic is to lengthen the text by 40%. In practice, there can be extreme cases where a string may be 200% or even 400% longer". Microsoft also names pseudo-locales `qps-ploc` (base), `qps-plocm` (mirrored), `qps-ploca` (East Asian), and ICU's "en-XA (A for Accents) and en-XB (B for bidirectional)". (Microsoft Learn; `platform`.)\[16\]
8. **Script changes height, not just width.** W3C: "the English 'desktop' becomes 'デスクトップ' in Japanese. The Japanese has one less character, but will typically take up much more horizontal space". Its Thai example shows "Thai text consuming around 150% of the vertical space of the Latin text".\[2\] UK broadcast guidance for non-European scripts suggests, as "a rule of thumb judgement", an extra four HDTV lines ("a standard of 34 lines and a minimum of 30 lines").\[17\] (W3C i18n; BCAP guidance; `standard` for the UK TV scope, `heuristic` elsewhere.)
9. **Professional dubbers honour timing but do not change speaking rate, and lip sync is weaker than folklore says.** In a corpus of "319.57 hours of video from 54 professionally produced titles", Brannon, Virkar and Thompson argue "for the importance of vocal naturalness and translation quality over commonly emphasized isometric (character length) and lip-sync constraints, and for a more qualified view of the importance of isochronic (timing) constraints".\[3\] They conclude "automatic dubbing systems should not simply vary speaking rates to achieve isochronic constraints".\[3\] (TACL 2023 / arXiv 2212.12137; *production evidence*; `heuristic` as applied to VCR.)
10. **Disclosure legibility is numeric in the UK and principle-based in the US.** BCAP: supers should use "0.2 seconds per word plus 2 seconds recognition time" for "'Short' (9 words or fewer)" and "plus 3 seconds" for "'Long' (10 words or more)".\[4\]\[5\] Preferred minimum height is "30 Lines" HDTV, or "26 Lines" on "a single-coloured opaque block". The scope excludes "video-on-demand".\[17\] The FTC asks only for "a duration sufficient for consumers to notice, read, and understand" and says "There is no set formula".\[6\]\[7\] (ASA/BCAP; Clearcast; FTC; `standard`, scoped by market.)

---

## 1. Designing for adaptation from the start

### 1.1 Two strategies, and when each wins

| Strategy | What it means | Wins when | Fails when |
|---|---|---|---|
| **Design once, adapt** (master + rules) | One master composition. Versions come from layout rules (anchors, priorities, reflow) and parameters. | Series, many locales, many lengths, data-driven variants; graphic or typographic work where layout *is* the content | A hero composition depends on a precise relationship between subject and frame that cannot survive a 3.2× change in width |
| **Design per format** (sibling masters) | Separate compositions per aspect (often 16:9 and 9:16) sharing assets and tokens | Flagship launches, title sequences, anything judged as cinema; vertical-native social where the hook must be built for the phone | Volume: each sibling multiplies QC, and siblings drift apart in timing and copy |
| **Hybrid (recommended default)** | Author two or three *anchor* masters (e.g. 16:9 and 9:16), derive 1:1 and 4:5 from the nearer anchor by rule, and derive all lengths and locales by parameters | Most commercial work | When a team pretends the derivations are free and skips review of the derived cells |

*Expert taste:* agencies commonly plan a "hero" master plus a deliverables list. Treat the per-format extremes (16:9 ↔ 9:16) as authored and the intermediates (1:1, 4:5) as derived. No primary source was found that quantifies which approach performs better with audiences, so this guidance is `heuristic`.

### 1.2 The geometry that makes cropping fail

Arithmetic, not sourced. Cropping a 16:9 master to another aspect at full height keeps this fraction of the master's width:

| Target from 16:9 (full height kept) | Width retained | At 1920×1080 source |
|---|---|---|
| 9:16 | (9/16)/(16/9) = 81/256 ≈ **31.6%** | ≈ 607.5 px of 1920 |
| 4:5 | (4/5)/(16/9) = **45.0%** | 864 px |
| 1:1 | (1/1)/(16/9) = **56.25%** | 1080 px |

The ≈607 px figure matches a widely repeated Adobe community answer ("1920x1080 original Sequence with Auto Reframe Vertical 9:16 will create a 607x1080 Auto Reframed Sequence"; secondary, forum). Going the other way, 9:16 → 16:9 keeps 31.6% of the height. The implication: **any graphic element that spans more than about a third of a 16:9 frame's width cannot survive a 9:16 crop.** Wide lockups, lower-thirds, side-by-side comparisons, charts and horizontal type all fall into this group. They must be recomposed.

### 1.3 Layout system: safe core, anchored regions, responsive type

- **Safe core.** Define a central region that survives every target aspect at full height, i.e. the intersection of all crop windows. For a 16:9 master targeting 9:16, the core is ≈31.6% of width × 100% of height. Put the irreducible focal content here, and only the content that must survive *every* crop. Platform UI safe zones are a different, additional constraint owned by `TYPO-SAFE`. Apply them per aspect *after* layout.
- **Anchored regions.** Every non-core element declares an anchor (`top-left`, `bottom-centre`, `focal-relative`, etc.), a priority (what gets dropped or shrunk first), and a reflow rule (stack, wrap, scale, hide). Anchors are relative to the *active* frame and safe area, not to master pixels.
- **Responsive type.** Size type from the active frame's short side or from the safe area, within `TYPO-*` minimums and maximums. Never scale a text block uniformly with the picture: a headline that is 6% of 16:9 width becomes unreadable at 31.6% retention. Type reflows. Pictures crop or recompose.
- **Hierarchy tokens, not sizes.** Store roles (`display`, `headline`, `body`, `legal`, `cta`) and resolve sizes per aspect from the series brief (`BRIEF-*`). The check is that role order is preserved (see `ADAPT-HIERARCHY-PRESERVED`), not that sizes match.
- **Text off the picture.** All copy lives in string tables and is rendered live. Never bake it into rasters, textures or Blender renders unless per-locale assets are declared (`ADAPT-NO-BAKED-TEXT`).

### 1.4 What breaks (failure taxonomy)

| Failure | Typical cause | Detectable by |
|---|---|---|
| Cut-off subject ("subject clipped in the vertical") | Centre crop or a saliency path that lost the subject | Focal bbox vs frame per frame (`ADAPT-FOCAL-IN-FRAME`) |
| Lost hierarchy ("headline now smaller than the sticker") | Per-element scaling rules that conflict | Role order across aspects (`ADAPT-HIERARCHY-PRESERVED`) |
| Crowded type | Same copy and same size in a 31.6%-width frame | Overflow and line-count checks (`ADAPT-TEXT-FIT-LOCALE`) |
| Text under UI | Master safe zone ≠ platform safe zone | `TYPO-SAFE` per aspect (`ADAPT-SAFE-ALL-ASPECTS`) |
| Logo stranded in a corner or off-frame | Logo anchored to master pixels | Region-in-frame check |
| Jittery reframe | Saliency path followed per-frame noise | Crop-path velocity/jerk (`ADAPT-CROP-PATH-STABLE`) |
| Lost end card in the cutdown | Trim instead of re-time | Mandatory-element windows (`ADAPT-MANDATORY-PRESENT`) |

### 1.5 Where an agent goes wrong

- **Homogenisation.** Defaulting every aspect to "centre everything, shrink to fit" produces generic vertical output. 9:16 has its own grammar (vertical stacking, top-third hooks, larger type relative to the frame). Adapting should re-compose, not just shrink.
- **Over-applying the safe core.** Putting *everything* in the intersection region wastes the 16:9 frame. The core is for irreducible content. Secondary content should use each aspect's full canvas.
- **Judging from one still.** A reframe that looks fine at t = 0 can lose the subject at t = 3.2 s. Sample across time (section 10).

---

## 2. Reframing

### 2.1 Manual and parameterised reframing (VCR's default)

Because VCR scenes are code, "reframing" a graphics scene means **re-running layout for a new viewport**, not moving a crop window. The crop-window model applies only to embedded *footage plates* (video textures, Blender renders of fixed cameras, stock clips) and to full-frame 3D cameras.

For footage plates and 3D cameras:
- **Focal points.** Declare per-shot focal regions (bboxes or points with radius) as data, keyed by time. For Blender, prefer a re-rendered camera per aspect (change sensor fit and framing) over cropping a 16:9 render. That is recomposition, and with deterministic scene files it is cheap.
- **Crop paths.** If you must crop footage, compute a crop path per shot that keeps required regions inside, holds still when it can, and moves with eased, bounded velocity when it must. AutoFlip's published logic is a good template. Over a shot, if "all detected focus objects remain within this ratio of the frame (e.g. 0.5 = 50%…) then the camera is held steady. Otherwise the camera tracks activity". Snap-to-centre applies if the stable viewpoint is within `snap_center_max_distance_percent` of the centre. AutoFlip notes this is "useful… if titles and logos are expected to appear in the center of the frame".
- **Shot boundaries reset the path.** AutoFlip runs shot detection on the full-frame-rate stream and computes per-scene crops. VCR knows its cuts exactly (scene graph), so it never needs to guess.

### 2.2 When to recompose instead of crop

Recompose (re-layout or re-render) when any of these hold:
1. A required region is wider than the target crop width (e.g. > 31.6% of 16:9 width for 9:16).
2. Two required regions are farther apart than the crop width at the same time (dialogue two-shots, product + presenter, before/after).
3. Text or a logo is part of the plate. Cropping it either cuts it or forces an off-centre path.
4. The crop needs more than an upscale budget to fill the target resolution. A 607.5 px wide strip from 1080p must be upscaled ≈1.78× to fill 1080 px width. Set the upscale limit in `ART-*`/`BRIEF-*`. This document proposes treating anything beyond about 1.5× as a recompose trigger (`heuristic`, untested).
5. AutoFlip's own escape hatch triggers. When required features "cannot be all covered (for example, when they are too spread out in the video), AutoFlip will apply a padding effect". Padding (blurred fill bars) is a legitimate stylistic choice only if the brief allows it. Otherwise, treat it as a flag to recompose.

**Legitimate breaks.** Deliberately letterboxing 16:9 inside 9:16 ("windowboxing"), with type above and below, is a valid design for trailers and cinematic work. TikTok's TopView specification even allows "Horizontal movie trailers… if they remain vertical in the first 3 seconds". It works when the bands carry designed content (title, CTA) instead of empty blur, and when the platform's opening-seconds rules are met.

### 2.3 Text and logo repositioning

- Text and logos are **never** cropped. They are re-anchored per aspect from the region declarations.
- Re-anchoring order: (1) keep the same semantic anchor (e.g. "bottom-centre CTA"), (2) clamp into the platform safe area (`TYPO-SAFE`), (3) if they collide with the focal region, move by priority (lower priority moves first), (4) if they still collide, reflow (wrap or stack), (5) last resort, shrink within the `TYPO-*` minimum.
- In 9:16, horizontal lockups usually become stacked lockups. This should be a declared alternate asset (`logo.stacked`), not an automatic squeeze.
- For RTL locales, mirror anchor *sides* (start/end), not artwork (section 4.4).

### 2.4 Automatic reframing tools: what is published and how reliable they are

| Tool | What it does (from docs) | Reliability evidence | Use in VCR |
|---|---|---|---|
| **MediaPipe AutoFlip** (Google, open source) | Saliency-aware crop: face/object detection, border detection, shot boundaries, signal fusion with weights and `is_required`, per-scene stable vs tracking camera, padding fallback. Supports "both landscape-to-portrait and portrait-to-landscape" | No accuracy benchmark in the docs. Support ended March 1, 2023; "only works with OpenCV 3". The default graph downsamples analysis frames (`target_width: 480`; `PacketThinnerCalculator` `period: 200000`, which reads as 200,000 µs, i.e. about 5 fps, an inference) | Reference design only. Port the ideas (required vs best-effort, steady vs track, snap-to-centre) into VCR's own crop-path code for footage plates |
| **Adobe Premiere Auto Reframe** | Analyses clips, adds position keyframes; sequence mode duplicates the sequence into an "Auto Reframe Sequences" folder; Motion Tracking presets (Slower, Default, Faster) | Adobe: "results may not be great if the action is very fast". Practitioner: no still images; don't run twice; nesting leaves "graphics and audio unaffected" (secondary). Community threads report regressions (anecdotal, not fetched) | Useful for live-action plates delivered from editorial. Never for VCR-rendered graphics |
| **Academic saliency cropping** | E.g. crop at the saliency-weighted centre with size from saliency spread (arXiv 2309.11881, using DeepGaze IIE) | Research prototypes. That paper notes "the fixed cropping size… did not account for temporal variations in saliency spread" | Background only |

**Bottom line on reliability:** no vendor publishes accuracy figures. Treat every automatic reframe as a *proposal* that must pass `ADAPT-FOCAL-IN-FRAME` and `ADAPT-CROP-PATH-STABLE` plus human review of the sampled frames. For VCR graphics there is nothing to detect: the scene already knows where everything is, so declared regions beat inferred saliency every time.

---

## 3. Cutdowns (60 → 30 → 15 → 6)

### 3.1 Platform duration formats (quoted exactly; `platform`; checked 2026-11-06)

| Surface | Exact published wording | Source |
|---|---|---|
| YouTube bumper (Google Ads) | Max video length: "6 seconds (>=5 seconds minimum)"; "Bumper ads are non-skippable video ads lasting between 5 and 6 seconds" | Google Ads Help, About video ad formats |
| YouTube non-skippable (Google Ads) | "Bumper ads: Videos up to 6 seconds long." "Standard non-skippable: Videos between 7 to 15 seconds long." "30-second non-skippable (CTV): Videos 16-30 seconds long that are shown on Connected TV (CTV)." "For non-skippable in-stream, your ad should be 30 seconds (or shorter)." | Google Ads Help, Non-skippable in-stream ads |
| YouTube non-skippable (format table) | "15-60 seconds (depending on the campaign subtype)" | Google Ads Help, About video ad formats |
| YouTube skippable in-stream | "No max length ( <3 min recommended)" | Google Ads Help, About video ad formats |
| YouTube Shorts ads | "<60 seconds recommended" | Google Ads Help, About video ad formats |
| YouTube TV | "make sure that your 30-second and 60-second ads match the correct ad length exactly or are within 1 second… a 30-second ad must be between :29 and :31 seconds long" | Google Ads Help, About YouTube TV ad formats |
| DV360 bumper | "Videos must be 6 seconds or shorter and hosted on YouTube. Viewers can't skip your ad." | Display & Video 360 Help |
| YouTube Shorts (organic) | "Up to 3 minutes." "With a square or vertical aspect ratio." Videos "uploaded on or after [October 15, 2024] with a square or vertical aspect ratio up to three minutes in length will be categorized as Shorts" | YouTube Help |
| TikTok TopView (Non-Spark) | "Dimension: Vertical 9:16, ≥540*960px"; "Video Duration: 5-60s, recommend 9-15s."; "Bitrate: ≥2,500kbps" | TikTok Business Help Center, TopView specifications (Oct 2026) |

**Conflicts to carry forward.** Google's surfaces disagree: the Google Ads table lists a 5-second bumper floor, while DV360 says "6 seconds or shorter", and non-skippable is "7 to 15" on one page and "15-60" on another. A secondary source (Nordlys) reports the bumper floor wording changed around September 2026. That fits the current page but is unverified against an archive. **Rule:** target the intersection (5.0–6.0 s for bumpers) and re-check the specific buying surface before delivery.

### 3.2 Durations in frames (arithmetic; use these, not seconds, as targets)

| Target | 24 fps | 25 fps | 30 fps | 60 fps |
|---|---|---|---|---|
| 6 s | 144 | 150 | 180 | 360 |
| 15 s | 360 | 375 | 450 | 900 |
| 30 s | 720 | 750 | 900 | 1800 |
| 60 s | 1440 | 1500 | 1800 | 3600 |

A bumper must be between 5 s and 6 s, e.g. 120–144 frames at 24 fps. One extra black frame, or an audio tail longer than the video, can push the container duration past 6.0 s. Measure the *decoded delivery file*, video and audio streams separately (section 10).

### 3.3 What must survive every cut

The **mandatory set**, declared per production in `BRIEF-*` and checked by `ADAPT-MANDATORY-PRESENT`:
1. **Proposition.** The one idea (one sentence). In a 6 s version this is the *only* idea.
2. **Brand.** Logo and/or name visible long enough to register (window owned by `BRIEF-*`). Ideally also heard or implied by a sonic logo (`SOUND-*`).
3. **CTA / end card**, where the format supports action. Google's table says bumpers "Can remarket to viewers? No", which argues for a brand-reinforcement close rather than a click-style CTA in 6 s (inference).\[12\]
4. **Legal / disclosure** tied to any claim that survives the cut. If the claim survives, its qualifier must survive with full hold time for that market (section 6). If the qualifier cannot fit, drop the claim.
5. **Required platform elements**, e.g. TikTok TopView: "Plain white color cannot be allowed in the first 3 seconds" and "Audio must remain clear and be available (video must not be completely silent)".\[13\]

### 3.4 The 6 s bumper as its own form

- Google's own framing: a "Quick message that can't be skipped to raise awareness or reinforce other ads". Build it around one idea, one product moment and the brand. Do not compress the 30.\[12\] Google's Create with Google "YouTube Bumper Ads" guide also reports a Google/Ipsos lab experiment (US, Nov 2018, n=7,500) in which "a video ad sequence of three six-second ads had a significantly higher impact than single :30 TrueView ads on Ad Recall and Purchase Intent, with an increased average lift of 107% and 134%, respectively" (*audience evidence*, vendor-published).
- *Platform guidance (Google, primary):* the same Google guide says "Bumpers work best when they are specifically built for the six-second format. Instead of cut-downs or even cut-outs from longer ads, consider how they can bring something to the story that might normally be left out", and advises "Focus on one thing… one joke, one product feature, one price". Speeding up a 30 s audio track to fit 6 s is a commonly cited anti-pattern (secondary practitioner guides).
- *Audience evidence (vendor-published):* Google's Create with Google bumper guide states "Nearly 9 in 10 bumper campaigns drove a significant lift in Ad Recall. Source: Google Brand Lift Meta Analysis, Global, 2017." A practitioner blog's version ("122 US bumper campaigns", "over 9 in 10") does not match Google's wording ("Global", "nearly") and remains unverified.
- **VCR approach:** author the bumper as its own scene variant (`variant: "bumper"`) that reuses tokens, assets and the sonic logo, with its own beat map. The cutdown planner should *propose* a bumper from the master's highest-priority beats, but a human approves it.

### 3.5 Re-timing beats rather than trimming them

- A master should publish **beats** as `markers` with roles (`hook`, `problem`, `proof`, `product`, `brand`, `cta`, `legal`) and priorities. A cutdown is a *selection plus re-timing* of beats. Each kept beat may compress internally within `PACE-*` and `MOTION-*` limits (e.g. shorter holds, faster entrances), but its easing and motion character stay the same.
- **Trim** (cut the tail, keep timings) is acceptable only for 60 → 30 when the 60 was structured with a natural midpoint. Below 30 s, trimming almost always loses the end card (the "lost the end card in the 6" failure).
- **Never time-scale an entire scene uniformly** to hit a length. Motion reads as sped up, and audio pitch or tempo breaks. Re-time per beat.
- Keep transitions on beat. Cut points in the cutdown should land on music markers within ±1 frame (`ADAPT-BEAT-RETIME`). The beat grid itself is owned by `PACE-*`/`SOUND-*`.

### 3.6 Music edits and re-scoring

Owned by `SOUND-*`. The adaptation obligations are:
- Every length needs its own music edit that **starts and resolves musically**: edits at bar or phrase boundaries, a real ending (button or sting) rather than a fade truncated mid-phrase. Licensed tracks often come with stems or pre-cut lengths. Use them and record which edit each version uses in the manifest.
- Procedurally synthesised scores must regenerate deterministically per length from the same seed and structure, not by cutting the 60 s render.
- The sonic logo or brand sting lands at the same position *relative to the end card* in every length.
- Re-derive SFX after re-timing (section 5.5).

---

## 4. Localisation of on-screen text

### 4.1 Text expansion: published factors and their sources

| Source | Wording / figures | Tier / notes |
|---|---|---|
| W3C i18n, "Text size in translation" (reproducing IBM) | "Up to 10 | 200–300%"; "11–20 | 180–200%"; "21–30 | 160–180%"; "31–50 | 140–160%"; "51–70 | 151-170%"; "Over 70 | 130%". "the smaller the source message, the higher the likely translation length" | `platform` (vendor data via W3C). The 51–70 row conflicts with IBM |
| IBM Docs, "Text translation design" | "Additional space required": "Up to 10 | 100 to 200%"; "11 to 20 | 80 to 100%"; "21 to 30 | 60 to 80%"; "31 to 50 | 40 to 60%"; "51 to 70 | 31 to 40%"; "Over 70 | 30%" | `platform`. Expressed as *additional* space, so "100 to 200%" additional = 200–300% total, consistent with W3C except the 51–70 row |
| Microsoft Learn, Pseudolocalization | "lengthen the text by 40%… extreme cases where a string may be 200% or even 400% longer" | `platform` |
| Adobe Spectrum, Internationalization | "Max. estimated expansion": "Up to 10 | 300%"; "11 to 20 | 200%" | `platform` (design-system guidance) |
| W3C Flickr example | "views" → Italian "visualizzazioni" ratio "3"; Korean "조회" ratio "0.8" ("each Chinese and Korean character is counted as two English characters in width") | Illustrative, single string |

**How to use these.** Budget by *source string length*, not by language. Headlines, CTAs and button-like labels (≤ 20 characters) are the danger zone, and they are exactly the strings motion design sets largest and tightest. Paragraph-length legal text expands least in relative terms but adds lines. W3C warns that "Will items still align… if they grow downwards at different rates?"

**Contraction is a failure too.** W3C: "smaller translations can be as problematic as bigger ones if they leave too much white space". A CJK headline at the same point size can leave a hero frame looking empty. Size rules per script belong in `TYPO-*`.

### 4.2 Line breaking and hyphenation per language

- Compound languages (W3C: "Finnish, German and Dutch") produce long unbreakable words ("Eingabeverarbeitungsfunktionen").\[2\]\[18\] Headline boxes need either soft hyphenation (CSS `hyphens: auto` with the correct `lang`) or a minimum width that fits the longest word.
- Thai, Lao, Khmer and Myanmar do not separate words with spaces.\[19\] Chinese and Japanese break between most characters, subject to prohibition rules (no line-start on closing punctuation or small kana, etc.). Implement with the browser's line breaker plus `lang` attributes, or `Intl.Segmenter` for canvas text. Never split on spaces yourself.
- The authoritative references are Unicode UAX #14 (line breaking), UAX #29 (text segmentation) and W3C's JLREQ/CLREQ/KLREQ. **They were not fetched in this pass**, so rules depending on them are tiered `heuristic` until verified (see ledger).
- Agent pitfall: manual `\n` line breaks in source copy. They are correct for English and wrong in every other language. Use per-locale break hints (`<wbr>`, non-breaking spaces between number and unit) in the string table, written by the translator.

### 4.3 CJK and complex scripts

- **Width:** CJK glyphs are full-width. W3C counts each "as two English characters in width". TikTok's spec does the same: "Full-width characters such as those used in CN/JP/KR occupy a 2-character space". Its account names allow "max 10 characters for CN/JP/KR or 20 characters in other languages", and ad captions should stay "within 50 characters for CN/JP/KR or 100 characters in other languages to avoid being covered by See more".
- **Height:** W3C lists scripts needing more vertical space: "Arabic (especially in Nastaliq fonts), Chinese, Devanagari (used for Hindi), Japanese, Korean, Tibetan, etc." Thai takes "around 150% of the vertical space". Line-height tokens must be per script (`TYPO-*`), and text boxes must be measured for height, not just width.
- **Subtitles:** Netflix's Traditional Chinese guide allows "16 characters per line" and "Adult programs: Up to 9 characters per second" (search snippet of the primary page; see ledger). Reading-speed rules belong to `TYPO-CAPTION-CPS`. The point for adaptation: **caption timing derived for English cannot be reused for CJK**. Re-segment per language.
- **Complex shaping** (Arabic joining, Indic conjuncts) breaks if text is drawn glyph-by-glyph on canvas or animated per character. Per-letter animations (`MOTION-*` staggers) must operate on grapheme clusters (UAX #29) and, for joining scripts, usually on words or lines instead. Animating isolated Arabic letters changes their shapes. This is a common agent failure.

### 4.4 Right-to-left and bidirectional text

- Set `dir="rtl"` and `lang` at the scene root for RTL locales. Use logical CSS properties (`inset-inline-start`, `margin-inline-end`) so anchors mirror automatically.
- **Mirror:** reading-order layouts, progress direction, arrows that mean "next", timeline motion that implies sequence (e.g. text entering from the reading-start side).
- **Do not mirror:** logos, product photography, clocks, media-player icons by convention, charts with numeric axes unless the brief says so, and Latin-script brand names inside RTL text. Bidi handling (UAX #9) keeps embedded LTR runs and numbers in order. Wrap them in `<bdi>` or isolate them to avoid punctuation jumping. UAX #9 was not fetched in this pass.
- **Platform:** TikTok publishes separate RTL safe-zone files ("Standard Version Left to Right (LTR) refers to all regions except the Arabic region that uses the Right to Left (RTL) version"). The safe zone itself mirrors.
- **Test:** run the mirrored pseudo-locale (`qps-plocm` or ICU `en-XB`) on every project that ships *any* RTL locale (`ADAPT-PSEUDO-BIDI`).

### 4.5 Font coverage and fallback

Owned by `TYPO-FONTS`. Adaptation obligations:
- Every locale's resolved copy must be fully covered by the declared font stack. Measure it: no `.notdef`/tofu, and no fallback to an undeclared system font (`ADAPT-FONT-COVERAGE`).
- Fallback fonts change metrics, so overflow checks must run *after* font resolution, per locale, on rendered output.
- Headless Chromium in CI may lack system fonts present on a designer's machine. Bundle every font and fail if the renderer reports a fallback.

### 4.6 Numbers, dates, currency and units by locale

- Format with Unicode CLDR data via `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat` and `Intl.PluralRules`, all keyed by the version's `locale`. Never concatenate strings like `"$" + n`. CLDR was not fetched in this pass, so the rule is tiered `heuristic`, pending verification.
- Animated counters (data stories) must format *every intermediate frame* with the locale formatter. Digit grouping changes width as the number grows, so reserve width for the formatted maximum.
- Units and currency are content, not formatting: converting "5 miles" to "8 km" is a copy decision for the market. Flag hard-coded units for translator review.
- Pseudo-locales exist to catch this. Microsoft: "A pseudo locale will contain date, time, and other formatting options that challenge common assumptions about formats".

### 4.7 Pseudo-localisation as the gating test

Microsoft's transformation recipe (`platform`, quoted):
- "Add accents and characters from other scripts", e.g. "the letter `a` is replaced by any one of `αäáàāāǎǎăăåå`"; "The digits 1-9 can be replaced by circled digits ①-⑨".
- "Expand the string… a good heuristic is to lengthen the text by 40%."
- "Pad text to the expansion length using characters from other scripts, such as Greek, Cyrillic, Asian, and Indic scripts."
- "Add delimiters to the start and end of each string… Wrapping a string instantly reveals truncations… because the delimiter is missing."
- "Add a unique identifier so that you can easily locate the resource in the source."
- Caveat: "it isn't a complete replacement for validating the translated application".

**VCR profile (proposal, `heuristic`):** run three pseudo passes per master before any translation: (a) `pseudo-40`: +40% everywhere; (b) `pseudo-tiered`: expansion by source length using the upper IBM/W3C bound (×3.0 for ≤10 chars, ×2.0 for 11–20, ×1.8 for 21–30, ×1.6 for 31–50, ×1.4 for 51–70, ×1.3 over 70, taking the IBM row for 51–70); (c) `pseudo-rtl`: mirrored. Use the `[ ]` delimiter so clipping is visible in frames and detectable by OCR or bounds.

---

## 5. Localisation of audio and timing

### 5.1 Voice-over replacement and re-timing

- **Isochrony** is the key constraint: the translated line should fill the same time slot. Brannon et al. define it as dubs that "should be about the same duration as the source, and should respect perceptible pauses within a speaker turn" (summarising Miggiani 2019).
- *Production evidence:* human dubbers largely respect timing but do not vary speech tempo to get there. Their recommendation is that "automatic dubbing systems should not simply vary speaking rates". The paper also argues for "a more qualified view of the importance of isochronic (timing) constraints".
- **VCR decision ladder when a localised VO line overruns its slot:** (1) ask for a shorter translation (transcreation brief with a duration budget in seconds, not characters); (2) re-time the picture: extend the beat within `PACE-*` limits, which code-first scenes make cheap; (3) re-allocate time from an adjacent beat with slack; (4) only then apply a small TTS rate change. This document proposes a cap of ±5% (`heuristic`, VCR proposal, untested). Never time-stretch the master music to absorb VO.
- For TTS, generate per-line audio and read back the *actual* duration and word timings. Do not estimate from character counts. The isometric (character-length) proxy is exactly what Brannon et al. found less important than assumed.

### 5.2 Subtitles vs dubbing vs voice-over by market

- Choice of mode is a market and brief decision. Broadly: dubbing gives immersion and costs more; subtitles preserve the original performance; "UN-style" voice-over (translation over a ducked original) suits documentary and testimonial.\[20\] A per-market table was **not verified in this pass**. Common descriptions of dubbing-tradition versus subtitling-tradition countries come from audiovisual-translation literature not checked here. Put the mode per market in `BRIEF-*`.
- For short-form social that is mostly watched muted, burned-in captions or kinetic type often matter more than the audio language. Sound-led placements (TikTok's TopView requires audible audio) need localised VO or music-only cuts.

### 5.3 Caption re-timing

- Captions are *derived* data. After any re-time or VO replacement, regenerate cue times from the new audio's word alignment. Never shift the old file by an offset.
- Netflix's Partner Help Center page "Timed Text Style Guide: General Requirements" sets "Minimum duration: 5/6 (five-sixths) of a second per subtitle event (e.g. 20 frames for 24fps) Maximum duration: 7 seconds per subtitle event" (`platform`). The timing-to-audio tolerances reported by a secondary source (3Play Media), "timed to the audio, or in some cases, within three frames of the audio" and out-times "extended up to 12 frames past the timecode at which the audio ends", are not on the current general page and stay `heuristic`. Reading-speed limits per language are owned by `TYPO-CAPTION-CPS`.
- Vertical video changes caption geometry. A secondary copy of the BBC Subtitle Guidelines (v1.2.3, June 2024) gives line width as "68% of the width of a landscape 16:9 video" versus "90% of the width of a vertical 9:16 video", recommends "a maximum subtitle length of three lines" for 9:16, and reverses the placement box: "subtitles should not be placed outside the central 75% vertically and the central 90% horizontally". These numbers belong to `TYPO-*`. The adaptation point is that **caption layout is per-aspect, and re-segmentation per aspect is required**.

### 5.4 Lip sync

- Relevant only when a speaking mouth is visible on screen (live-action plates, lip-synced 3D characters).
- *Production evidence:* Brannon et al. found "low rates of lip sync" in human dubs, and suggest lip-sync research may be "marginally useful, at best".\[3\] They cite Di Giovanni and Romero-Fresco (2019), who found "audiences may not be as sensitive to lip sync as traditionally believed" (*audience evidence*, reported secondhand).\[3\]
- **VCR rule:** prioritise isochrony and naturalness. For close-ups of speaking characters, check bilabial closures (p/b/m) roughly line up (judgement), or cut away or reframe. For 3D characters, regenerate visemes from the localised audio (deterministically, from the audio file).

### 5.5 Keeping SFX and music in sync after re-timing

- Bind every SFX cue to a **visual event ID**, not to an absolute time. After re-timing, the cue time is re-derived from the event's new time. Synthesised SFX must be deterministic (`SOUND-*`).
- After re-timing, re-run the music edit decision (section 3.6). If VO moved, re-check ducking envelopes (`SOUND-*`).
- Check: each SFX onset is within ±1 frame of its bound event's visual onset in the delivered file (`ADAPT-SFX-SYNC`).

---

## 6. Cultural and regulatory adaptation (guidance, not rules)

**Cultural evidence and image fit.** Use [Cultural Context §1–6](../cultural-context/README.md) for scoped meanings, recognition dependencies and `CULTURE-LOCALE-DEPENDENCY-HANDED-OFF`. `ADAPT-CULTURE-REVIEW` owns coverage across the variant set; it consumes that evidence rather than defining universal symbol meanings. When imagery changes, use [Image Direction §4–5](../image-direction/README.md), especially `IMAGE-CROP-SURVIVES-VARIANTS`. Adaptation owns the reframing and version matrix; Image Direction evaluates asset suitability.

### 6.1 Cultural guidance (judgement only; `heuristic`)

Colour symbolism, hand gestures, numerals considered unlucky, humour, religious and calendar references, depictions of people and food: none of these travel reliably. No single primary source was gathered for this in this pass. Treat any generic list (e.g. "white means mourning in X") as folklore unless a market reviewer confirms it for the specific use. Process guidance:
- Require a **native in-market reviewer** for every new locale and for any variant whose imagery, gesture or humour changed.
- Prefer **transcreation briefs** (intent, tone, constraints, duration budget) over literal translation for headlines and VO.
- Dubbing literature itself treats sociocultural fit as a constraint: Brannon et al. cite Chaume's example where "non-visible chopsticks might be changed to a fork to adhere to sociocultural constraints". Visible items are harder, which is another reason to keep imagery parameterised (`variant.imagery`).
- **Agent pitfall:** inventing cultural rules with confidence, or applying a culture rule (e.g. "avoid red") that contradicts the brand palette (`ART-*`). Flag the question; do not resolve it alone.

### 6.2 Claims and disclaimers by market (scoped `standard` where quoted)

| Market / scope | What the source says | Implication for versions |
|---|---|---|
| **UK broadcast TV** (Ofcom-licensed; BCAP guidance) | Hold: "'Short' (9 words or fewer) captions – 0.2 seconds per word plus 2 seconds recognition time"; "'Long' (10 words or more)… plus 3 seconds". Size: preferred minimum "30 Lines" HDTV; "26 Lines" on "a single-coloured opaque block". Non-European scripts: rule of thumb "a standard of 34 lines and a minimum of 30 lines". Margin around a block: "Anything less than 6 lines above and below the super is unlikely to be adequate." Scope excludes "video-on-demand" | Cutdowns for UK TV must keep each super's full hold. A 6 s cut cannot carry a 16-word super (16 × 0.2 + 3 = 6.2 s). |
| **UK, Clearcast practice** | Helpdesk: "Superimposed text that is on 3 full lines or more will be calculated at 0.25 seconds per word, plus 3 seconds recognition time"; "Brand names are not included". Clearcast's PDF guide: "Avoid using two full lines or more… 0.25 secs per word plus 3 seconds"; "Postcodes count as two words"; supers "should not be placed in the corners or from edge-to-edge" | Two Clearcast sources disagree (two vs three full lines triggers the 0.25 s rate). Apply the stricter (two lines) until confirmed. A 2019 Clearcast note also describes "A two second extra recognition time… added to all significant information". |
| **US (FTC)** | TV policy statement: disclosure "presented simultaneously in both the audio and video"; video portion should "appear on the screen for a sufficient duration to enable it to be completely read"; "During the audio portion of the disclosure, no other sounds, including music". Online: "Display visual disclosures for a duration sufficient for consumers to notice, read, and understand"; "There is no set formula". Endorsements: "The disclosure has the best chance of being clear and conspicuous if it's included in the video itself." | No numeric floor. Use the UK formula as a conservative internal default (`heuristic` outside the UK) and keep music ducked under audio disclosures. |
| **EU** (UCPD and national rules) | Not fetched in this pass; the UK framework now cites the Digital Markets, Competition and Consumers Act 2024 for UCP provisions\[17\] | Put per-market claim lists in `BRIEF-*`; legal review per market |

**The cutdown trap:** a claim that survives into the 15 s or 6 s while its qualifier does not is the most common compliance failure in versioning. `ADAPT-DISCLOSURE-CUTDOWN` makes the pairing explicit: claims and their qualifiers are linked in the region declarations, and a version that contains one without the other fails.

---

## 7. Variant systems at scale

### 7.1 Parameterised templates and data-driven versions

- A **template** is a master scene plus a parameter schema. A **version** is one parameter record. Dynamic creative systems (Google Studio/DV360 dynamic, Meta dynamic creative) assemble variants from asset pools and feeds at serve time. Their exact current limits were not verified in this pass. VCR does the same at render time, deterministically.
- TikTok's guidance on volume (`platform`): "We suggest between 3-5 different creatives per ad group and 3-5 diversified ad groups per campaign." That gives a feel for how many genuinely *different* creatives a platform wants, as opposed to trivial permutations.
- Keep variation **meaningful**. Variants that differ only in background colour do not teach the optimiser anything and multiply QC. Define axes deliberately.

### 7.2 Version matrix

Axes (typical): `aspect` × `duration` × `locale` × `audience/variant` × `platform` (safe-zone profile, opening rules) × `audioMode` (VO / music-only / muted-optimised).

- Declare the matrix in the brief as **axes plus exclusions** (e.g. "no 6 s in `de-DE` legal-heavy variant"; "CTV only 16:9"). The expected set is the Cartesian product minus exclusions. `ADAPT-MATRIX-COMPLETE` compares it to the rendered set.
- Size discipline: 4 aspects × 4 lengths × 12 locales × 3 audiences = 576 versions. That is why QC must be automated and sampled.

### 7.3 Naming and tracking

Proposed version ID (`heuristic`, VCR proposal): `{project}_{master}@{gitShort}_{aspect}_{dur}s_{locale}_{variant}_{platform}_{paramHash8}`. Example: `acme-launch_hero@3f9c2ab_9x16_15s_de-DE_b_tiktok_a1b2c3d4`.

- Use no spaces, put the aspect as `9x16`, put the duration as the target in seconds, and use BCP 47 locale tags.
- `paramHash8` is the first 8 hex characters of SHA-256 over the canonicalised parameter JSON. Two files with the same name are then the same version, guaranteed.
- Each render writes a **manifest** (JSON sidecar) with the master commit, parameter record, resolved tokens, font files and hashes, renderer and Chromium version, fps, FFmpeg command, music edit ID, VO file hashes, frame-hash list (or a Merkle root), and check results. That makes every deliverable traceable to its master (`ADAPT-TRACE-MASTER`).

### 7.4 QC of hundreds of variants by sampling

1. **100% automated** on every version: duration, matrix, mandatory-present, text-fit, font coverage, safe zones (`TYPO-SAFE`), focal-in-frame, caption/VO alignment, loudness (`SOUND-*`), encode spec.
2. **Stratified human sample** (`heuristic`): every axis value appears at least once; plus **all extreme cells**: the longest-expanding locale × narrowest aspect × shortest duration, every RTL locale, every CJK locale, every version with a legal super, and every version that any automatic check flagged as near-threshold (within 10% of a limit).
3. **Change-based re-review**: when the master changes, diff frame hashes per version. Only versions whose frames changed need re-review, and that is guaranteed by determinism.
4. **Contact sheets**: for each sampled version, a grid of frames at every beat marker plus first and last frame, with region overlays drawn. Reviewers judge motion from the video, not from the sheet (section 10.8).

There is no published industry standard sampling rate for creative versioning QC. Classical acceptance sampling (e.g. ISO 2859) assumes homogeneous lots, and variants are not homogeneous, which is why stratification by axis matters more than a percentage.

### 7.5 Keeping a series consistent across variants

- Tokens (palette, type ramp, motion curves, durations) come from the series brief (`BRIEF-*`). A variant may override only tokens the brief marks as overridable.
- Check: resolved token values per version equal the brief values except declared overrides (`ADAPT-SERIES-CONSISTENCY`).
- Cross-variant judgement: the same beat should feel like the same moment in every aspect and locale. Review side by side: the 16:9, 9:16 and one long-locale version of the same beat in a single sheet.

---

## 8. VCR specifics: a version is new parameters

### 8.1 Parameters a scene should expose (proposal; `heuristic`)

The following is a proposal, not the current scene contract. `mandatory` and `manifest()` are not supported scene members; keep mandatory content and provenance in existing workspace records. An illustrative future extension is:

```js
window.__scene = {
  duration,            // seconds, resolved for this version
  seek(t),             // deterministic
  markers,             // [{ t, id, role, priority }]
  textBounds(),        // canvas text bounds (existing)
  params: {            // read-only echo of the version record
    aspect: "9x16", width: 1080, height: 1920, fps: 30,
    durationTarget: 15, locale: "de-DE", dir: "ltr",
    copy: "strings/de-DE.json", variant: "b",
    platform: "tiktok", audioMode: "vo", seed: 1234
  },
  regions(t) {         // all declared regions at time t, in output pixels
    return [{ id: "hero", role: "focal", bbox: [x,y,w,h], required: true, priority: 1 },
            { id: "headline", role: "text", textRole: "headline", bbox: [...], anchor: "top-start", priority: 2 },
            { id: "logo", role: "logo", bbox: [...], anchor: "bottom-center", required: true },
            { id: "legal-1", role: "legal", qualifies: "claim-1", bbox: [...] },
            { id: "cta", role: "cta", bbox: [...] }];
  },
  mandatory: [{ id: "logo", window: [13.5, 15] }, { id: "legal-1", minHold: 4.4 }],
  manifest()           // master id, commit, paramHash, token snapshot
};
```

- `regions(t)` must report **rendered** geometry (after transforms), not authoring geometry. For DOM, compute it from `getBoundingClientRect()` plus clip ancestors. For canvas, PixiJS, Konva, Two.js and three.js, the scene maintains a registry and projects bounds (three.js: project the bbox corners through the camera).
- `qualifies` links a legal region to a claim region, enabling `ADAPT-DISCLOSURE-CUTDOWN`.
- Declare a region `required: true` only if losing it is a defect. Over-declaring makes every reframe fail.

### 8.2 How a scene declares regions and anchors

- Anchors use logical sides (`start`/`end`) so RTL mirrors automatically. The frame of reference is `safe` (platform safe area from `TYPO-SAFE`) or `frame`.
- Priorities resolve collisions deterministically: the lower priority yields (move, then reflow, then shrink, then hide if `optional`).
- Alternate assets per aspect: `logo.horizontal`/`logo.stacked`, `hero.16x9`/`hero.9x16` (for Blender re-renders).
- Each aspect may define a **layout override block**. Overrides are diffs against the master layout, stored in the scene source. That is the "design per format" escape hatch inside one master.

### 8.3 Determinism and traceability

- Same parameters → same frames: no `Date.now()`, no unseeded `Math.random()`, no network fonts, no time-based autoplay. Seed every procedural element from `params.seed`.
- Locale-dependent APIs (`Intl.*`) depend on the ICU/CLDR version shipped with Chromium. Pin the Chromium version and record it in the manifest, or the "same" `de-DE` version can change when the browser updates (inference; CLDR updates are routine).
- **Verify determinism:** re-render a sample of versions and compare per-frame hashes (`ADAPT-DETERMINISM`). Exact equality is expected for CPU-rasterised paths. GPU paths (WebGL/three.js) may differ by small amounts across machines, so compare decoded frames with a perceptual tolerance and pin the GPU or use SwiftShader for reference renders.
- Never edit a delivered file. Any fix is a parameter or source change and a re-render, giving a new hash and a new manifest.

---

## 9. Measurement: what an agent can check across a version set

Summary of measurable checks (details in section 10, rules in section 15):

| Check | Rule | Core measurement |
|---|---|---|
| Matrix complete | `ADAPT-MATRIX-COMPLETE` | expected set − rendered set = ∅ |
| Duration in window | `ADAPT-DURATION-WINDOW` | decoded stream durations vs platform window |
| Mandatory elements present | `ADAPT-MANDATORY-PRESENT` | region visible ≥ window/hold in every version |
| Disclosure follows claim | `ADAPT-DISCLOSURE-CUTDOWN` | claim present ⇒ qualifier present with full hold |
| UK super hold and size | `ADAPT-SUPER-HOLD-UK`, `ADAPT-SUPER-HEIGHT-UK` | visible-at-full-opacity duration; x-height in 1080-line terms |
| Text fits in every locale | `ADAPT-TEXT-FIT-LOCALE` | scrollWidth/Height vs client box; textBounds vs box; delimiter visible |
| Pseudo-loc passes | `ADAPT-PSEUDO-EXPANSION`, `ADAPT-PSEUDO-BIDI` | same as above on pseudo copy |
| Font coverage | `ADAPT-FONT-COVERAGE` | every code point covered by the declared stack |
| Safe zones per aspect | `ADAPT-SAFE-ALL-ASPECTS` (→ `TYPO-SAFE`) | region bboxes inside the platform safe rect |
| Focal subject in frame | `ADAPT-FOCAL-IN-FRAME` | area fraction of focal bbox inside frame, per frame |
| Crop path stable | `ADAPT-CROP-PATH-STABLE` | crop-centre velocity, acceleration, direction reversals |
| Hierarchy preserved | `ADAPT-HIERARCHY-PRESERVED` | rank order of text-role sizes per aspect |
| Captions/VO aligned | `ADAPT-CAPTION-RETIME` | cue in-time vs word onset; CPS via `TYPO-CAPTION-CPS` |
| VO fits picture | `ADAPT-VO-FIT`, `ADAPT-VO-OVERRUN` | VO segment end ≤ slot end; last VO ≤ picture end |
| SFX in sync | `ADAPT-SFX-SYNC` | SFX onset − visual event onset |
| Beat-aligned cuts | `ADAPT-BEAT-RETIME` | cut frame vs nearest marker |
| Series tokens consistent | `ADAPT-SERIES-CONSISTENCY` | token diff vs brief |
| Deterministic and traceable | `ADAPT-DETERMINISM`, `ADAPT-TRACE-MASTER` | frame hashes; manifest fields |

---

## 10. How to measure in VCR

General sampling conventions:
- **Every frame** for cheap geometric checks (region bboxes from `regions(t)`, DOM overflow), at the delivery fps.
- **Marker frames plus boundaries** for expensive checks (OCR, saliency, perceptual diff): every marker t, each marker ± 1 frame, first and last frame, and every frame where a region enters or exits.
- **Decoded delivery file** for anything a viewer experiences: duration, A/V offset, legibility after `yuv420p` and platform re-encode.

### 10.1 `ADAPT-MATRIX-COMPLETE`
- **Inputs:** matrix declaration (axes + exclusions) from the brief; manifests of rendered versions.
- **Calculation:** expected = ∏ axes − exclusions; compare by canonical parameter tuple, not by filename. Also flag *unexpected* extra versions.
- **Sampling:** whole set, every run.
- **Failure modes:** exclusions written as free text; locale tags not canonicalised (`pt-br` vs `pt-BR`); stale manifests from old renders. Canonicalise BCP 47 tags and require the manifest commit = current master commit.

### 10.2 `ADAPT-DURATION-WINDOW` and `ADAPT-DURATION-FRAMES`
- **Inputs:** decoded delivery file (`ffprobe` stream durations and frame count); platform window table (section 3.1); fps.
- **Calculation:** video duration = frames / fps; audio duration from the audio stream; container duration. Pass if all three are within the window (e.g. bumper ≥ 5.000 s and ≤ 6.000 s) and |audio − video| ≤ 1 frame.
- **Sampling:** every version.
- **Failure modes:** container duration includes encoder priming or padding; AAC priming samples lengthen the audio stream slightly; edit lists in MP4 can make players and `ffprobe` disagree; VFR from screenshot timing bugs. Always encode CFR from numbered frames at the declared fps.

### 10.3 `ADAPT-MANDATORY-PRESENT` and `ADAPT-DISCLOSURE-CUTDOWN`
- **Inputs:** `mandatory` declarations; `regions(t)` sampled every frame; computed opacity (DOM `getComputedStyle` up the ancestor chain; registry opacity for canvas); rendered PNGs for a pixel-level confirmation.
- **Calculation:** for each mandatory region, visible(t) = in frame ∧ inside the safe area ∧ effective opacity ≥ 0.9 ∧ not occluded (no higher-z region covering > 10% of its bbox). Hold = longest contiguous run of visible frames / fps. Pass if hold ≥ the required hold and the run falls in the declared window. For disclosures, if any frame shows the claim region, the paired legal region must have a hold ≥ its market rule.
- **Sampling:** every frame (cheap).
- **Failure modes:** opacity animated by CSS filters or masks not reflected in computed opacity; text in canvas without registry entries; the "visible" threshold of 0.9 is a proposal. BCAP counts only "the time when it is at optimum visibility", so fades in and out do not count toward hold. Confirm with pixel contrast on sampled frames.

### 10.4 `ADAPT-SUPER-HOLD-UK` and `ADAPT-SUPER-HEIGHT-UK`
- **Inputs:** legal regions and their strings (word count, excluding brand names; postcodes count as two words per Clearcast); rendered frames scaled to 1080 lines.
- **Calculation:** required hold = 0.2 × words + (2 if words ≤ 9 else 3) s, or 0.25 × words + 3 s if the super spans ≥ 2 full lines (stricter Clearcast reading); add 2 s for significant qualifiers. Height: measure flat-topped lowercase letter height ("v", "w", "x") in output lines, scaled to 1080. Require ≥ 30 lines, or ≥ 26 on an opaque single-colour block (+4 lines for non-European scripts per BCAP rule of thumb).
- **Sampling:** each legal region's visible run; height on 3 frames per run.
- **Failure modes:** anti-aliased edge rows. BCAP says "lower amplitude lines are disregarded", so threshold rows at about 50% of peak luminance contrast. Vertical video has 1920 lines, and BCAP's scaling is defined for 1080-line HDTV, so this rule applies only to UK TV deliverables.

### 10.5 `ADAPT-TEXT-FIT-LOCALE`, `ADAPT-PSEUDO-EXPANSION`, `ADAPT-PSEUDO-BIDI`
- **Inputs:** DOM at time t (`scrollWidth > clientWidth`, `scrollHeight > clientHeight` on text containers with `overflow: hidden`; `text-overflow: ellipsis` presence); `textBounds()` for canvas text vs its declared box; rendered PNGs; pseudo-locale string tables.
- **Calculation:** overflow = any text box whose content extent exceeds its box by > 0.5 px; line count > declared max lines; ellipsis present when not allowed. For pseudo runs, also confirm both delimiters `[`…`]` are inside the box (geometry) and visible (OCR or a pixel probe at the glyph positions).
- **Sampling:** every marker frame and every frame where a text region's content or box changes (typewriter and counter animations change every frame, so sample every frame for those).
- **Failure modes:** `vcr lint` overflow runs in authoring geometry while animated transforms (scale, rotate) move text outside its box at runtime, so sample rendered geometry. Kinetic type that intentionally overflows (`expressive: true`) must be declared, or it will fail. Fonts load asynchronously: wait for `document.fonts.ready` before the first seek. Pseudo copy uses a different font (fallback) from real copy, so run pseudo *and* each real locale.

### 10.6 `ADAPT-FONT-COVERAGE`
- **Inputs:** each locale's resolved strings; declared font files (cmap tables, via fontkit or `fc-query`); Chromium's per-run font usage (DevTools `CSS.getPlatformFontsForNode`).
- **Calculation:** set(code points in strings) − ∪ cmap(declared fonts) = ∅; and platform fonts used ⊆ declared fonts.
- **Sampling:** per locale, once; plus per-node font check on marker frames.
- **Failure modes:** a cmap that covers a code point the font renders badly (missing OpenType features for Arabic or Indic shaping); emoji; combining sequences needing specific glyphs. Coverage is necessary, not sufficient. Visual review is still needed for complex scripts.

### 10.7 `ADAPT-SAFE-ALL-ASPECTS`
- **Inputs:** `regions(t)`; platform safe-zone profile per aspect from `TYPO-SAFE` (including RTL and caption-length-dependent variants, e.g. TikTok).
- **Calculation:** each text, logo, legal and CTA region bbox ⊆ safe rect (or the union of allowed rects). Report the overlap area and edge distances.
- **Sampling:** every frame.
- **Failure modes:** a safe zone that depends on the caption length that ships with the ad (TikTok), unknown at render time. Use the most restrictive profile the brief allows. Device variation: TikTok says "The safe zone may not cover all devices".

### 10.8 `ADAPT-FOCAL-IN-FRAME` and `ADAPT-CROP-PATH-STABLE`
- **Inputs:** declared focal regions (graphics) or per-shot focal annotations or detector output (footage plates); crop rectangle per frame (if cropping); rendered frames.
- **Calculation:** inFrame(t) = area(focal ∩ frame) / area(focal). Required regions need 1.0 in every frame (tolerance: a 2 px edge band). Best-effort regions need ≥ 0.9 in ≥ 95% of frames (proposal). Crop-path stability: per-shot crop-centre velocity v and acceleration a (px/frame, normalised to frame width). Flag direction reversals within 0.5 s and any |a| spikes, and require the path to be static when all focal bboxes stay within 50% of the frame over the shot (AutoFlip default logic).
- **Sampling:** every frame (geometry); detector-based checks on footage at ≥ 5 fps plus shot boundaries (AutoFlip itself analyses a thinned stream).
- **Failure modes:** detectors miss stylised or animated subjects; saliency maps favour text and faces over the intended product; a subject *intentionally* exiting frame (expressive choice) must be declared with `exitAllowed: [t0, t1]`. **Never judge motion stability from stills.** Path metrics plus video review are required.

### 10.9 `ADAPT-HIERARCHY-PRESERVED`
- **Inputs:** text regions with `textRole`; computed font size × scale (DOM) or registry size (canvas) on marker frames, per aspect.
- **Calculation:** rank roles by rendered cap height. The rank order must match the brief's order in every aspect. Also confirm that the ratio between adjacent roles stays ≥ the brief's minimum step (`TYPO-*`).
- **Sampling:** marker frames.
- **Failure modes:** expressive layouts where size is not hierarchy (e.g. a giant numeral as texture). Mark as `decorative`.

### 10.10 `ADAPT-CAPTION-RETIME`, `ADAPT-VO-FIT`, `ADAPT-VO-OVERRUN`
- **Inputs:** VO audio per locale; forced alignment (word onsets and offsets, e.g. Montreal Forced Aligner, which Brannon et al. used, or the TTS engine's timestamps); caption file; slot map (beat windows allotted to each VO line); picture end and end-card start.
- **Calculation:** caption in-time − first word onset ∈ [−3, +3] frames (Netflix-reported tolerance, `heuristic`); caption out-time ≤ last word offset + 12 frames and not over the next cue or shot rule; duration within the min/max; CPS via `TYPO-CAPTION-CPS`. VO fit: each line's speech end ≤ slot end. Overrun: last VO offset ≤ end-card start (or ≤ picture end − brief tail). Tempo change applied ≤ ±5% (proposal).
- **Sampling:** every cue and line.
- **Failure modes:** forced alignment fails on noisy, music-heavy or code-switched audio (Brannon et al. report alignment success of 80.81% for Spanish and 89.35% for German lines). TTS timestamps can drift from the actual waveform, so verify onsets with a VAD on the rendered mix.

### 10.11 `ADAPT-SFX-SYNC` and `ADAPT-BEAT-RETIME`
- **Inputs:** SFX cue list with bound event IDs; event onset times from the scene (`markers` or element state sampled per frame); onset detection on the mixed audio; music marker grid.
- **Calculation:** |SFX onset − event onset| ≤ 1 frame; each cut frame within ±1 frame of a declared music marker (where the brief requires on-beat cuts).
- **Sampling:** every cue.
- **Failure modes:** audio onsets are smeared by attack envelopes, so use the cue's scheduled time from the deterministic synth plus the A/V offset measured in the delivered file. Platform re-encode can shift A/V by a few ms, so measure on the delivered file where possible.

### 10.12 `ADAPT-SERIES-CONSISTENCY`, `ADAPT-DETERMINISM`, `ADAPT-TRACE-MASTER`
- **Inputs:** manifest token snapshot vs brief tokens; frame hashes of two renders; manifest fields.
- **Calculation:** token diff ⊆ declared overrides; per-frame SHA-256 equal (CPU paths) or SSIM ≥ 0.999 on decoded PNGs (GPU paths; proposal); manifest has all required fields and the master commit resolves.
- **Sampling:** determinism on a 5% sample per run plus every newly added axis value (proposal).
- **Failure modes:** font hinting and Chromium version drift; GPU nondeterminism; timestamps written into SVG metadata.

---

## 11. Medium-specific guidance

### 11.1 9:16 social (TikTok, Reels, Shorts)
- Author 9:16 as an *anchor* master for any campaign where vertical is primary. Don't derive it from 16:9.
- Safe zones per platform and placement come from `TYPO-SAFE`. Expect them to change with caption length (TikTok) and with RTL. Meta's Ads Guide wording (from a search snippet of Meta's page; Meta blocks fetching) is "leaving roughly 14% of the top, 35% of the bottom, and 6% on each side… free from text, logos, or other key creative elements", recorded here only so `TYPO-SAFE` can cross-check.
- The opening seconds are format-governed: TikTok TopView's "initial 3-second zoom-in takeover" adapts the creative to full screen and then re-adapts in feed, so it needs both safe zones, plus the "no plain white" first-3-seconds rule.
- Captions: up to three lines and different width and placement boxes in vertical (BBC, via secondary copy). Re-segment per aspect.
- Mostly-muted viewing: make the proposition readable without audio. Sound-led placements still need audible audio.

### 11.2 16:9
- Master for YouTube in-stream, CTV and broadcast. For CTV, Google requires 30-second non-skippable assets to be "horizontal" (Google Ads, non-skippable page).
- UK TV supers rules apply only here, for Ofcom-licensed TV.
- YouTube TV needs ±1 s precision for 30 and 60 s spots.

### 11.3 Square (1:1) and 4:5
- Derive from the nearer anchor. 1:1 from 16:9 keeps 56.25% width; from 9:16 it keeps 56.25% height. Usually recompose from 9:16 (stacked layouts survive better), but verify per project.
- YouTube Shorts accepts "square or vertical", so a 1:1 cut can double as a Short.

### 11.4 Stills (resvg, ImageMagick, sharp)
- A still per version is a single `seek(t)` at a declared `posterTime` (often the end card or the hero beat), rendered per aspect and locale. Never pick a mid-transition frame.
- Thumbnails and covers: TikTok profile images have their own safe zone ("put the key element in the center of the 66px*66px-sized image").
- Run text-fit and font coverage on stills exactly as on video.

### 11.5 Loops
- Loop versions must be seamless at every duration. Re-time so that the loop period divides the target duration in whole frames, and check the first/last frame continuity (pixel diff between frame N−1 → 0 and a typical consecutive pair).
- Localised text in loops must not change length mid-loop, and counters must format consistently.

---

## 12. The analysis/critique process (how an expert reviews a version set)

### 12.1 Ordered steps

1. **Read the matrix and brief.** Confirm the expected set, mandatory elements per length, market legal list and safe-zone profiles. Check `ADAPT-MATRIX-COMPLETE` first: missing versions are the cheapest defect to find.
2. **Check each version** with applicable implemented checks and manual inspection; record missing coverage. No matrix-wide check exists.
3. **Review the master** (16:9 or primary anchor) in motion, at speed, with sound. This is the reference.
4. **Review the anchor siblings** (e.g. 9:16) in motion, side by side with the master at the same beats: subject, hierarchy, logo, type rhythm.
5. **Review the shortest cut per anchor** (6 s/15 s): proposition clear, brand present, end card intact, music resolves, legal holds.
6. **Review the extreme locale cells:** the longest expansion, RTL, CJK and complex scripts, on the narrowest aspect and shortest duration.
7. **Review the stratified sample** with contact sheets plus playback.
8. **Listen pass:** VO fit, overruns, caption alignment, SFX sync, music edits per length (`SOUND-*` vocabulary).
9. **Write findings** with version ID, timecode (frames), rule ID, measured value vs threshold, severity, and a suggested parameter-level fix.

### 12.2 Severity guidance

| Severity | Definition | Examples |
|---|---|---|
| **Blocker** | Undeliverable or non-compliant | Duration outside the platform window; legal super missing or short-held; claim without qualifier; text clipped or tofu in any locale; matrix cell missing; required region out of frame |
| **Major** | Delivered but damages message or brand | End card shortened below the brief window; logo in unsafe UI area; hierarchy inverted; VO overruns the end card; captions > 3 frames off on several cues |
| **Minor** | Noticeable craft issue | Crop path drifts; awkward line break; music edit audible; SFX 2 frames late |
| **Note** | Taste or suggestion | Bumper could focus on a different beat; 9:16 composition could use the top third better |

### 12.3 Vocabulary (finding → measurement)

| Reviewer says | Meaning | Maps to |
|---|---|---|
| "Truncated" / "ellipsised" | Text cut off or ended with … | `ADAPT-TEXT-FIT-LOCALE` overflow > 0 or ellipsis present |
| "Clipped in the vertical" | Subject or text cut by the 9:16 frame edge | `ADAPT-FOCAL-IN-FRAME` < 1.0 or region bbox ⊄ frame |
| "Under the UI" / "behind the CTA button" | In a platform unsafe zone | `ADAPT-SAFE-ALL-ASPECTS` (`TYPO-SAFE`) |
| "Lost the end card in the 6" | End card missing or too short | `ADAPT-MANDATORY-PRESENT` hold < window |
| "Super doesn't hold" / "legal flashes" | Disclosure hold below the market rule | `ADAPT-SUPER-HOLD-UK` / `ADAPT-DISCLOSURE-CUTDOWN` |
| "Orphaned claim" | Claim survives a cut, qualifier doesn't | `ADAPT-DISCLOSURE-CUTDOWN` |
| "VO overruns the picture" / "VO runs into the end card" | Speech past slot or end | `ADAPT-VO-OVERRUN`, `ADAPT-VO-FIT` |
| "Chipmunked" / "rushed read" | TTS or VO sped up to fit | `ADAPT-VO-FIT` tempo > cap |
| "Captions early/late" / "subs hang" | Cue in/out misaligned | `ADAPT-CAPTION-RETIME` |
| "Tofu" / "boxes" / "fallback font" | Missing glyphs or wrong font | `ADAPT-FONT-COVERAGE` |
| "Mirrored the logo" / "bidi scramble" | RTL handling error | `ADAPT-RTL-MIRROR`, `ADAPT-PSEUDO-BIDI` |
| "Hierarchy flipped" | Headline smaller than secondary text | `ADAPT-HIERARCHY-PRESERVED` |
| "Floaty reframe" / "crop hunts" | Unstable crop path | `ADAPT-CROP-PATH-STABLE` |
| "Music cut, not edited" / "hard tail" | Music doesn't resolve in a cutdown | `ADAPT-MUSIC-EDIT` |
| "Off-beat cut" | Cut not on marker | `ADAPT-BEAT-RETIME` |
| "Wrong version" / "stale slate" | Manifest or name mismatch | `ADAPT-TRACE-MASTER`, `ADAPT-VERSION-ID` |

### 12.4 Reviewer-agent pitfalls
- **Over-reporting.** Fifty "minor" safe-zone grazes in decorative elements bury the one blocker. Group by rule and report decorative issues once.
- **Judging motion from stills.** Contact sheets are for locating issues. Rhythm, crop-path feel and lip sync need playback.
- **Applying UK supers rules to non-UK or non-TV deliverables** as if they were law. Outside scope, they are a conservative default, labelled `heuristic`.
- **Penalising legitimate expressive breaks** (intentional overflow, windowboxing, subject exits) that are declared in the brief or scene.

---

## 13. The creation process (brief to verification)

**Inputs per affected variant.** Recheck only research whose scope changes: audience meanings through `CULTURE-AUDIENCE-SCOPED`, time-sensitive references through `CULTURE-FRESHNESS-TRIGGER-SET`, and selected imagery through `IMAGE-PLACEMENT-FIT`. Generic claim sources and freshness come from [Domain Exploration §3](../domain-exploration/README.md); `ADAPT-CLAIMS-MARKET` consumes the shared claim registry. These are advisory handoffs, not new automatic locale gates.

1. **Brief intake.** Read `BRIEF-*`: matrix axes and exclusions, mandatory set per length, markets and legal lists, platform profiles, audio modes. If a matrix cell has no owner for its legal copy, stop and ask.
2. **Choose anchors.** Decide which aspects are authored (usually 16:9 and 9:16) and which are derived. Decide whether the bumper is a separate variant (default yes).
3. **Structure the master.** Write beats as `markers` with roles and priorities. Declare regions with anchors, priorities, `required`, `qualifies`. Put all copy in string tables. Use tokens from the brief.
4. **Pseudo-localise early.** Manually test expansion and direction on the first animatic; no pseudo-localisation automation is implemented. Fix layouts before translation.
5. **Author anchor overrides.** Write the layout override blocks for the second anchor and re-render Blender cameras per aspect where needed.
6. **Plan cutdowns.** Select beats per length. Re-time within `PACE-*`. Request music edits per length (`SOUND-*`). Pair every claim with its qualifier, and drop claims whose qualifier cannot hold in the shorter length.
7. **Localise.** Commission transcreation with *duration budgets per line* and character guidance for boxes. Generate or record VO. Align. Run the VO decision ladder (section 5.1). Regenerate captions per language and aspect.
8. **Render the matrix** deterministically with manifests and version IDs.
9. **Verify** applicable checks per version and inspect a stratified human sample. Record missing coverage and retest changes in the relevant output.
10. **Deliver** with the manifest bundle and a QC report keyed by version ID and rule ID.

---

## 14. Authoritative sources and canon

- **W3C Internationalization** articles ("Text size in translation"; bidi, `lang`, typography articles) and the layout requirement documents **JLREQ, CLREQ, KLREQ** and the Arabic/Hebrew layout requirements: the canonical public references for script-specific layout. JLREQ and the rest were not checked in this pass.
- **Unicode UAX #9 (bidi), UAX #14 (line breaking), UAX #29 (segmentation), CLDR**: what browsers implement; cite them for any per-language breaking or formatting rule (verification pending).
- **IBM Globalization guidelines** (expansion table) and **Microsoft Globalization docs** (pseudolocalization, pseudo-locales): the origin of the industry's expansion and pseudo-loc practice.
- **Netflix Timed Text Style Guides** (per-language) and **BBC Subtitle Guidelines**: the most-used subtitle specs. The BBC is notable for explicit 9:16 guidance.
- **BCAP/ASA "Use of superimposed text in television advertising"** and **Clearcast** guides: the only numeric, regulator-backed legibility and hold rules found.
- **FTC** Enforcement Policy Statement on clear and conspicuous disclosure (TV) and **.com Disclosures**: the US principle-based framework.
- **Brannon, Virkar and Thompson (TACL 2023), "Dubbing in Practice"**: the first large-scale empirical study of human dubbing. Essential for isochrony and lip-sync priorities. Also **Chaume** (dubbing theory) and **Di Giovanni and Romero-Fresco (2019)** on audience sensitivity to lip sync (cited secondhand).
- **MediaPipe AutoFlip** docs: the clearest public description of a reframing pipeline's decision logic.
- **Adobe Premiere Auto Reframe** help: the dominant commercial tool's documented behaviour and warnings.
- **Platform help centres** (Google Ads, DV360, YouTube Help, TikTok Business Help Center, Meta Ads Guide): binding but volatile, so re-check per campaign.

---

## 15. Encoding for an AI agent: rules table

| ID | Check | Threshold | Tier | Applies to |
|---|---|---|---|---|
| `ADAPT-MATRIX-COMPLETE` | Every expected matrix cell rendered; no unexpected cells | expected − rendered = ∅ | heuristic | All version sets. **Measurable** (manifests) |
| `ADAPT-VERSION-ID` | Version name encodes master, commit, axes, param hash | Matches the naming pattern; hash matches params | heuristic | All deliverables. **Measurable** |
| `ADAPT-TRACE-MASTER` | Manifest present with master commit, params, tokens, fonts, renderer, fps, encode command, audio edits, frame hashes | All fields present; commit resolves | heuristic | All deliverables. **Measurable** |
| `ADAPT-DETERMINISM` | Re-render reproduces frames | SHA-256 equal (CPU) / SSIM ≥ 0.999 (GPU; proposal) | heuristic | All browser and Blender scenes. **Measurable** |
| `ADAPT-DURATION-WINDOW` | Decoded video and audio durations inside the platform window | e.g. Google Ads bumper "6 seconds (>=5 seconds minimum)"; standard non-skippable "7 to 15 seconds"; CTV "16-30 seconds"; YouTube TV ":29 and :31"; TikTok TopView "5-60s"; Shorts "Up to 3 minutes" | platform | Per platform/surface. **Measurable** (ffprobe) |
| `ADAPT-DURATION-FRAMES` | Target expressed and delivered in whole frames; A/V lengths agree | Superseded: use `DELIVERY-DURATION-MATCH`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | All video. **Measurable** |
| `ADAPT-MANDATORY-PRESENT` | Proposition, brand, CTA/end card and declared mandatory regions visible in every version | Hold ≥ brief window at effective opacity ≥ 0.9 (proposal) | heuristic | All cutdowns. **Measurable** |
| `ADAPT-DISCLOSURE-CUTDOWN` | If a claim appears, its qualifier appears with the full market hold | claim present ⇒ qualifier hold ≥ market rule | standard (UK); heuristic elsewhere | Any version with claims. **Measurable** + legal judgement |
| `ADAPT-SUPER-HOLD-UK` | UK TV super hold | 0.2 s/word + 2 s (≤ 9 words) or + 3 s (≥ 10 words); 0.25 s/word + 3 s for multi-line supers (Clearcast; stricter two-line reading); + 2 s significant info | standard | UK Ofcom-licensed TV only. **Measurable** |
| `ADAPT-SUPER-HEIGHT-UK` | UK TV super text height in 1080-line terms | ≥ 30 lines; ≥ 26 on an opaque single-colour block; non-European scripts 34/30 (rule of thumb); ≥ 6 lines block margin | standard | UK TV only. **Measurable** |
| `ADAPT-DISCLOSURE-US` | US disclosures clear and conspicuous; audio disclosures without competing music | "sufficient duration… to notice, read, and understand"; no other sounds under audio portion (TV) | standard (principle) | US. **Judgement** + partial measurement (music ducked) |
| `ADAPT-SAFE-ALL-ASPECTS` | Text, logo, legal and CTA inside the platform safe area in every aspect | Per `TYPO-SAFE` profile (incl. RTL and caption-length variants) | platform | All social placements. **Measurable** |
| `ADAPT-FOCAL-IN-FRAME` | Focal subject stays in frame after reframe | required: 1.0 every frame; best-effort ≥ 0.9 in ≥ 95% of frames (proposal) | heuristic | Reframed versions, footage plates, 3D cameras. **Measurable** |
| `ADAPT-CROP-PATH-STABLE` | Crop path holds when possible, moves smoothly when needed | Static if all focal within 50% of frame over the shot (AutoFlip default); no reversals < 0.5 s (proposal) | heuristic | Cropped footage. **Measurable** + video judgement |
| `ADAPT-RECOMPOSE-TRIGGER` | Recompose instead of crop when required content exceeds crop width or upscale budget | required span > crop width (31.6% of 16:9 width for 9:16); upscale > 1.5× (proposal) | heuristic | Reframe planning. **Measurable** |
| `ADAPT-HIERARCHY-PRESERVED` | Text-role size order preserved across aspects | rank order equals brief order | heuristic | All multi-aspect sets. **Measurable** |
| `ADAPT-NO-BAKED-TEXT` | No copy baked into rasters or textures without per-locale assets | 0 undeclared text-bearing assets | heuristic | All localised sets. **Measurable** (asset scan + OCR) |
| `ADAPT-TEXT-FIT-LOCALE` | No overflow, clipping or unplanned ellipsis in any locale | overflow ≤ 0.5 px; lines ≤ max | heuristic (uses `TYPO-*` lint) | All locales × aspects. **Measurable** |
| `ADAPT-PSEUDO-EXPANSION` | Master passes pseudo-loc before translation | +40% (Microsoft) and tiered (IBM/W3C upper bounds; ≤ 10 chars ×3.0) with visible delimiters | platform | All masters with ≥ 1 non-source locale. **Measurable** |
| `ADAPT-PSEUDO-BIDI` | Master passes the mirrored pseudo-locale | `qps-plocm` / `en-XB` run: no overlap, anchors mirrored | platform | Any set with an RTL locale. **Measurable** + judgement |
| `ADAPT-RTL-MIRROR` | Layout mirrors; logos, media and numerals don't | Declared mirror list respected | heuristic | RTL locales. **Judgement** + partial measurement |
| `ADAPT-FONT-COVERAGE` | Every code point covered by the declared font stack; no undeclared fallback | 0 uncovered; 0 undeclared platform fonts | heuristic (owner `TYPO-FONTS`) | All locales. **Measurable** |
| `ADAPT-LINEBREAK-LOCALE` | Line breaking uses locale-aware rules; no manual `\n` in translatable strings | 0 manual breaks; `lang` set on text nodes | heuristic (pending UAX #14 / JLREQ check) | All locales. **Measurable** (lint) + judgement |
| `ADAPT-GRAPHEME-ANIMATION` | Per-character animation operates on grapheme clusters; joining scripts animate by word or line | 0 splits inside clusters; no per-letter animation in Arabic-script locales | heuristic (pending UAX #29) | Kinetic type. **Measurable** |
| `ADAPT-LOCALE-FORMAT` | Numbers, dates, currency and plurals via `Intl`/CLDR for the version locale | 0 hard-coded formats | heuristic (pending CLDR check) | All locales. **Measurable** (code lint + string scan) |
| `ADAPT-PLATFORM-TEXT-LENGTH` | Platform text fields within limits per script | TikTok account name ≤ 10 (CN/JP/KR) / ≤ 20 (others); caption ≤ 50 / ≤ 100 to avoid "See more" | platform | TikTok metadata. **Measurable** |
| `ADAPT-TOPVIEW-OPENING` | TikTok TopView opening and audio rules | No plain white in first 3 s; not completely silent; no key elements under open-screen UI | platform | TikTok TopView. **Measurable** + judgement |
| `ADAPT-BEAT-RETIME` | Cutdowns re-time beats; cuts land on markers | abs(cut − marker) ≤ 1 frame where on-beat is required; no uniform time-scale | heuristic (with `PACE-*`) | All cutdowns. **Measurable** |
| `ADAPT-MUSIC-EDIT` | Each length has a music edit that resolves | Edit points on bar/phrase grid; ending is a designed button/sting | heuristic (owner `SOUND-*`) | Versions with music. **Measurable** (grid) + listening |
| `ADAPT-VO-FIT` | Localised VO lines fit their slots without excessive tempo change | speech end ≤ slot end; tempo change ≤ ±5% (proposal) | heuristic | Localised VO. **Measurable** |
| `ADAPT-VO-OVERRUN` | VO ends before the end card / picture end | last VO offset ≤ end-card start (or brief tail) | heuristic | All VO versions. **Measurable** |
| `ADAPT-CAPTION-RETIME` | Captions regenerated from new audio alignment | in-time within ±3 frames of speech onset (secondary); min "5/6 (five-sixths) of a second", max "7 seconds" (Netflix General Requirements, `platform`); CPS per `TYPO-CAPTION-CPS` | heuristic (durations: platform) | Captioned versions. **Measurable** |
| `ADAPT-CAPTION-ASPECT` | Caption segmentation and placement per aspect | Per `TYPO-*` (BBC 9:16 rules via secondary) | heuristic | Multi-aspect captioned sets. **Measurable** |
| `ADAPT-SFX-SYNC` | SFX re-derived from bound events after re-timing | abs(SFX onset − event onset) ≤ 1 frame | heuristic | Versions with SFX. **Measurable** |
| `ADAPT-LIPSYNC` | Visible speaking mouths plausibly synced | Bilabial closures align (judgement); cut away if not | heuristic | Dubbed on-screen speech. **Judgement only** |
| `ADAPT-SERIES-CONSISTENCY` | Variant tokens match the brief except declared overrides | token diff ⊆ overrides | heuristic (owner `BRIEF-*`) | Series. **Measurable** |
| `ADAPT-SAMPLE-QC` | Human review sample covers every axis value and all extreme cells | 100% automated; sample ⊇ {each axis value, extremes, flagged near-threshold} | heuristic | Version sets > ~20. **Measurable** (coverage) |
| `ADAPT-CULTURE-REVIEW` | Native in-market review of imagery, gesture, humour, colour | Sign-off recorded per new locale/variant | heuristic | New markets. **Judgement only** |
| `ADAPT-CLAIMS-MARKET` | Claims and disclaimers match the market's legal list | 100% match to the brief's legal list | heuristic (legal) | Ads with claims. **Judgement** + presence check |

---

## 16. VCR-specific rendering and delivery notes

- **Frame-by-frame seeking.** Every version renders by seeking `t = n / fps`. Re-timed beats must land on frame boundaries: quantise marker times to frames *before* layout, or events will jitter by sub-frame amounts between versions with different fps.
- **Fixed fps across a matrix.** Mixing 25 fps (European broadcast) and 30 fps (social) versions of the same master changes frame counts and caption frame tolerances. Compute tolerances in frames of *that* version's fps.
- **Text measurement timing.** Wait for `document.fonts.ready` and locale string load before the first seek. Otherwise frame 0 renders with fallback metrics and passes or fails differently from frame 1.
- **`yuv420p` H.264.** Chroma is subsampled 2×2. Thin coloured legal text and coloured type edges lose chroma resolution, and small red-on-black supers can smear. Check legibility on decoded frames, not source PNGs. UK supers' line-height measurement must use decoded luma.
- **Odd dimensions.** `yuv420p` needs even width and height. Derived aspects (e.g. 607.5 px crops) must round to even pixels, so build crop maths on even integers.
- **ProRes 4444 alpha masters.** For partner versioning houses, deliver text-free ("textless") alpha masters plus separate text layers, so third parties can localise without re-rendering. Include the manifest.
- **Platform re-encoding.** Platforms re-encode uploads, which further softens fine type and can shift A/V by small amounts (not quantified by the platforms). Keep legal text above `TYPO-*` minimums with margin, and measure A/V on a downloaded platform copy for spot checks where possible. TikTok TopView's "Bitrate: ≥2,500kbps" is a floor for upload, not a guarantee of playback quality.
- **Audio tails.** Encoders and AAC priming can extend audio past video. For bumpers near the 6.0 s ceiling, trim audio to the video length in the mux.
- **Determinism and Chromium updates.** `Intl` output and line breaking can change with ICU/CLDR updates in Chromium. Pin Chromium per production and record it.
- **Blender.** Re-render per-aspect cameras deterministically (fixed seeds, fixed sample counts). Do not crop 16:9 renders for hero shots.

---

## 17. Master checklists

### 17.1 Analysis (reviewer)
- [ ] Matrix complete; no strays (`ADAPT-MATRIX-COMPLETE`)
- [ ] Names and manifests valid and traceable (`ADAPT-VERSION-ID`, `ADAPT-TRACE-MASTER`)
- [ ] Every duration inside its platform window, measured on decoded files (`ADAPT-DURATION-WINDOW`, `ADAPT-DURATION-FRAMES`)
- [ ] Proposition, brand and end card present in every length (`ADAPT-MANDATORY-PRESENT`)
- [ ] Every surviving claim has its qualifier with full market hold (`ADAPT-DISCLOSURE-CUTDOWN`, `ADAPT-SUPER-HOLD-UK`, `ADAPT-SUPER-HEIGHT-UK`, `ADAPT-DISCLOSURE-US`)
- [ ] Safe zones per aspect and placement (`ADAPT-SAFE-ALL-ASPECTS` → `TYPO-SAFE`)
- [ ] Focal subject in frame; crop paths stable (`ADAPT-FOCAL-IN-FRAME`, `ADAPT-CROP-PATH-STABLE`)
- [ ] Hierarchy preserved across aspects (`ADAPT-HIERARCHY-PRESERVED`)
- [ ] Text fits in every locale; no tofu; correct breaking; bidi correct (`ADAPT-TEXT-FIT-LOCALE`, `ADAPT-FONT-COVERAGE`, `ADAPT-LINEBREAK-LOCALE`, `ADAPT-RTL-MIRROR`, `ADAPT-GRAPHEME-ANIMATION`)
- [ ] Locale formats correct (`ADAPT-LOCALE-FORMAT`)
- [ ] VO fits; no overruns; captions aligned and re-segmented per aspect (`ADAPT-VO-FIT`, `ADAPT-VO-OVERRUN`, `ADAPT-CAPTION-RETIME`, `ADAPT-CAPTION-ASPECT`)
- [ ] SFX and cuts on their events and beats; music edits resolve (`ADAPT-SFX-SYNC`, `ADAPT-BEAT-RETIME`, `ADAPT-MUSIC-EDIT`)
- [ ] Series tokens consistent (`ADAPT-SERIES-CONSISTENCY`)
- [ ] Platform-specific rules (`ADAPT-TOPVIEW-OPENING`, `ADAPT-PLATFORM-TEXT-LENGTH`)
- [ ] Sample covers every axis value and the extremes; reviewed in motion with sound (`ADAPT-SAMPLE-QC`)
- [ ] Cultural and legal sign-offs recorded (`ADAPT-CULTURE-REVIEW`, `ADAPT-CLAIMS-MARKET`)

### 17.2 Creation (author)
- [ ] Matrix, exclusions, mandatory set, markets and legal lists read from `BRIEF-*`
- [ ] Anchors chosen; bumper authored as its own variant
- [ ] Version parameters, required content and provenance recorded in the workspace; use supported scene members where applicable
- [ ] Regions declare anchors (logical sides), priorities, `required`, `qualifies`
- [ ] All copy in string tables; no baked text (`ADAPT-NO-BAKED-TEXT`)
- [ ] Pseudo passes (+40%, tiered, mirrored) clean before translation (`ADAPT-PSEUDO-EXPANSION`, `ADAPT-PSEUDO-BIDI`)
- [ ] Recompose decisions made by rule (`ADAPT-RECOMPOSE-TRIGGER`)
- [ ] Cutdowns re-timed per beat, music edited per length (`ADAPT-BEAT-RETIME`, `ADAPT-MUSIC-EDIT`)
- [ ] Translations commissioned with duration budgets; VO ladder applied (`ADAPT-VO-FIT`)
- [ ] Captions regenerated from alignment per language and aspect (`ADAPT-CAPTION-RETIME`, `ADAPT-CAPTION-ASPECT`)
- [ ] SFX bound to events (`ADAPT-SFX-SYNC`)
- [ ] Deterministic render with pinned Chromium, fonts and seeds; manifests written (`ADAPT-DETERMINISM`, `ADAPT-TRACE-MASTER`)
- [ ] Applicable checks and human sample reviewed; missing coverage recorded and affected output retested

---

## 18. Caveats

- **Platform specs conflict and move.** Google's bumper wording differs between Google Ads ("6 seconds (>=5 seconds minimum)") and DV360 ("6 seconds or shorter"). Non-skippable is "7 to 15" on one page and "15-60" on another. TikTok's TopView page was "Last updated: October 2026". Secondary sources disagree on TikTok in-feed maximums (60 s vs 10 minutes); this pass did not fetch the primary in-feed page. Re-check before each campaign.
- **Expansion tables disagree.** W3C's "51–70 | 151-170%" conflicts with IBM's current "31 to 40%" additional. This report uses IBM's row in the tiered pseudo profile. All expansion tables are averages for English into *European* languages. They do not predict CJK, Arabic or Indic behaviour, which is dominated by glyph width and line height.
- **Clearcast sources disagree** on whether two or three full lines trigger the 0.25 s/word rate. The stricter reading is applied.
- **Netflix language-specific pages could not be fetched** (JavaScript app). Netflix reading-speed and line-length numbers here come from search snippets of Netflix pages and from secondary summaries, and secondary sources contradict each other (some claim 17 CPS adult English, the Netflix snippet says "Up to 20"). Marked `unverified`. The general-requirements event durations (5/6 s minimum, 7 s maximum) were confirmed on Netflix's Partner Help Center by the enrichment pass.
- **BBC Subtitle Guidelines were read via a third-party copy** (v1.2.3, June 2024). The live page may be newer (one source cites v1.2.5, March 2026).
- **Meta pages block fetching.** The safe-zone wording came from a search snippet of Meta's own page. The "bottom 40% with a disclaimer" rule appears only in third-party blogs and is unverified.
- **Unicode and W3C layout standards (UAX #9/#14/#29, CLDR, JLREQ/CLREQ/KLREQ) were not fetched** in this pass. Rules depending on them are `heuristic` until verified.
- **Auto-reframe reliability is unquantified** by vendors. Evidence is warnings and anecdotes.
- **Cultural guidance is weakly sourced** here by design: it is guidance, not rules, and requires in-market reviewers.
- **VCR proposals** (±5% tempo cap, 0.9 opacity visibility threshold, SSIM 0.999, 1.5× upscale trigger, 95%/0.9 best-effort focal rule, sampling rules) are untested defaults. Calibrate them on real productions and promote or revise.
- **Audience evidence is thin.** The only audience-side findings here are Di Giovanni and Romero-Fresco (via Brannon et al.), the ITC 1996 superimposed-text research summarised by the ASA (longer holds improved "recognition, comprehension and recall"), and Google's vendor-published bumper findings: "Nearly 9 in 10 bumper campaigns drove a significant lift in Ad Recall" (Google Brand Lift Meta Analysis, Global, 2017) and the Google/Ipsos 2018 sequencing experiment. Most adaptation practice is expert taste.

---

## 19. Verification ledger (checked 2026-11-06)

| Claim | Result | Checked against |
|---|---|---|
| AutoFlip support ended "as of March 1, 2023"; "only works with OpenCV 3" | confirmed (page fetched) | MediaPipe AutoFlip docs (readthedocs) |
| AutoFlip `motion_stabilization_threshold_percent` "0.5 = 50%… then the camera is held steady" | confirmed | MediaPipe AutoFlip docs |
| AutoFlip padding when required features "cannot be all covered" | confirmed | MediaPipe AutoFlip docs |
| AutoFlip analysis stream `target_width: 480`, thinner `period: 200000` (≈5 fps) | confirmed (values); ≈5 fps is an inference from microseconds | MediaPipe AutoFlip graph |
| Premiere "creates a duplicate sequence with the correct dimensions"; "results may not be great if the action is very fast" | confirmed via search-result text of the Adobe page (full fetch returned navigation only) | Adobe Premiere Help, Add Auto Reframe effect to sequences |
| Auto Reframe "does not work with still images" | confirmed (secondary practitioner) | Larry Jordan article |
| 9:16 from 1080p = "607x1080" | confirmed (forum, secondary); matches arithmetic | Adobe Community thread |
| Bumper max "6 seconds (>=5 seconds minimum)"; non-skippable "15-60 seconds (depending on the campaign subtype)"; skippable "No max length ( <3 min recommended)"; Shorts "<60 seconds recommended" | confirmed (page fetched) | Google Ads Help, About video ad formats |
| "Bumper ads: Videos up to 6 seconds long"; "Standard non-skippable: Videos between 7 to 15 seconds long"; "30-second non-skippable (CTV): Videos 16-30 seconds long"; "30 seconds (or shorter)" | confirmed (page fetched) | Google Ads Help, Non-skippable in-stream ads |
| YouTube TV "a 30-second ad must be between :29 and :31 seconds long" | confirmed via search-result text of the Google page | Google Ads Help, About YouTube TV ad formats |
| DV360 "Videos must be 6 seconds or shorter" | confirmed via search-result text; **contradicts** the Google Ads 5 s floor | DV360 Help, Bumper ad campaigns |
| Bumper wording changed ~Sept 2026 | unverified (secondary blog only) | Nordlys blog |
| "Nearly 9 in 10 bumper campaigns drove a significant lift in Ad Recall" (Google Brand Lift Meta Analysis, Global, 2017); the "122 US… over 9 in 10" version | confirmed for Google's wording (enrichment pass); the 122-campaign version is unverified and does not match | Create with Google, "YouTube Bumper Ads" PDF (2021); Nordlys blog |
| Google/Ipsos 2018: three six-second ads vs single :30, lifts "107% and 134%" | confirmed (enrichment pass; vendor-published) | Create with Google, "YouTube Bumper Ads" PDF |
| "Bumpers work best when they are specifically built for the six-second format" | confirmed (enrichment pass) | Create with Google, "YouTube Bumper Ads" PDF |
| Shorts "Up to 3 minutes", "square or vertical aspect ratio"; categorisation from October 15, 2024 | confirmed (fetched by research subagent) | YouTube Help, Upload Shorts; Understand three-minute Shorts |
| TikTok TopView "5-60s, recommend 9-15s"; "≥540*960px"; "≥2,500kbps"; safe zone depends on caption length; LTR/RTL files; "In-feed safe zone is more restrictive"; no plain white first 3 s; not completely silent; name 10/20 chars; captions 50/100 | confirmed (page fetched; "Last updated: October 2026") | TikTok Business Help Center, TopView ad specifications |
| TikTok "3-5 different creatives per ad group" | confirmed via search-result text of TikTok page | TikTok, Creative best practices |
| Meta "roughly 14% of the top, 35% of the bottom, and 6% on each side" | unverified (fetch blocked by robots; search snippet of Meta page only) | Meta Ads Guide, Instagram Reels |
| Meta "bottom 40% with disclaimer" | unverified (third-party blogs only) | — |
| IBM tiers via W3C ("Up to 10 | 200–300%" … "Over 70 | 130%") | confirmed (page fetched) | W3C i18n, Text size in translation |
| IBM "Additional space required" "51 to 70 | 31 to 40%" | confirmed via search-result text; **contradicts** the W3C 51–70 row | IBM Docs, Text translation design |
| Microsoft "lengthen the text by 40%"; "200% or even 400%"; qps-ploc/plocm/ploca; en-XA/en-XB | confirmed (page fetched) | Microsoft Learn, Pseudolocalization |
| Adobe Spectrum "Up to 10 | 300%"; "11 to 20 | 200%" | confirmed via search-result text | Adobe Spectrum, Internationalization |
| Thai "around 150% of the vertical space" | confirmed (image description on fetched page) | W3C i18n, Text size in translation |
| Netflix English "Adult programs: Up to 20 characters per second"; "42 characters per line" | unverified (fetch failed, JS app; search snippet of Netflix page shows these) | Netflix English (US) TTSG |
| Netflix Traditional Chinese "16 characters per line"; "Up to 9 characters per second" | unverified (not fetched; search snippet of Netflix page) | Netflix Partner Help |
| Netflix min "5/6 (five-sixths) of a second", max "7 seconds" per event | confirmed (enrichment pass, primary) | Netflix Partner Help Center, Timed Text Style Guide: General Requirements |
| Netflix "within three frames", "12 frames" | unverified (secondary only; not on the current general page) | 3Play Media summary |
| BBC 9:16: "90% of the width of a vertical 9:16 video"; three lines; "central 75% vertically and the central 90% horizontally" | unverified at primary (fetch not permitted); confirmed in third-party copy v1.2.3 | broadcastwriter.com copy of BBC guidelines |
| BBC 160–180 wpm | unverified (secondary paraphrases only) | Clevercast and others |
| BCAP hold "0.2 seconds per word plus 2 seconds" (≤ 9 words) / "plus 3 seconds" (≥ 10 words) | confirmed via ASA guidance text (search) and Clearcast helpdesk | ASA/BCAP superimposed text guidance; Clearcast |
| BCAP heights "30 Lines" / "26 Lines"; non-European "34… 30"; "6 lines" margin; VOD out of scope | confirmed (page fetched) | BCAP "Use of superimposed text in television advertising" (0425) |
| Clearcast 0.25 s/word + 3 s at "3 full lines" vs "two full lines or more" | **contradicted** between two Clearcast sources | Clearcast helpdesk; Clearcast Superimposed Text Guide 2023 |
| FTC TV: simultaneous audio and video; "sufficient duration to enable it to be completely read"; no other sounds | confirmed via search-result text of the FTC PDF | FTC Enforcement Policy Statement |
| FTC online: "duration sufficient for consumers to notice, read, and understand"; "There is no set formula" | confirmed via search-result text of the FTC PDF | FTC .com Disclosures |
| Brannon et al.: 319.57 h, 54 titles; naturalness over isometry and lip sync; don't vary speaking rate; MFA alignment 89.35% de / 80.81% es | confirmed (paper fetched) | arXiv 2212.12137 (TACL 2023) |
| Di Giovanni and Romero-Fresco (2019): audiences less sensitive to lip sync | unverified (reported secondhand in Brannon et al.) | — |
| UAX #9 / #14 / #29, CLDR, JLREQ/CLREQ/KLREQ details | not found / not checked in this pass | — |
| Meta/Google dynamic creative asset limits | not found in this pass | — |
| Per-market dubbing vs subtitling preferences | not checked in this pass | — |

## 20. Sources

1. [Non-skippable in-stream ads - Google Ads Help](https://support.google.com/google-ads/answer/11462260?hl=en)
2. [Text size in translation](https://www.w3.org/International/articles/article-text-size.en.html)
3. [Dubbing in Practice: A Large Scale Study of Human Localization With Insights for Automatic Dubbing](https://arxiv.org/pdf/2212.12137)
4. [Legal Supers - Our Helpful Tools - Welcome to our Help Desk](https://help.clearcast.co.uk/en/article/legal-supers-our-helpful-tools)
5. [On screen text and subtitling in TV ads Advertising Guidance (broadcast)](https://www.asa.org.uk/static/uploaded/f7485afe-dcce-4b13-b4870b492e40dabe.pdf)
6. [1 The FTC's Revised .com Disclosures Guide:](https://www.venable.com/files/Event/02f817c8-175e-401c-a4be-eeb70c8283cd/Presentation/EventAttachment/b25f697e-d69c-4aa7-9786-ff7359175ce5/The_FTCs_Revised_com_Disclosures_Guide_What_Third_Party_Advertisers_and_Lead_Generators_Need_to_K.pdf)
7. [Federal Trade Commission](https://www.ftc.gov/system/files/documents/plain-language/bus41-dot-com-disclosures-information-about-online-advertising.pdf)
8. [layout: forward target: https://developers.google.com/mediapipe/solutions/guide#legacy title: AutoFlip (Saliency-aware Video Cropping) parent: MediaPipe Legacy Solutions nav\_order: 14 — MediaPipe v0.7.5 documentation](https://mediapipe.readthedocs.io/en/latest/solutions/autoflip.html)
9. [Auto Reframe: Convert a Horizontal Timeline to Vertical in Adobe Premiere Pro](https://larryjordan.com/articles/auto-reframe-convert-a-horizontal-timeline-to-vertical-in-adobe-premiere-pro/)
10. [Add Auto Reframe effect to sequences in Premiere](https://helpx.adobe.com/premiere/desktop/add-video-effects/commonly-used-effects/add-auto-reframe-effect-to-a-sequence.html)
11. [Bumper ad campaigns - Display & Video 360 Help](https://support.google.com/displayvideo/answer/7245674?hl=en)
12. [About video ad formats - Google Ads Help](https://support.google.com/google-ads/answer/2375464?hl=en)
13. [TopView ad specifications](https://ads.tiktok.com/resources/help/article/tiktok-reservation-topview)
14. [Specifications for TikTok Interactive: Download Card](https://ads.tiktok.com/resources/help/article/tiktok-interactive-add-on-download-card-ad-specifications)
15. [Text translation design - IBM Documentation](https://www.ibm.com/docs/en/i/7.6.0?topic=interfaces-text-translation-design)
16. [Pseudolocalization - Globalization](https://learn.microsoft.com/en-us/globalization/methodology/pseudolocalization)
17. <https://www.asa.org.uk/static/d0048ae3-1bc3-42b4-baebcda68b7bac88/Superimposed-text-BCAP-Guidance-0425.pdf>
18. [Internationalization & Localization · UX Encyclopedia](https://ux.detroit3d.com/accessibility/internationalization.html)
19. [Internationalization Best Practices for Spec Developers](https://w3c.github.io/bp-i18n-specdev/)
20. [(PDF) Exploring the Modalities of Audiovisual Translation: Focus on Dubbing and Subtitles](https://www.researchgate.net/publication/392077077_Exploring_the_Modalities_of_Audiovisual_Translation_Focus_on_Dubbing_and_Subtitles)
