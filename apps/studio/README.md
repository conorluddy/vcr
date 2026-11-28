# Studio

VCR Studio, the design exploration app from [PRD-0001](../../specifications/prd/0001-static-design-exploration.md), built on the VCRStudio design system (`DesignSystem/`). Experimental: ADR-0002 (headless, no editor) is set aside while we explore. The plan is `vcr-studio-fresh-frontend-app` in the plans vault.

## Commands

Run from `apps/studio/`:

| Command | Does |
| --- | --- |
| `pnpm dev` | builds the design system's `tokens.css`, then serves the app with Vite (http://localhost:5173, or the next free port) |
| `pnpm check` | Biome and strict `tsc` |
| `pnpm test` | Vitest in jsdom |
| `pnpm build` | design system, then the production build in `dist/` |
| `pnpm verify` | all of them; CI runs this |

## Layout

```
src/routing/   Route (a discriminated union), parse and format, useRoute, RouteLink
src/shell/     AppShell: the glass top bar every screen sits under
src/theme/     useTheme: dark by default, remembered in this browser
src/screens/   one folder per screen; PlaceholderScreen until each lands
```

## Decisions

- **Every screen has an address** (PRD §1): `/new`, `/w/:workspace/r/:round`, `/w/:workspace/r/:round/v/:variant` and so on, in `src/routing/routes.ts`. Reloading or opening a link restores the screen.
- **Components come from the design system's source**, so a component fix shows up without republishing. Tokens come from its build (`@vcr/design-system/tokens.css`), which `dev` and `build` run first.
- **The canvas screens are the visual spec.** `DesignSystem/screens/` (`pnpm screens` there) shows each one; build against it.
