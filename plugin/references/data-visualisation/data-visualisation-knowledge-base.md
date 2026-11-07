# DATA — Data visualisation in motion: animated charts, data stories and numbers on screen

> **Status.** Seed for the `references/data-visualisation/` pillar, version 0.1, researched 2026-11-06. **Not run through `enrich_draft`:** every attempt was rejected because the draft was over 50,000 characters. Hedged claims have not been swapped for enriched specifics.
>
> **Gaps against the requested structure:**
> - **Sources.** Sources are named in the text, the ledger (§18) records the page each claim was checked against, and the numbered list in §19 matches the escaped `\[n\]` markers.
> - **Verification ledger.** Several rows group related claims, so not every number has its own row.
> - **Length.** This version is condensed from a longer draft to fit the tool limit. It is shorter than the 20–35k tokens asked for. The cuts were mainly to §§10–17 (fewer worked examples, shorter measurement notes and checklists); the rules table is complete.
>
> **Scope.** Whether a chart, map, counter or ranking is accurate and readable at rest and in motion. For movement, durations, palettes, type, accessibility and critique method, cite `MOTION-*`, `PACE-*`/`TYPO-HOLD`, `ART-*`, `TYPO-*`, `A11Y-*` and `REVIEW-*`.
>
> **Tiers:**
> - `standard`: a published style guide, checked against the primary source on 2026-11-06.
> - `platform`: published by a vendor; may change without notice.
> - `heuristic`: a practitioner rule, a secondary source, or an extrapolation from lab research to video.
>
> **Evidence labels.** **[audience evidence]** means controlled studies. **[expert practice]** means codified newsroom or statistical-body judgement. Most published guidance was written for static or interactive web charts. Every adaptation to linear video is flagged.

Treat the **resting frames** of a data scene as the chart. Motion between them must preserve identity and truthful encoding. Declare whether intermediate values represent data-time observations or only a transition between states (§6.2).

The evidence splits two ways:
- **Transitions between related charts help.** Heer & Robertson (2007) found that animated transitions "can significantly improve graphical perception".\[1\]
- **Trend playback is a different matter.** Robertson et al. (2008) found it "the fastest technique for presentation" but said it "does lead to many participant errors". For analysis it was slower and less accurate than small multiples.\[2\]

---

## TL;DR

- **Rest frames carry the message; motion only bridges them.**
  - Every resting state, including the final frame, must pass the static rules on its own:
    - zero baselines for length and area encodings;
    - one honest scale;
    - direct labels and units;
    - a specific source line.
  - ONS: "never make an animation the only way to get the information".\[3\]
- **Transitions must preserve each datum's identity and the honesty of the scale.**
  - Key every mark (object constancy).
  - Stage axis rescaling separately from value change, at about 1 s per stage.
  - Cut or dissolve between unrelated data.
  - Never use overshoot easing, or ease-in-out on a time axis.
  - Trend playback (bar chart races, Gapminder-style) is for guided presentation only, with few tracked marks, ending on a static summary.
  - Staggering is rhythm, not a tracking aid.
- **Most of this pillar can be measured from the seekable scene.** VCR can sample mark geometry against the data file at any time t and check:
  - lie factor within 0.95–1.05;
  - zero inside the scale domain;
  - labels that match the data after rounding;
  - key identity across transitions;
  - overshoot, linear data-time and readable rest holds;
  - presence of the source line.

  The largest agent risk is judging motion from still frames.

---

## Key findings

1. **Animated transitions help viewers follow related charts** [audience evidence].
   - Heer & Robertson (2007) ran two experiments with 24 professionals and found "significant advantages for animation across both syntactic and semantic tasks".\[1\]
   - Staged animation was "significantly preferred to direct animation in most cases".\[1\]
2. **Simple staging beats aggressive staging** [audience evidence].
   - Heer & Robertson: "it is preferable to minimize unnecessary motion than perform 'do one thing at a time' staging".\[1\]
   - They "recommend timing each stage around a full second, rather than around a half-second each".\[1\]
3. **Axis rescaling hurts change estimation, even when animated** [audience evidence].
   - It raised "overall error and the number of unknown ('?') responses".\[1\]
   - Their advice: "if possible, common scales should be used across timesteps".\[1\]
4. **Do not animate between unrelated states** [audience evidence and expert practice].
   - Heer & Robertson: "animation is only appropriate when there is a data dimension shared between the starting and ending states". Otherwise use "static or dissolve transitions".\[1\]
   - Bostock: use "a simpler cross-fade or cut rather than gratuitous, nonsensical movement".\[4\]
5. **Trend animation suits presentation, not analysis** [audience evidence].
   - Mean task times in Robertson et al. (2008):

     | Use | Animation | Small multiples | Traces |
     |---|---|---|---|
     | Presentation | 15.80 s | 25.30 s | 27.80 s |
     | Analysis | 83.10 s | 45.69 s | 55.01 s |

   - Small multiples were "significantly more accurate than Animation (p<.001)".\[2\]
   - Participants rated "I lost track of some data points as they moved" at 4.8 on a 0–6 scale.\[2\]
6. **Staggering does not aid tracking** [audience evidence].
   - Chevalier, Dragicevic & Franconeri (2014) found "a negligible, or even negative, impact on multiple object tracking performance".\[5\]
7. **Filled marks start at zero; unconnected marks may be cropped** [expert practice; ONS, GAF and FT agree].
   - ONS: "For charts that use a filled area or line starting from the axis to represent data values, the axis should always start at zero."\[6\]
   - ONS: "For charts where the data points are not connected to the axis, crop the axis if needed".\[6\]
8. **Position along a common scale is read most accurately** [audience evidence].
   - Area and colour rank low (Cleveland & McGill 1984; replicated by Heer & Bostock 2010).\[7\]\[8\]
9. **Animated sampling can communicate uncertainty** [audience evidence].
   - Hypothetical outcome plots (HOPs) were "comparable on the one-variable trials and much better on the two- and three-variable trials" against error bars and violin plots (Hullman, Resnick & Adar 2015).\[9\]
10. **Sources must be specific** [expert practice].
    - The Government Analysis Function (GAF): "You should give the specific data source for each chart and link directly to it if you can".\[10\]
    - Its format: "[publication, survey or other source of data] from the [organisation]".\[10\]

---

## 1. Static foundations that motion must not break

### 1.1 Baselines and scales

| Chart | Zero? | Exact wording | Tier |
|---|---|---|---|
| Bar | Required | ONS: "The axis on a bar chart should always start from zero." FT: "Must always start at 0 on the axis."\[11\]\[12\] | standard |
| Column | Required | ONS: "The axis of a column chart should always start at zero."\[13\] | standard |
| Area | Required | ONS: "This includes bar charts and area charts."\[6\] | standard |
| Line, scatter, dot | Crop allowed | ONS: "if your data values range between 92 and 100, start your axis at 90, rather than 0". Prefer zero when it costs little: "if your data range from 2.5 to 9.5, start the axis at 0, rather than 2."\[6\] | standard |
| Lollipop | Preferable | FT: "does not HAVE to start at zero (but preferable)."\[12\] | standard |

