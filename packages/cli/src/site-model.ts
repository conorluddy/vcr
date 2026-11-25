// The public catalogue site's data: tools, techniques, pillars and rules joined once, with machine
// facts (hostnames, output hashes, local commands) left out. Everything the pages show comes from here.
import { join } from "node:path";
import { loadPillarRules, loadPillars, type PillarRule } from "./references.js";
import { readJsonFile } from "./repository.js";
import { ok, type Result } from "./result.types.js";
import { deriveRouteEvidence, loadTechniques, type RouteEvidenceClass, type Technique } from "./techniques.js";
import { loadExamples, loadTools, type ExampleManifest, type ToolSummary } from "./tools.js";

// === TYPES ===

/** Evidence as the site shows it: what was run and how far it reaches, never which machine ran it. */
export interface SiteEvidence {
  date: string;
  version?: string;
  example?: string;
  scope?: string;
}

export interface SiteTool {
  id: string;
  name: string;
  category: string;
  tier: string;
  role: string;
  summary?: string;
  useWhen: string[];
  avoidWhen: string[];
  pairsWith: string[];
  capabilities: string[];
  license?: string;
  officialUrl: string;
  repositoryUrl?: string;
  validationStatus: string;
  documentationStatus: string;
  /** Repository path of the toolkit guide, when one is written. */
  guidePath?: string;
  evidence: SiteEvidence[];
  examples: Array<{ id: string; title: string; status: string; directory: string }>;
  /** Tools whose `pairs_with` names this one. */
  pairedBy: string[];
  /** Techniques with a route through this tool. */
  techniques: string[];
}

export interface SiteRoute {
  id: string;
  oneLine: string;
  steps: Array<{ does: string; capability: string; tools: string[] }>;
  limits: string[];
  evidence: { class: RouteEvidenceClass; example?: string; reason: string };
}

export interface SiteTechnique {
  id: string;
  name: string;
  oneLine: string;
  summary: string;
  purposes: string[];
  mechanisms: string[];
  craft: Array<{ pillar: string; section: string; rules: Array<{ id: string; check?: string }> }>;
  related: Array<{ id: string; relation: "contrasts" | "combines" }>;
  routes: SiteRoute[];
}

export interface SiteModel {
  tools: SiteTool[];
  techniques: SiteTechnique[];
  capabilities: string[];
  /** Pillar directory → human name, for the pillars techniques draw on. */
  pillarNames: Record<string, string>;
}

/** Tools nearly every chain ends in. Drawn as badges, not nodes, so they do not swamp a graph. */
export const INFRASTRUCTURE_TOOLS = ["ffmpeg-ffprobe", "playwright"] as const;

// === PUBLIC API ===

export function buildSiteModel(harnessRoot: string): Result<SiteModel> {
  const tools = loadTools(harnessRoot);
  if (!tools.ok) return tools;
  const examples = loadExamples(harnessRoot);
  if (!examples.ok) return examples;
  const techniques = loadTechniques(harnessRoot);
  if (!techniques.ok) return techniques;
  const pillars = loadPillars(harnessRoot);
  if (!pillars.ok) return pillars;
  const vocabulary = readJsonFile<{ capabilities: string[] }>(join(harnessRoot, "catalog/capabilities/vocabulary.json"));
  if (!vocabulary.ok) return vocabulary;

  const rules = loadPillarRules(harnessRoot, pillars.value);
  const sortedTools = [...tools.value].sort((left, right) => left.id.localeCompare(right.id));
  const sortedTechniques = [...techniques.value].sort((left, right) => left.name.localeCompare(right.name));
  return ok({
    tools: sortedTools.map((tool) => toSiteTool(tool, sortedTools, examples.value, sortedTechniques)),
    techniques: sortedTechniques.map((technique) => toSiteTechnique(technique, examples.value, rules, harnessRoot)),
    capabilities: [...vocabulary.value.capabilities].sort(),
    pillarNames: Object.fromEntries(pillars.value.map((pillar) => [pillar.slug, pillar.name])),
  });
}

export function isInfrastructureTool(toolId: string): boolean {
  return (INFRASTRUCTURE_TOOLS as readonly string[]).includes(toolId);
}

// === PRIVATE HELPERS ===

function toSiteTool(tool: ToolSummary, allTools: ToolSummary[], examples: ExampleManifest[], techniques: Technique[]): SiteTool {
  const repositoryUrl = tool.repository_url
    ?? tool.official_url.match(/^https:\/\/github\.com\/[^/?#]+\/[^/?#]+/)?.[0];
  return {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    tier: tool.tier,
    role: tool.role,
    ...(tool.summary ? { summary: tool.summary } : {}),
    useWhen: tool.use_when ?? [],
    avoidWhen: tool.avoid_when ?? [],
    pairsWith: tool.pairs_with ?? [],
    capabilities: tool.capabilities,
    ...(tool.license ? { license: tool.license } : {}),
    officialUrl: tool.official_url,
    ...(repositoryUrl ? { repositoryUrl } : {}),
    validationStatus: tool.validation.status,
    documentationStatus: String(tool.documentation_status ?? "unknown"),
    ...(tool.skill ? { guidePath: tool.skill } : {}),
    evidence: (tool.validation.evidence ?? []).map(toSiteEvidence),
    examples: examples.filter((example) => example.tools.includes(tool.id)).map((example) => ({ id: example.id, title: example.title, status: example.status, directory: example.directory })),
    pairedBy: allTools.filter((other) => other.pairs_with?.includes(tool.id)).map((other) => other.id),
    techniques: techniques.filter((technique) => technique.routes.some((route) => route.steps.some((step) => step.tools.includes(tool.id)))).map((technique) => technique.id),
  };
}

/** An allowlist, so a field added to evidence later stays off the public site until chosen. */
function toSiteEvidence(entry: { date: string; version?: string; example?: string; scope?: string }): SiteEvidence {
  return {
    date: entry.date,
    ...(entry.version ? { version: entry.version } : {}),
    ...(entry.example ? { example: entry.example } : {}),
    ...(entry.scope ? { scope: entry.scope } : {}),
  };
}

function toSiteTechnique(technique: Technique, examples: ExampleManifest[], rules: PillarRule[], harnessRoot: string): SiteTechnique {
  return {
    id: technique.id,
    name: technique.name,
    oneLine: technique.one_line,
    summary: technique.summary,
    purposes: technique.purposes,
    mechanisms: technique.mechanisms,
    craft: technique.craft.map((pointer) => ({
      pillar: pointer.pillar,
      section: pointer.section,
      rules: pointer.rules.map((ruleId) => {
        const check = rules.find((rule) => rule.id === ruleId)?.check;
        return check ? { id: ruleId, check } : { id: ruleId };
      }),
    })),
    related: technique.related ?? [],
    routes: technique.routes.map((route) => {
      const evidence = deriveRouteEvidence(technique, route, examples, harnessRoot);
      return {
        id: route.id,
        oneLine: route.one_line,
        steps: route.steps.map((step) => ({ does: step.does, capability: step.capability, tools: step.tools })),
        limits: route.limits ?? [],
        evidence: { class: evidence.class, ...(evidence.example ? { example: evidence.example } : {}), reason: evidence.reason },
      };
    }),
  };
}
