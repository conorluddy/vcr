import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import type { CatalogIndex } from "./catalog.js";
import { formatToolCard, type ExampleManifest } from "./tools.js";

// ADR 0004 (5): disclosure is measured before it is capped. Sizes are bytes; tokens are an estimate
// (bytes / 4) for comparing tiers, not a tokenizer count.

// === TYPES ===

export interface SizeStats {
  count: number;
  minBytes: number;
  medianBytes: number;
  maxBytes: number;
  maxId?: string;
}

export interface DisclosureReport {
  tokensAreEstimates: true;
  tier0: { indexBytes: number; candidatesBytes: number };
  tier1Cards: SizeStats;
  tier2Guides: SizeStats;
  /** What a session reads to start routing: the start skill plus INDEX.md. */
  startupBytes: number;
}

// === PUBLIC API ===

export function disclosureReport(repositoryRoot: string, index: CatalogIndex, examples: ExampleManifest[]): DisclosureReport {
  const cards = index.resources.map((tool) => ({ id: tool.id, bytes: Buffer.byteLength(formatToolCard(tool, examples, repositoryRoot), "utf8") }));
  const guides = index.resources.filter((tool) => tool.skill).map((tool) => ({ id: tool.id, bytes: fileBytes(repositoryRoot, tool.skill!) }));
  const indexBytes = fileBytes(repositoryRoot, "catalog/INDEX.md");
  return {
    tokensAreEstimates: true,
    tier0: { indexBytes, candidatesBytes: fileBytes(repositoryRoot, "catalog/CANDIDATES.md") },
    tier1Cards: stats(cards),
    tier2Guides: stats(guides),
    startupBytes: indexBytes + fileBytes(repositoryRoot, "skills/start/SKILL.md"),
  };
}

export function formatDisclosureReport(report: DisclosureReport): string {
  const tokens = (bytes: number) => `${bytes} B (~${Math.round(bytes / 4)} tok)`;
  const range = (label: string, entry: SizeStats) =>
    `${label}: ${entry.count}, median ${tokens(entry.medianBytes)}, max ${tokens(entry.maxBytes)}${entry.maxId ? ` (${entry.maxId})` : ""}`;
  return [
    "disclosure (tokens estimated as bytes/4):",
    `  tier 0: INDEX.md ${tokens(report.tier0.indexBytes)}; CANDIDATES.md ${tokens(report.tier0.candidatesBytes)}`,
    `  ${range("tier 1 cards", report.tier1Cards)}`,
    `  ${range("tier 2 guides", report.tier2Guides)}`,
    `  startup (start skill + INDEX.md): ${tokens(report.startupBytes)}`,
  ].join("\n");
}

// === PRIVATE HELPERS ===

function fileBytes(repositoryRoot: string, relativePath: string): number {
  const path = join(repositoryRoot, relativePath);
  return existsSync(path) ? statSync(path).size : 0;
}

function stats(entries: Array<{ id: string; bytes: number }>): SizeStats {
  if (entries.length === 0) return { count: 0, minBytes: 0, medianBytes: 0, maxBytes: 0 };
  const sorted = [...entries].sort((left, right) => left.bytes - right.bytes);
  const largest = sorted.at(-1)!;
  return { count: sorted.length, minBytes: sorted[0]!.bytes, medianBytes: sorted[Math.floor(sorted.length / 2)]!.bytes, maxBytes: largest.bytes, maxId: largest.id };
}
