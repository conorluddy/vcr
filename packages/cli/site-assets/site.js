// VCR catalogue site: tracing links in the build-time graphs, purpose chips on the map, and the
// tool filters. Every page reads without it.

// === GRAPH TRACING ===

for (const svg of document.querySelectorAll("[data-graph] svg")) {
  const edges = [...svg.querySelectorAll(".edge[data-from]")];
  const nodes = [...svg.querySelectorAll(".node[data-node]")];
  const neighbours = new Map();
  for (const edge of edges) {
    for (const [from, to] of [[edge.dataset.from, edge.dataset.to], [edge.dataset.to, edge.dataset.from]]) {
      if (!neighbours.has(from)) neighbours.set(from, new Set());
      neighbours.get(from).add(to);
    }
  }
  const typeOf = (key) => key.split(":")[0];

  /** The start nodes, their neighbours, and one hop further into a different column. */
  const reach = (starts) => {
    const lit = new Set(starts);
    for (const start of starts) {
      for (const first of neighbours.get(start) ?? []) {
        lit.add(first);
        for (const second of neighbours.get(first) ?? []) if (typeOf(second) !== typeOf(start)) lit.add(second);
      }
    }
    return lit;
  };

  const show = (lit) => {
    svg.classList.toggle("is-tracing", lit.size > 0);
    for (const node of nodes) node.classList.toggle("is-lit", lit.has(node.dataset.node));
    for (const edge of edges) edge.classList.toggle("is-lit", lit.has(edge.dataset.from) && lit.has(edge.dataset.to));
  };

  let selection = new Set();
  const restore = () => show(selection.size > 0 ? reach([...selection]) : new Set());
  for (const node of nodes) {
    const trace = () => show(reach([node.dataset.node]));
    node.addEventListener("pointerenter", trace);
    node.addEventListener("focus", trace);
    node.addEventListener("pointerleave", restore);
    node.addEventListener("blur", restore);
  }

  const chips = [...document.querySelectorAll(".chip[data-select]")];
  if (svg.classList.contains("technique-map")) {
    for (const chip of chips) {
      chip.addEventListener("click", () => {
        chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true"));
        selection = new Set(chips.filter((each) => each.getAttribute("aria-pressed") === "true").flatMap((each) => each.dataset.select.split(" ")));
        restore();
      });
    }
  }
}

// === TOOL FILTERS ===

const filters = document.querySelector("[data-filters]");
if (filters) {
  const rows = [...document.querySelectorAll(".tool-table tbody tr")];
  const count = document.querySelector("[data-count]");
  const empty = document.querySelector("[data-empty]");
  const fields = [...filters.elements].filter((field) => field.name);
  const params = new URLSearchParams(location.search);
  for (const field of fields) if (params.has(field.name)) field.value = params.get(field.name);

  const apply = () => {
    const wanted = Object.fromEntries(fields.map((field) => [field.name, field.value.trim()]));
    let shown = 0;
    for (const row of rows) {
      const isMatch = (!wanted.q || row.dataset.search.includes(wanted.q.toLowerCase()))
        && (!wanted.tier || row.dataset.tier === wanted.tier)
        && (!wanted.validation || row.dataset.validation === wanted.validation)
        && (!wanted.capability || row.dataset.capabilities.split(" ").includes(wanted.capability))
        && (!wanted.category || row.dataset.category === wanted.category);
      row.hidden = !isMatch;
      if (isMatch) shown += 1;
    }
    count.textContent = shown === rows.length ? `${rows.length} tools` : `${shown} of ${rows.length} tools`;
    empty.hidden = shown > 0;
    const query = new URLSearchParams(Object.entries(wanted).filter(([, value]) => value));
    history.replaceState(null, "", query.size > 0 ? `?${query}` : location.pathname);
  };
  filters.addEventListener("input", apply);
  filters.addEventListener("submit", (event) => event.preventDefault());
  apply();
}
