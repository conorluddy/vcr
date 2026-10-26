import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { join, relative } from "node:path";
import { writeCatalogIndex } from "./catalog.js";
import { listFilesNamed, listJsonFiles, readJsonFile } from "./repository.js";

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

interface ToolRecord {
  id: string;
  capabilities: string[];
}

interface Vocabulary {
  capabilities: string[];
}

// === PUBLIC API ===

/** Validates every catalogue, project, video and reference document against its schema. */
export function validateRepository(repositoryRoot: string): ValidationReport {
  const schemas = loadSchemas(repositoryRoot);
  const diagnostics: Diagnostic[] = [];
  let filesChecked = 0;

  const check = (filePath: string, schemaName: keyof typeof schemas): unknown => {
    filesChecked += 1;
    const parsed = readJsonFile(filePath);
    const displayPath = relative(repositoryRoot, filePath);
    if (!parsed.ok) {
      diagnostics.push({ severity: "error", file: displayPath, path: "", message: parsed.error.message });
      return undefined;
    }
    diagnostics.push(...schemaDiagnostics(schemas[schemaName], parsed.value, displayPath));
    return parsed.value;
  };

  const vocabulary = readJsonFile<Vocabulary>(join(repositoryRoot, "catalog/capabilities/vocabulary.json"));
  const knownCapabilities = new Set(vocabulary.ok ? vocabulary.value.capabilities : []);
  if (!vocabulary.ok) diagnostics.push({ severity: "error", file: "catalog/capabilities/vocabulary.json", path: "", message: vocabulary.error.message });

  for (const recordPath of listJsonFiles(join(repositoryRoot, "catalog/tools"))) {
    const record = check(recordPath, "toolRecord") as ToolRecord | undefined;
    if (record?.capabilities) diagnostics.push(...capabilityDiagnostics(record, knownCapabilities, relative(repositoryRoot, recordPath)));
  }
  check(join(repositoryRoot, "catalog/tools.json"), "tool");
  diagnostics.push(...indexFreshnessDiagnostics(repositoryRoot));
  for (const projectPath of listFilesNamed(join(repositoryRoot, "projects"), "project.json")) check(projectPath, "project");
  for (const referencePath of listJsonFiles(join(repositoryRoot, "references"))) check(referencePath, "reference");
  for (const environmentPath of listJsonFiles(join(repositoryRoot, "environment"))) check(environmentPath, "environment");

  return { filesChecked, diagnostics };
}

export function hasErrors(report: ValidationReport): boolean {
  return report.diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

// === PRIVATE HELPERS ===

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
    project: ajv.compile(load("project")),
    reference: ajv.compile(load("reference")),
    environment: ajv.compile(load("environment")),
  };
}

/** The committed index must match what `vcr catalog build` produces from the per-tool files. */
function indexFreshnessDiagnostics(repositoryRoot: string): Diagnostic[] {
  const outcome = writeCatalogIndex(repositoryRoot, true);
  if (!outcome.ok) return [{ severity: "error", file: "catalog/tools", path: "", message: outcome.error.message }];
  if (!outcome.value.wasStale) return [];
  return [{ severity: "error", file: "catalog/tools.json", path: "", message: "index is stale", suggestion: "Run `pnpm vcr catalog build` and commit the result." }];
}

function schemaDiagnostics(validator: ValidateFunction, document: unknown, file: string): Diagnostic[] {
  if (validator(document)) return unknownFieldDiagnostics(validator.schema, document, file);
  return (validator.errors ?? []).map((error) => ({
    severity: "error" as const,
    file,
    path: error.instancePath || "/",
    message: error.message ?? "schema violation",
    suggestion: error.keyword === "enum" ? `Allowed: ${JSON.stringify(error.params["allowedValues"])}` : undefined,
  }));
}

/** PRD §8: unknown fields produce diagnostics rather than silently disappearing. */
function unknownFieldDiagnostics(schema: unknown, document: unknown, file: string): Diagnostic[] {
  const properties = (schema as { properties?: Record<string, unknown> }).properties;
  if (!properties || typeof document !== "object" || document === null) return [];
  return Object.keys(document)
    .filter((key) => !(key in properties))
    .map((key) => ({ severity: "warning" as const, file, path: `/${key}`, message: `unknown field "${key}"`, suggestion: "Add it to the schema or remove it." }));
}

function capabilityDiagnostics(record: ToolRecord, knownCapabilities: Set<string>, file: string): Diagnostic[] {
  return record.capabilities
    .filter((capability) => !knownCapabilities.has(capability))
    .map((capability) => ({
      severity: "error" as const,
      file,
      path: "/capabilities",
      message: `capability "${capability}" is not in catalog/capabilities/vocabulary.json`,
      suggestion: "Use an existing capability or add it to the vocabulary in the same change.",
    }));
}