**Cropped axes (ONS)**
- **Gap below the data:** "When your axis does not start at zero, make sure there is a gap between the start of your axis and the first data point. This gap should be around one-quarter to one-third of the space of the chart."\[6\]
- **Zero line:** "The line at the zero point on your axis should have more emphasis than standard gridlines."\[6\]
- **No false floor:** "If your axis does not start at zero, it should not have any emphasis on the gridline at the start of the axis."\[6\]
- **Negative values:** show "at least one gridline below zero and one gridline above zero."\[6\]

**A bar axis cannot be broken**
- GAF: "Even if a break in the axis is clearly signposted, the relative size of bars is still displayed very strongly on bar charts." It suggests "a Cleveland dot plot" instead.\[10\]\[14\]
- Real case: the Office for Statistics Regulation wrote to HM Treasury in February 2023 about a bar chart whose y-axis started at 8%, which exaggerated a fall from 11.1% to 10.1% (as described by GAF).\[10\]
- Datawrapper, Reuters' newsroom charting tool, "doesn't allow you to begin your y-axis at something greater than zero" on bar charts.\[15\]\[16\] (`platform`; reported by the research subagent.)

**Other scale types**
- **Log scales.** ONS: "Avoid log scales, and other non-linear scales, except where there is no other way to show your data clearly." The exception is odds ratios, plotted "on a log base 2 scale".\[6\]
- **Consistent scales.**
  - ONS: "If you are making several charts that show comparable data, try to use the same axis scale for each chart. Different scales can be misleading."\[6\]
  - BBC R cookbook: "It's always best to use the same y axis scale across small multiples, to avoid misleading".\[17\]
  - In video, consecutive shots of comparable data are small multiples in time, so the same rule applies.
- **Dual axes: the sources disagree.**
  - ONS: "Avoid using dual axis charts as they are often misleading and difficult to interpret".\[6\]
  - FT calls line + column "A good way of showing the relationship over time between an amount (columns) and a rate (line)".\[12\]
  - VCR default: avoid them. Allow only an amount-plus-rate pair, with colour-keyed axes that are never rescaled independently.

**Expressive break (heuristic).** Never crop a bar chart. To dramatise small differences, start on the full zero-based chart, then make a visible camera push-in to the bar ends, so the viewer has already seen the true proportions. Or switch to a dot plot.

### 1.2 Aspect ratio and slope

- **Banking to 45°.** Cleveland chooses the aspect ratio so that the "average absolute orientation of line segments in the chart is equal to 45 degrees". This maximises how well viewers can tell slopes apart (Heer & Agrawala 2006).\[18\]
- **Multi-scale banking.** One series can need different ratios for different features. In their CO₂ example, an aspect ratio of 1.17 shows the accelerating trend and 7.87 shows the seasonal cycles.\[19\]
- **In video (heuristic).**
  - A 9:16 frame tempts agents to stretch line plots tall, which steepens every slope.
  - Choose the plot-area ratio from the data and the message, not from the frame.
  - Changing the plot's aspect ratio mid-shot changes every slope without any change in the data. Stage it and announce it, as you would an axis rescale.

### 1.3 Encodings

- **Accuracy ranking.** Cleveland & McGill (1984) ranked "Position along a common scale" first among elementary perceptual tasks. Area, volume and colour rank low. Heer & Bostock (2010) replicated the ranking on Mechanical Turk.\[7\]\[20\]
- **Bubble size.** Robertson et al. noted that "changes of position of bubbles will be much more accurately judged that changes of bubble size", and did not test size animation.\[2\]
- **Area must scale with value.** Radius must be ∝ √value. Making radius ∝ value squares the visual effect; this is the commonest agent bug.
- **No 3D.** GAF lists "3D shapes" among things to avoid.\[10\] Rotating 3D bars change every bar's projected length continuously, so the data appear to change.
- **GAF category limits:**
  - "limit the categories on a pie chart to a maximum of five";\[10\]
  - "Aim for a maximum of four categories within each stack";\[10\]
  - "we advise a limit of four bars per cluster";\[10\]
  - "The gap between bars should be narrower than the width of a single bar."\[10\]
- **FT on pictograms:** "use only with whole numbers (do not slice off an arm to represent a decimal)."\[12\]

### 1.4 Colour scales

This section covers how data maps to colour. Palettes belong to `ART-*` and colour-vision deficiency to `A11Y-*`.
- **Choose the scale type from the data.** Reuters Graphics' colour page says: "Categorical: Good for non-numeric data… Sequential: Good for numeric data that increases from low to high… Diverging: Good for data that increases in two directions, like vote margins."\[21\] (Search snippet only; `unverified`.)
- **Diverging scales** need a stated midpoint (heuristic).
- **Colour must not be the only key.**
  - GAF: legends that rely on colour matching fail WCAG 1.4.1.\[10\]
  - BBC GEL: "Design it monochrome to begin with, and only add colour where desirable."\[22\]
- **Fix the colour domain across all timesteps** (heuristic, extrapolated from the rescaling result). A per-frame domain is a silent colour rescale.

### 1.5 Labelling over legends

- **Direct labels.**
  - GAF: "In line charts legends can be avoided by labelling the lines directly. If you cannot place the label on the chart area, put it at the end of the line on the right hand side of the chart."\[10\]
  - BBC cookbook: "it's better to label data directly with text annotations."\[17\]
- **Horizontal text.** GAF: "always use horizontal text as vertical or diagonal text is hard to read".\[10\]
- **Gridlines.**
  - GAF: "generally, we advise a maximum of ten."\[10\]
  - ONS: "use 6 to 10 gridlines for a standard desktop view" and "three to six gridlines for a mobile view", at "sensible, round-number, intervals".\[6\]
- **In motion (heuristic).** Labels travel with their marks. Consulting a legend while marks move stacks colour-matching on top of tracking.

### 1.6 Annotation

- **GAF:**
  - "Use annotations to highlight key features, provide context and aid interpretation";\[10\]
  - "Place them as close as possible to the data points of interest";\[10\]
  - "Do not overuse them".\[10\]
- **ONS, on context lines such as targets:** "Always include an annotation to explain the relevant context."\[6\]
- **Why it matters for video.** Robertson et al. note "one key aspect of presentations featuring animation was having a narrator explaining what the data was doing".\[2\] In muted video, annotation has to do the narrator's job.

---

## 2. Animated transitions

### 2.1 Taxonomy and principles (Heer & Robertson 2007)

**Transition types.** Classify every VCR transition as one of:
- View Transformation\[1\]
- Substrate Transformation\[1\]
- Filtering
- Ordering\[1\]
- Timestep\[1\]
- Visualization Change\[1\]
- Data Schema Change\[1\]

**Congruence principles:**
- "Maintain valid data graphics during transitions."\[1\]
- "Use consistent semantic-syntactic mappings."\[1\]
- "Respect semantic correspondence." Marks "should not be reused to depict different data points across a transition".\[1\]
- "Avoid ambiguity."\[1\]

**Apprehension principles:**
- "Group similar transitions."\[1\]
- "Minimize occlusion."\[1\]
- "Maximize predictability" (which "suggests slow-in slow-out timing").\[1\]
- "Use simple transitions."\[1\]
- "Use staging for complex transitions."\[1\]
- "Make transitions as long as needed, but no longer", citing "transition times around 1 second, though transitions with minimal movement can likely be performed faster."\[1\]

**Study parameters.** These calibrate the evidence; they are not standards.
- Transitions lasted 1.25 s (Experiment 1) and 2 s (Experiment 2).\[1\]
- Each chart was shown for 3 s first, and the screen was masked 3 s after the transition began.\[1\]
- Charts had 8 or 16 marks.\[1\]
- "tracking error increased with size in all conditions except the Stacked to Grouped Bars transition."\[1\]

