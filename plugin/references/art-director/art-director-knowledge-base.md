# VCR Art Direction Knowledge Base (`ART-*`): Colour, Composition and Visual Consistency

An AI art director in VCR can reliably measure colour fidelity, gamut, delivery integrity, value structure, safe-zone compliance and series drift. Focal placement, clutter and colourfulness can only be measured roughly. "On-brief", "generic" and "expressive" stay judgement-only. Colour science and platform specs have the strongest evidence; the rule of thirds, 60-30-10 and harmony wheels have the weakest.

## TL;DR

- **Build tokens in OKLCH, judge brand fidelity in CIEDE2000, and judge the decoded H.264 file, not the PNG.**
  - CSS Color 4 sets the gamut-mapping JND at an OkLCh difference of 0.02.\[1\]
  - Under `yuv420p`, saturated colour-only edges degrade most, so focal and text edges need *luminance* contrast.
- **Composition rules are defaults, not laws.**
  - Amirshahi et al. (2014) found aesthetic ratings correlated "not at all" with computed rule-of-thirds values.\[2\]\[3\]
  - What matters for 9:16 is the platform safe zones (templates that change without notice), plus one dominant focal point per beat that survives the greyscale test and a thumbnail downscale.
- **Saliency and clutter models predict photos better than graphics.** Use them comparatively, against a series baseline. Series consistency comes from frozen style frames and tokens with declared variation slots; without them, agents drift to generic defaults.

> **Status.** Seed knowledge base for `references/art-director/`. It covers colour systems, colour difference, delivery colour management, value structure, composition (9:16 first), saliency and clutter, style, series consistency, cover frames, the generic look, measurement and critique vocabulary. Typography is out of scope except as compositional mass (see `TYPO-*`). Research date: 2026-11-06.
>
> **Tiers.**
> - `standard`: a published standard or specification, checked against the primary source.
> - `platform`: vendor-published, may change without notice; re-verify quarterly.
> - `heuristic`: practitioner rule, secondary source, or a **VCR default**. VCR defaults are *uncalibrated* starting thresholds to tune against human review.
>
> **Evidence labels.** **[A]** = audience-behaviour evidence. **[T]** = expert taste.

---

## Key findings

1. **Gamut mapping.** The W3C CSS Color 4 spec (Candidate Recommendation Draft, 3 November 2026) says all three of its algorithms "aim at constant-lightness, constant-hue chroma reduction in the OkLCh color space", and "For the OkLCh color space, one JND is an OkLCh difference of 0.02." `standard`\[1\]
2. **HSL/HSV misleads.** Ottosson: an HSV hue sweep at constant value and saturation is "quite uneven and there are clear differences in lightness for different hues. Yellow, magenta and cyan appear much lighter than red and blue." Oklab now ships in Photoshop gradients, CSS Color 4/5, Unity and Godot.\[4\]
3. **CIEDE2000 is easy to get wrong.** Sharma, Wu and Dalal (2005) published supplementary test data because the original sample data missed implementation errors. They also document discontinuities in the formula.\[5\]\[6\]
4. **Print and brand tolerances are single-digit ΔE00.**
   - Idealliance G7: "Colorimetric tolerances, unless otherwise stated, are based on the CIEDE2000 color difference formula".\[7\]
   - 3M brand print spec: draw-downs "less than or equal to 2.0 Delta" (ΔE00).\[8\]
   - G7 Targeted: solids "within 5ΔE" of the ISO 12647-2 aims (via a vendor white paper).\[9\]
   - Transferring these to screen is a heuristic.
5. **The rule of thirds has weak support** [A]. Amirshahi et al. (2014; 30 participants): "aesthetic rating scores correlated only weakly with subjective ROT scores and not at all with calculated ROT values". They conclude it "seems to play only a minor, if any, role in large sets of high-quality photographs and paintings."\[2\]\[10\]\[11\]
6. **Harmony tracks hue similarity and learned associations, not wheel geometry** [A].
   - Palmer and Schloss's ecological valence theory (*PNAS* 107, 2010): weighted object valence explained 80% of the variance in average preference across 32 chromatic colours rated by US adults, against 37% for a cone-contrast model. A Japanese replication (Yokosawa et al. 2016) reached only 37%.
   - Harmony ratings explained 62% of the variance in pair preference, and similar-hue pairs were rated more harmonious.\[12\]\[13\]
7. **Safe zones are templates, not numbers, and they disagree.** `platform`
   - TikTok In-Feed ads (page updated June 2026): "The safe zone size is determined by the dimension (vertical, horizontal, or square), ad caption length, and any additional formats used."\[14\]
   - Meta Reels: "roughly 14% of the top, 35% of the bottom, and 6% on each side" (Facebook Reels page). Secondary sources quote the Instagram Reels video page as "at least 14% of the top, 35% of the bottom, and 6% on each side".
   - Google publishes a 1080×1920 PNG template that third parties measure at 288/672/48/192 px.\[15\]\[16\]
8. **Saliency models are tuned to photographs** [A].
   - DeepGaze IIE scores MIT300 AUC 88.3%, sAUC 79.4% and CC 82.4%.\[17\]
   - Bylinskii et al. (UIST 2017) had to train separate importance models: one on "a dataset of 1K graphic designs with GDI annotations" (1,078 designs), and one on BubbleView "mouse clicks… on 1.4K MASSVIS data visualizations" (1,411).
9. **Clutter is measurable** (Rosenholtz, Li and Nakano 2007).
   - Colour variability, "accounted for by Feature Congestion but not the Edge Density measure or the Subband Entropy measure, does matter for visual clutter."\[18\]
   - JPEG file size correlated highly with Feature Congestion, which makes it a cheap proxy.\[19\]
10. **4:2:0 stores one chroma sample per 2×2 block.** Thin saturated colour-only edges bleed, and red on white is the classic worst case (secondary sources).\[20\]\[21\] Hierarchy must therefore be carried by luminance.

---

## 1. Colour systems

### 1.1 Palette by role

| Role | Count | Rule |
|---|---|---|
| Ground | 1–2 | Sets the value key; neutral, slightly tinted towards the brand hue |
| Surface/panel | 1–2 | Separated from ground by OKLab **ΔL**, not hue alone |
| Ink | 1–2 | Governed by `TYPO-*` |
| Brand primary | 1 | Exact tokens, ΔE-checked |
| Accent/signal | 1 (max 2) | Highest chroma in the frame; reserved for the one thing to look at |
| Semantic | 2–3 | Right/wrong, status and category colours; pair with shape or icon for colour-vision deficiency (CVD) |

**60-30-10:**
- The rule comes from interior decorating. A practitioner calls it "just like an old wives' tale", and a trade article admits "its origin is unclear".\[22\]\[23\] No study tests it.
- The real principle underneath it: one colour should dominate by area, and the accent should be scarce enough to pop out.
- Measure accent area fraction and region count, not a 10% target. `heuristic`

**Failure modes:**
- "Confetti": many equal-weight hues.
- Accent colour used as decoration, so viewers stop treating it as a signal.
- Semantic red and green that differ only in hue. They collapse under deuteranopia and under 4:2:0.

### 1.2 Perceptual spaces

