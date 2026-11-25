import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { buildSite, SITE_DATA_FILE } from "./site.js";
import { loadTechniques } from "./techniques.js";
import { harnessRoot } from "./test-workspace.js";
import { loadTools } from "./tools.js";

let outputDirectory: string;
let pages: Map<string, string>;

beforeAll(() => {
  outputDirectory = mkdtempSync(join(tmpdir(), "vcr-site-"));
  const outcome = buildSite(harnessRoot(), outputDirectory);
  if (!outcome.ok) throw new Error(outcome.error.message);
  pages = new Map(listFiles(outputDirectory).filter((file) => file.endsWith(".html")).map((file) => [file, readFileSync(file, "utf8")]));
});

afterAll(() => rmSync(outputDirectory, { recursive: true, force: true }));

describe("vcr site build", () => {
  test("emits one page per tool and per technique", () => {
    const tools = loadTools(harnessRoot());
    const techniques = loadTechniques(harnessRoot());
    if (!tools.ok || !techniques.ok) throw new Error("catalogue failed to load");
    for (const tool of tools.value) expect(pages.has(join(outputDirectory, "tools", `${tool.id}.html`)), tool.id).toBe(true);
    for (const technique of techniques.value) expect(pages.has(join(outputDirectory, "techniques", `${technique.id}.html`)), technique.id).toBe(true);
  });

  test("every tool and technique page links to its record in the repository", () => {
    for (const kind of ["tools", "techniques"]) {
      for (const [file, html] of pages) {
        const id = file.match(new RegExp(`/${kind}/([^/]+)\\.html$`))?.[1];
        if (!id || id === "index") continue;
        expect(html, file).toContain(`/blob/main/catalog/${kind}/${id}.json`);
      }
    }
  });

  test("tool pages lead with the upstream repository or the official site", () => {
    const p5 = pages.get(join(outputDirectory, "tools/p5-js.html"));
    const shiki = pages.get(join(outputDirectory, "tools/shikijs-magic-move.html"));
    const canvas = pages.get(join(outputDirectory, "tools/canvas-2d.html"));
    expect(p5).toContain('class="button" href="https://github.com/processing/p5.js"');
    expect(p5).toContain('class="button button-secondary" href="https://github.com/conorluddy/vcr/blob/main/catalog/tools/p5-js.json"');
    expect(shiki).toContain('class="button" href="https://github.com/shikijs/shiki"');
    expect(canvas).toContain('class="button" href="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API" rel="noopener">Visit official site</a>');
  });

  test("publishes the site model as versioned JSON beside the pages", () => {
    const data = JSON.parse(readFileSync(join(outputDirectory, SITE_DATA_FILE), "utf8")) as { schema_version: string; tools: unknown[]; techniques: unknown[]; capabilities: string[] };
    const tools = loadTools(harnessRoot());
    const techniques = loadTechniques(harnessRoot());
    if (!tools.ok || !techniques.ok) throw new Error("catalogue failed to load");
    expect(data.schema_version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(data.tools).toHaveLength(tools.value.length);
    expect(data.techniques).toHaveLength(techniques.value.length);
    expect(data.capabilities.length).toBeGreaterThan(0);
  });

  test("publishes no machine names or local paths from evidence", () => {
    const hostnames = recordedHostnames();
    expect(hostnames.length).toBeGreaterThan(0);
    const dataFile = join(outputDirectory, SITE_DATA_FILE);
    for (const [file, html] of [...pages, [dataFile, readFileSync(dataFile, "utf8")] as const]) {
      expect(html, file).not.toMatch(/hostname|\/Users\//);
      // Whole words only: a generic hostname such as `vm` is also a substring of `vmaf`.
      for (const hostname of hostnames) expect(new RegExp(`\\b${hostname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(html), `${hostname} in ${file}`).toBe(false);
    }
  });

  test("every relative link points at a built file", () => {
    for (const [file, html] of pages) {
      for (const [, href] of html.matchAll(/href="([^"#?]+)[^"]*"/g)) {
        if (/^(https?:|data:|mailto:)/.test(href!)) continue;
        expect(() => statSync(resolve(dirname(file), href!)), `${href} from ${file}`).not.toThrow();
      }
    }
  });

  test("the landing page leads with the technique map", () => {
    const landing = pages.get(join(outputDirectory, "index.html"))!;
    expect(landing.indexOf("technique-map")).toBeGreaterThan(-1);
    expect(landing.indexOf("technique-map")).toBeLessThan(landing.indexOf("related-network"));
  });
});

/** Every hostname the repository records against evidence or examples. */
function recordedHostnames(): string[] {
  const files = [...listFiles(join(harnessRoot(), "catalog/tools")), ...listFiles(join(harnessRoot(), "examples")).filter((file) => file.endsWith("example.json"))];
  const names = files.flatMap((file) => [...readFileSync(file, "utf8").matchAll(/"hostname":\s*"([^"]+)"/g)].map((match) => match[1]!));
  return [...new Set(names)];
}

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : listFiles(path);
    return [path];
  });
}