### 2.2 Staging

**Do:**
- Use two simple stages, such as:
  - rescale, then change values;
  - move along x, then morph points into bars;
  - change bar widths, then drop the bars into place.
- Order the stages so nothing clips (heuristic):
  - rescale *first* when values grow beyond the axis;
  - rescale *after* the value change when values shrink.
- Keep gridlines through a rescale. Heer & Robertson suggest "Retaining grid lines through the scale change, and then fading them out gently after all other transitions have been completed".\[1\]

**Avoid:**
- Extreme multi-stage transitions. These "resulted in increased error", and "most subjects laughed upon first viewing the multi-staged stacked bars transition."\[1\]

**Filtering.** Heer & Robertson's system (DynaVis) faded filtered items in and out rather than having bars "grow up from a baseline".\[1\] For VCR (heuristic):
- Growing bars from zero on the *first* build is fine.
- Flying marks in from offscreen during a filter implies movement that is not in the data.

### 2.3 Object constancy

- **Definition (Bostock 2012):** "a graphical element that represents a particular data point (such as Ohio) can be tracked visually through the transition. This lessens the cognitive burden by using preattentive processing of motion rather than sequential scanning of labels."\[4\]
- **Implementation (D3 paper):** "Matching key values preserve object constancy across transitions".\[23\]
- **Failure mode:** "If you forget to specify a key function, the default join-by-index can be misleading!"\[4\] In a ranking re-sort joined by index, slot #1 simply changes length and label. Viewers then see one entity change value when two entities actually swapped places.
- **Abuse (Heer & Robertson):** object constancy "can be abused if an object is transformed into a completely unrelated object, establishing a false relation."\[1\]

### 2.4 Trend animation, Gapminder and bar chart races

**Robertson et al. (2008) setup and findings**
- They compared 3 visualisations (animation, traces, small multiples) at 2 dataset sizes (18 and 80 countries), in both presentation and analysis use.\[2\]
- Accuracy averaged 65%.\[2\]
- Tempo: "we use 10 seconds for an animation depicting 25 years of data; as such, we animate at 2.5 years per second". The authors add, "we do not know the optimal time for a trend animation."\[2\]
- Ceiling: "perhaps up to about 200" points, "based on informal observation".\[2\]
- Hans Rosling's technique: he "primes the observer to look at a particular part of the bubble chart before some significant event occurs."\[2\]

**Bar chart races (secondary: Built In)**
- The r/dataisbeautiful subreddit imposed a temporary moratorium on them.\[24\]
- Flourish's co-founder defends them as "one of hundreds of visualization styles, each of which is suited to different situations".\[24\]

A race is acceptable as an engagement piece if it:
- keeps keyed identity;
- uses a fixed or announced scale;
- uses linear time;
- annotates key overtakes;
- ends on a held final ranking.

**Phone versus desktop.** Brehmer et al. (2019) report a newsroom pattern of "animation on the phone, small multiples on the desktop".\[25\] Brehmer et al. is the source of this observation, not a study of it (secondary).

### 2.5 Staggered against simultaneous movement

- **The evidence.**
  - Heer & Robertson staggered sorts to reduce overlap, and measured "small but noticeable decreases in the amount of overlap".\[1\]
  - Chevalier et al. found staggering negligible or harmful, even in the cases most favourable to it. They advise transitions to "reduce TARGET CROWDING first".\[5\]\[26\]
- **VCR position (heuristic).**
  - Stagger is a style choice, owned by `MOTION-*`.
  - For legibility, rely on common fate: "objects that undergo similar visual changes are more likely to be perceptually grouped".\[1\]
  - Use fewer marks, highlighted targets and paths that do not cross.

---

## 3. Building a chart on screen

### 3.1 Order of reveal

The default sequence:
1. Title or claim, axes and units.
2. Data.
3. Emphasis.
4. Annotation.
5. A hold with the source visible.

Within that sequence:
- Bars grow from the zero baseline.
- Lines draw in time order.
- Points appear at their final positions.

**Reverse order** (the number first, as a hook) is legitimate if the supporting chart follows in the same shot and the source is visible alongside the claim (heuristic).

**Never grow marks from a crop line**; it implies that line is zero.

### 3.2 Reading time

Durations belong to `PACE-*` and `TYPO-HOLD`. This pillar defines what needs a hold:
- every number label;
- every axis label and unit at its first appearance;
- every annotation;
- the source line;
- every mark the narration names.

The study parameters (3 s views; 2.5 years per second) are sanity floors, not targets.

### 3.3 Points per beat

- **No per-beat number exists for linear video** (`heuristic`).
- **Evidence:**
  - Tracking error rose from 8 to 16 marks (Heer & Robertson).\[1\]
  - The 18-country dataset was read more accurately than the 80-country one (Robertson et al.).\[2\]
- **Rule of thumb:**
  - Ask the viewer to *track* only a few highlighted marks; Heer & Robertson's task used two.\[1\]
  - Name them before motion starts.
  - De-emphasise everything else as context.

### 3.4 Emphasis by isolation

- Grey the context and keep the focus coloured and directly labelled. In Robertson et al.'s design, "unselected bubbles are greyed out", which "makes the selected bubbles more salient, and deals with clutter issues."\[2\]
- Dimming is honest. Deleting inconvenient series is cherry-picking, unless the title says what is shown.

---

## 4. Numbers on screen

### 4.1 Count-ups

No study of count-up timing was found, so every rule here is `heuristic`.

1. **Land exactly** on the data file's value after the declared rounding.
2. **Hold from the landing frame** (`TYPO-HOLD`), not from the start of the count.
3. **No overshoot.** Back and elastic eases display values that are not in the data.
4. **Count monotonically toward the target**, with the correct sign.
5. **Use tabular figures** (`TYPO-*`) so the number's width doesn't jitter.
6. **Watch for count-ups that hide the value:**
   - a count cut off before it lands;
   - a voiceover that says the number before it is visible;
   - intermediate values on rates, which mean nothing.

   Count-ups are most honest for cumulative quantities.
7. **Running totals over time** should advance linearly in data time (`DATA-TIME-LINEAR`).

### 4.2 Rounding and units

- Use one precision per comparable series (heuristic).
- State unit and period at first appearance. GAF's statistical subtitle "should say what the data is, the geography the data relates to and the time period shown".\[10\]
- Distinguish percentage points from percent: 10% → 12% is +2 pp, or +20%.
- On-screen text must equal format(round(value)) under the brief's declared rounding mode.

### 4.3 Large numbers and locales

- **Grouping separators.** GAF: "use commas to separate thousands… 121,576 is easier to read than 121576".\[10\] This holds for en-GB and en-US; other locales use different separators.
  - Format through `Intl.NumberFormat(locale)`. Its behaviour was not verified in this session (`unverified`); test it in headless Chromium.
- **Compact forms.** The BBC cookbook examples use "2bn" and "4bn".\[17\] Use one convention per series, defined in `BRIEF-*`.
- **"Billion" in translation.** In some languages the cognate means 10¹², so translations need a numeric check (heuristic).

### 4.4 Comparison framing

