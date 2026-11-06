import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { writeCatalogIndex } from "./catalog.js";
import { listFilesNamed, listJsonFiles, readJsonFile } from "./repository.js";
import { WORKSPACE_MARKER } from "./roots.js";
import type { ExampleManifest, ToolSummary } from "./tools.js";
import { versionScope } from "./evidence.js";
import { TYPOGRAPHY_RULES_PATH, typographyRuleDiagnostics } from "./typography-rules.js";
import { referencesIndexDiagnostics } from "./references.js";

// === TYPES ===

export type DiagnosticSeverity = "error" | "warning";

export interface Diagnostic {
  severity: DiagnosticSeverity;
  file: string;
  path: string;
  message: string;
  suggestion?: string | undefined;
}

export interface ValidationReport {
  filesChecked: number;
  diagnostics: Diagnostic[];
}

interface Vocabulary {
  capabilities: string[];
}

// === BUDGETS ===

/** Byte budgets for the tiers an agent reads whole. */
export const BUDGET_BYTES = { indexMarkdown: 16 * 1024, skill: 12 * 1024 } as const;

/** Evidence dated on or after this day must record an exact version and a scope; older entries are historical and only warn. */
export const EXACT_EVIDENCE_FROM = "2026-11-05";
/** Tiers that must carry a tier 1 card. Every core and catalogued record carries a card since the assessment pass. */
const CARD_REQUIRED_TIERS = new Set(["core", "catalogued"]);
const CARD_MISSING_SEVERITY: DiagnosticSeverity = "error";

// === PUBLIC API ===

/** Validates every catalogue, example, project, reference and environment document, plus cross-references and budgets. Dev mode only. */
export function validateRepository(repositoryRoot: string): ValidationReport {
  const { check, diagnostics, report } = createChecker(loadSchemas(repositoryRoot), repositoryRoot);

  const vocabulary = readJsonFile<Vocabulary>(join(repositoryRoot, "catalog/capabilities/vocabulary.json"));
  const knownCapabilities = new Set(vocabulary.ok ? vocabulary.value.capabilities : []);
  if (!vocabulary.ok) diagnostics.push({ severity: "error", file: "catalog/capabilities/vocabulary.json", path: "", message: vocabulary.error.message });

  const tools = new Map<string, { record: ToolSummary; file: string }>();
  let validToolRecords = true;
  for (const recordPath of listJsonFiles(join(repositoryRoot, "catalog/tools"))) {
    const record = check(recordPath, "toolRecord") as ToolSummary | undefined;
    if (record?.id) tools.set(record.id, { record, file: relative(repositoryRoot, recordPath) });
    else validToolRecords = false;
  }

  const examples = new Map<string, { manifest: ExampleManifest; file: string }>();
  for (const manifestPath of listFilesNamed(join(repositoryRoot, "examples"), "example.json")) {
    const manifest = check(manifestPath, "example") as ExampleManifest | undefined;
    if (manifest?.id) examples.set(manifest.id, { manifest: { ...manifest, directory: relative(repositoryRoot, join(manifestPath, "..")) }, file: relative(repositoryRoot, manifestPath) });
  }

  for (const { record, file } of tools.values()) {
    diagnostics.push(...capabilityDiagnostics(record, knownCapabilities, file));
    diagnostics.push(...toolReferenceDiagnostics(record, file, tools, examples, repositoryRoot));
    diagnostics.push(...cardDiagnostics(record, file));
  }
  for (const { manifest, file } of examples.values()) diagnostics.push(...exampleDiagnostics(manifest, file, tools, repositoryRoot));

  check(join(repositoryRoot, "catalog/tools.json"), "tool");
  if (validToolRecords) diagnostics.push(...indexFreshnessDiagnostics(repositoryRoot));
  diagnostics.push(...budgetDiagnostics(repositoryRoot, "catalog/INDEX.md", BUDGET_BYTES.indexMarkdown));
  diagnostics.push(...budgetDiagnostics(repositoryRoot, "catalog/CANDIDATES.md", BUDGET_BYTES.indexMarkdown));

  const typographyRulesPath = join(repositoryRoot, TYPOGRAPHY_RULES_PATH);
  if (existsSync(typographyRulesPath) && check(typographyRulesPath, "typographyRules")) diagnostics.push(...typographyRuleDiagnostics(repositoryRoot));
  diagnostics.push(...referencesIndexDiagnostics(repositoryRoot));

  checkWorkspaceDocuments(check, repositoryRoot);
  for (const environmentPath of listJsonFiles(join(repositoryRoot, "environment"))) check(environmentPath, "environment");

  return report();
}

