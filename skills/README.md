# Skills

Progressive-disclosure guides in the Agent Skills format: one flat directory per skill, `skills/<name>/SKILL.md`, whose frontmatter `description` tells an agent when to load it. Flat because both plugin hosts discover skills one level deep. The skill `name` is its directory name, with no `vcr-` prefix: the plugin namespace scopes it (`/vcr:gsap`). `.claude/skills` is a symlink to this directory, and `vcr plugin build` copies it into `plugin/skills/`.

- Toolkit skills (`gsap`, `three-js`, …) — tier 2 of the catalogue tree: how to operate one tool. Use cases and limits, install and doctor, smoke test with expected output, recipes, clock rules, troubleshooting, official links. Under 12 KB. Add one only when an example under `examples/` has produced evidence, then set `skill` on the tool record. A core record's `facets` name headings that must exist in the guide; `pnpm validate` checks both.
- Workflow skills (`start`, `init`, `brief`, `review` and creative-pillar workflows) — production workflows independent of any one tool. Catalogue workflow: `ingest` (assess, writes the card), `evidence` (fixture and evidence), `guide` (writes the toolkit guide). Specified in `specifications/vcr-plugin-prd.md` §6.2.

<!--
TODO(typography follow-ups): candidate skills and checks extracted from references/typography/. Not stubbed as skill directories, because `vcr plugin build` ships any directory with a SKILL.md.
- TODO `captions` workflow skill: transcript → timed events → line breaks → placement → burn-in. Cites TYPO-CAPTION-CPS/-LINES/-DURATION, KB §9c–9d and §15.5. Bundle an SRT/VTT checker script (cps, chars per line, gaps). Decide: ship citing the KB, or wait for the `netflix-en-us` caption profile in rules.json (PR 2, #59). Rerun the typography trigger evals with caption prompts so the two route cleanly.
- TODO `kinetic-type` skill: KB §9c, §15.4 and §15.5 (TYPO-HOLD, TYPO-STAGGER-QUANT, TYPO-RASTER-SCALE). Split out of `typography` only if it nears 10 KB or trigger evals show the two muddled.
- TODO font provisioning as a CLI check, not a skill. `vcr lint` (`packages/lint`) now exists and is its future home: a font manifest plus a lint step that fonts are local, licensed and listed (TYPO-FONTS, TYPO-FONT-SHIP, TYPO-FONT-READY; KB §3, §15.1–15.2).
- TODO text-after-encode notes (TYPO-CHROMA, TYPO-BITRATE, TYPO-RANGE, TYPO-STILL-FORMAT; KB §15.3, §15.6) go into the `ffmpeg` guide, which `typography` then cites.
- Deferred, no demand yet: internationalisation (§10), critique agent (§11, needs the review layer), print handoff (§9b; VCR has no print path).
-->

Load only the guide the current task needs. A skill is not a claim that the tool is installed on this machine; `pnpm doctor` is.
