import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileSizeKb } from "./catalog.js";
import type { EnvironmentRecord } from "./doctor.js";
import { assessReadiness, formatReadiness, versionScope } from "./evidence.js";
import { formatProjectReadiness, npmPackagesFor, projectPackageVersions } from "./project.js";
import { listFilesNamed, listJsonFiles, readJsonFile } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";

// === TYPES ===

export interface ToolFacet {
  id: string;
  one_line: string;
  skill_section?: string;
  example?: string;
}

export interface ToolSummary {
  id: string;
  name: string;
  category: string;
  tier: string;
  role: string;
  summary?: string;
  use_when?: string[];
  avoid_when?: string[];
  pairs_with?: string[];
  official_url: string;
  capabilities: string[];
  facets?: ToolFacet[];
  license?: string;
  install?: { macos?: string; check_command?: string };
  skill?: string;
  examples?: string[];
  installation_status: string;
  validation: { status: string; evidence?: Array<{ date: string; version?: string; hostname?: string; command?: string; example?: string; scope?: string }> };
  adapter_maturity: string;
  [extra: string]: unknown;
}

export interface ExampleManifest {
  id: string;
  title: string;
  summary?: string;
  status: string;
  tools: string[];
  run: string;
  report?: string;
  /** Repository-relative directory, filled in on load. */
  directory: string;
}

export interface ToolFilter {
  capability?: string | undefined;
  tier?: string | undefined;
  category?: string | undefined;
}

// === PUBLIC API ===

/** Reads the per-tool files directly so a stale index never misleads a caller. */
export function loadTools(repositoryRoot: string): Result<ToolSummary[]> {
  const tools: ToolSummary[] = [];
  for (const filePath of listJsonFiles(join(repositoryRoot, "catalog/tools"))) {
    const parsed = readJsonFile<ToolSummary>(filePath);
    if (!parsed.ok) return parsed;
    tools.push(parsed.value);
  }
  return ok(tools);
}

export function loadExamples(repositoryRoot: string): Result<ExampleManifest[]> {
  const examples: ExampleManifest[] = [];
  for (const filePath of listFilesNamed(join(repositoryRoot, "examples"), "example.json")) {
    const parsed = readJsonFile<Omit<ExampleManifest, "directory">>(filePath);
    if (!parsed.ok) return parsed;
    const directory = filePath.slice(repositoryRoot.length + 1).replace(/\/example\.json$/, "");
    examples.push({ ...parsed.value, directory });
  }
  return ok(examples);
}

export function filterTools(tools: ToolSummary[], filter: ToolFilter): ToolSummary[] {
  return tools.filter(
    (tool) =>
      (!filter.capability || tool.capabilities.includes(filter.capability)) &&
      (!filter.tier || tool.tier === filter.tier) &&
      (!filter.category || tool.category.toLowerCase().includes(filter.category.toLowerCase())),
  );
}

export function findTool(tools: ToolSummary[], id: string): Result<ToolSummary> {
  const tool = tools.find((candidate) => candidate.id === id);
  return tool ? ok(tool) : fail("TOOL_NOT_FOUND", `No tool with id "${id}". Run "vcr tools list" to see ids.`);
}

/** Tier 0 as a table: what `vcr tools list` prints. */
export function formatToolTable(tools: ToolSummary[]): string {
  const rows = tools.map((tool) => [tool.id, tool.tier, tool.validation.status, tool.role]);
  const header = ["id", "tier", "validated", "role"];
  const widths = header.map((_, column) => Math.max(header[column]!.length, ...rows.map((row) => row[column]!.length)));
  const line = (row: string[]) => row.map((cell, column) => cell.padEnd(widths[column]!)).join("  ").trimEnd();
  return [line(header), ...rows.map(line)].join("\n");
}

