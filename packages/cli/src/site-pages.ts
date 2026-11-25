// HTML pages for the catalogue site. Each renderer takes the site model and returns one document;
// `base` is the relative path back to the site root, so the site works under any Pages subpath.
import { escapeHtml, renderNeighbourhood, renderRelatedNetwork, renderTechniqueMap } from "./site-graphs.js";
import { INFRASTRUCTURE_TOOLS, isInfrastructureTool, type SiteModel, type SiteTechnique, type SiteTool } from "./site-model.js";
import type { RouteEvidenceClass } from "./techniques.js";

// === TYPES ===

type Section = "map" | "tools" | "status";

export const REPOSITORY_URL = "https://github.com/conorluddy/vcr";

const EVIDENCE_LABELS: Record<RouteEvidenceClass, string> = {
  "retained-fixture": "Run end to end, output checked",
  "fixture-reported": "Run end to end, output not kept",
  documented: "Documented, not yet run here",
};
const VALIDATION_LABELS: Record<string, string> = { validated: "Validated", partial: "Partly validated", "not-validated": "Not validated" };
const GITHUB_MARK = `<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
const VALIDATION_ORDER = ["validated", "partial", "not-validated"];
const TIER_ORDER = ["core", "catalogued", "candidate"];

// === PUBLIC API ===

export function renderLandingPage(model: SiteModel): string {
  const base = "";
  const purposes = [...new Set(model.techniques.flatMap((technique) => technique.purposes))].sort();
  const chips = purposes.map((purpose) => {
    const techniques = model.techniques.filter((technique) => technique.purposes.includes(purpose)).map((technique) => `technique:${technique.id}`);
    return `<button type="button" class="chip" aria-pressed="false" data-select="${techniques.join(" ")}">${escapeHtml(humanise(purpose))}</button>`;
  }).join("");
  const body = `
<section class="hero">
  <h1>Visual techniques, and the free tools that make them</h1>
  <p class="lede">VCR is a studio for making motion graphics and video in code, driven by agents in Claude Code and Codex. This map joins each technique to the craft that judges it and the free software that can make it.</p>
  <p class="actions">${sourceButton(REPOSITORY_URL, "View VCR on GitHub")}</p>
</section>
<section class="map-section" aria-labelledby="map-heading">
  <h2 id="map-heading" class="visually-hidden">Technique map</h2>
  <div class="purpose-picker">
    <p id="purpose-label">What should the piece do?</p>
    <div class="chips" role="group" aria-labelledby="purpose-label">${chips}</div>
  </div>
  <div class="graph-frame" data-graph>${renderTechniqueMap(model, base, REPOSITORY_URL)}</div>
  ${evidenceLegend()}
  <p class="hint">Point at any name to trace its links. Select one to open it.</p>
</section>
<section aria-labelledby="related-heading">
  <h2 id="related-heading">Techniques that go together</h2>
  <p class="section-intro">Solid lines join techniques that combine well. Dashed lines join techniques that pull in opposite directions, useful when one look is wrong and you want its opposite.</p>
  <div class="graph-frame" data-graph>${renderRelatedNetwork(model, base)}</div>
</section>
<section aria-labelledby="next-heading" class="next">
  <h2 id="next-heading">Go further</h2>
  <p><a href="${base}tools/index.html">Browse all ${model.tools.length} tools</a>, filtered by what they do and how far they have been tested. <a href="${base}status.html">See where testing stands</a> across every capability.</p>
