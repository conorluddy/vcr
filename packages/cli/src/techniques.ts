// Technique records (ADR 0010): hand-curated links from a visual technique to the pillar sections
// that own its craft and to the catalogue tools that can execute it. A record stores links only;
// evidence class, tool validation and machine readiness are derived when the record is read.
import { basename, join } from "node:path";
import { listJsonFiles, readJsonFile } from "./repository.js";
import { ok, type Result } from "./result.types.js";

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
