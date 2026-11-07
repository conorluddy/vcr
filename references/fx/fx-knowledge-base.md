# FX — Image Treatment, Blend Modes, Compositing and Graphic Effects for Stills and Motion (`references/fx/`)

The most important finding is that two renders using the "same" treatment often differ for one of three reasons: the colour space the blend runs in, the compositing group it lands in, and how the effect behaves over time. A crafted look comes from choosing all three on purpose, writing them down, and checking them against rendered and encoded frames. Picking a blend mode or filter preset is not enough.

> **Status.** Draft v1 of the FX pillar for VCR, dated 2026-11-06. **Scope:** layer techniques that give stills and motion graphics a crafted, graphic look. That covers blend modes, Porter-Duff compositing, alpha, masks and mattes, tonal and colour treatments, LUTs, print-process looks (halftone, riso, dithering), textures and grain, stylised filters, and how all of these behave under motion, encoding and seek-and-capture rendering. **Out of scope:** colour intent, palettes and composition (`ART-*`), type (`TYPO-*`), easing and timing (`MOTION-*`), delivery limits (`DELIVERY-*`) and flash and contrast thresholds (`A11Y-*`). This pillar cites those prefixes and does not restate their numbers. **Confidence tiers:** `standard` means a published standard or specification, checked against the primary source. `platform` means published by a vendor or platform and liable to change without notice. `heuristic` means a practitioner rule of thumb, a secondary source, or a default VCR proposes; heuristic numbers must be calibrated before they gate anything. **Tool independence (ADR 0006):** every technique is defined by what it does and its maths. CSS, SVG, canvas, WebGL, ImageMagick, sharp, FFmpeg and Blender recipes are labelled worked examples, never the rule itself.

## TL;DR