</section>`;
  return layout("VCR technique map", base, "map", body);
}

export function renderCatalogPage(model: SiteModel): string {
  const base = "../";
  const categories = [...new Set(model.tools.map((tool) => tool.category))].sort((left, right) => left.localeCompare(right, "en", { numeric: true }));
  const select = (name: string, label: string, values: string[], display: (value: string) => string) =>
    `<label>${label}<select name="${name}"><option value="">Any</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(display(value))}</option>`).join("")}</select></label>`;
  const rows = model.tools.map((tool) => `<tr data-tier="${tool.tier}" data-validation="${tool.validationStatus}" data-category="${escapeHtml(tool.category)}" data-capabilities="${tool.capabilities.join(" ")}" data-search="${escapeHtml(`${tool.id} ${tool.name} ${tool.role}`.toLowerCase())}">
  <th scope="row"><a href="${tool.id}.html">${escapeHtml(tool.name)}</a></th>
  <td>${escapeHtml(tool.role)}</td>
  <td>${tierBadge(tool.tier)}</td>
  <td>${validationBadge(tool.validationStatus)}</td>
  <td><a class="source-link" href="${recordUrl("tools", tool.id)}" aria-label="${escapeHtml(tool.name)} record on GitHub">Source</a></td>
</tr>`).join("\n");
  const body = `
<section class="page-head">
  <h1>Tools</h1>
  <p class="lede">Every tool VCR knows about, all free software. Core and catalogued tools are ones an agent may pick; candidates are still being assessed. Validated means a fixture here ran the tool and its scope is recorded on the tool's page, not that it is installed on your machine.</p>
</section>
<form class="filters" data-filters aria-label="Filter tools">
  <label>Search<input type="search" name="q" placeholder="Name or role"></label>
  ${select("tier", "Tier", TIER_ORDER, humanise)}
  ${select("validation", "Testing", VALIDATION_ORDER, (value) => VALIDATION_LABELS[value] ?? value)}
  ${select("capability", "Capability", model.capabilities, humanise)}
  ${select("category", "Category", categories, cleanCategory)}
</form>
<p class="result-count" aria-live="polite" data-count>${model.tools.length} tools</p>
<table class="tool-table">
  <thead><tr><th scope="col">Tool</th><th scope="col">Role</th><th scope="col">Tier</th><th scope="col">Testing</th><th scope="col"><span class="visually-hidden">Source</span></th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<p class="empty" data-empty hidden>No tool matches every filter. Clear one to widen the list.</p>`;
  return layout("VCR tools", base, "tools", body);
}

