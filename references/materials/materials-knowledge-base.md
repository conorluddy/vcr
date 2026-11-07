# MAT: Materials, Shading and Surface Appearance for Code-First 3D and Stylised Motion Graphics

A surface reads as believable when four things hold: its base colour sits in the measured range for its material class, its metalness is 0 or 1, its data textures are decoded as data rather than colour, and its highlights stay stable from frame to frame. An agent can check all four from scene data and rendered frames. Taste comes after that, and so does the choice to go stylised, which is often the stronger option for motion graphics.

> **Status.** Seed document for the `MAT-*` pillar (`references/materials/`). **Scope:** how surfaces are specified and shaded in three.js, Blender and other code-first tools: PBR parameters, standards and interchange, product materials, textures, stylised shading, colour accuracy on lit surfaces, imperfection, materials in motion, performance, measurement and critique. **Out of scope:** light (`LIGHT-*`), 2D compositing, halftone and post effects (`FX-*`), palette (`ART-*`), encoding (`DELIVERY-*`), timing (`MOTION-*`). **Tiers:** `standard` means a published specification checked against the primary source (Khronos glTF 2.0 and KHR extensions, Khronos PBR Neutral, OpenPBR, the CIEDE2000 paper). `platform` means vendor or tool documentation that can change without notice (three.js, Blender, Filament, Unreal, Adobe, Poly Haven). `heuristic` means a practitioner rule, a secondary source, or a VCR default that still needs calibration. Researched 6 November 2026, against three.js docs at r187 and the Blender Manual 5.2 LTS.

## TL;DR

- **Correct values come first, look second.** Dielectric base colour belongs in sRGB 50–240 (strict) or 30–240 (tolerant), and metals at 170–255 sRGB luminosity (Filament). Metallic is 0 or 1. Every data map (normal, roughness, metallic, AO) is `NoColorSpace`/Non-Color. Normal maps follow OpenGL +Y for glTF, Blender and three.js. These four checks catch most "looks CG" failures, and all of them can be measured.
- **Brand colour on a lit 3D surface is a pipeline problem.** Fresnel desaturates base colour, filmic tone mappers shift hue, and `yuv420p` smears chroma. When brand colour must match, use Khronos PBR Neutral (three.js `NeutralToneMapping`) under neutral light and verify CIEDE2000 on rendered and decoded frames. Metals and coloured specular cannot match a flat swatch everywhere.
- **Judge materials in motion, not from stills.** Specular crawl, transmission shimmer and moiré appear only across frames, so measure temporal variance and texel-to-pixel ratios. Prefer stylised shading (toon, matcap, clay, gradient) when clarity, speed or series consistency matter more than photoreal product fidelity.

## Key Findings

1. **glTF 2.0 is the interchange baseline.** For metals, base colour is "the specific measured reflectance value at normal incidence (F0)". For non-metals it "represents the reflected diffuse color of the material". The material is `mix(dielectric_brdf, metal_brdf, metallic)` with α = roughness². `standard`.\[1\]
2. **Filament gives the most usable ranges.** Non-metal base colour "should be an sRGB value in the range 50-240 (strict range) or 30-240 (tolerant range)". Metals: "Use values with a luminosity of 67% to 100% (170-255 sRGB)". Reflectance below 0.35 (2%) "should be avoided as no real-world materials have such low reflectance". `platform`.\[2\]\[3\]
3. **Default dielectric F0 is 4%.** Unreal's "default Specular of 0.5 … represents approximately 4% specular reflection. This value is accurate for a vast majority of materials". To make a diffuse material, raise roughness; do not zero specular. `platform`.\[4\]
4. **Metalness is binary in practice.** Filament: "Pure, unweathered surfaces are rare and will be either 0.0 or 1.0. Rust is not a conductor." `platform`.\[5\]
5. **Colour-space tagging is the commonest silent bug.** In three.js r152+, textures default to `NoColorSpace`, so colour maps must be set to `SRGBColorSpace`.\[6\] `platform`.
6. **Khronos PBR Neutral is built for colour fidelity.** It targets "precise sRGB base color reproduction under grayscale lighting".\[7\] three.js exposes it as `NeutralToneMapping`, while the renderer default is `NoToneMapping`. `standard`/`platform`.\[8\]\[9\]
7. **`MeshPhysicalMaterial` is expensive.** It "has a higher performance cost, per pixel, than other three.js materials … always specify an environment map". Transmission adds a render pass, which `transmissionResolutionScale` can shrink. `platform`.\[9\]\[10\]
8. **Export from Blender to three.js is partial.** Blender's glTF exporter writes clearcoat, transmission, volume, IOR, specular, sheen, emissive strength and anisotropy. Sheen and specular are "not fully compatible", and procedural nodes, SSS and thin film do not survive without baking. `platform`.\[11\]\[12\]
9. **Fix specular aliasing by widening roughness where the normal varies within a pixel** (Kaplanyan 2016; Tokuyoshi & Kaplanyan 2019).\[13\]\[14\] Stock three.js materials do not do this. `heuristic` for constants.
10. **Use reference data; never invent values.** Sources: physicallybased.info, Filament, Unreal and Lagarde. They disagree at the dark end (fresh asphalt is linear 0.043), so treat the albedo floor as a warning. `platform`/`heuristic`.\[15\]

---

## 1. Physically based rendering

### 1.1 Why it matters for VCR
A series reuses one material library across many lighting set-ups (`BRIEF-*`, `LIGHT-*`). Unreal notes that physically based materials "will work equally well in all lighting environments", and that this holds "even for non-photorealistic rendering".\[16\] If a material looks right under one HDRI and wrong under another, lighting has been baked into it.

### 1.2 Microfacet model
The specular term is Cook–Torrance: `f = D·F·G / (4(n·l)(n·v))`.
- **D:** GGX/Trowbridge-Reitz (Walter et al. 2007; Burley 2012; Karis 2013). Karis chose it as "fairly cheap", with a "longer tail [that] looks much more natural".\[17\] A hard-edged highlight with no halo reads as old CG.
- **F:** Fresnel via Schlick. Every material approaches 100% reflectance at grazing angles.\[18\] Filament: Fresnel "is 1.0 at 90°". Removing the rim (specular 0) makes surfaces look chalky and flat.
- **G:** Smith masking-shadowing, approximated by Schlick in Karis.\[17\]\[19\]
- **Roughness:** α = roughness² (glTF, Karis), so roughness 0.5 is α 0.25, which is still fairly glossy.\[20\]\[21\]

### 1.3 Energy conservation
glTF uses `c_diff = lerp(baseColor, black, metallic)`, and metals have no diffuse term.\[22\] Never add fake "shine" multipliers. A material that looks too dark is an exposure or lighting problem (`LIGHT-*`).

### 1.4 Parameters
| Parameter | Meaning | Encoding | Notes |
|---|---|---|---|
| Base colour | Diffuse albedo (dielectric) or F0 (metal) | sRGB texture; linear factor | No lighting baked in "except for micro-occlusion" (Filament) |
| Metallic | 0 dielectric, 1 conductor | Linear | Intermediate values only for transitions |
| Roughness | Microsurface spread | Linear | α = r² |
| Normal | Tangent-space detail | Linear | glTF: +Y up, MikkTSpace |
| Occlusion | Indirect-light AO | Linear, R channel | |
| Emissive | Self-illumination | sRGB texture | Core factor clamped to [0,1]; `KHR_materials_emissive_strength` lifts it |
| Specular/reflectance | Dielectric F0 | Linear | Filament `f0 = 0.16·reflectance²`; 0.5 = 4%\[5\]\[23\] |

### 1.5 Specular-glossiness
This model stores RGB specular and glossiness separately. It is more expressive but lets artists author impossible combinations (coloured F0 on a dielectric). glTF core "uses the metallic-roughness material model",\[21\] and spec-gloss moved to an extension that transmission "must not be used" with. `KHR_materials_specular` and `KHR_materials_ior` restore controlled specular.\[24\] **Rule:** author in metallic-roughness and convert legacy assets on import.