- **HSL/HSV** reparameterise sRGB. Equal HSL lightness is not equal perceived lightness: yellow at L=50% reads far lighter than blue at L=50%. Hue-rotated palettes therefore create accidental focal points.
- **CIELAB** separates L* from a*/b* and underlies ΔE76/94/2000. Its hues are non-linear in the blues.
- **Oklab/OKLCH (Ottosson 2020)** is fitted to perceptual data with a D65 white point.\[4\] It "predicts hue, lightness and chroma well, while being simple to compute".\[4\]\[24\]
  - In the Smashing Magazine interview, Ottosson says Oklab "doesn't account for viewing conditions, such as the background color".\[25\] It is not an appearance model, so Albers-style simultaneous contrast is not captured.
- **Hue singularity:** near C=0 the OKLCH hue is undefined. A 2026 arXiv paper documents "inter-hue cast" when interpolating near-neutrals in OKLCH.\[26\] Interpolate greys in Oklab instead.
- **Practice:**
  - Write tokens as `oklch(L C H)`.
  - Build ramps by stepping L at fixed H, reducing C towards the ends of the ramp.
  - Gamut-check every token.

### 1.3 Tints, shades, neutrals

- Shade = lower L and lower C. Tint = higher L and lower C.
- Painters shift hue in shadows (often cooler) and lights (often warmer) rather than adding black (Gurney, *Color and Light*). This is a few degrees of H per step and is a choice, not an error [T].
- Tint neutrals slightly towards the brand hue (OKLCH C≈0.005–0.02) to unify the frame [heuristic].
- "Muddy" usually means mid-L, low-to-mid C, often from mixing complements or lowering opacity over a complementary ground.

### 1.4 Harmony: theory vs evidence

- Wheel schemes (complementary, analogous, triadic) descend from Goethe, Chevreul and Itten. Use them as generation vocabulary, not as justification.
- Schloss and Palmer separate pair preference, pair harmony and figural preference [A]:\[13\]
  - harmony rises with hue similarity;\[12\]
  - lightness contrast matters;\[27\]
  - single-colour preferences only weakly predict pair preferences.\[27\]
- Ecological valence theory says preferences are learned from object associations (blue with sky, brown with rot).\[28\] They are cultural and contextual.\[29\] Where a subject has its own colour codes (team kits, ranks, status or category colours), those learned associations override palette logic.
- **Agent rule:** analogous base plus one contrasting accent, separated by lightness. `heuristic`, judgement-only.
- **Expressive break:** vibrating, high-chroma complements suit energetic hooks. They work when the clash is confined to one region or moment, the value structure still reads, and no text sits on the vibrating edge.

---

## 2. Colour difference and brand tolerances

| Metric | Use | Notes |
|---|---|---|
| ΔE76 | Avoid for decisions | Over-weights saturated differences |
| ΔE00 | Brand fidelity | Validate against the Sharma–Wu–Dalal test data; intended for small differences\[5\] |
| ΔEOK | Gamut mapping, palette checks | CSS Color 4: one JND is 0.02 in Oklab units, not 2\[1\] |

**JND folklore.** "ΔE ≈ 1 is just noticeable" holds only as an order of magnitude; it depends on observer, field size, surround and media. The only formally stated JND verified here is CSS Color 4's 0.02 (OkLCh).

| Source | Tolerance | Context |
|---|---|---|
| Idealliance G7 | Tolerances "based on the CIEDE2000 color difference formula, abbreviated as ΔE00" | Press/proof\[7\] |
| G7 Targeted (EFI white paper, secondary) | Solids "within 5ΔE of ISO 12647-2 primary and two-color overprint solid standards" | Offset\[9\] |
| 3M CGS1200 | "Allowable Delta E Tolerances for ALL ink draw-downs must be less than or equal to 2.0 Delta", ΔE00 l:c 1:1 | Brand print\[8\] |
| TAGA 2020 | ISO 12647-7:2016 control-bar average "one ΔE00 tighter" than G7 Colorspace | Proofing\[30\] |
| Practitioner forum | ISO 12647 solids within 5 ΔEab with ΔH ≤ 2.5 | Unverified\[31\] |

**VCR defaults** (*uncalibrated*, derived by analogy from print):
- ΔE00 ≤ 1.0 from token to rendered PNG in flat areas. Anything larger means a pipeline bug (colour space, opacity or blending).
- ΔE00 ≤ 3.0 from token to the decoded MP4 patch mean, eroded 8 px from edges.

---

## 3. Colour management for delivery

| Space | Primaries | Range | VCR role |
|---|---|---|---|
| sRGB (IEC 61966-2-1) | Same as BT.709 | Full 0–255 | Browser and PNG working space |
| Display P3 | Wider, D65 | Full | Phone panels; CSS `color(display-p3 …)` |
| BT.709 | Same as sRGB | **Limited**: Y′ 16–235, Cb/Cr 16–240 (8-bit) | H.264 delivery\[32\] |

sRGB and BT.709 share primaries, so the delivery risks are range, matrix and transfer interpretation, not gamut.

- **P3 → sRGB.**
  - Gamut-map once, at token build, using the CSS Color 4 binary search on OKLCH chroma (JND 0.02).\[1\]\[33\]
  - Naive clipping shifts hue (yellows go green, blues go purple) and bands.\[34\]
  - lightningcss issue #1298 reports an early-return bug that gives "consistently less saturated" fallbacks: 104 of 2,719 cases exceeded 0.02.\[35\]
  - Never let the renderer decide. Browsers have historically clipped (Evil Martians, secondary; possibly out of date).\[36\]
- **Range and matrix.**
  - Converting PNG to `yuv420p` must declare input range `pc`, output range `tv` and the BT.709 matrix, and must tag the stream. The Canva engineering blog documents an explicit `-colorspace/-color_primaries/-color_trc/-color_range` recipe.\[37\]
  - A wrong range lifts or crushes blacks.\[38\] A BT.601 matrix shifts reds and greens.
  - The decoder can be the bug: OpenCV's FFmpeg backend has been reported to ignore BT.709 tags and decode as BT.601 (opencv #20513).\[39\]
- **4:2:0 and re-encodes.**
  - One chroma sample per 2×2 block bleeds saturated edges about 1 px and softens thin coloured lines and small coloured text; red is worst.\[20\]\[21\]
  - Platform re-encodes add banding in dark gradients and noise around saturated edges.
  - **Rules:**
    - carry hierarchy with ΔL;
    - make information-carrying strokes ≥ 4 px at 1080 width, or outline them;
    - dither large dark gradients;
    - test the decoded file after a simulated lower-bitrate re-encode.
- **Phones and dark UI.**
  - Viewers watch on bright OLED panels inside dark app chrome, with white overlays on top of the video.
  - Huge pure-white fields are harsh, and deep shadows vanish in daylight and in quantisation.
  - Default: keep critical detail at OKLab L ≥ 0.2 and avoid large fields above L 0.97 unless intended.
  - App-level colour management is undocumented (unverified), so test on devices.

---

## 4. Contrast beyond text: value structure

- **Value does the work; colour gets the credit.** Hierarchy and depth ride mainly on lightness (Gurney; notan practice) [T].
- **Figure-ground** needs a difference from the focal element's *local* surround, not from the frame average.
- **Masses:** strong frames group into 2–4 value masses. Many scattered, equal values read as "busy" or "flat".
- **Simultaneous contrast (Albers):** a brand colour on navy looks lighter and more saturated than on white. Token ΔE cannot see this, so check in context.

**Greyscale test (measurable).**
1. Convert to OKLab L.
2. Gaussian blur with σ ≈ 1% of frame height (the squint test).
3. Check:
   - (a) focal mean L vs a ring dilated 5% of frame height: **ΔL ≥ 0.15** (*VCR default*);
   - (b) k=3 clustering on L gives centres ≥ 0.15 apart;
   - (c) the highest-contrast region overlaps the intended focal element.

