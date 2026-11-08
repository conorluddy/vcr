# Adaptation reference

The advisory `adaptation` workflow now ships in `skills/adaptation/SKILL.md`. No additional checks or calibrated gates are implied; earlier reference-only descriptions below refer to measurement maturity.

This is the adaptation, versioning and localisation knowledge base (`ADAPT-*`), produced from [the research brief](../research-prompts/adaptation.md) on 2026-11-06. It covers how one code-first master becomes many deliverables across aspect ratio, duration, locale, audience and other variant axes, and how an agent verifies the whole version set. It is reference material, not an implemented check. It is about 23k tokens, so read only the section the task needs in [the knowledge base](adaptation-knowledge-base.md). Its IDs are already named.

Routine versions can use new parameters and repeated checks. A change of audience, meaning or composition can require an authored re-edit or sibling master (§1.1). Design reusable masters as systems:
- named regions with anchors and priorities;
- copy pulled from locale tables;
- beat markers that versions re-time to.

| Task | Read |
| --- | --- |
| Research inputs and cross-pillar handoffs | §6, §13 |
| Design a master that adapts | §1 |
| Reframe between 9:16, 1:1, 4:5 and 16:9; crop or recompose | §2 |
| Cutdowns from 60 s to 6 s; re-timing beats; music edits | §3 |
| Localise on-screen text: expansion, line breaking, RTL, CJK, fonts, `Intl` | §4 |
| Localise audio and timing: voice-over, captions, SFX | §5 |
| Cultural and regulatory adaptation (guidance) | §6 |
| Version matrices, naming, sampled QC | §7 |
| The scene contract for versions: `params`, `regions(t)`, `mandatory`, `manifest()` | §8 |
| Check a version set | §9–10 |
| Review or create a version set | §12–13, §17 |
| Check a claim | §18 (caveats), §19 (verification ledger) |

## Open decisions before building `rules.json`, checks or the contract additions

1. **Scene contract additions (§8.1).** The KB proposes extending `window.__scene` with:
   - `params`: a read-only echo of the version record, covering aspect, size, fps, duration target, locale, direction, copy table, variant, platform, audio mode and seed;
   - `regions(t)`: rendered geometry with role, anchor, priority and `required`;
   - named `markers` (`{ t, id, role, priority }`);
   - `mandatory`;
   - `manifest()`.

   This is the largest change any pillar has asked of the contract. It also covers what the art and motion pillars wanted from `data-vcr-role`. Two decisions:
   - `regions(t)` could generalise `textBounds()`, since text is just a region with `role: "text"`. Should it replace `textBounds()` or sit beside it?
   - Named markers break the current plain array of seconds. Lint would need to accept both.

   **Settled (#143)** in [the scene contract](../../skills/start/references/scene-contract.md): `regions(t)` generalises `textBounds()` and sits beside it; lint accepts named and plain markers; `params` echoes at least `width`, `height`, `fps` and `seed`. `manifest()` is replaced by the render manifest, and `mandatory` by required regions plus the brief.
2. **Settled: checks across the version set reuse the owning pillar's check** ([shared conventions](../README.md)). `ADAPT-*` owns running the owner's check on every cell of the matrix, not a second threshold:

   | Across-set check | Owner |
   | --- | --- |
   | `ADAPT-SAFE-ALL-ASPECTS` | `TYPO-SAFE` |
   | `ADAPT-TEXT-FIT-LOCALE` | `vcr lint` overflow |
   | `ADAPT-FONT-COVERAGE` | `TYPO-FONTS` |
   | `ADAPT-CAPTION-ASPECT` | `TYPO-CAPTION-*` |
   | `ADAPT-CAPTION-RETIME` | `A11Y-CAPTION-SYNC` and `TYPO-CAPTION-*` |
   | `ADAPT-MANDATORY-PRESENT` | `BRIEF-MANDATORY-PASS` |
   | `ADAPT-SFX-SYNC` | `SOUND-SYNC-*` |
   | `ADAPT-MUSIC-EDIT` | `SOUND-*` |
   | `ADAPT-SERIES-CONSISTENCY` | `BRIEF-*` |

   `ADAPT-BEAT-RETIME` keeps "re-time beats, never time-scale uniformly", and cuts on markers stay `PACE-BEAT-06`.
3. **Settled: duplicates.**
   - `ADAPT-DETERMINISM` becomes the shared determinism check, which picks up the GPU tolerance (SSIM ≥ 0.999) and the Chromium version pin for `Intl`.
   - `ADAPT-DURATION-FRAMES` is dropped. A/V lengths agreeing is `DELIVERY-DURATION-MATCH`.
   - `ADAPT-TRACE-MASTER` and `ADAPT-VERSION-ID` add fields to the one manifest that `DELIVERY-MANIFEST` owns.
   - `ADAPT-DURATION-WINDOW` keeps the ad-format windows (bumper, non-skippable, TopView), and `DELIVERY-DURATION-PLATFORM` keeps the upload limits.
4. **Market profiles, not separate rules.** `ADAPT-SUPER-HOLD-UK` and `ADAPT-SUPER-HEIGHT-UK` are Clearcast rules for UK TV. They read better as a `uk-clearcast` market profile on `TYPO-HOLD` and `TYPO-SIZE`, the way `netflix-en-us` is a caption profile, than as `ADAPT-*` rules. The brief then selects the profile per market.
5. **What `ADAPT-*` owns outright:**
   - the matrix: `ADAPT-MATRIX-COMPLETE` and `-SAMPLE-QC`;
   - reframing: `ADAPT-FOCAL-IN-FRAME`, `-CROP-PATH-STABLE`, `-RECOMPOSE-TRIGGER` and `-HIERARCHY-PRESERVED`;
   - localisation: `ADAPT-NO-BAKED-TEXT`, `-PSEUDO-*`, `-RTL-MIRROR`, `-LINEBREAK-LOCALE`, `-GRAPHEME-ANIMATION`, `-LOCALE-FORMAT` and `-PLATFORM-TEXT-LENGTH`;
   - voice-over: `ADAPT-VO-FIT`, `-VO-OVERRUN` and `-LIPSYNC`;
   - markets: `ADAPT-DISCLOSURE-*`, `-CLAIMS-MARKET`, `ADAPT-CULTURE-REVIEW` and `-TOPVIEW-OPENING`.

   `ADAPT-CLAIMS-MARKET` and `-DISCLOSURE-CUTDOWN` use the claim registry that `STORY-CLAIM-SOURCE` needs. One registry in the brief serves both.
6. **Proposals to calibrate.** The KB marks these as its own proposals, so use them as starting points, never gates:
   - focal in frame ≥ 0.9 in 95% of frames;
   - no crop reversals under 0.5 s;
   - a recompose upscale above 1.5×;
   - VO tempo change within ±5%;
   - mandatory opacity ≥ 0.9.

   The UAX #14, UAX #29 and CLDR checks are marked pending.