### 1.6 Plausible values (quoted exactly)
- **Dielectric albedo:** Filament main docs: "50-240 (strict range) or 30-240 (tolerant range)". Filament's chart page: "Non-metal range 10 - 240" (this contradicts the main docs).\[3\]\[5\] Adobe Validate node: "Albedo Dark Range Threshold: 50 sRGB, 30 sRGB".\[25\] Lagarde (2011): "a range for diffuse color in sRGB of 50-240".\[26\] Adobe PBR Guide (secondary quote): "For bright colors, you should not have any values that are higher than 240 sRGB."\[18\]
- **Why not pure black or white:** no natural surface absorbs or reflects everything.\[27\] An albedo of 255 is brighter than snow and blows out. **Counter-evidence:** physicallybased.info lists Asphalt (Fresh) at linear "0.043 0.041 0.040" and Blackboard at "0.039 0.039 0.039", both below sRGB 50.\[15\] Racoon Artworks argues that diffuse-only charcoal can sit "near sRGB 25".\[18\] So the floor is a warning.
- **Metals:** Filament: "170-255 sRGB". Adobe: "70-100% Reflective, 60-100% Reflective".\[25\]
- **Filament metal sRGB values:** Silver 250,249,245; Aluminum 244,245,245; Platinum 214,209,200; Iron 192,189,186; Titanium 206,200,194; Copper 251,216,184; Gold 255,220,157; Brass 244,228,173.\[5\]
- **Unreal metal linear values (secondary copy of the UE4 docs):** Iron (0.560, 0.570, 0.580); Silver (0.972, 0.960, 0.915); Aluminum (0.913, 0.921, 0.925); Gold (1.000, 0.766, 0.336), which matches the glTF gold example; Copper (0.955, 0.637, 0.538); Chromium (0.550, 0.556, 0.554).\[1\]\[28\]
- **Filament non-metal sRGB values:** Coal 50,50,50; Rubber 53,53,53; Mud 85,61,49; Wood 135,92,60; Vegetation 123,130,78; Brick 148,125,117; Sand 177,168,132; Concrete 192,191,187.\[5\]
- **Dielectric F0 (Filament chart):** Water 2%; Glass 3.5%; Defaults 4%; Ruby 8%; Diamond 16%; Gemstones 5% to 16%. Below 2% is "No real-world material".\[5\]
- **Pitfall:** photo pixels are not base colour. Unreal describes base colour as "the color when photographed using a polarizing filter".\[29\]

---

## 2. Standards and interchange

### 2.1 glTF core
`baseColorFactor` is linear RGBA.\[30\] `metallicRoughnessTexture` stores **metal in B and roughness in G**,\[31\] and AO goes in R, which together make ORM.\[32\] Absent textures default to 1.0.\[1\] Normal maps are tangent space with +Y up.\[33\] The spec states: "The glTF alphaMode is used for alpha-as-coverage, NOT for physically-based transparency."\[34\]

### 2.2 KHR extensions and their mappings
| Extension | Purpose | three.js `MeshPhysicalMaterial` | Blender Principled BSDF |
|---|---|---|---|
| clearcoat | Clear top layer | `clearcoat`, `clearcoatRoughness`, `clearcoatNormalMap` | Coat Weight / Roughness / Normal (texture R and G) |
| transmission | Thin physical transparency | `transmission` | Transmission Weight |
| volume | Thickness and absorption | `thickness`, `attenuationColor`, `attenuationDistance` | Needs transmission set plus glTF Material Output thickness |
| ior | Dielectric IOR | `ior` (1.0–2.333, default 1.5) | IOR\[10\] |
| specular | Dielectric F0 strength and colour | `specularIntensity`, `specularColor` | IOR Level, Specular Tint |
| sheen | Cloth rim | `sheen`, `sheenColor`, `sheenRoughness` | Sheen ("not fully compatible") |
| iridescence | Thin film | `iridescence`, `iridescenceIOR` (default 1.3), 100–400 nm\[10\] | Thin Film (Cycles only); no exporter path found |
| emissive_strength | Emission above 1.0 | `emissiveIntensity` | Emission Strength |
| anisotropy | Brushed highlights | `anisotropy`, `anisotropyRotation` | Anisotropic |
| unlit | No lighting | `MeshBasicMaterial` | Camera-ray mix; "avoid using the Principled BSDF node" |

Exclusions: emissive_strength "must not be used on a material that also uses KHR_materials_unlit". Transmission must not be combined with unlit or spec-gloss.\[34\]\[35\]

### 2.3 OpenPBR and MaterialX
OpenPBR Surface (ASWF) unifies Autodesk Standard Surface and Adobe Standard Material.\[36\] Its preview came in October 2023, v1.0 in August 2024, and the current version is v1.1. Defaults: `base_color` (0.8,0.8,0.8), `base_metalness` 0, `specular_roughness` 0.3, `specular_ior` 1.5.\[37\] Metals use `base_color` at facing angles and `specular_color` as the **edge tint**.\[36\] glTF has no edge tint, so coloured metals lose edge character in glTF. MaterialX hosts both models, and Standard Surface's `specular_roughness` default is 0.2.\[38\] **Rule:** never assume defaults carry between models; write every parameter explicitly.

### 2.4 Blender Principled BSDF (4.0+)
Blender 4.0 notes: "Coat was placed above the emission layer … emissive phone screen behind glass". Sheen "is the top layer above emission and coat" and works for dust. A single IOR drives specular, with IOR Level for texturing.\[39\] IOR "default value of 1.5 is a good approximation for glass". Thin Film is Cycles only, with its default IOR of 1.33 described as "a good approximation for water".\[40\]

### 2.5 three.js
`MeshStandardMaterial` covers the glTF core. `MeshPhysicalMaterial` adds anisotropy, clearcoat, diffuse roughness, dispersion, iridescence, IOR, sheen, specular, thickness and transmission. Gotchas: "When transmission is non-zero, `opacity` should be set to `1`". `thickness` 0 means "thin-walled". `sheenColor` defaults to black, so sheen alone does nothing. `iridescenceThicknessRange` was deprecated in r187.\[10\]

### 2.6 What survives Blender → glTF → three.js
| Reliable | Caveated | Lost without baking |
|---|---|---|
| Base, metallic, roughness, normal, emissive with strength, alpha coverage, clearcoat, transmission, IOR, volume | Sheen, specular tint, anisotropy direction, AO (needs ORM or the glTF output node) | Procedural textures, colour ramps, mix-shader tricks, SSS, thin film, Toon BSDF, Shader-to-RGB, displacement |

Verify with `MAT-ROUNDTRIP-FIDELITY` (§10).

---

## 3. Product materials

Roughness ranges marked (h) are practitioner heuristics; tune them against reference photos. Lighting belongs to `LIGHT-*`.

| Material | Metal | Base colour | Roughness | Extras | Reads as real when |
|---|---|---|---|---|---|
| Glossy plastic | 0 | Pigment, 30/50–240 sRGB | 0.05–0.25 (h) | F0 4% | Soft-edged highlight, strong rim, faint roughness variation |
| Matte plastic | 0 | Same | 0.5–0.8 (h) | — | Broad dim highlight, rim still present |
| Soft-touch | 0 | Usually dark, ≥30 | 0.7–0.95 (h) | Low sheen | Almost no highlight core; fingerprints glossier |
| Rubber | 0 | Filament 53,53,53 | 0.6–0.9 (h) | — | Dull grey sheen, dust shows |
| Anodised aluminium | 1 | Tinted F0, or dye under clearcoat | 0.2–0.45 (h) | Optional anisotropy | Colour persists in reflections; bevel highlights |
| Brushed metal | 1 | Aluminium 244,245,245; iron 192,189,186 | 0.25–0.5 (h) | Anisotropy 0.5–1 (h) | Highlights stretch across the brushing direction |
| Chrome | 1 | Chromium linear 0.55 | 0–0.08 (h) | Environment map required | Reads only through its reflections |
| Clear glass | 0 | White | 0–0.05 | Transmission 1, IOR 1.5, thickness > 0, opacity 1 | Fresnel-dark centre, bright rim, refraction |
| Frosted glass or plastic | 0 | White or tint | 0.2–0.5 (h) | Transmission 1 | Blurred refraction, crisp rim |
| Glazed ceramic | 0 | Glaze | 0.05–0.2 (h) | Clearcoat over rougher base | Sharp highlight over diffuse body |
| Fabric | 0 | Desaturated dye | 0.6–1.0 (h) | Sheen plus `sheenColor`\[41\] | Rim brightening, weave only up close |
| Leather | 0 | Hide colour | 0.4–0.7 (h) | Optional low clearcoat | Pore normals; glossier at contact points |
| Paper or card | 0 | Cardboard linear 0.351/0.208/0.110 (physicallybased.info); white ≤ 240\[15\] | 0.6–0.9 (h) | — | Fibre noise, no mirror highlights |
| Screen | 0 | Black glass ≥ floor | 0.02–0.1 (h) | Emissive image under coat | Reflections over the image; no clipped white |
| Finished wood | 0 | Filament 135,92,60 | 0.3–0.6 (h) + clearcoat | Grain normal | Grain-aligned roughness |
| Liquids | 0 | White | 0–0.05 | Transmission, IOR 1.33, attenuation colour | Colour from attenuation, not base colour |