- **Relative changes need their base on screen.** For example, show "1 to 2 in 10,000" alongside "doubled" (heuristic).
- **Rates or totals.**
  - FT on choropleths: "should always be rates rather than totals".\[12\]
  - FT on proportional symbols: "Use for totals rather than rates".\[12\]
  - When ranking countries, use rates unless magnitude is the story.
- **Correlation and causation.**
  - FT: "unless you tell them otherwise, many readers will assume the relationships you show them to be causal".\[12\]
  - Heer & Robertson: "animated behaviors can give rise to perceptions of causality".\[1\] Don't choreograph one series so that it appears to trigger another.

### 4.5 Uncertainty

**ONS (`standard`):**
- "To show uncertainty we use a shaded band around a central estimate"; "We do not use bar or column charts with error bars".\[27\]
- Single-number measures such as standard errors "should not be shown in charts".\[27\]
- Use plain language: "we are 95% sure the value falls in this range".\[27\]
- Show uncertainty when there are "large overlaps between uncertainty ranges".\[27\]
- If uncertainty is so high that no meaningful comparison is possible, "do not show the data in a chart".\[27\]

**FT fan chart:** "Use to show the uncertainty in future projections - usually this grows the further forward to projection."\[12\]

**HOPs** [audience evidence]:
- Strongest on multi-variable judgements, but "Animated HOPs performed worse on some types of one-variable trials" (Hullman et al. 2015).\[9\]
- Kale et al. (2018) found that HOPs help untrained observers judge trends in ambiguous data.\[28\]

**In VCR (heuristic):**
- Seed HOPs draws.
- Label the frames as possible outcomes.
- Hold each outcome long enough to read.
- Keep the boundary between actual and forecast visible in every frame.

---

## 5. Maps in motion

- **Projections.**
  - Web Mercator is the web default but distorts area. Battersby et al. (2014): "equal-area projections are often suggested for global-scale thematic mapping". Axis Maps: "If you are making choropleth or dot density maps, look for an equal-area projection."\[29\]\[30\]
  - Typical choices (secondary, `heuristic`): Equal Earth or Mollweide for the world, Albers for the USA, LAEA for Europe.\[31\]
  - A projection morph is a substrate change: complete it, let it settle, then reveal the data.
- **Choropleths.**
  - FT: "should always be rates rather than totals and use a sensible base geography."\[12\]
  - An NSF-hosted study found that 31 of 50 US state COVID-19 dashboards (62.0%) "incorrectly used unnormalized data in choropleth maps".\[32\]
  - FT alternatives to area bias: "Scaled cartogram (value)", "Equalised cartogram" and "Proportional symbol (count/magnitude)".\[12\]
  - Keep class breaks fixed across timesteps.
  - Use a map only when, in FT's words, "precise locations or geographical patterns in data are more important to the reader than anything else."\[12\]
- **Camera moves (heuristic).**
  - Keep the legend and class breaks fixed during zooms and pans.
  - Don't pan or zoom while values change.
  - Keep a locator inset when zoomed in.
- **Flows.**
  - FT: a flow map is "For showing unambiguous movement across a map."\[12\]
  - Particle speed implies a rate, so keep it constant unless it encodes data.
  - Draw routes in their real time order, or all at once.

---

## 6. Integrity and misleading motion

### 6.1 Catalogue

| Failure | Mechanism | Detection |
|---|---|---|
| Truncated bar or area axis | Length no longer ∝ value | 0 ∉ domain for a length mark |
| Cherry-picked window | The time window manufactures a trend | Judgement against the full series (FT: "Choosing the correct time period is important to provide suitable context")\[12\] |
| Dual axes | Arbitrary alignment of two scales | Two y-scales |
| Silent rescale | Same pixels, different values | Domain change overlaps a value change |
| Per-frame colour domain | The meaning of a colour drifts | Colour domain varies with t |
| Index-joined re-sort | False identity | The key at a node changes |
| Overshoot easing | Shows values not in the data | A sampled value passes the target |
| Eased time playback | False acceleration | Non-linear mapping from scene time to data time |
| 3D rotation | Projected lengths change | Perspective transform on marks |
| Unrelated morph | False relation | No shared keys or fields |
| Radius ∝ value | Area exaggeration | Area/value ratio not constant |
| Number never at rest | Unreadable | Final value held for less than `TYPO-HOLD` |

### 6.2 Easing and false acceleration

- Slow-in/slow-out suits state-to-state transitions, whose intermediate frames are not data.
- When the animation *is* the time axis, scene time must map linearly to data time. Ease-in-out makes the middle years look faster than the ends, even when the trend is constant.
- This rule is derived from "Maintain valid data graphics during transitions" (`heuristic`).
- An explicit, labelled pause is fine. A hidden ease is not.

### 6.3 Official guidance on animation (exact)

- **ONS:**
  - "animations can make it difficult for users to see the whole story clearly. This is because not all of the data points are shown at once, so they may be difficult to compare."\[3\]
  - "keep the animated elements to a minimum, as using too many can be distracting".\[3\]
  - "make sure there is a way for the user to control the animation".\[3\] Linear video has no controls, so rest holds and a final summary replace them (heuristic).
- **GAF:** "If you cannot write down the message your chart is giving in a few sentences, you should think again about the chart you have chosen."\[10\]
- **BBC GEL:** "In most cases, you should avoid creating interactive visualisations, and instead use the recommended combination of alternative text, caption, and supplementary data table/source."\[22\]
- **Reuters:** no published chart rules were found on baselines, sources, formatting, legends or animation. Its style repository was archived on 3 December 2024.\[33\]

### 6.4 Tufte

- **Lie factor** = "size of effect shown in graphic / size of effect in data". "Lie Factors greater than 1.05 or less than .95 indicate substantial distortion, far beyond minor inaccuracies in plotting."\[34\]\[35\]\[36\]
  - This wording comes from an OCR snippet and consistent secondary sources. It is `unverified` against the printed page.
  - Worked example (secondary source): Tufte's fuel-economy chart showed a +53% data change as a +783% visual change, a lie factor of 14.8.\[37\]\[38\]
- **What kind of claim this is.** The lie factor is a definition, not a perceptual finding; the ±5% band is Tufte's judgement. It is still well suited to automation.
- **Data-ink and chartjunk are taste.** Use them as critique vocabulary. Heer & Robertson's term "temporal 'chart junk'" names decorative animation.\[1\]

---

## 7. Sourcing and provenance

**Research versus chart integrity.** [Domain Exploration §3](../domain-exploration/README.md) owns generic source evaluation and `DOMAIN-SOURCE-TRACE`; `STORY-CLAIM-SOURCE` checks claims in the plan. Data owns the transform from source cells to visible values (`DATA-LABEL-MATCH`, `DATA-PROVENANCE`). A trusted source alone does not establish a correct chart. Keep source evidence and transforms linked in the workspace.

- **GAF.**
  - Use the format "[publication, survey or other source of data] from the [organisation]".\[10\]
  - Don't link a bare organisation name to its homepage.\[10\]
  - Footnotes: "limit them to only important information" and "be concise".\[10\]
- **BBC cookbook.** The source sits "at the bottom left corner of your plot", written like "Source: ONS".\[17\]
- **In video (heuristic).**
  - Show the source on every data shot, not just the end card.
  - Keep it inside `TYPO-SAFE` and at or above the `TYPO-*` minimum size.
  - Add the data vintage for series that get revised.
