import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { listJsonFiles, readJsonFile } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";

// === TYPES ===

export interface CatalogIndex {
  schema_version: string;
  generated_from: "catalog/tools/*.json";
  resources: Array<{ id: string } & Record<string, unknown>>;
}

export interface BuildOutcome {
  recordCount: number;
  /** True when the committed index differs from what the per-tool files produce. */
  wasStale: boolean;
}

// === PUBLIC API ===

export function buildCatalogIndex(repositoryRoot: string): Result<CatalogIndex> {
  const resources: CatalogIndex["resources"] = [];
  for (const filePath of listJsonFiles(join(repositoryRoot, "catalog/tools"))) {
    const record = readJsonFile<{ id: string } & Record<string, unknown>>(filePath);
    if (!record.ok) return record;
    const expectedFile = `${record.value.id}.json`;
    if (!filePath.endsWith(`/${expectedFile}`)) return fail("CATALOG_FILENAME_MISMATCH", `${filePath}: file must be named ${expectedFile} to match its id`);
    resources.push(record.value);
  }
  resources.sort((left, right) => left.id.localeCompare(right.id));
  return ok({ schema_version: "1.1.0", generated_from: "catalog/tools/*.json", resources });
}

export function serializeIndex(index: CatalogIndex): string {
  return `${JSON.stringify(index, null, 2)}\n`;
}

/** Writes the index unless `checkOnly`; either way reports whether the committed file was stale. */
export function writeCatalogIndex(repositoryRoot: string, checkOnly: boolean): Result<BuildOutcome> {
  const built = buildCatalogIndex(repositoryRoot);
  if (!built.ok) return built;
  const indexPath = join(repositoryRoot, "catalog/tools.json");
  const next = serializeIndex(built.value);
  const current = safeRead(indexPath);
  const wasStale = current !== next;
  if (wasStale && !checkOnly) writeFileSync(indexPath, next);
  return ok({ recordCount: built.value.resources.length, wasStale });
}

// === PRIVATE HELPERS ===

function safeRead(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}
