// One table describes every command: global usage, `vcr <command> --help` and the generated
// references/cli.md all read from it, so help cannot drift from the documented surface.

// === TYPES ===

export interface FlagSpec {
  name: string;
  /** Placeholder for a value flag (`--width n`); absent for a boolean flag. */
  value?: string;
  description: string;
  defaultValue?: string;
  isRequired?: boolean;
}

export interface CommandSpec {
  /** Command words as typed: `tools info`. */
  name: string;
  /** Positional arguments after the name: `<id>`. */
  argumentsHint?: string;
  summary: string;
  flags: FlagSpec[];
  environment?: Array<{ name: string; description: string }>;
  example: string;
  /** Only runs in the harness repository (dev mode). */
  isMaintainerOnly?: boolean;
}

// === PUBLIC API ===

export const GLOBAL_FLAGS: FlagSpec[] = [
  { name: "json", description: "Machine-readable output; errors become { error: { code, message } }" },
  { name: "workspace", value: "dir", description: "Select a workspace instead of discovering one from the current directory" },
  { name: "help", description: "Print help for the command (also -h) and exit 0" },
];

export const GLOBAL_ENVIRONMENT = [
  { name: "VCR_HARNESS", description: "Harness root (the repository or the installed plugin)" },
  { name: "VCR_WORKSPACE", description: "Workspace root; overrides discovery" },
  { name: "VCR_HOME", description: "Machine state: runtime, environment records (default ~/.vcr)" },
];

export const COMMANDS: CommandSpec[] = [
  { name: "status", summary: "Show the harness, workspace and machine roots", flags: [], example: "vcr status" },
  { name: "workspace init", summary: "Make this directory (or --workspace) a VCR workspace; idempotent", flags: [], example: "vcr workspace init" },
  { name: "validate", summary: "Validate the workspace (in the harness repository: everything)", flags: [], example: "vcr validate --json" },
  {
    name: "tools list",
    summary: "Tier 0: one line per tool",
    flags: [
      { name: "capability", value: "id", description: "Only tools with this capability (see catalog/capabilities/vocabulary.json)" },
      { name: "tier", value: "tier", description: "core or catalogued" },
      { name: "category", value: "name", description: "Only tools in this category" },
    ],
    example: "vcr tools list --capability video-encoding",
  },
  {
    name: "tools info",
    argumentsHint: "<id>",
    summary: "Tier 1 card; --full appends the tier 2 guide",
    flags: [{ name: "full", description: "Append the tool's guide (skills/<id>/SKILL.md)" }],
    example: "vcr tools info ffmpeg-ffprobe --full",
  },
  { name: "tools examples", argumentsHint: "<id>", summary: "Tier 3: runnable examples that demonstrate the tool", flags: [], example: "vcr tools examples gsap" },
  { name: "example create", argumentsHint: "<id>", summary: "Copy an example's sources into <workspace>/examples/<id> and print next steps", flags: [], example: "vcr example create gsap-title-card" },
  {
    name: "setup capture",
    summary: "Plan (or with --yes, install) Playwright and Chromium into <VCR_HOME>/runtime",
    flags: [{ name: "yes", description: "Apply the plan instead of printing it" }],
    example: "vcr setup capture --yes",
  },
  {
    name: "capture",
    argumentsHint: "<scene.html>",
    summary: "Capture a browser scene frame by frame; frames and report.json go to --out",
    flags: [
      { name: "width", value: "n", description: "Viewport width in pixels", isRequired: true },
      { name: "height", value: "n", description: "Viewport height in pixels", isRequired: true },
      { name: "fps", value: "n", description: "Frames per second", isRequired: true },
      { name: "out", value: "dir", description: "Output directory", defaultValue: "<scene dir>/output" },
      { name: "verify", description: "Recapture in shuffled order and compare; exit 1 if frames differ" },
    ],
    environment: [{ name: "VCR_CAPTURE_MODE", description: "Frame grab method: screenshot (default) or beginframe" }],
    example: "vcr capture scene.html --width 1920 --height 1080 --fps 30 --verify",
  },
  {
    name: "lint",
    argumentsHint: "<scene.html|dir>",
    summary: "Check a browser scene's text against a safe zone, the frame edges and overflowing boxes at sampled times; exit 1 on findings",
    flags: [
      { name: "safe-zone", value: "preset", description: "ebu-16x9, tiktok, reels, shorts, composite-9x16 (references/typography/rules.json), or none", isRequired: true },
      { name: "at", value: "t1,t2", description: "Sample at these times in seconds" },
      { name: "markers", description: "Sample at window.__scene.markers (seconds), e.g. just before each beat ends" },
      { name: "samples", value: "n", description: "Evenly spaced samples from 0 to the last frame", defaultValue: "8" },
      { name: "width", value: "n", description: "Viewport width in pixels; required with --safe-zone none", defaultValue: "the preset's canvas" },
      { name: "height", value: "n", description: "Viewport height in pixels; required with --safe-zone none", defaultValue: "the preset's canvas" },
      { name: "fps", value: "n", description: "Frames per second, for frame numbers and the last sample", defaultValue: "30" },
    ],
    example: "vcr lint scene.html --safe-zone tiktok --markers",
  },
  {
    name: "doctor",
    summary: "Probe local tools and write <VCR_HOME>/environment/<hostname>.json",
    flags: [{ name: "record", description: "Also write environment/ in the harness repository (maintainer only)" }],
    example: "vcr doctor",
  },
  {
    name: "catalog build",
    summary: "Regenerate catalog/tools.json, INDEX.md, CANDIDATES.md and the typography KB §14 table",
    flags: [{ name: "check", description: "Report stale files and exit 1 instead of rewriting" }],
    example: "vcr catalog build --check",
    isMaintainerOnly: true,
  },
  { name: "plugin build", summary: "Assemble plugin/ for Claude Code and Codex; regenerates references/cli.md", flags: [], example: "vcr plugin build", isMaintainerOnly: true },
];

