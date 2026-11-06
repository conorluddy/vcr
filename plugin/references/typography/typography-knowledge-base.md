# Typography Knowledge Base for a Creative Design Agent (VCR)

> **Status:** reference, not a skill. It is too large to load whole (about 30k tokens). Agents read the section they need; skills, agents and checks are proposed outputs, not existing generated artifacts. Future outputs should cite rule IDs (`TYPO-…`, defined in §14 and §15) so they can be regenerated when this file changes.
>
> **Scope:** all media, because VCR makes stills (`svg`, `resvg`, `imagemagick`, `sharp`, `canvas-2d`) as well as motion. §15 covers what is specific to VCR's render and delivery path. Nothing here claims a check is implemented: automated checks belong to Layer 5/6, which have not started.
>
> **Confidence tiers** used in §14, §15 and the ledger: **standard** (a published standard or style guide, checked against the primary source), **platform** (published by a platform or vendor, may change without notice), **heuristic** (practitioner rule of thumb or a secondary source). The verification ledger under Caveats lists what was checked on 2026-11-06.

A typographic agent starts with the brief, medium, language, viewing size and delivery requirements. Use the ranges here as starting points, then select applicable rules from §14. Published accessibility requirements, vendor delivery specifications and practitioner preferences are different kinds of constraint. Expressive choices may depart from defaults; they do not override an agreed accessibility or delivery requirement. Verify the result at its intended viewing size.

## TL;DR

- **Numbers need scope and evidence.** §14 identifies candidate checks; its thresholds are not universal requirements. Latin prose, Netflix English subtitles, responsive web text and fixed-size video need different profiles. BBC vertical-caption guidance and Meta safe-area figures remain unverified in the ledger; treat them as provisional, not gates.
- **Judgement is the other half, and it has a repeatable process.** Read the text, define the voice, choose type for tone and technical quality, build a system (scale, grid, roles), and set micro-typography properly. Then render at real size in the real medium, critique with a checklist and a squint test, and iterate. Rules are broken deliberately in expressive work, never by accident in functional text.
- **Much of this can be verified by an agent.** It can compute characters per line, line-height ratios, WCAG/APCA contrast and safe-zone collisions. It can check caption CPS and duration, inspect OpenType features (Wakamai Fondue, fontTools/Font Bakery) and fix punctuation (SmartyPants, proselint). It should then render screenshots or video frames and inspect them visually.

## Key Findings

- **Numeric consensus is strong for body text, weak for display text.** Display, poster and kinetic work is governed by optical judgement: tighter leading (often 0.9–1.1), negative tracking at large sizes, and optical alignment.
- **Classification is in flux.** ATypI de-adopted Vox-ATypI on 18 March 2021 (announced 27 April 2021), and no replacement has been adopted.\[1\] Use pragmatic buckets (serif, sans, slab, mono, script, display) plus Vox vocabulary.\[2\]
- **Contrast standards disagree.** WCAG 2.x is the legal and conformance baseline. APCA (the WCAG 3 draft model) is better for size- and weight-aware readability and dark mode, but it is not normative.\[3\] Use WCAG as the gate and APCA as the quality target.
- **TikTok has no official pixel safe zone.** The Meta percentages quoted here remain unverified (see the ledger). TikTok publishes only ad templates, and third-party measurements vary widely.\[4\]\[5\] Design to the most conservative composite.
- **Caption reading speed is well standardised.** The Netflix English (USA) Timed Text Style Guide allows "Up to 20 characters per second" for adult programmes and 17 for children's, "42 characters per line" and "Maximum two lines". Netflix's General Requirements set each event between "5/6 (five-sixths) of a second" (20 frames at 24 fps) and "7 seconds".\[112\]\[114\] BBC (not re-verified; the site blocks automated fetches): 160–180 wpm, about 0.3 s per word, up to three lines on vertical video.

---

## 1. Foundations & Anatomy

- **Vertical metrics.** Baseline, x-height, cap height, ascenders and descenders. The x-height is the biggest driver of apparent size; Butterick: "different fonts set at the same point size won't necessarily appear the same."\[6\]
- **Counters and apertures.** Counters are enclosed spaces; apertures are the openings of c, e, a and s. Open apertures and large counters aid small-size, low-resolution and in-motion legibility. Closed apertures (e.g. Helvetica) degrade at small sizes.
- **Stroke contrast and stress.** Stress is diagonal in humanist and old-style faces, vertical in Didones. High-contrast faces (Didot, Bodoni) are glamorous at display sizes, but their hairlines break up when small, reversed, printed with ink gain, or compressed in video.
- **Other parts.** Terminals (ball, teardrop, sheared); serifs (bracketed, hairline, slab, wedge); width (condensed to extended); weight (hairline to black).
- **Legibility** is how distinct the glyphs are (open apertures, distinct I/l/1 and O/0, generous x-height).
- **Readability** is the comfort of continuous reading, which is set by the typographer. Butterick: "The four most important typographic considerations for body text are point size, line spacing, line length, and font."\[7\]
- **Personality** is the connotation carried by proportion, contrast and history.
- **Heuristic:** the longer the read, the more legibility and readability dominate; the shorter and larger the text, the more personality can lead.

## 2. Classification Systems

- **Vox-ATypI.** Devised in 1954 by Maximilien Vox, whom ATypI describes as "a French writer, illustrator, and typography historian who was later a founding member of ATypI." Adopted by ATypI in 1962 and made BS 2961:1967. Classes: Humanist, Garalde, Transitional, Didone, Mechanistic/Slab, Lineal (grotesque, neo-grotesque, geometric, humanist), Glyphic, Script, Graphic, Blackletter, Gaelic, plus "Non-Latin".
- **De-adopted in 2021** because it is Latin-centric. ATypI board chair Carolina Laudon said it "may have served its purpose in the past, but it is no longer representative of our community." The board also set up a working group to study "contemporary typeface classification systems that embrace the wealth of writing systems from around the world." Two years later, Blaze Type noted "little evidence of work on a new classification system."
- **Thibaudeau (1921)** is a simpler serif-shape taxonomy and Vox's ancestor.\[8\]
- **Modern foundries** use pragmatic buckets (e.g. Black Foundry: Sans, Serif, Slab, Mono, Blackletter, Script) plus descriptive tags such as humanist, geometric, grotesque, didone, reverse-contrast, rounded and variable.\[2\]
- **Agent rule:** use classification as vocabulary for skeleton and history, not as a pairing algorithm.

## 3. Typeface Selection

| Skeleton | Connotations | Good for | Watch out |
|---|---|---|---|
| Humanist/Garalde serif (Garamond, Source Serif) | literary, trustworthy | long-form, editorial | can feel conservative |
| Transitional (Baskerville, Georgia) | rational, established | editorial, institutional | — |
| Didone (Bodoni, Didot) | luxury, fashion, drama | mastheads, posters | hairlines fail small, reversed or in video |
| Slab (Clarendon, Roboto Slab) | sturdy, mechanical | headlines, signage, low-res | heavy in body |
| Grotesque/Neo-grotesque (Helvetica, Inter) | neutral, modernist | UI, Swiss layouts | closed apertures small |
| Geometric (Futura, Avenir) | modern, Bauhaus, optimistic | branding, display | weak word shapes in long text |
| Humanist sans (Frutiger, Source Sans) | friendly, civic, legible | wayfinding, UI, body | — |
| Monospace | technical, raw | code, data, brutalism | avoid for body (Butterick) |
| Script | personal, celebratory | short display | never all caps or long text |
| Blackletter | tradition, metal, nationalist history | very selective use | heavy baggage |

**Connotations and genre.** Check what a face "remembers": Futura (Bauhaus, space age), blackletter (German nationalism), Comic Sans (informality), Trajan (movie posters), Cooper Black (1970s). Genre conventions are a tool to use or subvert deliberately.

**Quality signals (most can be checked programmatically):**
- Even spacing and texture, checked by setting "hamburgefonstiv" and a paragraph.
- A full kerning table (AV, To, Ty, LT, figure pairs).
- A character set covering Latin Extended diacritics, Cyrillic and Greek as needed, plus proper punctuation (‘’“”–—…), ×, primes and currency signs.
- OpenType features: kern, liga, calt, smcp/c2sc, onum/lnum/pnum/tnum, frac, sups/subs, case, ss01–ss20, locl.
- Good hinting and rendering, true italics, and multiple weights.
- **Optical sizes.** Text cuts have a larger x-height, looser spacing and lower contrast; display cuts are tighter and finer (e.g. Mrs Eaves vs Mrs Eaves XL).\[9\] The `opsz` axis with CSS `font-optical-sizing: auto` automates this.
- **Variable fonts.** Registered axes are wght, wdth, slnt, ital and opsz; custom axes include GRAD, CASL, XTRA and ROND.\[10\] One file replaces many and enables animation.

**Licensing (never assume).**
- Licence types: desktop, web (self-hosted, often by page views), app embedding, broadcast/video and ePub are separate products at most commercial foundries.
- Text burned into video for social or ads needs desktop or broadcast terms that explicitly permit it.
- SIL OFL fonts (most of Google Fonts) may be used, embedded, bundled and modified. Modified versions can't use Reserved Font Names, and the fonts can't be sold alone.
- Fontshare (Indian Type Foundry) is free for commercial use under its own terms.
- **Agent rule:** record source and licence for every font in a manifest. Prefer OFL for indie, app and rendered-video work.

**Sources.** Free: Google Fonts, Fontshare, Velvetyne, League of Moveable Type, Adobe Fonts (with a subscription). Commercial: Commercial Type, Klim, Grilli Type, Dinamo, Colophon, Hoefler&Co, Monotype, Dalton Maag, Production Type, Pangram Pangram, OH no Type.

## 4. Pairing & Systems

- **Contrast or concordance, never conflict.** Pair clearly different roles (serif display + sans text) or clearly related skeletons. Near-identical faces look like a mistake.
- **Shared skeleton.** Match proportions, x-height and stress (e.g. humanist serif + humanist sans).
- **Superfamilies are safest:** Source Serif/Sans, IBM Plex, Roboto/Roboto Slab/Roboto Serif, Merriweather/Merriweather Sans, Noto.
- **Limit families.** Use 1–2, and a third only for a function such as mono for data. Butterick: "Use bold or italic as little as possible, and not together."\[7\]
- **Match x-heights inline** with CSS `font-size-adjust`.