- **Traceability.** Every on-screen number traces to a cell in the data file through a declared transform (`DATA-LABEL-MATCH`, `DATA-PROVENANCE`).

---

## 8. Data-driven scenes in VCR

**Separate the inputs**
- `data/<scene>.csv` or `.json`.
- A `meta.json` with `source`, `sourceUrl`, `retrieved`, `period`, `geography`, `units`, `rounding`, `transform` and `key`.
- A chart spec: Vega-Lite JSON or a small config.
  - Vega-Lite's `zero` and `domain` scale properties would make baselines checkable from the spec. (Not checked in this session; `unverified`.)
- The scene is a pure function of (data, spec, t): seeded randomness, no wall clock.

**Deterministic layout**
- Compute scales from the global domain across all timesteps.
- Break sort ties stably by key.
- Wait for `document.fonts.ready` before measuring.
- Interpolate linearly in data time.

**Re-render on data change**
- Hash data, meta and spec; any change invalidates existing renders.
- Re-run the DATA checks, because a new maximum can break annotations.
- Anchor annotations to data keys, not to pixels.

| Tool | Fit | Notes |
|---|---|---|
| D3 | Excellent | Use its scales and keyed joins. Drive attributes from `seek(t)`, not from wall-clock `d3-transition` timers. |
| Vega-Lite / Vega / Observable Plot | Good for keyframes | Interpolate in scene code. The spec is the checkable artefact. |
| Hand-built SVG | Best for checks | Tag marks with `data-key`, `data-field` and `data-value`. |
| GSAP / Anime.js / WAAPI | Fine for choreography | Pause and seek them. No back or elastic eases on data properties. |
| canvas-2d, PixiJS, Konva, Two.js, p5.js | Fine | Expose a mark registry. |
| three.js / Blender | Decorative | Use orthographic cameras for data marks. |

**Proposed contract extension.** This is the single most valuable addition for this pillar:
- `__scene.marks(t) → [{id, key, field, value, encoding, px, baselinePx, scaleId, visible, bbox}]`
- `__scene.scales(t) → {id: {type, domain, range, zero}}`
- `__scene.dataTime(t)`
- `__scene.dataMeta`

---

## 9. Medium-specific guidance

| Medium | Guidance |
|---|---|
| **9:16** | Mostly watched muted, so annotation carries the story. Prefer horizontal bars and 3–6 gridlines (ONS, mobile). Don't stretch line plots tall. Put the title above and the source below, inside `TYPO-SAFE`. Bar chart races are native here, under the §2.4 conditions. |
| **16:9** | Room for end-of-line labels and small multiples. Use 6–10 gridlines. |
| **Square** | Use 9:16 label density. Suits single statistics and simple bars. |
| **Stills** | Every static rule applies. A still taken from a motion piece must be a rest frame. |
| **Loops** | The seam must not read as a jump in the data, so make the reset visible. Avoid looping count-ups, which read as "fell to zero". |

---

## 10. Analysis and critique process

Work in this order: data → rest frames → motion → delivery. Integrity outranks style.

1. **Claim.** Is the message on screen? Does the chart fit its FT category: Deviation, Correlation, Ranking, Distribution, Change over Time, Magnitude, Part-to-whole, Spatial or Flow?\[39\]
2. **Data and meta.** Check source, period, units and transform. Should it be rates or totals?
3. **Rest frames.** Check every marker and the final frame for:
   - baseline;
   - lie factor and area encoding;
   - labels against the data;
   - units and source;
   - category limits and direct labels.
4. **Scrub the transitions.** Sample every frame, plus 4× around transitions. Check:
   - keys;
   - rescale staging;
   - overshoot;
   - valid intermediate frames;
   - unrelated morphs;
   - linear time.

   Never judge motion from stills.
5. **Watch at full speed,** both muted and with sound.
6. **Check the delivered encode.**
7. **Report** each finding with its severity, rule ID, time range, measured value and threshold.

| Severity | Meaning | Examples |
|---|---|---|
| **Blocker** | The viewer leaves with a false number or relation | Truncated bar; radius ∝ value; label ≠ data; index-joined re-sort; totals on a choropleth; missing source; silent rescale |
| **Major** | True, but hard to read | Number never at rest; legend lookup during motion; more than 5 pie slices; drifting colour domain; no units |
| **Minor** | Craft | Gridline count; intervals; stagger rhythm |
| **Note** | Taste | Data-ink and decoration choices |

**Vocabulary for findings:**
- "truncated baseline"
- "lie factor = x.xx"
- "area encoded by radius"
- "object constancy broken (index join)"
- "unstaged rescale"
- "false relation"
- "temporal chart junk"
- "cherry-picked window"
- "dual-axis alignment"
- "spaghetti"
- "legend lookup under motion"
- "number not at rest"
- "eased time axis (false acceleration)"
- "totals on a choropleth"
- "the animation is doing the work the chart should"
- "source missing/non-specific"

**Where agents go wrong:**
- judging motion from stills;
- forcing zero onto line charts, which ONS allows to be cropped;
- defaulting to the same races and count-ups for every story;
- treating study parameters as standards;
- measuring geometry from pixels when the scene can report it;
- "fixing" a bar chart with a break symbol;
- inventing a source line.

---

## 11. Creation process

**Reference and imagery inputs.** Use [Visual Research §3–4](../visual-research/README.md) to study chart precedents with `VREF-OBSERVATION-LOCATOR`, without copying scales or encodings that do not fit the data. [Cultural Context §2–4](../cultural-context/README.md) supplies scoped readings of symbols and colours; accessibility still owns distinguishability. [Image Direction §1–2](../image-direction/README.md) can identify when a diagram should carry the message, but `DATA-*` retains quantitative integrity.

1. Brief → claim → FT category → viewer task.
2. Data → meta. Normalise, and fix the rounding.
3. Choose a position or length encoding within the category limits.
4. Design rest states for each beat. Each must pass every static rule.
5. Design transitions:
   - classify each one;
   - key every mark;
   - use 1–2 stages of about 1 s;
   - use global scales;
   - cut between unrelated states;
   - keep data time linear.
6. Numbers: format by locale, and make count-ups land and hold.
7. Annotate, naming the tracked marks before they move.
8. Put a source line from meta on every data shot.
9. Fit the medium. The plot's aspect ratio comes from the data.
10. Verify: run the checks, then review, scrub and watch at speed, then check the delivered file.

---

## 12. Authoritative sources and canon

| Source | Why it matters | Type |
|---|---|---|
| Heer & Robertson 2007, IEEE TVCG 13(6) | Transition taxonomy, staging, rescaling | Audience evidence |
| Robertson, Fernandez, Fisher, Lee & Stasko 2008, IEEE TVCG 14(6) | Trend animation; InfoVis Test of Time award 2018\[25\] | Audience evidence |
| Chevalier, Dragicevic & Franconeri 2014, IEEE TVCG 20(12) | Staggering | Audience evidence |
| Cleveland & McGill 1984; Heer & Bostock 2010 | Encoding accuracy | Audience evidence |
| Heer & Agrawala 2006 | Banking and aspect ratio | Method and evidence |
| Hullman, Resnick & Adar 2015; Kale et al. 2018 | HOPs | Audience evidence |
| Bostock 2012; Bostock, Ogievetsky & Heer 2011 | Object constancy, keyed joins | Expert practice |
| ONS Service Manual; GAF *Data visualisation: charts* (19 May 2022); FT Visual Vocabulary | Thresholds and chart choice | `standard` |
| BBC R cookbook (2019); BBC GEL technical guide | Source lines, direct labels | Expert practice |
| Tufte 1983 | Lie factor and data-ink | Expert taste |

