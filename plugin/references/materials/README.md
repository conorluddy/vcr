# Materials reference

The advisory `materials` workflow now ships in `skills/materials/SKILL.md`. No additional checks or calibrated gates are implied; earlier reference-only descriptions below refer to measurement maturity.

This is the materials, shading and surface appearance knowledge base (`MAT-*`), produced from [the research brief](../research-prompts/materials.md) on 2026-11-06. It covers:
- physically based materials and plausible values;
- glTF 2.0 extensions, OpenPBR and MaterialX, and how Blender's Principled BSDF and the three.js materials map onto each other;
- common product materials and textures with their colour spaces;
- stylised and toon shading, imperfection, and materials in motion.

It is reference material, not an implemented check. It is about 12k tokens, so read one section (`vcr refs section materials <§>`) or one rule (`vcr rules info MAT-…`). Its IDs are already named.

Many of its checks run on **scene data** rather than frames, which makes them cheap and deterministic. Examples are albedo inside plausible ranges, texture colour spaces, the normal-map convention, ORM packing and glTF extension support.

| Task | Read |
| --- | --- |
| Research inputs and cross-pillar handoffs | §14 |
| PBR: metallic-roughness, energy conservation, plausible values | §1 |
| glTF extensions, OpenPBR, MaterialX, Principled BSDF and three.js mapping | §2 |
| Product materials: plastics, metals, glass, fabric, screens and more | §3 |
| Textures: maps, ORM packing, colour space per map, normal conventions, density | §4 |
| Stylised shading: toon, matcap, clay, iridescent, hatching | §5 |
| Brand colour on a surface | §6 |
| Imperfection: roughness variation, bevels, wear | §7 |
| Materials in motion: specular crawl, moiré, mipmaps, animated shaders | §8 |
| Performance | §9 |
| Measure | §10 |
| Critique or create | §13–14, §17 |
| Check a claim | §18 (caveats), §19 (verification ledger) |

## Open decisions before building `rules.json`, checks or a skill

1. **Settled: rule owners** ([shared conventions](../README.md)).
   - **Dropped:** `MAT-DETERMINISTIC-SHADER` (shared determinism check, #146), `MAT-LOOP-CLOSURE` (`MOTION-RHY-004`), and `MAT-COLOR-MANAGEMENT-OUTPUT` and `MAT-TONEMAP-BRAND` (lighting owns renderer output and tone mapping).
   - **Also dropped:** `MAT-BRAND-DELTAE` (`LIGHT-BRAND-DELTAE`) and `MAT-EMISSIVE-CLIP` (`LIGHT-CLIP-HIGHLIGHTS`).
   - **Kept here:** materials owns texture colour spaces (`MAT-TEXTURE-COLORSPACE`), surface highlights in motion (`MAT-SPECULAR-CRAWL`) and texel density. `MAT-MOIRE` cites `FX-MOIRE-RESAMPLE` for the pixel-pitch threshold.
2. **The first checks need no rendering.** `MAT-ALBEDO-*-RANGE`, `-METALLIC-BINARY`, `-TEXTURE-COLORSPACE`, `-NORMAL-CONVENTION`, `-ORM-PACKING`, `-EXTENSION-*` and `-ALPHA-VS-TRANSMISSION` read glTF, Blender or three.js scene data. That makes them the cheapest material checks to build: a validator over exported `.glb` files fits the delivery-check pattern (#144).
3. **The physical scope tag.** `MAT-PHYSICAL-SCOPE` tags each material `pbr`, `stylised` or `unlit`, so plausibility rules skip stylised work. **Settled (#143):** it lives in glTF material `extras.vcr.scope`, so the `.glb` validator reads it without rendering (see [the scene contract](../../skills/start/references/scene-contract.md)).
4. **Values from the brief.** `MAT-SERIES-CONSISTENCY` (the same named material keeps the same parameters across episodes) and `MAT-IMPERFECTION-BUDGET` (how clean the brief wants it) read brief values; these remain workspace notes until typed schema support is designed.
5. **Provenance in one place.** `MAT-LICENCE-PROVENANCE` belongs in one asset-manifest rule, shared with `LIGHT-HDRI-LICENCE` and `SOUND-LICENSE-RECORD` (see the lighting README).
6. **Uncalibrated heuristics.** These stay advisory until calibrated: the roughness floor, the roughness variation, texel density bands, the outline width coefficient of variation and the specular crawl limit.
