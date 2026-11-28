# Screens

The design studio's nine screens (01 Brief to 09 Export), copied verbatim from the Design canvas "Design Studio Screens" (`https://claude.ai/code/artifact/129d789e-97c5-4053-ae3b-04686015a669`). Each `.dc.html` is one 1280 × 800 artboard built from VCRStudio components; `canvas.json` is the canvas index (titles, order, layout).

## Running locally

From `DesignSystem/`: `pnpm screens` builds the system and serves the screens at http://localhost:4321/ (`PORT=` to change it). The index page links each screen in dark and light (`?theme=light`).

## How it works

- The canvas serves each screen next to `support.js`, its own runtime. Locally, `scripts/screens/serveScreens.ts` serves `scripts/screens/designComponentRuntime.ts` in its place and injects React 18 UMD before it.
- The local runtime covers only what these screens use: `{{ path }}` holes, `<helmet>`, `<x-import component-from-global-scope>` and a `DCLogic` class with `setState`. Anything more (`<sc-for>`, `<sc-if>`, `<dc-import>`) is not supported yet.
- `ds/vcrstudio/` is served from `dist/project/`, so the screens always use the components in this repository, not the published copy.

## Gotchas

- The canvas is still where the screens are designed. After editing there, copy the changed files here; nothing syncs them.
- Fonts are Google-hosted; without network the screens fall back to system fonts.