**Practitioners:**
- Alan Smith and John Burn-Murdoch (FT);\[40\]
- Andy Cotgreave and Andy Kirk (the bar chart race debate);
- Nassos Stylianou and Clara Guibourg (BBC bbplot).\[41\]

---

## 13. Rules table

**Applies to:** U = universal; M = motion; S = stills.
**Measurability:** M✓ = measurable; J = judgement only.

| ID | Check | Threshold | Tier | Applies to |
|---|---|---|---|---|
| `DATA-ZERO-BASELINE` | Bar, column and area marks have 0 in the domain and grow from scale(0) | 0 ∈ domain; baseline within ±1 px | standard (ONS, GAF, FT) | U; M✓ |
| `DATA-LIE-FACTOR` | (px_a/px_b)/(v_a/v_b) for same-scale length pairs | 0.95–1.05 | heuristic (Tufte; wording unverified) | U, rest; M✓ |
| `DATA-AREA-SQRT` | Area ∝ value | Ratio 0.95–1.05 | heuristic | U; M✓ |
| `DATA-CROP-GAP` | Gap below cropped data | "around one-quarter to one-third" | standard (ONS) | Line, scatter, dot; M✓ (warn) |
| `DATA-ZERO-EMPHASIS` | Zero line emphasised; cropped floor not emphasised | Zero stroke > grid stroke | standard (ONS) | U; M✓ |
| `DATA-DUAL-AXIS` | One value scale per orientation | ≤1 (warn at 2) | standard (ONS; conflicts with FT) | U; M✓ |
| `DATA-LOG-LABEL` | Non-linear scale labelled before marks move | Label visible ≥ `TYPO-HOLD` before motion | standard (ONS) + heuristic | U; M✓ |
| `DATA-SCALE-STABLE` | Domain constant unless a staged rescale is declared | No undeclared change | heuristic (Heer & Robertson; ONS) | M; M✓ |
| `DATA-RESCALE-STAGED` | Rescale and value change don't overlap; gridlines kept | Overlap 0; grid opacity > 0 | heuristic (Heer & Robertson) | M; M✓ |
| `DATA-COLOUR-DOMAIN-STABLE` | Colour domain and breaks constant per shot | Identical for all t | heuristic | M, maps; M✓ |
| `DATA-OBJECT-CONSTANCY` | Each node keeps its datum key across a transition | key(t₀) = key(t₁) | heuristic (Bostock; Heer & Robertson) | M; M✓ |
| `DATA-UNRELATED-CUT` | No interpolation between specs that share no key or field | Cut or dissolve only | heuristic | M; M✓ + J |
| `DATA-NO-OVERSHOOT` | Data geometry and numerals never pass the target | Excess 0 (±0.5 px) | heuristic | M; M✓ |
| `DATA-VALID-INTERMEDIATE` | Transitions preserve truthful encoding and identity | Preserve applicable baselines and labels; do not present state-transition interpolation as observed data (§6.2) | heuristic (Heer & Robertson) | M; M✓ |
| `DATA-STAGE-DURATION` | Each stage long enough to track | ≈1 s; flag <0.5 s for large moves | heuristic (study parameter) | M; M✓ |
| `DATA-STAGE-COUNT` | Simple staging | Warn at >2 stages | heuristic | M; M✓ |
| `DATA-TRACKED-MARKS` | Tracked marks highlighted and named before motion | Highlight onset < motion onset; warn at >5 | heuristic | M; M✓ |
| `DATA-TREND-SUMMARY` | Playback ends on a held static summary | Hold ≥ `TYPO-HOLD`/`PACE-*` | standard (ONS, adapted) | M; M✓ + J |
| `DATA-TIME-LINEAR` | Scene time maps linearly to data time | Slope CV ≤2% outside declared pauses | heuristic | M; M✓ |
| `DATA-MARK-COUNT` | Moving marks per shot | Warn at >80; strong warn at >200 | heuristic (Robertson, informal) | M; M✓ |
| `DATA-LABEL-MATCH` | Text = format(round(value)) | Exact | heuristic | U; M✓ |
| `DATA-COUNTUP-LAND` | Count-up lands exactly and rests | Stable ≥ `TYPO-HOLD` | heuristic | M; M✓ |
| `DATA-COUNTUP-MONOTONIC` | Count-up moves monotonically toward the target | No reversal | heuristic | M; M✓ |
| `DATA-UNITS` | Unit and period at first appearance | Present in frame | heuristic (GAF) | U; M✓ |
| `DATA-THOUSANDS` | Locale grouping separators | Superseded: use `ADAPT-LOCALE-FORMAT`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | U; M✓ |
| `DATA-PRECISION-CONSISTENT` | Equal decimals across a series | Equal | heuristic | U; M✓ |
| `DATA-PP-VS-PERCENT` | Percentage points vs percent worded correctly | — | heuristic | U; J |
| `DATA-RATE-NORMALISE` | Choropleths use rates | meta.transform = rate | standard (FT) | Maps; M✓ |
| `DATA-EQUAL-AREA` | World or continental thematic maps use an equal-area projection | Allow-list | heuristic | Maps; M✓ |
| `DATA-MAP-CAMERA` | Camera moves don't overlap value changes | Overlap 0 | heuristic | Maps; M✓ |
| `DATA-SOURCE-LINE` | Specific source from meta visible on every data frame | Present; in `TYPO-SAFE`; ≥ `TYPO-*` minimum | standard (GAF) | U; M✓ |
| `DATA-PROVENANCE` | Meta fields complete | All non-empty | standard (GAF) + heuristic | U; M✓ |
| `DATA-DIRECT-LABEL` | Direct labels; no colour-only legend during motion | — | standard (GAF, BBC) | U; M✓ partial |
| `DATA-HORIZONTAL-TEXT` | Labels horizontal | 0° rotation | standard (GAF) | U; M✓ |
| `DATA-GRIDLINES` | Gridline count and round intervals | Mobile 3–6; desktop 6–10; ≤10 | standard (ONS, GAF) | U; M✓ |
| `DATA-PIE-LIMIT` | Pie categories | ≤5 | standard (GAF) | U; M✓ |
| `DATA-STACK-LIMIT` | Categories per stack | ≤4 | standard (GAF) | U; M✓ |
| `DATA-CLUSTER-LIMIT` | Bars per cluster | ≤4 | standard (GAF) | U; M✓ |
| `DATA-BAR-GAP` | Gap narrower than bar width | gap < width | standard (GAF) | U; M✓ |
| `DATA-NO-3D` | No perspective or 3D on data marks | None | standard (GAF) | U; M✓ |
| `DATA-UNCERTAINTY` | Band or range shown where it changes interpretation; no error bars on bars | — | standard (ONS) | U; M✓ partial |
| `DATA-HOPS-RATE` | HOPs draws seeded, labelled and readable | Seeded; labelled; hold per brief | heuristic | M; M✓ |
| `DATA-PROJECTION-BOUNDARY` | Actual vs forecast distinguished in every frame | Style change | heuristic | U; M✓ |
| `DATA-CAUSAL-TIMING` | No choreography implying causation that isn't sourced | — | standard (FT) + heuristic | M; J |
| `DATA-WINDOW` | Time window not cherry-picked | — | standard (FT) | U; J |
| `DATA-MESSAGE` | Message can be stated and is on screen | — | standard (GAF) | U; J |
| `DATA-ANNOTATION-NEAR` | Annotation next to its data | ≤ brief distance | standard (GAF) | U; M✓ |
| `DATA-REST-STATE` | Each beat has a rest state that carries the message | One per marker | standard (ONS, adapted) | M; M✓ |
| `DATA-STILL-REST` | Stills taken at rest frames | t ∈ rest interval | heuristic | S; M✓ |
| `DATA-LOOP-SEAM` | Visible reset at the loop seam | — | heuristic | Loops; M✓ partial |
| `DATA-ISOTYPE-WHOLE` | Whole pictograms only | No fractions | standard (FT) | U; M✓ |
| `DATA-COLOUR-NOT-SOLE` | Colour is not the only key | Superseded: use `A11Y-COLOR-ALONE`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | U; M✓ |

