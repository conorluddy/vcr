# Motion Design and Animation Direction: A Knowledge Base for VCR (`references/motion-director/`)

> **Status.** Seed reference for the `MOTION-*` pillar. Research cut-off 2026-11-06.
> **Scope.** Motion craft for code-first motion graphics and short-form video: principles, easing, springs, timing, choreography, rhythm, 2D/2.5D camera, frame rate, motion accessibility (cross-reference only), measurement from per-frame time series, critique vocabulary, and how to avoid template motion. Typography, colour, layout and accessibility in depth belong to other pillars.
> **Confidence tiers.**
> - `standard`: a W3C/WAI or CSSWG normative or "Understanding" document, checked against the primary page.
> - `platform`: a value published by a vendor's design system or documentation (Google Material, IBM Carbon, Microsoft Fluent/Windows, Apple HIG/WWDC, RED). It may change without notice; Material's own easing/duration tokens are already being superseded by springs.
> - `heuristic`: a practitioner rule of thumb, research finding from lab conditions that has not been codified, secondary source, or VCR-derived arithmetic.
> **Evidence labels.** `[audience]` = evidence about what viewers perceive or do (studies, platform data). `[taste]` = expert or design-system judgement. `[derived]` = arithmetic from cited values; check before relying on it.
> **Important framing.** Almost every published duration number comes from *interactive UI*, where motion answers a user's action. VCR makes *watched* video. UI numbers are a floor and a vocabulary, not a target: video motion can and usually should run longer, because nothing is waiting on it, but the same perceptual limits (smoothness, causality, judder, vestibular load) still apply.

## TL;DR

- **Motion should be judged as a time series, never from stills.** VCR's seekable `window.__scene` contract lets every transform and opacity value be sampled per frame, so easing shape, settle frame, overshoot percentage and stagger evenness are all measurable. Taste calls (voice, hierarchy, signature) still need a reviewer watching at delivery fps.
- **Use the published curves as your vocabulary.** Material 3 standard `cubic-bezier(0.2, 0, 0, 1)` and emphasized-decelerate `cubic-bezier(0.05, 0.7, 0.1, 1)`; Carbon productive/expressive pairs; CSS keywords; GSAP `power1–4`/`expo`/`back`/`elastic`. Entrances decelerate, exits accelerate, on-screen moves ease in and out, and linear is only for constant-rate motion such as rotation, tickers and loops.
- **Duration scales with distance, size and importance.** The UI canon clusters at 100–500 ms (NN/g) with tokens from 50 to 1000 ms (Material). At 24–30 fps a 100 ms move is only 2–3 frames, so video entrances usually need the upper end or more, while every frame still has to read.
- **Springs are replacing duration-plus-easing in vendor systems.** Specify them by damping ratio and stiffness, or by Apple's duration and bounce. Overshoot and settle time follow directly from the damping ratio: about 9.5% overshoot at ζ = 0.6 and about 1.5% at ζ = 0.8 `[derived]`. In VCR, springs must be closed-form functions of *t*.
- **Perception sets hard edges.** Causal "hits" break down within tens of milliseconds of delay. Lab data show a measurable drop at 33.3 ms, so follow-on motion should start on the contact frame. Pans at 24 fps judder faster than about one frame-width per seven seconds (RED). Large zooms, spins, parallax and sustained oscillation near 0.2 Hz are the main vestibular triggers.
- **Choreography is hierarchy over time.** One lead mover at a time, short even staggers (or deliberately ramped ones), holds long enough to read, and continuity across cuts. "Moving elements together can create ambiguity" (Fluent).
- **The biggest risk for an AI agent is sameness.** Every element fading and sliding up 20–40 px on the library default ease at the same duration reads as template motion. Signature motion comes from a written motion spec: a voice, two or three curves, a duration scale, one signature move, and rules for where they are broken.

## Key findings