**Failure modes:**
- Glass made with `opacity` instead of transmission reads as a ghost.
- Chrome with no environment renders black.
- Sheen set without `sheenColor` has no effect.
- An emissive screen with no reflection looks like a sticker.
- A metal below 170 sRGB looks like dark plastic.

---

## 4. Textures

- **Packing (ORM):** R = AO, G = roughness, B = metallic, all in one image. In three.js, the same texture can be assigned to `aoMap`, `roughnessMap` and `metalnessMap`.
- **Colour space:**

| Map | three.js | Blender |
|---|---|---|
| Base colour, emissive, sheen and specular colour, LDR matcap | `SRGBColorSpace` | sRGB |
| Normal, roughness, metallic, AO, ORM, transmission, thickness, clearcoat, displacement | `NoColorSpace` (default) | Non-Color |
| HDR environment | Linear (set by loader) | Scene-linear |

  three.js r152 guidance: "Non-color textures (normal maps, etc.) should use NoColorSpace, the default."\[42\] `GLTFLoader` tags textures correctly, but textures loaded by hand do not. A colour map left untagged renders washed out.\[6\]
- **Normal convention:** OpenGL Y+ (glTF, Blender, three.js, Unity) against DirectX Y− (Unreal). When the convention is wrong, bumps read as dents, worst on horizontal features.\[43\]\[44\] Fix at import with `G' = 1 − G`. Bake in MikkTSpace.\[45\]
- **Texel density:** the ratio that matters is texels per screen pixel at the closest frame. VCR heuristic: hero objects ≥ 1.0, secondary ≥ 0.5, power-of-two sizes. Example: a product filling 60% of a 1920 px height covers about 1150 px, so a 2048 map gives about 1.8 texels per pixel. 4K maps are rarely needed for 1080p delivery.
- **Tiling break-up:** enlarge the tile; multiply in low-frequency world-space noise (±5–10%, h); use stochastic or hex tiling; layer detail maps at coprime ratios; use decals.
- **Procedural vs image:** procedural textures have infinite resolution and are deterministic if seeded, but they don't export to glTF and must be baked. Image textures are fixed resolution but export everywhere.
- **Licences:** Poly Haven: "Our assets are all licensed as CC0 … You can use our assets for any purpose, including commercial work. You do not need to give credit".\[46\] ambientCG's own licence page states: "All ambientCG assets are provided under the Creative Commons CC0 1.0 Universal License. This applies to the downloadable asset files and the material preview renders", and "You don't need to give credit but I would of course appreciate it". Some popular texture sites are not CC0 (Poly Haven blog), so record source and licence for every asset (`MAT-LICENCE-PROVENANCE`).\[47\]

---

## 5. Stylised and non-photorealistic shading

### 5.1 When stylised wins
This is expert judgement; no audience study was found. Choose stylised shading when:
- the subject is abstract (data, UI, a service);
- a series needs a cheap, consistent look;
- the delivery is phone-size 9:16, where bold value structure survives re-encoding;
- brand colour must hold exactly (unlit or ramp shading shows the swatch directly);
- the render budget is tight.

Choose photoreal when the material itself is the selling point, or when the piece cuts with live action.

### 5.2 Toon and cel
- **Quantised shading:** `shade = floor(NdotL·N)/(N−1)`, or a 1D ramp sampled with nearest filtering. Two or three steps reads as cel, four or five as soft toon (h). In three.js `MeshToonMaterial`, give the `gradientMap` `NearestFilter`, or the steps blur. In Blender, use Shader-to-RGB into a Constant Color Ramp. This works in EEVEE only and does not export.
- **Highlights:** use one hard, thresholded `NdotH` highlight and keep it temporally stable.
- **Inverted-hull outlines:** extrude back faces along normals. They are cheap, but their width varies with distance unless scaled by clip-space w, and they break on hard edges without smoothed-normal attributes.
- **Post-process outlines:** detect edges on depth and normals. Width is constant in pixels, but the pass can flicker on thin geometry. Edge filters as 2D treatment belong to `FX-*`.
- **Outline width:** 2–4 px at 1080 width (h), stable over time (`MAT-OUTLINE-WIDTH-STABLE`).

### 5.3 Matcaps
A matcap indexes a sphere image by view-space normal (`uv = n.xy·0.5+0.5`). It is very cheap and consistent, but its lighting is locked to the camera, so objects can look "floaty". Tag matcap textures sRGB.

### 5.4 Flat low-poly and clay
- **Low-poly:** flat normals (`flatShading: true`), a clear key light, roughness 0.6–1.0 (h).
- **Clay:** one neutral dielectric (≤ concrete 192,191,187 sRGB), roughness 0.5–0.8 (h), and optionally `diffuseRoughness`. If the form doesn't read in clay, materials won't rescue it.

### 5.5 Gradient, Y2K iridescent, holographic, glassmorphism
- **Gradients:** drive from world or object space, or from `1−NdotV` for rims. Keep brand colour out of the rim.
- **Physical iridescence:** three.js `iridescence` or Blender Thin Film (Cycles only). Its hue sweeps under camera motion and flickers on noisy normals.
- **Stylised holographic:** pass `NdotV` through a rainbow ramp into emissive. It is deterministic, cheap and loop-safe.
- **3D glassmorphism:** frosted transmission (roughness 0.2–0.5, h) with a bright rim and an attenuation tint. It is the most expensive look here. 2D blur glassmorphism belongs to `FX-*`.

### 5.6 Hatching and halftone
Lit value selects pattern density. Object-space patterns need mip-aware tonal art maps, or they shimmer. Screen-space patterns and their moiré belong to `FX-*`, and they "swim" against moving objects, which is acceptable only when chosen deliberately.

### 5.7 Breaking rules on purpose
Pure-black outlines, unlit swatches and stylised half-metal are fine when the break is **consistent**, **declared in the brief** and **readable**. Exempt these materials via `MAT-PHYSICAL-SCOPE`.

---

## 6. Colour accuracy

### 6.1 Why the swatch drifts
1. Lighting multiplies base colour (`LIGHT-*`).
2. Fresnel adds white. The PBR Neutral author notes it "desaturates baseColors and makes deep blacks almost unattainable".\[48\]
3. Tone mapping: Khronos advises "Filmic tone mapping (e.g., ACES, AgX) … in strongly HDR scenes … or to achieve specific artistic looks", whereas PBR Neutral aims at faithful base colour.\[49\]
4. Metals and coloured specular *are* their reflections, so they vary with the environment.
5. `yuv420p` halves chroma in both axes, and platforms re-encode again (`DELIVERY-*`).

### 6.2 Recipe
- Set colours from the brief's sRGB hex through managed APIs (`Color.setHex` converts to linear).\[50\]
- Use neutral key and fill light, a neutral HDRI, and `renderer.toneMapping = NeutralToneMapping` (three.js: "based on the Khronos 3D Commerce Group standard").\[8\] In Blender, use the Khronos PBR Neutral view transform. Exposure 1.
- Swatches above 240 sRGB on every channel cannot be matched physically; flag them to the brief.
- Where colour *is* the identity, render the brand region unlit or with ramp shading.

### 6.3 Spot colours
Pantone values have only approximate sRGB bridges. The brief holds the approved sRGB value, and the check compares against that (`BRIEF-*`). Model metallic inks as tinted-F0 metal and accept variation. Fluorescent inks need emissive and are a stylistic choice.

### 6.4 ΔE
Use CIEDE2000, validated against the Sharma, Wu & Dalal (2005) test data. The paper notes a discontinuity "under 0.2734" near 180° hue differences.\[51\]\[52\] VCR thresholds (h):
- flat or unlit regions: ≤ 2.0 on PNG, ≤ 3.0 on decoded delivery;
- lit PBR dielectric facing patch: ≤ 5.0, reported only;
- metals: report hue-angle difference only.