/** Tier 1: the card, with pointers to tiers 2 and 3 and what they cost. */
/** `project` locates per-project libraries: resolved from `cwd` upwards, never above `stopAt` (the workspace root). */
export function formatToolCard(tool: ToolSummary, examples: ExampleManifest[], repositoryRoot: string, machine?: EnvironmentRecord, project?: { cwd: string; stopAt?: string | undefined }): string {
  const lines: string[] = [];
  lines.push(`${tool.id} — ${tool.name} · ${tool.tier} · ${tool.automation_route as string}`);
  lines.push(tool.role, "");
  if (tool.summary) lines.push(tool.summary, "");
  if (tool.use_when?.length) lines.push("Use when:", ...tool.use_when.map((item) => `- ${item}`), "");
  if (tool.avoid_when?.length) lines.push("Avoid when:", ...tool.avoid_when.map((item) => `- ${item}`), "");
  if (tool.facets?.length) lines.push("Facets:", ...tool.facets.map((facet) => `- ${facet.id}: ${facet.one_line}`), "");
  lines.push(`Capabilities: ${tool.capabilities.join(", ")}`);
  if (tool.pairs_with?.length) lines.push(`Pairs with: ${tool.pairs_with.join(", ")}`);
  if (tool.license) lines.push(`Licence: ${tool.license}`);
  if (tool.install?.macos) lines.push(`Install (macOS): ${tool.install.macos}${tool.install.check_command ? `  · check: ${tool.install.check_command}` : ""}`);
  lines.push(`Evidence: ${evidenceLine(tool)}`);
  const latestScope = tool.validation.evidence?.at(-1)?.scope;
  if (latestScope) lines.push(`Evidence scope: ${latestScope}`);
  // The catalogue never claims installation, so only its not-applicable value is worth showing.
  const readiness = readinessText(tool, machine, project);
  lines.push(`Readiness: ${readiness} · VCR adapter ${tool.adapter_maturity || "unknown"}`);
  lines.push(`Guide: ${tool.skill ? `${tool.skill} (${fileSizeKb(repositoryRoot, tool.skill) ?? "?"} KB) — vcr tools info ${tool.id} --full` : "none yet"}`);
  const own = examples.filter((example) => example.tools.includes(tool.id));
  lines.push(`Examples: ${own.length ? `${own.map((example) => `${example.id} (${example.status})`).join(", ")} — vcr tools examples ${tool.id}` : "none yet"}`);
  lines.push(`Docs: ${tool.official_url}`);
  return lines.join("\n");
}

/** Tier 2 appended to the card. */
export function readToolGuide(tool: ToolSummary, repositoryRoot: string): Result<string> {
  if (!tool.skill) return fail("NO_GUIDE", `${tool.id} has no skill yet. Its card is the deepest tier available.`);
  const path = join(repositoryRoot, tool.skill);
  if (!existsSync(path)) return fail("GUIDE_MISSING", `${tool.skill} is referenced by ${tool.id} but does not exist.`);
  return ok(readFileSync(path, "utf8"));
}

const REPOSITORY_EXAMPLES_URL = "https://github.com/conorluddy/vcr/tree/main/examples";

/** Tier 3 listing for one tool. */
export function formatExamplesForTool(tool: ToolSummary, examples: ExampleManifest[]): string {
  const own = examples.filter((example) => example.tools.includes(tool.id));
  const repoOnly = (tool.examples ?? []).filter((id) => !examples.some((example) => example.id === id));
  if (own.length === 0 && repoOnly.length === 0) return `No examples list ${tool.id} yet.`;
  const listed = own.map((example) => [`${example.id} (${example.status}) — ${example.title}`, example.summary ? `  ${example.summary}` : null, `  run: cd ${example.directory} && ${example.run}`, example.report ? `  report: ${example.report}` : null].filter(Boolean).join("\n"));
  // React examples need the repository's esbuild step, so the plugin does not ship them (#196).
  const notInstalled = repoOnly.map((id) => `${id} (repo-only, not in this install) — ${REPOSITORY_EXAMPLES_URL}/${id}`);
  return [...listed, ...notInstalled].join("\n\n");
}

// === PRIVATE HELPERS ===

function readinessText(tool: ToolSummary, machine: EnvironmentRecord | undefined, project: { cwd: string; stopAt?: string | undefined } | undefined): string {
  if (tool.installation_status === "not-applicable") return "no install needed";
  const latest = tool.validation.evidence?.at(-1);
  const machineReadiness = assessReadiness(tool.id, machine);
  // A tool doctor probes is a machine tool; otherwise a per-project package is read from the project.
  const packages = npmPackagesFor(tool.install?.macos);
  if (machineReadiness.state !== "not-probed" && machineReadiness.state !== "no-machine-record") return formatReadiness(machineReadiness, latest);
  if (packages.length && project) return formatProjectReadiness(projectPackageVersions(project.cwd, packages, project.stopAt), tool.install!.macos!, latest);
  return formatReadiness(machineReadiness, latest);
}

function evidenceLine(tool: ToolSummary): string {
  const latest = tool.validation.evidence?.at(-1);
  if (!latest) return tool.validation.status;
  const scope = versionScope(latest.version);
  const versionNote = scope === "inexact" ? `; version inexact: "${latest.version ?? ""}"` : scope === "unknown" ? "; version not recorded exactly" : "";
  return `${tool.validation.status} ${latest.date}${latest.example ? ` (${latest.example})` : ""}${versionNote}`;
}
