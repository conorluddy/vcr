// The creative pillars in references/, made reachable one tier at a time (ADR 0004, ADR 0006):
// tier 0 is the generated references/INDEX.md, tier 1 a single rule by ID, tier 2 a single
// knowledge base section. A whole knowledge base is never printed.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fail, ok, type Result } from "./result.types.js";
import type { Diagnostic } from "./validate.js";

// === TYPES ===

export interface Pillar {
  name: string;
  /** Rule ID prefix with its trailing hyphen: `TYPO-`. */
  prefix: string;
  /** Directory under references/: `motion-director`. */
  slug: string;
  /** The knowledge base's own title (its first heading). */
  title: string;
  /** Pipeline status columns from the references/README.md table, `—` when not built. */
  data: string;
  checks: string;
  skill: string;
  agent: string;
}

export interface PillarRule {
  id: string;
  pillar: string;
  check: string;
  threshold: string;
  tier: string;
  applies_to: string;
  /** `rules.json` once the pillar has data; until then the knowledge base's rules table. */
  origin: "rules.json" | "knowledge-base";
  /** Numbered draft IDs (`MOTION-EASE-001`) are renamed when the pillar gets its rules.json. */
  isDraftId: boolean;
  source?: string;
  verified?: boolean;
  /** Machine-readable thresholds from rules.json, such as `{ vertical_caption_min_px: 48 }`. */
  values?: Record<string, unknown>;
}

export interface RuleFilter {
  pillar?: string | undefined;
  tier?: string | undefined;
  appliesTo?: string | undefined;
}

export const REFERENCES_INDEX_PATH = "references/INDEX.md";
const REFERENCES_README_PATH = "references/README.md";
const RULES_TABLE_HEADER = /^\|\s*ID\s*\|\s*Check\s*\|\s*Threshold\s*\|\s*Tier\s*\|\s*Applies to\s*\|/;

// === PUBLIC API ===

/** Pillars that have a knowledge base, read from the status table in references/README.md. */
export function loadPillars(harnessRoot: string): Result<Pillar[]> {
  const readmePath = join(harnessRoot, REFERENCES_README_PATH);
  if (!existsSync(readmePath)) return fail("REFERENCES_MISSING", `${REFERENCES_README_PATH} is missing; the pillar status table lives there.`);
  const pillars: Pillar[] = [];
  for (const line of readFileSync(readmePath, "utf8").split("\n")) {
    const cells = splitRow(line);
    const link = cells[2]?.match(/^\[[^\]]+\]\(([a-z0-9-]+)\/README\.md\)$/);
    const prefix = cells[1]?.match(/^`([A-Z0-9]+-)`$/);
    if (!link || !prefix || cells.length < 7) continue;
    const slug = link[1]!;
    pillars.push({ name: cells[0]!, prefix: prefix[1]!, slug, title: readKnowledgeBaseTitle(harnessRoot, slug), data: cells[3]!, checks: cells[4]!, skill: cells[5]!, agent: cells[6]! });
  }
  return pillars.length > 0 ? ok(pillars) : fail("REFERENCES_EMPTY", `No pillar rows with a README link found in ${REFERENCES_README_PATH}.`);
}

/** Every rule of every pillar: from `rules.json` where it exists, otherwise from the knowledge base's rules table. */
export function loadPillarRules(harnessRoot: string, pillars: Pillar[]): PillarRule[] {
  return pillars.flatMap((pillar) => {
    const rulesPath = join(harnessRoot, "references", pillar.slug, "rules.json");
    if (existsSync(rulesPath)) return rulesFromData(pillar, JSON.parse(readFileSync(rulesPath, "utf8")) as { rules: Array<Record<string, unknown>> });
    const knowledgeBase = knowledgeBasePath(harnessRoot, pillar.slug);
    return knowledgeBase ? rulesFromTable(pillar, readFileSync(knowledgeBase, "utf8")) : [];
  });
}

export function findPillarRule(rules: PillarRule[], id: string): Result<PillarRule> {
  const wanted = id.trim().toUpperCase();
  const rule = rules.find((candidate) => candidate.id === wanted);
  if (rule) return ok(rule);
  const prefix = wanted.split("-")[0];
  const nearby = rules.filter((candidate) => candidate.id.startsWith(`${prefix}-`)).slice(0, 8).map((candidate) => candidate.id);
  return fail("RULE_NOT_FOUND", `No rule ${wanted}.${nearby.length > 0 ? ` Rules starting ${prefix}-: ${nearby.join(", ")}…` : ""} Run \`vcr rules list --pillar <prefix>\` to browse.`);
}

