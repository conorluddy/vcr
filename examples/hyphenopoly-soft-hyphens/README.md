# Hyphenopoly soft hyphens for narrow text

## Intent and scope

- Tool/version: Hyphenopoly 6.1.0 (npm `hyphenopoly`), `de` and `en-us` patterns.
- Claim: in Node, with no browser, Hyphenopoly inserts soft hyphens (U+00AD) into plain strings, purely additively and identically across separate processes, so a renderer that breaks only at spaces can break long words and fit a narrow measure.
- Exclusions: other languages, the browser polyfill, the `exceptions` option, a real font and glyph metrics (the wrap counts characters, not widths), and the pattern files' own licences.
- Official documentation: https://github.com/mnater/Hyphenopoly and https://mnater.github.io/Hyphenopoly/; checked 2026-11-27.
- Environment: macOS 26 arm64; Node 22.19.0.
- Input: three strings in `render.mjs`; no external assets.
- Output: ignored `output/metrics.json`; `expected/metrics.json` is the retained copy.

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: two `node render.mjs` processes give identical bytes; removing the soft hyphens restores each input; at 14 columns the German and English samples have overflowing lines without hyphenation and none with it; a sample of short words gets no soft hyphen and wraps the same.
- Inspect the hyphenated strings and wrapped lines by eye. Stop if a break point is linguistically wrong or the hash differs between runs.

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`. Recording and verifying runs both passed. `Donaudampfschifffahrtsgesellschaft` became `Do·nau·dampf·schiff·fahrts·ge·sell·schaft` and wrapped as `Donaudampf-` / `schifffahrts-` / `gesellschaft`; `Geschwindigkeitsbegrenzung` became `Ge·schwin·dig·keits·be·gren·zung`; English gave `In·ter·na·tion·al·iza·tion`, `ty·po·graph·i·cal`, `hy·phen·ation`. The break points read as correct. This proves the Node route and determinism for two languages, not rendering in a real font, where widths decide the breaks.
