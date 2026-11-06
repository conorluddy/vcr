// The typography rules data file is canonical; the KB §14 table is generated from it,
// the same way catalog/INDEX.md is generated from the tool records.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readJsonFile } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";
import type { Diagnostic } from "./validate.js";

// === TYPES ===

export interface TypographyRule {
  id: string;
  section: string;
  check: string;
  threshold: string;
  tier: string;
  applies_to: string;
  source: string;
  verified: boolean;
  values?: Record<string, unknown>;
}

export interface TypographyRules {
  kb_date: string;
  rules: TypographyRule[];
}

export interface TableOutcome {
  wasStale: boolean;
  staleFiles: string[];
}

export const TYPOGRAPHY_RULES_PATH = "references/typography/rules.json";
export const TYPOGRAPHY_KB_PATH = "references/typography/typography-knowledge-base.md";
const TABLE_MARKERS = { start: "<!-- typography-rules:start -->", end: "<!-- typography-rules:end -->" } as const;

// === PUBLIC API ===

/** The §14 check-rules table: one row per section 14 rule, in data order. */
export function renderRulesTable(rules: TypographyRule[]): string {
  const rows = rules.filter((rule) => rule.section === "14").map((rule) => `| \`${rule.id}\` | ${rule.check} | ${rule.threshold} | ${rule.tier} | ${rule.applies_to} |`);
  return ["| ID | Check | Threshold | Tier | Applies to |", "|---|---|---|---|---|", ...rows].join("\n");
}

/** Rewrites the table between the KB markers unless `checkOnly`; either way reports whether the KB was stale. Fixture repositories without the KB or rules are skipped. */
export function writeTypographyTable(repositoryRoot: string, checkOnly: boolean): Result<TableOutcome> {
  const kbPath = join(repositoryRoot, TYPOGRAPHY_KB_PATH);
  const rulesPath = join(repositoryRoot, TYPOGRAPHY_RULES_PATH);
  if (!existsSync(kbPath) && !existsSync(rulesPath)) return ok({ wasStale: false, staleFiles: [] });
  const rules = readJsonFile<TypographyRules>(rulesPath);
  if (!rules.ok) return rules;
  const kb = readFileSync(kbPath, "utf8");
  const spliced = spliceTable(kb, renderRulesTable(rules.value.rules));
  if (!spliced.ok) return spliced;
  if (spliced.value === kb) return ok({ wasStale: false, staleFiles: [] });
  if (!checkOnly) writeFileSync(kbPath, spliced.value);
  return ok({ wasStale: true, staleFiles: [TYPOGRAPHY_KB_PATH] });
}

/** Table freshness and ID agreement between the KB and the rules data. Call after the rules file passes its schema. */
export function typographyRuleDiagnostics(repositoryRoot: string): Diagnostic[] {
  const outcome = writeTypographyTable(repositoryRoot, true);
  if (!outcome.ok) return [{ severity: "error", file: TYPOGRAPHY_KB_PATH, path: "", message: outcome.error.message }];
  const diagnostics: Diagnostic[] = outcome.value.staleFiles.map((file) => ({ severity: "error", file, path: "", message: "typography rules table is stale", suggestion: "Run `pnpm vcr catalog build` and commit the result." }));
  const rules = readJsonFile<TypographyRules>(join(repositoryRoot, TYPOGRAPHY_RULES_PATH));
  if (!rules.ok) return diagnostics;
  const dataIds = new Set(rules.value.rules.map((rule) => rule.id));
  const kbIds = new Set(extractRuleIds(readFileSync(join(repositoryRoot, TYPOGRAPHY_KB_PATH), "utf8")));
  for (const id of kbIds) {
    if (!dataIds.has(id)) diagnostics.push({ severity: "error", file: TYPOGRAPHY_KB_PATH, path: "", message: `${id} is cited in the KB but missing from ${TYPOGRAPHY_RULES_PATH}`, suggestion: `Add ${id} to ${TYPOGRAPHY_RULES_PATH}, or fix the ID in the KB.` });
  }
  for (const id of dataIds) {
    if (!kbIds.has(id)) diagnostics.push({ severity: "error", file: TYPOGRAPHY_RULES_PATH, path: "", message: `${id} is in the rules data but never appears in the KB`, suggestion: "Define the rule in KB §14 or §15, or remove it from the data." });
  }
  return diagnostics;
}

// === PRIVATE HELPERS ===

/** Every concrete rule ID in the text. Family wildcards such as `TYPO-FONT-*` are not IDs. */
function extractRuleIds(text: string): string[] {
  return [...text.matchAll(/TYPO-[A-Z]+(?:-[A-Z]+)*(?!-?[A-Z*])/g)].map((match) => match[0]);
}

function spliceTable(kb: string, table: string): Result<string> {
  const start = kb.indexOf(TABLE_MARKERS.start);
  const end = kb.indexOf(TABLE_MARKERS.end);
  if (start === -1 || end === -1 || end < start) return fail("TYPOGRAPHY_MARKERS_MISSING", `${TYPOGRAPHY_KB_PATH} needs ${TABLE_MARKERS.start} and ${TABLE_MARKERS.end} around the §14 table.`);
  return ok(`${kb.slice(0, start + TABLE_MARKERS.start.length)}\n${table}\n${kb.slice(end)}`);
}
