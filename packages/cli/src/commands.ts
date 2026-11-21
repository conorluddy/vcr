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
  { name: "json", description: "Machine-readable output; errors become { error: { code, message, retryable } }" },
  { name: "workspace", value: "dir", description: "Select a workspace instead of discovering one from the current directory" },
  { name: "help", description: "Print help for the command (also -h) and exit 0" },
];

export const GLOBAL_ENVIRONMENT = [
  { name: "VCR_HARNESS", description: "Harness root (the repository or the installed plugin)" },
  { name: "VCR_WORKSPACE", description: "Workspace root; overrides discovery" },
  { name: "VCR_HOME", description: "Machine state: runtime, environment records (default ~/.vcr)" },
];

export const COMMANDS: CommandSpec[] = [
  {
    name: "status",
    summary: "Show the harness, workspace and machine roots, and the workspace's per-agent models; --brief for videos awaiting review and open findings (under 1 KB)",
    flags: [{ name: "brief", description: "Videos needing attention first, with open-finding counts and warnings" }],
    example: "vcr status --brief",
  },
  { name: "workspace init", summary: "Make this directory (or --workspace) a VCR workspace; idempotent", flags: [], example: "vcr workspace init" },
  { name: "video init", argumentsHint: "<project>/<video>", summary: "Register a video: the project in vcr.json and project.json, plus its review/ directories; idempotent", flags: [], example: "vcr video init demo/teaser" },
  { name: "validate", summary: "Validate the workspace (in the harness repository: everything)", flags: [], example: "vcr validate --json" },
  {
    name: "techniques list",
    summary: "Tier 0 of techniques: one line per visual technique, paginated; inspiration, not a whitelist",
    flags: [
      { name: "purpose", value: "term", description: "Only techniques with this expressive purpose; a miss lists the accepted terms" },
      { name: "mechanism", value: "term", description: "Only techniques with this visual mechanism; a miss lists the accepted terms" },
      { name: "pillar", value: "name", description: "Only techniques whose craft lives in this pillar directory, or its start: fx, motion-director, typo" },
      { name: "capability", value: "id", description: "Only techniques with a route step using this capability; a miss lists those in use" },
      { name: "tool", value: "id", description: "Only techniques with a route through this tool" },
      { name: "limit", value: "n", description: "Techniques per page", defaultValue: "50" },
      { name: "offset", value: "n", description: "Techniques to skip", defaultValue: "0" },
    ],
    example: "vcr techniques list --purpose print-nostalgia",
  },
  {
    name: "techniques info",
    argumentsHint: "<id>",
    summary: "Tier 1 card: summary, craft pointers and one line per route with its derived evidence class; --full adds each route's steps, tool evidence, readiness and limits",
    flags: [{ name: "full", description: "Append each route's steps, per-tool evidence and readiness, and limits" }],
    example: "vcr techniques info halftone-screen --full",
  },
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
    name: "tools status",
    summary: "Show documentation, current-machine installation, validation evidence and adapter maturity for catalogue tools",
    flags: [
      { name: "tier", value: "tier", description: "Filter by candidate, catalogued or core" },
      { name: "validation", value: "status", description: "Filter by not-validated, partial, validated or blocked" },
      { name: "documentation", value: "status", description: "Filter by documentation status" },
      { name: "adapter", value: "maturity", description: "Filter by adapter maturity" },
    ],
    example: "vcr tools status --validation not-validated",
  },
  {
    name: "tools info",
    argumentsHint: "<id>",
    summary: "Tier 1 card; --full appends the tier 2 guide",
    flags: [{ name: "full", description: "Append the tool's guide (skills/<id>/SKILL.md)" }],
    example: "vcr tools info ffmpeg-ffprobe --full",
  },
  { name: "refs list", summary: "Tier 0 of the creative pillars: one line per pillar (references/INDEX.md)", flags: [], example: "vcr refs list" },
  {
    name: "refs section",
    argumentsHint: "<pillar> <section>",
    summary: "Print one section of a pillar's knowledge base; never the whole file",
    flags: [],
    example: "vcr refs section motion 2.4",
  },
  {
    name: "rules list",
    summary: "Pillar rules, one line each, paginated",
    flags: [
      { name: "pillar", value: "name", description: "Pillar slug or prefix: motion-director, MOTION, pace" },
      { name: "tier", value: "tier", description: "standard, platform or heuristic (substring match)" },
      { name: "applies-to", value: "text", description: "Only rules whose applies-to mentions this, e.g. 9:16 or captions" },
      { name: "limit", value: "n", description: "Rules per page", defaultValue: "50" },
      { name: "offset", value: "n", description: "Rules to skip", defaultValue: "0" },
    ],
    example: "vcr rules list --pillar pace --tier platform",
  },
  { name: "rules info", argumentsHint: "<ID>", summary: "One rule: check, threshold, tier, scope and where it lives", flags: [], example: "vcr rules info TYPO-HOLD" },
  { name: "tools examples", argumentsHint: "<id>", summary: "Tier 3: runnable examples that demonstrate the tool", flags: [], example: "vcr tools examples web-animations-api" },
  { name: "example create", argumentsHint: "<id>", summary: "Copy an example's sources into <workspace>/examples/<id> and print next steps", flags: [], example: "vcr example create waapi-capture" },
  {
    name: "findings list",
    argumentsHint: "<project>/<video>",
    summary: "One line per finding on a video, paginated",
    flags: [
      { name: "status", value: "state", description: "open, addressed, resolved or wontfix" },
      { name: "render", value: "id", description: "Only findings on this render" },
      { name: "limit", value: "n", description: "Findings per page", defaultValue: "50" },
      { name: "offset", value: "n", description: "Findings to skip", defaultValue: "0" },
    ],
    example: "vcr findings list demo/teaser --status open",
  },
  { name: "findings show", argumentsHint: "<project>/<video> <F-NNNN>", summary: "One finding in full", flags: [], example: "vcr findings show demo/teaser F-0001" },
  {
    name: "findings add",
    argumentsHint: "<project>/<video>",
    summary: "Add a note on a render frame; scene and scene frame come from the manifest; idempotent on content",
    flags: [
      { name: "frame", value: "n", description: "Composition frame", isRequired: true },
      { name: "severity", value: "level", description: "blocker, major, minor or note", isRequired: true },
      { name: "text", value: "text", description: "One issue, in a sentence", isRequired: true },
      { name: "render", value: "id", description: "Retained render", defaultValue: "the latest" },
      { name: "frame-end", value: "n", description: "Last frame of a range, inclusive" },
      { name: "rule", value: "ID", description: "Pillar rule, e.g. TYPO-SAFE" },
      { name: "selector", value: "css", description: "Where in the scene DOM" },
      { name: "author", value: "kind", description: "agent or human", defaultValue: "agent" },
    ],
    example: "vcr findings add demo/teaser --frame 45 --severity major --text \"Headline crosses the safe zone\" --rule TYPO-SAFE",
  },
  {
    name: "findings address",
    argumentsHint: "<project>/<video> <F-NNNN>",
    summary: "Claim a fix: mark a finding addressed with the render that fixes it and evidence; never resolves",
    flags: [
      { name: "render", value: "id", description: "Retained render that carries the fix", isRequired: true },
      { name: "note", value: "text", description: "What changed", isRequired: true },
      { name: "evidence", value: "a,b", description: "Comma-separated evidence paths (before/after frames)" },
    ],
    example: "vcr findings address demo/teaser F-0001 --render r-20261106T120000-abcdef0 --note \"Moved headline 40px left\"",
  },
  {
    name: "inspiration add",
    argumentsHint: "<file|dir>…",
    summary: "Copy local reference files into the workspace library (git-ignored), hash them, measure what a tool can and write one record each; idempotent on content. Nothing is fetched",
    flags: [
      { name: "note", value: "text", description: "What the user likes in it, in their words; one item only. Never written by an agent on its own account" },
      { name: "aspect", value: "a,b", description: "What to take from it: palette, typography, composition, motion, texture, pacing, tone" },
      { name: "use", value: "use", description: "inspiration (never appears in output) or asset (may, with rights)", defaultValue: "inspiration" },
      { name: "rights", value: "evidence", description: "Where permission to reuse comes from, or unknown; required for an asset" },
      { name: "attribution", value: "text", description: "Credit line that goes with --rights" },
      { name: "source", value: "locator", description: "Where it came from (a URL or other address), recorded as text" },
      { name: "creator", value: "name", description: "Who made it" },
      { name: "accessed", value: "date", description: "When it was saved, YYYY-MM-DD" },
      { name: "title", value: "text", description: "One item only", defaultValue: "the file name" },
      { name: "colours", value: "hex,hex", description: "Add a named colour set instead of a file; needs --title" },
    ],
    example: "vcr inspiration add ~/Downloads/poster.png --note \"The headline sits low and the top stays empty\" --aspect composition,typography",
  },
  {
    name: "inspiration annotate",
    argumentsHint: "<id>",
    summary: "Set or change what a person stated about an item: note, aspects, use, rights, source, title. Never touches facts or observations",
    flags: [
      { name: "note", value: "text", description: "What the user likes in it, in their words" },
      { name: "aspect", value: "a,b", description: "Replaces the aspects: palette, typography, composition, motion, texture, pacing, tone" },
      { name: "use", value: "use", description: "inspiration or asset" },
      { name: "rights", value: "evidence", description: "Where permission to reuse comes from, or unknown" },
      { name: "attribution", value: "text", description: "Credit line that goes with --rights" },
      { name: "source", value: "locator", description: "Where it came from" },
      { name: "creator", value: "name", description: "Who made it" },
      { name: "accessed", value: "date", description: "When it was saved, YYYY-MM-DD" },
      { name: "title", value: "text", description: "A clearer title" },
    ],
    example: "vcr inspiration annotate poster-0a1b2c --note \"The headline sits low and the top stays empty\"",
  },
  {
    name: "inspiration observe",
    argumentsHint: "<id>",
    summary: "Append one judged observation to an item, stamped with agent, model and date; idempotent on content. The only write an analyst agent makes: it never touches the note, use or rights",
    flags: [
      { name: "aspect", value: "aspect", description: "palette, typography, composition, motion, texture, pacing or tone", isRequired: true },
      { name: "observed", value: "text", description: "What is there, in terms someone could check against the file", isRequired: true },
      { name: "model", value: "name", description: "The model making the observation, as the caller named it", isRequired: true },
      { name: "inferred", value: "text", description: "The transferable principle, kept apart from the description" },
      { name: "span", value: "t=a,b", description: "Seconds inspected; required for a motion or pacing observation on a video" },
      { name: "agent", value: "name", description: "The agent observing", defaultValue: "inspiration-analyst" },
    ],
    example: "vcr inspiration observe poster-0a1b2c --aspect composition --observed \"Headline set in the lower third; the top two thirds are one flat field\" --model <model>",
  },
  {
    name: "inspiration list",
    summary: "One line per item in the workspace library, paginated",
    flags: [
      { name: "kind", value: "kind", description: "image, video, font or colours" },
      { name: "aspect", value: "aspect", description: "Only items the user said to take this from" },
      { name: "use", value: "use", description: "inspiration or asset" },
      { name: "unannotated", description: "Only items with no note" },
      { name: "unobserved", description: "Only items no model has looked at" },
      { name: "limit", value: "n", description: "Items per page", defaultValue: "50" },
      { name: "offset", value: "n", description: "Items to skip", defaultValue: "0" },
    ],
    example: "vcr inspiration list --aspect palette",
  },
  { name: "inspiration show", argumentsHint: "<id>", summary: "One item: what the user stated, what was measured, what a model judged (each labelled), and the absolute path of the file to look at", flags: [], example: "vcr inspiration show poster-0a1b2c" },
  {
    name: "inspiration remove",
    argumentsHint: "<id>",
    summary: "Show what removing an item would delete (its record and copied files) and which briefs cite it; --yes applies",
    flags: [{ name: "yes", description: "Apply the plan" }],
    example: "vcr inspiration remove poster-0a1b2c --yes",
  },
  {
    name: "review approve",
    argumentsHint: "<project>/<video>",
    summary: "Human only: approve a render at an interactive terminal by typing the video id; refused without a TTY",
    flags: [{ name: "render", value: "id", description: "Retained render", defaultValue: "the latest" }, { name: "note", value: "text", description: "Optional note" }],
    example: "vcr review approve demo/teaser",
  },
  {
    name: "review request-changes",
    argumentsHint: "<project>/<video>",
    summary: "Human only: request changes on a render; refused without a TTY",
    flags: [{ name: "render", value: "id", description: "Retained render", defaultValue: "the latest" }, { name: "note", value: "text", description: "Optional note" }],
    example: "vcr review request-changes demo/teaser --note \"Tighten the ending\"",
  },
  {
    name: "review resolve",
    argumentsHint: "<project>/<video> <F-NNNN>",
    summary: "Human only: close a finding as resolved (or --wontfix); refused without a TTY",
    flags: [{ name: "wontfix", description: "Close as won't fix instead of resolved" }, { name: "note", value: "text", description: "Optional note" }],
    example: "vcr review resolve demo/teaser F-0001",
  },
  {
    name: "storage",
    summary: "Disk usage by class, video and render, largest first, with budget warnings; read-only",
    flags: [
      { name: "video", value: "project/video", description: "Only this video's output and evidence" },
      { name: "limit", value: "n", description: "Rows per page", defaultValue: "50" },
      { name: "offset", value: "n", description: "Rows to skip", defaultValue: "0" },
    ],
    example: "vcr storage --json",
  },
  {
    name: "storage clear",
    argumentsHint: "<output|cache|proxies|runtime>",
    summary: "Plan the deletion of regenerable files and print it; --yes applies. Never touches projects, review/ or briefs",
    flags: [
      { name: "video", value: "project/video", description: "Output only: this video's renders" },
      { name: "render", value: "id", description: "Output only: this render" },
      { name: "older-than", value: "days", description: "Output only: renders last modified more than this many days ago" },
      { name: "keep-latest", value: "n", description: "Output only: keep each video's newest n renders" },
      { name: "yes", description: "Apply the plan instead of printing it" },
    ],
    example: "vcr storage clear output --keep-latest 1 --yes",
  },
  {
    name: "storage prune",
    argumentsHint: "evidence",
    summary: "Reduce older retained revisions to manifest and contact sheet; keeps the latest, approved and finding-cited ones; --yes applies",
    flags: [
      { name: "video", value: "project/video", description: "The video whose evidence to prune", isRequired: true },
      { name: "keep", value: "n", description: "Newest revisions kept whole", isRequired: true },
      { name: "yes", description: "Apply the plan instead of printing it" },
    ],
    example: "vcr storage prune evidence --video demo/teaser --keep 3 --yes",
  },
  {
    name: "setup capture",
    summary: "Plan (or with --yes, install) Playwright and Chromium into <VCR_HOME>/runtime",
    flags: [{ name: "yes", description: "Apply the plan instead of printing it" }],
    example: "vcr setup capture --yes",
  },
  {
    name: "preview",
    argumentsHint: "<scene.html>",
    summary: "Capture selected frames from a browser scene and write a labelled contact sheet under output/previews/",
    flags: [
      { name: "width", value: "n", description: "Delivery width in pixels", isRequired: true },
      { name: "height", value: "n", description: "Delivery height in pixels", isRequired: true },
      { name: "fps", value: "n", description: "Delivery frame rate", isRequired: true },
      { name: "at", value: "t1,t2", description: "Comma-separated timestamps in seconds; pass --at, --marker, or both" },
      { name: "marker", value: "id1,id2", description: "Comma-separated IDs from window.__scene.markers" },
      { name: "neighbors", value: "n", description: "Include this many frames on each side of each selection", defaultValue: "0" },
      { name: "serve-root", value: "dir", description: "Ancestor directory to serve for shared assets", defaultValue: "<scene dir>" },
    ],
    example: "vcr preview scene.html --width 1920 --height 1080 --fps 30 --at 10,18.25 --marker B03,B05 --neighbors 1",
  },
  {
    name: "capture",
    argumentsHint: "<scene.html>",
    summary: "Capture a browser scene frame by frame; frames and report.json go to --out, or with --video become a render with a manifest",
    flags: [
      { name: "width", value: "n", description: "Viewport width in pixels", isRequired: true },
      { name: "height", value: "n", description: "Viewport height in pixels", isRequired: true },
      { name: "fps", value: "n", description: "Frames per second", isRequired: true },
      { name: "out", value: "dir", description: "Output directory; not with --video", defaultValue: "<scene dir>/output" },
      { name: "video", value: "project/video", description: "Record a render of this video: frames under output/<video>/<render_id>/, the manifest there and in review/renders/<render_id>/" },
      { name: "verify", description: "Recapture in shuffled order and compare; exit 1 if frames differ" },
    ],
    environment: [{ name: "VCR_CAPTURE_MODE", description: "Frame grab method: screenshot (default) or beginframe (experimental; can hang, #52)" }],
    example: "vcr capture scene.html --width 1920 --height 1080 --fps 30 --verify",
  },
  {
    name: "lint",
    argumentsHint: "<scene.html|dir>",
    summary: "Check a browser scene's text against a safe zone, the frame edges and overflowing boxes at sampled times; exit 1 on findings",
    flags: [
      { name: "safe-zone", value: "preset", description: "ebu-16x9, tiktok, reels, shorts, composite-9x16 (references/typography/rules.json), or none", isRequired: true },
      { name: "at", value: "t1,t2", description: "Sample at these times in seconds" },
      { name: "markers", description: "Sample at window.__scene.markers (seconds or { t, id, role }), e.g. just before each beat ends" },
      { name: "samples", value: "n", description: "Evenly spaced samples from 0 to the last frame", defaultValue: "8" },
      { name: "width", value: "n", description: "Viewport width in pixels; required with --safe-zone none", defaultValue: "the preset's canvas" },
      { name: "height", value: "n", description: "Viewport height in pixels; required with --safe-zone none", defaultValue: "the preset's canvas" },
      { name: "fps", value: "n", description: "Frames per second, for frame numbers and the last sample", defaultValue: "30, or the render's with --video" },
      { name: "video", value: "project/video", description: "File each finding on a retained render of this video (idempotent; re-running adds nothing new)" },
      { name: "render", value: "id", description: "With --video: the render the findings point at", defaultValue: "the latest" },
    ],
    example: "vcr lint scene.html --safe-zone tiktok --markers --video demo/teaser",
  },
  {
    name: "plan check",
    summary: "Check a video's beat sheet (beats.json) before rendering: beat sum, word budget, read time, mandatories, VO air, hook window; prints findings, writes nothing; exit 1 on blocker or major",
    flags: [{ name: "video", value: "project/video", description: "The video whose beats.json to check", isRequired: true }],
    example: "vcr plan check --video demo/teaser --json",
  },
  {
    name: "plan markers",
    summary: "Print the beat sheet's named markers [{ t, id, role }], each on the beat's last frame, for window.__scene.markers",
    flags: [{ name: "video", value: "project/video", description: "The video whose beats.json to read", isRequired: true }],
    example: "vcr plan markers --video demo/teaser --json",
  },
  {
    name: "doctor",
    summary: "Probe local tools and write <VCR_HOME>/environment/<hostname>.json",
    flags: [{ name: "record", description: "Also write environment/ in the harness repository (maintainer only)" }],
    example: "vcr doctor",
  },
  {
    name: "catalog build",
    summary: "Regenerate catalog/tools.json, INDEX.md, CANDIDATES.md, TECHNIQUES.md and the typography KB §14 table",
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