1. **Material 3 publishes exact easing and duration tokens.** Durations run from `short1` 50 ms to `extra-long4` 1000 ms in 50/100 ms steps. Standard easing is `cubic-bezier(0.2, 0.0, 0, 1.0)`, emphasized decelerate `cubic-bezier(0.05, 0.7, 0.1, 1.0)` and emphasized accelerate `cubic-bezier(0.3, 0.0, 0.8, 0.15)`. Material's own example: "A FAB expanding into a Sheet uses a 400ms duration" with emphasized easing [1].\[1\]
2. **Material 3 Expressive moves to springs** defined by stiffness, damping and initial velocity; "A damping value of 1 completely removes spring bounce." [2].\[2\] Third-party copies of the androidx tokens give expressive fast spatial at damping 0.6 / stiffness 800 and standard at 0.9 / 1400 (secondary; not verified at Google's source) [34].\[3\]\[4\]
3. **IBM Carbon** separates *productive* and *expressive* motion and publishes exact curves: standard productive `cubic-bezier(0.2, 0, 0.38, 0.9)`, expressive `cubic-bezier(0.4, 0.14, 0.3, 1)`, plus entrance and exit variants. It also uses a non-linear duration scale (70/110/150/240/400/700 ms) and states: "Strictly linear movement appears unnatural to the human eye." [4][5]\[5\]\[6\]
4. **NN/g's synthesis of UI timing:** most animations fall in 100–500 ms, about 100 ms for simple feedback and 200–300 ms for large screen changes. "At 500ms, animations start to feel like a real drag" for UI [13] `[taste, informed by usability work]`.\[7\]
5. **Fluent 2 gives the clearest choreography guidance:** prefer staggering with short offsets; drop staggering only for very large groups; give important elements more prominent movement and longer durations; use fades for top-level changes; reserve linear easing for constant-rate cases such as rotation [6].\[8\]
6. **Causality is acutely timing-sensitive** `[audience]`. Michotte reported launching reduced at 70 ms delay and absent at 154 ms. Peter White's (Cardiff University) 2025 registered replication of 14 pre-registered experiments (*Royal Society Open Science* 12: 250244) found that "results on the delay manipulation differed from those reported by Michotte". Launching ratings were already significantly lower at 33.3 ms, then plateaued mid-scale up to 200 ms: "the launching effect is acutely sensitive to delay at contact" [15].
7. **Judder is a frame-rate × velocity problem.** RED's rule at 24 fps with a 180° shutter: "pan no faster than a full image width every seven seconds". RED notes this is a starting point, not a hard limit [14].\[9\] The underlying theory is Watson, Ahumada & Farrell's *window of visibility*, which predicts when sampled motion becomes distinguishable from continuous motion [17] `[audience]`.\[10\]\[11\]
8. **Vestibular triggers are specific.** Large scaling or zooming relative to the viewport, spinning or vortex effects (even small, especially when looping), multi-speed or multi-directional motion, and parallax (almost universally reported) [24].\[12\]\[13\] Apple adds peripheral motion and world rotation, and warns against sustained oscillation "around 0.2 Hz because people can be very sensitive to this frequency" [8]. A study in *Aviation, Space and Environmental Medicine* 72(3):188–192 supports this: moderate nausea in 12/12 subjects at 0.2 Hz, against 8/12 at 0.1 Hz and 7/12 at 0.4 Hz.
9. **WCAG covers motion in two places:** 2.2.2 Pause, Stop, Hide (Level A) for auto-starting motion that lasts more than five seconds alongside other content [12],\[14\]\[15\] and 2.3.3 Animation from Interactions (AAA) [11]. WCAG's definition of motion animation excludes colour and opacity changes; an erratum amends the definition so that blurring is no longer excluded [11].\[16\]\[17\]\[18\]
10. **No widely adopted published metric for motion-graphics quality was found.** Motor-control and robotics smoothness measures (mean squared jerk, log dimensionless jerk, spectral arc length) transfer to element trajectories [30][31].\[19\]\[20\] A 2026 audit warns that such metrics can end up ranking duration rather than quality, so normalise for duration [33].\[21\]

---

## 1. Principles: the twelve, applied to vector, UI and kinetic type

Thomas & Johnston's twelve principles (*The Illusion of Life*, 1981) entered computing through Lasseter (SIGGRAPH 1987) and into UI through Chang & Ungar (UIST 1993). Chang & Ungar grouped them into **solidity, exaggeration and reinforcement**, and showed motion blur, arcs, slow in/slow out and follow-through making interface objects feel solid: "Attention to timing and transient detail allows Self objects to move solidly." [22].\[22\]\[23\] Thomas & Calder extended this to direct-manipulation UIs with principles including smoothness and anticipation [23].\[24\]

| Principle | Translates to 2D vector / kinetic type? | How, concretely | Failure mode |
|---|---|---|---|
| Squash & stretch | Partly | Non-uniform scale along the motion vector on fast impacts (e.g. `scaleY 0.9 / scaleX 1.08` for 1–3 frames). On type, use it only on display weights and keep volume roughly constant. | Distorting body text; squash on rigid "brand" objects such as logos (often forbidden by brand guidelines). |
| Anticipation | Yes | A small counter-move before the main move (back.in-style dip, 2–6 frames, 5–15% of travel) `[taste]`. | "Telegraphed": the anticipation is too long or too large, so the viewer is waiting. |
| Staging | Yes, the most important principle for motion graphics | One idea per beat. Isolate the mover with contrast, space and stillness of everything else. | Everything moves at once; no clear read. |
| Straight-ahead vs pose-to-pose | Implementation choice | Code is pose-to-pose by nature (keyframes/tweens). Procedural or simulated motion is straight-ahead. | Procedural noise left running everywhere; no designed poses. |
| Follow-through & overlapping action | Yes | Child parts settle after the parent (letters after word, icon after card); offset 1–4 frames; overshoot then settle. | "Stiff": everything starts and stops on the same frame. |
| Slow in & slow out | Yes; this is easing | §2. | Linear starts and stops on discrete objects (mechanical). |
| Arcs | Yes | Curved paths for free-moving objects (Chang & Ungar's Self objects move on arcs) [22]; Material's "arc motion" for dramatic styles [29].\[25\]\[26\] | Diagonal straight lines that ignore the layout grid; arcs on UI elements that should feel gridded. |
| Secondary action | Yes | Subtle supporting motion during holds (a gradient drift, an icon tick) that never competes with the primary. | Secondary motion louder than primary; constant motion near text (a vestibular and readability problem) [24].\[13\] |
| Timing | Yes | Duration and spacing encode weight and importance (§3). | Uniform durations for everything. |
| Exaggeration | Yes, with care | Push key poses (overshoot, scale punch) for emphasis beats only. | Elastic or bounce on every element (fatigue, toy-like). |
| Solid drawing | Reinterpreted | Consistent perspective and depth cues in 2.5D; consistent light direction on extruded type. | Parallax layers whose implied depth contradicts their scale. |
| Appeal | Yes | Clear silhouettes, readable poses at every hold, a coherent personality. | "Generic": competent but characterless motion (§11). |

**Agent pitfall:** applying all twelve to every element. In UI and motion graphics, the principles are tools for specific beats. Carbon's guidance to "reserve expressive motion for occasional, important moments" is the right default [4].\[6\]

## 2. Easing: families, curves, springs, and voice

### 2.1 Families (Penner lineage) and library names

| Family | Shape | GSAP name | Feel `[taste]` |
|---|---|---|---|
| Linear | constant velocity | `none` / `power0` | Mechanical; correct for rotation, tickers, constant camera drift, loops |
| Sine | gentlest | `sine` | Soft, ambient, breathing |
| Quad (t²) | gentle | `power1` (GSAP default `power1.out`) | Neutral, default-ish |
| Cubic (t³) | moderate | `power2` | General UI |
| Quart (t⁴) | strong | `power3` | Confident, premium |
| Quint (t⁵) | very strong | `power4` | Punchy, editorial |
| Expo (2^x) | extreme | `expo` | Fast-arrive, long settle; "snappy" or "luxury" depending on duration |
| Circ | sharp knee | `circ` | Technical, mechanical-precise |
| Back | overshoot | `back(1.7)` default overshoot param | Playful, confident landing |
| Elastic | oscillating overshoot | `elastic(1, 0.3)` | Cartoon, toy; use rarely |
| Bounce | discrete rebounds | `bounce` | Literal physical drops only |
| Steps | discrete | `steps(n)` | Stop-motion, retro, clock ticks |

GSAP documents these families and states "GSAP uses a default ease of "power1.out"." [19].\[27\]\[28\] The mapping `power1`=quad … `power4`=quint is from secondary guides, not GSAP's page.\[29\]\[30\]

**Agent pitfall:** the default ease is the most common sign of template motion. An agent that never sets `ease` produces uniform `power1.out` motion.

### 2.2 CSS / WAAPI vocabulary

CSS Easing Level 2 defines three function types: `linear`/`linear()`, cubic Bézier (`ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier()`), and steps (`steps()`, `step-start`, `step-end`) [20].\[31\]\[32\] The keywords are exactly [21]:

- `ease` = `cubic-bezier(0.25, 0.1, 0.25, 1)` (the CSS default)
- `ease-in` = `cubic-bezier(0.42, 0, 1, 1)`
- `ease-out` = `cubic-bezier(0, 0, 0.58, 1)`
- `ease-in-out` = `cubic-bezier(0.42, 0, 0.58, 1)`
- `linear` = `linear(0, 1)`\[33\]\[34\]

The x values in `cubic-bezier()` are constrained to [0, 1]; the y values are not, so overshoot is possible (e.g. back-like curves) [20].\[31\]\[35\] `linear()` takes any number of stops and can approximate springs, bounces and elastics that a single Bézier cannot.\[34\]\[36\] WAAPI accepts the same easing strings per keyframe and per effect.

### 2.3 Design-system curves and durations (primary values)

**Material 3 (easing/duration tokens)** [1] `platform`

| Token | CSS |
|---|---|
| `md.sys.motion.easing.standard` | `cubic-bezier(0.2, 0.0, 0, 1.0)` |
| `…standard.decelerate` | `cubic-bezier(0, 0, 0, 1)` |
| `…standard.accelerate` | `cubic-bezier(0.3, 0, 1, 1)` |
| `…emphasized` | "N/A (Use Standard as a fallback)" in CSS; native platforms use a two-segment path |
| `…emphasized.decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` |
| `…emphasized.accelerate` | `cubic-bezier(0.3, 0.0, 0.8, 0.15)` |

Durations: short1–4 = 50/100/150/200 ms; medium1–4 = 250/300/350/400 ms; long1–4 = 450/500/550/600 ms; extra-long1–4 = 700/800/900/1000 ms.\[1\] Material's examples: selection controls 200 ms standard; FAB→sheet 400 ms emphasized; card→full screen 500 ms emphasized; ambient carousel auto-advance 1000 ms emphasized [1].\[1\] Material's emphasized set is described as "the most common" because it captures M3's expressive style; the standard set is for "simple, small, or utility-focused transitions" [1].\[1\]

**Note** `[derived]`: emphasized decelerate starts with slope y1/x1 = 0.7/0.05 = 14× average velocity.\[37\] It arrives almost instantly and then glides. At short durations this reads as a pop; at long durations it reads as luxurious.

**IBM Carbon** [4][5] `platform`

| Curve | Productive | Expressive |
|---|---|---|
| Standard (visible start to end) | `cubic-bezier(0.2, 0, 0.38, 0.9)` | `cubic-bezier(0.4, 0.14, 0.3, 1)` |
| Entrance | `cubic-bezier(0, 0, 0.38, 0.9)` | `cubic-bezier(0, 0, 0.3, 1)` |
| Exit | `cubic-bezier(0.2, 0, 1, 0.9)` | `cubic-bezier(0.4, 0.14, 1, 1)` |

Carbon also gives After Effects equivalents for standard easing (productive "outgoing 20%, incoming 62%"; expressive "outgoing 40%, incoming 70%") [4].\[6\] Duration tokens: `fast-01` 70 ms (button, toggle), `fast-02` 110 ms (fade), `moderate-01` 150 ms (small expansion, short movement), `moderate-02` 240 ms (expansion, toast), `slow-01` 400 ms (large expansion, important notifications), `slow-02` 700 ms (background dimming) [5][35].\[5\] Carbon's checklist asks whether micro-interactions fall within a static 90–120 ms. Its duration is "dynamic based on the size of the animation", computed by a Motion Generator on a non-linear scale [4][5].\[5\]\[6\] Exit easing speeds up as the element leaves, "implying that its departure from the screen is permanent" [4].\[6\]

**Microsoft.**
- Fluent 2 publishes principles (Functional, Natural, Consistent, Appealing) and qualitative timing: give larger elements more time, "aim for a fast and smooth motion", and use linear only for constant-rate cases like rotations [6].\[8\]
- Windows' Fluent application doc publishes timings of 167, 250 and 333 ms, with `cubic-bezier(0,0,0,1)` for direct entrances and `cubic-bezier(0.55,0.55,0,1)` for point-to-point moves of existing elements [7] `platform`.\[38\]
- Fluent 2 web token values (e.g. `durationNormal` 200 ms) circulate in third-party skill files but were **not verified** on Microsoft's page.\[39\]

**Apple.**
- The HIG Motion page gives *no* durations or curves. Its guidance is qualitative: add motion purposefully, "make motion optional", be brief and precise in feedback, let people cancel motion, and, for games, a consistent "30 to 60 fps" [8].\[40\]
- WWDC23 "Animate with springs" specifies springs by **duration** (a perceptual duration, not the time to settle) and **bounce** (−1.0 to 1.0; 0 = critically damped, >0 bouncy, <0 overdamped). Apple says about 15% bounce barely reads as bouncy, about 30% is noticeable, values above about 0.4 call for caution, and: "When you're not sure, use a spring with bounce 0" [10]. Springs are SwiftUI's default animation [10].\[41\]

### 2.4 Spring physics for agents

A damped harmonic oscillator x″ + 2ζω_n x′ + ω_n² x = 0, with ω_n = √(k/m) and damping ratio ζ = c / (2√(km)).

- **Overshoot** (underdamped, ζ < 1, from rest): OS% = 100 · exp(−ζπ / √(1−ζ²)).
- **2% settle time** ≈ 4 / (ζ ω_n) for underdamped springs. For ζ = 1, ≈ 5.8 / ω_n.
- **ζ = 1** gives no overshoot (Material: damping 1 "completely removes spring bounce" [2]).\[2\] ζ > 1 is sluggish.

**Material 3 Expressive spring tokens.** These come from secondary copies of androidx `ExpressiveMotionTokens`/`StandardMotionTokens` (mass = 1), with damping ratio / stiffness [34].\[42\]\[43\] Overshoot and 2% settle are `[derived]`.\[44\]

| Token | Expressive ζ / k | Overshoot | ~2% settle | Standard ζ / k | Overshoot | ~2% settle |
|---|---|---|---|---|---|---|
| fast.spatial | 0.6 / 800 | ≈ 9.5% | ≈ 0.24 s | 0.9 / 1400 | ≈ 0.15% | ≈ 0.12 s |
| default.spatial | 0.8 / 380 | ≈ 1.5% | ≈ 0.26 s | 0.9 / 700 | ≈ 0.15% | ≈ 0.17 s |
| slow.spatial | 0.8 / 200 | ≈ 1.5% | ≈ 0.35 s | 0.9 / 300 | ≈ 0.15% | ≈ 0.26 s |
| fast/default/slow.effects | 1.0 / 3800, 1600, 800 | 0% | ≈ 0.09 / 0.15 / 0.21 s | same | 0% | same |

Material's rule is that spatial tokens drive position, size and shape, and effects tokens drive colour and opacity. Effects never bounce, which is a good default for VCR too: **opacity, colour and blur must never overshoot.**\[2\]

**Apple mapping** `[derived; mapping unverified]`. WWDC23 gives stiffness = (2π / duration)² for mass 1 [10]. Third-party code uses ζ = 1 − bounce for bounce ≥ 0.\[41\]\[43\] The transcript's damping formula appears inconsistent, so treat the mapping as unverified. On that mapping, bounce 0.15 → ζ 0.85 (≈ 0.6% overshoot) and bounce 0.3 → ζ 0.7 (≈ 4.6%). The commonly quoted `.smooth`/`.snappy`/`.bouncy` presets (0.5 s with bounce 0 / 0.15 / 0.3) are **unverified** on Apple pages.\[45\]

**Voice mapping** `[taste]`:

| Voice | Curves | Springs | Durations (video) |
|---|---|---|---|
| Corporate / productive / data | Carbon productive, M3 standard, power2 | ζ ≥ 0.9 | short-to-medium; minimal overshoot |
| Premium / editorial / luxury | expo.out, power4.out, M3 emphasized-decelerate | ζ 0.9–1.0, low k | longer settles; long tails; no bounce |
| Energetic / youth / sport | power3–4.out, back.out(1.2–1.7) | ζ 0.6–0.75 | short; punchy hits on beat |
| Playful / kids / character | back, elastic (sparingly), squash & stretch | ζ 0.4–0.6 | varied; exaggerated poses |
| Calm / wellness / ambient | sine.inOut, linear drifts | ζ 1.0, low k | long; few moves; long holds |
| Technical / precise | circ, steps, linear | — | gridded, quantised timing |

## 3. Timing and duration

### 3.1 Published UI ranges

| Source | Values | Notes |
|---|---|---|
| NN/g [13] | "100–500 ms" most animations; about 100 ms simple feedback; 200–300 ms large screen changes; 100–400 ms in most cases, with 400 ms "very slow" | Shortest time that isn't jarring; frequent animations should be shorter and subtler\[7\] |
| Material 3 [1] | 50–1000 ms tokens | Larger, longer-travel changes get longer tokens\[1\] |
| Carbon [5] | 70/110/150/240/400/700 ms; micro-interactions 90–120 ms | Non-linear scale by size and distance\[5\] |
| Windows [7] | 167/250/333 ms | Entrances and point-to-point moves\[38\] |
| Val Head [26] | "200ms to 500ms" as a starting range; bounce/elastic toward 400–500 ms | Practitioner; draws on NN/g's 0.1 s / 1 s response-time limits\[46\] |
| Uber Base [27] | reduced-motion crossfade 100 ms\[47\] | Brand system |

### 3.2 Translating to video frames `[derived]`

| ms | 24 fps | 25 fps | 30 fps | 60 fps |
|---|---|---|---|---|
| 50 | 1.2 f | 1.25 f | 1.5 f | 3 f |
| 100 | 2.4 f | 2.5 f | 3 f | 6 f |
| 200 | 4.8 f | 5 f | 6 f | 12 f |
| 300 | 7.2 f | 7.5 f | 9 f | 18 f |
| 500 | 12 f | 12.5 f | 15 f | 30 f |
| 1000 | 24 f | 25 f | 30 f | 60 f |

**Implications:**
- At 24–30 fps, anything under about 100 ms is one to three frames. It reads as a cut, a pop or a hit, not as motion. That is legitimate for impact frames but not for an entrance you want viewers to follow.
- Easing shape needs frames to show. A power4.out over 6 frames is nearly indistinguishable from a linear move with a hard stop.
- Starting points `[taste]` for watched motion graphics at 30 fps:
  - small UI-like element entrances: 8–15 f (≈ 270–500 ms);
  - headline or type entrances: 12–24 f;
  - large panel or scene moves: 18–36 f;
  - camera drifts: seconds;
  - impact accents: 2–6 f.
- These are heuristics, not published values.

### 3.3 Duration rules

- **Distance and size:** larger elements and longer travel take more time (Fluent [6], Carbon [4], Material [1]). Carbon's scale is deliberately *non-linear*, so doubling the distance does not double the time.\[6\]\[8\]
- **Importance:** important elements get more prominent movement and longer durations; minor elements are grouped with synchronised timing (Fluent) [6].\[8\]
- **Frequency:** the more often a move repeats (a series bumper, a per-item list animation), the shorter and subtler it should be (NN/g) [13].\[7\]
- **Entrance vs exit:** entrances decelerate and exits accelerate (Carbon, Material) [4][1]. Exits are shorter than entrances: NN/g's "Executing UX Animations" says entering objects "usually need a subtly longer duration" than exiting ones, e.g. a popup taking 300 ms to appear "but only 200 or 250ms to disappear", a gap of 50–100 ms [13].
- **Emphasis:** a pulse or punch on a held element should be short (≈ 150–400 ms) and singular; repeated pulses become noise `[taste]`.
- **Reading time dominates video:** an entrance's job is to deliver text or objects to a *hold*. Hold length comes from reading (see the `TYPO-*` pillar), not from motion tokens.

### 3.4 Perception evidence `[audience]`

- **Smoothness of sampled motion.** Watson, Ahumada & Farrell model the visual system's spatiotemporal sensitivity as a "window of visibility". Sampled motion is indistinguishable from continuous motion when the spectral replicas created by sampling fall outside that window. The model "predicts the critical sample rate required" [17].\[10\]\[48\] The practical consequences: faster motion and finer, higher-contrast detail need higher frame rates, and blur (spatial low-pass) moves replicas out of the window [17][37]. Meng, Galor, Waller & Banks (UC Berkeley) extend this to modern displays with BiPMAP (arXiv:2212.03854; *Optics Express*, 2024), which uses "a novel model of the human contrast sensitivity function" to predict flicker, judder, colour breakup and depth distortion [18].
- **Causality.** In Michotte's launching displays, the impression of one object causing another's motion weakens with delay at contact: reduced at 70 ms and absent at 154 ms in Michotte's report. A 2025 registered replication found significantly lower launching ratings at 33.3 ms than at 0–16.7 ms, but a plateau thereafter [15].\[49\] Some reviews report Michotte finding the effect *strengthened* by 30–40 ms delays [16]; the sources conflict (see Caveats).\[50\] A synchronous sound can also support causal impressions across a visual delay [36].\[51\]
  - **For VCR:** the follow-on object should move on the contact frame (≤ 1 frame at 30 fps = 33 ms), and SFX should hit on that frame.
- **How fast is too fast to follow.** No study gave a clean "maximum followable velocity" for motion graphics. The usable proxies are:
  1. RED's pan rule (full width in at least 7 s at 24 fps) for detailed full-frame motion [14];\[9\]
  2. NN/g's ~100 ms as "the lower end of perceivable motion" for UI feedback [13];\[7\]
  3. per-frame displacement limits derived from these (§7, §12). Treat thresholds as heuristics.

## 4. Choreography

### 4.1 Staggering

- Fluent: staggering softens the entry of large sets and steers gaze; use "short offsets"; consider varying offsets, "starting with larger gaps and gradually shortening them"; a staggered animation is preferred in most scenarios, and non-staggered only for very large groups where staggering takes too long [6].\[8\]
- Carbon publishes a separate Choreography page (not fetched; unverified).
- Practitioner starting points `[heuristic, no traceable origin]`: offsets of 2–4 frames at 30 fps (≈ 60–130 ms) for list items or letters; total stagger span ≤ about 1–2× a single item's duration; letter-level staggers of 1–2 frames. A widely repeated per-item figure comes from uxdesign.cc's "The ultimate guide to proper use of animation in UX": "Each occurrence of the new element should last from 20 to 25 ms." The article gives no primary source, so treat it as folklore.
- **Evenness:** an even stagger reads as designed. Accidental unevenness (from mixing `delay` values with per-item duration differences) reads as sloppy. Intentional ramps (accelerating or decelerating offsets) read as designed *if monotonic*.
- **Direction:** stagger in reading order (left→right, top→bottom for LTR scripts) unless the motion has its own logic (from the touch point, from the centre, along a data series). Reverse order on exits, or exit everything together faster.

### 4.2 Motion hierarchy and leading the eye

- What moves first is read first. Lead with the subject; supporting elements follow 2–6 frames later `[taste]`.
- Fluent: "Moving elements together can create ambiguity" [6].\[8\] Material: motion "focuses attention on what's important" without unnecessary distraction [28].\[52\]
- **One primary motion at a time.** Others are either synchronised with it as a group or subordinate (smaller amplitude, shorter, lower contrast).
- Stillness is a hierarchy tool: freeze the surround when the hero moves.

### 4.3 Continuity across transitions

- **Shared-element / container transform:** an element that persists across a scene change should interpolate position, size, corner radius and colour rather than cut. This is the motion equivalent of a match cut (Material and Fluent both name container transforms [1][6]).\[53\]
- **Match cut:** align shape, position, direction of motion or colour across the cut. Motion continuity (exit velocity direction = entrance velocity direction) hides cuts.
- **Morphs:** path morphs need compatible point counts and winding. Mismatched morphs produce twisting and self-intersection (a common SVG failure).
- **Top-level changes:** when the whole frame changes, Fluent recommends a quick fade rather than sliding large surfaces, to avoid disorientation [6]. Apple suggests fading out and in when relocating objects whose path carries no meaning [8].\[8\]\[40\]
- **Failure modes:** position jumps on a "persistent" element; direction reversals at cuts; morph tangles; everything cross-dissolving (mushy).

## 5. Rhythm

- **Beat grids** `[derived]`: beat interval = 60/BPM s. At 120 BPM that is 0.5 s = 12 f @24, 15 f @30. At 128 BPM it is 0.469 s = 11.25 f @24 and 14.06 f @30. Non-integer frame beats accumulate drift, so snap each hit to `round(beat_time × fps)` from the absolute beat time, never by adding rounded intervals.
- **What to sync:** land *arrivals* (settles, impacts, cuts) on beats, not starts. Anticipation begins before the beat. Strong beats (downbeats) carry scene changes; off-beats carry secondary motion `[taste]`.
- **A/V sync tolerance:** ITU-R BT.1359 (1998) reports subjective detectability thresholds of "about +45 ms to -125 ms" and acceptability thresholds of "about +90 ms to -185 ms" on average, where positive means sound leads vision. VCR still uses ≤ 1 frame as its own, stricter heuristic. Michotte-style evidence suggests visual causality degrades within tens of ms [15], and sound can bridge small visual gaps [36].
- **Holds and rests:** a piece with no holds is "busy" and nothing reads. Every key message needs a hold where its region is still (cross-reference reading time in `TYPO-*`). Contrast busy passages with calm ones. Motion energy over time should have shape (build, release), not a flat line `[taste]`.
- **Loops:**
  - *Seamless:* last frame + 1 = first frame, with matching position *and velocity*.
  - *Ping-pong:* the reversal produces a velocity zero; fine with ease-in-out, ugly with ease-out (a hard bounce).
  - *Length:* social platforms auto-replay short video. Platform-specific loop or replay behaviour and length limits were **not researched here** and change often; check current platform documentation.
  - *Accessibility:* WCAG 2.2.2 treats web content that loops beyond five seconds alongside other content as needing pause/stop/hide [12].\[14\]\[17\]

## 6. Camera language in 2D and 2.5D

- **Moves:** push or pull (scale of the world), pan or truck (translation), rack (focus/blur shift), roll (rotation; use sparingly), parallax (layers translating at speeds proportional to inverse depth).
- **Depth cues:** relative speed (parallax), scale change, occlusion, atmospheric fade or blur, shadow offset. Keep the cues consistent: a layer that moves faster must also be larger and nearer `[taste]`.
- **Pan speed** `[heuristic, vendor]`: RED's rule says a full image width in no less than 7 s at 24 fps with 180° shutter; it is "not an all-or-nothing limit" [14].\[9\] Derived per-frame displacement:
  - 1920-px-wide 16:9 at 24 fps ≈ 11.4 px/frame; at 30 fps ≈ 9.1 px/frame.
  - 1080-px-wide 9:16 at 24 fps ≈ 6.4 px/frame; at 30 fps ≈ 5.1 px/frame.
  - Faster pans are fine when the eye has a tracked subject, the background is low-detail or blurred, or the frame rate is higher [14].\[9\]\[54\]
- **Motion sickness limits** `[audience + taste]`:
  - Avoid large-amplitude, sustained, full-frame motion with no stable reference.
  - Apple: give people a stationary frame of reference; avoid rotating the world; avoid sustained oscillation around 0.2 Hz (keep amplitude low) [8].\[40\]
  - Val Head's triggers: large zoom relative to the viewport, spinning or vortex (even small, especially looping), multi-speed and multi-directional motion, parallax [24][25].\[12\]\[13\]
  - In video, which viewers cannot turn off, these become *dosing* questions: duration, amplitude, and whether a static anchor (a UI frame, a logo bug, a type block) stays put.
- **Legitimate breaks:** a deliberate vertigo zoom, a whip pan, or a spin transition can be expressive. It succeeds when short (≤ about 0.5 s), motivated (a story beat or a transition), framed by stillness before and after, and not looped `[taste]`.

## 7. Frame rate, blur and temporal aliasing

| fps | Frame time | Typical use | Motion character |
|---|---|---|---|
| 24 | 41.67 ms | cinematic, title sequences | Classic cadence; judders on fast pans; needs blur for smoothness |
| 25 | 40 ms | PAL regions | Similar to 24 |
| 30 | 33.33 ms | social, web, explainers | A safe default for motion graphics |
| 60 | 16.67 ms | UI demos, gaming, sports, smooth kinetic type | Very smooth; can look "video-ish" or hyper-real; doubles render cost |

- **Shutter angle** `[derived]`: exposure = (angle/360) × frame time. 180° at 24 fps = 1/48 s; 180° at 30 fps = 1/60 s. RED's seven-second rule assumes 24 fps at 180° [14].\[9\]\[55\]
- **Deterministic capture has no motion blur.** Each screenshot is a 0° shutter (an instantaneous sample). Fast motion therefore strobes more than filmed motion at the same fps. Options:
  1. slow the motion;
  2. raise fps;
  3. render sub-frame samples and average them (true temporal supersampling: seek *n* times within the shutter interval);
  4. directional blur proportional to velocity (cheaper, approximate);
  5. smear frames or speed lines as a stylistic choice.
- **Temporal aliasing:**
  - Periodic patterns (spokes, stripes, dotted lines, rotating radial grids) alias when the per-frame step approaches the pattern's period. Above half a period per frame, the motion can appear reversed (the wagon-wheel effect, i.e. sampling-theorem logic) `[derived]`.
  - Thin (1–2 px), high-contrast lines and small text moving at a few px/frame shimmer from sub-pixel rasterisation, and get worse under `yuv420p` chroma subsampling and platform re-encoding (§18).
- **Judder on playback:** 24 fps on a 60 Hz display uses uneven 3:2 cadence, which adds judder to slow pans. 30 and 60 fps divide evenly into 60 Hz.\[55\]\[56\] Choose 30 or 60 fps for pan-heavy social content unless the 24 fps look is the point `[heuristic]`.
- **What fixed-fps capture loses versus real-time playback:** no dropped frames (good); no motion blur (bad); no sub-frame timing (events snap to frames); interaction-driven or wall-clock code paths never fire as written; and performance problems that would stutter in real time are invisible. The render is *better* than real time in consistency but *worse* in smoothness at a given fps.

## 8. Accessibility of motion (cross-reference only)

The accessibility pillar owns the details; the motion pillar enforces these hooks.

- **WCAG 2.2.2 Pause, Stop, Hide (Level A)** `standard`: applies to moving, blinking or scrolling information that "starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel" with other content, unless the motion is essential [12].\[14\] W3C chose five seconds as long enough to catch attention but short enough to wait out [12].\[15\]\[17\]\[18\] It applies to VCR outputs embedded on web pages (autoplay loops, hero backgrounds), not to a video the user plays in a player with controls.
- **WCAG 2.3.3 Animation from Interactions (AAA)** `standard`: "Motion animation triggered by interaction can be disabled" unless essential [11]. Parallax is named as often non-essential; vestibular reactions include dizziness, nausea and headaches [11]. Motion animation excludes colour and opacity changes (an erratum amends the definition to no longer exclude blurring) [11]. Sufficient technique: `prefers-reduced-motion` (C39) [11].\[16\]
- **Reduced-motion variants** `platform`: Apple's Reduce Motion guidance is to reduce automatic and repetitive animation including zooming, scaling and peripheral motion, and to replace "transitions in x-, y-, and z-axes with fades" [9].\[57\] Uber Base: "A 100 ms crossfade replaces a drill transition" [27].\[47\] Apple: don't make motion the only carrier of information [8].\[40\]
- **Flashing** (WCAG 2.3.1 / 2.3.2) is owned by the accessibility pillar; thresholds were not verified here.

## 9. Measurement: quantifying motion from time series

VCR can sample any property at any *t*. For each element *e* and property *p* (x, y, scaleX, scaleY, rotation, opacity, plus derived on-screen bbox centre), sample at delivery fps, and at 4× fps for analysis where precision matters.

### 9.1 Derivatives

- Velocity v_i = (p_{i+1} − p_{i−1}) / (2Δt); acceleration and jerk by repeated central differences.
- DOM and computed-style values are exact (no measurement noise), but frame-rate sampling is coarse, so compute derivatives on a 4× oversampled series. On rendered-pixel tracking (canvas, WebGL, video), smooth first (e.g. Savitzky–Golay) because differencing amplifies noise.

### 9.2 Segmenting tweens

- **Motion onset:** first frame where |v| > ε_v after rest.
- **Settle frame:** first frame after which |p − p_final| ≤ ε_p **and** |v| ≤ ε_v for all remaining frames of the segment.
- Suggested ε `[heuristic]`: position 0.5 px (sub-pixel), scale 0.002, rotation 0.1°, opacity 0.005 (about 1 code value of 255).

### 9.3 Metrics

| Metric | Formula | Use |
|---|---|---|
| Duration | settle − onset | Compare with duration scale |
| Normalised progress | u = (t − t0)/(t1 − t0); q = (p − p0)/(p1 − p0) | Shape analysis, independent of distance and time |
| Peak-velocity position | u at max \|v\| | < 0.35 ⇒ ease-out family; 0.35–0.65 ⇒ in-out; > 0.65 ⇒ ease-in; flat ⇒ linear `[heuristic bands]` |
| Endpoint velocity ratio | \|v(u=0)\|/v̄ and \|v(u=1)\|/v̄ | Non-zero end ratio on a discrete entrance ⇒ hard stop (mechanical) |
| Curve match | RMSE of q(u) against candidate curves (CSS keywords, M3, Carbon, GSAP family, spring fits) | Identify the ease; check the spec is followed |
| Overshoot % | 100 × max beyond target / \|p1 − p0\| | Spring and back budget |
| Oscillation count | zero crossings of (p − p1) before settle | Elastic or wobble detection |
| Fitted damping ratio | log decrement δ = ln(A_n/A_{n+1}); ζ = δ/√(4π² + δ²) | Compare against spec springs |
| Velocity continuity | \|v⁻ − v⁺\| at keyframe joins | Unintended kinks |
| Smoothness | Mean squared jerk; log dimensionless jerk (LDJ); spectral arc length (SAL) | Compare like-for-like moves; LDJ is designed to be invariant to scale and duration [31]; SAL reported ~10× more robust to noise than LDJ [30] |
| Stagger evenness | onsets t_i sorted; Δ_i = t_{i+1} − t_i; CV = σ(Δ)/μ(Δ); monotonicity of Δ | CV ≤ 0.1 ⇒ even; monotonic Δ ⇒ intentional ramp |
| Simultaneous movers | count of elements with \|v\| > ε_v per frame, weighted by on-screen area | Hierarchy and busyness |
| Motion energy | Σ area × speed per frame, or mean absolute frame difference on PNGs | Rhythm shape; holds |
| Hold detection | runs of frames with energy ≈ 0 in a region | Reading time check |
| Per-frame displacement | \|Δpos\| per frame for high-contrast thin features and full-frame layers | Judder and strobing risk |

- The minimum-jerk model of human reaching (Flash & Hogan) predicts smooth, bell-shaped velocity profiles; it is widely used as a quality reference [30].
- **Caveat:** a 2026 audit found published smoothness metrics tracked episode duration more than quality, so always normalise by duration or compare moves of equal duration [33].
- **Published tools:** no widely adopted tool for scoring motion-graphics animation quality was found. Perceptual quality work exists for 3D character animation (e.g. jerk-based smoothness features correlating only weakly with ratings: SROCC 0.267) [32] and for display motion artifacts (BiPMAP) [18]. VCR's checks would be novel; validate them against human review.

## 10. Critique vocabulary → curves and timing

`[taste]`: practitioner usage, synthesised. No study maps these words to parameters, so use the mapping as a diagnostic hypothesis and confirm it with measurement.

| Term | What the viewer feels | Likely cause (measurable) | Typical fix |
|---|---|---|---|
| Floaty | Weightless, drifting, no arrival | Long duration for the distance; low-stiffness spring; peak velocity too late; long low-amplitude tails; ease-in-out on entrances | Shorten; ease-out with a stronger power; raise k; land on a beat |
| Snappy | Crisp, confident | Short duration; strong ease-out (power3–4/expo); fast settle; near-zero overshoot | (Usually praise.) Check it doesn't become "abrupt" |
| Abrupt / jarring | Pops, startles | < 100 ms moves; non-zero end velocity; cut-like entrances | Lengthen to ≥ 6–8 f; decelerate |
| Mushy | Soft, unclear, smeared | Weak curves (ease or sine everywhere); overlapping moves with no lead; long crossfades; no holds | Clear lead mover; stronger ease; hard holds |
| Stiff / mechanical | Robotic | Linear easing; identical durations; simultaneous starts and stops; no follow-through | Ease; offsets; overlap; follow-through on children |
| Telegraphed | Predictable, you see it coming | Anticipation too long or large; slow even staggers revealing the pattern; repeated identical moves | Shorten anticipation to 2–4 f; vary or ramp the stagger |
| Sluggish / laggy | Waiting on it | Total duration or stagger span too long; ζ > 1 | Shorten the span; reduce the offset count |
| Busy / noisy | Can't tell where to look | Many simultaneous movers; secondary motion during reads; constant ambient motion | One primary; freeze the surround; add rests |
| Jittery / shimmer | Vibrating detail | Sub-pixel motion on thin lines; aliasing; noise-driven motion | Snap or round, slow down, blur, thicken strokes |
| Judder / strobing | Steppy pans | Displacement per frame too high for the fps; 24 fps on 60 Hz | Slow the pan, raise fps, add blur |
| Bouncy / rubbery | Toy-like | Overshoot > ~10%; multiple oscillations; elastic on serious content | ζ ≥ 0.8; back with a small param |
| Generic / template | Seen it before | Default ease and duration; fade-up everywhere; uniform stagger | Write a motion spec (§11) |
| Dead | Lifeless holds | Absolutely nothing moves for long holds in an otherwise kinetic piece | Subtle secondary action (≤ a few px, slow) |
| Swimmy | Queasy | Multi-speed parallax; continuous full-frame drift; oscillation | Fewer layers; slower; anchor element |

## 11. Avoiding sameness: signature motion and brand guidelines

**Inputs to signature motion.** [Domain Exploration §4–5](../domain-exploration/README.md) supplies subject behaviours; [Visual Research §3–4](../visual-research/README.md) supplies inspected sequences and principles (`VREF-TEMPORAL-SPAN`, `VREF-TRANSFER-EXPLAINED`). [Cultural Context §2–5](../cultural-context/README.md) supplies audience-scoped readings of genre and gesture. Motion owns choreography and curves; Pacing owns cuts and holds, Sound owns beat evidence, and Accessibility owns vestibular constraints.

**Published motion principles** (examples):
- **Material:** "Informative, Focused, Expressive". Motion can express a brand's style: the Basil study uses customised transitions with parallax and emphasized easing [28]. Material's customisation axes are duration, easing and motion path: "For a simple and functional style, you can use short durations", standard easing and linear paths; for dramatic styles, longer durations, emphasized easing and arc motion [29].
- **IBM Carbon:** productive versus expressive, "the duality of man and machine"; expressive reserved for important moments [4].
- **Fluent 2:** Functional, Natural, Consistent, Appealing; consistency "strengthens" recognisability [6].
- **Uber Base:** motion with purpose; expressive moments adhering to the brand personality "Bold, Direct, with Heart"; static alternatives for reduced motion [27].
- **Apple HIG:** purposeful, optional, brief, cancellable [8].

**What distinguishes signature from template motion** `[taste]`:
1. **A named voice** that maps to parameters (§2.4 table), not adjectives alone.
2. **A small curve vocabulary:** two or three curves, each with a job (e.g. "arrive", "move on screen", "leave"), plus one spring. Carbon's 3 × 2 matrix is a model [4].
3. **A duration scale** (non-linear, by size and importance), as in Carbon [5] and Material [1].
4. **One signature move** used at a few key moments (a particular wipe geometry, a mask reveal direction, a characteristic overshoot), never everywhere.
5. **A choreography rule:** what leads, the stagger law, the direction law.
6. **Rules for breaking rules:** where the piece is allowed to be loud.
7. **Motion tied to the brand's shapes:** reveal paths that echo the logo geometry, easing that echoes the type's personality.

**Template signs an agent should detect in its own output:**
- More than 70% of tweens share one (ease, duration) pair `[heuristic threshold]`.
- The library default ease (GSAP `power1.out` [19], CSS `ease` [21]) appears on most tweens.
- Every entrance is fade + translateY(20–40 px) from below.
- The same stagger in every scene.
- Every scene ends with everything fading out together.
- No holds, or holds of identical length.
- In a series built on a shared look, every episode uses the identical sequence of moves. Vary the *content* of the moves, not the vocabulary.

## 12. Medium-specific guidance

| Medium | Guidance |
|---|---|
| **9:16 social (1080 × 1920)** | Narrow width: horizontal travel crosses the frame fast, and RED-derived pan limits are ≈ 5–6 px/frame `[derived]`. Favour vertical and depth (scale) moves, but large full-frame zooms are vestibular-heavy. Keep UI overlay zones still: motion under platform UI is lost (safe zones in `TYPO-*`/`vcr lint`). Many viewers watch muted, so motion must carry meaning without sound, with beat-sync as a bonus. Hook in the first second: the first motion should land a readable idea, not a long build. |
| **16:9 (1920 × 1080 and up)** | More lateral space allows longer lateral travel and pans (≈ 9–11 px/frame limit for detailed backgrounds at 24–30 fps `[derived]`). Lower-third and title-safe conventions apply. Larger viewing screens make full-frame motion more immersive and more nauseating. |
| **Square (1080 × 1080)** | Balanced. Centre-out choreography works well. Loops are common; check seam continuity. |
| **Stills** | No motion rules apply directly, but implied motion (directional composition, motion blur, smear frames) should read as one coherent vector. When a still is a frame grab from a motion piece, pick a *settled* frame (after the settle frame, never mid-overshoot) unless the blur is intended. |
| **Loops (any aspect)** | Seamless: state and velocity are continuous across the seam. No hard reversal with ease-out. Avoid infinite small spins near text [24]. Web-embedded loops over five seconds alongside content need pause/stop/hide (WCAG 2.2.2) [12]. Loop length: platform-dependent, not verified here. |
| **Series / episodic** | Codify the motion spec once (curves, durations, signature move) in the project brief. Measure each episode against it. Vary choreography per content while keeping the vocabulary. |

## 13. The analysis and critique process (reviewer subagent)

Ordered steps; each finding cites a rule ID, a time range, the measurement, and a vocabulary term.

1. **Context:** read the brief. Note voice, placement (muted or sound-led), aspect ratio, fps and any motion spec. If there is no spec, infer a voice and say so.
2. **Watch first, at delivery fps, at least twice** (once for overall feel, once for detail), with and without sound. Never critique motion from stills alone. Stills are used only for compositions at holds.
3. **Measure:** pull the per-element time series and run the measurable rules (§16, §17): durations, easing class, endpoint velocities, overshoot, settle frames, stagger CV, simultaneous movers, holds, pan displacement, loop seam, beat alignment.
4. **Structure:** sketch the motion energy curve. Is there build and release? Are there holds where text must read?
5. **Hierarchy per beat:** what moves first? Does it match the message priority? Is there a single lead mover?
6. **Craft per move:** easing appropriate to entrance, exit or on-screen move? Follow-through and overlap? Arcs where natural? Squash or exaggeration used where earned?
7. **Continuity:** do transitions preserve shared elements, direction and position? Any jumps?
8. **Technical:** judder on pans, strobing on thin lines, aliasing on periodic patterns, sub-pixel shimmer, encoding damage in the *delivered* file.
9. **Accessibility hooks:** vestibular triggers (zoom, spin, parallax, oscillation ~0.2 Hz); reduced-motion variant if web-interactive; 2.2.2 if a web loop.
10. **Sameness:** template-sign check (§11).
11. **Write findings by severity:**
    - **Blocker:** breaks comprehension or safety. Text never holds long enough to read; a vestibular-heavy move with no reason; a causal hit visibly late; a broken loop seam on a loop deliverable; a non-deterministic render.
    - **Major:** clearly reads as amateur or off-voice. Linear entrances; floaty or mushy timing across the piece; judder on hero pans; competing lead movers; default-ease template look.
    - **Minor:** polish. Uneven stagger; slight overshoot beyond budget; a 1-frame beat miss; opacity overshoot.
    - **Note:** taste suggestions and legitimate alternatives.
12. **Format:** `[SEVERITY] MOTION-XXX-NNN @ 00:03.12–00:03.60 — "floaty": headline settle 0.92 s for 180 px travel; peak velocity at u=0.55 (in-out on an entrance). Suggest power3.out, 0.5 s.`
13. **Calibrate.** Praise what works with the same specificity. Don't over-apply rules where the brief licenses expressive breaks (§20 caveats).

**Agent pitfalls for the reviewer:**
- Flagging every overshoot in a playful piece.
- Demanding UI durations (≤ 500 ms) on cinematic title moves.
- Judging easing from three screenshots.
- Ignoring audio when the piece is sound-led.
- Treating heuristics as violations rather than prompts.

## 14. The creation process (workflow skill outline)

**Check asset support before camera moves.** Use [Image Direction §5](../image-direction/README.md), `IMAGE-MOTION-COVERAGE` and `IMAGE-MOTION-RANGE-TESTED` to establish what the selected imagery can reveal. An attractive still does not supply unseen geometry or background. FX owns separation and compositing techniques; Motion owns the resulting move. Keep proposed signatures distinct from selected brief values.

1. **Brief → voice.** Extract audience, placement, aspect, fps, duration, audio situation and brand constraints. Choose a voice from §2.4, or define one.
2. **Write a motion spec** (≤ 15 lines) before coding:
   - fps;
   - curves (2–3 named, plus one spring with ζ and k);
   - a duration scale (e.g. S/M/L/XL in frames);
   - stagger law;
   - direction law;
   - signature move;
   - where breaks are allowed;
   - reduced-motion behaviour if interactive.
3. **Beat sheet.** List message beats with target times, and pull markers from music if present. Mark holds with reading-time lengths. Shape the energy curve.
4. **Block (pose-to-pose).** Key poses at holds first, judged as stills for composition. Then add simple timing with linear placeholders to check pacing.
5. **Ease and choreograph.** Apply spec curves; add lead/follow offsets, overlap and follow-through. Make sure each beat has one lead mover.
6. **Camera.** Add drifts and pushes within pan and zoom limits. Anchor something static during big moves.
7. **Polish.** Secondary action during long holds; impact frames on beats; synchronised SFX on contact frames.
8. **Determinism.** Everything is a pure function of *t*: springs closed-form, noise seeded, no `Date.now()`/`requestAnimationFrame` timing, `markers` exposed.
9. **Verify:**
   - run `MOTION-*` measurable checks on the time series and rendered frames;
   - watch at delivery fps;
   - encode the delivery file and re-check thin-line shimmer and banding on the *encoded* output;
   - review the template-sign report.
10. **Iterate on findings, then hand to the human reviewer** with the spec and the check report.

## 15. Authoritative sources and canon

- **Thomas & Johnston, *The Illusion of Life: Disney Animation* (1981):** origin of the twelve principles (not fetched; canonical).
- **Richard Williams, *The Animator's Survival Kit* (2001):** timing and spacing charts, the practical vocabulary of spacing (not fetched).
- **Lasseter, "Principles of Traditional Animation Applied to 3D Computer Animation" (SIGGRAPH 1987):** the bridge to computer animation (not fetched).
- **Chang & Ungar, "Animation: From Cartoons to the User Interface" (UIST 1993):** solidity, exaggeration, reinforcement in UI [22]. **Thomas & Calder:** cartoon techniques in direct manipulation [23].
- **Michotte, *The Perception of Causality* (1946/1963)** and White's 2025 registered replication [15]: causality timing.
- **Watson, Ahumada & Farrell (1986), window of visibility** [17]: theory of sampled-motion smoothness; BiPMAP for modern displays [18].
- **Flash & Hogan (1985), minimum-jerk model:** smoothness reference (cited via [30]).
- **Design systems:** Material 3 [1][2], Carbon [4][5], Fluent 2 [6], Windows motion [7], Apple HIG [8][9] and WWDC23 springs [10], Uber Base [27]. Their published values are the best available vocabulary.
- **Standards:** WCAG 2.2 SC 2.2.2 and 2.3.3 [11][12]; CSS Easing Functions Level 2 [20]; MDN [21].
- **Practitioners:** Val Head (*Designing Interface Animation*, vestibular guidance) [24][25][26]; NN/g (Laubheimer) [13]; RED (panning) [14]; GSAP docs [19]. Robert Penner's easing equations are the lineage of the families (not fetched).

## 16. Encoding for an AI agent: rules table

**Scope before measurement.** UI-derived duration and easing targets are candidate defaults for UI-like elements, not universal limits for watched video. Select the applicable brief and motion intent first; thresholds adapted from UI guidance remain heuristic. See §20 and the [rule-owner table](../README.md) before using legacy rows.

"Meas." = how it is measured: **TS** = time series of element properties; **PX** = rendered PNG frames; **VID** = decoded delivery video; **AUD** = audio and markers; **J** = judgement only.

| ID | Check | Threshold | Tier | Applies to | Meas. |
|---|---|---|---|---|---|
| MOTION-PROC-001 | Motion is reviewed in motion (at delivery fps) plus time series, not from stills | Required for every review | heuristic | all motion | J (process) |
| MOTION-TIME-001 | Movement tweens shorter than perceivable motion read as cuts | Flag translate/scale/rotate tweens < 100 ms (NN/g's "lower end of perceivable motion") unless tagged `impact` | heuristic | video, all fps | TS |
| MOTION-TIME-002 | UI-mock micro-interactions within the UI canon | 100–500 ms (NN/g); Carbon micro 90–120 ms | heuristic / platform | UI demos inside video | TS |
| MOTION-TIME-003 | Duration grows with travel and size (non-linear) | Flag if, within one scene and the same curve, a longer travel has a shorter duration (rank inversion) | heuristic (UI guidance adapted to video) | all | TS |
| MOTION-TIME-004 | Exits not longer than paired entrances | exit ≤ entrance for the same element | heuristic | all | TS |
| MOTION-TIME-005 | Text holds long enough to read | Hold (energy ≈ 0 in text bbox) ≥ reading time from `TYPO-*` | heuristic | any text | TS + PX |
| MOTION-TIME-006 | UI-scale single tween ≤ 1000 ms | Flag UI-like element tweens > 1000 ms (M3's longest token) unless tagged cinematic | platform | UI-like elements | TS |
| MOTION-EASE-001 | No linear easing on discrete entrances or exits | Endpoint velocity ratio at the arrival end must be < 0.1 × mean for entrances; linear allowed for rotation, tickers, drifts, loops | heuristic (UI guidance adapted to video) | discrete objects | TS |
| MOTION-EASE-002 | Entrances decelerate, exits accelerate | Entrance peak-velocity u < 0.5; exit peak-velocity u > 0.5 | heuristic (UI guidance adapted to video) | enter/exit tweens | TS |
| MOTION-EASE-003 | On-screen moves (visible start to end) ease in and out | Both endpoint velocity ratios < 0.2 | heuristic (UI guidance adapted to video) | in-frame moves | TS |
| MOTION-EASE-004 | No unintended velocity kinks at keyframe joins | \|v⁻−v⁺\| > 0.5 × local peak speed flagged unless tagged `hit` | heuristic | multi-keyframe paths | TS |
| MOTION-EASE-005 | Overshoot within voice budget | productive ≤ 2%; expressive/energetic ≤ 10%; playful per spec; bounce > 0.4 needs justification (Apple caution) | platform / heuristic | springs, back | TS |
| MOTION-EASE-006 | Opacity, colour and blur never overshoot | overshoot = 0 (beyond ε) on effect properties | platform (M3 effects ζ = 1) | effects | TS |
| MOTION-EASE-007 | Small curve vocabulary | ≤ 3 distinct easing classes plus ≤ 2 springs per piece unless the spec says otherwise | heuristic | whole piece | TS (curve match) |
| MOTION-EASE-008 | Spec conformance | Each tween's fitted curve matches a spec curve (RMSE of q(u) ≤ 0.03) | heuristic | specced projects | TS |
| MOTION-SPR-001 | Springs are closed-form functions of t | No integrator state across frames; seek(t) twice gives identical values | heuristic (VCR contract) | all springs | TS (seek-repeat) |
| MOTION-SPR-002 | Springs settle before the next beat or cut | settle frame ≤ next action onset or cut | heuristic | springs | TS |
| MOTION-CHOR-001 | Stagger evenness | CV(Δonset) ≤ 0.10, or Δ strictly monotonic (intentional ramp) | heuristic | groups ≥ 3 | TS |
| MOTION-CHOR-002 | Stagger span not sluggish | Total span ≤ 2 × item duration, or group is not staggered (Fluent: skip for very large groups) | heuristic (number untraceable) | groups | TS |
| MOTION-CHOR-003 | Single lead mover | ≤ 1 unrelated "primary" (largest-area) mover starting within any 100 ms window | heuristic | each beat | TS |
| MOTION-CHOR-004 | Hierarchy order | Highest-priority element (brief or DOM tag) onsets first, or has the longest/most prominent move | platform (Fluent) | each beat | TS + J |
| MOTION-CHOR-005 | Persistent-element continuity at transitions | Tagged shared element: no position jump > 2 px between consecutive frames that isn't explained by its velocity | heuristic | transitions | TS |
| MOTION-CHOR-006 | Causal contact timing | Driven object onset within ≤ 1 frame of contact (≤ 33 ms at 30 fps) | heuristic (lab evidence) | hits, pushes, triggers | TS (+AUD) |
| MOTION-CHOR-007 | Morph integrity | No self-intersection mid-morph; point counts matched | heuristic | SVG morphs | TS/PX + J |
| MOTION-RHY-001 | Beat-locked arrivals on markers | Use `SOUND-BEAT-ALIGN`; report arrival offset in frames | heuristic | sound-led, `markers` present | TS + AUD |
| MOTION-RHY-002 | SFX on contact frames | Superseded: use `SOUND-SYNC-LEAD`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | SFX | AUD + TS |
| MOTION-RHY-003 | Energy has shape (not flat) | CV of per-second motion energy ≥ 0.3 for pieces > 10 s `[heuristic, uncalibrated]` | heuristic | whole piece | TS/PX |
| MOTION-RHY-004 | Seamless loop | All sampled properties at t = duration equal t = 0 within ε, and velocities match within 10% | heuristic | loop deliverables | TS + PX |
| MOTION-CAM-001 | Pan speed vs judder | Full-frame detailed layer displacement ≤ W/(7·fps) px/frame at 24 fps, scaled for fps (RED) | heuristic (vendor rule of thumb) | pans, scrolling backgrounds | TS / PX |
| MOTION-CAM-002 | Parallax flagged | Superseded: use `A11Y-MOTION-FULLFRAME`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | 2.5D | TS + J |
| MOTION-CAM-003 | Large zoom flagged | Superseded: use `A11Y-MOTION-PARALLAX`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | pushes, zooms | TS |
| MOTION-CAM-004 | No sustained oscillation near 0.2 Hz | Full-frame or large-element oscillation 0.1–0.3 Hz for > 2 cycles ⇒ warn | platform (Apple) | ambient motion | TS (FFT) |
| MOTION-CAM-005 | Spin and vortex control | Continuous rotation of large or full-frame content, or infinite small spins near text ⇒ warn | heuristic (Val Head) | rotation | TS |
| MOTION-CAM-006 | Stable anchor during big moves | During full-frame camera moves > 1 s, ≥ 1 element remains screen-fixed | heuristic (Apple) | camera moves | TS + J |
| MOTION-FPS-001 | Delivery fps = authored fps | Superseded: use `DELIVERY-FPS-NATIVE`, `DELIVERY-FPS-CONSTANT` and `DELIVERY-FPS-MAX`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic | all | VID metadata |
| MOTION-FPS-002 | Periodic-pattern aliasing | Per-frame phase step < 0.5 × pattern period (spokes, stripes) | heuristic (sampling theory) | rotating or periodic | TS |
| MOTION-FPS-003 | Thin high-contrast moving features | Strokes ≤ 2 px or text < delivery min size moving > 0 and < 1 px/frame (shimmer) or > W/(7·fps) (strobe) ⇒ warn | heuristic | lines, small text | TS + VID |
| MOTION-FPS-004 | Synthetic blur sane | If temporal supersampling or blur is used: shutter ≤ 360°, default 180° | heuristic | fast motion | J / config |
| MOTION-A11Y-001 | Reduced-motion variant for interactive web output | Superseded: use `A11Y-MOTION-REDUCED-VARIANT`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | interactive web embeds | DOM (emulated media) |
| MOTION-A11Y-002 | Pause/stop/hide for autoplay > 5 s | Superseded: use `A11Y-MOTION-REDUCED-VARIANT`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | web loops, backgrounds | DOM + TS |
| MOTION-A11Y-003 | Reduced-motion substitution style | Superseded: use `A11Y-MOTION-PAUSE`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | reduced variants | TS |
| MOTION-A11Y-004 | Meaning not carried by motion alone | Superseded: use `A11Y-AD-COVERAGE`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | explainers, data | J |
| MOTION-A11Y-005 | Flash safety | Superseded: use `A11Y-FLASH-GENERAL`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | all | (other pillar) |
| MOTION-SIG-001 | Motion spec exists and is followed | Spec present in brief; EASE-008 pass rate ≥ 90% | heuristic | all projects | J + TS |
| MOTION-SIG-002 | Template detection: default ease and duration monoculture | > 70% of tweens share one (ease, duration) pair, or > 50% use the library default ease | heuristic | all | TS |
| MOTION-SIG-003 | Template detection: fade-up monoculture | > 70% of entrances are opacity + translateY(+) from below | heuristic | all | TS |
| MOTION-SIG-004 | Signature move rationed | Signature move used at ≤ 3 key beats per 30 s | heuristic | branded | TS + J |

## 17. How to measure in VCR

General sampling: for each check, seek `window.__scene.seek(t)` at t = i/fps for i ∈ [0, duration·fps). For derivative metrics, also oversample at 4×. Read `getComputedStyle` and `DOMMatrix` of the transform, `getBoundingClientRect()` centre, opacity, and for canvas `textBounds()`. Element identity requires stable IDs or `data-vcr-role` tags (`primary`, `shared`, `impact`, `loop`, `text`).

| Rule(s) | Inputs | Calculation | Sampling | Known failure modes |
|---|---|---|---|---|
| TIME-001/002/003/004/006 | TS of transform/opacity per element | Segment tweens (onset/settle, §9.2); duration; rank-correlate duration vs travel distance and area per scene | 4× fps | Tweens chained without rest merge into one segment; GSAP `yoyo`/repeat; canvas objects without IDs (need instrumentation hooks) |
| TIME-005 | TS + text bboxes; `TYPO-*` reading time | Find runs where all elements intersecting the text bbox have speed < ε; compare run length to required time | fps | Ambient secondary motion near text breaks the "still" test; decide ε per property |
| EASE-001/002/003/005/006/008 | TS per tween | Normalise q(u); peak-velocity u; endpoint ratios; overshoot; RMSE against curve library | 4× fps, ≥ 30 samples per tween | Very short tweens (< 6 frames) give unreliable shape; compound transforms (rotate + translate) need per-axis or bbox-centre analysis; path-following motion needs arc-length parametrisation |
| EASE-004 | TS | Velocity jump at detected keyframe times (from timeline introspection or second-derivative spikes) | 4× fps | Intentional hits must be tagged; sampling across a join smears the jump |
| EASE-007, SIG-002/003 | Fitted curves and durations for all tweens | Cluster by (class, duration rounded to a frame); histogram; direction vectors of entrances | — | Library-specific aliases (power2 ≈ ease-in-out-cubic) cluster separately unless matched by shape, not name |
| SPR-001 | seek(t) twice, in random order | Compare all sampled values bitwise (or within 1e-9) | random 50 t values | Stateful integrators pass when seeked sequentially; always test out-of-order seeks |
| SPR-002, CHOR-006 | TS + tagged contacts or markers | Settle frame vs next onset; driven onset − contact time | 4× fps | Contact detection needs either tags or bbox collision; anti-aliased edges blur "contact" by about 1 px |
| CHOR-001/002 | Onsets of tagged group members | Sort onsets, compute Δ, CV and monotonicity; span vs item duration | 4× fps | Members with different easing produce different detected onsets at the same nominal start; use the timeline start where introspectable |
| CHOR-003/004 | TS + area per element + priority tags | Per 100 ms window, count area-weighted movers that start; compare onset order to priority | fps | Grouped elements (a card and its children) must be collapsed to the parent |
| CHOR-005 | TS of `shared`-tagged element across scene boundary | Frame-to-frame displacement minus the predicted displacement from velocity | fps | Elements recreated with new DOM nodes across scenes lose identity; tag by `data-vcr-id` |
| RHY-001/002 | `markers`, TS settle/impact frames, decoded audio onsets (spectral flux) | \|frame(event) − round(marker·fps)\| | fps, audio at native sample rate | Onset detection on dense mixes misfires; encoder priming and edit lists shift audio by some ms (check the container's start offset) |
| RHY-003 | TS energy or PNG mean absolute difference | Per-second energy, CV | fps | Full-frame colour fades register as huge energy; weight transforms over pixel diff |
| RHY-004 | Frames at t = 0 and t = duration (seek to duration − ε and wrap) | Property equality and velocity match; PNG SSIM between frame N and frame 0 | fps + 4× near the seam | Off-by-one frame at the seam (duration exclusive vs inclusive); time-dependent noise not periodic |
| CAM-001, FPS-003 | TS of full-frame layers; PNG optical flow for canvas/WebGL | px/frame vs W/(7·fps) | fps | Optical flow fails on flat-colour areas; the rule assumes detailed, high-contrast content |
| CAM-002/003/005/006 (CAM-002/003 dropped; owners `A11Y-MOTION-FULLFRAME`, `A11Y-MOTION-PARALLAX`; CAM-005 moved to `A11Y-MOTION-*`) | TS transforms of layers and root | Count speed classes; scale ratio over a 1 s window; angular velocity; screen-fixed element presence | fps | Camera implemented as a parent transform must be decomposed; three.js cameras need the projection read via the scene hook |
| CAM-004 (moved to `A11Y-MOTION-*`) | TS of large elements and root | FFT of position or scale; energy in 0.1–0.3 Hz band, cycles counted | full duration | Short pieces (< 10 s) cannot resolve 0.2 Hz reliably (needs ≥ 2 cycles = 10 s) |
| FPS-001 (moved to `DELIVERY-FPS-*`) | Container metadata (`ffprobe`), render config | Equality | — | Variable-frame-rate re-encodes by platforms; check the platform download if possible |
| FPS-002 | TS rotation × pattern period (from scene metadata) | Phase step per frame / period | fps | Period must be declared; auto-detection from pixels is unreliable |
| MOTION-A11Y-001/002 (dropped; owner `A11Y-MOTION-REDUCED-VARIANT`) | DOM with emulated `prefers-reduced-motion` (Playwright `emulateMedia`) | Re-sample TS; non-essential tagged motion must be ≈ 0; detect controls for > 5 s loops | fps | Essential vs non-essential needs tags; video files themselves are out of scope |
| SIG-001/004 | Brief spec, curve fits | Pass rate; count signature-tagged occurrences per 30 s | — | Requires spec and tags; otherwise judgement only |

## 18. VCR-specific rendering and delivery notes

- **Seek-based rendering demands pure functions of time.**
  - CSS transitions triggered by class changes, `requestAnimationFrame` loops, `setTimeout`, physics integrators and `Date.now()` all break under random-access seeking. Use GSAP timelines (`timeline.seek(t)` / `progress()`), WAAPI with `currentTime`, CSS animations with negative `animation-delay` or paused `currentTime`, or closed-form maths.
  - p5.js, PixiJS and three.js scenes must compute state from *t*, not from a frame counter incremented per draw.
  - Seeded PRNGs for noise.
  - Springs: use the analytic solution (underdamped, critical or overdamped cases).
- **Fixed fps quantises events:** an event at 0.51 s at 30 fps renders at frame 15 (0.5 s) or 16 depending on rounding. Author beat and impact times as frame numbers, or snap with `Math.round(t·fps)/fps`.
- **0° shutter:** see §7. If motion blur is needed, implement it as sub-frame supersampling (e.g. 8–16 seeks within the 180° interval, averaged in linear light) or velocity-based directional blur. Note that supersampling multiplies render time.
- **`yuv420p` H.264:**
  - Chroma is subsampled 2× horizontally and vertically, so thin saturated lines and coloured text edges bleed, worst on red/blue on dark.
  - Fine moving detail costs bitrate. Platform re-encodes (lower bitrate, sometimes a different fps) smear fast-moving thin elements and cause banding on slow gradient drifts.
  - Mitigations: thicker strokes for moving lines, avoid full-frame noise or grain motion unless bitrate allows, add slight dither to gradients, and test by re-encoding at a low bitrate before sign-off.
- **ProRes 4444 alpha masters** keep full chroma and alpha. Check that premultiplication is consistent, and that motion-blurred edges composite correctly downstream.
- **Colour fades in sRGB vs linear:** opacity cross-fades of two images dip in perceived brightness. That is a known compositing behaviour; check whether the renderer blends in sRGB.
- **Playback ≠ render:** a 24 fps master shown on 60 Hz phones gets 3:2 cadence judder. 30 fps is the safer default for social; 60 fps for UI demos and smooth kinetic type, at double render cost.
- **Duration and loop seams:** make sure `duration` semantics are exclusive (frame N−1 is the last frame) so loops don't duplicate a frame at the seam.
- **Audio:** AAC encoder priming and container edit lists can offset audio by tens of ms. Verify sync on the *decoded delivery file*, not only on the timeline. Synthesised SFX must be seeded and deterministic.

## 19. Master checklists

### Analysis checklist

- [ ] Watched at delivery fps, with and without sound (MOTION-PROC-001)
- [ ] Holds long enough for all text (TIME-005)
- [ ] No unintended sub-100 ms moves (TIME-001); UI mock timings plausible (TIME-002, TIME-006)
- [ ] Duration scales with travel and size (TIME-003); exits ≤ entrances (TIME-004)
- [ ] Entrances decelerate, exits accelerate, in-frame moves ease in and out; no linear stops (EASE-001/002/003)
- [ ] No unintended kinks (EASE-004); overshoot within budget (EASE-005); effects never overshoot (EASE-006)
- [ ] Curve vocabulary small and on-spec (EASE-007/008, SIG-001)
- [ ] Springs deterministic and settled before the next beat (SPR-001/002)
- [ ] Staggers even or intentionally ramped and not sluggish (CHOR-001/002)
- [ ] One lead mover; hierarchy order matches priority (CHOR-003/004)
- [ ] Continuity across transitions; morphs clean (CHOR-005/007)
- [ ] Causal hits and SFX on contact frames (CHOR-006, RHY-002 (dropped; owner `SOUND-SYNC-LEAD`))
- [ ] Beat arrivals within 1 frame (RHY-001); energy has shape (RHY-003); loop seam clean (RHY-004)
- [ ] Pans within judder limit; parallax, zoom, spin and oscillation checked; anchor present (CAM-001…006) (CAM-002/003 dropped; owners `A11Y-MOTION-FULLFRAME`, `A11Y-MOTION-PARALLAX`; CAM-004/005 moved to `A11Y-MOTION-*`)
- [ ] fps consistent; no aliasing or shimmer, checked on the encoded file (FPS-001…004) (FPS-001 moved to `DELIVERY-FPS-*`)
- [ ] Accessibility hooks for web outputs (MOTION-A11Y-001…005) (dropped; owners `A11Y-MOTION-*`, `A11Y-FLASH-*`)
- [ ] Template signs absent (SIG-002/003); signature rationed (SIG-004)

### Creation checklist

- [ ] Voice chosen and motion spec written: fps, 2–3 curves, 1 spring (ζ, k), duration scale, stagger and direction laws, signature move, break rules (SIG-001)
- [ ] Beat sheet with holds sized by reading time (TIME-005) and markers (RHY-001)
- [ ] Blocked pose-to-pose; compositions checked as stills at holds only
- [ ] Easing per role: enter/exit/move (EASE-001…003); effects critically damped (EASE-006)
- [ ] Choreography: lead mover, offsets, overlap, follow-through (CHOR-001…004)
- [ ] Transitions preserve shared elements (CHOR-005)
- [ ] Camera within limits with an anchor (CAM-001…006) (CAM-002/003 dropped; owners `A11Y-MOTION-FULLFRAME`, `A11Y-MOTION-PARALLAX`; CAM-004/005 moved to `A11Y-MOTION-*`)
- [ ] Everything a pure function of t; seeded randomness; analytic springs (SPR-001)
- [ ] Measurable checks run; encoded delivery re-checked (FPS-001…003) (FPS-001 moved to `DELIVERY-FPS-*`)
- [ ] Reduced-motion and pause controls where web-interactive (MOTION-A11Y-001/002) (dropped; owner `A11Y-MOTION-REDUCED-VARIANT`)
- [ ] Template self-check before handoff (SIG-002/003)

## 20. Caveats

- **UI vs video transfer.** Almost all published durations are for interactive UI. Applying ≤ 500 ms to watched motion graphics would be over-applying the rules: title moves, camera drifts and data builds legitimately run seconds. VCR uses the UI values as a floor and a vocabulary.
- **Material is mid-transition.** M3 Expressive's springs are described by Material as the physics system replacing easing and duration. A third-party issue quotes Material describing the old tokens as "no longer maintained" (unverified at source). Material's pages render client-side, so the token values here come from search-result text of the primary page plus secondary copies of the androidx tokens. Values may change.
- **Apple's spring formulas and presets** are partially unverified: the transcript formula appears inconsistent, and the preset values are third-party.
- **Fluent 2 web token values** (50/100/150/200/… ms) were not verified on Microsoft's page and are omitted from rules.
- **Causality timing conflict.** Michotte (as summarised by some reviews) reported launching *improved* by 30–40 ms delays [16], while the 2025 replication found a significant decline already at 33.3 ms [15]. VCR's "contact frame" rule is the conservative reading.
- **The seven-second pan rule** is a film-era rule of thumb restated by RED, explicitly not all-or-nothing [14], and calibrated for 24 fps at 180° on camera footage. Synthetic, motion-blur-free renders may judder *more*.
- **Vestibular evidence** is mostly practitioner and user-report based (Val Head's interviews [24]; W3C Understanding notes [11]). Numeric thresholds for zoom, parallax and spin in this document are **heuristic and untraceable**; calibrate them with users.
- **Measurement metrics are unvalidated for motion graphics.** Smoothness metrics come from motor control and robotics, and can confound duration [33]. Correlation with human preference for 3D animation was weak [32]. Treat VCR's metrics as diagnostics, not scores.
- **Critique vocabulary** mappings are synthesised practitioner usage, not empirically derived.
- **Platform behaviours** (loop/replay, re-encode bitrates, safe zones) change without notice and were not verified here.
- **Expressive breaks** are legitimate: linear motion for a mechanical or brutalist voice; long elastic for kids' content; hard cuts instead of easing for a glitch aesthetic; deliberate judder for a stop-motion look. A break succeeds when it is consistent across the piece, motivated by the voice, and kept off reading moments.
- **Agent-specific risks:**
  - homogenised defaults (SIG-002/003);
  - over-applying rules to expressive briefs;
  - judging easing from still frames;
  - trusting timeline values without checking the encoded output;
  - making springs or noise non-deterministic.

## 21. Verification ledger (all entries dated 2026-11-06)

| # | Claim | Result | Checked against |
|---|---|---|---|
| 1 | M3 durations short1–extra-long4 = 50…1000 ms in listed steps | confirmed (search-result text of primary page; page body requires JS) | [1] |
| 2 | M3 standard `cubic-bezier(0.2, 0.0, 0, 1.0)`; std decel `(0,0,0,1)`; std accel `(0.3,0,1,1)` | confirmed (same caveat) | [1] |
| 3 | M3 emphasized decel `(0.05, 0.7, 0.1, 1.0)`; accel `(0.3, 0.0, 0.8, 0.15)`; emphasized CSS "N/A" | confirmed (same caveat) | [1] |
| 4 | M3 examples: 200 ms selection, 400 ms FAB→sheet, 500 ms card, 1000 ms carousel | confirmed (same caveat) | [1] |
| 5 | M3 springs: damping 1 removes bounce; stiffness/damping/initial velocity | confirmed (search-result text) | [2] |
| 6 | M3 Expressive token values (0.6/800, 0.8/380, 0.8/200; standard 0.9/1400, 700, 300; effects 1.0/3800, 1600, 800) | unverified (secondary GitHub copies only; Google source not fetched) | [34] |
| 7 | M3 easing/duration tokens "no longer maintained" | unverified (third-party issue quoting Material) | — |
| 8 | Carbon easing curves (standard, entrance, exit × productive/expressive) | confirmed (standard via fetch; entrance/exit via subagent fetch of same page) | [4] |
| 9 | Carbon durations 70/110/150/240/400/700 ms | confirmed (v10 page and current page snippet; @carbon/motion README) | [5][35] |
| 10 | Carbon micro-interactions 90–120 ms | confirmed (search-result text of primary page) | [4] |
| 11 | Fluent 2 staggering, hierarchy, linear-only-for-rotation, top-level fade guidance | confirmed (fetched) | [6] |
| 12 | Fluent 2 web token ms values | unverified (third-party only) | — |
| 13 | Windows motion 167/250/333 ms; `(0,0,0,1)`, `(0.55,0.55,0,1)` | confirmed (Microsoft docs repo, search-result text) | [7] |
| 14 | Apple HIG: 0.2 Hz oscillation; 30–60 fps games; peripheral motion | confirmed (fetched); 0.2 Hz nausea data (12/12 vs 8/12 at 0.1 Hz, 7/12 at 0.4 Hz) from *Aviation, Space and Environmental Medicine* 72(3):188–192 via enrichment, not fetched directly | [8] |
| 15 | Apple Reduce Motion: replace x/y/z transitions with fades | confirmed (search-result text) | [9] |
| 16 | WWDC23: duration + bounce; bounce −1…1; ~15%/~30%/0.4 guidance; bounce 0 default advice | confirmed (subagent fetched transcript) | [10] |
| 17 | SwiftUI presets 0.5 s, bounce 0/0.15/0.3 | unverified (third-party) | — |
| 18 | Apple ζ = 1 − bounce mapping | unverified (transcript formula inconsistent) | [10] |
| 19 | WCAG 2.3.3 text, AAA, definition excludes colour/opacity, blur erratum | confirmed (fetched) | [11] |
| 20 | WCAG 2.2.2 three conditions; five seconds; Level A | confirmed (W3C Understanding search-result text) | [12] |
| 21 | NN/g 100–500 ms; ~100 ms feedback; 200–300 ms; 500 ms "drag"; 100–400 ms | confirmed (search-result text of primary page; fetch truncated before section) | [13] |
| 22 | NN/g exits shorter: popup 300 ms in, 200 or 250 ms out | confirmed via enrichment quote of the NN/g article (fetch truncated before that section) | [13] |
| 23 | RED: full image width ≥ 7 s at 24 fps 180°; not all-or-nothing | confirmed (fetched) | [14] |
| 24 | Michotte: reduced at 70 ms, absent at 154 ms; replication: 33.3 ms significantly lower, plateau to 200 ms | confirmed (fetched snippets of RSOS / PMC) | [15] |
| 25 | Michotte: strengthened by 30–40 ms delay | contradicted by [15]'s replication; reported in [16] | [15][16] |
| 26 | Window of visibility predicts critical sample rate | confirmed (abstract) | [17] |
| 27 | GSAP default `power1.out`; families listed | confirmed (search-result text of docs) | [19] |
| 28 | GSAP power1=quad … power4=quint | unverified at primary (secondary guides) | — |
| 29 | CSS keyword cubic-bezier equivalents | confirmed | [20][21] |
| 30 | Chang & Ungar: solidity/exaggeration/reinforcement; arcs, follow-through, motion blur | confirmed | [22][23] |
| 31 | Val Head triggers: zoom, spin (even small, looping), multi-speed, parallax | confirmed | [24] |
| 32 | Uber Base: 100 ms crossfade for reduced motion; "Bold, Direct, with Heart" | confirmed (search-result text) | [27] |
| 33 | LDJ invariant to scale/duration; SAL ~10× more robust than LDJ | confirmed as reported by authors (secondary to original metric papers) | [30][31] |
| 34 | Smoothness metrics confounded by duration | confirmed (single 2026 preprint; not peer-reviewed) | [33] |
| 35 | 3D animation smoothness SROCC 0.267 | confirmed | [32] |
| 36 | Overshoot and settle values for M3 springs; frames-per-ms table; pan px/frame | derived (arithmetic from cited inputs; inputs partly unverified) | — |
| 37 | A/V sync tolerances (ITU-R BT.1359): detectability about +45 to −125 ms, acceptability about +90 to −185 ms | confirmed via enrichment quote (ITU-R BT.1359, 1998); not fetched directly | — |
| 38 | Social platform loop/replay lengths | not found (not researched) | — |
| 39 | "20–25 ms per list item" stagger | unverified folklore: the uxdesign.cc article gives "20 to 25 ms" per element with no primary origin | — |
| 40 | WCAG 2.3.1 flash thresholds | unverified here (owned by accessibility pillar) | — |

## 22. Sources

1. Material Design 3, "Easing and duration – tokens & specs." https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
2. Material Design 3, "Motion – how it works (motion physics system)." https://m3.material.io/styles/motion/overview/how-it-works
3. Material Design blog, "M3 Expressive: New Motion System." https://m3.material.io/blog/m3-expressive-motion-theming
4. IBM Carbon Design System, "Motion – Overview." https://carbondesignsystem.com/elements/motion/overview/
5. IBM Carbon Design System v10, "Motion." https://v10.carbondesignsystem.com/guidelines/motion/overview/
6. Microsoft Fluent 2, "Motion." https://fluent2.microsoft.design/motion
7. Microsoft, "Motion in Windows" (windows-dev-docs). https://github.com/MicrosoftDocs/windows-dev-docs/blob/docs/hub/apps/design/signature-experiences/motion.md
8. Apple Human Interface Guidelines, "Motion." https://developer.apple.com/design/human-interface-guidelines/motion
9. Apple Human Interface Guidelines, "Accessibility." https://developer.apple.com/design/human-interface-guidelines/accessibility
10. Apple WWDC23, "Animate with springs." https://developer.apple.com/videos/play/wwdc2023/10158/
11. W3C WAI, "Understanding SC 2.3.3 Animation from Interactions." https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
12. W3C WAI, "Understanding SC 2.2.2 Pause, Stop, Hide." https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html
13. Laubheimer, P., NN/g, "Executing UX Animations: Duration and Motion Characteristics" (2020). https://www.nngroup.com/articles/animation-duration/
14. RED Digital Cinema, "Panning Speed Best Practices." https://www.reddigitalcinema.com/red-101/camera-panning-speed
15. White, P. A. (2025), "Michotte's research on perceptual impressions of causality: a registered replication study," *Royal Society Open Science* 12(9). https://royalsocietypublishing.org/rsos/article/12/9/250244/235317/Michotte-s-research-on-perceptual-impressions-of ; PMC: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12434928/
16. "The psychophysics of bouncing: Perceptual constraints, physical constraints, animacy, and phenomenal causality," *PLOS ONE* (2023). https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0285448
17. Watson, A. B., Ahumada, A. J., & Farrell, J. E. (1986), "Window of visibility," *JOSA A* 3(3), 300–307. https://opg.optica.org/josaa/abstract.cfm?uri=josaa-3-3-300
18. "BiPMAP: A Toolbox for Predicting Perceived Motion Artifacts on Modern Displays," arXiv:2212.03854. https://arxiv.org/html/2212.03854v3
19. GSAP docs, "Easing." https://gsap.com/docs/v3/Eases/
20. CSSWG, "CSS Easing Functions Module Level 2" (Editor's Draft). https://drafts.csswg.org/css-easing/
21. MDN, "`<easing-function>`." https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function
22. Chang, B.-W., & Ungar, D. (1993), "Animation: From Cartoons to the User Interface," UIST. https://bibliography.selflanguage.org/animation.html
23. Thomas, B. H., & Calder, P., "Applying Cartoon Animation Techniques to Graphical User Interfaces." https://wearables.unisa.edu.au/uploads/1/2/7/6/127656642/p198-thomas.pdf
24. Head, V. (2019), "Making Motion Inclusive," An Event Apart. https://noti.st/valhead/PkWS2k
25. Head, V. (2015), "Designing Safer Web Animation for Motion Sensitivity," *A List Apart*. https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/
26. Head, V. (2016), "How fast should your UI animations be?" https://valhead.com/2016/05/05/how-fast-should-your-ui-animations-be/
27. Uber Base Design System, "Motion." https://base.uber.com/6d2425e9f/v/0/p/116184-motion
28. Material Design (M2), "Understanding motion." https://m2.material.io/design/motion/understanding-motion.html
29. Google Design, "Implementing Motion" (Medium). https://medium.com/google-design/implementing-motion-9f2839002016
30. "Learning from the Best: Smoothness-Driven Metrics for Data Quality in Imitation Learning," arXiv:2604.23000. https://arxiv.org/html/2604.23000v1
31. "Image-driven Robot Drawing with Rapid Lognormal Movements," arXiv:2507.03166. https://arxiv.org/pdf/2507.03166
32. "Quality assessment of 3D human animation: Subjective and objective evaluation," arXiv:2505.23301. https://arxiv.org/html/2505.23301v1
33. "Smoothness Ranks Skill, Not Success: An Audit of Published Trajectory-Smoothness Curation Metrics Under Episode-Length Controls," arXiv:2610.17427 (preprint). https://arxiv.org/html/2610.17427v1
34. kaeawc/auto-mobile issue #15243 (secondary copy of androidx M3 motion tokens). https://github.com/kaeawc/auto-mobile/issues/15243
35. IBM Carbon, `@carbon/motion` package README. https://github.com/carbon-design-system/carbon/tree/main/packages/motion
36. Guski, R., & Troje, N. F. (2003), audiovisual phenomenal causality, *Perception & Psychophysics* 65(5), 789–800. https://biomotionlab.ca/Text/PP_Guski.pdf
37. Wandell, B., *Foundations of Vision*, ch. 10 "Motion and Depth." https://foundationsofvision.stanford.edu/chapter-10-motion-and-depth/

## 23. Citation links

The escaped `\[n\]` markers in the text point to this list; plain `[n]` markers point to §22.

1. [Easing and duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)
2. [Motion](https://m3.material.io/styles/motion/overview/how-it-works)
3. [feat(motion): add motion-scheme spring tokens and ThemeProvider motionScheme by minop1205 · Pull Request #319 · minop1205/m3-expressive-react · GitHub](https://github.com/minop1205/m3-expressive-react/pull/319)
4. [Move the motion tokens and components onto M3's motion system · Issue #143 · hfournier/astro-components · GitHub](https://github.com/hfournier/astro-components/issues/143)
5. [Motion](https://www.carbondesignsystem.com/building-blocks/foundations/motion)
6. [Motion | Carbon Design System](https://carbondesignsystem.com/elements/motion/overview/)
7. [Executing UX Animations: Duration and Motion Characteristics - NN/G](https://www.nngroup.com/articles/animation-duration/)
8. [Fluent 2 Design System](https://fluent2.microsoft.design/motion)
9. [Panning Speed Best Practices](https://www.reddigitalcinema.com/red-101/camera-panning-speed)
10. [Window of visibility: a psychophysical theory of fidelity in time-sampled visual motion displays](https://opg.optica.org/josaa/abstract.cfm?uri=josaa-3-3-300)
11. [Window of visibility - A psychophysical theory of fidelity in time-sampled visual motion displays - NASA Technical Reports Server (NTRS)](https://ntrs.nasa.gov/citations/19860047713)
12. [Making Motion Inclusive by Val Head](https://noti.st/valhead/PkWS2k)
13. [Making Motion Inclusive by Val Head - Hooked On Code](https://hookedoncode.com/2019/07/making-motion-inclusive-by-val-head/)
14. [SC 2.2.2 - What does "Pause, Stop, Hide" mean?](https://www.properaccess.nl/en/blog/wcag-2-2-2-pause-stop-hide/)
15. [WCAG 2.2.2: Pause, Stop, Hide: Level A](https://wcagrules.com/learn/2-2-2-pause-stop-hide)
16. [Understanding Success Criterion 2.3.3: Animation from Interactions | WAI | W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
17. [Understanding Success Criterion 2.2.2: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)
18. [WCAG 2.2.2 Pause, Stop, Hide — explained, with fixes](https://motionspec.dev/blog/wcag-2-2-2-pause-stop-hide)
19. [Learning from the Best: Smoothness-Driven Metrics for Data Quality in Imitation Learning](https://arxiv.org/html/2604.23000v1)
20. [Image-driven Robot Drawing with Rapid Lognormal Movements](https://arxiv.org/pdf/2507.03166)
21. [Smoothness Ranks Skill, Not Success:An Audit of Published Trajectory-Smoothness Curation MetricsUnder Episode-Length Controls](https://arxiv.org/html/2610.17427v1)
22. [Supporting cartoon animation techniques in direct manipulation graphical user interfaces - ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0950584904001326)
23. [Animation: From Cartoons to the User Interface — Self Papers 4.5.0 documentation](https://bibliography.selflanguage.org/animation.html)
24. [Applying Cartoon Animation Techniques to Graphical User Interfaces](https://wearables.unisa.edu.au/uploads/1/2/7/6/127656642/p198-thomas.pdf)
25. [Implementing Motion. An introduction to Material Design’s…](https://medium.com/google-design/implementing-motion-9f2839002016)
26. [(PDF) Animation: From Cartoons to the User Interface](https://www.academia.edu/47092214/Animation_From_Cartoons_to_the_User_Interface)
27. [Easing](https://gsap.com/docs/v3/Eases/)
28. [GSAP](https://gsap.com/cheatsheet/)
29. [A Visual Guide to GSAP Easing Functions — Milk Moon Studio](https://easing.milkmoonstudio.com/)
30. [Intro to the GreenSock Animation Platform (GSAP)](https://www.nobledesktop.com/learn/javascript/intro-to-the-greensock-animation-platform-gsap)
31. [CSS Easing Functions Module Level 2](https://drafts.csswg.org/css-easing/)
32. [CSS Easing Functions Level 2](https://jakearchibald.github.io/csswg-drafts/css-easing-2/Overview.html)
33. [\<easing-function\> CSS type - MDN Web Docs - Mozilla](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function)
34. [CSS Easing Functions Explained: cubic-bezier, Timing Keywords, and When to Use Each - Basic Free Tools](https://basicfreetools.com/blog/css-easing-functions-explained/)
35. [cubic-bezier()](https://css-tricks.com/almanac/functions/c/cubic-bezier/)
36. [Dynamic CSS animations with the linear() easing function - LogRocket Blog](https://blog.logrocket.com/dynamic-css-animations-linear-easing-function/)
37. [What Easing Does When a CSS Transition Gets Interrupted](https://artofstyleframe.com/blog/css-interrupted-transitions-easing-reversal/)
38. [windows-dev-docs/hub/apps/design/signature-experiences/motion.md at docs · MicrosoftDocs/windows-dev-docs · GitHub](https://github.com/MicrosoftDocs/windows-dev-docs/blob/docs/hub/apps/design/signature-experiences/motion.md)
39. [skills/skills/fluent2-design/SKILL.md at main · veronicaward/skills · GitHub](https://github.com/veronicaward/skills/blob/main/skills/fluent2-design/SKILL.md)
40. <https://developer.apple.com/design/human-interface-guidelines/motion.md>
41. [Animate with springs - WWDC23 - Videos - Apple Developer](https://developer.apple.com/videos/play/wwdc2023/10158/)
42. [prototype: motion token table in the contract and \`animate.tempo\` (one spring physics for Compose and SwiftUI) · Issue #15243 · kaeawc/auto-mobile · GitHub](https://github.com/kaeawc/auto-mobile/issues/15243)
43. [Engine: physical springs, runtime easing values and reduced motion · Issue #5 · jethac/slint · GitHub](https://github.com/jethac/slint/issues/5)
44. [feat: Material 3 Expressive — motion, shape, type and colour by stephane-segning · Pull Request #24 · vaam-apps/ui · GitHub](https://github.com/vaam-apps/ui/pull/24)
45. [\[T13\] iOS spring presets and optional page scale effect by nickschot · Pull Request #92 · nickschot/ember-mobile-drawer · GitHub](https://github.com/nickschot/ember-mobile-drawer/pull/92)
46. [How fast should your UI animations be?](https://valhead.com/2016/05/05/how-fast-should-your-ui-animations-be/)
47. [Motion - Base design system - Uber](https://base.uber.com/6d2425e9f/v/0/p/116184-motion)
48. [10 Motion and Depth](https://foundationsofvision.stanford.edu/chapter-10-motion-and-depth/)
49. [Michotte’s research on perceptual impressions of causality: a registered replication study](https://royalsocietypublishing.org/rsos/article/12/9/250244/235317/Michotte-s-research-on-perceptual-impressions-of)
50. [The psychophysics of bouncing: Perceptual constraints, physical constraints, animacy, and phenomenal causality](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0285448)
51. [Perception & Psychophysics 2003, 65 (5), 789-800](https://biomotionlab.ca/Text/PP_Guski.pdf)
52. [Understanding motion - Material Design](https://m2.material.io/design/motion/understanding-motion.html)
53. [Material Design 3 (Material You)](https://www.claudepluginhub.com/skills/intense-visions-harness-claude/design-material-design-3)
54. [Pan Shot: Meaning, Examples & How to Film a Camera Pan](https://flashboards.yaroflasher.com/learn/camera-movement/pan-shot/)
55. [Poor image when panning](https://www.dpreview.com/forums/thread/4158078)
56. [Juddering Question. — PhotoKensho](https://photokensho.net/1000-words/2023/6/16/juddering-question)
57. [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
