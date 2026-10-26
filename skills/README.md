# Skills

Progressive-disclosure guides in the Agent Skills format: one directory per skill with a `SKILL.md` whose frontmatter `description` tells an agent when to load it. `.claude/skills` is a symlink to this directory so Claude Code discovers them automatically.

- `toolkits/<tool>/` — tier 2 of the catalogue tree: how to operate one tool. Use cases and limits, install and doctor, smoke test with expected output, recipes, clock rules, troubleshooting, official links. Under 12 KB. Add one only when an example under `examples/` has produced evidence, then set `skill` on the tool record. A core record's `facets` name headings that must exist in the guide; `pnpm validate` checks both.
- `workflows/<name>/` — production workflows (briefing, storyboard, review, delivery) that stay independent of any one tool. None yet.

Load only the guide the current task needs. A skill is not a claim that the tool is installed on this machine; `pnpm doctor` is.