/** Validates a workspace outside the harness: its marker, projects and references, against the harness schemas. */
export function validateWorkspace(harnessRoot: string, workspaceRoot: string): ValidationReport {
  const { check, report } = createChecker(loadSchemas(harnessRoot), workspaceRoot);
  checkWorkspaceDocuments(check, workspaceRoot);
  return report();
}

export function hasErrors(report: ValidationReport): boolean {
  return report.diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

// === PRIVATE HELPERS ===

type Schemas = ReturnType<typeof loadSchemas>;
type Check = (filePath: string, schemaName: keyof Schemas) => unknown;

/** Parses and schema-checks one file at a time, collecting diagnostics relative to `displayRoot`. Returns the document when valid. */
function createChecker(schemas: Schemas, displayRoot: string) {
  const diagnostics: Diagnostic[] = [];
  let filesChecked = 0;
  const check: Check = (filePath, schemaName) => {
    filesChecked += 1;
    const parsed = readJsonFile(filePath);
    const displayPath = relative(displayRoot, filePath);
    if (!parsed.ok) {
      diagnostics.push({ severity: "error", file: displayPath, path: "", message: parsed.error.message });
      return undefined;
    }
    const issues = schemaDiagnostics(schemas[schemaName], parsed.value, displayPath);
    diagnostics.push(...issues);
    if (issues.some((issue) => issue.severity === "error")) return undefined;
    return parsed.value;
  };
  return { check, diagnostics, report: (): ValidationReport => ({ filesChecked, diagnostics }) };
}

function checkWorkspaceDocuments(check: Check, workspaceRoot: string): void {
  const markerPath = join(workspaceRoot, WORKSPACE_MARKER);
  if (existsSync(markerPath)) check(markerPath, "workspace");
  for (const projectPath of listFilesNamed(join(workspaceRoot, "projects"), "project.json")) check(projectPath, "project");
  for (const referencePath of listJsonFiles(join(workspaceRoot, "references"))) check(referencePath, "reference");
}

function loadSchemas(repositoryRoot: string) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats.default(ajv);
  const load = (name: string): object => {
    const schema = readJsonFile(join(repositoryRoot, `catalog/schemas/${name}.schema.json`));
    if (!schema.ok) throw new Error(schema.error.message);
    return schema.value as object;
  };
  const toolRecordSchema = load("tool-record");
  ajv.addSchema(toolRecordSchema);
  return {
    toolRecord: ajv.compile(toolRecordSchema),
    tool: ajv.compile(load("tool")),
    example: ajv.compile(load("example")),
    project: ajv.compile(load("project")),
    reference: ajv.compile(load("reference")),
    environment: ajv.compile(load("environment")),
    workspace: ajv.compile(load("workspace")),
    typographyRules: ajv.compile(load("typography-rules")),
  };
}

/** The committed index files must match what `vcr catalog build` produces from the per-tool files. */
function indexFreshnessDiagnostics(repositoryRoot: string): Diagnostic[] {
  const outcome = writeCatalogIndex(repositoryRoot, true);
  if (!outcome.ok) return [{ severity: "error", file: "catalog/tools", path: "", message: outcome.error.message }];
  return outcome.value.staleFiles.map((file) => ({ severity: "error" as const, file, path: "", message: "index is stale", suggestion: "Run `pnpm vcr catalog build` and commit the result." }));
}

function budgetDiagnostics(repositoryRoot: string, relativePath: string, maxBytes: number): Diagnostic[] {
  const absolutePath = join(repositoryRoot, relativePath);
  if (!existsSync(absolutePath)) return [];
  const size = statSync(absolutePath).size;
  if (size <= maxBytes) return [];
  return [{ severity: "error", file: relativePath, path: "", message: `${size} bytes exceeds the ${maxBytes} byte budget for a tier read whole`, suggestion: "Shorten one-liners, or move detail to the next tier down." }];
}

function schemaDiagnostics(validator: ValidateFunction, document: unknown, file: string): Diagnostic[] {
  if (validator(document)) return unknownFieldDiagnostics(validator.schema, document, file);
  return (validator.errors ?? []).map((error) => ({
    severity: "error" as const,
    file,
    path: error.instancePath || "/",
    message: error.message ?? "schema violation",
    suggestion: suggestionFor(error.keyword, error.params),
  }));
}

function suggestionFor(keyword: string, params: Record<string, unknown>): string | undefined {
  if (keyword === "enum") return `Allowed: ${JSON.stringify(params["allowedValues"])}`;
  if (keyword === "maxLength") return `Budget is ${String(params["limit"])} characters; move detail to the next tier down.`;
  if (keyword === "maxItems") return `At most ${String(params["limit"])} items; keep the strongest.`;
  return undefined;
}