Treat ΔE00 ≈ 2 as an acceptability threshold rather than a just-noticeable difference. The widely cited dental 50:50 thresholds are ΔE00 0.8 for perceptibility and 1.8 for acceptability (Paravina et al., via a secondary source). A ceramic shade-tab study (PMC11733899) reported "The PT for dentists was ΔE00= 2.29, and ΔE00= 2.27 for patients".

---

## 7. Surface detail and imperfection

- **Why perfect reads as CG:** real edges always have a radius that catches light. Real roughness varies.
- **Bevels:** 2–3 segments, about 0.5–2% of the smallest dimension (h), visible as a thin highlight at delivery size. Bake shader-only bevels (Cycles Bevel node), because they don't export.
- **Roughness variation:** ±0.05–0.1 mid-frequency noise (h). This is the cheapest realism gain. Keep it out of base colour on clean products.
- **Smudges and fingerprints:** roughness decals on glossy touch areas.
- **Dust:** sheen (Blender: sheen "can also be used for dust")\[39\] or an upward-facing rough mask.
- **Edge wear:** a curvature mask exposing metal. Use only for rugged stories.
- **Tolerance (expert judgement):** on clean hero shots, imperfection should be visible **only inside highlights**. If it shows in diffuse regions the product reads as used. The brief sets the level (`MAT-IMPERFECTION-BUDGET`).

---

## 8. Materials in motion

### 8.1 Specular crawl
Sub-pixel normal variation (fine geometry, high-frequency normal maps, thin bevels, glitter) makes tight highlights sparkle under motion while stills look perfect. Fixes:
1. **Geometric specular AA:** `α² += min(2σ²(|∂n/∂x|²+|∂n/∂y|²), κ)`. The Filament Materials Guide documents `specularAntiAliasing` as "Defaults to false", `specularAntiAliasingVariance` "set to 0.15 by default" and `specularAntiAliasingThreshold` "set to 0.2 by default". The σ² 0.25 / κ 0.18 values attributed to Unreal and Frostbite come only from secondary GitHub sources and are unverified. In three.js, implement via `onBeforeCompile` or TSL.
2. **Toksvig-style filtering:** prefilter normal-map variance into the roughness mips.
3. **Roughness floor:** ≥ 0.08–0.15 on fine glossy detail (h), or larger bevels.
4. **Supersample:** render at 2× and downsample.
5. **Avoid history-based TAA** in seeked renders (§11).

### 8.2 Transmission stability
- In three.js, a contributor PR describes the mechanism: "renderTransmissionPass() draws every opaque object into a render target … before the main pass draws it onto the canvas".\[53\] The target is mipmapped and sampled by roughness.\[54\] Below scale 1, refraction softens and shimmers.
- three.js maintainer Don McCurdy stated on the three.js forum (27 August 2021) that "only opaque materials (and perhaps alpha-blended ones) are visible behind transmissive materials … not currently implemented in three.js", naming depth peeling as a possible fix. The drei docs agree that "no transmissive material can 'see' other transparent or transmissive objects". Keep one glass layer per line of sight, or use Cycles.
- EEVEE: "Only one refraction event is correctly modeled". Set Thickness, or use Cycles for hero glass.\[55\]

### 8.3 Animated materials
- **Dissolve:** discard where `noise(p_object) < t`, with an emissive edge band `[t, t+w]`.
- **Reveals:** threshold on world-axis or radial distance.
- **Parameter tweens:** stay inside each parameter's valid range at every frame.
- **Colour tweens:** interpolate in linear or perceptual space (`ART-*`).
- **Always drive from `t_scene`,** never wall-clock time or frame counters.

### 8.4 Determinism
Shaders must be a pure function of position, UV, seed and `t_scene`. Forbidden: `Math.random()`, `performance.now()`, cross-frame accumulation, and `fract(sin(x)·43758.5453)` hashes at large x, which vary by GPU. Use integer hashes or noise textures.

### 8.5 Mipmaps and anisotropy
Use trilinear `LinearMipmapLinearFilter` for colour and data maps, and `NearestFilter` only for ramps and pixel art.\[56\] three.js `Texture.anisotropy` defaults to 1. A higher value "gives a less blurry result than a basic mipmap, at the cost of more texture samples". Use `renderer.capabilities.getMaxAnisotropy()` on hero textures seen at oblique angles.\[9\]\[57\]

### 8.6 Moiré
Regular patterns (weave, grilles, brushing, carbon fibre) alias near the 2 px Nyquist period, and chroma subsampling and re-encodes amplify it. Keep the on-screen period ≥ 4 px (h), fade the pattern into its average below that scale, or randomise it.

---

## 9. Performance

- **three.js cost ladder (cheapest first):** Basic, Matcap, Lambert, Toon, Phong, Standard, Physical. Physical effects "add cost as they are enabled".\[10\]
- **Transmission:** adds an opaque-scene pass plus mips. `transmissionResolutionScale` (default 1): "Lowering this value can result in significant performance improvements".\[9\]
- **Lights:** prefer a PMREM environment plus 1–3 analytic lights (`LIGHT-*`).
- **Texture memory:** an RGBA8 texture costs w×h×4 bytes, plus about a third for mips, so 4096² is about 64 MiB, or 85 MiB with mips. Use KTX2/Basis compression.
- **Headless renders:** headless Chromium may fall back to software GL. Record the GL vendor string.
- **Blender:**

| Feature | Cycles | EEVEE (4.2+) |
|---|---|---|
| Glass | Multiple refraction events | "Only one refraction event is correctly modeled"; needs Raytraced Transmission and Thickness\[55\]\[58\] |
| SSS | Random walk | Thickness approximation (3.6: "Only one BSSRDF can produce screen space subsurface scattering")\[59\] |
| Volumes | Multiple scattering | "Only single scattering is supported"; absent from reflections and refractions\[55\] |
| Thin film | Yes | No |
| General | Reference quality | "All BSDF's are using approximations … there will always be small differences between Cycles and EEVEE"\[55\] |

  **Rule:** do look-dev in EEVEE, and use Cycles for finals with hero glass, liquids, SSS or volumes. Use a fixed seed and fixed samples.
- **Safe preview simplifications:** swap transmission for a low-opacity reflective material; disable clearcoat, sheen and iridescence; halve textures; set transmission scale to 0.5. **Never** change base colour or the metal map in previews.

---

## 10. Measurement in VCR

Each entry gives the inputs, the calculation, the sampling strategy and the measurement's failure modes.

