# LIGHT — Lighting for 3D scenes, product shots, motion graphics and simulated light in 2D

> **Status:** seed document for the `LIGHT-*` pillar (v0.1, researched 6 November 2026). **Scope:** how light is designed, rendered, measured and critiqued in VCR's code-first pipeline: three.js and Blender (Eevee and Cycles) for 3D, and CSS, SVG, canvas, PixiJS and similar tools for 2D "simulated light". **Out of scope, cite instead:** camera movement and timing (`MOTION-*`), surfaces and shaders (`MAT-*`), palette and composition intent (`ART-*`), bloom and glare compositing (`FX-*`), the colour pipeline and encoding (`DELIVERY-*`), flashing and photosensitivity limits (`A11Y-*`), per-production values (`BRIEF-*`), critique method (`REVIEW-*`).
> **Confidence tiers:** `standard` means a published specification or style guide checked against its primary text (e.g. the Khronos PBR Neutral spec). `platform` means vendor or tool documentation (three.js, Blender, Poly Haven) that may change without notice. `heuristic` means a practitioner rule of thumb, a secondary source, or a threshold VCR proposes itself. **Every numeric threshold in this document that has no named source is a VCR proposal at `heuristic` tier and must be calibrated on real renders before it blocks anything.**

## TL;DR

- **Light the shape and the mood first; correct units and tone mapping make that design survive rendering.** In every setup the same three questions decide whether an image reads. Where is the key, and is it *motivated*?\[1\] How much does the fill open the shadows (the key-to-fill ratio, in stops)? What separates the subject from the background (rim, edge, or tonal contrast)?\[2\] Jeremy Birn's canonical numbers set the defaults. The key sits 15–45° off the camera axis and 15–45° above it. The fill is "at most… about half as bright as your Key (a Key-to-Fill ratio of 2:1)", and "1/8th" for shadowy scenes [32].\[2\]\[3\]
- **Tone mapping is the biggest single reason brand colours go wrong in 3D.** ACES and AgX deliberately desaturate highlights. For ACES, canary yellow, bright greens and bright blues become unreachable [13].\[4\] For brand and product work, default to **Khronos PBR Neutral** (`THREE.NeutralToneMapping` in three.js [5]). With even white lighting it reproduces base colours with R, G and B below sRGB 231 faithfully [13].\[4\]\[5\] Then verify the result with ΔE against the brief's swatches.
- **three.js has been physically based by default since r155 and has no legacy mode since r165.** Point and spot intensity is in candela with `decay = 2` [1][7]. Output is sRGB by default since r152 [6]. `toneMapping` defaults to `NoToneMapping` [4], so an agent that never sets it gets clipped, hue-skewed highlights.\[6\]\[7\]\[8\]\[9\]\[10\]
- **Path-traced animation needs a fixed seed, fixed sample counts and a temporally aware denoiser.** Cycles' "Use Animated Seed" "Changes the seed for each frame" [20].\[11\] Leave it off when you need byte-identical re-renders, or when you want the noise to stay put. Per-frame denoisers flicker, because "The denoiser does not take past or future frames into account" [36]. Blender ships `bpy.ops.cycles.denoise_animation` for temporal denoising [36].\[12\]
- **Simulated light in 2D is a consistency problem, and that makes it unusually measurable.** One declared light angle per scene should drive every `box-shadow`, `text-shadow`, `drop-shadow`, gradient highlight and long shadow. All of them can be read from computed styles at any `t` and checked against the brief's angle.
- **Most lighting faults can be measured from frames and scene data.** These include clipped highlights, crushed shadows, weak subject-to-background separation, key-to-fill ratio, temporal flicker, inconsistent light direction, brand ΔE after tone mapping, and non-determinism. Mood, motivation and "does it look expensive" stay judgement-only.
- **Generic output is the biggest failure an agent is likely to produce.** The usual result is a grey cyclorama, a centred three-point rig, an ACES default and a lens flare. Birn himself warns: "don't think of three-point lighting as an excuse to light by formula, or to make every scene look the same" [32].\[3\]

## Key findings