/** PRD §8: unknown fields produce diagnostics rather than silently disappearing. */
function unknownFieldDiagnostics(schema: unknown, document: unknown, file: string): Diagnostic[] {
  const properties = (schema as { properties?: Record<string, unknown> }).properties;
  if (!properties || typeof document !== "object" || document === null) return [];
  return Object.keys(document)
    .filter((key) => !(key in properties))
    .map((key) => ({ severity: "warning" as const, file, path: `/${key}`, message: `unknown field "${key}"`, suggestion: "Add it to the schema or remove it." }));
}

function capabilityDiagnostics(record: ToolSummary, knownCapabilities: Set<string>, file: string): Diagnostic[] {
  return (record.capabilities ?? [])
    .filter((capability) => !knownCapabilities.has(capability))
    .map((capability) => ({
      severity: "error" as const,
      file,
      path: "/capabilities",
      message: `capability "${capability}" is not in catalog/capabilities/vocabulary.json`,
      suggestion: "Use an existing capability or add it to the vocabulary in the same change.",
    }));
}

/**
 * Scope match at tool level (G0 reopen condition 1, until operations exist): the run must belong to the
 * cited example, and a fixture that keeps no expected/ outputs can only back a fixture-reported claim.
 * Entries before EXACT_EVIDENCE_FROM are history, so they warn instead of failing.
 */
function scopeMatchDiagnostics(evidence: { command?: string; scope?: string }, exampleId: string, path: string, file: string, isNew: boolean, repositoryRoot: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const exampleDirectory = `examples/${exampleId}/`;
  if (evidence.command && !evidence.command.startsWith(exampleDirectory)) {
    diagnostics.push({ severity: "error", file, path: `${path}/command`, message: `command "${evidence.command}" does not run the cited example ${exampleDirectory}`, suggestion: "Cite the example whose run produced this result, or record the command under it." });
  }
  const hasRetainedOutputs = existsSync(join(repositoryRoot, exampleDirectory, "expected"));
  if (!hasRetainedOutputs && !/fixture-reported/i.test(evidence.scope ?? "")) {
    diagnostics.push({ severity: isNew ? "error" : "warning", file, path: `${path}/scope`, message: `${exampleDirectory} keeps no expected/ outputs, but the scope does not say the claim is fixture-reported`, suggestion: "Say \"Fixture-reported\" in the scope, or retain the outputs under expected/ and diff them in run.sh." });
  }
  return diagnostics;
}

