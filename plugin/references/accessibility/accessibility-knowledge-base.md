# Accessibility for Motion Graphics and Short-Form Video: VCR Knowledge Base (A11Y pillar)

Flashing has published thresholds and warrants full-sequence analysis. Motion can also cause physical symptoms. WCAG and broadcast profiles differ; passing an analysis is scoped to its profile and display assumptions, not a guarantee for every viewer. See [W3C flash guidance](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) and [motion guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). VCR has no implemented `A11Y-*` analyser; a future automatic gate needs validation against a reference analyser. Captions, contrast, colour distinguishability and audio description need their own checks and judgement.

> **Status.** Scope: accessibility for code-first motion graphics, kinetic typography, short-form social video (9:16, 16:9, 1:1), loops and stills produced by VCR. The pillar seeds `rules.json` (prefix `A11Y-`), automatic checks (`vcr lint` and post-render analysers) and an `a11y-reviewer` subagent. It cross-references, and does not restate, the typography pillar's caption profiles (`TYPO-*`).
> **Confidence tiers.** `standard`: a published standard or style guide, checked against the primary source. `platform`: published by a platform or vendor, and may change without notice. `heuristic`: a practitioner rule of thumb, a secondary source, or a VCR-derived engineering default.
> **Evidence labels.** **[audience]** marks evidence about what viewers actually do or experience (studies, platform data, clinical data). **[expert]** marks expert consensus or taste.
> **Research date:** 2026-11-06. Where a primary page could not be fetched, the claim is marked `unverified` in the ledger (section 21).

## TL;DR

- **Flash thresholds need a validated analyser before automatic gating.** WCAG 2.3.1 (Level A) fails content that flashes more than three times in any one-second period, unless the flashing is below the general flash and red flash thresholds.\[2\] A general flash is a pair of opposing relative-luminance changes of 10% or more where the darker state is below 0.80.\[3\] The area allowance is 25% of any 10-degree visual field (341 × 256 CSS px).\[1\]\[4\] ITU-R BT.1702-3 uses 20 cd/m², 25% of the screen and the same three-flash rule.\[5\]\[6\] Run it on the decoded delivery file and on loop seams.
- **Captions are mandatory for any speech or meaningful sound, and "accurate" means more than words.** WCAG 1.2.2 (Level A) requires captions for prerecorded audio.\[2\] FCC caption-quality rules (accuracy, synchronicity, completeness, placement) bind US TV programming only, but they are the best published quality vocabulary.\[7\]\[8\] Music-only and SFX-led pieces still need sound tags when the sound carries meaning (DCMP Captioning Key).\[9\]\[10\]
- **Silent or text-only motion is not exempt.** Video with no audio falls under WCAG 1.2.1, which requires a text alternative or an audio track.\[2\] Video whose on-screen text and visuals carry information not in the soundtrack needs audio description (1.2.5, AA) or a full text alternative (1.2.3, A). If the audio already conveys all the important visual information, no description is needed.\[11\]\[12\]
- **Motion sickness has no numeric standard.** WCAG 2.2.2 (pause control for auto-starting motion lasting more than five seconds, shown in parallel with other content) and 2.3.3 (interaction-triggered motion can be disabled, AAA) are web-player rules.\[2\]\[13\]\[14\] For rendered video, VCR's lever is a **reduced-motion variant** plus heuristic motion-intensity checks. Every motion threshold in this pillar is `heuristic`.
- **Colour and contrast checks work on frames but need judgement.** Use WCAG 1.4.3 (4.5:1 text, 3:1 large text), 1.4.11 (3:1 for meaningful graphics) and 1.4.1 (never colour alone).\[2\] Simulate CVD with Viénot 1999 for protan and deutan types and Brettel 1997 for tritan, then check that encoded categories stay distinguishable.\[15\]\[16\]\[17\] Frame sampling can understate the worst case over moving backgrounds.
- **The law follows the service, not the clip.** The EAA has applied since 28 June 2025 to consumer services such as e-commerce and audiovisual-media access, with EN 301 549 as the benchmark. ADA Title II's web rule (WCAG 2.1 AA) now has compliance dates of 26 April 2027 and 26 April 2028. ADA Title III has no web regulation but is enforced through lawsuits.\[12\] For most social shorts, accessibility is good practice plus platform policy, not statute. Placing the same video on a covered service changes that.
- **Platform auto-captions are a draft, not a deliverable.** YouTube itself warns that automatic caption "quality … may vary".\[18\] Instagram Reels have no alt-text field.\[19\] X needs an uploaded `.srt` for closed captions.\[20\]\[21\] Ship verified captions (burned-in for muted-first feeds, plus sidecar where the platform accepts one) and write your own alt text.

## Key findings

1. **The WCAG flash definition is exact and testable.** Its parts are: "a pair of opposing changes in relative luminance of 10% or more of the maximum relative luminance (1.0) where the relative luminance of the darker image is below 0.80"; a combined flashing area of no more than ".006 steradians within any 10 degree visual field … (25% of any 10 degree visual field on the screen)"; a 341 × 256 px reference rectangle at 1024 × 768; and, since 2.2, "87,296 CSS pixels". Source: W3C, Understanding SC 2.3.1 (updated 17 September 2025).\[1\]
2. **WCAG 2.2 replaced the red-flash definition.** A red flash is now a pair of opposing transitions where one transition goes "to or from a state with a value R/(R + G + B) that is greater than or equal to 0.8, and the difference between states is more than 0.2 (unitless) in the CIE 1976 UCS chromaticity diagram".\[1\] The older "(R-G-B)x320 > 20" formula is obsolete.\[22\]\[23\] Source: W3C Understanding 2.3.1, citing ISO 9241-391.
3. **The broadcast rule adds absolute luminance, patterns and duration.** ITU-R BT.1702-3 (11/2023) sets a flash at "a difference of 20 cd/m2 or more" when the darker image is below 160 cd/m², and above that at 1/17 Michelson contrast (HDR only). Flashing must not exceed 25% of the screen together with "more than three flashes … within any one-second period". It notes that sequences "lasting more than five seconds might constitute a risk even when it complies". It flags stripe patterns of "more than five light and dark pairs" over 40% of the screen (stationary) or 25% (moving).\[6\] Source: ITU-R BT.1702-3.\[6\]
4. **Analyse loops while looping and at full screen.** W3C: "For short clips that might be looped (such as GIF animations), the content should be analyzed while looping," and video "should be analyzed for risks at full screen."\[1\] Source: W3C Understanding 2.3.1.
5. **Captions must include non-speech information.** WCAG Understanding names "captions omitting some dialogue or important sound effects" as failure F8.\[12\] DCMP requires bracketed, lowercase sound descriptions that include the source, and says not to caption background music shorter than 5 seconds.\[9\]\[10\] Sources: W3C failure F8 (via alugha, secondary); DCMP Captioning Key.
6. **Reading-rate standards differ by audience and by unit.** BBC: 160–180 wpm (secondary sources; BBC page not fetched). DCMP educational: 130, 140 and 160 wpm by level, and 150–160 wpm for adult special-interest media. Netflix's English (USA) Timed Text Style Guide (§II.17, "Reading Speed Limits") sets "Adult programs: Up to 20 characters per second / Children's programs: Up to 17 characters per second". No legal reading-rate threshold exists.\[8\]\[24\] Sources: DCMP; Netflix Partner Help Center; secondary compilations.
7. **Audio description is only waived when the soundtrack already carries the visuals.** W3C: "if all of the important information in the video track is already conveyed in the audio track, no additional audio description is necessary."\[11\]\[12\]\[25\] Kinetic typography set to music without narration fails this test by default. Source: W3C Understanding 1.2.3/1.2.5.
8. **CVD simulation is approximate, and the model must match the deficiency type.** DaltonLens's review recommends Brettel 1997 for tritanopia and Viénot 1999 (or Machado 2009) for protanopia and deuteranopia, and calls all of them "approximate mathematical models".\[15\]\[17\] A 2025 PMC review, "A Global Perspective of Color Vision Deficiency", reports "red–green CVD affecting up to 8% of males and 0.5% of females of Northern European descent". Sources: DaltonLens; PMC12385717 (2025).
9. **The EAA's video duty is scoped by service and date.** Under Article 2(4) the Act "does not apply" to "pre-recorded time-based media published before 28 June 2025". EN 301 549 V3.2.1 (WCAG 2.1) remains the cited standard; V4.1.1 (WCAG 2.2) was published in September 2026 and awaits citation.\[12\] Source: alugha EAA explainer (secondary, quotes the Directive).
10. **ADA Title II dates moved.** DOJ's Interim Final Rule (effective 20 April 2026) moved compliance for entities serving 50,000 or more people "from April 24, 2026, to April 26, 2027".\[26\] Smaller entities moved to 26 April 2028. The technical standard remains WCAG 2.1 AA.\[27\] Source: Federal Register, 20 April 2026.

---

## 1. Photosensitivity (flashing, red flash, patterns)

### 1.1 Who is affected and why it is the top priority
- **[audience]** Epilepsy Action's "Photosensitive epilepsy" page (updated 6 January 2026) states: "Photosensitive epilepsy affects around 1 in 4000 people overall… Only around 3 to 5 in every 100 (3 to 5%) people with epilepsy will have photosensitive epilepsy." ITU-R BT.1702-3 Annex 5: "photosensitivity is reported as most prevalent among children and young people below the age of 20 years".\[6\] That is the core audience of TikTok, Reels and Shorts.
- **[audience]** Risk rises "if viewed in a darker room; on a brighter or larger screen; or if the viewer is closer to the screen" (ITU-R BT.1702-3 Annex 5).\[6\] A phone held at 25–35 cm in bed is close to that worst case.
- W3C: "Flashing … cannot be allowed even for a second or it could cause a seizure. And turning the flash off is also not an option since the seizure could occur faster than most users could turn it off."\[1\] Pause controls do not mitigate flashing.

### 1.2 WCAG 2.3.1 and 2.3.2 (exact text)
- **2.3.1 Three Flashes or Below Threshold (Level A):** "Web pages do not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds."
- **2.3.2 Three Flashes (Level AAA):** "Web pages do not contain anything that flashes more than three times in any one second period." There are no area or brightness exemptions.
- **Flash:** "a pair of opposing changes in relative luminance that can cause seizures in some people if it is large enough and in the right frequency range".
- **General flash and red flash thresholds.** Content passes if any of the following are true:
  - "there are no more than three general flashes and / or no more than three red flashes within any one-second period; or"
  - "the combined area of flashes occurring concurrently occupies no more than a total of .006 steradians within any 10 degree visual field on the screen (25% of any 10 degree visual field on the screen) at typical viewing distance"
