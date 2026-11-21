import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readJsonFile } from "./repository.js";
import { WORKSPACE_MARKER } from "./roots.js";

// === TYPES ===

export interface WorkspaceMarker {
  schema_version: string;
  harness_version: string;
  projects: string[];
}

/** Agent name → model, or one model per host where the names differ (ADR 0013). Reported, never checked. */
export type AgentModels = Record<string, string | Record<string, string>>;

export interface EnsureWorkspaceOutcome {
  workspace: string;
  /** Relative paths written or appended to; empty when the workspace was already initialised. */
  changes: string[];
}

/** The copied files of the inspiration library: third-party media that never enters git history (ADR 0011). */
export const INSPIRATION_FILES_IGNORE_ENTRY = "inspiration/files/";

/** Regenerable output never belongs in git; `.vcr/` is the Codex-sandbox machine root (spike S1). */
const IGNORED_DIRECTORIES = ["output/", ".cache/", ".vcr/", INSPIRATION_FILES_IGNORE_ENTRY];

// === PUBLIC API ===

/** Idempotently makes `directory` a workspace: writes `vcr.json` if absent and adds missing ignore entries. Nothing else. */
export function ensureWorkspace(directory: string, harnessVersion: string): EnsureWorkspaceOutcome {
  const changes: string[] = [];
  const markerPath = join(directory, WORKSPACE_MARKER);
  if (!existsSync(markerPath)) {
    const marker: WorkspaceMarker = { schema_version: "1.0.0", harness_version: harnessVersion, projects: [] };
    writeFileSync(markerPath, `${JSON.stringify(marker, null, 2)}\n`);
    changes.push(WORKSPACE_MARKER);
  }
  if (ensureIgnored(directory, IGNORED_DIRECTORIES)) changes.push(".gitignore");
  return { workspace: directory, changes };
}

/** The workspace's `models` map from vcr.json; empty when there is no workspace or no map. VCR passes it on and never judges a name. */
export function loadAgentModels(workspaceRoot: string | null): AgentModels {
  if (!workspaceRoot) return {};
  const marker = readJsonFile<{ models?: unknown }>(join(workspaceRoot, WORKSPACE_MARKER));
  const models = marker.ok ? marker.value.models : undefined;
  return typeof models === "object" && models !== null && !Array.isArray(models) ? (models as AgentModels) : {};
}

/** Idempotently adds ignore entries to the directory's `.gitignore`. True when the file was written. */
export function ensureIgnored(directory: string, entries: string[]): boolean {
  const gitignorePath = join(directory, ".gitignore");
  const existing = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : "";
  const presentLines = new Set(existing.split("\n").map((line) => line.trim()));
  const missing = entries.filter((entry) => !presentLines.has(entry));
  if (missing.length === 0) return false;
  const separator = existing === "" || existing.endsWith("\n") ? "" : "\n";
  writeFileSync(gitignorePath, `${existing}${separator}${missing.join("\n")}\n`);
  return true;
}