/** Every pointer from a record to a neighbour, a skill, an example or a skill section must resolve. */
function toolReferenceDiagnostics(record: ToolSummary, file: string, tools: Map<string, unknown>, examples: Map<string, { manifest: ExampleManifest }>, repositoryRoot: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const error = (path: string, message: string, suggestion: string) => diagnostics.push({ severity: "error", file, path, message, suggestion });

  for (const neighbour of record.pairs_with ?? []) {
    if (!tools.has(neighbour)) error("/pairs_with", `"${neighbour}" is not a catalogued tool id`, "Use an id from catalog/tools/ or drop it.");
  }
  for (const exampleId of record.examples ?? []) {
    const example = examples.get(exampleId);
    if (!example) error("/examples", `example "${exampleId}" has no examples/<dir>/example.json`, "Add the manifest or remove the reference.");
    else if (!example.manifest.tools.includes(record.id)) error("/examples", `example "${exampleId}" does not list ${record.id} in its tools`, "Add the tool to the example manifest so the link is two-way.");
  }
  const evidenceEntries = record.validation.evidence ?? [];
  for (const [index, evidence] of evidenceEntries.entries()) {
    const scope = versionScope(evidence.version);
    const isNew = typeof evidence.date === "string" && evidence.date >= EXACT_EVIDENCE_FROM;
    if (isNew && (scope === "inexact" || scope === "unknown")) {
      error(`/validation/evidence/${index}/version`, `evidence from ${EXACT_EVIDENCE_FROM} on must record the exact version that ran, not "${evidence.version ?? ""}"`, "Record the version the run reported, e.g. 8.0.1 or Chromium 156.0.8078.4; use n/a only for platform features.");
    }
    // Only the latest entry is what cards show; appending an exact entry clears the warning without editing history.
    if (!isNew && index === evidenceEntries.length - 1 && (scope === "inexact" || scope === "unknown")) {
      diagnostics.push({ severity: "warning", file, path: `/validation/evidence/${index}/version`, message: scope === "inexact" ? `evidence version "${evidence.version ?? ""}" is a range, not the version that ran` : `evidence version "${evidence.version ?? ""}" does not identify what ran`, suggestion: "Leave this entry as is; when re-validating, append a new evidence entry with the exact version and a scope (see catalog/FIXTURE-EVIDENCE-TEMPLATE.md)." });
    }
    // The schema already requires date and version; scope is checked here so old entries get the backfill hint.
    if (!(typeof evidence.scope === "string" && evidence.scope.trim())) {
      error(`/validation/evidence/${index}/scope`, "every evidence entry must set scope", "Say in one line what the run proves and what it does not; for an old entry, start it `Backfilled <YYYY-MM-DD>:` (catalog/FIXTURE-EVIDENCE-TEMPLATE.md).");
    }
    if (!evidence.example) continue;
    // Existing evidence records use repository-relative paths; cards use bare example ids.
    const exampleId = evidence.example.replace(/^examples\//, "");
    const example = examples.get(exampleId);
    if (!example) error(`/validation/evidence/${index}/example`, `evidence example "${evidence.example}" does not exist`, "Point at an existing example id or examples/<id> path.");
    else if (!example.manifest.tools.includes(record.id)) error(`/validation/evidence/${index}/example`, `evidence example "${evidence.example}" does not list ${record.id}`, "Use an example that demonstrates this tool.");
    else diagnostics.push(...scopeMatchDiagnostics(evidence, exampleId, `/validation/evidence/${index}`, file, isNew, repositoryRoot));
  }
  let skillText: string | null = null;
  if (record.skill) {
    const skillPath = join(repositoryRoot, record.skill);
    if (!existsSync(skillPath)) error("/skill", `${record.skill} does not exist`, "Write the SKILL.md or remove the reference.");
    else {
      skillText = readFileSync(skillPath, "utf8");
      diagnostics.push(...budgetDiagnostics(repositoryRoot, record.skill, BUDGET_BYTES.skill));
    }
  }
  if ((record.documentation_status === "skill-written" || record.documentation_status === "skill-verified") && !record.skill) {
    error("/skill", `documentation_status is ${String(record.documentation_status)} but no skill path is set`, "Set skill to skills/<id>/SKILL.md.");
  }
  for (const facet of record.facets ?? []) {
    if (record.tier !== "core") error("/facets", "facets are reserved for the core tier", "Remove facets or promote the tool.");
    if (facet.skill_section && skillText && !hasHeading(skillText, facet.skill_section)) error(`/facets/${facet.id}`, `no heading "${facet.skill_section}" in ${record.skill ?? "the skill"}`, "Match the heading text exactly or add the section.");
    if (facet.example && !examples.has(facet.example)) error(`/facets/${facet.id}`, `example "${facet.example}" does not exist`, "Point at an examples/<dir>/example.json id.");
  }
  return diagnostics;
}

function cardDiagnostics(record: ToolSummary, file: string): Diagnostic[] {
  if (!CARD_REQUIRED_TIERS.has(record.tier)) return [];
  const missing = (["summary", "use_when", "avoid_when"] as const).filter((field) => !record[field] || (Array.isArray(record[field]) && record[field].length === 0));
  if (missing.length === 0) return [];
  return [{ severity: CARD_MISSING_SEVERITY, file, path: "/", message: `${record.tier} record has no tier 1 card: missing ${missing.join(", ")}`, suggestion: "Add summary, use_when and avoid_when, or demote to candidate." }];
}

function exampleDiagnostics(manifest: ExampleManifest, file: string, tools: Map<string, { record: ToolSummary }>, repositoryRoot: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const error = (path: string, message: string, suggestion: string) => diagnostics.push({ severity: "error", file, path, message, suggestion });
  const expectedDirectory = `examples/${manifest.id}`;
  if (manifest.directory !== expectedDirectory) error("/id", `manifest lives in ${manifest.directory} but its id says ${expectedDirectory}`, "Rename the directory or the id.");
  const runScript = manifest.run.replace(/^\.\//, "").split(" ")[0] ?? "";
  if (!existsSync(join(repositoryRoot, manifest.directory, runScript))) error("/run", `${runScript} not found in ${manifest.directory}`, "Point run at the reproduction script.");
  for (const toolId of manifest.tools) {
    const tool = tools.get(toolId);
    if (!tool) error("/tools", `"${toolId}" is not a catalogued tool id`, "Use an id from catalog/tools/.");
    else if (!(tool.record.examples ?? []).includes(manifest.id)) error("/tools", `${toolId} does not list this example in its examples`, `Add "${manifest.id}" to catalog/tools/${toolId}.json examples.`);
  }
  if (manifest.report && !existsSync(join(repositoryRoot, manifest.report))) error("/report", `${manifest.report} does not exist`, "Fix the path or remove it.");
  return diagnostics;
}

function hasHeading(markdown: string, heading: string): boolean {
  return markdown.split("\n").some((line) => /^#{1,6}\s/.test(line) && line.replace(/^#{1,6}\s+/, "").trim() === heading.trim());
}