**Expressive break:** high-key or low-key moods are legitimate when declared in the brief, but they still need local focal contrast.

---

## 5. Composition

### 5.1 Weight and balance

- **Visual weight** grows with: size, contrast, saturation, isolation, faces and text, sharpness, and height or peripheral position (Arnheim) [T].
- **Evidence** [A]:
  - McManus et al. (2011, cited in Amirshahi) "found no evidence" for Arnheim's balance theory.\[10\]
  - Palmer et al. (2008) confirmed a centre bias for forward-facing symmetrical objects. Left- or right-facing objects were preferred off-centre.\[10\]
- **Rule:** centre symmetric front-facing heroes; give directional subjects lead room.

### 5.2 Rule of thirds

- John Thomas Smith (1797) framed it as a 2:1 proportion of elements, not as intersection placement.\[2\]\[10\]
- Amirshahi et al. (2014): computed rule-of-thirds (ROT) scores did not predict ratings. Highly rated photos and paintings scored about as low as non-ROT photos.\[2\] Mai, Le, Niu and Liu's classifier (IEEE ISM 2011) "achieves around 80% of accuracy in detecting the rule of thirds", tested on 2,089 ROT and 2,051 non-ROT photos. So ROT is *detectable*, but that is not quality.
- **VCR:** never fail a frame for thirds placement. If thirds are used at all, compute them inside the safe area; full-frame lower thirds land in the caption and UI zone.

### 5.3 Attention hierarchy

- **Short-form drivers**, in rough order (heuristic ordering):
  1. motion onset;
  2. faces;
  3. text;
  4. local luminance contrast;
  5. unique colour;
  6. size;
  7. isolation;
  8. converging lines and gaze.
- **Hierarchy:** one primary, 1–2 secondary, the rest tertiary. Example quiz: question or subject image, then options, then brand and progress.
- **Leading lines** (limbs, edges, horizons, arrows) should end at the focal element, not run into the UI rail.

### 5.4 Negative space and occupancy

- Negative space isolates the focal element.
- On Reels, the top ~14% and bottom ~35% are effectively negative space for content: use them for ground only.\[40\]
- **Occupancy** = foreground area / safe area. *VCR default* band: 25–60%.

### 5.5 Grid for 9:16

- 4 columns, 64–72 px margins inside the safe box, and an 8 px baseline shared with `TYPO-*`.
- Snap major edges to the grid so drift between episodes is measurable.
- Keep the right action rail clear. Bias focal mass to centre or slightly left.

### 5.6 Framing in motion

