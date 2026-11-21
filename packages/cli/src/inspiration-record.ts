import { createHash } from "node:crypto";
import { closeSync, existsSync, openSync, readSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import type { Diagnostic } from "./validate.js";

// The workspace inspiration library (ADR 0011): one committed record per item under
// inspiration/items/, its file copied to the git-ignored inspiration/files/<id>/. A record keeps what
// a person stated, what a tool measured and what a model judged in separate fields (ADR 0012).

// === TYPES ===

export type InspirationKind = "image" | "video" | "font" | "colours";
export type InspirationAspect = (typeof INSPIRATION_ASPECTS)[number];
export type InspirationUse = "inspiration" | "asset";

export interface InspirationFacts {
  width?: number;
  height?: number;
  dominant_colours?: Array<{ hex: string; share: number }>;
  duration_s?: number;
  fps?: number;
  has_audio?: boolean;
  family?: string;
  subfamily?: string;
  weight_class?: number;
  italic?: boolean;
  licence?: string;
}

export interface InspirationObservation {
  aspect: InspirationAspect;
  observed: string;
  inferred?: string;
  span?: string;
  by: { agent: string; model: string };
  at: string;
}

export interface InspirationItem {
  schema_version: string;
  id: string;
  kind: InspirationKind;
  title: string;
  /** Stated by a person. No agent writes it. */
  note?: string;
  aspects?: InspirationAspect[];
  use: InspirationUse;
  rights?: "unknown" | { evidence: string; attribution?: string };
  source?: { locator?: string; creator?: string; accessed?: string };
  file?: { name: string; sha256: string; bytes: number; media_type: string };
  colours?: string[];
  /** Measured by a tool, named in `facts_by`. */
  facts?: InspirationFacts;
  facts_by?: { tool: string; version: string };
  /** Judged by a model. Never satisfies a check that asks for `note`. */
  observations?: InspirationObservation[];
  added_at: string;
}

export interface LoadedInspirationItem {
  item: InspirationItem;
  /** Workspace-relative path of the record. */
  file: string;
}

// === PUBLIC API ===

export const INSPIRATION_PATHS = { items: "inspiration/items", files: "inspiration/files" } as const;
export const INSPIRATION_ASPECTS = ["palette", "typography", "composition", "motion", "texture", "pacing", "tone"] as const;

/** Where an item's copied file lives; undefined for a colour set. */
export function inspirationFilePath(workspaceRoot: string, item: InspirationItem): string | undefined {
  return item.file ? join(workspaceRoot, INSPIRATION_PATHS.files, item.id, item.file.name) : undefined;
}

/** Hashes in chunks, so a long video is never held in memory. */
export function sha256OfFile(filePath: string): string {
  const hash = createHash("sha256");
  const buffer = Buffer.alloc(1024 * 1024);
  const descriptor = openSync(filePath, "r");
  try {
    for (let bytesRead = readSync(descriptor, buffer); bytesRead > 0; bytesRead = readSync(descriptor, buffer)) hash.update(buffer.subarray(0, bytesRead));
  } finally {
    closeSync(descriptor);
  }
  return hash.digest("hex");
}

/** What the schema cannot say about one library: naming, rights on assets, the copied file, and the missing note. */
export function inspirationDiagnostics(items: LoadedInspirationItem[], workspaceRoot: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const { item, file } of items) {
    const error = (path: string, message: string, suggestion: string) => diagnostics.push({ severity: "error", file, path, message, suggestion });
    const warning = (path: string, message: string, suggestion: string) => diagnostics.push({ severity: "warning", file, path, message, suggestion });
    if (basename(file, ".json") !== item.id) error("/id", `id ${item.id} does not match its file name`, `Name the record ${INSPIRATION_PATHS.items}/${item.id}.json.`);
    if (item.use === "asset" && item.rights === "unknown") {
      error("/rights", "an asset needs rights evidence; unknown rights cannot appear in output", `Record where permission comes from with \`vcr inspiration annotate ${item.id} --rights "<evidence>"\`, or set --use inspiration.`);
    }
    if (item.note === undefined) {
      warning("/note", "no note: nothing says what the user likes in this item", `Ask the user, then \`vcr inspiration annotate ${item.id} --note "<their words>"\`. An agent's observations do not clear this.`);
    }
    diagnostics.push(...copiedFileDiagnostics(item, file, workspaceRoot));
  }
  return diagnostics;
}

/** Every inspiration id a brief cites must be an item in the library. */
export function inspirationCitationDiagnostics(citedIds: string[], knownIds: ReadonlySet<string>, file: string, path: string): Diagnostic[] {
  return citedIds
    .filter((id) => !knownIds.has(id))
    .map((id) => ({ severity: "error" as const, file, path, message: `cites inspiration "${id}", which is not in ${INSPIRATION_PATHS.items}/`, suggestion: "Use an id from `vcr inspiration list`, or add the item first." }));
}

// === PRIVATE HELPERS ===

function copiedFileDiagnostics(item: InspirationItem, file: string, workspaceRoot: string): Diagnostic[] {
  const copiedPath = inspirationFilePath(workspaceRoot, item);
  if (!copiedPath || !item.file) return [];
  const displayPath = `${INSPIRATION_PATHS.files}/${item.id}/${item.file.name}`;
  if (!existsSync(copiedPath)) {
    return [{ severity: "warning", file, path: "/file", message: `${displayPath} is absent; the record stands but nothing can look at the item`, suggestion: "Copied files are git-ignored, so a fresh clone has none. Add the original again with `vcr inspiration add <file>`; the same content restores the same id." }];
  }
  const isSameContent = statSync(copiedPath).size === item.file.bytes && sha256OfFile(copiedPath) === item.file.sha256;
  if (isSameContent) return [];
  return [{ severity: "error", file, path: "/file/sha256", message: `${displayPath} no longer matches the recorded sha256; facts and observations describe a different file`, suggestion: `Restore the original file, or \`vcr inspiration remove ${item.id}\` and add the new file as its own item.` }];
}
