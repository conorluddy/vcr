import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { resolveRoots } from "./roots.js";
import { renderRulesTable, TYPOGRAPHY_KB_PATH, TYPOGRAPHY_RULES_PATH, typographyRuleDiagnostics, writeTypographyTable, type TypographyRule } from "./typography-rules.js";
import { hasErrors, validateRepository } from "./validate.js";

const rule = (id: string, section = "14"): TypographyRule => ({ id, section, check: "Check", threshold: "≤3", tier: "heuristic", applies_to: "all", source: "§1", verified: true });

/** A throwaway repository holding only the typography KB and rules, copied from the real harness. */
function createTypographyFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "vcr-typography-"));
  mkdirSync(join(root, "references/typography"), { recursive: true });
  for (const path of [TYPOGRAPHY_KB_PATH, TYPOGRAPHY_RULES_PATH]) cpSync(join(harnessRoot(), path), join(root, path));
  return root;
}

function editRules(root: string, edit: (data: { rules: TypographyRule[] }) => void): void {
  const path = join(root, TYPOGRAPHY_RULES_PATH);
  const data = JSON.parse(readFileSync(path, "utf8")) as { rules: TypographyRule[] };
  edit(data);
  writeFileSync(path, JSON.stringify(data));
}

describe("typography rules", () => {
  test("the table renders section 14 rules from data and leaves section 15 rules to their prose", () => {
    const table = renderRulesTable([rule("TYPO-A"), rule("TYPO-B", "15.3")]);
    expect(table.split("\n")).toEqual(["| ID | Check | Threshold | Tier | Applies to |", "|---|---|---|---|---|", "| `TYPO-A` | Check | ≤3 | heuristic | all |"]);
  });

  test("a threshold edited in the data without a rebuild makes the table stale, and a rebuild fixes it", () => {
    const root = createTypographyFixture();
    editRules(root, (data) => { data.rules[0]!.threshold = "45–80"; });
    expect(typographyRuleDiagnostics(root).map((diagnostic) => diagnostic.message)).toEqual(["typography rules table is stale"]);
    expect(writeTypographyTable(root, false)).toEqual({ ok: true, value: { wasStale: true, staleFiles: [TYPOGRAPHY_KB_PATH] } });
    expect(readFileSync(join(root, TYPOGRAPHY_KB_PATH), "utf8")).toContain("| 45–80 |");
    expect(typographyRuleDiagnostics(root)).toEqual([]);
  });

  test("an ID cited in the KB but missing from the data is reported", () => {
    const root = createTypographyFixture();
    editRules(root, (data) => { data.rules = data.rules.filter((entry) => entry.id !== "TYPO-RANGE"); });
    expect(typographyRuleDiagnostics(root).map((diagnostic) => diagnostic.message)).toContain(`TYPO-RANGE is cited in the KB but missing from ${TYPOGRAPHY_RULES_PATH}`);
  });

  test("an ID in the data that the KB never mentions is reported", () => {
    const root = createTypographyFixture();
    editRules(root, (data) => { data.rules.push(rule("TYPO-GHOST", "15.1")); });
    expect(typographyRuleDiagnostics(root).map((diagnostic) => diagnostic.message)).toContain(`TYPO-GHOST is in the rules data but never appears in the KB`);
  });

  test("a KB without the table markers fails with an actionable error", () => {
    const root = createTypographyFixture();
    const kbPath = join(root, TYPOGRAPHY_KB_PATH);
    writeFileSync(kbPath, readFileSync(kbPath, "utf8").replace("<!-- typography-rules:start -->", ""));
    const outcome = writeTypographyTable(root, true);
    expect(outcome.ok ? null : outcome.error.code).toBe("TYPOGRAPHY_MARKERS_MISSING");
  });

  test("the real repository's rules, table and IDs agree", () => {
    expect(typographyRuleDiagnostics(harnessRoot())).toEqual([]);
    const report = validateRepository(harnessRoot());
    expect(report.diagnostics.filter((diagnostic) => diagnostic.file.startsWith("references/typography"))).toEqual([]);
    expect(hasErrors(report)).toBe(false);
  });
});

function harnessRoot(): string {
  const roots = resolveRoots({ cwd: process.cwd(), env: {} });
  if (!roots.ok) throw new Error(roots.error.message);
  return roots.value.harness;
}