**Type scales**
- **Modular ratios:** 1.125, 1.2, 1.25, 1.333, 1.414, 1.5, 1.618. Use 1.125–1.25 for dense UI and mobile, 1.333–1.618 for editorial and posters.
- **Fluid type:** `clamp(min, rem + vw, max)`, interpolating base size and ratio between two viewports (the Utopia method). Always include rem so zoom works.
- **Line height tightens as size grows.** IBM's type scale: line height "is usually larger for body type scales and becomes progressively tighter as the type size increases."\[11\]
- **Material 3 reference** (size/line height): Display Large 57/64, Display Medium 45/52, Display Small 36/44, Headline Large 32/40, Headline Medium 28/36, Headline Small 24/32, Title Large 22/28, Body Large 16/24 (+0.5 tracking), Body Medium 14/20, Body Small 12/16, Label Small 11/16.\[12\]\[13\]\[14\]\[15\]\[16\]
- **Apple iOS Dynamic Type at default "Large":** Large Title 34/41, Title 1 28/34, Title 2 22/28, Title 3 20/25, Headline 17 semibold, Body 17/22, Callout 16, Caption 2 11. Body ranges from 14 pt (xSmall) to 53 pt (AX5).\[17\]\[18\]

**Hierarchy and systems**
- Use 4–6 roles (display, h1–h3, body, caption/label, UI).
- Change one axis per level: size, weight, colour, case or space.
- Write a type spec per role (family, weight, size, line-height, tracking, case, colour token, spacing, features, responsive behaviour) as design tokens: CSS custom properties, Swift `Font` extensions or JSON. The agent can then lint against it.

## 5. Micro-typography