---

## 14. How to measure in VCR

**Inputs:**
- `seek(t)`;
- DOM/SVG bounding boxes and computed styles;
- the proposed `marks(t)`, `scales(t)`, `dataTime(t)` and `dataMeta`;
- rendered PNG frames;
- the decoded delivery video;
- markers.

**Sampling:**
- During transitions, sample every frame, plus 4× supersampling around boundaries.
- At rest, sample the first, middle and last frame of each rest interval.

| Rule(s) | Calculation | Failure modes |
|---|---|---|
| ZERO-BASELINE | 0 ∈ domain; abs(baselinePx − scale(0)) ≤ 1 | SVG transforms; diverging bars; stacked segments |
| LIE-FACTOR, AREA-SQRT | Pairwise ratios on the same scale | Values near 0 (skip below 1% of max); stroke width; ±1 px rounding |
| SCALE / RESCALE / COLOUR-DOMAIN | Intervals of domain change against value change; gridline opacity | Implicit library tweens; float noise |
| OBJECT-CONSTANCY | Node id → key before and after the transition | Canvas needs registry ids; enter and exit marks unmatched |
| NO-OVERSHOOT, COUNTUP | Signed excess beyond the data path | Legitimate data reversals; U+2212 minus sign; NBSP grouping |
| STAGE-DURATION/COUNT | Cluster change intervals at a 1% threshold | Overlapping eases |
| TIME-LINEAR | Slope CV of dataTime(t) | OCR of date labels is fragile without `dataTime` |
| LABEL-MATCH, UNITS, THOUSANDS (dropped; owner `ADAPT-LOCALE-FORMAT`) | format(round(v)) === text | Text split across tspans; canvas needs `textBounds()` |
| REST / STILL / COUNTUP-LAND | Marks move <0.5 px, text unchanged, opacity ≥0.9 | Decorative drift: exclude non-data layers |
| SOURCE-LINE | Source node; bbox ⊂ safe zone; font size | Burned-in plates need OCR |
| Layout rules | Counts, rotations, perspective matrices | Facets mistaken for dual axes |
| Delivery legibility | PNG vs decoded `yuv420p` contrast | Platform re-encode is unknown |

---

## 15. VCR rendering and delivery notes

- **Check scene state, not just pixels.** Seekability makes scene state exact; don't pre-bake charts into video plates.
- **Supersample transitions.** At 24 fps an overshoot peak can fall between frames. The final value must still be exact.
- **Seek, not wall clock.** D3, CSS animations and GSAP must be driven by `seek(t)`, not by `requestAnimationFrame` time.
- **Determinism.** Seed HOPs, jitter and force layouts, and converge force layouts at load time.
- **`yuv420p` subsampling.** Chroma is halved in each direction, so thin coloured strokes fringe. Use strokes of 2 px or more at 1080 width, and check sequential colour steps after decode (heuristic).
- **Platform re-encode** softens 1 px gridlines and small source text.
- **ProRes 4444 alpha.** Premultiplication halos can shift bar ends by about 1 px, so check the lie factor on the composite.
- **Fonts.** Wait for fonts to load before layout.

---

## 16. Master checklists

**Analysis**
1. `DATA-MESSAGE`, `DATA-PROVENANCE`, `DATA-SOURCE-LINE`, `DATA-RATE-NORMALISE`, `DATA-WINDOW`
2. Rest frames:
   - `DATA-ZERO-BASELINE`, `DATA-LIE-FACTOR`, `DATA-AREA-SQRT`
   - `DATA-LABEL-MATCH`, `DATA-UNITS`, `DATA-DIRECT-LABEL`
   - category limits
3. Motion:
   - `DATA-OBJECT-CONSTANCY`, `DATA-UNRELATED-CUT`
   - `DATA-SCALE-STABLE`, `DATA-RESCALE-STAGED`
   - `DATA-NO-OVERSHOOT`, `DATA-TIME-LINEAR`
4. Viewer load: `DATA-TRACKED-MARKS`, `DATA-TREND-SUMMARY`, `DATA-REST-STATE`
5. Numbers, maps and uncertainty rules
6. Medium rules and the delivered encode
7. Write findings with severity, ID, time range, measured value and threshold

**Creation**
1. Claim and FT category
2. Data and meta
3. Encoding within limits
4. Global scales and colour domains
5. Rest states
6. Keyed, simply staged transitions
7. No overshoot; linear data time
8. Count-ups that land and hold
9. Name tracked marks; end on a summary
10. Expose the registry; run checks; review delivery

---

## 17. Caveats

- **The evidence comes from a different medium.** The core studies used desktop monitors, masked trials, interactive controls or live presenters. Muted, vertical, phone-sized linear video is untested, so all transfers are `heuristic`.
- **Study parameters are not standards.** This includes the 1.25 s and 2 s transitions, 3 s views, 2.5 years per second, and the informal "about 200" ceiling.
- **Sources disagree:**
  - on dual axes (ONS against FT);
  - on value labels (GAF calls best practice "complicated");
  - on bar chart races (critics against Flourish).
- **Weak spots:**
  - Tufte's band is unverified against print;
  - no Reuters chart rules were found;
  - the main BBC GEL infographics page couldn't be fetched;
  - count-ups have no research base.
- **Likely to go out of date:**
  - the ONS Service Manual (marked BETA);
  - GAF guidance (19 May 2022);
  - Datawrapper behaviour;
  - D3 and Vega-Lite APIs;
  - Chromium's `Intl` data.

---

## 18. Verification ledger (all entries 2026-11-06)

