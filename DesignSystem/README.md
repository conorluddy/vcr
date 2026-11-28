# DesignSystem

VCRStudio, the design system for the design studio: tokens, 30 React components with CSS modules, and the build that publishes them as a Claude Design System artifact. The brand book is [`docs/README.md`](docs/README.md); read it before designing with the system.

## Layout

```
tokens/tokens.json        the source of truth for every value; the artifact page reads this file as-is
docs/README.md            brand book, published as the artifact's README
docs/cover.html           the artifact's cover
src/index.ts              public API
src/<group>/<Component>/  <Component>.types.ts (contract), .tsx, .module.css, .test.tsx, .preview.tsx, README.md
src/styles/reset.css      declares the layer order and the reset layer
scripts/tokens/           tokens.json types, the tokens.css compiler, contrast and grammar tests
scripts/build/            bundle, previews, declarations and the artifact's file layout
dist/project/             build output, mirroring the artifact's project/ folder (ignored)
```

## Commands

Run from `DesignSystem/`:

| Command | Does |
| --- | --- |
| `pnpm check` | Biome (format and lint, TS and CSS) and strict `tsc` |
| `pnpm test` | Vitest: components in jsdom, token grammar, contrast and the tokens.css compiler |
| `pnpm build` | writes `dist/project/` and `dist/tokens.css`; prints one JSON event |
| `pnpm verify` | all three; CI runs this |

The pre-commit hook runs `pnpm check` when files under `DesignSystem/` are staged.

## Decisions

- **The repository is the source of truth.** The artifact is build output. An edit made on the artifact page is overwritten by the next publish, so make changes here.
- **Tokens live in tokens.json, not CSS.** The page compiles it to `tokens.css` (`--vcr-*` custom properties, one `[data-theme]` block per theme). `scripts/tokens/compileTokensCss.ts` reproduces that compile for tests, local previews and any consumer outside the artifact.
- **Components read semantic tokens only**, never the `vcr-ink-*` ramp, and never hard-code a colour.
- **CSS modules, compiled into one bundle.css.** Class names come out as `<Component>_<class>`. Every rule sits in `@layer vcr.components`, after `vcr.reset`, so a consumer's unlayered CSS wins without `!important`.
- **State is styled from attributes, not React state:** `data-variant`, `data-size`, `aria-pressed`, `aria-checked`, `:hover`, `:focus-visible`, `:has()`. No component tracks hover in JavaScript.
- **Evergreen browsers.** Native nesting, `:has()`, container queries (JudgmentRow), `field-sizing` (Textarea) and `text-box` (Button) ship unprefixed and unflattened.
- **React 18 as globals.** The preview frame preloads React 18 UMD, so the bundle maps `react`, `react-dom` and `react/jsx-runtime` to `window.React` and `window.ReactDOM` and carries no copy of React. Previews import from `src/index.ts`, which resolves to `window.VCRStudio`, so they exercise the published bundle.

## Gotchas

- **tokens.json grammar.** Colour values must be hex, `rgb()`/`rgba()` or an alias such as `"{vcr-bone}"`. `var()`, `color-mix()` and named colours are dropped by the page. The tests enforce this.
- **Type styles mirror the font-size scale.** Components read `--vcr-font-size-*`; the type styles exist for the page's Typography view. A test fails if a style uses a size that is not on the scale.
- **Contrast is tested.** Every readable `vcr-text-*` token must hold 4.5:1 on `vcr-ground` in both themes.
- **Preview card heights** come from the `// @dsCard height=<px>` line at the top of each `.preview.tsx`.
- **Fonts are Google-hosted** (Schibsted Grotesk, Fragment Mono). The page loads them; local renders without network fall back to system fonts.

## Publishing

`pnpm build`, then publish every file under `dist/project/` to the artifact at the same path under `project/`. `design-system.json` goes last, merged with the live index so the page's own keys survive. Never publish `dist/tokens.css`: the page writes its own.
