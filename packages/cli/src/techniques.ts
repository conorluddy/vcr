// Technique records (ADR 0010): hand-curated links from a visual technique to the pillar sections
// that own its craft and to the catalogue tools that can execute it. A record stores links only;
// evidence class, tool validation and machine readiness are derived when the record is read.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { EnvironmentRecord } from "./doctor.js";
import { assessReadiness, type Readiness } from "./evidence.js";
import { findPillarRule, readKnowledgeBaseSection, type Pillar, type PillarRule } from "./references.js";
import { listJsonFiles, readJsonFile } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";
import { formatToolEvidence, formatToolReadiness, type ExampleManifest, type ToolSummary } from "./tools.js";
import type { Diagnostic } from "./validate.js";

// === TYPES ===

export interface TechniqueCraftPointer {
  /** Directory under references/: `fx`, `motion-director`. */
  pillar: string;
  /** Knowledge base section as `vcr refs section` takes it: `5.1`, `9c`. */
  section: string;
  rules: string[];
}

export interface TechniqueStep {
  does: string;
  capability: string;
  /** Tools used together in this step; alternatives are separate routes. */
  tools: string[];
  facet?: string;
}

export interface TechniqueRoute {
  id: string;
  one_line: string;
  steps: TechniqueStep[];
  /** A fixture that exercises the whole route and lists it back in its `techniques`. */
  example?: string;
  limits?: string[];
}

export interface Technique {
  id: string;
  name: string;
  one_line: string;
  summary: string;
  purposes: string[];
  mechanisms: string[];
  craft: TechniqueCraftPointer[];
  related?: Array<{ id: string; relation: "contrasts" | "combines" }>;
  routes: TechniqueRoute[];
  checked_at: string | null;
  source: string;
}

export interface TechniqueVocabulary {
  purposes: string[];
  mechanisms: string[];
}

/** How far a route's end-to-end claim is backed. Derived on every read (ADR 0010); never stored. */
export type RouteEvidenceClass = "retained-fixture" | "fixture-reported" | "documented";

export interface RouteEvidence {
  class: RouteEvidenceClass;
  /** The covering example, when the class is not `documented`. */
  example?: string;
  /** Why the route has this class, in one clause. */
  reason: string;
}

export interface TechniqueFilter {
  purpose?: string | undefined;
  mechanism?: string | undefined;
  /** Pillar directory or its start: `fx`, `motion`, `typo`. */
  pillar?: string | undefined;
  capability?: string | undefined;
  tool?: string | undefined;
}

/** What the tool and machine records say about each tool a route names, read when the technique is shown. */
export interface TechniqueReadContext {
  harnessRoot: string;
  tools: ToolSummary[];
  examples: ExampleManifest[];
  machine?: EnvironmentRecord | undefined;
  project?: { cwd: string; stopAt?: string | undefined } | undefined;
  craft?: CraftSources | undefined;
}

/** The pillars as loaded, so a card can say what each craft pointer is about without the reader chasing it. */
export interface CraftSources {
  harnessRoot: string;
  pillars: Pillar[];
  rules: PillarRule[];
}

export const TECHNIQUES_INDEX_PATH = "catalog/TECHNIQUES.md";
export const TECHNIQUES_DIRECTORY = "catalog/techniques";
export const TECHNIQUE_VOCABULARY_PATH = `${TECHNIQUES_DIRECTORY}/vocabulary.json`;

// === PUBLIC API ===

/** Record files only: the vocabulary shares the directory and is not a technique. */
export function listTechniqueFiles(harnessRoot: string): string[] {
  return listJsonFiles(join(harnessRoot, TECHNIQUES_DIRECTORY)).filter((filePath) => basename(filePath) !== "vocabulary.json");
}

export function loadTechniques(harnessRoot: string): Result<Technique[]> {
  const techniques: Technique[] = [];
  for (const filePath of listTechniqueFiles(harnessRoot)) {
    const parsed = readJsonFile<Technique>(filePath);
    if (!parsed.ok) return parsed;
    techniques.push(parsed.value);
  }
  return ok(techniques);
}

/** Every tool a route needs, once each, in step order. */
export function routeTools(route: TechniqueRoute): string[] {
  return [...new Set(route.steps.flatMap((step) => step.tools))];
}

/** How an example names a route in its `techniques`: `<technique>/<route>`. */
export function routeReference(techniqueId: string, routeId: string): string {
  return `${techniqueId}/${routeId}`;
}

export function findTechnique(techniques: Technique[], id: string): Result<Technique> {
  const technique = techniques.find((candidate) => candidate.id === id);
  return technique ? ok(technique) : fail("TECHNIQUE_NOT_FOUND", `No technique with id "${id}". Run "vcr techniques list" to see ids; a technique missing from the list is unmapped, not forbidden.`);
}