/** The command named by the leading positionals, longest match first; `capture scene.html` finds `capture`. */
export function findCommand(positional: string[]): CommandSpec | undefined {
  return COMMANDS
    .filter((command) => command.name.split(" ").every((word, index) => positional[index] === word))
    .sort((left, right) => right.name.length - left.name.length)[0];
}

/** Commands under a group word such as `tools`, for `vcr tools --help`. */
export function findCommandGroup(word: string | undefined): CommandSpec[] {
  return word ? COMMANDS.filter((command) => command.name.split(" ")[0] === word) : [];
}

export function formatGlobalUsage(): string {
  const rows = COMMANDS.map((command) => [usageLine(command), `${command.summary}${command.isMaintainerOnly ? " (harness repository only)" : ""}`]);
  const width = Math.max(...rows.map(([usage]) => usage!.length)) + 2;
  return [
    "vcr <command>",
    "",
    ...rows.map(([usage, summary]) => `  ${usage!.padEnd(width)}${summary}`),
    "",
    "Flags: --json for machine-readable output; --workspace <dir> to select a workspace; --help (or -h) on any command.",
    `Roots: ${GLOBAL_ENVIRONMENT.map((variable) => variable.name).join(", ")} (VCR_HOME defaults to ~/.vcr).`,
  ].join("\n");
}

export function formatCommandHelp(command: CommandSpec): string {
  const lines = [`vcr ${usageLine(command)}`, "", command.summary + (command.isMaintainerOnly ? " Harness repository only." : "")];
  if (command.flags.length > 0) lines.push("", "Flags:", ...formatFlags(command.flags));
  if (command.environment) lines.push("", "Environment:", ...command.environment.map((variable) => `  ${variable.name}  ${variable.description}`));
  lines.push("", "Example:", `  ${command.example}`, "", "Global flags: --json, --workspace <dir>, --help");
  return lines.join("\n");
}

/** Markdown reference written to references/cli.md by `vcr plugin build`. */
export function renderCliReference(): string {
  const sections = COMMANDS.map((command) => {
    const lines = [`## \`vcr ${usageLine(command)}\``, "", command.summary + (command.isMaintainerOnly ? " Harness repository only." : "")];
    if (command.flags.length > 0) lines.push("", "| Flag | Description | Default |", "| --- | --- | --- |", ...command.flags.map(markdownFlagRow));
    if (command.environment) lines.push("", ...command.environment.map((variable) => `- \`${variable.name}\`: ${variable.description}`));
    lines.push("", "```sh", command.example, "```");
    return lines.join("\n");
  });
  return [
    "# VCR CLI reference",
    "",
    "Generated by `vcr plugin build` from `packages/cli/src/commands.ts`. Do not edit; `vcr validate` fails when it is stale. Every command also answers `--help`.",
    "",
    "## Global flags",
    "",
    "| Flag | Description | Default |",
    "| --- | --- | --- |",
    ...GLOBAL_FLAGS.map(markdownFlagRow),
    "",
    "## Environment",
    "",
    ...GLOBAL_ENVIRONMENT.map((variable) => `- \`${variable.name}\`: ${variable.description}`),
    "",
    ...sections.flatMap((section) => [section, ""]),
  ].join("\n");
}

// === HELPERS ===

function usageLine(command: CommandSpec): string {
  const flags = command.flags.map((flag) => {
    const written = flag.value ? `--${flag.name} ${flag.value}` : `--${flag.name}`;
    return flag.isRequired ? written : `[${written}]`;
  });
  return [command.name, command.argumentsHint, ...flags].filter(Boolean).join(" ");
}

function formatFlags(flags: FlagSpec[]): string[] {
  const written = flags.map((flag) => (flag.value ? `--${flag.name} ${flag.value}` : `--${flag.name}`));
  const width = Math.max(...written.map((entry) => entry.length)) + 2;
  return flags.map((flag, index) => {
    const notes = [flag.isRequired ? "required" : undefined, flag.defaultValue ? `default ${flag.defaultValue}` : undefined].filter(Boolean);
    return `  ${written[index]!.padEnd(width)}${flag.description}${notes.length > 0 ? ` (${notes.join("; ")})` : ""}`;
  });
}

function markdownFlagRow(flag: FlagSpec): string {
  const written = flag.value ? `--${flag.name} ${flag.value}` : `--${flag.name}`;
  return `| \`${written}\`${flag.isRequired ? " (required)" : ""} | ${flag.description} | ${flag.defaultValue ? `\`${flag.defaultValue}\`` : ""} |`;
}