1. **The three-point defaults have a traceable source.** The key sits "15 to 45 degrees to the side… of the camera" and "15 to 45 degrees higher than the camera angle". The fill is "At most… about half as bright as your Key (a Key-to-Fill ratio of 2:1). For more shadowy environments, use only 1/8th the Key's brightness (a Key-to-Fill ratio of 8:1)". "Rim Lights can be as bright as necessary" [32].\[2\]\[3\] (heuristic: practitioner canon.)
2. **"Lighting ratio" has two incompatible definitions, so always state which one you mean.** The ASC defines it as "(key+fill):fill" [31]. Many photography tutorials mean plain key:fill. A key one stop over the fill is 2:1 as a source ratio but 3:1 as an ASC additive ratio [31].\[13\] VCR rules must name the convention. This document uses **source ratio key:fill, expressed in stops**.
3. **three.js lighting is physically based by default.** r155 changed `useLegacyLights` to `false` and deprecated it, with removal planned for r165 [1]. The forum post says legacy intensities "can be restored by multiplying PI" for ambient, hemisphere and directional lights [1]. `PointLight` intensity is "measured in candela (cd)", with decay "Default is 2" and "In context of physically-correct rendering the default value should not be changed" [7]. (platform)
4. **three.js does not tone-map by default.** `WebGLRenderer.toneMapping` "Default is NoToneMapping". The options include `ACESFilmicToneMapping`, `AgXToneMapping` and `NeutralToneMapping` [4]. `NeutralToneMapping` is "based on the Khronos 3D Commerce Group standard tone mapping" [5]. (platform)
5. **Khronos PBR Neutral is the colour-faithful standard.** The spec fixes "F90 = 0.04", "Ks = 0.8 − F90" and "Kd = 0.15" [12]. In the author's words, "any baseColor with R, G, and B values below 231 will be faithfully reproduced under even, white lighting", and "The compression reduces 255 to 243" [13]. Khronos released it on 16 May 2024. Its press release lists support already in "<model-viewer>, Autodesk, Babylon.js, Blender, Dassault, Filament, London Dynamics, Phasmatic, Three.js, and Threekit" [14]. (standard)
6. **Filmic tone mappers cost saturation, and that is a known, documented trade.** "The primary problem with ACES (and even AgX) tone mapping reported by e-commerce users is their significant loss of saturation". Under ACES, "canary yellow, bright greens and blues are all impossible to output to the screen" [13]. (standard-adjacent: written by the spec's author.)
7. **AgX is Blender's default.** It "replaces Filmic as the default in new files" in Blender 4.0, and "bright colors go towards white, similar to real cameras" [18]. (platform)
8. **Cycles determinism and noise have documented controls.** The seed gives "different noise patterns". "Use Animated Seed" changes it per frame and is "Not compatible with the Blue-Noise sampling pattern" [20]. For the adaptive Noise Threshold, "typical values are in the range from 0.1 to 0.001" [22]. (platform)
9. **Light linking is a sanctioned way to break physics.** It "adds more artistic control for lighting by breaking the laws of physics… A character could have a dedicated linked rim light" (Cycles, Blender 4.0) [24]. "When using shadow linking, renders can be slower" [23]. (platform)
10. **HDRIs from Poly Haven are CC0.** You "can use our assets for any purpose, including commercial work" and "do not need to give credit" [30]. Studio HDRIs are therefore safe defaults for licensing, but not for distinctiveness. (platform)

---

## 1. Lighting fundamentals

### 1.1 The roles of light
Birn's canon is the base vocabulary [32][33]:

| Role | Job | Placement default | Brightness default | Shadows |
|---|---|---|---|---|
| **Key** | Main light. Sets the form, the shadow direction and the specular highlight. "is the main shadow-caster… Specular highlights are triggered by the Key Light" [32] | 15–45° to the side of the camera, 15–45° above it [32] | The reference (1.0) | Yes, darkest |
| **Fill** | Opens the key's shadows without erasing them | "generally opposite angle than the Key… don't make all of your lighting 100% symmetrical", "lower than the Key" [32] | ≤ ½ key (2:1); ⅛ for shadowy scenes (8:1) [32]. "If multiple Fills overlap, their sum still shouldn't compete with the Key" [32] | "optional, and often skipped" [32] |
| **Rim / back** | "creates a bright line around the edge of the object, to help visually separate the object from the background" [32] | Behind the subject, opposite the camera, above it [32] | "as bright as necessary" [32] | "usually needs to cast shadows" [32] |
| **Kick, bounce, spill** | Secondary shaping. Birn's 3rd edition covers "key, spill, bounce, fill, rim, and kick lights" [33] | — | — | — |

**Motivation.** "Before you add a light to your scene, you should know its *motivation,* the cause or original source of a light" [33]. In stylised motion graphics the motivation can be abstract, for example "the light comes from where the logo will appear". It still has to be *one consistent story*.

### 1.2 Ratios and contrast
- Each stop of difference doubles the ratio: 1 stop = 2:1, 2 stops = 4:1, 3 stops = 8:1 [31].
- **Convention (VCR):** store ratios as `keyFillStops = log2(E_key / E_fill)`, a source ratio. To convert to ASC additive: `asc = 1 + 2^stops`. Some ASC-based tutorials therefore call a 1-stop source ratio "3:1" [31].
- **Reading guide (heuristic, VCR):** 0–0.5 stops looks flat (beauty, high-key, clean explainer); 1–2 stops looks shaped and commercial; 3+ stops looks dramatic, low-key or noir.

### 1.3 Hard against soft, and the size of the source
- Softness comes from the **apparent size** of the source as seen from the subject, not from intensity. Blender's manual: lights with a larger radius "have softer shadows and specular highlights, and they will also appear dimmer because their power is distributed over a larger area" [25].
- The Cycles area light **Spread** controls how widely the light fans out: "Larger values create soft shadows while smaller values create sharper light simulating a gridded softbox" [25].
- On glossy products, source size also sets the **size and shape of the reflection**. That is the "family of angles" problem in *Light: Science and Magic*. Some reflections "occur only if light strikes the surface from within a limited family of angles", and "the family of angles determines where the light should or should not be" [34].

### 1.4 Inverse-square falloff
- For a point source, irradiance ∝ 1/d². Doubling the distance gives ¼ of the light, which is −2 stops.
- three.js reproduces this only with `decay = 2` and when "the scene is scaled so 1 distance unit = 1 meter" [2]. Both conditions were stated by the maintainer who drove the change [2].
- **Craft use:** a key placed close gives fast falloff across the subject, with dramatic gradation. A key placed far gives even illumination. Moving the fill twice as far as the key, with identical fixtures, gives a 4:1 source ratio. This estimate is secondary and only holds for identical point-like sources.\[14\]

### 1.5 Colour temperature and mixed temperatures
- Warm key against cool fill or rim is the default "commercial" contrast. Mixed temperature reads as *motivated* when each colour has a source in the story, such as a window against a practical lamp.
- In 3D, colour temperature is a light colour, often set through a blackbody node in Blender. White balance then happens at the view transform or grade, not on the lights. Lalish's case study in [13] is a cautionary tale. Marketing colours were judged under D50 store lighting while sRGB assumes D65, and "all the marketing colors were generally red-shifted from the scanned ones" [13]. **The brief should state the white point that brand swatches were approved under** (cite `ART-*` and `BRIEF-*`).

### 1.6 High-key and low-key
- **High-key:** a low ratio, a bright background, minimal shadows. Risk: clipping and a "washed out" look.
- **Low-key:** a high ratio, a dark background, separation carried by rim and edge. Risk: crushed blacks and a subject lost in the background, which gets worse after `yuv420p` encoding and platform re-encoding (see §20).

---

## 2. Standard setups

Ratios marked (H) are heuristic VCR defaults derived from §1.2. Only the Birn figures are sourced.

| Setup | Purpose | Placement | Typical ratio | Failure modes |
|---|---|---|---|---|
| **Three-point** | General-purpose shape and separation | Key 15–45° side and up; fill opposite and lower; rim behind and above [32] | 1–3 stops (2:1 to 8:1 per Birn [32]) | Symmetry; looks formulaic; fill competing with the key; double shadows from a shadowed fill |
| **Product / tabletop** | Show shape, material and silhouette | One large overhead or side softbox as key; a second large source or reflector card as fill; strip lights left and right for edge highlights on glossy curves; a graded backdrop | 1–2 stops (H) | Reflections of small sources read as "CG"; sweep gradient banding; dark product lost on dark background |
| **Glossy gradient** (product sub-case) | Control *reflections*, not illumination | A large area light placed inside the family of angles so its reflection covers the surface. A gradient texture on the light (or a ramped emissive plane) gives the "liquid" falloff seen in bottle and phone shots [34] | n/a: judged by the reflection's shape | A hard-edged reflection rectangle; the reflection cut off mid-surface; a bare HDRI window visible in chrome |
| **Dark on dark** | A black product on a black background | Rim or strip lights from behind and the sides, placed so only the **edges** fall in the family of angles; background separated by a pool of light or a faint gradient [34] ("black-on-black" is one of the book's "extremes") | Background 2–4 stops below the subject's edge highlights (H) | No edge definition; crushed after encoding |
| **Beauty / clamshell** | Flattering, low-texture faces; also soft, even product fronts | Key above the camera axis, angled down; fill or reflector below, angled up ("clamshell") | 0.5–1 stop (H) | Flatness, if there is no rim or background separation |
| **Silhouette** | Graphic shape and mystery | Background or rim lit; subject front unlit | Subject front ≥ 4 stops below the background (H) | Shape must be readable as an outline; fails if the silhouette is ambiguous |
| **Rembrandt / loop** (characters) | Classic character modelling | Loop: key a little off-axis and high, so the nose shadow forms a small loop toward the cheek. Rembrandt: key further round, so a triangle of light falls on the shadow-side cheek | 1–3 stops (H) | Shadow-side eye socket goes dead; nose shadow touches the lip line. (Placement descriptions are practitioner canon; this research found no primary source, so they are `heuristic`.) |
| **Cyclorama (cyc / infinity cove)** | A seamless, horizonless background | A curved floor-to-wall sweep; background lights separate from subject lights so the background's brightness and gradient are set independently | Background brightness set by intent: white cyc ≈ key level; grey cyc 1–2 stops under (H) | The generic "studio grey" look (§10.3); a visible horizon line; uneven sweep |

**Expressive breaks.** A single hard key with no fill (noir, product drama), a flat 1:1 light (graphic, editorial, flat-design pastiche) and top-light only (interrogation, monolith reveal) are all legitimate. They succeed when the brief asks for the mood and when separation is preserved by some other means: tone, colour or edge.

---

## 3. Image-based lighting and environments

- **What an HDRI does.** An HDRI is an equirectangular high-dynamic-range image that lights the scene from every direction and supplies reflections. Poly Haven describes its HDRIs as "Unclipped, giving you the most realistic lighting possible" (Poly Haven's own Patreon description, a vendor source).
- **Licence.** Poly Haven assets "are all licensed as CC0". "You can use our assets for any purpose, including commercial work" and "You do not need to give credit" [30]. Other libraries carry other licences. **Record the source and licence of every HDRI in the project manifest** (rule `LIGHT-HDRI-LICENCE`).
- **Intensity and rotation.** Environment intensity scales the whole light. Rotation moves the key-like hotspot, which is usually the sun or a softbox in the HDRI. **Treat HDRI rotation as a light position: lock it per shot, animate it only on purpose, and log it.** In three.js the controls are `scene.environment` with environment intensity and rotation (exact property names vary by release, so check the docs for your pinned version). In Blender, use a Mapping node on the World's Environment Texture.
- **Reflections only.** A common pro pattern lights with explicit area lights and uses the HDRI only for reflections. In three.js, set `scene.environment` for reflections and keep `scene.background` separate. In Cycles, use a Light Path "Is Camera Ray" or "Is Glossy Ray" mix in the World. Light linking to world lighting is "planned" but was not in Blender 4.0 [24].
- **Studio HDRIs for products.** They give believable softbox reflections cheaply. **The risk is recognisability:** popular studio HDRIs show up in thousands of renders. Prefer a custom-built "light-box" environment, or modify a stock HDRI with added emissive cards.
- **Matching the brief's mood (heuristic):**
  - Overcast or sky-dome HDRIs give low-ratio, soft, "honest" light.
  - Sunset or interior HDRIs give warm, directional, motivated light.
  - Studio HDRIs give clean, commercial light.
  - Night or neon HDRIs give saturated, high-contrast light. Check the brand colours under coloured light separately, because PBR Neutral's colour fidelity holds "under neutral (grayscale) lighting" [13].
- **three.js without an HDRI.** `RoomEnvironment` (an addon) is a procedural studio environment, run through `PMREMGenerator`.

---

## 4. Physically based lighting in renderers

### 4.1 Units
| Quantity | Unit | Where used |
|---|---|---|
| Luminous intensity | candela (cd) | three.js `PointLight` and `SpotLight` `.intensity` [7][8] |
| Luminous power | lumen (lm) | three.js `.power` on point, spot and rect-area lights: "luminous power of the light measured in lumens (lm)" [7][9] |
| Radiant power | watt (W), radiant flux, **not** electrical watts | Blender point, spot and area lights. "It is Radiant Flux or Radiant Power… the energy radiated from the light in the form of visible light" [25][26] |
| Irradiance | W/m² | Blender sun Strength. "Typical values are around 250 for an overcast day and 1000 or more for direct sunlight" (3.0 manual) [25] |
| Luminance | cd/m² ("nit") | Display and emissive brightness. "The candela per square metre is sometimes called the nit" [39] |
| Exposure value | EV (stops) | Blender Color Management Exposure; three.js `toneMappingExposure`, a linear multiplier: `exposure = 2^EV` |

- An isotropic 1 cd source emits 4π lm [39]. In three.js, `power = intensity × 4π` for point lights (an older docs mirror states this ratio [6-mirror, see ledger]).
- `DirectionalLight` and `HemisphereLight` docs say only "The light's strength/intensity. Default is 1" and give **no physical unit** [10][11]. Treat them as relative scalars. "HemisphereLight… cannot be used to cast shadows" [11].
- Blender's own conversion table includes "1500 lm PAR38 floodlight | 4 W" and "2500 lm fluorescent tube | 4.5 W" [26]. A secondary summary of the same manual gives ≈2.1 W for an 800 lm LED bulb [43].\[15\]\[16\]
- **Agent pitfall:** copying `new PointLight(0xffffff, 1, 100)` from pre-r155 tutorials gives a near-black scene, because 1 cd at 5 m contributes 1/25 (secondary [40]). Size intensities to distance, or set `.power` in lumens.

### 4.2 three.js light types and limits
| Type | Shadows | Notes |
|---|---|---|
| `AmbientLight` | No | Flat, directionless. It is the main cause of the "flat/CG" look; use it at most as a tiny lift |
| `HemisphereLight` | No [11] | Sky/ground two-tone fill; cheap and good for outdoor fill |
| `DirectionalLight` | Yes, orthographic shadow camera | Sun-like. Fit the shadow camera tightly to the subject for resolution |
| `PointLight` | Yes, six faces (cube) | Candela, `decay` 2 [7] |
| `SpotLight` | Yes | Candela; `angle`, `penumbra` [8] |
| `RectAreaLight` | **"There is no shadow support."** "Only PBR materials are supported." You must include "`RectAreaLightUniformsLib` (`WebGLRenderer`) or `RectAreaLightTexturesLib` (`WebGPURenderer`)" [9] | The softbox of the web. Pair it with a shadow from another light or a baked or contact shadow |
| `LightProbe` / environment | No (indirect only) | IBL via PMREM |

**Colour management:** since r152 `.outputColorSpace` defaults to `SRGBColorSpace`. Colour textures must be tagged `texture.colorSpace = THREE.SRGBColorSpace`. "Components of THREE.Color objects and vertex colors are always in Linear-sRGB" [6]. With three.js post-processing, use `OutputPass` [6]. **Tone mapping and the sRGB encode must happen exactly once** (`LIGHT-TONEMAP-ONCE`).

**Shadow maps and their artefacts:**
- *Acne* (self-shadowing stripes): fix with `shadow.bias` (small negative) or `shadow.normalBias`.
- *Peter-panning* (the shadow detaches from the contact point): the bias is too large.
- *Blocky or aliased edges*: raise `shadow.mapSize` (powers of two) or tighten the shadow camera frustum.
- *VSM light bleeding*: with `VSMShadowMap`, "all shadow receivers will also cast shadows" (secondary [40]).
- The official three.js migration guide for r181→r182 states: "PCFSoftShadowMap with WebGLRenderer is now deprecated. Use PCFShadowMap which is now soft as well." A secondary source (utsubo.com) reports that later releases warn on the removed constant, with removal in r186; check your pinned version.
- **Agent pitfall:** shadow-map edges *shimmer* when the light or the shadow camera moves sub-texel between frames. It is invisible in a still and obvious in motion. Snap the shadow camera to texel increments, or keep shadow-casting lights static relative to the subject.

### 4.3 Blender: Eevee against Cycles
| | **Eevee (4.2+ "Next")** | **Cycles** |
|---|---|---|
| Method | Raster plus screen-space ray tracing. "EEVEE now uses screen space ray tracing for every BSDF" [27] | Path tracing |
| Shadows | **Virtual Shadow Maps** with "Shadow Map Ray Tracing, providing plausible soft shadows without needing shadow jittering". "Contact shadows have been removed" [27]. Per-light Jitter is "disabled by default" [28] | Ray-traced, exact; softness comes from source size |
| GI | Screen-space plus light probes; off-screen bounces are missing | Full multi-bounce |
| Noise | Low; temporal accumulation via render samples | Monte Carlo noise; needs samples plus a denoiser |
| Determinism | Generally repeatable on the same GPU and driver (heuristic: this research found no published guarantee) | Fixed seed and fixed samples give repeatable noise; GPU and CPU or driver differences can still change pixels (heuristic) |
| Light linking | Since Blender 4.3, whose EEVEE release notes state "Light & Shadow Linking. There is now feature parity with Cycles." [42] | Since 4.0 [24] |
| Shadow catcher | Needs workarounds | Native (Object › Visibility › Shadow Catcher plus Film › Transparent) [38] |
| Best for | Stylised motion graphics, abstract 3D, fast iteration, loops | Hero product shots, glass, caustics, exact contact shadows |

Eevee caveat: "Turning on Jitter can reduce the light leaking artifacts caused by large lights and *Shadow Map Raytracing*". "Reducing the shadow map resolution will increase the chances of light leaking artifacts" [29].

### 4.4 Light linking
- In Cycles, lights can "affect only specific objects", and shadow linking controls "which objects acts as shadow blockers for a light" [23].
- "Sampling for light linking is most efficient with the light tree enabled" [23].
- Typical product uses: per-part reflection shaping ("Different light per car part, to finely control shape of reflections" [24]); a rim light that only touches the logo; a fill that does not lift the cyc.
- three.js has no built-in light linking. Emulate it with `layers` (lights and objects on matching layers), separate render passes, or per-material light opt-outs.

### 4.5 Global illumination against baked lighting
- **Real-time GI** (Eevee screen-space, Cycles full GI) responds to animation, but costs noise or screen-space artefacts such as bounce light vanishing as objects leave the frame.
- **Baked lighting** (lightmaps, AO maps, or Blender bake to texture for three.js) is noise-free and deterministic. It is ideal for static environments around an animated camera, and wrong for moving lights or moving objects.
- **Fake GI** (Birn's "faking GI with occlusion passes" [33]): AO multiplied over a fill pass, plus a coloured bounce light. It is the classic cheap substitute.

---

## 5. Exposure and tone mapping

### 5.1 Scene-referred against display-referred
- **Scene-referred** values are linear and proportional to light, and unbounded above 1.0. Lighting, blending and compositing belong here.
- **Display-referred** values are encoded for a display range (sRGB 0–1). 2D tools (CSS, SVG, canvas) work display-referred by default, which is why a CSS "glow" is not additive light (§7).
- "There is actually no such thing as 'no tone mapping'… If this step is not done, the encoder simply clamps the values" [13]. Clamping produces flat, hue-skewed highlights. With clamping, "the shiny and matte white plastic spheres are now indistinguishable" [13].

### 5.2 Operators compared
| Operator | Highlights | Saturation | Use | Source |
|---|---|---|---|---|
| **None / Linear / clamp** | Clip, hue-skew | Kept until it clips | Only unlit or LDR content | [13] |
| **ACES Filmic** | Smooth shoulder; bright colours go to white | **Strong loss**; canary yellow, bright greens and blues unreachable | Cinematic HDR scenes | [13] |
| **AgX** | Bright colours go "towards white, similar to real cameras" [18] | Lower than Neutral; "very intentionally aims at a low-contrast default look, and tends to be a better foundation for color grading" (three.js forum overview [17]) | Strongly HDR scenes, saturated emissives, graded looks. Blender default since 4.0 [18]; Blender looks include "Punchy" [19] | [17][18][19] |
| **Filmic (Blender legacy)** | Good range; known saturated-colour problems | Skews and desaturates | Keep only for existing projects | [18] |
| **Khronos PBR Neutral** | Compresses only above 0.8 linear; the 255 input "reduces… to 243" | **Preserved**; hue unchanged under neutral light | Brand, product, UI-adjacent 3D, e-commerce | [12][13] |

The spec in brief [12][13] has three regions. Below `x = min(R,G,B)` it applies a toe offset (up to 0.04), which corrects the 4% Fresnel desaturation of IoR-1.5 dielectrics. From there to 0.76 the curve is linear 1:1 (0.8 − 0.04). Above that, the peak channel is compressed with a 1/x shoulder and blended toward white at rate `Kd = 0.15`. The curve is "without parameters" by design [13].

Khronos's guidance (via a secondary report [labelled secondary]): linear for content with no HDR input or physical lighting; filmic (ACES, AgX) for strongly HDR scenes, wide gamuts or artistic looks; PBR Neutral for colour-accurate product display.

### 5.3 Why brand colours shift, and how to keep them
1. **The tone-mapper shoulder.** ACES and AgX pull saturated colours toward white and lower peak saturation [13].
2. **Fresnel.** Dielectrics add about 4% white specular, which desaturates dark colours [13].
3. **Lighting colour and white point.** Coloured or warm light changes the hue by physics. Swatches approved under D50 differ from D65 [13].
4. **Exposure.** Over-exposing pushes colours into the shoulder.
5. **Encoding.** Chroma subsampling and limited range in `yuv420p` (cite `DELIVERY-*`).

**Recipe (`LIGHT-BRAND-NEUTRAL-TONEMAP`, `LIGHT-BRAND-DELTAE`):**
- Use PBR Neutral, or render brand-critical flat elements *unlit*. In model-viewer "tone mapping is not applied at all to unlit materials" [13]. Blender, by contrast, "also applies its view transform to unlit materials" [13].
- Keep the brand base colour's channels below sRGB 231 where possible [13].
- Light the brand surface with neutral white at an exposure that keeps it in the 1:1 region.
- Run a **white-furnace check**: uniform [1,1,1] environment, compare the render with the base colour [13].
- Measure ΔE against the brief's swatches. `ART-*` owns the tolerance.
- In Blender, PBR Neutral is native: the Blender 4.2 LTS colour-management release notes state "The Khronos PBR Neutral view transform has been added" (Lalish's PR #118936 was merged). On older versions, use the OCIO config and `.cube` LUT Lalish published [13].

### 5.4 Exposure control
- Expose for the subject's key-lit midtones, then let the tone mapper handle highlights. Do not lower exposure until specular highlights fit. Specular highlights "are orders of magnitude brighter than the majority of the scene, so to fit them into the output range requires the exposure to be lowered by more than a factor of 50" [13].
- In a series, **fix exposure per series** in the brief, and vary lights, not exposure, between shots (`LIGHT-SERIES-RIG`).

---

## 6. Shadows and occlusion

- **Contact shadows** are the darkest, sharpest shadow at the point where an object meets a surface. They are the single strongest "grounding" cue. Without them an object "floats". Eevee 4.2 removed its dedicated Contact Shadows option, relying on virtual shadow maps [27]. In three.js, use the `ContactShadows` pattern (a depth render from below, blurred, on a plane) or a baked blob.
- **Ambient occlusion.**
  - SSAO, GTAO and SAO in three.js postprocessing are cheap screen-space methods. They halo at silhouettes, vary with the view, and can "breathe" as the camera moves.
  - Ray-traced AO (Cycles, or a baked AO map) is stable and correct.
  - Use AO as a subtle multiplier on *indirect* light only. AO applied over direct light is a classic "CG" tell (heuristic).
- **Shadow softness.** Softness follows from the source's apparent size (§1.3). Penumbra widens with distance from the contact point. **A uniform-blur shadow (same softness at contact and tip) reads as fake** (heuristic, widely taught).
- **Shadow catchers** composite a product onto a flat or brand-colour background:
  - Blender Cycles: Object Properties › Visibility › Shadow Catcher on the ground plane, plus Render › Film › Transparent, output to RGBA [38]. Keep the plane's material neutral.
  - three.js: `ShadowMaterial` on a plane (it renders only the shadow, with an opacity).
  - For delivery with alpha, use ProRes 4444 (cite `DELIVERY-*`).
- **Cheap fakes that read as real:**
  1. A blob or radial-gradient contact shadow under the object, darker and tighter at the centre.
  2. Two stacked shadows: tight and dark (contact) plus wide and light (ambient).
  3. Baked AO into the floor texture.
  4. In 2D, a squashed ellipse with radial gradient, scaled as the object lifts. Bigger and lighter means further from the ground.

---

## 7. Atmosphere and light effects

| Effect | What it is | Cost | When it cheapens | Owner for compositing |
|---|---|---|---|---|
| **Volumetrics / god rays** | Light scattering in a medium; shafts appear where occluders break the beam | High in Cycles (volume bounces, step size); moderate in Eevee | Uniform haze that lowers contrast everywhere ("muddy") | `FX-*` |
| **Fog / depth haze** | Distance-based attenuation toward a fog colour | Low | Hides the subject's edges; flattens separation | `FX-*` |
| **Bloom / glare** | A blur of over-threshold pixels added back | Low in post | Applied to everything, including the white UI and text; bloom on mid-greys | `FX-*` |
| **Lens flare** | A simulated lens artefact from a bright source | Low | When the source is off-motivated, appears in every shot, or covers the brand mark (heuristic). Flares signal "camera"; in an abstract scene with no camera conceit they read as a preset | `FX-*` |
| **Caustics** | Light focused by refraction or reflection (glass, liquid) | Very high in path tracing; "not as suitable for caustics" in Cycles' default integrator [historic manual note] | Noisy caustics that crawl between frames | `MAT-*` for the material, `LIGHT-*` for the source |
| **Emissive surfaces** | Geometry that emits light | Cycles: real light (noisy if small and bright); Eevee/three.js: emissive *appearance* only unless baked or probed | An emissive that does not light its surroundings reads as a sticker. Add a matching light or a light-linked area light | `MAT-*` |

**Emissive hierarchy (`LIGHT-EMISSIVE-HIERARCHY`, heuristic).** In any frame there should be one brightest emitter, the focal point. Under AgX, recheck "authored contrast and emissive hierarchy" (secondary three.js guide).\[17\]

---

## 8. Light in 2D and flat motion graphics

Flat design simulates light by convention. The rule that matters is **one declared light per scene, applied everywhere.**

### 8.1 Techniques (maths first, recipes second)
- **Gradient lighting.** A linear gradient along the light vector **L** fakes a lit surface: brightness = `base + k · dot(n̂, L)` for a flat panel's assumed normal. On a sphere or disc, a radial gradient offset toward **L** fakes diffuse shading.
  - *CSS:* `radial-gradient(circle at 30% 25%, hsl(h s 70%), hsl(h s 40%))`, with the offset equal to the light direction.
  - *SVG:* `<radialGradient fx fy>` where fx and fy are the highlight position.
- **Faux rim light.** A thin highlight on the edge facing *away* from the camera and toward **L**'s back component. Build it from a stroke masked by the shape offset against **L**: `rim = shape − translate(shape, −L·w)`.
  - *SVG:* `feOffset` + `feComposite operator="out"` + `feFlood`.
  - *Canvas:* draw the shape, set `globalCompositeOperation = 'destination-out'`, draw it offset.
- **Long shadows.** An extrusion of the silhouette along **−L**, usually 45° in flat design, fading to transparent. All long shadows in a scene share **one angle**.
- **Drop and box shadows.** The offset `(dx, dy)` encodes the light direction as `atan2(−dy, −dx)`, and the blur encodes source size. CSS `box-shadow`, `text-shadow` and `filter: drop-shadow()` are all readable via `getComputedStyle`.
- **Glows.** In display-referred CSS and canvas, a glow is a blurred copy composited with `screen` or `lighter` (additive). `lighter` approximates additive light but clips at 1.0. For filmic glows, work in a float canvas or WebGL and tone-map.
  - *ImageMagick/sharp:* blur a thresholded copy and composite with `Screen`.
  - *FFmpeg:* `split` → `gblur` → `blend=all_mode=screen`.
- **Light sweeps / specular glints across logos and text.** A narrow bright band (a gradient with a peak) moves across the mark, masked to the glyphs.
  - Maths: `band(x) = exp(−((x·cosθ + y·sinθ − p(t)) / w)²)`, where θ is the band angle and `p(t)` is eased per `MOTION-*`.
  - *CSS:* `background: linear-gradient(...)` with `background-clip: text`, animating `background-position`.
  - *SVG:* an animated `<linearGradient>` `x1/x2` inside a `<mask>`.
  - *Canvas/Pixi:* an additive sprite with the logo as mask.
  - **Craft (heuristic):** the band should be narrower than about a third of the mark's width, cross once, and not obscure legibility at its peak (cite `TYPO-*`). The direction should agree with the scene's light, e.g. a top-left key gives a sweep from top-left.

### 8.2 Consistency rules
- **One light angle token per scene** (`brief.light.angle`), used by all shadows, highlights, gradients and rims (`LIGHT-DIRECTION-CONSISTENT`, `LIGHT-TWOD-DIRECTION`).
- **Shadow length and softness scale with "elevation"**: a raised card gets a larger offset and more blur. Material Design popularised elevation-mapped shadows, though its specific values are not verified here.
- **Highlights on the lit side, shadows on the opposite side.** A top-left key puts the highlight top-left and the shadow bottom-right. Mixing these is the 2D version of "lit from nowhere".
- **Expressive break:** deliberately conflicting lights (pop-art, collage) work when the inconsistency is uniform and obviously intentional. One stray shadow at a different angle reads as an error.

---

## 9. Lighting in motion

- **Animated lights.**
  - Sweeps (an area light or HDRI rotation passing across a glossy product) are the classic product-reveal device. The reflection's travel *is* the reveal.
  - Reveals ramp intensity from black. Remember the tone mapper's toe and shoulder: a linear intensity ramp does not look linear. Ramp in **stops** (exponential intensity) for a perceptually even fade (heuristic).
  - **Flicker** (fire, neon, failing practicals) must be deterministic, using a seeded noise function of `t`, never `Math.random()`. It must also respect `A11Y-*` flash limits. Large-area luminance flicker is a photosensitivity risk.
- **Consistent lighting through camera moves.** Keep lights in *world* space, or parented to the subject, unless the brief wants the light to travel with the camera (a "headlamp" look). Check that the key side does not flip during an orbit: as the camera passes 90° around, the key can become a rim. That can be beautiful if planned; if not, it is a continuity error. Camera paths are owned by `MOTION-*`.
- **Temporal noise in path tracing.**
  - A *fixed* seed gives a static noise pattern that looks like dirt on the lens when the camera moves.
  - An *animated* seed gives crawling grain that looks like film grain but fights compression.
  - Either way, at low samples the result is visible. The Cycles seed gives "different noise patterns" and the animated seed "Changes the seed for each frame" [20].
- **Denoiser flicker.**
  - Per-frame denoisers interpret noise differently on each frame: "a common denoising problem know as temporal coherence. It's caused by the denoiser interpreting the noise differently in each frame" (Blender Artists, secondary [37]).
  - Mitigations: more samples; a lower noise threshold; Blender's temporal `bpy.ops.cycles.denoise_animation`, which requires multilayer EXR with denoising-data and vector passes (secondary [36]); or Eevee.
  - CG Channel (Jim Thacker, 30 January 2026, secondary [35]) reports that Intel Principal Engineer Attila Áfra presented **Open Image Denoise 3**, with "support for temporal denoising… for both real-time and final-quality workflows". Áfra has since said on LinkedIn that OIDN 3 "is coming soon, and it will be fully integrated into Blender Cycles". It had not shipped at the time of writing.
- **Fixed seeds and sample counts for determinism.**
  - Pin the seed, samples, min samples, noise threshold, denoiser, its version, the device type, and the Blender version.
  - Adaptive sampling makes per-pixel sample counts depend on content, which is still deterministic for identical inputs.
  - Note the incompatibility between the animated seed and the Blue-Noise pattern [20].
- **Light across a loop seam.** Every light parameter that animates must be periodic, i.e. equal at `t = 0` and `t = duration`: intensity, colour, position, HDRI rotation, flicker noise (use periodic noise, e.g. sampling noise on a circle), sweep phase.
  - With an *animated* seed, frame 0 and frame N have different noise, and the seam shows as a grain "pop". Use a fixed seed for loops, or render enough samples that noise is below visibility.
  - Screen-space GI and AO and Eevee temporal effects can differ at the seam because there is no history at frame 0. Pre-roll the scene and loop a middle segment (heuristic).

---

## 10. Lighting for brand and products

### 10.1 Making a product read
1. **Silhouette:** is the outline recognisable as a black shape? Test with a thresholded mask.
2. **Edge:** do the edges separate from the background via rim, strip reflection or tonal step?
3. **Material cues:** glossy needs a shaped reflection (a gradient softbox), metal needs reflected environment structure, matte needs gradation of diffuse light, glass needs edge lines and a bright or dark background contrast [34].

Hunter et al. organise the craft exactly this way: surface appearances, then shape and contour, then metal, glass and the extremes [34].

### 10.2 Lighting a logo
- **Flat 2D logo:** keep it unlit or minimally lit. Light it with a sweep or a glow, never with shading that changes its colour (ΔE check).
- **Extruded 3D logo:** the face carries the brand colour (keep it in the PBR Neutral 1:1 region, or unlit); bevels catch the key and rim to show depth; the sides go darker.
- **Chrome or gold logo:** it is lit *by what it reflects*. Design the environment, either cards or an HDRI, as the real light.

### 10.3 Avoiding the generic "studio grey" look
**Agent failure mode:** a mid-grey cyc, a centred key, an ACES default, a uniform AO and a grey HDRI. The result is competent and indistinguishable from stock. Remedies:
- Take the background colour and value from the brief's palette (`ART-*`).
- Choose a deliberate ratio (§1.2), not a default.
- Use asymmetric placement and one motivated accent, such as a coloured rim from the brand's secondary colour.
- Design the reflection shape on glossy surfaces.
- Use a falloff gradient on the background (a light pool behind the subject).

### 10.4 Consistent lighting across a series
- Encode the **light rig as data in the brief** (`BRIEF-*`): key azimuth, elevation and size; ratio in stops; rim strength; HDRI ID and rotation; exposure EV; tone mapper; 2D light angle.
- Each episode instantiates the rig and may vary within declared tolerances.
- The checks in §12 then compare every episode against the rig (`LIGHT-SERIES-RIG`).

---

## 11. Render cost

| Driver | Blender Cycles | Blender Eevee | three.js | Safe to lower for preview? |
|---|---|---|---|---|
| Samples | Linear cost; noise ∝ 1/√samples (Monte Carlo) | Temporal samples | n/a (MSAA/TAA) | Yes |
| Noise threshold | Adaptive sampling: "reduces overall render time (by 10-30% in our test scenes)" (Blender 2.83 notes [22]) | — | — | Yes (raise to about 0.1) |
| Bounces | Diffuse, glossy, transmission and volume bounce caps | Ray-tracing resolution | — | Partly. Glass and liquid need transmission bounces or they go black |
| Volumetrics | Very high (step size, bounces) | Moderate (volume resolution) | Custom raymarch | Yes for layout; never judge mood from it |
| Shadow resolution | n/a (ray-traced) | VSM resolution limit, shadow pool [29] | `shadow.mapSize`; number of shadow-casting lights (point = 6 renders) | Yes, but acne and peter-panning change |
| Light count | Light tree helps | "Unlimited number of Lights" [41] | Each light raises shader cost | Not if it changes the look |
| Caustics, filter glossy, clamping | Clamping and filter glossy reduce fireflies at the cost of accuracy | — | — | Yes, but keep them identical for finals across a sequence |
| Denoiser | OIDN / OptiX | — | — | Use the same denoiser in preview and final, or the look changes |

**Preview against final (`LIGHT-PREVIEW-FINAL-PARITY`).** Lower *resolution, samples and bounces* for previews. Never change **lights, exposure, tone mapper, HDRI, colour management or denoiser type** between preview and final. The reviewer must be judging the same lighting.

---

## 12. Measurement: what an agent can check

All thresholds below are **heuristic VCR proposals**. Luminance is computed in **linear light** from sRGB-decoded pixels using Rec. 709 weights (`Y = 0.2126R + 0.7152G + 0.0722B`; standard formula, not re-fetched this session, see ledger).

| Check | Inputs | Calculation | Proposed threshold |
|---|---|---|---|
| **Key-to-fill ratio** | Frame PNG plus subject mask, split into a lit half and a shadow half (from scene data: light vector projected to screen, or from N·L buffer) | `stops = log2(median Y_lit / median Y_shadow)` within the mask, excluding speculars (top 2% of Y) | Within ±0.5 stop of `brief.light.ratioStops` |
| **Clipped highlights** | Frame PNG | % of subject-mask pixels with any channel ≥ 254 (8-bit) | ≤ 0.5% of the subject, excluding intended speculars and emitters (blob area ≤ 0.1% each) |
| **Crushed shadows** | Frame PNG | % of subject pixels with Y′ (encoded) ≤ 2% | ≤ 1% unless low-key is declared |
| **Separation** | Frame plus mask | Ring of width r = 0.5% of frame height inside and outside the silhouette; `ΔL* = |median L*_in − median L*_out|`, also per boundary segment | Median ΔL* ≥ 10, and ≥ 70% of boundary length with ΔL* ≥ 5 |
| **Temporal noise / flicker** | Consecutive frames | Static-region mean-Y time series: high-pass (subtract 5-frame moving median), then RMS; per-pixel temporal std in static regions | Flicker RMS ≤ 0.5% of mean Y; pixel temporal std ≤ 1.5 (8-bit) |
| **Light direction consistency (3D)** | Scene data: light transforms per shot | Key azimuth and elevation in subject-relative or camera space | Within ±15° of the rig across the series |
| **Light direction consistency (2D)** | Computed styles at t | Angle of every shadow offset `atan2(−dy, −dx)` | All within ±5° of `brief.light.angle` |
| **Brand ΔE** | Frame plus brand-region mask plus brief swatches | CIEDE2000 between the median Lab of the region and the swatch | Threshold owned by `ART-*` |
| **Determinism** | Two renders of the same frame | Byte hash; fallback PSNR | Identical (browser and Eevee); PSNR ≥ 50 dB (GPU Cycles) |
| **Loop seam** | Frame 0 and frame N (seek(duration)) | Mean ΔY and SSIM; light parameter equality from scene data | ΔY ≤ 0.5%; parameters equal |

---

## 13. Critique practice: vocabulary mapped to parameters

| Critique term | What it usually means | Likely parameter | Measurement |
|---|---|---|---|
| **"Flat"** | No form; ratio near 1:1; ambient-dominated | Fill too strong; ambient or hemisphere too high; key on the camera axis | Key-to-fill < 0.5 stop; low luminance variance within the mask |
| **"CG-looking"** | Perfect, uniform, unmotivated light | Small hard sources on glossy surfaces; no contact shadow; AO over direct light; NoToneMapping clipping; sharp shadow edges at every distance | Clipping %; contact-shadow presence; specular blob shape (judgement) |
| **"Muddy"** | Low contrast, grey-brown midtones, fog over everything | Over-fill; haze; AgX without a grade; underexposure; warm and cool fills cancelling to grey | Histogram compressed to the midtones (P95−P5 of Y′ < 0.5); low saturation |
| **"Blown out"** | Highlights clipped with no detail | Exposure too high; no tone mapping; key too strong | Clip % |
| **"Crushed"** | Shadow detail gone | Exposure low; no fill; encoding range | Crush % (on decoded delivery video too) |
| **"No separation"** | The subject merges with the background | No rim; background value equals the subject's edge value | Separation ΔL* |
| **"Lit from nowhere"** | Light direction has no motivation, or conflicts | Multiple keys; 2D shadows at mixed angles; highlights on the shadow side | Direction consistency |
| **"Plasticky"** | Uniform broad specular | Mostly `MAT-*` (roughness); also a light that is too small or too uniform | Judgement |
| **"Swimming / boiling"** | Temporal noise or denoiser instability | Samples, seed, denoiser | Temporal noise |
| **"Cheap"** | Stock flares, global bloom, the generic cyc | Effect presets | Judgement; detect bloom over text (`FX-*`) |

---

## 14. Medium-specific guidance

- **9:16 social (1080 × 1920).**
  - Viewed small, often bright-screen outdoors, mostly muted. Lighting must read at thumbnail size. Favour higher separation (raise the ΔL* target about 1.5× for small-subject frames, heuristic) and clear silhouettes.
  - Keep key light and glints out of UI overlay zones. `TYPO-*` and `vcr lint` own the safe zones. A light sweep crossing captions fights legibility.
  - Platform re-encoding crushes gradients and dark tones. Avoid near-black low-key with detail below about 5% Y′ (heuristic, cite `DELIVERY-*`).
- **16:9.** More room for motivated environment light and atmosphere. Volumetric shafts and background practicals read. Larger screens reveal noise and banding, so tighten the temporal-noise threshold.
- **Square.** Centred products favour symmetric clamshell or top-light. Add asymmetry through the rim to avoid the "stock" look.
- **Stills (resvg, sharp, ImageMagick, single-frame Cycles).** Allow the highest samples and Cycles. Noise and grain become texture to be judged at 100%. No temporal checks.
- **Loops.** Periodic light parameters, a fixed seed, and no history-dependent effects at the seam (§9). Check frame 0 against frame N.

---

## 15. The analysis and critique process (reviewer subagent)

1. **Load context.** Read the brief's light rig, palette, exposure and tone mapper (`BRIEF-*`), and the intent from `ART-*`. A low-key brief changes every threshold.
2. **Watch at speed first**, then scrub. Many lighting faults are temporal only: shimmer, flicker, denoiser boil, key flipping in an orbit, sweep timing. **Do not judge motion lighting from stills.**
3. **Run the automatic checks** (§12, §19) on sampled frames and scene data. Attach the numbers to findings.
4. **Read the image as a lighter would:**
   - Where is the key, and is it motivated?
   - What is the ratio?
   - What separates the subject?
   - Do materials read (glossy reflection shape, metal environment)?
   - Is there one focal brightness?
5. **Check brand fidelity:** ΔE on brand regions, and the logo face colour.
6. **Check consistency across shots and episodes:** direction, ratio, exposure.
7. **Write findings** in the form `[severity] LIGHT-RULE — observation (measurement) → suggested parameter change`.

**Severity guidance:**
- **Blocker:** brand ΔE over the `ART-*` limit; flicker that breaches `A11Y-*`; non-determinism; loop-seam pop; clipped highlights on the subject's brand surface; subject not separable in a 9:16 deliverable.
- **Major:** "lit from nowhere" or inconsistent direction; ratio outside the brief by more than 1 stop; visible denoiser boil; shadow acne or shimmer; missing contact shadow on a grounded product.
- **Minor:** generic look; flare or bloom overuse; slight noise; sweep timing.
- **Note:** taste suggestions.

**Vocabulary:** use the §13 terms, always paired with a parameter. For example: "Flat: key-to-fill measured 0.3 stops against brief 1.5; reduce `fill.intensity` by about 2.3×".

**Reviewer pitfalls:** over-applying the three-point rule to stylised flat work; penalising intentional low-key; reporting noise from a preview render; judging colour on an untagged PNG.

---

## 16. The creation process (workflow skill)

**Reference and asset inputs.** Use [Visual Research §3](../visual-research/README.md), `VREF-OBSERVATION-LOCATOR` and `VREF-INFERENCE-LIMITS` to describe observed light without claiming an unseen rig is known. [Image Direction §3–5](../image-direction/README.md) supplies required viewpoints and consistency constraints (`IMAGE-SET-COHERENCE`). Lighting owns the rig, exposure and tone mapping; Materials owns surface response and Art Direction owns composition. A cultural mood inference needs scoped evidence from [Cultural Context §2](../cultural-context/README.md).

1. **Brief → light story.** Pick the mood (high-key/low-key, warm/cool), the motivation and the focal point. Write the rig into the brief: azimuth, elevation, size, ratio in stops, rim, HDRI and rotation, EV, tone mapper, 2D angle.
2. **Choose the renderer:**
   - three.js for browser-native, interactive-style or data-driven 3D.
   - Eevee for stylised or fast animation.
   - Cycles for hero products, glass and caustics.
   - 2D for flat work.
3. **Set the pipeline first:**
   - Colour management: sRGB output; tagged textures.
   - The tone mapper (PBR Neutral for brand and product; AgX for HDR mood).
   - Exposure; physical units; meter scale.
4. **Block in the key alone.** Check silhouette and form, then add the fill to the target ratio, then the rim for separation, then the background light.
5. **Products:** shape reflections with large area lights or gradient cards; then add the contact shadow or shadow catcher.
6. **Add atmosphere and effects last, sparingly** (`FX-*`).
7. **Animate lights** with deterministic functions of `t`, periodic for loops. Check that camera moves (`MOTION-*`) do not flip the key.
8. **Lock determinism:** seed, samples, denoiser, versions.
9. **Preview at low samples with the same lights.** Then do final renders.
10. **Verify:** run the §12 checks, ΔE, determinism and the loop seam. Fix, then re-render.

---

## 17. Authoritative sources and canon

- **Fil Hunter, Steven Biver, Paul Fuqua, Robin Reid, *Light — Science & Magic*, 6th ed., Routledge 2021** [34]. The "family of angles" theory of reflection; the canonical text for lighting glossy products, metal, glass and the black-on-black and white-on-white extremes.
- **Jeremy Birn, *Digital Lighting & Rendering*, 3rd ed., New Riders 2013/2014** [33], and his three-point tutorial [32]. The CG lighting canon from a Pixar lighting TD: motivation, key, fill, rim and kick, linear workflow, faking GI.
- **Khronos PBR Neutral specification** [12] and **Emmett Lalish's write-up** [13]. The colour-faithful tone-mapping standard and the clearest explanation of why tone mapping shifts brand colour.
- **Blender Manual and release notes** [18][20]–[29]. Units, sampling, seed, light linking, the Eevee shadow model, AgX.
- **three.js docs and maintainer migration posts** [1][4]–[11]. Light units, tone mapping, colour management.
- **ASC lighting-ratio definition** (via [31], secondary). The additive convention used by cinematographers.
- **Poly Haven licence** [30]. The CC0 baseline for HDRIs.
- **Further canon, not verified in this session:** the ACES documentation (Academy), Troy Sobotka's AgX work, and Blain Brown, *Motion Picture and Video Lighting*. Add them to the ledger once checked.

---

## 18. Encoding for an AI agent: rules table

| ID | Check | Threshold | Tier | Applies to (measurable?) |
|---|---|---|---|---|
| `LIGHT-KEY-FILL-RATIO` | Source key:fill in stops matches the brief | ±0.5 stop of the brief; default range 1–3 stops (Birn 2:1–8:1 [32]) | heuristic | 3D (measurable: frame plus mask, or scene data) |
| `LIGHT-FILL-NOT-COMPETE` | The sum of fills is below the key | Σfill < key (Birn [32]) | heuristic | 3D (measurable: scene data) |
| `LIGHT-KEY-PLACEMENT` | Key off-axis and raised | 15–45° azimuth, 15–45° elevation, unless the brief overrides [32] | heuristic | 3D (measurable: scene data) |
| `LIGHT-MOTIVATED` | Each light has a stated motivation | Present in the rig notes | heuristic | All (judgement plus scene-data presence) |
| `LIGHT-SEPARATION` | Subject separated from the background | Median ΔL* ≥ 10; ≥ 70% of boundary with ΔL* ≥ 5 | heuristic | All (measurable: frames plus mask) |
| `LIGHT-CLIP-HIGHLIGHTS` | Clipped subject pixels | ≤ 0.5% of the subject, excluding small intended speculars | heuristic | All (measurable: frames) |
| `LIGHT-CRUSH-SHADOWS` | Crushed subject pixels | ≤ 1% unless low-key is declared | heuristic | All (measurable: frames and delivery video) |
| `LIGHT-TONEMAP-EXPLICIT` | The tone mapper is set deliberately, not left at default | `renderer.toneMapping ≠ NoToneMapping` for lit PBR scenes (the default is NoToneMapping [4]) | platform | three.js, Blender (measurable: scene data) |
| `LIGHT-TONEMAP-ONCE` | Tone map and sRGB encode applied exactly once | One `OutputPass` / output transform [6] | platform | three.js, compositing (measurable: scene graph) |
| `LIGHT-OUTPUT-COLORSPACE` | Output sRGB; colour textures tagged sRGB; data textures not | Per [6] | platform | three.js (measurable: scene data) |
| `LIGHT-PHYSICAL-UNITS` | Point and spot lights use decay 2 at metre scale | `decay === 2` [7]; scene units in metres [2] | platform | three.js (measurable) |
| `LIGHT-BRAND-NEUTRAL-TONEMAP` | Brand or product scenes use PBR Neutral, or brand surfaces are unlit | NeutralToneMapping / PBR Neutral LUT [5][13] | standard | 3D brand work (measurable: scene data) |
| `LIGHT-BRAND-BASECOLOR-HEADROOM` | Brand base colour channels in the faithful range | Each channel < sRGB 231 where the brand allows [13] | standard | 3D with PBR Neutral (measurable) |
| `LIGHT-BRAND-DELTAE` | Brand-region colour after tone mapping | ΔE2000 limit from `ART-*` | heuristic (method) | All (measurable: frames plus swatches) |
| `LIGHT-HDRI-LICENCE` | HDRI source and licence recorded | Manifest entry present (Poly Haven = CC0 [30]) | platform | 3D (measurable: manifest) |
| `LIGHT-HDRI-ROTATION-LOCKED` | HDRI rotation fixed per shot unless animated by intent | Constant across a shot's frames | heuristic | 3D (measurable: scene data over t) |
| `LIGHT-CONTACT-SHADOW` | Grounded objects have a contact shadow | Darkening at the contact zone ≥ 1 stop below the surrounding floor | heuristic | 3D product, 2D object-on-ground (measurable, approximate) |
| `LIGHT-SHADOW-ARTEFACTS` | No acne, peter-panning or shimmer | No periodic stripe pattern; shadow-edge temporal std within the noise limit | heuristic | three.js, Eevee (partly measurable) |
| `LIGHT-RECTAREA-LIMITS` | RectAreaLight used with PBR materials, the uniforms lib, and no shadow expected | Per [9] | platform | three.js (measurable) |
| `LIGHT-DIRECTION-CONSISTENT` | Key direction consistent across shots and episodes | ±15° from the rig | heuristic | 3D series (measurable: scene data) |
| `LIGHT-TWOD-DIRECTION` | All 2D shadow and highlight offsets share one angle | ±5° of `brief.light.angle` | heuristic | 2D DOM/SVG/canvas (measurable: computed styles / scene data) |
| `LIGHT-TWOD-LONG-SHADOW-ANGLE` | All long shadows share one angle and fade the same way | Equal angle ±2° | heuristic | 2D (measurable from scene data) |
| `LIGHT-SEED-FIXED` | Cycles seed fixed; animated seed off for deterministic or loop work | `use_animated_seed = False` [20] | platform | Cycles (measurable) |
| `LIGHT-TEMPORAL-NOISE` | Temporal noise and flicker below visibility | Flicker RMS ≤ 0.5% mean Y; pixel std ≤ 1.5 | heuristic | Path-traced and screen-space effects (measurable) |
| `LIGHT-DENOISE-TEMPORAL` | Animations use a temporally stable denoising strategy | Temporal denoise, or samples high enough that `LIGHT-TEMPORAL-NOISE` passes [36] | heuristic | Cycles animation (measurable via the noise check) |
| `LIGHT-DETERMINISM` | Re-rendering the same frame gives the same pixels | Identical hash; GPU path tracing PSNR ≥ 50 dB | heuristic | All (measurable) |
| `LIGHT-LOOP-SEAM` | Light parameters periodic; no seam pop | Superseded: use `MOTION-RHY-004`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | Loops (measurable) |
| `LIGHT-FLICKER-SAFETY` | Animated light flicker within photosensitivity limits | Superseded: use `A11Y-FLASH-GENERAL`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | All (measurable: luminance time series) |
| `LIGHT-SWEEP-LEGIBILITY` | Light sweeps do not obscure text at their peak | Superseded: use `TYPO-CONTRAST`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | 2D/3D logos and text (measurable: frames plus textBounds) |
| `LIGHT-EMISSIVE-HIERARCHY` | One brightest focal emitter per frame | Brightest emitter is the declared focal one | heuristic | All (measurable: Y maxima plus mask) |
| `LIGHT-BLOOM-RESTRAINT` | Bloom not applied to text or UI; threshold above mid-tones | Defer to `FX-*` | heuristic | All (partly measurable) |
| `LIGHT-FLARE-RESTRAINT` | Lens flares motivated by a visible bright source and not covering the brand | Judgement | heuristic | All (judgement only) |
| `LIGHT-GLOSSY-REFLECTION-SHAPE` | Glossy products show designed, continuous reflections | Judgement [34] | heuristic | 3D product (judgement only) |
| `LIGHT-DARK-ON-DARK-EDGE` | Dark product on dark background has edge definition | Separation passes on ≥ 70% of the boundary | heuristic | 3D product (measurable) |
| `LIGHT-NOT-STUDIO-GREY` | The look is not the generic default rig | Background value or colour from the brief; asymmetric key; not stock HDRI-only | heuristic | 3D (judgement plus scene-data hints) |
| `LIGHT-SERIES-RIG` | Episode lighting instantiates the brief rig | All rig fields within tolerance | heuristic | Series (measurable: scene data) |
| `LIGHT-PREVIEW-FINAL-PARITY` | Preview differs from final only in quality settings | Lights, exposure, tone mapper, HDRI and denoiser identical | heuristic | 3D (measurable: config diff) |

---

## 19. How to measure in VCR

General rules:
- Decode PNG frames to float, convert sRGB to linear (IEC 61966-2-1 transfer; not re-fetched in this session), and compute Y and CIELAB (D65).
- Subject masks come from scene data, never from guessing. For three.js, render an ID or mask pass with an override material at the same `t`. For Blender, use the Cryptomatte or object index pass. For DOM, use element bounds plus `textBounds()`.

**`LIGHT-KEY-FILL-RATIO`**
- *Inputs:* frame PNG; subject mask; lit/shadow split. The split comes from a three.js N·L pass (override material outputting `max(dot(N, L_key), 0)`) or a Blender diffuse-direct pass with the key soloed.
- *Calculation:* `stops = log2(median(Y | NL > 0.5) / median(Y | NL < 0.05))`, excluding the top 2% of Y (speculars). Alternative from scene data alone: render key-only and fill-only passes and take the ratio of mean diffuse irradiance on the mask.
- *Sampling:* 1 frame per shot plus 1 per significant light keyframe.
- *Failure modes:* albedo variation (a dark logo on the lit side) biases the result. Use a diffuse-lighting pass, or divide by albedo. Rim light contaminates the shadow side. Coloured lights make Y ambiguous.

**`LIGHT-CLIP-HIGHLIGHTS` / `LIGHT-CRUSH-SHADOWS`**
- *Inputs:* frame PNGs, plus the decoded delivery video (FFmpeg → RGB, with correct matrix and range).
- *Calculation:* per-channel ≥ 254 for clipping; Y′ ≤ 0.02 for crushing, within the mask. Then do connected-component analysis, so small specular glints and emitters are allowed.
- *Sampling:* every 0.5 s, plus all marker times.
- *Failure modes:* intended white backgrounds (high-key) trip the check, so scope it to the subject mask. Range errors in video decode (limited against full) produce false crush or clip. Cite `DELIVERY-*`.

**`LIGHT-SEPARATION` / `LIGHT-DARK-ON-DARK-EDGE`**
- *Calculation:* morphological dilate and erode of the mask by r px. Compare median L* inside and outside, globally and per 5% arc of the boundary.
- *Failure modes:* motion blur widens edges; depth of field blurs the background (often an intended means of separation, which this check does not credit). Fold in a sharpness term or accept it via the brief.

**`LIGHT-TEMPORAL-NOISE` / `LIGHT-DENOISE-TEMPORAL`**
- *Inputs:* consecutive frames in a window where the camera and lights are static (from scene data), or motion-compensated frames using a vector pass.
- *Calculation:* per-pixel temporal standard deviation over 5–9 frames in static regions; plus the global mean-Y time series, high-passed.
- *Sampling:* one 1-second window per shot.
- *Failure modes:* intended grain, flicker or sparkle (declare it in the brief); compression noise in decoded video, so measure on PNG masters first; moving subjects without vectors give false positives.

**`LIGHT-DIRECTION-CONSISTENT` (3D)**
- *Inputs:* light world transforms and the subject's transform per shot (`window.__scene` can expose a `lights()` accessor; Blender via Python export).
- *Calculation:* key direction in subject-local spherical coordinates, compared with the rig.
- *Failure modes:* image-based light has no explicit key, so use the HDRI rotation plus the brightest-texel direction.

**`LIGHT-TWOD-DIRECTION` / `LIGHT-TWOD-LONG-SHADOW-ANGLE`**
- *Inputs:* at sampled t, `getComputedStyle(el).boxShadow`, `.textShadow` and `.filter` for every visible element; SVG `feOffset dx/dy` and `feDropShadow`; canvas or Pixi values via a scene-exposed registry.
- *Calculation:* parse the offsets and compute `angle = atan2(−dy, −dx)`. Ignore zero-offset glows. Compare with the brief.
- *Failure modes:* transforms rotate shadows. A CSS `box-shadow` on a rotated element rotates with it, so compose with the element's transform matrix. Inset shadows invert direction.

**`LIGHT-BRAND-DELTAE`**
- *Inputs:* frame PNG; brand-region mask (unlit ID pass); swatches from the brief.
- *Calculation:* the median Lab of masked pixels that lie in the diffuse-lit region (exclude speculars and the shadow side), then ΔE2000 against the swatch.
- *Failure modes:* shaded 3D surfaces legitimately vary. Define *which* region represents the brand colour (the key-lit face). Coloured lighting and the white point (§1.5). Sample delivery video too, because chroma subsampling shifts small regions.

**`LIGHT-DETERMINISM`**
- *Calculation:* render frames {0, mid, last, random} twice in fresh processes and compare SHA-256. If they differ, compute PSNR.
- *Failure modes:* GPU driver or version drift, and multithreaded GPU path-tracing reductions. Record the environment fingerprint with every render.

**`LIGHT-LOOP-SEAM`**
- *Calculation:* compare `seek(0)` with `seek(duration)`, or with the frame after the last, depending on the loop convention in `DELIVERY-*`. Report mean ΔY and SSIM, plus scene-data equality of every animated light parameter.
- *Failure modes:* history-dependent effects (TAA, Eevee accumulation) differ only in sequential renders, not seeked ones. Test sequentially as well.

**`LIGHT-FLICKER-SAFETY`**
- *Calculation:* the per-frame luminance time series per screen region, passed to the `A11Y-*` flash analyser.

---

## 20. VCR-specific rendering and delivery notes

- **Seek-based rendering.** Every light must be a pure function of `t`.
  - No `requestAnimationFrame` accumulation, no `Math.random()` flicker, no physics-driven lights.
  - Temporal effects that rely on frame history (TAA, three.js temporal post, Eevee viewport accumulation) can differ between seeked and sequential playback. Either disable them or render with enough per-frame samples.
  - Shadow maps must be updated every seek (`shadow.needsUpdate` when `autoUpdate` is off).
- **Fixed fps.**
  - Sweep and flicker frequencies must be chosen against fps. A flicker faster than fps/2 aliases.
  - A specular glint crossing a logo in fewer than about 3 frames is invisible or strobes (heuristic; timing owned by `MOTION-*`).
  - At 24 fps, fast light sweeps need motion blur (Cycles or Eevee motion blur, or a stretched band in 2D).
- **`yuv420p` H.264.**
  - Chroma is subsampled, so coloured rim lights and thin glows lose saturation and bleed.
  - Smooth light gradients (cyc sweeps, glows) band at 8-bit. Add a tiny deterministic dither (seeded blue noise, about ±0.5 LSB) before encode.
  - Dark low-key detail is at risk under limited range and platform re-encoding (`DELIVERY-*`).
- **ProRes 4444 alpha masters.** Shadow catchers and glows need premultiplied-alpha handling, otherwise glows get dark fringes. Check the `DELIVERY-*` alpha convention.
- **Platform re-encode.** Re-encoding at lower bitrates removes fine noise but turns grain and denoiser boil into blocky crawl. Lighting that passes on the master can fail after upload, so check the decoded delivery as well.
- **Headless Chromium.** WebGL in headless mode may use software rendering (SwiftShader) or a different GPU path than desktop. Pin the GPU flags, and test determinism across the render farm. Float render targets (`HalfFloatType` [4]) are needed for HDR post before tone mapping.

---

## 21. Master checklists

**Analysis (reviewer)**
- [ ] Brief rig loaded; intent (high-key/low-key) noted — `LIGHT-SERIES-RIG`
- [ ] Watched at speed; temporal issues noted — `LIGHT-TEMPORAL-NOISE`, `LIGHT-SHADOW-ARTEFACTS`
- [ ] Key motivated, placement plausible — `LIGHT-MOTIVATED`, `LIGHT-KEY-PLACEMENT`
- [ ] Ratio measured — `LIGHT-KEY-FILL-RATIO`, `LIGHT-FILL-NOT-COMPETE`
- [ ] Separation measured — `LIGHT-SEPARATION`, `LIGHT-DARK-ON-DARK-EDGE`
- [ ] Clipping and crush — `LIGHT-CLIP-HIGHLIGHTS`, `LIGHT-CRUSH-SHADOWS`
- [ ] Brand ΔE — `LIGHT-BRAND-DELTAE`, `LIGHT-BRAND-NEUTRAL-TONEMAP`
- [ ] Direction consistency — `LIGHT-DIRECTION-CONSISTENT`, `LIGHT-TWOD-DIRECTION`
- [ ] Grounding — `LIGHT-CONTACT-SHADOW`
- [ ] Effects restraint — `LIGHT-BLOOM-RESTRAINT`, `LIGHT-FLARE-RESTRAINT`, `LIGHT-EMISSIVE-HIERARCHY`
- [ ] Sweeps legible — `LIGHT-SWEEP-LEGIBILITY`
- [ ] Loop seam, flicker safety, determinism — `LIGHT-LOOP-SEAM`, `LIGHT-FLICKER-SAFETY`, `LIGHT-DETERMINISM`
- [ ] Not generic — `LIGHT-NOT-STUDIO-GREY`

**Creation (agent)**
- [ ] Rig written into the brief — `LIGHT-SERIES-RIG`
- [ ] Output colour space and texture tags — `LIGHT-OUTPUT-COLORSPACE`
- [ ] Tone mapper chosen and applied once — `LIGHT-TONEMAP-EXPLICIT`, `LIGHT-TONEMAP-ONCE`
- [ ] Physical units and metre scale — `LIGHT-PHYSICAL-UNITS`
- [ ] Brand surfaces in headroom — `LIGHT-BRAND-BASECOLOR-HEADROOM`
- [ ] HDRI licensed and rotation locked — `LIGHT-HDRI-LICENCE`, `LIGHT-HDRI-ROTATION-LOCKED`
- [ ] RectAreaLight limits respected — `LIGHT-RECTAREA-LIMITS`
- [ ] Contact shadows — `LIGHT-CONTACT-SHADOW`
- [ ] Glossy reflections designed — `LIGHT-GLOSSY-REFLECTION-SHAPE`
- [ ] 2D light angle token used everywhere — `LIGHT-TWOD-DIRECTION`, `LIGHT-TWOD-LONG-SHADOW-ANGLE`
- [ ] Seed fixed; denoise strategy — `LIGHT-SEED-FIXED`, `LIGHT-DENOISE-TEMPORAL`
- [ ] Preview/final parity — `LIGHT-PREVIEW-FINAL-PARITY`
- [ ] Loops periodic — `LIGHT-LOOP-SEAM`

---

## 22. Caveats

- **The definition of the lighting ratio conflicts** between the ASC additive convention and the source convention [31]. Tutorials mix them, so this document fixes the source convention in stops.
- **Almost all measurement thresholds are VCR proposals** with no external source: clip %, ΔL*, flicker RMS, angle tolerances, PSNR. Calibrate them on a reviewed corpus before making them blocking.
- **Version drift is high.**
  - three.js changes lighting, shadow and colour APIs often: r152 colour, r155/r165 lights, and the r182 `PCFSoftShadowMap` deprecation (official migration guide: "PCFSoftShadowMap with WebGLRenderer is now deprecated").
  - Blender changed Eevee completely in 4.2, and the Blender 5.x manual is already live [20]. Blender's official 5.0 colour-management release notes add "New ACES 1.3 and 2.0 views, as an alternative to AgX and Filmic and for compatibility with ACES pipelines" (Blender 5.0, released 18 November 2025).
  - OIDN 3 temporal denoising was announced in January 2026 and has not yet shipped (secondary).
  - Pin versions in every project.
- **AgX against Neutral is partly taste.** Lalish (the Neutral author) frames ACES and AgX saturation loss as a problem for commerce [13]. AgX proponents frame its low contrast as a better grading base [17]. Both are right in their own context.
- **Some setup placements lack primary sources here:** Rembrandt/loop specifics, clamshell, and dark-on-dark ratios are practitioner lore. Light: Science and Magic covers the extremes, but its specific numbers were not checked.
- **The audience evidence is weak.** No study was found on how lighting choices affect short-form retention or ad performance. Everything here about what "reads" is expert taste, not audience data.
- **GPU path-tracing determinism** across machines is not guaranteed by any source found. Treat it as empirical.
- **Agent risks:**
  - Generic studio-grey output.
  - Over-applying three-point lighting to flat 2D.
  - Copying pre-r155 intensity values.
  - Leaving `NoToneMapping` at its default.
  - Judging flicker from stills.
  - Using `Math.random()` in light animation.
  - Adding a lens flare by default.

---

## 23. Verification ledger (checked 6 November 2026)

| Claim | Result | Source |
|---|---|---|
| r155 changes the `useLegacyLights` default to false; deprecated; removal planned for r165 | confirmed (forum announcement) | [1] |
| Multiply legacy ambient, hemisphere and directional intensities by π | confirmed | [1] |
| `useLegacyLights` removed in r165 | confirmed (secondary: A-Frame issue) | [3] |
| Physically correct requires 1 unit = 1 m and decay 2 | confirmed (PR discussion) | [2] |
| r152: `outputColorSpace` defaults to `SRGBColorSpace`; THREE.Color is Linear-sRGB | confirmed | [6] |
| `toneMapping` default NoToneMapping; AgX and Neutral options | confirmed | [4] |
| NeutralToneMapping based on the Khronos 3D Commerce standard | confirmed | [5] |
| PointLight intensity in candela, default 1; decay default 2; power in lumens | confirmed | [7] |
| SpotLight intensity in candela | confirmed | [8] |
| RectAreaLight: no shadows; PBR only; uniforms lib required | confirmed (subagent fetch) | [9] |
| DirectionalLight and HemisphereLight intensity: no unit stated; Hemisphere casts no shadows | confirmed (subagent fetch) | [10][11] |
| `power = intensity × 4π` (point light) | unverified in the current docs (only in an older docs mirror); consistent with 1 cd isotropic = 4π lm [39] | [39] |
| PCFSoftShadowMap deprecated in r182 | confirmed (enricher: official three.js migration guide r181→r182, "PCFSoftShadowMap with WebGLRenderer is now deprecated. Use PCFShadowMap which is now soft as well."; r182 released 10 Dec 2025) | three.js Migration Guide |
| PBR Neutral F90 = 0.04, Ks = 0.8 − F90, Kd = 0.15 | confirmed | [12] |
| Below sRGB 231 faithful; 255 → 243 | confirmed | [13] |
| ACES makes canary yellow, bright greens and blues unreachable | confirmed (author's analysis) | [13] |
| Khronos PBR Neutral released 16 May 2024 | confirmed | [14] |
| AgX replaces Filmic as Blender default in 4.0 | confirmed | [18] |
| Blender 5.0 adds ACES 1.3/2.0 views | confirmed (enricher: Blender 5.0 Color Management release notes, "New ACES 1.3 and 2.0 views, as an alternative to AgX and Filmic") | Blender 5.0 release notes |
| Cycles seed, animated seed per frame; not compatible with Blue-Noise | confirmed (5.2 manual search extract; full-page fetch returned navigation only) | [20] |
| Noise threshold typical 0.1 to 0.001 | confirmed | [21][22] |
| Adaptive sampling 10–30% time reduction | confirmed (Blender's test scenes) | [22] |
| Light linking in Cycles 4.0; shadow linking slower | confirmed | [23][24] |
| Light linking in Eevee from 4.3 | confirmed (enricher: Blender 4.3 EEVEE release notes, "Light & Shadow Linking. There is now feature parity with Cycles.") | [42] |
| Blender light units: W radiant flux; sun W/m²; overcast 250, direct 1000+ | confirmed (3.0 manual) | [25] |
| 1500 lm PAR38 = 4 W; 2500 lm tube = 4.5 W | confirmed (search extract of the current manual) | [26] |
| Eevee 4.2: virtual shadow maps, shadow map ray tracing, contact shadows removed | confirmed | [27] |
| Eevee jitter per-light, off by default | confirmed | [28] |
| Poly Haven CC0, no credit required | confirmed | [30] |
| Birn: key 15–45°/15–45°; fill ≤ ½ (2:1), ⅛ (8:1); rim "as bright as necessary" | confirmed (subagent fetch) | [32] |
| ASC ratio = (key+fill):fill | confirmed (secondary: Wikipedia) | [31] |
| Rec. 709 luminance weights; sRGB transfer function | unverified this session (standard formulas, not re-fetched) | — |
| Temporal denoise operator `denoise_animation` | confirmed (secondary tutorial) | [36] |
| OIDN 3 temporal denoising announced | confirmed as an announcement (secondary); shipping status unverified | [35] |
| All §12 numeric thresholds | not found (VCR proposals) | — |

---

## 24. Sources

1. three.js forum, "Updates to lighting in three.js r155" — https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733
2. three.js PR #24975, "WebGLRenderer: .physicallyCorrectLights → .useLegacyLights" — https://github.com/mrdoob/three.js/pull/24975
3. A-Frame issue #5546 (secondary: r165 removal) — https://github.com/aframevr/aframe/issues/5546
4. three.js docs, WebGLRenderer — https://threejs.org/docs/pages/WebGLRenderer.html
5. three.js docs, global constants — https://threejs.org/docs/pages/global.html
6. three.js forum, "Updates to Color Management in three.js r152" — https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791
7. three.js docs, PointLight — https://threejs.org/docs/pages/PointLight.html
8. three.js docs, SpotLight — https://threejs.org/docs/pages/SpotLight.html
9. three.js docs, RectAreaLight — https://threejs.org/docs/pages/RectAreaLight.html
10. three.js docs, DirectionalLight — https://threejs.org/docs/pages/DirectionalLight.html
11. three.js docs, HemisphereLight — https://threejs.org/docs/pages/HemisphereLight.html
12. Khronos Group, PBR Neutral specification — https://github.com/KhronosGroup/ToneMapping/blob/main/PBR_Neutral/README.md
13. Emmett Lalish, "Tone Mapping Considerations for Physically-Based Rendering" — https://modelviewer.dev/examples/tone-mapping
14. Khronos press release, May 2024 — https://www.khronos.org/news/press/2024/05/
15. "Neutral Tone Mapping for PBR Color Accuracy", SIGGRAPH 2024 talk — https://dl.acm.org/doi/fullHtml/10.1145/3641233.3664313
16. three.js issue #27362, "Support AgX tone mapping" — https://github.com/mrdoob/three.js/issues/27362
17. three.js forum, "Tone Mapping Overview" — https://discourse.threejs.org/t/tone-mapping-overview/75204
18. Blender 4.0 release notes, Color Management — https://developer.blender.org/docs/release_notes/4.0/color_management/
19. Blender 4.0 release page — https://www.blender.org/download/releases/4-0/
20. Blender 5.2 Manual, Cycles Sampling — https://docs.blender.org/manual/en/latest/render/cycles/render_settings/sampling.html
21. Blender 3.6 Manual, Cycles Sampling — https://docs.blender.org/manual/en/3.6/render/cycles/render_settings/sampling.html
22. Blender 2.83 release notes, Cycles — https://developer.blender.org/docs/release_notes/2.83/cycles/
23. Blender 4.0 Manual, Light Linking — https://docs.blender.org/manual/en/4.0/render/cycles/object_settings/light_linking.html
24. Blender 4.0 release notes, Cycles — https://developer.blender.org/docs/release_notes/4.0/cycles/
25. Blender 3.0 Manual, Light Objects — https://docs.blender.org/manual/en/3.0/render/lights/light_object.html
26. Blender 5.2 Manual, Light Objects — https://docs.blender.org/manual/en/latest/render/lights/light_object.html
27. Blender 4.2 LTS release notes, EEVEE — https://developer.blender.org/docs/release_notes/4.2/eevee/
28. Blender 4.2 EEVEE migration notes — https://developer.blender.org/docs/release_notes/4.2/eevee_migration/
29. Blender 4.2 Manual, EEVEE Light Settings — https://docs.blender.org/manual/en/4.2/render/eevee/light_settings.html
30. Poly Haven, Asset License — https://polyhaven.com/license
31. Wikipedia, "Lighting ratio" (secondary) — https://en.wikipedia.org/wiki/Lighting_ratio
32. Jeremy Birn, "Three-Point Lighting for 3D Renderings" — https://www.3drender.com/light/3point.html
33. Jeremy Birn, *Digital Lighting and Rendering*, 3rd ed. (publisher preview) — https://api.pageplace.de/preview/DT0400.9780133439199_A23586019/preview-9780133439199_A23586019.pdf
34. Hunter, Biver, Fuqua, Reid, *Light — Science & Magic*, 6th ed. (Routledge; publisher preview) — https://www.routledge.com/Light----Science--Magic-An-Introduction-to-Photographic-Lighting/Hunter-Biver-Fuqua-Reid/p/book/9780367860271 ; https://api.pageplace.de/preview/DT0400.9781000342673_A41248188/preview-9781000342673_A41248188.pdf
35. CG Channel, "Open Image Denoise 3 will support temporal denoising" (secondary) — https://www.cgchannel.com/2026/01/open-image-denoise-3-will-support-temporal-denoising/
36. Artisticrender, "How to denoise an animation in Blender using temporal denoising" (secondary) — https://artisticrender.com/how-to-denoise-an-animation-in-blender-using-temporal-denoising/
37. Blender Artists, "Flickering noise on cycles animation" (secondary) — https://blenderartists.org/t/flickering-noise-on-cycles-animation/1383040
38. Creative Bloq, "How to set up a shadow catcher in Blender" (secondary) — https://www.creativebloq.com/3d/how-to-set-up-a-shadow-catcher-in-blender
39. Wikipedia, "Lumen (unit)" (secondary) — https://en.wikipedia.org/wiki/Lumen_(unit)
40. ui-skills, "threejs-lighting" skill (secondary) — https://www.ui-skills.com/skills/cloudai-x/threejs-lighting
41. Blender 4.2 LTS release page — https://www.blender.org/download/releases/4-2/
42. Blender 4.3 release notes, EEVEE — https://developer.blender.org/docs/release_notes/4.3/eevee/
43. Urna, "Blender lighting" guide (secondary) — https://geturna.com/en/guides/blender-lighting

## 25. Citation links

The escaped `\[n\]` markers in the text point to this list; plain `[n]` markers point to §24.

1. [Digital Lighting and Rendering](https://api.pageplace.de/preview/DT0400.9780133439199_A23586019/preview-9780133439199_A23586019.pdf)
2. [Lighting Rendering: 3D Light Types, Techniques & Setups|ArchiVinci](https://www.archivinci.com/blogs/lighting-rendering)
3. [Three Point Lighting Tutorial](https://www.3drender.com/light/3point.html)
4. [PBR Neutral Tone Mapping](https://modelviewer.dev/examples/tone-mapping)
5. [global](https://threejs.org/docs/pages/global.html)
6. [Updates to lighting in three.js r155 - Discussion - three.js forum](https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733)
7. [Remove renderer physicallyCorrectLights property and update default lighting setup (r165) · Issue #5546 · aframevr/aframe · GitHub](https://github.com/aframevr/aframe/issues/5546)
8. [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
9. [PointLight](https://threejs.org/docs/pages/PointLight.html)
10. [Updates to Color Management in three.js r152 - Discussion - three.js forum](https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791)
11. [Sampling - Blender 5.2 LTS Manual](https://docs.blender.org/manual/en/latest/render/cycles/render_settings/sampling.html)
12. [How to denoise an animation in Blender using temporal denoising - Artisticrender.com](https://artisticrender.com/how-to-denoise-an-animation-in-blender-using-temporal-denoising/)
13. [Lighting ratio](https://en.wikipedia.org/wiki/Lighting_ratio)
14. [Lighting Ratio Calculator - Luminxel](https://luminxel.com/tools/lighting-ratio-calculator/)
15. [Light Objects - Blender 5.2 LTS Manual](https://docs.blender.org/manual/en/latest/render/lights/light_object.html)
16. [Blender lighting: light types, soft shadows, 3-point setup](https://geturna.com/en/guides/blender-lighting)
17. [threejs-game-studio/references/tone-mapping-color.md at main · chrislaupama/threejs-game-studio · GitHub](https://github.com/chrislaupama/threejs-game-studio/blob/main/references/tone-mapping-color.md)