export function filterTechniques(techniques: Technique[], filter: TechniqueFilter): Technique[] {
  const pillar = filter.pillar?.toLowerCase().replace(/-$/, "");
  const steps = (technique: Technique) => technique.routes.flatMap((route) => route.steps);
  return techniques.filter((technique) =>
    (!filter.purpose || technique.purposes.includes(filter.purpose))
    && (!filter.mechanism || technique.mechanisms.includes(filter.mechanism))
    && (!pillar || technique.craft.some((pointer) => pointer.pillar.startsWith(pillar)))
    && (!filter.capability || steps(technique).some((step) => step.capability === filter.capability))
    && (!filter.tool || steps(technique).some((step) => step.tools.includes(filter.tool!))));
}

/**
 * A route is only as proven as the one fixture that runs all of it. Tools validated separately do not
 * add up to a validated route, so anything short of a covering, validated, two-way-linked example is `documented`:
 * supported by the tools' own documentation, usable, and not yet run here.
 */
export function deriveRouteEvidence(technique: Technique, route: TechniqueRoute, examples: ExampleManifest[], harnessRoot: string): RouteEvidence {
  const documented = (reason: string): RouteEvidence => ({ class: "documented", reason });
  if (!route.example) return documented("the tools' documentation supports this route; no fixture here has run it end to end");
  const example = examples.find((candidate) => candidate.id === route.example);
  if (!example) return documented(`example ${route.example} is not in this install`);
  if (!(example.techniques ?? []).includes(routeReference(technique.id, route.id))) return documented(`example ${example.id} does not claim this route`);
  if (example.status !== "validated") return documented(`example ${example.id} is ${example.status}`);
  const uncovered = routeTools(route).filter((toolId) => !example.tools.includes(toolId));
  if (uncovered.length > 0) return documented(`example ${example.id} does not use ${uncovered.join(", ")}`);
  const hasRetainedOutputs = existsSync(join(harnessRoot, example.directory, "expected"));
  return hasRetainedOutputs
    ? { class: "retained-fixture", example: example.id, reason: `example ${example.id} runs every tool in the route and checks its output against expected/` }
    : { class: "fixture-reported", example: example.id, reason: `example ${example.id} runs every tool in the route but retains no expected/ outputs` };
}

/** Tier 0 row for `--json`: enough to shortlist, nothing to descend into. */
export function summariseTechnique(technique: Technique) {
  return { id: technique.id, name: technique.name, one_line: technique.one_line, purposes: technique.purposes, mechanisms: technique.mechanisms, pillars: craftPillars(technique), route_count: technique.routes.length };
}

/** The record with everything derived beside it, for `vcr techniques info --json`. */
export function resolveTechnique(technique: Technique, context: TechniqueReadContext) {
  return {
    ...technique,
    craft: technique.craft.map((pointer) => ({ ...pointer, ...(context.craft ? describeCraftPointer(pointer, context.craft) : {}) })),
    routes: technique.routes.map((route) => ({
      ...route,
      evidence: deriveRouteEvidence(technique, route, context.examples, context.harnessRoot),
      tool_status: routeTools(route).map((toolId) => {
        const tool = context.tools.find((candidate) => candidate.id === toolId);
        const readiness: Readiness = assessReadiness(toolId, context.machine);
        return tool ? { id: toolId, tier: tool.tier, validation_status: tool.validation.status, adapter_maturity: tool.adapter_maturity, readiness } : { id: toolId, tier: "unknown", validation_status: "unknown", adapter_maturity: "unknown", readiness };
      }),
    })),
  };
}

/** The filter terms actually in use, so a miss can show what would have matched. */
export function techniqueFilterTerms(techniques: Technique[], vocabulary: TechniqueVocabulary) {
  const steps = techniques.flatMap((technique) => technique.routes.flatMap((route) => route.steps));
  const unique = (values: string[]) => [...new Set(values)].sort();
  return { purpose: vocabulary.purposes, mechanism: vocabulary.mechanisms, pillar: unique(techniques.flatMap(craftPillars)), capability: unique(steps.map((step) => step.capability)), tool: unique(steps.flatMap((step) => step.tools)) };
}