- **`MAT-ALBEDO-*`.** Inputs: the scene graph at `seek(t)`; `color` (linear); `metalness`; `map` pixels read back via a canvas. Calculation: sample about 4096 texels, decode sRGB, multiply by the factor, re-encode, then compute band fractions per metal class. Sampling: t = 0, plus every frame of any material tween. Failure modes: vertex colours, custom shaders (mark as unverifiable) and compressed KTX2 textures.
- **`MAT-METALLIC-BINARY`, `MAT-DIELECTRIC-F0`.** Calculation: effective metallic = factor × B channel, reported as the area fraction in (0.1, 0.9). Dielectric F0 = `((ior−1)/(ior+1))² × specularIntensity`, flagged below 0.02. Failure mode: UV area is not screen area, so weight by coverage when frames exist.
- **`MAT-TEXTURE-COLORSPACE`, `MAT-COLOR-MANAGEMENT-OUTPUT` (dropped; owner `LIGHT-OUTPUT-COLORSPACE`), `MAT-MIP-ANISO`.** Calculation: exact lookup against §4 of each slot's `colorSpace`, `generateMipmaps`, `minFilter` and `anisotropy`, plus `renderer.outputColorSpace`, `toneMapping` and `ColorManagement.enabled`. In Blender, read `image.colorspace_settings.name` and `view_transform` via `bpy`. Sampling: once per scene, and again whenever a texture is swapped. Failure modes: `ShaderMaterial` uniforms, and untagged Canvas or Video textures.
- **`MAT-NORMAL-CONVENTION`.** Inputs: the manifest's declared convention, plus a calibration render (a raised-bump normal map lit from screen-up). Calculation: the bump's upper half must be brighter than its lower half. Failure modes: image statistics alone cannot decide the convention, and mirrored UVs flip handedness.
- **`MAT-BRAND-DELTAE` (dropped; owner `LIGHT-BRAND-DELTAE`).** Inputs: the swatch, PNG frames, a material-ID mask pass, a normal pass, and delivery frames decoded with an explicit BT.709 matrix. Calculation: keep mask pixels with `n·v > 0.9`, erode 2 px, drop the top 5% of luminance (highlights), take the median sRGB, then compute ΔE00. Report the median and P90. Sampling: every frame where the region covers more than 1% of the frame, at least every 0.5 s and at markers. Failure modes: a wrong YUV matrix shifts ΔE by several units; motion blur; grain added by `FX-*`.
- **`MAT-SPECULAR-CRAWL`.** Inputs: consecutive frames at delivery fps; a highlight mask (top 10% of luminance on the object); optionally a 2× supersampled reference. Calculation: temporal high-pass `|L_t − (L_{t−1}+L_{t+1})/2|` in linear luminance. Flag when the ratio to the reference exceeds 2, or, with no reference, when more than 50% of the energy sits in fewer than 1% of mask pixels (h). Sampling: segments where the transform series shows motion. Failure modes: fast legitimate motion (reproject with transforms) and Cycles sampling noise (fix the seed).
- **`MAT-MOIRE`.** Calculation: the projected pattern period from UV scale and the camera, flagged below 4 px. Confirm with a 2D FFT on the object region: low-frequency peaks that drift between frames indicate aliasing. Run on decoded delivery too. Failure mode: procedural patterns lack metadata, so use the FFT only.
- **`MAT-TEXEL-DENSITY`.** Calculation: per visible triangle, √(UV area × texture pixels ÷ screen pixel area). Report P10 for hero objects at the closest frame. Failure modes: exclude `n·v < 0.2`; overlapping UVs distort the result.
- **`MAT-DETERMINISTIC-SHADER` (dropped; one generic check, `vcr capture --verify`), `MAT-LOOP-CLOSURE` (dropped; owner `MOTION-RHY-004`).** Calculation: render the same frames in fresh contexts in forward, reverse and random seek order, and require bit-exact output on the same machine. Run a static scan for `Math.random`, `Date` and `performance.now`. For loops, compare frame 0 with frame T·fps. Failure modes: texture-load races (`seek` must await readiness) and cross-GPU differences.
- **`MAT-ROUNDTRIP-FIDELITY`, `MAT-EXTENSION-SUPPORT`.** Inputs: a `bpy` dump of Principled inputs and node types; the glTF `materials` and `extensionsUsed`; 8-angle turntables in Blender and three.js under one HDRI with Neutral tone mapping. Calculation: a parameter diff, a list of non-exportable node types, and per-material mean ΔE00. Failure mode: the renderers differ legitimately, so calibrate on a reference sphere set first.
- **`MAT-OUTLINE-WIDTH-STABLE`.** Calculation: the distance-transform width along the silhouette and its coefficient of variation over frames, normalised by object distance.

---

## 11. VCR rendering and delivery notes

- **Seeking breaks history.** TAA, progressive accumulation and motion reprojection are wrong after an arbitrary `seek(t)`. Use spatial supersampling (`deviceScaleFactor` 2 then a Lanczos downscale in sharp or FFmpeg), or accumulate N sub-frames deterministically inside `seek`.
- **Fixed fps.** At 24 or 25 fps a highlight can skip across a bevel and strobe. Test at the delivery fps. There is no motion blur unless the scene implements it (`MOTION-*`).
- **Readiness.** `seek` must await texture upload, PMREM generation and transmission targets. Otherwise you get black chrome in the first frames.
- **`yuv420p`.** Thin saturated features (iridescent rims, coloured edge highlights) lose chroma. Check brand ΔE on decoded frames. A BT.601/709 mismatch shifts every colour (`DELIVERY-*`).
- **ProRes 4444 alpha.** Transmission has nothing behind it to refract over transparent alpha. Supply a backdrop, or design glass as reflective-only.
- **Platform re-encodes** erase subtle roughness variation first and amplify moiré. Preview by re-encoding at a low bitrate.

---

## 12. Medium-specific guidance

- **9:16 social:** phone size, muted, re-encoded. Use bold value structure, bigger bevels, higher roughness floors on fine detail, large flat brand regions, and avoid fine regular patterns. Safe zones belong to `TYPO-*`.
- **16:9:** more room for nuance. Push-ins stress texel density, so check the closest frame.
- **Square:** product fills the frame, so bevels and edge highlights dominate.
- **Stills:** crawl and moiré checks are off. Imperfection gets more scrutiny. Run ΔE on the delivered JPEG or WebP.
- **Loops:** material parameters must be periodic in `t` with period T (`sin(2πt/T)`, or noise sampled on a circle). Camera-dependent effects close only if the camera loop closes.

---

## 13. Analysis and critique process

1. **Read the brief:** scope tags, swatches, imperfection level (`MAT-PHYSICAL-SCOPE`).
2. **Run scene-data checks:** colour spaces, ranges, metallic, transmission/opacity, environment, extensions, determinism.
3. **Watch at speed and at delivery size** before stepping frames. Stills hide crawl and moiré.
4. **Run frame checks:** ΔE, emissive clipping, crawl, texel density.
5. **Decode the delivery** and repeat ΔE and moiré.
6. **Make judgement calls** using the vocabulary below.
7. **Check series consistency** (`MAT-SERIES-CONSISTENCY`).

**Severity:**
- **Blocker:** wrong colour space or normal convention; brand ΔE failure on a flat region; non-determinism (dropped; one generic check, `vcr capture --verify`); broken glass or chrome; export loss.
- **Major:** visible crawl or moiré; hard-range albedo failure on a hero object; whole-surface intermediate metallic; texel density < 0.5 on a close-up.
- **Minor:** albedo in the warning band; missing bevels on secondary objects.
- **Note:** taste.

**Finding format:** `[MAT-ID] severity, frames a–b, object/material: observation → cause → fix.`

| Term | Likely cause | Check |
|---|---|---|
| Plasticky | Uniform roughness; metal with metallic < 1 or base < 170 | Roughness variance ≈ 0; `MAT-METALLIC-BINARY` |
| CG / render-y | No bevels, perfect surfaces, pure black or white albedo | `MAT-EDGE-BEVEL`, `MAT-ALBEDO-*` |
| Too clean / dirty | Imperfection absent, or visible outside highlights | `MAT-IMPERFECTION-BUDGET` |
| Flat | Specular 0, roughness 1 everywhere, frontal light | Reflectance < 0.35; `LIGHT-*` |
| Wet | Roughness < 0.1 on non-glossy classes; stray clearcoat | Mean roughness by class |
| Chalky | Albedo > 220 with roughness ≥ 0.9 | `MAT-ALBEDO-*` |
| Muddy | Double gamma; filmic desaturation | `MAT-TEXTURE-COLORSPACE`, `MAT-TONEMAP-BRAND` (dropped; owner `LIGHT-OUTPUT-COLORSPACE`) |
| Glowy | Emissive used as fill | `MAT-EMISSIVE-CLIP` (dropped; owner `LIGHT-CLIP-HIGHLIGHTS`) |
| Crawling / swimming | Specular aliasing, moiré | `MAT-SPECULAR-CRAWL`, `MAT-MOIRE` |
| Ghostly glass | Opacity instead of transmission | `MAT-ALPHA-VS-TRANSMISSION` |

**Agent pitfalls:** range-checking stylised work; defaulting everything to roughness 0.5 / metal 0 (homogenised output); "fixing" the swatch instead of the pipeline; judging motion from a contact sheet; trusting the Blender viewport over the delivered three.js render.

---

## 14. Creation process

**Reference and asset inputs.** [Domain Exploration §4](../domain-exploration/README.md) supplies subject-specific surface observations; [Visual Research §3](../visual-research/README.md) separates visible cues from inferred properties (`VREF-INFERENCE-LIMITS`). [Image Direction §3–5](../image-direction/README.md) supplies acquisition and set constraints. Materials owns shading, texture interpretation and surface appearance; Lighting owns illumination and tone mapping, while FX owns 2D treatment. Texture provenance remains part of the shared asset-manifest concern.

1. **Write a material list per object:** class, reference, finish, brand colour, imperfection level. Store it in the brief.
2. **Decide photoreal or stylised** per object and tag scope.
3. **Block out in clay** and approve form and light (`LIGHT-*`).
4. **Take values from §1.6 and §3,** and cite the source in a code comment.
5. **Set up textures:** colour spaces, GL normals, ORM, mips and anisotropy, tiling break-up.
6. **Add imperfection to the brief's level,** in roughness first.
7. **Brand pass:** Neutral tone mapping, then ΔE.
8. **Motion pass** at delivery fps and size: fix crawl, moiré and shimmer.
9. **Export pass:** bake procedurals, export `.glb`, run the round-trip check.
10. **Encode, decode and re-check** ΔE and moiré.

