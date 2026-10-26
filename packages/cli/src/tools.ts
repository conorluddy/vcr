import { join } from "node:path";
import { listJsonFiles, readJsonFile } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";

// === TYPES ===

export interface ToolSummary {
  id: string;
  name: string;
  category: string;
  role: string;
  official_url: string;
  tier: string;
  capabilities: string[];
  installation_status: string;
  validation: { status: string };
  adapter_maturity: string;
  [extra: string]: unknown;
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

export function formatToolTable(tools: ToolSummary[]): string {
  const rows = tools.map((tool) => [tool.id, tool.tier, tool.installation_status, tool.validation.status, tool.adapter_maturity, tool.capabilities.join(",")]);
  const header = ["id", "tier", "installed", "validated", "adapter", "capabilities"];
  const widths = header.map((_, column) => Math.max(header[column]!.length, ...rows.map((row) => row[column]!.length)));
  const line = (row: string[]) => row.map((cell, column) => cell.padEnd(widths[column]!)).join("  ");
  return [line(header), ...rows.map(line)].join("\n");
}
