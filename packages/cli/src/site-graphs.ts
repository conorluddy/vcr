// Graphs for the catalogue site, laid out at build time and written as plain SVG: they read without
// JavaScript, and the site script only adds highlighting. Layouts are deterministic, so a rebuild of
// the same data produces the same file.
import { isInfrastructureTool, type SiteModel, type SiteTechnique, type SiteTool } from "./site-model.js";
import type { RouteEvidenceClass } from "./techniques.js";

// === TYPES ===

interface MapNode {
  key: string;
  label: string;
  href: string;
  y: number;
}

/** Strongest first: a technique–tool edge takes the best class among the routes that join them. */
const EVIDENCE_ORDER: RouteEvidenceClass[] = ["retained-fixture", "fixture-reported", "documented"];
const NEIGHBOUR_LIMIT = 20;

// === PUBLIC API ===

/**
 * The technique map (ADR 0010 drawn): craft pillars on the left, techniques in the middle, the tools
 * their routes run through on the right. Rows are ordered to reduce crossings.
 */
export function renderTechniqueMap(model: SiteModel, base: string, repositoryUrl: string): string {
  const techniques = model.techniques;
  const pillars = [...new Set(techniques.flatMap((technique) => technique.craft.map((pointer) => pointer.pillar)))];
  const tools = [...new Set(techniques.flatMap((technique) => technique.routes.flatMap((route) => route.steps.flatMap((step) => step.tools))))];
  const craftEdges = techniques.flatMap((technique) => technique.craft.map((pointer) => ({ pillar: pointer.pillar, technique: technique.id })));
  const toolEdges = techniqueToolEdges(techniques);

  const order = orderColumns(pillars, techniques.map((technique) => technique.id), tools, craftEdges, toolEdges);
  const rowHeight = 30;
  const height = order.techniques.length * rowHeight + 40;
  const spread = (count: number, index: number) => 20 + ((index + 0.5) * (height - 40)) / count;
  const columnX = { pillar: 210, technique: 470, tool: 730 };
  const techniqueHalfWidth = 112;

  const techniqueById = new Map(techniques.map((technique) => [technique.id, technique]));
  const pillarNodes: MapNode[] = order.pillars.map((pillar, index) => ({ key: `pillar:${pillar}`, label: model.pillarNames[pillar] ?? pillar, href: `${repositoryUrl}/tree/main/references/${pillar}`, y: spread(order.pillars.length, index) }));
  const techniqueNodes: MapNode[] = order.techniques.map((id, index) => ({ key: `technique:${id}`, label: techniqueById.get(id)!.name, href: `${base}techniques/${id}.html`, y: spread(order.techniques.length, index) }));
  const toolNodes: MapNode[] = order.tools.map((id, index) => ({ key: `tool:${id}`, label: model.tools.find((tool) => tool.id === id)?.name ?? id, href: `${base}tools/${id}.html`, y: spread(order.tools.length, index) }));
  const yOf = (key: string) => [...pillarNodes, ...techniqueNodes, ...toolNodes].find((node) => node.key === key)!.y;

  const edges = [
    ...craftEdges.map((edge) => curve(`pillar:${edge.pillar}`, `technique:${edge.technique}`, columnX.pillar + 8, yOf(`pillar:${edge.pillar}`), columnX.technique - techniqueHalfWidth, yOf(`technique:${edge.technique}`), "edge edge-craft")),
    ...toolEdges.map((edge) => curve(`technique:${edge.technique}`, `tool:${edge.tool}`, columnX.technique + techniqueHalfWidth, yOf(`technique:${edge.technique}`), columnX.tool - 8, yOf(`tool:${edge.tool}`), `edge edge-${edge.evidence}`)),
  ];
  const nodes = [
    ...pillarNodes.map((node) => mapNode(node, columnX.pillar, "end", "node-pillar", true)),
    ...techniqueNodes.map((node) => mapNode(node, columnX.technique, "middle", "node-technique", false)),
    ...toolNodes.map((node) => mapNode(node, columnX.tool, "start", "node-tool", false)),
  ];
  const headings = [["Craft pillar", columnX.pillar, "end"], ["Technique", columnX.technique, "middle"], ["Tool", columnX.tool, "start"]]
    .map(([label, x, anchor]) => `<text class="column-heading" x="${x}" y="8" text-anchor="${anchor}">${label}</text>`).join("");
  return `<svg class="graph technique-map" viewBox="0 -12 940 ${height + 12}" role="group" aria-label="Technique map: ${pillars.length} craft pillars, ${techniques.length} techniques and ${tools.length} tools">${headings}<g class="edges">${edges.join("")}</g><g class="nodes">${nodes.join("")}</g></svg>`;
}