/** Tier 0 as a table: what `vcr techniques list` prints. An empty result lists the terms each filter that was used accepts. */
export function formatTechniqueList(techniques: Technique[], total: number, offset: number, terms?: Partial<ReturnType<typeof techniqueFilterTerms>>): string {
  if (techniques.length === 0) {
    const lines = ["no matching techniques (the index is not a whitelist: an unmapped technique can still be proposed)"];
    for (const [flag, accepted] of Object.entries(terms ?? {})) lines.push(`--${flag} accepts: ${accepted.join(", ")}`);
    return lines.join("\n");
  }
  const width = Math.max(...techniques.map((technique) => technique.id.length));
  const rows = techniques.map((technique) => `${technique.id.padEnd(width)}  ${routeCount(technique).padEnd(8)}  ${technique.one_line}  [${technique.purposes.join(", ")}]`);
  const shown = `${offset + 1}–${offset + techniques.length} of ${total}`;
  return [...rows, "", total > offset + techniques.length ? `${shown}; next page: --offset ${offset + techniques.length}` : shown].join("\n");
}

/** Tier 1: what it is, where its craft lives, and one line per route with its derived evidence class. */
export function formatTechniqueCard(technique: Technique, examples: ExampleManifest[], harnessRoot: string, craft?: CraftSources): string {
  const lines = [`${technique.id} — ${technique.name}`, technique.one_line, "", technique.summary, ""];
  lines.push(`Purposes: ${technique.purposes.join(", ")}`, `Mechanisms: ${technique.mechanisms.join(", ")}`);
  if (technique.related?.length) lines.push(`Related: ${technique.related.map((related) => `${related.id} (${related.relation})`).join(", ")}`);
  lines.push("", "Craft (one at a time):");
  for (const pointer of technique.craft) {
    const described = craft ? describeCraftPointer(pointer, craft) : undefined;
    lines.push(`- vcr refs section ${pointer.pillar} ${pointer.section}${described?.section_title ? `  · ${described.section_title}` : ""}`);
    // The rule's own check line and source strength, read from the pillar now; the record stores only the ID.
    for (const rule of pointer.rules) {
      const gist = described?.rule_gists.find((candidate) => candidate.id === rule);
      lines.push(`  vcr rules info ${rule}${gist ? `  · ${gist.strength}: ${gist.check}` : ""}`);
    }
  }
  lines.push("", "Routes:");
  if (technique.routes.length === 0) lines.push("- none mapped: no catalogue tool is linked to this technique yet. That is a gap, not a verdict; research a route and propose it.");
  for (const route of technique.routes) {
    const evidence = deriveRouteEvidence(technique, route, examples, harnessRoot);
    lines.push(`- ${route.id} [${evidence.class}] — ${route.one_line} · ${routeTools(route).join(", ")}`);
  }
  if (technique.routes.length > 0) lines.push("", `Steps, tool evidence and limits: vcr techniques info ${technique.id} --full`);
  return lines.join("\n");
}

/** Tier 2: each route's steps, with every tool's own validation and this machine's readiness beside it. */
export function formatTechniqueRoutes(technique: Technique, context: TechniqueReadContext): string {
  const sections = technique.routes.map((route) => {
    const evidence = deriveRouteEvidence(technique, route, context.examples, context.harnessRoot);
    const lines = [`Route ${route.id} [${evidence.class}]`, route.one_line, `Route evidence: ${evidence.class}; ${evidence.reason}.`];
    for (const [index, step] of route.steps.entries()) {
      lines.push(`${index + 1}. ${step.does} (${step.capability}${step.facet ? `, facet ${step.facet}` : ""})`);
      for (const toolId of step.tools) lines.push(`   ${toolStatusLine(toolId, context, evidence.example)}`);
    }
    if (route.limits?.length) lines.push("Limits:", ...route.limits.map((limit) => `- ${limit}`));
    if (evidence.example) lines.push(`Fixture: vcr example create ${evidence.example}`);
    return lines.join("\n");
  });
  const tools = [...new Set(technique.routes.flatMap(routeTools))];
  const footer = tools.length > 0
    ? `Next, for one tool: vcr tools info <id> (card, avoid-when and evidence scope), then --full (guide). Tools here: ${tools.join(", ")}.`
    : "";
  return [...sections, footer].filter(Boolean).join("\n\n");
}

