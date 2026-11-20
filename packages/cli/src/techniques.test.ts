import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { techniqueFilterTerms, deriveRouteEvidence, filterTechniques, findTechnique, formatTechniqueCard, formatTechniqueList, formatTechniqueRoutes, renderTechniquesIndex, resolveTechnique, TECHNIQUES_INDEX_PATH, techniquesIndexDiagnostics, writeTechniquesIndex, type Technique, type TechniqueRoute } from "./techniques.js";
import type { ExampleManifest, ToolSummary } from "./tools.js";
import { loadPillarRules, loadPillars } from "./references.js";
import { harnessRoot } from "./test-workspace.js";

const loadedPillars = loadPillars(harnessRoot());
if (!loadedPillars.ok) throw new Error(loadedPillars.error.message);
const realPillars = loadedPillars.value;

const route = (id: string, tools: string[], extra: Partial<TechniqueRoute> = {}): TechniqueRoute => ({
  id, one_line: `Route ${id}`, steps: tools.map((tool) => ({ does: `Use ${tool}`, capability: "effects", tools: [tool] })), ...extra,
});

const technique = (id: string, extra: Partial<Technique> = {}): Technique => ({
  id, name: id, one_line: `${id} in one line`, summary: `${id} summary.`, purposes: ["print-nostalgia"], mechanisms: ["tone-quantisation"],
  craft: [{ pillar: "fx", section: "5.1", rules: ["FX-MOIRE-RESAMPLE"] }], routes: [], checked_at: "2026-11-20", source: "test", ...extra,
});

const example = (extra: Partial<ExampleManifest> = {}): ExampleManifest => ({
  id: "demo", title: "Demo", status: "validated", tools: ["shader", "capture"], techniques: ["halftone/shader"], run: "./run.sh", directory: "examples/demo", ...extra,
});

const tool = (id: string, extra: Partial<ToolSummary> = {}): ToolSummary => ({
  id, name: id, category: "A3", tier: "catalogued", role: "", official_url: "https://example.test", capabilities: ["effects"],
  installation_status: "unknown", validation: { status: "validated", evidence: [{ date: "2026-11-05", version: "1.0.0", example: "examples/other" }] }, adapter_maturity: "none", ...extra,
});

/** A harness root where examples/demo does or does not retain expected/ outputs. */
function harnessWith(hasExpected: boolean): string {
  const root = mkdtempSync(join(tmpdir(), "vcr-techniques-"));
  mkdirSync(join(root, "examples/demo", hasExpected ? "expected" : ""), { recursive: true });
  return root;
}

describe("deriveRouteEvidence", () => {
  const halftone = technique("halftone", { routes: [route("shader", ["shader"], { example: "demo" }), route("bare", ["shader"])] });
  const [linked, bare] = halftone.routes as [TechniqueRoute, TechniqueRoute];

  test("a validated, two-way-linked, covering example with expected/ is retained-fixture", () => {
    expect(deriveRouteEvidence(halftone, linked, [example()], harnessWith(true))).toMatchObject({ class: "retained-fixture", example: "demo" });
  });

  test("the same example without expected/ is fixture-reported", () => {
    expect(deriveRouteEvidence(halftone, linked, [example()], harnessWith(false))).toMatchObject({ class: "fixture-reported", example: "demo" });
  });

  test.each([
    ["no example is cited", bare, [example()], "no fixture here has run it"],
    ["the example is absent from this install", linked, [], "not in this install"],
    ["the example does not list the route back", linked, [example({ techniques: [] })], "does not claim"],
    ["the example is not validated", linked, [example({ status: "not-validated" })], "not-validated"],
    ["the example does not use every route tool", linked, [example({ tools: ["capture"] })], "does not use shader"],
  ])("documented, never more, when %s, however well the tools are validated", (_name, candidate, examples, reason) => {
    const evidence = deriveRouteEvidence(halftone, candidate, examples, harnessWith(true));
    expect(evidence.class).toBe("documented");
    expect(evidence.example).toBeUndefined();
    expect(evidence.reason).toContain(reason);
  });
});