- **Blend maths is standardised, but the colour space and the grouping are not.** W3C *Compositing and Blending Level 1* defines all 16 CSS blend modes and the 12 Porter-Duff operators plus `lighter` [1].\[1\] SVG filter primitives default to `linearRGB`, while CSS filter functions "must operate in the sRGB color space" [2].\[2\]\[3\] Blender composites in scene-linear [11].\[4\] So a multiply can render differently from one tool to the next, and every scene must declare its blend space (`FX-BLEND-SPACE-DECLARED`).
- **Stacking contexts silently change what a blend touches.** In HTML, anything that creates a stacking context (opacity, filter, transform and so on) becomes an isolated group, and a blended element only blends inside that group [1]. Most "my multiply does nothing" bugs are isolation bugs.
- **Motion is where treatments fail.** Thresholds, posterisation and dithers boil when input values cross a cut-off. Screens and noise crawl when the image moves under a pattern fixed to the frame. Agents that judge from single frames will miss both, so every treatment needs a time-series check (`FX-TEMPORAL-FLICKER`, `FX-SCREEN-SPACE-DECLARED`).
- **Determinism is non-negotiable in a seek-and-capture renderer.** Noise must be seeded and a pure function of (seed, t, position). `feTurbulence` has a `seed` attribute [2]. FFmpeg's `noise` filter has a documented default seed of 123457 [23]. Capturing the same frame twice must give identical pixels (`FX-DETERMINISM` (dropped; one generic check, `vcr capture --verify`)).
- **Fine texture rarely survives social delivery.** H.264 at platform bitrates (YouTube recommends 8 Mbps for 1080p SDR at 24–30 fps [24]; TikTok's ad floor is "More than or equal to 516 kbps" [26]) turns single-pixel grain and dither into mush or blocks.\[5\]\[6\] Build texture at a scale that survives, and verify it with a simulated re-encode (`FX-TEXTURE-SURVIVAL`).
- **Cost is real.** Animated `filter: blur()` and `backdrop-filter` re-run convolutions on every frame. Bake static treatments into assets, and keep per-frame shaders for effects that actually change (`FX-CACHE-STATIC`, `FX-RENDER-COST`).
- **A crafted treatment differs from a preset in four ways:** a reason tied to the brief, restraint in intensity, behaviour designed for motion, and imperfection that is controlled rather than uniform. The reviewer's words "muddy", "plasticky", "filter-y", "overcooked" and "it's a preset" each map to a measurable parameter (§14).

## Key findings

1. **The blend formulas are fixed by specification.** Examples: multiply `B(Cb, Cs) = Cb x Cs`; screen `Cb + Cs -(Cb x Cs)`; overlay is `HardLight(Cs, Cb)`. Blending "must not use pre-multiplied color values", and results "must be clamped" [1].
2. **The non-separable modes use Rec.601-style luma weights:** `Lum(C) = 0.3 x Cred + 0.59 x Cgreen + 0.11 x Cblue` [1]. These differ from the WCAG relative-luminance weights used for contrast, so "luminosity" blends and contrast checks measure different things.
3. **The default colour space differs inside one browser.** `color-interpolation-filters` has an initial value of `linearRGB` [2][4]. MDN warns that a blur in linearRGB mixes black and white stripes "into a much lighter gray" than sRGB does, and advises setting sRGB "whenever a filter mixes color channels and you want a result that matches CSS" [3].
4. **Isolation rules:** "Everything in CSS that creates a stacking context must be considered an 'isolated' group". `background-blend-mode` layers "must not blend with the content that is behind the element". In SVG, opacity, filters, 3D transforms, blending and masking each force isolation [1].
5. **Order of operations:** "first any filter effect is applied, then any clipping, masking, blending and compositing" [1]. A filter on a masked element therefore runs before the mask.
6. **`mix-blend-mode` has animation type `discrete`** [1]. You cannot tween between blend modes. To cross-fade looks, cross-fade two layers.
7. **Tool coverage differs.** libvips, and so sharp, documents that "The non-separable modes are not implemented" [9]. sharp exposes the Porter-Duff set plus the separable modes [8]. FFmpeg `blend` has its own mode vocabulary (for example `grainextract` and `grainmerge`) with default `normal` [10].
8. **.cube LUTs are tightly specified.** 3D size N is "an integer in the range [2, 256]", red changes fastest, and readers "should use … tetrahedral interpolation for three-dimensional tables" [12].
9. **Film grain is a modelled signal, not white noise.** AV1 synthesises grain with an autoregressive model whose strength scales with intensity, and reports bitrate savings "up to 50%" on heavy-grain sequences [19].\[7\]\[8\] In H.264, grain SEI (SMPTE RDD 5) is optional and in practice not applied by the platforms (§9).\[9\]
10. **Seizure risk is owned by `A11Y-FLASH-*`.** WCAG 2.3.1 defines a general flash as "a pair of opposing changes in relative luminance of 10% or more of the maximum relative luminance (1.0) where the relative luminance of the darker image is below 0.80" [27]. High-contrast threshold boil, glitch strobing and CRT flicker can cross it.

---

## 1. The compositing model

### 1.1 Simple alpha compositing and premultiplication
- **Source-over (straight colour)** [1]: `co = Cs x αs + Cb x αb x (1 - αs)`, `αo = αs + αb x (1 - αs)`.
- **Premultiplied form** [1]: `cs = Cs x αs`, so `co = cs + cb x (1 - αs)`. Recover straight colour with `Co = co / αo`.
- **Why premultiplication matters.** Alvy Ray Smith's history credits the integral alpha channel to Catmull and Smith and premultiplied alpha to Porter and Duff. He shows that premultiplied alpha "is more efficient, yields more elegant formulas", and that the non-premultiplied formulation "is not closed on over" [14].
- **Failure modes:**
  - *Dark or light fringes:* straight-alpha pixels filtered (resized, blurred) as if they were premultiplied, or the reverse.
  - *Double premultiplication:* the edges go dark.
  - *ProRes 4444 masters:* the alpha convention must be declared, or the downstream compositor will mis-key the edges (see `DELIVERY-*`).
- **Agent pitfall:** blurring or scaling an RGBA PNG in a tool that treats it as straight alpha. Do premultiplied resampling, then un-premultiply.

### 1.2 The general formula and Porter-Duff
- **Two steps** [1]:
  - Blend in place: `Cs = (1 - αb) x Cs + αb x B(Cb, Cs)`.
  - Composite: `Co = αs x Fa x Cs + αb x Fb x Cb`.
- **Fa and Fb by operator** [1], from Porter & Duff's 1984 algebra (cited via [1]; the original paper was not fetched):

| Operator | Fa | Fb | Typical FX use |
|---|---|---|---|
| clear | 0 | 0 | erase |
| copy (src) | 1 | 0 | replace |
| destination | 0 | 1 | no-op |
| source-over | 1 | 1 – αs | normal layering |
| destination-over | 1 – αb | 1 | paint behind |
| source-in | αb | 0 | clip texture to shape (fill type with an image) |
| destination-in | 0 | αs | mask the backdrop by a shape |
| source-out | 1 – αb | 0 | knockout outside |
| destination-out | 0 | 1 – αs | punch holes (knockout type) |
| source-atop | αb | 1 – αs | paint only on existing pixels (texture on a shape) |
| destination-atop | 1 – αb | αs | — |
| xor | 1 – αb | 1 – αs | — |
| lighter (plus) | 1 | 1 | additive light, glows |

- **Isolated-group trap** [1]: if the bottom element in an isolated group uses an operator that depends on the backdrop (`destination`, `source-in`, `destination-in`, `destination-out`, `source-atop`), "the result of the composite will be empty".

### 1.3 Separable blend modes (quoted from [1])

| Mode | B(Cb, Cs) | Intent and notes |
|---|---|---|
| normal | `Cs` | — |
| multiply | `Cb x Cs` | ink on paper, shadows. "always at least as dark"; white is neutral |
| screen | `1 - [(1 - Cb) x (1 - Cs)] = Cb + Cs -(Cb x Cs)` | light, glow, film-on-film; black is neutral |
| overlay | `HardLight(Cs, Cb)` | contrast and texture that keeps backdrop highlights and shadows |
| darken | `min(Cb, Cs)` | — |
| lighten | `max(Cb, Cs)` | — |
| color-dodge | `if Cb == 0: 0; elif Cs == 1: 1; else min(1, Cb / (1 - Cs))` | hot highlights; clips fast |
| color-burn | `if Cb == 1: 1; elif Cs == 0: 0; else 1 - min(1, (1 - Cb) / Cs)` | deep, saturated shadows; clips fast |
| hard-light | `if Cs <= 0.5: Multiply(Cb, 2 x Cs) else Screen(Cb, 2 x Cs - 1)` | harsh spotlight |
| soft-light | `if Cs <= 0.5: Cb - (1 - 2 x Cs) x Cb x (1 - Cb) else Cb + (2 x Cs - 1) x (D(Cb) - Cb)`; `D(Cb) = ((16 * Cb - 12) x Cb + 4) x Cb` if `Cb <= 0.25`, else `sqrt(Cb)` | gentle texture and grain; 50% grey is neutral |
| difference | `\| Cb - Cs \|` | inversion, glitch; white inverts |
| exclusion | `Cb + Cs - 2 x Cb x Cs` | a lower-contrast difference |

- **The neutral colour** is the value that leaves the backdrop unchanged. It is the main tool for building textures: white for multiply, black for screen, 50% grey for overlay and soft-light. A texture plate meant for overlay should centre on 50% grey. If it doesn't, it shifts the overall exposure as well as adding texture.
- **Soft-light differs between tools.** W3C soft-light is a specific piecewise formula [1].\[1\] Wikipedia's "Blend modes" article (secondary) says the W3C formula "is mathematically equivalent to the Photoshop formula with a small variation where b≤0.5 and a≤0.25", and that Photoshop's own formula "as of 2012 has a discontinuity of local contrast". A practitioner test (GitHub issue storytold/photocraft #8804, October 2026, using a psd-tools test PSD) reports the opposite: that Photoshop "uses the W3C curve below 0.25". The sources disagree, so the Photoshop match stays unverified. FFmpeg `softlight` is FFmpeg's own implementation [10]. Treat soft-light as tool-specific.

### 1.4 Non-separable modes [1]
- **hue:** `SetLum(SetSat(Cs, Sat(Cb)), Lum(Cb))`.
- **saturation:** `SetLum(SetSat(Cb, Sat(Cs)), Lum(Cb))`.
- **color:** `SetLum(Cs, Lum(Cb))`. Useful for "coloring monochrome images or tinting color images".
- **luminosity:** `SetLum(Cb, Lum(Cs))`.
- **Helper:** `Lum = 0.3R + 0.59G + 0.11B`, with ClipColor and SetSat defined in [1].
- **Tool support:** libvips and sharp do not implement these [9]. In a sharp pipeline, `color` blend tinting has to be built another way: a greyscale step, then a gradient map (§4).

### 1.5 Isolation and knockout groups
- **Isolated group:** "the initial backdrop shall be black and fully transparent" [1]. The group's members blend only with each other. The group then composites onto the scene with its own blend mode.
- **CSS:** `isolation: isolate` forces a group. So do opacity, filter, transform, `mix-blend-mode` other than normal, and anything else that creates a stacking context [1]. An `<img>` or background image always renders into an isolated group, so artwork inside a linked SVG never blends with the page [1].
- **Knockout groups**, where members composite against the group backdrop rather than each other, come from PDF. They have no CSS property. Emulate one by giving each member `destination-out` against a shared shape, or by rendering the members separately.
- **Agent pitfall:** adding `opacity: 0.99` or `will-change: transform` "for performance" to a parent. Either one silently isolates its children, and every `mix-blend-mode: multiply` inside stops reaching the paper texture underneath.

### 1.6 How tools map onto the model

| Tool | Blend surface | Space by default | Differences from W3C |
|---|---|---|---|
| CSS `mix-blend-mode` / `background-blend-mode` | all 16 modes [1] | sRGB-encoded values (browser practice; the spec does not mandate linear) | discrete animation; stacking-context isolation |
| CSS `filter` functions | blur, brightness, contrast, drop-shadow, grayscale, hue-rotate, invert, opacity, saturate, sepia [2] | "must operate in the sRGB color space" [2] | `blur()` takes a standard deviation, which is "different to box-shadow s blur radius" [2] |
| SVG `feBlend`, `feComposite` | blend modes from [1]; feComposite operators plus `arithmetic` (k1..k4) [2] | `linearRGB` unless `color-interpolation-filters="sRGB"` [2][4] | the source of most cross-tool mismatches |
| Canvas 2D `globalCompositeOperation` | `<blend-mode> \| <composite-mode>`, initial `source-over`; "Unknown values are ignored" [1][5] | sRGB-encoded | there is an interop issue over the value `normal` [6] |
| ImageMagick `-compose` | Porter-Duff plus many maths modes; its docs say Multiply, Screen, Darken, Lighten, Difference and Exclusion "behave identically to their SVG, PDF, and Photoshop equivalents" [7] | whatever colourspace the image is in; use `-colorspace RGB` to work in linear and `sRGB` to return | `-compose Mathematics -define compose:args=` gives custom linear blends; Multiply = `1,0,0,0`, Screen = `-1,1,1,0` [7] |
| sharp / libvips `composite` | clear, source, over, in, out, atop, dest…, xor, add, saturate, multiply, screen, overlay, darken, lighten, colour-dodge, colour-burn, hard-light, soft-light, difference, exclusion [8] | sRGB-encoded 8-bit unless converted | no non-separable modes [9] |
| FFmpeg `blend` / `tblend` | `all_mode` / `cN_mode`; default normal; modes include addition, average, burn, darken, difference, dodge, exclusion, grainextract, grainmerge, hardlight, … [10] | operates on the pixel format's components. In YUV, blending luma and chroma separately is **not** an RGB blend | convert to `gbrp` (planar RGB) first for RGB-equivalent results; `all_expr` allows custom formulas [10] |
| Blender compositor | Mix node modes | scene-linear: "Rendering and compositing is best done in scene linear color space" [11] | view transforms (AgX, Filmic) apply afterwards and change the look of every blend |

## 2. The colour space of blending

- **What goes wrong.** The formulas in §1 operate on numbers. If those numbers are sRGB-encoded (gamma-compressed), a 50/50 mix of black and white gives code value 0.5, which is about 21% linear light. If they are linear, the mix is 50% light, which displays as about code 0.735. A blur, an opacity cross-fade or a screen will therefore look darker and muddier in sRGB-encoded maths, and lighter and more "optical" in linear maths. MDN's stripe example shows exactly this [3].
- **What each tool does by default:**
  - CSS blend modes and filter functions use sRGB-encoded maths [2].
  - SVG filter primitives default to linearRGB [2][4].
  - Canvas 2D uses sRGB-encoded maths.
  - WebGL uses whatever your shader does. Textures are sampled encoded unless you use sRGB texture formats, so linearise explicitly.
  - ImageMagick uses the image's colourspace tag [7].
  - FFmpeg uses the pixel format, usually YUV [10].
  - Blender uses scene-linear [11].
- **Which space to choose:**
  - *Linear* when simulating light: glow, bloom, additive light, blur that should look optical, cross-dissolves of photographic material, motion blur.
  - *Encoded sRGB* when simulating ink and design-tool behaviour: multiply-on-paper print looks, duotones meant to match a Photoshop or Figma reference, threshold and posterise cut-offs designed by eye.
  - Neither is "correct". What is wrong is mixing them unknowingly in one piece.
- **Rules:**
  - `FX-BLEND-SPACE-DECLARED`: the scene declares its blend space.
  - `FX-BLEND-SPACE-CONSISTENT`: all treatments in a series use the declared space.
  - `FX-SVG-FILTER-CIF`: every SVG filter sets `color-interpolation-filters` explicitly.
- **Blender:** AgX "offers 16.5 stops of dynamic range", and Filmic "is deprecated and is superseded by AgX" [11]. Any blend done before the view transform is tone-mapped afterwards. Graphic, flat-colour work usually wants the `Standard` view, or blends done after the transform. Otherwise brand colours shift. Brand colour accuracy belongs to `ART-*`.

## 3. Masks and mattes

- **Alpha mask:** coverage comes from the alpha channel. **Luminance mask:** coverage comes from brightness. CSS `mask-mode: luminance` and SVG `<mask>`, whose default is luminance, follow this convention. Alpha is the safer default for type and shapes. Luminance suits soft photographic mattes.
- **Clipping** (`clip-path`) is binary geometry with antialiased edges. **Masking** is per-pixel and soft. Smith distinguishes binary masking from subtle matting [14].
- **Text as a mask (knockout type):**
  - Image showing through letters: `source-in`, or CSS `background-clip: text`.
  - Letters punched out of a plate: `destination-out`.
  - Legibility depends on what shows through. See §10 and `TYPO-CONTRAST`.
  - `FX-KNOCKOUT-LEGIBLE` (dropped; owner `TYPO-CONTRAST`): the image inside the counters must hold contrast against the surround for the whole time the text is on screen.
- **Track mattes:** After Effects vocabulary (alpha, alpha inverted, luma, luma inverted matte). The open equivalents are CSS `mask-image` referencing an animated element, SVG `<mask>` containing animated content, canvas `destination-in`, and FFmpeg `alphamerge` or `maskedmerge` (worked examples).
- **Feathering:** a Gaussian blur of the matte (σ in px), not of the content. The feather should scale with output resolution. A 4 px feather at 1080 wide becomes harsh after downscaling to 540 for a thumbnail.
- **Masks in motion:**
  - Animate the matte's transform, not its pixels, where possible. Transform is cheap, and the edge stays consistent.
  - A wipe matte's edge velocity should follow the `MOTION-*` easing.
  - Feather widths that change frame to frame read as focus pulsing.
  - Avoid subpixel shimmer on hard mattes by snapping static matte edges to whole pixels.

## 4. Tonal and colour treatments

- **Threshold:** `out = L >= T ? 1 : 0`, where L is the luma of your choice. Declare which: Rec.709 or Rec.601 weights, linear or encoded. This is the basis of the "two-colour threshold multiplied onto paper" look. Map 0 and 1 to two inks, then multiply over a paper plate.
- **Posterise:** `out = floor(L x n) / (n - 1)`, clamped, for n levels.
- **Duotone, tritone and gradient map:** compute luma, then index a 1D ramp. Examples:
  - SVG: `feColorMatrix type="saturate" values="0"`, then `feComponentTransfer type="table"` per channel.
  - FFmpeg: `format=gray`, then `lut`/`lutrgb`, or `haldclut` with a generated CLUT [10].
  - ImageMagick: `-colorspace gray` then `+level-colors ink1,ink2`.
- **The print duotone is different.** A print duotone is two inks multiplied, each with its own curve. A gradient map interpolates between colours in RGB. For a print look, model each ink as a multiplied layer with its own transfer curve.
- **Curves and levels:** monotonic 1D transfer functions. `feComponentTransfer` supports table, discrete, linear, gamma and identity [2]. `discrete` gives posterisation.
- **Selective colour and split toning:**
  - Split toning tints shadows toward one hue and highlights toward another. The weight is a function of luma, usually with a balance pivot.
  - Implement it as two `color`-mode layers masked by luma ranges, or as a 3D LUT.
- **3D LUTs (`.cube`)** [12]:
  - Keywords: `TITLE "…"`, `DOMAIN_MIN rl gl bl` (default `0 0 0`), `DOMAIN_MAX rh gh bh` (default `1 1 1`), and `LUT_3D_SIZE N` with N in [2, 256], or `LUT_1D_SIZE N` with N in [2, 65536].
  - Data: N³ lines of `R G B`, "with the first component index (Red) changing most rapidly"; C index `r + N*g + N*N*b`.
  - Lines must not exceed 250 bytes, and files using carriage return "are not valid cube files". Readers should use tetrahedral interpolation for 3D. Integer images are scaled to 0–1 and back.
  - The spec warns that some readers lack the memory "(200 MBytes) to support N = 256".
  - Apply: FFmpeg `lut3d=file=look.cube` (it shares interpolation options with `haldclut`) [10]; Blender via OCIO looks; WebGL via a 3D texture or a 2D-unwrapped strip.
  - Generate: apply your treatment to an identity lattice (FFmpeg `haldclutsrc=8`, then the treatment, then `haldclut`, using a lossless intermediate [10]), or write the N³ grid from code.
- **LUT rules:**
  - A LUT is valid only for the colour space it was built in (`FX-LUT-SPACE`).
  - A LUT cannot do spatial or temporal effects. No grain, halftone or blur.
  - `FX-LUT-VALID` checks conformance.
- **Where the line sits with `ART-*`:** `ART-*` chooses the palette and the colour intent. FX implements the mapping and checks that it is applied the same way everywhere.

## 5. Print-process looks

### 5.1 Halftone
- **AM (amplitude-modulated):** a fixed grid (lines per inch or, on screen, cell size in px) with variable dot size. **FM (stochastic):** fixed dot size with variable density, which is essentially dithering (§5.4).
- **Dot shapes:** round, elliptical (smoother mid-tone transitions), square, line. The cell function for a round dot at angle θ: rotate (x, y) by θ, take the fractional cell position, and output ink where `distance to cell centre < r(L)`, with `r ∝ sqrt(coverage)`.
- **Screen angles:**
  - The conventional offset set is C 15°, M 75°, Y 0°, K 45° (secondary sources [28][29]).
  - The reasoning: dominant screens sit 30° apart, and yellow, the least visible ink, takes the leftover 15° slot [28][29]. The European variant is 15, 45, 0, 75 [28].
  - For woven-mesh screen printing, the AccuRIP vendor Solutions for Screen Printers ("Halftone Angles Demystified") advises: "use the angle of 22.5 degrees for all your screens and halftones regardless of the style of printing… Tonal single color, multi-color… and CMYK", and says "AccuRIP® properly defaults to a single 22.5 degree angle." This is a vendor claim (heuristic). ScreenPrinting Mag's "Ten Tips" instead advises keeping contrasting colours "30° apart".
- **Moiré** comes from two periodic structures beating. On screen there is a third grid: the output pixel grid, plus H.264's 4×4/8×8 transform blocks and 16×16 macroblocks.\[10\]
  - A halftone cell of only a few pixels, rotated to a non-0°/45° angle, aliases against the pixel grid.
  - Heuristic: keep cells at least about 6 px at delivery resolution. This is a VCR-proposed default with no source; calibrate it.
  - Supersample the halftone (render at 2–4× and downsample with a proper filter).
- **Cheap tells:** perfectly uniform dots on flat colour with no ink spread; the same cell size over the whole frame regardless of subject scale; RGB halftone dots that never overlap like ink.

### 5.2 Risograph and screen print
- **Limited inks:** typically 1–4 spot colours. Each is a separate greyscale plate rendered in its ink colour and multiplied onto paper. Inks are translucent, so overlaps darken.
- **Overprint:** model it with multiply, in encoded space if you are matching a design reference.
- **Misregistration:** offset each plate by a small (dx, dy), and optionally rotate it slightly. Heuristic range is 1–4 px at 1080 width; this is taste, not sourced. It must be deterministic per plate, and per frame if animated.
- **Ink spread and texture:** dilate the plate slightly (`feMorphology dilate`, radius 0.5–1), add per-plate grain, and leave some coverage voids where the ink starved.
- `FX-INK-LIMIT`: a riso or screen look uses at most the declared ink count, with no colours that could not come from overprint combinations.

### 5.3 Letterpress, photocopy and newsprint
- **Letterpress:** a slight emboss or deboss (an offset highlight and shadow pair using `feSpecularLighting`/`feDiffuseLighting`, or a simple offset multiply), an ink-squeeze halo at the edges, and uneven fill.
- **Photocopy:** a high-contrast threshold of a slightly blurred source, plus toner speckle and edge drift. Generational loss can be faked by repeated blur, threshold and noise.
- **Newsprint:** a coarse AM screen at 45°, warm off-white paper, low-density black, and visible paper fibre.

### 5.4 Dithering
- **Ordered (Bayer):** compare each pixel with a tiled threshold matrix. It is cheap, parallel and shader-friendly, and gives a regular cross-hatch texture. The source is Bryce E. Bayer, "An optimum method for two-level rendition of continuous-tone pictures," IEEE International Conference on Communications, Conference Record, June 11–13 1973, pp. 26-11–26-15 (an archived PDF is linked from Wikipedia's "Ordered dithering" article). The paper was not read, so the matrix construction remains `unverified` here.
- **Error diffusion:**
  - Floyd–Steinberg (1976) spreads the quantisation error 7/16 right, 3/16 down-left, 5/16 down, 1/16 down-right [15]. The weights were reportedly chosen so that a 0.5 density "come out as a checkerboard pattern" (secondary).
  - Atkinson distributes 1/8 to each of six neighbours [15]. Only 6/8 of the error propagates, which gives brighter highlights and the classic Mac look.
  - Error diffusion is sequential (raster order), and serpentine scanning reduces directional "worms" [15].
- **Blue noise:** a threshold array with low frequencies suppressed. The canonical generator is Ulichney's void-and-cluster method (Proc. SPIE 1913, 1993) [16]. It gives the evenness of error diffusion with the parallelism of ordered dither.
- **Motion consequences (§8):**
  - Error diffusion is chaotic. A one-bit change upstream reshuffles the pattern downstream, so on moving input it boils on every frame. Avoid it for motion unless the boil is the intent.
  - Ordered and blue-noise dithers are stable when the input is stable, and their pattern stays fixed in the space you choose.

## 6. Textures and surfaces

- **Paper:** a scanned or procedural plate (fibre, tooth, slight colour variation) multiplied or soft-lit under the artwork. Ink layers should multiply onto it; a paper plate placed on top reads as a veil.
- **Film grain versus noise:**
  - Real grain is spatially correlated (it has a grain size), varies with intensity (often strongest in the mid-tones), and differs per channel.
  - AV1 models it with an autoregressive pattern scaled by a piecewise-linear function of intensity, then adds it to the decoded image [19][20]. Additive Gaussian white noise at a fixed amplitude is the "noise" look, and it reads as digital sensor noise or cheapness.
  - Recipe: generate seeded noise, blur it slightly (σ 0.5–1.5 px) for grain size, scale its amplitude by a luma-dependent curve, and add it in linear space or with an overlay/soft-light plate centred on 50% grey.
- **Dust and scratches:** sparse, seeded, short-lived elements, with a dust speck lasting 1–2 frames. Scratches are vertical, persistent over several frames, and drift slightly. Uniform density across the frame reads as a preset.
- **Scan artefacts:** bed shading, slight skew, edge vignetting, colour-fringe misalignment, JPEG-ish block noise. Use them sparingly.
- **Procedural versus photographic:**
  - Perlin noise, improved in 2002, replaced the interpolant `3t^2 - 2t^3` with `6t^5 - 15t^4 + 10t^3`, "which has zero first and second derivatives at both t=0 and t=1" [17].
  - `feTurbulence` "creates an image using the Perlin turbulence function" with `baseFrequency`, `numOctaves`, `seed`, `stitchTiles` and `type` (`fractalNoise | turbulence`) [2][18]. It handles colour in linearRGB by default [18].
  - Procedural textures are resolution-independent, seedable and animatable. Photographic plates carry real-world irregularity but must be pre-scaled and tiled carefully (visible tile repeats are a classic cheap tell).
- **Applying textures:** multiply for ink and dirt, screen for light leaks and dust on black, overlay or soft-light for neutral tooth (centred on 50% grey), and `source-atop` to keep a texture inside a shape.

## 7. Stylised effects

**Choose the process before the effect stack.** [Visual Research §3–4](../visual-research/README.md) supplies observed process cues and `VREF-TRANSFER-EXPLAINED`; [Cultural Context §2–3](../cultural-context/README.md) supplies any audience-dependent genre readings. Art Direction selects the treatment. FX owns how blending, masks and texture produce it; a named effect does not establish historical authenticity or cultural meaning.

| Effect | Intent | How it works | Typical parameters | Reads as cheap when |
|---|---|---|---|---|
| Glow / bloom | light, energy, emphasis | threshold the highlights, blur them at several radii, then add (`lighter`/screen) in linear space | 2–4 blur octaves, intensity under 1 | done in sRGB (grey halos); glow on everything; a single radius |
| Chromatic aberration / RGB split | lens realism, glitch energy | offset or scale R and B channels relative to G, radially from centre for lens-like CA | 1–3 px at 1080 for lens; more for glitch | uniform offset across the frame; on body text (hurts legibility); always on |
| Displacement / distortion | heat, water, glitch, hand-made wobble | `feDisplacementMap` (scale, xChannelSelector, yChannelSelector) driven by `feTurbulence` or an image [2][18] | scale 2–20 px | unseeded or wall-clock driven; wobble on type that should stay legible |
| Gaussian blur | depth, focus, softness | separable convolution; CSS uses σ [2] | σ in px | animated per frame without need (cost); blurring in the wrong space |
| Motion blur | speed realism | accumulate sub-frame samples (shutter), or a directional blur along the velocity | 180° shutter equivalent is the cinematic convention (heuristic) | a fixed-direction blur on curved motion; blur on still frames |
| Radial / zoom blur | impact, speed | samples along rays from a centre | 8–32 samples | used as a transition on every cut |
| Tilt-shift | miniature look | a blur mask with a sharp band | — | without the matching saturation and top-down view |
| Scanlines / CRT | retro display | dark lines every n rows, phosphor RGB mask, barrel curve, bloom | lines aligned to output rows | lines that don't map 1:1 to output rows (moiré after scaling); flicker |
| Glitch / datamosh | breakage, digital tension | block displacement, channel shifts, slices; true datamosh removes I-frames so P-frame motion vectors smear new content | short bursts | constant glitch; random per-frame glitching (strobing; check `A11Y-FLASH-*`) |
| Double exposure | memory, duality | screen or lighten two images, often one masked by a silhouette | — | no tonal plan: grey mush where mid-tones collide |
| Collage / cut-out / torn paper | hand-made, editorial | alpha masks with irregular edges, paper drop shadows, slight rotation, paper texture | shadow offset 2–8 px, soft | identical tear edges reused; perfect vector edges |
| Drop / long shadow | depth, separation | blurred offset of the alpha (CSS `drop-shadow`, σ-based [2]); long shadow by repeated offset or extrusion | — | grey shadows on colour (use a darker hue of the backdrop); inconsistent light direction |
| Raster outlines / strokes | sticker look, separation | dilate the alpha (`feMorphology`), fill, composite under | 2–8 px | jagged from dilating an aliased alpha; strokes thicker than the type's stem logic (cite `TYPO-*`) |

- **Datamosh note.** True datamosh exploits codec prediction, so it cannot be computed by seeking to frame t independently. Render it as a separate FFmpeg pass on an intermediate file, then treat the result as footage.

## 8. Effects in motion (the most important section)

### 8.1 Temporal stability
- **The problem.** For a threshold, posterise or dither, any pixel whose input sits near a cut-off flips state whenever the input moves by tiny amounts. Sources include subpixel motion, video noise, compression noise in source footage, and floating-point differences in scaled layers. The result is "boil": crawling, sparkling edges and fields.
- **Fixes:**
  1. **Pre-smooth the input.** Blur slightly before the threshold, and denoise footage temporally (FFmpeg `hqdn3d` or `atadenoise` in a pre-pass) so pixels don't cross the cut-off on noise.
  2. **Hysteresis.** Keep two thresholds, `T_on > T_off`, and keep each pixel's previous state unless it crosses the far threshold. This needs the previous frame's state. In a seek-based renderer, compute it from a deterministic recurrence (render frames sequentially in a pre-pass and cache them), or approximate it by thresholding a temporally smoothed input.
  3. **Fixed screens.** Use an ordered or blue-noise threshold array fixed in a declared space (§8.3). Stable input then gives a stable output pattern.
  4. **Quantise time on purpose.** Update the treatment only every 2nd or 3rd frame ("on twos" or "on threes") so boil reads as a hand-made, stepped texture rather than electrical noise. Implement this as `t_fx = floor(t x fps / k) x k / fps` and seed the noise from `t_fx`.
- **Deliberate boil** (line boil in hand-drawn animation, riso texture breathing) is legitimate when it is stepped (on twos or threes), consistent in amplitude, and declared in the scene (`FX-BOIL-STEPPED`). Uncontrolled per-frame sparkle is not.

### 8.2 Determinism
- **Rule.** Every random value is `f(seed, t_fx, x, y, layerId)`. Never use `Math.random()`, `Date.now()`, `performance.now()`, `requestAnimationFrame` timestamps or GPU-timing-dependent state (`FX-NO-WALLCLOCK`).
  - Seeded sources: `feTurbulence seed` [2], FFmpeg `noise` `all_seed` (default 123457 [23]), and a hash-based noise in shaders.
  - With FFmpeg `noise`, flag `t` makes the "noise pattern change between frames", while without it the pattern is static [10][23].
- **Choose a texture attachment for each texture and declare it:**
  - **Frame-locked:** the texture is fixed to the screen, so the image slides under it. This is correct for lens dirt, screen grain, CRT and scanlines.
  - **Object-locked:** the texture moves with its layer. This is correct for paper an illustration is printed on, and for a texture "printed" on a product.
  - **Animated on purpose:** a new grain pattern every frame or every k frames, as with real film grain.
  - Mixing these by accident is a classic tell. A "printed" poster that slides under a static paper texture reads as a filter laid over video.

### 8.3 Screen and pattern behaviour
- **Halftone screens and dither arrays have a coordinate space.**
  - Frame-locked: the image crawls through the dots. This looks like video shown through a screen and is acceptable for "screen" metaphors.
  - Object-locked: the dots ride with the object. This looks like printed matter moving.
  - When an object scales, an object-locked screen scales its cells too, so decide whether cell size should stay constant (re-screen every frame, which crawls) or scale (stable, but the dots grow).
- **Crawl cue:** a frame-locked screen over slowly panning content produces moving moiré bands. Either lock the screen to the content, or ensure the cell is coarse enough (§5.1).
- `FX-SCREEN-SPACE-DECLARED` and `FX-SCREEN-CRAWL`.

### 8.4 Animating effect parameters
- **Threshold sweeps** (revealing an image by lowering T): ease them with `MOTION-*` curves. A linear sweep through mid-tones looks like it suddenly pops, because many pixels share mid-tone values. Consider sweeping in a perceptual space, or animating a histogram-equalised input.
- **Grain intensity:** change it slowly, over seconds. Grain pumping on the beat is a deliberate music-visual move, but it must respect `A11Y-FLASH-*`.
- **Misregistration drift:** low-frequency, seeded drift of ±1–2 px over seconds reads as press wobble. Frame-rate jitter reads as a bug.
- **Blend mode changes are discrete** [1]. Cross-fade two layers instead.

### 8.5 Flashing risk
- High-contrast treatments that switch whole regions between dark and light can count as flashes: a threshold boil on large areas, difference-mode strobes, glitch bursts, inversion cuts, CRT flicker.
- WCAG 2.3.1's thresholds (quoted in Key findings [27]) and the area rule (25% of any 10° visual field [27]) belong to `A11Y-FLASH-*`. FX's job is to keep treated regions from generating flash sequences, and to run the A11Y checker on treated renders (`FX-FLASH-SAFE`).
- FFmpeg ships a `photosensitivity` filter that can attenuate frames exceeding a detection threshold [10]. It is a mitigation, not a compliance proof.

## 9. Delivery survival

- **Owner.** `DELIVERY-*` owns bitrates and codec settings. The figures here are only to motivate design choices.
  - YouTube recommends H.264 High Profile, 4:2:0 chroma, a closed GOP of half the frame rate, and 8 Mbps (24–30 fps) or 12 Mbps (48–60 fps) for 1080p SDR [24].
  - TikTok's Content Posting API recommends H.264 and allows 23–60 fps and 360–4096 px per side [25]. Its ad specs ask for vertical "more than or equal to 540*960px" and "Bitrate: More than or equal to 516 kbps" [26].
  - Meta's Instagram Graph API "IG User Media" reference (updated June 22, 2026) lists Reel specs as "Video codec: HEVC or H264, progressive scan, closed GOP, 4:2:0 chroma subsampling", "Frame rate: 23-60 FPS", "Maximum columns (horizontal pixels): 1920" and "Video bitrate: VBR, 25Mbps maximum" [31]. That is an upload ceiling, not a delivery floor.
- **What happens to texture:**
  - **Grain and fine noise** are spatially random, so they are expensive to code. At low bitrates the encoder smooths them away (mush) or quantises them into blocky patches that crawl between GOPs. AV1 solves this by stripping and re-synthesising grain [19]. In H.264, film-grain SEI (SMPTE RDD 5-2006) is a registered disclosure, "NOT a Standard", describing optional bit-accurate synthesis [21]. FFmpeg's support is limited, and there is no evidence platforms apply it, so do not rely on it.
  - **Single-pixel dither and halftone** suffer the same fate, and they can also beat against 8×8 transform blocks.
  - **4:2:0 chroma** halves colour resolution in both axes, so 1 px red/blue misregistration, chromatic aberration and coloured halftone dots blur into fringes (`FX-CHROMA-SUBSAMPLE` (dropped; owner `DELIVERY-RED-CHROMA`)). Put fine texture in luma, and colour texture at 2 px or more.
  - **Banding:** smooth gradients (vignettes, glows, duotone ramps) band at 8 bits, and worse after re-encoding. A small amount of static, luma-only dither before the 8-bit conversion helps, provided the dither survives (it often doesn't at social bitrates; test it).
- **What survives at social bitrates** (heuristic, to be confirmed by `FX-TEXTURE-SURVIVAL` on each project):
  - Coarse grain with a 2–3 px or larger feature size at delivery resolution.
  - Halftone cells of about 6 px or more.
  - Paper texture with low-frequency variation.
  - Riso misregistration of 2 px or more.
  - Stepped (on twos) rather than per-frame grain, because static frames code cheaply and temporal redundancy helps.
- **Encoder tuning when you control the encode:**
  - x264 `--tune grain` sets "--aq-strength 0.5 --no-dct-decimate --deadzone-inter 6 --deadzone-intra 6 --deblock -2:-2 --ipratio 1.1 --pbratio 1.1 --psy-rd <unset>:0.25 --qcomp 0.8" [22].
  - Useful for masters. Irrelevant after platform re-encode, which is why the texture has to survive by design.

## 10. Legibility

- Text over textured or treated imagery must pass `TYPO-CONTRAST`, measured on the rendered, treated frame over the text's actual footprint, and on the worst frame across the text's lifetime (`FX-TEXT-CONTRAST` (dropped; owner `TYPO-CONTRAST`)).
- **Common destroyers:**
  - Overlay or soft-light texture applied above the type layer.
  - Grain on small type.
  - Chromatic aberration on body copy.
  - Displacement on text.
  - Difference-mode type. It inverts against a mid-grey backdrop to near mid-grey (a secondary source notes white text over RGB ~127 becomes ~128 under difference).\[11\]
  - Halftone of the type itself at small sizes.
- **Fix:** apply treatments beneath the type layer, or give the type its own lighter treatment.
- **Focal point:** treatments should lower detail in the background and keep it on the subject. Effects applied with equal strength everywhere flatten the hierarchy (`FX-FOCAL-PRESERVED`, judgement; composition is owned by `ART-*`).

## 11. Cost in a seek-and-capture renderer

- **Relative cost**, a heuristic ranking from practitioner reports and spec mechanics, from cheapest to most expensive:
  1. Pre-rendered bitmap.
  2. CSS blend modes and simple filter functions on small layers.
  3. Canvas 2D composite ops.
  4. WebGL fragment shaders. These are cheap per pixel on a GPU, but headless Chromium may run software rasterisation.
  5. SVG filter graphs with blur, turbulence or lighting over large regions.
  6. `backdrop-filter` blur, which re-samples whatever is beneath it whenever that repaints.
- **Practitioner reports** (secondary, issue trackers):
  - A full-viewport `filter: blur(30px) → 0` transition "cannot run on the compositor thread: every frame re-rasterizes the layer and re-runs a Gaussian blur convolution" [30].\[12\]
  - Removing a full-window `backdrop-filter: blur(10px)` restored rAF from 20–25/s to 59–60/s in Chromium with software raster [30].\[13\]
- **In VCR, real-time fps doesn't matter, but capture time per frame does.** At 60 fps, a 30 s piece is 1,800 screenshots.
- **Rules:**
  - `FX-CACHE-STATIC`: any treatment whose inputs don't change over time (paper, a static threshold of a still image, a LUT bake, a halftone of a logo) is pre-rendered once (resvg, ImageMagick, sharp) and placed as an image.
  - `FX-RENDER-COST`: measure per-frame capture time and flag treatments that exceed the budget.
  - `FX-BACKDROP-FILTER-BUDGET`: avoid `backdrop-filter` over animated content unless it is the point of the shot.
- **Turbulence cost:** `feTurbulence` cost grows with `numOctaves` and region size. Bake turbulence to a texture and animate its transform when it doesn't need to evolve.

## 12. Measurement: what an agent can check

| Check | Signal |
|---|---|
| Temporal flicker | frame-to-frame luma change in treated regions where the source is static |
| Determinism | the same frame captured twice gives identical pixels |
| Texture survival | high-frequency energy before and after a simulated re-encode |
| Contrast over treatment | `TYPO-CONTRAST` computed on treated frames |
| Blend space declared and consistent | scene metadata plus a static scan of computed styles and SVG attributes |
| Render cost | wall-clock capture time per frame versus a baseline |
| Flash | the `A11Y-FLASH-*` analyser run on treated output |

Details are in §18.

## 13. Medium-specific guidance

- **9:16 social (1080 × 1920):**
  - Mostly watched on phones, at arm's length, often muted, then re-encoded.
  - Use coarser texture (§9). Keep treatments off the platform UI safe zones (`TYPO-SAFE`, `DELIVERY-*`), because grain under UI overlays is wasted bits.
  - Be careful with full-frame high-contrast boil: phone screens fill much of the visual field, which raises flash area exposure.
- **16:9:** larger viewing angle on desktop or TV, and higher typical bitrates (YouTube [24]). Finer grain is acceptable, but verify it after the YouTube re-encode.
- **Square:** the feed context is the same as 9:16. Centre-weighted treatments (vignettes, radial CA) read well.
- **Stills (resvg, ImageMagick, sharp):**
  - Time doesn't exist, so error-diffusion dithers and fine halftones are fine.
  - Still check JPEG/WebP survival at the delivery quality.
  - For print-like stills, render at 2× and downsample to avoid halftone aliasing.
- **Loops:**
  - The last frame must flow into the first, and noise, texture drift and misregistration must loop too. Use periodic noise (sample 4D noise on a circle, or `stitchTiles` for spatial tiling [2]) and drift that returns to its start.
  - Grain seeded from `t_fx mod loopFrames`.
  - Check the seam frame pair with the flicker metric.

## 14. The analysis and critique process (reviewer subagent)

1. **Read the brief and the declared FX spec**: blend space, texture attachments, boil rates, seeds, ink count. Missing declarations are findings in themselves.
2. **Watch in motion at delivery size, then at 2×.** Never judge a treatment from stills alone. Boil, crawl and seam pops exist only over time. Then step through frames at the hot spots the metrics flag.
3. **Run the measurable checks** (§18): determinism, flicker, flash, contrast, texture survival on a simulated re-encode, and cost.
4. **Judge purpose:** does the treatment serve the brief's intent (`ART-*`), or is it decoration? Does it keep the focal point?
5. **Judge craft:** restraint, coherence of space (frame-, object- or time-locked), neutral values chosen correctly, imperfection that varies without being random noise.
6. **Write the findings.** Each finding gives the rule ID, the frames or time range, the evidence (a metric value or crop), the severity and a concrete parameter fix.
- **Severity:**
  - **Blocker:** `FX-FLASH-SAFE` (dropped; owner `A11Y-FLASH-*`) failure, `FX-TEXT-CONTRAST` (dropped; owner `TYPO-CONTRAST`) failure on required text, `FX-DETERMINISM` (dropped; one generic check, `vcr capture --verify`) failure, treatment destroyed after delivery encode.
  - **Major:** undeclared boil or crawl on hero content, wrong blend space causing visible mismatch across a series, isolation bug removing an intended blend, render cost over budget.
  - **Minor:** cheap tells (uniform grain, tile repeats, preset CA), feather inconsistencies.
  - **Note:** taste suggestions.
- **Vocabulary for findings, and what each maps to:**

| Term | Usually means | Parameter or measurement |
|---|---|---|
| muddy | mid-tones collapsed, greyed colours | blending in encoded space where linear was meant; overlapping multiply plus overlay; histogram compression in mid-tones |
| plasticky | over-smoothed, no texture, waxy skin | excessive denoise or blur; high-frequency energy near zero; texture lost to encode |
| filter-y | effect sits on top of the image rather than in it | frame-locked texture over object-locked content; uniform strength everywhere; wrong neutral value |
| overcooked | too much of everything | grain or CA amplitude, clarity and contrast past clipping; count of clipped pixels; stacked effects |
| it's a preset | recognisable default parameters | default `feTurbulence` values, fixed RGB split, uniform dust; no relation to brief |
| boiling / crawling | temporal instability | flicker metric; screen-space mismatch |
| crunchy | over-sharpened or quantised edges | halos, posterise banding, dither too fine for encode |
| veiled / milky | lifted blacks | screen or overlay plate not neutral; texture on top instead of beneath |

- **Agent pitfalls to call out:**
  - Homogenised output, where every piece gets grain + CA + vignette.
  - Over-applying rules: some briefs want boil, glitch or moiré.
  - Judging motion from stills.
  - Trusting the declared blend space without measuring a rendered patch.

## 15. The creation process

**Asset handoff.** Consume the image brief and preparation list from [Image Direction §3–5](../image-direction/README.md), especially `IMAGE-PREP-DECLARED` and `IMAGE-ORIGINAL-PRESERVED`. Keep source–derivative relationships with the shared provenance record. Image Direction decides whether mixed assets can form a coherent set; FX executes the agreed reconciliation and checks treatment survival. Lighting and Materials retain their respective light and surface rules.

1. **From the brief:** name the reference process (riso? newsprint? CRT?) and *why* it fits (`ART-*`). Decide the ink and palette count, and the blend space.
2. **Design for motion first:** decide each texture's attachment (frame, object or time), boil rate (none, on twos, on threes) and seed strategy before building the look.
3. **Build the stack from bottom to top:** paper or substrate → content plates → per-plate treatment (threshold, halftone) → overprint blends → global texture → light effects (glow, in linear) → type (cleaner; `TYPO-*`). Keep type above destructive treatments.
4. **Choose neutral values and intensities with restraint.** Start at half of what feels right, then add.
5. **Bake what's static** (`FX-CACHE-STATIC`). Shader or filter only what changes.
6. **Verify:** run the checks in §18. Encode a test at delivery settings, view it on a phone-sized display, and fix whatever doesn't survive by coarsening rather than strengthening.
7. **Record the FX spec** in the series brief (`BRIEF-*`): space, seeds, attachments, rates, ink colours and LUT files. Series episodes then reproduce it exactly.

## 16. Authoritative sources and canon

- **W3C Compositing and Blending Level 1** [1]: the normative formulas for blend modes, Porter-Duff, isolation and canvas. The primary reference.
- **W3C Filter Effects Level 1** [2]: filter primitives, `color-interpolation-filters`, filter functions in sRGB. MDN's guide [3] gives practical colour-space advice.
- **WHATWG HTML canvas** [5]: `globalCompositeOperation`.
- **Porter & Duff, "Compositing Digital Images" (SIGGRAPH 1984)**: the compositing algebra (cited via [1]). **Alvy Ray Smith**, Tech Memo 7 [14]: alpha and premultiplication.
- **ImageMagick compose docs** [7], **sharp/libvips** [8][9], **FFmpeg filters** [10] and **Blender colour management** [11]: tool behaviour.
- **Adobe Cube LUT Spec 1.0** [12]: LUT interchange.
- **Floyd & Steinberg 1976**; **Bayer 1973**; **Ulichney, *Digital Halftoning* and void-and-cluster 1993** [16]: dithering and halftoning theory.
- **Perlin 1985 / 2002** [17]: procedural noise.
- **Norkin & Birkbeck 2018** [19], the AV1 overview [20] and **SMPTE RDD 5** [21]: grain modelling and synthesis.
- **WCAG 2.x SC 2.3.1** [27]: flash. Owned by `A11Y-*`.
- **Platform specs** [24][25][26]: owned by `DELIVERY-*`.
- **Practitioner vocabulary:** Photoshop and After Effects (blend-mode names, track mattes), Cinema 4D, Octane and Redshift (render-side glows and grain). These are the origins of most of the vocabulary. Their open equivalents are listed beside each technique.

## 17. Encoding for an AI agent: rules table

| ID | Check | Threshold | Tier | Applies to |
|---|---|---|---|---|
| FX-BLEND-SPACE-DECLARED | Scene declares blend space (`srgb-encoded` or `linear`) | declaration present | heuristic | all scenes using blends or filters. Measurable (static scan) |
| FX-BLEND-SPACE-CONSISTENT | All treatments match the declared space across a scene and series | 0 mismatches | heuristic | series. Measurable (static scan plus test-patch render) |
| FX-SVG-FILTER-CIF | Every SVG `<filter>` sets `color-interpolation-filters` explicitly; initial value is `linearRGB` [2] | attribute present on every filter | standard (default behaviour) / heuristic (requirement) | SVG and CSS `url()` filters. Measurable (DOM) |
| FX-ISOLATION-EXPLICIT | Each element with a `mix-blend-mode` other than normal blends with its intended backdrop: no unintended stacking context between them [1] | 0 unintended isolating ancestors | standard (mechanism) / heuristic (requirement) | HTML/CSS scenes. Measurable (DOM ancestors' computed styles) |
| FX-BLEND-ANIM-DISCRETE | No animation tweening `mix-blend-mode` or `background-blend-mode` (animation type discrete [1]) | 0 occurrences | standard | CSS/WAAPI/GSAP. Measurable (sampled computed style) |
| FX-NONSEP-TOOL | Non-separable modes not requested in libvips/sharp ("not implemented" [9]) | 0 occurrences | platform | sharp stills. Measurable (code scan) |
| FX-PREMULT-EDGES | No dark or light fringes at alpha edges after resample or filter | edge luma deviation within the heuristic tolerance | heuristic | RGBA assets, ProRes 4444 masters. Measurable (edge-band analysis) |
| FX-DETERMINISM | Same frame captured twice is pixel-identical | 0 differing pixels | heuristic (VCR contract) | all browser scenes. Measurable |
| FX-NO-WALLCLOCK | No `Math.random`, `Date.now`, `performance.now`, or rAF timestamps in effect code | 0 occurrences | heuristic (VCR contract) | browser scenes. Measurable (static scan plus determinism) |
| FX-SEED-DECLARED | Every noise source has an explicit seed (`feTurbulence seed`, FFmpeg `all_seed`, shader uniform) | all seeded | heuristic | procedural textures. Measurable |
| FX-TEMPORAL-FLICKER | Treated regions don't change state when their source is static, unless boil is declared | proposed: <1% of treated pixels flip per frame over static source (calibrate) | heuristic | thresholds, posterise, dithers, halftones. Measurable |
| FX-BOIL-STEPPED | Declared boil updates on a fixed step (every k frames, k ≥ 2) and amplitude is stable | flips occur only on step frames | heuristic | deliberate boil. Measurable |
| FX-THRESHOLD-HYSTERESIS | Thresholds on live or moving footage use pre-smoothing or hysteresis | presence of smoothing or hysteresis | heuristic | footage treatments. Judgement plus flicker metric |
| FX-SCREEN-SPACE-DECLARED | Each texture, screen and dither declares frame-, object- or time-lock | declaration present | heuristic | all textures. Measurable (metadata) |
| FX-SCREEN-CRAWL | Pattern moves consistently with its declared space | object-locked: pattern phase follows object transform; frame-locked: pattern static in frame | heuristic | halftones, dithers, paper. Measurable (phase correlation) |
| FX-HALFTONE-ANGLES | Multi-ink AM halftones use angles ≥ 30° apart for dominant inks (C15/M75/Y0/K45 convention) | angle separation ≥ 30° except the lightest ink | heuristic (secondary print sources) | print looks. Measurable (params) |
| FX-MOIRE-RESAMPLE | Periodic patterns not near pixel or block pitch at delivery | proposed: cell ≥ 6 px at delivery resolution | heuristic | halftones, scanlines, fine stripes. Measurable (FFT peaks) |
| FX-INK-LIMIT | Riso or screen-print looks use ≤ declared ink count, colours only from overprints | ≤ declared N | heuristic | print looks. Measurable (palette clustering) |
| FX-MISREG-RANGE | Misregistration offsets within declared range, seeded, low-frequency drift | proposed 1–4 px at 1080 width | heuristic | riso looks. Measurable (params) |
| FX-GRAIN-SCALE | Grain feature size survives delivery | proposed ≥ 2 px correlation length at delivery resolution | heuristic | grain, noise. Measurable (autocorrelation) |
| FX-TEXTURE-SURVIVAL | Texture energy retained after simulated platform re-encode | proposed ≥ 50% of the high-band energy retained in textured regions | heuristic | all textures for social. Measurable |
| FX-BANDING | No visible banding in gradients after encode | Superseded: use `DELIVERY-BANDING`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | glows, vignettes, ramps. Measurable |
| FX-CHROMA-SUBSAMPLE | No essential colour detail finer than 2 px (lost to 4:2:0 [24]) | Superseded: use `DELIVERY-RED-CHROMA`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | CA, riso, coloured halftone. Measurable |
| FX-LUT-VALID | .cube conforms to spec [12] | N in [2,256] (3D) or [2,65536] (1D); N³ rows; LF line endings; lines ≤ 250 bytes | standard (Adobe spec) | LUT files. Measurable (parser) |
| FX-LUT-SPACE | LUT input colour space declared and matched | declaration present | heuristic | LUT use. Measurable (metadata) |
| FX-MASK-EDGE | Feather scaled to output resolution; feather not animating unintentionally | feather σ constant unless keyed | heuristic | masks and mattes. Measurable (sampled params) |
| FX-KNOCKOUT-LEGIBLE | Knockout or image-filled type passes `TYPO-CONTRAST` over its lifetime | Superseded: use `TYPO-CONTRAST`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | knockout type. Measurable |
| FX-TEXT-CONTRAST | Text over treated imagery passes `TYPO-CONTRAST` on treated frames, worst frame | Superseded: use `TYPO-CONTRAST`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | all text. Measurable |
| FX-FLASH-SAFE | Treated output passes `A11Y-FLASH-*` | Superseded: use `A11Y-FLASH-GENERAL`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | all motion. Measurable |
| FX-FOCAL-PRESERVED | Treatment keeps detail and contrast on the focal subject | — | heuristic | all. Judgement only (optionally a saliency proxy) |
| FX-RENDER-COST | Per-frame capture time within budget | proposed ≤ 3× the scene's untreated baseline (calibrate) | heuristic | browser scenes. Measurable |
| FX-CACHE-STATIC | Time-invariant treatments are pre-rendered assets | 0 time-invariant per-frame filters | heuristic | all. Measurable (frame-hash of the treated layer is constant → should be baked) |
| FX-BACKDROP-FILTER-BUDGET | `backdrop-filter` over animated content only where intended | flagged for review | heuristic | CSS scenes. Measurable (DOM) |
| FX-PRESET-SMELL | No unmodified default parameters or generic stack (grain+CA+vignette) without brief reason | — | heuristic | all. Judgement (assisted by param scan) |
| FX-INTENSITY-RESTRAINT | Effect strength proportionate; clipping limited | proposed: <0.5% of pixels clipped introduced by the treatment (calibrate) | heuristic | glows, dodge/burn, contrast. Measurable plus judgement |
| FX-ALPHA-MASTER | Alpha masters declare straight or premultiplied, and edges verified | Superseded: use `DELIVERY-MASTER-ALPHA`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | ProRes 4444 deliveries (`DELIVERY-*`). Measurable |
| FX-LOOP-SEAM | Loop seam has no texture, noise or drift discontinuity | Superseded: use `MOTION-RHY-004`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | loops. Measurable |

## 18. How to measure in VCR

- **FX-DETERMINISM:** (dropped; one generic check, `vcr capture --verify`)
  - Inputs: rendered PNGs.
  - Calculation: seek(t), capture, seek elsewhere, seek(t) again, capture, then a byte compare or per-pixel diff.
  - Sampling: 5 random t per scene plus marker times.
  - Failure modes: GPU raster nondeterminism in headless Chromium (pin flags and software rendering for checks); fonts not loaded on the first capture; video elements decoding asynchronously.
- **FX-TEMPORAL-FLICKER:**
  - Inputs: PNG frames, element transforms across frames, and treatment masks (render the treated layer alone, or diff treated against untreated).
  - Calculation: identify "static source" pixels, where the untreated render changes by ≤1 code value between frames N and N+1. Compute the fraction of those pixels whose treated value changes by more than a step (for binary treatments, any flip).
  - Sampling: every frame over a 2 s window around hot spots, plus a sparse scan across the whole piece.
  - Failure modes: fades and colour animation register as "source change"; encoded source footage is never static (denoise first or raise the tolerance); deliberate boil needs the declared step mask.
- **FX-BOIL-STEPPED:** compute the flip fraction per frame, then check that flips happen only where `frame mod k == 0`. Failure mode: frame rates that aren't multiples of k.
- **FX-SCREEN-CRAWL:**
  - Calculation: phase correlation of the treated layer's high-pass in the object's bounding box, compared with the object's sampled transform. Object-locked means the pattern shift equals the object shift; frame-locked means zero shift.
  - Failure modes: scaling and rotation (use log-polar), low-texture regions.
- **FX-TEXTURE-SURVIVAL / FX-GRAIN-SCALE / FX-BANDING:** (dropped; owner `DELIVERY-BANDING`)
  - Inputs: the master render, and a simulated delivery encode. FFmpeg libx264, `yuv420p`, at the target platform's bitrate from `DELIVERY-*`, then re-encoded again at a lower bitrate to mimic platform processing.
  - Calculations:
    - Survival: high-pass (difference of Gaussians, roughly 1–4 px band) energy in textured regions, after ÷ before.
    - Grain scale: the autocorrelation half-width of the grain layer.
    - Banding: in smooth-gradient masks, detect plateaus and step edges in luma.
  - Failure modes: the platform encoder is unknown and changes, so the simulation is a proxy; motion-heavy shots fare worse than the sampled frames; the metric can't tell grain from compression noise (compare against the untreated encode).
- **FX-TEXT-CONTRAST / FX-KNOCKOUT-LEGIBLE:** (both dropped; owner `TYPO-CONTRAST`)
  - Inputs: `textBounds()` or the DOM text rects at t, and PNG frames.
  - Calculation: the `TYPO-CONTRAST` algorithm on the treated frame. Use background percentiles (for example the 10th/90th luma in the bounds dilated by the stroke), not the mean.
  - Sampling: every 0.25 s over the text's lifetime, plus treatment-parameter peaks.
  - Failure modes: antialiasing contaminates samples; grain makes per-pixel contrast noisy (use percentiles).
- **FX-FLASH-SAFE:** (dropped; owner `A11Y-FLASH-*`) run the `A11Y-FLASH-*` analyser on the decoded delivery video. Encoding can soften flashes, but analyse the master too.
- **FX-BLEND-SPACE-* / FX-SVG-FILTER-CIF / FX-ISOLATION-EXPLICIT / FX-BLEND-ANIM-DISCRETE:**
  - Inputs: DOM and computed styles at t.
  - Calculations:
    - Walk the ancestors of each blended element for stacking-context creators (opacity < 1, filter, transform, isolation, will-change, mix-blend-mode, mask, and so on).
    - Check that every `<filter>` has `color-interpolation-filters`.
    - Sample `mix-blend-mode` across frames for changes.
    - A test-patch render (black/white stripes under a blur and a 50% multiply) confirms the effective space.
  - Failure modes: canvas and WebGL hide their blend state from the DOM (require a declaration in scene metadata).
- **FX-RENDER-COST:**
  - Calculation: time per seek+capture with the treatment enabled, compared with the treatment toggled off (a scene flag). Use the median of 10 frames.
  - Failure modes: machine variance, cold caches, first-frame shader compile.
- **FX-CACHE-STATIC:** hash the treated layer's pixels across frames. If the hash is constant while a per-frame filter is active, bake it.
- **FX-LUT-VALID:** parse the file against [12]: keyword uniqueness, size range, row count, number range ±1e+37, LF line endings, line length.
- **FX-MOIRE-RESAMPLE:** a 2D FFT of the treated region at delivery resolution. Flag strong peaks near the Nyquist frequency or near the 1/8-pixel block frequency. Failure mode: intentional fine patterns.
- **FX-LOOP-SEAM:** (dropped; owner `MOTION-RHY-004`) compare the flicker metric and the mean absolute difference for the pair (last, first) against the median over all consecutive pairs.

## 19. VCR-specific rendering and delivery notes

- **Seeking breaks stateful effects.** Error diffusion across time, feedback trails, hysteresis, datamosh and accumulation motion blur all depend on previous frames. Either make them pure functions of t (closed-form drift, noise seeded by `t_fx`), or render them in a sequential pre-pass to cached frames or a video, then composite that as footage.
- **Fixed fps quantises time.** Stepped boil should be defined in frames and converted per fps. "On twos" at 24 fps is 12 updates per second; at 60 fps, choose k = 5 for a similar feel. Sub-frame motion blur needs explicit shutter sampling (render N sub-samples per frame and average them in linear space).
- **`yuv420p` conversion.** Every RGB treatment passes through RGB→YUV with chroma halved. Run FX checks on the decoded delivery, not only on PNGs. Watch the BT.709 matrix and range tags (owned by `DELIVERY-*`), because mismatches shift duotone colours.
- **ProRes 4444 alpha masters** keep alpha for downstream compositing. Declare the alpha convention and verify the edges (`FX-ALPHA-MASTER` (dropped; owner `DELIVERY-MASTER-ALPHA`)).
- **Platform re-encode is a second generation of loss.** Design textures for the second generation.
- **Headless Chromium** may differ from a desktop GPU in filter precision and speed. Lock the render configuration for checks.

## 20. Master checklists

**Analysis (reviewer)**
- [ ] FX spec declared: blend space, attachments, seeds, boil rates, inks (`FX-BLEND-SPACE-DECLARED`, `FX-SCREEN-SPACE-DECLARED`, `FX-SEED-DECLARED`)
- [ ] Watched in motion at delivery size (never stills only)
- [ ] `FX-DETERMINISM` (dropped; one generic check, `vcr capture --verify`), `FX-NO-WALLCLOCK` pass
- [ ] `FX-TEMPORAL-FLICKER` / `FX-BOIL-STEPPED` / `FX-SCREEN-CRAWL` pass, or the breaks are declared and intended
- [ ] `FX-FLASH-SAFE` (dropped; owner `A11Y-FLASH-*`) (A11Y) pass
- [ ] `FX-TEXT-CONTRAST`, `FX-KNOCKOUT-LEGIBLE` pass on worst frames (both dropped; owner `TYPO-CONTRAST`)
- [ ] `FX-TEXTURE-SURVIVAL`, `FX-GRAIN-SCALE`, `FX-BANDING` (dropped; owner `DELIVERY-BANDING`), `FX-CHROMA-SUBSAMPLE` (dropped; owner `DELIVERY-RED-CHROMA`), `FX-MOIRE-RESAMPLE` on simulated delivery
- [ ] `FX-ISOLATION-EXPLICIT`, `FX-SVG-FILTER-CIF`, `FX-BLEND-SPACE-CONSISTENT`
- [ ] `FX-RENDER-COST`, `FX-CACHE-STATIC`, `FX-BACKDROP-FILTER-BUDGET`
- [ ] Judgement: `FX-FOCAL-PRESERVED`, `FX-PRESET-SMELL`, `FX-INTENSITY-RESTRAINT`
- [ ] Loops: `FX-LOOP-SEAM` (dropped; owner `MOTION-RHY-004`)

**Creation (author)**
- [ ] Reference process and reason named; inks and palette from `ART-*` (`FX-INK-LIMIT`)
- [ ] Blend space chosen per effect family and declared
- [ ] Texture attachment, boil rate and seed decided before building
- [ ] Stack ordered: substrate → plates → per-plate treatment → overprint → texture → light → type
- [ ] Neutral values correct (white/multiply, black/screen, 50% grey/overlay)
- [ ] Static treatments baked; per-frame work only for what changes
- [ ] Every SVG filter sets `color-interpolation-filters`; isolation intentional
- [ ] LUTs valid and space-tagged (`FX-LUT-VALID`, `FX-LUT-SPACE`)
- [ ] Test encode at delivery settings; coarsen what doesn't survive
- [ ] FX spec written into the series brief (`BRIEF-*`)

## 21. Caveats

- **Sources disagree on soft-light.** W3C [1], Photoshop and FFmpeg differ, so treat it as tool-specific. Wikipedia says W3C matches Photoshop except "a small variation where b≤0.5 and a≤0.25", while a practitioner PSD test (storytold/photocraft #8804) reports Photoshop "uses the W3C curve below 0.25"; the Photoshop formula remains unverified.
- **The canonical CMYK angle set comes only from secondary print sources** [28][29]. Screen-print vendors recommend 22.5° for every screen instead. The angle rule here is a print-look convention, not a screen-media requirement.
- **All VCR thresholds marked "proposed" are uncalibrated.** That covers flicker %, survival ratio, cell size, grain size, cost multiple and misregistration px. They need a calibration set of approved and rejected renders before they can block a render.
- **Browser behaviour can change.** Chromium filter and raster costs, and whether blends run linear in future colour-managed CSS, may move. Cost claims come from practitioner issue reports [30], not Chromium documentation, which was not fetched.
- **Platform specs change without notice** [24][25][26]. Meta's Instagram Graph API Reel spec (25 Mbps VBR maximum, 1920 px maximum columns, 23–60 fps [31]) is an upload ceiling and can also change.
- **H.264 film-grain SEI** is unlikely to survive platforms. This is inferred from the lack of evidence, not proved.
- **Audience evidence is thin.** Nearly everything here is expert taste or engineering, apart from flash safety ([27], which is grounded in clinical guidance) and codec rate-distortion results [19]. There are no audience studies on, for example, grain preference in short-form video.
- **Expressive breaks are legitimate:** deliberate boil, moiré, glitch, illegible texture as image (not information), crushed blacks. They succeed when they are declared, consistent, motivated by the brief, and kept clear of required text and flash limits.

## 22. Verification ledger (checked 2026-11-06)

| Claim | Result | Source |
|---|---|---|
| Blend formulas (multiply, screen, overlay, dodge, burn, hard/soft-light, difference, exclusion) | confirmed (quoted) | [1] |
| Blending "must not use pre-multiplied color values"; mixing result "must be clamped" | confirmed | [1] |
| `Lum = 0.3R + 0.59G + 0.11B` | confirmed | [1] |
| Stacking context ⇒ isolated group (HTML); SVG isolation triggers | confirmed | [1] |
| `mix-blend-mode` animation type discrete | confirmed | [1] |
| Porter-Duff Fa/Fb table; 12 operators plus lighter | confirmed (via W3C; original 1984 paper not fetched) | [1] |
| `color-interpolation-filters` initial `linearRGB`; filter functions sRGB | confirmed | [2][4] |
| linearRGB blur gives a lighter grey than sRGB | confirmed | [3] |
| Canvas initial `source-over`; unknown values ignored | confirmed | [1][5] |
| libvips non-separable modes not implemented | confirmed | [9] |
| sharp blend list | confirmed | [8] |
| FFmpeg blend default normal; mode names | confirmed | [10] |
| ImageMagick separable modes identical to SVG/PDF/Photoshop; Mathematics args | confirmed | [7] |
| Blender: compositing best in scene linear; AgX 16.5 stops; Filmic deprecated | confirmed | [11] |
| .cube: N∈[2,256] (3D), [2,65536] (1D), red fastest, tetrahedral, 250-byte lines, LF only | confirmed | [12] |
| Perlin 2002 fade `6t^5-15t^4+10t^3` | confirmed | [17] |
| feTurbulence attributes; linearRGB default | confirmed | [2][18] |
| Floyd–Steinberg 7/16, 3/16, 5/16, 1/16; Atkinson 1/8 × 6 | confirmed (secondary) | [15] |
| Bayer 1973 matrix construction | unverified (citation identified: IEEE ICC Conference Record, June 1973, pp. 26-11–26-15; paper not read) | — |
| Ulichney void-and-cluster, Proc. SPIE 1913, 1993 | confirmed (bibliographic) | [16] |
| CMYK angles 15/75/0/45, 30° separation | confirmed (secondary only) | [28][29] |
| AV1 grain AR model; "up to 50%" savings | confirmed | [19][20] |
| RDD 5-2006 is "NOT a Standard"; bit-accurate optional synthesis | confirmed | [21] |
| x264 `--tune grain` parameter set | confirmed (man page snippet) | [22] |
| FFmpeg noise seed default 123457; flags t/u/p/a | confirmed (doc snippets) | [10][23] |
| YouTube 1080p SDR 8/12 Mbps; H.264 High, 4:2:0, closed GOP half fps | confirmed | [24] |
| TikTok API: H.264 recommended, 23–60 fps, 360–4096 px | confirmed (snippet) | [25] |
| TikTok ads ≥540×960, ≥516 kbps | confirmed (snippet) | [26] |
| Meta/Instagram Reel specs: HEVC or H264, closed GOP, 4:2:0, 23–60 fps, max 1920 columns, VBR 25 Mbps max | confirmed (via enrichment) | [31] |
| WCAG general flash definition; 25% of 10° field | confirmed | [27] |
| Backdrop/filter blur per-frame cost reports | confirmed (practitioner, secondary) | [30] |
| All "proposed" VCR thresholds | not found (no source; heuristic by design) | — |

## 23. Sources

1. W3C, *Compositing and Blending Level 1*, Candidate Recommendation Draft, 21 March 2024. https://www.w3.org/TR/compositing-1/
2. W3C, *Filter Effects Module Level 1*, Working Draft, 18 December 2018. https://www.w3.org/TR/filter-effects-1/
3. MDN, "Applying effects with SVG filters." https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/Filters
4. MDN, "color-interpolation-filters." https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/color-interpolation-filters
5. WHATWG, HTML Living Standard, canvas element. https://html.spec.whatwg.org/multipage/canvas.html
6. WHATWG HTML issue #7637, "Interop issue with canvas globalCompositeOperation 'normal' value." https://github.com/whatwg/html/issues/7637
7. ImageMagick, Alpha Compositing (compose). https://imagemagick.org/compose/ and https://usage.imagemagick.org/compose/
8. sharp, "Compositing images." https://sharp.pixelplumbing.com/api-composite/
9. libvips, Vips.BlendMode. https://www.libvips.org/API/current/enum.BlendMode.html
10. FFmpeg Filters Documentation. https://ffmpeg.org/ffmpeg-filters.html
11. Blender Manual, "Displays and Views" (5.2) and "Color Management" (4.0). https://docs.blender.org/manual/en/5.2/render/color_management/displays_views.html ; https://docs.blender.org/manual/en/4.0/render/color_management.html
12. Adobe, *Cube LUT Specification Version 1.0*, September 2013 (mirror). https://kono.phpage.fr/images/a/a1/Adobe-cube-lut-specification-1.0.pdf
13. T. Porter and T. Duff, "Compositing Digital Images," SIGGRAPH 1984 (cited via [1]; not fetched).
14. A. R. Smith, "Alpha and the History of Digital Compositing," Microsoft Tech Memo 7, 1995. https://www.cs.princeton.edu/courses/archive/spring05/cos426/papers/smith95c.pdf ; memo index https://alvyray.com/Memos/MemosCG.htm
15. T. Helland, "Image Dithering: Eleven Algorithms and Source Code" (secondary). https://tannerhelland.com/2012/12/28/dithering-eleven-algorithms-source-code.html
16. R. Ulichney, "Void-and-cluster method for dither array generation," Proc. SPIE 1913, 1993. https://www.semanticscholar.org/paper/Void-and-cluster-method-for-dither-array-generation-Ulichney/63ca9441fb11681240de0ec90712f5811bba6736
17. K. Perlin, "Improving Noise," SIGGRAPH 2002. https://mrl.cs.nyu.edu/~perlin/paper445.pdf
18. MDN, "<feTurbulence>." https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence
19. A. Norkin and N. Birkbeck, "Film Grain Synthesis for AV1 Video Codec," DCC 2018. https://norkin.org/pdf/DCC_2018_AV1_film_grain.pdf
20. Y. Chen et al., "A Technical Overview of AV1," arXiv:2008.06091. https://arxiv.org/pdf/2008.06091
21. SMPTE RDD 5-2006, *Film Grain Technology — Specifications for H.264 | MPEG-4 AVC Bitstreams*. https://pub.smpte.org/latest/rdd5/rdd05-2006.pdf
22. Debian, x264(1) man page. https://manpages.debian.org/experimental/x264/x264.1
23. Ubuntu, ffmpeg-filters(1) man page (noble). https://manpages.ubuntu.com/manpages/noble/man1/ffmpeg-filters.1.html
24. YouTube Help, "YouTube recommended upload encoding settings." https://support.google.com/youtube/answer/1722171
25. TikTok for Developers, Content Posting API Media Transfer Guide. https://developers.tiktok.com/docs/en/content-posting-api-media-transfer-guide
26. TikTok Ads Help Center, Video ads specifications. https://ads.tiktok.com/help/article/video-ads-specifications?lang=en
27. W3C WAI, "Understanding SC 2.3.1: Three Flashes or Below Threshold" (WCAG 2.2). https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold
28. The Print Guide, "Halftone screen angles" (secondary). http://the-print-guide.blogspot.com/2009/05/halftone-screen-angles.html
29. Adobe Community, "Degree Settings In Color Halftone Dialogue Box" (practitioner, secondary). https://community.adobe.com/t5/photoshop-ecosystem-discussions/degree-settings-in-color-halftone-dialogue-box/td-p/10124484
30. Practitioner issue reports on Chromium filter cost (secondary): https://github.com/404-PF/New-Tab/issues/978 ; https://github.com/esengine/DeepSeek-Reasonix/pull/12220
31. Meta for Developers, Instagram Graph API reference, "IG User Media" (Reel specifications, updated June 22, 2026). https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media

## 24. Citation links

The escaped `\[n\]` markers in the text point to this list; plain `[n]` markers point to §23.

1. [Compositing and Blending Level 1](https://www.w3.org/TR/compositing-1)
2. [Filter Effects Module Level 1](https://www.w3.org/TR/filter-effects-1)
3. [color-interpolation-filters - SVG - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/color-interpolation-filters)
4. [Color Management — Blender Manual](https://docs.blender.org/manual/en/4.0/render/color_management.html)
5. [YouTube recommended upload encoding settings - YouTube Help](https://support.google.com/youtube/answer/1722171?hl=en)
6. [TikTok Auction In-Feed Ads](https://ads.tiktok.com/help/article/video-ads-specifications?lang=en)
7. [Film Grain Synthesis for AV1 Video Codec](https://www.semanticscholar.org/paper/Film-Grain-Synthesis-for-AV1-Video-Codec-Norkin-Birkbeck/ed467a8b8d0e07c8bf098f7fbf440fc40cb5be6a)
8. [Figure 1 from Film Grain Synthesis for AV1 Video Codec](https://www.semanticscholar.org/paper/Film-Grain-Synthesis-for-AV1-Video-Codec-Norkin-Birkbeck/ed467a8b8d0e07c8bf098f7fbf440fc40cb5be6a/figure/0)
9. [Specifications for H.264](https://pub.smpte.org/latest/rdd5/rdd05-2006.pdf)
10. [What are Halftone Moire patterns and what to do](https://www.screenprintingnow.com/equipment/what-are-halftone-moire-patterns-and-what-to-do/)
11. [CSS mix-blend-mode: Blend Text, Images & Colors Like Photoshop — W3Tweaks](https://www.w3tweaks.com/css/css-mix-blend-mode-explained/)
12. [perf(crossfade): full-viewport filter blur(30px)-\>0 transition re-convolves the viewport per frame · Issue #978 · 404-PF/New-Tab · GitHub](https://github.com/404-PF/New-Tab/issues/978)
13. [fix(desktop): drop the feedback veil's backdrop blur so an open dialog does not pin the GPU by esengine · Pull Request #12220 · esengine/DeepSeek-Reasonix · GitHub](https://github.com/esengine/DeepSeek-Reasonix/pull/12220)
