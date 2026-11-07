# VCR Reference: Pacing, Structure and Short-Form Editing (PACE-)

The core finding: the opening seconds carry most of the measurable value of a short video, and the main way to fail is putting more on screen than a viewer can read. TikTok reports "50% of the impact from a TikTok ad is realized in the first 2 seconds", and Facebook with Nielsen found "up to 47% of the value in a video campaign was delivered in the first three seconds".\[1\]\[2\]\[3\] Reading research caps what fits in that window at about 238 words per minute of silent reading.\[4\]\[5\] That gives VCR two hard limits: state the proposition by 3 s, and never schedule text faster than people can read it.

> **Status.** Seed reference for the `pacing-editor` pillar, v0.1, compiled 2026-11-06. This is a condensed edition (about 12k tokens, below the brief's 20–35k target) because of a length limit in the verification pipeline. Every load-bearing number is kept in §22.
> **Scope.** Pacing, beat structure, hooks, reading and narration load, loops, CTAs, series continuity and sound-off design, from TikTok/Reels/Shorts to 16:9 explainers, ads and launch films. Typography, safe zones and caption styling belong to `TYPO-*` and are cross-referenced, not restated.
> **Tiers.** `standard` = a published standard or style guide (Netflix, BBC). `platform` = TikTok/YouTube/Meta guidance; it may change without notice and is usually advice, not a study. `heuristic` = a practitioner rule, secondary source or derived value.
> **Evidence labels.** [behaviour] = audience data. [taste] = craft judgement.

## TL;DR

- **Front-load, then earn the rest.** TikTok says to "Introduce your content proposition in the first 3 seconds" and "Prioritize your hook in the first 6 seconds". Facebook/Nielsen and TikTok Marketing Science both put most measured ad value in the first 2–3 s. VCR enforces content in frame 0 (PACE-HOOK-01), the proposition by 3.0 s (HOOK-02) and the hook by 6.0 s (HOOK-03).
- **Reading speed is the binding constraint.** Adults silently read English non-fiction at about 238 wpm (Brysbaert 2019, *Journal of Memory and Language* 109, 104047: 190 studies, 18,573 participants). Netflix caps adult subtitles at 20 cps. The BBC recommends 160–180 wpm and about 0.3 s per word. TikTok's "5-10 words per second"\[6\] for overlays works out to 300–600 wpm, which no viewer can read, so VCR does not use it for dwell (READ-06). Narration is comfortable at about 140–170 wpm, and comprehension falls faster above about 275 wpm (Foulke & Sticht\[7\] 1969, *Psychological Bulletin* 72(1), 50–62, as quoted by Brysbaert 2019).
- **Rhythm should vary, and you cannot judge it from stills.** Feature-film average shot length fell from 8–11 s (classical Hollywood) to about 3–5 s today (Bordwell).\[8\] Shot sequences also became more patterned rather than uniformly faster (Cutting et al. 2010,\[9\] 2018).\[9\] VCR measures beat durations, beat-length variance, static gaps and AV sync from scene time series, and maps "drags", "rushed", "no breathing room" and "buried the lede" to numbers. Narrative judgement stays with a reviewer watching the moving render.

## Key findings (top ten)

1. **3-second proposition, 6-second hook.** TikTok (Help Center, last updated June 2025) says: "Prioritize your hook in the first 6 seconds to boost engagement and increase watch time" and "Introduce your content proposition in the first 3 seconds for better recall and awareness".\[6\] It frames these as "general best practices that have worked well for advertisers".\[6\]\[10\] [platform]
2. **Most value arrives early.** Facebook with Nielsen: "up to 47% of the value in a video campaign was delivered in the first three seconds, while up to 74% of the value was delivered in the first ten".\[2\] TikTok Marketing Science (Value of a View 2021, run by MediaScience): "50% of the impact from a TikTok ad is realized in the first 2 seconds, and the first 6 seconds capture 90% cumulative impact on Ad Recall and around 80% for Awareness".\[1\]\[3\]\[11\] Both are platform-commissioned *ad* studies. [platform; behaviour]
3. **Early drop-off is steep but not total.** Facebook: "65% of people who watch the first three seconds of a video will watch for at least ten seconds and 45% continue watching for thirty seconds".\[2\] [platform; behaviour; c. 2016]
4. **YouTube defines the hook metric but sets no target.** "How many chose to view" "Highlights the percentage of times that viewers viewed your Shorts versus swiped away".\[12\] Since 31 March 2025, Shorts views count each start or replay "with no minimum watch time requirement", and the old metric is now "Engaged views".\[13\] Third-party benchmarks such as "70%+ viewed is viral" have no YouTube source.\[14\]\[15\]\[16\] [platform]
5. **Silent reading is slower than folklore.** Brysbaert's meta-analysis of 190 studies: "238 words per minute (wpm) for non-fiction and 260 wpm for fiction", and 183 wpm reading aloud.\[4\]\[17\]\[18\] [research; behaviour]
6. **Caption standards are slower still.** Netflix English: "Adult programs: Up to 20 characters per second" and "Children's programs: Up to 17 characters per second", with 42 characters per line and events of 5/6 s to 7 s.\[19\]\[20\] BBC (secondary copies only): "160-180 words-per-minute (WPM) or 0.33 to 0.375 second per word", with a minimum of "around 0.3 seconds per word (e.g. 1.2 seconds for a 4-word subtitle)".\[21\] [standard]
7. **Mayer's principles are strong in the lab and weaker on re-analysis.** Mayer's 2017 review gives median d values: coherence 0.70, signalling 0.46, redundancy 0.87, spatial contiguity 0.79, temporal contiguity 1.30, segmenting 0.70, pre-training 0.46, modality 0.72.\[22\] A 2025 meta-analysis of Mayer's own studies (Cromley & Chen, *Educational Research Review* 49, 100730) found non-significant effects for segmenting (g = 0.19), avoiding redundant captions with narration (g = 0.14) and contiguity, and the multimedia effect at g = 0.39, against Mayer's d = 0.68. [research; learning outcomes]
8. **Shots got shorter and more structured.** Bordwell: classical-era ASL "hovered around eight to eleven seconds", and "Today, the average shot in a mainstream movie, in any genre, lasts three to five seconds".\[8\]\[23\] Cutting, DeLong & Nothelfer (2010, 150 films): shots "became increasingly more correlated in length with their neighbors and created power spectra approaching 1/f".\[9\]\[24\] Cutting, DeLong & Brunick's 2018 follow-up ("Temporal fractals in movies and mind", *Cognitive Research: Principles and Implications* 3:8) rejects the "shrinking attention span" reading, "for which there is no evidence". [research]
9. **Listening comprehension degrades slowly, then fast.** Foulke & Sticht (1969, as quoted by Brysbaert): comprehension "declines at a slow rate as word rate is increased, until a rate of approximately 275 wpm is reached, and at a faster rate thereafter". Rodero (via Brysbaert): radio news is best at 170 wpm for high-density messages and 190 wpm for low-density ones.\[7\] [research]
10. **Meta's sound guidance has flipped.** Older Meta pages say "Build for sound off. Delight with sound on." and report that "41% of videos were basically meaningless without sound".\[2\]\[25\] The newer Tailored Campaigns FAQ says "Design for sound-on viewing" and "include key messaging or branding within the first 3 seconds".\[26\] VCR therefore requires a piece to survive muted and get better with sound (PACE-SOUND-01). [platform]

---

## 1. Hooks: the first 0–6 seconds

**Hook content and recognition.** Story owns the hook mechanism. [Domain Exploration §5](../domain-exploration/README.md) supplies grounded tensions; [Cultural Context §3](../cultural-context/README.md) supplies `CULTURE-MISS-SURVIVAL-STATED` when a hook depends on recognition. Pacing judges the timing and information load. Platform timing evidence does not establish that a particular cultural cue will be understood.

**Evidence.**
- *Platform advice:* TikTok's 3 s and 6 s windows above. The TikTok SMB Playbook adds "The first 3-6 seconds are critical".\[27\] Meta says "Keep videos under 15 seconds, grab attention in the first 3 seconds".\[28\]
- *Platform-commissioned studies:* TikTok × System1 (2025) found ads with brand recognition in the first 2 s "generated 57% more happiness and achieved 19% less attention decay".\[29\] System1's own summary (secondary) adds that a bare logo in the first 2 s correlated with −30% brand-awareness lift, while "logo in context" scored strongly.\[30\] Brand *inside* the content, not before it.
- *Folklore (do not encode):* "swipe decision in 400 ms", "TikTok decides in 1.5 s", "hook rate must be >30%", "63% of top ads put the core message in 3 s".\[15\]\[31\] None was traced to a primary page.\[32\]

**Hook types** [taste]

| Type | Works when | Agent failure mode |
|---|---|---|
| Payoff first | Transformations, demos, data reveals | Shows so much there's nothing left to want |
| Question | Specific, answered within the piece | Generic "Did you know…?" |
| Curiosity gap | The gap closes on time (HOOK-04) | Never closes, or closes on something trivial |
| Pattern interrupt | Paired with a proposition by 3 s | Spectacle with no proposition; fatigues across a series |
| Bold claim | Proof follows within a few beats | Invented or unbriefed numbers |
| In medias res | Motion graphics, title sequences | Slow ease-in from an empty canvas |

**Agent warnings.**
- Code-first scenes often animate in from opacity 0 or scale 0, so frame 0 is empty. Platforms may use frame 0 as the cover, so it must already carry content (HOOK-01).
- Agents converge on one hook template. Rotate hook types and log them (SERIES-03 (dropped; owner `STORY-SERIES-REPEAT`)).

**First readable frame** (derived, heuristic). A 3-word line needs about 0.9 s at 0.3 s/word. To be read, with a second-read margin, before the 3 s deadline it must land by about 1.0 s (HOOK-05).

**Expressive exception.** Opt-in or sound-led placements (keynotes, cinema, a clicked 16:9 film) can open on atmosphere if sound carries the hook within 3 s. The same opening fails in autoplay feeds.

## 2. Platform data: official, studied, folklore

- **TikTok official (June 2025):** "Have a hook, highlight your unique selling points, and end with a clear call-to-action". "We recommend displaying 5-10 words per second when using text". "Utilize transitions, stickers, and graphics… to retain engagement and view time". Basics: sound, 9:16, at least 720P, and the UI safe zone. TikTok recommends "continuous testing".\[6\]
- **YouTube official:** "Shown in feed" is "The number of times that your Shorts showed in the Shorts Feed".\[33\] Engaged views count viewers who "stayed to watch past the initial seconds, not including any loops". Average view duration is computed "among those who stayed to watch".\[34\] Shorts can be "up to 3 minutes long".\[13\] There are no published benchmarks.\[16\]
- **Meta official** (pages block automated fetch; quoted from official-URL snippets): sound-off and sound-on statements as in finding 10, plus "early results suggest that 70% of mobile video-watching is done with sound on".\[25\] Reels ads with 9:16, audio and key messages in the safe zone had "34.5% lower cost per result compared to image ads".\[35\]\[36\] For in-stream: "we generally recommend a 15 second maximum".\[37\]
- **Studies:** Facebook × Nielsen; TikTok × MediaScience; TikTok × System1; Guo, Kim & Rubin (2014, edX, 6.9M sessions), whose finding "The median engagement time is at most 6 minutes" led them to recommend chunks "shorter than 6 minutes".\[38\]
- **Folklore:** "85% of Facebook video watched muted" (no primary source, and it conflicts with Meta's 70% sound-on);\[39\] "scene change every 2–3 s"; "viewed-vs-swiped ≥70% = viral"; TikTok In-Feed "21-34 seconds" (secondary attribution only, **unverified**).\[39\]\[40\]

## 3. Beat structure, shot length and cut rhythm

**Definitions.**
- *Beat:* one new unit of information, emotion or action, running between `markers` or detected change-points.
- *Change event:* a cut, a text change, an element entering or leaving, or a motion start. Code-first scenes rarely cut, so VCR counts change events, not just cuts.
- *ASL:* duration ÷ shot count. Distributions are skewed, so also report median and IQR.

**Cinemetrics.**

| Corpus | Finding | Source |
|---|---|---|
| Classical Hollywood 1930–60 | ASL 8–11 s; A-films rarely under 6 s | Bordwell 2002\[41\] |
| US silent | "around five seconds per shot was common" | Bordwell 2007\[42\] |
| Contemporary | 3–5 s; "2-4 seconds" not uncommon | Bordwell |
| *Insomnia* (2002) | "over 3400 shots in its 111 minutes… just under two seconds" | Bordwell & Thompson\[43\] |
| 150 films 1935–2005 | neighbour correlation rising; spectra approaching 1/f\[24\] | Cutting et al. 2010 |
| 160 films 1935–2010 | shorter shots carry proportionately more motion\[44\] | Cutting et al. 2011 |
| Act structure | shots longer at quarter boundaries, shorter mid-quarter\[45\] | Cutting, DeLong & Brunick |
| 295 films 1915–2015 | shot and scene durations, motion and sound converge on 1/f; luminance, clutter and shot scale do not\[46\] | Cutting et al. 2018 |

**What this means for VCR.**
1. What matters is *modulation*: runs of short and long beats, with longer beats at boundaries. Uniform beats are less film-like, not more.
2. Fast cutting comes with more motion per shot. Cutting fast between static layouts reads as a slideshow.
3. Salt argued faster cutting by itself could produce the 1/f slope. Cutting (2018) concedes the correlation but disputes causation.\[46\] Use 1/f as a diagnostic, never a target, and not at all under about 60 beats.

**Beat length** (heuristic)

| Format | Typical beat |
|---|---|
| 9:16, 6–30 s | 1–3 s; reveals 2–4 s |
| 9:16, 30–90 s explainer | 2–5 s; a visual "reset" every 15–25 s |
| 16:9 explainer | 3–8 s; diagrams may hold 10–20 s while being built |
| Launch/brand film | 1–10 s; wide variance is the point |
| Music-led | 1, 2 or 4 bars; vary the subdivision |

Change the picture when the *information* changes. Within long holds, keep internal motion going (drift, progressive build, highlight). Change becomes exhausting [taste] with sustained sub-1 s beats that carry new text, many simultaneous animators and no settle points. Montage bursts are fine when brief (≤ about 3 s) and low in information.

## 4. Information density and cognitive load

| Principle | Mayer 2017 d | Handbook 2014 (tests, d) | 2025 meta-analysis | VCR application |
|---|---|---|---|---|
| Coherence | 0.70 | 23/23, 0.86 | sentence-level g = 0.63 | Cut decoration competing with the beat's claim |
| Signalling | 0.46 | 24/28, 0.41 | — | Highlight the one thing per beat |
| Redundancy | 0.87 | 16/16, 0.86 | g = 0.14 n.s. | Keyword labels, not transcript text (captions exempt) |
| Spatial contiguity | 0.79 | 22/22, 1.10 | g = 0.13 n.s. | Label the object, not a legend |
| Temporal contiguity | 1.30 | 9/9, 1.22 | (pooled, n.s.) | Referent appears as it is spoken (NARR-03) |
| Segmenting | 0.70 | 10/10, 0.79 | g = 0.19 n.s. | Clear beat boundaries with holds |
| Pre-training | 0.46 | 13/16, 0.75 | n.s. | Name the parts before the process |
| Modality | 0.72 | 53/61, 0.76 | — | With sound on, narration explains and text signals |

**Reading these honestly.**
- The effects are lab learning outcomes, not retention data. Use them for direction, not magnitude.
- Mayer's segmenting is *learner-paced*.\[47\] Feeds are not, so the nearest analogue is a beat boundary followed by a hold.
- **Redundancy versus sound-off:** social placements need captions for accessibility and muted viewing. Design text should still be keywords, not a second transcript.

**Per beat** (heuristic): one new idea; ≤ 12 new on-screen words on 9:16; ≤ 2 competing text blocks; ≤ 3 independently animating elements outside montage.

## 5. Reading load

| Quantity | Value | Source | Tier |
|---|---|---|---|
| Silent reading, non-fiction | 238 wpm (3.97 words/s)\[5\] | Brysbaert 2019 | research |
| Reading aloud | 183 wpm | Brysbaert 2019 | research |
| BBC subtitle rate | 160–180 wpm; 0.33–0.375 s/word; min ~0.3 s/word\[21\] | BBC (secondary copies) | standard, primary unverified |
| Netflix | ≤ 20 cps adult / ≤ 17 cps children; 42 chars/line; 5/6–7 s\[19\]\[20\] | Netflix TTSG | standard |
| DCMP educational | 130/140/160 wpm by level\[48\] | secondary only | heuristic |
| TikTok overlays | "5-10 words per second" | TikTok Help | platform, **contradicted** as dwell |

**The TikTok problem.** 5–10 words/s is 300–600 wpm: 1.3–2.5× average silent reading speed and up to 3.75× the BBC ceiling. It probably describes word-by-word kinetic captions running with speech. Static text dwell therefore follows READ-01 (dropped; owner `TYPO-HOLD`), and synced captions follow narration rate.

**Dwell formula.**
```
dwell_min        = max(0.3 s × words, chars / 20, 5/6 s)      # error threshold (17 cps for children)
dwell_read_twice = 2 × words / 3.97 + 0.5 s                     # key text target (heuristic)
```
The 0.5 s orientation allowance is an editor's estimate, not a sourced figure. Worked example: an 8-word, 42-character hook gives dwell_min = 2.4 s and read-twice = 4.5 s, so it cannot be read inside the 3 s window. **Hooks that must be read by 3 s should be ≤ 5 words** (HOOK-06, derived).

**Narration rate.**

| Band | wpm | Basis |
|---|---|---|
| Dense explanation | 140–170 | Rodero 170 wpm for high density |
| Light content | 170–190 | Rodero 190 wpm for low density |
| Warning | > 190 sustained over 10 s | verbatim captions break the BBC 180 |
| Error | > 275 | Foulke & Sticht |

- Measure both delivery wpm (including pauses) and articulation wpm.
- TTS often omits breaths. Insert 250–500 ms at sentence ends and 600–1000 ms after reveals [taste].
- If narration is above 180 wpm, edit the script, not the captions.

## 6. Formats

| Family | Skeleton | 30 s template | Key failure |
|---|---|---|---|
| Narrative | setup → tension → reveal → button | 0–3 / 3–20 / 20–27 / 27–30 | Reveal late or under-held |
| Explainer | problem → insight → payoff | 0–3 stakes; 3–18 insight in 3–5 beats; payoff; CTA | Overloaded insight beats; jargon before pre-training |
| Product/ad | hook → USP → CTA (TikTok's structure) | proposition ≤ 3 s; CTA in last 2–4 s | Brand intro first; several CTAs |
| Music-led | intro → build → drop → outro | cuts on markers; text on downbeats | Text unreadable at tempo; metronomic cuts |
| Countdown | promise → items rising in value → #1 | equal or lengthening item beats | Best item first |
| Quiz/poll | question → timed window → reveal → why | READ-04 + ≥ 3 s think + ≥ 1.5 s reveal | Window shorter than reading time |
| "What next" | setup → freeze/prompt → resolution | freeze ≥ 1.5–3 s | Resolution withheld only as series bait |

**Stated durations.**
- YouTube Shorts: "up to 3 minutes long".\[13\]
- Meta: under 15 s for ads; a 15 s maximum for in-stream.\[28\]\[37\] No official Reels optimum was found.
- TikTok: 21–34 s for In-Feed (unverified).\[40\] Guo et al.: segments under 6 min for educational video.
- Duration belongs to the brief. VCR checks only the platform limit and the brief target ±10% (DUR-01).

## 7. Loops and rewatches

**Evidence.** Under YouTube's 2025 change, replays count as views, but engaged views exclude loops, so a loop inflates public views more than engaged views.\[13\]\[34\] Third parties note that average percentage viewed can exceed 100% on Shorts.\[49\]\[50\]\[51\] No study isolates seamless loop design as a cause of retention [heuristic].

**Patterns** [taste]:
- *Sentence loop:* the last line completes into the first.
- *Visual loop:* the last frame state matches the first.
- *Motion loop:* the cycle period divides the duration, both as integer frame counts.
- *Audio loop:* phrase boundary at the seam; no truncated reverb tail.

**Failures.**
- An end card or fade to black.
- Loops driven by *confusion* (check whether the replay spike sits at an ambiguous moment).
- Assuming a sub-frame-seamless player.

Loops suit 6–30 s social pieces. Forcing a loop onto a resolved story is over-application.

## 8. CTAs and series continuity

- **CTA.** TikTok: "Guide your audience on what to think, feel, or do with a strong CTA".\[6\] Use one CTA per piece, verb + object, ≤ 5 words, held for the read-twice time (CTA-01). On ads it goes in the final 2–4 s. On loop pieces, put it mid-roll or in the caption.
- **Series bible** [taste; no platform study found]:
  - title and episode-number format;
  - recurring segment names and time slots;
  - hook-type rotation;
  - sonic logo and end-state convention;
  - banned phrases.
- **Rules.** Segment starts stay within ±10% of the series median (SERIES-02). The episode ID is visible by 3 s but never ahead of the proposition. Every episode must pay off on its own.

## 9. Sound-off design

- **Mute test (PACE-SOUND-01).** With sound off: is the proposition clear by 3 s, is every narrated claim captioned or shown, and are beat boundaries visible?
- **Proxy.** 100% of author-tagged key claims have a text or visual referent within ±1.0 s.
- **Audio-led pieces.** Declare `audioLed: true`. PACE-SOUND-01 then becomes a warning, but speech captions are still required.

## 10. Copy for the screen

- Screen text uses headline grammar: nouns, numbers, verbs. Narration uses spoken grammar. Never paste the VO script into text layers.
- Hooks: ≤ 5 words, specific (a number, a named thing, a stake). Every adjective should survive a deletion test.
- Short words read faster; Brysbaert attributes the fiction/non-fiction speed gap to word length.\[17\]
- Agent warnings: rhetorical-question and "Here's why" templates; invented statistics.

## 11. Measurement

| Metric | Definition |
|---|---|
| TTFF-content | First frame with foreground ≥ 10% of the safe area and the subject or text at ≥ 50% opacity |
| TTFRT | First t at which a text block is readable (opacity ≥ 0.9, in safe zone, settled) and stays readable ≥ dwell_min |
| Proposition time | End of dwell, or end of narration, for the span tagged `proposition` |
| Beat durations / CV | Δt between markers or change-points; stdev/mean excluding first and last beats |
| Static gap | Longest interval with no change event and no narration word onset |
| Words per beat; dwell compliance; caption cps | From the text timeline |
| Narration wpm | Delivery and articulation, per sentence and per 10 s window |
| AV contiguity offset | Onset of the visual referent minus onset of the spoken term |
| Post-payoff hold; loop seam | Markers; SSIM of first vs last frame; audio step at the seam |

**Prediction models.** No validated public model predicting platform retention from timing features was found. Vendor attention scores are proprietary and count as `heuristic`, never a gate. Post-publish retention curves are ground truth: log VCR metrics so each project can correlate them.

## 12. Critique vocabulary → measurement

| Term | Signature | Default severity |
|---|---|---|
| Buried the lede | Proposition > 3.0 s (feeds) / > 10 s (opt-in 16:9) | error (feeds) |
| Slow open | TTFF-content > 0.5 s; empty or logo-only open | error |
| Drags | Static gap over threshold; beat > 2× median with no new info; pause > 1.5 s on a static frame | warning |
| Rushed | Dwell < dwell_min; > 20 cps; > 190 wpm sustained; text beats < 0.5 s | error |
| No breathing room | Post-payoff hold < 1.0 s; no ≥ 250 ms pause for > 20 s | warning |
| Metronomic | Beat CV < 0.15 over ≥ 6 beats (not music-led) | info → warning |
| Busy | > 3 animators; > 2 text blocks; > 12 new words per beat | warning |
| Out of sync | AV offset > 1.0 s | warning |
| Doesn't land | Final hold < 1.5 s; CTA below read-twice | warning |
| Broken loop | Seam SSIM < 0.9; audio step > 6 dB | warning |
| Clickbait | `promise` with no `payoff` | error |

## 13. Medium-specific guidance

- **9:16 (1080 × 1920).** Autoplay feed, so the HOOK rules are errors. Captions are required. Must pass the mute test unless `audioLed`. Safe zones per TYPO. Beats of 1–3 s with payoff holds. Loops encouraged at ≤ 30 s.
- **16:9.** Often opt-in, so the proposition can wait up to about 10 s [heuristic]. Longer holds. Narration with keyword labels (modality/redundancy). Segments under 6 min.
- **Square.** Treat as a muted feed and apply the 9:16 hook rules. Fewer simultaneous text blocks.
- **Stills.** Pacing becomes reading order: one focal point, a headline of ≤ about 7 words [heuristic]. Only §4 and §10 apply.
- **Loops.** Integer-frame periods, seam continuity, no end card. Text either persists or meets dwell_min on every cycle.

## 14. Analysis process (reviewer)

1. Load the brief (placement, duration, `audioLed`, series bible), markers, script tags (`proposition`, `promise`, `payoff`, `cta`, key claims) and narration timings.
2. Run the automatic measures (§11).
3. Watch the render in motion twice, with sound and muted. Never judge pacing from contact sheets.
4. Watch the first 3 s three times. Write down what a stranger would think the piece is about and compare it with the tagged proposition.
5. Plot beat durations. Look for longer beats at boundaries and holds after reveals.
6. Check every text block against dwell_min (error) and key text against read-twice (warning).
7. Check narration wpm, pauses, AV contiguity and caption cps.
8. Check the ending: payoff hold, CTA, loop seam, series conventions.
9. Judge intent. A declared break succeeds when the broken rule's *purpose* is met another way.
10. Write findings as `[PACE-ID] severity @ t=…s — observation (measured vs threshold) → fix`.

**Severity.** *error* blocks delivery: unreadable text, no proposition by 3 s in feeds, uncaptioned speech, broken promise. *warning*: fix unless intended. *info*: craft notes.

Example advisory note: `[TYPO-HOLD] major @ t=4.2–5.1 s — a 7-word line is visible for 0.9 s after settling, below the canonical hold → shorten the copy or extend the hold using TYPO-HOLD.` A filed finding also needs the evidence and fields required by the review contract.

## 15. Creation process

**Sequence evidence.** Use [Visual Research §3](../visual-research/README.md) and `VREF-TEMPORAL-SPAN` for timing precedents, rather than inferring rhythm from a cover frame. [Image Direction §5](../image-direction/README.md) supplies asset continuity and motion limitations before beats are committed. Narration-rate values come from `SOUND-NARRATION-WPM`; reading holds come from `TYPO-HOLD`. `vcr lint` currently checks browser layout, not pacing; pacing measurements and reviewer steps below remain proposed/manual.

1. Brief: placement, aspect, audience (20 or 17 cps), `audioLed`, duration, series bible.
2. Write the one-sentence proposition and a ≤ 5-word hook. Choose and log the hook type.
3. Choose the structure (§6).
4. Write two scripts: narration paced using `SOUND-NARRATION-WPM` for the selected language and purpose, and screen text as keywords. Allow pauses and tag the key spans.
5. Build a beat sheet with durations derived from content (dwell formula, narration plus pauses). Vary them deliberately.
6. Emit `markers` for every beat, payoff and CTA.
7. Build frame 0 first. Add internal motion within holds.
8. Render, run `vcr lint` for browser layout, do a muted pacing review and apply the proposed pacing checks manually. No pacing lint or pacing reviewer is implemented.
9. Log hook type, beat CV, proposition time and wpm so they can be correlated with retention later.

## 16. Canon

- **Platform docs:** TikTok Business Help Center and Marketing Science blog; YouTube Help (Shorts analytics, content performance, Shorts basics); Meta for Business (video ads news, Tailored Campaigns, Reels ads). They define the metrics and windows, and they change without notice.
- **Caption standards:** Netflix Timed Text Style Guide; BBC Subtitle Guidelines; DCMP Captioning Key. These are the only numeric timed-text reading standards.
- **Reading and listening research:** Brysbaert (2019) *JML* 109, 104047; Foulke & Sticht (1969) *Psychological Bulletin*; Rodero (2012).
- **Multimedia learning:** Mayer (2017) *JCAL*; *Cambridge Handbook of Multimedia Learning* ch. 12–13; the 2025 *Educational Research Review* meta-analysis; Sweller on cognitive load.
- **Cinemetrics:** Bordwell, "Intensified Continuity" (2002) and *The Way Hollywood Tells It* (2006); Salt, *Film Style and Technology* (not re-verified here); Cutting et al. 2010, 2011, 2018.
- **Educational video:** Guo, Kim & Rubin (2014).
- **Craft (taste, not re-verified):** Murch, *In the Blink of an Eye*; Pearlman, *Cutting Rhythms*.

## 17. Rules table

Measurability: **M** = automatic; **M*** = needs author tags; **J** = judgement only.

| ID | Check | Threshold | Tier | Applies to | Measure |
|---|---|---|---|---|---|
| PACE-HOOK-01 | Frame 0 carries content; no logo-only first 1.0 s | foreground ≥ 10% of safe area; subject/text opacity ≥ 0.5 at t=0 | heuristic | autoplay feeds | M |
| PACE-HOOK-02 | Proposition read or heard | complete by ≤ 3.0 s | platform | feeds, ads | M* |
| PACE-HOOK-03 | Hook established | by ≤ 6.0 s | platform | feeds | M*/J |
| PACE-HOOK-04 | Promise has a payoff | `promise` → `payoff` marker | heuristic | all | M*+J |
| PACE-HOOK-05 | First readable text | TTFRT ≤ 1.0 s | heuristic (derived) | muted-first feeds | M |
| PACE-HOOK-06 | Hook line length | ≤ 5 words | heuristic (derived) | feeds | M |
| PACE-READ-01 | Static text dwell | Superseded: use `TYPO-HOLD`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | all video | M |
| PACE-READ-02 | Caption speed | Superseded: use `TYPO-CAPTION-CPS`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | captions | M |
| PACE-READ-03 | Caption event duration | Superseded: use `TYPO-CAPTION-DURATION`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | captions | M |
| PACE-READ-04 | Key-text read-twice hold | ≥ max(TYPO-HOLD, 2×words/3.97 + 0.5 s) | heuristic | all | M* |
| PACE-READ-05 | New words per beat | ≤ 12 | heuristic | 9:16 social | M |
| PACE-READ-06 | TikTok 5–10 wps never used for static dwell | ≤ 3.97 words/s sustained | heuristic | all | M |
| PACE-NARR-01 | Narration rate per 10 s | Superseded: use `SOUND-NARRATION-WPM`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | narrated | M |
| PACE-NARR-02 | Pauses | Superseded: use `SOUND-NARRATION-WPM`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | narrated | M |
| PACE-NARR-03 | AV temporal contiguity | ±1.0 s | heuristic (Mayer) | explainers | M* |
| PACE-NARR-04 | No transcript as design text | ≥ 80% word overlap in a non-caption layer → flag | heuristic (Mayer) | narrated | M |
| PACE-BEAT-01 | Static gap | warn > 3.0 s social / > 8.0 s 16:9 unless `hold` | heuristic | all | M |
| PACE-BEAT-02 | Beat variation | CV < 0.15 over ≥ 6 beats → flag | heuristic | non-music-led | M |
| PACE-BEAT-03 | Text beat length | ≥ its dwell_min | standard-derived | all | M |
| PACE-BEAT-04 | Post-payoff hold | ≥ 1.0 s | heuristic | all | M* |
| PACE-BEAT-05 | Simultaneous animators | Superseded: use `MOTION-CHOR-003`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | all | M |
| PACE-BEAT-06 | Music cut alignment | Use `SOUND-BEAT-ALIGN`; report cut offset in frames | heuristic | music-led | M |
| PACE-STRUCT-01 | Ending holds payoff | ≥ 1.5 s; outro ≤ 3 s in feeds | heuristic | all | M* |
| PACE-STRUCT-02 | Segment length | < 6 min | heuristic (Guo) | 16:9 educational | M* |
| PACE-STRUCT-03 | One idea per beat | — | heuristic | all | J |
| PACE-QUIZ-01 | Answer window | READ-04 + ≥ 3.0 s think; reveal ≥ 1.5 s | heuristic | participation | M* |
| PACE-LOOP-01 | Loop seam | Superseded: use `MOTION-RHY-004`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | loops | M |
| PACE-LOOP-02 | No fade/end card on loops | final 0.5 s luminance ≥ 5% unless frame 0 matches | heuristic | loops | M |
| PACE-SOUND-01 | Sound-off survival | 100% of key claims covered ±1.0 s; proposition muted by 3 s | platform (Meta) | feeds, not audioLed | M*+J |
| PACE-SOUND-02 | Speech captioned | Superseded: use `A11Y-CAPTION-COMPLETE`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | all speech | M |
| PACE-CTA-01 | Single readable CTA | 1 tag; ≥ READ-04; ≤ 5 words | heuristic | ads, social | M* |
| PACE-SERIES-01 | Episode ID format | regex match to bible | heuristic | series | M |
| PACE-SERIES-02 | Segment slot stability | ±10% of series median | heuristic | series | M* |
| PACE-SERIES-03 | Hook rotation | Superseded: use `STORY-SERIES-REPEAT`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | series | M* |
| PACE-DUR-01 | Duration | ≤ platform max; brief ±10% | platform + brief | all | M |

*BBC values come from secondary copies; the primary page was not fetched.

## 18. How to measure in VCR

**Sampling.** Seek `__scene.seek(t)` at the delivery fps and sample the DOM every frame (onsets need ±1 frame). Downsample PNGs to 270×480 for frame diffs.

- **HOOK-01.** *Inputs:* PNG and DOM at t=0. *Calc:* background-subtracted mask in the safe zone, thresholded on local contrast. *Failure:* full-bleed texture counts as content, so allow `subject` tags to override.
- **HOOK-02/03.** *Inputs:* tags mapped to text layers or narration spans. *Calc:* t_prop = the earlier of (text onset + dwell_min) and (narration span end). *Failure:* untagged scripts; fall back to the first text block, mark the result `unverified`, and hand it to the reviewer.
- **READ-01/04/05, HOOK-05.** (READ-01 dropped; owner `TYPO-HOLD`)
  - *Inputs:* per-frame DOM text with computed opacity, transform and bbox; `textBounds()` for canvas/three.js; `getBBox()` plus CTM for SVG.
  - *Calc:* "readable" = opacity ≥ 0.9, inside the safe zone, velocity < 0.5×font-size per frame, scale ≥ 0.95 of final, not masked. Dwell is the continuous readable interval.
  - *Failure:* per-letter split nodes (group by parent); text baked into images (OCR fallback, low confidence); clip-paths ignored by bboxes (cross-check pixels); kinetic captions belong to NARR, not READ-01.
- **READ-02/03.** (dropped; owners `TYPO-CAPTION-CPS`, `TYPO-CAPTION-DURATION`) cps = chars ÷ duration from SRT/VTT/TTML or the caption layer. Group per-word animated captions into phrases.
- **NARR-01/02.** (dropped; owner `SOUND-NARRATION-WPM`) *Inputs:* TTS word timestamps (preferred) or forced alignment. *Calc:* sliding 10 s wpm, articulation rate, inter-word gaps. *Failure:* drift on music beds; numerals that expand when spoken.
- **NARR-03.** |onset(element) − onset(term)|. Elements present from t=0 use the onset of their highlight.
- **BEAT-01/02/05.** (BEAT-05 dropped; owner `MOTION-CHOR-003`)
  - *Inputs:* `markers`, or change-points from frame luminance diffs above k× the rolling median plus DOM appear/disappear, text-change and motion-start events.
  - *Failure:* particles and shaders register as constant change, so exclude layers tagged `ambient` and use semantic events. Small three.js camera drift needs object-level thresholds.
- **BEAT-06.** Nearest-marker offset in frames. Validate the markers against audio onset detection.
- **LOOP-01/02.** (LOOP-01 dropped; owner `MOTION-RHY-004`) SSIM of the first and last frames, luminance, RMS step over the last and first 50 ms, and a check that duration × fps is an integer. Re-run on the decoded delivery file, because re-encoding shifts colour and keyframes.
- **PACE-SOUND-01/02.** (PACE-SOUND-02 dropped; owner `A11Y-CAPTION-COMPLETE`) Coverage ratios. Image referents need tags; without tags this check is judgement only.
- **DUR-01.** Compare `__scene.duration` with the ffprobe delivery duration. Watch for AAC padding mismatch.

## 19. Rendering and delivery notes

- **Frame quantisation.** Convert every threshold to frames, rounding dwell up and gaps down. 5/6 s = 20 frames at 24 fps, 25 at 30 fps and 50 at 60 fps. 0.3 s/word at 24 fps = 7.2 frames, which rounds up to 8.
- **Seek determinism.** GSAP and WAAPI seek cleanly. Physics, rAF accumulators and p5 `frameCount` logic may not. Require pure functions of t, and seeded procedural audio so cue times match.
- **Delivery fps.** A 60 fps render delivered at 30 fps drops frames, and fast entrances can lose readable frames. Measure at the delivery fps.
- **yuv420p.** 4:2:0 chroma blurs small coloured text on coloured grounds, so it takes longer to read. Add 20% dwell when TYPO contrast is marginal [heuristic]. ProRes 4444 masters are unaffected until the final encode.
- **Platform re-encode.** Fast full-frame motion starves the bitrate, so busy beats look busier. Preview high-motion sections at social bitrates.
- **Cover frame and loop gaps.** Players may show frame 0 as the cover and hiccup 1–3 frames at the loop point. Design for both.
- **A/V length.** Trim audio to the video duration in FFmpeg so seams and end CTAs align.

## 20. Master checklists

**Analysis.**
- [ ] HOOK-01–06 (frame 0, 3 s proposition, 6 s hook, payoff, TTFRT, ≤ 5-word hook)
- [ ] READ-01–06 (dwell, cps, durations, read-twice, words per beat, no TikTok-rate dwell) (READ-01/02/03 dropped; owners `TYPO-HOLD`, `TYPO-CAPTION-CPS`, `TYPO-CAPTION-DURATION`)
- [ ] NARR-01–04 (wpm, pauses, contiguity, no transcript text) (NARR-01/02 dropped; owner `SOUND-NARRATION-WPM`)
- [ ] BEAT-01–06 (gaps, CV, text beats, holds, animators, music sync) (BEAT-05 dropped; owner `MOTION-CHOR-003`)
- [ ] STRUCT-01–03, QUIZ-01, CTA-01
- [ ] LOOP-01/02 if looping (LOOP-01 dropped; owner `MOTION-RHY-004`); PACE-SOUND-01/02 (PACE-SOUND-02 dropped; owner `A11Y-CAPTION-COMPLETE`); SERIES-01–03 (SERIES-03 dropped; owner `STORY-SERIES-REPEAT`); DUR-01
- [ ] Watched in motion, with sound and muted; not judged from stills

**Creation.**
- [ ] Brief fields captured (placement, audience cps, audioLed, duration, bible)
- [ ] Proposition sentence, ≤ 5-word hook, hook type logged (HOOK-02/06, SERIES-03 (dropped; owner `STORY-SERIES-REPEAT`))
- [ ] Two scripts: narration 140–170 wpm, keyword screen text (NARR-01 (dropped; owner `SOUND-NARRATION-WPM`)/04)
- [ ] Tags and `markers` for beats, payoff and CTA; content-derived, varied beat durations (READ-01 (dropped; owner `TYPO-HOLD`)/04, BEAT-02/04)
- [ ] Frame 0 built first (HOOK-01); loop decision explicit (LOOP-01 (dropped; owner `MOTION-RHY-004`)/02)
- [ ] `vcr lint` PACE, muted review, reviewer pass, metrics logged

## 21. Caveats

- **Platform guidance moves.** TikTok labels its windows "general best practices". Meta flipped from sound-off to "sound-on viewing". YouTube redefined Shorts views on 31 March 2025.\[6\]\[13\]\[26\] Re-verify platform quotes every six months.
- **Ad studies are not organic studies.** The 47%/74% and 50%/90% figures measure ad recall and awareness in platform-commissioned research.
- **Reading rates are adult, English, continuous prose.** Headlines read inside moving scenes are plausibly slower, and children, older and second-language viewers read slower still. Brysbaert's participant count appears as 18,573 in the published abstract and 17,887 in the preprint, with the same 238 wpm estimate in both.\[4\]\[5\]\[17\]
- **TikTok's "5-10 words per second" conflicts with reading research.** VCR resolves the conflict editorially in favour of the research (READ-06).
- **Mayer's effect sizes are disputed** by the 2025 meta-analysis. Use the principles for direction only.
- **There is no peer-reviewed shot-length corpus for short-form social video,** so short-form beat values are heuristic. Cutting's 1/f findings are descriptive and contested (Salt; sample-length sensitivity).
- **No validated retention predictor exists.**
- **All rates here are for English.** Netflix publishes other limits for other languages (e.g. Russian adult subtitles 17 cps), so localised pieces need language-specific thresholds.\[52\]
- **Expressive breaks are legitimate:** cold opens, long holds, metronomic music edits, unlooped endings. Allow tags (`hold`, `montage`, `audioLed`, `intentional`) to downgrade severity rather than forcing conformity.
- **Agent failure modes:** homogenised hooks and copy, fade-from-empty openings, uniform beats, over-texting, folklore stats used as thresholds, "fixing" deliberate rhythm, judging motion from stills.

## 22. Verification ledger (checked 2026-11-06)

| # | Claim | Result | Checked against |
|---|---|---|---|
| 1 | TikTok 6 s hook / 3 s proposition / "5-10 words per second"; updated June 2025 | confirmed | TikTok Business Help Center, Creative best practices (fetched) |
| 2 | TikTok "The first 3-6 seconds are critical." | confirmed (snippet) | TikTok SMB Creative Playbook PDF |
| 3 | TikTok 50% in 2 s; 90% recall / ~80% awareness by 6 s; MediaScience 2021 | confirmed (official snippets) | TikTok blog: Resonance; Power of TikTok Pulse |
| 4 | TikTok × System1 "57% more happiness… 19% less attention decay" | confirmed (snippet) | TikTok blog, Creative effectiveness |
| 5 | Bare logo −30% awareness lift | unverified (vendor page only) | System1 site |
| 6 | TikTok In-Feed "21-34 seconds" | unverified (secondary attribution) | selzee.com |
| 7 | "63% of top ads… in 3 s" | unverified (no TikTok page found) | blogs |
| 8 | YouTube "How many chose to view" and "Shown in feed" definitions | confirmed | YouTube Help, Content tab tips – Shorts (fetched) |
| 9 | Shorts views from 3/31/2025, no minimum watch time; Engaged views retained; up to 3 min | confirmed (snippet) | YouTube Help, Get started with Shorts |
| 10 | Engaged views exclude loops; AVD among those who stayed | confirmed (snippet) | YouTube Help, content performance |
| 11 | Viewed-vs-swiped benchmarks | not found (folklore) | YouTube Help; blogs |
| 12 | Facebook/Nielsen 47%/74%; 65%/45%; "41%… meaningless without sound" | confirmed via official-URL snippet (fetch blocked) | facebook.com/business/news/updated-features-for-video-ads |
| 13 | "Build for sound off. Delight with sound on."; 70% sound on | confirmed via snippet (subagent) | facebook.com/business/news mobile video article |
| 14 | "include key messaging or branding within the first 3 seconds"; "Design for sound-on viewing" | confirmed via snippet (subagent) | Meta Tailored Campaigns FAQ |
| 15 | Reels "34.5% lower cost per result" | confirmed via snippet (subagent) | Meta Reels ads page |
| 16 | Meta "under 15 seconds"; in-stream "15 second maximum" | confirmed via snippet (subagent) | Meta business ads pages |
| 17 | Phrase "feature your brand and key message within the first 3 seconds" | not found on a Meta page | subagent search |
| 18 | "85% watched without sound" | unverified; conflicts with #13 | blogs |
| 19 | Netflix 20/17 cps; 42 chars | confirmed (snippet) | Netflix English (USA) TTSG |
| 20 | Netflix 5/6 s min, 7 s max | confirmed via secondary copies | 3Play Media; subtitlematrix |
| 21 | BBC 160–180 wpm; 0.33–0.375 s/word; ~0.3 s/word minimum | unverified (primary not fetchable; secondary copies agree) | clevercast; broadcastwriter; ucop.edu |
| 22 | BBC current version | unverified (v1.2.3 June 2024 vs v1.2.5 March 2026) | broadcastwriter; meetwave |
| 23 | DCMP 130/140/160 wpm | unverified (secondary) | markstudios.com |
| 24 | Brysbaert 238/260/183 wpm; 190 studies | confirmed; participant count conflicts | Scholar abstract; preprint |
| 25 | Foulke & Sticht ~275 wpm | confirmed (as quoted) | Brysbaert; Springer Psychonomic PDFs |
| 26 | Rodero 170/190 wpm | confirmed as reported by Brysbaert | Brysbaert preprint |
| 27 | TikTok 5–10 wps as a reading rate | contradicted by #21 and #24 | arithmetic |
| 28 | Mayer 2017 median d values (multimedia 1.67 etc.) | confirmed | Wiley JCAL abstract |
| 29 | Handbook ch. 12–13 counts and d | confirmed | Cambridge Core abstracts |
| 30 | 2025 meta-analysis g values | confirmed | ScienceDirect S1747938X25000673; NSF PAR |
| 31 | Bordwell ASLs; *Insomnia* | confirmed | Artforum; davidbordwell.net |
| 32 | Cutting 2010 | confirmed | SAGE abstract |
| 33 | Cutting 2018; "no evidence"; Salt critique | confirmed (full text) | PMC5849648 |
| 34 | Cutting 2011 | confirmed | SAGE i-Perception abstract |
| 35 | Nothelfer 2009: 13.0 s (1945), 6.8 s (1965) | confirmed (undergraduate journal) | jordandelong.com |
| 36 | Guo 2014: 6.9M sessions, ≤ 6 min | confirmed | Guo paper; ACM DL |
| 37 | Validated short-form retention model | not found | this pass |

## 23. Sources

The numbered list below matches the escaped `\[n\]` markers in the text. §22 records which page each load-bearing number was checked against and when.

1. [Resonance: A Key Factor For Ad Effectiveness](https://ads.tiktok.com/business/en-US/blog/resonance-key-factor-ad-effectiveness)
2. [Capture Attention with Updated Features for Video Ads](https://www.facebook.com/business/news/updated-features-for-video-ads)
3. [First 3 Seconds TikTok Video Ad: How to Stop the Scroll Every Time](https://coinis.com/how-to/first-3-seconds-tiktok-video-ad)
4. [Average Reading Speed by Age (Data-Backed Charts for 2026)](https://howmanywords.app/blog/average-reading-speed-by-age)
5. [(PDF) How many words do we read per minute? A review and meta-analysis of reading rate](https://www.researchgate.net/publication/332380784_How_many_words_do_we_read_per_minute_A_review_and_meta-analysis_of_reading_rate)
6. [Creative best practices for performance ads](https://ads.tiktok.com/resources/help/article/creative-best-practices)
7. [(PDF) How many words do we read per minute? A review and meta-analysis of reading rate](https://www.researchgate.net/publication/335174808_How_many_words_do_we_read_per_minute_A_review_and_meta-analysis_of_reading_rate)
8. [David Bordwell](https://www.artforum.com/features/david-bordwell-2-195241/)
9. [Average Shot Length in Film: Citizen Kane to Today](https://www.dfirentals.com/news/average-shot-length-in-film-citizen-kane-to-today)
10. [Ad Hooks: 12 Formulas for Writing the First Three Seconds of a Video Ad](https://novoads.ai/en/blog/how-to-make-ad-hooks)
11. [The Power Of TikTok Pulse](https://ads.tiktok.com/business/en-US/blog/power-of-tiktok-pulse)
12. [Content tab analytics tips - Shorts - YouTube Help](https://support.google.com/youtube/answer/12942217?hl=en&co=YOUTUBE._YTVideoType%3Dshorts)
13. [Get started creating YouTube Shorts - YouTube Help](https://support.google.com/youtube/answer/10059070?hl=en)
14. [What Is Good Audience Retention for YouTube Shorts?](https://fluxnote.io/guides/good-audience-retention-youtube-shorts)
15. [YouTube Shorts view count update: impact and strategy for creators in 2026](https://gyre.pro/blog/youtube-shorts-view-count-update-impact-strategy-what-to-do-next)
16. [YouTube Shorts Analytics: The Metrics That Matter (2026)](https://1of10.com/blog/youtube-shorts-analytics/)
17. [Google Scholar](https://scholar.google.com/scholar_lookup?title=How+many+words+do+we+read+per+minute?+A+review+and+meta-analysis+of+reading+rate&amp=&author=M.+Brysbaert&amp=&publication_year=2019&amp=&journal=Journal+of+Memory+and+Language&amp=&pages=104047&amp=&doi=10.1016/j.jml.2019.104047)
18. [Average Reading Speed: How Many Words Per Minute Is Normal?](https://lumenread.net/blog/average-reading-speed)
19. [English (USA) Timed Text Style Guide](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide)
20. [How to Meet Netflix Closed Captions Specifications](https://www.3playmedia.com/blog/netflix-captioning-specs/)
21. [BBC Subtitling Guidelines - Closed Captions Guide](https://www.clevercast.com/bbc-subtitling-guidelines/)
22. [Using multimedia for e‐learning - Mayer - 2017 - Journal of Computer Assisted Learning - Wiley Online Library](https://onlinelibrary.wiley.com/doi/abs/10.1111/jcal.12197)
23. [Intensified Continuity Visual Style in Contemporary American Film](https://www.researchgate.net/publication/249976776_Intensified_Continuity_Visual_Style_in_Contemporary_American_Film)
24. [Attention and the Evolution of Hollywood Film - James E. Cutting, Jordan E. DeLong, Christine E. Nothelfer, 2010](https://journals.sagepub.com/doi/10.1177/0956797610361679)
25. [Want to Make Better Video Ads for Mobile? Here's How](https://www.facebook.com/business/news/want-to-better-video-ads-for-mobile-well-show-you-how)
26. [Tailored Campaigns: Create ads with built-in optimal settings](https://www.facebook.com/business/ads/automation/tailored-campaigns)
27. [TikTok Creative Made Simple](https://ads.tiktok.com/business/library/SMB_Creative_Playbook_External.pdf)
28. [Meta Ads: Start advertising on Facebook, Instagram, Messenger and WhatsApp](https://en-gb.facebook.com/business/ads)
29. [Creativity pays dividends: Effective creative on TikTok drives long-lasting impact for brands](https://ads.tiktok.com/business/en/blog/creative-effectiveness)
30. [The Long and the Short (form) of It - System1 Group](https://system1group.com/creative-effectiveness-tiktok)
31. [TikTok Creative Center Benchmarks and Hook Best Practices for 2026](https://soku.ai/blog/ai-creative-guide-tiktok-ads)
32. [50 TikTok Hooks That Stop the Scroll (Copy and Paste)](https://promptslove.com/blog/tiktok-hooks/)
33. [YouTube Shorts Analytics: Viewed vs Swiped Away · Everpop](https://everpop.app/blog/how-to-read-youtube-shorts-analytics)
34. [Understand your YouTube content performance - Computer - YouTube Help](https://support.google.com/youtube/answer/12220281?hl=en-GB&co=GENIE.Platform%3DDesktop)
35. [Captions and Sound in Facebook and Instagram Video Ads](https://www.brandrocket.net/resources/your-video-ad-has-to-work-with-the-sound-off-then-it-has-to-work-better-with-it)
36. [Instagram & Facebook Reels: Create Short Video Ads](https://www.facebook.com/business/ads/facebook-instagram-reels-ads)
37. [Video Ads: Create Engaging In-Stream, Feed & Stories Ads](https://www.facebook.com/business/ads/video-ad-format)
38. [(PDF) How video production affects student engagement: An empirical study of MOOC videos](https://www.researchgate.net/publication/262393281_How_video_production_affects_student_engagement_An_empirical_study_of_MOOC_videos)
39. [Meta Video Ads: Formats, Specs & Best Practices 2026 - Benly](https://benly.ai/learn/meta-ads/video-ads-guide)
40. [TikTok Ads Best Practices 2026: 10 Rules for DTC Brands](https://selzee.com/blog/tiktok-ads-best-practices)
41. [Visual Style in M. Night Shyamalan’s “Fantastic” Trilogy : The Long Take](https://offscreen.com/view/shyamalan)
42. [Observations on film art : Intensified continuity revisited](https://www.davidbordwell.net/blog/2007/05/27/intensified-continuity-revisited/)
43. [Christopher Nolan A Labyrinth of Linkages David Bordwell with Kristin Thompson](https://www.davidbordwell.net/books/nolan-labyrinth-of-linkages-davidbordwell-190211.pdf)
44. [Quicker, Faster, Darker: Changes in Hollywood Film over 75 Years - James E Cutting, Kaitlin L Brunick, Jordan E DeLong, Catalina Iricinschi, Ayse Candan, 2011](https://journals.sagepub.com/doi/10.1068/i0441aap)
45. [(PDF) How Act Structure Sculpts Shot Lengths and Shot Transitions in Hollywood Film](https://www.academia.edu/610782/How_Act_Structure_Sculpts_Shot_Lengths_and_Shot_Transitions_in_Hollywood_Film)
46. [Temporal fractals in movies and mind - PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5849648/)
47. [Principles for Managing Essential Processing in Multimedia Learning: Segmenting, Pre-training, and Modality Principles (Chapter 13) - The Cambridge Handbook of Multimedia Learning](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/principles-for-managing-essential-processing-in-multimedia-learning-segmenting-pretraining-and-modality-principles/DD24C2F48B9B1277CE59F78276110258)
48. [Caption Reading Speed Study: 387 Videos Measured — Mark Studios](https://www.markstudios.com/research/caption-reading-speed-study)
49. [How YouTube counts Shorts views · ViewGum](https://viewgum.com/guides/how-youtube-counts-shorts-views)
50. [How to Analyze YouTube Shorts Performance \[2025 Guide\]](https://genfuseai.com/blog/how-to-analyze-youtube-shorts-performance)
51. [Shorts Retention and Swipe-Away Rate Explained (2026)](https://www.techcing.com/youtube-shorts-retention-and-swipe-away-rate-explained/)
52. [Russian Timed Text Style Guide](https://partnerhelp.netflixstudios.com/hc/en-us/articles/215346638-Russian-Timed-Text-Style-Guide)
