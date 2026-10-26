# Skills

Progressive-disclosure guides in the Agent Skills format: one directory per skill with a `SKILL.md` whose frontmatter `description` tells an agent when to load it. `.claude/skills` is a symlink to this directory so Claude Code discovers them automatically.

- `toolkits/<tool>/` — how to operate one tool: use cases and limits, install and doctor, smoke test with expected output, recipes, clock rules, troubleshooting, official links. Add one only when an example under `examples/` has produced evidence.
- `workflows/<name>/` — production workflows (briefing, storyboard, review, delivery) that stay independent of any one tool. None yet.

Load only the guide the current task needs. A skill is not a claim that the tool is installed on this machine; `pnpm doctor` is.