/** Tier 0 as Markdown, generated: one line per technique, sized to be read whole. Holds no derived status. */
export function renderTechniquesIndex(techniques: Technique[]): string {
  const sorted = [...techniques].sort((left, right) => left.id.localeCompare(right.id));
  const lines = sorted.map((technique) => `- \`${technique.id}\` — ${technique.one_line} · ${technique.purposes.join(", ")} · ${technique.mechanisms.join(", ")} · ${craftPillars(technique).join(", ")} · ${routeCount(technique)}`);
  return [
    "# VCR technique index",
    "",
    "Tier 0, generated by `vcr catalog build` from `catalog/techniques/`; do not edit. One line per technique: what it looks like · purposes · mechanisms · pillars that own its craft · mapped routes. Pick two or three that contrast, then descend:",
    "",
    "- **Tier 1, card:** `vcr techniques info <id>`. Summary, craft pointers, related techniques, one line per route with its evidence class.",
    "- **Tier 2, routes:** `vcr techniques info <id> --full`. Steps, each tool's own evidence and readiness on this machine, limits. Then one toolkit guide: `vcr tools info <tool> --full`.",
    "",
    "Filter with `vcr techniques list --purpose|--mechanism|--pillar|--capability|--tool`. This index is inspiration, not a whitelist: a technique missing here may still be proposed, and `0 routes` marks a gap, not a verdict. A route's evidence class is derived when you read the card: `documented` (the tools' docs support it; no fixture here has run it; the usual case, and fine to use), `fixture-reported` or `retained-fixture` (a fixture runs the whole route). None is a claim that a tool is installed.",
    "",
    `## techniques (${sorted.length})`,
    "",
    ...lines,
    "",
  ].join("\n");
}

/** Rewrites catalog/TECHNIQUES.md unless `checkOnly`; reports whether it was stale. Repositories with no technique records are skipped. */
export function writeTechniquesIndex(harnessRoot: string, checkOnly: boolean): Result<{ wasStale: boolean; staleFiles: string[] }> {
  const path = join(harnessRoot, TECHNIQUES_INDEX_PATH);
  if (listTechniqueFiles(harnessRoot).length === 0 && !existsSync(path)) return ok({ wasStale: false, staleFiles: [] });
  const techniques = loadTechniques(harnessRoot);
  if (!techniques.ok) return techniques;
  const rendered = renderTechniquesIndex(techniques.value);
  if (existsSync(path) && readFileSync(path, "utf8") === rendered) return ok({ wasStale: false, staleFiles: [] });
  if (!checkOnly) writeFileSync(path, rendered);
  return ok({ wasStale: true, staleFiles: [TECHNIQUES_INDEX_PATH] });
}

export function techniquesIndexDiagnostics(harnessRoot: string): Diagnostic[] {
  const outcome = writeTechniquesIndex(harnessRoot, true);
  if (!outcome.ok) return [{ severity: "error", file: TECHNIQUES_DIRECTORY, path: "", message: outcome.error.message }];
  return outcome.value.staleFiles.map((file): Diagnostic => ({ severity: "error", file, path: "", message: "technique index is stale", suggestion: "Run `pnpm vcr catalog build` and commit the result." }));
}

// === PRIVATE HELPERS ===

function craftPillars(technique: Technique): string[] {
  return [...new Set(technique.craft.map((pointer) => pointer.pillar))];
}

function routeCount(technique: Technique): string {
  return `${technique.routes.length} ${technique.routes.length === 1 ? "route" : "routes"}`;
}

/** A pointer's section heading and each rule's check line and source strength, for display beside the stored IDs. */
function describeCraftPointer(pointer: TechniqueCraftPointer, sources: CraftSources) {
  const section = readKnowledgeBaseSection(sources.harnessRoot, sources.pillars, pointer.pillar, pointer.section);
  const heading = section.ok ? section.value.split("\n")[0]!.replace(/^#+\s+[\w.]+\s+/, "").trim() : undefined;
  const rule_gists = pointer.rules.flatMap((id) => {
    const rule = findPillarRule(sources.rules, id);
    if (!rule.ok) return [];
    // A knowledge-base rule is a candidate nobody checks yet; say so, or a cited ID reads as an enforced limit.
    const strength = `${rule.value.tier.split("(")[0]!.trim()}${rule.value.origin === "knowledge-base" ? ", advisory" : ""}`;
    return [{ id: rule.value.id, strength, check: rule.value.check }];
  });
  return { ...(heading ? { section_title: heading } : {}), rule_gists };
}

function toolStatusLine(toolId: string, context: TechniqueReadContext, routeExample?: string): string {
  const tool = context.tools.find((candidate) => candidate.id === toolId);
  if (!tool) return `${toolId} · not in this catalogue`;
  // On a fixture-backed route, cite the tool's evidence from that fixture, not whichever example ran last.
  const fromRouteFixture = routeExample ? tool.validation.evidence?.filter((entry) => entry.example?.replace(/^examples\//, "") === routeExample).at(-1) : undefined;
  const evidence = fromRouteFixture ? `${tool.validation.status} ${fromRouteFixture.date} (this route's fixture)` : formatToolEvidence(tool);
  return `${toolId} · ${tool.tier} · tool's own evidence: ${evidence} · ${formatToolReadiness(tool, context.machine, context.project)}`;
}