describe("filterTechniques", () => {
  const techniques = [
    technique("halftone", { routes: [route("shader", ["webgl"])] }),
    technique("stagger", { purposes: ["emphasis"], mechanisms: ["staggered-timing"], craft: [{ pillar: "typography", section: "9c", rules: [] }, { pillar: "motion-director", section: "4.1", rules: [] }], routes: [{ id: "waapi", one_line: "x", steps: [{ does: "x", capability: "tweening", tools: ["web-animations-api"] }] }] }),
    technique("gap", { purposes: ["emphasis"] }),
  ];
  const ids = (filter: Parameters<typeof filterTechniques>[1]) => filterTechniques(techniques, filter).map((candidate) => candidate.id);

  test("filters by purpose, mechanism, capability and tool", () => {
    expect(ids({ purpose: "emphasis" })).toEqual(["stagger", "gap"]);
    expect(ids({ mechanism: "staggered-timing" })).toEqual(["stagger"]);
    expect(ids({ capability: "tweening" })).toEqual(["stagger"]);
    expect(ids({ tool: "webgl" })).toEqual(["halftone"]);
    expect(ids({ purpose: "emphasis", tool: "webgl" })).toEqual([]);
    expect(ids({})).toHaveLength(3);
  });

  test("a pillar matches by directory or its start, across every craft pointer", () => {
    expect(ids({ pillar: "motion" })).toEqual(["stagger"]);
    expect(ids({ pillar: "TYPO" })).toEqual(["stagger"]);
    expect(ids({ pillar: "fx" })).toEqual(["halftone", "gap"]);
  });

  test("an unknown id fails with a code and says the list is not a whitelist", () => {
    const missing = findTechnique(techniques, "nope");
    expect(missing).toMatchObject({ ok: false, error: { code: "TECHNIQUE_NOT_FOUND", message: expect.stringContaining("not forbidden") } });
  });
});

describe("formatting", () => {
  const halftone = technique("halftone", { related: [{ id: "bloom", relation: "contrasts" }], routes: [route("shader", ["shader"], { example: "demo", limits: ["No fixture renders dots"] }), route("native", ["ghost"])] });

  test("a page names its range and the next offset; the last page does not", () => {
    const techniques = [technique("a"), technique("b"), technique("c")];
    expect(formatTechniqueList(techniques.slice(0, 2), 3, 0)).toContain("1–2 of 3; next page: --offset 2");
    expect(formatTechniqueList(techniques.slice(0, 1), 3, 0)).toContain("a in one line  [print-nostalgia]");
    expect(formatTechniqueList(techniques.slice(2), 3, 2).split("\n").at(-1)).toBe("3–3 of 3");
    expect(formatTechniqueList([], 0, 0)).toContain("not a whitelist");
    const miss = formatTechniqueList([], 0, 0, techniqueFilterTerms(techniques, { purposes: ["emphasis"], mechanisms: ["staggered-timing"] }));
    expect(miss).toContain("--purpose accepts: emphasis");
    expect(miss).toContain("--pillar accepts: fx");
  });

  test("the card points into the pillars and gives each route its derived class", () => {
    const card = formatTechniqueCard(halftone, [example()], harnessWith(true));
    expect(card).toContain("vcr refs section fx 5.1");
    expect(card).toContain("vcr rules info FX-MOIRE-RESAMPLE");
    expect(card).toContain("bloom (contrasts)");
    expect(card).toContain("- shader [retained-fixture]");
    expect(card).toContain("- native [documented]");
  });

  test("a technique with no route says it is a gap, not a verdict", () => {
    expect(formatTechniqueCard(technique("gap"), [], harnessWith(false))).toContain("none mapped");
  });

  test("routes show each tool's own evidence and readiness, and never claim installation", () => {
    const context = { harnessRoot: harnessWith(true), tools: [tool("shader")], examples: [example()] };
    const routes = formatTechniqueRoutes(halftone, context);
    expect(routes).toContain("shader · catalogued · tool's own evidence: validated 2026-11-05 (examples/other) · this machine: no vcr doctor record");
    expect(routes).toContain("ghost · not in this catalogue");
    expect(routes).toContain("- No fixture renders dots");
    expect(routes).toContain("vcr example create demo");
    expect(routes).not.toMatch(/\binstalled\b/);
  });

  test("a fixture-backed route cites the tool's evidence from that fixture, not its latest example", () => {
    const evidence = [{ date: "2026-11-05", version: "1.0.0", example: "examples/demo" }, { date: "2026-11-20", version: "1.0.0", example: "examples/later" }];
    const context = { harnessRoot: harnessWith(true), tools: [tool("shader", { validation: { status: "validated", evidence } })], examples: [example()] };
    const routes = formatTechniqueRoutes(halftone, context);
    expect(routes).toContain("tool's own evidence: validated 2026-11-05 (this route's fixture)");
    expect(routes).not.toContain("examples/later");
  });

  test("a card names each craft pointer's section and each rule's check and strength, read from the pillars", () => {
    const sources = { harnessRoot: harnessRoot(), pillars: realPillars, rules: loadPillarRules(harnessRoot(), realPillars) };
    const card = formatTechniqueCard(halftone, [], harnessWith(false), sources);
    expect(card).toContain("vcr refs section fx 5.1  · Halftone");
    expect(card).toMatch(/vcr rules info FX-MOIRE-RESAMPLE  · heuristic, advisory: Periodic patterns/);
    expect(resolveTechnique(halftone, { harnessRoot: harnessWith(false), tools: [], examples: [], craft: sources }).craft[0]).toMatchObject({ section_title: "Halftone", rule_gists: [{ id: "FX-MOIRE-RESAMPLE", strength: "heuristic, advisory" }] });
  });

  test("--json carries the derived class and per-tool status beside the stored links", () => {
    const resolved = resolveTechnique(halftone, { harnessRoot: harnessWith(false), tools: [tool("shader", { tier: "core" })], examples: [example()] });
    expect(resolved.routes[0]).toMatchObject({ id: "shader", evidence: { class: "fixture-reported" }, tool_status: [{ id: "shader", tier: "core", validation_status: "validated", readiness: { state: "no-machine-record" } }] });
    expect(resolved.routes[1]).toMatchObject({ evidence: { class: "documented" }, tool_status: [{ id: "ghost", tier: "unknown" }] });
  });
});