- **General flash:** "a pair of opposing changes in relative luminance of 10% or more of the maximum relative luminance (1.0) where the relative luminance of the darker image is below 0.80; and where 'a pair of opposing changes' is an increase followed by a decrease, or a decrease followed by an increase".
- **Red flash:** "any pair of opposing transitions involving a saturated red". The WCAG 2.2 working definition is quoted under Key findings, item 2. The formula: chromaticity difference `SQRT((u'1 − u'2)^2 + (v'1 − v'2)^2)` with `u' = 4X/(X + 15Y + 3Z)` and `v' = 9Y/(X + 15Y + 3Z)`, where X, Y and Z come from linear sRGB through the matrix given on the W3C page.
- **Exception:** "Flashing that is a fine, balanced, pattern such as white noise or an alternating checkerboard pattern with 'squares' smaller than 0.1 degree (of visual field at typical viewing distance) on a side does not violate the thresholds."
- **Transition (Note 2):** "the change in relative luminance … between adjacent peaks and valleys in a plot of relative luminance … against time. A flash consists of two opposing transitions."
- **Area reference (Note 1):** "using a 341 x 256 pixel rectangle anywhere on the displayed screen area when the content is viewed at 1024 x 768 pixels will provide a good estimate of a 10 degree visual field". The Intent section adds: "the combined area of flashing becomes 341 x 256 CSS pixels, or a flashing area of 87,296 CSS pixels."
- **HDR and non-sRGB content.** "the industry standard definition of a general flash is a change in luminance of 20 cd/m2 or more where the darker image is below 160 cd/m2 … For HDR content when the darker state is 160 cd/m2 or more, a general flash is one where the Michelson contrast is 1/17 or greater."
- **Relative luminance:** L = 0.2126 R + 0.7152 G + 0.0722 B on linearised sRGB. The linearisation threshold is 0.04045; it was 0.03928 before May 2021, which "has no practical effect".
- **Dithering:** "For colors that are dithered at the source, the average values of the colors that are dithered should be used."
- **Tools:** "no tool is necessary to evaluate for this condition if flashing is less than or equal to 3 flashes in any one second."

### 1.3 Broadcast guidance: ITU-R BT.1702-3 and Ofcom
- **ITU-R BT.1702-3 (11/2023), Guideline 1.** A potentially harmful flash is "a pair of opposing changes in luminance". It is triggered "When screen luminance of the darker image is below 160 cd/m2 … a difference of 20 cd/m2 or more". For HDR above 160 cd/m², the trigger is "more than 1/17 Michelson contrast". Separately: "Irrespective of luminance, a transition to or from a saturated red is also potentially harmful."
- **Area and rate.** "Isolated single, double, or triple flashes are acceptable, but a sequence of flashes is not permitted when both the following occur: the combined area of flashes occurring concurrently occupies more than 25% of the displayed … screen area; and there are more than three flashes (i.e. six changes in luminance …) within any one-second period."
- **Spacing safe harbour.** "successive flashes for which the leading edges are separated by 360 ms or more are acceptable in a 50 Hz environment or separated by 334 ms or more are acceptable in a 60 Hz environment, irrespective of their brightness or screen area."
- **Cuts.** "Rapidly changing image sequences (for example, fast cuts) are provocative if they result in areas of the screen that flash." This is directly relevant to beat-synced edits.
- **Duration.** "a sequence of flashing images lasting more than five seconds might constitute a risk even when it complies with the guidelines above." No standard gives a threshold for extended flashing. The 2024 ACM/TRACE gap analysis reports that three standards mention it "but none give any thresholds" (search snippet; full text not fetched).
- **Assumed displays.** SDR peak white "200 cd/m2" and HLG "1 000 cd/m2" (Notes 2–3). On an SDR display, the 20 cd/m² trigger is therefore 10% of peak white, consistent with WCAG's 10%.
- **Measurement framework.** Annex 3 includes motion estimation and compensation "to reduce spurious detection due to panning and object motion" (reported by the ACM gap analysis; the Annex 3 flowchart is a figure in the PDF). HardingFPA documentation also describes motion and noise compensation.
- **Ofcom.** Broadcasting Code Rule 2.12 requires broadcasters to "take precautions to maintain a low level of risk to viewers who have photosensitive epilepsy". A warning replaces compliance only where it is "not reasonably practicable to follow the Ofcom guidance" and the content is "editorially justified". The Ofcom Guidance Note (re-issued 25 July 2005, Annex 1 of the Section 2 guidance notes) uses the same 20 cd/m² trigger. Ofcom has found breaches against the BBC: the 2007 London 2012 logo animation, and *The Voice UK* live final. **[audience]** These breaches followed viewer complaints, including one from the epilepsy charity.\[28\]\[29\]

### 1.4 Patterns (spatial frequency)
- **ITU-R BT.1702-3 Guideline 2.** "light and dark pairs of clearly discernible stripes in any orientation … parallel or radial, curved or straight, and may be formed by rows of repetitive elements such as polka dots. If the stripes change direction, oscillate, flash or reverse in contrast they are more likely to be harmful".
- **Attachment 1 (informative, "used by some administrations"):** "more than five light and dark pairs of clearly discernible stripes" when either "the stripes are stationary and the pattern occupies more than 40% of the displayed screen area" or "the stripes change direction, oscillate, flash, or reverse in contrast and the pattern occupies more than 25%". The luminance difference must meet the flash threshold. Exemption: "If the patterns obviously flow smoothly across, into, or out of the screen in one direction they are exempt from restriction."
- WCAG has no pattern criterion. Pattern rules are therefore `standard` (ITU) for broadcast and `heuristic` for web and social.
- **Motion-graphics triggers:**
  - op-art backgrounds;
  - halftone and dot grids;
  - scanline and CRT overlays;
  - zebra or stripe wipes;
  - radial "hypno" spirals;
  - moiré from fine patterns after downscaling (platform re-encodes create new moiré).

### 1.5 Tools
- **PEAT** (Trace Center, University of Maryland): free, version 1.6, Windows. The licence states: "Use of PEAT to assess material commercially produced for television broadcast, film, home entertainment, or gaming industries is prohibited." Its core is a proprietary analysis engine licensed from Cambridge Research. TRACE reports a new open-source version is in development. PEAT requires GPU acceleration to be turned off when capturing a browser.
- **Harding FPA** (Cambridge Research Systems): commercial and proprietary, the broadcast "gold standard", and a certification route.
- **Commercial QC suites** (for example BATON) implement Ofcom, NAB-J and ITU profiles (secondary source).\[30\]
- **VCR implication.** Commercial ad and title work may not use PEAT under its licence. Use an in-house analyser (section 17) for continuous checks, and HardingFPA for broadcast certification.

### 1.6 Expressive work
- Strobes, glitch cuts and beat-flashes are legitimate aesthetics. A break **succeeds** when one of these holds:
  1. the flashing area stays under the area threshold (a small strobe inside a frame, not a full-frame white flash);
  2. luminance swings stay under 10% of maximum relative luminance or 20 cd/m² (for example, shifting hue at constant luminance, and avoiding saturated red);
  3. leading edges are at least 360 ms apart, with no more than three in any second.
- At 120 BPM, beats are 500 ms apart, so flashing on every beat passes the rate test. Flashing on eighth notes (250 ms) fails.
- A warning card is a broadcast fallback for editorially justified content (Ofcom). It is not a fix on social feeds, where autoplay starts before any card can be read.

---

## 2. Motion sensitivity (vestibular, distraction)

### 2.1 Standards
- **WCAG 2.2.2 Pause, Stop, Hide (Level A):** "For any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it unless the movement, blinking, or scrolling is part of an activity where it is essential".
- **WCAG 2.3.3 Animation from Interactions (Level AAA):** "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed."
- **Motion animation (glossary):** "addition of steps between conditions to create the illusion of movement or to give a sense of a smooth transition".
- **Technique C39:** CSS `prefers-reduced-motion`. **[expert]** Vestibular reactions are described as "distraction, dizziness, headaches and nausea" (W3C Understanding 2.3.3 via the ESDC course).
- **Scope for VCR.** 2.2.2 applies when a VCR render is embedded **in a web page alongside other content and autoplays**: a hero loop, or a looping background video longer than 5 s. The page or player must offer pause. 2.3.3 applies to interactive scenes (scroll-triggered GSAP, for example) but not to a linear MP4. In feeds the platform player supplies pause, and VCR does not control it.

### 2.2 Known triggers (no numeric standard; all `heuristic`, [expert])
- Large-area parallax, with layers moving at different speeds or in opposite directions.
- Full-frame zoom and dolly, especially fast push-ins and "warp" zooms.
- Spinning or rotating full frames, and 3D camera orbits.
- Background motion under text the viewer must read.
- Whip pans and shake effects.
- Scroll-jacking (interactive only).
- Continuous looping motion in the periphery.

### 2.3 What a reduced-motion variant of a video looks like
For a linear video, "reduced motion" means a separate render (`<name>.reduced.mp4`) or a scene parameter (`window.__scene` reading a `reducedMotion` flag), served to `prefers-reduced-motion: reduce` users on the web or offered as an alternate cut. Concretely:
- **Keep:** information, order, timing of narration, brand look, and cross-fades (opacity changes are not "motion animation" in the vestibular sense; fades are the canonical replacement).
- **Replace:**
  - translate, scale or rotate entrances become fades or instant cuts;
  - camera moves become static framings, cut together;
  - parallax collapses to a single plane;
  - kinetic type moves to "appear in place", with per-word or per-line opacity reveals instead of fly-ins;
  - shakes and wobbles are removed;
  - looping ambient motion freezes on a representative frame.
- **Watch for:**
  - duration may need to stay the same if it is synced to audio;
  - essential motion (a data line drawing to show a trend) may stay, but slower and smaller.
- **Failure modes:**
  - agents output a "reduced" version that is just slower, which is still motion;
  - agents strip all animation and lose meaning conveyed by sequence;
  - fades are replaced by flashes. A fast fade-to-white repeated quickly *is* a flash, so check the reduced variant with the flash analyser too.

### 2.4 Expressive work
Energetic motion is the medium. The goal is not stillness but **control and restraint where the viewer must read**. A break succeeds when:
- full-frame camera motion is short (a single move, not sustained);
- text holds still while it is being read;
- a reduced variant exists for web placements.

---

## 3. Captions and subtitles

### 3.1 Requirements
- **WCAG 1.2.2 Captions (Prerecorded) (Level A):** "Captions are provided for all prerecorded audio content in synchronized media, except when the media is a media alternative for text and is clearly labeled as such."
- **WCAG 1.2.4 Captions (Live) (Level AA):** "Captions are provided for all live audio content in synchronized media." This is rarely relevant to VCR.
- **FCC 47 CFR § 79.1(j)(2)** binds TV programming and IP-delivered programming that aired on TV. It is the best-defined quality vocabulary:
  - "Closed captioning shall convey the aural content of video programming … to the same extent that the audio track conveys such content to individuals who are able to hear."
  - **Synchronicity:** "Captioning shall coincide with the corresponding spoken words and sounds to the greatest extent possible, given the type of the programming."
  - **Completeness:** "Captioning shall run from the beginning to the end of the program, to the fullest extent possible."
  - **Placement:** "Captioning shall be viewable and shall not block other important visual content on the screen, including, but not limited to, character faces, featured text (e.g., weather or other news updates, graphics and credits), and other information that is essential to understanding a program's content".
  - The FCC consumer guide adds that captions "must be displayed on the screen at a speed that can be read by viewers".
  - The offline best practice is "Ensure offline captions are verbatim."
  - The FCC set **no numeric accuracy percentage**. Vendor figures such as "98.6%" or "99%" are contract terms, not law (secondary sources; `heuristic`).\[8\]\[31\]