/** Techniques that combine with or contrast against each other, on a circle. */
export function renderRelatedNetwork(model: SiteModel, base: string): string {
  const techniques = orderAroundCircle(model.techniques);
  const size = { width: 900, height: 760 };
  const centre = { x: size.width / 2, y: size.height / 2 };
  const radius = 220;
  const position = new Map(techniques.map((technique, index) => {
    const angle = (index / techniques.length) * Math.PI * 2 - Math.PI / 2;
    return [technique.id, { x: centre.x + radius * Math.cos(angle), y: centre.y + radius * Math.sin(angle), angle }];
  }));
  const seen = new Set<string>();
  const chords: string[] = [];
  for (const technique of techniques) {
    for (const link of technique.related) {
      const pair = [technique.id, link.id].sort().join("|");
      const target = position.get(link.id);
      if (seen.has(pair) || !target) continue;
      seen.add(pair);
      const source = position.get(technique.id)!;
      // Halfway between the chord's midpoint and the centre: neighbours bow gently, opposites run nearly straight.
      const control = { x: centre.x + (source.x + target.x - 2 * centre.x) * 0.25, y: centre.y + (source.y + target.y - 2 * centre.y) * 0.25 };
      chords.push(`<path class="edge edge-${link.relation}" data-from="technique:${technique.id}" data-to="technique:${link.id}" d="M${round(source.x)} ${round(source.y)}Q${round(control.x)} ${round(control.y)} ${round(target.x)} ${round(target.y)}"><title>${escapeHtml(`${technique.name} ${link.relation} ${link.id}`)}</title></path>`);
    }
  }
  const nodes = techniques.map((technique) => {
    const point = position.get(technique.id)!;
    // Radial labels never collide; those on the left are turned half a circle so they still read left to right.
    const degrees = (point.angle * 180) / Math.PI;
    const isLeft = Math.cos(point.angle) < 0;
    const labelX = point.x + Math.cos(point.angle) * 12;
    const labelY = point.y + Math.sin(point.angle) * 12;
    const rotation = round(isLeft ? degrees + 180 : degrees);
    return `<a class="node node-technique" data-node="technique:${technique.id}" href="${base}techniques/${technique.id}.html"><circle cx="${round(point.x)}" cy="${round(point.y)}" r="6"/><text x="${round(labelX)}" y="${round(labelY)}" dy="0.35em" text-anchor="${isLeft ? "end" : "start"}" transform="rotate(${rotation} ${round(labelX)} ${round(labelY)})">${escapeHtml(technique.name)}</text></a>`;
  });
  return `<svg class="graph related-network" viewBox="0 0 ${size.width} ${size.height}" role="group" aria-label="Related techniques: ${seen.size} links between ${techniques.length} techniques"><g class="edges">${chords.join("")}</g><g class="nodes">${nodes.join("")}</g></svg>`;
}

/**
 * One tool's pairs, one hop out. Infrastructure tools are left out (the page badges them), and past
 * {@link NEIGHBOUR_LIMIT} neighbours the rest are listed by the page rather than drawn.
 */
