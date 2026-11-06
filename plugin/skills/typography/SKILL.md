---
name: typography
description: Set or review text in a VCR video or still — titles, hooks, captions, labels, lower thirds, social graphics. Use when choosing type, sizing and placing text, timing text holds or checking a render's text before capture or delivery. Not for choosing a toolkit (use start) or for a tool's commands (use that toolkit's guide).
---

# Typography

A workflow over VCR's typography knowledge base (KB). This skill holds the process; the KB holds every number. Cite rule IDs (`TYPO-…`) and KB sections; never copy a threshold into code, comments or a report from memory.

## Where the knowledge lives

- Routing table: [references/typography/README.md](../../references/typography/README.md), under the plugin root (two directories above this SKILL.md). Read it first.
- Knowledge base: [typography-knowledge-base.md](../../references/typography/typography-knowledge-base.md). Read one section at a time, found by its `§` heading. Never load the whole file.
- Rule definitions: the check table and "How the checks can measure in VCR" in §14, plus §15 for rendering and delivery.
- Recording a rule or finding: [rule-template.md](../../references/typography/rule-template.md).

Rules are scoped proposals, not gates. A rule applies only when its "Applies to" column matches the profile below. Platform figures marked unverified stay unverified.

## 1. Profile first

Before choosing a face or a size, write down:

- **Medium:** 16:9 video, 9:16 social, still or social graphic, captions, print handoff.
- **Language and script:** Latin rules (measure, leading) do not transfer; read §10 for anything else.
- **Text role:** hook, title, lower third, caption, label, body, counter.
- **Viewing size:** the delivered pixel size and how it is seen (phone at arm's length, TV, feed thumbnail).
- **Delivery spec:** platform, frame rate, pixel format, any client or accessibility target. No declared target means findings are advisory.

Then read only the rows that match:

| Medium | KB sections | Rule IDs |
| --- | --- | --- |
| 16:9 video | §9c, §15.3–15.5 | `TYPO-SAFE` (EBU), `TYPO-SIZE`, `TYPO-HOLD`, `TYPO-FLASH`, `TYPO-CHROMA`, `TYPO-BITRATE` |
| 9:16 social | §9d, §15.3–15.5 | `TYPO-SAFE` (9:16 composite), `TYPO-SIZE`, `TYPO-HOLD`, `TYPO-BITRATE` |
| Still or social graphic | §9e–9f, §15.6 | `TYPO-SIZE`, `TYPO-CONTRAST`, `TYPO-RUNT`, `TYPO-STILL-FORMAT`, `TYPO-VISUAL` |
| Captions | §9c, §9d, §15.5 | `TYPO-CAPTION-CPS`, `TYPO-CAPTION-LINES`, `TYPO-CAPTION-DURATION`, `TYPO-SAFE` |
| Print handoff | §9b, §15.6 | `TYPO-PRINT` (VCR has no CMYK path; this is guidance for a print designer) |

`TYPO-FONTS`, `TYPO-FONT-SHIP`, `TYPO-FONT-READY` and `TYPO-VISUAL` apply to every medium.

## 2. Make

A condensed §12; read §12 itself for the full steps.

1. **Brief.** Read all the copy. Note audience, viewing context (sound-off, distance, motion), brand, licences and languages.
2. **Voice.** Three to five adjectives and two or three anti-adjectives. Every type choice is justified against them.
3. **Faces.** Shortlist per role (§3–4) and set the real copy at the real delivered size. Check licence, character set, figures and features. Keep within `TYPO-FONTS`.
4. **System.** Scale and roles, line-height and tracking per size, safe zones for the medium, colour tokens, motion grammar (easing, stagger, holds; §9c).
5. **Compose.** Hierarchy, optical kerning on display type, balanced wraps, no runts (`TYPO-RUNT`). Expressive type follows §7's rules for breaking rules.

**Fonts are deterministic or the render is not** (§15.1):

- `TYPO-FONT-SHIP`: font files and licences travel with the project where redistribution is allowed; otherwise record the exact font, version and how to obtain it. No implicit system fallback. Keep a font manifest.
- `TYPO-FONT-READY`: in browser scenes, load fonts from local files, wait for `document.fonts.ready`, confirm with `document.fonts.check()`, and only then expose `window.__scene`. Split or measure text after that point.

**How the chosen tool sets text** is in §15.2: DOM is the strongest typesetter VCR has, canvas-2d and SVG do not wrap, resvg and ImageMagick need explicit fonts, three-js has three routes. Read the entry for your tool, then the tool's own guide for commands.

**Text in motion** (§15.4): watch for `TYPO-RASTER-SCALE`, shimmer on slow drifts, lost kerning when text is split per character, and reflow when animating variable-font width or weight.

## 3. Check before capture

No automated typography check exists in VCR yet. Every check below is a measurement you make and report yourself, following §14 "How the checks can measure in VCR":

- **DOM scenes** (GSAP, Anime.js, WAAPI): seek `window.__scene` to the frame, then read text boxes with `Range.getClientRects()` and computed styles. Sample at markers, or wherever text enters, settles, changes or leaves.
- **Canvas and WebGL scenes** (canvas-2d, p5, PixiJS, three-js): there are no DOM boxes. The scene must report its own text bounds; if it does not, the check falls back to visual review and the report says so.
- **Stills** (resvg, ImageMagick, sharp): measure from source where the tool reports metrics, otherwise from the rendered pixels.

Then check, for the rules your profile selected:

- **Safe areas** (`TYPO-SAFE`): every text box inside the safe rectangle for the medium, at every sampled frame, including mid-animation overshoot.
- **Overflow:** no text box wider than its container or clipped by the frame.
- **Captions:** reading speed, characters per line, line count, event duration and gaps under the selected caption profile (`TYPO-CAPTION-*`).
- **Holds** (`TYPO-HOLD`): counted in frames from the frame the text settles, converted as §15.5 says (never round a minimum down). Stagger spacing against `TYPO-STAGGER-QUANT`.
- **Contrast** (`TYPO-CONTRAST`): from source colours, as §14 describes, not from antialiased edge pixels.
- **Decoded frame** (§15.3): encode, decode and inspect a delivery frame, not the PNG. Look for `TYPO-CHROMA` smear and `TYPO-BITRATE` loss of thin strokes; check `TYPO-RANGE` tagging.
- **At viewing size** (`TYPO-VISUAL`): look at the frame at phone or thumbnail size, not 100% on a monitor.

## 4. Report

One line per finding:

`TYPO-ID · measured value vs the KB threshold (cite the section) · frame (t or frame number) or still · profile · outcome`

- **Outcome** is one of pass, finding, not applicable or unable to assess (from the rule template). Use "unable to assess" when the measurement is unreliable, for example a canvas scene with no reported bounds, and say why.
- Separate content, design choice, motion timing and placement when recording a finding.
- List the frames and stills you actually inspected.
- Your own inspection is evidence, not approval. The human approves.
- Never auto-fix copy: quotations, names, code, identifiers and locale-specific punctuation keep their literal content. Propose the change; do not make it silently.