### 3.2 Style guides (rate, length, non-speech)
| Source | Reading rate | Lines | Other | Tier / status |
|---|---|---|---|---|
| BBC Subtitle Guidelines | 160–180 wpm; "0.33 to 0.375 second per word"; minimum on-screen time "around 0.3 seconds per word (e.g. 1.2 seconds for a 4-word subtitle)" | 2 for 16:9/4:3/1:1; "For vertical (9:16) video, a maximum subtitle length of three lines is recommended." | 9:16 online: "should not be placed outside the central 75% vertically and the central 90% horizontally" | standard, but **unverified against the BBC page**; quoted from secondary republications of v1.2.3 (June 2024). Secondary sources cite v1.2.5 (March 2026). |
| DCMP Captioning Key | Educational: 130 / 140 / 160 wpm (lower / middle / upper level); "Special‐interest media for adults require a presentation rate range not to exceed 150–160 wpm" | "No more than two preferred" (secondary) | Rate counts speaker IDs and sound effects | standard |
| Netflix English (USA) Timed Text Style Guide | §II.17 "Reading Speed Limits": "Adult programs: Up to 20 characters per second / Children's programs: Up to 17 characters per second"; change log notes "words per minute removed" | 2 lines, 42 characters | — | platform; Netflix Partner Help Center (rate quote from the official page's search snippet; the page fetch was cut off before it) |

- **Cross-reference.** The concrete VCR caption typography and timing profiles (CPS limit, line length, safe zone, font size) live in `TYPO-CAPTION-*`. This pillar adds the *accessibility* obligations: presence, completeness, non-speech information, speaker identification, sync and placement against featured content.

### 3.3 Non-speech information, speaker IDs and music (DCMP)
- **Sound effects:**
  - "A description of sound effects, in brackets, should include the source of the sound."
  - "Both described sound effects and onomatopoeias must be lowercased."
  - "Offscreen sound effects should be italicized, if italics are available."
  - "Caption background sound effects only when they are essential to the plot."
  - Verb form: sustained `[dog barking]`, abrupt `[dog barks]`.
- **Music:**
  - "Nonessential background music should be captioned by placing a music icon (♪) in the upper right corner of the screen".
  - "Do not caption background music with a duration under 5 seconds."
  - "If music contains lyrics, caption the lyrics verbatim."
  - Use one ♪ at the start and end of each lyric caption, and two at the end of the song.
  - Describe music objectively. Avoid "delightful" and "beautiful" (DCMP Tip Sheet).
- **Speakers:**
  - "When possible, identify the speaker by placing the caption under the speaker."
  - Otherwise use the name in parentheses or on its own line.
  - For narration with no on-screen speaker, identify the narrator once at first appearance (for example `(narrator)`), then only on speaker changes. TTS voices are speakers too.
- **Videos with only music and SFX** (music visuals, product sizzles):
  - Caption the music's function at onset and on changes (`[upbeat electronic music]`, `[music builds]`, `[music stops]`).
  - Caption meaningful SFX (`[notification chime]`, `[glass shatters]`).
  - Caption silence when it is a story beat (`[silence]`).
  - Do not caption every whoosh (**[expert]**: over-tagging is a common auto-caption failure in reverse).
  - If the sound carries no information at all, a single opening tag (`[instrumental music throughout]`) satisfies the "equivalent information" intent.

### 3.4 Burned-in (open) vs platform (closed) captions
| | Burned-in (open) | Sidecar / platform (closed) |
|---|---|---|
| Always visible (muted autoplay feeds) | Yes | Only if the viewer enabled CC |
| User control (size, colour, off) | None | Yes, on players that support it (EN 301 549 clause 7 requires user control on covered players; secondary) |
| Survives re-upload and reposts | Yes | No |
| Machine-readable (search, translation, screen readers) | No | Yes |
| Placement collision with platform UI | Designer controls it (see `TYPO-SAFE`) | The platform controls it, and it may collide |
| Accessibility risk | Contrast and size are fixed; may obscure content | Auto-generated text may be wrong |

- **Recommendation (heuristic):** for social-first 9:16, ship burned-in captions **and** upload a sidecar wherever the platform accepts one. On X, burning in *and* uploading an SRT shows double text to CC users (secondary).\[32\] Pick one per placement.
- Never ship platform auto-captions unreviewed.

---

## 4. Audio description (AD)

### 4.1 Requirements
- **1.2.1 Audio-only and Video-only (Prerecorded) (A).** Prerecorded video-only: "Either an alternative for time-based media or an audio track is provided that presents equivalent information for prerecorded video-only content." **This is the rule for silent motion graphics.**
- **1.2.3 Audio Description or Media Alternative (Prerecorded) (A):** "An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media".
- **1.2.5 Audio Description (Prerecorded) (AA):** "Audio description is provided for all prerecorded video content in synchronized media."
- **1.2.7 Extended Audio Description (AAA):** "Where pauses in foreground audio are insufficient to allow audio descriptions to convey the sense of the video, extended audio description is provided".
- **Waiver:** "if all of the important information in the video track is already conveyed in the audio track, no additional audio description is necessary" (Understanding 1.2.3/1.2.5).
- **Techniques:**
  - G78: a second, user-selectable audio track.
  - G173: a described version of the video.
  - G226: narration incorporated in the main soundtrack.
  - G8: extended AD.
  - Failure F113: not using available pauses in dialogue for AD.

### 4.2 When VCR output needs description (decision rules)
1. **No audio + information-bearing visuals** (silent explainer, text-only kinetic type, data viz): 1.2.1 applies. Provide a text alternative (post copy, description field or transcript) or an audio track, such as a TTS narration of the on-screen text.
2. **Music only + on-screen text or meaningful visuals:** choose the declared conformance level. A complete media alternative can satisfy 1.2.3 at Level A; 1.2.5 at Level AA requires audio description unless the soundtrack already conveys the important visual information. Integrated narration must cover relevant actions and relationships as well as text. A post description alone is not a general AA substitute. [W3C 1.2.5](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html).
3. **Narrated, with narration covering every on-screen fact:** no AD needed. Check that supers, prices, dates, URLs, legal lines and chart values are *spoken*, not only shown.
4. **Decorative abstract motion with no information** (a music visualiser): no AD is needed beyond a short descriptive identification (1.1.1's "sensory experience" exception allows "descriptive identification").

### 4.3 Practical options on social platforms
- **YouTube:** creators with multi-language audio access can upload a descriptive audio track (the AD track must match the video length, per a secondary source).\[33\]\[34\] Captions and AD live under "Languages" in Studio.
- **Placement without a separate AD track:** use integrated description or supply a described version. Post copy may support the Level A media-alternative route; it does not replace required Level AA audio description. Verify current platform features at delivery.
- **Extended description** (pausing video) is impossible on feeds. Write the narration so it fits natural pauses, or lengthen the cut.
- **[expert]** Write description scripts to the frame. Describe *what changes and matters* (actions, on-screen text, scene changes), not aesthetics.

---

## 5. Contrast for moving and composited content

- **1.4.3 Contrast (Minimum) (AA):** "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1". Large-scale text needs 3:1. "Text that is part of a logo or brand name has no contrast requirement." Text "that [is] part of a picture that contains significant other visual content" is incidental.
- **Large scale:** "with at least 18 point or 14 point bold or font size that would yield equivalent size for Chinese, Japanese and Korean (CJK) fonts". Points do not map directly to video pixels. VCR treats large-text classification as `heuristic`; see `TYPO-*` for size floors.
- **1.4.11 Non-text Contrast (AA):** 3:1 against adjacent colours for "Parts of graphics required to understand the content". Examples: chart lines, icons that carry meaning, progress bars.
- **Applying them to video (all [expert] / heuristic):**
  - Text over moving footage varies over time. Inspect local failures throughout its lifetime; a percentile summary is only a diagnostic (§17.4).
  - Gradients and textured backgrounds have no single "background colour". Sample the background ring immediately around glyphs (dilated glyph mask minus glyph).
  - Semi-transparent scrims: measure the composited result.
  - Anti-aliased edges and motion blur lower apparent contrast. Measure glyph cores (eroded mask).
  - Encoding (`yuv420p`) blurs chroma. Coloured text on a coloured background loses edge definition even when the luminance ratio passes.
- **Limits of frame measurement:**
  - No glyph mask exists for burned-in text in footage; it needs OCR or detection.
  - The ratio is defined on sRGB values, not on what an OLED at 30% brightness outdoors shows.
  - Brief text below the reading time is a pacing failure, not a contrast pass.

---

## 6. Colour vision deficiency (CVD)

- **[audience] Prevalence:**
  - Birch (2012), "Worldwide prevalence of red-green color deficiency" (JOSA A 29:313–320), reports that "prevalence of deficiency in European Caucasians is about 8% in men and about 0.4% in women and between 4% and 6.5% in men of Chinese and Japanese ethnicity"; a 2025 PMC review gives about 8% and 0.5% for Northern European ancestry.
  - Rates are lower in Asian and African populations, as the Birch figures for men of Chinese and Japanese ethnicity show.
  - Tritan and achromatopsia types are rare.
- **Models:**
  - **Brettel, Viénot & Mollon 1997:** LMS projection onto two half-planes. Valid for protan, deutan and tritan dichromacy. Recommended for tritanopia.
  - **Viénot, Brettel & Mollon 1999:** a single-plane simplification. Fine for protan and deutan; "not accurate for tritanopia".
  - **Machado, Oliveira & Fernandes 2009:** physiologically based, with a severity parameter for anomalous trichromacy. Close to Brettel for full dichromacy by design; "doesn't work well for tritanopia" (secondary summary of DaltonLens).
  - DaltonLens: these "remain approximate mathematical models". Some Machado implementations skip sRGB decoding, a common bug.
  - Behavioural evaluations (Simon-Liedtke & Farup) found Brettel performed best among tested methods (secondary/ResearchGate snippet).\[35\]
- **Design rules:**
  - **WCAG 1.4.1 Use of Color (A):** "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element."
  - **Redundant encoding:** in charts and status, pair colour with labels, shape, pattern, position or direct annotation.
  - **Avoid red/green-only pairs:** win/lose, up/down and before/after commonly fail.
  - **Prefer pairs that differ strongly in luminance.**
  - **Safe palettes:** use CVD-designed categorical palettes, for example the Okabe-Ito palette (`heuristic`; widely recommended in science-figure guidance) and viridis-family sequential maps. Check every brand palette, because "safe palette" claims are only as good as the simulation.
- **Failure modes:**
  - The agent checks palette swatches in isolation, not in context (thin lines on dark backgrounds lose more).
  - Data-viz legends sit far from the lines.
  - Brand red-on-green CTAs.

---

## 7. Cognitive accessibility and pacing

- **W3C COGA, "Making Content Usable for People with Cognitive and Learning Disabilities"** (W3C Working Group Note, informative). Its eight objectives:
  1. Help users understand what things are and how to use them.
  2. Help users find what they need.
  3. Use clear and understandable content.
  4. Help users avoid mistakes and know how to correct them.
  5. Help users focus.
  6. Ensure processes do not rely on memory.
  7. Provide help and support.
  8. Support adaptation and personalization.
- **Objective 3 patterns relevant to video:**
  - "Use Clear Words";
  - "Use a Simple Tense and Voice";
  - "Use Literal Language";
  - "Keep Text Succinct";
  - "Ensure Foreground Content is not Obscured by Background";
  - "Provide Alternatives for Numerical Concepts";
  - "Provide Summary of Long Documents and Media";
  - "Break Media into Chunks";
  - "Avoid Too Much Content".
  - The summary describes clear content as "easy words, short sentences and blocks of text, clear images, and easy to understand video."
- **WCAG 3.1.5 Reading Level (AAA)** exists, but a numeric grade target is not a VCR `standard`. Use readability scores as a `heuristic` signal only.
- **VCR translation (heuristic, [expert]):**
  - **One idea per beat:** a single message per on-screen text block.
  - **Literal over idiomatic** for instructional pieces. Idiom is allowed in brand voice, but not for prices, steps or warnings.
  - **Numbers:** show and say them; round only when precision is not the message; give a comparison ("about 1 in 12 men").
  - **On-screen text dwell:** at least the caption reading-rate profile (`TYPO-CAPTION-*`), measured over the time the text is *static and fully legible*, not the time it is animating.
  - **Consistency across a series:** same caption position, same lower-third grammar, same colour meanings, same sound-tag vocabulary, and the same CTA location across episodes (by analogy with WCAG 3.2.3/3.2.4 consistency).
  - **Do not stack** captions, supers and a busy background at once (COGA "Help users focus").

---

## 8. Platform features (as of November 2026; `platform` tier, may change)

| Platform | Captions | Alt text / descriptions | Photosensitivity | Known limitations |
|---|---|---|---|---|
| **TikTok** | Auto captions (launched April 2021, initially "available in English and Japanese"); creators "have the power to edit the text"; viewers can turn captions off | Alt text for photo posts (secondary) | Creator warning "when they produce videos with effects that could trigger photosensitive epilepsy"; viewer setting to skip or filter photosensitive videos; animated thumbnails can be replaced with static images | Auto captions are verbatim ASR, without sound tags; the detection logic is undisclosed, so a platform filter is not a safety check |
| **Instagram** | Auto-generated captions toggle for Reels | "Write alt text" under Advanced settings → Accessibility for photos and carousels (per image); automatic object-recognition alt text "is not always accurate" | None documented | No alt-text field for Reels or Stories (secondary); auto alt text is generic |
| **YouTube** | Automatic captions; Help: "the quality of the captions may vary … You should always review automatic captions"; caption file upload | Descriptive audio track for creators with multi-language audio access | None documented for creators | Auto captions may lag after upload; ASR errors with accents, music and jargon |
| **X** | Upload caption file (.srt) under the video; viewer CC toggle | "+ALT" image descriptions with an ALT badge; X does not auto-generate alt text (secondary) | None documented | SRT upload in the composer (some guides say browser only); no AD track |

- **[audience]** RNID: "In our experience, the majority of videos on X do not have closed captions. It is much more common that captions are embedded in the video for everyone to see." (A UK charity; anecdotal.)

---

## 9. Stills: alt text for social graphics and carousels

- **WCAG 1.1.1 (A):** "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose". Decorative content should be ignorable.
- **Rules (heuristic, [expert]):**
  - Describe purpose and content, not "image of".
  - Include **all text in the graphic verbatim**, because text-as-image is invisible to screen readers.
  - Put the most important information first.
  - For charts, give the takeaway plus key numbers.
  - For carousels, write alt text per slide (Instagram supports per-image alt text). Do not paste the same alt text on every slide.
  - Do not duplicate the post caption verbatim.
  - Do not keyword-stuff.
- **Length:** X allows a long description (a 1,000-character limit, per a secondary source).\[36\] Aim for concise, usually 1–3 sentences, plus verbatim text.
- **Video thumbnails and cover frames** have no alt field on most platforms. Put essential info in the post copy.

---

## 10. Legal and standards landscape (what is law vs good practice)

| Jurisdiction / instrument | Who it binds | Standard | Video obligations | Status for VCR output |
|---|---|---|---|---|
| **W3C WCAG 2.2** (Recommendation, 12 Dec 2024 republication with errata; originally 5 Oct 2023) | Nobody directly; referenced by laws | — | 1.2.1–1.2.5 (A/AA), 2.3.1 (A), 2.2.2 (A), 1.4.3/1.4.11 (AA) | **Good practice baseline**; becomes law where referenced |
| **EU: European Accessibility Act**, Directive (EU) 2019/882, applied from 28 June 2025 | Six consumer service groups including e-commerce and services giving access to audiovisual media; microenterprises (<10 persons and ≤ €2 million turnover or balance sheet) exempt as service providers | EN 301 549 (V3.2.1 → WCAG 2.1 AA cited; V4.1.1 → WCAG 2.2 published September 2026, awaiting citation) | Video inside a covered service published on or after 28 June 2025. Excludes "pre-recorded time-based media published before 28 June 2025", third-party content not funded or controlled, and unedited archives | **Legal requirement** when the video is part of a covered consumer service (product video in an EU web shop). A TikTok brand short is generally not itself in scope (secondary analysis) |
| **Germany: BFSG** | Five of the six groups (AV access sits in the Medienstaatsvertrag) | State of the art / EN 301 549 | As EAA | Fines up to €100,000 (secondary) |
| **EU Web Accessibility Directive** | Public-sector bodies | EN 301 549 | Captions and AD with archive exemptions | Law for public-sector clients |
| **US: ADA Title II** (2024 rule; IFR 20 April 2026) | State and local government | WCAG 2.1 AA | Captions etc.; exceptions for archived content and pre-existing social media posts | **Law** from 26 April 2027 (≥50,000 population) and 26 April 2028 (smaller entities, special districts) |
| **US: ADA Title III** | Public accommodations (businesses) | None set; courts reference WCAG | DOJ 2022 guidance names "no captions on videos" as a barrier | **Litigation risk**, not a codified technical rule; Seyfarth Shaw's ADA Title III blog (25 March 2026) reports "Plaintiffs filed 3,117 website accessibility lawsuits in federal court in 2025 – a 27% increase from 2024", 36% of all federal Title III suits ("3,117 out of 8,667 cases") |
| **US: Section 508** | Federal agencies and ICT procurement | WCAG 2.0 AA | Player controls (503.4) | Law for federal clients |
| **US: FCC / CVAA** | TV programming, and IP clips of programming that aired on TV with captions | 47 CFR 79 | Caption quality standards | Law only if the content aired on US TV |
| **UK: Ofcom Broadcasting Code** | Licensed broadcasters | Ofcom guidance | Rule 2.12 PSE; access-service quotas | Law for broadcast delivery; good practice elsewhere |
| **Platform policies** | Uploaders | Platform-specific | Varies | Contractual; may change |

- **Bottom line:**
  - Flash safety is legally required for UK broadcast, and is WCAG Level A wherever WCAG is referenced.
  - Captions are legally required for covered services and public-sector or government clients.
  - For organic social posts from private brands, accessibility is mostly **good practice plus litigation and reputation risk**.
  - VCR should apply the WCAG 2.2 AA baseline to everything, because it costs little at authoring time and because placements change after delivery.

---

## 11. Measurement overview (reliability and false positives)

| Check | Automatable? | Reliability | False-positive behaviour | False-negative behaviour |
|---|---|---|---|---|
| General flash (WCAG/ITU) | Yes, from frames | High for synthetic graphics (no camera noise) | Pans and scrolling high-contrast edges count as flashes unless motion is compensated; scene cuts between bright and dark shots count by design | Flashes faster than fps/2 alias away; frame-sampled renders miss sub-frame events |
| Red flash | Yes | Medium; definition is newer and tools vary | Saturated-red brand elements moving across the frame | Chroma subsampling can reduce saturation below 0.8 at edges |
| Patterns | Partly (FFT / stripe counting) | Low–medium | Fine textures, type set in many lines, grids | Patterns that become provocative only after platform downscale (moiré) |
| Motion intensity | Yes (time series / optical flow) | Measurement is reliable, threshold validity is low | Fast but small elements | Subtle full-frame drift that still causes nausea |
| Contrast | Yes (masks needed) | Medium–high for DOM/canvas text; low for text in footage | Anti-aliasing, motion blur, outline strokes miscounted | Single-frame sampling misses the worst moment |
| CVD distinguishability | Yes | Medium (model approximation) | Pairs distinguished by labels anyway | Context (line thickness, area) not modelled |
| Caption presence/rate/timing | Yes | High for sidecars; medium for burned-in (OCR) | Rate spikes on single short cues | Accuracy (wrong words) undetected without ASR comparison |
| Caption accuracy | Partly (ASR diff vs script) | Medium | ASR errors flagged as caption errors | Shared mistakes between script and captions |
| AD need | Partly (on-screen text not in transcript) | Medium | Decorative text flagged | Meaning carried by imagery, not text |

---

## 12. The analysis/critique process (how an expert reviews)

**Ordered steps:**
1. **Establish context.** Placement(s), audience, sound-on or sound-off, jurisdiction and service (EAA, ADA, broadcast?), deliverables (master, social cuts, loops, stills), and whether a reduced-motion variant is required.
2. **Safety gate first.** Run flash, red-flash and pattern analysis on the **decoded delivery files**, at full-screen scale, including loop seams. Any 2.3.1 failure is a **Blocker**; stop and report.
3. **Watch it twice in real time.** Once sound-on, once muted, on a phone-sized display at full brightness. **Do not judge motion from contact sheets**; vestibular and pacing problems exist only in time.
4. **Captions.** Check presence, completeness (first to last audible content), accuracy against the script or audio, non-speech tags, speaker IDs, sync, rate, and placement against featured text, faces and platform UI.
5. **Audio description need.** Review important visual information, including actions and relationships, against the declared level and §4.2. Token coverage is only a diagnostic; a text alternative is not a general substitute for Level AA audio description.
6. **Contrast and colour.** Check worst-case text contrast over the text's lifetime, graphic contrast for meaningful marks, colour-alone encodings, and the CVD simulation (protan, deutan, tritan).
7. **Motion.** Look for full-frame camera motion, parallax and spin, motion behind reading text, and duration of sustained motion. Check that a reduced variant exists and is faithful.
8. **Cognition and pacing.** One idea per beat, dwell times, literal wording for key facts, series consistency.
9. **Stills and metadata.** Alt text per image, post copy carrying essential info, captions uploaded where supported.
10. **Report** each finding with severity, criterion, evidence, impact and fix, and give a re-test instruction.

**Severity guidance** (aligned with common auditor practice; the labels are [expert] conventions, not a standard):
- **Blocker:**
  - fails WCAG 2.3.1 or the ITU/Ofcom flash or pattern rules (physical harm);
  - a speech-led piece with no captions at all.
- **Critical:** information unavailable to a disability group. Examples:
  - essential on-screen facts never spoken in a music-only piece with no text alternative;
  - a chart readable only by colour;
  - captions missing for a whole section.
- **Serious:**
  - caption rate far over profile;
  - captions covering featured text;
  - text contrast below 3:1;
  - sustained full-frame camera motion with no reduced variant for web placement.
- **Moderate:**
  - contrast between 3:1 and 4.5:1 for small text;
  - missing sound tags for meaningful SFX;
  - inconsistent caption position across a series.
- **Minor:**
  - style deviations (tag case, ♪ usage);
  - alt text verbose or duplicative.

**Finding vocabulary (use these words):**
- general flash, red flash, flash area, leading-edge spacing, extended flashing, regular pattern;
- caption completeness, synchronicity, placement collision, presentation rate (wpm/CPS), non-speech information, speaker identification;
- integrated description, text alternative, extended description;
- worst-case contrast, adjacent colour, colour-only encoding, CVD confusion pair;
- vestibular trigger, full-frame motion, parallax depth, reduced-motion variant;
- dwell time, chunking, series consistency.

**Finding template:**
`[A11Y-ID] Severity · WCAG x.y.z (Level) / source · Timecode or frame range · Region (x,y,w,h) · Evidence (measured value vs threshold) · Who is affected · Remediation · Retest`

**Agent pitfalls in review:**
- **Judging motion from stills.** Contact sheets hide flashing, strobing and vestibular load.
- **Over-applying rules:**
  - flagging a single white cut as a flash;
  - demanding AD for abstract visualisers;
  - forbidding all red;
  - treating 2.3.2 (AAA) as mandatory.
- **Under-applying:** trusting platform auto-captions or the TikTok photosensitivity filter as proof of safety.
- **Homogenising:** recommending the same white-on-black caption box and fade-only motion for every brand. Accessibility constrains *parameters*, not *style*.

---

## 13. The creation process (brief to verification)

**Research and image handoff.** [Image Direction §1–4](../image-direction/README.md) declares the image role (`IMAGE-PURPOSE-DECLARED`); Accessibility determines its description and equivalent information, with Typography owning text setting. [Cultural Context §1–4](../cultural-context/README.md) supplies audience interpretation evidence, not a substitute for accessibility conformance or testing. Reference images and colour associations must not override `A11Y-COLOR-ALONE` or the owning contrast rules. Use [Domain Exploration §3](../domain-exploration/README.md) for uncertain factual content in descriptions.

1. **Brief intake.** Record placements, sound-on/off expectation, jurisdictions and services, audience (children → stricter pacing and flash margins), and whether a reduced-motion variant and AD are required.
2. **Script with access built in:**
   - write narration that speaks every essential on-screen fact (integrated description);
   - plan sound tags for music-only and SFX moments;
   - write alt text and post copy at the same time.
3. **Style frames:**
   - check palette contrast pairs and CVD simulation before animating;
   - define caption zone and style (inherit `TYPO-CAPTION-*`, `TYPO-SAFE`);
   - define a colour-meaning legend for the series.
4. **Motion design:**
   - budget flashes against the beat map (`markers`): leading edges at least 360 ms apart, or keep flashes small or at constant luminance;
   - avoid saturated-red full-frame transitions;
   - avoid stripes and grids over large areas, especially oscillating ones;
   - hold text still while it is read;
   - author a `reducedMotion` code path from the start.
5. **Captions:** generate from the script or TTS cue times (deterministic), not ASR; add speaker IDs and tags; time to audio; check rate against the profile.
6. **Render and check:** run `vcr lint` (DOM/time-series checks), the frame analysers (flash, pattern, contrast, CVD), the caption checks, and the AD-coverage diff.
7. **Encode and re-check:** analyse the decoded `yuv420p` H.264 delivery, and a simulated platform re-encode if available.
8. **Human review:** real-time, sound-off and sound-on, on a phone.
9. **Deliver:** the master, captions as burned-in and/or sidecar (.srt/.vtt), the reduced-motion variant if web, alt text and post copy, and a short access note (what was checked, with versions).

**Expressive breaks:**
- strobes inside a small window;
- glitch cuts spaced to the safe harbour;
- intense motion in a reduced-variant-backed web placement;
- music-only pieces with full text alternatives.

The break succeeds when the safety thresholds still pass and the information remains available another way.

---

## 14. Medium-specific guidance

### 9:16 social (1080 × 1920; TikTok, Reels, Shorts)
- **Mostly muted autoplay**, so burned-in captions are the default (heuristic). Keep captions inside the platform-safe zone (`TYPO-SAFE`). BBC 9:16 guidance: within the central 75% vertically and 90% horizontally; up to three lines; "a little higher up, though still generally in the lower third" (secondary).
- **Flash area.** The phone fills a small visual field, but viewers hold it close and in dark rooms. VCR default: treat **25% of the frame** as the area limit (the ITU rule). It is roughly equivalent to the WCAG 87,296 CSS px on a typical ~393 × 852 CSS px phone viewport, about 26% (VCR derivation; heuristic).
- **Autoplay loops:** analyse the loop seam (last → first frame) and three or more loop cycles.
- Hook-first edits encourage fast cuts in the first second. Check cut-induced flashes there.

### 16:9 (YouTube, web embeds, broadcast)
- Full-screen desktop is the worst case for WCAG area: 341 × 256 CSS px in a 1920 × 1080 CSS viewport is only about 4.2% of the screen (VCR derivation). Small strobes that pass on phones can fail here.
- Web embeds that autoplay for more than 5 s alongside other content need a pause control (2.2.2) and a reduced-motion variant (2.3.3 good practice).
- Broadcast delivery adds Ofcom/ITU luminance, pattern and Harding certification.

### Square (1:1)
- Caption lines: BBC two lines for 1:1 (secondary). Feed placements are often muted, so treat them like 9:16.

### Stills and carousels
- Alt text per slide; verbatim text; contrast per 1.4.3/1.4.11; colour-not-alone; consistent layout across slides.

### Loops (GIF, cinemagraph, background video)
- Analyse "while looping" (W3C), including the seam.
- Loops over 5 s on web pages need pause (2.2.2).
- Repetitive oscillation counts toward pattern and extended-flash risk.
- Supply a static poster frame for reduced motion.

---

## 15. Authoritative sources and canon (why each matters)

- **W3C WCAG 2.2 and its Understanding documents** (2.3.1, 1.2.x, 1.4.x, 2.2.2, 2.3.3): the normative baseline every law points to. The Understanding pages hold the operative definitions (flash area in CSS px, red-flash chromaticity, the "no AD needed" waiver).
- **ITU-R BT.1702-3 (11/2023):** the international broadcast PSE recommendation. It contains the absolute-luminance rule, HDR handling, the pattern criteria and the 5-second caution.
- **Ofcom Broadcasting Code Rule 2.12 and Guidance Note (Annex 1):** the UK regulatory implementation, with enforcement history.
- **Harding & Jeavons, *Photosensitive Epilepsy* (1994); Binnie, Emmett, Gardiner, Harding, Harrison & Wilkins (2002), "Characterizing the Flashing Television Images that Precipitate Seizures" (SMPTE J.); Wilkins, *Visual Stress* (1995):** the clinical and vision-science foundation of the thresholds.
- **TRACE Center (Vanderheiden et al.), "International Guidelines for Photosensitive Epilepsy: Gap Analysis and Recommendations" (ACM TACCESS, 2024):** a current critique of gaps (extended flashing, HDR, mobile).
- **PEAT and HardingFPA:** reference tools.
- **47 CFR § 79.1 (FCC):** caption quality vocabulary.
- **DCMP Captioning Key:** the most detailed public guidance on non-speech information, music and speaker IDs.
- **BBC Subtitle Guidelines:** reading rate and 9:16-specific layout.
- **W3C COGA "Making Content Usable…":** cognitive objectives and design patterns.
- **Brettel et al. 1997; Viénot et al. 1999; Machado et al. 2009:** the CVD simulation models. Also DaltonLens (Nicolas Burrus), a practitioner review of implementations.
- **Directive (EU) 2019/882 (EAA); EN 301 549; DOJ ADA Title II rule and 2026 IFR; Section 508:** the legal layer.
- **Platform help centres** (YouTube Help, X Help, Instagram Help, TikTok Newsroom): the current feature reality.

---

## 16. Encoding for an AI agent: rules table

Measurability codes: **M-frames** = rendered PNG frames or decoded video; **M-dom** = DOM, computed style or transform time series; **M-captions** = caption file and audio cues; **J** = judgement only.

| ID | Check | Threshold | Tier | Applies to |
|---|---|---|---|---|
| `A11Y-FLASH-GENERAL` | No more than 3 general flashes in any 1 s window where flashing area exceeds the area limit | Flash = opposing relative-luminance changes ≥ 0.10 with darker < 0.80; fail if > 3 flashes / any 1 s AND area > 25% of any 341×256 CSS-px field (WCAG) | standard | All video, loops, animated stills; universal. M-frames |
| `A11Y-FLASH-RED` | No more than 3 red flashes in any 1 s window over the area limit | Transition to/from R/(R+G+B) ≥ 0.8 with Δu′v′ > 0.2 (WCAG 2.2) | standard | All; universal. M-frames |
| `A11Y-FLASH-BROADCAST` | ITU/Ofcom luminance flash rule | ≥ 20 cd/m² difference with darker < 160 cd/m² (SDR assumed 200 cd/m² peak); > 3 flashes per 1 s with > 25% of displayed screen; edges ≥ 360 ms (50 Hz) / 334 ms (60 Hz) always acceptable | standard | Broadcast / UK delivery; recommended default for social. M-frames |
| `A11Y-FLASH-HDR` | HDR flash rule | Darker ≥ 160 cd/m²: Michelson ≥ 1/17 | standard | HDR/HLG/PQ masters only. M-frames (needs PQ/HLG decode) |
| `A11Y-FLASH-STRICT` | Zero flashing above 3 per second regardless of area/brightness | > 3 flashes in any 1 s anywhere | standard (AAA) | Opt-in for children's or AAA briefs. M-frames |
| `A11Y-FLASH-EXTENDED` | Warn on long flashing sequences even if compliant | Flashing sequence > 5 s | standard (ITU caution; no numeric limit) | All. M-frames |
| `A11Y-FLASH-LOOP-SEAM` | Analyse loop wrap-around and repeated cycles | Same as flash rules across seam, ≥ 3 cycles | standard (W3C "analyzed while looping") | Loops, GIFs, background video. M-frames |
| `A11Y-FLASH-CUTS` | Rapid cuts producing flashing areas | Treated as flashes (ITU "fast cuts") | standard | Beat-synced edits. M-frames + markers |
| `A11Y-PATTERN-STRIPES` | Regular stripe patterns | > 5 light-dark pairs; > 40% of screen stationary or > 25% if moving/oscillating/reversing; flash-level luminance difference; smooth one-direction flow exempt | standard (ITU informative) for broadcast; heuristic elsewhere | All. M-frames (FFT) |
| `A11Y-MOTION-PAUSE` | Auto-playing motion > 5 s beside other content has pause/stop/hide | > 5 s, starts automatically, parallel content | standard (WCAG 2.2.2, A) | Web embeds, hero loops; not feed video. J (player config) |
| `A11Y-MOTION-REDUCED-VARIANT` | A reduced-motion variant exists and removes non-essential motion | Variant present; no translate/scale/rotate/camera motion beyond essential; flash checks pass | standard (2.3.3 AAA for interactive) / heuristic for linear video | Web placements, interactive scenes. M-dom (diff transforms between variants) |
| `A11Y-MOTION-FULLFRAME` | Sustained full-frame camera motion (zoom, pan, orbit, spin) | Flag full-frame motion lasting > 5 s continuous, or > 1 per 5 s (VCR default) | heuristic | All. M-dom (camera transforms) / M-frames (global flow) |
| `A11Y-MOTION-PARALLAX` | Multi-layer parallax with large relative displacement | Flag ≥ 2 layers covering > 25% of frame moving at differing velocities (VCR default) | heuristic | All. M-dom |
| `A11Y-MOTION-READING` | Text held still while being read | Superseded: use `TYPO-HOLD`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | Kinetic type, supers. M-dom |
| `A11Y-CAPTION-PRESENCE` | Captions exist for all speech and meaningful sound | Any audio content with speech or meaningful sound → captions (burned-in or sidecar) | standard (WCAG 1.2.2, A) | All with audio. M-captions + audio VAD |
| `A11Y-CAPTION-COMPLETE` | Captions cover first to last audible content | No uncaptioned speech span > 0 s (VCR tolerance configurable) | standard (FCC completeness vocabulary; WCAG 1.2.2) | All with speech. M-captions |
| `A11Y-CAPTION-ACCURACY` | Caption text matches script/audio verbatim (or edited only for rate) | Word error rate vs script; FCC sets no percentage | standard (FCC wording) / heuristic (numeric) | All. M-captions (diff vs script/ASR) |
| `A11Y-CAPTION-SYNC` | Cue timing coincides with speech/sound | Cue onset vs speech onset offset within VCR default tolerance (heuristic) | standard (FCC) / heuristic (tolerance) | All. M-captions + audio |
| `A11Y-CAPTION-RATE` | Presentation rate within profile | Superseded: use `TYPO-CAPTION-CPS`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | All captions. M-captions |
| `A11Y-CAPTION-PLACEMENT` | Captions do not block faces, featured text, graphics, platform UI | Zero bbox intersection with `textBounds()`/DOM text and detected faces | standard (FCC placement) | All. M-dom + M-frames |
| `A11Y-CAPTION-NONSPEECH` | Meaningful SFX/music tagged | Bracketed lowercase tags with source; no tag for background music < 5 s | standard (DCMP) | Music/SFX pieces. M-captions (presence) + J (meaning) |
| `A11Y-CAPTION-SPEAKER` | Speaker identification for off-screen/narrator/multiple voices | ID at first appearance and on change | standard (DCMP) | Narrated/multi-voice. M-captions + J |
| `A11Y-CAPTION-LYRICS` | Lyrics captioned verbatim with ♪ when lyrics carry meaning | ♪ start/end; ♪♪ end of song | standard (DCMP) | Music with vocals. J + M-captions |
| `A11Y-CAPTION-SIDECAR` | Sidecar (.srt/.vtt) supplied where platform supports it | File present, valid, matches burned-in text | platform | YouTube, X, web. M-captions |
| `A11Y-CAPTION-AUTO-REVIEW` | Platform auto-captions are never the only captions | Reviewed captions present | platform | All social. J |
| `A11Y-VIDEO-ONLY-ALT` | Silent video with information has a text alternative or audio track | Present when audio track is absent/silent | standard (WCAG 1.2.1, A) | Silent motion. M-captions/metadata + J |
| `A11Y-AD-COVERAGE` | Important visual information has an accessible equivalent at the declared level | Level A: 1.2.3 media alternative or description; Level AA: 1.2.5 audio coverage. Text-token inclusion alone is insufficient | standard (scoped WCAG); token diagnostic heuristic | Applicable prerecorded synchronized media; human review of visual meaning |
| `A11Y-AD-TRACK` | Description supplied where required | Integrated description, supported AD track or described version; platform limitations do not waive the requirement | standard (scoped WCAG) / platform | Applicable synchronized media. J |
| `A11Y-CONTRAST-TEXT` | Text contrast over its lifetime; superseded by `TYPO-CONTRAST` | Superseded: use `TYPO-CONTRAST`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | Applicable text; source colours and supplementary frame inspection |
| `A11Y-CONTRAST-GRAPHIC` | Meaningful graphic parts vs adjacent colours | ≥ 3:1 | standard (WCAG 1.4.11, AA) | Charts, icons, progress UI. M-frames + J (which parts are meaningful) |
| `A11Y-COLOR-ALONE` | Colour is not the only carrier of meaning | Redundant cue present (label, shape, pattern, position) | standard (WCAG 1.4.1, A) | Data viz, status, CTAs. J (assisted by M-dom) |
| `A11Y-CVD-DISTINCT` | Encoded categories stay distinguishable under CVD simulation | Pairwise ΔE (CIEDE2000) under protan/deutan (Viénot) and tritan (Brettel) above VCR default | heuristic | Data viz, legends, UI. M-frames / palette |
| `A11Y-PLAIN-LANGUAGE` | Clear, literal wording for key facts | One idea per beat; no idiom for prices/steps/warnings | standard (COGA, informative) / heuristic | Explainers, ads. J (readability score as signal) |
| `A11Y-TEXT-DWELL` | On-screen text static and legible long enough to read | Superseded: use `TYPO-HOLD`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | Supers, kinetic type. M-dom |
| `A11Y-SERIES-CONSISTENT` | Consistent caption position, colour meanings, tag vocabulary, CTA location across episodes | Identical tokens across series | heuristic (by analogy to WCAG 3.2.3/3.2.4) | Series. M-dom (cross-episode diff) |
| `A11Y-ALT-TEXT` | Every informative still has alt text including verbatim on-image text | Present; contains all OCR'd text; not identical to caption | standard (WCAG 1.1.1) / heuristic (content rules) | Stills, carousels. M-frames (OCR) + J |
| `A11Y-ALT-CAROUSEL` | Unique alt text per carousel slide | No duplicates | heuristic | Carousels. M (string compare) |
| `A11Y-WARNING-NOT-FIX` | Photosensitivity warnings not used as a substitute on social | Warning allowed only where flash rules cannot be met and content is editorially justified (Ofcom) | standard (Ofcom, broadcast) / heuristic (social) | All. J |

---

## 17. How to measure in VCR

### 17.1 Flash analyser (`A11Y-FLASH-*`)
- **Inputs:**
  - rendered PNG frames at delivery fps (pre-encode);
  - the **decoded delivery video** (post-encode, authoritative);
  - optionally a platform-simulated re-encode;
  - beat `markers` to annotate findings.
- **Calculation:**
  1. Decode to RGB using the file's tagged matrix and range (BT.709, limited range for H.264 `yuv420p`). Convert to sRGB 0–1 and linearise (0.04045 threshold). Compute relative luminance L per pixel.
  2. Downsample to a block grid (for example 8×8 px blocks; a ~0.1° block is the WCAG fine-pattern exception scale) to suppress fine-noise exemptions and speed up.
  3. Per block, build L(t). Find local extrema (peaks and valleys). A **transition** is the change between adjacent extrema. Keep transitions with |ΔL| ≥ 0.10 and min(L) < 0.80 (general). For red: either state has R/(R+G+B) ≥ 0.8 (linear RGB) and Δu′v′ > 0.2.
  4. A **flash** is two consecutive opposing qualifying transitions. Record flash events per block with timestamps (the leading edge is the first transition's start).
  5. For each frame t, take the set of blocks whose flash events fall within [t−1 s, t] with count > 3.
  6. **Area test:** slide a window equal to the WCAG field (341×256 CSS px mapped into video px for the worst-case display) and also the full frame (ITU 25% of screen). Fail if the flagged-block area fraction is > 25% in any window position.
  7. **ITU absolute-luminance mode:** map code values to cd/m² with an assumed SDR peak of 200 cd/m² (BT.1886 EOTF) and apply ≥ 20 cd/m² with darker < 160.
  8. Report: time ranges, regions, peak flash count/s, area %, and mode (WCAG / ITU / red).
- **Display mapping for the WCAG field:**
  - 16:9 1920×1080 delivery at desktop full screen ≈ 1:1 CSS px, so the field is 341×256 video px.
  - 9:16 1080×1920 on a ~393 CSS-px-wide phone means ~2.75 video px per CSS px, so the field is ≈ 937×703 video px, roughly 26% of the frame.
  - Use the stricter of the two mappings for multi-placement deliveries (VCR derivation; heuristic).
- **Sampling:**
  - Every frame at native fps. Never subsample in time: at 30 fps the highest representable flash rate is 15 per second; at 24 fps, 12.
  - For 60 fps renders, analyse at 60.
  - For loops, concatenate ≥ 3 cycles.
- **Failure modes:**
  - **Pans and scrolls** of high-contrast edges register as flashes without motion compensation. Mitigate with optical-flow compensation (as ITU Annex 3 and HardingFPA do) or by cross-checking against `window.__scene` transforms. Report as "possible; motion-induced" rather than suppressing.
  - **Encoding:** `yuv420p` chroma subsampling smears saturated red edges, so red-flash area is under- or over-estimated at boundaries. A colour-matrix mis-tag (BT.601 vs 709) shifts luminance by a few percent near the 0.10 threshold.
  - **Platform re-encode** may change fps (frame dropping can merge or split flashes), add banding, or apply tone mapping.
  - **HDR:** do not apply sRGB math to PQ/HLG. Decode the EOTF.
  - **Display brightness** is unknown. Relative-luminance math assumes a nominal display.

### 17.2 Pattern detector (`A11Y-PATTERN-STRIPES`)
- **Inputs:** rendered frames (pre- and post-encode); optional platform-downscale simulation (for example 1080 → 720).
- **Calculation:**
  - Tile 2D FFT or a Gabor filter bank on luminance. Detect dominant periodic components with ≥ 6 cycles (more than 5 pairs) and amplitude meeting the flash luminance difference.
  - Region-grow to get area. Compare against 40% (static) or 25% (moving).
  - Motion classification: phase velocity over time. Flag oscillating or reversing patterns; exempt consistent single-direction flow.
- **Sampling:** every 2–4 frames for static detection; every frame for oscillation.
- **Failure modes:**
  - text paragraphs, grids and UI mockups trigger false positives;
  - moiré appears only after downscale;
  - subjective "clearly discernible" cannot be computed.

### 17.3 Motion intensity (`A11Y-MOTION-*`)
- **Inputs:** element transforms sampled across frames via `seek(t)` (DOM `getBoundingClientRect` and computed transform; three.js camera matrices; canvas scenes exposing state); optical flow on frames for footage and canvas without introspection.
- **Calculation (all thresholds heuristic):**
  - Per element: velocity (px/s, and % of frame diagonal per second), angular velocity, scale rate (d ln s/dt), and area fraction of the frame.
  - **Full-frame motion index:** median global optical-flow magnitude or camera transform rate. Flag sustained motion above threshold for > 5 s.
  - **Parallax index:** the variance of velocities across layers weighted by layer area.
  - **Reading conflict:** text elements with non-zero transform rate while their dwell window is open.
- **Sampling:** every frame for derivatives; smooth with a 3-frame window.
- **Failure modes:**
  - no validated dose-response exists linking these numbers to vestibular symptoms, so thresholds are tunable defaults and must not be presented as standards;
  - small fast elements inflate per-element metrics;
  - optical flow fails on flat-colour graphics and fades (a fade has zero flow, which is correct, but flow noise may appear).

### 17.4 Contrast sampling (`A11Y-CONTRAST-*`)
- **Inputs:** DOM text nodes and computed styles at t; `textBounds()` for canvas; rendered frames; glyph masks (render text-only pass, or alpha from the scene).
- **Calculation:**
  - Glyph core = mask eroded by 1 px. Background ring = mask dilated by 3–4 px minus the dilated-by-1 mask.
  - Per frame, compute luminance of the median glyph core and median ring, then the WCAG ratio (L1+0.05)/(L2+0.05).
  - A 5th percentile may summarise diagnostics, but must not hide local or temporal failures. Median glyph/ring colours can also hide poor contrast.
- **Scope:** this mask method is experimental. `TYPO-CONTRAST` and [W3C 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) govern source-colour evaluation. Inspect entrances, exits and motion separately; an opacity cutoff or reading-hold check does not exempt them from contrast review.
- **Failure modes:**
  - outlines and drop shadows: contrast should be measured against the stroke when a stroke separates the glyph from the background. Detect strokes or measure glyph vs stroke and stroke vs background;
  - gradients inside glyphs;
  - motion blur;
  - text in footage without masks needs OCR bounding boxes, which are less reliable;
  - post-encode chroma bleed.

### 17.5 CVD distinguishability (`A11Y-CVD-DISTINCT`, supports `A11Y-COLOR-ALONE`)
- **Inputs:** declared palette and semantic roles (legend entries, series colours, status colours) from the scene; rendered frames.
- **Calculation:**
  - Simulate protan/deutan with Viénot 1999 and tritan with Brettel 1997, at full severity and at 0.6 severity (anomalous; Machado or interpolation).
  - For every pair of semantically distinct colours, compute CIEDE2000 under each simulation. Flag pairs that fall below a VCR default (heuristic; for example ΔE00 < 10 for adjacent lines, < 5 for large fills).
  - Also check luminance contrast between the pair (redundant luminance cue).
- **Sampling:** palette-level once; frame-level on key frames for context (legend proximity).
- **Failure modes:**
  - the models are approximate, and individuals vary;
  - thin lines and small marks need larger ΔE than large areas;
  - pairs disambiguated by direct labels are false positives (suppress if `A11Y-COLOR-ALONE` passes).

### 17.6 Captions (`A11Y-CAPTION-*`)
- **Inputs:** sidecar .srt/.vtt; burned-in caption layer DOM with cue times; audio files; TTS cue times; script; voice activity detection (VAD) output; `textBounds()` and DOM boxes for placement.
- **Calculations:**
  - **Presence/completeness:** VAD speech segments minus caption-covered spans. Flag gaps of uncaptioned speech.
  - **Rate:** wpm = words / (out − in) × 60, and CPS = characters / duration. Compare to the profile in `TYPO-CAPTION-CPS`. DCMP counts speaker IDs and sound tags in the rate.
  - **Sync:** cue in-time minus speech onset. Report the distribution.
  - **Accuracy:** WER of captions vs script (TTS) or vs ASR (recorded). Flag numbers, names and negations specifically.
  - **Placement:** intersection of caption boxes with featured text boxes, face detections and the platform UI safe zone.
  - **Non-speech:** detect music/SFX segments (audio classifier or the mix stems) without overlapping bracketed tags. Judgement decides whether they are meaningful.
- **Sampling:** per cue; frames at cue midpoints for placement.
- **Failure modes:**
  - VAD misses sung vocals or flags breaths;
  - ASR-based accuracy checks inherit ASR errors;
  - burned-in captions in third-party footage need OCR;
  - CPS spikes on very short cues;
  - deterministic TTS timing can drift if audio is re-timed at mix.

### 17.7 AD coverage (`A11Y-AD-COVERAGE`, `A11Y-VIDEO-ONLY-ALT`)
- **Inputs:** all on-screen text from DOM and `textBounds()` over time; the narration transcript; the post copy / text alternative.
- **Calculation:** token comparison can flag possible omissions, but cannot establish semantic coverage. Assess the narration for Level AA and any complete media alternative for Level A separately. Inspect important non-text visuals and meaning, then apply §4.2. Silence detection only suggests a media classification for review.
- **Failure modes:** decorative words flagged; meaning conveyed by imagery (not text) missed, which is judgement.

---

## 18. VCR-specific rendering and delivery notes

- **Seek-based rendering is deterministic, but it samples time.** Any event shorter than one frame interval is invisible to analysis *and* to viewers at that fps. However, an element toggled on alternate frames at 60 fps creates a 30 Hz flicker that is real. Analyse at delivery fps.
- **Fixed fps limits detectable flash frequency:** 24 fps → 12 Hz max; 25 → 12.5; 30 → 15; 60 → 30. The WCAG and ITU risk band includes these frequencies.
- **ITU spacing in frames:**
  - "360 ms" ≈ 9 frames at 25 fps;
  - "334 ms" ≈ 10 frames at 30 fps (10.02);
  - at 24 fps, 360 ms = 8.64 frames, so use ≥ 9 frames between leading edges;
  - at 60 fps, 334 ms ≈ 20 frames.
  - Frame-quantised beats can land 1 frame short. Round up.
- **`yuv420p` H.264:**
  - limited range (16–235) and chroma at half resolution in both axes;
  - saturated red text and edges smear, and the red-flash area changes slightly;
  - always re-analyse the decoded file;
  - confirm colour tagging (`bt709` primaries, transfer and matrix) so platforms do not reinterpret as BT.601, which shifts luminance and contrast.
- **ProRes 4444 alpha masters:** contrast and flash are undefined until composited. Analyse each composite over its intended backgrounds, or over worst-case black and white plates.
- **Platform re-encode:** bitrate starvation in fast motion produces block artifacts and banding (pattern-like). Frame-rate conversion (for example 60 → 30) can drop alternate frames, removing or creating apparent flashes. Loops may be re-wrapped with a different seam. Burned-in captions survive; sidecars may not.
- **Canvas, WebGL and three.js:** no DOM for text. Require `textBounds()` for every text draw, or contrast, placement and AD checks degrade to OCR.
- **Deterministic synthesis audio:** use stems to classify music vs SFX for non-speech tagging, and TTS cue times for caption timing (more reliable than ASR).
- **Reduced-motion variant** as a scene parameter: render both variants and run the same checks on both. Diff transforms to confirm motion removal.

---

## 19. Master checklists

### Analysis checklist
1. Context recorded (placement, sound-on/off, jurisdiction/service, deliverables).
2. `A11Y-FLASH-GENERAL`, `A11Y-FLASH-RED`, `A11Y-FLASH-BROADCAST` (if broadcast/UK), `A11Y-FLASH-HDR` (if HDR), `A11Y-FLASH-LOOP-SEAM`, `A11Y-FLASH-CUTS`, `A11Y-FLASH-EXTENDED` on decoded delivery.
3. `A11Y-PATTERN-STRIPES` pre- and post-downscale.
4. Real-time viewing, muted and with sound, on a phone; no judgement from stills.
5. `A11Y-CAPTION-PRESENCE`, `-COMPLETE`, `-ACCURACY`, `-SYNC`, `-RATE` (dropped; owner `TYPO-CAPTION-CPS`), `-PLACEMENT`, `-NONSPEECH`, `-SPEAKER`, `-LYRICS`, `-SIDECAR`, `-AUTO-REVIEW`.
6. `A11Y-VIDEO-ONLY-ALT`, `A11Y-AD-COVERAGE`, `A11Y-AD-TRACK`.
7. `A11Y-CONTRAST-TEXT` (dropped; owner `TYPO-CONTRAST`), `A11Y-CONTRAST-GRAPHIC`, `A11Y-COLOR-ALONE`, `A11Y-CVD-DISTINCT`.
8. `A11Y-MOTION-FULLFRAME`, `-PARALLAX`, `-READING` (dropped; owner `TYPO-HOLD`), `-REDUCED-VARIANT`, `-PAUSE` (web embeds).
9. `A11Y-PLAIN-LANGUAGE`, `A11Y-TEXT-DWELL` (dropped; owner `TYPO-HOLD`), `A11Y-SERIES-CONSISTENT`.
10. `A11Y-ALT-TEXT`, `A11Y-ALT-CAROUSEL` for stills and carousels.
11. `A11Y-WARNING-NOT-FIX` confirmed.
12. Findings written with severity, criterion, evidence, remediation and retest.

### Creation checklist
1. Brief captures placements, audio mode, jurisdictions, AD and reduced-motion needs.
2. Script speaks every essential on-screen fact (`A11Y-AD-COVERAGE`); sound tags planned (`A11Y-CAPTION-NONSPEECH`).
3. Palette passes `A11Y-CONTRAST-TEXT` (dropped; owner `TYPO-CONTRAST`), `A11Y-CONTRAST-GRAPHIC` and `A11Y-CVD-DISTINCT`; meanings redundantly encoded (`A11Y-COLOR-ALONE`).
4. Beat map budgets flashes (`A11Y-FLASH-*`): edges ≥ 360 ms, small areas or constant luminance, no saturated-red full-frame transitions.
5. No large oscillating stripes (`A11Y-PATTERN-STRIPES`).
6. Text holds still for reading (`A11Y-MOTION-READING` (dropped; owner `TYPO-HOLD`), `A11Y-TEXT-DWELL` (dropped; owner `TYPO-HOLD`)).
7. `reducedMotion` path authored (`A11Y-MOTION-REDUCED-VARIANT`).
8. Captions generated from script/TTS cues, with speaker IDs and tags (`A11Y-CAPTION-*`), styled per `TYPO-CAPTION-*`, inside `TYPO-SAFE`.
9. Post-encode re-analysis of flash, contrast and captions.
10. Alt text and post copy written (`A11Y-ALT-TEXT`, `A11Y-VIDEO-ONLY-ALT`).
11. Series tokens locked (`A11Y-SERIES-CONSISTENT`).

---

## 20. Caveats

- **Sources disagree:**
  - **Area.** WCAG uses a fixed 10° field (341×256 CSS px); ITU and Ofcom use 25% of the displayed screen. On phones they roughly coincide; on desktop full screen WCAG is far stricter.
  - **Luminance basis.** WCAG uses relative luminance (10%, darker < 0.80); ITU uses absolute cd/m² (20 cd/m², darker < 160). They agree at the assumed 200 cd/m² SDR peak, but not on brighter phones.
  - **Red flash.** WCAG 2.2's chromaticity definition replaced the 2.0/2.1 "(R-G-B)x320" formula. Older tools (including PEAT 1.6, from 2017) may implement the old one.
  - **Reading rate.** BBC (160–180 wpm), DCMP (130–160 wpm educational), Netflix (20 CPS). Secondary sources disagree on whether BBC's 160–180 wpm is a general or live rate. No law sets one.
- **Weak evidence:**
  - there is no validated numeric threshold for vestibular-safe motion; all `A11Y-MOTION-*` thresholds are heuristic;
  - extended-flash (> 5 s) risk has no threshold in any standard;
  - CVD simulations are approximations;
  - the PSE prevalence figure (Epilepsy Action: "around 1 in 4000 people overall") was read from a search snippet of the charity's page, not a full fetch.
- **Unverified primary pages:** the BBC Subtitle Guidelines (not fetched; figures from secondary republication); the Netflix style guide; the ACM/PMC PSE gap-analysis full text (recaptcha); the Ofcom Annex 1 full text (snippets only).
- **Likely to go out of date:**
  - platform features (auto-captions, alt-text fields, photosensitivity filters);
  - EN 301 549 V4.1.1 citation in the Official Journal, after which WCAG 2.2 becomes the EAA benchmark;
  - DOJ may issue further Title II rulemaking;
  - WCAG 3.0 is a working draft and not a target;
  - BBC guideline versioning (1.2.3 → 1.2.5+).
- **Agent failure modes:**
  - homogenised "accessible" style;
  - over-flagging single cuts;
  - treating AAA as mandatory;
  - trusting platform filters;
  - judging motion from stills;
  - measuring contrast on one frame;
  - captioning every whoosh, or none.

---

## 21. Verification ledger (checked 2026-11-06)

| Claim | Result | Source checked |
|---|---|---|
| 2.3.1 text "more than three times in any one second period … below the general flash and red flash thresholds" | confirmed | W3C Understanding 2.3.1 (fetched) |
| General flash: ≥ 10% of max relative luminance, darker < 0.80 | confirmed | W3C Understanding 2.3.1 |
| Area: .006 sr / 25% of any 10° field; 341×256 at 1024×768; 87,296 CSS px | confirmed | W3C Understanding 2.3.1 |
| Red flash (2.2): R/(R+G+B) ≥ 0.8 and Δu′v′ > 0.2 | confirmed | W3C Understanding 2.3.1 |
| Old red flash (R-G-B)x320 > 20 | confirmed (historic) | W3C WCAG 2.0 Understanding (search result text) |
| Fine-pattern exception < 0.1° squares | confirmed | W3C Understanding 2.3.1 |
| Loops analysed while looping; analyse at full screen | confirmed | W3C Understanding 2.3.1 |
| HDR: 20 cd/m², darker < 160; Michelson 1/17 | confirmed | W3C Understanding 2.3.1; ITU-R BT.1702-3 (fetched) |
| ITU: > 25% screen and > 3 flashes / 1 s; 360 ms (50 Hz) / 334 ms (60 Hz) | confirmed | ITU-R BT.1702-3 PDF |
| ITU: > 5 s flashing may be a risk | confirmed | ITU-R BT.1702-3 |
| ITU patterns: > 5 pairs; 40% static; 25% moving; smooth flow exempt | confirmed | ITU-R BT.1702-3 Attachment 1 |
| ITU SDR peak 200 cd/m², HLG 1 000 cd/m² | confirmed | ITU-R BT.1702-3 Notes 2–3 |
| Photosensitivity most prevalent < 20 years | confirmed | ITU-R BT.1702-3 Annex 5 |
| Ofcom Rule 2.12 wording; guidance re-issued 25 July 2005 | confirmed (snippet) | Ofcom Section 2 guidance notes PDF (search result); Merlin/OBS |
| No standard gives extended-flash thresholds | unverified (snippet only; full text behind recaptcha) | ACM TACCESS 2024 / PMC11872230 |
| PSE "around 1 in 4000 people overall"; "3 to 5%" of people with epilepsy | confirmed (official page; quote from search snippet) | Epilepsy Action, "Photosensitive epilepsy" (updated 6 Jan 2026) |
| PEAT free, commercial broadcast/film/gaming use prohibited, v1.6 | confirmed | trace.umd.edu/peat (search result) |
| 2.2.2 "lasts more than five seconds" | confirmed | WCAG 2.2 (subagent fetch) |
| 2.3.3 text; motion animation definition | confirmed | WCAG 2.2 (subagent fetch) |
| 1.2.1/1.2.2/1.2.3/1.2.4/1.2.5/1.2.7 texts | confirmed | WCAG 2.2 (subagent fetch) |
| AD waiver when audio conveys all important visual info | confirmed | W3C Understanding 1.2.3/1.2.5 (subagent) |
| 1.4.3 4.5:1 / 3:1; large scale 18 pt / 14 pt bold | confirmed | WCAG 2.2 (subagent) |
| 1.4.11 3:1 graphics; 1.4.1 colour-alone text | confirmed | WCAG 2.2 (subagent) |
| WCAG 2.2 Recommendation dated 12 Dec 2024 (republication) | confirmed | w3.org/TR/WCAG22 (fetched) |
| FCC 79.1(j)(2) synchronicity, completeness, placement wording | confirmed | eCFR 47 CFR 79.1 (search result text) |
| FCC sets no numeric accuracy percentage | unverified (secondary) | closedcaptioncreator.com |
| DCMP sound effects bracket/lowercase/italic; no music caption < 5 s; lyrics verbatim | confirmed | dcmp.org Captioning Key pages (search result text) |
| DCMP rates 130/140/160 educational; 150–160 adult special interest | confirmed (secondary for 130/140/160; primary-derived PDF for 150–160) | markstudios.com; UWM-hosted Captioning Key PDF |
| BBC 160–180 wpm; 0.33–0.375 s/word; 0.3 s/word minimum | unverified (BBC page not fetched) | clevercast.com; subagent secondary sources |
| BBC 9:16: three lines; central 75% vertical / 90% horizontal | unverified (secondary republication of v1.2.3) | broadcastwriter.com |
| Netflix §II.17: "Up to 20 characters per second" adult / "Up to 17" children; "words per minute removed" | confirmed (official page; rate quote from search snippet, fetch cut off before it) | Netflix Partner Help Center, English (USA) Timed Text Style Guide |
| CVD: Birch 2012 "about 8% in men and about 0.4% in women" (European Caucasians), "4% and 6.5%" (Chinese and Japanese men); PMC review "up to 8% of males and 0.5% of females" | confirmed (abstract/snippet; not fetched in full) | Birch, JOSA A 29:313–320 (2012) via Semantic Scholar; PMC12385717 |
| Brettel for tritan; Viénot/Machado for protan/deutan; "approximate" | confirmed | daltonlens.org review |
| COGA 8 objectives | confirmed | w3.org/TR/coga-usable (subagent) |
| EAA applies 28 June 2025; pre-June 2025 prerecorded media excluded; microenterprise definition | confirmed (secondary quoting Directive) | alugha.com EAA article |
| EN 301 549 V4.1.1 published Sept 2026, awaiting OJ citation | unverified (secondary; conflicting secondary said "expected November") | alugha.com; levelaccess.com |
| BFSG fines up to €100,000 | unverified (secondary) | alugha.com |
| ADA Title II IFR: 26 April 2027 / 26 April 2028; effective 20 April 2026 | confirmed | Federal Register 2026-07663 (search result text) |
| Seyfarth: "3,117 website accessibility lawsuits in federal court in 2025 – a 27% increase from 2024"; "3,117 out of 8,667 cases" | confirmed (primary, fetched) | Seyfarth Shaw ADA Title III blog, 25 Mar 2026 |
| TikTok auto captions launch, English/Japanese initially, creator-editable, photosensitivity warning and filter | confirmed | TikTok Newsroom (search result text) |
| YouTube "quality … may vary … always review automatic captions" | confirmed | YouTube Help 6373554 (search result text) |
| YouTube AD track for multi-language audio creators | confirmed | YouTube Help 13338784 (search result text) |
| X SRT upload; image descriptions via +ALT | confirmed | help.x.com (search result text) |
| Instagram Reels lack alt text field | unverified (secondary) | alttext.ai; maestra.ai |
| Phone viewport mapping (87,296 CSS px ≈ 26% of 393×852) | VCR derivation (heuristic) | arithmetic on W3C figure |

---

## 22. Sources

The numbered list below matches the escaped `\[n\]` markers in the text. The documents it draws on are named throughout this reference and in the verification ledger. The primary documents are: W3C WCAG 2.2 and its Understanding pages for 2.3.1, 1.2.3 and 1.2.5; ITU-R BT.1702-3 (11/2023); Ofcom Broadcasting Code Section 2 guidance notes (Annex 1); eCFR 47 CFR § 79.1; the DCMP Captioning Key; the BBC Subtitle Guidelines; W3C COGA "Making Content Usable for People with Cognitive and Learning Disabilities"; the DaltonLens CVD simulation review; the Federal Register ADA Title II Interim Final Rule (20 April 2026); Directive (EU) 2019/882; the TRACE Center PEAT page; and the YouTube, X, Instagram and TikTok help and newsroom pages.


1. [Understanding Success Criterion 2.3.1: Three Flashes or Below Threshold | WAI | W3C](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
2. [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
3. [Understanding Success Criterion 2.3.1](https://www.w3.org/TR/UNDERSTANDING-WCAG20/seizure-does-not-violate.html)
4. [What are the accessibility requirements for flashing content?](https://accessibleweb.com/question-answer/what-are-the-accessibility-requirements-for-flashing-content/)
5. [Guidance Notes Issue Twelve: 18 July 2017 Guidance Notes Section 2:](https://www.ofcom.org.uk/siteassets/resources/documents/tv-radio-and-on-demand/broadcast-guidance/programme-guidance/broadcast-code-guidance/section-2-guidance-notes.pdf?v=322622)
6. [Recommendation ITU-R BT.1702-3 (11/2023)](https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1702-3-202311-I!!PDF-E.pdf)
7. [eCFR :: 47 CFR 79.1 -- Closed captioning of televised video programming.](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-C/part-79/subpart-A/section-79.1)
8. [FCC Closed Captioning Requirements](https://www.closedcaptioncreator.com/blog/articles/fcc-closed-captioning-requirements.html)
9. [Captioning Key - Sound Effects and Music](https://dcmp.org/learn/602-captioning-key---sound-effects-and-music)
10. [Captioning Tip Sheet](https://dcmp.org/learn/225-captioning-tip-sheet)
11. [Understanding Success Criterion 1.2.3: Audio Description or Media Alternative (Prerecorded) | WAI | W3C](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded)
12. [European Accessibility Act (EAA): Scope, Dates, Video Rules](https://alugha.com/cms/european-accessibility-act/)
13. [Accessible Motion & Animation: prefers-reduced-motion & WCAG — A11yPath](https://a11ypath.com/guides/motion-and-animation/)
14. [Understanding SC 2.3.3: Animation from Interactions (Level AAA)](https://w3.org/WAI/WCAG21/Understanding/animation-from-interactions)
15. [Review of Open Source Color Blindness Simulations](https://daltonlens.org/opensource-cvd-simulation/)
16. [Color Vision Deficiency (CVD) Simulation Shader - Godot Shaders](https://godotshaders.com/shader/color-vision-deficiency-cvd-simulation-shader/)
17. [Color Vision Deficiency Simulation: Methods, Accuracy, and Future Directions](https://blog.tynge.app/2023/07/color-vision-deficiency-simulation.html)
18. [Use automatic captioning - YouTube Help](https://support.google.com/youtube/answer/6373554?hl=en)
19. [How to Add Alt Text on Instagram](https://alttext.ai/blog/instagram-alt-text)
20. [How to use video captions on X / Twitter - RNID](https://rnid.org.uk/information-and-support/technology-and-products/how-to-use-video-captions-subtitles-social-media-accessibility/twitter/)
21. [How to upload caption (.srt) file to Posts](https://help.x.com/en/using-x/upload-caption-srt-file)
22. [\[contents\]W3C Web Content Accessibility Guidelines (WCAG) 2.0](https://www.w3.org/WAI/WCAG20/versions/guidelines/wcag20-guidelines-20081211-letter.pdf)
23. [\[contents\] Web Content Accessibility Guidelines (WCAG) 2.0](<https://ysu.edu/sites/default/files/mathematics-achievement-center/Hawkes%20Learning_Web%20Content%20Accessibility%20Guidelines%20(WCAG)%202.0.pdf>)
24. [Subtitle Reading Speed: CPS & WPM Limits Explained (2026)](https://www.closedcaptioncreator.com/blog/articles/subtitle-reading-speed.html)
25. [Understanding Success Criterion 1.2.5: Audio Description (Prerecorded) | WAI | W3C](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html)
26. [Federal Register :: Extension of Compliance Dates for Nondiscrimination on the Basis of Disability; Accessibility of Web Information and Services of State and Local Government Entities](https://www.federalregister.gov/documents/2026/04/20/2026-07663/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web)
27. [DOJ Issues Interim Final Rule on Title II Digital Accessibility Compliance Dates](https://accessibility.arizona.edu/news/doj-issues-interim-final-rule-title-ii-digital-accessibility-compliance-dates)
28. [\[GB\] BBC breaches Ofcom's Code about reducing the risk ...](https://merlin.obs.coe.int/article/7418)
29. [BBC broke epilepsy rule with flashing Olympics logo, rules Ofcom](https://www.pinsentmasons.com/out-law/news/bbc-broke-epilepsy-rule-with-flashing-olympics-logo-rules-ofcom)
30. [Photosensitive epilepsy](https://en.wikipedia.org/wiki/Photosensitive_epilepsy)
31. [FCC Closed Captioning Quality Standards for Video Programming](https://www.3playmedia.com/blog/fccs-new-quality-standards-closed-captioning-video-programming/)
32. [How to Add Captions to X (Twitter) Video in 2026 · Blitzcut](https://blitzcutai.com/blog/how-to-add-captions-x-twitter-video)
33. [Add Multi-language features to your videos - YouTube Help](https://support.google.com/youtube/answer/13338784?hl=en)
34. [YouTube Studio Update: Find Captions and Audio Description](https://meryl.net/youtube-accessibility-captions-descriptive-audio-guide/)
35. [(PDF) Evaluating color vision deficiency daltonization methods using a behavioral visual-search method](https://www.researchgate.net/publication/288917849_Evaluating_color_vision_deficiency_daltonization_methods_using_a_behavioral_visual-search_method)
36. [Twitter Alt Text: How to Add Image Descriptions on X](https://www.lilachbullock.com/twitter-alt-text/)