export function renderToolPage(tool: SiteTool, model: SiteModel): string {
  const base = "../";
  const neighbourhood = renderNeighbourhood(tool, model, base);
  const infrastructure = INFRASTRUCTURE_TOOLS.filter((id) => id !== tool.id && (tool.pairsWith.includes(id) || tool.pairedBy.includes(id)));
  const toolLink = (id: string) => `<a href="${id}.html">${escapeHtml(model.tools.find((candidate) => candidate.id === id)?.name ?? id)}</a>`;
  const techniques = model.techniques.filter((technique) => tool.techniques.includes(technique.id));
  const pairsSection = neighbourhood || infrastructure.length > 0 ? `
<section aria-labelledby="pairs-heading">
  <h2 id="pairs-heading">Works with</h2>
  ${infrastructure.length > 0 ? `<p class="infrastructure">Usually finished through ${infrastructure.map((id) => `<a class="badge badge-infrastructure" href="${id}.html">${escapeHtml(model.tools.find((candidate) => candidate.id === id)?.name ?? id)}</a>`).join(" and ")}, which most chains end in, so they are not drawn below.</p>` : ""}
  ${neighbourhood ? `<div class="graph-frame graph-small" data-graph>${neighbourhood.svg}</div>
  <ul class="legend"><li><span class="swatch swatch-mutual"></span>Each lists the other</li><li><span class="swatch swatch-out"></span>${escapeHtml(tool.name)} lists it</li><li><span class="swatch swatch-in"></span>It lists ${escapeHtml(tool.name)}</li></ul>` : ""}
  ${neighbourhood && neighbourhood.undrawn.length > 0 ? `<p>Also paired with: ${neighbourhood.undrawn.map(toolLink).join(", ")}.</p>` : ""}
</section>` : "";
  const body = `
<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Tools</a></nav>
<section class="page-head">
  <h1>${escapeHtml(tool.name)}</h1>
  <p class="lede">${escapeHtml(tool.role)}</p>
  <p class="badges">${tierBadge(tool.tier)} ${validationBadge(tool.validationStatus)}${isInfrastructureTool(tool.id) ? ` <span class="badge badge-infrastructure">Used by most chains</span>` : ""}</p>
  <p class="actions">
    ${sourceButton(tool.repositoryUrl ?? tool.officialUrl, tool.repositoryUrl ? "View upstream repository" : "Visit official site")}
    ${sourceButton(recordUrl("tools", tool.id), "View VCR catalogue record", true)}
    ${tool.guidePath ? sourceButton(`${REPOSITORY_URL}/blob/main/${tool.guidePath}`, "Read the agent guide", true) : ""}
  </p>
</section>
${tool.summary ? `<p class="summary">${escapeHtml(tool.summary)}</p>` : ""}
${tool.useWhen.length + tool.avoidWhen.length > 0 ? `<div class="two-up">
  ${listSection("Use it when", tool.useWhen)}
  ${listSection("Look elsewhere when", tool.avoidWhen)}
</div>` : ""}
<section aria-labelledby="evidence-heading">
  <h2 id="evidence-heading">Testing</h2>
  ${tool.evidence.length > 0 ? `<ul class="evidence">${[...tool.evidence].reverse().map((entry) => `<li><time datetime="${entry.date}">${entry.date}</time>${entry.version ? ` <span class="version">version ${escapeHtml(entry.version)}</span>` : ""}${entry.example ? ` in <a href="${REPOSITORY_URL}/tree/main/${escapeHtml(examplePath(entry.example))}">${escapeHtml(entry.example.replace(/^examples\//, ""))}</a>` : ""}${entry.scope ? `<p>${escapeHtml(entry.scope)}</p>` : ""}</li>`).join("")}</ul>` : `<p>No fixture has run ${escapeHtml(tool.name)} here yet.</p>`}
</section>
${pairsSection}
${techniques.length > 0 ? `<section aria-labelledby="techniques-heading"><h2 id="techniques-heading">Techniques it can make</h2><ul class="plain">${techniques.map((technique) => `<li><a href="${base}techniques/${technique.id}.html">${escapeHtml(technique.name)}</a>: ${escapeHtml(technique.oneLine)}</li>`).join("")}</ul></section>` : ""}
${tool.examples.length > 0 ? `<section aria-labelledby="examples-heading"><h2 id="examples-heading">Examples</h2><ul class="plain">${tool.examples.map((example) => `<li><a href="${REPOSITORY_URL}/tree/main/${escapeHtml(example.directory)}">${escapeHtml(example.title)}</a> ${validationBadge(example.status)}</li>`).join("")}</ul></section>` : ""}
<section aria-labelledby="facts-heading">
  <h2 id="facts-heading">Details</h2>
  <dl class="facts">
    <dt>Capabilities</dt><dd>${tool.capabilities.map((capability) => `<a href="index.html?capability=${capability}">${escapeHtml(humanise(capability))}</a>`).join(", ")}</dd>
    <dt>Category</dt><dd>${escapeHtml(cleanCategory(tool.category))}</dd>
    ${tool.license ? `<dt>Licence</dt><dd>${escapeHtml(tool.license)}</dd>` : ""}
    <dt>Guide</dt><dd>${tool.guidePath ? `<a href="${REPOSITORY_URL}/blob/main/${escapeHtml(tool.guidePath)}">Operating guide for agents</a>` : "Not written yet"}</dd>
    <dt>Documentation</dt><dd><a href="${escapeHtml(tool.officialUrl)}" rel="noopener">Official documentation</a></dd>
  </dl>
</section>`;
  return layout(`${tool.name}, VCR tools`, base, "tools", body);
}

export function renderTechniquePage(technique: SiteTechnique, model: SiteModel): string {
  const base = "../";
  const toolLink = (id: string) => `<a href="${base}tools/${id}.html">${escapeHtml(model.tools.find((tool) => tool.id === id)?.name ?? id)}</a>`;
  const techniqueName = (id: string) => model.techniques.find((candidate) => candidate.id === id)?.name ?? id;
  const routes = technique.routes.map((route) => `<article class="route">
  <h3>${escapeHtml(route.oneLine)}</h3>
  <p><span class="badge badge-${route.evidence.class}">${EVIDENCE_LABELS[route.evidence.class]}</span> <span class="reason">${escapeHtml(sentence(route.evidence.reason))}</span></p>
  <ol class="steps">${route.steps.map((step) => `<li>${escapeHtml(step.does)}, with ${step.tools.map(toolLink).join(" and ")}</li>`).join("")}</ol>
  ${route.limits.length > 0 ? `<details><summary>Limits</summary><ul>${route.limits.map((limit) => `<li>${escapeHtml(limit)}</li>`).join("")}</ul></details>` : ""}
</article>`).join("\n");
  const craft = technique.craft.map((pointer) => `<li><a href="${REPOSITORY_URL}/tree/main/references/${pointer.pillar}">${escapeHtml(model.pillarNames[pointer.pillar] ?? pointer.pillar)}</a>, section ${escapeHtml(pointer.section)}<ul>${pointer.rules.map((rule) => `<li><code>${escapeHtml(rule.id)}</code>${rule.check ? ` ${escapeHtml(stripMarkdown(rule.check))}` : ""}</li>`).join("")}</ul></li>`).join("");
  const body = `
<nav class="crumbs" aria-label="Breadcrumb"><a href="${base}index.html">Technique map</a></nav>
<section class="page-head">
  <h1>${escapeHtml(technique.name)}</h1>
  <p class="lede">${escapeHtml(technique.oneLine)}</p>
  <p class="actions">${sourceButton(recordUrl("techniques", technique.id), "View record on GitHub")}</p>
</section>
<p class="summary">${escapeHtml(technique.summary)}</p>
<dl class="facts">
  <dt>Good for</dt><dd>${technique.purposes.map((purpose) => escapeHtml(humanise(purpose))).join(", ")}</dd>
  <dt>How it works</dt><dd>${technique.mechanisms.map((mechanism) => escapeHtml(humanise(mechanism))).join(", ")}</dd>
</dl>
<section aria-labelledby="routes-heading">
  <h2 id="routes-heading">Ways to make it</h2>
  ${routes}
</section>
<section aria-labelledby="craft-heading">
  <h2 id="craft-heading">Craft rules that judge it</h2>
  <ul class="craft">${craft}</ul>
</section>
${technique.related.length > 0 ? `<section aria-labelledby="related-heading"><h2 id="related-heading">Related techniques</h2><ul class="plain">${technique.related.map((link) => `<li>${link.relation === "combines" ? "Combines with" : "Contrasts with"} <a href="${link.id}.html">${escapeHtml(techniqueName(link.id))}</a></li>`).join("")}</ul></section>` : ""}`;
  return layout(`${technique.name}, VCR techniques`, base, "map", body);
}

/** Capability by testing status: rows with nothing validated come first, so the page doubles as a work list. */
export function renderStatusPage(model: SiteModel): string {
  const base = "";
  const counts = model.capabilities.map((capability) => {
    const tools = model.tools.filter((tool) => tool.capabilities.includes(capability));
    return { capability, total: tools.length, byStatus: VALIDATION_ORDER.map((status) => tools.filter((tool) => tool.validationStatus === status).length) };
  }).sort((left, right) => left.byStatus[0]! - right.byStatus[0]! || left.capability.localeCompare(right.capability));
  const maximum = Math.max(1, ...counts.flatMap((row) => row.byStatus));
  const heatRows = counts.map((row) => `<tr${row.byStatus[0] === 0 ? ` class="is-gap"` : ""}>
  <th scope="row"><a href="tools/index.html?capability=${row.capability}">${escapeHtml(humanise(row.capability))}</a></th>
  ${row.byStatus.map((count, index) => `<td class="heat heat-${VALIDATION_ORDER[index]}" style="--heat:${(count / maximum).toFixed(2)}">${count > 0 ? `<a href="tools/index.html?capability=${row.capability}&amp;validation=${VALIDATION_ORDER[index]}" aria-label="${count} ${VALIDATION_LABELS[VALIDATION_ORDER[index]!]!.toLowerCase()} tools for ${escapeHtml(humanise(row.capability))}">${count}</a>` : `<span aria-label="none">0</span>`}</td>`).join("")}
  <td class="total">${row.total}</td>
</tr>`).join("\n");
  const gaps = counts.filter((row) => row.byStatus[0] === 0).length;
  const routes = model.techniques.flatMap((technique) => technique.routes);
  const routeCounts = (Object.keys(EVIDENCE_LABELS) as RouteEvidenceClass[]).map((evidenceClass) => `<li><span class="badge badge-${evidenceClass}">${EVIDENCE_LABELS[evidenceClass]}</span> ${routes.filter((route) => route.evidence.class === evidenceClass).length}</li>`).join("");
  const tierRows = TIER_ORDER.map((tier) => {
    const tools = model.tools.filter((tool) => tool.tier === tier);
    return `<tr><th scope="row">${humanise(tier)}</th>${VALIDATION_ORDER.map((status) => `<td>${tools.filter((tool) => tool.validationStatus === status).length}</td>`).join("")}<td class="total">${tools.length}</td></tr>`;
  }).join("");
  const header = `<tr><th scope="col"></th>${VALIDATION_ORDER.map((status) => `<th scope="col">${VALIDATION_LABELS[status]}</th>`).join("")}<th scope="col">All</th></tr>`;
  const body = `
<section class="page-head">
  <h1>Where testing stands</h1>
  <p class="lede">A tool counts as validated when a fixture in this repository ran it and recorded what it covered. ${gaps === 0 ? "Every capability has at least one validated tool." : `${gaps} of ${counts.length} capabilities have no validated tool yet; they are listed first.`}</p>
</section>
<section aria-labelledby="tiers-heading">
  <h2 id="tiers-heading">By tier</h2>
  <table class="count-table"><thead>${header}</thead><tbody>${tierRows}</tbody></table>
</section>
<section aria-labelledby="routes-heading">
  <h2 id="routes-heading">Technique routes</h2>
  <p class="section-intro">A route is proven only when one fixture runs all of it; tools tested separately do not add up to a tested route.</p>
  <ul class="route-counts">${routeCounts}</ul>
</section>
<section aria-labelledby="heat-heading">
  <h2 id="heat-heading">By capability</h2>
  <div class="table-scroll"><table class="heatmap"><thead>${header}</thead><tbody>${heatRows}</tbody></table></div>
</section>`;
  return layout("VCR testing status", base, "status", body);
}

// === PRIVATE HELPERS ===

function layout(title: string, base: string, current: Section, body: string): string {
  const link = (section: Section, href: string, label: string) => `<a href="${base}${href}"${section === current ? ` aria-current="page"` : ""}>${label}</a>`;
  return `<!doctype html>
<html lang="en-IE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="Visual techniques for motion graphics and video, and the free software tools that make them.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7 7'%3E%3Cpath fill='%23c0c0c0' d='M0 0h1v7H0z'/%3E%3Cpath fill='%23c0c000' d='M1 0h1v7H1z'/%3E%3Cpath fill='%2300c0c0' d='M2 0h1v7H2z'/%3E%3Cpath fill='%2300c000' d='M3 0h1v7H3z'/%3E%3Cpath fill='%23c000c0' d='M4 0h1v7H4z'/%3E%3Cpath fill='%23c00000' d='M5 0h1v7H5z'/%3E%3Cpath fill='%230000c0' d='M6 0h1v7H6z'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap">
<link rel="stylesheet" href="${base}assets/site.css">
<script src="${base}assets/site.js" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <div class="bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
  <div class="masthead-inner">
    <a class="wordmark" href="${base}index.html">VCR</a>
    <nav aria-label="Site">${link("map", "index.html", "Techniques")}${link("tools", "tools/index.html", "Tools")}${link("status", "status.html", "Status")}<a href="${REPOSITORY_URL}">Source</a></nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="footer"><p>Generated from the <a href="${REPOSITORY_URL}/tree/main/catalog">VCR catalogue</a> by <code>vcr site build</code>. Apache-2.0.</p></footer>
</body>
</html>
`;
}

/** A tool or technique record's file in the repository: the source the page is generated from. */
function recordUrl(kind: "tools" | "techniques", id: string): string {
  return `${REPOSITORY_URL}/blob/main/catalog/${kind}/${id}.json`;
}

function sourceButton(href: string, label: string, isSecondary = false): string {
  const mark = href.startsWith("https://github.com/") ? GITHUB_MARK : "";
  return `<a class="button${isSecondary ? " button-secondary" : ""}" href="${escapeHtml(href)}" rel="noopener">${mark}${label}</a>`;
}

function evidenceLegend(): string {
  return `<ul class="legend">${(Object.keys(EVIDENCE_LABELS) as RouteEvidenceClass[]).map((evidenceClass) => `<li><span class="swatch swatch-${evidenceClass}"></span>${EVIDENCE_LABELS[evidenceClass]}</li>`).join("")}<li><span class="swatch swatch-craft"></span>Craft pillar owns rules for it</li></ul>`;
}

function listSection(heading: string, items: string[]): string {
  if (items.length === 0) return "";
  return `<section><h2>${heading}</h2><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`;
}

function tierBadge(tier: string): string {
  return `<span class="badge badge-tier-${tier}">${escapeHtml(humanise(tier))}</span>`;
}

function validationBadge(status: string): string {
  return `<span class="badge badge-${status}">${escapeHtml(VALIDATION_LABELS[status] ?? humanise(status))}</span>`;
}

const ACRONYMS = new Set(["2d", "3d", "svg", "sdf", "gif", "ui", "gpu", "ml", "raw"]);

/** `print-nostalgia` → `Print nostalgia`; `svg-animation` → `SVG animation`. */
function humanise(term: string): string {
  const words = term.split("-").map((word) => (ACRONYMS.has(word) ? word.toUpperCase() : word)).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Evidence names an example by id or by its repository path. */
function examplePath(example: string): string {
  return example.startsWith("examples/") ? example : `examples/${example}`;
}

/** `A2. Animation and authored assets` → `Animation and authored assets`. */
function cleanCategory(category: string): string {
  return category.replace(/^A\d+\.\s*/, "");
}

function sentence(clause: string): string {
  return `${clause.charAt(0).toUpperCase()}${clause.slice(1)}.`;
}

function stripMarkdown(text: string): string {
  return text.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}