1. Across cuts, place the new focal element near the old one, or signpost the move with motion (Block's continuity of contrast and affinity).
2. One focal change per beat, aligned to `markers`.
3. Keep the hero's bbox inside the safe area at **every** frame, not just at keyframes.
4. Hold for reading (`TYPO-*`).

**Agent failure:** judging motion from a few stills misses eye-trace jumps and mid-move collisions.

---

## 6. Saliency and clutter models

| Model | Strength | Weakness for VCR |
|---|---|---|
| Itti–Koch–Niebur 1998 | Interpretable bottom-up colour/intensity/orientation | Ignores text, faces, semantics |
| DeepGaze II/IIE (Kümmerer; Linardos 2021) | MIT/Tübingen leader; IIE MIT300 AUC 88.3% | Natural images; centre-bias prior\[41\]\[42\] |
| Bylinskii 2017 GDI/MASSVIS importance | Built for designs and visualisations; used for thumbnails and retargeting | Static; importance ≠ fixation\[43\] |
| Fosco et al. 2020 (UMSI lineage) | Across design types incl. mobile UI | Static; text-weighted |
| Feature Congestion / Subband Entropy | Clutter from colour, orientation, contrast / redundancy | Validated on maps and displays, not motion\[18\]\[19\]\[44\] |

**Use:**
- Comparatively. Did a change move saliency towards the intended element, and does that element hold the largest mass share?
- Prefer design-importance models for UI-like frames, with a plain contrast map as a cross-check.
- Disable the centre prior when testing placement.
- No static model captures motion onset, which dominates attention in video.

---

## 7. Style and visual language

- **Shape language** [T]: circles read friendly, squares stable, triangles dynamic. Match the subject's energy: diagonal or angular shapes for dynamic or physical subjects, rounded containers for approachability.
- **Tokens:**
  - strokes, e.g. 2/4/8 px at 1080 width;
  - radii, e.g. 0/12/24/full;
  - one icon family.
  - Mixed radii and strokes are the main "assembled from kits" tell. Measurable from computed styles × scale.
- **Illustration:** one style per series, one perspective, one light direction. Unify mixed sources (stock, AI, photo) with a palette remap, grain or outline.
- **Depth:**
  - cues: overlap, scale, atmospheric perspective (less contrast and chroma with distance), parallax;
  - shadows from **one** light direction. Inconsistent shadow angles are a common agent error, checkable from `box-shadow`/`drop-shadow` offsets.
- **Grain:** it adds tactility and dithers gradients against banding, but too much becomes encoder mush. Seed it by frame index for determinism.
- **3D (Blender):**
  - Three-point lighting: key sets the shadow direction, fill lifts shadows, rim separates the silhouette. Key:fill ratios (often quoted as 2:1–4:1) are folklore with no traceable standard.
  - Use Principled BSDF materials with non-zero roughness and HDRI reflections.
  - The view transform matters: Standard preserves sRGB brand values, while AgX/Filmic desaturate brights by design. Declare which one per shot.
  - Check that the silhouette reads at thumbnail size.

---

## 8. Series consistency vs variation

- **Industry practice** [T]:
  - style frames (finished frames before animation);
  - style guides and look books (palette, type, grid, shape, motion language, do/don't).
- **Invariants:** logo lock-up, palette roles, type, grid, transition signature, sting.
- **Variables:** hero image, per-category accent, background pattern.
- **For large batches:**
  1. Freeze a series token file.
  2. Declare variation slots.
  3. Measure drift against style frames: dominant-cluster ΔE00, anchor alignment, clutter and colourfulness within mean ± 2 SD of approved episodes (*VCR default*).
  4. Measure monotony: cover-frame perceptual-hash distance to recent episodes.
- **Agent risk:** regression to library defaults or the previous episode's quirks. Always load tokens; never "remember" the style.

---

## 9. Cover frames and thumbnails

- Covers are seen small and cropped. Instagram's profile grid reportedly shows Reels as a 3:4 centre crop (1080×1440), cutting 240 px top and bottom (secondary; verify).\[45\]
- **What works** [T, partly A from retargeting research]:
  - one large focal subject or face at high local contrast;
  - ≤ 3–5 words of large text;
  - a strong blurred value pattern;
  - a series frame device in a fixed position;
  - nothing critical in the crop margins.
- **Test:** downscale to 180 px wide (*VCR default*). The focal bbox should be ≥ 8% of the area and pass ΔL ≥ 0.15.
- **Frame 0** must be composed, not black or a fade-in, because previews autoplay muted.

---

## 10. Platform safe zones (1080×1920), checked 2026-11-06

| Platform | Official form | Figures | Confidence |
|---|---|---|---|
| TikTok In-Feed ads | Template ZIPs (Standard, With Anchor; LTR and Arabic RTL); "Last updated: June 2026" | No official numbers. Third-party readings: ~240 top, 660 bottom, 120 sides, right widening to 300 px below y≈840 | `platform`; numbers secondary\[14\]\[46\]\[47\] |
| Meta Reels | Ads Guide text, Safe Zone guardrail, checker templates | "roughly 14% of the top, 35% of the bottom, and 6% on each side" on the Facebook Reels page; secondary sources quote the Instagram Reels video page as "at least" the same figures. ≈ 269/672/65 px; with disclaimers, bottom 40% (secondary) | `platform`; Meta page seen via snippets only |
| YouTube (Google Ads) | "Universal safe zones for video ads on YouTube" diagram and vertical PNG template | No numbers in text. Third-party measurements: 288/672/48/192 px. A Google marketing snippet says 10% top / 25% bottom / 10% right (conflicts) | `platform`; numbers secondary\[15\]\[16\]\[48\] |
| YouTube Shorts organic | In-editor guides only | Guides show "where elements such as the like button, comments and the video description might appear" | `platform`\[49\] |

**VCR union safe area (`heuristic`, strictest values):**
- 288 px top, 672 px bottom, 120 px left, 192 px right.\[46\]
- The lower-right corner (x > 780, y > 840) is also excluded.
- That leaves an ~768×960 px critical box, an argument for big, simple compositions. Ambient ground may fill the full frame.

---

## 11. Avoiding the generic look

**Tells** [T]:
- default framework palettes (indigo/violet or cyan-magenta "tech" gradients);
- centred, evenly spaced layouts;
- one easing and one fade-up entrance on everything, with uniform durations;
- purposeless glass and glow;
- mixed icon kits;
- over-smooth AI imagery with sterile light;
- uniform saturation with no value hierarchy;
- emoji as illustration.

**Push past it:**
1. One visual metaphor per episode, drawn from the subject itself (for example, a playing surface as the layout grid, or a familiar object as the progress bar).
2. An owned palette with one unexpected hue.
3. Scale contrast and asymmetry.
4. Texture and imperfection.
5. A signature easing and transition.
6. Content-specific imagery (the real subject, not stock stand-ins).
7. Edit by subtraction.

**Proxies (weak):** token values equal to library defaults; identical entrance animations; low variance in element size. The final call is judgement.

---

## 12. Critique vocabulary → measurable properties

| Term | Proxy | Fix |
|---|---|---|
| Muddy | > 50% pixels mid-L (0.35–0.65) with C < 0.05; low L variance | Separate values, clean hues |
| Busy / cluttered | Feature Congestion or edge density above series band; occupancy > 60% | Remove, group, simplify ground |
| No focal point | Diffuse saliency; no element passes local ΔL | Scale, isolate, contrast hero |
| Competing focal points | ≥ 2 regions with similar saliency and contrast | Demote one |
| Off-brand | Cluster ΔE00 above threshold; off-token radii/strokes | Restore tokens |
| Flat | Low L std; one value mode; no depth cues | Widen value range |
| Garish | Colourfulness above band; many high-C clusters | One accent, desaturate rest |
| Washed out | Decoded black ≫ Y′ 16; range mis-tag | Fix range/matrix |
| Crushed | Large L < 0.1 area with no variance | Lift shadows |
| Cramped / empty | Occupancy > 60% / < 25% | Rescale, respace |
| Generic | Defaults detected | Concept and owned style (judgement) |
| Inconsistent | Drift vs style frames | Re-apply tokens |

---

## 13. Medium-specific guidance

**9:16 social:**
- Compose inside the union box, with one focal point per beat, centred or slightly left.
- Viewers watch sound-off, so hierarchy must carry the meaning.
- **Quizzes:** options get equal weight until the reveal. The accent goes **only** on the correct answer. Wrong answers drop L or C instead of turning red.
- **Scorecards:** panel ΔL ≥ 0.15 from ground, numbers as focal, same position across episodes.
- **Annotated subject:** vignette or darken around the hero; annotation lines in a luminance-contrasting colour with an outline.
- The cover must pass the 3:4 crop and the 180 px test.

**16:9 explainers:**
- Keep critical content off the bottom ~15% (*VCR default*; check the current YouTube template).
- Thirds-based and side-by-side layouts are fine.
- Viewers watch larger, so density can be slightly higher within the series band.

**Stills:**
- Hierarchy rests entirely on scale, value and colour.
- Design to the strictest feed crop (4:5 or 1:1).
- Export sRGB, as PNG for text-heavy work where allowed.

**Loops:**
- Frame 0 and frame N must match (ΔE00 mean ≤ 1.0) with no focal jump.
- Seed ambient noise by `t mod duration`.

---

## 14. Critique process (reviewer)

Steps run in order of severity:
1. **Pipeline integrity (blocker if wrong).** Check ffprobe tags, decode explicitly, and compare palette patches between PNG and MP4.
2. **Safe zones at every frame.** Text or CTA in an overlay zone is a blocker. A partially covered focal subject is major.
3. **Brand fidelity (major).** Name the token and the ΔE00.
4. **Value structure (major).** Greyscale and blur test, reported with ΔL numbers.
5. **Focal hierarchy per beat (major).** Check it against the brief's focal metadata.
6. **Motion framing (major/minor).** Jumps, collisions, holds.
7. **Clutter and colourfulness vs series band** (minor; major if extreme).
8. **Delivery fragility.** Chroma-only edges, banding.
9. **Cover and frame 0** (major for series).
10. **Style consistency and generic look** (minor, judgement).

**Finding format:** `[severity] ART-ID @ t (frame n): observation (measured vs threshold) → why → fix`.
- Separate measured findings from judgement findings.
- Honour declared rule breaks, but still check local focal contrast.

---

## 15. Creation process (skill)

1. Read the brief: format, platforms, series slot variables, intended focal point per beat, mood.
2. Load the series tokens (pre-mapped OKLCH→sRGB). For a new series, make 3–5 style frames (cover, content, reveal, end card) and get human approval first.
3. Sketch greyscale value thumbnails per beat: 2–4 masses and one focal point.
4. Lay out on the grid inside the union box: hero, then secondary, then tertiary.
5. Colour by role, with the accent reserved for signal and semantics paired with shape.
6. Animate with focal continuity on markers: track the hero inside the safe area and hold for reading.
7. Add depth and texture: one light direction, seeded grain.
8. Self-check with the measurable `ART-*` rules over the full time series. Then encode and re-check the decoded and re-encoded files.
9. Compose the cover, then run the 180 px and crop tests.
10. Generic-look pass: replace at least one default with an owned choice.
11. Hand off with focal metadata and any declared breaks.

---

## 16. Canon

**Standards and specifications:**
- W3C CSS Color 4 (OKLCH, P3, gamut mapping);
- ITU-R BT.709;
- IEC 61966-2-1 (sRGB);
- CIE 15 and CIE 142 (CIEDE2000);
- ISO 12647-2/-7 and Idealliance G7.

**Research:**
- Ottosson 2020 (Oklab);
- Sharma, Wu and Dalal 2005 (*Color Res. Appl.* 30(1));\[50\]
- Palmer and Schloss 2010 (*PNAS* 107) and Schloss and Palmer on pair harmony;\[51\]
- Hasler and Süsstrunk 2003 (SPIE 5007);\[52\]
- Itti, Koch and Niebur 1998;
- Kümmerer et al. (DeepGaze; MIT/Tübingen benchmark);
- Bylinskii et al. 2017 and Fosco et al. 2020 (UIST);
- Rosenholtz, Li and Nakano 2007 (*JoV* 7(2));\[19\]\[53\]
- Amirshahi et al. 2014 (*Art & Perception* 2).\[10\]\[54\]

**Texts** [T]:
- Albers, *Interaction of Color* (relativity of colour).
- Arnheim, *Art and Visual Perception* (weight and balance; empirically weak).
- Bang, *Picture This* (shape and position emotion).
- Block, *The Visual Story* (contrast and affinity over time; most applicable to motion series).
- Gurney, *Color and Light* (value, temperature, gamut masks).

**Platforms:** TikTok Ads Help, Meta Ads Guide, Google Ads Help.

---

## 17. Rules table

**Applies to:** 9:16, 16:9, still, loop, video, series, all.
**Measurability:** **M** = measurable (see §18); **J** = judgement only.

| ID | Check | Threshold | Tier | Applies to |
|---|---|---|---|---|
| ART-COL-01 | Tokens in OKLCH, pre-mapped to sRGB via CSS Color 4 | All in gamut; no runtime clipping | standard | all · M |
| ART-COL-02 | Ramps by OKLCH L steps | Hue drift ≤ 5° unless hue-shift declared (*VCR default*) | heuristic | all · M |
| ART-COL-03 | Dominant colour; scarce accent | Largest cluster ≥ 40% area; accent ≤ 15% (*VCR default*) | heuristic | 9:16, 16:9, still · M |
| ART-COL-04 | Accent reserved for signal | Accent only on elements tagged `signal` | heuristic | all · M |
| ART-COL-05 | Semantics not hue-only | State colours ΔL ≥ 0.15 or shape/icon | heuristic | all · M |
| ART-COL-06 | Harmony justified by role and value | n/a | heuristic | all · J |
| ART-BRD-01 | Brand at render | ΔE00 ≤ 1.0 token→PNG (*VCR default*) | heuristic | all · M |
| ART-BRD-02 | Brand after encode | ΔE00 ≤ 3.0 token→decoded MP4 (*VCR default*) | heuristic | video · M |
| ART-BRD-03 | ΔE00 code validated | Passes Sharma–Wu–Dalal test pairs | standard | tooling · M |
| ART-DEL-01 | Delivery tags | yuv420p, BT.709 primaries/transfer/matrix, tv range | standard | video · M |
| ART-DEL-02 | Range sanity | Decoded black ≈ Y′ 16, white ≈ 235 (±2) | standard | video · M |
| ART-DEL-03 | Chroma-only fine detail | Stroke < 6 px or text < 40 px with edge ΔL < 0.1 → flag | heuristic | video · M |
| ART-DEL-04 | Dark-gradient banding | > 20% area, L < 0.3, no dither → flag; confirm on decode | heuristic | video · M |
| ART-DEL-05 | Alpha masters | ProRes 4444 with alpha; tags consistent | standard | masters · M |
| ART-VAL-01 | Focal local contrast | ΔL ≥ 0.15 vs 5%-H ring (*VCR default*) | heuristic | all · M |
| ART-VAL-02 | Grouped values | k=3 L centres ≥ 0.15 apart | heuristic | all · M |
| ART-VAL-03 | Not muddy | Mid-L low-C pixels ≤ 50% unless intended | heuristic | all · M |
| ART-VAL-04 | Shadow/highlight survival | Critical detail L ≥ 0.2; large fields ≤ 0.97 | heuristic | video · M |
| ART-CMP-01 | Info inside union safe area | 288/672/120/192 px; lower-right excluded; every frame | platform (derived) | 9:16 · M |
| ART-CMP-02 | One dominant focal point per beat | Focal bbox largest saliency share, ≥ 1.5× next (*VCR default*) | heuristic | all · M (medium) |
| ART-CMP-03 | Focal placement matches brief | Saliency/contrast centroid inside focal bbox + 5% H | heuristic | all · M |
| ART-CMP-04 | Rule of thirds never a fail criterion | n/a | heuristic (evidence) | all · J |
| ART-CMP-05 | Lead room for directional subjects | More space ahead than behind | heuristic | all · J |
| ART-CMP-06 | Occupancy band | 25–60% of safe area (*VCR default*) | heuristic | 9:16, 16:9 · M |
| ART-CMP-07 | Right rail clear | No info in right 192 px below y=840 | platform (derived) | 9:16 · M |
| ART-MOT-01 | Eye-trace continuity | Focal centroid jump ≤ 35% H between beats unless signposted (*VCR default*) | heuristic | video · M |
| ART-MOT-02 | Focal changes on beats | Within ±2 frames of a `marker` | heuristic | video · M |
| ART-MOT-03 | No mid-move collisions | ART-CMP-01 at every frame | platform (derived) | 9:16 · M |
| ART-CLT-01 | Clutter in series band | Feature Congestion or edge density within mean ± 2 SD | heuristic | all · M |
| ART-CLT-02 | Colourfulness in series band | Hasler–Süsstrunk M within mean ± 2 SD | heuristic | all · M |
| ART-STY-01 | Radii from tokens | ± 1 px | heuristic | browser · M |
| ART-STY-02 | Strokes from tokens | ± 0.5 px | heuristic | browser · M |
| ART-STY-03 | One light direction | Shadow angles within ± 15° | heuristic | all · M (DOM) / J |
| ART-STY-04 | Deterministic grain | Re-render byte-identical | heuristic | all · M |
| ART-STY-05 | Illustration/icon family consistent | n/a | heuristic | all · J |
| ART-3D-01 | Readable silhouette; lighting documented | Silhouette distinct at 180 px | heuristic | Blender · J/M |
| ART-3D-02 | View transform declared | Standard for brand-exact flats | heuristic | Blender · M |
| ART-SER-01 | Series invariants | Token hash matches; anchors ± 8 px of style frames | heuristic | series · M |
| ART-SER-02 | Avoid monotony | Cover pHash distance to last 5 above floor (tune) | heuristic | series · M |
| ART-COV-01 | Cover survives thumbnail | At 180 px: focal ≥ 8% area, passes VAL-01 | heuristic | 9:16, still · M |
| ART-COV-02 | Cover survives grid crop | Critical content in centre 1080×1440 | platform (secondary) | 9:16 · M |
| ART-COV-03 | Frame 0 composed | Mean L > 0.05 and focal present | heuristic | video · M |
| ART-LOOP-01 | Seamless loop | Frame 0 vs N ΔE00 mean ≤ 1.0 | heuristic | loop · M |
| ART-GEN-01 | No unmodified defaults as identity | Tokens ≠ library defaults; varied entrances | heuristic | all · M/J |
| ART-GEN-02 | Visual concept present | One stated metaphor per episode | heuristic | all · J |

---

## 18. How to measure in VCR

**Sampling:**
- Every frame for safe-zone and motion rules.
- Per beat for composition and value rules: at each `marker`, marker + 0.5 s (settled), and the midpoint between markers.
- Once per second for clutter and colourfulness.
- Delivery rules run on the MP4 decoded by ffmpeg, with explicit BT.709/tv interpretation.

| Rule(s) | Inputs | Calculation | Known failure modes |
|---|---|---|---|
| COL-01 | Token file | OKLCH→linear sRGB in [0,1]; CSS4 binary search (JND 0.02) | Library bugs; C≈0 hue singularity |
| COL-03/04 | PNG; metadata tags | Oklab k-means (k=6) on downsampled frame, anti-alias edges masked; cluster→token by ΔE00 | Gradients and photos fragment; small accents below cluster resolution (use DOM areas) |
| COL-05 | Rendered pixels per state | ΔL between states | Opacity and blending; read pixels, not CSS |
| BRD-01/02 | Tokens; PNG; decoded MP4; DOM bboxes | Erode bbox 8 px; mean Lab; ΔE00 | BT.601 decoders; 4:2:0 edges; overlays |
| BRD-03 | Sharma test data | Unit test in CI | Hue-mean discontinuities |
| DEL-01/02 | MP4; test card | ffprobe tags; decode raw Y′ of black/white | Tags present but conversion mismatched; players ignoring tags |
| DEL-03 | DOM sizes and colours; PNG | Edge ΔL vs ΔC in OKLab | Anti-aliasing; sample background explicitly |
| DEL-04 | PNG vs decoded/re-encoded MP4 | Count step artefacts in smooth low-L regions | Encoder strips grain |
| VAL-01–03 | PNG; focal bbox (DOM, `textBounds()`, projected 3D) | OKLab L, blur, ring statistics, k-means on L | Missing focal metadata for canvas/WebGL; ring overlaps other elements |
| CMP-01/07, MOT-03 | `getBoundingClientRect` at t; `textBounds()`; three.js projections | Bbox ⊂ safe rect | Ancestor transforms, SVG viewBox, glows from filters, untracked canvas objects |
| CMP-02/03 | PNG; saliency or importance model | Mass share in bbox; ratio vs next element | Centre prior; text dominance; photo-trained; motion-blind |
| CMP-06 | DOM bboxes or foreground alpha | Union area / safe area | Decoration counted as foreground; tag it |
| MOT-01/02 | Focal bboxes per beat; `markers` | Centroid displacement; timing offset | Intentional jump cuts |
| CLT-01 | PNG | Feature Congestion (Rosenholtz code) or Canny density; PNG size as cheap proxy | Grain inflates edges; bands need to be per format |
| CLT-02 | PNG | Hasler–Süsstrunk M | Hue-blind; small accents barely move M |
| STY-01–03 | Computed styles × cumulative scale | Distinct values; angle stats | Transient values mid-animation; evaluate settled states |
| STY-04 | Two renders | Byte diff | WebGL nondeterminism |
| SER-01/02 | Token hash; anchors; covers | Hash, anchor distance, pHash | Variation slots flagged; whitelist them |
| COV-01–03 | Cover; frame 0 | Area downscale to 180 px; re-run VAL-01; crop check | Downscale filter alters contrast |
| LOOP-01 | Frames 0 and N | ΔE00 mean | Off-by-one at the boundary |

**Reliability summary:**
- **High:** gamut, tags and range, safe-zone geometry, ΔE00 (validated code, correct decode).
- **Medium:** value and focal contrast, clutter, colourfulness (natural-image validation), dominant colours on photos.
- **Low to medium:** saliency on motion graphics.
- **None (judgement only):** generic look, concept, harmony.

---

## 19. VCR rendering and delivery notes

1. **Seeking:** `seek(t)` makes every property a time series. Measure continuous bbox paths, because mid-transition frames hide violations.
2. **Fixed fps:**
   - No motion blur unless rendered, so fast thin high-contrast lines strobe at 24/25 fps.
   - Prefer 30/60 fps or rendered blur for fast moves.
3. **Headless Chromium:**
   - Screenshots are sRGB, and the browser maps wide-gamut CSS, possibly by clipping.
   - Pre-map tokens so screenshots equal tokens.
   - Blending, opacity and filters alter colour, so measure pixels.
4. **PNG → yuv420p:**
   - Declare pc→tv, the BT.709 matrix and tags.
   - Use even dimensions.
   - 1 px colour detail is lost by design.
5. **Platform re-encode:** encoder settings are undocumented (unverified). Simulate with a lower-bitrate re-encode (e.g. CRF 28–30) and re-run the DEL and BRD-02 checks.
6. **Determinism:** seeded grain and noise, fixed fonts. Grain costs bits, so balance its amplitude.
7. **ProRes 4444 alpha:** premultiplication mismatches cause edge fringes. Composite over mid-grey to check.
8. **Stills (resvg, ImageMagick, sharp):** profile handling differs (sharp/libvips may strip profiles; ImageMagick `-colorspace` semantics vary by version). Verify with a known patch.

---

## 20. Master checklists

**Analysis:**
- ☐ ART-DEL-01/02
- ☐ ART-BRD-01/02/03
- ☐ ART-CMP-01, ART-CMP-07, ART-MOT-03
- ☐ ART-VAL-01–04
- ☐ ART-CMP-02/03
- ☐ ART-MOT-01/02
- ☐ ART-COL-03/04/05
- ☐ ART-CLT-01/02
- ☐ ART-DEL-03/04
- ☐ ART-STY-01–05
- ☐ ART-SER-01/02
- ☐ ART-COV-01–03
- ☐ ART-LOOP-01
- ☐ ART-GEN-01/02 (judgement)
- ☐ Confirm ART-CMP-04 (thirds never failed)

**Creation:**
- ☐ ART-COL-01/02, ART-SER-01 (tokens loaded)
- ☐ Style frames approved
- ☐ ART-VAL-01/02, ART-CMP-02 (greyscale thumbnails)
- ☐ ART-CMP-01/06/07 (grid in safe box)
- ☐ ART-COL-03/04/05 (colour by role)
- ☐ ART-DEL-03 (luminance on fine detail)
- ☐ ART-MOT-01/02, ART-CMP-05 (beats, lead room)
- ☐ ART-STY-01–04
- ☐ ART-3D-01/02
- ☐ ART-COV-01–03
- ☐ ART-DEL-01/02/04, ART-BRD-02 (encode and verify)
- ☐ ART-GEN-01/02

---

## 21. Caveats

- **Safe zones conflict and change.**
  - TikTok publishes templates only.\[14\]
  - Meta's Reels bottom figure (35%) differs from its Stories video figure (20%).\[40\]\[55\]
  - Google's help template (~15/35/18%) conflicts with a Google marketing page (10/25/10%).\[48\]\[56\]
  - Meta wording was taken from search snippets, not a direct fetch.
  - Re-verify the union box quarterly.
- **VCR defaults** (ΔL 0.15, occupancy 25–60%, ΔE00 1.0/3.0, accent ≤ 15%, 180 px, 35% jump) are uncalibrated. Tune them on the first batch of reviewed renders.
- **ΔE JND folklore:** print tolerances (≤ 2.0 brand spec; 5 for G7 Targeted solids) concern reflective media under controlled light, not phones.
- **Saliency** is validated mainly on photographs; design models are static and text-weighted; none model motion onset.
- **Colourfulness metric:** validated on 84 natural images with 20 observers, and hue-blind. The abstract says correlation is "over 90%". The paper itself states "the correlation of M̂(3) with the experimental data is equal to 95.3%", and that the other candidate metrics "range from 94% down to 87% of correlation."
- **Composition:** the evidence for thirds and Arnheim-style balance is weak or negative. Centre bias holds for symmetric front-facing subjects.\[10\] Much guidance remains taste.
- **Harmony:** preferences are learned and cultural, so international palettes need review.\[29\]
- **Platform and browser colour handling** is under-documented and version-dependent.
- **Agent failure modes:**
  - over-applying rules (centring everything, forcing thirds);
  - defaulting to library styles;
  - judging motion from stills;
  - trusting tag-ignoring decoders;
  - measuring CSS instead of pixels;
  - treating heuristics as standards.

---

## 22. Verification ledger (all dated 2026-11-06)

| # | Claim | Result | Checked against |
|---|---|---|---|
| 1 | CSS Color 4 JND "0.02" in OkLCh | confirmed | W3C CSS Color 4 |
| 2 | CSS4 constant-L, constant-H chroma reduction | confirmed | W3C CSS Color 4 |
| 3 | CSS4 status CRD, 3 Nov 2026 | confirmed | w3.org page fetched\[1\] |
| 4 | HSV lightness unevenness; Oklab D65 | confirmed | Ottosson blog, fetched\[4\] |
| 5 | Oklab adoption (Photoshop, CSS, Unity, Godot) | confirmed (author's claim) | Ottosson 2025 preface\[4\] |
| 6 | Oklab ignores viewing conditions | confirmed (snippet) | Smashing Magazine 2024 |
| 7 | lightningcss 104/2,719 > JND | confirmed (issue, secondary) | lightningcss #1298 |
| 8 | Sharma et al. test data; discontinuities | confirmed | Semantic Scholar; Rochester page |
| 9 | G7 tolerances in ΔE00 | confirmed (snippet) | Idealliance G7 PDF\[7\] |
| 10 | G7 Targeted solids within 5ΔE | confirmed via secondary | EFI Fiery white paper\[9\] |
| 11 | 3M ≤ 2.0 ΔE00 draw-downs | confirmed (snippet) | 3M CGS1200\[8\] |
| 12 | ISO 12647 solids 5 ΔEab, ΔH ≤ 2.5 | unverified (forum only) | printplanet.com\[31\] |
| 13 | ISO 12647-2 primary tolerances | not found (paywalled) | n/a |
| 14 | Amirshahi: 30 participants; "not at all"; "minor, if any" | confirmed | Art & Perception PDF, fetched\[10\] |
| 15 | Smith 1797 origin | confirmed | Amirshahi 2014\[10\] |
| 16 | McManus 2011: no evidence for Arnheim balance | confirmed (as cited) | Amirshahi 2014\[10\] |
| 17 | Mai et al. 2011 classifier "around 80% of accuracy" | confirmed | Amirshahi 2014; Mai et al., IEEE ISM 2011 |
| 18 | Svobodova et al. thirds eye tracking | unverified (search budget exhausted) | n/a |
| 19 | EVT 80% variance | confirmed | Springer PB&R; Palmer lab\[12\]\[57\] |
| 20 | Harmony explains 62% of pair preference | confirmed | Palmer & Schloss chapter |
| 21 | Colourfulness "over 90%"; 20 observers, 84 images | confirmed (abstract + secondary) | Semantic Scholar; PyImageSearch\[58\] |
| 22 | Hasler–Süsstrunk coefficients | unverified (PDF fetch blocked) | n/a |
| 23 | FC captures colour variability; SE from JPEG size | confirmed | JoV abstract; MIT persci page\[19\] |
| 24 | DeepGaze IIE AUC 88.3 / sAUC 79.4 / CC 82.4 | confirmed | ICCV 2021 paper\[42\] |
| 25 | Bylinskii 1K (1,078) GDI designs; 1.4K (1,411) visualisations | confirmed | arXiv 1708.02660 |
| 26 | Itti-Koch-Niebur details | unverified (not fetched) | n/a |
| 27 | TikTok template wording; updated June 2026 | confirmed | ads.tiktok.com, fetched |
| 28 | TikTok ~240/660/120 px | unverified (third party) | markstudios, adkit |
| 29 | Meta 14/35/6% | confirmed (snippet; not fetched) | Meta Ads Guide via subagent |
| 30 | Meta disclaimers bottom 40% | unverified (secondary) | solidlabs et al. |
| 31 | Google vertical template, no numbers in text | confirmed | Google Ads Help 13547298 |
| 32 | YouTube 288/672/48/192 px | unverified (third party) | adchecklab, markstudios |
| 33 | Google marketing 10/25/10% | unverified; contradicts template | business.google.com snippet |
| 34 | Instagram 3:4 grid crop | unverified (secondary) | breakreach.com |
| 35 | BT.709 8-bit limited 16–235 / 16–240 | confirmed via secondary | Canva eng. blog; pixelsham\[32\]\[37\] |
| 36 | OpenCV decodes 709 as 601 | confirmed (issue) | opencv #20513\[39\] |
| 37 | 4:2:0 2×2 chroma; red worst | confirmed via secondary | forasoft, CapCut\[20\]\[59\] |
| 38 | 60-30-10 origin untraceable | confirmed (absence) | Gulf News; Rosendale\[22\]\[23\] |
| 39 | Key:fill ratios | not found (folklore) | n/a |

---

## 23. Sources

The verification ledger (§22) records which source each load-bearing number was checked against.

1. [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/)
2. [Rule of thirds](https://en.wikipedia.org/wiki/Rule_of_thirds)
3. [The rule of thirds is a guideline, not a law — what the research shows](https://gridmakerpro.com/blog/rule-of-thirds-not-a-law/)
4. [A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/)
5. [\[PDF\] The CIEDE2000 color-difference formula: Implementation notes, supplementary test data, and mathematical observations](https://www.semanticscholar.org/paper/The-CIEDE2000-color-difference-formula:-notes,-test-Sharma-Wu/969bc38ea067dd22a47a44bcb59c23807037c8d8)
6. [The CIEDE2000 color-difference formula: Implementation notes, supplementary test data, and mathematical observations \[metaphactory\]](https://semopenalex.org/work/W2000512760)
7. [1 Idealliance® G7® AI Master Calibration System Certification Program](https://idealliance.org/wp-content/uploads/2020/12/Idealliance-G7-AI_Master_v1.3-Program-Description.pdf)
8. [Consumer & Office Businesses - Print Quality Requirements](https://multimedia.3m.com/mws/media/877975O/corporate-general-spec-1200-full-version.pdf?fn=CGS1200.pdf)
9. [Demystifying Color Standards - G7, GRACoL ...](https://www.fiery.com/wp-content/uploads/sites/3/documents/336/efi_fiery_demystifying_color_standards_wp_en_us.pdf)
10. <https://www.mitteldeutsches-krebszentrum.de/anatomie1_media/Inhalte/AmirshahiARTP2014.pdf>
11. [BENDING THE RULE OF THIRDS - Mojo Studio](https://shaanmojo.com/2019/07/rule-of-thirds)
12. [Effects of grouping on preference for color triplets](https://palmerlab.berkeley.edu/color1.html)
13. [Color Preference Stephen E. Palmera\* and Karen B. Schlossb](https://sites.socsci.uci.edu/~kjameson/ECST/Palmer_Schloss_ColorPreference.pdf)
14. [TikTok Auction In-Feed Ads | TikTok Ads Manager](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?redirected=1)
15. [YouTube Shorts Safe Zone 2026: Dimensions, Template and Checker](https://adchecklab.com/articles/youtube-shorts-safe-area-dimensions)
16. [About video ad specs - Google Ads Help](https://support.google.com/google-ads/answer/13547298?hl=en)
17. [\[PDF\] DeepGaze IIE: Calibrated prediction in and out-of-domain for state-of-the-art saliency modeling](https://www.semanticscholar.org/paper/DeepGaze-IIE:-Calibrated-prediction-in-and-for-Linardos-K%C3%BCmmerer/734e34ffbf9846e2e35b075c1fd1ee1b82193845)
18. [\[PDF\] Measuring visual clutter.](https://www.semanticscholar.org/paper/Measuring-visual-clutter.-Rosenholtz-Li/c8318039383ab2963c3b7778db5f71fcb4a00f32)
19. [Visual Clutter - Persci - MIT](https://persci.mit.edu/research/clutter/)
20. [Color Bleeding, Shift, and Chroma Subsampling Artifacts](https://www.forasoft.com/learn/video-quality/articles-vqm/color-artifacts-bleeding-subsampling)
21. [Chroma Subsampling Explained: 4:4:4 vs 4:2:2 vs 4:2:0](https://www.inverity.ai/posts/chroma-subsampling-explained-2026)
22. [60-30-10 Rule: A Simple Design Rule That Just Might Blow Your Mind](https://www.rosendaleflooring.com/blog/articles/60-30-10-rule)
23. [60-30-10: The one simple rule for your perfect home colour palette](https://gulfnews.com/amp/friday/home/60-30-10-the-one-simple-rule-for-your-perfect-home-colour-palette-1.1646387851196)
24. [Björn Ottosson - making Island Architect on X: "Need a simple perceptual color space for image processing? I've created one called Oklab. Read more here: https://t.co/W8QaaghXbp It predicts hue, lightness and chroma well, while being simple to compute and use. Derived using @colour\_science and… / X](https://x.com/bjornornorn/status/1341758901738418177)
25. [Interview With Björn Ottosson, Creator Of The Oklab Color Space — Smashing Magazine](https://www.smashingmagazine.com/2024/10/interview-bjorn-ottosson-creator-oklab-color-space/)
26. [Chroma-gated, differentiable OKLCH interpolation: Continuous Oklab fallback for color-cast reduction](https://arxiv.org/pdf/2606.15352)
27. [Color Preference](https://schlosslab.discovery.wisc.edu/portfolio/color-preference)
28. [An ecological valence theory of human color preference Abstract](https://online225.psych.wisc.edu/wp-content/uploads/225-Master/225-UnitPages/Unit-06/Palmer_PNAS_abstract_2010.pdf)
29. [Human Preference for individual colors](https://deweycolorsystem.com/wp-content/uploads/2020/06/Credentials-Human-Preference-For-Individual-Colors.pdf)
30. [2020 TAGA Proceedings The Interaction Between Color Standards and](<https://www.printing.org/docs/default-source/taga-abstracts-(member-only)/t200000.pdf?sfvrsn=99b943d2_2>)
31. [G7 tolerances](https://printplanet.com/threads/g7-tolerances.15959/)
32. [sRGB vs REC709 - An introduction and FFmpeg implementations - pIXELsHAM](https://www.pixelsham.com/2025/08/07/srgb-vs-rec709-an-introduction/)
33. [Gamut mapping • Color.js](https://colorjs.io/docs/gamut-mapping)
34. [The Edge of Visible Light: Engineering for Wide Gamut Displays with CSS Color Module Level 4](https://micrologics.org/blog/the-edge-of-visible-light-engineering-for-wide-gamut-displays-with-css-color-module-level-4)
35. [Gamut mapping returns at the first under-JND chroma, producing desaturated sRGB fallbacks · Issue #1298 · parcel-bundler/lightningcss · GitHub](https://github.com/parcel-bundler/lightningcss/issues/1298)
36. [OKLCH in CSS: why we moved from RGB and HSL—Martian Chronicles, Evil Martians’ team blog](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
37. [A journey through color space with FFmpeg - Canva Engineering Blog](https://www.canva.dev/blog/engineering/a-journey-through-colour-space-with-ffmpeg/)
38. [community.adobe.com](https://community.adobe.com/t5/premiere-pro/premiere-pro-rec-709-color-range-setting-in-the-gpu/m-p/11236233)
39. [VideoCapture FFmpeg backend color shift when reading H.264 video with BT.709 color standard · Issue #20513 · opencv/opencv · GitHub](https://github.com/opencv/opencv/issues/20513)
40. [Awareness Image Ad Specs on Instagram Reels](https://www.facebook.com/business/ads-guide/update/image/instagram-reels)
41. [DeepGaze IIE: Calibrated prediction in and out-of-domain for state-of-the-art saliency modeling](https://www.researchgate.net/publication/358922466_DeepGaze_IIE_Calibrated_prediction_in_and_out-of-domain_for_state-of-the-art_saliency_modeling)
42. [DeepGaze IIE: Calibrated Prediction in and Out-of-Domain ...](https://openaccess.thecvf.com/content/ICCV2021/papers/Linardos_DeepGaze_IIE_Calibrated_Prediction_in_and_Out-of-Domain_for_State-of-the-Art_Saliency_ICCV_2021_paper.pdf)
43. [\[PDF\] Learning Visual Importance for Graphic Designs and Data Visualizations](https://www.semanticscholar.org/paper/Learning-Visual-Importance-for-Graphic-Designs-and-Bylinskii-Kim/3342f13fa0809c0429866f6126cb5bc3281b91ae)
44. [(PDF) Predicting Perceived Screen Clutter By Feature Congestion](https://www.researchgate.net/publication/232273685_Predicting_Perceived_Screen_Clutter_By_Feature_Congestion)
45. [Instagram Reel Size 2026: 1080×1920, 9:16 & Safe Zones](https://www.breakreach.com/guides/instagram-reel-size)
46. [Shorts, Reels & TikTok Safe Zone Checker (Free, 2026)](https://www.markstudios.com/tools/safe-zone-checker)
47. [TikTok Safe Zone Checker -Free Overlay Tool (2026)](https://adkit.so/tools/safe-zones/tiktok)
48. [YouTube Shorts Ads](https://business.google.com/us/ad-solutions/youtube-ads/shorts-ads/)
49. [Enhance your Shorts - iPhone and iPad - YouTube Help](https://support.google.com/youtube/answer/16215842?hl=en-GB&co=GENIE.Platform%3DiOS)
50. [The CIEDE2000 Color-Difference Formula](https://www.ece.rochester.edu/~gsharma/ciede2000/)
51. [Harmonious Color Pairings: Insights from Human Preference and Natural Hue Statistics](https://arxiv.org/pdf/2508.15777)
52. [Measuring colorfulness in natural images](https://www.spiedigitallibrary.org/conference-proceedings-of-spie/5007/1/Measuring-colorfulness-in-natural-images/10.1117/12.477378.short)
53. [Measuring visual clutter](https://jov.arvojournals.org/article.aspx?articleid=2122001)
54. [Rule-of-Thirds Detection with Interpretable Geometric Features](https://dl.acm.org/doi/10.1145/3746273.3760202)
55. [Awareness Video ad specs on Instagram Stories](https://en-gb.facebook.com/business/ads-guide/update/video/instagram-story)
56. [YouTube Shorts Safe Zone: Free Checker & Template (2026)](https://www.revid.ai/youtube-shorts-safe-zone)
57. [The relationship between color–object associations and color preference: Further investigation of ecological valence theory](https://link.springer.com/article/10.3758/s13423-012-0222-1)
58. [Computing image “colorfulness” with OpenCV and Python - PyImageSearch](https://pyimagesearch.com/2017/06/05/computing-image-colorfulness-with-opencv-and-python/)
59. [Chroma Subsampling: 4:4:4 vs 4:2:2 vs 4:2:0](https://www.capcut.com/create/chroma-subsampling-guide-video-quality)