**Kerning**
- Metric kerning (the font's kern table) is always on. Butterick: "Kerning always on."\[19\] CSS `font-kerning: normal` is the default.
- Optical kerning is computed from shapes; use it for poorly kerned or mixed fonts.
- At display sizes, kern by eye: AV, LT, To, Ty, "r.", and quotes next to letters. Flip or blur the text to judge it.

**Tracking**
- All caps and small caps: +5–12% (Butterick), i.e. 0.05–0.12em.\[19\]
- Large display: tighten by roughly -0.01 to -0.04em; Apple's SF tracking goes negative at large sizes.
- Small text: slightly loose (Material Body Small is +0.4 px).\[20\]
- Never letterspace lowercase body text, blackletter or script.
- Video and motion often need +1–3% to survive compression and motion blur.

**Leading**
- Body: 120–145% of the point size (Butterick: "For most text, the optimal line spacing is between 120% and 145% of the point size").\[21\] Screen reading text commonly sits at the upper end or a little above, about 1.4–1.6. Treat 1.2 as the floor and 1.8 as the ceiling for body text; WCAG 1.4.12 requires layouts to survive a 1.5 override.
- Headings: about 1.0–1.25. All-caps display can go to 0.85–1.0.
- Longer measure needs more leading. Butterick: "As you reduce point size, also reduce line spacing and line length."\[6\]

**Measure**
- Bringhurst: 45–75 characters, 66 ideal; 40–50 per column in multi-column work.\[22\]\[23\]
- Butterick: "an average line length of 45–90 characters, including spaces," or "between two and three alphabets on a line."\[24\]
- CSS: `max-inline-size: 60ch–70ch` (verify with real text).\[25\] Mobile: about 35–50 characters.

**Rag, hyphenation and justification**
- Default to ragged right on screen. Bringhurst sets sans and mono ragged and avoids justifying lines under about 40 characters.\[26\]
- Butterick: "Use hyphenation with justified text."\[19\] Bringhurst: "avoid consecutive hyphenated line-ends, but frequent hyphens are better than sloppy spacing, and ragged setting is better yet."\[27\]
- A good rag moves gently in and out; avoid wedges, staircases and stranded short words.
- Rivers are vertical channels of word space. Fix them by rewording, hyphenating or adjusting the measure.

**Widows, orphans, runts**
- **Runt:** a single short word on the last line of a paragraph.
- **Widow:** a last line at the top of a column.
- **Orphan:** a first line at the bottom of a column.
- Always fix them in headlines. On the web, use `text-wrap: balance` for headings and `pretty` for paragraphs; CSS `widows`/`orphans` apply in paged media.\[28\]\[29\]

**Hanging punctuation and optical margins**
- Quotes, hyphens and bullets should hang outside the edge.\[30\]
- InDesign: Optical Margin Alignment. CSS: `hanging-punctuation` (Safari only).\[31\]\[32\]
- Typeset.js suggests: T/V/W/Y -0.07em; O/C -0.04em; A -0.03em; single quote -0.27em; double quote -0.46em.\[33\]

**Correct characters ("amateur detector")**
- Curly quotes, never straight. Butterick: "Use curly quotation marks, not straight ones." The apostrophe points down: ’90s.\[7\]
- Primes for feet and inches (′ ″).
- En dash for ranges (5–6 pm).\[27\] Em dash for breaks (closed up in US style, or a spaced en dash in UK style). Hyphen only for compounds.
- Minus sign (−), multiplication sign for dimensions (1080 × 1920), and a single-character ellipsis (…).\[27\]
- One space after sentences. Non-breaking spaces between numbers and units, after § and ¶, and in initials.\[19\]\[27\]
- **Small caps:** true smcp only. Butterick: if you lack real small caps, "don't use them at all."\[19\]
- **Figures:** oldstyle in classical running text; lining with caps and in UI; tabular for tables, prices, timers and animated counters (so they don't jitter); proportional in prose.
- **Ligatures:** keep standard ligatures (fi, fl) on; discretionary ligatures for display only; disable them when tracking out.
- Real fractions, superscripts, subscripts and ordinals, not scaled glyphs. Never fake diacritics, and check stacked caps (Á, Ő) against tight leading.
- **Emphasis:** italic in running text, bold for scanning. No faux bold or italic (`font-synthesis: none`). No underlines except links. Butterick: "All caps are fine for less than one line of text."\[7\]

## 6. Macro-typography & Layout

- **Grids.**
  - Column grids for web (4/8/12).
  - Modular grids for editorial and posters (Müller-Brockmann).
  - Baseline grids for print rhythm across columns.
  - Manuscript grids for books.
  - Gutters are often one line of leading or a multiple of it.
- **Vertical rhythm.** Derive spacing from the body line-height. Put more space above a heading than below, so it belongs to what follows. On the web, use 4/8 px spacing tokens rather than strict baseline locking.
- **Paragraphs.** Butterick: "Use first-line indents that are one to four times the point size of the text, or use 4–10 points of space between paragraphs," but not both.\[7\]\[19\]
- **Whitespace is active.** Generous margins signal focus and quality; crowding signals cheapness unless that is the concept.
- **Alignment.** Flush left by default. Centred only for short, formal or poster text; Butterick: "Use centered text sparingly."\[7\] Flush right for captions. Justified only with hyphenation.
- **Contrast tools:** size, weight, value/colour, case, style, width, typeface, space and position. Use one or two strong contrasts, not many weak ones.
- **Reading paths.** Posters and heroes are scanned in a Z-pattern; text-heavy pages in an F-pattern, so front-load headings and line starts. Vertical video is read centre-first.
- **Gestalt.**
  - Proximity groups a heading with its text.
  - Similarity means same style, same role.
  - Continuity comes from shared alignment axes.
  - Closure is what makes cropped letterforms readable.
  - Figure/ground covers counters and knockouts.
  - Common region covers cards and boxes.
- **Optical vs mathematical alignment.**
  - Round and pointed letters overshoot edges.
  - Nudge centred lines that carry trailing punctuation.
  - Optical centre sits slightly above mathematical centre.
  - Align to cap height and baseline, not bounding boxes; CSS `text-box: trim-both cap alphabetic` helps where supported.
- **Scale and drama.** Jumps of 3–10× body size, bleed-cropped letters, extreme weight contrast and tight leading create tension. Use one dominant element per view.

## 7. Expressive & Creative Typography

- **Type as image** covers calligrams, typographic portraits and letters made of objects.
- **Lettering vs type.** Lettering is drawn for one composition (logos, hero moments); type is a reusable system.
- **Kinetic and experimental type:** motion, distortion, layering, masking, texture, 3D extrusion, variable-axis "breathing", type on a path.
- **Movements (vocabulary):**
  - **Constructivism (Rodchenko, Lissitzky):** diagonals, red/black, photomontage.
  - **Bauhaus/New Typography (Tschichold, 1928):** asymmetry and functional sans. Tschichold later returned to classical symmetry, a lesson that rules serve context.
  - **Swiss/International Style (Müller-Brockmann, Ruder, Hofmann):** grids, neo-grotesques, flush-left rag, objectivity.
  - **Postmodern/New Wave/Emigre (Weingart, Greiman, VanderLans, Licko, Carson):** layering and deconstruction. Carson: "don't mistake legibility for communication."
  - **Contemporary:** brutalism and anti-design (default HTML, mono, raw grids), maximalism, neo-grotesk minimalism, variable-font animation, 3D/chrome and Y2K revivals, oversized editorial web type, kinetic social captions.
- **Rules for breaking rules:**
  1. Know which rule you're breaking and why it serves the concept.
  2. Break one or two rules decisively, not many timidly.
  3. Keep the functional layer legible: CTAs, essential information, captions.
  4. Contain expression to heroes, posters and title cards; keep body text conventional.
  5. Squint-test or user-test; if the message fails, the experiment failed.
  6. Never break accessibility minimums for text people must act on.

## 8. Colour & Contrast for Type

**WCAG 2.x**
- **1.4.3 (AA):** 4.5:1 for normal text, 3:1 for large text ("at least 18 point or 14 point bold", i.e. 24 px, or about 18.66 px at weight 700+).\[34\]\[35\]
- **1.4.6 (AAA):** 7:1, or 4.5:1 for large text.\[36\]
- **Exemptions:** logotypes and incidental text.\[37\]
- **Gradients and images.** WebAIM notes text over them must still pass, but WCAG gives no measurement method,\[37\] so test the worst-case region.
- **1.4.11:** 3:1 for UI boundaries.\[37\]
- **1.4.12:** content must survive line-height 1.5, paragraph spacing 2×, letter spacing 0.12em and word spacing 0.16em.\[38\]

**APCA (WCAG 3 draft; not normative)**
- **Lc 90:** preferred for body at 14 px/400 or larger.\[39\]
- **Lc 75:** minimum for body at 18 px/400 or larger.\[39\]
- **Lc 60:** other content text at 24 px/400 or 16 px/700.\[40\]
- **Lc 45:** large headlines. **Lc 30:** absolute floor.\[41\]
- **Polarity-aware**, with a suggested maximum of about Lc 90 for large text in dark mode.\[39\]\[41\]
- **Where it disagrees with WCAG:** white on #777777 is 4.48:1 (fails AA) but about Lc 76 (passes body). #B0B0B0 on #1E1E1E is 7.69:1 (passes AAA) but about Lc 58 (fails body).\[42\] Both pairs recomputed with the WCAG 2 formula and APCA 0.0.98G-4g: 4.48 / Lc −76.6 and 7.69 / Lc −57.7 (negative Lc means light text on dark).

**Type on images.** Use a scrim or gradient (e.g. 40–60% black), a solid or semi-opaque box or pill, a shadow or stroke, a frosted blur, or calm image regions.\[35\] Choose images with room for text.

**Dark mode and reversed text**
- Light-on-dark text looks bolder and glows (halation). Reduce weight slightly (400 → about 350) or, better, reduce **grade** (GRAD axis), which thins strokes without reflow.\[43\]\[44\]
- Adobe's example rebalances a reversed box with GRAD –92. GRAD is available in Roboto Flex, SF Pro and Google Sans Flex.\[45\]\[46\]
- Add slight tracking and leading, and avoid pure #FFF on #000 for long text.
- *Disagreement:* some blogs (e.g. FontFYI) advise increasing weight in dark mode.\[47\] Adobe and the majority view say reduce; increase only for thin faces that break up.

**Colour psychology (soft guidance only).** Red: urgency. Blue: trust. Green: growth. Black: luxury. Yellow: attention, but poor as text on white. Meaning is cultural, so never use colour as the only carrier of meaning.

## 9. Medium-Specific Considerations

### 9a. Web
- **Units.** Use rem for font size, em for tracking and component spacing, ch for measure. Never `user-scalable=no`. WCAG 1.4.4 requires 200% resize without loss.
- **Base size.** Body 16 px minimum, often 17–20 px for reading. Butterick: 15–25 px. Inputs at 16 px or more avoid iOS zoom.\[7\]\[48\]
- **OpenType in CSS.**
  - Prefer high-level properties: `font-variant-numeric`, `font-variant-caps`, `font-variant-ligatures`, `font-kerning`.
  - Use `font-feature-settings` only for features with no high-level property (ss01, cv11).
  - Use `font-variation-settings` only for custom axes (GRAD), because it doesn't inherit per axis.\[46\]\[49\] Use font-weight, font-stretch, font-style and font-optical-sizing for registered axes.
- **Wrapping.**
  - `text-wrap: balance` (Chrome 114+, Firefox 121+, Safari 17.5+) is capped to short blocks; sources cite 6 lines in Chromium and 10 in Firefox, and WebKit cites a lower Chromium cap.\[50\]\[51\]\[52\] Treat it as headings-only.
  - `text-wrap: pretty` is in Chromium 117+, where it mostly avoids short last lines, and in Safari 26, which does whole-paragraph optimisation. Firefox status is reported inconsistently.\[29\]\[50\]\[52\]\[53\]
  - `hyphens: auto` needs a correct `lang` attribute.
- **Loading.**
  - Self-host WOFF2, subset it (`unicode-range`, pyftsubset), and preload only the critical file.
  - `font-display: swap` gives FOUT; `optional` avoids shift; blocking gives FOIT, which you should avoid.
  - Use `size-adjust` and ascent/descent overrides on fallbacks to cut CLS. Prefer one variable file to 4–8 static files.
- **System stacks.** `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`; `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.
- **Dyslexia (BDA Dyslexia Style Guide).**
  - Body 12–14 pt, about 16–19 px.\[54\]
  - Letter spacing about 35% of average letter width; word spacing at least 3.5× that.\[55\]
  - Line spacing 1.5; headings at least 20% larger.\[55\]
  - Avoid italics, underlines and long all-caps passages. Left-align, on an off-white background.\[56\]\[57\]
  - Evidence for special "dyslexia fonts" is weak. In a study published in *Annals of Dyslexia* (Kuster et al., 2018), children with dyslexia (n = 170) "did not read text written in Dyslexie font faster or more accurately than in Arial font." Spacing matters more.
- **Accessibility.** Use real text and semantic headings. Respect `prefers-reduced-motion`, `prefers-contrast` and `prefers-color-scheme`.\[58\] Test at 200% zoom and with 1.4.12 spacing.

### 9b. Print
- **Units.** 1 pt = 1/72 in; 12 pt = 1 pica; 6 picas = 1 in. Size and leading are written "10/13".
- **Bleed.** 3 mm (EU) or 0.125 in (US). Keep text 3–5 mm or more inside the trim, and more at spines and gutters.
- **Black.** Small text in 100% K only. Rich black (e.g. C60 M40 Y40 K100) only for solids of about 5 mm or more, because misregistration fringes small type. Never use Registration black.\[59\]\[60\]\[61\] Check overprint preview.
- **Minimums.** Hairlines 0.25–0.5 pt (Prepressure: 0.5 pt / 0.15 mm for reverses). Body 9–12 pt (Butterick 10–12).\[7\] Fine print 6–7 pt in K100 on coated stock.\[62\]\[63\]
- **Reverse type.** Offset printers recommend at least 10 pt (12 pt on newsprint) for reversed body text. Blurb's minimums on rich black are 6 pt sans, 8 pt serif and 10 pt script. Prefer sans or low-contrast faces and semibold weights.\[60\]\[62\]\[64\]
- **Paper and ink gain.** Uncoated and news stocks spread ink, so thin serifs fill in. Choose sturdier faces and slightly larger sizes. Coated stock holds detail.
- **Folds.** Tri-fold, Z-fold, gatefold and roll fold; fold-in panels are 1–3 mm narrower. Keep text off folds.
  - Front cover: hook, headline, brand.
  - First inside panel or flap: key benefit.
  - Back: contact details and CTA.
- **Proofing.** PDF/X-1a or X-4 with embedded fonts, Preflight, and a physical proof at 100% on the target stock.

### 9c. Motion Graphics & Kinetic Typography
- **Reading time.**
  - UC Davis's video accessibility guide: leave text on screen "for at least as long as it takes to read through twice." SSW Rules agrees, assuming 200 wpm.\[65\]\[66\]
  - Practical floor (an industry heuristic): about 0.3–0.35 s per word + 0.5 s, minimum about 1.2 s, counted from when the text stops moving.\[67\]
  - For dialogue pace, use Netflix and BBC norms.
- **Principles.**
  - Anticipation: a small counter-move before entry.
  - Overshoot or follow-through: spring settle.
  - Squash and stretch: sparingly, on bold type only.
  - Staging: one message at a time.
  - Easing in and out.
  - Stagger: per character 20–50 ms, per word 60–120 ms, per line 100–200 ms.
  - Important text arrives first and holds longest.
- **Easing (Material 3).**
  - Standard `cubic-bezier(0.2, 0, 0, 1)`; decelerate `(0, 0, 0, 1)`; accelerate `(0.3, 0, 1, 1)`; emphasized decelerate `(0.05, 0.7, 0.1, 1)`; emphasized accelerate `(0.3, 0, 0.8, 0.15)`.\[68\]\[69\]
  - Durations: short 50–200 ms, medium 250–400 ms, long 450–600 ms, extra-long 700–1000 ms. Examples: selection controls 200 ms; FAB to sheet 400 ms; card to full screen 500 ms.\[69\]\[70\]
  - Enter with ease-out; exit with ease-in, faster than the entry.
- **Legibility in motion.** Fast-moving text is unreadable, so start the reading clock when it settles.\[67\]\[71\] Avoid thin weights and hairlines, and track slightly loose. Use tabular figures for counters. Avoid motion blur on text meant to be read. Put a scrim over busy footage.
- **Safe areas (16:9).** EBU R 95 (v1.1, 2017): "The action safe area is 3.5% and the graphics safe area is 5%, at the top, bottom and lateral parts of the image." At 1920 × 1080 that is 67 px / 38 lines for action and 96 px / 54 lines for graphics. R 95 also marks a 4:3 caption-safe area inset 16.25% from each side, for programmes that still feed 4:3 displays. Legacy SMPTE practice: 90% action and 80% title (5% and 10% insets).\[72\]\[73\] Use the stricter one if unsure.
- **Frame rates.** 24/25/30/50/60 fps. Kinetic text can strobe at 24 fps, so prefer 30 or 60. Time in frames (0.3 s = 9 frames at 30 fps); §15.5 has the conversion table and the stagger quantisation rule.
- **Tools.**
  - **GSAP** (VCR's clock for browser scenes): eases, `stagger` and SplitText on a paused, seekable timeline; see the `gsap` guide. CSS and WAAPI take the Material cubic-béziers above directly.
  - **After Effects:** text animators, range selectors, MOGRTs.
  - **Remotion (TypeScript):** `spring()` is "a physics-based animation primitive" (defaults mass 1, stiffness 100, damping 10; raise damping to about 200 to remove bounce; `durationInFrames` fixes the length). `interpolate()` with `Easing`, including `Easing.spring()`. `measureSpring()` gives settle time.\[74\]\[75\]\[76\]\[77\]
  - **Lottie** (AE via Bodymovin; convert text to shapes or embed fonts carefully).
  - **Rive** (state machines).
  - **CSS/WAAPI and GSAP SplitText.**
- **Accessibility.** WCAG 2.3.3 (AAA): "Motion animation triggered by interaction can be disabled, unless the animation is essential."\[78\]\[79\] 2.2.2: auto-playing motion over 5 s must be pausable. 2.3.1: use the conservative no-more-than-three-flashes default in `TYPO-FLASH`; see [the full threshold conditions](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html). Provide fade or static alternatives under `prefers-reduced-motion`.\[80\]

### 9d. TikTok / Reels / Shorts (9:16)
- **Canvas.** 1080 × 1920.\[81\]
- **Meta (official page exists; figures not re-verified, the page body could not be fetched).** Reels and Stories ads: leave at least 14% top (about 269 px), 35% bottom (about 672 px) and 6% each side (about 65 px) clear, which gives a safe box of about 950 × 979 px. The diagram also blocks a lower-right corner; with disclaimers, keep the bottom 40% clear.\[82\]\[83\]
- **TikTok.** No pixel margins in its help text; it offers ad templates and notes the safe area shrinks as captions get longer. Third-party measurements disagree: top 130–240 px, bottom 422–672 px, right 120–192 px (action rail), left 60–120 px.\[4\]\[84\]\[85\]\[86\]\[87\]
- **YouTube Shorts (one measurement):** 288 top, 672 bottom, 48 left, 192 right.\[85\]
- **Agent default.** A conservative composite of about 288 top, 672 bottom, 65 left and 192 right. Keep critical text within x 65–888 and y 288–1248, and treat the right column and lower third as hostile.
- **Caption styles.** Word-by-word "pop" for hooks, which tires viewers over long tutorials. Karaoke highlight on the active word. Phrase captions of 2–3 lines for explanation. Unverified BBC guidance quoted here allows three lines on vertical, up to 90% of frame width, placed a little higher but still in the lower third. Keep them clear of mouths and on-screen prices.\[88\]
- **Size.** Burned-in captions about 48–80 px and hooks 80–140 px on 1080 × 1920 (a practitioner heuristic). Verify on a phone at arm's length.
- **Contrast.** White or yellow text with a 4–8 px dark stroke and/or shadow, or a semi-opaque pill. DCMP Captioning Key: white, medium-weight sans with a drop or rim shadow, mixed case.\[88\]
- **Hook.** On screen within the first 1–2 s: 3–8 words, large, high-contrast and inside the safe box. Design for sound-off viewing.\[89\]
- **Don't double-caption.** Turn off platform auto-captions when captions are burned in. Proofread auto-captions; W3C says they don't meet accessibility needs unless confirmed accurate.\[88\]

### 9e. Brochureware / Marketing
- **Stack.**
  - Eyebrow: tracked caps.
  - Headline: benefit-led, 6–12 words, balanced.
  - Subhead: the "how", 1–2 lines.
  - Body: short paragraphs at 45–75 characters.
  - CTA: verb + outcome; at least 4.5:1 label contrast and 3:1 boundary.
- **Scannability.** Front-load keywords, put a subhead every 3–5 paragraphs, use bullets and bold lead-ins, and use lining tabular figures in pricing.
- **Editorial devices.** Pull quotes (larger, contrasting, hanging quotes). Drop caps aligned to the baseline of line 3 and the cap height. Captions beside images. Stat callouts (huge figure + small label). Testimonials.

### 9f. Other Media
- **Signage.**
  - Humanist sans with open apertures (Frutiger, Transport, Clearview, Tern), in mixed case.
  - A common rule of thumb is about 25–30 mm cap height per 10 m of viewing distance; it varies by standard, so test on site.
  - Use high luminance contrast and non-glare surfaces.
- **Posters.** Design for a 3-second read at distance: a dominant headline plus a second layer for close readers. Thumbnail-test at 10% size.
- **Social graphics.** 1080 × 1080, 1080 × 1350 or 1080 × 1920. Body at least about 36–40 px on a 1080 px width, one idea per slide, and test as a feed thumbnail.
- **Apple HIG.**
  - SF Pro; body 17 pt default, 11 pt minimum.\[18\] Use text styles and Dynamic Type.
  - Custom fonts scale via `UIFontMetrics` or `.font(.custom(_, size:, relativeTo:))`, with `@ScaledMetric` for spacing.\[90\]
  - Reflow layouts at accessibility sizes, e.g. switch HStack to VStack when `dynamicTypeSize.isAccessibilitySize`.\[91\]
- **Material 3.** Use roles (display/headline/title/body/label) and `sp` units.\[15\]\[92\]

## 10. Internationalisation

- **Expansion.** W3C's "Text size in translation" reproduces IBM averages: strings of 10 characters or fewer grow to 200–300%; 21–30 characters to 160–180%; over 70 characters to about 130%. German and Dutch often run about 35% longer.\[93\]\[94\]\[95\] Use flexible containers and pseudo-localisation (e.g. "[Çĥéçķôûţ!!!!!!]"). German compounds can't wrap at spaces, so use `hyphens: auto` with `lang="de"`.\[93\]\[96\]
- **Non-Latin scripts.**
  - Use families matched across scripts (Noto, IBM Plex Arabic/JP/KR, Source Han).
  - IBM's design language sets CJK, Thai, Devanagari and Arabic at 95% size with the same line height.\[11\] Balance visual size, not nominal size.
  - Taller scripts and Vietnamese stacked marks need more line height.
- **RTL.**
  - Use `dir="rtl"` and logical properties. Mirror layout and directional icons, but not logos or media controls.
  - Never letterspace Arabic, because it breaks joining. Use kashida only with proper fonts.
- **CJK.**
  - No word spaces; follow kinsoku line-breaking rules (`line-break: strict`; `word-break: keep-all` for Korean).
  - Body line-height 1.7–2.0.
  - No native italics; use weight, colour or `text-emphasis`.
  - `writing-mode: vertical-rl` for vertical text. Fonts are large: for reproducible renders, use a licensed local subset with the required glyphs and shaping data. Responsive applications may use intentional system-font fallbacks; test the resulting layouts on supported platforms.
- **Mixed script.** Match the Latin companion's stroke weight and x-height. List the Latin font first in the stack, then the CJK font, and check baselines.
- **Always declare `lang`.** It drives hyphenation, quote styles (« » in French, „ " in German), locl and screen readers.

## 11. The Analysis/Critique Process

1. **Brief fit.** What is it for, who is it for, and what should they feel or do? Does the voice match? Bringhurst: read the text first; typography should "reveal, not replace" the content.\[97\]
2. **Squint test.** Blur the work for about 5 seconds. Look for one dominant element, 2–3 levels and an even texture.
3. **Reading path.** Trace where the eye goes. Is it the intended order? Are there competing focal points?
4. **Consistency.** Count families, sizes, weights and colours; each should map to a role. Check alignment axes and spacing tokens.
5. **Micro pass at 200–400%.** Check kerning, quotes, dashes, figures, runts, rag, rivers, hyphen stacks and faux styles.
6. **Measure.** Characters per line, leading ratio, size at viewing distance, WCAG and APCA, CPS and hold times, print minimums.
7. **Medium test.** View on the device, at print size, or full-screen on a phone with the platform UI overlay.
8. **Expression.** Is the rule-breaking intentional and consistent, and is the functional layer intact?
9. **Feedback.** For each issue give the location, why it matters and a specific fix, ordered blocking → major → polish.

**Common amateur mistakes (lint list)**
- Faux bold or italic; stretched or squashed type instead of condensed or extended cuts.
- More than 2–3 typefaces, or two near-identical faces.
- Default leading on display text; centred long text; justified text without hyphenation; lines over 90 characters.
- Straight quotes, backwards apostrophes (‘90s), hyphens used as dashes, "..." instead of …, "x" for ×, double spaces.
- Untracked all caps; letterspaced lowercase or script.
- Gappy headline kerning (AV, To, LT); unbalanced wraps and runts.
- Low contrast: grey on grey, or busy images without a scrim. Thin weights reversed out or set over video.
- Fake small caps; wrong figures (proportional in counters); missing diacritics.
- Text in unsafe zones on social video; captions faster than 20 CPS; auto-captions not proofread.
- Rich-black small print type; reversed type under 8–10 pt; text near the trim or folds.
- Underlines for emphasis; bold + italic + caps at once; too many exclamation marks (Butterick: "In a document longer than three pages, one exclamation point is plenty").\[7\]
- Default or novelty fonts chosen without reason (Butterick warns against "goofy fonts" and treats Times New Roman/Arial defaults as signs of apathy).\[7\]\[98\]

**Frameworks to draw from:** Butterick's "Summary of key rules" and "Typography in ten minutes". Bringhurst's numbered rules (e.g. 2.1.2 "Choose a comfortable measure"), applied to the web by Richard Rutter at webtypography.net.\[22\]\[99\] WCAG 2.2 success criteria 1.4.3/4/6/8/11/12, 2.2.2, 2.3.1 and 2.3.3. The BDA Dyslexia Style Guide. The Netflix Timed Text Style Guide, BBC Subtitle Guidelines and DCMP Captioning Key. The Apple HIG and Material 3.

## 12. The Creation Process

1. **Brief and content.** Read all copy. Note the audience, medium, real sizes, viewing context (distance, motion, sound-off), brand, licences, languages and accessibility level.
2. **Voice.** Write 3–5 adjectives and 2–3 anti-adjectives.
3. **Mood board.** Gather references by voice, genre and movement, and note which conventions to use or subvert.
4. **Type exploration.** Shortlist 3–6 faces per role. Set real copy (headline, paragraph, caption, numbers, diacritics) at real size. Check licence, character set, features and axes.
5. **Concepts.** Make 2–3 directions (safe, bold, wildcard), as thumbnails first and then at size.
6. **System.** Set the scale, roles, line-heights, tracking per size, grid or safe zones, colour tokens and motion grammar (easing, stagger, holds).
7. **Compose.** Set the hierarchy, kern display type optically, balance wraps and fix the micro-typography.
8. **Test in the medium.** Viewport screenshots, a 100% print proof, or phone playback with the safe-zone overlay. Check 200% zoom, dark mode and reduced motion.
9. **Critique and iterate.** Run the checklist, fix blocking issues first, then review with fresh eyes.
10. **Production.** Subset and preload fonts, embed them in PDF/X, validate caption timing, export the spec and tokens, and record licences.

## 13. Authoritative Sources and Canon

- **Bringhurst, *The Elements of Typographic Style* (1992; 4th ed. 2013).**\[100\]
  - Typography honours content.
  - Measure of 45–75 characters, 66 ideal, 40–50 for multi-column.\[27\]
  - One space between sentences; avoid consecutive hyphens; ragged is better than loose justification.\[27\]
  - Proportion from musical and organic ratios, and faces chosen for their history.\[23\]
- **Lupton, *Thinking with Type*.** Organised as Letter, Text, Grid. Covers anatomy, text as a field, the grid as a structure for freedom, and the reader as participant. Bridges classical and experimental practice.
- **Tschichold.** *Die neue Typographie* (1928) argued for asymmetric functional sans. His later Penguin Composition Rules returned to classical detail.
- **Müller-Brockmann, *Grid Systems*.** Modular grids derived from type size and leading; objective, consistent proportion.
- **Spiekermann, *Stop Stealing Sheep*.** Type has a voice, like clothing. Spacing is everything, and legibility depends on context.
- **Butterick, *Practical Typography*.**
  - Body text first.
  - 10–12 pt print, 15–25 px web, 120–145% leading, 45–90 characters.\[19\]
  - Curly quotes, caps tracked 5–12%, sparing emphasis, professional fonts.\[19\]
- **Hochuli, *Detail in Typography*.** Letter, word and line spacing decide texture and readability; word space relates to letter fit and counters.
- **Tim Brown and Jason Santa Maria.** Brown's *Flexible Typesetting* covers fluid, proportional setting for unknown devices, plus his modular-scale tool. Santa Maria's *On Web Typography* covers evaluating and pairing faces for screens.
- **Richard Rutter, *Web Typography* (and webtypography.net).** Bringhurst translated into CSS: measure, vertical rhythm, OpenType and responsive setting.
- **Google Fonts Knowledge.** Modules on choosing type, variable fonts, optical size, grade, fluid type and licensing.
- **Apple HIG and Material 3.** Platform scales, roles, minimums, accessibility scaling and motion tokens.
- **Motion references.** Netflix TTSG, BBC Subtitle Guidelines, DCMP, EBU R 95, the Remotion docs, Material motion, and Thomas & Johnston's 12 principles (*The Illusion of Life*) applied to type.

## 14. Encoding This for an AI Agent (VCR integration)

**Where it lands in VCR**
- PRD §13 names a `typography` workflow skill. Layer 5 owns captions, platform safe areas and text overflow; Layer 6 owns review.
- The split in this document maps onto the PRD's review rules. Numeric rules become automatic checks (L6-02). Judgement — tone, hierarchy, expression — becomes findings for review (L6-03). Self-review never counts as approval.
- Neither layer has started, so the checks below are a specification, not shipped behaviour.

**What to generate from this file**
- **Workflow skill** (`skills/typography/`, about 1.5k tokens): the creation process (§12), the critique process (§11), the rules for breaking rules (§7) and the lint list, trimmed to the task's medium. It cites rule IDs instead of copying numbers.
- **Rules data file:** [rules.json](rules.json), one entry per rule below plus the safe-zone presets and caption profiles, so numbers change in one place when platform UIs do. `pnpm validate` fails when this table drifts from it.
- **Critique agent (optional):** a reviewer that hasn't seen how the work was made. Blocked on two things: confirming Codex plugins can carry agents (ADR 0003 requires both hosts), and the review layer existing to receive its findings.
- Every generated file names the rule IDs it uses and the date of this file it was generated from.

**Prompt architecture**
- **Role:** senior typographer and art director; reader first, then brief, then expression.
- **Modes:** `ANALYSE` (severity-ranked findings) and `CREATE` (brief → system → composition → verification).
- **Required outputs:** a type spec as tokens, a rationale tied to the voice adjectives, a verification report with measured numbers and rule IDs, and the frames or stills that were actually inspected.

**Outside tools worth assessing** (none is catalogued in VCR; route through `ingest` before use)
- **SmartyPants** (Gruber): straight quotes to curly, `--`/`---` to dashes, `...` to ….\[103\] Ports exist in JS (retext-smartypants) and Swift.
- **proselint:** Butterick-derived checks (curly_quotes, ellipsis, ©/™, sentence spacing, multiplication).\[104\]
- **Typeset.js:** hanging punctuation, optical margins, small caps, soft hyphens.\[33\]
- **fontTools** (ttx, pyftsubset): read GSUB/GPOS, fvar, metrics and the cmap.
- **Font Bakery:** "a font quality assurance tool," with universal, opentype and googlefonts profiles and JSON output. A reported migration to the Rust-based Fontspector is unverified.\[105\]\[106\]\[107\]
- **Wakamai Fondue:** "What can my font do?" Lists features, axes and languages, and generates CSS.\[108\]
- **axe-core `color-contrast`:** 4.5:1/3:1. It skips text over background images and rounds down (4.4988 fails).\[109\]\[110\]\[111\] It suits web pages, not rendered frames; for frames, inspect delivery legibility separately from source-colour calculations (TYPO-CONTRAST). `apca-w3` gives Lc scores.\[123\]

**Check rules**

These are proposed checks, not implemented validation. Select a profile by medium, language/script, text role, display size and client specification before applying them. A style guide is authoritative only within its own scope. Defaults produce review warnings, not automatic failures; contractual or accessibility gates require a declared target and suitable evidence. Do not autofix copy, quotations, code, identifiers or locale-specific punctuation without preserving their meaning. Record exceptions and their rationale. Thresholds live in [rules.json](rules.json), which is canonical; the table below is generated from it by `vcr catalog build`, so edit the data, not the table. Use [rule-template.md](rule-template.md) when extracting a rule.

<!-- typography-rules:start -->
| ID | Check | Threshold | Tier | Applies to |
|---|---|---|---|---|
| `TYPO-MEASURE` | Average characters per rendered line, in text blocks of 3+ lines | 45–75; warn outside 40–90 | heuristic | Latin prose blocks; not captions, CJK or display titles |
| `TYPO-LEADING` | line-height ÷ font-size | body warn under 1.2 or over 1.8; display warn over 1.3 | heuristic | Latin body/display text; check script-specific leading (§10) |
| `TYPO-SIZE` | Smallest text at delivered size | web body ≥16 px; iOS body ≥17 pt; choose smaller labels by medium and viewing conditions; 1080 × 1920 captions ≥48 px; 1080-wide social graphic body ≥36 px | heuristic / platform default (iOS, verify) | scoped web/iOS body and fixed-size social/video defaults |
| `TYPO-CONTRAST` | Source foreground/background colours plus displayed size; visual delivery review separately | WCAG AA target: ≥4.5:1, ≥3:1 for large text at ≥24 CSS px or ≥18.66 CSS px bold; APCA supplementary, size/weight-dependent (§8) | standard (WCAG, scoped) / heuristic (APCA) | declared web accessibility target; adapted readability target for other media, not a conformance claim |
| `TYPO-CHARS` | Suspect punctuation and spacing in prose | flag for language-aware review; preserve code, identifiers, literal quotations and intentional notation | style preference | prose in the selected locale; never blanket replacement |
| `TYPO-FONTS` | Family count, synthesised styles, manifest | ≤3 families; no faux bold/italic; every font listed with source, version and licence | heuristic | all |
| `TYPO-FEATURES` | Numbers that change or align use `tnum`; small caps only if `smcp` exists; justified text has `lang` and hyphenation | — | style/implementation guidance | fonts and scripts supporting the feature; hyphenation only where appropriate to the language |
| `TYPO-RUNT` | Last line of a heading or title | not a single word and not under ~15% of the measure | heuristic | all |
| `TYPO-RESILIENCE` | 200% zoom and WCAG 1.4.12 overrides | no clipping or overflow | standard | web pages only, not fixed-size frames |
| `TYPO-SAFE` | Text boxes against safe-area rectangles | 16:9: EBU graphics safe 5%; 9:16: composite 288 top, 672 bottom, 65 left, 192 right; Meta 14/35/6 | standard (EBU) / heuristic (composite) / platform (Meta, unverified) | video |
| `TYPO-CAPTION-CPS` | Caption reading speed | ≤20 cps adult, ≤17 children | platform | Netflix English (USA) profile; other languages/deliveries need their own profile |
| `TYPO-CAPTION-LINES` | Characters per line and line count | ≤42 per line; ≤2 lines landscape; ≤3 vertical | standard (Netflix) / heuristic (BBC vertical, unverified) | selected caption delivery profile; vertical allowance unverified |
| `TYPO-CAPTION-DURATION` | Event duration and gap | 5/6 s to 7 s; gap ≥2 frames | standard (duration) / heuristic (gap; no longer on Netflix's current pages) | selected caption delivery profile |
| `TYPO-HOLD` | Hold after the text settles | ≥ max(1.2 s, 0.3 s × words + 0.5 s) | heuristic | motion |
| `TYPO-FLASH` | Flashes per second | conservative default: ≤3 in any one-second window; full WCAG 2.3.1 also permits flashes below general/red-flash thresholds | standard | motion |
| `TYPO-PRINT` | Print preflight | K100 for text under ~18 pt; reverses ≥8–10 pt; hairlines ≥0.25–0.5 pt; 3–5 mm from trim; fonts embedded | heuristic (printer specs vary) | print handoff |
| `TYPO-VISUAL` | Render at target sizes and inspect: phone-size frame, thumbnail, print at 100%; blur test | process, not a number | — | all |
<!-- typography-rules:end -->

§15 adds `TYPO-FONT-*`, `TYPO-CHROMA`, `TYPO-BITRATE`, `TYPO-RANGE`, `TYPO-RASTER-SCALE`, `TYPO-STAGGER-QUANT` and `TYPO-STILL-FORMAT`.

**How the checks can measure in VCR**
- **DOM scenes** (GSAP, Anime.js, WAAPI): after `window.__scene` seeks to a frame, read text boxes with `Range.getClientRects()` and computed styles. Run at marker frames or every frame where text changes.
- **Canvas and WebGL scenes** (canvas-2d, p5, PixiJS, three-js) have no DOM text boxes. The scene must report its own text bounds, or the check falls back to visual review.
- **Stills** (resvg, ImageMagick, sharp): measure from source where the tool reports metrics, otherwise from the rendered pixels.
- **Contrast:** calculate from source foreground and effective background colours, including transparency and the background beneath the glyphs. Do not treat antialiased glyph-edge pixels as the nominal foreground. Use CSS/display size, not raw export pixels, for large-text classification. For complex backgrounds, retain source layers or a text-free background render; if measurement is unreliable, report that limitation. Separately inspect source and decoded delivery frames for visual legibility (TYPO-CHROMA, TYPO-RANGE). W3C explains source-colour measurement and image sizing in [Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## 15. Rendering and Delivery in VCR

What the general rules above don't cover: how VCR's own tools set text, and what happens to text between capture and the viewer. Tool facts marked "guide" come from VCR's evidence-backed guides; everything else is unverified in VCR until a fixture proves it.

### 15.1 Font determinism (every tool)
- **`TYPO-FONT-SHIP`:** for reproducible renders, bundle font files and their licences only where redistribution is permitted. Otherwise record the exact font/version and an authorised acquisition or local provisioning step; do not copy restricted fonts into a shared project. Avoid implicit system-font fallback, which differs by machine and OS version. Record family, version, file hash, source and licence in the font manifest (§3). The `canvas2d-capture` fixture keeps `fonts/OFL.txt` (guide).
- **`TYPO-FONT-READY`:** in browser scenes, load fonts from local files (`FontFace` or `@font-face`), `await document.fonts.ready`, confirm with `document.fonts.check()`, and only then expose `window.__scene`. Build SplitText and any text measurement after that point. Symptoms of skipping it: a fallback face in early frames, or different line breaks in capture than in a browser window (guides: start/determinism, gsap, canvas-2d).\[116\]
- **Cross-machine differences.** Text rasterisation (antialiasing, hinting, Chromium version) is the likeliest source of pixel differences between machines. Compare renders made on the same machine and browser build, or compare with a tolerance. heuristic.
- **Outlines for portability.** When text no longer needs editing, converting it to paths removes the font dependency (`inkscape --export-text-to-path` for SVG; guide). It also removes the text from accessibility and search, so keep the source text alongside.

### 15.2 How each tool sets text
- **Browser DOM** (GSAP, Anime.js and WAAPI scenes): the full CSS toolset — `font-feature-settings`, `font-variant-numeric`, `font-variation-settings`, `text-wrap: balance | pretty`, `hyphens` with `lang`, `letter-spacing`. This is the strongest typesetter VCR has, so set text in DOM even when the rest of the scene is canvas or WebGL, layering the DOM over the canvas. The capture path is validated; individual text features are not.
- **canvas-2d:** `fillText`/`strokeText` with no wrapping, so break lines yourself with `measureText`. Chromium exposes `letterSpacing`, `wordSpacing`, `fontKerning`, `fontStretch`, `fontVariantCaps` and `textRendering`, but there is no general OpenType feature control (no `tnum`); use a font whose default figures are tabular, or set numbers in DOM.\[124\] Loaded-font text is proven (guide).
- **SVG + resvg:** SVG 1.1 text does not wrap; break lines with `<tspan>`. resvg resolves fonts from the system unless given `--use-font-file` or `--use-fonts-dir`, with `--skip-system-fonts` for repeatable output; `resvg --list-fonts` shows what resolves (guide). OpenType feature support in resvg is unverified.\[120\]
- **ImageMagick:** needs an explicit `-font` on macOS (guide). `caption:` wraps to the `-size` width and `label:` does not; spacing is set with `-kerning`, `-interword-spacing` and `-interline-spacing`; the `pango:` coder accepts markup when ImageMagick is built with Pango.\[119\] Text options are not covered by its evidence.
- **sharp:** the `text` input renders Pango markup, with `font`, `fontfile`, `width`, `align`, `justify`, `spacing`, `wrap`, `dpi` and `rgba` options. The alternative is compositing an SVG rasterised by librsvg, which takes fonts from fontconfig.\[118\] Its evidence covers compositing, not text.
- **p5-js (WEBGL):** `loadFont` with a file shipped in the project; system fonts do not load in WEBGL mode (guide).
- **three-js:** three routes, none evidenced in VCR.
  - DOM overlay above the canvas: best typography, flat only.
  - troika-three-text: SDF text from TTF/WOFF, sharp at any scale and depth. It lays out asynchronously, so wait for `text.sync()`'s callback before exposing the scene.\[117\]
  - `TextGeometry`: extruded geometry from a typeface JSON via `FontLoader`; heavy, for hero 3D lettering only.
- **Blender:** text objects with a font loaded from file (`bpy.data.fonts.load`); convert to mesh for bevels and extrusion. A missing font silently falls back to the built-in Bfont. Not evidenced.
- **Konva, PixiJS, Two.js:** check each tool's guide before relying on text; their evidence fixtures use no fonts. Konva's `Text` has wrapping, `lineHeight`, `letterSpacing` and `align`; PixiJS has canvas `Text`, `BitmapText` and `HTMLText`. The font-loading rule in 15.1 applies to all of them.

### 15.3 Compression and colour (video delivery)
- **`TYPO-CHROMA`:** `yuv420p`, VCR's web delivery format (ffmpeg guide), stores colour at half resolution in both directions. Saturated text on a saturated background of similar brightness (red on blue, magenta on green) smears, because its edge exists only in the colour channels. Carry legibility in luminance contrast, which is also what WCAG and APCA measure. Avoid thin saturated text. Master text-heavy pieces in 4:4:4 (ProRes 4444, or `-pix_fmt yuv444p` where the target accepts it) and inspect a decoded delivery frame, not the PNG. standard (subsampling) / heuristic (mitigation).
- **`TYPO-BITRATE`:** platforms re-encode uploads at lower bitrates and may downscale them. Encoders drop fine detail first: hairlines, small text, thin strokes, and text moving over noise or busy footage. Prefer medium-to-bold weights, avoid strokes under about 2 px at 1080 wide, and put text over calm or scrimmed regions. To check, encode a test at a low quality (for example CRF 28–30) and review it. heuristic.
- **`TYPO-RANGE`:** convert RGB captures with an explicit BT.709 matrix and matching colour tags.\[121\]\[122\] Untagged or mis-tagged output (a BT.601 matrix with BT.709 tags, or full range read as limited) shifts brand colours and lifts or crushes text contrast. A correct full-to-limited conversion maps RGB 255 to code 235, so white text is legal; the risk is the tagging, not the white. Not covered by the ffmpeg-ffprobe evidence.
- **Alpha deliverables.** Text on a transparent background gets greyscale, not subpixel, antialiasing, and premultiplied edges can halo when composited downstream. Check text edges composited over both light and dark plates. heuristic.
- **Viewing size.** A 1080 × 1920 frame is seen at roughly a third of its pixel size on a phone. The sizes in §9d already assume that; judge them on a device, not at 100% on a monitor.

### 15.4 Text in motion (browser capture)
- **`TYPO-RASTER-SCALE`:** Chromium rasterises composited layers (`will-change: transform`, animated transforms) at one scale and then scales the bitmap, so text that scales up can go soft. VCR's determinism guidance pins animated elements with `will-change`, so inspect text at its largest-scale frame. Fixes: animate from large to small, or drop `will-change` on text that scales and recheck determinism. General Chromium behaviour; not tested in VCR. heuristic.
- **Slow drifts shimmer** as glyphs land on fractional pixels. Move fast enough to read as motion, round slow drifts to whole pixels, or accept it knowingly. heuristic.
- **Splitting text** into per-character elements (SplitText `chars`) drops pair kerning and ligatures between the pieces. Compare a split display headline against the unsplit setting, and split by word when the motion allows. heuristic.
- **Variable-font animation** of `wght` or `wdth` reflows text, so line breaks can jump mid-animation. Fix the box width, or animate `GRAD`, which doesn't reflow (§8).
- **No motion blur** on text meant to be read (§9c).

### 15.5 Timing in frames
Convert minimums with `frames = ceil(seconds × fps)`; never round a minimum down. Count holds from the frame the text settles: for a GSAP tween that is the tween's end, for a spring it is the settle time, not the nominal duration.

| Value | 24 fps | 25 fps | 30 fps | 60 fps |
|---|---|---|---|---|
| One frame | 41.7 ms | 40 ms | 33.3 ms | 16.7 ms |
| Caption minimum, 5/6 s | 20 | 21 | 25 | 50 |
| Caption maximum, 7 s | 168 | 175 | 210 | 420 |
| Caption gap, 2 frames | 83 ms | 80 ms | 67 ms | 33 ms |
| Hold floor, 1.2 s | 29 | 30 | 36 | 72 |
| 0.3 s per word | 8 | 8 | 9 | 18 |
| Short motion, 200 ms | 5 | 5 | 6 | 12 |
| Medium motion, 400 ms | 10 | 10 | 12 | 24 |

- **`TYPO-STAGGER-QUANT`:** onsets are sampled at frame boundaries. Sub-frame staggers can put several glyph onsets in one frame; non-integer frame intervals can alternate their sampled spacing. The 20–50 ms range in §9c spans different behaviours: 50 ms exceeds one frame at 24 fps, while 20 ms does not. Use whole-frame intervals when uniform onset spacing matters, or keep continuous timing and inspect the sampled result. This is a sampling heuristic, not a prohibition on sub-frame timing.

### 15.6 Stills delivery
- **`TYPO-STILL-FORMAT`:** deliver text-heavy stills as PNG or lossless WebP. JPEG rings around glyph edges and platforms recompress it again. If JPEG is required, use quality 90 or more with 4:4:4 chroma (ImageMagick `-sampling-factor 4:4:4`; sharp `jpeg({ chromaSubsampling: '4:4:4' })`). heuristic.
- **Render at the delivered pixel size** (resvg `-w`/`-h` or `--zoom`); never upscale a raster that contains text.
- **Print is a handoff, not a VCR output.** VCR's tools produce RGB; there is no validated CMYK or PDF/X path, so §9b guides what to hand a print designer, not what VCR renders.
- **Thumbnails.** Social graphics are first seen as feed thumbnails; check at 25–33% size (§9f).

---

## Master Checklist — ANALYSIS

Apply only the selected profile (§14); unchecked or inapplicable items are not automatically failures. Thresholds below are references to the canonical rule table, not additional requirements.

**Brief & voice**
- [ ] Tone matches the voice adjectives; genre conventions used or subverted deliberately
- [ ] Typeface connotations appropriate; licence covers this medium

**Hierarchy & system**
- [ ] Squint test: one dominant element, 2–3 levels, intended reading order
- [ ] ≤2–3 families; every size/weight/colour maps to a role; consistent spacing and axes
- [ ] Levels differ by clear scale steps

**Readability**
- [ ] Measure and leading suit script, role and medium (`TYPO-MEASURE`, `TYPO-LEADING`)
- [ ] Size verified at actual viewing conditions (`TYPO-SIZE`; print handoff §9b)
- [ ] Scoped contrast target checked from source colours and displayed size; decoded output inspected (`TYPO-CONTRAST`)
- [ ] Dark mode: grade/weight reduced; no pure white on pure black for long text

**Micro-typography**
- [ ] Punctuation reviewed for the locale and content type; literal content preserved (`TYPO-CHARS`)
- [ ] Display kerned optically; caps +5–12%; large display slightly negative; no letterspaced lowercase/script
- [ ] No faux bold/italic/small caps or stretched type; tabular figures for data and counters
- [ ] No headline runts; balanced wraps; no rivers; ≤2 consecutive hyphens
- [ ] Hanging punctuation and optical alignment on display text

**Medium**
- [ ] Web: rem, 200% zoom, 1.4.12 spacing, font-display, subsetting, `lang`
- [ ] Print: K100 small text, rich black only ≥5 mm, reverse ≥8–10 pt, hairlines ≥0.25–0.5 pt, 3 mm bleed, 3–5 mm from trim/folds, fonts embedded
- [ ] Motion: readable twice after settling; consistent easing; safe areas; reduced-motion option
- [ ] Vertical video: current platform overlay checked; provisional margins labelled; selected caption profile checked and proofread (`TYPO-SAFE`, `TYPO-CAPTION-*`)
- [ ] UI: text styles with Dynamic Type/sp; reflow at accessibility sizes
- [ ] i18n: tolerates 30% to 200–300% expansion; scripts balanced; RTL mirrored

**Capture & delivery (VCR, §15)**
- [ ] Fonts bundled where permitted or authorised provisioning documented, manifest complete; scene exposed only after fonts load
- [ ] Text set in the tool best able to set it (DOM over canvas/WebGL where typography matters)
- [ ] Legibility carried by luminance contrast; decoded `yuv420p` frame inspected, not only the PNG
- [ ] Survives a low-bitrate test encode; no hairlines or thin saturated text over busy footage
- [ ] BT.709 matrix and tags explicit; contrast spot-checked on a decoded frame
- [ ] Scaled text sharp at its largest frame; sampled stagger spacing inspected; holds counted from settle
- [ ] Stills: PNG or lossless WebP (or JPEG ≥90 with 4:4:4); rendered at delivered size; checked as a thumbnail

**Expression**
- [ ] Every broken rule is intentional, consistent and serves the concept; functional layer legible

## Condensed Process — CREATION

1. **Read and define.** Copy, audience, medium, real sizes, viewing conditions, languages, accessibility target, licences.
2. **Voice.** 3–5 adjectives and 2–3 anti-adjectives; reference movements.
3. **Mood board.** Conventions to use or subvert.
4. **Choose type.** Real copy at real size; check features, character set, optical size or axes, licence.
5. **Build the system.** Scale (1.125–1.25 UI; 1.333–1.618 editorial), roles, line-heights, tracking, grid or safe zones, verified colour tokens, motion tokens.
6. **Compose 2–3 directions.** One dominant element each, with deliberate whitespace.
7. **Refine.** Optical kerning and alignment, balanced wraps, correct characters and figures, hanging punctuation.
8. **Verify programmatically.** Measure, leading, contrast, safe zones, CPS and duration, font hygiene, preflight.
9. **Verify visually.** Device screenshots, 100% print proof, phone playback with overlay, squint and zoom tests, dark mode, reduced motion.
10. **Iterate.** Blocking issues, then major, then polish.
11. **Ship.** Tokens and spec, licensed font assets or provisioning instructions, checked captions where required, and a licence manifest. Print/PDF/X requires an external verified handoff (§15.6); VCR has no validated PDF/X path.

## Caveats

- **TikTok safe-zone pixels are not officially published**, and third-party figures diverge (bottom margins of 422–672 px).\[4\]\[84\]\[86\] UIs change, so re-verify against current templates.
- **APCA is not yet a W3C standard;** WCAG 2.x remains the legal benchmark.\[40\]
- **On-screen hold formulas** (0.3 s per word, "read twice") are heuristics. Subtitle standards are better documented but were designed for dialogue.
- **`text-wrap` support and line caps** were reported inconsistently; check MDN or caniuse.\[50\]\[51\]
- **Print minimums vary by press and stock;** follow your printer's spec.
- **Some figures come from vendor blogs:** platform margins, caption pixel sizes and the signage rule of thumb. These are flagged as heuristics.
- **Canon summaries are interpretations, and professionals disagree.** Butterick's 90-character limit vs Bringhurst's 75; serif vs sans on screen (largely moot on high-DPI); whether to reduce or increase weight in dark mode.
- **Many citations below are secondary** (blogs, vendor pages, aggregators). Treat a number as checked only if it is in the ledger; replace a secondary source when the primary is reached.

### Verification ledger (2026-11-06)

| Claim | Result | Checked against |
|---|---|---|
| Netflix: 20 cps adult / 17 children, 42 characters per line, two lines maximum | confirmed | English (USA) Timed Text Style Guide \[112\] |
| Netflix: event duration 5/6 s minimum, 7 s maximum | confirmed | Timed Text Style Guide: General Requirements \[114\] |
| Netflix: 2-frame minimum gap | **not found**; the General Requirements changelog (2020-07-24) says the frame gap section was removed. Kept as a heuristic | \[114\] |
| Netflix: subtitles centred, top or bottom, moved to avoid on-screen text | confirmed | \[114\] |
| Butterick: 10–12 pt / 15–25 px; 120–145% line spacing; 45–90 characters; caps +5–12%; bold or italic sparingly and not together; caps under one line; centred text sparingly; one exclamation point per three pages; indent or paragraph space, not both; kerning on; no fake small caps | confirmed; wording corrected for line length ("two and three alphabets", not "lowercase") | practicaltypography.com pages \[6\]\[7\]\[19\]\[21\]\[24\] |
| EBU R 95: action safe 3.5%, graphics safe 5%; 4:3 caption safe 16.25% | confirmed (v1.1, June 2017) | R 95 PDF \[72\] |
| WCAG/APCA example pairs (#FFF on #777; #B0B0B0 on #1E1E1E) | confirmed by computation: 4.48 / Lc −76.6; 7.69 / Lc −57.7 | WCAG 2 formula; APCA 0.0.98G-4g \[123\] |
| BBC: 160–180 wpm, 0.3 s per word, three lines on vertical | **unverified**; bbc.co.uk blocks automated fetches | — |
| Meta: 14% top, 35% bottom, 6% sides | **unverified**; the official page exists but its body could not be fetched | \[115\] |
| §15 tool facts marked "guide" | from VCR's evidence-backed guides in `skills/` | repository |
| §15 tool facts not marked "guide" (sharp `text`, ImageMagick text options, troika, Blender, canvas-2d properties) | **unverified in VCR**; from documentation knowledge | \[117\]–\[120\]\[124\] |

## Sources

1. [ATypI de-adopts Vox-ATypI typeface classification system - ATypI](https://atypi.org/2021/04/27/atypi-de-adopted-the-vox-atypi-typeface-classification-system/)
2. [Recognize and play with typographic classification - Graphéine branding, brand strategy and brand design](https://www.grapheine.com/en/graphic-design-en/typographic-classification-learn-typography)
3. [APCA Contrast vs WCAG 2: The Complete Guide (2026) · CSS DNA](https://cssdna.com/blog/wcag-vs-apca-contrast/)
4. [TikTok Safe Zone: Checker & Overlay PNG](https://kreatli.com/safe-zone-checker/tiktok-safe-zone-checker)
5. [Meta Ads Safe Zones: The Complete Guide to Perfect Ad Placement](https://adsuploader.com/blog/meta-ads-safe-zones)
6. [Point size](https://practicaltypography.com/point-size.html)
7. [Summary of key rules](https://practicaltypography.com/summary-of-key-rules.html)
8. [Thibaudeau classification](https://en.wikipedia.org/wiki/Thibaudeau_classification)
9. [X-height](https://en.wikipedia.org/wiki/X-height)
10. [Variable Fonts and Dynamic Typography: The Performance Win Nobody’s Talking About](https://robertcelt95.medium.com/variable-fonts-and-dynamic-typography-the-performance-win-nobodys-talking-about-320f4901d23f)
11. [Type scale](https://www.ibm.com/design/language/typography/type-scale)
12. [How Google Designs Their UI: A Material Design Breakdown (2026)](https://superdesign.dev/blog/material-design-system)
13. [material-3-skill/skills/material-3/references/typography-and-shape.md at master · hamen/material-3-skill · GitHub](https://github.com/hamen/material-3-skill/blob/master/skills/material-3/references/typography-and-shape.md)
14. [Material 3 (You) Typography Cheatsheet](https://medium.com/@vosarat1995/material-3-you-typography-cheatsheet-ffc58c540181)
15. [Material Design 3 in Compose | Jetpack Compose | Android Developers](https://developer.android.com/develop/ui/compose/designsystems/material3)
16. [material-design-skill/references/typography.md at master · yhongm/material-design-skill · GitHub](https://github.com/yhongm/material-design-skill/blob/master/references/typography.md)
17. [Apple Human Interface Typography Guide with a Figma-focused perspective · GitHub](https://gist.github.com/eonist/b9c180a67980c6e18a5184f19bff68fa)
18. [Human Interface Guidelines. iOS App Design Rules in Numbers](https://appto.store/glossary/human-interface-guidelines)
19. Butterick, Practical Typography: [Kerning](https://practicaltypography.com/kerning.html), [Letterspacing](https://practicaltypography.com/letterspacing.html), [Small caps](https://practicaltypography.com/small-caps.html), [Bold or italic](https://practicaltypography.com/bold-or-italic.html) (replaces a secondary summary)
20. [Typography Hierarchy. (The secret language of size)](https://medium.com/@pearlyport9/typography-hierarchy-bbc21582c037)
21. [Line spacing](https://practicaltypography.com/line-spacing.html)
22. [Choose a comfortable measure](http://webtypography.net/2.1.2)
23. [The Elements of Typographic Style - Mitchell Kember](https://mitchellkember.com/books/bringhurst)
24. [Line length](https://practicaltypography.com/line-length.html)
25. [Mastering Line Length, Leading & Measure](https://loremforge.com/learn/line-length-leading-and-measure)
26. [The Element Selectors of Typographic Style](https://medium.com/@carolynmcneillie/the-element-selectors-of-typographic-style-2ef34ff16320)
27. [The Elements of Typographic Style by Robert Bringhurst (Book Summary) - OptimWise](https://optimwise.com/review-the-elements-of-typographic-style-by-robert-bringhurst/)
28. [When to use CSS text-wrap: balance vs. text-wrap: pretty](https://daily.dev/posts/when-to-use-css-text-wrap-balance-vs-text-wrap-pretty-ipjr740y7)
29. [text-wrap: balance and pretty - Dev Guides](https://camoa.github.io/dev-guides/css/modern-css/text-wrap/)
30. [Typeface Formatting](https://design.morningstar.com/foundations/formatting?tab=Advanced)
31. [TypeTalk: Hung Punctuation & Optical Margin Alignment](https://creativepro.com/typetalk-hung-punctuation-optical-margin-alignment/)
32. [CSS hanging-punctuation Property - CSS Portal](https://www.cssportal.com/css-properties/hanging-punctuation.php)
33. [typeset - npm](https://www.npmjs.com/package/typeset)
34. [Understanding Success Criterion 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
35. [The 2025 TestParty Guide to WCAG 1.4.3](https://testparty.ai/blog/wcag-1-4-3-contrast-minimum-2025-guide)
36. [Elements must meet enhanced color contrast ratio thresholds](https://dequeuniversity.com/rules/axe/html/4.7/color-contrast-enhanced)
37. [WebAIM: Contrast and Color Accessibility - Understanding WCAG 2 Contrast and Color Requirements](https://webaim.org/articles/contrast/)
38. [Dyslexia-Friendly Style Guide: Fonts, Spacing, Color and Plain Language](https://inchyapp.com/dyslexia-friendly-style-guide/)
39. [The Easy Intro to the APCA Contrast Method](https://git.apcacontrast.com/documentation/APCAeasyIntro.html)
40. [How the Washington Post design system made me learn about Perceptual Contrast (APCA) - Steve Frenzel](https://www.stevefrenzel.dev/posts/learning-about-perceptual-contrast/)
41. [APCA Contrast Checker — Free Lc Contrast Calculator (WCAG 3 Candidate)](https://focusflowapp.in/apca-contrast-checker)
42. [APCA Contrast vs WCAG 2: The 2026 Guide for Designers](https://66colorful.com/blog/apca-contrast/)
43. [Dark mode and variable fonts](https://css-tricks.com/dark-mode-and-variable-fonts/)
44. [Using CSS to fix the irradiation illusion · November 29, 2025](https://nerdy.dev/adjust-perceived-typepace-weight-for-dark-mode-without-layout-shift)
45. [Keeping type consistent in changing conditions](https://adobe.design/ideas/keeping-type-consistent-in-changing-conditions)
46. [Best Variable Fonts on Google Fonts in 2026 — FontFYI](https://fontfyi.com/blog/best-variable-fonts/)
47. [Dark Mode Typography — Contrast and Readability Guide — FontFYI](https://fontfyi.com/blog/dark-mode-typography/)
48. [skillbox/skills/typography/references/readability.md at main · AntJanus/skillbox · GitHub](https://github.com/AntJanus/skillbox/blob/main/skills/typography/references/readability.md)
49. [Inspecting your variable fonts - The Publishing Project](https://publishing-project.rivendellweb.net/inspecting-your-variable-fonts/)
50. [Better typography with text-wrap pretty](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/)
51. [Nicer Text Wrapping with CSS text-wrap / Coder's Block](https://codersblock.com/blog/nicer-text-wrapping-with-css-text-wrap/)
52. [text-wrap: balance and pretty - Better Line Breaks in CSS - Carl Victor Fontanos](https://carlofontanos.com/tutorials/css-text-wrap-balance)
53. [CSS text-wrap Property: pretty and balance Explained](https://savvy.co.il/en/blog/css/css-text-wrap-pretty-balance/)
54. [British Dyslexia Association Style Guide.pdf](https://www2.worc.ac.uk/disabilityanddyslexia/documents/British%20Dyslexia%20Association%20Style%20Guide.pdf)
55. [British Dyslexia Association Style Guide](https://iped-editors.org/wp-content/uploads/2021/05/British-Dyslexia-Association-Style-Guide-2018.pdf)
56. [British Dyslexia Association. Unit 8 Bracknell Beeches, Old Bracknell Lane,](https://www.thedyslexia-spldtrust.org.uk/media/downloads/69-bda-style-guide-april14.pdf)
57. [Dyslexia-Friendly Text Formatting: Spacing, Size, Color](https://www.michaeldardol.com/opendyslexic-font-installer/guides/dyslexia-friendly-text-formatting/)
58. [WCAG 2.3.3: Animation from Interactions (Level AAA) - Silktide](https://silktide.com/accessibility-guide/the-wcag-standard/2-3/seizures-and-physical-reactions/2-3-3-animation-from-interactions/)
59. [CMYK, Rich Black and Ink Limits for Print](https://www.printpeppermint.com/guides/file-setup/cmyk-rich-black-and-ink-limits)
60. [CMYK black values - Help Center - Blurb](https://support.blurb.com/hc/en-us/articles/207792816-CMYK-black-values)
61. [Rich black](https://www.prepressure.com/design/basics/rich-black)
62. [What is reversed type or knockout text and how should it be used](https://www.prepressure.com/design/basics/reversed-type)
63. [Smallest Font Size You Can Print Legibly](https://www.4over4.com/guide/what-is-the-smallest-font-size-you-can-print)
64. [Totally Type Lessons](https://totallytype.com/reverse.php)
65. [Do you give enough time to read texts in your videos?](https://www.ssw.com.au/rules/post-production-do-you-give-enough-time-to-read-texts-in-your-videos)
66. [Text on Screen - Brand Communications Guide - UC Davis](https://communicationsguide.ucdavis.edu/departments/video/best-practices/accessibility/text-on-screen)
67. [How Long Should Text Stay on Screen in Video? · MaestroCut](https://maestrocut.com/guides/on-screen-text-reading-time)
68. [material-3-skill/skills/material-3/SKILL.md at master · hamen/material-3-skill · GitHub](https://github.com/hamen/material-3-skill/blob/master/skills/material-3/SKILL.md)
69. [Easing and duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)
70. [GitHub - beyondbday69/material3-design-tokens · GitHub](https://github.com/beyondbday69/material3-design-tokens)
71. [Title Cards: Animate the Entrance, Then Hold Still to Be Read](https://framecall.com/blog/title-card)
72. [R 95 SAFE AREAS FOR 16:9 TELEVISION PRODUCTION VERSION 1.1](https://tech.ebu.ch/docs/r/r095.pdf)
73. [Video Safe Area Calculator — Action-Safe & Title-Safe Zones](https://top10k.com/tool/safe-area-calculator)
74. [spring()](https://www.remotion.dev/docs/spring)
75. [Easing](https://www.remotion.dev/docs/easing)
76. [remotion/packages/core/src/spring/measure-spring.ts at main · remotion-dev/remotion · GitHub](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/spring/measure-spring.ts)
77. [Remotion Spring Animation: The Complete Guide](https://rendercomp.com/blog/remotion-spring-animation-guide/)
78. [WCAG 2.3.3 Animation from Interactions - How to Meet It](https://www.equalweb.com/wcag/criteria/2-3-3/)
79. [Understanding Success Criterion 2.3.3: Animation from Interactions - AEL Data](https://aeldata.com/understanding-success-criterion-2-3-3-animation-from-interactions/)
80. [WCAG 2.3.3 — Animation from Interactions](https://jeikin.com/wcag/2-3-3-animation-from-interactions)
81. [TikTok Safe Zone Template (2026): Keep Text Clear](https://www.bevyl.ai/tools/social-media-sizes/tiktok-safe-zone)
82. [Instagram Reels Safe Zone Checker and Template](https://camclo3d.com/tools/instagram-reels-safe-zone)
83. [Instagram Reels Safe Zone, Size and Length Specs](https://www.sirency.com/blog/instagram-reels-safe-zone)
84. [TikTok Video Safe Zone - Free Preview Tool (No Sign-Up)](https://www.aicarousels.com/free-tools/tiktok-safe-zone-checker)
85. [TikTok Safe Zone: Free Checker, Overlay & Template (2026)](https://www.revid.ai/tiktok-safe-zone)
86. [TikTok Safe Zone and Ad Specs: Where Text and CTAs Go](https://yosefk.me/blog/tiktok-safe-zone/)
87. [\[2025 Guide\] The Ultimate TikTok Safe Zone Strategy for Ads](https://getkoro.app/blog/tiktok-safe-zone-guide)
88. [Video Captions Best Practices: Timing, Lines and Placement](https://onecraft.app/blog/video-captions-best-practices/)
89. [How Much On-Screen Text Should a Reel Have? — Blossom](https://blossai.com/blog/on-screen-text-how-much)
90. [The details of UI typography - WWDC20 - Videos - Apple Developer](https://developer.apple.com/videos/play/wwdc2020/10175/)
91. [iOS Design Guidelines](https://craftwork.design/skills/ios-design-guidelines)
92. [App Typography Guide: iOS vs Android Font Best Practices (2026)](https://gendesigns.ai/blog/app-typography-guide-ios-android)
93. [Pseudo-Localization: Catch UI Issues Before Translation](https://www.globalizationpartners.com/2026/08/26/pseudo-localization-before-translation/)
94. [Text Expansion in Translation](https://dtp-services.de/resources/text-expansion-in-translation)
95. [How much does German translation cost? It depends on 4 things](https://ai-glot.com/blog/how-much-does-german-translation-cost)
96. [Handling Extreme Text Expansion: UI Patterns for German and Finnish Compound Terms in Tight Spaces](https://www.jobpreparena.com/blog/handling-extreme-text-expansion-ui-patterns-for-german-and-finnish-compound-terms-in-tight-spaces)
97. [The Elements of Typographic Style - Robert Bringhurst Flashcards](https://quizlet.com/61033849/the-elements-of-typographic-style-robert-bringhurst-flash-cards/)
98. [Practical Typography: You’re Doing it Wrong](https://asociologist.com/2013/11/04/practical-typography-youre-doing-it-wrong/)
99. [The Elements of Typographic Style](https://en.wikipedia.org/wiki/The_Elements_of_Typographic_Style)
100. [The Elements of Typographic Style review, Books](https://guptadeepak.com/books/the-elements-of-typographic-style/)
101. [GitHub - conorluddy/xclaude-plugin: iOS development ClaudeCode plugin for mindful token and context usage. Contains modular MCPs that group various Xcode/IDB tools based on your current workflow. \[deprecated\] · GitHub](https://github.com/conorluddy/xclaude-plugin)
102. [GitHub - conorluddy/ios-simulator-skill: An IOS Simulator Skill for Agents. Use it to optimise their ability to build, run and interact with your apps, and to proxy xcodebuild to save token waste. Works with Claude, Codex, etc · GitHub](https://github.com/conorluddy/ios-simulator-skill)
103. [Daring Fireball Projects: SmartyPants](https://daringfireball.net/projects/smartypants/)
104. [proselint/proselint/checks/typography/symbols.py at main · amperser/proselint · GitHub](https://github.com/amperser/proselint/blob/main/proselint/checks/typography/symbols.py)
105. [fontbakery/docs/source/user/USAGE.md at main · fonttools/fontbakery · GitHub](https://github.com/fonttools/fontbakery/blob/main/docs/source/user/USAGE.md)
106. [GitHub - fonttools/fontbakery: 🧁 A font quality assurance tool for everyone · GitHub](https://github.com/fonttools/fontbakery)
107. [What’s happening with FontBakery? Is Fontspector the future? — TypeDrawers](https://typedrawers.com/discussion/5444/what-s-happening-with-fontbakery-is-fontspector-the-future)
108. [Wakamai Fondue](https://www.usetools.design/tools/wakamai-fondue)
109. [Elements must meet minimum color contrast ratio thresholds](https://dequeuniversity.com/rules/axe/4.7/color-contrast)
110. [Discuss color contrast rounding to align with other tools · Issue #494 · dequelabs/axe-core · GitHub](https://github.com/dequelabs/axe-core/issues/494)
111. [Lighthouse - Lighthouse](https://googlechrome-lighthouse.mintlify.app/)
112. [English (USA) Timed Text Style Guide — Netflix Partner Help Center](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide) (replaces a secondary summary)
113. [Subtitle reading speed and line length, explained](https://freesubtitleconverter.com/blog/subtitle-reading-speed/)
114. [Timed Text Style Guide: General Requirements — Netflix Partner Help Center](https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements)
115. [About text overlays and the safe zone for ads in Stories and Reels — Meta Business Help Center](https://www.facebook.com/business/help/980593475366490)
116. [FontFaceSet: ready property — MDN](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/ready)
117. [troika-three-text](https://protectwise.github.io/troika/troika-three-text/)
118. [sharp: Constructor (text input)](https://sharp.pixelplumbing.com/api-constructor)
119. [ImageMagick Examples: Text to Image Handling](https://imagemagick.org/Usage/text/)
120. [resvg](https://github.com/linebender/resvg)
121. [ITU-R BT.709: Parameter values for the HDTV standards](https://www.itu.int/rec/R-REC-BT.709)
122. [FFmpeg wiki: colorspace](https://trac.ffmpeg.org/wiki/colorspace)
123. [apca-w3: APCA reference implementation](https://github.com/Myndex/apca-w3)
124. [CanvasRenderingContext2D: letterSpacing property — MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/letterSpacing)