---

## 15. Canon

- **Khronos glTF 2.0 and the KHR_materials_* extensions:** define what a material means across tools.
- **Khronos PBR Neutral:** colour-faithful display.\[60\]
- **OpenPBR (ASWF) and MaterialX:** the cross-tool layered standard for film and VFX.
- **Burley 2012 (Disney):** the principled parameterisation behind Principled BSDF.
- **Karis 2013 (Unreal Engine 4):** the real-time GGX and metallic-roughness recipe.\[20\]
- **Walter et al. 2007:** GGX.
- **Hoffman's SIGGRAPH PBS course notes:** the physics background.
- **Lagarde (DONTNOD) charts and "Moving Frostbite to PBR":** value ranges and production discipline.
- **Filament docs:** the clearest ranges, plus specular AA.
- **Unreal PBR docs:** practical defaults.
- **Adobe PBR Guide (McDermott):** vendor, but the most widely used artist guidance.
- **physicallybased.info:** an open, sourced value database.
- **Kaplanyan 2016; Tokuyoshi & Kaplanyan 2019:** specular AA.
- **Sharma, Wu & Dalal 2005:** correct ΔE00.\[61\]
- **three.js docs and the Blender Manual:** platform truth for VCR's 3D tools; versioned.
- **Poly Haven licence page:** CC0 terms.

---

## 16. Rules table

| ID | Check | Threshold | Tier | Applies to / measurable |
|---|---|---|---|---|
| `MAT-PHYSICAL-SCOPE` | Each material tagged `pbr`, `stylised` or `unlit` | 100%; default `pbr` | heuristic | All 3D; scene data |
| `MAT-ALBEDO-DIELECTRIC-RANGE` | Dielectric base colour, sRGB 8-bit | Warn < 30 or > 240; error < 10 or > 250 | platform | `pbr` dielectrics; scene data |
| `MAT-ALBEDO-METAL-RANGE` | Metal luminance | Warn < 170 sRGB | platform | `pbr` metals; scene data |
| `MAT-METALLIC-BINARY` | Area with metallic in (0.1, 0.9) | Warn > 5% (h) | platform/heuristic | `pbr`; scene data |
| `MAT-DIELECTRIC-F0` | Dielectric reflectance | ≥ 2% (Filament 0.35) | platform | `pbr` dielectrics; scene data |
| `MAT-ALBEDO-NO-LIGHTING` | No baked light in base colour | Judgement; aid: correlation with AO | platform | Textured `pbr`; judgement |
| `MAT-TEXTURE-COLORSPACE` | Slot colour space per §4 | 0 mismatches | platform | All textures; scene data |
| `MAT-COLOR-MANAGEMENT-OUTPUT` | sRGB output, colour management on; Blender view transform declared | Superseded: use `LIGHT-OUTPUT-COLORSPACE`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | All renders; scene data |
| `MAT-NORMAL-CONVENTION` | OpenGL Y+ | Manifest plus calibration render | standard | Normal maps; render test |
| `MAT-ORM-PACKING` | R = AO, G = roughness, B = metal | Exact | standard | Packed maps; scene data |
| `MAT-ENV-MAP-PRESENT` | Environment present for metals and Physical | Present | platform | three.js; scene data |
| `MAT-ALPHA-VS-TRANSMISSION` | Glass via transmission; opacity 1 | 0 violations | standard/platform | Transmissive; scene data |
| `MAT-EMISSIVE-CLIP` | Clipped emissive pixels | Superseded: use `LIGHT-CLIP-HIGHLIGHTS`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | Emissive; frames |
| `MAT-EXTENSION-EXCLUSIONS` | glTF exclusions respected | 0 | standard | glTF; JSON |
| `MAT-BRAND-DELTAE` | ΔE00 between swatch and patch | Superseded: use `LIGHT-BRAND-DELTAE`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | Brand surfaces; frames |
| `MAT-TONEMAP-BRAND` | Neutral (or none for unlit) when ΔE applies | Superseded: use `LIGHT-OUTPUT-COLORSPACE`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | Brand shots; scene data |
| `MAT-SPECULAR-CRAWL` | Highlight temporal high-pass | ≤ 2× supersampled reference (h) | heuristic | Animated 3D; frames |
| `MAT-ROUGHNESS-FLOOR` | Glossy surfaces with sub-pixel detail | Roughness ≥ 0.1 or specular AA (h) | heuristic | Fine glossy in motion; scene data |
| `MAT-MOIRE` | On-screen pattern period | ≥ 4 px or mip-faded (h) | heuristic | Patterned textures; scene data plus FFT |
| `MAT-MIP-ANISO` | Mips on; max anisotropy on hero textures | Exact | platform | three.js textures; scene data |
| `MAT-TEXEL-DENSITY` | Texels per screen pixel | Hero ≥ 1.0, secondary ≥ 0.5 (h) | heuristic | Textured objects; geometry |
| `MAT-DETERMINISTIC-SHADER` | Bit-identical re-renders; no time or random sources | Exact | heuristic (VCR contract) | All shaders; frames plus source scan |
| `MAT-LOOP-CLOSURE` | State at 0 equals state at T | Superseded: use `MOTION-RHY-004`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | Loops; frames |
| `MAT-ROUNDTRIP-FIDELITY` | Blender→three.js look preserved | Core diff 0; mean ΔE00 ≤ 3 (h) | heuristic | Exports; frames plus JSON |
| `MAT-EXTENSION-SUPPORT` | No non-exportable features unbaked | 0 | platform | Exports; `bpy` dump |
| `MAT-TRANSMISSION-COST` | Transmissive count; scale 1 in finals | Report; exact | platform | three.js; scene data |
| `MAT-EDGE-BEVEL` | Edge highlights on hard products | Judgement (aid 0.5–2%) | heuristic | Photoreal hard surfaces; judgement |
| `MAT-ROUGHNESS-VARIATION` | Roughness std dev on hero objects | > 0.01 (h) | heuristic | `pbr` heroes; scene data |
| `MAT-IMPERFECTION-BUDGET` | Imperfection only in highlights for clean briefs | Judgement | heuristic | Product shots; judgement |
| `MAT-TOON-RAMP-STEPS` | Same N across scene; nearest filtering | Exact | heuristic | Toon; scene data |
| `MAT-OUTLINE-WIDTH-STABLE` | Outline width coefficient of variation | < 10% (h) | heuristic | Outlined NPR; frames |
| `MAT-SERIES-CONSISTENCY` | Same named material, same params across episodes | Diff 0 | heuristic | Series; scene data |
| `MAT-LICENCE-PROVENANCE` | Source and licence per external texture | 100% | heuristic | External assets; manifest |

---

## 17. Master checklists

**Analysis:**
1. `MAT-PHYSICAL-SCOPE`
2. `MAT-TEXTURE-COLORSPACE`, `MAT-COLOR-MANAGEMENT-OUTPUT` (dropped; owner `LIGHT-OUTPUT-COLORSPACE`), `MAT-NORMAL-CONVENTION`, `MAT-ORM-PACKING`
3. `MAT-ALBEDO-DIELECTRIC-RANGE`, `MAT-ALBEDO-METAL-RANGE`, `MAT-METALLIC-BINARY`, `MAT-DIELECTRIC-F0`
4. `MAT-ENV-MAP-PRESENT`, `MAT-ALPHA-VS-TRANSMISSION`, `MAT-EXTENSION-EXCLUSIONS`, `MAT-TRANSMISSION-COST`
5. `MAT-DETERMINISTIC-SHADER` (dropped; one generic check, `vcr capture --verify`), `MAT-LOOP-CLOSURE` (dropped; owner `MOTION-RHY-004`)
6. Watch in motion, then `MAT-SPECULAR-CRAWL`, `MAT-MOIRE`, `MAT-ROUGHNESS-FLOOR`, `MAT-OUTLINE-WIDTH-STABLE`
7. `MAT-TONEMAP-BRAND` (dropped; owner `LIGHT-OUTPUT-COLORSPACE`), `MAT-BRAND-DELTAE` (dropped; owner `LIGHT-BRAND-DELTAE`) (PNG and delivery), `MAT-EMISSIVE-CLIP` (dropped; owner `LIGHT-CLIP-HIGHLIGHTS`)
8. `MAT-TEXEL-DENSITY`, `MAT-MIP-ANISO`
9. Judgement: `MAT-EDGE-BEVEL`, `MAT-ROUGHNESS-VARIATION`, `MAT-IMPERFECTION-BUDGET`, `MAT-ALBEDO-NO-LIGHTING`
10. `MAT-SERIES-CONSISTENCY`, `MAT-LICENCE-PROVENANCE`, `MAT-ROUNDTRIP-FIDELITY`, `MAT-EXTENSION-SUPPORT`

