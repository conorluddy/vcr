---
name: physically-based-api
description: Look up measured material values (IOR, linear sRGB base colour, metalness, density) from the CC0 Physically Based API and pin a copy for reproducible scenes. Load when a material or review needs a citable reference value; not for textures or stylised looks.
---

# Physically Based API

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Give a scene a sourced albedo, IOR or metalness, or give a `look-developer` review a number to check against. Judgement stays with the `materials` and `lighting` skills.
- VCR evidence covers a pinned 9-material subset read offline in Node: Water, Ice, Diamond, Gold, Copper, Silver, Aluminum, Iron. Other endpoints (light sources, cameras) and rendering are untested.
- CC0 1.0 per the response header and repository. Anonymous GET, no key.

## Fetch and pin
```sh
curl -sS -A "vcr-fixture/1.0" https://api.physicallybased.info/v2/materials -o materials.json
```
The live data changes (`header.updated`); commit or cache a copy for reproducible renders. The full response was 342 KB, 122 materials: pin only the entries a project uses, verbatim, with the header.

## Shape
`{ header, data: [...] }`. Per material: `name`, `color: [{colorSpace, color:[r,g,b]}]` (`srgb-linear`, often `acescg`), `metalness`, `roughness`, `ior` for dielectrics or `complexIor` (`n`, `k`) and `specularColor` for metals, `transmission`, `density`, `references`.

```js
const gold = data.find((m) => m.name === "Gold");
const [r, g, b] = gold.color.find((c) => c.colorSpace === "srgb-linear").color;
```
Observed: Water ior 1.3325, Diamond 2.4168, Gold linear [1.059, 0.773, 0.307].

## Troubleshooting
- Linear values can exceed 1 (Gold red 1.059): clamp or gamut-map before display. These are linear, not display-encoded; do not paste them as hex.
- Metals have `complexIor` and no `ior`; dielectrics have `ior`. Check which key exists.
- There is no "Glass" entry; list names first.
- Value sources vary; read `references` before citing.

## Official docs
- [API](https://api.physicallybased.info/v2)
- [Repository and README](https://github.com/AntonPalmqvist/physically-based-api)
