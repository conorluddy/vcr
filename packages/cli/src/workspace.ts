import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WORKSPACE_MARKER } from "./roots.js";

// === TYPES ===

export interface WorkspaceMarker {
  schema_version: string;
  harness_version: string;
  projects: string[];
}

export interface EnsureWorkspaceOutcome {
  workspace: string;
  /** Relative paths written or appended to; empty when the workspace was already initialised. */
  changes: string[];
}

/** Regenerable output never belongs in git. */
const IGNORED_DIRECTORIES = ["output/", ".cache/"];

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
  const gitignorePath = join(directory, ".gitignore");
  const existing = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : "";
  const presentLines = new Set(existing.split("\n").map((line) => line.trim()));
  const missing = IGNORED_DIRECTORIES.filter((entry) => !presentLines.has(entry));
  if (missing.length > 0) {
    const separator = existing === "" || existing.endsWith("\n") ? "" : "\n";
    writeFileSync(gitignorePath, `${existing}${separator}${missing.join("\n")}\n`);
    changes.push(".gitignore");
  }
  return { workspace: directory, changes };
}