export function renderNeighbourhood(tool: SiteTool, model: SiteModel, base: string): { svg: string; undrawn: string[] } | null {
  const neighbours = neighbourIds(tool).filter((id) => !isInfrastructureTool(id) && id !== tool.id);
  if (neighbours.length === 0) return null;
  const drawn = neighbours.slice(0, NEIGHBOUR_LIMIT);
  const size = { width: 640, height: 400 };
  const centre = { x: size.width / 2, y: size.height / 2 };
  const radius = drawn.length <= 4 ? 110 : 150;
  const parts = drawn.map((id, index) => {
    const angle = (index / drawn.length) * Math.PI * 2 - Math.PI / 2;
    const point = { x: centre.x + radius * Math.cos(angle) * 1.25, y: centre.y + radius * Math.sin(angle) };
    const direction = tool.pairsWith.includes(id) && tool.pairedBy.includes(id) ? "mutual" : tool.pairsWith.includes(id) ? "out" : "in";
    const name = model.tools.find((candidate) => candidate.id === id)?.name ?? id;
    const isRight = Math.cos(angle) >= -0.01;
    const label = `<text x="${round(point.x + (isRight ? 10 : -10))}" y="${round(point.y + 4)}" text-anchor="${isRight ? "start" : "end"}">${escapeHtml(name)}</text>`;
    return {
      edge: `<line class="edge edge-${direction}" data-from="tool:${tool.id}" data-to="tool:${id}" x1="${centre.x}" y1="${centre.y}" x2="${round(point.x)}" y2="${round(point.y)}"/>`,
      node: `<a class="node node-tool" data-node="tool:${id}" href="${base}tools/${id}.html"><circle cx="${round(point.x)}" cy="${round(point.y)}" r="5"/>${label}</a>`,
    };
  });
  const self = `<g class="node node-self" data-node="tool:${tool.id}"><circle cx="${centre.x}" cy="${centre.y}" r="9"/><text x="${centre.x}" y="${centre.y + 26}" text-anchor="middle">${escapeHtml(tool.name)}</text></g>`;
  const svg = `<svg class="graph neighbourhood" viewBox="0 0 ${size.width} ${size.height}" role="group" aria-label="${escapeHtml(tool.name)} and ${neighbours.length} paired tools"><g class="edges">${parts.map((part) => part.edge).join("")}</g><g class="nodes">${parts.map((part) => part.node).join("")}${self}</g></svg>`;
  return { svg, undrawn: neighbours.slice(NEIGHBOUR_LIMIT) };
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// === PRIVATE HELPERS ===

/** Greedy chain: each next technique is the unplaced one most linked to the last few placed, so chords stay short. */
function orderAroundCircle(techniques: SiteTechnique[]): SiteTechnique[] {
  const linked = (left: SiteTechnique, right: SiteTechnique) => left.related.some((link) => link.id === right.id) || right.related.some((link) => link.id === left.id);
  const remaining = [...techniques].sort((left, right) => right.related.length - left.related.length || left.id.localeCompare(right.id));
  const placed = [remaining.shift()!];
  while (remaining.length > 0) {
    const recent = placed.slice(-3);
    const score = (candidate: SiteTechnique) => recent.reduce((sum, previous, index) => sum + (linked(candidate, previous) ? index + 1 : 0), 0);
    const best = remaining.reduce((winner, candidate) => (score(candidate) > score(winner) ? candidate : winner));
    remaining.splice(remaining.indexOf(best), 1);
    placed.push(best);
  }
  return placed;
}

/** Mutual pairs first, then the tool's own picks, then tools that pick it. */
function neighbourIds(tool: SiteTool): string[] {
  const mutual = tool.pairsWith.filter((id) => tool.pairedBy.includes(id));
  const outOnly = tool.pairsWith.filter((id) => !tool.pairedBy.includes(id));
  const inOnly = tool.pairedBy.filter((id) => !tool.pairsWith.includes(id));
  return [...new Set([...mutual, ...outOnly, ...inOnly])];
}

function techniqueToolEdges(techniques: SiteTechnique[]): Array<{ technique: string; tool: string; evidence: RouteEvidenceClass }> {
  const best = new Map<string, RouteEvidenceClass>();
  for (const technique of techniques) {
    for (const route of technique.routes) {
      for (const tool of new Set(route.steps.flatMap((step) => step.tools))) {
        const key = `${technique.id}|${tool}`;
        const current = best.get(key);
        if (!current || EVIDENCE_ORDER.indexOf(route.evidence.class) < EVIDENCE_ORDER.indexOf(current)) best.set(key, route.evidence.class);
      }
    }
  }
  return [...best].map(([key, evidence]) => {
    const [technique, tool] = key.split("|") as [string, string];
    return { technique, tool, evidence };
  });
}

/** Barycentre ordering, a few sweeps: each column sorts by the mean row of what it links to. */
function orderColumns(pillars: string[], techniques: string[], tools: string[], craftEdges: Array<{ pillar: string; technique: string }>, toolEdges: Array<{ technique: string; tool: string }>) {
  let techniqueOrder = [...techniques];
  let pillarOrder = [...pillars];
  let toolOrder = [...tools];
  const meanIndex = (order: string[], ids: string[]) => ids.length === 0 ? 0 : ids.reduce((sum, id) => sum + order.indexOf(id) / order.length, 0) / ids.length;
  for (let sweep = 0; sweep < 4; sweep += 1) {
    pillarOrder = sortBy(pillarOrder, (pillar) => meanIndex(techniqueOrder, craftEdges.filter((edge) => edge.pillar === pillar).map((edge) => edge.technique)));
    toolOrder = sortBy(toolOrder, (tool) => meanIndex(techniqueOrder, toolEdges.filter((edge) => edge.tool === tool).map((edge) => edge.technique)));
    techniqueOrder = sortBy(techniqueOrder, (technique) => (
      meanIndex(pillarOrder, craftEdges.filter((edge) => edge.technique === technique).map((edge) => edge.pillar))
      + meanIndex(toolOrder, toolEdges.filter((edge) => edge.technique === technique).map((edge) => edge.tool))) / 2);
  }
  return { pillars: pillarOrder, techniques: techniqueOrder, tools: toolOrder };
}

function sortBy(ids: string[], score: (id: string) => number): string[] {
  return ids.map((id, index) => ({ id, index, score: score(id) })).sort((left, right) => left.score - right.score || left.index - right.index).map((entry) => entry.id);
}

function mapNode(node: MapNode, x: number, anchor: "start" | "middle" | "end", className: string, isExternal: boolean): string {
  const labelX = anchor === "end" ? x - 10 : anchor === "start" ? x + 10 : x;
  const marker = anchor === "middle"
    ? `<rect x="${x - 112}" y="${round(node.y - 11)}" width="224" height="22" rx="3"/>` // matches techniqueHalfWidth
    : `<circle cx="${x}" cy="${round(node.y)}" r="5"/>`;
  const target = isExternal ? ` rel="noopener"` : "";
  return `<a class="node ${className}" data-node="${node.key}" href="${escapeHtml(node.href)}"${target}>${marker}<text x="${labelX}" y="${round(node.y + 4)}" text-anchor="${anchor}">${escapeHtml(node.label)}</text></a>`;
}

function curve(from: string, to: string, x1: number, y1: number, x2: number, y2: number, className: string): string {
  const middle = (x1 + x2) / 2;
  return `<path class="${className}" data-from="${from}" data-to="${to}" d="M${x1} ${round(y1)}C${middle} ${round(y1)} ${middle} ${round(y2)} ${x2} ${round(y2)}"/>`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