export function filterPillarRules(rules: PillarRule[], filter: RuleFilter): PillarRule[] {
  const pillar = filter.pillar?.toLowerCase().replace(/-$/, "");
  return rules.filter((rule) =>
    (!pillar || rule.pillar === pillar || rule.id.toLowerCase().startsWith(`${pillar}-`))
    && (!filter.tier || rule.tier.toLowerCase().includes(filter.tier.toLowerCase()))
    && (!filter.appliesTo || rule.applies_to.toLowerCase().includes(filter.appliesTo.toLowerCase())));
}

/** One section of a pillar's knowledge base, from its heading to the next heading at the same or a higher level. */
export function readKnowledgeBaseSection(harnessRoot: string, pillars: Pillar[], pillarName: string, section: string): Result<string> {
  const pillar = matchPillar(pillars, pillarName);
  if (!pillar) return fail("PILLAR_NOT_FOUND", `No pillar ${pillarName}. Pillars: ${pillars.map((candidate) => `${candidate.slug} (${candidate.prefix})`).join(", ")}.`);
  const path = knowledgeBasePath(harnessRoot, pillar.slug);
  if (!path) return fail("KNOWLEDGE_BASE_MISSING", `references/${pillar.slug}/ has no *-knowledge-base.md.`);
  const lines = readFileSync(path, "utf8").split("\n");
  const number = section.replace(/^§/, "").replace(/\.$/, "");
  const headingPattern = new RegExp(`^(#{2,4})\\s+${number.replace(/\./g, "\\.")}(?:\\.|\\s)`);
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start === -1) return fail("SECTION_NOT_FOUND", `No §${number} in references/${pillar.slug}/. Sections: ${listSections(lines).join(", ")}.`);
  const level = lines[start]!.match(/^#+/)![0].length;
  const endOffset = lines.slice(start + 1).findIndex((line) => /^#{1,6}\s/.test(line) && line.match(/^#+/)![0].length <= level);
  return ok(lines.slice(start, endOffset === -1 ? undefined : start + 1 + endOffset).join("\n").trimEnd());
}

/** Tier 0: one line per pillar. */
export function renderReferencesIndex(pillars: Pillar[], rules: PillarRule[]): string {
  const lines = pillars.map((pillar) => {
    const count = rules.filter((rule) => rule.pillar === pillar.slug).length;
    const built = [["data", pillar.data], ["checks", pillar.checks], ["skill", pillar.skill], ["agent", pillar.agent]].filter(([, value]) => value && !value.startsWith("—")).map(([label, value]) => `${label}: ${value}`);
    return `- **${pillar.name}** \`${pillar.prefix}\` · ${count} rules · [${pillar.slug}/](${pillar.slug}/README.md) · ${pillar.title}${built.length > 0 ? ` · ${built.join("; ")}` : " · reference only"}`;
  });
  return [
    "# Reference pillars",
    "",
    "Generated by `vcr catalog build` from the status table in [README.md](README.md); do not edit. Tier 0 of the pillars: pick one here, read its README, then one rule (`vcr rules info <ID>`) or one section (`vcr refs section <pillar> <§>`). Never load a whole knowledge base.",
    "",
    ...lines,
    "",
  ].join("\n");
}

/** Rewrites references/INDEX.md unless `checkOnly`; reports whether it was stale. Fixture repositories without references are skipped. */
export function writeReferencesIndex(harnessRoot: string, checkOnly: boolean): Result<{ wasStale: boolean; staleFiles: string[] }> {
  if (!existsSync(join(harnessRoot, REFERENCES_README_PATH))) return ok({ wasStale: false, staleFiles: [] });
  const pillars = loadPillars(harnessRoot);
  if (!pillars.ok) return pillars;
  const rendered = renderReferencesIndex(pillars.value, loadPillarRules(harnessRoot, pillars.value));
  const path = join(harnessRoot, REFERENCES_INDEX_PATH);
  if (existsSync(path) && readFileSync(path, "utf8") === rendered) return ok({ wasStale: false, staleFiles: [] });
  if (!checkOnly) writeFileSync(path, rendered);
  return ok({ wasStale: true, staleFiles: [REFERENCES_INDEX_PATH] });
}

export function referencesIndexDiagnostics(harnessRoot: string): Diagnostic[] {
  const outcome = writeReferencesIndex(harnessRoot, true);
  if (!outcome.ok) return [{ severity: "error", file: REFERENCES_README_PATH, path: "", message: outcome.error.message }];
  return outcome.value.staleFiles.map((file) => ({ severity: "error", file, path: "", message: "references index is stale", suggestion: "Run `pnpm vcr catalog build` and commit the result." }));
}

export function formatPillarRule(rule: PillarRule): string {
  const where = rule.origin === "rules.json" ? `references/${rule.pillar}/rules.json` : `references/${rule.pillar}/ knowledge base rules table`;
  const notes = [rule.isDraftId ? "draft ID, renamed when the pillar gets rules.json" : "", rule.verified === false ? "figure unverified at source" : ""].filter(Boolean);
  return [
    `${rule.id}  (${where}${notes.length > 0 ? `; ${notes.join("; ")}` : ""})`,
    `check       ${rule.check}`,
    `threshold   ${rule.threshold}`,
    `tier        ${rule.tier}`,
    `applies to  ${rule.applies_to}`,
    ...(rule.source ? [`source      ${rule.source}`] : []),
    ...(rule.values ? [`values      ${JSON.stringify(rule.values)}`] : []),
  ].join("\n");
}

export function formatPillarRuleList(rules: PillarRule[], total: number, offset: number): string {
  if (rules.length === 0) return "no matching rules";
  const width = Math.max(...rules.map((rule) => rule.id.length));
  const rows = rules.map((rule) => `${rule.id.padEnd(width)}  ${truncate(rule.tier, 18).padEnd(18)}  ${truncate(rule.check, 90)}`);
  const shown = `${offset + 1}–${offset + rules.length} of ${total}`;
  return [...rows, "", total > offset + rules.length ? `${shown}; next page: --offset ${offset + rules.length}` : shown].join("\n");
}

// === PRIVATE HELPERS ===

/** Splits a Markdown table row on unescaped pipes; returns [] for anything that is not a row. */
function splitRow(line: string): string[] {
  if (!line.startsWith("|")) return [];
  return line.slice(1, line.trimEnd().endsWith("|") ? line.trimEnd().length - 1 : undefined).split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, "|"));
}

