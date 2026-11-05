# Skills

Progressive-disclosure guides in the Agent Skills format: one flat directory per skill, `skills/<name>/SKILL.md`, whose frontmatter `description` tells an agent when to load it. Flat because both plugin hosts discover skills one level deep. The skill `name` is its directory name, with no `vcr-` prefix: the plugin namespace scopes it (`/vcr:gsap`). `.claude/skills` is a symlink to this directory, and `vcr plugin build` copies it into `plugin/skills/`.

- Toolkit skills (`gsap`, `three-js`, …) — tier 2 of the catalogue tree: how to operate one tool. Use cases and limits, install and doctor, smoke test with expected output, recipes, clock rules, troubleshooting, official links. Under 12 KB. Add one only when an example under `examples/` has produced evidence, then set `skill` on the tool record. A core record's `facets` name headings that must exist in the guide; `pnpm validate` checks both.
- Workflow skills (`start`, `init`; `brief` and `review` to come) — production workflows independent of any one tool. Catalogue workflow: `ingest` (assess, writes the card), `evidence` (fixture and evidence), `guide` (writes the toolkit guide). Specified in `specifications/vcr-plugin-prd.md` §6.2.

Load only the guide the current task needs. A skill is not a claim that the tool is installed on this machine; `pnpm doctor` is.
