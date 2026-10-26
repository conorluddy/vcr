import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
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

interface ToolRegistry {
  resources: ToolRecord[];
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

  for (const registryPath of toolRegistryPaths(repositoryRoot)) {
    const registry = check(registryPath, "tool") as ToolRegistry | undefined;
    if (registry?.resources) diagnostics.push(...capabilityDiagnostics(registry.resources, knownCapabilities, relative(repositoryRoot, registryPath)));
  }
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
  const compile = (name: string): ValidateFunction => {
    const schema = readJsonFile(join(repositoryRoot, `catalog/schemas/${name}.schema.json`));
    if (!schema.ok) throw new Error(schema.error.message);
    return ajv.compile(schema.value as object);
  };
  return { tool: compile("tool"), project: compile("project"), reference: compile("reference"), environment: compile("environment") };
}

/** The monolithic registry today; per-tool files under catalog/tools/ once the catalogue is split. */
function toolRegistryPaths(repositoryRoot: string): string[] {
  const perToolDirectory = join(repositoryRoot, "catalog/tools");
  const monolith = join(repositoryRoot, "catalog/tools.json");
  return [...(existsSync(monolith) ? [monolith] : []), ...listJsonFiles(perToolDirectory)];
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

function capabilityDiagnostics(resources: ToolRecord[], knownCapabilities: Set<string>, file: string): Diagnostic[] {
  return resources.flatMap((resource) =>
    resource.capabilities
      .filter((capability) => !knownCapabilities.has(capability))
      .map((capability) => ({
        severity: "error" as const,
        file,
        path: `/resources/${resource.id}/capabilities`,
        message: `capability "${capability}" is not in catalog/capabilities/vocabulary.json`,
        suggestion: "Use an existing capability or add it to the vocabulary in the same change.",
      })),
  );
}