function rulesFromTable(pillar: Pillar, markdown: string): PillarRule[] {
  const rules: PillarRule[] = [];
  let isInRulesTable = false;
  const idPattern = new RegExp(`^${pillar.prefix}[A-Z0-9]+(?:-[A-Z0-9]+)*$`);
  for (const line of markdown.split("\n")) {
    if (RULES_TABLE_HEADER.test(line)) { isInRulesTable = true; continue; }
    if (!line.startsWith("|")) { isInRulesTable = false; continue; }
    if (!isInRulesTable) continue;
    const [idCell, check, threshold, tier, appliesTo] = splitRow(line);
    const id = idCell?.replace(/`/g, "");
    if (!id || !idPattern.test(id)) continue;
    rules.push({ id, pillar: pillar.slug, check: check ?? "", threshold: threshold ?? "", tier: tier ?? "", applies_to: appliesTo ?? "", origin: "knowledge-base", isDraftId: /\d/.test(id) });
  }
  return rules;
}

function rulesFromData(pillar: Pillar, data: { rules: Array<Record<string, unknown>> }): PillarRule[] {
  return data.rules.map((rule) => ({
    id: String(rule["id"]), pillar: pillar.slug, check: String(rule["check"] ?? ""), threshold: String(rule["threshold"] ?? ""), tier: String(rule["tier"] ?? ""),
    applies_to: String(rule["applies_to"] ?? ""), origin: "rules.json" as const, isDraftId: /\d/.test(String(rule["id"])),
    ...(rule["source"] !== undefined ? { source: String(rule["source"]) } : {}), ...(typeof rule["verified"] === "boolean" ? { verified: rule["verified"] } : {}),
    ...(rule["values"] !== undefined ? { values: rule["values"] as Record<string, unknown> } : {}),
  }));
}

function knowledgeBasePath(harnessRoot: string, slug: string): string | undefined {
  const directory = join(harnessRoot, "references", slug);
  if (!existsSync(directory)) return undefined;
  const file = readdirSync(directory).find((name) => name.endsWith("-knowledge-base.md"));
  return file ? join(directory, file) : undefined;
}

function readKnowledgeBaseTitle(harnessRoot: string, slug: string): string {
  const path = knowledgeBasePath(harnessRoot, slug);
  const heading = path ? readFileSync(path, "utf8").split("\n").find((line) => line.startsWith("# ")) : undefined;
  return heading ? heading.slice(2).replace(/\s*\(`[^`]*`\)\s*$/, "").trim() : slug;
}

function matchPillar(pillars: Pillar[], name: string): Pillar | undefined {
  const wanted = name.toLowerCase().replace(/-$/, "");
  return pillars.find((pillar) => pillar.slug === wanted || pillar.prefix.toLowerCase().replace(/-$/, "") === wanted || pillar.slug.startsWith(`${wanted}-`));
}

function listSections(lines: string[]): string[] {
  return lines.map((line) => line.match(/^##\s+(\d+)\./)?.[1]).filter((number): number is string => number !== undefined);
}

function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}
