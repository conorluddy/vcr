# Image treatment reference

The advisory `image-treatment` workflow now ships in `skills/image-treatment/SKILL.md`. No additional checks or calibrated gates are implied; earlier reference-only descriptions below refer to measurement maturity.

This is the image treatment, blending and compositing knowledge base (`FX-*`), produced from [the research brief](../research-prompts/fx.md) on 2026-11-06. It covers the layer techniques that give stills and motion a crafted, graphic look:
- blend modes, masks and colour treatments;
- print-process looks (halftone, risograph, dithering);
- textures and stylised effects;
- above all, how each behaves in motion and survives delivery.

It is reference material, not an implemented check. It is about 17k tokens, so read one section (`vcr refs section fx <§>`) or one rule (`vcr rules info FX-…`). Its IDs are already named.

The [W3C *Compositing and Blending Level 1* draft](https://www.w3.org/TR/compositing-1/) defines a common set of blend modes and compositing operators. It does not define every mode offered by every application; matching names alone do not establish equivalent output. Colour space and grouping matter. Motion introduces further failure modes:
- thresholds that boil;
- screens that crawl;
- unseeded grain;
- grain and halftone lost to the platform re-encode.

| Task | Read |
| --- | --- |
| Research inputs and cross-pillar handoffs | §7, §15 |
| The compositing model: blend formulas, Porter-Duff, alpha, isolation, how each tool maps | §1 |
| Blending in sRGB against linear light | §2 |
| Masks, mattes and knockout type | §3 |
| Threshold, duotone, gradient maps, curves, LUTs | §4 |
| Halftone, risograph, letterpress, dithering | §5 |
| Paper, grain and procedural textures | §6 |
| Glow, chromatic aberration, displacement, glitch, collage and the rest | §7 |
| **Effects in motion**: boil, crawl, seeds, animated parameters | §8 |
| Surviving delivery; legibility; capture cost | §9–11 |
| Measure | §12, §18 |
| Critique or create | §14–15, §20 |
| Check a claim | §21 (caveats), §22 (verification ledger) |

## Open decisions before building `rules.json`, checks or a skill

1. **Settled: rule owners** ([shared conventions](../README.md)). FX keeps the craft of treatments. These rules are dropped, and FX cites the owner:
   - `FX-DETERMINISM`: the shared determinism check (#146). FX keeps `FX-SEED-DECLARED` and `FX-NO-WALLCLOCK` as authoring rules.
   - `FX-LOOP-SEAM`: `MOTION-RHY-004`, which is the picture seam check whatever made the pixels.
   - `FX-FLASH-SAFE`: `A11Y-FLASH-*`.
   - `FX-TEXT-CONTRAST` and `FX-KNOCKOUT-LEGIBLE`: `TYPO-CONTRAST`, measured over the text's lifetime on treated frames.
   - `FX-BANDING`: `DELIVERY-BANDING`.
   - `FX-CHROMA-SUBSAMPLE`: `DELIVERY-RED-CHROMA` and `DELIVERY-CHROMA-SUBSAMPLING`.
   - `FX-ALPHA-MASTER`: `DELIVERY-MASTER-ALPHA`. FX keeps `FX-PREMULT-EDGES`.

   FX owns pattern moiré against pixel and block pitch (`FX-MOIRE-RESAMPLE`), and `MAT-MOIRE` cites it. `FX-TEXTURE-SURVIVAL` and `FX-GRAIN-SCALE` stay here and measure with delivery's simulated re-encode.
2. **Scene declarations.** Several rules need the scene to declare intent: the blend space (`FX-BLEND-SPACE-DECLARED`), whether each texture or screen is locked to the frame, the object or time (`FX-SCREEN-SPACE-DECLARED`), and boil steps (`FX-BOIL-STEPPED`). **Settled (#143):** the scene declares them in the `fx` block of [the scene contract](../../skills/start/references/scene-contract.md). Series-wide values, such as the blend space for a whole series, go in the brief.
3. **Tool recipes move to toolkit guides.** The knowledge base gives CSS, SVG, canvas, ImageMagick, sharp, FFmpeg and Blender recipes as worked examples. When an FX skill is distilled, they go to the matching guides with the rule IDs they satisfy (ADR 0006). Tool gaps are facts about tools, so they become notes in tool records, not FX rules. One example: libvips and sharp do not implement the non-separable modes (`FX-NONSEP-TOOL`).
4. **Capture cost is shared with #58.** `FX-RENDER-COST`, `FX-CACHE-STATIC` and `FX-BACKDROP-FILTER-BUDGET` need measured per-effect costs in headless Chromium. That is the effect cost table in #58.
5. **Uncalibrated heuristics.** Most thresholds here are heuristic and stay advisory until calibrated: the flicker limit, the misregistration range, the grain feature size, the texture energy retained after re-encode, and the moiré distance from pixel pitch.