| Claim | Result | Checked against |
|---|---|---|
| Heer & Robertson quotes; 1.25 s / 2 s transitions; 3 s view; 24 subjects; 8 vs 16 marks; staging and rescale findings | confirmed | Heer & Robertson 2007 PDF (University of Washington IDL copy) |
| Robertson et al. task times; 65% accuracy; small multiples beat animation (p<.001); 4.8 rating; 2.5 years/s; "about 200" | confirmed | Robertson et al. 2008 PDF (Microsoft Research) |
| Staggering "negligible, or even negative" | confirmed (abstract only) | Chevalier et al. 2014 via CORE |
| ONS zero rules; 92–100 → 90 example; ¼–⅓ gap; gridline counts; dual and log axes; animation tips; uncertainty band | confirmed | ONS Service Manual pages |
| GAF gridline maximum; category limits; bar gap; source format; OSR 8% case | confirmed | GAF *Data visualisation: charts* |
| FT bar zero; choropleth rates; lollipop | confirmed | FT Visual Vocabulary PDF |
| Bostock object constancy quotes; banking ratios 1.17 / 7.87 | confirmed | bost.ocks.org; Stanford Vis Group |
| Cleveland & McGill ranking; Heer & Bostock replication; HOPs results | confirmed (snippets only) | JASA scan; CHI 2010 paper; Hullman et al. 2015 |
| Tufte lie-factor wording, 0.95/1.05 band, 14.8 example | unverified | OCR snippet and secondary sources |
| Datawrapper zero lock on bar charts | unverified (secondary) | Datawrapper Academy, via subagent |
| BBC cookbook and GEL quotes | confirmed | BBC R cookbook; GEL technical guide, via subagent |
| BBC GEL "How to design infographics" page; Reuters chart rules | not found | Fetch not permitted; Reuters Graphics GitHub |
| Reuters colour wording | unverified (snippet only) | reuters-graphics.github.io/style/colors |
| 62.0% of dashboards with unnormalised choropleths | confirmed (snippet only) | NSF PAR study |
| Phone/desktop newsroom pattern | confirmed (snippet only) | Brehmer et al. 2019, arXiv 1907.03919 |
| Equal-area projections preferred for choropleths | confirmed (secondary) | Battersby 2014; Axis Maps; GeoLinter |
| `Intl.NumberFormat` behaviour; Vega-Lite scale properties | unverified | Not checked in this session |

---

## 19. Sources

The numbered list below matches the escaped `\[n\]` markers in the text. Sources are also named in the text, their roles are listed in §12, and the pages each claim was checked against are recorded in §18.

1. <https://idl.cs.washington.edu/files/2007-AnimatedTransitions-InfoVis.pdf>
2. <https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tvcg2008-trendvis.pdf>
3. [Advanced formats: Interactive charts and animations – Data visualisation – Service manual – Office for National Statistics](https://service-manual.ons.gov.uk/data-visualisation/guidance/interactive-charts-and-animations)
4. [Object Constancy](https://bost.ocks.org/mike/constancy/)
5. [Search CORE](https://core.ac.uk/search?q=The+Not-so-Staggering+Effect+of+Staggered+Animated+Transitions+on+Visual+Tracking.)
6. [Cookies on ons.gov.uk](https://service-manual.ons.gov.uk/data-visualisation/guidance/axes-and-gridlines)
7. [Marks, Channels, and Dead Ends: Stop Running Graphical Perception Studies and Start Modeling Visualizations as Images](https://arxiv.org/pdf/2608.07834)
8. [Crowdsourcing graphical perception: Using Mechanical Turk to assess visualization design](https://www.researchgate.net/publication/221515971_Crowdsourcing_graphical_perception_Using_Mechanical_Turk_to_assess_visualization_design)
9. [Hypothetical Outcome Plots Outperform Error Bars and Violin Plots for Inferences about Reliability of Variable Ordering](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0142444)
10. [Data visualisation: charts – Government Analysis Function](https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/)
11. [Simple comparisons: Bar chart](https://service-manual.ons.gov.uk/data-visualisation/chart-types/bar-charts)
12. <https://journalismcourses.org/wp-content/uploads/2020/07/Visual-vocabulary.pdf>
13. [Data over time: Column chart](https://service-manual.ons.gov.uk/data-visualisation/chart-types/column-chart)
14. [Accessible charts: a checklist of the basics](https://analysisfunction.civilservice.gov.uk/policy-store/charts-a-checklist/)
15. [Reuters newsroom Datawrapper guide](https://reuters-graphics.github.io/newsroom-datawrapper-guide/)
16. [Why our column and bar charts start at zero (or below)](https://www.datawrapper.de/academy/why-our-column-and-bar-charts-start-at-zero)
17. [BBC Visual and Data Journalism cookbook for R graphics](https://bbc.github.io/rcookbook/)
18. [Visualization Lab](http://vis-ucb-maneesh.stanford.edu/workshop-0512/)
19. [Stanford Vis Group](http://vis.stanford.edu/papers/banking)
20. [Graphical Perception](https://math.pku.edu.cn/teachers/xirb/Courses/biostatistics/Biostatistics2016/GraphicalPerception_Jasa1984.pdf)
21. [style: Colors](https://reuters-graphics.github.io/style/colors/)
22. [GEL Technical Guide: Infographics](https://bbc.github.io/gel/components/infographics/)
23. [D3: Data-Driven Documents Michael Bostock, Vadim Ogievetsky and Jeffrey Heer](https://vis.csail.mit.edu/classes/6.859/readings/pdfs/Bostock-D3.pdf)
24. [Why Some Experts Hate Bar Chart Races](https://builtin.com/data-science/bar-chart-races)
25. [A Comparative Evaluation of Animation and Small Multiples for Trend Visualization on Mobile Phones](https://arxiv.org/pdf/1907.03919)
26. [The Not-so-Staggering Effect of Staggered Animated Transitions](https://visualthinking.psych.northwestern.edu/publications/ChevalierDragicevicFranconeri2014.pdf)
27. [Overall considerations: Showing uncertainty in charts – Data visualisation – Service manual – Office for National Statistics](https://service-manual.ons.gov.uk/data-visualisation/guidance/showing-uncertainty-in-charts)
28. [Hypothetical Outcome Plots Help Untrained Observers Judge](https://users.eecs.northwestern.edu/~jhullman/hops_jobs_pfs.pdf)
29. [(PDF) Implications of Web Mercator and Its Use in Online Mapping](https://www.researchgate.net/publication/265895464_Implications_of_Web_Mercator_and_Its_Use_in_Online_Mapping)
30. [Map Projections](https://www.axismaps.com/guide/map-projections)
31. [Map projections: a practical guide to common mistakes and how to fix them](https://dominicroye.github.io/blog/map-projections/)
32. [par.nsf.gov](https://par.nsf.gov/servlets/purl/10540184)
33. [GitHub - reuters-graphics/style: Reuters graphics fashion. · GitHub](https://github.com/reuters-graphics/style)
34. [Chapter 13 Data visualization basics](https://hhsievertsen.github.io/EconDataBook/data-visualization-basics.html)
35. [Edward Tufte’s Visual Principles: Data-Ink Ratio, Chartjunk Eradication, and Graphical Integrity](https://visualguide.online/edward-tufte-principles-data-ink-ratio-chartjunk-graphical-integrity/)
36. [2 Graphical Integrity](https://sites.class.unt.edu/~eclough/2300/tufte1.pdf)
37. [•First •Prev •Next •Last •Go Back •Full Screen •Close •Quit Statistics 120](https://www.stat.auckland.ac.nz/~ihaka/120/Lectures/lecture03-8up.pdf)
38. [Computing Lie Factor by Dividing Percentages](https://www.edwardtufte.com/notebook/computing-lie-factor-by-dividing-percentages/)
39. [Financial Times Visual Vocabulary (PDF) - Fountn](https://fountn.design/resource/financial-times-visual-vocabulary-pdf/)
40. [Visual Vocabulary](https://www.eariel.net/en/post/visual-vocabulary)
41. [3 Custom Data Visualization Themes](https://book.rfortherestofus.com/themes.html)