**Creation:**
1. Material list and scope tags
2. Clay approval
3. Values from tables (`MAT-ALBEDO-*`, `MAT-METALLIC-BINARY`, `MAT-DIELECTRIC-F0`)
4. Texture set-up (`MAT-TEXTURE-COLORSPACE`, `MAT-NORMAL-CONVENTION`, `MAT-ORM-PACKING`, `MAT-MIP-ANISO`)
5. Environment and transmission (`MAT-ENV-MAP-PRESENT`, `MAT-ALPHA-VS-TRANSMISSION`)
6. Bevels and imperfection (`MAT-EDGE-BEVEL`, `MAT-ROUGHNESS-VARIATION`, `MAT-IMPERFECTION-BUDGET`)
7. Brand pass (`MAT-TONEMAP-BRAND` (dropped; owner `LIGHT-OUTPUT-COLORSPACE`), `MAT-BRAND-DELTAE` (dropped; owner `LIGHT-BRAND-DELTAE`))
8. Determinism and loops (`MAT-DETERMINISTIC-SHADER` (dropped; one generic check, `vcr capture --verify`), `MAT-LOOP-CLOSURE` (dropped; owner `MOTION-RHY-004`))
9. Motion test (`MAT-SPECULAR-CRAWL`, `MAT-MOIRE`, `MAT-ROUGHNESS-FLOOR`)
10. Export, provenance and series freeze (`MAT-ROUNDTRIP-FIDELITY`, `MAT-EXTENSION-SUPPORT`, `MAT-LICENCE-PROVENANCE`, `MAT-SERIES-CONSISTENCY`)

---

## 18. Caveats

- **The dark albedo floor is disputed.** Filament's main docs say 50/30, its chart says 10, Adobe uses 50/30 and Lagarde 50.\[25\]\[62\] Measured asphalt and blackboard sit below 50.\[3\]\[5\]\[15\]\[63\] This report therefore uses two levels: warn at 30, error at 10.
- **Metal floor.** Unreal's iron and chromium (linear about 0.55) encode near or below 170 sRGB, so treat low metal values as warnings.\[28\]
- **Specular AA constants** for Unreal and Frostbite (0.25/0.18) come from secondary GitHub sources; Filament's 0.15/0.2 defaults are confirmed in its Materials Guide. **three.js transmission internals** come from a contributor PR, while the transmissive-cannot-see-transmissive limitation is confirmed by maintainer Don McCurdy on the three.js forum.
- **Blender exporter:** sheen and specular are mismatched,\[11\]\[64\] and no thin-film or iridescence export was found. Re-check with each Blender release.
- **ΔE thresholds** are VCR proposals. The clinical evidence (dental 50:50 thresholds of 0.8 perceptibility and 1.8 acceptability; a shade-tab study at about 2.3) places ΔE00 ≈ 2 nearer acceptability than perceptibility. These figures come via secondary sources.
- **Per-material roughness ranges** are heuristics.
- **No audience evidence** was found on stylised vs photoreal, or on imperfection tolerance; those claims are expert taste.
- **Likely to change:** three.js properties (r187 deprecations; new `retroreflectivity`, `diffuseRoughness`), EEVEE (rewritten in 4.2), OpenPBR versions, and release-candidate extensions such as `KHR_materials_diffuse_transmission`.\[65\]
- **ambientCG's licence** is CC0 1.0 per its own licence page (docs.ambientcg.com/license).

---

## 19. Verification ledger (checked 6 November 2026)

| Claim | Result | Checked against |
|---|---|---|
| glTF: metal base = F0; `mix(…, metallic)`; α = r²; gold [1.000, 0.766, 0.336] | confirmed | Khronos glTF 2.0 spec |
| glTF ORM channels (metal B, roughness G, AO R) | confirmed | glTF quick reference and spec |
| alphaMode is coverage; transmission exclusions | confirmed | KHR_materials_transmission README |
| Emissive core clamp; emissive_strength not with unlit | confirmed | KHR_materials_emissive_strength README |
| glTF normals +Y, MikkTSpace | confirmed (secondary summaries of spec) | Polycount; Babylon forum; normal-map guides |
| Filament 50–240 / 30–240; metals 170–255 (67–100%); reflectance < 0.35 | confirmed | Filament docs (search extracts) |
| Filament chart 10–240; sample values; F0 chart | confirmed | Filament Material Properties (fetched) |
| Unreal Specular 0.5 ≈ 4% | confirmed | Unreal docs |
| Unreal metal linear values | confirmed (secondary) | Modelical copy of UE4 docs |
| Adobe Validate thresholds 50/30; 70–100/60–100% | confirmed | Adobe node docs |
| Lagarde 50–240 | confirmed | seblagarde.wordpress.com |
| physicallybased.info asphalt, blackboard, cardboard | confirmed | physicallybased.info |
| three.js Physical cost, IOR range, transmission/opacity, defaults | confirmed | threejs.org MeshPhysicalMaterial (fetched) |
| three.js r152 colour management | confirmed | three.js forum (maintainer) |
| `transmissionResolutionScale`, tone mapping list, `NoToneMapping` default, anisotropy | confirmed (subagent) | threejs.org WebGLRenderer and Texture docs |
| Transmission pass opaque-only; transmissive cannot see transmissive | confirmed (maintainer forum post; contributor PR for the pass mechanism) | three.js forum (Don McCurdy, 27 Aug 2021); three.js PR #34738; drei docs |
| PBR Neutral purpose; filmic advice | confirmed | Khronos press release; modelviewer.dev |
| Fresnel desaturates base colour | confirmed | Blender PR #118936 |
| Blender glTF extension support; sheen mismatch | confirmed | Blender Manual glTF pages |
| Blender iridescence export | not found | Blender Manual glTF pages |
| Principled IOR 1.5; thin film Cycles-only, 1.33 | confirmed | Blender Manual Principled BSDF |
| Blender 4.0 coat and sheen layering | confirmed | Blender 4.0 release notes |
| EEVEE single refraction, single-scatter volumes, approximations | confirmed (subagent extracts) | Blender Manual EEVEE limitations |
| OpenPBR dates and defaults | confirmed | ACM DL paper; ASWF spec |
| Karis GGX rationale; α = Roughness² | confirmed | Karis 2013 notes and slides |
| Specular AA constants | Filament 0.15/0.2, default off: confirmed; Unreal/Frostbite 0.25/0.18: unverified (secondary) | Filament Materials Guide; GitHub PRs and issues |
| CIEDE2000 discontinuity < 0.2734 | confirmed | Sharma et al. papers (Rochester) |
| ΔE00 ≈ 2 threshold | unverified (secondary): dental 50:50 thresholds 0.8 perceptibility / 1.8 acceptability; shade-tab study 2.29 / 2.27 | Paravina et al. via ResearchGate; PMC11733899 (search extract) |
| Poly Haven CC0, no credit needed | confirmed | polyhaven.com/license |
| ambientCG CC0 | confirmed | docs.ambientcg.com/license |

## 20. Sources

Every source is named inline where it is used, and the canon (§15) and ledger (§19) list them by role. The numbered list below matches the escaped `\[n\]` markers in the text.


