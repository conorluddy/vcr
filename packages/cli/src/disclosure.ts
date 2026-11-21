import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import type { CatalogIndex } from "./catalog.js";
import { formatTechniqueCard, formatTechniqueRoutes, TECHNIQUES_INDEX_PATH, type Technique } from "./techniques.js";
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
  /** The technique tiers: TECHNIQUES.md, cards, and cards with every route expanded. */
  techniques: { indexBytes: number; cards: SizeStats; full: SizeStats };
}

// === PUBLIC API ===

export function disclosureReport(repositoryRoot: string, index: CatalogIndex, examples: ExampleManifest[], techniques: Technique[] = []): DisclosureReport {
  const techniqueContext = { harnessRoot: repositoryRoot, tools: index.resources, examples };
  const techniqueCards = techniques.map((technique) => ({ id: technique.id, bytes: Buffer.byteLength(formatTechniqueCard(technique, examples, repositoryRoot), "utf8") }));
  const techniqueRoutes = techniques.map((technique, position) => ({ id: technique.id, bytes: techniqueCards[position]!.bytes + Buffer.byteLength(formatTechniqueRoutes(technique, techniqueContext), "utf8") }));
  const cards = index.resources.map((tool) => ({ id: tool.id, bytes: Buffer.byteLength(formatToolCard(tool, examples, repositoryRoot), "utf8") }));
  const guides = index.resources.filter((tool) => tool.skill).map((tool) => ({ id: tool.id, bytes: fileBytes(repositoryRoot, tool.skill!) }));
  const indexBytes = fileBytes(repositoryRoot, "catalog/INDEX.md");
  return {
    tokensAreEstimates: true,
    tier0: { indexBytes, candidatesBytes: fileBytes(repositoryRoot, "catalog/CANDIDATES.md") },
    tier1Cards: stats(cards),
    tier2Guides: stats(guides),
    startupBytes: indexBytes + fileBytes(repositoryRoot, "skills/start/SKILL.md"),
    techniques: { indexBytes: fileBytes(repositoryRoot, TECHNIQUES_INDEX_PATH), cards: stats(techniqueCards), full: stats(techniqueRoutes) },
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
    ...(report.techniques.cards.count > 0 ? [`  techniques: TECHNIQUES.md ${tokens(report.techniques.indexBytes)}; ${range("cards", report.techniques.cards)}; ${range("with routes", report.techniques.full)}`] : []),
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