describe("the generated technique index", () => {
  const writeRecord = (root: string, record: Technique) => {
    mkdirSync(join(root, "catalog/techniques"), { recursive: true });
    writeFileSync(join(root, `catalog/techniques/${record.id}.json`), JSON.stringify(record));
  };

  test("one line per technique, sorted, with route counts and no evidence claims", () => {
    const index = renderTechniquesIndex([technique("zoom"), technique("halftone", { routes: [route("shader", ["webgl"])] })]);
    expect(index.indexOf("`halftone`")).toBeLessThan(index.indexOf("`zoom`"));
    expect(index).toContain("`halftone` — halftone in one line · print-nostalgia · tone-quantisation · fx · 1 route");
    expect(index).toContain("· 0 routes");
    expect(index).not.toMatch(/✓|validated\b(?!-)/);
  });

  test("a repository without techniques is skipped; a new record makes the index stale until rebuilt", () => {
    const root = mkdtempSync(join(tmpdir(), "vcr-techniques-index-"));
    expect(techniquesIndexDiagnostics(root)).toEqual([]);
    writeRecord(root, technique("halftone"));
    writeFileSync(join(root, "catalog/techniques/vocabulary.json"), JSON.stringify({ purposes: [], mechanisms: [] }));
    expect(techniquesIndexDiagnostics(root)).toEqual([expect.objectContaining({ file: TECHNIQUES_INDEX_PATH, message: "technique index is stale", suggestion: expect.stringContaining("catalog build") })]);
    expect(writeTechniquesIndex(root, false)).toEqual({ ok: true, value: { wasStale: true, staleFiles: [TECHNIQUES_INDEX_PATH] } });
    expect(readFileSync(join(root, TECHNIQUES_INDEX_PATH), "utf8")).toContain("## techniques (1)");
    expect(techniquesIndexDiagnostics(root)).toEqual([]);
  });
});