1. [glTF/specification/2.0/Specification.adoc at main · KhronosGroup/glTF · GitHub](https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/Specification.adoc)
2. [Materials - Filament](https://google.github.io/filament/main/materials.html)
3. [Filament - Filament](https://google.github.io/filament/main/filament.html)
4. [Physically Based Materials in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/physically-based-materials-in-unreal-engine)
5. [Material Properties - Filament](https://google.github.io/filament/notes/material_properties.html)
6. [Color Management](https://webcodingcenter.com/three-js/materials-and-physically-based-rendering--color-management-and-output-color-space.html)
7. [Khronos PBR Neutral Tone Mapper Released for True-to-Life Color Rendering of 3D Products](https://www.khronos.org/news/press/khronos-pbr-neutral-tone-mapper-released-for-true-to-life-color-rendering-of-3d-products)
8. [global](https://threejs.org/docs/pages/global.html)
9. [WebGLRenderer - Three.js Docs](https://threejs.org/docs/pages/WebGLRenderer.html)
10. [MeshPhysicalMaterial - Three.js Docs](https://threejs.org/docs/pages/MeshPhysicalMaterial.html)
11. [glTF 2.0 — Blender Manual](https://docs.blender.org/manual/en/3.3/addons/import_export/scene_gltf2.html)
12. [glTF 2.0 - Blender 4.5 LTS Manual](https://docs.blender.org/manual/en/4.5/addons/import_export/scene_gltf2.html)
13. [Improved geometric specular antialiasing](https://www.researchgate.net/publication/333227352_Improved_geometric_specular_antialiasing)
14. [© 2019 SQUARE ENIX CO., LTD. and Facebook Reality Labs. All Rights Reserved.](<https://www.jp.square-enix.com/tech/library/pdf/ImprovedGeometricSpecularAA(slides).pdf>)
15. [Physically Based - The PBR values database](https://physicallybased.info/)
16. [Physically Based Materials](https://dev.epicgames.com/documentation/unreal-engine/physically-based-materials?application_version=4.27)
17. [Real Shading in Unreal Engine 4Real Shading in Unreal Engine 4Real Shading](https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_slides.pdf)
18. [The Reasoning Behind PBR: A Physically Based Rendering Guide for People Who Already Use It](https://medium.com/@Jamesroha/the-reasoning-behind-pbr-a-physically-based-rendering-guide-for-people-who-already-use-it-07201365bb67)
19. [Shedding Light: A Benchmark for Evaluating Lighting Understanding in Generative Image Models](https://arxiv.org/pdf/2609.10787)
20. [Real Shading in Unreal Engine 4 by Brian Karis, Epic Games](https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf)
21. [glTF™ 2.0 Specification - Khronos Registry](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
22. [glTF](https://kcoley.github.io/glTF/specification/2.0/)
23. [(Backup) PBR models](https://hapzunglam.wordpress.com/2018/08/07/backup-pbr-models/)
24. [PBR Materials Explained: Metallic-Roughness vs Specular-Glossiness](https://polyforge.xyz/learn/pbr-materials-metallic-roughness-specular-glossiness)
25. [PBR BaseColor / Metallic Validate](https://helpx.adobe.com/substance-3d-designer/substance-compositing-graphs/nodes-reference-for-substance-compositing-graphs/node-library/material-filters/pbr-utilities/pbr-basecolor-metallic-validate.html)
26. [Feeding a physically based shading model](https://seblagarde.wordpress.com/2011/08/17/feeding-a-physical-based-lighting-mode/)
27. [Getting Started with PBR Textures](https://www.pbrforge.com/blog/getting-started-with-pbr-textures)
28. [Materials I - Modelical](https://www.modelical.com/en/gdocs/materials-pbr-materials-inputs-material-editor-within-ue/)
29. [Physically Based Materials](https://docs.unrealengine.com/4.26/en-US/RenderingAndGraphics/Materials/PhysicallyBased/)
30. [GltfPbrMetallicRoughness Class (Microsoft.MixedReality.Toolkit.Utilities.Gltf.Schema)](https://learn.microsoft.com/en-us/dotnet/api/microsoft.mixedreality.toolkit.utilities.gltf.schema.gltfpbrmetallicroughness?view=mixed-reality-toolkit-unity-2020-dotnet-2.8.0)
31. [www.khronos.org/gltf Rev. 0922 glTF 2.0 API Reference Guide Page 1](https://www.khronos.org/files/gltf20-reference-guide.pdf)
32. [From 0 to glTF with WebGPU: Basic Materials and Textures](https://www.willusher.io/graphics/2024/04/28/0-to-gltf-basic-materials/)
33. [Confused about gltf spec interpretation - Questions - Babylon.js](https://forum.babylonjs.com/t/confused-about-gltf-spec-interpretation/62733)
34. [glTF/extensions/2.0/Khronos/KHR\_materials\_transmission/README.md at main · KhronosGroup/glTF · GitHub](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_transmission/README.md)
35. [glTF/extensions/2.0/Khronos/KHR\_materials\_emissive\_strength/README.md at main · KhronosGroup/glTF · GitHub](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md)
36. [OpenPBR Material](https://help.maxon.net/r3d/maya/en-us/Content/html/Material+OpenPBR.html)
37. [OpenPBR Surface](https://dl.acm.org/doi/full/10.1145/3744199.3744632)
38. [MaterialX/documents/Specification/MaterialX.PBRSpec.md at main · AcademySoftwareFoundation/MaterialX · GitHub](https://github.com/AcademySoftwareFoundation/MaterialX/blob/main/documents/Specification/MaterialX.PBRSpec.md)
39. [Shading & Texturing - Blender Developer Documentation](https://developer.blender.org/docs/release_notes/4.0/shading/)
40. [Principled BSDF - Blender 5.2 LTS Manual](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/principled.html)
41. [threejs-materials Skill - cloudai-x](https://www.ui-skills.com/skills/cloudai-x/threejs-materials)
42. [Updates to Color Management in three.js r152 - Discussion - three.js forum](https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791)
43. [What Is a Normal Map? Normal Mapping, Tangent Space, OpenGL vs DirectX](https://the3dai.com/ai-3d-texturing/blog/what-is-a-normal-map)
44. [What is a Normal Map? - PBR Texture Guide](https://normalmap.ai/learn/normal-map/)
45. [Help people with normal map baking methods? — polycount](https://polycount.com/discussion/234668/help-people-with-normal-map-baking-methods)
46. [License • Poly Haven](https://polyhaven.com/license)
47. [Poly Haven Blog](https://blog.polyhaven.com/feed/)
48. [#118936 - Add Khronos PBR Neutral tone mapper - blender - Blender Projects](https://projects.blender.org/blender/blender/pulls/118936)
49. [Khronos PBR Neutral: Color Consistency in E-Commerce](https://displaydaily.com/khronos-pbr-neutral-color-consistency-in-e-commerce/)
50. [Three.jsのカラー管理](https://mebiusbox.github.io/en/blog/2023/12/16/threejs-colorspace)
51. [The CIEDE2000 Color-Difference Formula: Implementation Notes,](https://hajim.rochester.edu/ece/sites/gsharma/papers/CIEDE2000CRNAFeb05.pdf)
52. [Mathematical Discontinuities in CIEDE2000 Color Difference Computations](https://hajim.rochester.edu/ece/sites/gsharma/papers/cic04ciede2000.pdf)
53. [WebGLRenderer: Reuse programs when only output color space or tone mapping differ (#34654) by rubenmarcus · Pull Request #34738 · mrdoob/three.js · GitHub](https://github.com/mrdoob/three.js/pull/34738)
54. [Feedback loop error with transmission + \`antialias: false\` + \`DoubleSide\` since r182](https://github.com/mrdoob/three.js/issues/33060)
55. [Limitations - Blender 5.2 LTS Manual](https://docs.blender.org/manual/en/latest/render/eevee/limitations/limitations.html)
56. [Three.js Textures Agent Skill — MeloSkill](https://meloskill.com/skills/threejs-textures/)
57. [Texture](https://threejs.org/docs/pages/Texture.html)
58. [Blender 4.2 LTS: EEVEE - Blender Developer Documentation](https://developer.blender.org/docs/release_notes/4.2/eevee/)
59. [Limitations — Blender Manual](https://docs.blender.org/manual/en/3.6/render/eevee/limitations.html)
60. [Press Releases](https://www.khronos.org/news/press/2024/05/)
61. [The CIEDE2000 Color-Difference Formula](https://www.ece.rochester.edu/~gsharma/ciede2000/)
62. [PBR Rules & Measurements](https://www.racoon-artworks.de/blog_PBRfromrulestomeasurements.php)
63. [BIM Chapters: Understanding and Application of Albedo in Enscape](https://bimchapters.blogspot.com/2023/12/understanding-and-application-of-albedo.html)
64. [Blender glTF I/O: Support for glTF PBR Material Extensions](https://www.khronos.org/blog/blender-gltf-i-o-support-for-gltf-pbr-material-extensions)
65. [gltf-extensions](https://luma.gl/docs/api-reference/gltf/gltf-extensions)
